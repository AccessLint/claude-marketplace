# Accessibility assessment — Coastal Almanac (pre-launch)
WCAG 2.2 Level AA · WCAG-EM · 4 pages + 1 state sampled

## Scope

- **Target & boundary:** `http://127.0.0.1:8001/` — the four static pages `clean.html`, `forms.html`, `widget.html`, `media.html`, plus the open state of the subscribe dialog on `widget.html`. Backend endpoints (`/subscribe`, `/search`) and the site shell (if one gets wrapped around these) are outside the boundary. **Goal:** WCAG 2.2 AA.
- **Technologies in use:** static HTML, inline CSS, vanilla JS (no framework, no build). Source on disk at `/private/tmp/claude-501/…/scratchpad/serve/`.
- **AT baseline for the human handoff (scoped, not tested here):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS/iOS; keyboard-only; 400% browser zoom; Dragon or another voice-control tool for the icon-only controls.

## Sample

- **Structured (census — the scope is small enough to test every page):**
  - `clean.html` — the reference template: header/nav/main/footer, skip link, search form, informative image.
  - `forms.html` — the only page with data-entry forms and a promotional image.
  - `widget.html` — the only page with a custom widget (modal dialog) and a status list; high-risk pattern.
  - `media.html` — the only page with video, a live region, and an icon-only toggle.
  - `widget.html` **dialog-open state** — evaluated separately, because the trap only exists in that state.
- **Random:** not drawn. With a four-page site the structured set is the whole population, so a random sample adds nothing.

## Conformance (per success criterion)

Across the sample, asserted against WCAG 2.2 AA:

- **Fail ●: 8** — 1.1.1, 1.2.2, 1.3.1, 1.3.5, 1.4.1, 1.4.3, 2.1.2, 3.3.2, 4.1.2 *(9 criteria, 8 distinct defect clusters)*
- **Pass ●: 7** — 1.4.10, 1.4.12, 1.4.11, 2.4.2, 2.4.11, 2.5.8, 3.1.1
- **Undetermined (◐/○): 9** — 1.2.3, 1.2.5, 2.4.3, 2.4.4, 2.4.5, 2.4.7, 3.2.3, 3.3.1/3.3.3, 4.1.3
- **Not applicable:** 1.2.4, 2.2.1, 2.2.2, 2.3.x, 2.5.1, 2.5.7, 3.3.7, 3.3.8 (no live media, no timeouts, no motion, no drag, no auth)

Pass/fail is asserted only for ● criteria. **One page failing an SC fails it for the whole scope** — so although `clean.html` and `widget.html` returned zero automated violations, the site as a whole fails 9 criteria.

Automated tier: 94 rules, 5 violations (`forms.html` 4, `media.html` 1, `clean.html` 0, `widget.html` 0). The manual tier found 5 more, including the most severe one. That gap is the headline: **`widget.html` is lint-clean and contains a keyboard trap.**

## Findings — by severity, tagged by evidence basis

### Critical

- **[●] Keyboard trap in the subscribe dialog — SC 2.1.2 — `widget.html:35-63`**
  where: `#modal[role=dialog][aria-modal=true]` · tier: inspect
  repro: click "Subscribe to alerts" → focus lands on `#m-email`. Tab three times → back to `#m-email`. Shift+Tab → `#m-submit`. **Escape does nothing** (`modal.hidden` still `false` after keypress). The dialog has **no close or cancel button** (`#modal button` returns only `m-submit`). Focus can never leave the dialog by keyboard; the only exit is a mouse click elsewhere or reloading the page.
  fix: add a visible close button inside the dialog, handle `Escape` to set `modal.hidden = true`, and return focus to `#open` on close. Replacing the hand-rolled trap with `<dialog>` + `showModal()` gets all three for free.

- **[●] Search button has no accessible name — SC 4.1.2 — `forms.html:29`**
  where: `#do-search` · tier: scan (`labels-and-names/button-name`)
  evidence: contains only an `aria-hidden="true"` SVG; a11y tree exposes `button` with an empty name. Voice-control and screen-reader users cannot identify or invoke it.
  fix: add `aria-label="Search"` to the button.

- **[●] Promotional image missing `alt` — SC 1.1.1 — `forms.html:19`**
  where: `main > img.promo` · tier: scan (`text-alternatives/img-alt`)
  fix: **NEEDS HUMAN** — if the banner carries information, write `alt` describing it; if purely decorative, `alt=""`. Don't let me invent the copy.

- **[●] Video has no captions track — SC 1.2.2 — `media.html:20`**
  where: `main > video` · tier: scan (`time-based-media/video-captions`)
  evidence: zero `<track>` children. Content is described on-page as "a five-minute narrated walkthrough", so the audio carries the substance.
  fix: **NEEDS HUMAN** — author and attach `<track kind="captions" srclang="en">`.

### Serious

- **[●] Beach open/closed status is conveyed by color alone — SC 1.4.1, and unavailable to assistive tech at all — SC 1.3.1 — `widget.html:27-29`**
  where: `.status-list .dot.open` / `.dot.closed` · tier: inspect
  evidence: the a11y tree for the list reads `" Pillar Point"`, `" Half Moon Bay"`, `" Montara"` — the dots have no text, no `aria-label`, no `title`. The single most important fact on the page (is the beach open?) is invisible to screen readers **and** indistinguishable for red-green color-blind users. The dots themselves pass 1.4.11 against the page background (5.13:1 green, 5.62:1 red), which is why the engine stayed silent.
  fix: add a text or `<span class="visually-hidden">` status word next to each dot ("Open" / "Closed"), plus a non-color cue (icon shape or the word itself).

- **[●] Email field is labelled only by its placeholder — SC 3.3.2 — `forms.html:22`**
  where: `#email-input` · tier: scan (`labels-and-names/label-placeholder-only`)
  evidence: accessible name resolves to `"you@example.com"`; no `<label for>`, no `aria-label`. The label vanishes as soon as the user types.
  fix: add `<label for="email-input">Email address</label>`.

- **[●] Body text fails contrast — SC 1.4.3 — `forms.html:37`**
  where: `p.disclaimer` ("We send one email a week…") · tier: scan
  evidence: **2.32:1**, required 4.5:1 (`#aaaaaa` on `#ffffff`).
  fix: darken to at least `#767676` (4.54:1); `#595959` (7:1) is safer.

- **[●] Input purpose not identified on three personal-data fields — SC 1.3.5 — `forms.html:22`, `widget.html:38,40`**
  where: `#email-input`, `#m-email`, `#m-zip` · tier: inspect
  evidence: none of the three carries `autocomplete`; `#email-input` is additionally `type="text"` with no `name` attribute.
  fix: `autocomplete="email"` + `type="email"` on both email fields, `autocomplete="postal-code"` on the ZIP field. *(Aside, not an a11y issue: `#email-input` has no `name`, so the form will not submit the address at all. Worth a look before launch.)*

### Moderate

- **[◐] Dialog claims modality it doesn't have — SC 4.1.2 / 2.4.3 — `widget.html:35`**
  where: `#modal` · evidence: snapshot with the dialog open shows `main`'s heading, status list, and the `#open` trigger still exposed as siblings of the dialog in the a11y tree; the dialog renders inline in document flow rather than as an overlay, and background content stays mouse-clickable. `aria-modal="true"` tells AT the background is hidden when it isn't.
  opinion: fixing 2.1.2 with a native `<dialog>` resolves this too. Also add `aria-expanded` to `#open`.

- **[◐] Focus indicator unverified on `forms.html` — SC 2.4.7**
  where: `#do-search`, `#email-input` · evidence: `forms.html` is the only page with no `:focus-visible` rule; the other three define `3px solid #0b5394` (7.84:1 — verified visible, e.g. the skip link at `clean.html` renders at x=8,y=8 with that outline on focus). `#do-search` is a dark-blue button relying on the UA default ring.
  confirm: a person should look at the default ring against `#0b5394` and decide whether it reads clearly.

- **[◐] Three of four pages have no navigation at all — SC 2.4.5, 3.2.3**
  where: `forms.html`, `widget.html`, `media.html` — each contains only `<main>`; no banner, no nav, no contentinfo, no link to any other page. `clean.html` alone has a nav landmark, skip link, and footer.
  opinion: if these ship standalone, users land on them with no way out and no consistent navigation. If they're templates destined for a shared shell, this resolves — but re-run the assessment on the composed page, because the shell will change the landmark and heading structure.

- **[◐] "Save for later" star does nothing — SC 4.1.2 — `media.html:29`**
  where: `#fav` · evidence: clicking it produces no DOM change (`outerHTML` identical before and after); no `aria-pressed`, and no event handler is bound anywhere in the page's script — only `#add` is wired.
  opinion: a control that announces itself as actionable but has no state and no effect. Either implement it with `aria-pressed` toggling, or remove it before launch.

### Minor

- **[◐] Dialog heading duplicates the trigger label — SC 2.4.6 — `widget.html:33,36`**
  Both the trigger button and the dialog title read "Subscribe to alerts". Harmless, but a distinct dialog title reads better in a heading list.

## Human-required (○) — the testing handoff

1. **Live-region announcement on add-to-cart — SC 4.1.3** — `media.html:33`
   The mechanism is correct and verified ●: `#cart-status` has `aria-live="polite" role="status"`, is present in the DOM at load (not injected), and receives text on click (`"" → "Field guide added to your cart."`). Whether it *announces*, and whether the announcement is timely and not swallowed, is AT-only.
   needs: screen-reader users (blind / low-vision, per Section 508 FPC) · flow: load `media.html` → activate "Add to cart" (exercised above)

2. **Captions and audio-description adequacy — SC 1.2.3, 1.2.5** — `media.html:20`
   Left **undetermined**, not failed. `recap.mp4` and `recap-poster.jpg` return 404 from the test server, so I could not play the video. 1.2.2 fails on the verifiable absence of any track; whether 1.2.3/1.2.5 need audio description depends on whether the narration already conveys the visual content — that requires watching it.
   needs: a person who can view and hear the final media · flow: play the recap with captions enabled

3. **Dialog behaviour under a screen reader — SC 2.1.2, 4.1.2** — `widget.html:35`
   Re-test after the trap fix. The APG Modal Dialog pattern owes: focus moves into the dialog on open, is constrained while open, Escape closes, focus returns to the trigger, and background content is inert.
   needs: screen-reader users and keyboard-only users · flow: Subscribe to alerts → fill → submit → dismiss

4. **Error identification and recovery — SC 3.3.1, 3.3.3** — `forms.html`, `widget.html`
   Not exercisable: `/subscribe` and `/search` aren't implemented on the test server, and no client-side validation exists. No error state could be triggered.
   needs: re-assessment against a real backend before launch

5. **Plain-language comprehension and cognitive load** — sitewide
   Not assessable by tooling. Readable to me is not the same as usable for cognitive disabilities.
   needs: users with cognitive and learning disabilities

## Recommendations

**Root-cause fixes — one change each, clears several findings:**

1. Replace the hand-rolled `#modal` with a native `<dialog>` + `showModal()`. Clears 2.1.2 (critical), the false `aria-modal`, focus return, and background inertness in a single edit.
2. Add a "status word" to the beach list — one span per row. Clears 1.4.1 and 1.3.1 together, and makes the page's core content real content.
3. Sweep every personal-data input for `type` + `autocomplete` (3 fields across 2 pages). Clears 1.3.5 and improves 3.3.2 recovery.
4. Give `forms.html` the same head/CSS block the other three pages use — it's the only page missing `:focus-visible`, and the only one with a contrast failure. The other pages' `#1a1a1a` on white (17.4:1) is the standard the `.disclaimer` should meet.
5. Decide whether these four pages get a shared header/footer. If yes, do it before re-testing; it changes landmarks, headings, 2.4.5, and 3.2.3 on every page.

**Ship-blockers, in order:** the keyboard trap (`widget.html`), the unnamed search button and missing image alt (`forms.html`), the missing captions (`media.html`), the color-only beach status (`widget.html`).

**Hand to `accesslint:fix`:** the mechanical items — `aria-label` on `#do-search`, contrast on `.disclaimer`, `autocomplete`/`type` on the three fields, `<label>` for `#email-input`. Leave the image `alt` text and the caption file to a human; they're content, not code.

**Wire `accesslint:diff` into CI** for all four targets. Note what it will and won't catch: the automated tier scored `widget.html` as clean while it held the worst defect on the site. Regression-guarding needs the keyboard checks too, not just the rule engine.

## What was not covered

- The four sampled pages are the entire site as served, so there is no unsampled-page risk — **but** the fixture is static. Real templates, a shared shell, server-rendered error states, and the actual media assets are all untested and can introduce new failures.
- All ○ items above (screen-reader announcement, media adequacy, error recovery, cognitive load) are handoffs, not passes.
- Zoom to 200%/400% (1.4.4) was approximated by viewport reflow at 320px, which passed cleanly on all four pages with zero horizontal overflow and no clipping under the WCAG text-spacing override. True browser zoom isn't exposed over CDP, so treat 1.4.4 as inferred rather than directly verified.
- Both tiers ran against separate browser sessions (engine on its own managed Chrome at port 9223, manual tier via `chrome-devtools`), so cross-tier dedup was done by SC ownership rather than shared selectors — best-effort, though with 5 automated findings and no overlap at the element level, there was nothing to collapse.
