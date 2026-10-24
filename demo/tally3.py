#!/usr/bin/env python3
"""Three-arm results for v1.1, from evidence/. Same counting as demo/tally.py: one finding per
failed checklist item per ticket, plus a B1 when a spec passed with its feature broken.

    python3 demo/tally3.py

Held-out tickets 06-08: every arm from round 3. Tickets 01-05: baseline round 1, with-setup
round 2, baseline-plus-rules round 3 (reviewed with the whole diff; rounds 1-2 saw e2e/ only).
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parent.parent / "evidence"
ARMS = ["baseline", "baseline-plus-rules", "with-setup"]
ROUNDS_01_05 = {"baseline": "1", "with-setup": "2", "baseline-plus-rules": "3"}


def load():
    rows = {}
    for line in (ROOT / "reviews" / "key.tsv").read_text().splitlines():
        rid, arm, ticket, rnd = line.split("\t")
        held_out = int(ticket) >= 6
        if (held_out and rnd != "3") or (not held_out and ROUNDS_01_05.get(arm) != rnd):
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


def block(rows, tickets, title):
    out = [f"### {title}\n"]
    for t in tickets:
        out += [f"#### Ticket {t}\n", "| Arm | Blockers | Minors | 3x runs | Caught the broken feature | Review |", "| --- | --- | --- | --- | --- | --- |"]
        for a in ARMS:
            r = rows[(a, t)]
            out.append(f"| `{a}` | {len(r['blockers'])}{ids(r['blockers'])} | {len(r['minors'])}{ids(r['minors'])} | {r['runs']}/3 | {'yes' if r['caught'] else 'no'} | `{r['id']}` (round {r['round']}) |")
        out.append("")
    out += ["#### Totals\n", "| Arm | Blockers | Minors | Findings | Green 3/3 | Caught the broken feature |", "| --- | --- | --- | --- | --- | --- |"]
    tot = {}
    for a in ARMS:
        b = sum(len(rows[(a, t)]["blockers"]) for t in tickets)
        m = sum(len(rows[(a, t)]["minors"]) for t in tickets)
        g = sum(rows[(a, t)]["runs"] == 3 for t in tickets)
        c = sum(rows[(a, t)]["caught"] for t in tickets)
        tot[a] = (b, m, g)
        out.append(f"| `{a}` | {b} | {m} | {b + m} | {g}/{len(tickets)} | {c}/{len(tickets)} |")
    wb, wm, wg = tot["with-setup"]
    for other in ("baseline", "baseline-plus-rules"):
        ob, om, _ = tot[other]
        zero, half, green = wb == 0, (wb + wm) <= (ob + om) / 2, wg == len(tickets)
        out.append(
            f"\nPass rule, `with-setup` against `{other}`: zero blockers {'yes' if zero else 'NO'}; "
            f"at most half its findings ({wb + wm} vs {ob + om}) {'yes' if half else 'NO'}; "
            f"green 3/3 {'yes' if green else 'NO'}. **{'PASS' if zero and half and green else 'FAIL'}**"
        )
    out.append("")
    return out


def main():
    rows = load()
    out = block(rows, ["06", "07", "08"], "Held-out tickets 06 to 08")
    out += block(rows, ["01", "02", "03", "04", "05"], "Tickets 01 to 05")
    out.append("### Every failed item\n")
    for t in ["06", "07", "08", "01", "02", "03", "04", "05"]:
        for a in ARMS:
            r = rows[(a, t)]
            for k in r["blockers"] + r["minors"]:
                out.append(f"- `{a}` {t} **{k}**: {r['evidence'][k]}")
    print("\n".join(out))


main()
