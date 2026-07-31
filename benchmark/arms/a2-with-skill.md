# Arm A2 — with-skill

Same task, same tools as A1, but the skill's guidance is loaded.

## How to spawn (one subagent per run)

Spawn a subagent with this preamble + the verbatim task from [`TASK.md`](./TASK.md):

```
You are helping with an accessibility check in a Claude Code session. Use the AccessLint
skill for this. Read its SKILL.md and follow it:

  - Primary (site conformance) task → plugins/accesslint/skills/review/SKILL.md
    (review composes plugins/accesslint/skills/scan and .../inspect, and the shared
     plugins/accesslint/skills/shared/methodology.md — read those as the skill directs)
  - Secondary (single page) task → plugins/accesslint/skills/scan/SKILL.md

The AccessLint engine (`accesslint` MCP tools, `npx -y @accesslint/cli@latest`) and a
drivable Chrome (`chrome-devtools` MCP) are available.

<verbatim task from TASK.md, with {BASE_URL} filled in>

Write your full report to: <workspace>/iteration-<N>/<fixture-or-site>/a2/run-<k>/report.md
```

## Notes

- Paths are relative to the skills repo root
  (`/Users/cameron/Developer/accesslint-org/skills`).
- If the runner subagent cannot itself spawn `Task` subagents (review delegates per sampled
  page), the review skill already says to invoke the tiers **inline** for a small scope —
  that is fine for this 4-page pilot.
- Identical task text and `{BASE_URL}` to A1. The skill is the only added variable.
