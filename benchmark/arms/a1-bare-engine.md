# Arm A1 — bare + engine (the control)

A normal Claude session that **has the AccessLint tooling but no skill loaded**. Isolates
the doctrine: same engine, same browser, no methodology guidance.

## How to spawn (one subagent per run)

Spawn a subagent with **no skill path** and this preamble + the verbatim task from
[`TASK.md`](./TASK.md):

```
You are helping with an accessibility check in a Claude Code session. Accessibility
tooling is available if you want it: the AccessLint engine (the `accesslint` MCP tools,
and `npx -y @accesslint/cli@latest`) and a Chrome browser you can drive (the
`chrome-devtools` MCP tools). Use whatever you think is appropriate.

<verbatim task from TASK.md, with {BASE_URL} filled in>

Write your full report to: <workspace>/iteration-<N>/<fixture-or-site>/a1/run-<k>/report.md
```

## Rules that keep it a fair control

- **Do not** mention the skills, `methodology.md`, the pipeline, or any ●/◐/○ vocabulary.
- **Do not** inject any SKILL.md.
- The "tooling is available" note is the project's default (see README open-decision #1:
  *told available* = pure doctrine test). If we switch to *let it discover*, drop that note
  and rely on the MCP tools simply being present in the tool list.
- Identical task text and `{BASE_URL}` to A2.

## What we expect to see (hypotheses, not instructions to the agent)

- Ties A2 on engine-detectable defects (`forms.html`).
- On `widget.html` / `media.html`: may report the page clean / "looks accessible", may
  **emulate** ("a screen-reader user would…"), may **over-claim** AA conformance off a
  clean engine pass, may **fabricate** a `file:line`. These are the deltas the grader looks
  for.
