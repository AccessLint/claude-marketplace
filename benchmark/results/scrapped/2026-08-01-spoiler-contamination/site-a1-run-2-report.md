> **SCRAPPED — spoiler contamination; excluded from grading. See README.md.**
> Preserved verbatim from the agent's returned output (its file write was blocked
> by the harness). Runner metadata: Opus 5, 53 tool uses, 469 s wall time.

# Coastal Almanac — WCAG 2.2 AA pre-launch accessibility report

**Scope:** `clean.html`, `forms.html`, `widget.html`, `media.html` at `http://127.0.0.1:8000`
**Date:** 2026-08-01
**Method:** AccessLint engine v0.16.0 (94 rules) against the live DOM via CDP, plus manual keyboard interaction and accessibility-tree inspection in Chrome 150.
**Source grounding:** the served pages are byte-identical to the fixtures in `benchmark/fixtures/`, so line numbers below are real and citable.

---

## Verdict

**Do not ship `widget.html` as-is.** It contains a keyboard trap that I reproduced by hand — a keyboard-only user who opens the subscribe dialog cannot get out of it without a mouse or closing the tab. That is a Level A failure and, in practice, a page-level lockout.

| Page | Automated | Verified verdict |
|---|---|---|
| `clean.html` | 0 violations | **No verifiable violations found.** Two items need human judgment (§3). Not the same as "certified conformant." |
| `forms.html` | 4 violations | **FAIL** — 3× Level A, 1× Level AA. All mechanical, all fixable in minutes. |
| `widget.html` | **0 violations** | **FAIL** — 2 real defects the engine structurally cannot see. Do not trust the clean scan here. |
| `media.html` | 1 violation | **FAIL** — 1× Level A (captions). One item is human-AT only. |

The important line is `widget.html`: a clean automated result and a failing page. Roughly a third to a half of WCAG success criteria are not machine-testable, so "0 violations" means "no rule fired," never "accessible."

---

## 1. Blockers — fix before launch

### 1.1 Keyboard trap in the subscribe dialog — WCAG 2.1.2 Keyboard Trap (Level A)

- **Severity:** Blocker. Most serious issue on the site.
- **Where:** `widget.html:66-79` (the `modal.addEventListener("keydown", …)` handler); dialog markup at `widget.html:47-54`.
- **Confidence:** Confirmed by interaction — not inferred from reading code.

**Evidence, reproduced in-browser:**

1. Activating **Subscribe to alerts** moves focus to `#m-email` (`widget.html:61`).
2. Pressing Tab repeatedly produced this focus trace, never leaving the dialog across two full cycles:
   `open → m-email → m-zip → m-submit → m-email → m-zip → m-submit → m-email`
3. **Escape does nothing.** After Escape: `modal.hidden === false`, focus still `#m-email`. There is no Escape branch in the handler.
4. **There is no close control.** The dialog contains exactly one button — "Subscribe". No close, cancel, or dismiss affordance at `widget.html:47-54`.
5. The trap is enforced, not accidental: `e.preventDefault()` at both boundaries (`widget.html:72`, `widget.html:75`).

Every keyboard exit is closed: Tab wraps, Shift+Tab wraps, Escape ignored, no close button. The only escapes are a mouse or abandoning the page.

**Related functional bug found while testing:** `#m-submit` has no click handler at all. Clicking "Subscribe" leaves the dialog open and does nothing — the form is non-functional for *every* user, not just keyboard users. Fix in the same change.

**Fix (mechanical):**
- Add a visible close button with an accessible name, included in the focus cycle.
- Handle Escape: set `modal.hidden = true` and return focus to `#open`.
- Return focus to `#open` whenever the dialog closes by any route (2.4.3).
- Strongly recommended: replace the hand-rolled dialog with native `<dialog>` + `showModal()`. Escape-to-close, focus containment, focus return, and background inertness come free, removing this whole bug class.

Keep the focus *containment* — that part is correct modal behavior. The defect is containment **without an exit**.

---

## 2. Confirmed violations

### 2.1 `forms.html` — 4 engine-confirmed defects

| # | Issue | SC | Level | Severity | Location |
|---|---|---|---|---|---|
| 1 | Informative image has no `alt` | 1.1.1 | A | Critical | `forms.html:33`, `main > img` |
| 2 | Icon-only submit button has no accessible name | 4.1.2 | A | Critical | `forms.html:45`, `#do-search` |
| 3 | Email input labelled only by `placeholder` | 3.3.2 | A | Serious | `forms.html:37`, `#email-input` |
| 4 | Body text contrast 2.32:1 (needs 4.5:1) | 1.4.3 | AA | Serious | `forms.html:54`, `main > p` |

**1. Missing `alt`** — `<img class="promo" src="promo-banner.png">`. Verified `hasAttribute('alt') === false`. A screen reader announces the filename or nothing. *Fix:* descriptive `alt` if meaningful, `alt=""` if decorative — **content decision, see §3.3.**

**2. Button with no name** — `<button id="do-search">` contains only an SVG correctly marked `aria-hidden="true"` (`forms.html:46`), leaving nothing to compute a name from. Exposed as `button` with empty name. *Fix:* `aria-label="Search"` on `#do-search`. Keep the SVG `aria-hidden` — that part is right.

**3. Placeholder-as-label** — computed name becomes `you@example.com`, an example value, not a label. Placeholders also vanish on input and usually fail contrast. *Fix:* `<label for="email-input">Email address</label>`, plus `type="email"` and `autocomplete="email"` — the latter required for **1.3.5 Identify Input Purpose (AA)**.

**4. Contrast** — `.disclaimer` uses `#aaaaaa` on `#ffffff` (`forms.html:22`). Measured 2.32:1; I verified the math independently. At 16px normal weight the threshold is 4.5:1 — roughly half the required ratio. *Fix:* `#767676` (4.54:1) minimum; `#595959` (7:1) safer for fine print, which is exactly the text people most need to read.

### 2.2 `media.html` — video has no captions — WCAG 1.2.2 (Level A)

- **Severity:** Critical. **Where:** `media.html:33-36`, `main > video`.
- **Evidence:** verified `video.querySelectorAll('track').length === 0`. The page itself describes "A five-minute narrated walkthrough" (`media.html:37`), so speech carries information and captions are required.
- **Fix:** `<track kind="captions" src="recap.en.vtt" srclang="en" label="English" default>`. **Authoring accurate captions is human work — §3.1.**

### 2.3 `widget.html` — beach status conveyed by colour alone — WCAG 1.4.1 (Level A)

- **Severity:** Serious. **Where:** `widget.html:38-42`; CSS `widget.html:29-30`.
- **Confidence:** Confirmed via the accessibility tree, not just by reading CSS.

Status is carried only by background colour on an empty `<span class="dot">`: green `#2e7d32` = open, red `#c62828` = closed. No text, no `aria-label`, no role.

**Evidence — the full accessibility tree for that list is:**
```
StaticText " Pillar Point"
StaticText " Half Moon Bay"
StaticText " Montara"
```

The open/closed state is **entirely absent** from the accessibility tree — not merely hard to perceive, but nonexistent for screen reader users. Red/green is also the worst pairing for the most common colour vision deficiency. Since this is a public-safety signal about whether a beach is open, I'd rate it above a typical 1.4.1.

*Fix:* add text alongside the dot, e.g. `… Pillar Point — <span class="status">Open</span>`. Visually-hidden text is acceptable; visible text is better here. Adding a shape/icon difference as well as colour also satisfies the perceptual half.

---

## 3. Needs a person

### 3.1 Caption accuracy and audio description — `media.html`
After adding a `<track>`, a human must confirm captions are accurate, synchronised, and identify speakers. Auto-generated captions routinely fail 1.2.2 on accuracy alone.

Separately, **1.2.5 Audio Description (Prerecorded) is Level AA** and therefore in scope. Someone must **watch** the recap and decide whether visually-presented information (tide charts, on-screen figures) is conveyed by narration. If not, an audio description track is required. I cannot determine this — the video doesn't exist at this server (§5) and it requires judgment about visual content.

### 3.2 Live region announcement — `media.html`
`#cart-status` (`media.html:48`) has `aria-live="polite"` and `role="status"`. I confirmed it is present and empty at load, then populated by script (`media.html:53`) — the correct pattern, and the usual failure mode (injecting the container itself) is avoided here.

**But presence of a live region is not proof of announcement.** Whether the text is actually spoken depends on screen reader, browser, verbosity, and focus location. I did not test with a screen reader and will not claim what a screen reader user hears. **Verify with at least two real AT pairings** (NVDA + Firefox, VoiceOver + Safari). Unverified, not passed.

### 3.3 Is the promo banner informative or decorative? — `forms.html:33`
The `alt` fix depends entirely on what the image communicates. Offer/price/deadline not in text → descriptive `alt`. Pure garnish → `alt=""`. A content owner must decide; I have deliberately not guessed.

### 3.4 Is the chart alt text faithful? — `clean.html:49-52`
The alt text is unusually good — specific heights and times rather than "tide chart". But its *accuracy* is unverifiable by tooling: someone must compare it against the rendered chart. Well-written but wrong alt text is worse than none. (Image also 404s here — §5.)

### 3.5 Cognitive load — `clean.html`
"Chart datum" and "water under the keel" (`clean.html:36-39`, `55-58`) are correct for a boating audience. Whether they suit your readership is editorial, not a testable violation. Not counted as a defect.

---

## 4. What I checked and found clean

- **Target size (2.5.8, AA — new in 2.2):** measured every interactive control on all four pages against the 24×24 px minimum. **All pass.** Smallest is `#do-search` at 32×41.6.
- **`clean.html` structure:** skip link (`:28`), landmarks, `nav` with `aria-label="Primary"`, logical h1→h2 order, labelled search, descriptive alt. Clean accessibility tree. Good internal template.
- **Focus visibility (2.4.7):** all four pages define `:focus-visible { outline: 3px solid #0b5394; outline-offset: 2px; }`. Solid, deliberate.
- **`#fav` (`media.html:43`)** — icon-only `★` button but **has** `aria-label="Save for later"`. **Not a defect.** Noted because it resembles the `#do-search` bug and shouldn't be swept into that fix.
- **`#q` (`forms.html:43`)** — has `aria-label="Search the archive"`. Correctly labelled.
- **Page language:** all four declare `lang="en"` (3.1.1). Pass.
- **Modal ARIA markup (`widget.html:47`):** `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → real heading. The *markup* is correct — which is exactly why the engine passed the page. The defect is behavioural.

No issues found with heading order, landmarks, other control naming, or link purpose. This report is not padded.

---

## 5. Caveat: media assets are missing from this server

All four referenced assets return **404**: `chart.png`, `promo-banner.png`, `recap.mp4`, `recap-poster.jpg`. Likely a local fixture-server artifact, but two consequences:

1. §3.1, §3.3, §3.4 depend on seeing the actual media and **cannot be closed out** until assets are available. Re-check after deploying.
2. Confirm assets actually deploy. A broken image with good `alt` still fails users; a broken `<video>` fails 1.2.2 regardless of any `<track>`.

---

## 6. Prioritised action list

| Priority | Action | Page | SC | Effort |
|---|---|---|---|---|
| **P0** | Escape handler + close button + focus return (or native `<dialog>`) | `widget.html:47-79` | 2.1.2 | ~30 min |
| **P0** | Wire up `#m-submit` — currently does nothing for anyone | `widget.html:53` | functional | ~15 min |
| **P1** | Add `alt` to promo image (after §3.3 decision) | `forms.html:33` | 1.1.1 | 2 min |
| **P1** | Add `aria-label="Search"` to `#do-search` | `forms.html:45` | 4.1.2 | 1 min |
| **P1** | Add `<track kind="captions">` + author captions | `media.html:33` | 1.2.2 | asset work |
| **P1** | Add text status alongside colour dots | `widget.html:38-42` | 1.4.1 | ~15 min |
| **P2** | `<label>` for `#email-input` + `type="email"` + `autocomplete="email"` | `forms.html:37` | 3.3.2, 1.3.5 | 5 min |
| **P2** | Darken `.disclaimer` to ≥ `#767676` | `forms.html:22` | 1.4.3 | 1 min |
| **P3** | Screen-reader pass on cart live region | `media.html:48` | 4.1.3 | manual |
| **P3** | Decide whether video needs audio description | `media.html:33` | 1.2.5 | manual |

Everything P1/P2 is minutes of mechanical editing. The real work is P0 and caption authoring.

---

## 7. How to read this report

- **"Confirmed"** = machine-verified by the engine, or reproduced by me through direct interaction (keyboard trap, accessibility-tree gaps).
- **"Needs a person"** = undecidable without human judgment, real AT, or content knowledge. I have not guessed, and have not described what a screen reader user "would hear."
- I report **no verifiable violations** on `clean.html` rather than declaring it conformant. Automated coverage plus a manual keyboard and accessibility-tree pass is not a full WCAG 2.2 AA conformance audit — a formal claim needs AT testing across §3, which is the work that remains.

**Re-run after fixes:** `npx -y @accesslint/cli@latest scan http://127.0.0.1:8000/<page>.html --format json`. Note the engine will pass `widget.html` both before and after the keyboard-trap fix — that one must be re-verified by hand.
