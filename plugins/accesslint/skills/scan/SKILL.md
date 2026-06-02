---
name: scan
description: "Audit a live page for accessibility issues and locate each violation precisely — optionally pass a URL (e.g. `accesslint:scan https://example.com/dashboard`), otherwise auto-detects the running dev server. Ensures a debuggable Chrome, runs the @accesslint/core engine via CDP, and returns a worklist of live-DOM WCAG violations grounded to each violation's DOM selector and source file:line. Locates; doesn't edit — output drives fixes by Claude. Use it for \"run accesslint\", \"scan my app\", \"is this page accessible\", or to verify a UI change. (For a directory sweep, an HTML file, or a written report, use the `audit` skill.)"
argument-hint: "[url]"
allowed-tools: Bash, Read, Glob, Grep, Skill, Task
---

You audit a live page and report exactly what's broken and where. You **locate; you don't fix** — your output is a grounded worklist that drives fixes by Claude or the user. (For a written report or non-live target, that's the `audit` skill.)

Two npx packages do the work, no MCP: `@accesslint/chrome` `ensure` attaches to a debuggable Chrome (or launches a headless one) and prints its CDP port; `@accesslint/cli` injects `@accesslint/core` at that port, audits the live DOM, and prints violations as JSON.

## 1. Resolve the URL

- **URL passed as an argument?** `$ARGUMENTS` contains it — use it directly, skip detection.
- **Building a component/route?** Audit that route — not `/` — based on the user's recent edits.
- **"Scan my app"?** Find the dev server, then cross-check `package.json` if several respond:
  ```bash
  for p in 3000 5173 3001 5174 4321 4200 8080 8000; do curl -so /dev/null -w "%{http_code} $p\n" --max-time 1 "http://127.0.0.1:$p/" 2>/dev/null; done
  ```
- **Nothing listening?** Offer to start it (`npm run dev`), then continue.

## 2. Audit

Capture the port `ensure` reports (it may step past a busy one — never assume 9222), then audit:

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

Output is single-line JSON: `{ url, ruleCount, violations: [{ ruleId, selector, html, impact, message, source: [{file,line,symbol}] }] }`. Exit **0 = clean, 1 = violations (normal), 2 = error**. Flags as needed: `--include-aaa`, `--disable <rules>`, `--wait-for "<selector>"` for slow SPAs.

## 3. Return a located worklist — then stop

Lead with counts by impact, then one entry per violation (grouped by rule, not per instance), each carrying:

- **where** — the `selector` verbatim (keep it precise, never a bare tag), plus `source` `file:line (symbol)` when present. `source` exists **only on React dev builds**; when absent, say so and locate by selector + visible text — don't fabricate a file.
- **evidence** — the runtime proof from `message`: the contrast ratio and colors, the empty accessible name, the missing attribute.
- **fix** — the mechanical change (`lang="en"`, wrap in `<main>`, `#aaa`→`#767676` for 4.5:1), or `NEEDS HUMAN` for anything requiring judgment (alt text, labels, copy). **Never invent content.**

```
Accessibility audit — http://localhost:3000/ (94 rules, live DOM)
2 critical, 1 serious — located, ready to drive fixes. Source mapping unavailable (not a React dev build).

Critical
- img-alt — <img src="a.jpg"> has no alt
    where: main > img | src/App.tsx:42 (Header)   fix: NEEDS HUMAN — alt text, or alt="" if decorative
- button-name — empty <button>, no accessible name
    where: body > button   fix: NEEDS HUMAN — add visible text or aria-label
Serious
- color-contrast — 2.32:1 (needs 4.5:1), #aaa on #fff
    where: body > p   fix: darken to #767676
```

Then hand off — **don't edit.** If the user wants fixes:
- **A few mechanical ones** — apply at the worklist's pointers, then **re-run this audit** on the same URL to confirm they're gone and nothing new appeared. Re-running *is* the verification.
- **Bulk or contextual remediation** — pass the worklist to `accesslint:audit` fix mode (`Skill({ skill: "accesslint:audit" })`).

## 4. Tear down

`npx -y @accesslint/chrome@latest stop --all` — unless `ensure` reported `"managed":false` (the user's own browser; leave it).

## Gotchas

- **TCP-open ≠ driveable.** A Chrome from the DevTools checkbox or `chrome-devtools-mcp` serves only a WebSocket; the CLI needs the HTTP discovery API. `ensure` handles it — launches its own Chrome on a free port if one is squatted. Always read `port` from `ensure`, never hardcode 9222.
- **`ensure` fails (`{"ok":false}`)** — no Chrome or all ports busy; set `CHROME_PATH` or free a port. **CLI exits 2** — bad URL or page never loaded; check the dev server and route.
- **Testing unpublished builds** — swap `npx -y @accesslint/<pkg>@latest` for `bun /path/to/<pkg>/src/cli.ts`.
