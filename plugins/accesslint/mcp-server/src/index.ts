#!/usr/bin/env node

/**
 * AccessLint MCP Server
 * Provides accessibility analysis tools for WCAG compliance
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  calculateContrast,
  analyzeColorPair,
  suggestAccessibleColors,
  type ContentType,
  type WCAGLevel
} from './wcag-contrast.js';

// Create MCP server
const server = new Server(
  {
    name: 'accesslint',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'calculate_contrast_ratio',
        description: 'Calculate WCAG contrast ratio between two colors. Returns the contrast ratio as a number.',
        inputSchema: {
          type: 'object',
          properties: {
            foreground: {
              type: 'string',
              description: 'Foreground color (supports #RGB, #RRGGBB, rgb(r,g,b) formats)',
            },
            background: {
              type: 'string',
              description: 'Background color (supports #RGB, #RRGGBB, rgb(r,g,b) formats)',
            },
          },
          required: ['foreground', 'background'],
        },
      },
      {
        name: 'analyze_color_pair',
        description: 'Analyze a color pair for WCAG compliance. Returns detailed analysis including whether it passes for normal text, large text, and UI components.',
        inputSchema: {
          type: 'object',
          properties: {
            foreground: {
              type: 'string',
              description: 'Foreground color (supports #RGB, #RRGGBB, rgb(r,g,b) formats)',
            },
            background: {
              type: 'string',
              description: 'Background color (supports #RGB, #RRGGBB, rgb(r,g,b) formats)',
            },
            contentType: {
              type: 'string',
              enum: ['normal-text', 'large-text', 'ui-component'],
              description: 'Type of content: normal-text (default), large-text (18pt+ or 14pt+ bold), or ui-component (borders, icons)',
              default: 'normal-text',
            },
            level: {
              type: 'string',
              enum: ['AA', 'AAA'],
              description: 'WCAG conformance level (default: AA)',
              default: 'AA',
            },
          },
          required: ['foreground', 'background'],
        },
      },
      {
        name: 'suggest_accessible_color',
        description: 'Suggest accessible color alternatives that meet WCAG requirements. Returns color suggestions with their contrast ratios.',
        inputSchema: {
          type: 'object',
          properties: {
            foreground: {
              type: 'string',
              description: 'Current foreground color',
            },
            background: {
              type: 'string',
              description: 'Current background color',
            },
            targetRatio: {
              type: 'number',
              description: 'Target contrast ratio (e.g., 4.5 for normal text AA, 3.0 for large text AA)',
            },
            preserve: {
              type: 'string',
              enum: ['foreground', 'background', 'both'],
              description: 'Which color to preserve (default: both - suggests adjusting either)',
              default: 'both',
            },
          },
          required: ['foreground', 'background', 'targetRatio'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'calculate_contrast_ratio': {
        const { foreground, background } = args as { foreground: string; background: string };
        const { ratio } = calculateContrast(foreground, background);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                foreground,
                background,
                ratio: Math.round(ratio * 100) / 100,
              }, null, 2),
            },
          ],
        };
      }

      case 'analyze_color_pair': {
        const {
          foreground,
          background,
          contentType = 'normal-text',
          level = 'AA'
        } = args as {
          foreground: string;
          background: string;
          contentType?: ContentType;
          level?: WCAGLevel;
        };

        const analysis = analyzeColorPair(foreground, background, contentType, level);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analysis, null, 2),
            },
          ],
        };
      }

      case 'suggest_accessible_color': {
        const {
          foreground,
          background,
          targetRatio,
          preserve = 'both'
        } = args as {
          foreground: string;
          background: string;
          targetRatio: number;
          preserve?: 'foreground' | 'background' | 'both';
        };

        const suggestions = suggestAccessibleColors(
          foreground,
          background,
          targetRatio,
          preserve
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                original: { foreground, background },
                targetRatio,
                suggestions,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with stdio protocol
  console.error('AccessLint MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
