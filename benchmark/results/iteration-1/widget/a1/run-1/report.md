# Accessibility review — `widget.html` ("Beach alerts")

**Target:** http://localhost:8000/widget.html
**Standard:** WCAG 2.2 Level AA
**Method:** Automated engine scan (AccessLint) + manual live-DOM and keyboard interaction testing in a real browser
**Date:** 2026-06-06

---

## Verdict: FAIL (WCAG 2.2 AA)

The page is **not** conformant and, more importantly, **not genuinely usable for keyboard or screen-reader users.** A single Level A failure is enough to fail; this page has two (2.1.2 and 1.4.1), plus a Level AA gap (1.3.5).

### The headline you asked for: lint-clean ≠ usable

This page is a textbook case of why an automated pass is not a green light:

- The **automated engine both lied and missed.** Running the live URL through the rule engine produced **6 violations that are all false positives** (it reported "no main landmark" and 5 "content not in a landmark" errors), while **failing to detect either of the two real, serious defects** on the page.
- When I fed the engine the *actual served HTML* as a string, it reported **zero violations** — i.e., the page is genuinely "lint-clean," yet it contains a critical keyboard trap that locks users in.

The real problems are **behavioral and perceptual** — exactly the class of defect a rule engine structurally cannot see. They were found only by driving the keyboard and inspecting what the accessibility tree actually exposes.

---

## What's actually broken

### 1. Keyboard trap in the "Subscribe" dialog — **CRITICAL** (WCAG 2.1.2 No Keyboard Trap, Level A)

**This is a ship-blocker.** When the dialog opens, focus moves into it and **cannot get back out using the keyboard.**

What I verified by actually operating the page (not by reading the code):
- Clicking **"Subscribe to alerts"** opens the dialog and moves focus to the Email field. Good so far.
- Pressing **Escape** does nothing — the dialog stays open and focus does not move. (Verified: modal still visible, focus still on the email field after Escape.)
- Pressing **Tab** from the last control (the "Subscribe" button) **wraps focus back to the Email field** instead of leaving the dialog. (Verified: focus went `m-submit` → `m-email`.) Shift+Tab from the first control behaves symmetrically.
- **There is no Close / Cancel / dismiss control anywhere in the dialog** — the only interactive elements are Email, ZIP, and Subscribe.

**Net effect:** a keyboard-only user (and many screen-reader and switch users) who opens this dialog is stuck. There is no keyboard path out short of reloading the page or using browser Back. This is the single most common formal definition of a WCAG failure and it makes the subscribe feature unusable for these users.

**Worth noting:** because there is *no* close control at all, even a mouse user can only escape the dialog by reloading the page. So this isn't strictly a "keyboard" problem — it's a missing-affordance problem that hits everyone, and is most severe for keyboard users.

**Fix:** Add a visible, keyboard-reachable **Close button** to the dialog; handle the **Escape** key to dismiss it; and on close, **return focus to the "Subscribe to alerts" trigger**. (A correct focus-trap that *cycles* within the dialog is fine and expected for a modal — the bug is that there is no way to *leave*.)

---

### 2. Beach status conveyed by color alone — **SERIOUS** (WCAG 1.4.1 Use of Color, Level A; also implicates 1.1.1 / 1.3.1)

The "Today's status" list shows each beach as open or closed using **only a colored dot** — green for open, red for closed — with no text, icon shape, or other label.

What I verified from the live accessibility tree:
- Each list item's accessible name is just the beach name: "Pillar Point", "Half Moon Bay", "Montara". **The open/closed status is completely absent** from what assistive tech exposes — the dots have no `aria-label`, `title`, or text content.
- The only difference between an "open" and "closed" item is the dot's background color (green `rgb(46,125,50)` vs red `rgb(198,40,40)`).

**Net effect:**
- **Screen-reader users** hear only "Pillar Point", "Half Moon Bay", "Montara" with no indication of which beaches are open or closed. The core information of the list is invisible to them. (This is the angle that makes it more than 1.4.1: the information isn't merely *color-coded*, it's **not programmatically available at all** — so it also fails 1.1.1 Non-text Content and 1.3.1 Info & Relationships.)
- **Colorblind / low-vision users** (red–green is the most common deficiency) cannot reliably tell open from closed, since color is the sole cue.

**Fix:** Convey status with a **non-color cue in addition to color** — e.g., a visible text label ("Open" / "Closed") next to each beach, or an icon with a distinct shape, plus an accessible text equivalent (e.g., `aria-label="Open"` on the indicator, or visually-hidden text). Color may remain as a redundant enhancement.

---

### 3. Form inputs missing autocomplete / input-purpose metadata — **MINOR** (WCAG 1.3.5 Identify Input Purpose, Level AA)

The dialog's **Email** and **ZIP code** inputs collect information about the user but declare no `autocomplete` token (verified: both return `null`).

**Net effect:** Browsers and assistive tech can't reliably auto-fill these or present them in a personalized way; users who benefit from autofill (motor, cognitive, low-vision) get no help. This is a true WCAG 2.2 AA failure that rule engines typically do **not** flag, because they can't detect *missing* autocomplete — so manual review is the only way it surfaces.

**Fix:** Add `autocomplete="email"` to the Email field and `autocomplete="postal-code"` to the ZIP field. (The existing `type="email"` and `inputmode="numeric"` are good and should stay.)

---

## WCAG 2.2-specific success criteria (the new ones in 2.2)

Since you asked specifically about **2.2**, here's how the criteria added in 2.2 fare:

| SC | Name | Level | Result |
|----|------|-------|--------|
| 2.4.11 | Focus Not Obscured (Minimum) | AA | **Pass** — focused controls are not hidden behind sticky/overlapping content. |
| 2.5.8 | Target Size (Minimum) | AA | **Pass** — all controls exceed the 24×24px minimum (open button 160×42, Subscribe 97×42, inputs 197×46). |
| 3.2.6 | Consistent Help | A | **N/A** — no help mechanism present. |
| 3.3.7 | Redundant Entry | A | **N/A** — single-step form, no re-entry required. |
| 3.3.8 | Accessible Authentication (Minimum) | AA | **N/A** — no authentication / cognitive-function test. |
| 2.5.7 | Dragging Movements | AA | **N/A** — no drag interactions. |

So the 2.2-additions are clean; the failures above are the long-standing Level A/AA criteria.

---

## What passed (verified, not assumed)

- **Document structure:** valid `<main>` landmark wrapping all content, `lang="en"`, descriptive `<title>`, logical heading order (h1 → h2). *(The engine's "no main landmark" + "region" errors were confirmed false positives — the live a11y tree and the served HTML both show a correct `main` wrapping every node.)*
- **Dialog markup:** `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the dialog's title — all correct. (The markup is right; the *behavior* is broken — see issue 1.)
- **Form labels:** Email and ZIP fields have proper `<label for>` associations and resolve to correct accessible names; `type="email"` and `inputmode="numeric"` are appropriate.
- **Contrast:** button text (white on `#0b5394`) is **7.84:1** — passes AA (and AAA). Body text is near-black on white.
- **Visible focus:** a `:focus-visible` outline (3px solid) is defined for keyboard focus.

---

## Still needs a human to verify

1. **Screen-reader pass (NVDA + Windows / VoiceOver + macOS/iOS).** I confirmed from the accessibility tree that (a) the dialog *should* be announced on open and (b) the beach open/closed status is entirely absent from the SR experience — but a live SR test is the only way to confirm the *lived* experience: that the dialog is announced correctly, that the focus move on open is perceivable, and that the status list really does read as bare beach names.
2. **Adequacy of the color fix (design judgment).** Whatever non-color cue you choose for open/closed (text label vs. icon shape) is a design decision that should be reviewed for clarity and that the chosen colors/labels still read well together. A tool can confirm a label *exists*; only a person can confirm it's *understandable*.
3. **Real assistive-tech confirmation that the trap is escapable after the fix.** Once a Close button + Escape handling are added, re-test with keyboard, screen reader, and ideally a switch/voice-control user to confirm focus genuinely returns to the trigger and nothing else regresses.

---

## Priority order for fixing

1. **Keyboard trap (issue 1) — critical, blocks shipping.** Add a close affordance + Escape + focus return.
2. **Color-only status (issue 2) — serious.** Add a text/non-color status indicator that's also exposed to assistive tech.
3. **Autocomplete metadata (issue 3) — minor but quick.** Two attributes.

---

### Appendix: how this was tested

- **Engine:** AccessLint `audit_live` against the running URL (returned 6 violations, all false positives) and `audit_html` against the served source (returned clean).
- **Live DOM / a11y tree:** real-browser snapshot + scripted inspection confirmed the `main` landmark, dialog ARIA, label associations, computed contrast, target sizes, and the absence of autocomplete and of any status text on the dots.
- **Keyboard interaction:** opened the dialog via its real click handler, then issued actual **Escape** and **Tab** key presses through the browser and observed focus — reproducing the trap (Tab from last control wrapped to first; Escape ignored; no close control present).
