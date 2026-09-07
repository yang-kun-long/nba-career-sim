#!/usr/bin/env python3
"""Compare a generated NBA snapshot with the currently deployed snapshot."""

from __future__ import annotations

import argparse
import json
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


DATA_FILES = (
    "games/today.json",
    "teams/index.json",
    "players/index.json",
    "leaders/index.json",
    "players/2544.json",
)
VOLATILE_KEYS = {"dataVersion", "generatedAt", "updatedAt"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local", type=Path, required=True, help="Local data directory")
    parser.add_argument("--remote-base", required=True, help="Deployed site base URL")
    parser.add_argument("--github-output", type=Path, default=None)
    parser.add_argument("--timeout", type=int, default=20)
    return parser.parse_args()


def normalize(value: Any, *, path: str = "") -> Any:
    if isinstance(value, dict):
        return {
            key: normalize(item, path=f"{path}.{key}" if path else key)
            for key, item in value.items()
            if key not in VOLATILE_KEYS and not (path == "games/today.json" and key == "date")
        }
    if isinstance(value, list):
        return [normalize(item, path=path) for item in value]
    return value


def manifest_projection(document: dict[str, Any]) -> dict[str, Any]:
    health = document.get("dataHealth") or {}
    return {
        "schemaVersion": document.get("schemaVersion"),
        "season": document.get("season"),
        "sourceStatus": document.get("sourceStatus"),
        "health": {
            key: {
                "status": value.get("status"),
                "count": value.get("count"),
            }
            for key, value in health.items()
            if isinstance(value, dict)
        },
    }


def read_local(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_remote(base_url: str, relative_path: str, timeout: int) -> Any:
    url = urllib.parse.urljoin(base_url.rstrip("/") + "/", f"data/{relative_path}")
    url = f"{url}?refresh={time.time_ns()}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "nba-career-sim-refresh/1.0",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.load(response)


def set_output(path: Path | None, changed: bool) -> None:
    if path is not None:
        with path.open("a", encoding="utf-8") as output:
            output.write(f"changed={'true' if changed else 'false'}\n")


def main() -> int:
    args = parse_args()
    changed_files: list[str] = []
    try:
        local_manifest = manifest_projection(read_local(args.local / "manifest.json"))
        remote_manifest = manifest_projection(read_remote(args.remote_base, "manifest.json", args.timeout))
        if local_manifest != remote_manifest:
            changed_files.append("manifest.json")

        for relative_path in DATA_FILES:
            local = normalize(read_local(args.local / relative_path), path=relative_path)
            remote = normalize(read_remote(args.remote_base, relative_path, args.timeout), path=relative_path)
            if local != remote:
                changed_files.append(relative_path)
    except Exception as error:
        set_output(args.github_output, True)
        print(f"Remote comparison unavailable; deployment will proceed: {error}")
        return 0

    changed = bool(changed_files)
    set_output(args.github_output, changed)
    if changed:
        print(f"NBA data changed: {', '.join(changed_files)}")
    else:
        print("NBA business data is unchanged; deployment will be skipped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
