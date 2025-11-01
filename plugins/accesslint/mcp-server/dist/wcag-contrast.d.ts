/**
 * WCAG 2.1 contrast analysis utilities
 */
import { type RGB } from './color-utils.js';
export type WCAGLevel = 'AA' | 'AAA';
export type ContentType = 'normal-text' | 'large-text' | 'ui-component';
export interface ContrastRequirement {
    level: WCAGLevel;
    contentType: ContentType;
    minimumRatio: number;
    guideline: string;
}
export interface ContrastAnalysis {
    foreground: string;
    background: string;
    ratio: number;
    passes: {
        normalText: boolean;
        largeText: boolean;
        uiComponent: boolean;
    };
    requirement?: ContrastRequirement;
    meetsRequirement: boolean;
}
export interface ColorSuggestion {
    color: string;
    ratio: number;
    adjustedProperty: 'foreground' | 'background';
}
/**
 * Get WCAG contrast requirements
 */
export declare function getContrastRequirements(): Record<ContentType, {
    AA: number;
    AAA: number;
}>;
/**
 * Determine WCAG guideline reference for content type
 */
export declare function getWCAGGuideline(contentType: ContentType): string;
/**
 * Calculate contrast ratio between two colors
 */
export declare function calculateContrast(foreground: string, background: string): {
    ratio: number;
    foregroundRgb: RGB;
    backgroundRgb: RGB;
};
/**
 * Analyze color pair for WCAG compliance
 */
export declare function analyzeColorPair(foreground: string, background: string, contentType?: ContentType, level?: WCAGLevel): ContrastAnalysis;
/**
 * Suggest accessible colors that meet WCAG requirements
 */
export declare function suggestAccessibleColors(foreground: string, background: string, targetRatio: number, preserveProperty?: 'foreground' | 'background' | 'both'): ColorSuggestion[];
