/**
 * Color utilities for accessibility analysis
 * Implements WCAG 2.1 color contrast calculations
 */

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

/**
 * Parse a color string into RGB values
 * Supports: #RGB, #RRGGBB, rgb(r,g,b), rgba(r,g,b,a)
 */
export function parseColor(color: string): RGB {
  const normalized = color.trim().toLowerCase();

  // Hex color: #RGB or #RRGGBB
  if (normalized.startsWith('#')) {
    const hex = normalized.slice(1);

    // Expand shorthand #RGB to #RRGGBB
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    }

    // Full hex #RRGGBB
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    }

    throw new Error(`Invalid hex color: ${color}`);
  }

  // RGB/RGBA format: rgb(r,g,b) or rgba(r,g,b,a)
  const rgbMatch = normalized.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  throw new Error(`Unsupported color format: ${color}`);
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGB): string {
  const r = rgb.r.toString(16).padStart(2, '0');
  const g = rgb.g.toString(16).padStart(2, '0');
  const b = rgb.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Calculate relative luminance per WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(rgb: RGB): number {
  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(color1: RGB, color2: RGB): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Adjust color lightness while preserving hue and saturation
 */
export function adjustLightness(rgb: RGB, targetLightness: number): RGB {
  const hsl = rgbToHsl(rgb);
  hsl.l = Math.max(0, Math.min(100, targetLightness));
  return hslToRgb(hsl);
}

/**
 * Find an accessible color by adjusting lightness
 * Returns a color that meets the target contrast ratio
 */
export function findAccessibleColor(
  foreground: RGB,
  background: RGB,
  targetRatio: number,
  adjustForeground: boolean = true
): RGB | null {
  const colorToAdjust = adjustForeground ? foreground : background;
  const fixedColor = adjustForeground ? background : foreground;

  // Binary search for the right lightness
  let minL = 0;
  let maxL = 100;
  let iterations = 0;
  const maxIterations = 20;

  while (iterations < maxIterations && maxL - minL > 1) {
    const midL = (minL + maxL) / 2;
    const adjusted = adjustLightness(colorToAdjust, midL);
    const ratio = adjustForeground
      ? getContrastRatio(adjusted, fixedColor)
      : getContrastRatio(fixedColor, adjusted);

    if (ratio >= targetRatio) {
      // We found a color that meets the ratio
      // Try to get closer to original lightness
      const currentHsl = rgbToHsl(colorToAdjust);
      if (midL < currentHsl.l) {
        minL = midL;
      } else {
        maxL = midL;
      }
    } else {
      // Need more contrast
      const currentLuminance = getRelativeLuminance(colorToAdjust);
      const fixedLuminance = getRelativeLuminance(fixedColor);

      if (currentLuminance > fixedLuminance) {
        // Make it lighter
        minL = midL;
      } else {
        // Make it darker
        maxL = midL;
      }
    }

    iterations++;
  }

  // Test both boundaries
  const lightAdjusted = adjustLightness(colorToAdjust, maxL);
  const darkAdjusted = adjustLightness(colorToAdjust, minL);

  const lightRatio = adjustForeground
    ? getContrastRatio(lightAdjusted, fixedColor)
    : getContrastRatio(fixedColor, lightAdjusted);

  const darkRatio = adjustForeground
    ? getContrastRatio(darkAdjusted, fixedColor)
    : getContrastRatio(fixedColor, darkAdjusted);

  // Return the one that meets target and is closest to original
  const originalHsl = rgbToHsl(colorToAdjust);

  if (lightRatio >= targetRatio && darkRatio >= targetRatio) {
    // Both work, pick closest to original
    const lightDiff = Math.abs(maxL - originalHsl.l);
    const darkDiff = Math.abs(minL - originalHsl.l);
    return lightDiff < darkDiff ? lightAdjusted : darkAdjusted;
  } else if (lightRatio >= targetRatio) {
    return lightAdjusted;
  } else if (darkRatio >= targetRatio) {
    return darkAdjusted;
  }

  return null;
}
