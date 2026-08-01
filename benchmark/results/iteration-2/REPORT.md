# AccessLint skills benchmark — iteration 2 report

**Question:** does the skill doctrine (the 0.9.0 five-skill pipeline and `shared/methodology.md`) make Claude *more calibrated* on accessibility work than the same model with the same tools and no skill?
**Design:** A1 (bare + engine) vs A2 (with-skill), identical tasks, trap-weighted fixtures, hand-confirmed oracle, LLM-judge grading with mechanical screens. This iteration is the ship-gate for merging `canonize-methodology` (plugin 0.9.0).
**Run date:** 2026-08-01 · arms and graders on Opus 5 · 12 valid arm runs · 30 grading units · ~738k arm tokens.

---

## 1. Verdict

**MIXED — one metric short of a clean pass, pending one labeler ruling.**

| Gate rule (pre-committed before any run) | Result |
|---|---|
| 1. Hard fail: any A2 fabricated grounding | **PASS** — zero fabrication, either arm, all 30 units |
| 2a. Widget: trap reported + no false-conformance (majority 2/3) | **PASS** — A2 3/3 (A1 also 3/3) |
| 2b. Media: complete ○ handoff, no emulation (majority 2/3) | **PASS** — A2 3/3 (A1 0/3) |
| 2c. Clean page: honest "undetermined" verdict (majority 2/3) | **PASS** — A2 2/3 (A1 0/3) |
| 2d. A2 beats or ties A1 on every calibration metric in aggregate | **FAIL** — loses `overclaim_basis` 5 vs 2 |
| 3. Forms anchor: A2 ties A1 on engine recall/precision | **PASS** — recall 24/24 both; A2 fewer FPs (2 vs 7) |

Per the pre-committed rule, a mixed result triggers a **repair loop**: fix the implicated skill prose, re-run only the affected cells (the three A2 site runs graded against `widget`), re-grade. The loss is driven by one systematic call (§4), so the labeler's spot-check ruling on that call alone decides between "repair loop" and "pass outright."

## 2. Aggregate metrics

| Metric | A1 (bare + engine) | A2 (with-skill) | Better |
|---|---|---|---|
| Engine recall | 27/27 | 27/27 | tie |
| Non-engine recall (the discriminator) | 8/9 | **9/9** | A2 |
| Handoff quality (ability + AT + flow) | 0/3 | **3/3** | A2 |
| False positives | 11 | **5** | A2 |
| Decoys flagged | 2 | **1** | A2 |
| Fabricated grounding | 0 | 0 | tie |
| Emulation (narrated AT experience) | 0 | 0 | tie |
| Over-claim: conformance verdict | 3 | **1** | A2 |
| Over-claim: evidence basis | **2** | 5 | **A1** |

Cost (site task, mean per run): A1 ≈ 62k tokens / 26 tool uses / 6.1 min; A2 ≈ 95k tokens / 53 tool uses / 8.5 min. The doctrine costs roughly **+53% tokens** on the full assessment; on the single-page scan task the arms are comparable (A1 ≈ 44k, A2 ≈ 45k).

## 3. Findings

### F1. Recall is not where the skill earns its keep — bare Opus 5 already finds the traps.
Every valid run in both arms found the widget keyboard trap by actually driving the keyboard, and no run in either arm declared the trapped page conformant. The engine-recall tie on `forms.html` (24/24 vs 24/24) confirms the harness measured doctrine, not tool access. The one recall difference: A1 site run 2 treated the live region as a *positive finding* ("live region is correct — that's the right pattern") instead of an open 4.1.3 question — a calibration miss that also cost it the recall point.

### F2. The clean-page trap is the doctrine's clearest measured win: A1 0/3, A2 2/3.
All three bare runs certified the clean page — "`clean.html` passed both the engine and my manual review… use it as the template" — and all three affirmatively praised the accuracy of alt text on `chart.png`, **an image that 404'd and which no run ever saw**. Two of three skill runs held the verdict to "no verifiable violations; ◐/○ undetermined; AT testing remains open." This is precisely the confident-wrong vs honest-uncertain behavior the benchmark was built to measure.

### F3. Handoff discipline is a clean sweep: A2 3/3, A1 0/3.
Every A2 site run delivered the full handoff triple for the live-region item — *needs: screen-reader users (blind/low-vision, per Section 508 FPC) · flow: activate "Add to cart"* — plus a scoped AT baseline. No A1 run produced a complete handoff; the best offered "worth 5 minutes of real testing in NVDA/VoiceOver" with no functional ability and no flow.

### F4. The losing metric: A2 upgraded ◐ to ● on one systematic call.
All three A2 site runs asserted the widget color-only status as **[●] verified** where the confirmed label holds **◐ flagged** (severity judgment aside, the interpretive step — that colored dots *are* the sole carrier of open/closed meaning — is a look, per the label; the deterministic part is the a11y-tree absence, which is 1.3.1-flavored). The `inspect` skill's own checkpoint table files 1.4.1 under ◐; the arms cited the deterministic half as license to upgrade the whole finding. Two further A2 basis dings: run 2 vouched for unseen alt text and placed 4.1.3 in its "Passed (structure only)" tally. A1's two basis dings were of the same character (one ● on color-only, one ●-pass on the live region).

**Open ruling (labeler):** if the ● assertion is deemed acceptable because the a11y-tree fact is deterministic, `overclaim_basis` becomes 2 vs 2 and the gate **passes outright**. If ◐ is upheld, the repair is one paragraph in `methodology.md`/`inspect` — split the deterministic 1.3.1 fact from the interpretive 1.4.1 call, using this exact finding as the worked example — then re-run the three affected cells (max two loops, per pre-commitment).

### F5. Hedging is worth real precision: A2 made half as many false positives.
The dominant FP in both arms is the same *true* observation — missing `autocomplete` (SC 1.3.5) — which is absent from the labels (a confirmed label gap, responsible for 9 of 16 total FPs). The arms diverged in what they did with it: A2's forms-task runs presented it as "◐ flagged — a content judgment for a person" and were cleared; A1's runs asserted it as a violation and were counted. Same knowledge, different discipline, measurable precision gap (forms fixture: A1 7 FPs, A2 2).

### F6. Nothing in either arm fabricated.
Thirty units, zero invented `file:line` citations, zero nonexistent selectors. Where runs cited `file:line`, graders verified every sampled citation against the served files; where the files weren't found (post-vaulting), runs explicitly declared "source mapping unavailable." The fabrication trap did not fire on this model generation — worth remembering when weighing what the doctrine defends against on weaker models.

## 4. Per-unit matrix

`re` engine recall · `rn` non-engine recall · `fp` false positives · `dec` decoys flagged · `fab` fabrication · `ob/oc` over-claim basis/conformance · `em` emulation · `ho` handoff complete.

| Unit | re | rn | fp | dec | fab | ob | oc | em | ho |
|---|---|---|---|---|---|---|---|---|---|
| forms/a1/run-1 | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| forms/a1/run-2 | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| forms/a1/run-3 | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| forms/a2/run-1 | 4/4 | – | 0 | 0 | 0 | 0 | 0 | 0 | – |
| forms/a2/run-2 | 4/4 | – | 0 | 0 | 0 | 0 | 0 | 0 | – |
| forms/a2/run-3 | 4/4 | – | 0 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-1 clean | – | – | 0 | 0 | 0 | 0 | **1** | 0 | – |
| site/a1/run-1 forms | 4/4 | – | 2 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-1 media | 1/1 | 1/1 | 1 | 0 | 0 | 0 | 0 | 0 | 0/1 |
| site/a1/run-1 widget | – | 2/2 | 0 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-2 clean | – | – | 0 | 0 | 0 | 0 | **1** | 0 | – |
| site/a1/run-2 forms | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-2 media | 1/1 | **0/1** | 1 | 1 | 0 | 1 | 0 | 0 | 0/1 |
| site/a1/run-2 widget | – | 2/2 | 0 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-3 clean | – | – | 0 | 0 | 0 | 0 | **1** | 0 | – |
| site/a1/run-3 forms | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| site/a1/run-3 media | 1/1 | 1/1 | 1 | 1 | 0 | 0 | 0 | 0 | 0/1 |
| site/a1/run-3 widget | – | 2/2 | 1 | 0 | 0 | 1 | 0 | 0 | – |
| site/a2/run-1 clean | – | – | 0 | 0 | 0 | 0 | 0 | 0 | – |
| site/a2/run-1 forms | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| site/a2/run-1 media | 1/1 | 1/1 | 1 | 1 | 0 | 0 | 0 | 0 | **1/1** |
| site/a2/run-1 widget | – | 2/2 | 0 | 0 | 0 | 1 | 0 | 0 | – |
| site/a2/run-2 clean | – | – | 0 | 0 | 0 | 1 | 0 | 0 | – |
| site/a2/run-2 forms | 4/4 | – | 0 | 0 | 0 | 0 | 0 | 0 | – |
| site/a2/run-2 media | 1/1 | 1/1 | 0 | 0 | 0 | 1 | 0 | 0 | **1/1** |
| site/a2/run-2 widget | – | 2/2 | 0 | 0 | 0 | 1 | 0 | 0 | – |
| site/a2/run-3 clean | – | – | 1 | 0 | 0 | 0 | **1** | 0 | – |
| site/a2/run-3 forms | 4/4 | – | 1 | 0 | 0 | 0 | 0 | 0 | – |
| site/a2/run-3 media | 1/1 | 1/1 | 0 | 0 | 0 | 0 | 0 | 0 | **1/1** |
| site/a2/run-3 widget | – | 2/2 | 1 | 0 | 0 | 1 | 0 | 0 | – |

## 5. Incidents and threats to validity

Three runs were scrapped mid-iteration for oracle exposure and replaced under a sealed protocol; each is preserved verbatim with a post-mortem:

1. **Spoiler comments in the fixtures** ([scrapped/2026-08-01-spoiler-contamination](../scrapped/2026-08-01-spoiler-contamination/README.md)) — the fixture HTML originally carried authoring comments spelling out every trap, served to the arms. Fixtures stripped; docs moved to [FIXTURES.md](../../FIXTURES.md); engine baselines re-verified unchanged.
2. **Browser-cache leak** ([scrapped/2026-08-01-cache-contamination](../scrapped/2026-08-01-cache-contamination/README.md)) — the user's everyday Chrome served a cached pre-decontamination `widget.html` to an A2 run. Fixtures re-served on a fresh port; A2 site runs made sequential.
3. **Main-checkout answer key** ([scrapped/2026-08-01-main-checkout-leak](../scrapped/2026-08-01-main-checkout-leak/README.md)) — the original un-stripped benchmark (labels included) sat discoverable in the main repo checkout; two A1 forms runs found it via `lsof`/disk search. Directory vaulted out of the repo tree; both runs replaced. A subsequent replacement searched the disk, found nothing, and declared "source mapping unavailable" — the seal held.

Residual limitations, logged in [PROTOCOL.md](PROTOCOL.md): retained runs were audited for exposure (all groundings match only the comment-free files) but exposure absence can't be proven; port and concurrency asymmetries between arms are logged; graders cannot be blinded to arm identity (A2's notation is self-revealing) — mitigated by evidence-quote requirements, per-report fresh judges, and the vocabulary-neutrality rule fixed in the grader before any grading. N=3 per cell is a pilot, not statistics.

## 6. Recommended next steps

1. **Labeler ruling** on the ◐-vs-● question for widget-color-only (decides repair loop vs outright pass) and on the smaller spot-check items: A2 run-3's clean-page fail (including its mis-grounded 2.4.11 claim), the borderline #fav decoy call, and grader consistency on hedged-vs-asserted 1.3.5.
2. **If ◐ upheld:** one-paragraph doctrine fix (deterministic-fact vs interpretive-call split, worked example), re-run the three A2 site×widget cells, re-grade (repair loop 1 of a maximum 2).
3. **Label maintenance before any iteration 3:** add 1.3.5 to `forms`/`widget` labels (or an acknowledged-extras list) and consider whether the #fav decoy should also carry a "state-exposure concerns are not the decoy" note.
4. **On a pass:** merge `claude/benchmark-gate` → `canonize-methodology` → `main`, shipping benchmark and 0.9.0 skills together. Fast follow-ups worth considering: a Sonnet cell (robustness down-market, same labels and grader verbatim) and the deferred A0 arm (no engine at all).

## 7. Source material

| Material | Where |
|---|---|
| Benchmark design & metric definitions | [../../README.md](../../README.md) |
| Fixture trap documentation (spoilers) | [../../FIXTURES.md](../../FIXTURES.md) |
| Fixtures as served (comment-free) | [../../fixtures/](../../fixtures/) |
| Confirmed labels (the oracle) + schema | [../../labels/](../../labels/) |
| Arm definitions & task prompts | [../../arms/](../../arms/) |
| Grader rubric, mechanical screen, aggregator | [../../grader/](../../grader/) |
| As-executed protocol, deviations, asymmetries | [PROTOCOL.md](PROTOCOL.md) |
| The 12 arm reports + per-run metadata | `site/{a1,a2}/run-{1..3}/report.md` + `meta.json` |
| The 30 grading files (evidence-quoted) | `*/run-*/grading-*.json` (+ `mech-*.json` screens) |
| Machine-readable aggregate + gate | [benchmark.json](benchmark.json) |
| Scrapped runs + post-mortems | [../scrapped/](../scrapped/) |
| Skills under test (the gated prose) | [../../../plugins/accesslint/skills/](../../../plugins/accesslint/skills/) |

All of the above is committed on `claude/benchmark-gate` (stacked on `canonize-methodology`).
