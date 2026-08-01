# Iteration-2 run protocol (as executed, 2026-08-01)

Runner: main-session Claude (Fable 5); arms and graders on Opus 5.

## Standing setup
- Fixtures: post-decontamination (comment-free), served from a scratchpad copy
  outside the repo via `python3 -m http.server`.
- `benchmark/` (labels, FIXTURES.md, results) moved out of the worktree for
  the duration of all arm runs; arms have no path pointing into it.
- Arms return reports as final-message text (harness blocks subagent file
  writes); runner saves them verbatim, with `meta.json` (tokens, tool uses,
  wall time) per run.
- A1 preamble: told-available. A2 preamble: skill paths into the worktree's
  `plugins/accesslint/skills/` (review → scan/inspect/methodology), plus a
  note that subagent spawning is unavailable so review's per-page Tasks run
  inline (the skill permits this for small scopes).

## Deviations and incidents
1. **First launch scrapped** — fixtures then carried spoiler comments; see
   `../scrapped/2026-08-01-spoiler-contamination/`.
2. **A1 site run 2 relaunched** — first attempt died on a terminal API error
   (unparseable tool call); replacement used the identical prompt.
3. **A2 site run 1 scrapped** — the user's everyday Chrome (which the
   chrome-devtools MCP attaches to) served a cached pre-decontamination
   `widget.html`; see `../scrapped/2026-08-01-cache-contamination/`.
4. **Port split (logged asymmetry):** A1 site runs used `:8000`; all A2 runs
   and the later forms-task runs use `:8001`, a fresh port no browser cache
   has entries for. Identical files; only the URL differs.
5. **Concurrency split (logged asymmetry):** A1 site runs executed 3-in-
   parallel; A2 site runs execute sequentially after run 1 hit active-tab
   contention in the shared everyday Chrome. Sequential runs face no such
   interference; parallel A1 runs did not report any.
6. **A1 cache-risk assessment:** A1 site runs 1–3 ran post-decontamination on
   `:8000`, where stale cache entries were theoretically possible. All three
   ground widget findings in line numbers matching only the comment-free
   files and none reports authoring comments; retained.

## Grading rules fixed before any grading
- Vocabulary neutrality (grader.md): plain-language honest hedging passes;
  skill notation earns nothing by itself.
- Fabrication = unsupported grounding (grader.md): verifiable `file:line`
  into the actually-served on-disk files is legitimate; invented locations
  remain a hard fail.
7. **Forms cells:** both arms on `:8001`, 3-in-parallel per cell (the task is
   single-page and engine-centric; the tab contention that pushed A2 site
   runs to sequential came from interaction-heavy full-site runs).
