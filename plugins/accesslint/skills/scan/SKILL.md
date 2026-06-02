---
name: scan
description: "Audit a live page for accessibility issues and locate each violation precisely — optionally pass a URL (e.g. `accesslint:scan https://example.com/dashboard`), otherwise ask for one. Ensures a debuggable Chrome, runs the @accesslint/core engine via CDP, and returns a worklist of live-DOM WCAG violations grounded to each violation's DOM selector and source file:line. Locates; doesn't edit — output drives fixes by Claude. Use it for \"is this page accessible\", or to verify a UI change. For diffing against uncommitted changes or a branch, use the `diff` skill."
argument-hint: "[url]"
allowed-tools: Bash, Read, Glob, Grep, Skill, Task
---

Audit a live page and report what's broken and where. Locate; don't fix. If no URL in `$ARGUMENTS`, ask for one.

## 1. Audit

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

Flags as needed: `--selector`, `--wait-for "<selector>"`, `--include-aaa`, `--disable <rules>`.

## 2. Report

Counts by impact, then one entry per violation:

- **where** — selector verbatim + `file:line (symbol)` if `source` is present — never fabricate. If no violation has `source`, note "source mapping unavailable — located by selector only".
- **evidence** — contrast ratio, missing attribute, empty name
- **fix** — mechanical change or `NEEDS HUMAN`

Don't edit. For fixes: apply mechanical ones then re-run to verify; for bulk work hand off to `accesslint:audit`.

## 3. Tear down

```bash
npx -y @accesslint/chrome@latest stop --all  # skip if ensure reported "managed":false
```

## Gotchas

- `ensure` always determines the port — never hardcode 9222.
- CLI exit 2 = bad URL or page never loaded; check the dev server.
