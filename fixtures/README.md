# AccessLint Test Fixtures

This directory contains test fixtures with intentional accessibility issues. Use these to test the AccessLint agents and commands.

## How to Use

### Test Commands

```bash
# Check accessibility issues
/check-a11y

# Fix accessibility issues
/fix-a11y
```

### Test Agents Directly

```bash
# Use the a11y-reviewer agent
"Review fixtures/components/react/Modal.tsx for accessibility issues"

# Use the a11y-refactor agent
"Fix all accessibility issues in fixtures/components/html/landing-page.html"

# Use the a11y-consultant agent
"How should I make the tabs component in fixtures/components/vue/TabsComponent.vue accessible?"
```

## Fixtures Overview

### HTML: landing-page.html

A landing page with **30+ accessibility issues** covering most common WCAG violations.

#### Issues by Category

**Document Structure (WCAG 1.3.1, 2.4.1)**
- Missing `lang` attribute on `<html>`
- No skip link for keyboard navigation
- Non-semantic HTML (divs instead of header, nav, main, footer, section)
- Improper heading hierarchy (skipping levels, wrong order)

**Images (WCAG 1.1.1)**
- Missing alt text on logo image
- Generic alt text ("image") instead of descriptive
- Decorative image with alt text instead of empty alt

**Interactive Elements (WCAG 4.1.2, 2.1.1)**
- Divs used as buttons (no keyboard support)
- No keyboard event handlers
- Links styled as buttons (should be buttons)
- Buttons implemented as links

**Forms (WCAG 3.3.2, 1.3.1)**
- Inputs without associated labels
- Labels not using `for` attribute
- Placeholder used instead of label
- No required field indicators

**Color & Contrast (WCAG 1.4.3)**
- Insufficient color contrast (#666 on #333 = 2.4:1, needs 4.5:1)
- Low contrast navigation links (#888)

**Focus Management (WCAG 2.4.7)**
- No visible focus indicators
- No focus management in modal

**Modal/Dialog (WCAG 4.1.2, 2.1.2)**
- Missing `role="dialog"`
- Missing `aria-modal="true"`
- Missing `aria-labelledby`
- No focus trap
- No Escape key handler
- No focus restoration on close
- Close button without accessible label

**Tables (WCAG 1.3.1)**
- Data table implemented with divs instead of `<table>`
- Missing table headers
- No scope attributes

**Links (WCAG 2.4.4)**
- Non-descriptive link text ("Click here", "Read more")

---

### React: Modal.tsx

Modal component with focus management and ARIA issues.

#### Issues (12 total)

**ARIA & Semantics (WCAG 4.1.2)**
- Missing `role="dialog"` (line ~27)
- Missing `aria-modal="true"` (line ~27)
- Missing `aria-labelledby` (line ~27)
- Close button has no accessible label (line ~29)
- Icon-only button without `aria-label` (line ~45)
- No heading element for `aria-labelledby` to reference (line ~51)

**Focus Management (WCAG 2.1.2, 2.4.3)**
- No focus trap implementation
- No previous focus storage/restoration
- Background clickable while modal open

**Keyboard Support (WCAG 2.1.1)**
- No Escape key handler
- No keyboard event listeners

**Button Order (WCAG 2.4.3)**
- Destructive action (Delete) comes before Cancel (line ~56-57)

---

### React: ImageGallery.tsx

Image gallery with semantic and keyboard issues.

#### Issues (15 total)

**Semantic HTML (WCAG 4.1.2, 2.1.1)**
- Div used for clickable items instead of button (line ~20-24)
- No keyboard support for gallery items
- Missing role attributes
- Link without `href` (line ~51)

**Images (WCAG 1.1.1)**
- Alt text includes redundant "image of" (line ~28)
- Missing alt text entirely (line ~41)
- Decorative image with descriptive alt (line ~59)

**Headings (WCAG 1.3.1)**
- Wrong heading level (h1 for card title) (line ~44)
- No heading for gallery section (line ~17)

**Links (WCAG 2.4.4)**
- Non-descriptive link text "View" (line ~51)

**Associations (WCAG 1.3.1)**
- Image title not associated with image (line ~31)

---

### React: ContactForm.tsx

Form component with label, error handling, and ARIA issues.

#### Issues (25+ total)

**Form Labels (WCAG 3.3.2, 1.3.1)**
- Label not associated with input (missing `htmlFor`/`id`) (line ~30-35)
- Placeholder used instead of label (line ~42-47)
- Checkbox label not associated (line ~68-71)
- Radio buttons without proper labels (line ~76-84)

**Form Structure (WCAG 1.3.1)**
- No form title/heading
- Radio group not wrapped in `<fieldset>` with `<legend>`
- Required fields not indicated

**Error Handling (WCAG 3.3.1, 4.1.3)**
- Errors not announced to screen readers (line ~24)
- Error messages not associated with inputs (missing `aria-describedby`)
- Missing `aria-invalid` when errors exist
- Missing `aria-required` on required fields

**Live Regions (WCAG 4.1.3)**
- Success message not in live region (line ~91)
- Form submission status not announced

**Custom Controls (WCAG 4.1.2, 2.1.1)**
- Custom select without ARIA attributes (line ~104-125)
- No `role="combobox"` or `role="listbox"`
- Not keyboard accessible
- Options missing `role="option"`
- Missing `aria-selected`
- Arrow icon not hidden from screen readers

**Instructions (WCAG 3.3.2)**
- Character limit not associated with textarea (line ~60)
- Date format in placeholder instead of `aria-describedby` (line ~145)

**Icon Buttons (WCAG 1.1.1)**
- Calendar button with emoji, no label (line ~149)

---

### Vue: ProductCard.vue

Product card with interactive element and state issues.

#### Issues (18 total)

**Interactive Elements (WCAG 4.1.2, 2.1.1)**
- Clickable div instead of button/link (line ~5-7)
- No keyboard support for image click
- No role or ARIA attributes
- Icon-only button without `aria-label` (line ~32-34)

**Images (WCAG 1.1.1)**
- Generic alt text "product image" (line ~9)

**Visual Information (WCAG 1.3.3, 1.4.1)**
- Sale badge not announced to screen readers (line ~12)
- Star rating not accessible (line ~24-28)
- No text alternative for rating
- Color-only distinction for sale badge (style)

**Price Display (WCAG 1.3.1)**
- Prices not marked up for screen readers (line ~18-21)
- Original vs sale price not clearly distinguished

**Headings (WCAG 1.3.1)**
- Wrong heading level without context (line ~16)

**Links (WCAG 2.4.4)**
- Non-descriptive link text "Learn more" (line ~39)

**State Changes (WCAG 4.1.3)**
- Favorite toggle state not announced (line ~59-62)
- Add to cart success not announced (line ~64-68)
- Loading state not announced (line ~42-44)

**Content Access (WCAG 2.4.4)**
- Truncated description with no full text access (line ~30)

**Color Contrast (WCAG 1.4.3)**
- Insufficient contrast: #999 on #fff = 2.8:1 (style line ~61-64)

**Focus Indicators (WCAG 2.4.7)**
- Focus outline removed (style line ~66-68)

---

### Vue: TabsComponent.vue

Tabs component missing ARIA tab pattern implementation.

#### Issues (15 total)

**ARIA Roles (WCAG 4.1.2)**
- Tab list missing `role="tablist"` (line ~4-5)
- Tabs missing `role="tab"` (line ~6-13)
- Tab panels missing `role="tabpanel"` (line ~18-25)

**ARIA Attributes (WCAG 4.1.2)**
- Tabs missing `aria-selected` (line ~6-13)
- Tabs missing `aria-controls` (line ~6-13)
- Tab panels missing `aria-labelledby` (line ~18-25)

**Semantic HTML (WCAG 4.1.2)**
- Divs used instead of buttons for tabs (line ~6-13)

**Keyboard Support (WCAG 2.1.1)**
- No keyboard navigation (arrow keys) (line ~40-42)
- No Home/End key support
- Not keyboard accessible

**Focus Management (WCAG 2.4.3)**
- No focus management implementation

**Hidden Content (WCAG 4.1.2)**
- Inactive panels use `v-show` instead of proper hiding (line ~20)

**Visual Indicators (WCAG 1.4.1)**
- Active tab indicated by color only (style line ~51-54)

**Focus Indicators (WCAG 2.4.7)**
- Focus outline removed (style line ~60-62)

---

## Issue Summary by WCAG Guideline

### Perceivable
- **1.1.1 Non-text Content**: 12 issues (missing alt text, generic descriptions)
- **1.3.1 Info and Relationships**: 25+ issues (form labels, semantic HTML, headings)
- **1.4.1 Use of Color**: 4 issues (color-only indicators)
- **1.4.3 Contrast (Minimum)**: 3 issues (insufficient contrast)

### Operable
- **2.1.1 Keyboard**: 20+ issues (no keyboard support, divs as buttons)
- **2.1.2 No Keyboard Trap**: 2 issues (modal focus trap)
- **2.4.1 Bypass Blocks**: 1 issue (no skip link)
- **2.4.3 Focus Order**: 3 issues (focus management)
- **2.4.4 Link Purpose**: 5 issues (non-descriptive links)
- **2.4.7 Focus Visible**: 4 issues (removed focus indicators)

### Understandable
- **3.3.1 Error Identification**: 3 issues (error announcements)
- **3.3.2 Labels or Instructions**: 15+ issues (form labels)

### Robust
- **4.1.2 Name, Role, Value**: 35+ issues (ARIA roles, labels, attributes)
- **4.1.3 Status Messages**: 5 issues (live regions)

---

## Testing Workflows

### 1. Test a11y-reviewer Agent

**Goal**: Get a comprehensive audit report

```bash
# Test on single file
"Review fixtures/components/react/Modal.tsx"

# Expected output:
- Executive summary with issue counts
- Critical issues with file:line references
- WCAG guideline references
- Impact explanations
- Specific fix recommendations
```

### 2. Test a11y-refactor Agent

**Goal**: Automatically fix issues

```bash
# Test on single file
"Fix accessibility issues in fixtures/components/react/ImageGallery.tsx"

# Expected output:
- List of files modified
- Before/after code examples
- Explanation of each fix
- WCAG guidelines addressed
- Testing recommendations
- Remaining issues that need manual review
```

### 3. Test a11y-consultant Agent

**Goal**: Get architectural guidance

```bash
# Test with questions
"How should I implement an accessible modal dialog?"
"What's the proper ARIA pattern for tabs?"
"Should I use a native select or build a custom one?"

# Expected output:
- Clear recommendations
- Code examples
- WCAG rationale
- Testing guidance
- Links to official documentation
```

### 4. Test Commands

```bash
# Quick check
/check-a11y

# Quick fix
/fix-a11y
```

---

## Expected Agent Behavior

### a11y-reviewer should:
1. Read the fixture file(s)
2. Identify all accessibility issues
3. Prioritize by severity (critical, high, medium, low)
4. Provide WCAG references
5. Explain impact on users
6. Recommend specific fixes with code examples
7. Suggest testing approaches

### a11y-refactor should:
1. Scan for fixable issues
2. Plan the refactoring approach
3. Apply fixes methodically
4. Preserve functionality and style
5. Document all changes
6. Provide before/after examples
7. List remaining issues for manual review
8. Suggest testing

### a11y-consultant should:
1. Understand the question/problem
2. Provide clear guidance
3. Show code examples
4. Explain the accessibility rationale
5. Reference official documentation
6. Consider framework-specific patterns
7. Suggest testing approaches

---

## Creating Your Own Fixtures

When adding new fixtures:

1. **Document issues**: Add inline comments marking each issue
2. **Reference WCAG**: Include guideline numbers
3. **Be realistic**: Use patterns found in real code
4. **Cover edge cases**: Include complex scenarios
5. **Update this README**: Add fixture to documentation

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
