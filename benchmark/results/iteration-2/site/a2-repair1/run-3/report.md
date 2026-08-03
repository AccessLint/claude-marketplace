Both tiers are complete across all four pages plus the modal-open state. Here is the report.

---

# Accessibility audit — Coastal Almanac (localhost:8002)
WCAG 2.2 Level AA · WCAG-EM · 5 pages/states sampled

## Scope
- **Target & boundary:** the four static pages served at `http://localhost:8002` — `clean.html`, `forms.html`, `widget.html`, `media.html` — plus the alert-subscription modal state on `widget.html`. Nothing behind a form submit is in scope: `/subscribe`, `/search`, `/tides`, `/about`, `/contact` are not served by this host. **Goal:** WCAG 2.2 AA.
- **Technologies in use:** HTML5, inline CSS, vanilla JS (two small inline scripts), inline SVG, `<video>`. No framework, no build step, so no source maps — findings are grounded by selector and by `file:line` read from the served source.
- **AT baseline for the human handoff (scoped here, not tested here):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS and iOS; TalkBack + Chrome on Android; keyboard-only on desktop; 400% browser zoom with a screen magnifier.

## Sample
**Structured (4):**
- `clean.html` — entry page and the only page carrying the site nav, skip link, and footer; a distinct template.
- `forms.html` — the newsletter-signup flow end to end, plus a second search form; the only page with a data-entry task and the only one with an image.
- `widget.html` — the only custom widget (APG Modal Dialog) and the only status-indicator pattern; highest-risk template.
- `media.html` — the only time-based media and the only live region.

**Structured state (1):**
- `widget.html` with the subscription modal open — the modal is `hidden` at load, so the automated tier never sees it. Inspected separately.

**Random:** none. At four total pages the structured set is the whole site; a random draw would only resample it.

## Conformance (per success criterion)
- **Fail ●: 7** · **Pass ●: 8** · **Undetermined (◐/○): 12** · **N/A: 1**
- Pass/fail is asserted only for ● criteria; ◐/○ are undetermined and go to a person.

**Fail ●** — 1.1.1, 1.2.2, 1.3.5, 1.4.3, 2.1.2, 3.3.2, 4.1.2
**Pass ●** — 1.3.2, 2.1.1, 2.4.1, 2.4.2, 2.4.3, 2.4.7, 2.5.8, 3.1.1
**Undetermined** — 1.2.3, 1.2.5, 1.3.1, 1.4.1, 1.4.4, 1.4.10, 1.4.12, 2.4.4, 2.4.6, 3.2.3, 3.3.1/3.3.3, 4.1.3
**N/A** — 1.2.1 (no video-only or audio-only content)

One page failing a criterion fails it for the whole scope. `clean.html` is clean on both tiers — every ● failure below is on the other three pages.

## Findings — by severity, tagged by evidence basis

### Critical

- **[●] The alert modal is a keyboard trap — you cannot get out.** — SC 2.1.2
  where: `#modal[role=dialog]` — `widget.html:35–64`
  repro: activate `#open` → focus lands on `#m-email`; Tab cycles `m-email → m-zip → m-submit → m-email → m-zip` and never leaves. `Escape` does nothing (modal `hidden` still `false`, `activeElement` unchanged). The dialog's only button is "Subscribe" — there is no close or cancel control, and no outside-click handler. A keyboard user who opens this dialog cannot reach the rest of the page or dismiss it without reloading.
  cause: the `keydown` handler at `widget.html:51–64` implements the wrap half of the focus-trap contract but not the escape half.
  fix: add an `Escape` handler that sets `modal.hidden = true`, add a visible close button as the dialog's first or last child, and return focus to `#open` on close. Also set `inert` on `main` while open so pointer users can't reach behind it. → `accessibility-fix`

- **[●] Search button has no accessible name.** — SC 4.1.2
  where: `#do-search` — `forms.html:29–34` — tier: scan (`labels-and-names/button-name`), confirmed by inspect
  evidence: the button's only content is an `aria-hidden="true"` SVG, so its accessible name computes to empty. The a11y tree shows `button` with no name; the tab traversal reaches it as an unnamed control. Nothing tells a screen-reader user what it does.
  fix: `aria-label="Search"` on `#do-search`. → `accessibility-fix`

- **[●] Promo image has no `alt` attribute.** — SC 1.1.1
  where: `main > img.promo` — `forms.html:19` — tier: scan (`text-alternatives/img-alt`)
  evidence: `img.getAttribute('alt')` is `null` (not `""`). With no `alt` at all, AT falls back to announcing the filename, `promo-banner.png`.
  fix: if the banner carries information, write `alt` describing it; if purely decorative, `alt=""`. Content is needed — leave a TODO rather than inventing copy.

- **[●] Video has no captions track.** — SC 1.2.2
  where: `main > video` — `media.html:20–23` — tier: scan (`time-based-media/video-captions`), confirmed by inspect
  evidence: `video.querySelectorAll('track')` returns zero elements; there are no links on the page, so no transcript alternative either. The page describes the video as "a five-minute narrated walkthrough," so it carries spoken audio.
  fix: add `<track kind="captions" srclang="en" src="…">`. Caption authoring is human work.

### Serious

- **[●] Email field is labelled only by its placeholder.** — SC 3.3.2
  where: `#email-input` — `forms.html:22` — tier: scan (`labels-and-names/label-placeholder-only`), confirmed by inspect
  evidence: the accessible name resolves to `you@example.com`. The a11y tree shows `textbox "you@example.com"`. The label vanishes as soon as the user types, and the name describes an example value rather than the field's purpose.
  fix: add `<label for="email-input">Email address</label>`; keep the placeholder only as a supplementary hint.

- **[●] Disclaimer text fails contrast at 2.32:1.** — SC 1.4.3
  where: `p.disclaimer` — `forms.html:9` (`color: #aaaaaa` on `#fff`) — tier: scan (`distinguishable/color-contrast`)
  evidence: measured 2.32:1 against a required 4.5:1 for body text at 16px.
  fix: darken to at least `#767676` (4.54:1). This is the text that states the privacy and unsubscribe terms, so it's the wrong text to make hard to read.

- **[●] Email and ZIP fields carry no `autocomplete`.** — SC 1.3.5
  where: `#email-input` (`forms.html:22`), `#m-email` and `#m-zip` (`widget.html:38, 40`)
  evidence: `getAttribute('autocomplete')` is `null` on all three. Every one collects information about the user themselves, which is exactly the case 1.3.5 covers.
  fix: `autocomplete="email"` on both email fields; `autocomplete="postal-code"` on `#m-zip`. Also set `type="email"` on `#email-input` (currently `type="text"`).

- **[◐] Beach open/closed status is carried by a colored dot alone.** — SC 1.4.1 (with a ● 1.3.1 fact attached)
  where: `.status-list .dot.open` / `.dot.closed` — `widget.html:26–30`
  ● evidence: each dot is an empty `<span>` — `textContent` is `""`, no `aria-label`, no `title`. The a11y tree exposes the three items as `" Pillar Point"`, `" Half Moon Bay"`, `" Montara"` with no status at all. The open/closed state is **not programmatically determinable** — that half is verified, and it's a 1.3.1 concern in its own right.
  opinion: green `#2e7d32` vs red `#c62828`, identical in size, shape, and position, look like the sole carrier of the meaning. But whether some other cue (ordering, surrounding page copy, a legend elsewhere in the product) also conveys it is a judgment call, so the 1.4.1 finding stays ◐.
  confirm: a person decides whether anything besides hue distinguishes open from closed. Either way, the programmatic gap needs fixing: add visible text ("Open" / "Closed") next to each dot, or give each dot an accessible name.
  note: the dots themselves pass 1.4.11 non-text contrast — 5.19:1 (green) and 5.63:1 (red) against white, both above 3:1.

- **[◐] Video has no audio description or text alternative.** — SC 1.2.3 (A), 1.2.5 (AA)
  where: `main > video` — `media.html:20–23`
  evidence: zero `<track>` elements of any kind and no transcript link anywhere on the page.
  opinion: a "walkthrough of this season's notable tides" almost certainly shows charts or footage carrying information the narration doesn't restate, which would require audio description or a full media alternative. I could not confirm — `recap.mp4` returns 404 on this host, so the actual content was never available to evaluate.
  confirm: a person watches the video and decides whether the visuals carry information absent from the audio.

### Moderate

- **[◐] The signup form has no error path at all — and silently discards the email.** — SC 3.3.1, 3.3.3
  where: `form[action="/subscribe"]`, `#email-input` — `forms.html:21–24`
  evidence: `#email-input` has no `required`, no `name`, and `type="text"`. `form.checkValidity()` returns `true` for the input `"not-an-email"`; there is no submit handler and no script on the page; `aria-describedby` and `aria-invalid` are both absent. Separately, **`new FormData(form)` serializes zero fields** because the input has no `name` — the address is never sent. That is a functional bug as much as an accessibility one, and it means the error path could not be exercised even in principle.
  confirm: once `name` and validation exist, a person checks that errors are programmatically associated with the field and that the message actually helps recovery. Server-side behavior at `/subscribe` was outside this scope.

- **[◐] Navigation exists on only one of the four pages.** — SC 3.2.3, 2.4.1
  where: `header > nav[aria-label="Primary"]` and `a.skip` — `clean.html:21–26`; absent from `forms.html`, `widget.html`, `media.html`
  evidence: landmark inventory per page — `clean.html`: `header, nav("Primary"), main, footer`; `forms.html`: `main, form[role=search]`; `widget.html`: `main, div[role=dialog]`; `media.html`: `main, div[role=status]`. Three of four pages have no banner, no nav, no footer, and no skip link.
  opinion: strictly, 3.2.3 governs *repeated* navigation, and a mechanism absent from three pages isn't repeated — so this may not be a clean 3.2.3 failure. It is still a real orientation problem: land on `forms.html` and there is no in-page way back to anywhere. If this is a template gap rather than a design decision, fixing it also clears the 2.4.1 and 3.2.3 questions for good.
  confirm: a person decides whether the shared header/footer is meant to be on every page.

- **[◐] `forms.html` relies on the browser's default focus ring while the other pages style their own.** — SC 2.4.7, 3.2.4
  where: `forms.html` has no `:focus-visible` rule; `clean.html:14`, `widget.html:10`, `media.html:13` all declare `outline: 3px solid #0b5394`
  evidence: traversal shows `1px auto rgb(0, 95, 204)` (UA default) on all four `forms.html` controls, versus `3px solid rgb(11, 83, 148)` elsewhere.
  opinion: the UA default is present and passes — this is not a failure — but the indicator is visibly thinner on the one page where users type. Consistency argues for the same 3px rule.

### Minor

- **[◐] The video element has no accessible name.** — SC 4.1.2
  where: `main > video` — `media.html:20`
  evidence: the a11y tree exposes the video with an empty name; tab traversal reaches it as `VIDEO` with `name: ""`.
  opinion: an `aria-label="Tide season recap"` would let a screen-reader user know what the player contains before entering its controls. The adjacent `<h1>` and following paragraph supply the context visually.

- **[◐] Primary nav links are 19 px tall.** — SC 2.5.8
  where: the three `<a>` in `nav[aria-label="Primary"]` — `clean.html:24` — measured 43×19, 40×19, 44×19 CSS px
  evidence: every other interactive target on the site measures ≥24 px in both dimensions (verified: 42–46 px tall throughout, `#do-search` at 32×42).
  opinion: these are inline links separated by `·` characters, which likely qualifies for 2.5.8's inline exception — so probably not a failure. Adding vertical padding would remove the question and make them easier to hit on touch.

## Human-required (○) — the testing handoff

- **Whether the live region actually announces the cart update** — SC 4.1.3
  ● verified: `#cart-status` is present in the DOM at load with `role="status" aria-live="polite"`, and activating `#add` injects "Field guide added to your cart." into it without moving focus. That is the correct implementation of the pattern. Whether NVDA, JAWS, VoiceOver, and TalkBack each actually speak it — and whether it interrupts or is swallowed — is not observable from the a11y tree.
  needs: screen-reader users (blind and low-vision, per Section 508 FPC)
  flow: `media.html` → Tab to "Add to cart" → Enter (exercised above)

- **Whether the modal is announced as a dialog and its boundary is respected** — SC 4.1.2, 2.4.3
  ● verified: `role="dialog" aria-modal="true" aria-labelledby="modal-title"` are all present and the tree exposes `dialog "Subscribe to alerts" modal`, with both fields correctly labelled. `main` is *not* `inert` and is not `aria-hidden`, so whether AT honors `aria-modal` on a non-native `<dialog>` varies by pairing.
  needs: screen-reader users; also keyboard-only users (mobility-related, per Section 508 FPC)
  flow: `widget.html` → "Subscribe to alerts" → explore with virtual cursor and with Tab. **Fix the 2.1.2 trap before handing this off** — testers currently have to reload the page to escape.

- **Whether the tide-chart alt text matches the chart** — SC 1.1.1
  `clean.html:42–45` carries a detailed, well-written `alt`. `chart.png` returns 404 on this host, so I could not compare the text against the image. Nobody can verify alt accuracy without seeing both.
  needs: sighted review against the real asset
  flow: `clean.html` → "This week at Pillar Point"

- **Plain-language comprehension of the tide instructions** — SC 3.1.5 (AAA, informational at AA)
  The boating guidance at `clean.html:48–51` ("add the charted depth to the tidal height to estimate water under the keel") is domain-specific. Readable to me is not the same as usable for readers with cognitive disabilities.
  needs: users with cognitive and learning disabilities
  flow: `clean.html` → "Reading the tables"

## Recommendations

**Root-cause fixes — three changes clear most of the list:**
1. **Complete the modal's focus-trap contract** (`widget.html:51–64`). Escape handler + a visible close button + focus restoration to `#open` + `inert` on the background. One change clears the only critical-severity blocker on the site.
2. **Fix the `forms.html` signup field once** (`forms.html:22`): real `<label>`, `type="email"`, `autocomplete="email"`, `name="email"`, `required`. That single line currently carries the 3.3.2 failure, part of the 1.3.5 failure, the missing error path, *and* the bug that throws the address away.
3. **Adopt the `clean.html` page shell as the template for all four pages.** It is the only page that passes both tiers, and it already has the skip link, the landmarks, the nav, and the 3px focus ring the other three lack. Promoting it resolves the 3.2.3, 2.4.1, and 2.4.7 questions structurally instead of page by page.

Then the mechanical remainder: `alt` on `promo-banner.png`, `aria-label` on `#do-search`, `#aaaaaa → #767676` on the disclaimer, `autocomplete` on the modal fields, `aria-label` on the video, and text labels on the status dots.

**Send to human and AT testing:** the four ○ items above, on the flows named. Priority order — modal announcement first (highest-risk pattern, an APG Modal Dialog), then the cart live region, then alt-text accuracy once the real assets are deployed. Caption and audio-description authoring for `recap.mp4` is human work that cannot start until the file is available.

**Wire into CI:** run `accesslint:accessibility-diff` against all four pages so the seven ● failures can't silently return. The engine catches four of them (`img-alt`, `color-contrast`, `label-placeholder-only`, `button-name`, `video-captions`); the other three — the keyboard trap, the `autocomplete` gaps, and the missing form `name` — need the inspect tier or a unit test, since a rule engine will not find them.

## What this audit did not cover

- **All four media assets 404 on this host** (`chart.png`, `promo-banner.png`, `recap.mp4`, `recap-poster.jpg`). Alt-text accuracy, caption and audio-description need, video contrast, and any text-in-image were therefore not evaluated. **Re-run the audit against a build with real assets before launch** — the image and video criteria are provisional until then.
- **No server-side behavior.** `/subscribe`, `/search`, `/tides`, `/about`, and `/contact` are not served here, so success and error states after submit, and the pages behind the nav links, are entirely untested. If those routes exist in production, they are unaudited pages outside this sample.
- **All ○ criteria** are untested by definition, and the ◐ findings are undetermined pending a person — they are not passes.
- **Reflow, zoom, and text-spacing checks are approximations.** Measured `scrollWidth === clientWidth` at a 320 px emulated viewport with the WCAG 1.4.12 spacing override and a 200% root font-size applied; no overflow or clipping on any page including the open modal. True browser zoom is not exposed over CDP, so 1.4.4 stays ◐ rather than a pass.
- **The manual tier ran in a Chrome with extensions loaded** — a 1Password `role="status"` region appeared in the `widget.html` a11y tree and is not part of the site. The automated tier ran in a separate clean headless Chrome (`@accesslint/chrome`, port 9223), so scan results are unaffected.
- **Both tiers ran against the same URLs but in different browsers**, so cross-tier dedup is best-effort. In practice the two tiers overlapped on only three findings (`img-alt`, `button-name`, `label-placeholder-only`), and each agreed; scan's result is the one cited.
