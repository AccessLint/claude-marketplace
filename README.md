# AccessLint Plugin for Claude

A WCAG 2.2 accessibility toolkit for Claude Code, powered by [`@accesslint/core`](https://github.com/AccessLint/accesslint/tree/main/core). It covers the audit workflow end to end: automated scanning, semi-automated manual review, WCAG-EM assessment, remediation, and regression diffing.

## The pipeline

Five skills, each with one responsibility:

```
LOCATE                       ASSESS              REMEDIATE      GUARD
scan    (automated) ┐
                    ├─► review ───────────────► fix ────────► diff
inspect (manual)    ┘   (WCAG-EM)               (edit→verify)  (regression)
```

- **scan** — automated rule engine; finds mechanically-detectable violations.
- **inspect** — semi-automated manual checks the engine can't decide (keyboard, focus, reflow, names/roles/states).
- **review** — full WCAG-EM assessment; scopes, samples, runs both tiers, reports conformance.
- **fix** — remediation loop: audit, edit, verify.
- **diff** — reports only what a change introduced or fixed.

The methodology these skills follow is in [`plugins/accesslint/skills/shared/methodology.md`](plugins/accesslint/skills/shared/methodology.md).

## Live-DOM auditing

Most a11y violations only appear after JS runs. scan, diff, review, and fix reach the live DOM over CDP, auto-launching Chrome when no debug session is reachable — no manual setup. inspect drives the live page through a browser MCP (chrome-devtools, Playwright, or Puppeteer).

For pages that need an existing authenticated browser session, install a browser MCP:

```bash
claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest
```

`playwright-mcp` and `puppeteer-mcp` also work. For static-site CI, use [`@accesslint/cli`](https://www.npmjs.com/package/@accesslint/cli) directly (`accesslint scan <file-or-url>`).

## Installation

### Claude Code (marketplace plugin)

**Via CLI:**
```bash
claude plugin marketplace add accesslint/skills
claude plugin install accesslint@accesslint
```

**Or manually via config file:**
```json
{
  "plugins": [
    {
      "name": "accesslint",
      "source": {
        "source": "github",
        "repo": "accesslint/skills",
        "path": "plugins/accesslint"
      }
    }
  ]
}
```

### Claude Desktop / standalone (MCP server only)

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "npx",
      "args": ["-y", "@accesslint/mcp@latest"]
    }
  }
}
```

## Skills

### `accesslint:scan` — automated audit

Audits a live page and returns a worklist of WCAG violations: selector, `file:line (symbol)` when source mapping is available, evidence, and a fix directive. Locates; doesn't edit.

```ts
Skill({ skill: "accesslint:scan", args: "https://localhost:3000/dashboard" })
```

Pass a URL or a config target name in `args`, or omit it to use the default target. Optional flags: `--selector`, `--wait-for "<selector>"`, `--include-aaa`, `--disable <rules>`.

---

### `accesslint:inspect` — manual review

Drives a live page through the checks a rule engine can't decide: keyboard and focus order, accessible names/roles/states, reflow and zoom, reduced motion, form errors, target size. Grades each finding by evidence basis (verified / confirm-with-a-human / human-required) and severity. Locates and assesses; doesn't edit. Needs a browser MCP.

```ts
Skill({ skill: "accesslint:inspect", args: "https://localhost:3000/checkout" })
```

Use `inspect` to check whether a page is operable, not just lint-clean. It catches what `scan` can't.

---

### `accesslint:review` — WCAG-EM assessment

Runs a full assessment: defines scope, samples representative pages and flows, runs `scan` and `inspect` on each (one subagent per page), and produces a conformance report. States per-criterion conformance as pass, fail, or undetermined (needs a human).

```ts
Skill({ skill: "accesslint:review", args: "https://localhost:3000/" })
```

Use `review` for a whole product or a multi-page assessment. For a single page, `scan` or `inspect` is enough.

---

### `accesslint:fix` — remediate

Applies fixes: audit, edit, verify. Takes a target or a findings worklist from `scan` / `inspect` / `review`, applies mechanical fixes as given, leaves `TODO`s for visual or contextual judgment, and verifies by re-auditing. It only fixes.

```ts
Skill({ skill: "accesslint:fix", args: "src/components/Nav.tsx" })
```

For large remediations, invoke via `Task` for context isolation.

---

### `accesslint:diff` — differential audit

Audits a live page and diffs against a baseline, reporting only new violations, fixed violations, and a pre-existing count. Two modes:

- Stash mode (default) — stashes your uncommitted changes, captures a baseline, restores them, then audits. The working tree is fully restored.
- Branch mode — checks out the named branch for the baseline, then checks back. Pass `--branch [name]`; omit the name to use origin's default branch.

```ts
Skill({ skill: "accesslint:diff", args: "https://localhost:3000/" })
Skill({ skill: "accesslint:diff", args: "--branch main https://localhost:3000/" })
```

Use `--wait-for "<selector>"` when the dev server takes time to rebuild.

## MCP tools

The plugin bundles [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp). These tools back the skills — notably `fix`'s baseline and verify audits, and the rule metadata used across the toolkit — and are available directly to agents when the plugin is installed (namespaced as `mcp__plugin_accesslint_accesslint__<tool>`):

| Tool | Purpose |
|------|---------|
| `audit_live` | Live-DOM audit over CDP; auto-launches Chrome if needed |
| `audit_html` | Audit an HTML string or file |
| `list_rules` | List the active rule set |
| `explain_rule` | Metadata for one rule: WCAG criterion, fixability, remediation guidance |

See the [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp) package for the full tool reference.

## WCAG coverage

Level A and AA — perceivable (alt text, contrast, structure), operable (keyboard, focus), understandable (labels, language), robust (ARIA, accessible names). Run `list_rules` to see the active rule set in your installed version.

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [`@accesslint/mcp` source](https://github.com/AccessLint/accesslint/tree/main/mcp)
- [`@accesslint/mcp` on npm](https://www.npmjs.com/package/@accesslint/mcp)

## License

MIT
