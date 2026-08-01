# Coastal Almanac — WCAG 2.2 AA pre-launch audit

**Scope:** `clean.html`, `forms.html`, `widget.html`, `media.html` at `http://127.0.0.1:8000`
**Source:** `/private/tmp/claude-501/-Users-cameron-Developer-accesslint-org-skills--claude-worktrees-skill-suite-familiarization-7bfe4c/47d7d54a-984d-4eea-8d6c-41b3232ec393/scratchpad/serve/`
**Method:** AccessLint engine (@accesslint/core via CDP against the live DOM) on all four pages, then manual keyboard and accessibility-tree verification in Chrome.

**Headline:** the automated engine found 5 violations. The single worst problem on the site — a permanent keyboard trap — is not one of them. It came out of manual testing, and it alone should block launch.

Page verdicts: `clean.html` genuinely clean. `forms.html` 4 automated + 2 manual. `media.html` 1 automated + 1 manual. `widget.html` **zero automated, two blockers.**

---

## Blockers — do not ship

### 1. Keyboard trap in the alerts modal — `widget.html` lines 35–65
**WCAG 2.1.2 No Keyboard Trap (Level A).** The most severe issue found.

The modal implements a Tab focus trap but provides **no way out**. Verified empirically:
- Escape does nothing — `modalHiddenAfterEscape: false`. There is no Escape branch in the `keydown` handler (line 55 only handles `Tab`).
- There is no close or cancel button. The only control inside is `#m-submit` ("Subscribe").
- I pressed Tab three times from `#m-email` and landed back on `#m-email`; focus never left the modal subtree.

A keyboard or switch user who opens "Subscribe to alerts" is stuck until they reload the page. This is a hard Level A failure and the reason automated-only testing is not sufficient here — the trap is *well-formed code doing the wrong thing*, which is invisible to a rule engine.

**Fix:** add a visible close button inside the dialog, handle `Escape` to close, and return focus to `#open` on close.

### 2. Beach status is conveyed by color alone — `widget.html`, `.status-list`
**WCAG 1.4.1 Use of Color (Level A)** and **1.1.1 Non-text Content (Level A).**

The open/closed dots are empty `<span>` elements styled with `background`. They carry the entire meaning of the page and have no accessible name. The accessibility tree reads:

```
"Pillar Point"   "Half Moon Bay"   "Montara"
```

No status whatsoever. A screen reader user cannot learn that Half Moon Bay is closed — on a beach-safety page. Colorblind users are also affected: green and red at these values are the classic confusable pair.

Note the dots *pass* non-text contrast (1.4.11): green 5.13:1, red 5.62:1 against white. Contrast is fine; the information is simply absent.

**Fix:** add visible text ("Open" / "Closed") next to each dot, or at minimum a visually-hidden text span. Don't rely on `aria-label` on a `<span>` — it's unreliable on non-interactive generic elements.

### 3. Video has no captions — `media.html` line 20
**WCAG 1.2.2 Captions (Prerecorded) (Level A).** Confirmed: the `<video>` contains zero `<track>` elements. The copy describes it as "a five-minute narrated walkthrough," so there is substantial spoken content with no text equivalent. Add a `<track kind="captions" srclang="en">` pointing at a WebVTT file.

### 4. Promo image missing `alt` — `forms.html` line 19
**WCAG 1.1.1 (Level A).** `<img class="promo" src="promo-banner.png" />` has no `alt` attribute at all — screen readers will announce the filename. If it's decorative use `alt=""`; otherwise describe it (see "needs a person" below).

### 5. Search button has no accessible name — `forms.html` line 29
**WCAG 4.1.2 Name, Role, Value (Level A).** `#do-search` contains only an `aria-hidden="true"` SVG, so its accessible name is empty. It announces as just "button." Add `aria-label="Search"`.

---

## Serious — fix before launch

### 6. Disclaimer text contrast 2.32:1 — `forms.html`, `.disclaimer`
**WCAG 1.4.3 Contrast (Minimum) (Level AA).** `#aaaaaa` on `#ffffff` at 16px/400 measures **2.32:1**; AA requires 4.5:1. Darkening to `#767676` gives 4.54:1 and passes. This is legally-relevant text (privacy and unsubscribe terms), so it matters more than typical fine print.

### 7. Placeholder used as the only label — `forms.html` line 22
**WCAG 3.3.2 Labels or Instructions (Level A)** and **1.3.1.** `<input id="email-input" type="text" placeholder="you@example.com">` has no `<label>`, `aria-label`, or `aria-labelledby`. The placeholder vanishes on first keystroke, and at typical placeholder rendering it also fails contrast. Add a real `<label for="email-input">`.

Same element, two additional defects worth fixing in the same edit:
- `type="text"` should be `type="email"` (correct keyboard on mobile, native validation).
- It has **no `name` attribute**, so the field will not submit — likely a functional bug, not just an a11y one.

---

## Moderate

### 8. Missing `autocomplete` on personal-data fields
**WCAG 1.3.5 Identify Input Purpose (Level AA)** — this is an AA criterion and applies to your launch target. All three verified as `null`:
- `forms.html` `#email-input` → `autocomplete="email"`
- `widget.html` `#m-email` → `autocomplete="email"`
- `widget.html` `#m-zip` → `autocomplete="postal-code"`

### 9. Background stays reachable while the modal is open — `widget.html`
Verified: `#open` remains tabbable and non-inert with the dialog showing. `aria-modal="true"` is set, which hides the background from *some* screen reader virtual cursors, but it does not manage the tab order and support is inconsistent. Add `inert` to the page content (or `aria-hidden`) while the dialog is open. Largely mooted once the keyboard trap is fixed properly, but worth doing correctly.

### 10. Star toggle exposes no state — `media.html` line 29
`#fav` has `aria-label="Save for later"` but no `aria-pressed` and no `role`. Verified `favHasAriaPressed: false`. If it's a toggle, users can't tell whether the guide is saved. Use `aria-pressed="true|false"` and keep it in sync.

---

## Done well — keep these

Worth stating so they don't get refactored away:

- **`clean.html` is a genuinely good page.** Working skip link that becomes visible on focus, `<nav aria-label="Primary">`, correct h1→h2 heading order, a real `<label>`, a `:focus-visible` style, and genuinely descriptive alt text on the tide chart that conveys the *data*, not just "chart." This is the standard for the rest of the site.
- **`media.html` live region is correct.** `#cart-status` has `role="status"` + `aria-live="polite"` and is present in the DOM at load, then populated on click. That's the right pattern — regions injected after the fact often don't announce.
- **Target sizes all pass 2.5.8 (new in WCAG 2.2).** Measured: `#do-search` 32×42, `#fav` 42×44, `#add` 105×42 — all clear the 24×24 minimum.

---

## Needs a person — I could not determine these

These are genuinely undecidable by tooling or by me, and several are AA criteria you're on the hook for:

1. **Alt text for `promo-banner.png`.** The asset doesn't render (placeholder background). Someone who can see it must decide whether it's decorative (`alt=""`) or informative, and if informative, what it says — especially if it contains text or an offer.
2. **Caption accuracy** (1.2.2). Captions must be verified against the actual audio by a human — including speaker identification and relevant non-speech sound. Auto-generated captions are not sufficient for conformance.
3. **Audio description** (1.2.3 Level A / **1.2.5 Level AA**). This is the one most likely to be missed. A "narrated walkthrough of notable tides" almost certainly shows tide curves and charts visually. If the narration doesn't already speak that information, you need an audio description track to meet AA. Someone must watch it and judge.
4. **Is `#fav` even wired up?** I found no event listener on it anywhere — only `#add` has one. It may be non-functional. Confirm intended behavior before deciding how to expose its state.
5. **Screen reader smoke test.** Once the widget fixes land, run `widget.html` through VoiceOver or NVDA end to end. Dialog semantics, focus return, and status announcements are areas where correct-looking markup still behaves badly in practice.
6. **Reflow and zoom** (1.4.10, AA). I tested at default viewport only. Verify at 320px width and 400% zoom, particularly the fixed `max-width: 320px` modal.

---

## Suggested order

1. `widget.html` modal — Escape handler, close button, focus return (#1). **Blocker.**
2. `widget.html` status dots — add text (#2). **Blocker.**
3. `forms.html` — alt, button name, label + `name` + `type=email` (#4, #5, #7). Quick, mechanical.
4. `media.html` — captions track (#3), pending the human caption work.
5. Contrast (#6), autocomplete (#8), inert (#9), `aria-pressed` (#10).
6. Human verification pass on the six items above.

Items 3, 5, 6, 8 are mechanical and safe to fix immediately. Items 1 and 2 need real design decisions about the widget. I've made no edits to any files — say the word and I'll implement the mechanical fixes and re-verify.
