I scanned the live page with the AccessLint engine (94 rules, via CDP against the rendered DOM), then read the served source to add findings automation can't catch. Managed Chrome has been torn down.

# Accessibility report — http://127.0.0.1:8001/forms.html

**Engine violations: 4** — 2 critical, 2 serious. Plus 2 manual findings.

Note: the CLI returned no `source` mapping for this target, so locations are given by selector plus line numbers from the served HTML document, which I retrieved directly.

## Critical

**1. Promo image has no alt attribute** — WCAG 1.1.1 (A)
- **Where:** `main > img` — line 19, `<img class="promo" src="promo-banner.png">`
- **Evidence:** No `alt` attribute at all, so screen readers announce the filename ("promo-banner.png") or skip unpredictably. Worth noting: the file returns **404**, so nothing renders — the broken image plus missing alt means the region is entirely silent and invisible.
- **Fix:** `NEEDS HUMAN` — depends on intent. If the banner carries information (an offer, a headline), it needs descriptive text: `alt="...">`. If it's purely decorative chrome, `alt=""` is correct. Someone has to decide which, and separately fix the 404.

**2. Search submit button has no accessible name** — WCAG 4.1.2 (A)
- **Where:** `#do-search` — line 29, inside `<form role="search">`
- **Evidence:** The button's only content is an `<svg aria-hidden="true">` magnifier icon. Hiding the SVG is correct practice, but nothing replaces it, so the computed accessible name is empty. Screen readers announce only "button"; voice-control users have no name to speak.
- **Fix:** Mechanical — add `aria-label="Search"` to the `<button>`. (Keep `aria-hidden="true"` on the SVG.)

## Serious

**3. Email field uses placeholder as its only label** — WCAG 3.3.2 (A)
- **Where:** `#email-input` — line 22, `<input id="email-input" type="text" placeholder="you@example.com">`
- **Evidence:** Accessible name resolves to `you@example.com` — the example value, not a label. Placeholder text vanishes the moment the user types, so anyone who pauses mid-entry, uses magnification, or has memory/attention difficulties loses the field's identity. It also inherits the placeholder's low contrast.
- **Fix:** Mechanical — add a real label: `<label for="email-input">Email address</label>`. Keep the placeholder only as a format hint, or drop it.

**4. Disclaimer text fails contrast** — WCAG 1.4.3 (AA)
- **Where:** `main > p.disclaimer` — line 37; the color is set at line 9, `.disclaimer { color: #aaaaaa; }`
- **Evidence:** `#aaaaaa` on `#ffffff` = **2.32:1**, against a 4.5:1 requirement for normal-size text. Well under half the threshold.
- **Fix:** Mechanical — darken to at least `#767676` (4.54:1). For comfortable margin use `#6b6b6b` (5.3:1). Body text elsewhere is `#1a1a1a` at 17.4:1, so this is an isolated deviation.

## Manual findings (not engine-detected)

**5. Email field missing `autocomplete`** — WCAG 1.3.5 Identify Input Purpose (AA)
- **Where:** `#email-input` — line 22
- **Evidence:** The field collects the user's own email address, which is a listed input purpose, but has no `autocomplete` attribute. Users relying on autofill — significant for motor and cognitive disabilities — get no assistance.
- **Fix:** Mechanical — add `autocomplete="email"`. Also change `type="text"` to `type="email"` for the correct mobile keyboard and built-in validation.

**6. Email input has no `name` attribute** — not a WCAG failure, but it breaks the form
- **Where:** `#email-input` — line 22
- **Evidence:** The input has `id` but no `name`, so its value is never submitted to `/subscribe`. The search input at line 28 correctly has `name="q"`.
- **Fix:** Mechanical — add `name="email"`.

## What passed

Worth recording so these aren't re-litigated: the search input (line 28) is correctly labelled via `aria-label`, the search form carries `role="search"`, heading order is clean (h1 → h2), `lang="en"` is set, content sits in a `<main>` landmark, no CSS suppresses focus outlines, and the search button's icon contrast is 7.84:1 against its background — comfortably passing 1.4.11.

## Suggested order

Items 2, 3, 4, 5, and 6 are all mechanical one-line changes and can be done in a single pass. Item 1 is the only one needing a human decision — what the banner is for — and it's tangled with a separate 404 bug that should be filed regardless.
