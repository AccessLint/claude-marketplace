# AccessLint Claude Marketplace

A marketplace repository for Claude Code containing accessibility plugins and tools.

## Plugins

This marketplace provides two complementary accessibility plugins:

### 1. a11y-team

Core accessibility plugin for checking and fixing WCAG 2.1 conformance issues in your codebase.

**Installation:**

```json
{
  "plugins": [
    {
      "name": "a11y-team",
      "source": {
        "source": "github",
        "repo": "accesslint/claude-marketplace",
        "path": "plugins/a11y-team"
      }
    }
  ]
}
```

#### Agents & Commands

##### `a11y-reviewer` agent → `/check-a11y` command

Comprehensive accessibility auditor that performs multi-step code reviews.

**Agent file:** `agents/reviewer.md`

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

**Agent name:** `a11y-reviewer` (can be invoked directly via Task tool)
**Tools:** Read, Glob, Grep

---

##### `a11y-refactor` agent → `/fix-a11y` command

Accessibility refactoring specialist for fixing issues across multiple files.

**Agent file:** `agents/refactor.md`

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

**Agent name:** `a11y-refactor` (can be invoked directly via Task tool)
**Tools:** Read, Write, Edit, Glob, Grep

---

##### `a11y-consultant` agent

Accessibility architecture consultant providing strategic guidance (available for direct agent invocation only).

**Agent file:** `agents/consultant.md`

**What it does:**
- Answers accessibility questions with code examples
- Recommends best practices and patterns
- Explains WCAG guidelines in context
- Fetches official documentation when needed
- Provides architectural guidance for accessible component design

**Usage:**
Invoke directly via Task tool using agent name `a11y-consultant`

**Agent name:** `a11y-consultant`
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

##### `contrast-checker` agent → `/check` command

Color contrast analyzer that calculates ratios and suggests WCAG-compliant alternatives.

**Command file:** `commands/check.md`
**Agent file:** `agents/checker.md`

**What it does:**
- Calculates contrast ratios for all text/background color combinations
- Identifies WCAG AA violations (< 4.5:1 for normal text, < 3:1 for large text)
- Suggests alternative colors that meet standards while preserving the original theme
- Provides specific hex values and contrast ratios for each recommendation
- Reports findings directly to the terminal in a clear, readable format

**Usage:**
```bash
/check <file or directory path>
```
*Note: File path is required for contrast analysis*

**Agent name:** `contrast-checker` (can be invoked directly via Task tool)
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
