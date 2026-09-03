#!/usr/bin/env python3
"""Start Mihomo and select a subscription node that can query NBA Stats."""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

import yaml
from curl_cffi import requests as curl_requests


NBA_PROBE_URL = "https://stats.nba.com/stats/commonteamyears?LeagueID=00"
IGNORED_PROXY_TYPES = {
    "Compatible",
    "Direct",
    "Fallback",
    "LoadBalance",
    "Pass",
    "Reject",
    "Relay",
    "Selector",
    "URLTest",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mihomo", type=Path, required=True)
    parser.add_argument("--workdir", type=Path, required=True)
    parser.add_argument("--subscription-env", default="CLASH_SUBSCRIPTION_URL")
    parser.add_argument("--timeout", type=int, default=15)
    parser.add_argument("--workers", type=int, default=16)
    return parser.parse_args()


def fetch_subscription(url: str) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "clash.meta", "Accept": "*/*"},
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        document = yaml.safe_load(response.read())
    if not isinstance(document, dict) or not isinstance(document.get("proxies"), list):
        raise RuntimeError("subscription did not return a Mihomo-compatible proxy list")
    return document


def usable_proxies(document: dict[str, Any]) -> list[dict[str, Any]]:
    proxies = []
    seen = set()
    for item in document.get("proxies", []):
        if not isinstance(item, dict) or not item.get("name"):
            continue
        name = str(item["name"])
        if item.get("type") in IGNORED_PROXY_TYPES or name in seen:
            continue
        seen.add(name)
        proxies.append(item)
    return proxies


def wait_for_controller(process: subprocess.Popen[Any], timeout: int = 30) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("Mihomo exited before its controller became ready")
        try:
            with urllib.request.urlopen("http://127.0.0.1:9090/version", timeout=1):
                return
        except Exception:
            time.sleep(0.5)
    raise RuntimeError("Mihomo controller did not become ready")


def probe_candidate(item: tuple[int, int], timeout: int) -> tuple[int, float] | None:
    index, port = item
    started = time.monotonic()
    try:
        response = curl_requests.get(
            NBA_PROBE_URL,
            proxy=f"http://127.0.0.1:{port}",
            impersonate="chrome131",
            headers={
                "Accept": "application/json, text/plain, */*",
                "Referer": "https://www.nba.com/",
            },
            timeout=timeout,
        )
        response.raise_for_status()
        payload = response.json()
        result_sets = payload.get("resultSets", [])
        if any(isinstance(result_set, dict) and result_set.get("rowSet") for result_set in result_sets):
            return index, time.monotonic() - started
    except Exception:
        pass
    return None


def select_proxy(name: str) -> None:
    payload = json.dumps({"name": name}).encode()
    request = urllib.request.Request(
        "http://127.0.0.1:9090/proxies/nba-proxy",
        data=payload,
        method="PUT",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=5):
        pass


def main() -> int:
    args = parse_args()
    subscription_url = os.environ.get(args.subscription_env, "")
    if not subscription_url:
        print(f"::error::{args.subscription_env} is not configured", file=sys.stderr)
        return 1

    args.workdir.mkdir(parents=True, exist_ok=True)
    try:
        proxies = usable_proxies(fetch_subscription(subscription_url))[:200]
        if not proxies:
            raise RuntimeError("subscription contains no usable proxy definitions")

        listeners = [
            {
                "name": f"candidate-{index}",
                "type": "mixed",
                "port": 10000 + index,
                "listen": "127.0.0.1",
                "proxy": str(proxy["name"]),
            }
            for index, proxy in enumerate(proxies)
        ]
        config = {
            "mixed-port": 7890,
            "external-controller": "127.0.0.1:9090",
            "allow-lan": False,
            "log-level": "warning",
            "proxies": proxies,
            "proxy-groups": [
                {"name": "nba-proxy", "type": "select", "proxies": [str(proxy["name"]) for proxy in proxies]}
            ],
            "listeners": listeners,
            "rules": ["MATCH,nba-proxy"],
        }
        config_path = args.workdir / "config.yaml"
        config_path.write_text(yaml.safe_dump(config, allow_unicode=True, sort_keys=False), encoding="utf-8")

        log_handle = (args.workdir / "mihomo.log").open("w", encoding="utf-8")
        process = subprocess.Popen(
            [str(args.mihomo), "-d", str(args.workdir), "-f", str(config_path)],
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        try:
            wait_for_controller(process)
            candidates = [(index, 10000 + index) for index in range(len(proxies))]
            with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
                results = [result for result in pool.map(lambda item: probe_candidate(item, args.timeout), candidates) if result]
            if not results:
                raise RuntimeError(f"none of {len(proxies)} proxy candidates returned valid NBA Stats JSON")
            selected_index, elapsed = min(results, key=lambda result: result[1])
            select_proxy(str(proxies[selected_index]["name"]))
            (args.workdir / "mihomo.pid").write_text(str(process.pid), encoding="ascii")
            print(
                f"NBA proxy ready: selected candidate {selected_index + 1}/{len(proxies)} "
                f"from {len(results)} compatible candidates ({elapsed:.2f}s)"
            )
            return 0
        except Exception:
            process.terminate()
            process.wait(timeout=8)
            raise
        finally:
            log_handle.close()
    except Exception as error:
        print(f"::error::{error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
