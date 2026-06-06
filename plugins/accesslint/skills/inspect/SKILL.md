---
name: inspect
description: "Semi-automated manual accessibility review. Drives a live page through a browser MCP to check what a rule engine can't decide: keyboard and focus order, accessible names/roles/states, reflow and zoom, reduced motion, form errors, and target size. Grades each finding by evidence basis (verified / confirm-with-a-human / human-required) and severity. Locates and assesses; does not fix (use `fix`). Pairs with `scan` under the `review` umbrella. Use for keyboard testing, focus-order checks, a11y-tree review, reflow and zoom, or checking that a page is operable rather than just lint-clean."
argument-hint: "[target|url] [--selector <css>] [--wait-for <css>]"
allowed-tools: Read, Glob, Grep, Bash, Skill, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__press_key, mcp__chrome-devtools__click, mcp__chrome-devtools__hover, mcp__chrome-devtools__fill, mcp__chrome-devtools__fill_form, mcp__chrome-devtools__resize_page, mcp__chrome-devtools__emulate, mcp__chrome-devtools__evaluate_script, mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__new_page, mcp__chrome-devtools__list_pages, mcp__chrome-devtools__select_page, mcp__chrome-devtools__wait_for, mcp__accesslint__explain_rule
---

This is the semi-automated manual tier of a WCAG assessment: the checks that need interaction (keyboard, focus, state changes, reflow) or human review (focus visibility, error recovery, reading order), which a static rule engine can't decide. Work against the running page; use source only to map a finding to `file:line`. Locate and assess — don't fix (that's `accesslint:fix`). The automated tier is `accesslint:scan`; `accesslint:review` runs both under WCAG-EM.

The shared rules — severity, the no-proxy boundary, high-risk patterns, conformance, grounding — are in [`../shared/methodology.md`](../shared/methodology.md). Read it when a call needs judgment. The rules that always apply are below.

## Grading

Tag each finding with a severity (user impact) and an evidence basis (what you can support). Keep the two separate.

- ● Verified — deterministic and reproducible. Cite the selector, the interaction, and the observed a11y-tree or DOM fact. Without that proof it is not ●.
- ◐ Flagged — you have evidence, but the decision needs a person. Attach the evidence and your opinion; don't decide it yourself.
- ○ Human-required — needs assistive technology or lived experience. Hand it off; don't emulate it.

When unsure between two evidence grades, use the lower one. The icons show evidence basis by fill, not color.

Severity (user impact, separate from evidence basis):
- Critical — blocks a core task, with no workaround.
- Serious — a major barrier; the task is possible but difficult.
- Moderate — noticeable friction; the task still completes.
- Minor — a small inefficiency or polish issue.

## Prerequisite: a browser to drive

This tier runs through a browser MCP: `chrome-devtools` (recommended), `playwright`, or `puppeteer`. If none is connected, run only the static checks, report the rest as ○ handoffs, and tell the user:

```bash
claude mcp add chrome-devtools npx -- -y chrome-devtools-mcp@latest
```

## Target

`$ARGUMENTS` is a URL, an `accesslint.config.json` target name, or empty for the default target. `--selector <css>` scopes to a component; `--wait-for <css>` waits for async content.

`navigate_page` needs a URL, so resolve first:
- A URL: use it.
- A target name or empty: read `accesslint.config.json` (and the gitignored `accesslint.config.local.json` overlay) and resolve the name (or `default`) to its `url`; also take its `waitFor` and `selector`.
- No config: ask for a URL, or suggest `npx @accesslint/cli init`.

Then navigate to the URL and wait for the gate (`--wait-for` if given, otherwise the target's `waitFor`) before testing.

## Checkpoints

Take a snapshot first; the a11y tree is the basis for structure, names, roles, and states. Re-snapshot after any state change. The ● checks are deterministic from interaction, so they don't need the rule engine. Deduping against `scan` and merging the tiers is `review`'s job, not this skill's. Each checkpoint's icon is its default grade: lower it freely, raise it only with proof.

**Keyboard and focus** — 2.1.1, 2.1.2, 2.4.3, 2.4.7, 2.4.11
- ● Every interactive element is reachable with `Tab` and operable with `Enter`/`Space`/arrows. Traverse and track `activeElement` via `evaluate_script`.
- ● No keyboard trap: focus that can't leave with `Tab`/`Esc` is a trap.
- ◐ Focus order follows reading and visual order. Capture the order; a person confirms whether it's coherent.
- ◐ Focus indicator is visible. Screenshot each focused state and read the computed `outline`/`box-shadow`; a person confirms it's clear enough.
- ◐ Focus is not hidden by sticky or overlay elements (2.4.11). Screenshot at different scroll positions.

**Structure and semantics** — 1.3.1, 1.3.2, 2.4.1, 2.4.6
- ● Landmarks are present (banner/nav/main/contentinfo), with exactly one `main`.
- ● Heading outline skips no levels and has one h1. Derive it from the tree.
- ● Lists and tables use semantic markup; data tables associate headers.
- ◐ Headings and labels are descriptive, and DOM reading order matches meaning. A person confirms.

**Names, roles, states** — 4.1.2, 2.5.3, 4.1.3
- ● Every control has an accessible name, and the visible label is part of that name (2.5.3).
- ● Custom-widget roles match their APG pattern.
- ◐ States (expanded/checked/selected/disabled) update in the tree on interaction. Read before and after; whether they are announced is ○.
- ○ Live-region and status-message announcement (4.1.3). `aria-live` being present is ●; that it actually announces is assistive-technology only.

**Visual adaptation** — 1.4.4, 1.4.10, 1.4.12, 1.3.4, 2.3.3, 1.4.1, 1.4.11
- ◐ Reflow at 320 CSS px (1.4.10). Resize to 320 wide; check for two-dimensional scrolling or clipped content.
- ◐ Zoom to 200% and 400% (1.4.4). Approximate with CSS zoom via `evaluate_script` (true browser zoom isn't exposed; note this) and screenshot.
- ◐ Text spacing (1.4.12). Inject the WCAG spacing override and check for clipping.
- ◐ Reduced motion (2.3.3). `emulate` prefers-reduced-motion and observe.
- ◐ Color is not the only signal (1.4.1); non-text and state contrast (1.4.11). Screenshot states; the engine misses text-on-image and focus/hover contrast.

**Forms and errors** — 3.3.1–3.3.3, 1.3.5, 3.3.7, 3.3.8
- ● Every field has a programmatic label; `autocomplete`/input-purpose is set where it applies (1.3.5).
- ◐ Submit invalid input: errors are programmatically associated (3.3.1, ●) and the message supports recovery (3.3.3, a person confirms).
- ◐ Redundant entry (3.3.7) and accessible authentication (3.3.8). Exercise the flow and note any cognitive burden.

**Media and timing** — 1.2.x, 2.2.1, 2.2.2
- ◐ `<video>`/`<audio>` have caption, transcript, or description tracks present. Presence is detectable; accuracy is ○.
- ◐ Autoplay and moving content can be paused (2.2.2); timeouts can be adjusted (2.2.1).

**Pointer and target** — 2.5.7, 2.5.8, 2.5.1
- ● Interactive targets are at least 24×24 CSS px (2.5.8). Measure bounding boxes via `evaluate_script`.
- ◐ Dragging has a single-pointer alternative (2.5.7); path and multipoint gestures have a simple alternative (2.5.1).

**Content and navigation** — 3.1.1/2, 2.4.4, 3.2.3/4, 3.2.6
- ● `lang` is set on the page and on parts in other languages.
- ◐ Link and button purpose is clear from the name alone (2.4.4); navigation and identification are consistent across pages (3.2.3/4); help is placed consistently (3.2.6).
- ○ Plain-language comprehension and cognitive load. Readable to you is not the same as usable for cognitive disabilities. Hand off.

## High-risk patterns

For drag-and-drop, rich-text editors, tree views, data grids, custom comboboxes or menus, carousels, and toast or live-region-heavy UIs, heuristic checks are unreliable. Name the APG pattern, verify what you can (●/◐), and hand off the rest as ○ with the assistive-technology steps to run. Use `explain_rule` for engine rules and the APG for widget contracts.

## Report

Group by evidence basis; mark severity inline.

```
# Manual review — <target>  ·  semi-automated tier
Severity: <c> critical · <s> serious · <m> moderate    Basis: ● <v> · ◐ <f> · ○ <h>

## ● Verified
- [serious] Keyboard trap in date picker — SC 2.1.2
    where: div.datepicker[role=dialog]   repro: Tab into grid, focus never exits via Tab or Esc
    fix: <mechanical> | NEEDS HUMAN

## ◐ Flagged
- [moderate] Focus indicator may be too faint — SC 2.4.7
    where: button.ghost   evidence: focus-ghost.png; outline = 1px rgba(0,0,0,.2)
    opinion: likely fails 3:1 non-text contrast — confirm visually

## ○ Human-required
- Live-region announcement on add-to-cart — SC 4.1.3
    aria-live="polite" present (●); actual NVDA/JAWS/VoiceOver output unverified
    needs: screen-reader users (blind / low-vision, per Section 508 FPC)
    flow: add-to-cart → toast (exercised above)
```

Ground each entry by selector and visible text. Add `file:line (symbol)` only when `scan`'s source maps provide it; don't guess. Each ○ entry is a handoff: the functional ability and assistive technology needed, plus the flow you exercised.

## Notes

- The a11y tree shows machine state, not what a screen reader announces. `aria-live` being present does not mean it announces.
- Browser zoom isn't exposed; CSS-zoom approximations are ◐.
- Wait for async content before snapshotting, and re-snapshot after each state change.
- Composing the tiers (dedup against `scan`, one shared browser) is `review`'s job. On its own, this skill reports what its checks find.
