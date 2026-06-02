---
name: scan
description: "Audit a live page for accessibility issues and locate each violation precisely — optionally pass a URL (e.g. `accesslint:scan https://example.com/dashboard`), otherwise auto-detects the running dev server. Ensures a debuggable Chrome, runs the @accesslint/core engine via CDP, and returns a worklist of live-DOM WCAG violations grounded to each violation's DOM selector and source file:line. Locates; doesn't edit — output drives fixes by Claude. Use it for \"run accesslint\", \"scan my app\", \"is this page accessible\", or to verify a UI change. (For a directory sweep, an HTML file, or a written report, use the `audit` skill.)"
argument-hint: "[--full] [url]"
allowed-tools: Bash, Read, Glob, Grep, Skill, Task
---

Audit a live page and report what's broken and where. Locate; don't fix.

Parse `$ARGUMENTS`: strip `--full` if present, treat the remainder as the URL. If no URL, ask for one. Default is **diff mode** (new violations only); `--full` reports everything.

## 1. Audit

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
```

**Full scan** — when `--full` is passed, or the working tree is clean (`git diff --quiet && git diff --cached --quiet`):

```bash
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

**Diff mode** — dirty working tree and no `--full`. Tell the user first: _"Running in diff mode — stashing your changes to capture a baseline, then restoring. Your working tree will be fully restored."_

```bash
git stash push -u -m "accesslint-scan-baseline"
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --update-snapshot
git stash pop
sleep 2
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --format json
```

Pass flags (`--selector`, `--wait-for`, `--include-aaa`) to **both** runs. If `git stash push` fails, fall back to full scan and warn the user.

## 2. Report

**Diff mode:**
```
Accessibility diff — http://localhost:3000/ (94 rules, live DOM)
2 new · 1 fixed · 4 pre-existing hidden

New — Critical
- color-contrast — 2.1:1 (needs 4.5:1), #bbb on #fff
    where: main > p.subtitle   fix: darken to #767676
Fixed
- img-alt — <img src="old.jpg"> (no longer present)
```

**Full scan:** counts by impact, then one entry per violation.

Each entry: **where** (selector verbatim + `file:line (symbol)` if `source` is present — never fabricate), **evidence** (contrast ratio, missing attribute), **fix** (mechanical change or `NEEDS HUMAN`). If no violation has a `source`, note "source mapping unavailable — located by selector only".

Don't edit. For fixes: apply mechanical ones then re-run to verify; for bulk work hand off to `accesslint:audit`.

## 3. Tear down

```bash
npx -y @accesslint/chrome@latest stop --all  # skip if ensure reported "managed":false
```

## Gotchas

- `ensure` always determines the port — never hardcode 9222.
- CLI exit 2 = bad URL or page never loaded; check the dev server.
- `sleep 2` covers most HMR cases; if baseline looks identical to current, suggest `--wait-for "<selector>"` on both runs.
- Heavy DOM changes between runs cause selector drift → switch to `--full`.
- Unpublished builds: swap `npx -y @accesslint/<pkg>@latest` for `bun /path/to/<pkg>/src/cli.ts`.
