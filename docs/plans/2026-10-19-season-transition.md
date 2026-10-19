# NBA Season Transition Implementation Plan

**Goal:** Support opening-season refresh without relabeling old statistics.

**Architecture:** Fetch official schedule evidence, distinguish legitimate pre-season emptiness from failures, and validate early-season data without mature-season count assumptions.

**Tech Stack:** Python, nba_api, curl_cffi, unittest, GitHub Actions.

### Task 1: Schedule evidence

Update `scripts/refresh_nba_data.py` to validate season, regular-season game IDs, timestamps, and start status from official schedule JSON. Schedule failures cannot authorize empty statistics.

### Task 2: Empty statistics

Accept empty statistics only before the verified opening time. Keep the requested season, mark players and leaders empty, and reject corrupt nonempty rows.

### Task 3: Indexes and deployment

Update `scripts/build_nba_history_indexes.py` to skip pre-season historical merging and validate small early-season snapshots. Update `scripts/check_nba_data_changed.py` to compare phase evidence.

### Task 4: Verification

Add regression cases in `tests/test_nba_refresh.py`, run Python tests in CI, update `docs/nba-data-bootstrap.md`, and run existing unit tests and production build.
