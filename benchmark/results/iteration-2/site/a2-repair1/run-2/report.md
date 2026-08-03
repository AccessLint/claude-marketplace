# Accessibility audit — Coastal Almanac (http://localhost:8002)
WCAG 2.2 Level AA · WCAG-EM · 5 states evaluated across 4 pages (the complete site)

## Scope
- **Target & boundary:** the four static pages served at `http://localhost:8002` — `clean.html`, `forms.html`, `widget.html`, `media.html` — plus the one stateful view they contain (the alerts dialog on `widget.html`). Source on disk: `/private/tmp/claude-501/-Users-cameron-…-7bfe4c/6212579b-…/scratchpad/repair1/fixtures/`. **Goal:** WCAG 2.2 AA.
- **Technologies in use:** static HTML5, inline CSS, vanilla JS. No framework, no build step, no router. `<video>` with native controls; one hand-rolled `role="dialog"` modal; one `role="status"` live region.
- **AT baseline for the human handoff (scoped here, not tested here):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS and iOS; keyboard-only without a screen reader; 200–400% browser zoom with low vision.
- **Not covered:** all four referenced media assets return **404** (`promo-banner.png`, `chart.png`, `recap.mp4`, `recap-poster.jpg`), so no image or video *content* was assessed — only its markup. Form endpoints `/subscribe` and `/search` are not served, so no error/validation state could be exercised.

## Sample
Because the site is only four pages, this is a **census, not a sample** — every page and every distinct state was evaluated.
- **Structured:** `clean.html` — entry/content template, the only page with full site chrome. `forms.html` — the signup + search flow, two forms and an image. `widget.html` — the only custom widget (APG Modal Dialog) and the only status-indicator pattern. `media.html` — the only time-based media and the only live region. `widget.html` **with the alerts dialog open** — a distinct state reachable only by interaction; the automated tier cannot see it (`#modal[hidden]` at load).
- **Random:** n/a — the structured set already covers 100% of the site.

## Conformance (per success criterion)
- **Pass ●: 21** · **Fail ●: 8** · **Undetermined (◐/○): 11** · N/A: remainder
- Pass/fail is asserted only for ● criteria; ◐ and ○ are undetermined and go to a person.
- **Failed (●):** 1.1.1, 1.2.2, 1.3.1, 1.3.5, 1.4.3, 2.1.2, 2.4.3, 4.1.2. One page failing an SC fails it for the whole scope.
- **Passed (●), notably:** 1.4.10 reflow (no horizontal scroll at 320 px on any page, dialog open included), 1.4.12 text spacing (no clipping under the WCAG override), 2.5.8 target size (all targets ≥ 24 px, or meeting the spacing exception — nav links are 19 px tall but 54 px apart centre-to-centre), 3.1.1 `lang`, 2.4.2 unique page titles, 1.4.11 non-text contrast on the status dots and icon button.
- **`clean.html` is clean** on both tiers — it is the template the other three pages should be following.

## Findings — by severity, tagged by evidence basis

### Critical
- **[●] The alerts dialog is a keyboard trap with no exit** — SC 2.1.2 (also 2.4.3) — where: `widget.html`, `div#modal[role=dialog][aria-modal=true]` — tier: inspect
  repro: activate `button#open` → focus lands on `#m-email`; `Tab` cycles `#m-email → #m-zip → #m-submit → #m-email` indefinitely (the handler `preventDefault()`s at both ends). `Escape` does nothing — after the keypress, `modal.hidden === false` and `activeElement === "m-email"`. There is **no close control in the dialog at all** (`#modal [aria-label*=close], #modal .close` → 0 matches), and `#m-submit` has no click handler. A keyboard user who opens this dialog cannot get back to the page without reloading. → `accessibility-fix`
- **[●] Search submit button has no accessible name** — SC 4.1.2 — where: `forms.html`, `button#do-search` — tier: scan (`labels-and-names/button-name`)
  Its only content is an `aria-hidden="true"` SVG, so the button exposes an empty name. The archive search is unusable non-visually.
- **[●] Promo image has no `alt` attribute** — SC 1.1.1 — where: `forms.html`, `main > img.promo` — tier: scan (`text-alternatives/img-alt`)
  Not `alt=""` — the attribute is absent entirely, so the filename gets announced. Needs a real alt, or `alt=""` if it is decorative. **NEEDS HUMAN** (content decision).
- **[●] Video has no captions** — SC 1.2.2 — where: `media.html`, `main > video` — tier: scan (`time-based-media/video-captions`)
  Zero `<track>` children. The page describes it as "a five-minute narrated walkthrough", so the audio carries content.

### Serious
- **[●] Disclaimer text fails contrast at 2.32:1** — SC 1.4.3 — where: `forms.html`, `p.disclaimer` (`#aaaaaa` on `#ffffff`; 4.5:1 required) — tier: scan
  This is the text that states the privacy and unsubscribe terms. `#767676` or darker clears AA at this size.
- **[●] Email field is labeled only by its placeholder** — SC 3.3.2 (and 4.1.2) — where: `forms.html`, `input#email-input` — tier: scan
  `element.labels.length === 0`; the computed name is `"you@example.com"`. The label also vanishes once the user starts typing.
- **[◐] Beach open/closed status is carried by color alone** — SC 1.4.1 — where: `widget.html`, `span.dot.open` / `span.dot.closed` — tier: inspect
  evidence (●, a 1.3.1 fact): the accessibility tree for the status list contains only `StaticText " Pillar Point"`, `" Half Moon Bay"`, `" Montara"` — the dots have no text, no `aria-label`, and no `role`, so *no* open/closed status is exposed programmatically. That absence is deterministic and independently a 1.3.1 failure (counted in the ● fails above).
  opinion: the green/red dots are identical in size, shape, and position, so color appears to be the sole visual carrier — but that is a look, not a measurement. **confirm:** a person checks whether anything else on the page distinguishes open from closed. Safety-relevant either way.
- **[◐] No transcript or audio description for the narrated video** — SC 1.2.3 (A), 1.2.5 (AA) — where: `media.html` — tier: inspect
  evidence: zero `<track kind="descriptions">`, and no transcript or media-alternative link anywhere on the page.
  **confirm:** whether a transcript exists elsewhere in the product and just isn't linked here.

### Moderate
- **[●] Input purpose is not programmatically identifiable on user-info fields** — SC 1.3.5 — where: `forms.html` `input#email-input` (`type="text"`, no `autocomplete`); `widget.html` `input#m-email` (no `autocomplete="email"`), `input#m-zip` (no `autocomplete="postal-code"`) — tier: inspect
  Autofill and symbol-based personalization can't identify these fields. `#email-input` should also be `type="email"`.
- **[◐] The ★ "Save for later" button exposes no state and appears unwired** — SC 4.1.2 — where: `media.html`, `button#fav` — tier: inspect
  evidence: no `aria-pressed`; the page's only script binds a listener to `#add` and nothing to `#fav`, so activating it changes nothing observable.
  opinion: this reads as an unfinished toggle. **confirm:** whether it's meant to toggle (then it needs `aria-pressed` maintained on click) or is dead markup to remove.
- **[◐] Page structure is inconsistent across the site** — SC 1.3.1, 2.4.1, 3.2.3 — where: `forms.html`, `widget.html`, `media.html` — tier: inspect
  evidence: `clean.html` has `header` / `nav[aria-label="Primary"]` / `main` / `footer` plus a working skip link; the other three expose **only** `main` — no banner, no navigation, no contentinfo, no skip link, and no way to get back to the rest of the site.
  opinion: likely a template that wasn't applied to the inner pages rather than a deliberate choice. **confirm:** whether these pages are meant to ship without site chrome.

### Minor
- **[◐] Status list loses its list semantics** — SC 1.3.1 — where: `widget.html`, `ul.status-list` (`list-style: none`) — tier: inspect
  evidence: the accessibility tree shows three bare `StaticText` nodes with no list or listitem structure, so the "3 items" cue is gone.
  opinion: low impact once each item carries its own status text; `role="list"` restores it if you keep `list-style: none`.

## Human-required (○) — the testing handoff
- **Add-to-cart status announcement** — SC 4.1.3 — `media.html #cart-status`. Verified ●: `role="status" aria-live="polite"` is present and its `textContent` is set to "Field guide added to your cart." on click. Whether it *announces*, and whether it interrupts, is AT-only.
  needs: screen-reader users (blind / low-vision, per Section 508 FPC) · flow: load `media.html` → activate "Add to cart" (exercised above)
- **Alerts dialog announcement and operability** — SC 4.1.2, 2.4.3 — `widget.html #modal`. Re-test after the keyboard trap is fixed: does the dialog announce on open, is the background correctly silenced by `aria-modal`, does focus return to `#open` on close.
  needs: screen-reader users · flow: activate "Subscribe to alerts" → complete or dismiss
- **Alt-text and caption adequacy** — SC 1.1.1, 1.2.2 — the `chart.png` alt on `clean.html` is long and specific, but the asset 404s so it could not be compared against the image; caption accuracy on `recap.mp4` likewise cannot be judged until the file exists.
  needs: sighted review against the real assets, plus a captioning reviewer
- **Form error identification and recovery** — SC 3.3.1, 3.3.3 — `/subscribe` and `/search` are not served, so no invalid-input state could be reached. **Undetermined, not passing.** Re-run this tier against an environment where submission works.
  needs: keyboard-only and screen-reader users · flow: submit the newsletter form empty and with a malformed address
- **Plain-language comprehension and cognitive load** — SC 3.1.5-adjacent, general — the tide-table instructions and the "add the charted depth to the tidal height" guidance are domain-dense.
  needs: users with cognitive and learning disabilities

## Recommendations
1. **Fix the dialog first.** It is the only critical that blocks a task outright with no workaround. One change clears three findings: give `#modal` a visible close button, wire `Escape` to close it, and return focus to `#open` on close (2.1.2, 2.4.3, and the 4.1.2 handoff). Keep the existing wrap logic — it is correct once an exit exists. Follow the [APG Modal Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
2. **Root-cause: `forms.html` was written without the `clean.html` template.** Four of the eight ● failures live on that one page. Applying the `clean.html` shell (header/nav/main/footer, skip link, `:focus-visible` rule, `<label>` per field) fixes the structure findings and the placeholder-label finding together.
3. **Sweep `autocomplete` across all user-info inputs** in one pass (`#email-input`, `#m-email`, `#m-zip`) — one pattern, three instances, 1.3.5 cleared.
4. **Ship-blockers:** the four criticals plus the two ● serious findings. The contrast fix (`#aaaaaa` → `#767676`) and the two name fixes (`#do-search`, `img.promo`) are mechanical and take minutes; alt text and caption copy need a human author, so start those now rather than at the end.
5. **Send to human and AT testing:** the alerts flow on `widget.html` and the add-to-cart flow on `media.html` — both depend on announcements the tree cannot confirm. Restore the four 404'd assets and the two form endpoints before that round, or the same gaps will still be undetermined.
6. **Guard it:** wire `accesslint:accessibility-diff` into CI against all four pages. `clean.html` currently passes both tiers — a diff baseline keeps it that way as the site grows.
