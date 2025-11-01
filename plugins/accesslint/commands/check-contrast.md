Use the Task tool to invoke the `a11y-consultant` agent with the following task:

"Analyze for color contrast issues. For each text/background color combination found in CSS, inline styles, or component files:

1. Calculate the contrast ratio
2. Determine if it meets WCAG 2.1 Level AA requirements:
   - Normal text: 4.5:1 minimum
   - Large text (18pt+ or 14pt+ bold): 3:1 minimum
   - UI components and graphics: 3:1 minimum

3. For any violations, suggest alternative colors that:
   - Meet or exceed the WCAG AA threshold
   - Maintain the original color's hue and theme as closely as possible
   - Provide the specific hex value and resulting contrast ratio

4. Present findings in a structured report showing:
   - Location (file:line)
   - Current colors and contrast ratio
   - Pass/Fail status
   - Suggested fix with new contrast ratio
   - WCAG guideline reference (1.4.3 Contrast Minimum)

**Scope**:
ONLY analyze the pages/components specified in the arguments below for contrast issues.

- If a file path is provided, analyze only that specific file for contrast issues
- If a directory path is provided, analyze only files within that directory for contrast issues
- Do NOT report contrast issues from any pages/components outside the specified paths

However, you MAY search the entire codebase to find color definitions, CSS variables, design tokens, or theme files that are referenced by the specified components. This is necessary to accurately calculate contrast ratios.

Paths to analyze: $ARGUMENTS

If no paths are provided, show an error message that file or directory paths are required and DO NOT analyze anything.

Focus on providing practical, theme-preserving color alternatives."

The a11y-consultant agent is an accessibility expert that will:
- Use Grep/Glob to find color definitions across the codebase
- Calculate accurate contrast ratios using WCAG formulas
- Recommend accessible alternatives that preserve design intent
- Reference official WCAG documentation when needed
