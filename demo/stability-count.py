#!/usr/bin/env python3
"""Counts one spec's --repeat-each results from a Playwright JSON report.

    python3 demo/stability-count.py <report.json> <spec, e.g. tests/customers/x.spec.ts>

The JSON report lists every repetition of a test as its own entry, in the order they ran. With one
worker, the k-th entry of each test is repetition k. A repetition of the spec passes when every
test in the spec passed in it. Prints per-test and per-spec passes, and every failure with the
line the error points at and the first line of its message.
"""
import json
import sys
from collections import defaultdict

report_path, spec = sys.argv[1], sys.argv[2]
spec_file = spec.removeprefix("tests/")

try:
    report = json.load(open(report_path))
except (OSError, json.JSONDecodeError):
    print("spec passes: 0/0 (no report)")
    sys.exit(0)

runs = defaultdict(list)


def walk(suite):
    for s in suite.get("specs", []):
        if s["file"] != spec_file:
            continue
        for t in s["tests"]:
            for r in t["results"]:
                runs[(s["line"], s["title"])].append(r)
    for child in suite.get("suites", []):
        walk(child)


for suite in report.get("suites", []):
    walk(suite)

for key in runs:
    runs[key].sort(key=lambda r: r["startTime"])  # stable: keeps report order on ties

repeats = max((len(v) for v in runs.values()), default=0)
for (line, title), results in sorted(runs.items()):
    passed = sum(r["status"] == "passed" for r in results)
    print(f"test line {line}: {passed}/{len(results)} passed: {title}")

spec_passes = sum(
    all(k < len(results) and results[k]["status"] == "passed" for results in runs.values())
    for k in range(repeats)
)
print(f"spec passes: {spec_passes}/{repeats}")

for (line, title), results in sorted(runs.items()):
    for k, r in enumerate(results):
        if r["status"] == "passed":
            continue
        err = (r.get("errors") or [r.get("error") or {}])[0]
        loc = err.get("location") or {}
        where = f"{loc.get('file', '?').split('/e2e/')[-1]}:{loc.get('line', '?')}" if loc else "no location"
        message = (err.get("message") or "").replace("\x1b", "").split("\n")[0][:300]
        print(f"failure: repetition {k + 1}, test line {line}, {r['status']} at {where}: {message}")
