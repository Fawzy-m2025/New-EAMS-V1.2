import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import {
    Brain,
    Activity,
    Shield,
    AlertTriangle,
    Target,
    Lightbulb,
    TrendingUp,
    Settings,
    CheckCircle2,
    Clock,
    Zap,
    Sparkles,
    RefreshCw,
    BarChart,
    Wrench,
    ChevronRight,
    Home,
    Grid3X3,
    List,
    Table,
    Info,
    X,
    Check
} from 'lucide-react';

// Themed AI Assessment Card
interface ThemedAIAssessmentCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'hero';
    hover?: boolean;
    animated?: boolean;
}

export function ThemedAIAssessmentCard({
    children,
    className,
    variant = 'default',
    hover = true,
    animated = true
}: ThemedAIAssessmentCardProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getVariantClasses = () => {
        const baseClasses = 'relative overflow-hidden transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'hero':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border-0 shadow-2xl',
                    animated && 'animate-fade-in',
                    hover && 'hover:scale-[1.02] hover:shadow-3xl'
                );
            case 'glass':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border shadow-xl',
                    animated && 'animate-slide-up',
                    hover && 'hover:scale-105 hover:shadow-2xl'
                );
            case 'elevated':
                return cn(
                    baseClasses,
                    'shadow-lg border',
                    animated && 'animate-scale-in',
                    hover && 'hover:shadow-xl hover:-translate-y-1'
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'border-0 shadow-lg',
                    animated && 'animate-fade-in',
                    hover && 'hover:shadow-xl hover:scale-[1.02]'
                );
            default:
                return cn(
                    baseClasses,
                    'border',
                    animated && 'animate-fade-in',
                    hover && 'hover:shadow-md'
                );
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'hero':
                return {
                    background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted) / 0.5))',
                    borderColor: themeClasses.primary,
                    boxShadow: `0 0 32px ${themeClasses.primary}20`
                };
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: `hsl(var(--border))`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px hsl(var(--background) / 0.1)`
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                    color: 'white',
                };
            default:
                return {
                    background: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <Card
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </Card>
    );
}

// Enhanced Themed AI Metric Card with Status-Aware Features
interface ThemedAIMetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    variant?: 'health' | 'condition' | 'risk' | 'priority' | 'insights' | 'recommendations' | 'trends';
    progress?: number;
    confidence?: number;
    className?: string;
    status?: 'excellent' | 'good' | 'acceptable' | 'unacceptable' | 'critical';
    animated?: boolean;
    showStatusIndicator?: boolean;
    objective?: 'monitoring' | 'prediction' | 'maintenance' | 'optimization';
}

export function ThemedAIMetricCard({
    title,
    value,
    subtitle,
    icon,
    variant = 'health',
    progress,
    confidence,
    className,
    status,
    animated = true,
    showStatusIndicator = true,
    objective = 'monitoring'
}: ThemedAIMetricCardProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Enhanced status-aware styling
    const getStatusColor = () => {
        if (!status) return themeClasses.primary;

        switch (status) {
            case 'excellent': return '#10b981'; // emerald-500
            case 'good': return '#3b82f6'; // blue-500
            case 'acceptable': return '#f59e0b'; // amber-500
            case 'unacceptable': return '#ef4444'; // red-500
            case 'critical': return '#dc2626'; // red-600
            default: return themeClasses.primary;
        }
    };

    const getObjectiveIcon = () => {
        switch (objective) {
            case 'monitoring': return <Activity className="h-3 w-3" />;
            case 'prediction': return <TrendingUp className="h-3 w-3" />;
            case 'maintenance': return <Settings className="h-3 w-3" />;
            case 'optimization': return <Target className="h-3 w-3" />;
            default: return <Activity className="h-3 w-3" />;
        }
    };

    const getVariantStyles = () => {
        const statusColor = getStatusColor();

        switch (variant) {
            case 'health':
                return {
                    background: `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`,
                    borderColor: `${statusColor}33`,
                    color: 'white'
                };
            case 'condition':
                return {
                    background: status ? `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)` : themeClasses.gradient,
                    borderColor: `${statusColor}33`,
                    color: 'white'
                };
            case 'risk':
                return {
                    background: `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`,
                    borderColor: `${statusColor}33`,
                    color: 'white'
                };
            case 'priority':
                return {
                    background: `linear-gradient(135deg, ${statusColor}, ${statusColor}99)`,
                    borderColor: `${statusColor}33`,
                    color: 'white'
                };
            case 'insights':
            case 'recommendations':
            case 'trends':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                };
            default:
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    const getIconColor = () => {
        switch (variant) {
            case 'health':
            case 'condition':
            case 'risk':
            case 'priority':
                return 'text-white/80';
            case 'insights':
            case 'recommendations':
            case 'trends':
                return themeClasses.primary;
            default:
                return themeClasses.primary;
        }
    };

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-2xl p-6 shadow-xl hover:shadow-2xl border',
                animated ? 'transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform hover:scale-[1.02]' : '',
                className
            )}
            style={getVariantStyles()}
        >
            {/* Enhanced Decorative elements with status awareness */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8"></div>

            {/* Status indicator particles */}
            {showStatusIndicator && status && (
                <div className="absolute top-3 right-3 flex gap-1">
                    <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: getStatusColor() }}
                    ></div>
                    <div
                        className="w-1 h-1 rounded-full animate-ping"
                        style={{ backgroundColor: `${getStatusColor()}80` }}
                    ></div>
                </div>
            )}

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className={cn('h-8 w-8 transition-colors duration-1500', getIconColor())}>
                            {icon}
                        </div>
                        {objective && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs">
                                {getObjectiveIcon()}
                                <span className="capitalize">{objective}</span>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">
                            {value}
                            {variant === 'health' && <span className="text-lg opacity-75">/100</span>}
                        </div>
                        <div className="text-sm opacity-90 transition-colors duration-1500">{title}</div>
                    </div>
                </div>

                {/* Enhanced progress indicator with status colors */}
                {progress !== undefined && (
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2">
                            <div
                                className="rounded-full h-2 transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                style={{
                                    width: `${progress}%`,
                                    background: status ? `linear-gradient(90deg, ${getStatusColor()}, ${getStatusColor()}cc)` : 'white'
                                }}
                            ></div>
                        </div>
                        {confidence !== undefined && (
                            <span className="text-xs opacity-75">
                                {confidence}% confidence
                            </span>
                        )}
                    </div>
                )}

                {/* Enhanced subtitle with status information */}
                {subtitle && (
                    <div className="mt-3 space-y-1">
                        <div className="text-sm opacity-90 transition-colors duration-1500">
                            {subtitle}
                        </div>
                        {status && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: getStatusColor() }}
                                ></div>
                                <span className="text-xs font-medium capitalize opacity-80">
                                    {status} Status
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Themed AI Status Badge
interface ThemedAIStatusBadgeProps {
    status: string;
    variant?: 'condition' | 'risk' | 'priority' | 'insight' | 'recommendation';
    className?: string;
}

export function ThemedAIStatusBadge({
    status,
    variant = 'condition',
    className
}: ThemedAIStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (variant) {
            case 'condition':
                switch (status.toLowerCase()) {
                    case 'excellent':
                        return 'bg-green-500 text-white border-green-400/30';
                    case 'good':
                        return 'bg-blue-500 text-white border-blue-400/30';
                    case 'acceptable':
                        return 'bg-yellow-500 text-white border-yellow-400/30';
                    case 'unacceptable':
                    case 'critical':
                        return 'bg-red-500 text-white border-red-400/30';
                    default:
                        return 'bg-gray-500 text-white border-gray-400/30';
                }
            case 'risk':
                switch (status.toLowerCase()) {
                    case 'low':
                        return 'bg-green-500 text-white border-green-400/30';
                    case 'medium':
                        return 'bg-yellow-500 text-white border-yellow-400/30';
                    case 'high':
                    case 'critical':
                        return 'bg-red-500 text-white border-red-400/30';
                    default:
                        return 'bg-gray-500 text-white border-gray-400/30';
                }
            case 'priority':
                switch (status.toLowerCase()) {
                    case 'critical':
                    case 'urgent':
                        return 'bg-red-500 text-white border-red-400/30';
                    case 'high':
                        return 'bg-orange-500 text-white border-orange-400/30';
                    case 'medium':
                        return 'bg-yellow-500 text-white border-yellow-400/30';
                    case 'low':
                        return 'bg-green-500 text-white border-green-400/30';
                    default:
                        return 'bg-gray-500 text-white border-gray-400/30';
                }
            case 'insight':
                switch (status.toLowerCase()) {
                    case 'critical':
                        return 'bg-red-500 text-white border-red-400/30';
                    case 'warning':
                        return 'bg-yellow-500 text-white border-yellow-400/30';
                    case 'info':
                        return 'bg-blue-500 text-white border-blue-400/30';
                    case 'success':
                        return 'bg-green-500 text-white border-green-400/30';
                    default:
                        return 'bg-gray-500 text-white border-gray-400/30';
                }
            case 'recommendation':
                switch (status.toLowerCase()) {
                    case 'urgent':
                        return 'bg-red-500 text-white border-red-400/30';
                    case 'high':
                        return 'bg-orange-500 text-white border-orange-400/30';
                    case 'medium':
                        return 'bg-yellow-500 text-white border-yellow-400/30';
                    case 'low':
                        return 'bg-green-500 text-white border-green-400/30';
                    default:
                        return 'bg-gray-500 text-white border-gray-400/30';
                }
            default:
                return 'bg-gray-500 text-white border-gray-400/30';
        }
    };

    return (
        <Badge
            className={cn(
                'text-sm px-3 py-1 border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105',
                getStatusStyles(),
                className
            )}
        >
            {status.toUpperCase()}
        </Badge>
    );
}

// Themed AI Progress Bar
interface ThemedAIProgressBarProps {
    value: number;
    max?: number;
    label?: string;
    variant?: 'health' | 'confidence' | 'completion';
    className?: string;
}

export function ThemedAIProgressBar({
    value,
    max = 100,
    label,
    variant = 'health',
    className
}: ThemedAIProgressBarProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const percentage = Math.min((value / max) * 100, 100);

    const getVariantStyles = () => {
        switch (variant) {
            case 'health':
                return {
                    background: themeClasses.accent,
                    fill: themeClasses.gradient
                };
            case 'confidence':
                return {
                    background: themeClasses.accent,
                    fill: `linear-gradient(90deg, ${themeClasses.primary}, ${themeClasses.primary}dd)`
                };
            case 'completion':
                return {
                    background: themeClasses.accent,
                    fill: `linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.8))`
                };
            default:
                return {
                    background: themeClasses.accent,
                    fill: themeClasses.gradient
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground transition-colors duration-1500">{label}</span>
                    <span className="font-medium transition-colors duration-1500" style={{ color: themeClasses.primary }}>
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: styles.background }}>
                <div
                    className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    style={{
                        background: styles.fill,
                        width: `${percentage}%`
                    }}
                />
            </div>
        </div>
    );
}

// Themed AI Button
interface ThemedAIButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'gradient' | 'glass' | 'action';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}

export function ThemedAIButton({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className,
    onClick,
    disabled
}: ThemedAIButtonProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'primary':
                return cn(
                    baseClasses,
                    'bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg transform hover:scale-105'
                );
            case 'secondary':
                return cn(
                    baseClasses,
                    'bg-muted/20 hover:bg-muted/30 text-foreground border-border transform hover:scale-105'
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'text-white border-0 shadow-lg transform hover:scale-105',
                    'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90'
                );
            case 'glass':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border-0 shadow-lg transform hover:scale-105',
                    'bg-white/10 hover:bg-white/20 text-foreground border-white/20'
                );
            case 'action':
                return cn(
                    baseClasses,
                    'bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg transform hover:scale-105',
                    loading && 'animate-pulse'
                );
            default:
                return baseClasses;
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm';
            case 'lg':
                return 'px-6 py-3 text-lg';
            default:
                return 'px-4 py-2 text-sm';
        }
    };

    return (
        <Button
            variant="outline"
            size={size}
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(getVariantClasses(), getSizeClasses(), className)}
        >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {!loading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </Button>
    );
}

// Themed AI Header
interface ThemedAIHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    status?: {
        type: 'analyzing' | 'updated' | 'ready';
        message?: string;
        timestamp?: Date;
    };
    actions?: React.ReactNode;
    className?: string;
}

export function ThemedAIHeader({
    title,
    subtitle,
    icon = <Brain className="h-8 w-8" />,
    status,
    actions,
    className
}: ThemedAIHeaderProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    return (
        <CardHeader className={cn(
            'relative bg-gradient-to-br from-background to-muted/80 dark:from-background dark:to-muted/60 border-b border-border',
            className
        )}>
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-4 left-4 w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-8 w-1 h-1 bg-primary/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 left-1/3 w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></div>
            </div>

            <CardTitle className="relative flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-75 animate-pulse"></div>
                    <div className="relative p-3 bg-primary rounded-xl shadow-lg">
                        <div className="text-primary-foreground">
                            {icon}
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-foreground transition-colors duration-1500">
                            {title}
                        </h2>
                        <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                    </div>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground mt-1 font-medium transition-colors duration-1500">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Status Indicators */}
                {status && (
                    <div className="flex items-center gap-3">
                        {status.type === 'analyzing' && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-foreground">Analyzing...</span>
                            </div>
                        )}
                        {status.type === 'updated' && status.timestamp && (
                            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Updated: {status.timestamp.toLocaleTimeString()}
                            </Badge>
                        )}
                        {status.type === 'ready' && (
                            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-400/30 hover:bg-blue-500/30">
                                <Zap className="h-3 w-3 mr-1" />
                                Ready
                            </Badge>
                        )}
                    </div>
                )}
            </CardTitle>

            {/* Actions */}
            {actions && (
                <div className="flex items-center justify-between mt-6 p-4 bg-muted/20 rounded-xl backdrop-blur-sm border border-border">
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="h-4 w-4" />
                        <span>Powered by Advanced AI • 18hr/day Operation Optimized</span>
                    </div>
                </div>
            )}
        </CardHeader>
    );
}

// Themed AI Tabs Components
interface ThemedAITabsProps {
    children: React.ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    variant?: 'default' | 'modern' | 'glass' | 'gradient';
}

export function ThemedAITabs({
    children,
    defaultValue,
    value,
    onValueChange,
    className,
    variant = 'modern'
}: ThemedAITabsProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getVariantClasses = () => {
        switch (variant) {
            case 'modern':
                return 'w-full transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';
            case 'glass':
                return 'w-full backdrop-blur-xl transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';
            case 'gradient':
                return 'w-full transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';
            default:
                return 'w-full';
        }
    };

    return (
        <Tabs
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            className={cn(getVariantClasses(), className)}
        >
            {children}
        </Tabs>
    );
}

interface ThemedAITabsListProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'modern' | 'glass' | 'gradient';
    columns?: number;
}

export function ThemedAITabsList({
    children,
    className,
    variant = 'modern',
    columns = 7
}: ThemedAITabsListProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getVariantClasses = () => {
        const baseClasses = `grid w-full grid-cols-${columns} p-1 rounded-xl shadow-inner border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]`;

        switch (variant) {
            case 'modern':
                return cn(
                    baseClasses,
                    'bg-gradient-to-r from-slate-100 via-blue-100 to-purple-100 border-slate-200/50',
                    isDark && 'from-slate-800 via-blue-900/30 to-purple-900/30 border-slate-700/50'
                );
            case 'glass':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border-0'
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'border-0'
                );
            default:
                return cn(baseClasses, 'bg-muted border-border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${themeClasses.primary}10, ${themeClasses.primary}05)`,
                    borderColor: themeClasses.primary,
                };
            default:
                return {};
        }
    };

    return (
        <TabsList
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </TabsList>
    );
}

interface ThemedAITabsTriggerProps {
    children: React.ReactNode;
    value: string;
    className?: string;
    variant?: 'default' | 'modern' | 'glass' | 'gradient';
    icon?: React.ReactNode;
}

export function ThemedAITabsTrigger({
    children,
    value,
    className,
    variant = 'modern',
    icon
}: ThemedAITabsTriggerProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getVariantClasses = () => {
        const baseClasses = 'relative transition-all duration-300 rounded-lg';

        switch (variant) {
            case 'modern':
                return cn(
                    baseClasses,
                    'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg',
                    'hover:bg-white/50 hover:shadow-md',
                    isDark && 'hover:bg-slate-800/50'
                );
            case 'glass':
                return cn(
                    baseClasses,
                    'data-[state=active]:backdrop-blur-xl data-[state=active]:shadow-lg hover:backdrop-blur-sm'
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'data-[state=active]:shadow-lg hover:shadow-md'
                );
            default:
                return cn(
                    baseClasses,
                    'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
                );
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    '--active-bg': themeClasses.glassBg,
                    '--active-border': themeClasses.glassBorder,
                };
            case 'gradient':
                return {
                    '--active-bg': themeClasses.gradient,
                    '--active-color': 'white',
                };
            default:
                return {};
        }
    };

    return (
        <TabsTrigger
            value={value}
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            <div className="flex items-center gap-2">
                {icon}
                <span>{children}</span>
            </div>
        </TabsTrigger>
    );
}

interface ThemedAITabsContentProps {
    children: React.ReactNode;
    value: string;
    className?: string;
    variant?: 'default' | 'modern' | 'glass' | 'gradient';
}

export function ThemedAITabsContent({
    children,
    value,
    className,
    variant = 'modern'
}: ThemedAITabsContentProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getVariantClasses = () => {
        const baseClasses = 'transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'modern':
                return cn(baseClasses, 'p-6 space-y-8');
            case 'glass':
                return cn(baseClasses, 'p-6 space-y-8 backdrop-blur-sm');
            case 'gradient':
                return cn(baseClasses, 'p-6 space-y-8');
            default:
                return cn(baseClasses, 'mt-2');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: `${themeClasses.glassBg}50`,
                    borderRadius: '12px',
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${themeClasses.cardBg}, ${themeClasses.glassBg})`,
                    borderRadius: '12px',
                };
            default:
                return {};
        }
    };

    return (
        <TabsContent
            value={value}
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </TabsContent>
    );
}

// Themed AI Container Components
interface ThemedAIContainerProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'hero';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ThemedAIContainer({
    children,
    className,
    variant = 'default',
    padding = 'md'
}: ThemedAIContainerProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getPaddingClasses = () => {
        switch (padding) {
            case 'none': return '';
            case 'sm': return 'p-2';
            case 'md': return 'p-4';
            case 'lg': return 'p-6';
            case 'xl': return 'p-8';
            default: return 'p-4';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = 'relative overflow-hidden transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] rounded-xl';

        switch (variant) {
            case 'glass':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border shadow-xl hover:shadow-2xl',
                    getPaddingClasses()
                );
            case 'elevated':
                return cn(
                    baseClasses,
                    'border shadow-lg hover:shadow-xl hover:-translate-y-1',
                    getPaddingClasses()
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] text-white',
                    getPaddingClasses()
                );
            case 'hero':
                return cn(
                    baseClasses,
                    'border shadow-2xl hover:shadow-3xl',
                    getPaddingClasses()
                );
            default:
                return cn(
                    baseClasses,
                    'border hover:shadow-md',
                    getPaddingClasses()
                );
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                    backdropFilter: 'blur(20px)',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            case 'hero':
                return {
                    background: 'linear-gradient(135deg, hsl(var(--background)), hsl(var(--muted) / 0.5))',
                    borderColor: themeClasses.primary,
                    boxShadow: `0 0 32px ${themeClasses.primary}20`
                };
            default:
                return {
                    background: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </div>
    );
}

interface ThemedAISectionProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    collapsible?: boolean;
    defaultExpanded?: boolean;
}

export function ThemedAISection({
    children,
    title,
    subtitle,
    icon,
    className,
    variant = 'default',
    collapsible = false,
    defaultExpanded = true
}: ThemedAISectionProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const getVariantClasses = () => {
        const baseClasses = 'space-y-4 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'p-6 rounded-xl backdrop-blur-xl border');
            case 'elevated':
                return cn(baseClasses, 'p-6 rounded-xl border shadow-lg');
            case 'gradient':
                return cn(baseClasses, 'p-6 rounded-xl border-0 shadow-lg text-white');
            default:
                return cn(baseClasses, 'p-4');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--background))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {(title || subtitle) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div
                                className="p-2 rounded-lg transition-colors duration-1500"
                                style={{
                                    background: themeClasses.accent,
                                    color: themeClasses.primary
                                }}
                            >
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3
                                    className="text-lg font-semibold transition-colors duration-1500"
                                    style={{ color: variant === 'gradient' ? 'white' : themeClasses.primary }}
                                >
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p className="text-sm text-muted-foreground transition-colors duration-1500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {collapsible && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="transition-transform duration-300"
                            style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
            {(!collapsible || isExpanded) && (
                <div className="transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    {children}
                </div>
            )}
        </div>
    );
}

interface ThemedAIPanelProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    hover?: boolean;
}

export function ThemedAIPanel({
    children,
    className,
    variant = 'default',
    size = 'md',
    hover = true
}: ThemedAIPanelProps) {
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'p-3 rounded-lg';
            case 'md': return 'p-4 rounded-xl';
            case 'lg': return 'p-6 rounded-xl';
            case 'xl': return 'p-8 rounded-2xl';
            default: return 'p-4 rounded-xl';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = `relative overflow-hidden transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${getSizeClasses()}`;
        const hoverClasses = hover ? 'hover:shadow-lg hover:scale-[1.02]' : '';

        switch (variant) {
            case 'glass':
                return cn(
                    baseClasses,
                    'backdrop-blur-xl border shadow-md',
                    hoverClasses
                );
            case 'elevated':
                return cn(
                    baseClasses,
                    'border shadow-lg hover:shadow-xl',
                    hover && 'hover:-translate-y-1'
                );
            case 'gradient':
                return cn(
                    baseClasses,
                    'border-0 shadow-md text-white',
                    hoverClasses
                );
            case 'outline':
                return cn(
                    baseClasses,
                    'border-2 border-dashed',
                    hoverClasses
                );
            default:
                return cn(
                    baseClasses,
                    'border',
                    hoverClasses
                );
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                    backdropFilter: 'blur(20px)',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            case 'outline':
                return {
                    borderColor: themeClasses.primary,
                    background: `${themeClasses.primary}05`,
                };
            default:
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </div>
    );
}

// Themed AI Navigation Components
interface ThemedAIBreadcrumbProps {
    items: Array<{
        label: string;
        href?: string;
        icon?: React.ReactNode;
        current?: boolean;
    }>;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
}

export function ThemedAIBreadcrumb({
    items,
    className,
    variant = 'default'
}: ThemedAIBreadcrumbProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'flex items-center space-x-2 p-3 rounded-lg transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl border');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white');
            default:
                return cn(baseClasses, 'border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: themeClasses.cardBg,
                    borderColor: themeClasses.cardBorder,
                };
        }
    };

    return (
        <nav
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            <Home className="h-4 w-4 text-muted-foreground" />
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-1">
                        {item.icon}
                        <span
                            className={cn(
                                'text-sm transition-colors duration-1500',
                                item.current
                                    ? 'font-semibold'
                                    : 'text-muted-foreground hover:text-foreground cursor-pointer'
                            )}
                            style={item.current ? { color: themeClasses.primary } : {}}
                        >
                            {item.label}
                        </span>
                    </div>
                </React.Fragment>
            ))}
        </nav>
    );
}

interface ThemedAIStepsProps {
    steps: Array<{
        title: string;
        description?: string;
        icon?: React.ReactNode;
        status: 'completed' | 'current' | 'upcoming';
    }>;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
    orientation?: 'horizontal' | 'vertical';
}

export function ThemedAISteps({
    steps,
    className,
    variant = 'default',
    orientation = 'horizontal'
}: ThemedAIStepsProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getContainerClasses = () => {
        const baseClasses = 'transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        if (orientation === 'vertical') {
            return cn(baseClasses, 'space-y-4');
        }
        return cn(baseClasses, 'flex items-center justify-between');
    };

    const getStepClasses = (status: string) => {
        const baseClasses = 'flex items-center gap-3 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (status) {
            case 'completed':
                return cn(baseClasses, 'text-foreground');
            case 'current':
                return cn(baseClasses, 'font-semibold');
            case 'upcoming':
                return cn(baseClasses, 'text-muted-foreground');
            default:
                return baseClasses;
        }
    };

    const getStepIconClasses = (status: string) => {
        const baseClasses = 'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (status) {
            case 'completed':
                return cn(baseClasses, 'border-green-500 bg-green-500 text-white');
            case 'current':
                return cn(baseClasses, 'border-2');
            case 'upcoming':
                return cn(baseClasses, 'border-muted-foreground/30 bg-muted');
            default:
                return baseClasses;
        }
    };

    const getStepIconStyles = (status: string) => {
        switch (status) {
            case 'current':
                return {
                    borderColor: themeClasses.primary,
                    background: themeClasses.accent,
                    color: themeClasses.primary,
                };
            default:
                return {};
        }
    };

    return (
        <div className={cn(getContainerClasses(), className)}>
            {steps.map((step, index) => (
                <div key={index} className={getStepClasses(step.status)}>
                    <div
                        className={getStepIconClasses(step.status)}
                        style={getStepIconStyles(step.status)}
                    >
                        {step.status === 'completed' ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            step.icon || <span className="text-sm font-medium">{index + 1}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div
                            className="text-sm font-medium transition-colors duration-1500"
                            style={step.status === 'current' ? { color: themeClasses.primary } : {}}
                        >
                            {step.title}
                        </div>
                        {step.description && (
                            <div className="text-xs text-muted-foreground transition-colors duration-1500">
                                {step.description}
                            </div>
                        )}
                    </div>
                    {orientation === 'horizontal' && index < steps.length - 1 && (
                        <div
                            className="flex-1 h-px mx-4 transition-colors duration-1500"
                            style={{
                                background: step.status === 'completed'
                                    ? themeClasses.primary
                                    : 'hsl(var(--muted-foreground) / 0.3)'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

// Themed AI Data Display Components
interface ThemedAIGridProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    columns?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ThemedAIGrid({
    children,
    className,
    variant = 'default',
    columns = 3,
    gap = 'md'
}: ThemedAIGridProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getGapClasses = () => {
        switch (gap) {
            case 'sm': return 'gap-2';
            case 'md': return 'gap-4';
            case 'lg': return 'gap-6';
            case 'xl': return 'gap-8';
            default: return 'gap-4';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = `grid grid-cols-1 md:grid-cols-${columns} ${getGapClasses()} transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]`;

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'p-6 rounded-xl backdrop-blur-xl border');
            case 'elevated':
                return cn(baseClasses, 'p-6 rounded-xl border shadow-lg');
            case 'gradient':
                return cn(baseClasses, 'p-6 rounded-xl border-0 shadow-lg');
            default:
                return baseClasses;
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--background))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {children}
        </div>
    );
}

interface ThemedAIListProps {
    items: Array<{
        id: string;
        title: string;
        description?: string;
        icon?: React.ReactNode;
        badge?: string;
        action?: React.ReactNode;
        metadata?: Record<string, any>;
    }>;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    interactive?: boolean;
    onItemClick?: (item: any) => void;
}

export function ThemedAIList({
    items,
    className,
    variant = 'default',
    interactive = false,
    onItemClick
}: ThemedAIListProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'space-y-2 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'p-4 rounded-xl backdrop-blur-xl border');
            case 'elevated':
                return cn(baseClasses, 'p-4 rounded-xl border shadow-lg');
            case 'gradient':
                return cn(baseClasses, 'p-4 rounded-xl border-0 shadow-lg');
            default:
                return baseClasses;
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--background))',
                };
        }
    };

    const getItemClasses = () => {
        const baseClasses = 'flex items-center justify-between p-3 rounded-lg border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        if (interactive) {
            return cn(baseClasses, 'hover:shadow-md hover:scale-[1.02] cursor-pointer');
        }
        return baseClasses;
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {items.map((item) => (
                <div
                    key={item.id}
                    className={getItemClasses()}
                    style={{
                        background: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                    }}
                    onClick={() => interactive && onItemClick?.(item)}
                >
                    <div className="flex items-center gap-3 flex-1">
                        {item.icon && (
                            <div
                                className="p-2 rounded-lg transition-colors duration-1500"
                                style={{
                                    background: themeClasses.accent,
                                    color: themeClasses.primary,
                                }}
                            >
                                {item.icon}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="font-medium text-sm transition-colors duration-1500">
                                {item.title}
                            </div>
                            {item.description && (
                                <div className="text-xs text-muted-foreground transition-colors duration-1500">
                                    {item.description}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {item.badge && (
                            <Badge
                                className="text-xs transition-all duration-1500"
                                style={{
                                    background: themeClasses.badgePrimary,
                                    color: themeClasses.primary,
                                }}
                            >
                                {item.badge}
                            </Badge>
                        )}
                        {item.action}
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ThemedAITableProps {
    headers: string[];
    data: Array<Record<string, any>>;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    striped?: boolean;
    hoverable?: boolean;
}

export function ThemedAITable({
    headers,
    data,
    className,
    variant = 'default',
    striped = true,
    hoverable = true
}: ThemedAITableProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'w-full rounded-xl overflow-hidden transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl border');
            case 'elevated':
                return cn(baseClasses, 'border shadow-lg');
            case 'gradient':
                return cn(baseClasses, 'border-0 shadow-lg');
            default:
                return cn(baseClasses, 'border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            <table className="w-full">
                <thead>
                    <tr
                        className="border-b transition-colors duration-1500"
                        style={{
                            borderColor: 'hsl(var(--border))',
                            background: variant === 'gradient' ? 'rgba(255,255,255,0.1)' : 'hsl(var(--muted))',
                        }}
                    >
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="px-4 py-3 text-left text-sm font-semibold transition-colors duration-1500"
                                style={{
                                    color: variant === 'gradient' ? 'white' : themeClasses.primary,
                                }}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={cn(
                                'border-b transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
                                striped && rowIndex % 2 === 1 && 'bg-muted/30',
                                hoverable && 'hover:bg-muted/50 hover:scale-[1.01]'
                            )}
                            style={{
                                borderColor: 'hsl(var(--border))',
                            }}
                        >
                            {headers.map((header, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-4 py-3 text-sm transition-colors duration-1500"
                                    style={{
                                        color: variant === 'gradient' ? 'white' : 'hsl(var(--foreground))',
                                    }}
                                >
                                    {row[header.toLowerCase().replace(/\s+/g, '_')] || '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

interface ThemedAIChartProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    height?: string | number;
}

export function ThemedAIChart({
    children,
    title,
    subtitle,
    className,
    variant = 'default',
    height = 400
}: ThemedAIChartProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'p-6 rounded-xl transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl border');
            case 'elevated':
                return cn(baseClasses, 'border shadow-lg');
            case 'gradient':
                return cn(baseClasses, 'border-0 shadow-lg text-white');
            default:
                return cn(baseClasses, 'border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.8)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'elevated':
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <div
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3
                            className="text-lg font-semibold transition-colors duration-1500"
                            style={{
                                color: variant === 'gradient' ? 'white' : themeClasses.primary,
                            }}
                        >
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-muted-foreground transition-colors duration-1500">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}
            <div
                className="transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                style={{ height: typeof height === 'number' ? `${height}px` : height }}
            >
                {children}
            </div>
        </div>
    );
}

// Themed AI Form Components
interface ThemedAIInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'outline';
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export function ThemedAIInput({
    className,
    variant = 'default',
    label,
    error,
    icon,
    ...props
}: ThemedAIInputProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus:outline-none focus:ring-2 focus:ring-offset-2';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl bg-transparent');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white placeholder-white/70');
            case 'outline':
                return cn(baseClasses, 'border-2 bg-transparent');
            default:
                return cn(baseClasses, 'bg-background');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                    '--tw-ring-color': themeClasses.primary,
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${themeClasses.primary}20, ${themeClasses.primary}10)`,
                    '--tw-ring-color': 'white',
                };
            case 'outline':
                return {
                    borderColor: themeClasses.primary,
                    '--tw-ring-color': themeClasses.primary,
                };
            default:
                return {
                    borderColor: themeClasses.cardBorder,
                    '--tw-ring-color': themeClasses.primary,
                };
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label
                    className="text-sm font-medium transition-colors duration-1500"
                    style={{ color: variant === 'gradient' ? 'white' : themeClasses.primary }}
                >
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-1500"
                        style={{ color: themeClasses.primary }}
                    >
                        {icon}
                    </div>
                )}
                <Input
                    className={cn(getVariantClasses(), icon && 'pl-10', className)}
                    style={getVariantStyles()}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-destructive transition-colors duration-1500">
                    {error}
                </p>
            )}
        </div>
    );
}

interface ThemedAISelectProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'outline';
    label?: string;
    error?: string;
    placeholder?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}

export function ThemedAISelect({
    children,
    className,
    variant = 'default',
    label,
    error,
    placeholder,
    value,
    onValueChange
}: ThemedAISelectProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${themeClasses.primary}20, ${themeClasses.primary}10)`,
                    color: 'white',
                };
            case 'outline':
                return {
                    borderColor: themeClasses.primary,
                };
            default:
                return {
                    borderColor: themeClasses.cardBorder,
                };
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label
                    className="text-sm font-medium transition-colors duration-1500"
                    style={{ color: variant === 'gradient' ? 'white' : themeClasses.primary }}
                >
                    {label}
                </label>
            )}
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger
                    className={cn(
                        'transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
                        variant === 'glass' && 'backdrop-blur-xl',
                        variant === 'outline' && 'border-2',
                        className
                    )}
                    style={getVariantStyles()}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent
                    className="transition-all duration-300"
                    style={{
                        background: themeClasses.cardBg,
                        borderColor: themeClasses.cardBorder,
                    }}
                >
                    {children}
                </SelectContent>
            </Select>
            {error && (
                <p className="text-sm text-destructive transition-colors duration-1500">
                    {error}
                </p>
            )}
        </div>
    );
}

interface ThemedAITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'outline';
    label?: string;
    error?: string;
}

export function ThemedAITextarea({
    className,
    variant = 'default',
    label,
    error,
    ...props
}: ThemedAITextareaProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'w-full px-3 py-2 rounded-lg border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus:outline-none focus:ring-2 focus:ring-offset-2 resize-none';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl bg-transparent');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white placeholder-white/70');
            case 'outline':
                return cn(baseClasses, 'border-2 bg-transparent');
            default:
                return cn(baseClasses, 'bg-background');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                    '--tw-ring-color': themeClasses.primary,
                };
            case 'gradient':
                return {
                    background: `linear-gradient(135deg, ${themeClasses.primary}20, ${themeClasses.primary}10)`,
                    '--tw-ring-color': 'white',
                };
            case 'outline':
                return {
                    borderColor: themeClasses.primary,
                    '--tw-ring-color': themeClasses.primary,
                };
            default:
                return {
                    borderColor: themeClasses.cardBorder,
                    '--tw-ring-color': themeClasses.primary,
                };
        }
    };

    return (
        <div className="space-y-2">
            {label && (
                <label
                    className="text-sm font-medium transition-colors duration-1500"
                    style={{ color: variant === 'gradient' ? 'white' : themeClasses.primary }}
                >
                    {label}
                </label>
            )}
            <Textarea
                className={cn(getVariantClasses(), className)}
                style={getVariantStyles()}
                {...props}
            />
            {error && (
                <p className="text-sm text-destructive transition-colors duration-1500">
                    {error}
                </p>
            )}
        </div>
    );
}

interface ThemedAICheckboxProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'outline';
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}

export function ThemedAICheckbox({
    children,
    className,
    variant = 'default',
    checked,
    onCheckedChange,
    disabled
}: ThemedAICheckboxProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getCheckboxStyles = (checked: boolean) => {
        switch (variant) {
            case 'glass':
                return {
                    background: checked ? themeClasses.primary : 'hsl(var(--background) / 0.8)',
                    borderColor: checked ? themeClasses.primary : 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: checked ? themeClasses.gradient : 'transparent',
                    borderColor: checked ? 'transparent' : themeClasses.primary,
                };
            case 'outline':
                return {
                    background: checked ? themeClasses.primary : 'transparent',
                    borderColor: themeClasses.primary,
                };
            default:
                return {
                    background: checked ? themeClasses.primary : 'hsl(var(--background))',
                    borderColor: checked ? themeClasses.primary : 'hsl(var(--border))',
                };
        }
    };

    return (
        <div
            className={cn(
                'flex items-center space-x-2 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <Checkbox
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
                className={cn(
                    'transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
                    variant === 'glass' && 'backdrop-blur-xl',
                    variant === 'outline' && 'border-2'
                )}
                style={getCheckboxStyles(checked || false)}
            />
            <label
                className={cn(
                    'text-sm font-medium transition-colors duration-1500 cursor-pointer',
                    disabled && 'cursor-not-allowed'
                )}
                style={{ color: variant === 'gradient' ? 'white' : 'hsl(var(--foreground))' }}
            >
                {children}
            </label>
        </div>
    );
}

// Themed AI Feedback Components
interface ThemedAIAlertProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'destructive' | 'warning' | 'success';
    title?: string;
    icon?: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
}

export function ThemedAIAlert({
    children,
    className,
    variant = 'default',
    title,
    icon,
    dismissible = false,
    onDismiss
}: ThemedAIAlertProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    const getVariantClasses = () => {
        const baseClasses = 'relative p-4 rounded-xl border transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white');
            case 'destructive':
                return cn(baseClasses, 'border-destructive/50 bg-destructive/10 text-destructive');
            case 'warning':
                return cn(baseClasses, 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400');
            case 'success':
                return cn(baseClasses, 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400');
            default:
                return cn(baseClasses, 'bg-card');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: themeClasses.glassBg,
                    borderColor: themeClasses.glassBorder,
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    borderColor: themeClasses.cardBorder,
                };
        }
    };

    return (
        <Alert
            className={cn(getVariantClasses(), className)}
            style={getVariantStyles()}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                    {icon && (
                        <div className="mt-0.5 transition-colors duration-1500">
                            {icon}
                        </div>
                    )}
                    <div className="flex-1">
                        {title && (
                            <h4 className="font-semibold mb-1 transition-colors duration-1500">
                                {title}
                            </h4>
                        )}
                        <AlertDescription className="transition-colors duration-1500">
                            {children}
                        </AlertDescription>
                    </div>
                </div>
                {dismissible && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                        className="h-6 w-6 p-0 transition-all duration-300 hover:scale-110"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </Alert>
    );
}

interface ThemedAIModalProps {
    children: React.ReactNode;
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient' | 'fullscreen';
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function ThemedAIModal({
    children,
    isOpen,
    onClose,
    title,
    subtitle,
    className,
    variant = 'default',
    size = 'md'
}: ThemedAIModalProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

    if (!isOpen) return null;

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'max-w-md';
            case 'md': return 'max-w-lg';
            case 'lg': return 'max-w-2xl';
            case 'xl': return 'max-w-4xl';
            case '2xl': return 'max-w-6xl';
            default: return 'max-w-lg';
        }
    };

    const getVariantClasses = () => {
        const baseClasses = `relative w-full mx-4 rounded-2xl shadow-2xl transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${getSizeClasses()}`;

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl border');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white');
            case 'fullscreen':
                return 'w-full h-full rounded-none';
            default:
                return cn(baseClasses, 'bg-card border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.95)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(getVariantClasses(), className)}
                style={getVariantStyles()}
            >
                {/* Header */}
                {(title || subtitle) && (
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div>
                            {title && (
                                <h2
                                    className="text-xl font-semibold transition-colors duration-1500"
                                    style={{
                                        color: variant === 'gradient' ? 'white' : themeClasses.primary,
                                    }}
                                >
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p className="text-sm text-muted-foreground transition-colors duration-1500">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 transition-all duration-300 hover:scale-110"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

interface ThemedAITooltipProps {
    children: React.ReactNode;
    content: string | React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'gradient';
    side?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
}

export function ThemedAITooltip({
    children,
    content,
    className,
    variant = 'default',
    side = 'top',
    delay = 200
}: ThemedAITooltipProps) {
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();
    const [isVisible, setIsVisible] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        const id = setTimeout(() => setIsVisible(true), delay);
        setTimeoutId(id);
    };

    const hideTooltip = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
        }
        setIsVisible(false);
    };

    const getVariantClasses = () => {
        const baseClasses = 'absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] pointer-events-none';

        switch (variant) {
            case 'glass':
                return cn(baseClasses, 'backdrop-blur-xl border');
            case 'gradient':
                return cn(baseClasses, 'border-0 text-white');
            default:
                return cn(baseClasses, 'bg-card border');
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'glass':
                return {
                    background: 'hsl(var(--background) / 0.95)',
                    borderColor: 'hsl(var(--border))',
                };
            case 'gradient':
                return {
                    background: themeClasses.gradient,
                };
            default:
                return {
                    background: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                };
        }
    };

    const getPositionClasses = () => {
        switch (side) {
            case 'top':
                return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
            case 'right':
                return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
            case 'bottom':
                return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
            case 'left':
                return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
            default:
                return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
        }
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {isVisible && (
                <div
                    className={cn(
                        getVariantClasses(),
                        getPositionClasses(),
                        'animate-in fade-in-0 zoom-in-95',
                        className
                    )}
                    style={getVariantStyles()}
                >
                    {content}
                </div>
            )}
        </div>
    );
}



