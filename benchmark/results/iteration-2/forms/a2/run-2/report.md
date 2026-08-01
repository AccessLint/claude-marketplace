Scanned `http://127.0.0.1:8001/forms.html` with the AccessLint engine (@accesslint/core via CDP, 94 rules, 0 skipped). This is a single-URL automated scan, not a WCAG-EM assessment.

## Counts

4 violations — 2 critical, 2 serious.

The engine returned no `source` map (plain static HTML, no React fibers), so findings are located by selector. I corroborated each against the file the dev server is actually serving: `/private/tmp/claude-501/-Users-cameron-Developer-accesslint-org-skills--claude-worktrees-skill-suite-familiarization-7bfe4c/47d7d54a-984d-4eea-8d6c-41b3232ec393/scratchpad/serve/forms.html`.

## Violations

**1. Critical — image missing alt text** (`text-alternatives/img-alt`, WCAG 1.1.1, Level A)
- Where: selector `main > img`, line 19. Near the heading "Subscribe to the weekly tide digest".
- Evidence: `<img class="promo" src="promo-banner.png">` — no `alt` attribute at all, so it exposes as an unnamed `img` role.
- Fix: NEEDS HUMAN for the wording. If the banner carries meaning, add descriptive `alt`; if purely decorative, `alt=""`. Leave a TODO with rule ID rather than inventing copy.

**2. Critical — submit button has no accessible name** (`labels-and-names/button-name`, WCAG 4.1.2, Level A)
- Where: selector `#do-search`, lines 29–34, inside `form[role=search]`.
- Evidence: the button's only content is an `<svg aria-hidden="true">` magnifier, so its accessible name computes to empty. This is the sole submit control for the archive search.
- Fix (mechanical): add `aria-label="Search"` to the button — the icon stays `aria-hidden`.

**3. Serious — placeholder used as the only label** (`labels-and-names/label-placeholder-only`, WCAG 3.3.2, Level A)
- Where: selector `#email-input`, line 22, in the subscribe form.
- Evidence: `<input id="email-input" type="text" placeholder="you@example.com">` — no `<label>`, `aria-label`, or `aria-labelledby`; the name resolves to the placeholder text `"you@example.com"`, which disappears on typing.
- Fix (mechanical): add `<label for="email-input">Email address</label>`, keep the placeholder as an example. Also worth `type="email"` for input purpose, though that's outside this rule.
- Note the neighboring search input (line 28) does this correctly with `aria-label` — it's not flagged.

**4. Serious — insufficient text contrast** (`distinguishable/color-contrast`, WCAG 1.4.3, Level AA)
- Where: selector `main > p` (`.disclaimer`), lines 37–39; the color comes from `.disclaimer { color: #aaaaaa; }` at line 9.
- Evidence: measured 2.32:1 against the white body background; 4.5:1 required for this text size.
- Fix (mechanical): darken to at least `#767676` on `#fff` (4.54:1); `#595959` gives 7:1 if you want AAA headroom.

## Not covered

Automated rules catch roughly half of real defects. This scan says nothing about keyboard operability, focus order and visibility, error handling on submit (both forms post without any client-side validation feedback in the markup), or how the search and subscribe flows behave with a screen reader. Those need the manual tier or a human with AT. Only this one URL was scanned — no sampling of other pages or states.
