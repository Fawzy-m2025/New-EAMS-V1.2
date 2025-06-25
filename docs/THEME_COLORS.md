# Financial Hub Color Palette

This document describes the Financial Hub color palette that has been added to the theme system.

## Color Palette

The Financial Hub color palette consists of 7 carefully selected colors designed for financial applications with a professional and modern look:

### Primary Colors

| Color Name | Hex Code | HSL Values | Usage |
|------------|----------|------------|-------|
| **Financial Dark** | `#06070A` | `210 100% 2%` | Main background - Very dark, nearly black |
| **Financial Teal** | `#19485F` | `200 52% 24%` | Card headers and containers - Deep teal-blue |
| **Financial Indigo** | `#2D3480` | `235 48% 34%` | Action buttons and header texts - Bold indigo |
| **Financial Cyan** | `#4C9DB0` | `195 40% 48%` | Links, icons, and highlights - Medium cyan-blue |

### Accent Colors

| Color Name | Hex Code | HSL Values | Usage |
|------------|----------|------------|-------|
| **Financial Gold** | `#FFC01D` | `45 100% 55%` | CTAs, focus indicators, important tags - Bright yellow-gold |
| **Financial Light Yellow** | `#FFEBAF` | `45 100% 85%` | Light backgrounds and hover overlays - Light pastel yellow |
| **Financial Pale Green** | `#D9E0A4` | `65 35% 75%` | Soft cards and accent backgrounds - Pale yellow-green |

## Usage in Theme System

### 1. Theme Switcher

The new colors are available in the theme switcher dropdown. Users can select any of the Financial Hub colors as their primary theme color:

```tsx
import { useThemeColors } from '@/hooks/use-theme-colors';

const { selectedColor, setSelectedColor } = useThemeColors();
```

### 2. Tailwind CSS Classes

The colors are available as Tailwind CSS classes under the `toshka` namespace:

```tsx
// Background colors
<div className="bg-toshka-financial-dark">Dark background</div>
<div className="bg-toshka-financial-teal">Teal background</div>
<div className="bg-toshka-financial-indigo">Indigo background</div>
<div className="bg-toshka-financial-cyan">Cyan background</div>
<div className="bg-toshka-financial-gold">Gold background</div>
<div className="bg-toshka-financial-light-yellow">Light yellow background</div>
<div className="bg-toshka-financial-pale-green">Pale green background</div>

// Text colors
<div className="text-toshka-financial-dark">Dark text</div>
<div className="text-toshka-financial-gold">Gold text</div>

// Border colors
<div className="border-toshka-financial-teal">Teal border</div>
```

### 3. CSS Custom Properties

The selected theme color is applied to CSS custom properties:

```css
:root {
  --primary: [selected-color-hsl-values];
  --theme-color-rgb: [selected-color-rgb-values];
}
```

### 4. Programmatic Usage

You can use the color utilities to work with the colors programmatically:

```tsx
import { 
  FINANCIAL_HUB_COLORS, 
  hexToAllFormats, 
  createThemeColor 
} from '@/utils/color-utils';

// Get all formats of a color
const colorFormats = hexToAllFormats(FINANCIAL_HUB_COLORS.gold);

// Create a theme color object
const themeColor = createThemeColor('Custom Gold', '#FFC01D');
```

## Color Accessibility

All colors in the Financial Hub palette have been tested for accessibility and meet WCAG AA standards when used appropriately:

- **Financial Dark** (#06070A): Use with light text for high contrast
- **Financial Teal** (#19485F): Good contrast with white text
- **Financial Indigo** (#2D3480): Excellent contrast with white text
- **Financial Cyan** (#4C9DB0): Good contrast with dark text
- **Financial Gold** (#FFC01D): Use with dark text for best contrast
- **Financial Light Yellow** (#FFEBAF): Use with dark text
- **Financial Pale Green** (#D9E0A4): Use with dark text

## Best Practices

### 1. Color Combinations

- Use **Financial Dark** as the main background for dark themes
- Use **Financial Teal** for card headers and important containers
- Use **Financial Indigo** for primary action buttons and navigation
- Use **Financial Cyan** for links, icons, and secondary elements
- Use **Financial Gold** sparingly for CTAs and important highlights
- Use **Financial Light Yellow** for hover states and subtle backgrounds
- Use **Financial Pale Green** for accent backgrounds and soft cards

### 2. Theme Integration

The colors are automatically integrated into the existing theme system:

- **Primary Color**: Applied to buttons, links, and focus states
- **Accent Color**: Used for hover effects and secondary elements
- **Background Colors**: Applied to cards and containers
- **Border Colors**: Used for component borders and dividers

### 3. Responsive Design

The colors work well across different screen sizes and maintain their visual hierarchy:

- Dark colors provide good contrast on mobile devices
- Gold accent color is visible and accessible on small screens
- Light colors work well for touch targets and interactive elements

## Examples

### Card Component with Financial Colors

```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function FinancialCard() {
  return (
    <Card className="bg-toshka-financial-teal/5 border-toshka-financial-teal/20">
      <CardHeader className="bg-toshka-financial-teal/10">
        <h3 className="text-toshka-financial-indigo font-semibold">
          Financial Report
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">
          Your financial data with professional styling.
        </p>
        <button className="bg-toshka-financial-gold text-toshka-financial-dark px-4 py-2 rounded">
          View Details
        </button>
      </CardContent>
    </Card>
  );
}
```

### Theme-Aware Component

```tsx
import { useThemeColors } from '@/hooks/use-theme-colors';

function ThemedComponent() {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  return (
    <div 
      className="p-4 rounded-lg"
      style={{ 
        backgroundColor: themeClasses.cardBg,
        borderColor: themeClasses.cardBorder 
      }}
    >
      <h2 style={{ color: themeClasses.primary }}>
        Themed Component
      </h2>
    </div>
  );
}
```

## Migration Guide

If you're updating from the previous color system:

1. **Replace hardcoded colors** with the new Financial Hub palette
2. **Update Tailwind classes** to use the `toshka-` prefix
3. **Test accessibility** with the new color combinations
4. **Update theme switcher** to include the new colors

The new colors maintain the same professional appearance while providing better consistency and accessibility across the application. 