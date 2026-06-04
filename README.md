# AccessLint Plugin for Claude

A WCAG 2.2 accessibility toolkit for Claude Code — live-DOM auditing, violation diffing, and codebase sweeps, powered by [`@accesslint/core`](https://github.com/AccessLint/accesslint/tree/main/core).

## Live-DOM auditing

Most a11y violations only surface after JS runs. The scan, diff, and audit skills auto-launch Chrome minimized via CDP when no debug session is reachable — no manual setup required.

For pages that need an **existing authenticated browser session**, install a browser MCP:

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

### `accesslint:scan` — Full audit

Audits a live page and returns a located worklist of WCAG violations: selector, `file:line (symbol)` when source mapping is available, evidence, and fix directive. Doesn't edit.

```ts
Skill({ skill: "accesslint:scan", args: "https://localhost:3000/dashboard" })
```

Pass a URL in `args`, or omit and the skill will ask. Optional flags: `--selector`, `--wait-for "<selector>"`, `--include-aaa`, `--disable <rules>`.

Use `scan` for a full picture. To see only what your changes introduced, use `diff`.

---

### `accesslint:diff` — Differential audit

Audits a live page and diffs against a baseline, reporting only **new violations**, **fixed violations**, and a pre-existing count. Two modes:

- **Stash mode** (default) — stashes your uncommitted changes, captures a baseline, restores your changes, then audits. Your working tree is fully restored.
- **Branch mode** — checks out the named branch to capture the baseline, then checks back out. Pass `--branch [name]`; omit the name to default to origin's default branch.

```ts
Skill({ skill: "accesslint:diff", args: "https://localhost:3000/" })
Skill({ skill: "accesslint:diff", args: "--branch main https://localhost:3000/" })
```

Use `--wait-for "<selector>"` when your dev server takes time to rebuild. Doesn't edit; for bulk fixes hand off to `accesslint:audit`.

---

### `accesslint:audit` — Report and fix

Two modes, picked from intent:

- **Report mode** — "audit my codebase", "what's wrong with this page?". Sweeps the scope, detects patterns, produces a prioritized written report. No edits.
- **Fix mode** — "fix the a11y issues in X", "make this accessible". Runs audit → edit → verify, applying mechanical fixes verbatim and leaving `TODO`s for visual/contextual issues.

```ts
Skill({ skill: "accesslint:audit" })
```

For large sweeps where context cost matters, invoke via `Task` (general-purpose agent) for context isolation.

## MCP tools

The plugin bundles [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp). These tools power the `audit` skill and are available directly to agents when the plugin is installed (namespaced as `mcp__plugin_accesslint_accesslint__<tool>`):

| Tool | Purpose |
|------|---------|
| `audit_live` | Single-call live-DOM audit via CDP; auto-launches Chrome if needed |
| `audit_html` | Audit an HTML string or file |
| `audit_diff` | Diff an audit against a stored baseline |
| `audit_browser_script` / `audit_browser_collect` | Audit via a connected browser MCP (for authenticated sessions) |
| `list_rules` | Enumerate the active rule set |
| `explain_rule` | Full metadata for one rule: WCAG criterion, fixability, remediation guidance |

See the [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp) package for the full tool reference.

## WCAG coverage

Level A and AA — perceivable (alt text, contrast, structure), operable (keyboard, focus), understandable (labels, language), robust (ARIA, accessible names). Run `list_rules` to enumerate the active rule set in your installed version.

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [`@accesslint/mcp` source](https://github.com/AccessLint/accesslint/tree/main/mcp)
- [`@accesslint/mcp` on npm](https://www.npmjs.com/package/@accesslint/mcp)

## License

MIT
