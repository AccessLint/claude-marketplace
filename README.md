# AccessLint - Claude Code Plugin

A Claude Code plugin for checking and fixing accessibility issues in your codebase. Make your applications more accessible and WCAG 2.1 compliant.

## Features

- **Automated accessibility checks** against WCAG 2.1 guidelines (Level A and AA)
- **Intelligent auto-fixing** of common accessibility issues
- **Detailed reports** with file locations, severity levels, and recommendations
- **Multiple language support** - works with HTML, React, Vue, and other web frameworks

## Installation

### From GitHub

Add the plugin to your Claude Code marketplace configuration:

```json
{
  "plugins": [
    {
      "name": "accesslint",
      "source": {
        "source": "github",
        "repo": "accesslint/claude-marketplace"
      }
    }
  ]
}
```

### From Local Directory

```json
{
  "plugins": [
    {
      "name": "accesslint",
      "source": {
        "source": "local",
        "path": "/path/to/claude-marketplace"
      }
    }
  ]
}
```

## Commands

### `/check-a11y`

Analyze your codebase for accessibility violations.

**Usage:**
```
/check-a11y
```

This command will:
- Scan files for accessibility issues
- Check against WCAG 2.1 Level A and AA guidelines
- Provide detailed reports with file locations and severity levels
- Include WCAG guideline references and recommended fixes

**Example output:**
```
Location: src/components/Button.tsx:42
Severity: High
Issue: Button has no accessible label
WCAG: 4.1.2 Name, Role, Value
Impact: Screen reader users cannot understand the button's purpose
Recommendation: Add aria-label="Submit form" or use visible text content
```

### `/fix-a11y`

Automatically fix common accessibility issues in your codebase.

**Usage:**
```
/fix-a11y
```

This command will:
- Detect and fix common accessibility issues
- Add missing alt text, ARIA labels, and form labels
- Fix heading hierarchy and semantic HTML issues
- Document all changes with explanations
- Flag issues that require manual review

**Example fixes:**
- Missing image alt text
- Missing ARIA labels on interactive elements
- Improper heading hierarchy
- Non-semantic HTML elements
- Missing form labels

## Agents

AccessLint uses specialized AI agents to perform comprehensive accessibility work. Commands delegate to these agents, but you can also invoke agents directly for more advanced workflows.

### `a11y-reviewer`

Comprehensive accessibility auditor that performs multi-step code reviews.

**What it does:**
- Navigates through your codebase to understand full context
- Analyzes components and their dependencies
- Checks all WCAG 2.1 Level A and AA criteria
- Provides structured audit reports with prioritized issues
- Includes code examples and testing recommendations

**When to use:**
- Deep accessibility audits of complex components
- Understanding architectural accessibility issues
- Getting comprehensive reports for compliance
- Learning what needs to be fixed before starting

**Example invocation:**
```
Review the Modal component for accessibility issues
```

### `a11y-refactor`

Accessibility refactoring specialist that fixes issues across multiple files.

**What it does:**
- Scans and fixes accessibility issues automatically
- Handles complex multi-file refactoring
- Makes intelligent, context-aware decisions
- Preserves functionality and code style
- Documents all changes with explanations
- Flags items that need manual review

**When to use:**
- Fixing accessibility issues in large codebases
- Refactoring components to be accessible
- Implementing proper ARIA patterns
- Converting non-semantic HTML to semantic markup

**Example invocation:**
```
Refactor the navigation menu to be fully keyboard accessible
```

### `a11y-consultant`

Accessibility architecture consultant that provides strategic guidance.

**What it does:**
- Answers accessibility questions with code examples
- Recommends best practices and patterns
- Explains WCAG guidelines in context
- Reviews architectural decisions
- Fetches official documentation when needed
- Helps design accessible components

**When to use:**
- Planning accessible component architecture
- Understanding how to implement ARIA patterns
- Getting advice on complex accessibility challenges
- Learning accessibility best practices

**Example invocation:**
```
How should I implement an accessible autocomplete component?
```

## Architecture

### Commands → Agents

The plugin uses a layered architecture:

1. **Commands** (`/check-a11y`, `/fix-a11y`) - User-facing entry points
2. **Agents** (a11y-reviewer, a11y-refactor, a11y-consultant) - Specialized workers

**Benefits:**
- Commands provide simple, consistent interface
- Agents have full context and tool access for complex work
- You can use commands for quick tasks or invoke agents directly for advanced workflows

**Usage patterns:**

Simple: Use commands
```
/check-a11y
/fix-a11y
```

Advanced: Invoke agents directly
```
Use the a11y-reviewer agent to audit the entire authentication flow
Have the a11y-refactor agent restructure the form components for accessibility
Ask the a11y-consultant how to implement an accessible data table with sorting
```

## What Gets Checked

### WCAG 2.1 Compliance

- **1.1.1 Non-text Content** - Images have alt text
- **1.3.1 Info and Relationships** - Semantic HTML and proper structure
- **1.4.3 Contrast (Minimum)** - Sufficient color contrast ratios
- **2.1.1 Keyboard** - Keyboard navigation support
- **2.4.2 Page Titled** - Pages have descriptive titles
- **2.4.4 Link Purpose** - Links have clear purposes
- **3.3.2 Labels or Instructions** - Form inputs have labels
- **4.1.2 Name, Role, Value** - Interactive elements have accessible names

### Common Issues Detected

- Missing or empty alt attributes on images
- Missing ARIA labels on buttons, links, and custom controls
- Insufficient color contrast
- Missing or improperly associated form labels
- Invalid ARIA attributes or roles
- Missing language attributes
- Improper heading hierarchy
- Non-semantic HTML usage

## Best Practices

1. **Run checks regularly** - Use `/check-a11y` during development
2. **Review auto-fixes** - Always review changes made by `/fix-a11y`
3. **Test with assistive technology** - Validate fixes with screen readers
4. **Consider context** - Some accessibility decisions require human judgment
5. **Continuous improvement** - Make accessibility part of your development workflow

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)

## Support

For issues and questions:
- GitHub Issues: https://github.com/accesslint/claude-marketplace/issues
- Documentation: https://github.com/accesslint/claude-marketplace

---

Made with accessibility in mind.
