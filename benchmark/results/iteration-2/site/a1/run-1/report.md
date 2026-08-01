# Accessibility audit — Coastal Almanac (WCAG 2.2 AA)

**Scope:** 4 pages served from `/private/tmp/claude-501/-Users-cameron-Developer-accesslint-org-skills--claude-worktrees-skill-suite-familiarization-7bfe4c/47d7d54a-984d-4eea-8d6c-41b3232ec393/scratchpad/serve/` — `clean.html`, `forms.html`, `widget.html`, `media.html`. Method: AccessLint engine against the live DOM (all 4 pages), plus manual source review and hands-on keyboard testing in Chrome. No files were edited.

## Summary

- **4 critical, 4 serious, 3 moderate** (after deduplication)
- **Do not ship `widget.html`.** It has a hard keyboard trap that permanently strands keyboard and screen-reader users. The automated engine reported **zero** violations on that page — it was found only by driving the page by keyboard.
- The other two failing pages (`forms.html`, `media.html`) are mostly quick mechanical fixes, except the video captions.
- `clean.html` passed both the engine and my manual review. It's a good model for the rest of the site.

**Automated coverage caveat, up front:** the engine passed `widget.html` and `clean.html` identically, but one is genuinely clean and the other contains the worst bug on the site. Treat a clean engine run as necessary, not sufficient.

---

## Critical (blocks access)

### 1. Keyboard trap in the subscribe dialog — no way out, ever
- **WCAG:** 2.1.2 No Keyboard Trap (Level A) — also fails 2.4.3 Focus Order
- **File:** `serve/widget.html:35-64` (the `#modal` dialog and its `keydown` handler)
- **Verified behavior:** I opened the dialog and tabbed through it. Focus cycles `m-email → m-zip → m-submit → m-email → m-zip …` indefinitely. `Escape` does **not** close it (`modal.hidden` stayed `false`). There is no close button anywhere in the dialog (`hasCloseButton: false`). The trap handler at line 51 implements the wrap-around but never implements an exit.
- **Fix:** Add an `Escape` keydown handler that sets `modal.hidden = true`, add a visible close button (`<button aria-label="Close">`), and return focus to `#open` on dismiss. Consider replacing the hand-rolled dialog with the native `<dialog>` element, which gives you Escape-to-close, focus trapping, and background inertness for free.
- **Why critical:** A keyboard-only or screen-reader user who opens this dialog cannot reach the rest of the page, the browser chrome, or anything else without closing the tab. This is the single most severe class of accessibility failure and a well-known legal-risk item.

### 2. Image missing an `alt` attribute
- **WCAG:** 1.1.1 Non-text Content (Level A)
- **File:** `serve/forms.html:19` — `<img class="promo" src="promo-banner.png" />`
- **Fix:** *Contextual — needs a human decision.* If the banner carries information (an offer, a headline), write `alt` describing it. If it's purely decorative, use `alt=""`. Do not omit the attribute — screen readers fall back to reading the filename.
- **Why critical:** With no `alt`, the announcement is the raw filename, which is noise.

### 3. Icon-only search button has no accessible name
- **WCAG:** 4.1.2 Name, Role, Value (Level A); 2.4.4 Link/Button Purpose
- **File:** `serve/forms.html:29-34` — `<button id="do-search" type="submit">` containing only an `aria-hidden="true"` SVG
- **Fix:** Add `aria-label="Search"` to the button. The `aria-hidden` on the SVG is correct and should stay; the button just needs its own name.
- **Why critical:** The button announces as "button" with no indication of purpose. The magnifier is a visual-only cue.

### 4. Video has no captions
- **WCAG:** 1.2.2 Captions (Prerecorded) (Level A)
- **File:** `serve/media.html:20-23` — confirmed `0` `<track>` elements on the live element
- **Fix:** Author a WebVTT file and add `<track kind="captions" src="recap.vtt" srclang="en" label="English" default>`. Captions must include dialogue **and** meaningful sound effects.
- **Why critical:** The page describes this as "a five-minute **narrated** walkthrough" — the audio carries the entire payload. Deaf and hard-of-hearing users get nothing.

---

## Serious

### 5. Beach open/closed status is conveyed by color alone
- **WCAG:** 1.4.1 Use of Color (Level A); also 1.1.1 — the engine missed this entirely
- **File:** `serve/widget.html:26-30` and the `.open` / `.closed` CSS at lines 17-18
- **Verified:** each `<li>` exposes only the beach name. The status dots are empty `<span>`s with no text content and no accessible name, so the accessible name of every row is just `"Pillar Point"`, `"Half Moon Bay"`, `"Montara"` — **open vs. closed is completely absent from the accessibility tree.**
- **Compounding:** green `#2e7d32` vs. red `#c62828` have a contrast ratio of **1.10:1 against each other**. They're nearly identical in luminance, so red-green colorblind users (~8% of men) can't reliably tell them apart visually either.
- **Fix:** Add text to each row — e.g. `<span class="dot open"></span> Pillar Point <span>Open</span>` — or give each dot a visually-hidden label. Adding a shape/icon difference in addition to hue would help the colorblind case.
- **Why serious:** This isn't a degraded experience, it's total information loss for the page's primary content. A user could conclude a closed beach is open.

### 6. Insufficient text contrast on the disclaimer
- **WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
- **File:** `serve/forms.html:9` (`.disclaimer { color: #aaaaaa; }`), applied at line 37
- **Measured:** **2.32:1** against white; 4.5:1 required for normal-size text.
- **Fix:** Darken to at least `#767676` (4.54:1) — or `#595959` for comfortable margin. Note this text contains the unsubscribe/privacy promise, so it's content users actually need.

### 7. Email field uses a placeholder as its only label
- **WCAG:** 3.3.2 Labels or Instructions (Level A); 4.1.2
- **File:** `serve/forms.html:22` — `<input id="email-input" type="text" placeholder="you@example.com" />`
- **Fix:** Add a real `<label for="email-input">Email address</label>`. The placeholder can stay as supplementary format hint.
- **Why serious:** The placeholder vanishes on first keystroke, so users lose the field's purpose mid-entry — hardest on users with cognitive disabilities and anyone returning to a partly-filled form. Placeholder text is also typically rendered at low contrast.

### 8. Narrated video has no audio description or transcript
- **WCAG:** 1.2.5 Audio Description (Prerecorded) (Level AA) — not machine-detectable, found by review
- **File:** `serve/media.html:20-24`
- **Fix:** Provide an audio-described track, or (often more practical) a full text transcript adjacent to the player covering both narration and on-screen visuals.
- **Why serious:** This is a distinct AA requirement from captions (#4). A walkthrough of tide charts is inherently visual, so blind users need the visual content narrated or transcribed. Fixing captions alone does **not** close this.

---

## Moderate

- **Missing `autocomplete` on personal-data fields — WCAG 1.3.5 Identify Input Purpose (AA).** `serve/forms.html:22` (`#email-input`) and `serve/widget.html:38,40` (`#m-email`, `#m-zip`) collect the user's own information but declare no `autocomplete`. Add `autocomplete="email"` and `autocomplete="postal-code"`. Helps users with motor and cognitive disabilities avoid re-typing.
- **Email field typed as `text` — `serve/forms.html:22`.** Use `type="email"` for the correct mobile keyboard and built-in validation. (`widget.html:38` gets this right.)
- **Dialog semantics are incomplete — `serve/widget.html:33,35`.** The trigger has no `aria-expanded` / `aria-haspopup="dialog"` (verified `triggerHasExpanded: false`), focus is never restored to the trigger on close, and background content isn't made `inert`, so `aria-modal="true"` is doing all the work alone. Largely resolved for free by switching to native `<dialog>` per fix #1.

---

## Recommendations

**Preventing recurrence**
- The two label failures, the missing `alt`, and the missing button name are all "an element shipped without an accessible name." A single shared form-field and icon-button component that *requires* a label/name parameter would make these unrepresentable rather than merely lint-able.
- Adopt native `<dialog>` as the house pattern. Every dialog bug found here is something the platform already solves.
- Add an automated a11y check to CI (`npx @accesslint/cli` against your dev server) to catch the mechanical class of issue on every PR. Budget it as a floor, not a ceiling — it would have passed `widget.html`.
- Colors: `#0b5394` (7.84:1) and `#1a1a1a` (17.4:1) are solid. `#aaaaaa` is the only failing token. Consider pinning an approved palette so `#aaaaaa` can't reappear.

**What still needs a person to verify**
1. **Is `promo-banner.png` informative or decorative?** I can't decide this for you — and the asset currently 404s (see below), so I couldn't inspect it. This determines whether #2 gets descriptive alt text or `alt=""`.
2. **Caption and transcript content** for `recap.mp4` must be authored by a human from the actual audio/video. Nothing can generate this from the markup.
3. **Screen-reader pass** (VoiceOver/NVDA) on `widget.html` after the dialog fix — confirm the dialog announces on open, the status list reads open/closed correctly, and focus lands and returns sensibly.
4. **Consistent navigation — WCAG 3.2.3 (AA).** `clean.html` has a skip link and a primary `<nav>`; the other three pages have **no site navigation at all**. If these are real pages in one site, that's an AA failure and users can get stranded. If they're isolated test fixtures, disregard. I couldn't tell which from the markup, so please confirm.
5. **Target size — WCAG 2.5.8 (AA, new in 2.2).** The search and star buttons compute above the 24×24px minimum at desktop width, but verify at mobile breakpoints and with real touch targets.
6. **Live-region announcement timing** on `serve/media.html:33` — the implementation is correct (region present at load, populated on click), but confirm it actually announces in a real screen reader and isn't too terse.

**Note on assets:** every referenced media file 404s (`promo-banner.png`, `chart.png`, `recap.mp4`, `recap-poster.jpg`). That's expected if these are fixtures, but it means image and video findings were assessed from markup and context only — re-check #2, #4, and #8 once real assets are in place.

## Positive findings

- **`clean.html` is genuinely clean** — engine-clean *and* review-clean. It has a working skip link, a labeled `<nav aria-label="Primary">`, proper header/main/footer landmarks, correct heading order, a real `<label>` bound to its input, a descriptive link ("Report an error" rather than "click here"), and genuinely good `alt` text on the tide chart that conveys the actual data values instead of just naming the image. Use it as the template.
- Consistent, visible `:focus-visible` styling (3px, offset) on three of four pages — an easy thing to get wrong.
- `media.html` gets several subtle things right: the star button carries `aria-label="Save for later"` despite being icon-only, and the cart status live region is correctly present in the DOM at page load rather than being injected on demand (a very common bug that silences announcements).
- Correct `aria-hidden="true"` on the decorative search SVG in `forms.html` — the markup instinct is right, it just needs the accompanying button name.
- Body text contrast (17.4:1) and link contrast (7.84:1) are comfortably above requirement.

**Suggested ship order:** #1 (blocker) → #3, #7, #5 (fast, high impact) → #2, #6 → #4 and #8 (need authored content, start now since they have the longest lead time).
