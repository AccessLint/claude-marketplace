# AccessLint Claude Marketplace

A marketplace repository for Claude Code containing accessibility plugins and tools.

## Plugins

### a11y-team

Accessibility plugin for checking and fixing WCAG 2.1 conformance issues in your codebase.

**Installation:**

Add to your Claude Code marketplace configuration:

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

#### Commands

##### `/check-a11y`

Performs a comprehensive accessibility audit using the `a11y-reviewer` agent.

**What it does:**
- Scans your codebase for WCAG 2.1 Level A and AA conformance issues
- Provides detailed reports with file locations, severity levels, and WCAG references
- Includes specific recommendations and code examples

##### `/fix-a11y`

Automatically fixes accessibility issues using the `a11y-refactor` agent.

**What it does:**
- Identifies and fixes common accessibility issues across multiple files
- Adds missing alt text, ARIA labels, and semantic HTML
- Preserves functionality and code style
- Documents all changes with explanations

##### `/check-contrast`

Analyzes color contrast ratios using the `a11y-consultant` agent.

**What it does:**
- Calculates contrast ratios for all text/background color combinations
- Identifies WCAG AA violations (< 4.5:1 for normal text, < 3:1 for large text)
- Suggests alternative colors that meet standards while preserving the original theme
- Provides specific hex values and contrast ratios for each recommendation

#### Agents

The plugin includes three specialized accessibility agents that can be invoked directly for advanced workflows.

##### `a11y-reviewer`

Comprehensive accessibility auditor that performs multi-step code reviews.

**Capabilities:**
- Navigates through codebases to understand full context
- Checks a subset of WCAG 2.1 Level A and AA criteria
- Generates structured audit reports with prioritized issues
- Provides code examples and testing recommendations

**Tools:** Read, Glob, Grep

##### `a11y-refactor`

Accessibility refactoring specialist for fixing issues across multiple files.

**Capabilities:**
- Automatically fixes accessibility issues
- Handles complex multi-file refactoring
- Implements proper ARIA patterns and semantic HTML
- Preserves functionality and code style

**Tools:** Read, Write, Edit, Glob, Grep

##### `a11y-consultant`

Accessibility architecture consultant providing strategic guidance.

**Capabilities:**
- Answers accessibility questions with code examples
- Recommends best practices and patterns
- Explains WCAG guidelines in context
- Fetches official documentation when needed

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
