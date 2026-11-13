import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import start_nba_proxy as proxy


class ProxyTests(unittest.TestCase):
    def test_probes_use_requested_season_and_real_endpoints(self):
        urls = proxy.probe_urls("2026-27")
        self.assertEqual(len(urls), 2)
        self.assertTrue(urlparse(urls[1]).path.endswith("leaguedashplayerstats"))
        for url in urls:
            self.assertEqual(parse_qs(urlparse(url).query)["Season"], ["2026-27"])

    def test_empty_preseason_schema_is_valid_but_error_payload_is_not(self):
        for key in ("resultSets", "resultSet"):
            self.assertTrue(proxy.valid_stats_payload({key: [{"headers": ["PLAYER_ID"], "rowSet": []}]}))
        for payload in ({}, {"error": "blocked"}, {"resultSets": [{}]}, []):
            self.assertFalse(proxy.valid_stats_payload(payload))

    def test_player_endpoint_failure_rejects_otherwise_usable_node(self):
        good = Mock(status_code=200)
        good.json.return_value = {"resultSets": [{"headers": ["TEAM_ID"], "rowSet": [[1]]}]}
        bad = Mock(status_code=200)
        bad.json.return_value = {"message": "blocked"}
        with patch.object(proxy.curl_requests, "get", side_effect=[good, bad]) as request:
            self.assertIsNone(proxy.probe_candidate((0, 10000), 1, ["teams", "players"]))
        self.assertEqual(request.call_count, 2)

    def test_transport_diagnostics_do_not_expose_exception_details(self):
        with patch.object(proxy.curl_requests, "get", side_effect=RuntimeError("secret subscription")), patch("builtins.print") as log:
            self.assertIsNone(proxy.probe_candidate((0, 10000), 1))
        self.assertNotIn("secret", str(log.call_args))
        self.assertIn("RuntimeError", str(log.call_args))


if __name__ == "__main__":
    unittest.main()
