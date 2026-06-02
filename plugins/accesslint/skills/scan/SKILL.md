---
name: scan
description: "Audit a live page for accessibility issues and locate each violation precisely — optionally pass a URL (e.g. `accesslint:scan https://example.com/dashboard`), otherwise auto-detects the running dev server. Ensures a debuggable Chrome, runs the @accesslint/core engine via CDP, and returns a worklist of live-DOM WCAG violations grounded to each violation's DOM selector and source file:line. Locates; doesn't edit — output drives fixes by Claude. Use it for \"run accesslint\", \"scan my app\", \"is this page accessible\", or to verify a UI change. (For a directory sweep, an HTML file, or a written report, use the `audit` skill.)"
argument-hint: "[--full] [--branch [<name>]] [url]"
allowed-tools: Bash, Read, Glob, Grep, Skill, Task
---

Audit a live page and report what's broken and where. Locate; don't fix.

Default branch: !`git symbolic-ref refs/remotes/origin/HEAD --short 2>/dev/null | sed 's|.*/||' || echo main`

Parse `$ARGUMENTS`:
- Strip `--full` if present → full mode
- Strip `--branch <name>` if present → branch diff mode. If `--branch` has no value, use the default branch above.
- Remainder is the URL. If no URL, ask for one.

Default is **diff mode** (new violations only); `--full` reports everything.

## 1. Audit

```bash
PORT=$(npx -y @accesslint/chrome@latest ensure | node -e 'process.stdin.on("data",d=>process.stdout.write(""+JSON.parse(d).port))')
```

**Full scan** — `--full` passed, or working tree is clean (`git diff --quiet && git diff --cached --quiet`) and no `--branch`:

```bash
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --format json
```

**Diff mode** — dirty working tree, no `--full`, no `--branch`. Tell the user first: _"Running in diff mode — stashing your changes to capture a baseline, then restoring. Your working tree will be fully restored."_

```bash
git stash push -u -m "accesslint-scan-baseline"
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --update-snapshot
git stash pop && sleep 2
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --format json
```

If `git stash push` fails, fall back to full scan and warn the user.

**Branch diff mode** — `--branch <name>` passed. Tell the user first: _"Diffing against `<name>` — checking out that branch to capture a baseline, then restoring your branch. Your working tree will be fully restored."_

Branch switching triggers a rebuild but not a browser reload — the CLI opens a fresh tab each time, so it always gets the current build. The only requirement is that the rebuild finishes before the audit runs.

```bash
# Stash if dirty
git diff --quiet && git diff --cached --quiet || git stash push -u -m "accesslint-scan-branch-diff"

git checkout <branch>
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --update-snapshot [--wait-for "<selector>"]

git checkout - && git stash pop 2>/dev/null
npx -y @accesslint/cli@latest "<url>" --port "$PORT" --snapshot scan-diff --snapshot-dir /tmp --format json [--wait-for "<selector>"]
```

If the user provides `--wait-for`, pass it to both runs — it gates the audit until the rebuild is ready. Without it, the CLI navigates immediately after checkout; warn the user that a slow rebuild may cause a stale audit and suggest adding `--wait-for`.

Pass `--selector`, `--include-aaa` to **both** runs.

## 2. Report

**Diff mode** — lead with branch name if `--branch` was used:
```
Accessibility diff — http://localhost:3000/ vs main (94 rules, live DOM)
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
- Branch diff assumes the dev server rebuilds automatically on checkout but does not HMR — the CLI always opens a fresh tab so it reads the current build. Use `--wait-for "<selector>"` to gate the audit until the rebuild is ready; without it a slow build may yield a stale baseline.
- For stash-based diff, `sleep 2` covers most HMR cases; if baseline looks identical to current, add `--wait-for "<selector>"`.
- Heavy DOM changes between runs cause selector drift → switch to `--full`.
- Unpublished builds: swap `npx -y @accesslint/<pkg>@latest` for `bun /path/to/<pkg>/src/cli.ts`.
