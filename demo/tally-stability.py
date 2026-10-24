#!/usr/bin/env python3
"""Supplementary stability table, from evidence/runs/stability/.

    python3 demo/tally-stability.py
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent / "evidence" / "runs" / "stability"
ARMS = ["baseline", "ai-conventions", "baseline-plus-rules", "with-setup"]
TICKETS = ["06", "07", "08"]


def passes(arm, ticket):
    path = ROOT / f"{arm}-{ticket}.txt"
    if not path.exists():
        return None
    m = re.search(r"^spec passes: (\d+)/(\d+)", path.read_text(), re.M)
    return int(m.group(1)), int(m.group(2))


out = ["| Arm | Ticket 06 | Ticket 07 | Ticket 08 | Total |", "| --- | --- | --- | --- | --- |"]
for a in ARMS:
    cells, p_sum, n_sum = [], 0, 0
    for t in TICKETS:
        r = passes(a, t)
        if r is None:
            cells.append("not run")
            continue
        cells.append(f"{r[0]}/{r[1]}")
        p_sum, n_sum = p_sum + r[0], n_sum + r[1]
    out.append(f"| `{a}` | {' | '.join(cells)} | {p_sum}/{n_sum} |")

failures = []
for a in ARMS:
    for t in TICKETS:
        path = ROOT / f"{a}-{t}.txt"
        if path.exists():
            failures += [f"- `{a}` {t}: {line.removeprefix('failure: ')}" for line in path.read_text().splitlines() if line.startswith("failure:")]
print("\n".join(out))
if failures:
    print("\nFailures:\n")
    print("\n".join(failures))
