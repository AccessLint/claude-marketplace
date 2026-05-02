# AccessLint Plugin for Claude

A WCAG 2.2 accessibility toolkit for Claude Code that audits, diffs, and fixes a11y issues in HTML, components, and live pages — backed by the [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp) audit engine.

## Live-DOM auditing

Most accessibility issues only show up after JS runs (SPAs, web fonts, post-mount ARIA, real contrast). The `audit_live` tool handles this automatically — it auto-launches Chrome minimized in the background when no debug session is reachable, so no manual setup is required.

If you need to audit a page that requires an **existing authenticated browser session** (e.g. a logged-in app), install [`chrome-devtools-mcp`](https://github.com/ChromeDevTools/chrome-devtools-mcp) to reuse your open browser:

```bash
claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest
```

`playwright-mcp` and `puppeteer-mcp` also work for this use case.

**For static-site CI workflows**, use [`@accesslint/cli`](https://www.npmjs.com/package/@accesslint/cli) directly rather than the MCP.

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

The plugin is a thin orchestration layer over the AccessLint MCP. The MCP does the heavy lifting (rule engine, live-DOM audits, diffing); the plugin adds one focused skill.

### Skill — `accesslint:audit`

Two modes, picked from user intent:

- **Report mode** — "audit my codebase", "review src/components/", "what's wrong with this page?". Sweeps the scope, detects patterns across components, produces a prioritized written report. **No edits.**
- **Fix mode** — "fix the a11y issues in X", "make this accessible". Runs the audit → edit → verify loop, applying mechanical fixes verbatim and leaving `TODO`s for visual / contextual issues.

The skill picks among three flows:
1. **`audit_live`** — preferred for any URL. Auto-launches Chrome minimized if no debug session is running.
2. **`audit-live-page`** prompt — for existing authenticated browser sessions via chrome-devtools-mcp / playwright-mcp / puppeteer-mcp.
3. **`audit_html`** — for raw HTML strings, files, or rendered JSX.

Usage:
```ts
Skill({ skill: "accesslint:audit" })
```

For very large sweeps where main-thread context cost matters, invoke the skill via `Task` (general-purpose agent) for context isolation.

## MCP tools (provided by `@accesslint/mcp`)

When the plugin is installed, all of these are available to agents and skills, namespaced as `mcp__plugin_accesslint_accesslint__<tool>` when invoked.

### Live-DOM audit

- **`audit_live`** *(preferred)* — single-call live audit. Attaches to an existing Chrome debug session, or auto-launches Chrome minimized if none is reachable — no manual setup needed. Finds or opens a tab for the URL, pushes `@accesslint/core` into the page through `Runtime.evaluate` (CSP-bypassing, no CDN fetch from the page), runs the audit, and returns a small JSON result. The IIFE never enters the agent's conversation context. Override the endpoint with `cdp_endpoint` / `ACCESSLINT_CDP_ENDPOINT` / `ACCESSLINT_CDP_PORT`; pass `attach_existing: true` to require a pre-existing tab.
- **`audit_browser_script`** + **`audit_browser_collect`** — for auditing the user's **existing authenticated browser session** via a connected browser MCP (chrome-devtools-mcp, playwright-mcp, puppeteer-mcp). `audit_browser_script` returns a small (~1 KB) JS snippet that fetches `@accesslint/core` from `cdn.jsdelivr.net` and audits the page; `audit_browser_collect` parses the JSON the evaluate tool returned, validates the session token, and formats violations. Pass `inject: false` for repeat audits on the same session to skip re-fetching.

Both honor `rules` / `wcag` / `min_impact` / `format` filters. When auditing a React dev build (CRA, Next dev, Vite + React), violations include a `Source: <file>:<line> (Symbol)` line read from React DevTools fibers — the `audit` skill uses these to map violations back to JSX.

### HTML-string audit

- **`audit_html`** — audit an HTML string. Auto-detects fragments vs full documents. Used by the `audit-react-component` prompt to audit JSX after the agent renders it to a string. Accepts the same `rules` / `wcag` / `min_impact` / `format` / `include_aaa` / `component_mode` filters.

For file-on-disk or static-site CI use cases, use `Read` + `audit_html`, or use the [`@accesslint/cli`](https://www.npmjs.com/package/@accesslint/cli) package directly.

### Diffing & verification

- **`audit_diff`** — audit a target and diff against a baseline. Two modes: auto-managed (first call stores by `html`-hash or `audit_name`, subsequent calls diff) or explicit (`before: "<stored-audit-name>"` skips auto-storage and diffs directly against the named baseline). Use the explicit mode in fix loops where `audit_live` already captured the "before" state.

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

- **Perceivable** — alt text, semantic structure, color contrast, text spacing.
- **Operable** — keyboard navigation, focus management, focus visibility.
- **Understandable** — clear labels, language attributes, accessible authentication.
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
