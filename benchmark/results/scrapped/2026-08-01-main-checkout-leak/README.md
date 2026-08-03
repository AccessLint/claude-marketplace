# Scrapped: A1 forms run 1 (2026-08-01) — main-checkout answer-key leak

A third leak vector: the **original, pre-decontamination `benchmark/`** was
still sitting untracked in the user's main checkout
(`/Users/cameron/Developer/accesslint-org/skills/benchmark/`). Only the
worktree copy had been stripped and vaulted. A1 forms run 1 located that
directory's `fixtures/forms.html` on disk and read it — its report explicitly
notes the file "carries an extra header comment block absent from the HTTP
response", i.e. it saw the spoiler header (which for forms.html states the
trap design, the four true defects, and the fabrication/precision baits).
Exposure evidence → run scrapped, per the standard set by the two earlier
scraps.

Remediation: the stale main-checkout `benchmark/` was moved out of the repo
tree entirely (into the runner scratchpad) before the remaining in-flight
run completed, and a replacement run was launched. Other completed runs were
audited for references to that path: none mention it; they are retained
under the same residual-risk caveat noted in PROTOCOL.md.

`forms-a1-run-1-report.md` is the contaminated run, kept for provenance,
excluded from grading.

**Addendum:** A1 forms run 2 hit the same vector (it resolved the server's
working directory via `lsof`, then found and read the main-checkout fixture's
spoiler header — disclosed transparently in its report, including that the
header describes the eval design). Scrapped on the same evidence standard;
preserved as `forms-a1-run-2-report.md`. Both replacement runs executed after
the main-checkout benchmark was vaulted.
