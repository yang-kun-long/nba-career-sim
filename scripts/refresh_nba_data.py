#!/usr/bin/env python3
"""Build a small, stable NBA data snapshot for the static frontend.

The script writes to a temporary directory and only replaces the requested
output after the required NBA Stats calls and schema checks succeed. A failed
Action therefore leaves the previous deployment untouched.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
import tempfile
import time
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("public/data"))
    parser.add_argument("--season", default="", help="NBA season (defaults to the current season)")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--sleep", type=float, default=1.5)
    return parser.parse_args()


def current_nba_season(today: date | None = None) -> str:
    """Return the NBA season containing the given calendar date."""
    current = today or date.today()
    start_year = current.year if current.month >= 10 else current.year - 1
    return f"{start_year}-{str(start_year + 1)[-2:]}"


def now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def serializable(value: Any) -> Any:
    if value is None:
        return None
    if hasattr(value, "item"):
        return value.item()
    if isinstance(value, float) and value != value:
        return None
    return value


def value(row: Any, *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in row and row[key] is not None:
            return serializable(row[key])
    return default


def call_with_retry(factory, *, retries: int, pause: float, label: str, **kwargs):
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            endpoint = factory(**kwargs)
            return endpoint.get_data_frames()
        except Exception as error:  # NBA endpoints fail in several different ways.
            last_error = error
            if attempt < retries:
                time.sleep(pause * attempt)
    raise RuntimeError(f"{label} failed after {retries} attempts: {last_error}") from last_error


def endpoint_with_retry(factory, *, retries: int, pause: float, label: str, **kwargs):
    """Return an endpoint whose payload is not a tabular DataFrame."""
    last_error: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            return factory(**kwargs)
        except Exception as error:
            last_error = error
            if attempt < retries:
                time.sleep(pause * attempt)
    raise RuntimeError(f"{label} failed after {retries} attempts: {last_error}") from last_error


def frame_rows(frames: list[Any]) -> list[dict[str, Any]]:
    for frame in frames:
        if frame is not None and not frame.empty:
            return [{key: serializable(item) for key, item in row.items()} for row in frame.to_dict("records")]
    return []


def normalize_career_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep the career endpoint detailed while avoiding NBA-specific column names."""
    normalized = []
    for row in rows:
        normalized.append({
            "season": value(row, "SEASON_ID"),
            "league": value(row, "LEAGUE_ID"),
            "teamId": value(row, "TEAM_ID", "Team_ID"),
            "team": value(row, "TEAM_ABBREVIATION"),
            "age": value(row, "PLAYER_AGE"),
            "gp": value(row, "GP"),
            "gs": value(row, "GS"),
            "minutes": value(row, "MIN"),
            "fgm": value(row, "FGM"),
            "fga": value(row, "FGA"),
            "fgPct": value(row, "FG_PCT"),
            "threeMade": value(row, "FG3M"),
            "threeAttempted": value(row, "FG3A"),
            "threePct": value(row, "FG3_PCT"),
            "ftm": value(row, "FTM"),
            "fta": value(row, "FTA"),
            "ftPct": value(row, "FT_PCT"),
            "offensiveRebounds": value(row, "OREB"),
            "defensiveRebounds": value(row, "DREB"),
            "rebounds": value(row, "REB"),
            "assists": value(row, "AST"),
            "steals": value(row, "STL"),
            "blocks": value(row, "BLK"),
            "turnovers": value(row, "TOV"),
            "fouls": value(row, "PF"),
            "points": value(row, "PTS"),
        })
    return normalized


def get_dataset_rows(endpoint: Any, dataset_name: str) -> list[dict[str, Any]]:
    dataset = getattr(endpoint, dataset_name)
    return frame_rows([dataset.get_data_frame()])


def fetch_featured_player(args: argparse.Namespace, generated_at: str) -> dict[str, Any]:
    from nba_api.stats.endpoints import commonplayerinfo, playercareerstats

    player_id = "2544"
    career = endpoint_with_retry(
        playercareerstats.PlayerCareerStats,
        player_id=player_id,
        timeout=args.timeout,
        retries=args.retries,
        pause=args.sleep,
        label="LeBron James career stats",
    )
    profile = {
        "id": player_id,
        "fullName": "LeBron James",
        "position": "F",
        "teamId": "lal",
        "teamName": "Los Angeles Lakers",
    }
    try:
        info = endpoint_with_retry(
            commonplayerinfo.CommonPlayerInfo,
            player_id=player_id,
            timeout=args.timeout,
            retries=args.retries,
            pause=args.sleep,
            label="LeBron James profile",
        )
        info_rows = get_dataset_rows(info, "common_player_info")
        if info_rows:
            row = info_rows[0]
            profile.update({
                "fullName": value(row, "DISPLAY_FIRST_LAST", default="LeBron James"),
                "firstName": value(row, "FIRST_NAME"),
                "lastName": value(row, "LAST_NAME"),
                "birthDate": value(row, "BIRTHDATE"),
                "height": value(row, "HEIGHT"),
                "weight": value(row, "WEIGHT"),
                "country": value(row, "COUNTRY"),
                "school": value(row, "SCHOOL"),
                "draftYear": value(row, "DRAFT_YEAR"),
                "draftRound": value(row, "DRAFT_ROUND"),
                "draftNumber": value(row, "DRAFT_NUMBER"),
                "from": value(row, "FROM_YEAR"),
                "to": value(row, "TO_YEAR"),
            })
    except Exception:
        # Career statistics are required; profile metadata is an optional enhancement.
        pass
    return {
        "schemaVersion": 1,
        "dataVersion": f"lebron-{args.season}-{generated_at[:10]}",
        "generatedAt": generated_at,
        "source": "NBA.com via nba_api",
        "profile": profile,
        "career": {
            "regularSeason": normalize_career_rows(get_dataset_rows(career, "season_totals_regular_season")),
            "playoffs": normalize_career_rows(get_dataset_rows(career, "season_totals_post_season")),
            "allStar": normalize_career_rows(get_dataset_rows(career, "season_totals_all_star_season")),
            "regularSeasonTotals": normalize_career_rows(get_dataset_rows(career, "career_totals_regular_season")),
            "playoffTotals": normalize_career_rows(get_dataset_rows(career, "career_totals_post_season")),
            "allStarTotals": normalize_career_rows(get_dataset_rows(career, "career_totals_all_star_season")),
        },
    }


def build_snapshot(args: argparse.Namespace) -> dict[str, Any]:
    from nba_api.live.nba.endpoints import scoreboard
    from nba_api.stats.endpoints import leaguedashplayerstats, leaguestandings
    from nba_api.stats.static import players as static_players
    from nba_api.stats.static import teams as static_teams

    generated_at = now_iso()
    warnings: list[str] = []

    team_rows = static_teams.get_teams()
    if not team_rows:
        raise RuntimeError("NBA static team list is empty")
    team_by_nba_id = {str(item["id"]): item for item in team_rows}
    team_by_abbr = {item["abbreviation"]: item for item in team_rows}

    scoreboard_warning = ""
    try:
        standings = frame_rows(call_with_retry(
            leaguestandings.LeagueStandings,
            season=args.season,
            season_type="Regular Season",
            timeout=args.timeout,
            retries=args.retries,
            pause=args.sleep,
            label="league standings",
        ))
    except Exception as error:
        raise RuntimeError(str(error)) from error

    record_by_team: dict[str, dict[str, Any]] = {}
    for row in standings:
        team_id = str(value(row, "TeamID", "TEAM_ID", default=""))
        record_by_team[team_id] = {
            "wins": value(row, "WINS", "Wins"),
            "losses": value(row, "LOSSES", "Losses"),
            "winPct": value(row, "WinPCT", "W_PCT"),
            "rank": value(row, "PlayoffRank", "ConferenceRecord"),
        }

    try:
        player_stats = frame_rows(call_with_retry(
            leaguedashplayerstats.LeagueDashPlayerStats,
            season=args.season,
            per_mode_detailed="PerGame",
            season_type_all_star="Regular Season",
            timeout=args.timeout,
            retries=args.retries,
            pause=args.sleep,
            label="player stats",
        ))
    except Exception as error:
        raise RuntimeError(str(error)) from error

    static_player_by_id = {str(item["id"]): item for item in static_players.get_players()}
    players: list[dict[str, Any]] = []
    for row in player_stats:
        player_id = str(value(row, "PLAYER_ID", "Player_ID", default=""))
        team_id = str(value(row, "TEAM_ID", "Team_ID", default=""))
        team = team_by_nba_id.get(team_id)
        if not player_id or not team:
            continue
        player = static_player_by_id.get(player_id, {})
        players.append({
            "id": player_id,
            "fullName": value(row, "PLAYER_NAME", default=player.get("full_name", "Unknown")),
            "teamId": team["abbreviation"].lower(),
            "teamName": team["full_name"],
            "position": value(row, "POSITION", default=""),
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
    if not players:
        raise RuntimeError("NBA player stats returned zero usable rows")

    teams = []
    for team in team_rows:
        team_id = str(team["id"])
        record = record_by_team.get(team_id, {})
        teams.append({
            "id": team["abbreviation"].lower(),
            "nbaId": team["id"],
            "name": team["full_name"],
            "city": team["city"],
            "abbreviation": team["abbreviation"],
            "conference": team.get("conference", ""),
            "division": team.get("division", ""),
            "record": {"wins": record.get("wins"), "losses": record.get("losses"), "winPct": record.get("winPct")},
            "rank": record.get("rank"),
        })

    try:
        live_endpoint = endpoint_with_retry(
            scoreboard.ScoreBoard,
            timeout=args.timeout,
            retries=args.retries,
            pause=args.sleep,
            label="live scoreboard",
        )
        scoreboard_data = live_endpoint.get_dict().get("scoreboard", {})
        games = []
        for row in scoreboard_data.get("games", []):
            home = row.get("homeTeam", {}) or {}
            away = row.get("awayTeam", {}) or {}
            games.append({
                "id": row.get("gameId"),
                "status": row.get("gameStatusText", "未开始"),
                "startTime": row.get("gameTimeUTC"),
                "home": {"name": home.get("teamName", "主队"), "city": home.get("teamCity", ""), "abbreviation": home.get("teamTricode", ""), "score": home.get("score")},
                "away": {"name": away.get("teamName", "客队"), "city": away.get("teamCity", ""), "abbreviation": away.get("teamTricode", ""), "score": away.get("score")},
            })
    except Exception as error:
        scoreboard_warning = f"live scoreboard unavailable: {error}"
        warnings.append(scoreboard_warning)
        games = []

    featured_warning = ""
    try:
        featured_player = fetch_featured_player(args, generated_at)
    except Exception as error:
        featured_warning = f"featured player unavailable: {error}"
        warnings.append(featured_warning)
        featured_player = None

    leaders = {}
    for label, field in (("得分", "points"), ("篮板", "rebounds"), ("助攻", "assists")):
        leaders[label] = [
            {"player": item["fullName"], "team": next((t["abbreviation"] for t in teams if t["id"] == item["teamId"]), ""), "value": item["stats"].get(field)}
            for item in sorted(players, key=lambda p: p["stats"].get(field) or 0, reverse=True)[:10]
        ]

    data_version = f"{args.season}-{date.today().isoformat()}"
    common = {"schemaVersion": 1, "dataVersion": data_version, "generatedAt": generated_at}
    data_health = {
        "snapshot": {"status": "partial" if warnings else "ok", "updatedAt": generated_at},
        "games": {
            "status": "partial" if scoreboard_warning else ("empty" if not games else "ok"),
            "updatedAt": generated_at,
            "count": len(games),
        },
        "teams": {"status": "ok", "updatedAt": generated_at, "count": len(teams)},
        "players": {"status": "ok", "updatedAt": generated_at, "count": len(players)},
        "leaders": {
            "status": "ok",
            "updatedAt": generated_at,
            "count": sum(len(rows) for rows in leaders.values()),
        },
        "featuredPlayer": {
            "status": "ok" if featured_player else "partial",
            "updatedAt": generated_at,
        },
    }
    if scoreboard_warning:
        data_health["games"]["warning"] = scoreboard_warning
    if featured_warning:
        data_health["featuredPlayer"]["warning"] = featured_warning
    return {
        "manifest": {
            **common,
            "source": "NBA.com via nba_api",
            "sourceStatus": "partial" if warnings else "official",
            "season": args.season,
            "timezone": "UTC",
            "warnings": warnings,
            "dataHealth": data_health,
            "files": {
                "games": "/data/games/today.json",
                "teams": "/data/teams/index.json",
                "players": "/data/players/index.json",
                "leaders": "/data/leaders/index.json",
                "featuredPlayers": {"2544": "/data/players/2544.json"},
            },
        },
        "games": {**common, "date": date.today().isoformat(), "games": games, "message": "" if games else "今日暂无比赛"},
        "teams": {**common, "teams": teams},
        "players": {**common, "players": players},
        "leaders": {**common, "leaders": leaders},
        "featuredPlayer": featured_player,
    }


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_current_snapshot(output: Path, snapshot: dict[str, Any]) -> None:
    """Replace only current snapshot files, preserving historical data."""
    existing_manifest_path = output / "manifest.json"
    if existing_manifest_path.exists():
        try:
            existing_manifest = json.loads(existing_manifest_path.read_text(encoding="utf-8"))
            if existing_manifest.get("history"):
                snapshot["manifest"]["history"] = existing_manifest["history"]
            if existing_manifest.get("historyUpdatedAt"):
                snapshot["manifest"]["historyUpdatedAt"] = existing_manifest["historyUpdatedAt"]
        except (OSError, json.JSONDecodeError):
            pass
    temp_dir = Path(tempfile.mkdtemp(prefix="nba-current-", dir=output.parent))
    try:
        write_json(temp_dir / "manifest.json", snapshot["manifest"])
        write_json(temp_dir / "games" / "today.json", snapshot["games"])
        write_json(temp_dir / "teams" / "index.json", snapshot["teams"])
        write_json(temp_dir / "players" / "index.json", snapshot["players"])
        write_json(temp_dir / "leaders" / "index.json", snapshot["leaders"])
        if snapshot.get("featuredPlayer"):
            write_json(temp_dir / "players" / "2544.json", snapshot["featuredPlayer"])
        for relative in (
            Path("manifest.json"),
            Path("games/today.json"),
            Path("teams/index.json"),
            Path("players/index.json"),
            Path("leaders/index.json"),
        ):
            destination = output / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.unlink(missing_ok=True)
            shutil.move(str(temp_dir / relative), str(destination))
        if snapshot.get("featuredPlayer"):
            destination = output / "players/2544.json"
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.unlink(missing_ok=True)
            shutil.move(str(temp_dir / "players/2544.json"), str(destination))
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir)


def main() -> int:
    args = parse_args()
    args.season = args.season or current_nba_season()
    try:
        snapshot = build_snapshot(args)
    except Exception as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1

    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    write_current_snapshot(output, snapshot)
    print(f"NBA snapshot written to {output}")
    print(f"status={snapshot['manifest']['sourceStatus']} dataVersion={snapshot['manifest']['dataVersion']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
