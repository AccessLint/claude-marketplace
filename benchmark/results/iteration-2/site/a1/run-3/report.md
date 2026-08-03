# Accessibility audit — Coastal Almanac (pre-launch)

**Scope:** `clean.html`, `forms.html`, `widget.html`, `media.html` at `http://127.0.0.1:8000`, audited against the live DOM with the AccessLint engine (WCAG 2.2 AA), plus manual source review and interactive keyboard testing in Chrome.

## Summary

**7 blocking issues, 3 serious, 4 moderate/minor.**

| Page | Automated | After manual review |
|---|---|---|
| clean.html | 0 | 0 — genuinely clean |
| forms.html | 4 | 5 |
| widget.html | **0** | **4 (2 blocking)** |
| media.html | 1 | 3 |

**The headline:** `widget.html` passed automated checks with zero violations and contains the two worst problems on the site — an inescapable keyboard trap and the beach open/closed status being conveyed by color alone. Neither is mechanically detectable, so an automated gate would have shipped both. Do not read "0 violations" on that page as "done."

Most impactful patterns:
1. A modal that keyboard users cannot exit at all (verified interactively).
2. Core page information encoded only in red/green dots with no text equivalent.
3. Missing text alternatives across media and images (video captions, image alt, icon-button name).

---

## Critical — blocks access, fix before launch

### 1. Subscribe modal is an inescapable keyboard trap
- **WCAG:** 2.1.2 No Keyboard Trap (Level A) — also 2.4.3 Focus Order
- **File:** `widget.html:35-64`
- **Verified interactively**, not inferred. I opened the modal and confirmed:
  - Escape does nothing — modal stays open (no `keydown` branch for it; the handler only handles `Tab`).
  - There is no close/dismiss button — the only button in the dialog is "Subscribe".
  - Tab from the last element (`#m-submit`) wraps to `#m-email`. Focus never leaves the dialog.
- **Impact:** Once a keyboard, switch, or screen reader user activates "Subscribe to alerts," they are stuck permanently. The only way out is closing the browser tab. Browser-chrome escapes like F6 don't count — 2.1.2 requires exiting via the content itself. This is the single most severe issue on the site.
- **Fix:** Add all three:
  - An Escape handler that sets `modal.hidden = true`.
  - A visible Close button in the dialog.
  - On close, return focus to the `#open` trigger (`document.getElementById("open").focus()`).

### 2. Beach open/closed status is conveyed by color alone
- **WCAG:** 1.4.1 Use of Color (Level A) **and** 1.1.1 Non-text Content (Level A)
- **File:** `widget.html:26-30` (`.dot.open` / `.dot.closed`, `widget.html:17-18`)
- **Verified:** the accessible text of the three list items is exactly `["Pillar Point", "Half Moon Bay", "Montara"]`. The status is **entirely absent** from the accessibility tree — the dots are empty `<span>`s with no text, label, or role.
- **Impact:** This is the page's whole purpose. A screen reader user learns three beach names and nothing about whether any is open. Sighted users with red/green color vision deficiency (~8% of men) can't reliably distinguish `#2e7d32` from `#c62828` either.
- **Fix:** Add a visible text status, not just an ARIA label — an `aria-label` alone would satisfy 1.1.1 but still fail 1.4.1 for sighted colorblind users:
  ```html
  <li><span class="dot open" aria-hidden="true"></span> Pillar Point — <span class="status">Open</span></li>
  ```
  A distinct shape per state (✓ / ✕) alongside the color also works.
- *Note:* the dot colors themselves pass 1.4.11 non-text contrast (5.13:1 and 5.62:1 on white). Color choice isn't the problem; sole reliance on it is.

### 3. Video has no captions
- **WCAG:** 1.2.2 Captions (Prerecorded) (Level A)
- **File:** `media.html:20-23`
- No `<track kind="captions">` on a video described as "a five-minute narrated walkthrough." All narration is inaccessible to deaf and hard-of-hearing users.
- **Fix:** `<track kind="captions" src="recap.vtt" srclang="en" label="English" default>`

### 4. Promo image missing `alt`
- **WCAG:** 1.1.1 Non-text Content (Level A)
- **File:** `forms.html:19`
- **Fix:** Add `alt`. If purely decorative, `alt=""`. Needs a human who knows what the banner depicts — see manual list.

### 5. Search button has no accessible name
- **WCAG:** 4.1.2 Name, Role, Value (Level A); 2.4.4 Link/Button Purpose
- **File:** `forms.html:29-34`
- The button's only content is an `aria-hidden="true"` SVG, so its accessible name is empty. Screen readers announce "button" with no indication of purpose.
- **Fix:** `<button id="do-search" type="submit" aria-label="Search">` (keep the SVG `aria-hidden`).

---

## Serious

### 6. Disclaimer text fails contrast at 2.32:1
- **WCAG:** 1.4.3 Contrast (Minimum) (Level AA) — requires 4.5:1
- **File:** `forms.html:9` (`.disclaimer { color: #aaaaaa }` on white)
- This is your privacy and unsubscribe commitment — content users specifically look for. **Fix:** darken to at least `#767676` (4.54:1).

### 7. Email field uses placeholder as its only label
- **WCAG:** 3.3.2 Labels or Instructions (Level A); 4.1.2
- **File:** `forms.html:22`
- Placeholder text vanishes on typing, leaving no persistent label, and support across screen readers is inconsistent.
- **Fix:** Add a real `<label for="email-input">Email address</label>`.

### 8. Personal-data inputs missing `autocomplete`
- **WCAG:** 1.3.5 Identify Input Purpose (Level AA)
- **Files:** `forms.html:22` (email), `widget.html:38` (email), `widget.html:40` (ZIP)
- Not caught by the automated pass, but it's an AA requirement and directly affects users with motor and cognitive disabilities who rely on autofill.
- **Fix:** `autocomplete="email"` and `autocomplete="postal-code"` respectively.

---

## Moderate / Minor

- **`#fav` star button exposes no state** (`media.html:29`) — labeled "Save for later" but has no `aria-pressed` and, notably, **no click handler at all**. Users can't tell whether it's saved. Confirm intent, then add `aria-pressed` toggling. *(4.1.2)*
- **Modal background isn't inert** (`widget.html:35`) — `aria-modal="true"` is set and handles most modern screen readers, but background content stays in the DOM tab order. Worth adding `inert` to the page wrapper when open. Fold into the fix for issue #1.
- **`list-style: none` strips list semantics** (`widget.html:14`) — in Safari/VoiceOver this removes the "list, 3 items" announcement. Add `role="list"` to `.status-list`.
- **`#email-input` has no `name` attribute** (`forms.html:22`) — not a WCAG issue, but the value won't be submitted. Likely a real functional bug. It's also `type="text"` rather than `type="email"`, which costs mobile users the right keyboard.
- **Redundant but harmless:** `role="status"` already implies `aria-live="polite"` (`media.html:33`).

---

## What still needs a person

These can't be settled by tooling or by me, and several need the real media assets — **all four referenced assets (`chart.png`, `promo-banner.png`, `recap.mp4`, `recap-poster.jpg`) currently return 404**, so anything depending on their real content is unverified.

1. **Audio description for the video** *(1.2.5, Level AA — in scope for your AA target)*. A narrated tide walkthrough almost certainly shows charts and footage carrying information the narration doesn't state. Someone must watch it and judge whether description is needed. Captions alone do **not** satisfy this at AA.
2. **Caption accuracy** once the track exists — auto-generated captions rarely pass for domain terms like station names and tide heights.
3. **Alt text for `promo-banner.png`** — requires knowing what it shows and whether it's informative or decorative.
4. **Is `#fav` meant to be a toggle?** It currently does nothing. The fix differs depending on intent.
5. **Reflow at 320px** *(1.4.10, AA)* — `clean.html:42`'s chart image has no `max-width` constraint. With a real wide `chart.png` this will likely force horizontal scrolling. Re-test once the asset is in. (`media.html`'s video is correctly capped at `max-width: 100%`.)
6. **Screen reader pass on the cart live region** — the markup is right, but whether the announcement lands well in NVDA/VoiceOver is worth 5 minutes of real testing.
7. **End-to-end keyboard walkthrough** after the modal fix, to confirm focus returns cleanly and the dialog is fully operable.

**WCAG 2.2 additions I did check and found no problems with:** 2.5.8 Target Size (the `#fav` and `#do-search` buttons both compute to roughly 32px, clearing the 24×24 minimum; nav links qualify for the inline-text exception), 2.4.11 Focus Not Obscured, 2.5.7 Dragging Movements (no drag interactions), and 3.3.7/3.3.8 (no authentication or multi-step forms).

---

## Recommendations

- **Don't gate launch on the automated score alone.** `widget.html` scored perfectly while containing a total keyboard blocker. Pair every automated run with a keyboard pass and a check for color-only meaning — those two manual checks would have caught both critical misses here.
- **Build one dialog component and use it everywhere.** The trap exists because focus management was hand-rolled. A single tested implementation (or the native `<dialog>` element, which gives you Escape, focus restoration, and inertness for free) removes this whole class of bug. Native `<dialog>` is the strongest option here.
- **Establish a status-indicator pattern** that pairs color with text or shape, so the red/green problem doesn't reappear as the site grows.
- **Add `autocomplete` to your form field conventions** — it's cheap, it's AA, and it's easy to forget.
- **Move `:focus-visible` into a shared stylesheet.** Three of four pages define it; `forms.html` doesn't. The UA default ring still satisfies 2.4.7 there, so it's not a violation — but the inconsistency will bite as pages multiply.

## Positive findings

- **`clean.html` is legitimately clean** and is a good template for the rest: working skip link, `nav` landmark with `aria-label`, correct heading order, properly labeled search input, visible focus styles, and link contrast well above AA.
- **The chart alt text in `clean.html:44` is excellent** — it conveys the actual data ("two highs near 1.8 m at 06:10 and 18:40…") rather than restating the title. That's the standard to hold new images to.
- **The dialog's ARIA wiring is correct** — `role="dialog"`, `aria-modal`, `aria-labelledby`, and focus moved inward on open. The structure is right; it's only the exit path that's missing.
- **The cart status live region is well formed** (`media.html:33`) — polite, present in the DOM before the update, and populated by text change. Textbook.
- **Semantic HTML throughout** — real `<button>`, `<form>`, `<main>` landmarks, and correct heading hierarchy on every page. The foundation is solid; the failures are localized and all fixable.
