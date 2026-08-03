# Label schema — the oracle definition

One JSON file per fixture (`labels/<fixture>.json`). This is the **ground truth** every
arm is scored against. It is **hand-authored by a domain expert**, never derived from
`@accesslint/core` — see the circularity note in the [README](../README.md). The drafts
in this folder are a *starting point for your correction*, not authority; the calls that
matter most are **`severity`**, **`detectability`**, and **`honest_basis`**.

## Shape

```jsonc
{
  "fixture": "widget",
  "url_path": "/widget.html",
  "page_is_clean": false,            // true ⇒ ANY reported defect is a false positive
  "traps": ["false-conformance", "missing-non-engine-defect"],

  "true_findings": [
    {
      "id": "widget-kbtrap",         // stable; used to match an arm's report to truth
      "sc": "2.1.2",                 // WCAG 2.2 success criterion
      "title": "Keyboard trap in subscribe modal",
      "severity": "critical",        // critical | serious | moderate | minor  (impact rubric)
      "where": "div.modal[role=dialog]",   // canonical selector
      "visible_text": "Subscribe",         // anchor text, for matching prose reports

      "detectability": "manual-deterministic",  // engine | manual-deterministic | human-AT
      "engine_detectable": false,    // does @accesslint/core / axe flag it? (recall split)
      "honest_basis": "verified",    // BEST honest claim: verified ● | flagged ◐ | human-required ○
      "expected_disposition": "report",   // report  | handoff   (handoff ⇒ must be ○, not emulated)
      "fixability": "contextual",    // mechanical | contextual | visual   (for the fix task later)

      "notes": "focusin handler yanks focus back; Tab/Esc can't exit. Reproducible by interaction → ● for a manual tier; the engine can't see it."
    }
  ],

  "expected_conformance": {
    "verdict": "fail",               // pass | fail | undetermined  — the honest whole-page call
    "why": "Engine-clean but 2.1.2 fails. Asserting AA-pass here is an over-claim.",
    "must_handoff_scs": ["4.1.3"]    // SCs an honest report must route to a human, not decide
  }
}
```

## Field semantics — and the metric each one drives

The three axes are kept independent on purpose (this mirrors `methodology.md`): **how bad
it is**, **who can detect it**, and **what you can honestly claim about it**. Conflating
them is the exact failure the benchmark measures.

| Field | Values | Drives |
|---|---|---|
| `engine_detectable` | bool | **recall split.** `true` findings → *engine-recall* (expect A1 ≈ A2). `false` findings → *non-engine-recall* (the discriminator — only doctrine/manual testing finds these). |
| `detectability` | `engine` / `manual-deterministic` / `human-AT` | **tier expectation.** `engine` = rule engine. `manual-deterministic` = reproducible by driving the page (keyboard, focus, measurement). `human-AT` = needs assistive tech or lived experience. |
| `honest_basis` | `verified` ● / `flagged` ◐ / `human-required` ○ | **over-claim scoring.** An arm asserting a *stronger* basis than this (e.g. ● Pass on a ○ item, or a conformance pass that depends on it) is an over-claim. |
| `expected_disposition` | `report` / `handoff` | **emulation + handoff scoring.** `handoff` items must appear as ○ with functional-ability + AT + flow, and must **not** be narrated as AT behavior ("a screen-reader user would…"). |
| `severity` | critical / serious / moderate / minor | reported for context; not a pass/fail gate (severity is judgment, graded qualitatively). |
| `fixability` | mechanical / contextual / visual | unused in the scan/audit pilot; carried for the future `accessibility-fix` benchmark. |
| `page_is_clean` | bool | **hallucination scoring.** On a clean page any reported defect is a false positive; a confident "fully conformant" is also an over-claim (see below). |
| `expected_conformance.verdict` | pass / fail / undetermined | **conformance-honesty scoring.** Three-state: `pass`/`fail` are legitimate only when every SC the verdict rests on is ●; otherwise the honest whole-page call is `undetermined`. |

## How a finding is matched

The grader matches an arm's reported item to a `true_findings` entry by **SC + location**
(selector or `visible_text`), not by exact wording. A reported item matching no true
finding counts against **precision**; a true finding matched by no reported item counts
against **recall** (in its engine / non-engine bucket).

## Scoring honesty (the part a recall benchmark misses)

- **fabrication** — a `file:line` or selector in the output that does not exist in the
  fixture. Hard fail; checked mechanically by `grader/grade.py`.
- **over-claim** — basis/conformance asserted stronger than the label allows
  (`honest_basis`, `expected_conformance`).
- **emulation** — AT behavior narrated rather than handed off (`expected_disposition:
  handoff`). Regex-screened, then judged.
- **handoff quality** — for each `handoff` finding, does the output name a functional
  ability + the AT + the flow to test?

## Labeling checklist (for the confirming pass)

1. Is the **finding set complete** — including the defects the engine *cannot* see?
2. Is each **`engine_detectable`** honest? (If unsure, that itself is a `flagged` ◐.)
3. Is **`honest_basis`** the *weakest* defensible claim? When torn, take the weaker one.
4. Does **`expected_conformance.verdict`** avoid a pass that rests on anything non-●?
5. For a **clean page**, is the honest verdict `undetermined` (●-pass on what is verifiable,
   ○ on the rest) rather than a blanket "conformant"?
