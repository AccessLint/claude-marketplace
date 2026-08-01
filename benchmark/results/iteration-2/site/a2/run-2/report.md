# Accessibility assessment — Coastal Almanac (pre-launch)
WCAG 2.2 Level AA · WCAG-EM · 5 pages/states sampled

## Scope
- **Target & boundary:** `http://127.0.0.1:8001` — the four static pages `clean.html`, `forms.html`, `widget.html`, `media.html`, plus the subscribe-dialog open state. Source at `/private/tmp/claude-501/.../scratchpad/serve/`. **Goal:** WCAG 2.2 AA.
- **Technologies in use:** static HTML5, inline CSS, vanilla JS (no framework, no build step). Native `<video>`, one hand-rolled modal dialog, one `aria-live` status region.
- **AT baseline (for the human handoff, not tested here):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS/iOS; keyboard-only; 400% browser zoom; Windows High Contrast.

## Sample
- **Structured:** `clean.html` — entry page and the reference template (nav, search form, informative image). `forms.html` — the only signup/conversion flow. `widget.html` — custom modal dialog, the highest-risk pattern on the site. `widget.html` + dialog open — the state static scanning cannot see. `media.html` — the only page with time-based media and a live region.
- **Random:** none held back; the sample is the entire site.

## Conformance (per success criterion)
- **Fail ●: 9**  ·  **Pass ●: 11**  ·  **Undetermined (◐/○): 8**
- Pass/fail is asserted only for ●-verified criteria; ◐/○ are undetermined.
- **Failed:** 1.1.1, 1.2.2, 1.3.1, 1.3.5, 1.4.1, 1.4.3, 2.1.2, 3.3.2, 4.1.2
- **Passed:** 1.4.4, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.4.1, 2.4.2, 2.4.7, 2.5.8, 3.1.1, 4.1.3 (structure only)

**The site does not currently conform to WCAG 2.2 AA.** Two failures are hard blockers.

## Findings — by severity, tagged by evidence basis

### Critical

- **[●] Keyboard trap in the subscribe dialog** — SC 2.1.2 — where: `#modal[role=dialog]`, `widget.html:35-64` — tier: inspect
  Repro (verified in-browser): activate "Subscribe to alerts" → focus moves to `#m-email`; Tab ×3 → `#m-submit`; Tab again wraps back to `#m-email`; Shift+Tab from `#m-email` wraps to `#m-submit`; **Escape leaves `modal.hidden === false`** with focus still on `#m-email`. The dialog contains no close or cancel control. Once a keyboard user opens this dialog they cannot return to the page — the only escape is reloading. → `fix`
  Fix: add an Escape handler, add a visible Close button, and restore focus to `#open` on close. Better: replace the hand-rolled trap with `<dialog>` + `showModal()`, which provides Escape, inertness, and focus restore natively.

- **[●] Beach open/closed status is conveyed by dot color alone** — SC 1.4.1 and SC 1.3.1 — where: `.status-list .dot.open` / `.dot.closed`, `widget.html:26-30` — tier: inspect
  Verified: each `.dot` span has `textContent === ""`, no `aria-label`, no `title`, no `role` — the only differentiator is `background-color` (`#2e7d32` vs `#c62828`). The accessibility tree exposes exactly `"Pillar Point"`, `"Half Moon Bay"`, `"Montara"` with no status. Whether a beach is open or closed — the entire purpose of the page — is unavailable to screen reader users and to anyone who cannot distinguish red from green. The two colors also sit at near-identical luminance (5.13:1 and 5.62:1 against white), so they are nearly indistinguishable in greyscale too. → `fix`
  Fix: add a text equivalent per row ("Open" / "Closed"), visible or visually-hidden. Both dots individually pass 1.4.11 non-text contrast — color contrast is not the problem; color being the *only* channel is.

- **[●] Video has no captions** — SC 1.2.2 (Level A) — where: `main > video`, `media.html:20-23` — tier: scan
  Zero `<track>` elements. The page describes it as "a five-minute narrated walkthrough," so spoken audio is certain. → `fix` (add `<track kind="captions" srclang="en">`; **authoring the caption file is human work**)

- **[●] Promo image has no `alt` attribute** — SC 1.1.1 — where: `main > img.promo`, `forms.html:19` — tier: scan
  The attribute is absent entirely (not `alt=""`), so screen readers may fall back to reading the filename. → `fix`
  I could not write the alt text: `promo-banner.png` 404s on this server, so there was nothing to look at. A person must decide whether it is decorative (`alt=""`) or informative (describe it).

- **[●] Search submit button has no accessible name** — SC 4.1.2 — where: `#do-search`, `forms.html:29-34` — tier: scan
  Its only content is an `aria-hidden="true"` SVG, so the computed name is empty; the a11y tree shows a bare `button` node. → `fix` (`aria-label="Search"`)

### Serious

- **[●] Email field is labelled by placeholder only** — SC 3.3.2 (also 1.3.1) — where: `#email-input`, `forms.html:22` — tier: scan
  No `<label for>`, no `aria-label`; only `placeholder="you@example.com"`, which vanishes on first keystroke. → `fix`

- **[●] Disclaimer text fails contrast at 2.32:1 (needs 4.5:1)** — SC 1.4.3 — where: `p.disclaimer`, `forms.html:9` — tier: scan
  `#aaaaaa` on `#ffffff`. → `fix` — `#767676` gives 4.54:1; darker is safer.

- **[◐] Video has no audio description or transcript** — SC 1.2.3 (A) / 1.2.5 (AA) — where: `main > video`, `media.html:20`
  evidence: no `kind="descriptions"` track, no transcript anywhere on the page. **I could not assess this properly: `recap.mp4` 404s on this server** (the a11y tree reports "Unable to play media"), so I never saw the content.
  confirm: a person watches the video and decides whether the visuals carry information the narration does not. If they do, this is a Level AA failure.

### Moderate

- **[●] Form fields missing `autocomplete` / input purpose** — SC 1.3.5 — tier: inspect
  `#email-input` is `type="text"` with no `autocomplete` (`forms.html:22`); `#m-email` and `#m-zip` have none (`widget.html:38,40`).
  Fix: `type="email" autocomplete="email"` on both email fields, `autocomplete="postal-code"` on the ZIP field.
  Separately — not a WCAG issue but it will bite you at launch: `#email-input` has **no `name` attribute**, so the subscribe form submits an empty payload.

- **[◐] Background content stays live while the modal is open** — SC 4.1.2 / 2.4.3 — where: `#modal`, `widget.html:35`
  evidence: `aria-modal="true"` and `aria-labelledby` are correctly set (so AT will hide the background), but nothing is `inert` — pointer users can still click through to the page behind it. Bundled into the `<dialog>` fix above.

- **[◐] "Save for later" star exposes no state** — SC 4.1.2 — where: `#fav`, `media.html:29`
  evidence: `aria-label="Save for later"` is present and the target is 42×44 (passes 2.5.8), but there is **no `aria-pressed` and no click handler at all** — activating it does nothing.
  confirm: is this meant to be a toggle? If yes it needs `aria-pressed` plus real behavior; if it is a placeholder, it should not ship.

- **[◐] Three of four pages have no navigation and no landmarks beyond `main`** — SC 3.2.3 / 2.4.1 — where: `forms.html`, `widget.html`, `media.html`
  evidence: only `clean.html` has `<header>`, `<nav aria-label="Primary">` and `<footer>`; the other three render a bare `<main>`. There is no way to reach the rest of the site from them.
  confirm: intentional for standalone landing pages, or an oversight? If these are site pages, add the shared header/footer.

- **[◐] Subscribe form has no validation, so error handling is untestable** — SC 3.3.1 / 3.3.3 — where: `forms.html:21-24`
  evidence: no `required`, no `type="email"`, no client-side handler — submitting empty or garbage produces no error to evaluate. Undetermined rather than passing: once validation exists it must be re-tested for programmatic association and recovery guidance.

### Minor

- **[◐] Inline nav links are 19px tall** — SC 2.5.8 — where: `header nav a` (43×19, 40×19, 44×19), `clean.html:24`
  evidence: below 24×24, but they sit in a line of text separated by "·", which plausibly triggers the **inline exception** (size constrained by line-height of non-target text). A person should confirm the exception applies. Every other control on the site passes (measured: 32×42 to 197×46).
- **[◐] `ul.status-list` uses `list-style: none`** — SC 1.3.1 — `widget.html:14`
  Chrome retains list semantics, but Safari/VoiceOver strips them from list-style-none lists. Adding `role="list"` is a one-line hedge. Verify in Safari.

## Human-required (○) — the testing handoff

- **Screen reader announcement of the cart status message** — SC 4.1.3 — `#cart-status`, `media.html:33`
  Structurally correct and ●-verified: `role="status" aria-live="polite"`, populated with "Field guide added to your cart." after activating "Add to cart", with focus correctly left on the button. Whether it actually announces, and whether the timing works, is AT-only.
  needs: screen reader users (blind / low-vision, per Section 508 FPC) · flow: Add to cart → status update (exercised above)
- **Dialog open/close announcement** — SC 4.1.2 — `#modal`, `widget.html:35`. `role="dialog"`, `aria-modal`, `aria-labelledby` all present (●). Retest after the keyboard-trap fix.
  needs: screen reader users · flow: Subscribe to alerts → dialog → close
- **Focus indicator sufficiency and focus-order coherence** — SC 2.4.7 / 2.4.3. `:focus-visible { outline: 3px solid #0b5394 }` is defined on `clean.html`, `widget.html`, `media.html` and measures 7.5:1 against white (passes 1.4.11); `forms.html` defines none and falls back to the UA ring. A sighted person should confirm both read clearly.
  needs: low-vision users · flow: tab through each page
- **Plain-language comprehension of the tide tables and boating guidance** — SC 3.1.5. Not assessable by tooling.
  needs: users with cognitive disabilities

## Recommendations

**Root-cause / pattern fixes** — four changes clear most of the list:
1. **Replace the hand-rolled modal with `<dialog>` + `showModal()`** (`widget.html`). Clears the critical keyboard trap, the inertness gap, and focus restore in one change. This is the single highest-value fix on the site.
2. **Add text equivalents to the beach status dots** (`widget.html`). Clears 1.4.1 and 1.3.1 and makes the page's core information available at all.
3. **Fix `forms.html` wholesale** — it carries 5 of the 9 failures. Real `<label>`, `type="email" autocomplete="email"` (and the missing `name`), `aria-label="Search"` on the icon button, `alt` on the promo image, darken `.disclaimer` to at least `#767676`.
4. **Add a captions track to the video** (`media.html`), and decide on audio description once someone can actually watch it.

**What to send to human and AT testing:** the subscribe dialog and the add-to-cart status flow, once fixed — both hinge on announcement behavior that only a screen reader reveals. Plus a sighted pass on focus indicators and a Safari check of the status list.

**Adopt `clean.html` as the template.** It scans clean and passed every manual checkpoint: `lang="en"`, banner/nav/main/contentinfo landmarks with exactly one `main`, an h1→h2 outline with no skips, a working skip link that becomes visible on focus, a properly labelled search field, and genuinely descriptive alt text on the tide chart. The other three pages are largely regressions from this standard.

**Wire `accesslint:diff` into CI** for all four targets so these don't come back.

## What this assessment did not cover

- **`recap.mp4` and `promo-banner.png` both 404 on this server.** I could not view either asset, so audio description (1.2.3/1.2.5) is undetermined and the promo image's alt text cannot be written until someone sees it.
- The automated tier found **zero violations on `widget.html`** — both of that page's critical failures came from the manual tier. A scanner-only check would have declared the most broken page on the site clean. Worth remembering if you gate CI on scan results alone.
- Reflow at 320px (1.4.10) and text spacing (1.4.12) were verified by measuring `scrollWidth` against `innerWidth`, not by visual inspection; both passed on every page. True browser zoom to 400% (1.4.4) is not exposed to automation and was approximated.
- No testing with real assistive technology was performed — everything in the ○ section above remains open.
