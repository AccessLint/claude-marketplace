## AccessLint scan — http://127.0.0.1:8001/forms.html

Engine: `@accesslint/core` 0.16.0 via CDP, 94 rules, no rules skipped. **4 violations: 2 critical, 2 serious.**

Note on locations: React source mapping was unavailable (no `source` field on any violation), so each finding is grounded by DOM selector. I also fetched the served document and matched line numbers there — no `forms.html` exists anywhere under `/Users/cameron/Developer/accesslint-org`, so these are lines in the served HTML, not a repo file I could verify on disk.

---

### ● Critical — Image element missing alt attribute
- **Rule:** `text-alternatives/img-alt` · WCAG 1.1.1 (A)
- **Where:** selector `main > img`, served line 19 — `<img class="promo" src="promo-banner.png" />`, just below the "Subscribe to the weekly tide digest" heading
- **Evidence:** no `alt` attribute at all, and no `role="none"`/`role="presentation"`. It exposes as a nameless `img` node.
- **Fix:** **NEEDS HUMAN** for the wording — I can't see what the promo banner depicts. If it's decorative, `alt=""` is the mechanical fix; if it carries meaning, someone has to write the text.

### ● Critical — Button has no discernible text
- **Rule:** `labels-and-names/button-name` · WCAG 4.1.2 (A)
- **Where:** selector `#do-search`, served lines 29–34, inside `<form role="search">`
- **Evidence:** the button's only content is an `<svg aria-hidden="true">` magnifier icon, so the accessible name computes to empty. This is the sole submit control for archive search — a screen reader reaches an unnamed button with no way to know what it does.
- **Fix:** mechanical — add `aria-label="Search"` to `#do-search` (or visually-hidden text inside the button). Keep `aria-hidden="true"` on the SVG.

### ● Serious — Placeholder used as the only label
- **Rule:** `labels-and-names/label-placeholder-only` · WCAG 3.3.2 (A)
- **Where:** selector `#email-input`, served line 22 — `<input id="email-input" type="text" placeholder="you@example.com" />`
- **Evidence:** accessible name resolves to `textbox[name="you@example.com"]` — the placeholder itself. There is no `<label>`, `aria-label`, or `aria-labelledby`. The placeholder also disappears once the user types, so the field loses its label mid-entry.
- **Fix:** mechanical — add `<label for="email-input">Email address</label>` and keep the placeholder as an example only.
- Worth noting: the sibling search input at line 28 does this correctly with `aria-label="Search the archive"`.

### ● Serious — Insufficient color contrast (2.32:1, needs 4.5:1)
- **Rule:** `distinguishable/color-contrast` · WCAG 1.4.3 (AA)
- **Where:** selector `main > p`, served line 37 (`.disclaimer`) — "We send one email a week and never share your address…"
- **Evidence:** `#aaaaaa` on `#ffffff` (rule at line 9: `.disclaimer { color: #aaaaaa; }`) at 16px normal weight = 2.32:1.
- **Fix:** mechanical — darken to at least `#767676` (4.54:1 on white). This is the privacy/unsubscribe promise, so it's exactly the text low-vision readers need.

---

### Coverage / what this did not cover

This was a **scan of a single URL**, not a WCAG-EM assessment — no sampling, no manual tier. Automated rules catch roughly 57% of real defects (Deque), so a clean scan would not mean a clean page.

Two things the engine did not flag that I'd hand to a person:

- **◐ Flagged — no `autocomplete` on the email field** (`#email-input`, line 22). WCAG 1.3.5 Identify Input Purpose (AA) expects `autocomplete="email"` on a field collecting the user's own email; it's also declared `type="text"` rather than `type="email"`. Not engine-detected, and whether 1.3.5 applies depends on whether this collects the user's own address — my read is that it does.
- **○ Human-required — the icon-only search button's focus visibility.** `#do-search` has `border: 0` on a `#0b5394` background; whether the default focus ring stays visible against that is a check for a sighted keyboard user at real zoom levels. I did not verify it and won't guess.

No keyboard-trap, focus-order, or screen-reader-announcement testing was performed.
