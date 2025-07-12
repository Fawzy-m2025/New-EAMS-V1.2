/**
 * Enhanced Failure Analysis Carousel Component
 * Provides cinematic auto-rotating carousel for failure analysis cards with smooth animations
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    ChevronRight,
    PlayCircle,
    PauseCircle,
    RotateCcw,
    Grid3X3,
    LayoutGrid,
    Eye,
    X,
    CheckCircle2,
    AlertCircle,
    Shield,
    Search,
    Filter,
    RotateCcw as Reset,
    Sliders
} from 'lucide-react';
import { FailureAnalysis } from '@/utils/failureAnalysisEngine';
import useEmblaCarousel from 'embla-carousel-react';
import { glassCardClass } from '@/components/ui/card';

interface EnhancedFailureAnalysisCarouselProps {
    analyses: FailureAnalysis[];
    autoRotationInterval?: number;
    showControls?: boolean;
    className?: string;
}

// Failure type to icon mapping
const FAILURE_ICONS: Record<string, React.ElementType> = {
    'Unbalance': Scale,
    'Misalignment': Target,
    'Soft Foot': Building,
    'Bearing Defects': Radio,
    'Mechanical Looseness': Wrench,
    'Cavitation': Droplets,
    'Electrical Faults': Zap,
    'Flow Turbulence': Waves,
    'Resonance': Activity,
    'Motor Unbalance': Scale,
    'Motor Misalignment': Target,
    'Motor Soft Foot': Building,
    'Motor Bearing Defects': Radio,
    'Motor Mechanical Looseness': Wrench,
    'Motor Cavitation': Droplets,
    'Motor Electrical Faults': Zap,
    'Motor Flow Turbulence': Waves,
    'Motor Resonance': Activity,
    'Pump Unbalance': Scale,
    'Pump Misalignment': Target,
    'Pump Soft Foot': Building,
    'Pump Bearing Defects': Radio,
    'Pump Mechanical Looseness': Wrench,
    'Pump Cavitation': Droplets,
    'Pump Electrical Faults': Zap,
    'Pump Flow Turbulence': Waves,
    'Pump Resonance': Activity,
    'System Unbalance': Scale,
    'System Misalignment': Target,
    'System Soft Foot': Building,
    'System Bearing Defects': Radio,
    'System Mechanical Looseness': Wrench,
    'System Cavitation': Droplets,
    'System Electrical Faults': Zap,
    'System Flow Turbulence': Waves,
    'System Resonance': Activity
};

// Severity-based styling
function getSeverityCardColor(severity: string): string {
    switch (severity) {
        case 'Good': return 'border-green-500/30 bg-green-500/5';
        case 'Moderate': return 'border-yellow-500/30 bg-yellow-500/5';
        case 'Severe': return 'border-orange-500/30 bg-orange-500/5';
        case 'Critical': return 'border-red-500/30 bg-red-500/5';
        default: return 'border-gray-500/30 bg-gray-500/5';
    }
}

function getStatusIconBg(severity: string): string {
    switch (severity) {
        case 'Good': return 'bg-green-500/20 text-green-600';
        case 'Moderate': return 'bg-yellow-500/20 text-yellow-600';
        case 'Severe': return 'bg-orange-500/20 text-orange-600';
        case 'Critical': return 'bg-red-500/20 text-red-600';
        default: return 'bg-gray-400/20 text-gray-600';
    }
}

function getSeverityProgress(severity: string): number {
    switch (severity) {
        case 'Good': return 25;
        case 'Moderate': return 50;
        case 'Severe': return 75;
        case 'Critical': return 100;
        default: return 0;
    }
}

export function EnhancedFailureAnalysisCarousel({
    analyses,
    autoRotationInterval = 6000,
    showControls = true,
    className = ""
}: EnhancedFailureAnalysisCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'carousel' | 'table'>('carousel');
    const [selectedAnalysis, setSelectedAnalysis] = useState<FailureAnalysis | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [progressAnimations, setProgressAnimations] = useState<{ [key: string]: number }>({});

    // Advanced filtering state
    const [filters, setFilters] = useState({
        severityLevels: [] as string[],
        progressRange: { min: 0, max: 100 },
        failureTypes: [] as string[],
        searchText: '',
        weightRange: { min: 0, max: 1 },
        priorityLevels: [] as string[]
    });
    const [isFilterWidgetOpen, setIsFilterWidgetOpen] = useState(false);

    // Failure type weights from failureAnalysisEngine.ts
    const FAILURE_WEIGHTS = {
        'Unbalance': 0.15,
        'Misalignment': 0.15,
        'Bearing Defects': 0.20,
        'Mechanical Looseness': 0.12,
        'Cavitation': 0.10,
        'Soft Foot': 0.08,
        'Electrical Faults': 0.10,
        'Flow Turbulence': 0.05,
        'Resonance': 0.05
    };

    // Get priority level based on weight
    const getPriorityLevel = (failureType: string): string => {
        const weight = FAILURE_WEIGHTS[failureType as keyof typeof FAILURE_WEIGHTS] || 0.05;
        if (weight >= 0.15) return 'Critical';
        if (weight >= 0.10) return 'High';
        if (weight >= 0.08) return 'Medium';
        return 'Low';
    };

    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Embla carousel setup - configured for center alignment
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        slidesToScroll: 1,
        align: 'center', // Center the active card
        containScroll: 'trimSnaps',
        skipSnaps: false,
        dragFree: false,
    });

    // Update currentSlide in response to Embla's select event
    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => {
            setCurrentSlide(emblaApi.selectedScrollSnap());
        };
        emblaApi.on('select', onSelect);
        setCurrentSlide(emblaApi.selectedScrollSnap());
        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    // Auto-rotation effect
    useEffect(() => {
        if (!isAutoPlay || !emblaApi || analyses.length <= 1) return;
        autoPlayRef.current = setInterval(() => {
            emblaApi.scrollNext();
        }, autoRotationInterval);
        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlay, emblaApi, autoRotationInterval, analyses.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (document.activeElement && emblaApi) {
                if (event.key === 'ArrowLeft') {
                    emblaApi.scrollPrev();
                } else if (event.key === 'ArrowRight') {
                    emblaApi.scrollNext();
                } else if (event.key === ' ' || event.key === 'Enter') {
                    event.preventDefault();
                    setIsAutoPlay((prev) => !prev);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [emblaApi]);

    // Pause/resume handlers
    const handlePause = useCallback(() => setIsAutoPlay(false), []);
    const handleResume = useCallback(() => setIsAutoPlay(true), []);

    // Toggle card expansion
    const handleToggleExpand = useCallback((index: number) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    // Handle showing details modal
    const handleShowDetails = useCallback((analysis: FailureAnalysis) => {
        setSelectedAnalysis(analysis);
        setIsDetailsModalOpen(true);
    }, []);

    // Handle closing details modal
    const handleCloseDetails = useCallback(() => {
        setIsDetailsModalOpen(false);
        setSelectedAnalysis(null);
    }, []);

    // Filter analyses based on current filter criteria
    const filteredAnalyses = useMemo(() => {
        return analyses.filter(analysis => {
            // Severity filter
            if (filters.severityLevels.length > 0 && !filters.severityLevels.includes(analysis.severity)) {
                return false;
            }

            // Progress range filter
            if (analysis.progress < filters.progressRange.min || analysis.progress > filters.progressRange.max) {
                return false;
            }

            // Failure type filter
            if (filters.failureTypes.length > 0 && !filters.failureTypes.includes(analysis.type)) {
                return false;
            }

            // Weight range filter
            const weight = FAILURE_WEIGHTS[analysis.type as keyof typeof FAILURE_WEIGHTS] || 0.05;
            if (weight < filters.weightRange.min || weight > filters.weightRange.max) {
                return false;
            }

            // Priority level filter
            if (filters.priorityLevels.length > 0) {
                const priority = getPriorityLevel(analysis.type);
                if (!filters.priorityLevels.includes(priority)) {
                    return false;
                }
            }

            // Search text filter
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                const matchesType = analysis.type.toLowerCase().includes(searchLower);
                const matchesDescription = analysis.description.toLowerCase().includes(searchLower);
                const priority = getPriorityLevel(analysis.type);
                const matchesPriority = priority.toLowerCase().includes(searchLower);
                if (!matchesType && !matchesDescription && !matchesPriority) {
                    return false;
                }
            }

            return true;
        });
    }, [analyses, filters]);

    // Get unique values for filter options
    const filterOptions = useMemo(() => {
        const severityLevels = Array.from(new Set(analyses.map(a => a.severity)));
        const failureTypes = Array.from(new Set(analyses.map(a => a.type)));
        const priorityLevels = Array.from(new Set(analyses.map(a => getPriorityLevel(a.type))));
        const weightRange = {
            min: Math.min(...analyses.map(a => FAILURE_WEIGHTS[a.type as keyof typeof FAILURE_WEIGHTS] || 0.05)),
            max: Math.max(...analyses.map(a => FAILURE_WEIGHTS[a.type as keyof typeof FAILURE_WEIGHTS] || 0.05))
        };
        return { severityLevels, failureTypes, priorityLevels, weightRange };
    }, [analyses]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilters({
            severityLevels: [],
            progressRange: { min: 0, max: 100 },
            failureTypes: [],
            searchText: '',
            weightRange: { min: 0, max: 1 },
            priorityLevels: []
        });
    }, []);

    // Update specific filter
    const updateFilter = useCallback((filterType: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    }, []);

    // Enhanced progress bar animations with sophisticated timing
    useEffect(() => {
        if (viewMode === 'table') {
            const timeouts: NodeJS.Timeout[] = [];

            // Reset all animations first
            setProgressAnimations({});

            filteredAnalyses.forEach((analysis, index) => {
                const timeout = setTimeout(() => {
                    setProgressAnimations(prev => ({
                        ...prev,
                        [analysis.type]: analysis.progress
                    }));
                }, 300 + (index * 150)); // Initial delay + staggered timing (150ms between each)
                timeouts.push(timeout);
            });

            return () => {
                timeouts.forEach(timeout => clearTimeout(timeout));
            };
        } else {
            // Reset animations when leaving table view
            setProgressAnimations({});
        }
    }, [viewMode, filteredAnalyses]);

    if (!analyses || analyses.length === 0) {
        return (
            <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No failure analysis data available</p>
            </div>
        );
    }

    // Enhanced Wide Filter Popover Component
    const CompactFilterWidget = () => (
        <div className="w-[580px] max-w-[95vw] min-w-[380px] bg-gradient-to-br from-white/98 via-white/95 to-white/90 dark:from-zinc-900/98 dark:via-zinc-900/95 dark:to-zinc-900/90 backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
            {/* Professional Container with Enhanced Styling */}
            <div className="relative">

                {/* Professional Header with Enhanced Styling */}
                <div className="bg-gradient-to-r from-primary/8 via-primary/4 to-transparent border-b border-primary/15 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-primary/25 via-primary/20 to-primary/15 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/25">
                                <Filter className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Advanced Filters</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                    <p className="text-sm text-muted-foreground">
                                        {filteredAnalyses.length} of {analyses.length} results
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFilterWidgetOpen(false)}
                            className="h-9 w-9 p-0 rounded-lg hover:bg-primary/15 hover:scale-105 transition-all duration-200 group"
                        >
                            <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </div>
                </div>

                {/* Enhanced Content Area with Optimized Layout */}
                <div className="p-6 space-y-5">

                    {/* Enhanced Search Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-blue-500/25 to-blue-600/25 rounded-lg flex items-center justify-center shadow-sm">
                                <Search className="h-4 w-4 text-blue-500" />
                            </div>
                            <h3 className="font-semibold text-foreground">Search & Discovery</h3>
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                            <Input
                                placeholder="Search failure types, descriptions, priorities..."
                                value={filters.searchText}
                                onChange={(e) => updateFilter('searchText', e.target.value)}
                                className="pl-10 pr-10 h-10 bg-background/80 border border-primary/25 focus:border-primary/50 rounded-lg text-foreground placeholder:text-muted-foreground/70 shadow-sm focus:shadow-md transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                            />
                            {filters.searchText && (
                                <button
                                    type="button"
                                    onClick={() => updateFilter('searchText', '')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Multi-Column Categorical Filters */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Severity Level Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-red-500/25 to-orange-500/25 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                </div>
                                <label className="text-sm font-semibold text-foreground">Severity Levels</label>
                                {filters.severityLevels.length > 0 && (
                                    <Badge className="h-5 px-2 text-xs bg-red-500/20 text-red-300 border border-red-500/30">
                                        {filters.severityLevels.length}
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {filterOptions.severityLevels.map(severity => (
                                    <button
                                        key={severity}
                                        type="button"
                                        onClick={() => {
                                            const newSeverityLevels = filters.severityLevels.includes(severity)
                                                ? filters.severityLevels.filter(s => s !== severity)
                                                : [...filters.severityLevels, severity];
                                            updateFilter('severityLevels', newSeverityLevels);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border hover:scale-105 active:scale-95 ${filters.severityLevels.includes(severity)
                                            ? severity === 'Good'
                                                ? 'bg-green-500/20 text-green-300 border-green-500/40 shadow-sm shadow-green-500/20'
                                                : severity === 'Moderate'
                                                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/20'
                                                    : severity === 'Severe'
                                                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/20'
                                                        : 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20'
                                            : 'bg-background/50 text-muted-foreground border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${severity === 'Good' ? 'bg-green-400' :
                                                severity === 'Moderate' ? 'bg-yellow-400' :
                                                    severity === 'Severe' ? 'bg-orange-400' : 'bg-red-400'
                                                }`} />
                                            {severity}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Priority Level Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-500/25 to-pink-500/25 rounded-lg flex items-center justify-center">
                                    <Sliders className="h-3 w-3 text-purple-500" />
                                </div>
                                <label className="text-sm font-semibold text-foreground">Priority Levels</label>
                                {filters.priorityLevels.length > 0 && (
                                    <Badge className="h-5 px-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {filters.priorityLevels.length}
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {filterOptions.priorityLevels.map(priority => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => {
                                            const newPriorityLevels = filters.priorityLevels.includes(priority)
                                                ? filters.priorityLevels.filter(p => p !== priority)
                                                : [...filters.priorityLevels, priority];
                                            updateFilter('priorityLevels', newPriorityLevels);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 border hover:scale-105 active:scale-95 ${filters.priorityLevels.includes(priority)
                                            ? priority === 'Critical'
                                                ? 'bg-red-500/20 text-red-300 border-red-500/40 shadow-sm shadow-red-500/20'
                                                : priority === 'High'
                                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm shadow-orange-500/20'
                                                    : priority === 'Medium'
                                                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-sm shadow-yellow-500/20'
                                                        : 'bg-green-500/20 text-green-300 border-green-500/40 shadow-sm shadow-green-500/20'
                                            : 'bg-background/50 text-muted-foreground border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${priority === 'Critical' ? 'bg-red-400' :
                                                priority === 'High' ? 'bg-orange-400' :
                                                    priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'
                                                }`} />
                                            {priority}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Compact Range Filters */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Progress Range Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-500/25 to-emerald-500/25 rounded-lg flex items-center justify-center">
                                    <Activity className="h-3 w-3 text-green-500" />
                                </div>
                                <label className="text-sm font-semibold text-foreground">Progress Range</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Min %</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.progressRange.min}
                                        onChange={(e) => updateFilter('progressRange', {
                                            ...filters.progressRange,
                                            min: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                                        })}
                                        className="h-8 bg-background/80 border border-primary/25 focus:border-primary/50 rounded-lg text-sm"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Max %</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={filters.progressRange.max}
                                        onChange={(e) => updateFilter('progressRange', {
                                            ...filters.progressRange,
                                            max: Math.max(0, Math.min(100, parseInt(e.target.value) || 100))
                                        })}
                                        className="h-8 bg-background/80 border border-primary/25 focus:border-primary/50 rounded-lg text-sm"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Weight Range Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-amber-500/25 to-yellow-500/25 rounded-lg flex items-center justify-center">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                </div>
                                <label className="text-sm font-semibold text-foreground">Weight Range</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        step="0.01"
                                        value={filters.weightRange.min}
                                        onChange={(e) => updateFilter('weightRange', {
                                            ...filters.weightRange,
                                            min: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0))
                                        })}
                                        className="h-8 bg-background/80 border border-primary/25 focus:border-primary/50 rounded-lg text-sm"
                                        min="0"
                                        max="1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                                    <Input
                                        type="number"
                                        placeholder="1.00"
                                        step="0.01"
                                        value={filters.weightRange.max}
                                        onChange={(e) => updateFilter('weightRange', {
                                            ...filters.weightRange,
                                            max: Math.max(0, Math.min(1, parseFloat(e.target.value) || 1))
                                        })}
                                        className="h-8 bg-background/80 border border-primary/25 focus:border-primary/50 rounded-lg text-sm"
                                        min="0"
                                        max="1"
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Failure importance in calculations
                            </div>
                        </div>
                    </div>

                    {/* Failure Type Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground/80">Failure Types</label>
                        <Select
                            value={filters.failureTypes.length > 0 ? filters.failureTypes[0] : ""}
                            onValueChange={(value) => {
                                if (value && !filters.failureTypes.includes(value)) {
                                    updateFilter('failureTypes', [...filters.failureTypes, value]);
                                }
                            }}
                        >
                            <SelectTrigger className="h-9 bg-background/50 border-primary/20 focus:border-primary/40">
                                <SelectValue placeholder="Select types..." />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.failureTypes.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {filters.failureTypes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {filters.failureTypes.map(type => (
                                    <span
                                        key={type}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                                    >
                                        {type}
                                        <button
                                            type="button"
                                            onClick={() => updateFilter('failureTypes', filters.failureTypes.filter(t => t !== type))}
                                            className="hover:text-primary/70"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>


                </div>

                {/* Professional Floating Action Area */}
                {/* Enhanced Professional Action Area */}
                <div className="bg-gradient-to-t from-primary/5 via-primary/2 to-transparent border-t border-primary/15 p-6">
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearAllFilters}
                            className="flex-1 gap-2 h-10 bg-background/80 border border-primary/25 hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 group"
                        >
                            <Reset className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                            <span className="font-medium">Clear All</span>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setIsFilterWidgetOpen(false)}
                            className="flex-1 gap-2 h-10 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <span className="font-medium">Apply Filters</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        </Button>
                    </div>

                    {/* Filter Summary */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            {(filters.severityLevels.length + filters.failureTypes.length + filters.priorityLevels.length +
                                (filters.searchText ? 1 : 0) +
                                (filters.progressRange.min > 0 || filters.progressRange.max < 100 ? 1 : 0) +
                                (filters.weightRange.min > 0 || filters.weightRange.max < 1 ? 1 : 0)) > 0
                                ? `${filters.severityLevels.length + filters.failureTypes.length + filters.priorityLevels.length +
                                (filters.searchText ? 1 : 0) +
                                (filters.progressRange.min > 0 || filters.progressRange.max < 100 ? 1 : 0) +
                                (filters.weightRange.min > 0 || filters.weightRange.max < 1 ? 1 : 0)} active filters • ${filteredAnalyses.length} results`
                                : 'No filters applied • All results shown'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Enhanced Table View Component with Enterprise-Grade Styling
    const TableView = () => (
        <div className="w-full">
            <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-zinc-900/20 dark:via-zinc-900/10 dark:to-transparent backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
                {/* Modern Header with Compact Filter Button */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Failure Analysis Overview
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {filteredAnalyses.length} analysis results with real-time progress tracking
                            </p>
                        </div>

                        {/* Compact Filter Controls */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">
                                Showing {filteredAnalyses.length} of {analyses.length} results
                            </span>

                            {/* Filter Icon Button with Popover */}
                            <Popover open={isFilterWidgetOpen} onOpenChange={setIsFilterWidgetOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className={`gap-2 transition-all duration-300 hover:scale-105 active:scale-95 ${(filters.severityLevels.length > 0 ||
                                            filters.failureTypes.length > 0 ||
                                            filters.priorityLevels.length > 0 ||
                                            filters.searchText ||
                                            filters.progressRange.min > 0 ||
                                            filters.progressRange.max < 100 ||
                                            filters.weightRange.min > 0 ||
                                            filters.weightRange.max < 1)
                                            ? 'bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/20 ring-2 ring-primary/20'
                                            : 'bg-background/80 border-primary/25 hover:bg-primary/10 hover:border-primary/40 hover:shadow-md'
                                            }`}
                                    >
                                        <Filter className="h-4 w-4" />
                                        <span className="hidden sm:inline">Filters</span>
                                        <span className="sm:hidden">Filter</span>
                                        {(filters.severityLevels.length > 0 ||
                                            filters.failureTypes.length > 0 ||
                                            filters.priorityLevels.length > 0 ||
                                            filters.searchText ||
                                            filters.progressRange.min > 0 ||
                                            filters.progressRange.max < 100 ||
                                            filters.weightRange.min > 0 ||
                                            filters.weightRange.max < 1) && (
                                                <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground shadow-sm">
                                                    {filters.severityLevels.length + filters.failureTypes.length + filters.priorityLevels.length +
                                                        (filters.searchText ? 1 : 0) +
                                                        (filters.progressRange.min > 0 || filters.progressRange.max < 100 ? 1 : 0) +
                                                        (filters.weightRange.min > 0 || filters.weightRange.max < 1 ? 1 : 0)}
                                                </Badge>
                                            )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="p-0 border-0 shadow-none bg-transparent w-auto"
                                    align="center"
                                    alignOffset={0}
                                    sideOffset={16}
                                    avoidCollisions={true}
                                    collisionPadding={24}
                                    sticky="always"
                                >
                                    <CompactFilterWidget />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* Enhanced Table Container */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        {/* Sophisticated Header */}
                        <thead>
                            <tr className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10">
                                <th className="text-left py-4 px-6 font-semibold text-foreground/90 text-sm tracking-wide">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                                        Failure Type
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground/90 text-sm tracking-wide">
                                    Severity Level
                                </th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground/90 text-sm tracking-wide">
                                    Progress Analysis
                                </th>
                                <th className="text-left py-4 px-6 font-semibold text-foreground/90 text-sm tracking-wide">
                                    Description
                                </th>
                                <th className="text-right py-4 px-6 font-semibold text-foreground/90 text-sm tracking-wide">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        {/* Enhanced Table Body */}
                        <tbody>
                            {filteredAnalyses.map((analysis, index) => {
                                const Icon = FAILURE_ICONS[analysis.type] || Activity;
                                const animatedProgress = progressAnimations[analysis.type] || 0;

                                return (
                                    <tr
                                        key={`table-${analysis.type}-${index}`}
                                        className="group border-b border-primary/5 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 ease-out hover:shadow-lg hover:shadow-primary/5"
                                        style={{
                                            animationDelay: `${index * 100}ms`
                                        }}
                                    >
                                        {/* Failure Type Cell with Enhanced Icon */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    w-12 h-12 flex items-center justify-center rounded-xl
                                                    ${getStatusIconBg(analysis.severity)}
                                                    shadow-lg group-hover:scale-110 transition-transform duration-300 ease-out
                                                    ring-2 ring-white/10 group-hover:ring-primary/30
                                                `}>
                                                    <Icon className="w-5 h-5 drop-shadow-sm" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                                                        {analysis.type}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Index: {analysis.index}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Enhanced Severity Badge */}
                                        <td className="py-4 px-6">
                                            <div className={`
                                                inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                                                shadow-lg backdrop-blur-sm border transition-all duration-300 group-hover:scale-105
                                                ${analysis.severity === 'Good'
                                                    ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-500/30 shadow-green-500/20'
                                                    : analysis.severity === 'Moderate'
                                                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-500/30 shadow-yellow-500/20'
                                                        : analysis.severity === 'Severe'
                                                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-500/30 shadow-orange-500/20'
                                                            : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-500/30 shadow-red-500/20'
                                                }
                                            `}>
                                                <div className={`w-2 h-2 rounded-full ${analysis.severity === 'Good' ? 'bg-green-400' :
                                                    analysis.severity === 'Moderate' ? 'bg-yellow-400' :
                                                        analysis.severity === 'Severe' ? 'bg-orange-400' : 'bg-red-400'
                                                    } animate-pulse`}></div>
                                                {analysis.severity}
                                            </div>
                                        </td>

                                        {/* Animated Progress Cell */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Progress</span>
                                                        <span className="text-sm font-bold text-foreground">{analysis.progress.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gradient-to-r from-background/30 to-background/10 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full rounded-full shadow-lg ${analysis.severity === 'Good'
                                                                ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                                                analysis.severity === 'Moderate'
                                                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                                                                    analysis.severity === 'Severe'
                                                                        ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                                                                        : 'bg-gradient-to-r from-red-500 to-red-400'
                                                                }`}
                                                            style={{
                                                                width: `${animatedProgress}%`,
                                                                transition: 'width 1800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                                boxShadow: `0 0 10px ${analysis.severity === 'Good' ? 'rgba(34, 197, 94, 0.5)' :
                                                                    analysis.severity === 'Moderate' ? 'rgba(234, 179, 8, 0.5)' :
                                                                        analysis.severity === 'Severe' ? 'rgba(249, 115, 22, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                                                                    }`,
                                                                willChange: 'width'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Description Cell */}
                                        <td className="py-4 px-6">
                                            <div className="max-w-[300px]">
                                                <p className="text-sm text-foreground/80 line-clamp-2 group-hover:text-foreground transition-colors duration-300">
                                                    {analysis.description}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Enhanced Action Button */}
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleShowDetails(analysis);
                                                }}
                                                className="
                                                    inline-flex items-center gap-2 px-4 py-2 rounded-lg
                                                    bg-gradient-to-r from-primary/10 to-primary/5
                                                    border border-primary/20 text-primary
                                                    hover:from-primary/20 hover:to-primary/10 hover:border-primary/40
                                                    hover:shadow-lg hover:shadow-primary/20 hover:scale-105
                                                    focus:outline-none focus:ring-2 focus:ring-primary/50
                                                    transition-all duration-300 ease-out
                                                    font-medium text-sm backdrop-blur-sm
                                                "
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span>Details</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} aria-label="Failure Analysis Display" aria-live="polite">
            {/* Top Header with View Mode Selector and Controls */}
            <div className="flex items-center justify-between mb-2">
                {/* View Mode Selector - Moved to Top */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 backdrop-blur-sm rounded-lg border border-primary/10">
                    <Button
                        type="button"
                        variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewMode('carousel');
                        }}
                        className="gap-2 transition-all duration-300"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Carousel
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewMode('table');
                        }}
                        className="gap-2 transition-all duration-300"
                    >
                        <Grid3X3 className="h-4 w-4" />
                        Table
                    </Button>
                </div>

                {/* Carousel Controls - Only show when in carousel mode */}
                {showControls && viewMode === 'carousel' && (
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAutoPlay(!isAutoPlay);
                            }}
                            className="gap-2"
                            aria-label={isAutoPlay ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                        >
                            {isAutoPlay ? (
                                <>
                                    <PauseCircle className="h-4 w-4" />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    Auto
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="h-4 w-4" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                    Manual
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                emblaApi?.scrollTo(0);
                            }}
                            className="gap-2"
                            aria-label="Reset to first slide"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                            {currentSlide + 1} / {analyses.length}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content Area - Conditional Rendering */}
            {viewMode === 'carousel' ? (
                <>
                    {/* Carousel container - optimized for center alignment */}
                    <div
                        className="w-full overflow-hidden"
                        onMouseEnter={handlePause}
                        onMouseLeave={handleResume}
                        onTouchStart={handlePause}
                        onTouchEnd={handleResume}
                        ref={emblaRef}
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Failure Analysis Carousel"
                        tabIndex={0}
                    >
                        <div className="flex gap-8">
                            {analyses.map((analysis, index) => {
                                const Icon = FAILURE_ICONS[analysis.type] || Activity;
                                const isActive = index === currentSlide;
                                const isExpanded = expandedCards.has(index);
                                const severityProgress = getSeverityProgress(analysis.severity);

                                return (
                                    <div
                                        key={`failure-${analysis.type}-${index}`}
                                        className="flex-shrink-0 px-4 group"
                                        style={{
                                            width: isActive ? '420px' : '320px', // Active card is larger
                                            minWidth: isActive ? '420px' : '320px',
                                            maxWidth: isActive ? '420px' : '320px',
                                            transition: 'width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), min-width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), max-width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            willChange: 'width, min-width, max-width'
                                        }}
                                        aria-label={`${analysis.type} analysis card`}
                                        aria-current={isActive ? 'true' : 'false'}
                                        tabIndex={isActive ? 0 : -1}
                                        role="group"
                                        aria-roledescription="slide"
                                    >
                                        <Card
                                            className={`
                                        card-hover-effect stagger-animation
                                        ${isActive
                                                    ? `${glassCardClass} text-card-foreground border-2 border-primary/60 shadow-xl ring-1 ring-primary/60`
                                                    : `bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm ${getSeverityCardColor(analysis.severity)} text-muted-foreground border hover:border-primary/40 shadow-md`
                                                }
                                        hover:scale-95 transition-transform duration-300 ease-out
                                    `}
                                            style={{
                                                cursor: 'pointer',
                                                transform: isActive ? 'scale(1.05)' : 'scale(0.95)',
                                                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), border 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                                boxShadow: isActive
                                                    ? '0 12px 35px -8px var(--theme-primary, rgba(59, 130, 246, 0.2)), 0 0 25px 8px var(--theme-primary, rgba(59, 130, 246, 0.1))'
                                                    : '0 4px 15px -4px var(--theme-primary, rgba(59, 130, 246, 0.05))',
                                                height: isExpanded ? 'auto' : isActive ? '420px' : '350px',
                                                minHeight: isExpanded ? '420px' : isActive ? '420px' : '350px',
                                                animationDelay: `${index * 0.1}s`,
                                                opacity: isActive ? 1 : 0.7,
                                                willChange: 'transform, opacity, height, box-shadow, border-color'
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                emblaApi && emblaApi.scrollTo(index);
                                            }}
                                        >
                                            <CardHeader className="pb-3">
                                                <CardTitle className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex items-center justify-center rounded-full shadow-lg ${getStatusIconBg(analysis.severity)}`}
                                                            style={{
                                                                width: isActive ? '48px' : '36px',
                                                                height: isActive ? '48px' : '36px',
                                                                opacity: isActive ? 1 : 0.3,
                                                                transform: isActive ? 'scale(1)' : 'scale(0.85)',
                                                                transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s, height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s, opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s, box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s',
                                                                willChange: 'width, height, opacity, transform, box-shadow'
                                                            }}
                                                        >
                                                            <Icon
                                                                className="transition-all"
                                                                style={{
                                                                    width: isActive ? '24px' : '18px',
                                                                    height: isActive ? '24px' : '18px',
                                                                    transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s, height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.15s',
                                                                    willChange: 'width, height'
                                                                }}
                                                            />
                                                        </div>
                                                        <div
                                                            style={{
                                                                opacity: isActive ? 1 : 0.4,
                                                                transform: isActive ? 'translateX(0) scale(1)' : 'translateX(-10px) scale(0.9)',
                                                                transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s',
                                                                willChange: 'opacity, transform'
                                                            }}
                                                        >
                                                            <h3
                                                                className="font-bold leading-tight"
                                                                style={{
                                                                    fontSize: isActive ? '18px' : '16px',
                                                                    lineHeight: isActive ? '1.3' : '1.4',
                                                                    transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.25s, line-height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.25s',
                                                                    willChange: 'font-size, line-height'
                                                                }}
                                                            >
                                                                {analysis.type}
                                                            </h3>
                                                            <p
                                                                className="text-muted-foreground"
                                                                style={{
                                                                    fontSize: isActive ? '14px' : '12px',
                                                                    lineHeight: isActive ? '1.4' : '1.3',
                                                                    transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s, line-height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s',
                                                                    willChange: 'font-size, line-height'
                                                                }}
                                                            >
                                                                {analysis.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={`rounded-full font-semibold ${analysis.severity === 'Good'
                                                            ? 'bg-green-700/30 text-green-300 border border-green-700/50'
                                                            : analysis.severity === 'Moderate'
                                                                ? 'bg-yellow-700/30 text-yellow-300 border border-yellow-700/50'
                                                                : analysis.severity === 'Severe'
                                                                    ? 'bg-orange-700/30 text-orange-300 border border-orange-700/50'
                                                                    : 'bg-red-700/30 text-red-300 border border-red-700/50'
                                                            }`}
                                                        style={{
                                                            padding: isActive ? '6px 12px' : '4px 8px',
                                                            fontSize: isActive ? '12px' : '10px',
                                                            opacity: isActive ? 1 : 0.3,
                                                            transform: isActive ? 'scale(1)' : 'scale(0.9)',
                                                            transition: 'padding 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s, font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s, opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
                                                            willChange: 'padding, font-size, opacity, transform'
                                                        }}
                                                    >
                                                        {analysis.severity}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Progress Bar matching original AnalyticsComponents style */}
                                                <div
                                                    style={{
                                                        opacity: isActive ? 1 : 0.2,
                                                        transform: isActive ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                                                        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s, margin-bottom 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s',
                                                        marginBottom: isActive ? '16px' : '12px',
                                                        willChange: 'opacity, transform, margin-bottom'
                                                    }}
                                                >
                                                    <div
                                                        className="flex justify-between items-center"
                                                        style={{
                                                            marginBottom: isActive ? '8px' : '6px',
                                                            transition: 'margin-bottom 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.45s',
                                                            willChange: 'margin-bottom'
                                                        }}
                                                    >
                                                        <span
                                                            className="font-medium text-card-foreground"
                                                            style={{
                                                                fontSize: isActive ? '14px' : '12px',
                                                                transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s',
                                                                willChange: 'font-size'
                                                            }}
                                                        >
                                                            Severity Level
                                                        </span>
                                                        <span
                                                            className="text-muted-foreground"
                                                            style={{
                                                                fontSize: isActive ? '14px' : '12px',
                                                                transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s',
                                                                willChange: 'font-size'
                                                            }}
                                                        >
                                                            {analysis.progress.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="relative w-full bg-background/30 rounded-full overflow-hidden"
                                                        style={{
                                                            height: isActive ? '8px' : '6px',
                                                            transition: 'height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.55s',
                                                            willChange: 'height'
                                                        }}
                                                    >
                                                        <div
                                                            className="absolute top-0 left-0 h-full bg-primary rounded-full"
                                                            style={{
                                                                width: isActive ? `${analysis.progress}%` : '0%',
                                                                transition: 'width 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s',
                                                                willChange: 'width'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Description with Glass Effect */}
                                                <div
                                                    className="bg-white/10 dark:bg-zinc-900/20 backdrop-blur-sm border border-primary/10 rounded-lg"
                                                    style={{
                                                        padding: isActive ? '12px' : '8px',
                                                        opacity: isActive ? 1 : 0.2,
                                                        transform: isActive ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                                                        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s, padding 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s',
                                                        willChange: 'opacity, transform, padding'
                                                    }}
                                                >
                                                    <div
                                                        className="flex items-start"
                                                        style={{
                                                            gap: isActive ? '8px' : '6px',
                                                            transition: 'gap 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.55s',
                                                            willChange: 'gap'
                                                        }}
                                                    >
                                                        <Info
                                                            className="text-primary mt-1 flex-shrink-0"
                                                            style={{
                                                                width: isActive ? '16px' : '14px',
                                                                height: isActive ? '16px' : '14px',
                                                                transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s, height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s',
                                                                willChange: 'width, height'
                                                            }}
                                                        />
                                                        <p
                                                            className="text-card-foreground"
                                                            style={{
                                                                fontSize: isActive ? '14px' : '12px',
                                                                lineHeight: isActive ? '1.4' : '1.3',
                                                                transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s, line-height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s',
                                                                willChange: 'font-size, line-height'
                                                            }}
                                                        >
                                                            {analysis.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Threshold Information matching original style */}
                                                <div
                                                    className="grid grid-cols-3"
                                                    style={{
                                                        gap: isActive ? '8px' : '6px',
                                                        opacity: isActive ? 1 : 0.2,
                                                        transform: isActive ? 'translateX(0) scale(1)' : 'translateX(-20px) scale(0.95)',
                                                        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s, gap 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s',
                                                        willChange: 'opacity, transform, gap'
                                                    }}
                                                >
                                                    {[
                                                        {
                                                            label: 'Good',
                                                            value: analysis.threshold.good,
                                                            bg: 'bg-green-500/20',
                                                            border: 'border-green-500/30',
                                                            textColor: 'text-green-300',
                                                            valueColor: 'text-green-400'
                                                        },
                                                        {
                                                            label: 'Moderate',
                                                            value: analysis.threshold.moderate,
                                                            bg: 'bg-yellow-500/20',
                                                            border: 'border-yellow-500/30',
                                                            textColor: 'text-yellow-300',
                                                            valueColor: 'text-yellow-400'
                                                        },
                                                        {
                                                            label: 'Severe',
                                                            value: analysis.threshold.severe,
                                                            bg: 'bg-red-500/20',
                                                            border: 'border-red-500/30',
                                                            textColor: 'text-red-300',
                                                            valueColor: 'text-red-400',
                                                            isGreaterThan: true
                                                        }
                                                    ].map((threshold, idx) => (
                                                        <div
                                                            key={threshold.label}
                                                            className={`text-center ${threshold.bg} border ${threshold.border} rounded-lg backdrop-blur-sm`}
                                                            style={{
                                                                padding: isActive ? '8px' : '6px',
                                                                transition: 'padding 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.65s',
                                                                willChange: 'padding'
                                                            }}
                                                        >
                                                            <div
                                                                className={`font-semibold ${threshold.textColor}`}
                                                                style={{
                                                                    fontSize: isActive ? '11px' : '10px',
                                                                    transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s',
                                                                    willChange: 'font-size'
                                                                }}
                                                            >
                                                                {threshold.label}
                                                            </div>
                                                            <div
                                                                className={`${threshold.valueColor}`}
                                                                style={{
                                                                    fontSize: isActive ? '10px' : '9px',
                                                                    transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.7s',
                                                                    willChange: 'font-size'
                                                                }}
                                                            >
                                                                {threshold.isGreaterThan ? '>' : '≤'} {threshold.value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>



                                                {/* Show Details Button */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleShowDetails(analysis);
                                                    }}
                                                    className="w-full font-medium text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 hover:border-primary/40 backdrop-blur-sm"
                                                    style={{
                                                        marginTop: isActive ? '16px' : '12px',
                                                        padding: isActive ? '8px 16px' : '6px 12px',
                                                        fontSize: isActive ? '14px' : '12px',
                                                        opacity: isActive ? 1 : 0.2,
                                                        transform: isActive ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
                                                        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.8s, background-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), padding 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.75s, font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.75s, margin-top 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.75s',
                                                        willChange: 'opacity, transform, background-color, border-color, padding, font-size, margin-top'
                                                    }}
                                                >
                                                    <span
                                                        className="flex items-center justify-center"
                                                        style={{
                                                            gap: isActive ? '8px' : '6px',
                                                            transition: 'gap 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s',
                                                            willChange: 'gap'
                                                        }}
                                                    >
                                                        <Eye
                                                            style={{
                                                                width: isActive ? '16px' : '14px',
                                                                height: isActive ? '16px' : '14px',
                                                                transition: 'width 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s, height 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s',
                                                                willChange: 'width, height'
                                                            }}
                                                        />
                                                        <span
                                                            style={{
                                                                fontSize: isActive ? '14px' : '12px',
                                                                transition: 'font-size 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s',
                                                                willChange: 'font-size'
                                                            }}
                                                        >
                                                            Show Details
                                                        </span>
                                                    </span>
                                                </button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Slide indicators */}
                    <div className="flex justify-center gap-2 mt-3" aria-label="Analysis slide indicators">
                        {analyses.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    emblaApi && emblaApi.scrollTo(index);
                                }}
                                className={`h-2 rounded-full ${index === currentSlide
                                    ? 'bg-primary w-8'
                                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2'
                                    }`}
                                style={{
                                    transition: 'width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                    willChange: 'width, background-color, opacity'
                                }}
                                aria-label={`Go to ${analyses[index]?.type} analysis`}
                                aria-current={index === currentSlide ? 'true' : 'false'}
                            />
                        ))}
                    </div>
                </>
            ) : (
                /* Table View */
                <TableView />
            )}



            {/* Floating Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[95vh] w-[95vw] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {selectedAnalysis && (
                                <>
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${getStatusIconBg(selectedAnalysis.severity)}`}>
                                        {(() => {
                                            const Icon = FAILURE_ICONS[selectedAnalysis.type] || Activity;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedAnalysis.type}</h3>
                                        <Badge className={`${selectedAnalysis.severity === 'Good'
                                            ? 'bg-green-700/30 text-green-300 border border-green-700/50'
                                            : selectedAnalysis.severity === 'Moderate'
                                                ? 'bg-yellow-700/30 text-yellow-300 border border-yellow-700/50'
                                                : selectedAnalysis.severity === 'Severe'
                                                    ? 'bg-orange-700/30 text-orange-300 border border-orange-700/50'
                                                    : 'bg-red-700/30 text-red-300 border border-red-700/50'
                                            }`}>
                                            {selectedAnalysis.severity}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedAnalysis?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAnalysis && (
                        <div className="space-y-4 mt-4">
                            {/* Progress Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-3">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{selectedAnalysis.progress.toFixed(1)}%</div>
                                            <div className="text-xs text-muted-foreground">{selectedAnalysis.severity}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-3">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{selectedAnalysis.index}</div>
                                            <div className="text-xs text-muted-foreground">Index</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardContent className="p-3">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-primary">{selectedAnalysis.threshold.severe}</div>
                                            <div className="text-xs text-muted-foreground">Severe Threshold</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Detailed Information Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Root Causes */}
                                <Card className="bg-red-500/5 border-red-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-red-300 text-sm">
                                            <AlertTriangle className="h-4 w-4" />
                                            Root Causes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ul className="space-y-1">
                                            {selectedAnalysis.rootCauses.map((cause, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-red-400 mt-1 text-xs">•</span>
                                                    <span className="text-xs">{cause}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Immediate Actions */}
                                <Card className="bg-orange-500/5 border-orange-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-orange-300 text-sm">
                                            <AlertCircle className="h-4 w-4" />
                                            Immediate Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ul className="space-y-1">
                                            {selectedAnalysis.immediateActions.map((action, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-orange-400 mt-1 text-xs">•</span>
                                                    <span className="text-xs">{action}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Corrective Measures */}
                                <Card className="bg-blue-500/5 border-blue-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-blue-300 text-sm">
                                            <Wrench className="h-4 w-4" />
                                            Corrective Measures
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ul className="space-y-1">
                                            {selectedAnalysis.correctiveMeasures.map((measure, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-blue-400 mt-1 text-xs">•</span>
                                                    <span className="text-xs">{measure}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {/* Preventive Measures */}
                                <Card className="bg-green-500/5 border-green-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-green-300 text-sm">
                                            <Shield className="h-4 w-4" />
                                            Preventive Measures
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ul className="space-y-1">
                                            {selectedAnalysis.preventiveMeasures.map((measure, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-green-400 mt-1 text-xs">•</span>
                                                    <span className="text-xs">{measure}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* CSS for animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulseGlow {
                    0%, 100% {
                        box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
                    }
                    50% {
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
                    }
                }

                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }

                @keyframes smoothScale {
                    from {
                        transform: scale(0.95);
                        opacity: 0.7;
                    }
                    to {
                        transform: scale(1.05);
                        opacity: 1;
                    }
                }

                @keyframes breathe {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.02);
                    }
                }

                .shimmer-effect {
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.2),
                        transparent
                    );
                    background-size: 200px 100%;
                    animation: shimmer 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }

                .card-hover-effect:hover {
                    animation: pulseGlow 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
                }

                .stagger-animation {
                    animation: slideInRight 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }

                .stagger-animation:nth-child(1) { animation-delay: 0.1s; }
                .stagger-animation:nth-child(2) { animation-delay: 0.15s; }
                .stagger-animation:nth-child(3) { animation-delay: 0.2s; }
                .stagger-animation:nth-child(4) { animation-delay: 0.25s; }
                .stagger-animation:nth-child(5) { animation-delay: 0.3s; }

                /* Center alignment improvements */
                .embla__container {
                    display: flex;
                    align-items: flex-start;
                }

                .embla__slide {
                    flex: 0 0 auto;
                    min-width: 0;
                }

                /* Enhanced smooth transitions */
                * {
                    backface-visibility: hidden;
                    -webkit-backface-visibility: hidden;
                    -moz-backface-visibility: hidden;
                    -ms-backface-visibility: hidden;
                }

                /* GPU acceleration for smooth animations */
                .card-hover-effect {
                    transform: translateZ(0);
                    will-change: transform, opacity, box-shadow;
                }

                /* Smooth easing for all transitions */
                .smooth-transition {
                    transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }

                .elastic-transition {
                    transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                `
            }} />
        </div>
    );
}
