## Scan: http://127.0.0.1:8001/forms.html

Automated tier only (`@accesslint/core` 0.16.0 over CDP, 94 rules, none skipped). This is a single-URL scan, not a WCAG-EM assessment — no sampling, and the manual tier was not run.

**4 violations: 2 critical, 2 serious.**

Engine `source` mapping was unavailable (not a React app), so violations were located by selector; I resolved the file separately by tracing the server on port 8001 to its document root. Source file: `/private/tmp/claude-501/-Users-cameron-Developer-accesslint-org-skills--claude-worktrees-skill-suite-familiarization-7bfe4c/47d7d54a-984d-4eea-8d6c-41b3232ec393/scratchpad/serve/forms.html`

### Critical

**1. Image missing alt attribute** — `text-alternatives/img-alt`, WCAG 1.1.1 (A) ● verified
- Where: `main > img`, line 19 — `<img class="promo" src="promo-banner.png" />`, the promo banner directly under the h1.
- Evidence: no `alt` attribute at all; exposed to the a11y tree as an unnamed `img` role.
- Fix: NEEDS HUMAN for the text itself — I can't see what `promo-banner.png` depicts. If it carries information, add descriptive alt; if it's purely decorative, `alt=""`. Leave a TODO with rule ID `text-alternatives/img-alt`.

**2. Search button has no discernible text** — `labels-and-names/button-name`, WCAG 4.1.2 (A) ● verified
- Where: `#do-search`, lines 29–34, inside `form[role=search]`.
- Evidence: the button's only content is an `<svg aria-hidden="true">` magnifying glass, so its accessible name computes to empty. A screen reader gets "button" with nothing else.
- Fix: mechanical — add `aria-label="Search"` to the button (the adjacent input at line 28 already carries `aria-label="Search the archive"`, so the pattern is established on this page).

### Serious

**3. Insufficient text contrast — 2.32:1** — `distinguishable/color-contrast`, WCAG 1.4.3 (AA) ● verified
- Where: `main > p.disclaimer`, line 37 — "We send one email a week and never share your address. Unsubscribe any time."
- Evidence: `#aaaaaa` on `#ffffff` (rule at line 9) = 2.32:1, against a required 4.5:1 for body-size text.
- Fix: mechanical — darken `.disclaimer` to at least `#767676` (4.54:1 on white).

**4. Email field labeled only by placeholder** — `labels-and-names/label-placeholder-only`, WCAG 3.3.2 (A) ● verified
- Where: `#email-input`, line 22 — `<input id="email-input" type="text" placeholder="you@example.com" />` in the subscribe form.
- Evidence: accessible name resolves to the placeholder string `"you@example.com"`, which is a format hint, not a label — and it disappears once the user types.
- Fix: mechanical — add `<label for="email-input">Email address</label>`. Keep the placeholder as the format example.

### Flagged for a person (◐, not engine-detected)

- **Missing `autocomplete` on the email field** (line 22), WCAG 1.3.5 Identify Input Purpose (AA). The field collects the user's own email, which is in the WCAG input-purpose list, so `autocomplete="email"` is likely owed. Flagged rather than verified because whether the field is "about the user of the page" is a content judgment. Adding `type="email"` alongside it would also improve the mobile keyboard, though that's UX, not conformance.

### Not covered

- Only this one URL was scanned; no other pages or states.
- The semi-automated manual tier (keyboard traversal, focus order and visibility through both forms, error handling on submit) was not run — use `accesslint:inspect` for that.
- Criteria requiring assistive technology or lived experience remain undetermined; the automated tier catches roughly 57% of real defects.

Chrome was launched managed on port 9223 and has been stopped. No files were edited.
