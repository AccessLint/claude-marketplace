# AccessLint Plugin for Claude

A WCAG 2.2 accessibility toolkit for Claude Code that audits, diffs, and fixes a11y issues in HTML, components, and live pages — backed by the [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp) audit engine.

## Installation

### Claude Code (marketplace plugin)

**Via CLI:**
```bash
claude plugin marketplace add accesslint/claude-marketplace
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
        "repo": "accesslint/claude-marketplace",
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

See the [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp) package for the latest version and full tool reference.

## What's in the box

The plugin is a thin orchestration layer over the AccessLint MCP. The MCP does the heavy lifting (rule engine, live-DOM audits, diffing); the plugin adds one focused agent and one focused skill.

### Agent — `accesslint:reviewer`

Multi-file accessibility code reviewer. Use it when you want a **codebase-wide sweep** with pattern detection and a prioritized written report.

Usage:
```ts
Task({
  subagent_type: "accesslint:reviewer",
  prompt: "Audit src/components/ for accessibility issues"
})
```

For one file or one URL, skip the agent — invoke the MCP audit tools directly or use the `audit-and-fix` skill.

### Skill — `accesslint:audit-and-fix`

Closes the audit → edit → verify loop. Two flows:

- **Live DOM (preferred)** — when a browser MCP (chrome-devtools-mcp, playwright-mcp, puppeteer-mcp) is connected, delegates to the `audit-live-page` MCP prompt with `mode: "fix"`. The prompt navigates, injects the audit IIFE, evaluates in-page, collects results, maps violations back to source, and applies edits.
- **Static fallback** — without a browser MCP, uses `audit_diff` to baseline, applies mechanical fixes via `Edit`, and re-audits to verify.

> **Recommended companion**: install [`chrome-devtools-mcp`](https://github.com/joshuaalpuerto/chrome-devtools-mcp) (or another browser MCP exposing navigate + evaluate) to unlock the live-DOM flow. The skill works without one — it falls back to static audit — but live-DOM catches SPA-rendered content, web-font contrast, and post-mount ARIA state that source alone can't show.

Usage:
```ts
Skill({ skill: "accesslint:audit-and-fix" })
```

## MCP tools (provided by `@accesslint/mcp`)

When the plugin is installed, all of these are available to agents and skills, namespaced as `mcp__plugin_accesslint_accesslint__<tool>` when invoked.

### Static audit

- **`audit_html`** — audit an HTML string. Auto-detects fragments vs full documents.
- **`audit_file`** — read an HTML file and audit it (inlines referenced CSS).
- **`audit_url`** — fetch a URL and audit it (no JS execution).

All three accept:
- `format: "verbose" | "compact"` — compact emits one violation per line; default verbose.
- `rules: string[]` / `wcag: string[]` — restrict to specific rule IDs or WCAG criteria.
- `min_impact`, `include_aaa`, `component_mode`.

### Live-DOM audit (paired)

- **`audit_browser_script`** — returns a JS function expression to paste into your browser MCP's evaluate tool. Includes the `@accesslint/core` IIFE inline by default.
- **`audit_browser_collect`** — parses the JSON your browser MCP's evaluate tool returned, validates the session token, stores under a name for later diffing, and formats violations.

Use these when the page renders content with JS (SPAs, dynamic ARIA state, post-mount focus). Honors the same `rules` / `wcag` / `format` filters as the static tools.

### Diffing & verification

- **`audit_diff`** — single-call audit with auto-managed baseline. First call returns the audit and stores it; subsequent calls return only the diff. Accepts `path`, `html`, `url`, or `audit_name` (to diff a previously-collected audit).
- **`diff_html`** — compare a new HTML string against a previously-named audit. Lower-level than `audit_diff`.
- **`quick_check`** — single-line PASS/FAIL summary. For "am I clean yet?" probes during a fix loop.

### Discovery

- **`list_rules`** — discover the active rule set, optionally filtered by `category`, `level`, `fixability`, or `wcag` criterion. Supports compact output.
- **`explain_rule`** — full metadata for one rule by ID: description, WCAG criteria, level, fixability, browser hint, remediation guidance.

### Prompts

- **`audit-live-page`** — end-to-end live-page audit orchestrator. Composes with any browser MCP that exposes navigate + evaluate. Two modes: `plan` (default — produces a written plan grouped by component) or `fix` (applies edits to source).
- **`audit-react-component`** — guidance for rendering JSX/TSX components to HTML before auditing.

## Local development

To iterate on the upstream MCP without republishing every change, override the plugin's `.mcp.json` locally via `~/.claude/settings.local.json` (already gitignored):

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "node",
      "args": ["/absolute/path/to/accesslint/mcp/bin/accesslint-mcp.js"]
    }
  }
}
```

Build the upstream first (`bun run build` in the mcp directory) so `dist/index.js` reflects your changes.

## WCAG coverage

Level A and AA conformance, including:

- **Perceivable** — alt text, semantic structure, color contrast, non-text contrast.
- **Operable** — keyboard navigation, focus management, focus visibility.
- **Understandable** — clear labels, error identification, consistent behavior.
- **Robust** — proper ARIA usage, accessible names and roles.

Run `list_rules` to enumerate the active rule set in your installed MCP version.

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [`@accesslint/mcp` source](https://github.com/AccessLint/accesslint/tree/main/mcp)
- [`@accesslint/mcp` on npm](https://www.npmjs.com/package/@accesslint/mcp)

## License

MIT
