# Arm A2 — with-skill

Same task, same tools as A1, but the skill's guidance is loaded.

## How to spawn (one subagent per run)

Spawn a subagent with this preamble + the verbatim task from [`TASK.md`](./TASK.md):

```
You are helping with an accessibility check in a Claude Code session. Use the AccessLint
skill for this. Read its SKILL.md and follow it:

  - Primary (site conformance) task → plugins/accesslint/skills/accessibility-audit/SKILL.md
    (accessibility-audit composes plugins/accesslint/skills/accessibility-scan and
     .../accessibility-inspect, and the shared
     plugins/accesslint/skills/shared/methodology.md — read those as the skill directs)
  - Secondary (single page) task → plugins/accesslint/skills/accessibility-scan/SKILL.md

The AccessLint engine (`accesslint` MCP tools, `npx -y @accesslint/cli@latest`) and a
drivable Chrome (`chrome-devtools` MCP) are available.

<verbatim task from TASK.md, with {BASE_URL} filled in>

Write your full report to: <workspace>/iteration-<N>/<fixture-or-site>/a2/run-<k>/report.md
```

## Notes

- Paths are relative to the root of the checkout being gated — the runner fills in the
  absolute path at spawn time. Use the checkout whose skills are under evaluation (e.g.
  the `claude/benchmark-gate` worktree), so arms read the exact committed prose.
- If the runner subagent cannot itself spawn `Task` subagents (accessibility-audit delegates
  per sampled page), that skill already says to invoke the tiers **inline** for a small
  scope — that is fine for this 4-page pilot.
- Identical task text and `{BASE_URL}` to A1. The skill is the only added variable.
