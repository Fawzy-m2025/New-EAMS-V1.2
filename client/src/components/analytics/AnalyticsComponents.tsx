/**
 * Professional Analytics UI Components for Enhanced Vibration Form
 * Provides comprehensive failure analysis visualization with modern design
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    AlertOctagon,
    Info,
    TrendingUp,
    TrendingDown,
    Activity,
    Zap,
    Cog,
    Target,
    Wrench,
    Droplets,
    Waves,
    Radio,
    Building,
    Scale,
    Gauge,
    ChevronRight
} from 'lucide-react';
import { FailureAnalysis, MasterHealthAssessment } from '@/utils/failureAnalysisEngine';

// Icon mapping for failure types
const FAILURE_ICONS = {
    'Unbalance': Scale,
    'Misalignment': Target,
    'Soft Foot': Building,
    'Bearing Defects': Cog,
    'Mechanical Looseness': Wrench,
    'Cavitation': Droplets,
    'Electrical Faults': Zap,
    'Flow Turbulence': Waves,
    'Resonance': Radio
};

// Severity icons
const SEVERITY_ICONS = {
    'Good': CheckCircle,
    'Moderate': AlertTriangle,
    'Severe': XCircle,
    'Critical': AlertOctagon
};

interface SeverityIndicatorProps {
    severity: 'Good' | 'Moderate' | 'Severe' | 'Critical';
    size?: 'sm' | 'md' | 'lg';
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({ severity, size = 'md' }) => {
    const Icon = SEVERITY_ICONS[severity];
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const colorClasses = {
        Good: 'text-green-600',
        Moderate: 'text-yellow-600',
        Severe: 'text-red-600',
        Critical: 'text-red-800'
    };

    return (
        <div className="flex items-center gap-2">
            <Icon className={`${sizeClasses[size]} ${colorClasses[severity]}`} />
            <Badge className={getSeverityBadgeColor(severity)}>
                {severity}
            </Badge>
        </div>
    );
};

interface ProgressBarWithLabelProps {
    value: number;
    label: string;
    color?: string;
    showPercentage?: boolean;
}

export const ProgressBarWithLabel: React.FC<ProgressBarWithLabelProps> = ({
    value,
    label,
    color = 'bg-blue-500',
    showPercentage = true
}) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                {showPercentage && (
                    <span className="text-sm text-gray-500">{value.toFixed(1)}%</span>
                )}
            </div>
            <Progress value={value} className="h-2" />
        </div>
    );
};

interface FailureAnalysisCardProps {
    analysis: FailureAnalysis;
    expanded?: boolean;
    onToggleExpand?: () => void;
    isActive?: boolean;
    autoRotate?: boolean;
    cardIndex?: number;
    totalCards?: number;
}

interface FailureAnalysisCarouselProps {
    analyses: FailureAnalysis[];
    autoRotate?: boolean;
}

export const FailureAnalysisCarousel: React.FC<FailureAnalysisCarouselProps> = ({
    analyses,
    autoRotate = true
}) => {
    const [currentSlide, setCurrentSlide] = React.useState(0);
    const [isAutoPlay, setIsAutoPlay] = React.useState(autoRotate);
    const [expandedCards, setExpandedCards] = React.useState<Set<number>>(new Set());
    const autoPlayRef = React.useRef<NodeJS.Timeout | null>(null);

    // Auto-rotation effect (5.5s per card) matching CinematicKPICarousel
    React.useEffect(() => {
        if (!isAutoPlay || analyses.length <= 1) return;
        
        autoPlayRef.current = setInterval(() => {
            setCurrentSlide(prev => {
                const next = (prev + 1) % analyses.length;
                console.log(`🔄 Auto-rotating from slide ${prev} to ${next}`);
                return next;
            });
        }, 5500);

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        };
    }, [isAutoPlay, analyses.length]);

    const handleToggleExpand = (index: number) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Pause/resume on hover/touch
    const handlePause = React.useCallback(() => {
        console.log('🚫 Auto-play paused');
        setIsAutoPlay(false);
    }, []);
    
    const handleResume = React.useCallback(() => {
        if (autoRotate) {
            console.log('▶️ Auto-play resumed');
            setIsAutoPlay(true);
        }
    }, [autoRotate]);

    const handleManualSlideChange = (index: number) => {
        console.log(`👆 Manual slide change to ${index}`);
        setCurrentSlide(index);
        setIsAutoPlay(false); // Pause auto-play when user manually changes slide
    };

    const toggleAutoPlay = () => {
        const newAutoPlay = !isAutoPlay;
        console.log(`🎮 Auto-play toggled: ${newAutoPlay}`);
        setIsAutoPlay(newAutoPlay);
    };

    if (!analyses || analyses.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No failure analysis data available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Control Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">Failure Mode Analysis</h3>
                    <p className="text-sm text-muted-foreground">AI-powered equipment diagnostics</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleAutoPlay}
                        className="px-3 py-1 text-xs font-medium bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-all duration-300"
                    >
                        {isAutoPlay ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block mr-2" />
                                Auto-Play
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-gray-400 rounded-full inline-block mr-2" />
                                Manual
                            </>
                        )}
                    </button>
                    <Badge className="bg-white/20 text-primary">
                        {currentSlide + 1} / {analyses.length}
                    </Badge>
                </div>
            </div>

            {/* Cards Container */}
            <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                onMouseEnter={handlePause}
                onMouseLeave={handleResume}
                onTouchStart={handlePause}
                onTouchEnd={handleResume}
            >
                {analyses.map((analysis, index) => (
                    <FailureAnalysisCard
                        key={`${analysis.type}-${index}`}
                        analysis={analysis}
                        expanded={expandedCards.has(index)}
                        onToggleExpand={() => handleToggleExpand(index)}
                        isActive={index === currentSlide}
                        autoRotate={isAutoPlay}
                        cardIndex={index}
                        totalCards={analyses.length}
                    />
                ))}
            </div>

            {/* Slide indicators */}
            <div className="flex justify-center gap-2 mt-4" aria-label="Failure analysis slide indicators">
                {analyses.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleManualSlideChange(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentSlide 
                                ? 'bg-primary w-6' 
                                : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentSlide ? 'true' : 'false'}
                    />
                ))}
            </div>
        </div>
    );
};

export const FailureAnalysisCard: React.FC<FailureAnalysisCardProps> = ({
    analysis,
    expanded = false,
    onToggleExpand,
    isActive = true,
    autoRotate = true,
    cardIndex = 0,
    totalCards = 1
}) => {
    const FailureIcon = FAILURE_ICONS[analysis.type] || Activity;
    
    // Use the same glass card class as CinematicKPICarousel for consistency
    const glassCardClass = "bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 shadow-md hover:shadow-xl transition-all duration-300 ease-in-out";
    
    // Cinematic styling with auto-rotation effects matching CinematicKPICarousel
    const cinematicStyle = {
        transform: isActive ? 'scale(1.05)' : 'scale(0.98)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border 0.3s ease-in-out',
        boxShadow: isActive 
            ? '0 8px 25px -8px var(--theme-primary, rgba(59, 130, 246, 0.15)), 0 0 20px 5px var(--theme-primary, rgba(59, 130, 246, 0.1))' 
            : '0 4px 10px -4px var(--theme-primary, rgba(59, 130, 246, 0.05))'
    };

    return (
        <Card 
            className={
                isActive
                    ? `${glassCardClass} text-card-foreground border-2 border-primary/60 shadow-xl ring-1 ring-primary/60`
                    : `${glassCardClass} ${getSeverityCardColor(analysis.severity)} text-muted-foreground border border-primary/20 hover:border-primary/40 shadow-md`
            }
            style={cinematicStyle}
        >
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div 
                            className={`w-10 h-10 flex items-center justify-center rounded-full shadow ${getStatusIconBg(analysis.severity)}`}
                            style={{ 
                                opacity: isActive ? 1 : 0.6, 
                                transform: isActive ? 'scale(1)' : 'scale(0.95)', 
                                transition: 'opacity 0.4s ease-in-out 0.1s, transform 0.4s ease-in-out 0.1s' 
                            }}
                        >
                            <FailureIcon className="h-5 w-5" />
                        </div>
                        <div style={{ 
                            opacity: isActive ? 1 : 0.7, 
                            transform: isActive ? 'translateY(0)' : 'translateY(5px)', 
                            transition: 'opacity 0.4s ease-in-out 0.2s, transform 0.4s ease-in-out 0.2s' 
                        }}>
                            <h3 className="text-lg font-semibold text-card-foreground" style={{ backdropFilter: 'blur(4px)' }}>
                                {analysis.type}
                            </h3>
                            <p className="text-sm text-muted-foreground" style={{ backdropFilter: 'blur(4px)' }}>
                                Index: {analysis.index.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <div style={{ 
                        opacity: isActive ? 1 : 0.7, 
                        transform: isActive ? 'scale(1)' : 'scale(0.95)', 
                        transition: 'opacity 0.4s ease-in-out 0.2s, transform 0.4s ease-in-out 0.2s' 
                    }}>
                        <SeverityIndicator severity={analysis.severity} />
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar with Cinematic Styling and Auto-rotation */}
                <div className="space-y-2" style={{ 
                    opacity: isActive ? 1 : 0.6, 
                    transform: isActive ? 'translateY(0)' : 'translateY(5px)', 
                    transition: 'opacity 0.4s ease-in-out 0.3s, transform 0.4s ease-in-out 0.3s' 
                }}>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-card-foreground">Severity Level</span>
                        <span className="text-sm text-muted-foreground">{analysis.progress.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-background/30 rounded-full overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500 ease-out" 
                            style={{ 
                                width: isActive ? `${analysis.progress}%` : `${analysis.progress * 0.3}%`,
                                transition: 'width 0.8s ease-out 0.7s'
                            }}
                        ></div>
                    </div>
                </div>

                {/* Description with Glass Effect and Animation */}
                <div 
                    className="bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/10 rounded-lg p-3"
                    style={{ 
                        opacity: isActive ? 1 : 0.6, 
                        transform: isActive ? 'translateY(0)' : 'translateY(5px)', 
                        transition: 'opacity 0.4s ease-in-out 0.4s, transform 0.4s ease-in-out 0.4s' 
                    }}
                >
                    <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-card-foreground">{analysis.description}</p>
                    </div>
                </div>

                {/* Threshold Information with Theme Colors and Staggered Animation */}
                <div 
                    className="grid grid-cols-3 gap-2 text-xs"
                    style={{ 
                        opacity: isActive ? 1 : 0.6, 
                        transform: isActive ? 'translateX(0)' : 'translateX(-10px)', 
                        transition: 'opacity 0.5s ease-in-out 0.6s, transform 0.5s ease-in-out 0.6s' 
                    }}
                >
                    <div 
                        className="text-center p-2 bg-green-500/20 border border-green-500/30 rounded-lg backdrop-blur-sm"
                        style={{ 
                            opacity: isActive ? 1 : 0.6, 
                            transform: isActive ? 'scale(1)' : 'scale(0.95)', 
                            transition: 'opacity 0.3s ease-in-out 0.7s, transform 0.3s ease-in-out 0.7s' 
                        }}
                    >
                        <div className="font-semibold text-green-300">Good</div>
                        <div className="text-green-400">≤ {analysis.threshold.good}</div>
                    </div>
                    <div 
                        className="text-center p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg backdrop-blur-sm"
                        style={{ 
                            opacity: isActive ? 1 : 0.6, 
                            transform: isActive ? 'scale(1)' : 'scale(0.95)', 
                            transition: 'opacity 0.3s ease-in-out 0.8s, transform 0.3s ease-in-out 0.8s' 
                        }}
                    >
                        <div className="font-semibold text-yellow-300">Moderate</div>
                        <div className="text-yellow-400">≤ {analysis.threshold.moderate}</div>
                    </div>
                    <div 
                        className="text-center p-2 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm"
                        style={{ 
                            opacity: isActive ? 1 : 0.6, 
                            transform: isActive ? 'scale(1)' : 'scale(0.95)', 
                            transition: 'opacity 0.3s ease-in-out 0.9s, transform 0.3s ease-in-out 0.9s' 
                        }}
                    >
                        <div className="font-semibold text-red-300">Severe</div>
                        <div className="text-red-400">{'>'} {analysis.threshold.severe}</div>
                    </div>
                </div>

                {/* Expandable Details with Cinematic Animation */}
                {expanded && (
                    <div className="space-y-4 pt-4 border-t border-primary/20 animate-in slide-in-from-top-2 duration-300">
                        {/* Root Causes */}
                        <div className="bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3">
                            <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Root Causes
                            </h4>
                            <ul className="space-y-2 text-sm">
                                {analysis.rootCauses.map((cause, index) => (
                                    <li key={index} className="flex items-start gap-2 text-card-foreground">
                                        <span className="text-red-400 mt-1">•</span>
                                        <span>{cause}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Toggle Button with Cinematic Theme Styling */}
                <button
                    onClick={onToggleExpand}
                    className="w-full mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 hover:border-primary/40 transition-all duration-300 backdrop-blur-sm"
                    style={{ 
                        opacity: isActive ? 1 : 0.7, 
                        transform: isActive ? 'translateY(0)' : 'translateY(5px)', 
                        transition: 'opacity 0.5s ease-in-out 0.8s, transform 0.5s ease-in-out 0.8s, background 0.3s ease-in-out, border 0.3s ease-in-out' 
                    }}
                >
                    {expanded ? (
                        <span className="flex items-center justify-center gap-2">
                            <span>Show Less</span>
                            <ChevronRight 
                                className="h-4 w-4 rotate-90 transition-transform duration-300" 
                                style={{ 
                                    transform: isActive ? 'translateY(0) scale(1) rotate(90deg)' : 'translateY(3px) scale(0.95) rotate(90deg)', 
                                    transition: 'transform 0.3s ease-in-out 0.8s' 
                                }} 
                            />
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>Show Details</span>
                            <ChevronRight 
                                className="h-4 w-4 transition-transform duration-300" 
                                style={{ 
                                    transform: isActive ? 'translateY(0) scale(1)' : 'translateY(3px) scale(0.95)', 
                                    transition: 'transform 0.3s ease-in-out 0.8s' 
                                }} 
                            />
                        </span>
                    )}
                </button>
            </CardContent>
        </Card>
    );
};

interface MasterHealthDashboardProps {
    healthAssessment: MasterHealthAssessment;
}

export const MasterHealthDashboard: React.FC<MasterHealthDashboardProps> = ({ healthAssessment }) => {
    const getHealthTrend = () => {
        if (healthAssessment.overallHealthScore >= 85) return { icon: TrendingUp, color: 'text-green-300' };
        if (healthAssessment.overallHealthScore >= 70) return { icon: Activity, color: 'text-yellow-300' };
        return { icon: TrendingDown, color: 'text-red-300' };
    };

    const { icon: TrendIcon, color: trendColor } = getHealthTrend();
    
    // Use glass card class for consistency
    const glassCardClass = "bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm border border-primary/20 shadow-lg";

    return (
        <Card className={`${glassCardClass} bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30`}>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 border border-primary/30 rounded-lg backdrop-blur-sm">
                        <Gauge className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-card-foreground">Master Health Assessment</h2>
                        <p className="text-sm text-muted-foreground">Comprehensive Equipment Analysis</p>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Health Score Display with Glass Effect */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/20 rounded-lg shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
                            <span className="text-sm font-medium text-card-foreground">Health Score</span>
                        </div>
                        <div className="text-3xl font-bold text-orange-400 dark:text-orange-300 tracking-tight" style={{ textShadow: '0 0 8px rgba(255, 149, 0, 0.6)' }}>
                            {healthAssessment.overallHealthScore.toFixed(1)}%
                        </div>
                        <Badge className={getHealthGradeBadgeColor(healthAssessment.healthGrade)}>
                            Grade {healthAssessment.healthGrade}
                        </Badge>
                    </div>

                    <div className="text-center p-4 bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/20 rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-card-foreground mb-2">Master Fault Index</div>
                        <div className="text-2xl font-bold text-card-foreground">
                            {healthAssessment.masterFaultIndex.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">Composite Risk Factor</div>
                    </div>

                    <div className="text-center p-4 bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/20 rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-card-foreground mb-2">Critical Issues</div>
                        <div className="text-2xl font-bold text-red-400">
                            {healthAssessment.criticalFailures.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Require Attention</div>
                    </div>

                    <div className="text-center p-4 bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/20 rounded-lg shadow-sm">
                        <div className="text-sm font-medium text-card-foreground mb-2">Availability</div>
                        <div className="text-2xl font-bold text-green-400">
                            {healthAssessment.reliabilityMetrics?.availability.toFixed(1) || '99.0'}%
                        </div>
                        <div className="text-xs text-muted-foreground">System Uptime</div>
                    </div>
                </div>

                {/* AI-Powered Insights Section */}
                {healthAssessment.aiPoweredInsights && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            AI-Powered Condition Assessment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-purple-600 mb-1">Predicted Failure</div>
                                <div className="font-semibold text-purple-800">
                                    {healthAssessment.aiPoweredInsights.predictedFailureMode}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-purple-600 mb-1">Time to Failure</div>
                                <div className="font-semibold text-purple-800">
                                    {healthAssessment.aiPoweredInsights.timeToFailure} days
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-purple-600 mb-1">Confidence</div>
                                <div className="font-semibold text-purple-800">
                                    {healthAssessment.aiPoweredInsights.confidenceLevel.toFixed(0)}%
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-purple-600 mb-1">Urgency</div>
                                <Badge className={getUrgencyBadgeColor(healthAssessment.aiPoweredInsights.maintenanceUrgency)}>
                                    {healthAssessment.aiPoweredInsights.maintenanceUrgency}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reliability Metrics Section */}
                {healthAssessment.reliabilityMetrics && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <Gauge className="h-4 w-4" />
                            Reliability Engineering Metrics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-sm text-green-600 mb-1">MTBF</div>
                                <div className="font-semibold text-green-800">
                                    {healthAssessment.reliabilityMetrics.mtbf.toLocaleString()} hrs
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-green-600 mb-1">MTTR</div>
                                <div className="font-semibold text-green-800">
                                    {healthAssessment.reliabilityMetrics.mttr} hrs
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-green-600 mb-1">Availability</div>
                                <div className="font-semibold text-green-800">
                                    {healthAssessment.reliabilityMetrics.availability.toFixed(2)}%
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-green-600 mb-1">Risk Level</div>
                                <Badge className={getRiskLevelBadgeColor(healthAssessment.reliabilityMetrics.riskLevel)}>
                                    {healthAssessment.reliabilityMetrics.riskLevel}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}

                {/* Health Score Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Overall Equipment Health</span>
                        <span className="text-sm text-gray-500">{healthAssessment.overallHealthScore.toFixed(1)}%</span>
                    </div>
                    <Progress value={healthAssessment.overallHealthScore} className="h-3" />
                </div>

                {/* Critical Failures Alert */}
                {healthAssessment.criticalFailures.length > 0 && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertOctagon className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <strong>Critical Issues Detected:</strong> {healthAssessment.criticalFailures.join(', ')}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Recommendations */}
                <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Recommendations
                    </h4>
                    <div className="space-y-2">
                        {healthAssessment.recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                                <span className="text-blue-500 mt-1">•</span>
                                <span className="text-sm">{recommendation}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

// Utility functions
function getStatusIconBg(severity: string) {
    switch (severity) {
        case 'Good': return 'bg-green-500/20 text-green-300 border border-green-500/30';
        case 'Moderate': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
        case 'Severe': return 'bg-red-500/20 text-red-300 border border-red-500/30';
        case 'Critical': return 'bg-red-600/20 text-red-200 border border-red-600/30';
        default: return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
}

function getSeverityBadgeColor(severity: string): string {
    switch (severity) {
        case 'Good': return 'bg-green-100 text-green-800 border-green-200';
        case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Severe': return 'bg-red-100 text-red-800 border-red-200';
        case 'Critical': return 'bg-red-200 text-red-900 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function getSeverityCardColor(severity: string): string {
    switch (severity) {
        case 'Good': return 'border-green-200 bg-green-50/30';
        case 'Moderate': return 'border-yellow-200 bg-yellow-50/30';
        case 'Severe': return 'border-red-200 bg-red-50/30';
        case 'Critical': return 'border-red-300 bg-red-100/30';
        default: return 'border-gray-200 bg-gray-50/30';
    }
}

function getHealthGradeBadgeColor(grade: string): string {
    switch (grade) {
        case 'A': return 'bg-green-100 text-green-800 border-green-200';
        case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'F': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function getUrgencyBadgeColor(urgency: string): string {
    switch (urgency) {
        case 'Low': return 'bg-green-100 text-green-800 border-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'Immediate': return 'bg-red-200 text-red-900 border-red-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}

function getRiskLevelBadgeColor(riskLevel: string): string {
    switch (riskLevel) {
        case 'Low': return 'bg-green-100 text-green-800 border-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}
