# Demo page: BQuant data pipeline

Static page built by tools/build_site.py from the results files. Deploy the folder to Vercel as is (no build step); vercel.json and robots.txt keep it out of search engines.

## Measured

From `python3 tools/measure.py` (results/measure.json), `python3 tools/run_tests.py` and `python3 tools/mutate.py`. All data is simulated by bqpipe/sim.py: 300 securities, 2014-01-01 to 2023-12-29, a 100-name index reviewed quarterly, splits, dividends, delistings, and quarterly earnings announced 25 to 60 days after the quarter ends.

- Total returns rebuilt from raw prices, splits and dividends match the simulated truth to within 1e-12.
- The same monthly earnings strategy over 20 simulated markets:
  - point in time (members and earnings as known on each date): 10.1% a year;
  - today's index members for every past date: 16.2% a year, overstated by +6.0 points on average (+2.0 to +8.9, 5th to 95th percentile), higher in 20 of 20 markets;
  - earnings dated at quarter end instead of announcement: 11.7% a year, overstated by +1.6 points on average (+0.0 to +3.1, 5th to 95th percentile), higher in 19 of 20 markets;
  - both: 18.1% a year, overstated by +7.9 points on average (+5.4 to +10.7, 5th to 95th percentile), higher in 20 of 20 markets.
  The sizes come from the simulation's settings and are not estimates for any real index.
- Data checks on errors planted in 20 markets (stale counts are days; each planted run is 6 days):
  - bad_value: 120 of 120 found, 0 false flags
  - currency_change: 120 of 120 found, 0 false flags
  - duplicate: 120 of 120 found, 0 false flags
  - missing_day: 120 of 120 found, 0 false flags
  - spike: 120 of 120 found, 0 false flags
  - split_unrecorded: 120 of 120 found, 0 false flags
  - stale: 720 of 720 found, 0 false flags
  On the same markets with nothing planted: 0 flags. With smaller errors than the checks were tuned for (5 markets): 30 of 30 bad prints of 40% found, 0 of 90 stale days in 3-day runs (a run must last 5 days).
- The BQL path, through bqpipe/fake_bql.py: one 10-year pull of 608,211 rows split four ways (500 securities x 50 years: 1 queries, 0 retries, 100 securities x 2 years: 15 queries, 0 retries, 25 securities x 1 years: 120 queries, 0 retries, 7 securities x 1 years: 430 queries, 143 retries) returned identical rows. A rerun with the cache sent 0 queries. A single request over the stand-in's size cap was refused.
- Pipeline: a production run with 72 planted errors stopped and left the previous output in place (True); a research run finished with 27 of 418,215 rows left out and listed. The BQL path and a file-backed source give the same output hash (True); a rerun gives the same hash (True).
- Tests: 23 of 23 pass. Planted bugs caught by the tests: 21 of 21. Browser checks on the page: 30 of 30.

## Not measured

- No BQuant or BQL access. `bqpipe/fake_bql.py` mimics the response shape in public BQL examples (an ID index, then DATE, CURRENCY and one column per item, joined with `bql.combined_df`). It is not Bloomberg's library. The query strings, the `members(..., dates=...)` form and parameters such as price adjustment and currency need confirming in BQuant first.
- No Bloomberg data. Every market, price and earnings figure is simulated.
- Fundamentals and corporate actions are read from tables here, not yet through BQL; their BQL field names depend on the account's entitlements.
- BQL request limits and usage costs on the account are unknown; securities per query and years per query are settings.
- The checks were scored on errors I planted, in the forms they were written for. Real feeds have errors these checks won't catch.
