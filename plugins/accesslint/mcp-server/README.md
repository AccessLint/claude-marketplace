# AccessLint MCP Server

MCP (Model Context Protocol) server providing accessibility analysis tools for WCAG 2.1 conformance.

## Overview

This MCP server provides programmatic tools for color contrast analysis according to WCAG 2.1 standards. It's designed to be used with Claude Desktop and as part of the AccessLint marketplace plugin for Claude Code.

## Installation

### For Claude Desktop

Install and configure the MCP server in your Claude Desktop configuration:

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

Or install globally:

```bash
npm install -g @accesslint/mcp
```

Then configure with:

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "accesslint-mcp"
    }
  }
}
```

### For Claude Code

This MCP server is automatically included when you install the AccessLint plugin from the marketplace:

```bash
# In Claude Code, the plugin includes this MCP server
# No separate installation needed
```

## Tools

### `calculate_contrast_ratio`

Calculate the WCAG contrast ratio between two colors.

**Parameters:**
- `foreground` (string, required): Foreground color in hex (#RGB, #RRGGBB), rgb(r,g,b), or rgba(r,g,b,a) format
- `background` (string, required): Background color in the same formats

**Returns:**
```json
{
  "foreground": "#7c8aff",
  "background": "#ffffff",
  "ratio": 2.8
}
```

**Example:**
```typescript
calculate_contrast_ratio({
  foreground: "#7c8aff",
  background: "#ffffff"
})
```

---

### `analyze_color_pair`

Analyze a color pair for WCAG conformance with detailed pass/fail information.

**Parameters:**
- `foreground` (string, required): Foreground color
- `background` (string, required): Background color
- `contentType` (enum, optional): Type of content being checked
  - `"normal-text"` (default): Regular text content (requires 4.5:1 for AA)
  - `"large-text"`: Large text 18pt+ or 14pt+ bold (requires 3:1 for AA)
  - `"ui-component"`: UI component boundaries, icons (requires 3:1 for AA)
- `level` (enum, optional): WCAG conformance level
  - `"AA"` (default): Level AA conformance
  - `"AAA"`: Level AAA conformance

**Returns:**
```json
{
  "foreground": "#7c8aff",
  "background": "#ffffff",
  "ratio": 2.8,
  "passes": {
    "normalText": false,
    "largeText": false,
    "uiComponent": false
  },
  "requirement": {
    "level": "AA",
    "contentType": "normal-text",
    "minimumRatio": 4.5,
    "guideline": "1.4.3 Contrast (Minimum)"
  },
  "meetsRequirement": false
}
```

**Example:**
```typescript
analyze_color_pair({
  foreground: "#4c5dcc",
  background: "#ffffff",
  contentType: "normal-text",
  level: "AA"
})
```

---

### `suggest_accessible_color`

Get accessible color alternatives that meet WCAG requirements while preserving design intent.

**Parameters:**
- `foreground` (string, required): Current foreground color
- `background` (string, required): Current background color
- `targetRatio` (number, required): Target contrast ratio (e.g., 4.5 for normal text, 3.0 for large text)
- `preserve` (enum, optional): Which color to preserve
  - `"both"` (default): Suggest adjustments to either foreground or background
  - `"foreground"`: Only suggest background color changes
  - `"background"`: Only suggest foreground color changes

**Returns:**
```json
{
  "original": {
    "foreground": "#7c8aff",
    "background": "#ffffff"
  },
  "targetRatio": 4.5,
  "suggestions": [
    {
      "color": "#4c5dcc",
      "ratio": 4.6,
      "adjustedProperty": "foreground"
    },
    {
      "color": "#e8ebff",
      "ratio": 4.52,
      "adjustedProperty": "background"
    }
  ]
}
```

**Example:**
```typescript
suggest_accessible_color({
  foreground: "#7c8aff",
  background: "#ffffff",
  targetRatio: 4.5,
  preserve: "both"
})
```

## WCAG Contrast Requirements

### Text Content (WCAG 1.4.3 Contrast Minimum)

- **Normal text**: 4.5:1 minimum for Level AA
- **Large text** (18pt+ or 14pt+ bold): 3:1 minimum for Level AA

**Important**: Text in UI components (buttons, inputs, etc.) must meet TEXT contrast requirements, not UI component thresholds.

### UI Components (WCAG 1.4.11 Non-text Contrast)

- **Visual boundaries** (borders, outlines): 3:1 minimum for Level AA
- **Component states** (focus, hover, selected): 3:1 minimum for Level AA
- **Icons without text**: 3:1 minimum for Level AA

## Usage in Agents

The AccessLint reviewer and refactor agents have access to these tools via the MCP protocol. Tools are automatically prefixed with `mcp__accesslint__` when used in agent contexts.

**Example in reviewer agent:**
```typescript
// Analyze colors found in component
const analysis = await mcp__accesslint__analyze_color_pair({
  foreground: "#7c8aff",
  background: "#ffffff",
  contentType: "normal-text"
});

if (!analysis.meetsRequirement) {
  // Get accessible alternatives
  const suggestions = await mcp__accesslint__suggest_accessible_color({
    foreground: "#7c8aff",
    background: "#ffffff",
    targetRatio: 4.5
  });

  // Report findings...
}
```

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Watch Mode

```bash
npm run watch
```

Automatically recompile on file changes during development.

### Project Structure

```
mcp-server/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── color-utils.ts    # Color parsing and conversion
│   └── wcag-contrast.ts  # WCAG contrast analysis logic
├── dist/                 # Compiled JavaScript (committed to git)
├── package.json
└── tsconfig.json
```

## Configuration

This MCP server is automatically configured when the AccessLint plugin is installed. The configuration in `plugins/accesslint/.mcp.json` tells Claude Code how to start the server:

```json
{
  "mcpServers": {
    "accesslint": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-server/dist/index.js"]
    }
  }
}
```

## Technical Details

### Color Formats Supported

- **Hex**: `#RGB`, `#RRGGBB` (e.g., `#f00`, `#ff0000`)
- **RGB**: `rgb(r, g, b)` (e.g., `rgb(255, 0, 0)`)
- **RGBA**: `rgba(r, g, b, a)` (alpha channel is ignored for contrast calculations)

### Contrast Calculation

Implements the official WCAG 2.1 relative luminance and contrast ratio formulas:

1. **Convert to sRGB**: RGB values normalized to 0-1 range
2. **Apply gamma correction**: Account for non-linear perception
3. **Calculate relative luminance**: `L = 0.2126 * R + 0.7152 * G + 0.0722 * B`
4. **Compute contrast ratio**: `(L1 + 0.05) / (L2 + 0.05)` where L1 is lighter

### Color Adjustment Algorithm

When suggesting accessible colors, the algorithm:

1. Converts colors to HSL (Hue, Saturation, Lightness)
2. Preserves hue and saturation to maintain design intent
3. Uses binary search to find optimal lightness value
4. Returns the adjustment closest to original that meets target ratio

## License

MIT

## Author

AccessLint
