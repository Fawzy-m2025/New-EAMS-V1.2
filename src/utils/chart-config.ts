import {
    Chart as ChartJS,
} from 'chart.js';
import { useTheme } from '@/hooks/use-theme';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { FINANCIAL_HUB_COLORS } from './color-utils';

// Financial Hub Color Palette for charts
export const CHART_COLORS = {
    primary: FINANCIAL_HUB_COLORS.indigo,
    secondary: FINANCIAL_HUB_COLORS.cyan,
    accent: FINANCIAL_HUB_COLORS.gold,
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    teal: FINANCIAL_HUB_COLORS.teal,
    paleGreen: FINANCIAL_HUB_COLORS.paleGreen,
    lightYellow: FINANCIAL_HUB_COLORS.lightYellow,
    dark: FINANCIAL_HUB_COLORS.dark,
};

// Gradient configurations
export const createGradients = (ctx: CanvasRenderingContext2D, colors: string[]) => {
    const gradients = colors.map((color, index) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${color}80`);
        gradient.addColorStop(1, `${color}20`);
        return gradient;
    });
    return gradients;
};

// Professional chart options with theme integration
export const getChartOptions = (
    type: 'line' | 'bar' | 'area' | 'doughnut' | 'pie' | 'radar' | 'scatter',
    isDark: boolean = false
) => {
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: isDark ? '#e5e7eb' : '#374151',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        weight: '500',
                    },
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                },
            },
            title: {
                display: false,
                color: isDark ? '#f9fafb' : '#111827',
                font: {
                    family: 'Inter, sans-serif',
                    size: 16,
                    weight: '600',
                },
            },
            tooltip: {
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: isDark ? '#f9fafb' : '#111827',
                bodyColor: isDark ? '#d1d5db' : '#374151',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: true,
                usePointStyle: true,
                padding: 12,
                titleFont: {
                    family: 'Inter, sans-serif',
                    size: 14,
                    weight: '600',
                },
                bodyFont: {
                    family: 'Inter, sans-serif',
                    size: 13,
                    weight: '500',
                },
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== undefined) {
                            label += new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }).format(context.parsed.y);
                        }
                        return label;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 11,
                        weight: '500',
                    },
                },
            },
            y: {
                grid: {
                    color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                },
                ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 11,
                        weight: '500',
                    },
                    callback: function (value: any) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(value);
                    },
                },
            },
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 6,
                borderWidth: 2,
                borderColor: isDark ? '#1f2937' : '#ffffff',
            },
            line: {
                tension: 0.4,
                borderWidth: 3,
            },
            bar: {
                borderRadius: 6,
                borderSkipped: false,
            },
        },
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart',
        },
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
    };

    // Type-specific customizations
    switch (type) {
        case 'area':
            return {
                ...baseOptions,
                elements: {
                    ...baseOptions.elements,
                    line: {
                        ...baseOptions.elements.line,
                        fill: true,
                    },
                },
            };
        case 'doughnut':
        case 'pie':
            return {
                ...baseOptions,
                cutout: type === 'doughnut' ? '60%' : '0%',
                plugins: {
                    ...baseOptions.plugins,
                    legend: {
                        ...baseOptions.plugins.legend,
                        position: 'bottom' as const,
                    },
                },
            };
        case 'radar':
            return {
                ...baseOptions,
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)',
                        },
                        pointLabels: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11,
                                weight: '500',
                            },
                        },
                        ticks: {
                            color: isDark ? '#9ca3af' : '#6b7280',
                            backdropColor: 'transparent',
                        },
                    },
                },
            };
        default:
            return baseOptions;
    }
};

// Creative and dynamic color schemes
export const getColorScheme = (scheme: 'financial' | 'gradient' | 'pastel' | 'monochrome' | 'vibrant') => {
    switch (scheme) {
        case 'financial':
            return [
                CHART_COLORS.primary,
                CHART_COLORS.secondary,
                CHART_COLORS.accent,
                CHART_COLORS.teal,
                CHART_COLORS.success,
                CHART_COLORS.warning,
                CHART_COLORS.danger,
            ];
        case 'gradient':
            return [
                '#667eea',
                '#764ba2',
                '#f093fb',
                '#f5576c',
                '#4facfe',
                '#00f2fe',
                '#43e97b',
            ];
        case 'pastel':
            return [
                '#ff9a9e',
                '#fecfef',
                '#fecfef',
                '#a8edea',
                '#fed6e3',
                '#ffecd2',
                '#fcb69f',
            ];
        case 'monochrome':
            return [
                '#1f2937',
                '#374151',
                '#4b5563',
                '#6b7280',
                '#9ca3af',
                '#d1d5db',
                '#e5e7eb',
            ];
        case 'vibrant':
            return [
                '#ff6b6b',
                '#4ecdc4',
                '#45b7d1',
                '#96ceb4',
                '#ffeaa7',
                '#dda0dd',
                '#98d8c8',
            ];
        default:
            return getColorScheme('financial');
    }
};

// Dynamic animation configurations
export const getAnimationConfig = (type: 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip') => {
    const baseConfig = {
        duration: 1500,
        delay: 0,
    };

    switch (type) {
        case 'fade':
            return {
                ...baseConfig,
                easing: 'easeInOutQuart',
            };
        case 'slide':
            return {
                ...baseConfig,
                easing: 'easeOutBounce',
            };
        case 'bounce':
            return {
                ...baseConfig,
                easing: 'easeOutElastic',
            };
        case 'zoom':
            return {
                ...baseConfig,
                easing: 'easeOutExpo',
            };
        case 'flip':
            return {
                ...baseConfig,
                easing: 'easeInOutBack',
            };
        default:
            return baseConfig;
    }
};

// Professional chart presets
export const getChartPreset = (preset: 'financial' | 'dashboard' | 'analytics' | 'presentation') => {
    switch (preset) {
        case 'financial':
            return {
                colorScheme: 'financial',
                animation: 'fade',
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            };
        case 'dashboard':
            return {
                colorScheme: 'gradient',
                animation: 'slide',
                options: {
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            };
        case 'analytics':
            return {
                colorScheme: 'monochrome',
                animation: 'zoom',
                options: {
                    plugins: {
                        legend: {
                            position: 'right',
                        },
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false,
                    },
                },
            };
        case 'presentation':
            return {
                colorScheme: 'vibrant',
                animation: 'bounce',
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20,
                            },
                        },
                    },
                    elements: {
                        point: {
                            radius: 6,
                            hoverRadius: 8,
                        },
                    },
                },
            };
        default:
            return getChartPreset('financial');
    }
};

// Utility functions for dynamic chart updates
export const updateChartTheme = (chart: ChartJS, isDark: boolean) => {
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)';

    // Update legend colors if legend exists
    if (chart.options.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = textColor;
    }

    // Update scales based on chart type
    if (chart.options.scales) {
        // Handle Cartesian charts (line, bar, area, scatter)
        if (chart.options.scales.x && chart.options.scales.y) {
            if (chart.options.scales.x.grid) {
                chart.options.scales.x.grid.color = gridColor;
            }
            if (chart.options.scales.y.grid) {
                chart.options.scales.y.grid.color = gridColor;
            }
            if (chart.options.scales.x.ticks) {
                chart.options.scales.x.ticks.color = textColor;
            }
            if (chart.options.scales.y.ticks) {
                chart.options.scales.y.ticks.color = textColor;
            }
        }

        // Handle radar charts
        if (chart.options.scales.r) {
            if (chart.options.scales.r.grid) {
                chart.options.scales.r.grid.color = gridColor;
            }
            if (chart.options.scales.r.ticks) {
                chart.options.scales.r.ticks.color = textColor;
            }
            if (chart.options.scales.r.pointLabels) {
                chart.options.scales.r.pointLabels.color = textColor;
            }
        }
    }

    chart.update('none');
};

export const addChartInteractivity = (chart: ChartJS) => {
    // Add hover effects
    chart.options.onHover = (event, elements) => {
        const canvas = chart.canvas;
        canvas.style.cursor = elements.length ? 'pointer' : 'default';
    };

    // Add click handlers
    chart.options.onClick = (event, elements) => {
        if (elements.length > 0) {
            const element = elements[0];
            console.log('Clicked on:', element);
            // Add custom click handling here
        }
    };
};

// Export types for better TypeScript support
export type ChartType = 'line' | 'bar' | 'area' | 'doughnut' | 'pie' | 'radar' | 'scatter';
export type ColorScheme = 'financial' | 'gradient' | 'pastel' | 'monochrome' | 'vibrant';
export type AnimationType = 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip';
export type ChartPreset = 'financial' | 'dashboard' | 'analytics' | 'presentation'; 