import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    ChartType,
    registerables,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
    getChartOptions,
    getColorScheme,
    getAnimationConfig,
    getChartPreset,
    updateChartTheme,
    addChartInteractivity,
    CHART_COLORS,
    type ChartType as ChartTypeType,
    type ColorScheme,
    type AnimationType,
    type ChartPreset
} from '@/utils/chart-config';
import {
    Download,
    RefreshCw,
    Settings,
    TrendingUp,
    BarChart3,
    PieChart,
    Activity,
    Target,
    Zap,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Register all Chart.js components
ChartJS.register(...registerables);

interface EnhancedChartProps {
    title: string;
    description?: string;
    type: ChartTypeType;
    data: ChartData<any>;
    height?: number;
    className?: string;
    preset?: ChartPreset;
    colorScheme?: ColorScheme;
    animation?: AnimationType;
    showControls?: boolean;
    showLegend?: boolean;
    interactive?: boolean;
    exportable?: boolean;
    refreshable?: boolean;
    customOptions?: Partial<ChartOptions>;
    onDataPointClick?: (dataPoint: any) => void;
    onChartUpdate?: (chart: ChartJS) => void;
}

export function EnhancedChart({
    title,
    description,
    type,
    data,
    height = 400,
    className,
    preset = 'financial',
    colorScheme = 'financial',
    animation = 'fade',
    showControls = true,
    showLegend = true,
    interactive = true,
    exportable = true,
    refreshable = true,
    customOptions = {},
    onDataPointClick,
    onChartUpdate,
}: EnhancedChartProps) {
    const { theme } = useTheme();
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();
    const chartRef = useRef<ChartJS>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPreset, setCurrentPreset] = useState<ChartPreset>(preset);
    const [currentColorScheme, setCurrentColorScheme] = useState<ColorScheme>(colorScheme);
    const [currentAnimation, setCurrentAnimation] = useState<AnimationType>(animation);

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Get chart options with theme integration
    const getOptions = useCallback((): ChartOptions => {
        const baseOptions = getChartOptions(type);
        const presetConfig = getChartPreset(currentPreset);
        const animationConfig = getAnimationConfig(currentAnimation);

        return {
            ...baseOptions,
            ...presetConfig.options,
            ...customOptions,
            animation: {
                ...baseOptions.animation,
                ...animationConfig,
            },
            plugins: {
                ...baseOptions.plugins,
                legend: {
                    ...baseOptions.plugins?.legend,
                    display: showLegend,
                },
            },
        };
    }, [type, currentPreset, currentAnimation, showLegend, customOptions]);

    // Apply color scheme to data
    const getColoredData = useCallback((): ChartData<any> => {
        const colors = getColorScheme(currentColorScheme);

        if (type === 'doughnut' || type === 'pie') {
            return {
                ...data,
                datasets: data.datasets?.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color + '80'),
                    borderWidth: 2,
                })),
            };
        }

        return {
            ...data,
            datasets: data.datasets?.map((dataset, index) => ({
                ...dataset,
                backgroundColor: dataset.backgroundColor || colors[index % colors.length] + '20',
                borderColor: dataset.borderColor || colors[index % colors.length],
                pointBackgroundColor: colors[index % colors.length],
                pointBorderColor: isDark ? '#1f2937' : '#ffffff',
                pointHoverBackgroundColor: colors[index % colors.length],
                pointHoverBorderColor: isDark ? '#1f2937' : '#ffffff',
            })),
        };
    }, [data, currentColorScheme, type, isDark]);

    // Handle chart updates
    useEffect(() => {
        if (chartRef.current) {
            updateChartTheme(chartRef.current, isDark);
            if (interactive) {
                addChartInteractivity(chartRef.current);
            }
            onChartUpdate?.(chartRef.current);
        }
    }, [isDark, interactive, onChartUpdate]);

    // Handle data point clicks
    const handleClick = useCallback((event: any, elements: any[]) => {
        if (elements.length > 0 && onDataPointClick) {
            const element = elements[0];
            const dataPoint = {
                datasetIndex: element.datasetIndex,
                index: element.index,
                value: element.parsed,
                label: data.labels?.[element.index],
            };
            onDataPointClick(dataPoint);
        }
    }, [onDataPointClick, data.labels]);

    // Export chart as image
    const exportChart = useCallback(() => {
        if (chartRef.current) {
            const canvas = chartRef.current.canvas;
            const link = document.createElement('a');
            link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-chart.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }, [title]);

    // Refresh chart data
    const refreshChart = useCallback(() => {
        setIsLoading(true);
        // Simulate data refresh
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    // Preset options
    const presetOptions = [
        { value: 'financial', label: 'Financial', icon: TrendingUp },
        { value: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { value: 'analytics', label: 'Analytics', icon: Activity },
        { value: 'presentation', label: 'Presentation', icon: Sparkles },
    ];

    // Color scheme options
    const colorSchemeOptions = [
        { value: 'financial', label: 'Financial Hub' },
        { value: 'gradient', label: 'Gradient' },
        { value: 'pastel', label: 'Pastel' },
        { value: 'monochrome', label: 'Monochrome' },
        { value: 'vibrant', label: 'Vibrant' },
    ];

    // Animation options
    const animationOptions = [
        { value: 'fade', label: 'Fade' },
        { value: 'slide', label: 'Slide' },
        { value: 'bounce', label: 'Bounce' },
        { value: 'zoom', label: 'Zoom' },
        { value: 'flip', label: 'Flip' },
    ];

    return (
        <Card className={cn("glass-card overflow-hidden transition-all duration-300 hover:shadow-2xl", className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: themeClasses.primary + '20' }}>
                            {type === 'line' && <TrendingUp className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                            {type === 'bar' && <BarChart3 className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                            {type === 'doughnut' && <PieChart className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                            {type === 'area' && <Activity className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                            {type === 'radar' && <Target className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                            {type === 'scatter' && <Zap className="h-4 w-4" style={{ color: themeClasses.primary }} />}
                        </div>
                        <div>
                            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                            {description && (
                                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                            )}
                        </div>
                    </div>

                    {showControls && (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {type.toUpperCase()}
                            </Badge>
                            {exportable && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={exportChart}
                                    className="h-8 w-8 p-0"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            {refreshable && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={refreshChart}
                                    disabled={isLoading}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {showControls && (
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Preset:</span>
                            <Select value={currentPreset} onValueChange={(value: ChartPreset) => setCurrentPreset(value)}>
                                <SelectTrigger className="h-8 w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {presetOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <option.icon className="h-3 w-3" />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Colors:</span>
                            <Select value={currentColorScheme} onValueChange={(value: ColorScheme) => setCurrentColorScheme(value)}>
                                <SelectTrigger className="h-8 w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorSchemeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">Animation:</span>
                            <Select value={currentAnimation} onValueChange={(value: AnimationType) => setCurrentAnimation(value)}>
                                <SelectTrigger className="h-8 w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {animationOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-0">
                <div
                    className="relative"
                    style={{ height: `${height}px` }}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                            <div className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Refreshing data...</span>
                            </div>
                        </div>
                    )}

                    <Chart
                        ref={chartRef}
                        type={type}
                        data={getColoredData()}
                        options={{
                            ...getOptions(),
                            onClick: handleClick,
                        }}
                        style={{
                            background: 'transparent',
                        }}
                    />
                </div>
            </CardContent>
        </Card>
    );
} 