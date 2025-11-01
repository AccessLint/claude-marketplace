Use the Task tool to invoke the `a11y-refactor` agent with the following task:

"Scan for accessibility issues and automatically fix them. Apply fixes following WCAG 2.1 guidelines while preserving functionality and code style. Document all changes with explanations and provide a summary of fixes applied.

**Scope**:
- If '$ARGUMENTS' is provided and is a file path, fix issues only in that specific file
- If '$ARGUMENTS' is provided and is a directory path, fix issues in all files within that directory
- If '$ARGUMENTS' is empty or not provided, fix issues across the entire codebase

Arguments provided: $ARGUMENTS"

The a11y-refactor agent is a specialized accessibility refactoring expert that will:
- Identify fixable accessibility issues across multiple files
- Apply intelligent fixes (alt text, ARIA labels, semantic HTML, etc.)
- Make context-aware decisions based on code analysis
- Preserve existing functionality and patterns
- Document all changes with WCAG references
- Provide testing recommendations and flag items for manual review
