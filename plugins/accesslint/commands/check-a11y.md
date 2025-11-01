Use the Task tool to invoke the `a11y-reviewer` agent with the following task:

"Perform a comprehensive accessibility audit. Analyze the code for WCAG 2.1 Level A and AA compliance issues. Provide a detailed report with file locations, severity levels, WCAG references, and specific recommendations for each issue found.

**Scope**:
- If '$ARGUMENTS' is provided and is a file path, analyze only that specific file
- If '$ARGUMENTS' is provided and is a directory path, analyze all files within that directory
- If '$ARGUMENTS' is empty or not provided, analyze the entire codebase

Arguments provided: $ARGUMENTS"

The a11y-reviewer agent is a specialized accessibility auditor that will:
- Navigate through the codebase to understand context
- Identify accessibility violations
- Check against WCAG 2.1 guidelines
- Provide a structured audit report with prioritized issues
- Include code examples and testing recommendations
