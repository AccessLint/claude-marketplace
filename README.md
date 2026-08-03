# AccessLint — web accessibility (a11y) skills

Agent Skills for finding and fixing web accessibility issues, powered by [`@accesslint/core`](https://github.com/AccessLint/accesslint/tree/main/core). They cover the WCAG 2.2 audit workflow end to end: automated scanning, hands-on keyboard and screen-reader checks, WCAG-EM conformance auditing, remediation, and regression diffing.

Works with any agent the [skills CLI](https://www.skills.sh) supports — Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini, Cline, Amp, and more.

**Keywords:** accessibility · a11y · WCAG 2.2 · Section 508 · screen reader · keyboard navigation · color contrast · ARIA · inclusive design

## The skills

Five skills, each with one responsibility. Each finding is graded on two axes — severity (user impact) and evidence basis (● verified · ◐ confirm with a human · ○ human-required).

| Skill | Scope | Does |
|---|---|---|
| `accessibility-scan` | one page | Runs the rule engine against the live DOM. Returns a worklist: selector, `file:line (symbol)` where source mapping is available, evidence, fix directive. Locates; doesn't edit. |
| `accessibility-inspect` | one page | Drives the page through what the engine can't decide: keyboard and focus order, names/roles/states, reflow and zoom, reduced motion, form errors, target size. Assesses; doesn't edit. |
| `accessibility-audit` | whole site | WCAG-EM: defines scope, samples representative pages and flows, runs the other two per page, reports per-criterion conformance as pass, fail, or undetermined. |
| `accessibility-fix` | a target or worklist | Baseline, edit, verify. Applies mechanical fixes as given; leaves `TODO`s for visual or contextual judgment. Only fixes. |
| `accessibility-diff` | a change | Diffs a page against a baseline — uncommitted changes by default, or a branch. Reports only what the change introduced or fixed. |

```
LOCATE                                 ASSESS                 REMEDIATE           GUARD
accessibility-scan    (automated) ┐
                                  ├─► accessibility-audit ─► accessibility-fix ─► accessibility-diff
accessibility-inspect (manual)    ┘   (WCAG-EM)              (edit→verify)       (regression)
```

The methodology they follow — WCAG-EM, the two grading axes, the boundary against standing in for real assistive-technology users — is in [`plugins/accesslint/skills/shared/methodology.md`](plugins/accesslint/skills/shared/methodology.md).

## Install

### Any agent (skills CLI)

```bash
npx skills add AccessLint/skills
```

Installs the five skills. `accessibility-scan` and `accessibility-diff` work immediately (they shell out to [`@accesslint/cli`](https://www.npmjs.com/package/@accesslint/cli)); `accessibility-fix` also needs the MCP server below.

### Claude Code (plugin)

```bash
claude plugin marketplace add accesslint/skills
claude plugin install accesslint@accesslint
```

Adds the skills and the bundled MCP server together, and namespaces the skills as `accesslint:accessibility-scan` and so on.

### MCP server on its own

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

## Use

Ask in plain language — "audit this site for accessibility", "is localhost:3000 accessible", "fix the a11y issues in Nav.tsx" — or invoke a skill directly if your agent supports slash commands:

```
/accessibility-scan http://localhost:3000/dashboard
/accessibility-audit --level AA http://localhost:3000/
/accessibility-diff --branch main
```

Every skill takes a URL, a named target from `accesslint.config.json`, or nothing (the default target). Run `npx @accesslint/cli init` to set targets up once, then drop the URL.

| Flag | Skills | Purpose |
|---|---|---|
| `--selector <css>` | scan, inspect, audit, diff | Scope to one component |
| `--wait-for <css>` | scan, inspect, audit, diff | Gate on async content or a rebuild |
| `--include-aaa` | scan, diff | Include AAA rules |
| `--disable <rules>` | scan | Skip specific rules |
| `--level AA\|AAA` | audit | Conformance target (default AA) |
| `--branch [<name>]` | diff | Diff against a branch instead of uncommitted changes |

## Requirements

Most a11y violations only appear after JS runs, so these skills work against a rendered page. `scan`, `diff`, `audit`, and `fix` reach the live DOM over CDP, auto-launching Chrome when no debug session is reachable — no setup.

`accessibility-inspect` drives the page, which needs a browser MCP (`chrome-devtools`, Playwright, or Puppeteer). Without one it runs the static checks and hands off the rest. In Claude Code:

```bash
claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest
```

For a page behind a login, start a headed debuggable Chrome (`npx @accesslint/chrome ensure --headed`) and sign in there; `accessibility-fix` attaches to that session instead of launching its own.

## MCP tools

The plugin bundles [`@accesslint/mcp`](https://github.com/AccessLint/accesslint/tree/main/mcp), which backs `accessibility-fix`'s baseline and verify runs and supplies rule metadata. The tools are also callable directly.

| Tool | Purpose |
|---|---|
| `audit_live` | Live-DOM audit over CDP; auto-launches Chrome if needed |
| `audit_html` | Audit an HTML string or file |
| `list_rules` | List the active rule set |
| `explain_rule` | One rule in full: WCAG criterion, fixability, remediation guidance |

Installed standalone they are `mcp__accesslint__<tool>`; installed as a Claude Code plugin, `mcp__plugin_accesslint_accesslint__<tool>`.

## WCAG coverage

Level A and AA — perceivable (alt text, contrast, structure), operable (keyboard, focus), understandable (labels, language), robust (ARIA, accessible names). AAA rules are opt-in via `--include-aaa`. Run `list_rules` for the active set in your installed version.

The engine catches what is mechanically detectable. Content clarity, announcement quality, keyboard-flow coherence, and lived experience need a person — these skills name and hand those off rather than guessing at them.

## Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [WCAG-EM evaluation methodology](https://www.w3.org/TR/WCAG-EM/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [`@accesslint/mcp` on npm](https://www.npmjs.com/package/@accesslint/mcp)

## License

MIT
