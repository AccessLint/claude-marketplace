/**
 * WCAG 2.1 contrast analysis utilities
 */
import { parseColor, rgbToHex, getContrastRatio, findAccessibleColor } from './color-utils.js';
/**
 * Get WCAG contrast requirements
 */
export function getContrastRequirements() {
    return {
        'normal-text': { AA: 4.5, AAA: 7.0 },
        'large-text': { AA: 3.0, AAA: 4.5 },
        'ui-component': { AA: 3.0, AAA: 3.0 } // AAA doesn't have stricter requirements
    };
}
/**
 * Determine WCAG guideline reference for content type
 */
export function getWCAGGuideline(contentType) {
    switch (contentType) {
        case 'normal-text':
        case 'large-text':
            return '1.4.3 Contrast (Minimum)';
        case 'ui-component':
            return '1.4.11 Non-text Contrast';
    }
}
/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrast(foreground, background) {
    const foregroundRgb = parseColor(foreground);
    const backgroundRgb = parseColor(background);
    const ratio = getContrastRatio(foregroundRgb, backgroundRgb);
    return { ratio, foregroundRgb, backgroundRgb };
}
/**
 * Analyze color pair for WCAG compliance
 */
export function analyzeColorPair(foreground, background, contentType = 'normal-text', level = 'AA') {
    const { ratio, foregroundRgb, backgroundRgb } = calculateContrast(foreground, background);
    const requirements = getContrastRequirements();
    // Check all levels
    const passes = {
        normalText: ratio >= requirements['normal-text'].AA,
        largeText: ratio >= requirements['large-text'].AA,
        uiComponent: ratio >= requirements['ui-component'].AA
    };
    // Check specific requirement
    const minimumRatio = requirements[contentType][level];
    const requirement = {
        level,
        contentType,
        minimumRatio,
        guideline: getWCAGGuideline(contentType)
    };
    return {
        foreground: rgbToHex(foregroundRgb),
        background: rgbToHex(backgroundRgb),
        ratio: Math.round(ratio * 100) / 100,
        passes,
        requirement,
        meetsRequirement: ratio >= minimumRatio
    };
}
/**
 * Suggest accessible colors that meet WCAG requirements
 */
export function suggestAccessibleColors(foreground, background, targetRatio, preserveProperty = 'both') {
    const foregroundRgb = parseColor(foreground);
    const backgroundRgb = parseColor(background);
    const suggestions = [];
    // Try adjusting foreground
    if (preserveProperty === 'background' || preserveProperty === 'both') {
        const adjustedFg = findAccessibleColor(foregroundRgb, backgroundRgb, targetRatio, true);
        if (adjustedFg) {
            const ratio = getContrastRatio(adjustedFg, backgroundRgb);
            suggestions.push({
                color: rgbToHex(adjustedFg),
                ratio: Math.round(ratio * 100) / 100,
                adjustedProperty: 'foreground'
            });
        }
    }
    // Try adjusting background
    if (preserveProperty === 'foreground' || preserveProperty === 'both') {
        const adjustedBg = findAccessibleColor(foregroundRgb, backgroundRgb, targetRatio, false);
        if (adjustedBg) {
            const ratio = getContrastRatio(foregroundRgb, adjustedBg);
            suggestions.push({
                color: rgbToHex(adjustedBg),
                ratio: Math.round(ratio * 100) / 100,
                adjustedProperty: 'background'
            });
        }
    }
    // Sort by how close to target ratio (prefer minimal changes)
    return suggestions.sort((a, b) => {
        const aDiff = Math.abs(a.ratio - targetRatio);
        const bDiff = Math.abs(b.ratio - targetRatio);
        return aDiff - bDiff;
    });
}
//# sourceMappingURL=wcag-contrast.js.map