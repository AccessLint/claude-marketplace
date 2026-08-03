# Accessibility audit — Coastal Almanac (localhost:8002)
WCAG 2.2 Level AA · WCAG-EM · 5 pages/states sampled

## Scope

- **Target & boundary:** the four static pages served at `http://localhost:8002` — `clean.html`, `forms.html`, `widget.html`, `media.html` — plus the one stateful view they contain (the Beach alerts modal). Nothing behind `/subscribe`, `/search`, `/tides`, `/about`, or `/contact` is in scope; those routes 404 in this build. **Goal:** WCAG 2.2 AA.
- **Technologies in use:** static HTML5, inline CSS, vanilla JS (no framework, no build step, no source maps).
- **AT baseline for the human handoff (scoped here, not tested here):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS/iOS; keyboard-only on all three; 200%/400% browser zoom with real browser zoom.

Source files live at `…/scratchpad/repair1/fixtures/` (`clean.html`, `forms.html`, `widget.html`, `media.html`); line numbers below are from those files.

## Sample

**Structured:**
- `clean.html` — entry/content template; the only page with the site chrome (header, primary nav, footer, skip link). Represents the article/table content type.
- `forms.html` — data-entry template; two distinct forms (newsletter signup, archive search) and a promo image.
- `widget.html` — the only custom widget on the site (APG Modal Dialog pattern) plus a status list. Highest-risk page.
- `widget.html` **with the modal open** — sampled as a separate state; the dialog is the site's only focus-managing UI.
- `media.html` — the only page with time-based media, plus the cart action and a live region.

**Random:** none added — the structured set is the complete page inventory, so a random draw would be redundant.

## Conformance (per success criterion)

- **Pass ●: 8** · **Fail ●: 7** · **Undetermined (◐/○): 11** · N/A: remainder
- Pass/fail is asserted only for ● criteria; ◐/○ are undetermined and go to a person.

**Failed ●:** 1.1.1, 1.2.2, 2.1.2, 4.1.2, 1.4.3, 3.3.2, 1.3.5
**Passed ●:** 3.1.1 (lang), 2.4.2 (page titled), 2.4.1 (bypass blocks), 1.3.1 heading outline & landmarks, 2.1.1 (keyboard reachable/operable — apart from the trap), 2.5.8 (target size), 2.4.3 (focus order on modal open), 4.1.3 (live region present)
**Undetermined:** 1.3.1 (status semantics), 1.4.1, 1.2.3, 1.2.5, 4.1.2 (toggle state), 2.4.7, 3.2.3, 3.3.1, 3.3.3, 4.1.3 (announcement), 1.4.10/1.4.12 at real browser zoom

One sampled page failing a criterion fails it for the whole scope — the 7 failures above are site-level failures, not per-page ones.

## Findings — by severity, tagged by evidence basis

### Critical

- **[●] Keyboard trap in the "Subscribe to alerts" dialog** — SC 2.1.2 — where: `#modal[role=dialog][aria-modal=true]` — `widget.html:35–58` — tier: inspect
  Repro: click "Subscribe to alerts" → focus lands on `#m-email`. Tab → `#m-zip` → `#m-submit` → wraps back to `#m-email`. Shift+Tab from `#m-email` wraps to `#m-submit`. **Escape does not close** (`modal.hidden` stays `false`, `activeElement` stays `#m-email`), and the dialog contains no close or cancel control (`#modal button` returns only `#m-submit:"Subscribe"`). There is no keyboard route out of the dialog at all — a keyboard-only user is stranded on the page.
  Fix: add a visible close button, handle `Escape` to set `modal.hidden = true`, and return focus to `#open` on close. This is the single worst issue on the site.

- **[●] Promo image has no `alt` attribute** — SC 1.1.1 — where: `img.promo` (`main > img`) — `forms.html:19` — tier: scan
  Evidence: engine `text-alternatives/img-alt`; `<img class="promo" src="promo-banner.png">` exposes as `image` with no name.
  Fix: `alt=""` + `role="presentation"` if decorative; otherwise `alt="TODO — describe the promo banner"` (contextual, needs a human to write).

- **[●] Search submit button has no accessible name** — SC 4.1.2 — where: `#do-search` — `forms.html:29–34` — tier: scan
  Evidence: engine `labels-and-names/button-name`; the button's only content is an `aria-hidden="true"` SVG, so the a11y tree exposes `button` with an empty name.
  Fix: add `aria-label="Search"` to `#do-search`.

- **[●] Video has no captions track** — SC 1.2.2 — where: `main > video` — `media.html:20–23` — tier: scan
  Evidence: engine `time-based-media/video-captions`; `video.querySelectorAll('track')` returns `[]`. The page describes it as "a five-minute narrated walkthrough", so it is prerecorded synchronized media with audio.
  Fix: add `<track kind="captions" srclang="en" src="…">`. Caption content itself is human work.

### Serious

- **[●] Disclaimer text fails contrast at 2.32:1** — SC 1.4.3 — where: `p.disclaimer` ("We send one email a week and never share your address…") — `forms.html:37` — tier: scan
  Evidence: engine `distinguishable/color-contrast`; `#aaaaaa` on `#ffffff` = 2.32:1, required 4.5:1.
  Fix: darken `.disclaimer` to at least `#767676` (4.54:1) — this is the site's stated privacy promise, so it should not be the least legible text on the page.

- **[●] Email field uses its placeholder as the only label** — SC 3.3.2 — where: `#email-input` — `forms.html:22` — tier: scan
  Evidence: engine `labels-and-names/label-placeholder-only`; the a11y tree shows `textbox[name="you@example.com"]` — the accessible name *is* the example value, and it disappears the moment the user types.
  Fix: add `<label for="email-input">Email address</label>`.

- **[◐] Video has no audio description or transcript** — SC 1.2.3 (A), 1.2.5 (AA) — where: `main > video` — `media.html:20–23`
  Evidence (●): no `<track kind="descriptions">` and no transcript anywhere in the DOM. Whether description is *required* depends on whether the visuals carry information the narration doesn't — that call needs a person who has watched it. `recap.mp4` returns 404 in this build, so I could not watch it.
  Confirm: review the video; if any visual information is not spoken, add a description track or an on-page transcript.

### Moderate

- **[●] Personal-data fields carry no `autocomplete` token** — SC 1.3.5 — where: `#email-input` (`forms.html:22`), `#m-email` (`widget.html:38`), `#m-zip` (`widget.html:40`) — tier: inspect
  Evidence: `getAttribute('autocomplete')` returns `null` on all three; all three collect the user's own information. `#email-input` is also `type="text"` rather than `type="email"`.
  Fix: `autocomplete="email"` on both email fields (and `type="email"` on `#email-input`), `autocomplete="postal-code"` on `#m-zip`.

- **[◐] Beach status is carried by dot color alone** — SC 1.4.1, with a 1.3.1 fact underneath — where: `span.dot.open` / `span.dot.closed` — `widget.html:27–29`
  Evidence (●, deterministic): the accessibility tree for the list is exactly `StaticText " Pillar Point"`, `" Half Moon Bay"`, `" Montara"`. The dots are empty `<span>`s with no text, `aria-label`, `role`, or `title` — open vs. closed is **not programmatically determinable at all**. That much is a verified 1.3.1 defect.
  Opinion (interpretive, stays ◐): that *color* is the sole carrier for sighted users is a visual judgement — the dots are identical in size, shape, and position, so green vs. red appears to be the only differentiator, but a person should confirm nothing else in the design distinguishes them.
  Fix: add visible text ("Open" / "Closed") next to each dot, or at minimum a text alternative on the span. Do not rely on shape alone.

- **[◐] "Save for later" reads as a toggle but exposes no state** — SC 4.1.2 — where: `#fav` — `media.html:29`
  Evidence: `aria-pressed` is `null` before and after activation; clicking it changes nothing in the DOM (no listener is bound). A star control named "Save for later" reads as a two-state toggle.
  Confirm: is it meant to toggle? If so, add `aria-pressed` and keep it in sync (and wire up the handler — it is currently inert). If it's a one-shot action, the current markup is acceptable.

- **[◐] Navigation is present on only one of four pages** — SC 3.2.3 — where: `header > nav[aria-label="Primary"]` exists in `clean.html:22–26`; `forms.html`, `widget.html`, and `media.html` have no `header`, `nav`, or `footer` at all
  Evidence: landmark inventory per page — `clean.html`: `HEADER, NAV{Primary}, MAIN, FOOTER`; `forms.html`: `MAIN, FORM[role=search]`; `widget.html`: `MAIN`; `media.html`: `MAIN, DIV[role=status]`.
  Opinion: strictly, 3.2.3 governs *repeated* components, and these components aren't repeated — so this may not be a formal failure. But a user who lands on `forms.html` or `media.html` has no way to navigate the site, which is a real barrier. Confirm whether the missing chrome is intentional for this build.

### Minor

- **[◐] `forms.html` relies on the browser's default focus ring** — SC 2.4.7 — where: whole page
  Evidence: the other three pages declare `:focus-visible { outline: 3px solid #0b5394; outline-offset: 2px }`; enumerating `forms.html`'s stylesheet rules for `:focus` returns `[]`. The UA default ring does satisfy 2.4.7, so this is a consistency gap rather than a failure.
  Confirm: add the same `:focus-visible` rule so focus looks the same site-wide.

- **[◐] Primary nav links are 19 px tall** — SC 2.5.8 — where: the three `a` elements in `nav[aria-label="Primary"]` — `clean.html:23`
  Evidence: measured bounding boxes 43×19, 40×19, 44×19 CSS px. WCAG's "inline" exception likely applies (they sit in a middot-separated run of text), so this probably passes.
  Confirm: if these are treated as a nav bar rather than inline prose, pad them to 24×24. Every other interactive target on the site measures ≥24×24 (search button 67×42, `#do-search` 32×42, `#open` 160×42, `#fav` 42×44, `#add` 105×42).

- **[◐] Images have no `max-width` constraint** — SC 1.4.10 — where: `clean.html:42` (`chart.png`), `forms.html:19` (`promo-banner.png`)
  Evidence: measured at a 320 px viewport, no page produces horizontal scroll (`scrollWidth === clientWidth === 320` on all four) and the WCAG 1.4.12 text-spacing override produces no overflow either. But **all four image/video assets 404 in this build**, so the images contributed zero width to that measurement. `media.html` sets `video { max-width: 100% }`; neither `clean.html` nor `forms.html` sets an equivalent for `img`.
  Confirm: re-measure reflow once real assets are in place, and add `img { max-width: 100%; height: auto }`.

## Human-required (○) — the testing handoff

- **Live-region announcement on "Add to cart"** — SC 4.1.3
  `#cart-status` has `role="status"` and `aria-live="polite"` (● present), and activating `#add` does set its text to "Field guide added to your cart." (● verified). Whether that text is actually announced, and whether it interrupts or is missed, is screen-reader behavior I cannot observe.
  needs: users who are blind or have low vision, using a screen reader (Section 508 FPC — without vision / with limited vision)
  flow: `media.html` → activate "Add to cart" → listen for the confirmation (exercised above)

- **Dialog announcement and orientation** — SC 4.1.2, 1.3.1
  `#modal` exposes as `dialog "Subscribe to alerts" modal` with a correct `aria-labelledby` (● verified). Whether opening it announces the dialog and its name, and whether the user can tell they've entered a modal context, is AT-specific. Test this *after* the 2.1.2 trap is fixed — as shipped, the dialog will strand a screen-reader user too.
  needs: screen-reader users (without vision), and keyboard-only users with limited dexterity
  flow: `widget.html` → "Subscribe to alerts" → fill both fields → submit → close

- **Caption and audio-description accuracy** — SC 1.2.2, 1.2.5
  Once tracks exist, presence is machine-checkable but synchrony, speaker identification, and whether descriptions actually convey the visuals are human judgements.
  needs: Deaf and hard-of-hearing users (without hearing / with limited hearing); blind users for the description track
  flow: `media.html` → play the recap end to end

- **Error identification and recovery** — SC 3.3.1, 3.3.3
  **Not testable in this build.** Neither form has client-side validation (`#email-input` is `type="text"` with no `required`), `/subscribe` and `/search` both 404, and the dialog's `#m-submit` is `type="button"` with no handler bound — activating it does nothing. No error state exists to exercise.
  needs: re-audit once validation is implemented; then human review of whether messages support recovery
  flow: `forms.html` signup with an invalid address; `widget.html` dialog with an empty ZIP

- **Plain-language comprehension and cognitive load** — SC 3.1.5-adjacent, general
  Tide terminology ("chart datum", "water under the keel") is domain-specific. Readable to me is not the same as usable under cognitive load.
  needs: users with cognitive and learning disabilities
  flow: `clean.html` "Reading the tables"

## Recommendations

**Root-cause / pattern fixes** (hand to `accessibility-fix`):

1. **Ship a real dialog.** The hand-rolled trap in `widget.html:45–58` implements only the wrap-around half of the APG Modal Dialog contract and none of the exit half. Replacing the `<div role="dialog">` with a native `<dialog>` element gets you Escape-to-close, focus return, and background inertness for free, and eliminates the site's only critical keyboard failure.
2. **Name every control, label every field.** Four of the seven ● failures (1.1.1, 4.1.2, 3.3.2, 1.3.5) are the same root cause: controls shipped without programmatic names or purposes. A pre-commit rule covering `img[alt]`, icon-only buttons, `label[for]`, and `autocomplete` on personal-data fields would have caught all four.
3. **Never let color be the only signal.** Add text beside the status dots; audit for the same pattern anywhere else status is rendered.
4. **Stop using placeholders as labels, and `#aaa` as body text.** Both are single-line CSS/markup fixes with site-wide reach.
5. **Give `forms.html`, `widget.html`, and `media.html` the same header/nav/footer/skip-link chrome as `clean.html`,** plus the shared `:focus-visible` rule and `img { max-width: 100% }`.

**Send to human and AT testing:** the modal flow on `widget.html` (after the trap is fixed — testing it as shipped is unproductive), the add-to-cart live region on `media.html`, and the video once real caption and description tracks exist.

**Wire into CI:** `accesslint:accessibility-diff` against all four pages. The automated tier alone catches 5 of the 7 verified failures on this site; the two it missed (the keyboard trap and the missing `autocomplete` tokens) are exactly the kind that need the manual tier, so keep `accessibility-inspect` in the release checklist rather than relying on the engine alone.

## What this audit did not cover

- **All four media assets 404 in this build** (`chart.png`, `promo-banner.png`, `recap.mp4`, `recap-poster.jpg`). Anything that depends on rendered media is untested: text-over-image contrast, real reflow with images at natural width, the video poster, and caption/description accuracy.
- **No routes beyond the four pages.** `/subscribe`, `/search`, `/tides`, `/about`, and `/contact` all 404 — the actual signup and search results are unaudited, and the search flow on `forms.html` was exercised only up to submission.
- **No error or validation states**, because none exist yet (see the handoff above).
- **Zoom to 200%/400%** was not exercised — true browser zoom isn't exposed over CDP; the 320 px reflow measurement is the closest proxy and is reported as ◐.
- **No assistive technology was run.** Every ○ item above is a machine-verified precondition, not an observed screen-reader outcome. The a11y tree shows machine state, not what a user hears.
- **Dedup between tiers is best-effort:** the engine ran headless on its own Chrome instance while the manual tier drove a separate browser, so selector matching across the two was reconciled by hand rather than shared-context.

**Bottom line for launch:** four critical failures block shipping — the keyboard trap on `widget.html` above all, since it strands a keyboard user with no recovery. All four criticals plus the two serious contrast/label failures are mechanical fixes measured in minutes, not days. The trap, the unlabeled search button, the missing `alt`, and the missing captions are the must-fix list.
