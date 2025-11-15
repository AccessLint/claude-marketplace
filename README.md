# AccessLint Plugin for Claude

An accessibility toolkit for Claude Code and Claude Desktop that helps you check and fix WCAG 2.1 conformance issues in your codebase.

## Installation

### For Claude Code (Marketplace Plugin)

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

### For Claude Desktop (MCP Server Only)

If you only want the color contrast analysis tools for Claude Desktop:

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "npx",
      "args": ["-y", "@accesslint/mcp"]
    }
  }
}
```

See the [MCP Server repository](https://github.com/accesslint/mcp-server) for more details.

## Features

### Agents

#### `accesslint:reviewer` - Accessibility Code Reviewer

Comprehensive accessibility auditor that performs multi-step code reviews.

**What it does:**
- Scans your codebase for WCAG 2.1 Level A and AA conformance issues
- Navigates through codebases to understand full context
- Generates structured audit reports with prioritized issues
- Provides detailed reports with file locations, severity levels, and WCAG references
- Includes specific recommendations and code examples

**Usage:**
Use the Task tool to invoke the agent directly:
```typescript
// Example: Review a component for accessibility issues
Task({
  subagent_type: "accesslint:reviewer",
  prompt: "Review src/components/Button.tsx for accessibility issues"
})
```

**Tools available:** Read, Glob, Grep, MCP tools for color contrast analysis

---

### Skills

#### `accesslint:contrast-checker` - Color Contrast Analysis

Interactive color contrast checker that calculates WCAG ratios and suggests accessible alternatives.

**What it does:**
- Calculates contrast ratios between foreground and background colors
- Checks compliance with WCAG AA and AAA standards
- Suggests accessible color alternatives that preserve design intent
- Provides detailed analysis for normal text, large text, and UI components

**Usage:**
Invoke the skill directly:
```typescript
// Example: Check if a color pair meets WCAG standards
Skill({ command: "accesslint:contrast-checker" })
```

The skill provides an interactive prompt where you can:
- Enter foreground and background colors (hex, rgb, rgba)
- Specify content type (normal text, large text, UI component)
- Choose WCAG level (AA or AAA)
- Get color suggestions to fix violations

---

#### `accesslint:refactor` - Accessibility Refactoring Specialist

Automatically fixes accessibility issues across multiple files.

**What it does:**
- Identifies and fixes common accessibility issues across multiple files
- Adds missing alt text, ARIA labels, and semantic HTML
- Handles complex multi-file refactoring
- Implements proper ARIA patterns and semantic HTML
- Preserves functionality and code style
- Documents all changes with explanations

**Usage:**
Invoke the skill directly:
```typescript
// Example: Fix accessibility issues in a directory
Skill({ skill: "accesslint:refactor" })
```

**Tools available:** Read, Write, Edit, Glob, Grep, MCP tools for color contrast analysis

---

### MCP Tools

When the AccessLint plugin is installed, the following MCP tools are available to all agents and skills:

#### `mcp__plugin_accesslint_accesslint__calculate_contrast_ratio`

Calculate the WCAG contrast ratio between two colors.

**Parameters:**
- `foreground` (string): Foreground color (#RGB, #RRGGBB, rgb(), rgba())
- `background` (string): Background color (same formats)

**Returns:** Contrast ratio as a number

---

#### `mcp__plugin_accesslint_accesslint__analyze_color_pair`

Analyze a color pair for WCAG conformance with detailed pass/fail information.

**Parameters:**
- `foreground` (string): Foreground color
- `background` (string): Background color
- `contentType` (optional): "normal-text" | "large-text" | "ui-component"
- `level` (optional): "AA" | "AAA"

**Returns:** Detailed analysis with pass/fail for each content type

---

#### `mcp__plugin_accesslint_accesslint__suggest_accessible_color`

Get accessible color alternatives that meet WCAG requirements.

**Parameters:**
- `foreground` (string): Current foreground color
- `background` (string): Current background color
- `targetRatio` (number): Target contrast ratio (e.g., 4.5 for normal text AA)
- `preserve` (optional): "foreground" | "background" | "both"

**Returns:** Color suggestions with contrast ratios

---

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
- Insufficient color contrast ratios

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/)
- [MCP Server Repository](https://github.com/accesslint/mcp-server)
- [NPM Package](https://www.npmjs.com/package/@accesslint/mcp)

## License

MIT
