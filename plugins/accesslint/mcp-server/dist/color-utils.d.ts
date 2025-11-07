/**
 * Color utilities for accessibility analysis
 * Implements WCAG 2.1 color contrast calculations
 */
export interface RGB {
    r: number;
    g: number;
    b: number;
}
export interface HSL {
    h: number;
    s: number;
    l: number;
}
/**
 * Parse a color string into RGB values
 * Supports: #RGB, #RRGGBB, rgb(r,g,b), rgba(r,g,b,a)
 */
export declare function parseColor(color: string): RGB;
/**
 * Convert RGB to hex string
 */
export declare function rgbToHex(rgb: RGB): string;
/**
 * Convert RGB to HSL
 */
export declare function rgbToHsl(rgb: RGB): HSL;
/**
 * Convert HSL to RGB
 */
export declare function hslToRgb(hsl: HSL): RGB;
/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export declare function getRelativeLuminance(rgb: RGB): number;
/**
 * Calculate WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export declare function getContrastRatio(color1: RGB, color2: RGB): number;
/**
 * Adjust color lightness while preserving hue and saturation
 */
export declare function adjustLightness(rgb: RGB, targetLightness: number): RGB;
/**
 * Find an accessible color by adjusting lightness
 * Returns a color that meets the target contrast ratio
 */
export declare function findAccessibleColor(foreground: RGB, background: RGB, targetRatio: number, adjustForeground?: boolean): RGB | null;
