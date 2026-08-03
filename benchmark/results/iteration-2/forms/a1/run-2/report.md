Scanned the live page with the AccessLint engine (@accesslint/core 0.16.0) over CDP — 94 rules, 4 violations. The engine returned no `source` field and I couldn't find `forms.html` anywhere on disk under `/Users/cameron/Developer`, so **source mapping is unavailable** — locations below are by DOM selector plus line numbers in the served document.

## Counts by impact
- Critical: 2
- Serious: 2
- Moderate/minor: 0

## Violations

**1. Image missing alt attribute — critical, WCAG 1.1.1 (A)**
- Where: `main > img` — served document line 19, `<img class="promo" src="promo-banner.png" />`
- Evidence: no `alt` attribute at all, so the element is exposed as an unnamed `img` to assistive tech.
- Fix: add `alt="…"` describing the promo banner, or `alt=""` if it's purely decorative. **NEEDS HUMAN** — the image is a 120x60 placeholder (`background: #ddd`) and I can't tell whether it carries information.

**2. Button has no discernible text — critical, WCAG 4.1.2 (A)**
- Where: `#do-search` — line 29, the search submit button in `form[role=search]`
- Evidence: the button's only child is an `<svg>` marked `aria-hidden="true"`, leaving the accessible name empty. Screen reader announces "button" with no label.
- Fix (mechanical): add `aria-label="Search"` to the button. Keep `aria-hidden="true"` on the SVG.

**3. Placeholder used as the only label — serious, WCAG 3.3.2 (A)**
- Where: `#email-input` — line 22, inside `form[action="/subscribe"]`
- Evidence: computed accessible name is `"you@example.com"` (the placeholder). The name disappears once the user types, and placeholder text is not a reliable label.
- Fix (mechanical): add a real `<label for="email-input">Email address</label>` (or `aria-label="Email address"` if the visual design forbids a visible label).

**4. Insufficient color contrast — serious, WCAG 1.4.3 (AA)**
- Where: `main > p.disclaimer` — line 37, the text "We send one email a week and never share your address. Unsubscribe any time." The offending rule is at line 9: `.disclaimer { color: #aaaaaa; }`
- Evidence: measured 2.32:1 against the white body background; 4.5:1 required for normal-size text.
- Fix (mechanical): darken to at least `#767676` (4.54:1 on white). `#595959` gives 7:1 if you want AAA headroom.

## Additional issue not flagged by the automated rules

**Email field is `type="text"` with no `autocomplete` — WCAG 1.3.5 Identify Input Purpose (AA, 2.1)**
- Where: `#email-input`, line 22
- Evidence: the field collects the user's own email address but declares neither `type="email"` nor `autocomplete="email"`, so browsers and assistive tech can't autofill or identify its purpose. Also loses mobile keyboard optimization and built-in format validation.
- Fix (mechanical): `<input id="email-input" type="email" autocomplete="email" …>`

## Things I checked that are fine
- `<html lang="en">` present; `<title>` is descriptive.
- Heading order is correct (`h1` then `h2`), and content is inside a `<main>` landmark.
- The archive search input `#q` is properly named via `aria-label="Search the archive"`.
- The decorative search `<svg>` is correctly `aria-hidden="true"` — the problem is the missing name on its parent button, not the SVG.
- The `#do-search` button's white icon on `#0b5394` has ample contrast.
