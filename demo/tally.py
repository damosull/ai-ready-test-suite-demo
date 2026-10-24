#!/usr/bin/env python3
"""Builds the results tables from evidence/: blind review verdicts, three-run results and the
broken-feature check. A spec that passed with its feature broken adds a B1 blocker if the
reviewer had marked B1 as met (SCORING.md, "Does the test catch the feature breaking?").

    python3 demo/tally.py [round]

The baseline is generated once (round 1); a later round compares the with-setup branch's
regenerated tests against that same baseline.
"""
import json
import re
import sys
from pathlib import Path

ROUND = sys.argv[1] if len(sys.argv) > 1 else "1"
ROOT = Path(__file__).resolve().parent.parent / "evidence"
TICKETS = ["01", "02", "03", "04", "05"]
BRANCHES = ["baseline", "with-setup"]


def load():
    rows = {}
    for line in (ROOT / "reviews" / "key.tsv").read_text().splitlines():
        rid, branch, ticket, rnd = line.split("\t")
        wanted = "1" if branch == "baseline" else ROUND
        if rnd != wanted:
            continue
        review = json.loads((ROOT / "reviews" / f"round-{rnd}" / f"{rid}.json").read_text())
        items = review["structured_output"]["items"]
        failed = {i["id"]: i["evidence"] for i in items if i["verdict"] == "failed"}
        runs = (ROOT / "runs" / f"round-{rnd}" / f"{branch}-{ticket}.txt").read_text()
        passed = int(re.search(r"runs: (\d)/3", runs).group(1))
        caught = "broken feature caught: yes" in runs
        if not caught and "B1" not in failed:
            failed["B1"] = "Added from the broken-feature check: the spec passed with the feature broken."
        rows[(branch, ticket)] = {
            "id": rid,
            "blockers": sorted((k for k in failed if k.startswith("B")), key=lambda k: int(k[1:])),
            "minors": sorted((k for k in failed if k.startswith("M")), key=lambda k: int(k[1:])),
            "evidence": failed,
            "runs": passed,
            "caught": caught,
        }
    return rows


def verdict(rows, tickets):
    b = {br: sum(len(rows[(br, t)]["blockers"]) for t in tickets) for br in BRANCHES}
    m = {br: sum(len(rows[(br, t)]["minors"]) for t in tickets) for br in BRANCHES}
    green = all(rows[("with-setup", t)]["runs"] == 3 for t in tickets)
    total = {br: b[br] + m[br] for br in BRANCHES}
    half = total["with-setup"] <= total["baseline"] / 2
    ok = b["with-setup"] == 0 and half and green
    return b, m, total, green, half, ok


def main():
    rows = load()
    out = []
    for t in TICKETS:
        out.append(f"### Ticket {t}{' (see the disclosure)' if t == '01' else ''}\n")
        out.append("| Branch | Blockers | Minors | 3x runs | Caught the broken feature | Review |")
        out.append("| --- | --- | --- | --- | --- | --- |")
        for br in BRANCHES:
            r = rows[(br, t)]
            out.append(
                f"| `{br}` | {len(r['blockers'])} {('(' + ', '.join(r['blockers']) + ')') if r['blockers'] else ''} "
                f"| {len(r['minors'])} {('(' + ', '.join(r['minors']) + ')') if r['minors'] else ''} "
                f"| {r['runs']}/3 | {'yes' if r['caught'] else 'no'} | `{r['id']}` |"
            )
        out.append("")
    for label, tickets in (("All five tickets", TICKETS), ("Tickets 02 to 05 only", TICKETS[1:])):
        b, m, total, green, half, ok = verdict(rows, tickets)
        out.append(f"### Totals: {label}\n")
        out.append("| Branch | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |")
        out.append("| --- | --- | --- | --- | --- | --- |")
        for br in BRANCHES:
            g = sum(rows[(br, t)]["runs"] == 3 for t in tickets)
            c = sum(rows[(br, t)]["caught"] for t in tickets)
            out.append(f"| `{br}` | {b[br]} | {m[br]} | {total[br]} | {g}/{len(tickets)} | {c}/{len(tickets)} |")
        out.append(
            f"\nPass rule: zero blockers {'yes' if b['with-setup'] == 0 else 'NO'}; "
            f"at most half the baseline's findings ({total['with-setup']} vs {total['baseline']}) "
            f"{'yes' if half else 'NO'}; green 3/3 {'yes' if green else 'NO'}. "
            f"**{'PASS' if ok else 'FAIL'}**\n"
        )
    out.append("### Every failed item\n")
    for br in BRANCHES:
        for t in TICKETS:
            r = rows[(br, t)]
            for k in r["blockers"] + r["minors"]:
                out.append(f"- `{br}` {t} **{k}**: {r['evidence'][k]}")
    print("\n".join(out))


main()
