# Changelog

All notable changes to the AccessLint Claude plugin are documented here.

## [0.10.1] - 2026-08-02

The output-side half of the token diet. A pre-iteration-3 validation run (n=3, iteration-2 protocol) showed 0.10.0's behavioral diet working — tool uses down 28%, all calibration gates holding, zero fabrication — but total tokens flat: the freed budget was re-spent on report prose (per-SC ledger enumerations, "what passed" narration). This release caps the report.

### Changed
- Ledger output compacted (`accessibility-inspect`, `accessibility-audit`, canonized in `shared/methodology.md`): counts plus bare SC numbers only; undetermined/not-exercised SCs grouped by shared reason — one clause per group, never a line per SC.
- Passes are no longer narrated: a pass is its SC number in the ledger, with at most one sentence for the whole passing set. Report words go to failures, flags, and handoffs; a fix stated on a finding isn't restated in the recommendations.

## [0.10.0] - 2026-08-02

Token diet for the manual tier, driven by the iteration-2 calibration benchmark: the honesty and precision wins (● -only pass/fail, ◐ hedging, the ○ handoff format, grade-lower-when-unsure) are all output-side reporting rules, while ~85% of the skill's cost delta was behavioral — a checkpoint sweep with a full-page re-snapshot per interaction. This release keeps the reporting rules and removes the sweep.

### Changed
- `accessibility-inspect` is restructured from a checkpoint script into an **SC ledger**: every criterion in scope ends a run as verified, flagged, engine-owned, N/A (triggering feature absent), or **not exercised** — reported as undetermined, never silently dropped and never as a pass. The checkpoint list is now a denominator to cite, not a script to execute; the skill drives only what the page's features and the engine's gaps demand.
- **Evidence spend is capped by grade** (`accessibility-inspect`, canonized in `shared/methodology.md`): a ◐ finding gets one selector, one screenshot if the question is visual, an opinion, and what a person should confirm — then stops, because a ◐ is re-decided by a human regardless and more evidence never upgrades it. ○ handoffs get zero driving. Principle: calibrated uncertainty must be cheaper than false certainty.
- **Keyboard traversal is batched** into one `evaluate_script` walk returning compact JSON per stop (tab order, `activeElement`, computed focus styles, bounding boxes — which settles target-size 2.5.8 for free, overlay occlusion for 2.4.11), replacing the per-stop `press_key`/snapshot cycle. The walk is deterministic, so its results stay ●-citable; real `press_key` events are reserved for confirming operability and traps at the walk's suspect widgets only.
- **Snapshots are selector-scoped**: one full snapshot after the wait gate, then subtree reads of the changed widget only — no full-page re-snapshot per state change.
- **Dedup moved before driving**: `accessibility-audit` now runs `accessibility-scan` first and passes its results (or engine-owned SC list) into each `accessibility-inspect` run, so inspect never re-checks a criterion the engine owns. Conformance aggregation counts not-exercised SCs as undetermined.
- Detailed per-checkpoint procedures moved from the `accessibility-inspect` skill body to `references/checkpoints.md`, loaded on demand or for a `--deep` pass (new flag: drive every triggered area through its full procedure).

### Added
- `shared/methodology.md` — "The evidence budget" section: grade-bounded evidence caps and the denominator-not-script coverage rule.
- `accessibility-inspect` report format — a ledger header closing every SC in the denominator into one bucket, with one-line reasons for not-exercised criteria.

## [0.9.0] - 2026-06-05

### Added
- `plugins/accesslint/.claude-plugin/plugin.json` — the plugin had no manifest, so Claude Code fell back to deriving the plugin name from the install directory. Skills were namespaced by the version string (`0.8.0:scan`) instead of the brand (`accesslint:scan`), and no documented invocation worked as written. The manifest pins `name`, `displayName`, `version`, `license`, and discovery `keywords`.
- `keywords`, `category`, `license`, `homepage`, and `repository` on the marketplace entry, for marketplace and directory search.
- `accessibility-inspect` skill — the semi-automated manual tier. Drives a live page through a browser MCP to check what the rule engine can't decide (keyboard and focus order, accessible names/roles/states, reflow and zoom, reduced motion, form errors, target size), grading each finding by evidence basis (verified / confirm-with-a-human / human-required) and severity. Locates and assesses; does not edit. Requires a browser MCP (`chrome-devtools`, `playwright`, or `puppeteer`).
- `accessibility-audit` skill — the WCAG-EM conformance umbrella. Defines scope, selects a representative sample, runs `accessibility-scan` and `accessibility-inspect` on each sampled page (one subagent per page), and reports per-criterion conformance as pass, fail, or undetermined (needs a human).
- `shared/methodology.md` — a single shared canon for the methodology: the pipeline, WCAG-EM, the severity and evidence-basis grading, the no-proxy-for-human-experience boundary, conformance, and grounding. Each skill states its always-apply rules inline and references the canon for depth.

### Changed
- **Breaking:** every skill is renamed with an `accessibility-` prefix — `accessibility-scan`, `accessibility-inspect`, `accessibility-audit`, `accessibility-fix`, `accessibility-diff`. Skill directories index and search on the name, not the description, so the previous bare verbs (`scan`, `fix`, `diff`) matched no accessibility query and collided with unrelated skills of the same name. Update invocations to `accesslint:accessibility-<verb>`.
- **Breaking:** the old `audit` skill is reduced to remediation and renamed `accessibility-fix` (baseline → edit → verify). The audit name now belongs to `accessibility-audit`, the WCAG-EM conformance umbrella and the closest successor to the old report mode. Use `accessibility-fix` to remediate; `accessibility-audit` finds issues but assesses a sampled site rather than editing.
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
