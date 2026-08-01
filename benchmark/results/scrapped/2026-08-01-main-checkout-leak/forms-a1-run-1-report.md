> **SCRAPPED — read the un-stripped fixture in the main checkout (spoiler header); excluded from grading. See README.md.**
> Runner metadata: Opus 5, 10 tool uses, 113 s wall time, 51762 tokens.

## Accessibility report — http://127.0.0.1:8001/forms.html

Audited the live DOM with the AccessLint engine (`@accesslint/core` via CDP), then verified each finding in Chrome and did a manual pass for issues automation can't judge. Line numbers refer to the served page source.

### Blocking (critical)

**1. Promo image has no `alt` attribute** — `main > img`, line 19
Rule: `text-alternatives/img-alt` · WCAG 1.1.1 (A). With `alt` omitted entirely, screen readers typically fall back to announcing the filename ("promo-banner.png"). Decide the image's role: if it's a decorative banner, `alt=""` removes it from the accessibility tree; if it carries information, describe it. Related: the image 404s (`naturalWidth === 0`).

**2. Search button has no accessible name** — `#do-search`, lines 29–34
Rule: `labels-and-names/button-name` · WCAG 4.1.2 (A). The button's only content is an SVG correctly marked `aria-hidden="true"`. Add `aria-label="Search"`.

### Serious

**3. Email field is labelled only by its placeholder** — `#email-input`, line 22
Rule: `labels-and-names/label-placeholder-only` · WCAG 3.3.2 (A) / 4.1.2 (A). Add a real `<label for="email-input">`.

**4. Disclaimer text fails contrast** — `p.disclaimer`, line 37 (color set at line 9)
Rule: `distinguishable/color-contrast` · WCAG 1.4.3 (AA). Measured **2.32:1**; darken to `#767676` (4.54:1).

### Additional findings (manual review — not flagged by the engine)

**5. Email field missing `autocomplete`** — WCAG 1.3.5 (AA). Needs `autocomplete="email"`.
**6. Email field is `type="text"`** — `type="email"` recommended.
**7. Functional bug** — no `name` attribute; the subscribe form posts no data.

### Checked and passing

Search button 32×42 (2.5.8 pass); icon contrast 7.84:1 (1.4.11); no focus-outline suppression; `lang="en"`, title, `main`, heading order correct; `#q` labelled via `aria-label` with `role="search"`.

### Suggested fix order
Items 1 and 2 first, then 3 and 5 together, then 4.

One note on sourcing: the served markup does not match `/Users/cameron/Developer/accesslint-org/skills/benchmark/fixtures/forms.html` exactly — that file carries an extra header comment block absent from the HTTP response — so if you're editing on disk, confirm which copy the server on port 8001 is reading before applying line-numbered changes.
