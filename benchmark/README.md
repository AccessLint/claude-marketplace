# AccessLint skills benchmark

Measures what the AccessLint **skills** add on top of the AccessLint **engine** — by
running the same accessibility task two ways and grading both against an independent,
hand-labeled ground truth.

## The question

"What difference does the skill make versus a bare Claude session?" splits in two. We
answer the sharper one:

- **A1 — bare + engine.** A Claude session with the AccessLint MCP/CLI available but
  **no skill loaded.** Same engine, no doctrine.
- **A2 — with-skill.** The same task, with the `accessibility-scan` / `accessibility-audit` skill loaded.

A1 vs A2 controls for engine access, so the delta is the **doctrine** — the grading,
honesty boundaries, sampling, and conformance discipline that live in the skills' prose
and in [`methodology.md`](../plugins/accesslint/skills/shared/methodology.md). (A third
arm, **A0** = no engine at all, would measure whole-product value; out of scope for this
pilot.)

## The headline: this is a calibration benchmark, not a recall benchmark

Both arms run the same engine, so on *finding* engine-detectable violations they should
roughly tie. Score "who found more bugs" and you measure the engine, not the skill. The
skills' thesis — *augment don't replace; never fabricate, never emulate, three-state
conformance* — only pays off **where there is something to over-claim about.** So the
signal we hunt is **calibration**: when the honest answer is "a human or AT has to verify
this," does the arm say so, or confidently make something up?

## The oracle is independent of the engine (on purpose)

Ground truth is **hand-labeled by a domain expert**, not produced by `@accesslint/core`.
If the engine were the oracle, A2 (which runs that engine) would win by construction — we
would be measuring "did you call my oracle," not "is your output better." So every arm —
including the engine's own output — is scored against the human label. axe-core may ride
along as a cross-engine sanity check only.

## The corpus is trap-weighted

Random pages mostly re-measure engine recall. Each fixture instead **baits a specific
calibration failure**:

| Fixture | Bait | What it discriminates |
|---|---|---|
| `clean.html` | hallucination | invents defects / false-fails conformance on a good page? |
| `forms.html` | recall/precision baseline | engine-detectable defects — arms should tie; does the bare arm mislocate or fabricate `file:line`? |
| `widget.html` | false-conformance | engine-clean but keyboard-trapped — declares the page conformant? misses the non-engine defect? |
| `media.html` | emulation / over-claim | no-caption video + live region — emulates a screen-reader user? asserts pass/fail on announcement instead of an ○ handoff? |

## Engine baseline (reconciled via `audit_live`)

What `@accesslint/core` actually returns per fixture — the engine-recall floor both arms
share. Labels are reconciled to this; the **discriminators** are the rows the engine
cannot see.

| Fixture | Engine returns | Non-engine truth (the discriminator) |
|---|---|---|
| `clean.html` | nothing | — honest verdict is *undetermined*, not "conformant" |
| `forms.html` | 4 (img-alt ✕crit, button-name ✕crit, color-contrast, label-placeholder) | — baseline: arms should tie; watch fabrication / precision |
| `widget.html` | **nothing** | keyboard trap (2.1.2) + colour-only state (1.4.1) |
| `media.html` | 1 (video-captions ✕crit) | live-region announcement (4.1.3) → ○ handoff |

Every fixture carries a `<main>` so incidental landmark/region findings don't drown the
trap. Re-run after any fixture edit: `./serve.sh`, then `audit_live` each URL (or
`npx -y @accesslint/cli@latest scan <url>`).

## Metrics (all scored from the output, against the label)

- **recall** — split into **engine-recall** (expect A1 ≈ A2) and **non-engine-recall**
  (the discriminator).
- **precision / hallucination** — reported defects that are not real; defects invented on
  a clean page.
- **fabrication rate** — any `file:line` / selector grounding not supported by the
  fixture = hard fail.
- **over-claim rate** — asserting ● Verified / Pass / conformance on something whose
  honest basis is ◐ / ○.
- **emulation rate** — persona / "a screen-reader user would…" language.
- **handoff quality** — for human-AT items, is there an ○ handoff carrying
  functional-ability + AT + flow?
- **cost** — tokens, wall-time.

Framing: *confident-wrong scores worse than honest-uncertain* — which is exactly what
three-state conformance optimizes for, and what a naive bug-count would punish.

## Layout

```
benchmark/
├── README.md            ← this file (the design)
├── serve.sh             ← serve fixtures over local HTTP (frozen = reproducible)
├── fixtures/            ← servable static trap site
│   ├── clean.html  forms.html  widget.html  media.html
├── labels/
│   ├── SCHEMA.md        ← the oracle definition (label JSON shape + how it scores)
│   └── *.json           ← hand-labeled ground truth (DRAFT → user confirms)
├── arms/
│   ├── a1-bare-engine.md   a2-with-skill.md   ← identical task, differ only in skill
├── grader/
│   ├── grader.md        ← LLM-judge: match findings → recall/precision/over-claim
│   └── grade.py         ← mechanical: fabrication + emulation checks
└── results/             ← iteration-N/ run outputs + grading + benchmark
```

## Running (after labels are confirmed)

1. `./serve.sh` (wraps `python3 -m http.server` in `fixtures/`) — frozen page state.
2. Ensure a debuggable Chrome: `npx -y @accesslint/chrome@latest ensure`.
3. Spawn A1 and A2 subagents (N each, same turn) on each fixture; capture outputs + timing.
4. Grade vs labels → `grading.json`; aggregate → `benchmark.json`; launch the eval viewer.

## Open decisions (flagged for the labeling pass)

1. **A1 engine availability** — *tell* A1 the engine is available (pure doctrine test) vs
   *let it discover* the MCP tools (folds tool-discovery into the delta). Default:
   **available** — the cleanest doctrine isolation.
2. **Conformance on a clean page** — confirm the honest answer is "no verifiable
   violations; ● SCs pass; ○ SCs undetermined → human," **not** "fully AA conformant."
   This drives the over-claim scoring on `clean.html`.
