#!/usr/bin/env python3
"""Four-arm results for v1.2, from evidence/. Same counting as demo/tally3.py: one finding per
failed checklist item per ticket, plus a B1 when a spec passed with its feature broken.

    python3 demo/tally4.py

Held-out tickets 06-08 only: baseline, baseline-plus-rules and with-setup from round 3,
ai-conventions from round 4. Then ai-conventions against baseline-plus-rules, ticket by ticket.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent / "evidence"
ARMS = ["baseline", "ai-conventions", "baseline-plus-rules", "with-setup"]
ROUNDS = {"baseline": "3", "baseline-plus-rules": "3", "with-setup": "3", "ai-conventions": "4"}
TICKETS = ["06", "07", "08"]


def load():
    rows = {}
    for line in (ROOT / "reviews" / "key.tsv").read_text().splitlines():
        rid, arm, ticket, rnd = line.split("\t")
        if ticket not in TICKETS or ROUNDS.get(arm) != rnd:
            continue
        review = json.loads((ROOT / "reviews" / f"round-{rnd}" / f"{rid}.json").read_text())
        failed = {i["id"]: i["evidence"] for i in review["structured_output"]["items"] if i["verdict"] == "failed"}
        runs = (ROOT / "runs" / f"round-{rnd}" / f"{arm}-{ticket}.txt").read_text()
        caught = "broken feature caught: yes" in runs
        if not caught and "B1" not in failed:
            failed["B1"] = "Added from the broken-feature check: the spec passed with the feature broken."
        rows[(arm, ticket)] = {
            "id": rid,
            "round": rnd,
            "blockers": sorted((k for k in failed if k.startswith("B")), key=lambda k: int(k[1:])),
            "minors": sorted((k for k in failed if k.startswith("M")), key=lambda k: int(k[1:])),
            "evidence": failed,
            "runs": int(re.search(r"runs: (\d)/3", runs).group(1)),
            "caught": caught,
        }
    return rows


def ids(keys):
    return f" ({', '.join(keys)})" if keys else ""


def totals(rows, arm):
    b = sum(len(rows[(arm, t)]["blockers"]) for t in TICKETS)
    m = sum(len(rows[(arm, t)]["minors"]) for t in TICKETS)
    g = sum(rows[(arm, t)]["runs"] == 3 for t in TICKETS)
    c = sum(rows[(arm, t)]["caught"] for t in TICKETS)
    return b, m, g, c


def main():
    rows = load()
    out = ["### Held-out tickets 06 to 08, four arms\n"]
    for t in TICKETS:
        out += [f"#### Ticket {t}\n", "| Arm | Blockers | Minors | 3x runs | Caught the broken feature | Review |", "| --- | --- | --- | --- | --- | --- |"]
        for a in ARMS:
            r = rows[(a, t)]
            out.append(f"| `{a}` | {len(r['blockers'])}{ids(r['blockers'])} | {len(r['minors'])}{ids(r['minors'])} | {r['runs']}/3 | {'yes' if r['caught'] else 'no'} | `{r['id']}` (round {r['round']}) |")
        out.append("")
    out += ["#### Totals\n", "| Arm | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |", "| --- | --- | --- | --- | --- | --- |"]
    for a in ARMS:
        b, m, g, c = totals(rows, a)
        out.append(f"| `{a}` | {b} | {m} | {b + m} | {g}/{len(TICKETS)} | {c}/{len(TICKETS)} |")

    wb, wm, wg, _ = totals(rows, "with-setup")
    for other in ("baseline", "ai-conventions", "baseline-plus-rules"):
        ob, om, _, _ = totals(rows, other)
        zero, half, green = wb == 0, (wb + wm) <= (ob + om) / 2, wg == len(TICKETS)
        out.append(
            f"\nPass rule, `with-setup` against `{other}`: zero blockers {'yes' if zero else 'NO'}; "
            f"at most half its findings ({wb + wm} vs {ob + om}) {'yes' if half else 'NO'}; "
            f"green 3/3 {'yes' if green else 'NO'}. **{'PASS' if zero and half and green else 'FAIL'}**"
        )

    out += ["", "### `ai-conventions` against `baseline-plus-rules`\n",
            "| Ticket | `ai-conventions` | `baseline-plus-rules` |", "| --- | --- | --- |"]
    for t in TICKETS:
        cells = []
        for a in ("ai-conventions", "baseline-plus-rules"):
            r = rows[(a, t)]
            failed = r["blockers"] + r["minors"]
            cells.append(f"{len(r['blockers'])} + {len(r['minors'])}{ids(failed)}, {r['runs']}/3, caught {'yes' if r['caught'] else 'no'}")
        out.append(f"| {t} | {cells[0]} | {cells[1]} |")
    ab, am, _, _ = totals(rows, "ai-conventions")
    pb, pm, _, _ = totals(rows, "baseline-plus-rules")
    out.append(f"| Total | {ab} + {am} = {ab + am} | {pb} + {pm} = {pb + pm} |")

    out += ["", "### Every failed item, `ai-conventions`\n"]
    for t in TICKETS:
        r = rows[("ai-conventions", t)]
        for k in r["blockers"] + r["minors"]:
            out.append(f"- `ai-conventions` {t} **{k}**: {r['evidence'][k]}")
    print("\n".join(out))


main()
