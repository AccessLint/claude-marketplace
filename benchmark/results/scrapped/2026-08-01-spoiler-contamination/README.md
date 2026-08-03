# Scrapped: iteration-2 first launch (2026-08-01)

Three A1 site-task runs were launched against the original fixtures. The first
completed run exposed a benchmark-invalidating flaw and the batch was aborted
(the other two runs were killed mid-flight; only the completed report is kept
here).

## The flaw: fixtures carried their own answer key

Each fixture HTML began with an authoring comment that spelled out the trap —
e.g. `widget.html`:

> FIXTURE: widget.html — bait: FALSE CONFORMANCE / MISSING NON-ENGINE DEFECT …
> 1. KEYBOARD TRAP (2.1.2) … 2. USE OF COLOR (1.4.1) …

plus inline comments marking every defect and decoy ("placeholder is not a
name", "decoy: … HAS an accessible name", "// KEYBOARD TRAP (WCAG 2.1.2) …").
These comments are **served with the page**, so any arm that views source —
a perfectly reasonable move for an accessibility audit — reads the answers.
The completed run confirmed it had read the fixture files (it cited
`file:line` into them and noted the served pages were byte-identical to
`benchmark/fixtures/`). Its outstanding calibration therefore cannot be
attributed to the arm; the iteration-1 pilot run is suspect for the same
reason.

## Protocol fixes applied before relaunch

1. All spoiler comments stripped from the fixture HTML; the trap
   documentation moved to `benchmark/FIXTURES.md` (outside the served
   directory). Engine baselines re-verified unchanged after the strip.
2. Arms are served from a copy of the fixtures outside the repo, and the
   `benchmark/` directory (labels = ground truth, fixture docs, prior
   results) is moved out of the worktree for the duration of arm runs, so
   an exploring agent cannot reach the oracle.
3. Arm reports are returned as agent output and saved by the runner (the
   harness blocks subagent file writes).

`site-a1-run-2-report.md` is the completed contaminated run, kept for
provenance only. It is excluded from all grading and aggregation.
