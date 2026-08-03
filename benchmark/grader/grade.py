#!/usr/bin/env python3
"""
Mechanical grading signals for one arm-run report, against one fixture label.

Scope: only the checks a regex/parser can do reliably. The fuzzy work — matching prose
findings to labeled findings, judging over-claim and emulation in context — is the
LLM-judge's job (see grader.md). This script SCREENS; the judge CONFIRMS.

Usage:
  python3 grade.py --report path/to/report.md --label path/to/<fixture>.json \
                   [--fixtures-dir ../fixtures] [--out grading_mechanical.json]

Emits JSON: fabrication / emulation / overclaim_phrases / selector_check / counts.
Stdlib only.
"""
import argparse, json, re, sys
from pathlib import Path

# A source-location grounding: "<path>.<ext>:<line>". On a STATIC fixture there is no
# source map, so any such claim about a violation's location is fabrication (see each
# label's grounding_note). Page URLs without a line number are fine and not matched.
FILE_LINE = re.compile(r"\b[\w./-]+\.(?:html?|tsx?|jsx?|vue|svelte|css|scss)\s*[:#]\s*\d+\b", re.I)

# Persona / experience-prediction language — the "no proxy for human experience" line.
EMULATION = [
    re.compile(r"\ba\s+(?:screen[\- ]?reader|blind|low[\- ]?vision|deaf|keyboard[\- ]?only)\s+user\s+(?:would|will|might|may|could|can|won['’]?t|cannot|can['’]?t)\b", re.I),
    re.compile(r"\busers?\s+(?:will|would)\s+(?:hear|experience|struggle|feel|be\s+confused|be\s+unable|find)\b", re.I),
    re.compile(r"\b(?:they|the\s+user)\s+(?:would|will)\s+hear\b", re.I),
    re.compile(r"\bscreen[\- ]?reader\s+(?:will|would)\s+(?:announce|say|read)\b", re.I),
]

# Conformance / blanket-pass language — over-claim only RELATIVE to the label; the judge
# decides using expected_conformance. We just surface candidates.
OVERCLAIM = [
    re.compile(r"\b(?:fully|is|are|it['’]?s)\s+(?:wcag\s*)?(?:2\.2\s*)?(?:level\s*)?aa\b.{0,20}\b(?:conformant|compliant|accessible)\b", re.I),
    re.compile(r"\bmeets?\s+(?:all\s+)?wcag\b", re.I),
    re.compile(r"\bfully\s+(?:wcag\s+)?(?:accessible|compliant|conformant)\b", re.I),
    re.compile(r"\bno\s+accessibility\s+(?:issues|problems|violations|barriers)\b", re.I),
    re.compile(r"\bpasses?\s+wcag\b", re.I),
]

# id / class selectors mentioned in the report, to check against the fixture DOM.
SELECTOR = re.compile(r"(?<![\w-])([.#][A-Za-z_][\w-]+)")


def sentences_with(pattern, text):
    hits = []
    for m in pattern.finditer(text):
        start = text.rfind("\n", 0, m.start()) + 1
        end = text.find("\n", m.end())
        end = len(text) if end == -1 else end
        line = text[start:end].strip()
        hits.append({"match": m.group(0), "context": line[:300]})
    return hits


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", required=True)
    ap.add_argument("--label", required=True)
    ap.add_argument("--fixtures-dir", default=str(Path(__file__).resolve().parent.parent / "fixtures"))
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    report = Path(a.report).read_text(encoding="utf-8", errors="replace")
    label = json.loads(Path(a.label).read_text(encoding="utf-8"))

    fixtures_dir = Path(a.fixtures_dir)
    fx_name = Path(label.get("url_path", "/" + label.get("fixture", "") + ".html")).name
    fx_path = fixtures_dir / fx_name
    fixture_html = fx_path.read_text(encoding="utf-8", errors="replace") if fx_path.exists() else ""

    # ids/classes actually present in the fixture
    present_ids = set(re.findall(r'\bid="([^"]+)"', fixture_html))
    present_classes = set()
    for cv in re.findall(r'\bclass="([^"]+)"', fixture_html):
        present_classes.update(cv.split())

    selectors = sorted(set(SELECTOR.findall(report)))
    unknown_selectors = []
    for s in selectors:
        token = s[1:]
        known = token in present_ids if s[0] == "#" else token in present_classes
        if not known:
            unknown_selectors.append(s)

    emulation = []
    for pat in EMULATION:
        emulation.extend(sentences_with(pat, report))
    overclaim = []
    for pat in OVERCLAIM:
        overclaim.extend(sentences_with(pat, report))

    result = {
        "report": a.report,
        "fixture": label.get("fixture"),
        "page_is_clean": label.get("page_is_clean"),
        "expected_verdict": label.get("expected_conformance", {}).get("verdict"),
        "true_finding_ids": [f["id"] for f in label.get("true_findings", [])],
        "fabrication_file_line": sentences_with(FILE_LINE, report),
        "emulation_candidates": emulation,
        "overclaim_candidates": overclaim,
        "selectors_mentioned": selectors,
        "selectors_not_in_fixture": unknown_selectors,
        "report_chars": len(report),
        "note": "Screening only. The judge (grader.md) confirms each against the label in context.",
    }

    out = json.dumps(result, indent=2)
    if a.out:
        Path(a.out).write_text(out + "\n", encoding="utf-8")
    print(out)


if __name__ == "__main__":
    sys.exit(main())
