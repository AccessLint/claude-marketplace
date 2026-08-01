# Accessibility assessment — Coastal Almanac (pre-launch)
WCAG 2.2 Level AA · WCAG-EM · 4 pages + 1 interactive state sampled

## Scope

- **Target & boundary:** `http://127.0.0.1:8001` — the four static pages `clean.html`, `forms.html`, `widget.html`, `media.html`, plus the open state of the alerts dialog on `widget.html`. Goal: WCAG 2.2 AA.
- **Technologies in use:** static HTML5, inline CSS, vanilla JS (no framework, no build step). Native `<video>`. One custom widget (a hand-rolled `role="dialog"`).
- **AT baseline for the human handoff (scoped here, not tested):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS/iOS; keyboard-only; 200–400% browser zoom; Windows High Contrast.

## Sample

Structured (4 pages = the whole site, so this is a census rather than a sample):
- `clean.html` — entry/content template: nav, skip link, search form, informational image.
- `forms.html` — the signup conversion flow; distinct template with two forms and an icon-only button.
- `widget.html` — the only custom widget (dialog) and the only status-indicator pattern. Highest risk.
- `media.html` — the only page with time-based media and the only live region.

States: alerts dialog open on `widget.html` (exercised via click, Tab, Shift+Tab, Escape, Enter); cart live region after "Add to cart" on `media.html`.

Random set: none — the structured set already covers every page and template in the deployment.

## Conformance (per success criterion)

- **Fail ●: 9** · **Pass ●: 6** · **Undetermined (◐/○): 10** · **N/A: 6**
- Pass/fail is asserted only for ●-verified criteria. Everything ◐ or ○ is undetermined and needs a person.

**Failing:** 1.1.1, 1.2.2, 1.3.1, 1.3.5, 1.4.1, 1.4.3, 2.1.2, 3.3.2, 4.1.2
**Passing ●:** 1.3.2, 2.4.1, 2.4.2, 2.4.11, 3.1.1, 4.1.3 (mechanism only)
**N/A:** 1.2.4, 1.4.2, 2.2.1, 2.2.2, 2.3.1, 2.5.7 — no live media, no autoplay audio, no timing, no motion, no flashing, no drag interactions.

Three pages fail at least one Level A criterion. **The site does not currently conform at A or AA.**

## Findings — by severity, tagged by evidence basis

### Critical

- **[●] The alerts dialog is an inescapable keyboard trap** — SC 2.1.2 — `widget.html` → `#modal[role=dialog][aria-modal=true]` — tier: inspect
  Repro: click "Subscribe to alerts" → focus lands on `#m-email` (correct). Tab cycles `m-email → m-zip → m-submit → m-email`; Shift+Tab from `m-email` wraps back to `m-submit`. `Escape` leaves `modal.hidden === false`. There is **no close, cancel, or dismiss control anywhere in the dialog** (`#modal button` = `["m-submit:Subscribe"]`), and `#m-submit` has no click handler, so activating it does nothing. Once opened, a keyboard user can never return to the page.
  Compounding: `aria-modal="true"` is set but the background is never made inert (`inert` absent, no `aria-hidden` on `main`), and the dialog renders inline below the content rather than as an overlay — so AT users are walled off from a page that sighted mouse users can still click freely.
  → `fix`: add a close button, an `Escape` handler, focus return to `#open`, and `inert`/`aria-hidden` on the background. This is one bug that fails 2.1.2 and undermines 2.4.3.

- **[●] Beach open/closed status is conveyed by color alone, and is absent entirely from the accessibility tree** — SC 1.3.1, 1.4.1 — `widget.html` → `li > span.dot.open` / `span.dot.closed` — tier: inspect
  Evidence: each `.dot` has `textContent: ""`, no `aria-label`, no `title`; the only differentiator is `background-color` (`rgb(46,125,50)` green = open, `rgb(198,40,40)` red = closed). The a11y tree for the whole "Today's status" list reads `" Pillar Point"`, `" Half Moon Bay"`, `" Montara"` — three bare place names. A non-visual user gets no status at all; a color-blind user gets no reliable status. This is the page's entire purpose.
  → `fix`: add visible text ("Open"/"Closed") or a text equivalent plus a non-color cue (shape/icon). Note: the dot colors themselves pass 1.4.11 against white, so contrast is not the problem — the missing text equivalent is.

- **[●] The season recap video has no captions** — SC 1.2.2 — `media.html` → `main > video` — tier: scan (`time-based-media/video-captions`)
  Evidence: zero `<track>` children (`tracks: []`); no transcript anywhere on the page (`/transcript/i` does not match the body text). The page describes it as "A five-minute narrated walkthrough", so there is spoken audio. The video is the page's primary content and there is no alternative of any kind.
  → `fix`: add `<track kind="captions" srclang="en" src="…">`. Caption *accuracy* is a human check (see handoff).

### Serious

- **[●] Search submit button has no accessible name** — SC 4.1.2 — `forms.html` → `#do-search` — tier: scan (`labels-and-names/button-name`), confirmed in the a11y tree as `button` with an empty name
  Evidence: the button's only content is an `aria-hidden="true"` SVG. Screen-reader output is "button", unlabeled. Graded serious rather than critical because pressing Enter in the labeled `#q` searchbox still submits the form — there is a workaround.
  → `fix`: add `aria-label="Search"` to the button.

- **[●] Email field uses a placeholder as its only label** — SC 3.3.2, contributes to 4.1.2 — `forms.html` → `#email-input` — tier: scan (`labels-and-names/label-placeholder-only`)
  Evidence: no `<label for="email-input">`, no `aria-label`; the a11y tree exposes it as `textbox "you@example.com"` — the field is *named after the example address*. The placeholder also disappears on typing, so the label is gone exactly when a user needs to verify what they entered.
  → `fix`: add a real `<label for="email-input">Email address</label>`.

- **[●] Disclaimer text fails contrast at 2.32:1** — SC 1.4.3 — `forms.html` → `p.disclaimer` ("We send one email a week…") — tier: scan (`distinguishable/color-contrast`)
  Evidence: `color: rgb(170,170,170)` on `#fff` = 2.32:1, required 4.5:1. This paragraph carries the privacy commitment, so it is not decorative.
  → `fix`: darken to at least `#767676` (4.54:1); `#595959` is a safer target.

- **[●] Promo image has no `alt` attribute** — SC 1.1.1 — `forms.html` → `main > img.promo` (`src="promo-banner.png"`) — tier: scan (`text-alternatives/img-alt`)
  Evidence: `alt` is `null` (not empty — absent), no `role="presentation"`. Screen readers will fall back to announcing the filename.
  → `fix`: **NEEDS HUMAN for the wording.** If the banner carries information, write alt text describing it; if purely decorative, use `alt=""`. I could not see the image — `promo-banner.png` returns no bytes in this environment (`naturalWidth: 0`), so I will not invent a description.

### Moderate

- **[●] Personal-data fields don't declare their input purpose** — SC 1.3.5 (AA) — tier: inspect
  `forms.html` → `#email-input` is `type="text"` with no `autocomplete`. `widget.html` → `#m-email` (no `autocomplete`) and `#m-zip` (`type="text"`, no `autocomplete`). Autofill and personalization tooling can't identify these fields.
  → `fix`: `type="email" autocomplete="email"` on both email inputs; `autocomplete="postal-code"` on the ZIP field.

- **[◐] Three of four pages have no navigation and no way out** — SC 3.2.3 — `forms.html`, `widget.html`, `media.html` — tier: inspect
  Evidence: `clean.html` has `header`/`nav[aria-label="Primary"]`/`footer` plus a working skip link. The other three pages have **zero links of any kind** — no nav, no header, no footer, no home link. Once a user lands on the signup or alerts page, the only way onward is the browser's back button.
  Opinion: this is more an orientation and consistent-navigation problem than a clean 3.2.3 failure (the criterion governs *repeated* mechanisms, and here the mechanism is simply absent). A person should decide whether these are meant to be standalone pages. Note the pages also fail *consistency* in focus styling: `clean.html`, `widget.html`, and `media.html` define `:focus-visible { outline: 3px solid #0b5394 }`; `forms.html` defines no focus rule at all and relies on the UA default.

### Minor

- **[◐] Primary nav links are 19px tall** — SC 2.5.8 — `clean.html` → `nav a` (Home / Tides / About), measured 43.1×19, 39.7×19, 43.6×19 — tier: inspect
  Opinion: these are almost certainly covered by the **inline exception** (targets within a block of text — they're separated by "·" in a single text line), as is the footer's "Report an error" link inside a sentence. Flagged so a person can confirm the exception is intended rather than accidental. All other controls across the site measure comfortably over 24×24 (smallest is `#do-search` at 32×41.6).

### Verified as passing (worth stating)

`clean.html` is genuinely clean and is the right template to copy from: working skip link, `banner`/`navigation`/`main`/`contentinfo` landmarks, exactly one `h1` with no level skips, a properly labeled search field, and a genuinely descriptive image alt ("two highs near 1.8 m at 06:10 and 18:40…"). All four pages set `lang="en"` and have unique, descriptive `<title>`s. Reflow at 320 CSS px produces no horizontal scrolling and no overflowing elements on any page, and the WCAG 1.4.12 text-spacing override causes no clipping anywhere. No sticky or fixed elements exist, so 2.4.11 passes trivially. The `media.html` live region is built correctly — `role="status" aria-live="polite"` present in the DOM at load, populated on click, with focus left undisturbed on the button.

## Human-required (○) — the testing handoff

- **Live-region announcement on add-to-cart** — SC 4.1.3 — `media.html` → `#cart-status`
  `role="status" aria-live="polite"` is present and the text updates to "Field guide added to your cart." (both ●). Whether it *actually announces*, and whether it interrupts, is AT-only.
  needs: screen-reader users (blind / low-vision, per Section 508 FPC) · flow: "Add to cart" (exercised above)
- **Dialog perception once the trap is fixed** — SC 4.1.2, 2.4.3 — `widget.html` → `#modal`
  Verify the re-worked dialog is announced as modal, that background content is genuinely unreachable, and that focus returns sensibly on close.
  needs: screen-reader users; keyboard-only users · flow: Subscribe to alerts → fill → close
- **Caption accuracy and audio-description need** — SC 1.2.2, 1.2.3, 1.2.5 — `media.html`
  Once a captions track exists, accuracy and synchronization need a human. Separately, someone must watch the recap and decide whether visual information (tide charts, on-screen figures) is conveyed outside the narration — if so, audio description or a full media alternative is also required at AA. I could not evaluate this: `recap.mp4` does not load in this environment.
  needs: Deaf and hard-of-hearing users; blind / low-vision users · flow: play the recap end to end
- **Alt text for `promo-banner.png`** — SC 1.1.1 — `forms.html`
  Needs someone who knows what the banner shows and whether it carries information the surrounding copy doesn't.
  needs: content owner (sighted review) + screen-reader spot-check
- **Focus-indicator adequacy on `forms.html`** — SC 2.4.7, 1.4.11
  The page defines no focus style, so the UA default ring lands on `#do-search`, a solid `#0b5394` button. Default rings over saturated backgrounds are frequently too faint. A person should look at it.
  needs: low-vision users; keyboard-only users
- **Plain-language and cognitive load across the signup and alerts flows** — SC 3.1.5-adjacent, general
  Readable to me is not the same as usable for cognitive disabilities. Not emulated.
  needs: users with cognitive and learning disabilities

## Recommendations

**Root-cause fixes, in order.** Four changes clear seven of the nine failing criteria:

1. **Rebuild the alerts dialog** (`widget.html`). Add a close button, an `Escape` handler, focus return to `#open`, and `inert` on the background. Consider replacing the hand-rolled `div[role=dialog]` with a native `<dialog>` + `showModal()`, which gives you the trap, `Escape`, and background inertness for free — the current implementation has the focus *cycle* right and everything else wrong. Clears 2.1.2.
2. **Give the beach status a text equivalent** (`widget.html`). One change clears both 1.3.1 and 1.4.1.
3. **Fix the forms page as a set** (`forms.html`): real `<label>`, `type="email" autocomplete="email"`, `aria-label` on the search button, darken `.disclaimer`, add `alt` to the promo image. Clears 3.3.2, 4.1.2, 1.4.3, most of 1.3.5, and 1.1.1 (pending copy).
4. **Add a captions track** (`media.html`). Clears 1.2.2; 1.2.3/1.2.5 stay open pending the human review above.

**Process.** `clean.html` demonstrates the team already knows how to do this — the failures cluster in the pages that were built later and never got the same treatment. Extract the `clean.html` head (focus styles, landmarks, skip link, nav) into a shared partial so new pages inherit it rather than re-deriving it.

**Send to human and AT testing:** the alerts dialog flow and the video, on `widget.html` and `media.html` specifically. Those two pages carry every ○ item.

**Wire `accesslint:diff` into CI** against all four targets. The automated tier alone would have caught 5 of the 9 failures before they reached a pre-launch review.

## What this assessment did not cover

- **`recap.mp4`, `promo-banner.png`, and `chart.png` do not load** in this environment. I could not play the video (its controls report `disabled` / "Unable to play media"), so nothing about media playback, player keyboard operability, or caption/AD content was tested beyond the presence of track elements. I also could not judge the promo image's content.
- **No server-side behavior was exercised.** Both forms post to endpoints that don't exist here, so **SC 3.3.1 (Error Identification) and 3.3.3 (Error Suggestion) are entirely untested** — I never saw a validation error. If these forms validate, that path needs its own review before launch.
- **Browser zoom (1.4.4) was assessed only by CSS-based approximation.** True browser zoom is not exposed through the automation surface. Reflow and text-spacing results are ◐, not ●.
- **AAA was not evaluated** (goal was AA). No authenticated routes, no error/empty states, and no pages beyond these four exist in the deployment — but if any are planned, they are outside this assessment.
- **No assistive technology was used.** Every ○ item above is a genuine open question, not a formality.
