# Target resolution for `scan` / `diff`

Design note. How the live-audit skills find *what to audit* without making the user type a URL
every run. Cross-repo: the skills live here; the config lifecycle lives in
[`@accesslint/cli`](https://github.com/AccessLint/accesslint/tree/main/cli).

**Status (cli 0.8.0):** the `scan` verb and `accesslint init` have shipped; the audit is now
`accesslint scan <source>` (breaking — bare `accesslint <source>` is gone) and the skills call it
that way. Remaining: `accesslint <name>` target resolution (below), after which the skills resolve
named targets and get *thinner*.

## Problem

`scan` and `diff` are **live-DOM** audits — they need a rendered page, and a rendered page's
address is a URL. Today's single `<url>` prompt bundles three questions: is a server running,
what's its host:port, what path. Forcing all three by hand every run is the DX cost.

## Approach: a named config, bootstrapped by an interactive `init`

Not auto-detection. A simple `init` writes a small config of **named targets**; after that,
zero-arg `scan` Just Works and `scan dev` / `diff prod` read like the rest of the toolchain.
(Port detection was prototyped and rejected — Chrome's CDP root returns `text/html`, `lsof` is
macOS/Linux-only; an interactive prompt with good defaults is portable, deterministic, and
predictable.)

## `accesslint init` — interactive, framework-aware defaults

An `npm init`-style prompt, every field pre-filled, Enter accepts:

```
$ npx @accesslint/cli init
  Dev server URL               [http://localhost:5173]
  Add a Storybook target?      [y/N]
  Add a prod / staging target? [y/N]
  Default target               [dev]
  ✓ accesslint.config.json
  ✓ accesslint.config.local.json (gitignored)
```

The dev URL is framework-aware (below). Storybook and prod/staging are off by default —
the prompt defaults to No, and prod is written to the gitignored overlay when given.

**Framework-aware defaults** come from reading `package.json` — config-file *reading*, not port
*probing*:

1. **Explicit port in the dev script wins** — parse `-p` / `--port` out of the `dev`/`start`
   script (`next dev -p 4000`, `vite --port 4000`).
2. **Else infer from the framework** in `dependencies`/`devDependencies`:

   | Framework (dep) | Dev default |
   |---|---|
   | `vite`, `@sveltejs/kit` | 5173 |
   | `next`, `nuxt`, `react-scripts` (CRA), `@remix-run/*` | 3000 |
   | `astro` | 4321 |
   | `@angular/core` | 4200 |
   | `@vue/cli-service` | 8080 |
   | `gatsby` | 8000 |
   | *none matched* | 3000 |

3. **Storybook** is never added by default. Pass `--storybook` (or opt in at the prompt, raised
   only when a `storybook` script or `@storybook/*` dep exists); URL defaults to 6006 or its
   script's `-p`.

**Non-interactive escape** (CI, and Claude with no TTY):

```
accesslint init --yes                                   # accept framework-aware defaults
accesslint init --dev-url http://localhost:3000 --storybook --yes
```

## Config — `accesslint.config.json`

Greenfield (no rc-file in cli/core today). JSON: the CLI writes/parses it; a skill can read it
without JS eval. A target is a **named, fully-specified audit context**, not just a URL — it
carries the same knobs scan/diff already pass, so config also kills *retype-the-flags* friction
and pins a canonical path.

```json
{
  "default": "dev",
  "targets": {
    "dev":       { "url": "http://localhost:5173", "waitFor": "#app" },
    "storybook": { "url": "http://localhost:6006/iframe.html?id=button--primary" },
    "prod":      { "url": "https://app.example.com" }
  }
}
```

Per-target keys mirror the CLI flags: `url`, `selector`, `waitFor`, `includeAAA`, `disable`,
`snapshotDir`. `storybook` is first-class in the product already
([`@accesslint/storybook-addon`](https://github.com/AccessLint/accesslint/tree/main/storybook-addon)).

### Secrets: committed base + gitignored overlay

- `accesslint.config.json` — committed. Dev/storybook; team-shared.
- `accesslint.config.local.json` — gitignored. Prod/staging + anything private; overrides the
  base by target name. `init` writes prod here and adds the gitignore entry.

## Resolution ladder

```
scan/diff  [name | url]  [flags]
  url            → audit it                       (explicit override, unchanged)
  name "dev"     → accesslint.config.json target
  no arg+default → config.targets[default]        (zero-arg just works)
  no config      → "run accesslint init"   (or ask for a URL once)
```

No detection floor. `init` is the one bootstrap.

## CLI surface (where this lives)

- **`accesslint init [--yes] [--dev-url …] [--storybook]`** — the interactive prompt above;
  writes the config + overlay + gitignore entry. Deterministic and testable (pipe answers).
- **`accesslint <name>`** — resolve a config target. Clean insertion in `cli.ts`: `resolveInput`
  branches URL → file → stdin today; add a config-name lookup **before** the `isURL` check (a
  non-URL, non-file token matching a target expands to its url + flags). Unknown name → clear
  error listing available targets.

### Seam with Claude

Claude can't drive a TTY prompt over Bash, so `--yes`/flags is the path it uses. Human
customizing → `accesslint init` interactively (or `! npx @accesslint/cli init` in-session).
Claude / CI → `accesslint init --yes` scaffolds a correct config in one shot, then shows what it
wrote. Mirrors the existing `ensure → JSON → cli` division of labor.

## Phasing

- **Done (cli 0.8.0):** `scan` verb + `accesslint init`. Skills updated to `accesslint scan <url>`.
- **Next (CLI):** `accesslint <name>` resolution — config-name lookup before the `isURL` check.
  CI and the storybook-addon get the same config for free.
- **After (skills):** scan/diff resolve `name`/default by delegating to `accesslint` (or, as a thin
  interim, reading the JSON directly), and get *shorter*.

## Edge cases

- **Path stays `/` unless pinned per target.** SPAs 200 on every route. Audit output must state
  what was audited — `/` is often a login/marketing shell.
- **Monorepo / workspace root** — `package.json` may have no `dev` script; `init` asks which
  workspace or falls back to the 3000 default.
- **Explicit dev-script port** always overrides the framework table.
- **Creating a target** (starting a server, rendering a component) is out of scope here — config
  + named targets only.
