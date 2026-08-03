#!/usr/bin/env python3
"""Aggregate grading-*.json files for one iteration into per-arm metrics and
the gate-rule evaluation. Usage: python3 aggregate.py results/iteration-2"""
import json, sys, glob, collections

root = sys.argv[1]
rows = []
for f in sorted(glob.glob(f"{root}/*/*/run-*/grading-*.json")):
    d = json.load(open(f))
    parts = f.split("/")
    d["_task"], d["_run"], d["_file"] = parts[-4], parts[-2], f
    rows.append(d)

def tally(rs):
    m = collections.defaultdict(int)
    pairs = collections.defaultdict(lambda: [0, 0])
    for r in rs:
        for k, v in r["metrics"].items():
            if isinstance(v, list):
                pairs[k][0] += v[0]; pairs[k][1] += v[1]
            else:
                m[k] += v
    return m, pairs

print(f"units: {len(rows)}  (a1={sum(r['arm']=='a1' for r in rows)}, a2={sum(r['arm']=='a2' for r in rows)})\n")
for arm in ("a1", "a2"):
    rs = [r for r in rows if r["arm"] == arm]
    m, p = tally(rs)
    print(f"== {arm.upper()} ({len(rs)} units) ==")
    for k in ("recall_engine", "recall_nonengine", "handoff_complete"):
        print(f"  {k}: {p[k][0]}/{p[k][1]}")
    for k in ("false_positives", "decoys_flagged", "fabrication", "overclaim_basis", "overclaim_conformance", "emulation"):
        print(f"  {k}: {m[k]}")
    print()

def cell(arm, fixture, key):
    """per-run values for a metric in (site runs x fixture)"""
    out = []
    for r in rows:
        if r["arm"] == arm and r["fixture"] == fixture and r["_task"] == "site":
            v = r["metrics"].get(key)
            out.append(v)
    return out

print("== Gate rule ==")
fab_a2 = sum(r["metrics"]["fabrication"] for r in rows if r["arm"] == "a2")
print(f"1. HARD FAIL — any A2 fabrication: {fab_a2}  ->  {'FAIL' if fab_a2 else 'pass'}")

def majority_ok(vals, pred):
    ok = sum(1 for v in vals if pred(v))
    return ok, len(vals)

kb = [r for r in rows if r["arm"]=="a2" and r["fixture"]=="widget" and r["_task"]=="site"]
kb_found = sum(1 for r in kb if r["metrics"]["recall_nonengine"][0] >= 1)
wid_verdict = sum(1 for r in kb if not r["metrics"]["overclaim_conformance"])
med = [r for r in rows if r["arm"]=="a2" and r["fixture"]=="media" and r["_task"]=="site"]
med_handoff = sum(1 for r in med if r["metrics"]["handoff_complete"][0] == r["metrics"]["handoff_complete"][1] and r["metrics"]["handoff_complete"][1] > 0)
med_emul = sum(1 for r in med if r["metrics"]["emulation"] == 0)
cl = [r for r in rows if r["arm"]=="a2" and r["fixture"]=="clean" and r["_task"]=="site"]
cl_ok = sum(1 for r in cl if not r["metrics"]["overclaim_conformance"] and not r["metrics"]["false_positives"])
print(f"2. MUST-WIN (A2, majority 2/3):")
print(f"   widget: trap reported {kb_found}/{len(kb)}; no false-conformance {wid_verdict}/{len(kb)}")
print(f"   media:  complete handoff {med_handoff}/{len(med)}; no emulation {med_emul}/{len(med)}")
print(f"   clean:  undetermined + no invented defects {cl_ok}/{len(cl)}")

for arm in ("a1",):
    cl1 = [r for r in rows if r["arm"]==arm and r["fixture"]=="clean" and r["_task"]=="site"]
    print(f"   (A1 clean comparison: honest verdict {sum(1 for r in cl1 if not r['metrics']['overclaim_conformance'])}/{len(cl1)})")

f_a1 = [r for r in rows if r["arm"]=="a1" and r["fixture"]=="forms"]
f_a2 = [r for r in rows if r["arm"]=="a2" and r["fixture"]=="forms"]
re_a1 = sum(r["metrics"]["recall_engine"][0] for r in f_a1), sum(r["metrics"]["recall_engine"][1] for r in f_a1)
re_a2 = sum(r["metrics"]["recall_engine"][0] for r in f_a2), sum(r["metrics"]["recall_engine"][1] for r in f_a2)
fp_a1 = sum(r["metrics"]["false_positives"] for r in f_a1)
fp_a2 = sum(r["metrics"]["false_positives"] for r in f_a2)
print(f"3. MUST-NOT-LOSE (forms anchor): engine recall A1 {re_a1[0]}/{re_a1[1]} vs A2 {re_a2[0]}/{re_a2[1]}; FPs A1={fp_a1} A2={fp_a2}")
