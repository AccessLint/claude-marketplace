# Scrapped: A2 site run 1 (2026-08-01) — browser-cache contamination

The chrome-devtools MCP in this environment attaches to the user's everyday
Chrome. That profile had loaded the fixtures **before** decontamination, so
its HTTP cache still held the spoiler-comment revision of `widget.html` — and
served it to the arm mid-run. The agent noticed, disclosed it, disabled the
cache, and re-verified everything against current content, but by the
standard applied to the first scrapped batch, any answer-key exposure voids
the run.

Protocol fix: fixtures re-served on a **fresh port (8001)** — a URL no
browser has ever cached — and A2 runs relaunched sequentially (the parallel
A2 runs also fought over the shared everyday-Chrome active tab, which this
run reported breaking its first interaction attempts).

A1 site runs 1–3 (which ran after decontamination on :8000) were audited for
the same exposure: all three ground their widget findings in line numbers
that only match the comment-free files, none reports seeing authoring
comments, and their interaction evidence comes from live-DOM traversal that
does not surface comment nodes. They are retained, with this residual risk
noted here.

`site-a2-run-1-report.md` is the contaminated run, kept for provenance only,
excluded from grading. Its non-benchmark observations remain useful: it
found the cached-revision hazard itself, worked around everyday-Chrome tab
contention by switching to a dedicated headless CDP session, and its report
is a strong sample of the review skill's WCAG-EM output shape.
