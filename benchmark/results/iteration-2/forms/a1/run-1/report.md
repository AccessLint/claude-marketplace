Audit complete. I ran the AccessLint engine against the live DOM at `http://127.0.0.1:8001/forms.html` and cross-read the served source.

## 4 confirmed violations

**1. Image missing `alt` — CRITICAL** (`text-alternatives/img-alt`, WCAG 1.1.1)
- Location: line 19, `main > img` — `<img class="promo" src="promo-banner.png" />`
- No `alt` attribute at all, so screen readers fall back to announcing the filename ("promo-banner.png").
- Note: the src is a **404** (I fetched it directly — `http://127.0.0.1:8001/promo-banner.png` returns 404). There is no actual image content, only the `#ddd` CSS background from line 12. That makes it almost certainly decorative, so `alt=""` is the right fix — but the broken src is worth fixing on its own.

**2. Icon-only button has no accessible name — CRITICAL** (`labels-and-names/button-name`, WCAG 4.1.2)
- Location: lines 29–34, `#do-search` in the archive search form.
- The button's only content is an inline SVG magnifying glass marked `aria-hidden="true"`, which correctly hides the decorative graphic but leaves the button with no name. Screen readers announce just "button."
- Fix: `aria-label="Search"` on the `<button>`.

**3. Insufficient color contrast — SERIOUS** (`distinguishable/color-contrast`, WCAG 1.4.3)
- Location: text at lines 37–39 (`p.disclaimer`); the offending rule is line 9, `.disclaimer { color: #aaaaaa; }`
- `#aaaaaa` on `#ffffff` = **2.32:1**, against a 4.5:1 requirement for normal-size text. Roughly half the needed contrast.
- Fix: darken to about `#767676` or darker (`#767676` on white ≈ 4.54:1).

**4. Placeholder used as the only label — SERIOUS** (`labels-and-names/label-placeholder-only`, WCAG 3.3.2 / 4.1.2)
- Location: line 22, `#email-input` — `<input id="email-input" type="text" placeholder="you@example.com" />`
- The only hint of purpose is the placeholder, which vanishes on first keystroke and is typically low-contrast. There is no `<label for="email-input">`, `aria-label`, or `aria-labelledby`.
- Fix: add a visible `<label for="email-input">Email address</label>`; keep the placeholder as a supplementary format example if desired.

## One additional issue the automated engine won't flag

**Email field missing input purpose metadata** (WCAG 1.3.5 Identify Input Purpose, Level AA) — line 22. The subscribe field collects the user's own email but is `type="text"` with no `autocomplete` attribute. It should be `type="email" autocomplete="email"`, which also enables autofill and the correct mobile keyboard. This is a manual-review finding, not an engine violation.

## What's already correct

Worth noting so it doesn't get changed in a cleanup pass: the page has `lang="en"` and a descriptive `<title>`; heading order (h1 → h2) is valid; content sits inside `<main>`; the search form uses `role="search"`; and the archive input at line 28 is properly named via `aria-label="Search the archive"` — that's the pattern the subscribe input at line 22 is missing.

Both critical issues (the unlabeled search button and the alt-less image) plus the placeholder-only label are on the primary user paths — subscribing and searching are the only two things this page does.
