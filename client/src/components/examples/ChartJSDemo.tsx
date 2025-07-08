import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { FinancialChart } from '@/components/charts/FinancialChart';
import { useTheme } from '@/hooks/use-theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Zap,
    Sparkles,
    DollarSign,
    Users,
    Settings,
    Palette,
    Zap as Lightning
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChartJSDemo() {
    const { theme } = useTheme();
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();
    const [activeTab, setActiveTab] = useState('overview');

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Sample financial data
    const financialData = useMemo(() => [
        { label: 'Q1', value: 2400000, change: 120000, changePercent: 5.3 },
        { label: 'Q2', value: 2800000, change: 400000, changePercent: 16.7 },
        { label: 'Q3', value: 3200000, change: 400000, changePercent: 14.3 },
        { label: 'Q4', value: 3800000, change: 600000, changePercent: 18.8 },
    ], []);

    // Sample revenue data
    const revenueData = useMemo(() => ({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: [1200000, 1400000, 1600000, 1800000, 2000000, 2200000],
                borderColor: themeClasses.primary,
                backgroundColor: themeClasses.primary + '20',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Expenses',
                data: [800000, 900000, 1000000, 1100000, 1200000, 1300000],
                borderColor: '#ef4444',
                backgroundColor: '#ef4444' + '20',
                fill: true,
                tension: 0.4,
            },
        ],
    }), [themeClasses]);

    // Sample asset distribution data
    const assetDistributionData = useMemo(() => ({
        labels: ['Equipment', 'Vehicles', 'Buildings', 'Technology', 'Furniture'],
        datasets: [{
            label: 'Asset Value',
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                themeClasses.primary,
                themeClasses.chart,
                '#10b981',
                '#f59e0b',
                '#ef4444',
            ],
            borderWidth: 2,
            borderColor: isDark ? '#1f2937' : '#ffffff',
        }],
    }), [themeClasses, isDark]);

    // Sample performance metrics data
    const performanceData = useMemo(() => ({
        labels: ['Efficiency', 'Productivity', 'Quality', 'Safety', 'Cost Control'],
        datasets: [{
            label: 'Current',
            data: [85, 78, 92, 88, 76],
            borderColor: themeClasses.primary,
            backgroundColor: themeClasses.primary + '20',
            pointBackgroundColor: themeClasses.primary,
            pointBorderColor: isDark ? '#1f2937' : '#ffffff',
            pointHoverBackgroundColor: themeClasses.primary,
            pointHoverBorderColor: isDark ? '#1f2937' : '#ffffff',
        }],
    }), [themeClasses, isDark]);

    // Sample maintenance data
    const maintenanceData = useMemo(() => ({
        labels: ['Preventive', 'Corrective', 'Predictive', 'Emergency'],
        datasets: [{
            label: 'Work Orders',
            data: [45, 25, 20, 10],
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#3b82f6',
                '#ef4444',
            ],
            borderWidth: 2,
            borderColor: isDark ? '#1f2937' : '#ffffff',
        }],
    }), [isDark]);

    // Sample trend data
    const trendData = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Production',
                data: [85, 88, 92, 87, 90, 95, 89],
                borderColor: themeClasses.primary,
                backgroundColor: 'transparent',
                tension: 0.4,
            },
            {
                label: 'Target',
                data: [90, 90, 90, 90, 90, 90, 90],
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0,
            },
        ],
    }), [themeClasses]);

    const handleDataPointClick = (dataPoint: any) => {
        console.log('Clicked data point:', dataPoint);
        // Add custom click handling here
    };

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full" style={{ backgroundColor: themeClasses.primary + '20' }}>
                        <Sparkles className="h-8 w-8" style={{ color: themeClasses.primary }} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold" style={{ color: themeClasses.primary }}>
                            Chart.js Enhanced
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Professional, Creative & Dynamic Charts
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                    <Badge className="bg-green-100 text-green-800">
                        <Lightning className="h-3 w-3 mr-1" />
                        Theme Integrated
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800">
                        <Palette className="h-3 w-3 mr-1" />
                        Professional
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Creative
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800">
                        <Zap className="h-3 w-3 mr-1" />
                        Dynamic
                    </Badge>
                </div>
            </div>

            {/* Features Overview */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Key Features
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-3">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Theme Integration</h3>
                            <p className="text-sm text-muted-foreground">
                                Automatically adapts to light/dark mode and Financial Hub colors
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-3">
                                <BarChart3 className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Professional Styling</h3>
                            <p className="text-sm text-muted-foreground">
                                Glass morphism effects, smooth animations, and enterprise-grade design
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-3">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Creative Designs</h3>
                            <p className="text-sm text-muted-foreground">
                                Multiple color schemes, animations, and visual effects
                            </p>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <div className="p-3 rounded-full bg-orange-100 w-fit mx-auto mb-3">
                                <Zap className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Dynamic Features</h3>
                            <p className="text-sm text-muted-foreground">
                                Interactive tooltips, export functionality, and real-time updates
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chart Examples */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EnhancedChart
                            title="Revenue Trends"
                            description="Monthly revenue and expense tracking"
                            type="area"
                            data={revenueData}
                            height={300}
                            preset="financial"
                            colorScheme="gradient"
                            animation="slide"
                            onDataPointClick={handleDataPointClick}
                        />

                        <EnhancedChart
                            title="Asset Distribution"
                            description="Current asset portfolio breakdown"
                            type="doughnut"
                            data={assetDistributionData}
                            height={300}
                            preset="dashboard"
                            colorScheme="financial"
                            animation="bounce"
                            onDataPointClick={handleDataPointClick}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FinancialChart
                            title="Quarterly Revenue"
                            description="Revenue performance by quarter"
                            data={financialData}
                            type="bar"
                            height={300}
                            showTarget={true}
                            targetValue={3000000}
                            onDataPointClick={handleDataPointClick}
                        />

                        <EnhancedChart
                            title="Profit Margins"
                            description="Monthly profit margin analysis"
                            type="line"
                            data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                datasets: [{
                                    label: 'Profit Margin %',
                                    data: [15, 18, 22, 20, 25, 28],
                                    borderColor: themeClasses.primary,
                                    backgroundColor: themeClasses.primary + '20',
                                    tension: 0.4,
                                }],
                            }}
                            height={300}
                            preset="analytics"
                            colorScheme="monochrome"
                            animation="zoom"
                            customOptions={{
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        max: 30,
                                        ticks: {
                                            callback: function (value: any) {
                                                return value + '%';
                                            },
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EnhancedChart
                            title="Performance Metrics"
                            description="Key performance indicators radar chart"
                            type="radar"
                            data={performanceData}
                            height={300}
                            preset="presentation"
                            colorScheme="vibrant"
                            animation="flip"
                            onDataPointClick={handleDataPointClick}
                        />

                        <EnhancedChart
                            title="Maintenance Work Orders"
                            description="Distribution by maintenance type"
                            type="pie"
                            data={maintenanceData}
                            height={300}
                            preset="dashboard"
                            colorScheme="pastel"
                            animation="fade"
                            onDataPointClick={handleDataPointClick}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EnhancedChart
                            title="Production Trends"
                            description="Weekly production vs target"
                            type="line"
                            data={trendData}
                            height={300}
                            preset="financial"
                            colorScheme="financial"
                            animation="slide"
                            onDataPointClick={handleDataPointClick}
                        />

                        <FinancialChart
                            title="Cost Analysis"
                            description="Monthly cost breakdown"
                            data={[
                                { label: 'Labor', value: 1200000, change: 50000 },
                                { label: 'Materials', value: 800000, change: -20000 },
                                { label: 'Overhead', value: 600000, change: 10000 },
                                { label: 'Utilities', value: 400000, change: -15000 },
                            ]}
                            type="bar"
                            height={300}
                            showChange={true}
                            onDataPointClick={handleDataPointClick}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Theme Integration Demo */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme Integration Demo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <h4 className="font-semibold mb-2">Current Theme</h4>
                            <Badge variant="outline" className="text-sm">
                                {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                            </Badge>
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <h4 className="font-semibold mb-2">Primary Color</h4>
                            <div
                                className="w-8 h-8 rounded-full mx-auto border-2 border-border"
                                style={{ backgroundColor: themeClasses.primary }}
                            />
                        </div>

                        <div className="text-center p-4 rounded-lg bg-background/50">
                            <h4 className="font-semibold mb-2">Chart Colors</h4>
                            <div className="flex justify-center gap-1">
                                {['primary', 'chart', 'success', 'warning', 'danger'].map((color, index) => (
                                    <div
                                        key={index}
                                        className="w-4 h-4 rounded-full border border-border"
                                        style={{ backgroundColor: themeClasses[color as keyof typeof themeClasses] }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        How to Use Enhanced Charts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Basic Usage</h4>
                            <div className="space-y-2 text-sm">
                                <p><code className="bg-muted px-2 py-1 rounded">EnhancedChart</code> - Full-featured chart component</p>
                                <p><code className="bg-muted px-2 py-1 rounded">FinancialChart</code> - Specialized for financial data</p>
                                <p>Automatic theme integration with light/dark mode</p>
                                <p>Professional styling with glass morphism effects</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3">Advanced Features</h4>
                            <div className="space-y-2 text-sm">
                                <p>Multiple color schemes and animation types</p>
                                <p>Interactive tooltips and click handlers</p>
                                <p>Export functionality (PNG format)</p>
                                <p>Real-time data updates and refresh</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 