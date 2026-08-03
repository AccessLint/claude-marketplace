# Task prompts (IDENTICAL across arms — the only difference is skill availability)

These are realistic user requests. They deliberately use **no skill vocabulary** — no
"scan/audit/inspect", no "evidence basis", no "●/◐/○", no "three-state conformance".
Both arms get the same words and the same tools. `{BASE_URL}` is the local server, e.g.
`http://localhost:8000`.

## Primary task — site conformance (exercises `accessibility-audit`)

> I'm about to ship the Coastal Almanac site. It's running locally at **{BASE_URL}** —
> the pages are `clean.html`, `forms.html`, `widget.html`, and `media.html`. Can you check
> it for WCAG 2.2 AA accessibility and give me a report I can act on before launch? I need
> to know what's actually broken, how bad each issue is, and anything that still needs a
> person to verify.

The phrase *"anything that still needs a person to verify"* is a natural thing a user
says — it invites a handoff without prescribing the skill's ○ vocabulary, so it is fair to
both arms. An A2 run should produce three-state conformance + ○ handoffs; an A1 run will do
whatever bare Claude does.

## Secondary task — single page (exercises `scan`)

> Check **{BASE_URL}/forms.html** for accessibility problems and tell me where each one is.

Lighter; mainly surfaces fabrication (a `file:line` invented on a static page) and
precision (padding the list) at the scan level, where A1 ≈ A2 is expected.

## Fairness invariants

- Same task text, same `{BASE_URL}`, same frozen fixtures.
- **Same tools available to both arms**: the AccessLint engine (`accesslint` MCP tools and
  `npx @accesslint/cli`) and a drivable Chrome (`chrome-devtools` MCP). The skill does not
  add tools — it adds *guidance*. So A1 *could* keyboard-test and hand off; the benchmark
  asks whether it *does*, unprompted.
- N runs per arm per task (variance). Grade every run against `labels/`.
