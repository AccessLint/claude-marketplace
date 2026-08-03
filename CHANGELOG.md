# Changelog

All notable changes to the AccessLint Claude plugin are documented here.

## [0.9.1] - 2026-08-02

### Changed
- Doctrine: a finding that stacks a deterministic fact on an interpretive call takes the lower evidence grade. The machine-checkable half (e.g. no programmatic status in the accessibility tree — a 1.3.1 fact) may be stated ● verified; the conclusion drawn from it (e.g. that color is the sole carrier of the meaning — 1.4.1) stays ◐ flagged, and citing the deterministic half does not upgrade the whole. Added to `shared/methodology.md` (with status dots as the worked example) and to `accessibility-inspect`'s grading rules and 1.4.1 checkpoint. This is the repair-loop fix from the iteration-2 calibration benchmark: with it, all three re-run audit arms held the color-only finding at ◐ (previously ● in 3/3) and the benchmark gate passed — see `benchmark/results/iteration-2/REPORT.md` §8.

## [0.9.0] - 2026-08-02

### Added
- `plugins/accesslint/.claude-plugin/plugin.json` — the plugin had no manifest, so Claude Code fell back to deriving the plugin name from the install directory. Skills were namespaced by the version string (`0.8.0:scan`) instead of the brand (`accesslint:scan`), and no documented invocation worked as written. The manifest pins `name`, `displayName`, `version`, `license`, and discovery `keywords`.
- `keywords`, `category`, `license`, `homepage`, and `repository` on the marketplace entry, for marketplace and directory search.
- `accessibility-inspect` skill — the semi-automated manual tier. Drives a live page through a browser MCP to check what the rule engine can't decide (keyboard and focus order, accessible names/roles/states, reflow and zoom, reduced motion, form errors, target size), grading each finding by evidence basis (verified / confirm-with-a-human / human-required) and severity. Locates and assesses; does not edit. Requires a browser MCP (`chrome-devtools`, `playwright`, or `puppeteer`).
- `accessibility-audit` skill — the WCAG-EM conformance umbrella. Defines scope, selects a representative sample, runs `accessibility-scan` and `accessibility-inspect` on each sampled page (one subagent per page), and reports per-criterion conformance as pass, fail, or undetermined (needs a human).
- `shared/methodology.md` — a single shared canon for the methodology: the pipeline, WCAG-EM, the severity and evidence-basis grading, the no-proxy-for-human-experience boundary, conformance, and grounding. Each skill states its always-apply rules inline and references the canon for depth.

### Changed
- **Breaking:** every skill is renamed with an `accessibility-` prefix — `accessibility-scan`, `accessibility-inspect`, `accessibility-audit`, `accessibility-fix`, `accessibility-diff`. Skill directories index and search on the name, not the description, so the previous bare verbs (`scan`, `fix`, `diff`) matched no accessibility query and collided with unrelated skills of the same name. Update invocations to `accesslint:accessibility-<verb>`.
- **Breaking:** the old `audit` skill is reduced to remediation and renamed `accessibility-fix` (baseline → edit → verify). The audit name now belongs to `accessibility-audit`, the WCAG-EM conformance umbrella and the closest successor to the old report mode. Use `accessibility-fix` to remediate; `accessibility-audit` finds issues but assesses a sampled site rather than editing.
- `strict: false` removed from the marketplace plugin entry. It was how the entry carried the whole definition while the plugin had no manifest; with `plugin.json` now present, `strict: false` would treat the two as conflicting definitions and fail the plugin load, so the entry returns to the default (`plugin.json` is the authority).
- Skill descriptions rewritten to lead with the scope discriminator (one page vs. whole site vs. remediation vs. regression), so the five skills route cleanly, and to carry the terms users actually search — accessibility, a11y, WCAG 2.2, Section 508, screen reader, keyboard.
- All skills rewritten in plain, declarative prose.
- README rewritten around the five-skill pipeline (scan → inspect → audit → fix → diff) and the shared methodology.

### Fixed
- `allowed-tools` in `accessibility-fix`, `accessibility-audit`, and `accessibility-inspect` named the bundled MCP tools by their bare server key (`mcp__accesslint__audit_live`). Plugin-provided MCP tools are scoped as `mcp__plugin_<plugin>_<server>__<tool>`, so the declared names never matched the tools the skills actually call. They now read `mcp__plugin_accesslint_accesslint__*`.

### Removed
- The old `audit` skill's report mode (superseded by `accessibility-audit`).
- Stale MCP-tool references in the README (`audit_diff`, `audit_browser_script` / `audit_browser_collect`), dropped in `@accesslint/mcp` v0.9.0. The documented tools are `audit_live`, `audit_html`, `list_rules`, `explain_rule`.

## [0.8.0] - 2026-06-04

### Changed
- `audit` skill aligned with the simplified `@accesslint/mcp` (v0.9.0), which dropped `audit_diff`, the browser-MCP composition tools (`audit_browser_script` / `audit_browser_collect`), and the `audit-live-page` prompt. The skill no longer references them: live-DOM auditing is `audit_live` (auto-launches Chrome via `@accesslint/chrome`); fix-mode verification re-audits and compares; rigorous diffing is handed to the `diff` skill. For authenticated sessions, start a headed debuggable Chrome (`npx @accesslint/chrome ensure --headed`) and pass `port` to `audit_live`.

## [0.7.0] - 2026-06-04

### Changed
- `scan` and `diff` skills now delegate target resolution to `@accesslint/cli` ≥ 0.9.0: pass a URL, a named target (`dev`, `storybook`, …), or nothing to audit the `default` target from `accesslint.config.json`. Run `npx @accesslint/cli init` to scaffold targets.

## [0.6.0] - 2026-06-04

### Changed
- `scan` and `diff` skills now invoke the CLI as `accesslint scan <url>`, matching `@accesslint/cli` v0.8.0 — which moves the audit under a `scan` subcommand (breaking) and adds `accesslint init` to scaffold `accesslint.config.json` with framework-aware named targets. Requires `@accesslint/cli` ≥ 0.8.0.

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
