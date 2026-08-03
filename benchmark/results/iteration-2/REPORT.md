# AccessLint skills benchmark — iteration 2 report

**Question:** does the skill doctrine (the 0.9.0 five-skill pipeline and `shared/methodology.md`) make Claude *more calibrated* on accessibility work than the same model with the same tools and no skill?
**Design:** A1 (bare + engine) vs A2 (with-skill), identical tasks, trap-weighted fixtures, hand-confirmed oracle, LLM-judge grading with mechanical screens. This iteration is the ship-gate for merging `canonize-methodology` (plugin 0.9.0).
**Run date:** 2026-08-01 · arms and graders on Opus 5 · 12 valid arm runs · 30 grading units · ~738k arm tokens.

---

## 1. Verdict

**PASS — after repair loop 1.** The original run graded MIXED, one metric short, pending one labeler ruling; the ruling was made 2026-08-02 (◐ upheld), the pre-committed repair loop ran, and the gate now passes. Sections 1–5 below are the original iteration-2 report, unchanged; §8 records the repair loop.

Original verdict as graded 2026-08-01:

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

## 8. Repair loop 1 (2026-08-02) — ruling, fix, re-run, re-grade → GATE PASSES

**Labeler ruling (Cameron, 2026-08-02):** `widget-color-only`'s `honest_basis: flagged` is **upheld**. The deterministic half — no programmatic status in the a11y tree — is a ● fact (1.3.1-flavored) and may be stated as such; the interpretive half — that color is the *sole* carrier of the open/closed meaning (1.4.1) — needs a look, so the finding stays ◐. Citing the deterministic half does not license upgrading the whole.

**Doctrine fix (commit `92b835e`):** one paragraph in `shared/methodology.md` ("Many findings stack a deterministic fact on an interpretive call. Grade the two separately, and give the finding the lower grade…", with the widget dots as the worked example) plus the matching rule in `accessibility-inspect`'s Grading section and its 1.4.1 checkpoint line.

**Re-run:** the full site task, three sequential A2 runs against the fixed skills (arms and graders on Opus 5; fresh port `:8002` with no cache history; comment-free fixtures re-copied; `benchmark/` vaulted during arm runs). Reports, meta, and grading at [`site/a2-repair1/`](site/a2-repair1/). Only the widget units were re-graded and spliced, per the pre-commitment; the other units of these runs were not graded.

**Result — the systematic over-claim is gone, 3/3:**

| Unit | rn | fp | ob | oc | fab |
|---|---|---|---|---|---|
| a2-repair1/run-1 widget | 2/2 | 0 | **0** | 0 | 0 |
| a2-repair1/run-2 widget | 2/2 | 3 | **0** | 0 | 0 |
| a2-repair1/run-3 widget | 2/2 | 1 | **0** | 0 | 0 |

All three runs independently produced the exact split the doctrine teaches — the 1.4.1 finding held at ◐, with the ● scoped to the cited tree fact (e.g. run 3: "whether some other cue … also conveys it is a judgment call, so the 1.4.1 finding stays ◐"). The keyboard trap was found and reported ● in all three; no false conformance; zero fabrication (all `file:line` citations verified against the served files).

**Aggregate after splicing the new widget units** (whole units spliced, not one metric):

| Metric | A1 | A2 (spliced) | Result |
|---|---|---|---|
| Over-claim: evidence basis | 2 | **2** (was 5) | **tie → rule 2d passes** |
| False positives | 11 | 8 (was 5) | still A2 |
| All other metrics | — | unchanged | — |

The FP increase (+3) is the known 1.3.5/autocomplete label gap plus verifiable unlabeled extras (missing site chrome, list semantics) — real defects of the fixture that the oracle doesn't list, not inventions; two of the three were themselves hedged ◐ by the arm. Label maintenance before iteration 3 (§6.3) covers this.

**Gate re-evaluation:** rule 1 pass (0 fabrication, now 33 units) · rules 2a–2c pass (unchanged or reconfirmed by the new widget units) · rule 2d **pass** (beats or ties on every calibration metric) · rule 3 pass (unchanged). **The gate passes on repair loop 1 of a maximum 2.**

**Deviations logged:** (1) The repair-loop judge prompts added a focused instruction on the color-only basis question — rule on the *finding's* asserted basis, treat a separately-grounded 1.3.1 claim on its own evidence — implementing the ruling; `grader.md`/`grade.py` otherwise unchanged. (2) Fixtures were served from a fresh scratchpad copy on `:8002`; byte-identical to the committed fixtures. (3) Run 3's manual tier ran in a Chrome with extensions loaded (a 1Password `role=status` region appeared in its a11y tree); the arm disclosed this itself and the engine tier ran in a clean headless Chrome — no widget-unit grade depended on the contaminated region.
