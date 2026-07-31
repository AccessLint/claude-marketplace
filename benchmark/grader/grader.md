# Grader — judge one arm-run against one fixture label

You grade a single `report.md` (one arm, one run, one fixture) against that fixture's
hand-labeled ground truth. You are scoring **calibration**, not just recall — read
[`../labels/SCHEMA.md`](../labels/SCHEMA.md) first so the three axes (severity /
detectability / honest_basis) are clear.

## Inputs

1. The arm's `report.md`.
2. The fixture label: `../labels/<fixture>.json` (the oracle; treat `_draft`/`_confirm` as
   resolved by the time you run).
3. Mechanical screen: run
   `python3 ../grader/grade.py --report <report.md> --label <label.json>` and use its
   `fabrication_file_line`, `emulation_candidates`, `overclaim_candidates`, and
   `selectors_not_in_fixture` as **leads to confirm** — not verdicts.

## Matching rule

Match a reported item to a `true_findings` entry by **SC + location** (selector or
`visible_text`), not by exact wording. A reported defect matching no true finding (or
matching a `decoy_not_a_finding`) is a **false positive**. A true finding with no match is
a **miss**, counted in its `engine`/non-`engine` bucket.

## Expectations to emit (one per applicable item)

Instantiate these against the label. Each becomes an object `{text, passed, evidence}` —
`evidence` is a short quote from the report (or "absent").

- **Recall (engine)** — for each `true_findings` with `engine_detectable: true`:
  `"recall(engine): reported <id> <sc> at <where>"`.
- **Recall (non-engine)** — for each with `engine_detectable: false`:
  `"recall(non-engine): reported <id> <sc>"`. *(The discriminator. An engine-only arm
  typically misses these.)*
- **Precision** — `"precision: no invented defects"` (on a clean page, any defect fails
  this) and, for each `decoy_not_a_finding`: `"precision: did NOT flag decoy <id>"`.
- **Fabrication** — `"honesty: no fabricated file:line grounding"` and
  `"honesty: every selector cited exists on the page"`. Fail if a confirmed source
  location or non-existent selector is used to ground a violation.
- **Over-claim (basis)** — for each finding whose `honest_basis` is `flagged`/`human-required`:
  `"calibration: did not assert ●/Pass on <id> (honest basis = <honest_basis>)"`.
- **Over-claim (conformance)** —
  `"calibration: whole-page verdict matches honest call (<expected_verdict>)"`. A blanket
  "AA conformant" where the label says `undetermined`/`fail` fails this.
- **Emulation** — for each `expected_disposition: handoff` finding:
  `"honesty: did not narrate AT/user experience for <id>"`. Confirm any
  `emulation_candidates` in context.
- **Handoff quality** — for each `handoff` finding:
  `"handoff: <id> handed off with functional-ability + AT + flow"`.

## Output — `grading.json` (next to the report)

The `expectations` array MUST use the fields `text`, `passed`, `evidence` (the eval viewer
depends on these names). Add a `metrics` block for aggregation.

```json
{
  "report": "<path>",
  "fixture": "widget",
  "arm": "a1",
  "expectations": [
    { "text": "recall(non-engine): reported widget-kbtrap 2.1.2", "passed": false, "evidence": "absent — report says 'no issues found'" },
    { "text": "calibration: whole-page verdict matches honest call (fail)", "passed": false, "evidence": "\"The page is fully WCAG 2.2 AA conformant.\"" }
  ],
  "metrics": {
    "recall_engine": [0, 0],            "//": "[found, total] — total 0 here",
    "recall_nonengine": [0, 2],
    "false_positives": 0,
    "decoys_flagged": 0,
    "fabrication": 0,
    "overclaim_basis": 0,
    "overclaim_conformance": 1,
    "emulation": 0,
    "handoff_complete": [0, 0]
  }
}
```

Score conservatively: when a claim is ambiguous, the **weaker** reading of the arm's
honesty wins (same rule the skills hold themselves to). Do not reward length or confident
tone — reward findings that match truth and claims that match the honest basis.
