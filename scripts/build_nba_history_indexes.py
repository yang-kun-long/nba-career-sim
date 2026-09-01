#!/usr/bin/env python3
"""Build compact per-player and per-team history files from season snapshots."""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any


PLAYER_FIELDS = (
    "minutes", "points", "rebounds", "assists", "steals", "blocks",
    "fgPct", "threePct", "ftPct",
)
FEATURED_COUNTING_FIELDS = (
    "minutes", "fgm", "fga", "threeMade", "threeAttempted", "ftm", "fta",
    "offensiveRebounds", "defensiveRebounds", "rebounds", "assists", "steals",
    "blocks", "turnovers", "fouls", "points",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-root", type=Path, default=Path("public/data"))
    parser.add_argument("--merge-current", action="store_true")
    parser.add_argument("--season", default="")
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_current_season(data_root: Path, season: str) -> None:
    manifest = read_json(data_root / "manifest.json")
    generated_at = manifest.get("generatedAt")
    data_version = manifest.get("dataVersion")
    players = read_json(data_root / "players" / "index.json")
    teams = read_json(data_root / "teams" / "index.json")
    common = {
        "schemaVersion": 1,
        "dataVersion": f"history-{data_version}",
        "generatedAt": generated_at,
        "season": season,
    }
    write_json(data_root / "history" / "players" / f"{season}.json", {**common, "players": players.get("players", [])})
    write_json(data_root / "history" / "teams" / f"{season}.json", {**common, "teams": teams.get("teams", [])})


def player_row(season: str, player: dict[str, Any], generated_at: str) -> dict[str, Any]:
    stats = player.get("stats") or {}
    return {
        "season": season,
        "team": str(player.get("teamId") or "-").upper(),
        "age": player.get("age"),
        "gp": stats.get("gp"),
        "gs": stats.get("gs"),
        "statsMode": "perGame",
        **{field: stats.get(field) for field in PLAYER_FIELDS},
        "_generatedAt": generated_at,
    }


def merge_duplicate_player_row(existing: dict[str, Any], incoming: dict[str, Any]) -> None:
    old_games = float(existing.get("gp") or 0)
    new_games = float(incoming.get("gp") or 0)
    old_weight = old_games or 1.0
    new_weight = new_games or 1.0
    total_weight = old_weight + new_weight
    for field in PLAYER_FIELDS:
        old_value = float(existing.get(field) or 0)
        new_value = float(incoming.get(field) or 0)
        existing[field] = round((old_value * old_weight + new_value * new_weight) / total_weight, 3)
    existing["gp"] = int(old_games + new_games)
    if existing.get("team") != incoming.get("team"):
        teams = [team.strip() for team in f"{existing.get('team')} / {incoming.get('team')}".split("/")]
        existing["team"] = " / ".join(dict.fromkeys(teams))
    existing["_generatedAt"] = max(existing.get("_generatedAt") or "", incoming.get("_generatedAt") or "")


def build_player_payloads(data_root: Path) -> dict[str, dict[str, Any]]:
    careers: dict[str, dict[str, dict[str, Any]]] = {}
    profiles: dict[str, dict[str, Any]] = {}
    for path in sorted((data_root / "history" / "players").glob("*.json")):
        payload = read_json(path)
        season = str(payload.get("season") or path.stem)
        generated_at = str(payload.get("generatedAt") or "")
        for player in payload.get("players", []):
            player_id = str(player.get("id") or "")
            if not player_id:
                continue
            row = player_row(season, player, generated_at)
            season_rows = careers.setdefault(player_id, {})
            if season in season_rows:
                merge_duplicate_player_row(season_rows[season], row)
            else:
                season_rows[season] = row
            current_profile = profiles.get(player_id)
            if not current_profile or season >= current_profile["_season"]:
                profiles[player_id] = {
                    "id": player_id,
                    "fullName": player.get("fullName") or "Unknown",
                    "teamId": player.get("teamId"),
                    "teamName": player.get("teamName"),
                    "position": player.get("position") or "",
                    "age": player.get("age"),
                    "_season": season,
                }

    current_path = data_root / "players" / "index.json"
    if current_path.exists():
        for player in read_json(current_path).get("players", []):
            player_id = str(player.get("id") or "")
            if player_id in profiles:
                profiles[player_id].update({
                    "fullName": player.get("fullName") or profiles[player_id]["fullName"],
                    "teamId": player.get("teamId"),
                    "teamName": player.get("teamName"),
                    "position": player.get("position") or profiles[player_id].get("position", ""),
                    "age": player.get("age"),
                })

    result = {}
    for player_id, season_rows in careers.items():
        rows = [season_rows[season] for season in sorted(season_rows)]
        generated_at = max((row.pop("_generatedAt", "") for row in rows), default="")
        profile = dict(profiles[player_id])
        profile.pop("_season", None)
        result[player_id] = {
            "schemaVersion": 2,
            "dataVersion": f"player-career-{player_id}-{rows[-1]['season']}",
            "generatedAt": generated_at,
            "source": "NBA.com via nba_api",
            "statsMode": "perGame",
            "profile": profile,
            "career": {"regularSeason": rows, "playoffs": [], "allStar": []},
        }
    return result


def build_team_payloads(data_root: Path) -> dict[str, dict[str, Any]]:
    histories: dict[str, list[dict[str, Any]]] = {}
    profiles: dict[str, dict[str, Any]] = {}
    timestamps: dict[str, str] = {}
    for path in sorted((data_root / "history" / "teams").glob("*.json")):
        payload = read_json(path)
        season = str(payload.get("season") or path.stem)
        generated_at = str(payload.get("generatedAt") or "")
        for team in payload.get("teams", []):
            team_id = str(team.get("id") or "")
            if not team_id:
                continue
            record = team.get("record") or {}
            histories.setdefault(team_id, []).append({
                "season": season,
                "wins": record.get("wins"),
                "losses": record.get("losses"),
                "winPct": record.get("winPct"),
                "rank": team.get("rank", record.get("rank")),
            })
            timestamps[team_id] = max(timestamps.get(team_id, ""), generated_at)
            current_profile = profiles.get(team_id)
            if not current_profile or season >= current_profile["_season"]:
                profiles[team_id] = {**team, "_season": season}

    current_path = data_root / "teams" / "index.json"
    if current_path.exists():
        for team in read_json(current_path).get("teams", []):
            team_id = str(team.get("id") or "")
            if team_id in profiles:
                profiles[team_id].update(team)

    result = {}
    for team_id, rows in histories.items():
        rows.sort(key=lambda row: row["season"])
        team = dict(profiles[team_id])
        team.pop("_season", None)
        result[team_id] = {
            "schemaVersion": 2,
            "dataVersion": f"team-career-{team_id}-{rows[-1]['season']}",
            "generatedAt": timestamps.get(team_id, ""),
            "source": "NBA.com via nba_api",
            "team": team,
            "history": rows,
        }
    return result


def normalize_featured_player(data_root: Path) -> None:
    path = data_root / "players" / "2544.json"
    if not path.exists():
        return
    payload = read_json(path)
    changed = payload.get("schemaVersion") != 2 or payload.get("statsMode") != "perGame"
    career = payload.get("career") or {}
    for key in ("regularSeason", "playoffs", "allStar"):
        for row in career.get(key, []):
            if row.get("statsMode") == "perGame":
                continue
            games = float(row.get("gp") or 0)
            totals = {field: row.get(field) for field in FEATURED_COUNTING_FIELDS}
            if games:
                for field in FEATURED_COUNTING_FIELDS:
                    if row.get(field) is not None:
                        row[field] = round(float(row[field]) / games, 1)
            row["statsMode"] = "perGame"
            row["totals"] = totals
            changed = True
    for key in ("regularSeasonTotals", "playoffTotals", "allStarTotals"):
        for row in career.get(key, []):
            if row.get("statsMode") != "totals":
                row["statsMode"] = "totals"
                changed = True
    if changed:
        payload["schemaVersion"] = 2
        payload["statsMode"] = "perGame"
        write_json(path, payload)


def replace_generated_directory(data_root: Path, relative: Path, payloads: dict[str, dict[str, Any]]) -> None:
    temp_root = Path(tempfile.mkdtemp(prefix="nba-indexes-", dir=data_root.parent))
    try:
        generated = temp_root / relative
        for item_id, payload in payloads.items():
            write_json(generated / f"{item_id}.json", payload)
        destination = (data_root / relative).resolve()
        expected_parent = (data_root / "history").resolve()
        if destination.parent != expected_parent:
            raise RuntimeError(f"unsafe generated directory: {destination}")
        if destination.exists():
            shutil.rmtree(destination)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(generated), str(destination))
    finally:
        if temp_root.exists():
            shutil.rmtree(temp_root)


def update_manifest(data_root: Path, history_updated_at: str = "") -> None:
    path = data_root / "manifest.json"
    manifest = read_json(path)
    history = manifest.setdefault("history", {})
    history.update({
        "playerCareersPattern": "/data/history/player-careers/{playerId}.json",
        "teamCareersPattern": "/data/history/team-careers/{teamId}.json",
        "careerSchemaVersion": 2,
        "playerStatsMode": "perGame",
    })
    if history_updated_at:
        manifest["historyUpdatedAt"] = history_updated_at
    write_json(path, manifest)


def validate(data_root: Path) -> tuple[int, int]:
    manifest = read_json(data_root / "manifest.json")
    if manifest.get("sourceStatus") not in {"official", "partial"}:
        raise RuntimeError("manifest sourceStatus is invalid")
    if not manifest.get("generatedAt") or not manifest.get("season"):
        raise RuntimeError("manifest snapshot metadata is incomplete")

    current_players = read_json(data_root / "players" / "index.json").get("players", [])
    current_teams = read_json(data_root / "teams" / "index.json").get("teams", [])
    current_games = read_json(data_root / "games" / "today.json").get("games", [])
    current_leaders = read_json(data_root / "leaders" / "index.json").get("leaders", {})
    if len(current_players) < 300:
        raise RuntimeError("current player snapshot is unexpectedly small")
    if len(current_teams) != 30:
        raise RuntimeError("current team snapshot must contain 30 teams")
    leader_count = sum(len(rows) for rows in current_leaders.values())
    if leader_count < 15:
        raise RuntimeError("current leaderboard snapshot is unexpectedly small")

    health = manifest.get("dataHealth") or {}
    health_counts = {
        "games": len(current_games),
        "teams": len(current_teams),
        "players": len(current_players),
        "leaders": leader_count,
    }
    for key in ("snapshot", "games", "teams", "players", "leaders", "featuredPlayer"):
        status = (health.get(key) or {}).get("status")
        if status not in {"ok", "partial", "empty"}:
            raise RuntimeError(f"manifest dataHealth.{key}.status is invalid")
    for key, count in health_counts.items():
        if health[key].get("count") != count:
            raise RuntimeError(f"manifest dataHealth.{key}.count does not match its file")

    history = manifest.get("history") or {}
    required = {
        "playerCareersPattern": "/data/history/player-careers/{playerId}.json",
        "teamCareersPattern": "/data/history/team-careers/{teamId}.json",
        "careerSchemaVersion": 2,
        "playerStatsMode": "perGame",
    }
    for key, expected in required.items():
        if history.get(key) != expected:
            raise RuntimeError(f"manifest history.{key} is invalid")

    expected_players = set()
    for path in (data_root / "history" / "players").glob("*.json"):
        expected_players.update(str(item.get("id")) for item in read_json(path).get("players", []) if item.get("id"))
    player_files = list((data_root / "history" / "player-careers").glob("*.json"))
    if {path.stem for path in player_files} != expected_players:
        raise RuntimeError("player career index does not match season history")
    for path in player_files:
        payload = read_json(path)
        rows = payload.get("career", {}).get("regularSeason", [])
        if payload.get("schemaVersion") != 2 or payload.get("statsMode") != "perGame" or not rows:
            raise RuntimeError(f"invalid player career file: {path.name}")
        if any(row.get("statsMode") != "perGame" for row in rows):
            raise RuntimeError(f"mixed player stats modes: {path.name}")

    expected_teams = set()
    for path in (data_root / "history" / "teams").glob("*.json"):
        expected_teams.update(str(item.get("id")) for item in read_json(path).get("teams", []) if item.get("id"))
    team_files = list((data_root / "history" / "team-careers").glob("*.json"))
    if {path.stem for path in team_files} != expected_teams:
        raise RuntimeError("team career index does not match season history")
    for path in team_files:
        payload = read_json(path)
        if payload.get("schemaVersion") != 2 or not payload.get("history"):
            raise RuntimeError(f"invalid team career file: {path.name}")

    featured = read_json(data_root / "players" / "2544.json")
    if featured.get("schemaVersion") != 2 or any(
        row.get("statsMode") != "perGame"
        for row in featured.get("career", {}).get("regularSeason", [])
    ):
        raise RuntimeError("featured player stats are not normalized to per-game")
    return len(player_files), len(team_files)


def main() -> int:
    args = parse_args()
    data_root = args.data_root.resolve()
    try:
        if args.check:
            player_count, team_count = validate(data_root)
        else:
            manifest = read_json(data_root / "manifest.json")
            season = args.season or str(manifest.get("season") or "")
            history_updated_at = ""
            if args.merge_current:
                if not season:
                    raise RuntimeError("current season is required")
                merge_current_season(data_root, season)
                history_updated_at = str(manifest.get("generatedAt") or "")
            normalize_featured_player(data_root)
            replace_generated_directory(data_root, Path("history/player-careers"), build_player_payloads(data_root))
            replace_generated_directory(data_root, Path("history/team-careers"), build_team_payloads(data_root))
            update_manifest(data_root, history_updated_at)
            player_count, team_count = validate(data_root)
    except Exception as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1
    print(f"NBA career indexes valid: players={player_count} teams={team_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
