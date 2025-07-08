import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { FINANCIAL_HUB_COLORS } from '@/utils/color-utils';

export function FinancialColorDemo() {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const colorSwatches = [
        { name: 'Financial Dark', hex: FINANCIAL_HUB_COLORS.dark, description: 'Main background - Very dark, nearly black' },
        { name: 'Financial Teal', hex: FINANCIAL_HUB_COLORS.teal, description: 'Card headers and containers - Deep teal-blue' },
        { name: 'Financial Indigo', hex: FINANCIAL_HUB_COLORS.indigo, description: 'Action buttons and header texts - Bold indigo' },
        { name: 'Financial Cyan', hex: FINANCIAL_HUB_COLORS.cyan, description: 'Links, icons, and highlights - Medium cyan-blue' },
        { name: 'Financial Gold', hex: FINANCIAL_HUB_COLORS.gold, description: 'CTAs, focus indicators, important tags - Bright yellow-gold' },
        { name: 'Financial Light Yellow', hex: FINANCIAL_HUB_COLORS.lightYellow, description: 'Light backgrounds and hover overlays - Light pastel yellow' },
        { name: 'Financial Pale Green', hex: FINANCIAL_HUB_COLORS.paleGreen, description: 'Soft cards and accent backgrounds - Pale yellow-green' },
    ];

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2" style={{ color: themeClasses.primary }}>
                    Financial Hub Color Palette
                </h1>
                <p className="text-muted-foreground">
                    Professional color palette designed for financial applications
                </p>
            </div>

            {/* Color Swatches */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: themeClasses.primary }}></div>
                        Color Swatches
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {colorSwatches.map((color) => (
                            <div
                                key={color.name}
                                className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                                style={{ backgroundColor: color.hex }}
                            >
                                <div className="space-y-2">
                                    <h3 className="font-semibold" style={{
                                        color: color.hex === FINANCIAL_HUB_COLORS.dark ? '#ffffff' : '#000000'
                                    }}>
                                        {color.name}
                                    </h3>
                                    <p className="text-sm opacity-80" style={{
                                        color: color.hex === FINANCIAL_HUB_COLORS.dark ? '#ffffff' : '#000000'
                                    }}>
                                        {color.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs px-2 py-1 rounded bg-black/10" style={{
                                            color: color.hex === FINANCIAL_HUB_COLORS.dark ? '#ffffff' : '#000000'
                                        }}>
                                            {color.hex}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Usage Examples */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tailwind Classes Example */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Tailwind CSS Classes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-toshka-financial-dark text-white p-4 rounded">
                            <h4 className="font-semibold">Financial Dark Background</h4>
                            <p className="text-sm opacity-80">bg-toshka-financial-dark</p>
                        </div>

                        <div className="bg-toshka-financial-teal text-white p-4 rounded">
                            <h4 className="font-semibold">Financial Teal Background</h4>
                            <p className="text-sm opacity-80">bg-toshka-financial-teal</p>
                        </div>

                        <div className="bg-toshka-financial-gold text-toshka-financial-dark p-4 rounded">
                            <h4 className="font-semibold">Financial Gold Background</h4>
                            <p className="text-sm opacity-80">bg-toshka-financial-gold</p>
                        </div>

                        <div className="bg-toshka-financial-light-yellow text-toshka-financial-dark p-4 rounded">
                            <h4 className="font-semibold">Financial Light Yellow Background</h4>
                            <p className="text-sm opacity-80">bg-toshka-financial-light-yellow</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Theme System Example */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Theme System Integration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            className="w-full"
                            style={{
                                backgroundColor: themeClasses.buttonPrimary,
                                color: themeClasses.primaryForeground
                            }}
                        >
                            Primary Button
                        </Button>

                        <div
                            className="p-4 rounded border"
                            style={{
                                backgroundColor: themeClasses.cardBg,
                                borderColor: themeClasses.cardBorder
                            }}
                        >
                            <h4 className="font-semibold mb-2" style={{ color: themeClasses.primary }}>
                                Themed Card
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                This card uses the current theme color for styling
                            </p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <Badge
                                style={{
                                    backgroundColor: themeClasses.badgePrimary,
                                    color: themeClasses.primary
                                }}
                            >
                                Themed Badge
                            </Badge>
                            <Badge variant="outline" className="border-toshka-financial-cyan text-toshka-financial-cyan">
                                Financial Cyan
                            </Badge>
                            <Badge variant="outline" className="border-toshka-financial-gold text-toshka-financial-gold">
                                Financial Gold
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Professional Example */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Professional Financial Dashboard Example</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Revenue Card */}
                        <div className="bg-toshka-financial-teal/10 border border-toshka-financial-teal/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-toshka-financial-indigo">Revenue</h3>
                                <Badge className="bg-toshka-financial-gold text-toshka-financial-dark">
                                    +12.5%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold text-toshka-financial-teal">$2.4M</p>
                            <p className="text-sm text-muted-foreground">This month</p>
                        </div>

                        {/* Expenses Card */}
                        <div className="bg-toshka-financial-cyan/10 border border-toshka-financial-cyan/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-toshka-financial-indigo">Expenses</h3>
                                <Badge variant="outline" className="border-toshka-financial-cyan text-toshka-financial-cyan">
                                    -3.2%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold text-toshka-financial-cyan">$1.8M</p>
                            <p className="text-sm text-muted-foreground">This month</p>
                        </div>

                        {/* Profit Card */}
                        <div className="bg-toshka-financial-pale-green/10 border border-toshka-financial-pale-green/20 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-toshka-financial-indigo">Net Profit</h3>
                                <Badge className="bg-toshka-financial-gold text-toshka-financial-dark">
                                    +8.7%
                                </Badge>
                            </div>
                            <p className="text-2xl font-bold text-toshka-financial-pale-green">$600K</p>
                            <p className="text-sm text-muted-foreground">This month</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>How to Use These Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">1. Theme Switcher</h4>
                            <p className="text-sm text-muted-foreground">
                                Select any Financial Hub color from the theme switcher in the navbar to apply it as your primary theme color.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">2. Tailwind Classes</h4>
                            <p className="text-sm text-muted-foreground">
                                Use the <code>toshka-financial-*</code> classes directly in your components for specific color styling.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">3. Theme Hooks</h4>
                            <p className="text-sm text-muted-foreground">
                                Use <code>useThemeColors()</code> hook to access the current theme color and apply it programmatically.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">4. Color Utilities</h4>
                            <p className="text-sm text-muted-foreground">
                                Import color utilities from <code>@/utils/color-utils</code> for advanced color manipulation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 