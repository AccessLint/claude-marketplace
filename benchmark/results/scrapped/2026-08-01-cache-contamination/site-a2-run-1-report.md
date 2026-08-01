> **SCRAPPED — browser-cache contamination; excluded from grading. See README.md.**
> Preserved verbatim from the agent output. Runner metadata: Opus 5, 50 tool uses, 575 s wall time, 110419 tokens.

# Accessibility assessment — Coastal Almanac (http://127.0.0.1:8000)
WCAG 2.2 Level AA · WCAG-EM · 5 pages/states sampled

## Scope
- **Target & boundary:** the four static pages served at `http://127.0.0.1:8000` — `clean.html`, `forms.html`, `widget.html`, `media.html` — plus the modal-open state of `widget.html`. Goal: WCAG 2.2 AA.
- **Technologies:** static HTML5, inline CSS, vanilla JS. No framework, no build step, so no source maps — findings are grounded by CSS selector and by line in the served files.
- **AT baseline for the human handoff (scoped here, not tested):** NVDA + Firefox and JAWS + Chrome on Windows; VoiceOver + Safari on macOS/iOS; keyboard-only; 200%/400% browser zoom; Windows High Contrast.

## Sample
- **Structured:** `clean.html` (entry/content template) · `forms.html` (two form templates: subscribe + search) · `widget.html` default state (status list) · `widget.html` **modal-open state** (the only stateful UI on the site) · `media.html` (video + live-region cart template).
- **Random:** none — the site is four pages, so the structured sample is exhaustive. There is no unsampled content.

## Conformance (per success criterion)
- **Fail ● : 6** — 1.1.1, 1.4.3, 3.3.2, 4.1.2, 1.2.2, 2.1.2
- **Pass ● : 9** — 3.1.1, 2.4.2, 1.3.1 (clean/forms/media), 2.4.1, 2.4.7, 1.4.10, 1.4.12, 2.5.8, 2.3.3 (N/A — no motion anywhere)
- **Undetermined (◐/○): 9** — 1.3.5, 1.4.1, 1.2.3, 1.2.5, 2.4.3, 2.4.4, 3.2.3, 3.3.3, 4.1.3
- Pass/fail is asserted only for ● criteria. `1.3.1` fails on `widget.html` specifically (status list), so **1.3.1 fails for the scope**.

**Bottom line: not ready to ship.** One critical blocker (keyboard trap), four serious barriers, and the two worst problems are both invisible to the automated scanner — the engine reported zero violations on `widget.html` in both its closed and open states.

---

## Findings — by severity, tagged by evidence basis

### Critical

**[●] Keyboard trap in the "Subscribe to alerts" dialog — SC 2.1.2 — `widget.html:35-42`, script at `:51-64`**
- where: `#modal[role=dialog]`
- repro: focus `#open`, press Enter. Focus moves to `#m-email`. Then **12 consecutive Tab presses never leave the dialog** — the path cycles `m-email → m-zip → m-submit → m-email …`. Six Shift+Tab presses cycle the same way in reverse. **Escape does not close it** (`modal.hidden` still `false` after the keypress). There is no close control of any kind: the only button inside is `#m-submit` ("Subscribe"), and clicking it also leaves the dialog open.
- impact: a keyboard-only user who opens this dialog cannot return to the page, cannot reach browser chrome via the page, and must reload to escape. No workaround.
- fix: handle `Escape` to set `modal.hidden = true`; add a visible close button inside the dialog; restore focus to `#open` on close. Keep the Tab-cycling only alongside a working exit.

**[●] Search button has no accessible name — SC 4.1.2 — `forms.html:29-34`**
- where: `#do-search` · a11y tree reports `button, name: ""`
- evidence: the button's only child is `<svg aria-hidden="true">`, so nothing contributes a name.
- impact: the sole control for submitting the archive search is unlabelled — announced as just "button".
- fix: add `aria-label="Search"` to `#do-search` (mechanical).

### Serious

**[●] Promo image missing `alt` — SC 1.1.1 — `forms.html:19`**
- where: `main > img.promo` · a11y tree: `image, name: ""` · engine: `text-alternatives/img-alt` (critical)
- fix: `NEEDS HUMAN` for the wording. If the banner carries meaning, write real alt text; if purely decorative, `alt=""`. Note `promo-banner.png` currently 404s, so nobody can judge the content from the running site.

**[●] Disclaimer text fails contrast at 2.32:1 — SC 1.4.3 — `forms.html:9, 37-39`**
- where: `p.disclaimer` — "We send one email a week and never share your address…"
- evidence: `#aaaaaa` on `#ffffff` = **2.32:1**, required 4.5:1 for 16px/400 text.
- fix: darken to at least `#767676` (4.54:1); `#595959` gives comfortable headroom.

**[●] Email field labelled only by placeholder — SC 3.3.2 — `forms.html:22`**
- where: `#email-input` · accessible name resolves to `"you@example.com"` (the placeholder), no `<label>`, no `aria-label`
- impact: the name disappears as soon as the user types, and placeholder text also fails contrast in most UAs.
- fix: add `<label for="email-input">Email address</label>`.
- **Also a functional bug, not just a11y:** this input has **no `name` attribute**, so its value is never submitted to `/subscribe`. The signup form cannot work as written. Worth fixing before launch regardless of accessibility.

**[●] Video has no captions — SC 1.2.2 — `media.html:20-23`**
- where: `main > video` · `video.textTracks.length === 0`, no `<track>` children · engine: `time-based-media/video-captions` (critical)
- impact: the page describes "a five-minute narrated walkthrough", so all of the content is in the audio. Deaf and hard-of-hearing users get nothing.
- fix: `NEEDS HUMAN` — captions must be authored. Add `<track kind="captions" srclang="en" src="…" label="English">` once they exist.

**[◐] Beach status is conveyed by colour alone, and is absent from the a11y tree entirely — SC 1.4.1 + SC 1.3.1 — `widget.html:26-30`**
- where: `.status-list .dot.open` / `.dot.closed`
- evidence: each `<span class="dot">` is empty — no text, no `aria-label`, no `title`, no `role`. The a11y tree renders the list as bare `" Pillar Point"`, `" Half Moon Bay"`, `" Montara"` with **no open/closed status at all**. Green `#2e7d32` vs red `#c62828` is the only carrier of meaning.
- Note the dots do pass non-text contrast (4.67:1 and 5.62:1 against white, SC 1.4.11) — contrast is not the problem; the absence of a text equivalent is.
- I grade the 1.3.1 half ● (the status is provably missing from the tree, which is deterministic) and the 1.4.1 half ◐ only because a person should confirm the intended semantics of each colour before wording the fix.
- fix: add visible text — "Open" / "Closed" — next to each dot, or at minimum a visually-hidden span inside it. Do not rely on `title`.

### Moderate

**[◐] Email field does not identify its input purpose — SC 1.3.5 — `forms.html:22`**
- evidence: `#email-input` has `type="text"` and no `autocomplete`. It collects the user's own email, so 1.3.5 (AA) applies.
- fix: `type="email"` plus `autocomplete="email"`. (`widget.html`'s `#m-email` and `#m-zip` have the same gap — add `autocomplete="email"` and `autocomplete="postal-code"`.)

**[◐] "Save for later" star button does nothing and exposes no state — SC 4.1.2 — `media.html:29`**
- where: `#fav` · accessible name "Save for later" (good), but no `aria-pressed`
- evidence: clicked it via CDP — `aria-pressed`, `class`, and text are byte-identical before and after. There is no event listener bound to `#fav` anywhere in the page script.
- opinion: it reads as a toggle but is inert. If it is meant to toggle, it needs `aria-pressed="true|false"` kept in sync; if it is decorative-pending, it should not be a button. A person should confirm the intended behaviour.

**[◐] Three of four pages have no navigation at all — SC 3.2.3 / 2.4.1 — `forms.html`, `widget.html`, `media.html`**
- evidence: `clean.html` has `header` + `nav[aria-label="Primary"]` + `main` + `footer` and a working skip link. The other three have **only `main`** — no banner, no nav, no contentinfo, no skip link, and no link to anywhere else on the site.
- opinion: if these are real pages in a set, navigation is inconsistent across the set and users can reach them but never leave. If they are fixture/partial templates, this is out of scope. A person should confirm which.

### Minor

**[◐] Focus indicator on `forms.html` falls back to the UA default — SC 2.4.7**
- evidence: `clean.html`, `widget.html`, and `media.html` all define `:focus-visible { outline: 3px solid #0b5394 }` (7.84:1 against white — comfortably passing). `forms.html` defines no such rule, so its controls get the browser default `rgb(0,95,204) auto 1px`. Still visible, but thinner and inconsistent with the rest of the site.
- fix: add the same `:focus-visible` rule to `forms.html`.

**[◐] Video element has no accessible name — SC 4.1.2 — `media.html:20`**
- evidence: no `aria-label` or `title`; the adjacent `<p>` is not programmatically associated.
- fix: `aria-label="Tide season recap"` or associate the description via `aria-describedby`.

**[◐] Skip link moves the sequential-focus point but not `document.activeElement` — SC 2.4.1 — `clean.html:21, 27`**
- evidence: activating it sets `location.hash = "#main"`; `activeElement` stays `BODY`, but the next Tab lands correctly on `#station`, skipping the nav. It works in Chrome.
- opinion: `<main id="main">` has no `tabindex="-1"`, which is the historically flaky pattern across browsers. Adding `tabindex="-1"` makes it robust. Low priority — it functions today.

---

## Verified as passing (worth knowing what's already right)

`clean.html` is genuinely clean — both tiers found nothing. It has a working skip link, correct landmark structure with exactly one `main`, a gapless heading outline (one h1, then h2s), a properly associated `<label>`, and a genuinely descriptive 123-character `alt` on the tide chart. Site-wide: `lang="en"` on every page, a unique descriptive `<title>` on every page, **no horizontal scrolling at 320px on any page** (1.4.10), **no clipping under the WCAG text-spacing override** (1.4.12), and no animation anywhere (2.3.3 N/A). Target sizes pass 2.5.8 — the 18px-tall nav links on `clean.html` clear it via the spacing exception (centres are 54px apart, well over the 24px threshold). The `#cart-status` live region on `media.html` uses the correct pattern: `role="status" aria-live="polite"` present and empty at load, populated on click.

---

## Human-required (○) — the testing handoff

- **Does the cart live region actually announce?** — SC 4.1.3. `role="status" aria-live="polite"` is present at load and correctly populated with "Field guide added to your cart." on click (● verified in the DOM). Whether screen readers announce it, and whether the timing works, is AT-only.
  needs: screen-reader users (blind / low-vision, per Section 508 FPC) · flow: `media.html` → "Add to cart" (exercised)
- **Does the video need audio description?** — SC 1.2.3 (A) / 1.2.5 (AA). Captions are a confirmed ● fail; whether the visuals carry information the narration omits requires someone to watch it. `recap.mp4` 404s, so this could not be assessed at all here.
  needs: sighted reviewer of the finished cut, plus blind users for the AD result · flow: `media.html`
- **Is the tide-chart alt text accurate?** — SC 1.1.1. The alt is well-formed and detailed, but `chart.png` 404s, so nobody can verify it matches the image.
  needs: sighted reviewer with the real asset · flow: `clean.html`
- **Is the dialog usable with a screen reader once the trap is fixed?** — SC 4.1.2 / 2.4.3. `aria-modal="true"` is set, but background `main` is **not** `inert` and not `aria-hidden` (● verified), so virtual-cursor containment depends entirely on AT support for `aria-modal`.
  needs: screen-reader users across NVDA/JAWS/VoiceOver · flow: `widget.html` → "Subscribe to alerts"
- **Error recovery on the subscribe form** — SC 3.3.1 / 3.3.3. Not assessable: `#email-input` is `type="text"`, not `required`, and has no `name`, so no validation can fire and there are no error messages to evaluate. Re-test once the field is fixed.
- **Plain-language and cognitive load** across all four pages — SC 3.1.5-adjacent. Readable to me is not usable for cognitive disabilities.

---

## Recommendations

**Root-cause / pattern fixes — hand to `accesslint:fix`:**
1. **The dialog** (`widget.html`) is the one true blocker. Escape handler + visible close button + focus restoration to `#open`. Everything else on the site is completable; this is not.
2. **`forms.html` is the worst page** — 4 of the 6 ● failures live there, and all four are mechanical one-liners: `alt`, `<label>`, `aria-label` on `#do-search`, and a colour change on `.disclaimer`. Roughly ten minutes of work clears the whole page. While you are in there, add the missing `name="email"` — the form is functionally broken.
3. **Text equivalents for the status dots** (`widget.html`) — this is a content decision, not a mechanical fix, so budget for it.
4. **Adopt the `clean.html` template as the baseline.** It passes both tiers cleanly. The three failing pages differ from it precisely by what they omit — landmarks, `:focus-visible`, labels. Porting its `<head>`/wrapper structure to the other three would clear the moderate and minor findings as a side effect.

**Two important caveats about coverage:**
- **Automation found nothing on the page with the critical defect.** `accesslint scan` reported zero violations on `widget.html` in its default state *and* zero when I re-ran the engine against the serialized modal-open DOM. The keyboard trap and the colour-only status are both invisible to rule engines. Do not read a green scan on that page as a pass.
- **Every image and media asset 404s** (`chart.png`, `promo-banner.png`, `recap.mp4`, `recap-poster.jpg`). Anything requiring the actual asset content — alt-text accuracy, audio description, video-control keyboard operability — is undetermined rather than passing. Re-run against a build with real assets before launch.

**Send to human + AT testing:** the `widget.html` subscribe flow and the `media.html` add-to-cart flow, once the trap is fixed. Those two carry all the ○ items.

**CI:** wire `accesslint:diff` into the build for all four pages to hold the line once fixed — but pair it with a keyboard-traversal test for the dialog, since `diff` inherits the same automation blind spot described above.

**One process note:** the `chrome-devtools` MCP is attached to your everyday Chrome (LinkedIn, Gmail, Stripe, and ~14 other tabs), and something kept re-selecting the active tab out from under me mid-test, which broke the first two interaction attempts. I switched to a dedicated headless Chrome over CDP for all the interaction evidence above. Separately, that browser initially served me a **cached older revision** of `widget.html` carrying explanatory source comments that the live file does not have; I re-verified with cache disabled and a cache-busting query, and every finding above is against the currently-served content. For future audits, pointing the browser MCP at a dedicated profile would avoid both problems.
