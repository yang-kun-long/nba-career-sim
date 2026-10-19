import argparse
import copy
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import build_nba_history_indexes as indexes
import check_nba_data_changed as comparison
import refresh_nba_data as refresh


ROOT = Path(__file__).resolve().parents[1]
OPENING = "2026-10-20T19:00:00Z"


def schedule_payload():
    return {"leagueSchedule": {"seasonYear": "2026-27", "gameDates": [{"games": [
        {"gameId": "0012600001", "gameDateTimeUTC": "2026-10-01T00:00:00Z", "gameStatus": 3},
        {"gameId": "0022600001", "gameDateTimeUTC": OPENING, "gameStatus": 1},
    ]}]}}


def state_at(checked_at):
    return refresh.schedule_season_state(schedule_payload(), "2026-27", checked_at)


def count_manifest(checked_at):
    return {
        "season": "2026-27", "generatedAt": checked_at,
        "seasonState": state_at(checked_at),
        "dataHealth": {"players": {"status": "empty"}, "leaders": {"status": "empty"}},
    }


class SeasonTransitionTests(unittest.TestCase):
    def test_schedule_ignores_preseason_games_and_uses_utc_boundary(self):
        state = state_at("2026-10-20T18:59:59Z")
        self.assertEqual(state["phase"], "preseason")
        self.assertEqual(state["regularSeasonStartsAt"], OPENING)
        self.assertEqual(state["regularSeasonGames"], 1)
        self.assertEqual(state_at(OPENING)["phase"], "regularSeason")

    def test_started_game_overrides_future_schedule_time(self):
        payload = schedule_payload()
        payload["leagueSchedule"]["gameDates"][0]["games"][1]["gameStatus"] = 2
        self.assertEqual(refresh.schedule_season_state(payload, "2026-27", "2026-10-19T00:00:00Z")["phase"], "regularSeason")

    def test_wrong_season_missing_games_and_bad_timestamp_fail(self):
        for payload in (
            {"leagueSchedule": {"seasonYear": "2025-26"}},
            {"leagueSchedule": {"seasonYear": "2026-27", "gameDates": []}},
            {"leagueSchedule": {"seasonYear": "2026-27", "gameDates": [{"games": [
                {"gameId": "0022600001", "gameDateTimeUTC": "invalid"},
            ]}]}},
        ):
            with self.subTest(payload=payload), self.assertRaises((RuntimeError, ValueError)):
                refresh.schedule_season_state(payload, "2026-27", OPENING)

    def test_empty_stats_require_verified_preseason(self):
        refresh.validate_player_rows([], [], state_at("2026-10-19T00:00:00Z"))
        for state in (None, state_at(OPENING)):
            with self.subTest(state=state), self.assertRaises(RuntimeError):
                refresh.validate_player_rows([], [], state)

    def test_corrupt_nonempty_stats_are_not_treated_as_preseason(self):
        with self.assertRaises(RuntimeError):
            refresh.validate_player_rows([{"PLAYER_ID": 123, "TEAM_ID": "unknown"}], [], state_at("2026-10-19T00:00:00Z"))

    def test_preseason_counts_and_opening_night_counts(self):
        indexes.validate_current_counts(count_manifest("2026-10-19T00:00:00Z"), 0, 0)
        indexes.validate_current_counts(count_manifest(OPENING), 12, 30)
        with self.assertRaises(RuntimeError):
            indexes.validate_current_counts(count_manifest(OPENING), 0, 0)
        with self.assertRaises(RuntimeError):
            indexes.validate_current_counts(count_manifest(OPENING), 12, 0)

    def test_mature_season_still_checks_population(self):
        with self.assertRaises(RuntimeError):
            indexes.validate_current_counts(count_manifest("2026-11-10T00:00:00Z"), 12, 30)
        indexes.validate_current_counts(count_manifest("2026-11-10T00:00:00Z"), 400, 30)
        with self.assertRaises(RuntimeError):
            indexes.validate_current_counts({"season": "2025-26"}, 0, 0)

    def test_invalid_preseason_evidence_cannot_bypass_validation(self):
        manifest = count_manifest("2026-10-19T00:00:00Z")
        for key, invalid in (("season", "2025-26"), ("regularSeasonGames", 0), ("regularSeasonStartsAt", "2026-10-01T00:00:00Z")):
            altered = copy.deepcopy(manifest)
            altered["seasonState"][key] = invalid
            with self.subTest(key=key), self.assertRaises(RuntimeError):
                indexes.validate_current_counts(altered, 0, 0)

    def test_phase_change_triggers_deployment(self):
        before = comparison.manifest_projection(count_manifest("2026-10-19T00:00:00Z"))
        after = comparison.manifest_projection(count_manifest(OPENING))
        self.assertNotEqual(before, after)

    def test_history_merge_skips_preseason_and_rejects_wrong_season(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            indexes.write_json(root / "manifest.json", count_manifest("2026-10-19T00:00:00Z"))
            indexes.merge_current_season(root, "2026-27")
            self.assertFalse((root / "history").exists())
            with self.assertRaises(RuntimeError):
                indexes.merge_current_season(root, "2025-26")

    def test_preseason_snapshot_build_and_history_pipeline(self):
        args = argparse.Namespace(season="2026-27", proxy="", timeout=1, retries=1, sleep=0)
        checked_at = "2026-10-19T00:00:00Z"
        featured = json.loads((ROOT / "public/data/players/2544.json").read_text(encoding="utf-8"))
        with patch.object(refresh, "now_iso", return_value=checked_at), \
             patch.object(refresh, "fetch_season_state", return_value=state_at(checked_at)), \
             patch.object(refresh, "call_with_retry", return_value=[]), \
             patch.object(refresh, "frame_rows", return_value=[]), \
             patch.object(refresh, "endpoint_with_retry") as live, \
             patch.object(refresh, "fetch_featured_player", return_value=featured):
            live.return_value.get_dict.return_value = {"scoreboard": {"games": []}}
            snapshot = refresh.build_snapshot(args)
        self.assertEqual(snapshot["manifest"]["season"], "2026-27")
        self.assertEqual(snapshot["manifest"]["sourceStatus"], "official")
        self.assertEqual(snapshot["manifest"]["dataHealth"]["players"]["status"], "empty")
        self.assertEqual(snapshot["players"]["players"], [])
        self.assertEqual(len(snapshot["teams"]["teams"]), 30)
        self.assertTrue(all(team["record"]["wins"] is None for team in snapshot["teams"]["teams"]))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "data"
            shutil.copytree(ROOT / "public/data", root, ignore=shutil.ignore_patterns("player-careers", "team-careers"))
            previous_history = (root / "history/players/2025-26.json").read_bytes()
            refresh.write_current_snapshot(root, snapshot)
            result = subprocess.run([
                sys.executable, str(ROOT / "scripts/build_nba_history_indexes.py"),
                "--data-root", str(root), "--merge-current",
            ], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertEqual((root / "history/players/2025-26.json").read_bytes(), previous_history)
            self.assertFalse((root / "history/players/2026-27.json").exists())
            indexes.validate(root)

    def test_schedule_failure_and_empty_stats_fail_snapshot(self):
        args = argparse.Namespace(season="2026-27", proxy="", timeout=1, retries=1, sleep=0)
        with patch.object(refresh, "fetch_season_state", side_effect=RuntimeError("schedule offline")), \
             patch.object(refresh, "call_with_retry", return_value=[]), \
             patch.object(refresh, "frame_rows", side_effect=[[{"TeamID": 1610612747}], []]):
            with self.assertRaisesRegex(RuntimeError, "without verified"):
                refresh.build_snapshot(args)

    def test_preseason_stats_transport_failure_is_not_empty_data(self):
        args = argparse.Namespace(season="2026-27", proxy="", timeout=1, retries=1, sleep=0)
        with patch.object(refresh, "fetch_season_state", return_value=state_at("2026-10-19T00:00:00Z")), \
             patch.object(refresh, "call_with_retry", side_effect=RuntimeError("HTTP response was HTML")):
            with self.assertRaisesRegex(RuntimeError, "HTML"):
                refresh.build_snapshot(args)


if __name__ == "__main__":
    unittest.main()
