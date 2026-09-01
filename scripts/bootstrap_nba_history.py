#!/usr/bin/env python3
"""Fetch season-level NBA history for the first static data baseline.

This is intentionally a separate, manually-run job. Daily refreshes should
only replace the current snapshot and must not re-download this directory.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from refresh_nba_data import call_with_retry, frame_rows, now_iso, serializable, value, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("public/data"))
    parser.add_argument("--from-season", default="2010-11")
    parser.add_argument("--to-season", default="2025-26")
    parser.add_argument("--timeout", type=int, default=45)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--sleep", type=float, default=2.0)
    return parser.parse_args()


def season_number(season: str) -> int:
    try:
        return int(season[:4])
    except (TypeError, ValueError) as error:
        raise ValueError(f"invalid season: {season}") from error


def season_range(start: str, end: str) -> list[str]:
    first, last = season_number(start), season_number(end)
    if first > last:
        raise ValueError("--from-season must not be later than --to-season")
    return [f"{year}-{str(year + 1)[-2:]}" for year in range(first, last + 1)]


def build_season(season: str, args: argparse.Namespace) -> tuple[dict[str, Any], dict[str, Any]]:
    from nba_api.stats.endpoints import leaguedashplayerstats, leaguestandings
    from nba_api.stats.static import teams as static_teams

    teams = static_teams.get_teams()
    team_by_nba_id = {str(item["id"]): item for item in teams}
    standings = frame_rows(call_with_retry(
        leaguestandings.LeagueStandings,
        season=season,
        season_type="Regular Season",
        timeout=args.timeout,
        retries=args.retries,
        pause=args.sleep,
        label=f"{season} standings",
    ))
    record_by_team = {
        str(value(row, "TeamID", "TEAM_ID", default="")): {
            "wins": value(row, "WINS", "Wins"),
            "losses": value(row, "LOSSES", "Losses"),
            "winPct": value(row, "WinPCT", "W_PCT"),
            "rank": value(row, "PlayoffRank", "ConferenceRecord"),
        }
        for row in standings
    }
    team_history = []
    for team in teams:
        record = record_by_team.get(str(team["id"]), {})
        team_history.append({
            "id": team["abbreviation"].lower(),
            "nbaId": team["id"],
            "name": team["full_name"],
            "city": team["city"],
            "abbreviation": team["abbreviation"],
            "conference": team.get("conference", ""),
            "division": team.get("division", ""),
            "record": record,
        })

    player_rows = frame_rows(call_with_retry(
        leaguedashplayerstats.LeagueDashPlayerStats,
        season=season,
        per_mode_detailed="PerGame",
        season_type_all_star="Regular Season",
        timeout=args.timeout,
        retries=args.retries,
        pause=args.sleep,
        label=f"{season} player stats",
    ))
    player_history = []
    for row in player_rows:
        team = team_by_nba_id.get(str(value(row, "TEAM_ID", "Team_ID", default="")))
        player_id = str(value(row, "PLAYER_ID", "Player_ID", default=""))
        if not player_id or not team:
            continue
        player_history.append({
            "id": player_id,
            "fullName": value(row, "PLAYER_NAME", default="Unknown"),
            "teamId": team["abbreviation"].lower(),
            "teamName": team["full_name"],
            "age": value(row, "AGE"),
            "stats": {
                "gp": value(row, "GP"),
                "minutes": value(row, "MIN"),
                "points": value(row, "PTS"),
                "rebounds": value(row, "REB"),
                "assists": value(row, "AST"),
                "steals": value(row, "STL"),
                "blocks": value(row, "BLK"),
                "fgPct": value(row, "FG_PCT"),
                "threePct": value(row, "FG3_PCT"),
                "ftPct": value(row, "FT_PCT"),
            },
        })
    if not player_history:
        raise RuntimeError(f"{season} player stats returned zero usable rows")
    common = {"schemaVersion": 1, "dataVersion": f"history-{season}", "generatedAt": now_iso(), "season": season}
    return {**common, "teams": team_history}, {**common, "players": player_history}


def merge_manifest(output: Path, seasons: list[str]) -> None:
    manifest_path = output / "manifest.json"
    manifest = {}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest.setdefault("schemaVersion", 1)
    manifest["history"] = {
        "source": "NBA.com via nba_api",
        "sourceStatus": "official",
        "fromSeason": seasons[0],
        "toSeason": seasons[-1],
        "seasons": seasons,
        "playersPattern": "/data/history/players/{season}.json",
        "teamsPattern": "/data/history/teams/{season}.json",
    }
    manifest["historyUpdatedAt"] = now_iso()
    temp_manifest = manifest_path.with_suffix(".json.tmp")
    write_json(temp_manifest, manifest)
    temp_manifest.replace(manifest_path)


def main() -> int:
    args = parse_args()
    try:
        seasons = season_range(args.from_season, args.to_season)
        import nba_api  # noqa: F401
    except Exception as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1

    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    temp_root = Path(tempfile.mkdtemp(prefix="nba-history-", dir=output.parent))
    try:
        for index, season in enumerate(seasons, start=1):
            print(f"[{index}/{len(seasons)}] fetching {season}")
            teams, players = build_season(season, args)
            write_json(temp_root / "history" / "teams" / f"{season}.json", teams)
            write_json(temp_root / "history" / "players" / f"{season}.json", players)
            if index < len(seasons):
                time.sleep(args.sleep)
        shutil.copytree(temp_root / "history", output / "history", dirs_exist_ok=True)
        merge_manifest(output, seasons)
    except Exception as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1
    finally:
        if temp_root.exists():
            shutil.rmtree(temp_root)
    print(f"Historical NBA snapshot written to {output / 'history'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
