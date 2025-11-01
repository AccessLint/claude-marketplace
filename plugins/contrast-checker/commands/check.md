---
description: Analyze color contrast ratios for WCAG compliance and suggest accessible alternatives
---

Use the Task tool to invoke the `contrast-checker:checker` agent with the following task:

**File/directory to analyze:** {{prompt}}

**Task prompt for the agent:**
```
Analyze color contrast ratios in {{prompt}} for WCAG AA compliance.

- Check all text/background color combinations
- Identify violations (< 4.5:1 for normal text, < 3:1 for large text)
- Suggest theme-preserving color alternatives
- Report findings to the terminal with locations, ratios, and recommendations
```
