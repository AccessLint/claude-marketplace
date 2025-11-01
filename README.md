# AccessLint Claude Marketplace

A marketplace repository for Claude Code containing accessibility plugins and tools.

## Plugins

This marketplace provides two complementary accessibility plugins:

### 1. accesslint

Core accessibility plugin for checking and fixing WCAG 2.1 conformance issues in your codebase.

**Installation:**

```json
{
  "plugins": [
    {
      "name": "accesslint",
      "source": {
        "source": "github",
        "repo": "accesslint/claude-marketplace",
        "path": "plugins/accesslint"
      }
    }
  ]
}
```

#### Agents & Commands

##### `a11y-reviewer` → `/check-a11y`

Comprehensive accessibility auditor that performs multi-step code reviews.

**What it does:**
- Scans your codebase for WCAG 2.1 Level A and AA conformance issues
- Navigates through codebases to understand full context
- Generates structured audit reports with prioritized issues
- Provides detailed reports with file locations, severity levels, and WCAG references
- Includes specific recommendations and code examples

**Usage:**
```bash
/check-a11y [file or directory path]
```

**Tools:** Read, Glob, Grep

---

##### `a11y-refactor` → `/fix-a11y`

Accessibility refactoring specialist for fixing issues across multiple files.

**What it does:**
- Identifies and fixes common accessibility issues across multiple files
- Adds missing alt text, ARIA labels, and semantic HTML
- Handles complex multi-file refactoring
- Implements proper ARIA patterns and semantic HTML
- Preserves functionality and code style
- Documents all changes with explanations

**Usage:**
```bash
/fix-a11y [file or directory path]
```

**Tools:** Read, Write, Edit, Glob, Grep

---

##### `a11y-consultant`

Accessibility architecture consultant providing strategic guidance (available for direct agent invocation).

**What it does:**
- Answers accessibility questions with code examples
- Recommends best practices and patterns
- Explains WCAG guidelines in context
- Fetches official documentation when needed
- Provides architectural guidance for accessible component design

**Tools:** Read, Glob, Grep, WebFetch

---

### 2. contrast-checker

Specialized color contrast analyzer for WCAG compliance.

**Installation:**

```json
{
  "plugins": [
    {
      "name": "contrast-checker",
      "source": {
        "source": "github",
        "repo": "accesslint/claude-marketplace",
        "path": "plugins/contrast-checker"
      }
    }
  ]
}
```

#### Agents & Commands

##### `contrast-checker` → `/check-contrast`

Color contrast analyzer that calculates ratios and suggests WCAG-compliant alternatives.

**What it does:**
- Calculates contrast ratios for all text/background color combinations
- Identifies WCAG AA violations (< 4.5:1 for normal text, < 3:1 for large text)
- Suggests alternative colors that meet standards while preserving the original theme
- Provides specific hex values and contrast ratios for each recommendation
- Generates JSON reports with component layout information

**Usage:**
```bash
/check-contrast <file or directory path>
```
*Note: File path is required for contrast analysis*

**Tools:** Read, Glob, Grep, WebFetch

## WCAG 2.1 Coverage

The plugin checks for Level A and AA conformance including:

- **Perceivable:** Alt text, semantic structure, color contrast
- **Operable:** Keyboard navigation, focus management, focus visibility
- **Understandable:** Clear labels, error identification, consistent behavior
- **Robust:** Proper ARIA usage, accessible names and roles

### Common Issues Detected

- Missing alt attributes and ARIA labels
- Invalid ARIA attributes or roles
- Missing or improperly associated form labels
- Improper heading hierarchy
- Non-semantic HTML usage
- Keyboard navigation issues

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)

## License

MIT
