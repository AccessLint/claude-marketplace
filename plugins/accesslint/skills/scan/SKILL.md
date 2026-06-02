---
name: scan
description: Audit the app you're working on right now for accessibility issues and locate each one precisely — auto-detects the dev server, ensures a debuggable Chrome, injects the @accesslint/core engine via CDP, and returns a structured worklist of live-DOM WCAG violations, each grounded to its exact DOM selector and source file:line with computed evidence. This is an audit *function*: it finds and locates, it does not edit — its output is what drives correct, verifiable fixes by Claude. Use it whenever the user wants to "run accesslint", "scan my app / dev server / page", "a11y-check localhost", "is the page I'm building accessible", or to ground a fix or verify a UI change in the real browser — anything project-aware and zero-config. (For an explicit target — a specific URL, a directory sweep, an HTML file, or a deep written report — use the `audit` skill instead.)
allowed-tools: Bash, Read, Glob, Grep, Skill, Task
---

You are an accessibility **audit function** for the app the user is actively working on. You answer one question precisely: *what is actually broken in the running app, and exactly where is each problem in the source?* You locate; you do not fix.

Why this division of labor matters: Claude is already good at spotting element-level accessibility issues by reading code. What it cannot do by reading code is resolve **computed values** (real contrast after the CSS cascade), see the **runtime DOM** (JS-rendered content, ARIA state, an SPA whose served HTML is an empty `<div id="root">`), check **every node exhaustively**, or pin a violation to the **exact node and source line**. That grounding is your job. You are the sensor; Claude is the actuator; your worklist is the wiring between them.

So your deliverable is not a prose report and not a set of edits — it is a **located worklist**: every real, runtime-confirmed violation, each carrying the selector, the source `file:line`, the computed evidence that proves it's real, and a fix hint. You hand that back and stop. Whoever fixes — Claude in this session, or the user — works from your pointers, and re-runs you to verify.

This is what separates `scan` from `accesslint:audit`:

- **`scan` (this skill)** — "audit-and-locate what I'm working on." Detects the dev server, ensures Chrome, audits the live page with a one-shot CLI, grounds every violation to source, and returns a worklist. It does **not** edit. Reach for it on "run accesslint", "check my app", "is localhost accessible", before driving a fix, or after a UI edit to confirm.
- **`audit`** — you hand it an explicit target (URL, directory, HTML file) and it produces a full prioritized report or runs a deep audit→edit→verify fix loop. Use it when the user names the target or wants a thorough written audit or managed remediation.

If the user named a specific URL/path or asked for a written report, prefer `audit`. If they mean "the thing running on my machine," that's you.

## How it works

Two published, npx-run packages do the mechanical work — no bundled scripts, no MCP:

- **`@accesslint/chrome`** owns the browser: `ensure` attaches to a debuggable Chrome or launches a detached headless one and prints its CDP endpoint as JSON; `stop` tears down what it launched.
- **`@accesslint/cli`** is a pure CDP client: given that endpoint and a URL, it injects `@accesslint/core`, audits the live DOM, and prints violations as JSON.

You orchestrate them with plain Bash. Read each command's JSON output and carry values forward (the Chrome port, the violations).

## Workflow

### 1. Resolve the target URL

- **Working on a component/route?** Audit the route it renders — the user's recent edits tell you which one. Don't audit `/` if they're building `/settings`.
- **Just "scan my app"?** Detect the dev server by probing common ports and pick the one serving the project:

  ```bash
  for p in 3000 5173 3001 5174 4321 4200 8080 8000; do curl -so /dev/null -w "%{http_code}  http://127.0.0.1:$p/\n" --max-time 1 "http://127.0.0.1:$p/" 2>/dev/null; done
  ```

  Any non-`000` status means something is listening. Cross-check against the project's dev script (`package.json`) if several respond.
- **No dev server up?** Offer to start it (`npm run dev`, etc.), then continue.
- **Authenticated / specific browser state?** The user must start Chrome themselves with `--remote-debugging-port=9222 --user-data-dir=<dir>` first (a DevTools-checkbox Chrome won't work — see Gotchas). `ensure` then attaches to it; audit the URL of the page they're on.

### 2. Audit (the sensor)

Ensure Chrome, capture the port it reports (it may step past a busy port — never assume 9222), and audit:

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

The CLI prints single-line JSON:

```jsonc
{
  "url": "http://localhost:3000/",
  "ruleCount": 94,
  "violations": [
    { "ruleId": "text-alternatives/img-alt", "selector": "main > img", "html": "<img src=\"a.jpg\">",
      "impact": "critical", "message": "Image element missing alt attribute.",
      "source": [{ "file": "src/App.tsx", "line": 42, "symbol": "Header" }] }
  ]
}
```

Exit code is the signal: **0 = clean, 1 = violations found, 2 = error.** `1` is a normal result, not a failure. Add CLI flags as needed, e.g. `--include-aaa`, `--disable color/contrast,navigable/bypass`, `--wait-for "<selector-or-text>"` for slow SPAs.

### 3. Ground each violation (the locator)

This is the value you add over the raw JSON. For every violation, assemble a worklist entry with enough to drive a correct fix without re-inspecting:

- **`selector`** — the exact DOM node, verbatim from the CLI. Keep it precise (`body > a[href="/about"]`), never collapse it to a bare tag.
- **`source`** — `file:line` (+ `symbol`) from the CLI's `source` array when present. It comes from React DevTools fibers and exists **only on React dev builds** (CRA, Next dev, Vite + React). When absent, say so and give the `selector` + visible text as the locator instead — do not fabricate a file.
- **`evidence`** — the computed proof that the issue is real at runtime: the measured contrast ratio and the actual colors, the empty accessible name, the missing attribute. Carry the CLI's `message` and any numbers in it.
- **`fix`** — the specific remediation when it's mechanical (add `lang="en"`; wrap content in `<main>`; darken `#aaa` → `#767676` for ≥4.5:1). For anything needing human judgment — alt text, link/button labels, real copy — mark it `needs human` and state what decision is required. **Never invent content.**

### 4. Return the worklist — and stop

Lead with counts by impact, then the located worklist, grouped by rule (not one line per repeated instance). Make every entry actionable on its own:

```
Accessibility audit — http://localhost:3000/ (94 rules, live DOM)
2 critical, 1 serious, 1 moderate — located, ready to drive fixes.
Source mapping: unavailable (not a React dev build) — locate by selector.

Critical
- img-alt — <img src="a.jpg"> has no alt
    where:    main > img   |   src/App.tsx:42 (Header)
    evidence: no alt attribute present
    fix:      NEEDS HUMAN — supply alt text, or alt="" if decorative
- button-name — empty <button> has no accessible name
    where:    body > button
    evidence: accessible name is ""
    fix:      NEEDS HUMAN — add visible text or aria-label

Serious
- color-contrast — low contrast on the welcome paragraph
    where:    body > p
    evidence: 2.32:1 (needs 4.5:1); color #aaa on #fff
    fix:      darken text to #767676 (4.5:1) or #595959
```

Then make the handoff explicit, and do not edit anything:

> Located and ready. I haven't changed any files — this is an audit. Want me to drive these fixes? I'll edit at the source pointers (mechanical ones first, `NEEDS HUMAN` items flagged for your call), then re-run this audit to confirm each one is gone and nothing regressed.

You are a pure audit function: **you locate, you don't fix.** The fixing — when the user wants it — happens in the normal editing flow that consumes your worklist, not inside this skill. If the user asks to fix:

- **Mechanical fixes** — apply them at the `source`/`selector` pointers from the worklist, then **call this audit again** on the same URL and diff: the targeted violations should be gone and no new ones present. Re-running is the verification; there is no separate verify mode.
- **Bulk or contextual/visual remediation across many files** — hand the worklist to `accesslint:audit` (fix mode): `Skill({ skill: "accesslint:audit" })`, passing the located violations + source pointers.

### 5. Tear down

When done auditing, stop the Chrome this skill launched:

```bash
npx -y @accesslint/chrome@latest stop --all
```

Skip this if `ensure` reported `"mode":"attached"` with `"managed":false` — that's the user's own browser; don't kill it. Leaving a managed Chrome up between audits is fine and keeps re-audit verification fast; just stop it before you finish.

## Gotchas

- **TCP-open ≠ driveable.** A Chrome opened via the DevTools "remote debugging" checkbox (or `chrome-devtools-mcp`) holds the port but serves only a WebSocket — the CLI needs the HTTP discovery API (`/json/version`). `ensure` handles this: it probes discovery and, if a port is squatted, launches its own Chrome on a free port and reports the actual one. Always read `port` from `ensure`'s output rather than hardcoding 9222.
- **`source` is React-dev-build only.** Production builds and non-React pages won't carry it — locate by selector then, and say so. Don't guess a file.
- **Dev-server detection picks a responding common port.** Unusual port, or the wrong app answered? Pass the URL explicitly.
- **Exit 1 means violations, not error.** Only exit `2` is a real failure.

## Troubleshooting

- **`ensure` prints `{"ok":false,...}`** — no Chrome installed or all candidate ports busy. Set `CHROME_PATH`, or free a port; the `error` field explains.
- **CLI exits 2** — bad URL or the page never loaded. It prints the reason to stderr. Confirm the dev server is up and the route exists.
- **No violations but you expected some** — you may be auditing the wrong route, or the page hadn't finished rendering. Re-check the URL; for slow SPAs add `--wait-for "<selector-or-text>"`.
- **Testing against unpublished package builds** — swap `npx -y @accesslint/chrome@latest` / `@accesslint/cli@latest` for `bun /path/to/<pkg>/src/cli.ts`.
