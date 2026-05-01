# Changelog

All notable changes to the AccessLint Claude plugin are documented here.

## [0.4.1] - 2026-05-01

### Changed
- `audit_live` now auto-launches Chrome minimized when no debug session is reachable — no `--remote-debugging-port` setup required. The fallback chain is: attach to existing CDP session → auto-launch Chrome → chrome-devtools-mcp (for existing authenticated sessions).
- Skill prerequisite check removed; the skill no longer stops to ask users to start Chrome manually.
- Fixed WCAG coverage claims in README to match the actual rule set: "non-text contrast" corrected to "text spacing" (WCAG 1.4.12); "error identification" / "consistent behavior" corrected to "language attributes" / "accessible authentication".

## [0.4.0] - 2026-05-01

### Changed
- Collapsed the reviewer agent and `audit-and-fix` skill into a single `accesslint:audit` skill with two intent-driven modes:
  - **Report mode** — sweeps a scope (directory, files, or URL), detects patterns across components, produces a prioritized written report. No edits.
  - **Fix mode** — runs the audit → edit → verify loop, applying mechanical fixes verbatim and leaving `TODO`s for visual/contextual issues.
- `audit_file` and `audit_url` MCP tools removed upstream; `audit_html` and `audit_live` remain as the primary audit paths alongside `audit_browser_script` + `audit_browser_collect`.
- For large sweeps where context cost matters, the skill can now be invoked via Claude Code's built-in `Task` tool for context isolation.

## [0.3.4] - 2026-04-26

### Changed
- Pairs with `@accesslint/mcp@0.6.0`: violation `Source:` lines now always resolve to real source files rather than bundled chunk URLs. Source map schema simplified — `strategy`/`confidence` replaced by `ownerDepth`.

## [0.3.3] - 2026-04-25

### Changed
- Skill now prefers `Source:` lines over selector grep when mapping live-DOM violations back to source components — more reliable on React dev builds where fiber data is available.
- Refreshed marketplace description.

## [0.3.2] - 2026-04-25

### Changed
- Tracks `@accesslint/mcp@latest` instead of a pinned version so users always get the current engine without a plugin bump.

## [0.3.1] - 2026-04-25

### Changed
- Pairs with `@accesslint/mcp@0.4.1`: audit IIFE is now fetched from CDN at audit time rather than bundled in the MCP server, keeping the MCP package size small.
- Tightened `audit-and-fix` skill preamble; added note about `chrome-devtools-mcp` as a companion for live-DOM audits.

## [0.3.0] - 2026-04-25

### Changed
- Slimmed plugin to an `audit-and-fix` skill and a multi-file reviewer agent, both backed by `@accesslint/mcp` from npm.
- Removed the bundled MCP server; MCP is now sourced from `@accesslint/mcp@latest` via npx.
- Updated WCAG references from 2.1 to 2.2 throughout.

## [0.1.1] - 2026-04-01

### Added
- Initial release: contrast checker skill, use-of-color skill, link-purpose skill, refactor skill, and a multi-file accessibility reviewer agent.
- Bundled MCP server with color contrast check.
