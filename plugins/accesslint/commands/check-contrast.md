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
ONLY analyze the files/directories specified in the arguments below. Do not analyze any other files.

- If a file path is provided, analyze only that specific file
- If a directory path is provided, analyze all files within that directory
- Do not analyze anything outside the specified paths

Paths to analyze: $ARGUMENTS

If no paths are provided, inform the user that they need to specify file or directory paths to analyze.

Focus on providing practical, theme-preserving color alternatives."

The a11y-consultant agent is an accessibility expert that will:
- Use Grep/Glob to find color definitions across the codebase
- Calculate accurate contrast ratios using WCAG formulas
- Recommend accessible alternatives that preserve design intent
- Reference official WCAG documentation when needed
