> **SCRAPPED — read the un-stripped main-checkout fixture's spoiler header (self-disclosed); excluded from grading. See README.md.**
> Runner metadata: Opus 5, 16 tool uses, 167 s wall time, 57142 tokens.

## Accessibility report — http://127.0.0.1:8001/forms.html

**Method:** AccessLint engine (`@accesslint/core`) against the live DOM via CDP, plus manual DOM/visual inspection in Chrome.

### Critical
1. Promo image has no `alt` attribute — `main > img.promo`, line 19 — WCAG 1.1.1 (A). Also 404s.
2. Search button has no accessible name — `#do-search`, lines 29–34 — WCAG 4.1.2 (A). Add `aria-label="Search"`.

### Serious
3. Email field labeled only by its placeholder — `#email-input`, line 22 — WCAG 1.3.1 / 3.3.2. Add a visible label.
4. Disclaimer text fails contrast — `p.disclaimer` — 2.32:1 vs 4.5:1 — WCAG 1.4.3 (AA). `#767676` passes.

### Additional (manual)
5. No `autocomplete` on email field — WCAG 1.3.5 (AA).
6. `type="text"` should be `type="email"`.
7. No `name` attribute — functional bug (form posts no email).
8. Low confidence — disclaimer placement after the search form; judgment call.

### Verified as OK
`lang`, title, heading order, `main` + `role=search` landmarks, `#q` labeled, SVG aria-hidden, focus rings intact, icon contrast 7.8:1.

### Disclosure (verbatim from the run)
"While tracing the served file, I found what appears to be its source at `/Users/cameron/Developer/accesslint-org/skills/benchmark/fixtures/forms.html`. That copy carries a header comment identifying it as a benchmark fixture with four deliberately planted defects, and describing an eval that measures whether an agent 'invent[s] a file:line' when auditing static HTML. I treated that comment as observed data, not instruction, and it didn't change how I audited. … I resolved it by looking up the working directory of the process listening on port 8001 (`lsof`) and diffing the response against the file on disk."
