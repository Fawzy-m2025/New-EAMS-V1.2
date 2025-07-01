/**
 * Color utility functions for theme management
 */

export interface ColorFormat {
    hex: string;
    hsl: string;
    rgb: string;
    hslValues: { h: number; s: number; l: number };
    rgbValues: { r: number; g: number; b: number };
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error(`Invalid hex color: ${hex}`);
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    };
}

/**
 * Convert RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB values to HSL values
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL values to RGB values
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Convert hex color to all formats
 */
export function hexToAllFormats(hex: string): ColorFormat {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    return {
        hex,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        rgb: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        hslValues: hsl,
        rgbValues: rgb
    };
}

/**
 * Financial Hub Color Palette
 * These colors are designed for financial applications with a professional look
 */
export const FINANCIAL_HUB_COLORS = {
    // Main background - Very dark, nearly black
    dark: '#06070A',
    // Card headers and containers - Deep teal-blue
    teal: '#19485F',
    // Action buttons and header texts - Bold indigo
    indigo: '#2D3480',
    // Links, icons, and highlights - Medium cyan-blue
    cyan: '#4C9DB0',
    // CTAs, focus indicators, important tags - Bright yellow-gold
    gold: '#FFC01D',
    // Light backgrounds and hover overlays - Light pastel yellow
    lightYellow: '#FFEBAF',
    // Soft cards and accent backgrounds - Pale yellow-green
    paleGreen: '#D9E0A4'
} as const;

/**
 * Get all color formats for the Financial Hub palette
 */
export function getFinancialHubColorFormats() {
    return Object.entries(FINANCIAL_HUB_COLORS).reduce((acc, [name, hex]) => {
        acc[name] = hexToAllFormats(hex);
        return acc;
    }, {} as Record<string, ColorFormat>);
}

/**
 * Generate a theme color object for the theme system
 */
export function createThemeColor(name: string, hex: string) {
    const formats = hexToAllFormats(hex);
    return {
        name,
        value: `${formats.hslValues.h} ${formats.hslValues.s}% ${formats.hslValues.l}%`,
        hsl: formats.hsl,
        rgb: formats.rgb
    };
}

/**
 * Validate if a color is accessible with given text color
 */
export function isColorAccessible(backgroundColor: string, textColor: string = '#000000'): boolean {
    const bgRgb = hexToRgb(backgroundColor);
    const textRgb = hexToRgb(textColor);

    const getLuminance = (r: number, g: number, b: number) => {
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);

    const ratio = (Math.max(bgLuminance, textLuminance) + 0.05) / (Math.min(bgLuminance, textLuminance) + 0.05);

    return ratio >= 4.5; // WCAG AA standard for normal text
} 