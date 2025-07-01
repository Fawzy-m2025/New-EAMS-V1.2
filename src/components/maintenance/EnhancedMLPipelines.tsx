import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/use-theme';
import useEmblaCarousel from 'embla-carousel-react';
import {
    Shield,
    Cpu,
    Target,
    TrendingUp,
    AlertTriangle,
    Eye,
    Clock,
    Database,
    Settings,
    Brain,
    Zap,
    Activity,
    Download,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle,
    XCircle,
    Wrench,
    Gauge,
    Thermometer,
    BarChart3,
    Filter,
    RefreshCw,
    Play,
    Pause,
    Square,
    Plus,
    Edit,
    Trash2,
    FileText,
    Send,
    Bell,
    ChevronRight,
    Sparkles,
    Layers,
    BarChart,
    PieChart,
    LineChart,
    Info,
    DollarSign
} from 'lucide-react';
import { rulPredictions, maintenanceSchedules, riskAssessments, pipelineStatuses } from '@/data/enhancedMLPipelineData';

interface RULPrediction {
    equipment: string;
    condition: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
    vibration: string;
    operatingHours: number;
    predictedRUL: number;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
    riskScore: number;
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceType: 'Preventive' | 'Predictive' | 'Emergency' | 'Condition-Based';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    costImpact: number;
    downtimeImpact: number;
}

interface MaintenanceSchedule {
    id: string;
    equipment: string;
    maintenanceType: 'Preventive' | 'Predictive' | 'Emergency' | 'Condition-Based';
    scheduledDate: Date;
    estimatedDuration: number; // hours
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
    assignedTechnician?: string;
    estimatedCost: number;
    riskScore: number;
    description: string;
    requiredParts: string[];
}

interface RiskAssessment {
    equipment: string;
    riskScore: number;
    factors: {
        vibration: number;
        temperature: number;
        operatingHours: number;
        age: number;
        criticality: number;
        environment: number;
    };
    recommendations: string[];
    mitigationActions: string[];
}

interface PipelineStatus {
    name: string;
    status: 'Active' | 'Training' | 'Failed' | 'Idle';
    lastRun: string;
    description: string;
}

const EnhancedMLPipelines: React.FC = () => {
    const { theme } = useTheme();
    const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [maintenanceFilter, setMaintenanceFilter] = useState<string>('all');
    const [riskThreshold, setRiskThreshold] = useState<number>(70);
    const [isSchedulingMode, setIsSchedulingMode] = useState<boolean>(false);

    // New state for interactive features
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceSchedule | null>(null);
    const [showMaintenanceDialog, setShowMaintenanceDialog] = useState<boolean>(false);
    const [showRiskDialog, setShowRiskDialog] = useState<boolean>(false);
    const [selectedRiskAssessment, setSelectedRiskAssessment] = useState<RiskAssessment | null>(null);
    const [pipelineStatus, setPipelineStatus] = useState<string>('active');

    // Animation states
    const [cardsVisible, setCardsVisible] = useState<boolean>(false);
    const [metricsVisible, setMetricsVisible] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [animationCycle, setAnimationCycle] = useState<number>(0);

    // Carousel states for Maintenance Schedule
    const [maintenanceActiveIndex, setMaintenanceActiveIndex] = useState(0);
    const [isMaintenanceAutoPlay, setIsMaintenanceAutoPlay] = useState(true);
    const maintenanceAutoPlayRef = useRef<NodeJS.Timeout | null>(null);
    const [maintenanceCardsToShow, setMaintenanceCardsToShow] = useState(1);
    const maintenanceTouchStartX = useRef<number>(0);
    // Embla carousel setup for Maintenance Schedule
    const [maintenanceEmblaRef, maintenanceEmblaApi] = useEmblaCarousel({
        loop: true,
        slidesToScroll: 1,
        align: 'center',
        containScroll: 'trimSnaps',
        startIndex: 0,
        dragFree: false,
        skipSnaps: false,
        inViewThreshold: 0.7,
    });

    // Risk-based calculations
    const calculateRiskScore = (equipment: RULPrediction): number => {
        const vibrationScore = parseFloat(equipment.vibration) * 3;
        const hoursScore = equipment.operatingHours / 1000;
        const rulScore = 100 - (equipment.predictedRUL / 100);
        const conditionScore = equipment.condition === 'Critical' ? 25 :
            equipment.condition === 'Poor' ? 20 :
                equipment.condition === 'Fair' ? 15 :
                    equipment.condition === 'Good' ? 10 : 5;

        return Math.min(100, Math.max(0, (vibrationScore + hoursScore + rulScore + conditionScore) / 4));
    };

    // Priority calculation based on risk and impact
    const calculatePriority = (equipment: RULPrediction): 'Critical' | 'High' | 'Medium' | 'Low' => {
        const riskScore = equipment.riskScore;
        const costImpact = equipment.costImpact;
        const downtimeImpact = equipment.downtimeImpact;

        const priorityScore = (riskScore * 0.4) + (costImpact / 1000 * 0.3) + (downtimeImpact * 0.3);

        if (priorityScore > 80) return 'Critical';
        if (priorityScore > 60) return 'High';
        if (priorityScore > 40) return 'Medium';
        return 'Low';
    };

    // Filtered data based on risk threshold
    const filteredPredictions = useMemo(() => {
        return rulPredictions.filter(prediction =>
            prediction.riskScore >= riskThreshold || maintenanceFilter === 'all'
        );
    }, [riskThreshold, maintenanceFilter]);

    // Maintenance schedule for selected date
    const scheduledMaintenance = useMemo(() => {
        if (!selectedDate) return [];
        return maintenanceSchedules.filter(schedule =>
            schedule.scheduledDate.toDateString() === selectedDate.toDateString()
        );
    }, [selectedDate]);

    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'Critical': return 'destructive';
            case 'Poor': return 'secondary';
            case 'Fair': return 'outline';
            case 'Good': return 'default';
            case 'Excellent': return 'default';
            default: return 'outline';
        }
    };

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'High Risk': return 'destructive';
            case 'Medium Risk': return 'secondary';
            case 'Low Risk': return 'outline';
            default: return 'outline';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'destructive';
            case 'High': return 'secondary';
            case 'Medium': return 'outline';
            case 'Low': return 'default';
            default: return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-500';
            case 'Training': return 'bg-yellow-500';
            case 'Failed': return 'bg-red-500';
            case 'Idle': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const getActionButton = (riskLevel: string, priority: string, equipment: string) => {
        if (priority === 'Critical') {
            return (
                <Button
                    size="sm"
                    variant="destructive"
                    className="h-8"
                    onClick={() => handleImmediateAction(equipment)}
                    disabled={isLoading}
                >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {isLoading ? 'Processing...' : 'Emergency Action'}
                </Button>
            );
        }

        switch (riskLevel) {
            case 'High Risk':
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleImmediateAction(equipment)}
                        disabled={isLoading}
                    >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {isLoading ? 'Processing...' : 'Immediate Action'}
                    </Button>
                );
            case 'Medium Risk':
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleScheduleMaintenanceAction(equipment)}
                        disabled={isLoading}
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        {isLoading ? 'Processing...' : 'Schedule Maintenance'}
                    </Button>
                );
            case 'Low Risk':
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleMonitorAction(equipment)}
                        disabled={isLoading}
                    >
                        <Eye className="h-3 w-3 mr-1" />
                        {isLoading ? 'Processing...' : 'Monitor'}
                    </Button>
                );
            default:
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleMonitorAction(equipment)}
                        disabled={isLoading}
                    >
                        <Eye className="h-3 w-3 mr-1" />
                        {isLoading ? 'Processing...' : 'View'}
                    </Button>
                );
        }
    };

    const getRiskLevelIcon = (riskScore: number) => {
        if (riskScore >= 80) return <AlertCircle className="h-4 w-4 text-red-500" />;
        if (riskScore >= 60) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        if (riskScore >= 40) return <Eye className="h-4 w-4 text-yellow-500" />;
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    };

    // Interactive Functions
    const handleRiskAnalysis = (equipment: string) => {
        setSelectedRiskAssessment(riskAssessments.find(ra => ra.equipment === equipment) || null);
        setShowRiskDialog(true);
        toast({
            title: "Risk Analysis",
            description: `Detailed risk analysis opened for ${equipment}`,
        });
    };

    const handleScheduleMaintenance = (schedule: MaintenanceSchedule) => {
        setSelectedMaintenance(schedule);
        setShowMaintenanceDialog(true);
        toast({
            title: "Maintenance Scheduling",
            description: `Scheduling maintenance for ${schedule.equipment}`,
        });
    };

    const handleViewDetails = (schedule: MaintenanceSchedule) => {
        setSelectedMaintenance(schedule);
        setShowMaintenanceDialog(true);
        toast({
            title: "Maintenance Details",
            description: `Viewing details for ${schedule.equipment}`,
        });
    };

    const handleImmediateAction = (equipment: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Emergency Action Initiated",
                description: `Emergency maintenance team dispatched for ${equipment}`,
                variant: "destructive",
            });
        }, 2000);
    };

    const handleScheduleMaintenanceAction = (equipment: string) => {
        toast({
            title: "Maintenance Scheduled",
            description: `Maintenance scheduled for ${equipment} within 48 hours`,
        });
    };

    const handleMonitorAction = (equipment: string) => {
        toast({
            title: "Monitoring Enhanced",
            description: `Enhanced monitoring activated for ${equipment}`,
        });
    };

    const handleDeployRiskModel = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Risk Model Deployed",
                description: "New risk assessment model successfully deployed to production",
            });
        }, 3000);
    };

    const handleRetrainModels = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Models Retrained",
                description: "All ML models have been successfully retrained with latest data",
            });
        }, 4000);
    };

    const handleConfigureRiskThresholds = () => {
        toast({
            title: "Risk Thresholds",
            description: "Risk threshold configuration panel opened",
        });
    };

    const handleScheduleMaintenanceGlobal = () => {
        toast({
            title: "Maintenance Scheduler",
            description: "Global maintenance scheduling interface opened",
        });
    };

    const handleExportRiskReport = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Report Exported",
                description: "Risk assessment report exported successfully",
            });
        }, 2000);
    };

    const handleDataIngestion = () => {
        toast({
            title: "Data Ingestion",
            description: "Data ingestion pipeline configuration opened",
        });
    };

    const handleModelTraining = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Model Training",
                description: "New model training job initiated",
            });
        }, 3000);
    };

    const handleRiskAssessment = () => {
        toast({
            title: "Risk Assessment",
            description: "Comprehensive risk assessment analysis opened",
        });
    };

    const handlePipelineAction = (action: string, pipelineName: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: `${action} Initiated`,
                description: `${action} started for ${pipelineName}`,
            });
        }, 2000);
    };

    const handleExportData = (format: string) => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Data Export",
                description: `Data exported successfully in ${format.toUpperCase()} format`,
            });
        }, 2000);
    };

    const handleRefreshData = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Data Refreshed",
                description: "All data has been refreshed with latest information",
            });
        }, 1500);
    };

    const handleTogglePipeline = (pipelineName: string, action: 'start' | 'stop' | 'pause') => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: `Pipeline ${action.charAt(0).toUpperCase() + action.slice(1)}`,
                description: `${pipelineName} has been ${action}ed successfully`,
            });
        }, 1500);
    };

    // Auto-repeating animation cycle
    useEffect(() => {
        if (isHovered) return; // Pause animation when hovered

        const interval = setInterval(() => {
            setCardsVisible(false);
            setMetricsVisible(false);

            setTimeout(() => {
                setCardsVisible(true);
                setTimeout(() => setMetricsVisible(true), 200);
            }, 500);

            setAnimationCycle(prev => prev + 1);
        }, 8000); // Repeat every 8 seconds

        return () => clearInterval(interval);
    }, [isHovered]);

    // Add CSS animations for enhanced card effects
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes dotPulse {
                0%, 100% { 
                    transform: scale(1.25); 
                    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                }
                50% { 
                    transform: scale(1.4); 
                    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
                }
            }
            
            @keyframes slideInFromTop {
                from { 
                    transform: translateY(-20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes slideInFromLeft {
                from { 
                    transform: translateX(-20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes slideInFromRight {
                from { 
                    transform: translateX(20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes slideInFromBottom {
                from { 
                    transform: translateY(20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }
            
            @keyframes fadeInUp {
                from { 
                    transform: translateY(15px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateY(0); 
                    opacity: 1; 
                }
            }

            /* Professional Text Animations */
            @keyframes textReveal {
                0% {
                    clip-path: inset(0 100% 0 0);
                    transform: translateX(-20px);
                    opacity: 0;
                }
                50% {
                    clip-path: inset(0 50% 0 0);
                    transform: translateX(-10px);
                    opacity: 0.5;
                }
                100% {
                    clip-path: inset(0 0% 0 0);
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes textFloat {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                }
                25% {
                    transform: translateY(-2px) rotate(0.5deg);
                }
                50% {
                    transform: translateY(-1px) rotate(-0.3deg);
                }
                75% {
                    transform: translateY(-3px) rotate(0.2deg);
                }
            }

            @keyframes textScale {
                0% {
                    transform: scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.05);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes textSlideIn {
                0% {
                    transform: translateX(-100%);
                    opacity: 0;
                    filter: blur(5px);
                }
                50% {
                    transform: translateX(-50%);
                    opacity: 0.5;
                    filter: blur(2px);
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                    filter: blur(0px);
                }
            }

            @keyframes textWave {
                0%, 100% {
                    transform: translateY(0);
                }
                25% {
                    transform: translateY(-3px);
                }
                75% {
                    transform: translateY(3px);
                }
            }

            @keyframes textPulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.02);
                    opacity: 0.9;
                }
            }

            @keyframes textShimmer {
                0% {
                    background-position: -200% center;
                }
                100% {
                    background-position: 200% center;
                }
            }

            @keyframes textBounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-8px);
                }
                60% {
                    transform: translateY(-4px);
                }
            }

            @keyframes textRotate {
                0% {
                    transform: rotateY(0deg);
                }
                100% {
                    transform: rotateY(360deg);
                }
            }

            @keyframes textFadeInScale {
                0% {
                    transform: scale(0.9) translateY(10px);
                    opacity: 0;
                    filter: blur(3px);
                }
                100% {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                    filter: blur(0px);
                }
            }

            @keyframes textSlideUpReveal {
                0% {
                    transform: translateY(100%);
                    opacity: 0;
                    clip-path: inset(100% 0 0 0);
                }
                50% {
                    transform: translateY(50%);
                    opacity: 0.5;
                    clip-path: inset(50% 0 0 0);
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                    clip-path: inset(0% 0 0 0);
                }
            }

            @keyframes textSlideInStagger {
                0% {
                    transform: translateX(-30px);
                    opacity: 0;
                    filter: blur(4px);
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                    filter: blur(0px);
                }
            }

            @keyframes textFadeInBlur {
                0% {
                    opacity: 0;
                    filter: blur(8px);
                    transform: scale(0.95);
                }
                100% {
                    opacity: 1;
                    filter: blur(0px);
                    transform: scale(1);
                }
            }

            @keyframes textSlideInFromBottom {
                0% {
                    transform: translateY(20px);
                    opacity: 0;
                    clip-path: inset(0 0 100% 0);
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                    clip-path: inset(0 0 0% 0);
                }
            }

            @keyframes progressFill {
                0% {
                    width: 0%;
                }
                100% {
                    width: var(--progress-width, 0%);
                }
            }

            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }

            .animate-shimmer {
                animation: shimmer 2s infinite;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Trigger animations on mount
    useEffect(() => {
        const timer1 = setTimeout(() => setCardsVisible(true), 100);
        const timer2 = setTimeout(() => setMetricsVisible(true), 300);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    // Update maintenanceActiveIndex in response to Embla's select event
    useEffect(() => {
        if (!maintenanceEmblaApi) return;
        const onSelect = () => {
            let currentIndex = maintenanceEmblaApi.selectedScrollSnap();
            setMaintenanceActiveIndex(currentIndex);
        };
        maintenanceEmblaApi.on('select', onSelect);
        setMaintenanceActiveIndex(maintenanceEmblaApi.selectedScrollSnap());
        return () => {
            maintenanceEmblaApi.off('select', onSelect);
        };
    }, [maintenanceEmblaApi, maintenanceSchedules.length]);

    // Auto-rotation effect for Maintenance Schedule (3.5s per card for faster rotation)
    useEffect(() => {
        if (!isMaintenanceAutoPlay || !maintenanceEmblaApi) return;
        maintenanceAutoPlayRef.current = setInterval(() => {
            maintenanceEmblaApi.scrollNext();
        }, 3500); // Faster rotation - 3.5 seconds per card
        return () => maintenanceAutoPlayRef.current && clearInterval(maintenanceAutoPlayRef.current);
    }, [isMaintenanceAutoPlay, maintenanceEmblaApi]);

    // Pause/resume on hover/touch for Maintenance Schedule
    const handleMaintenancePause = useCallback(() => setIsMaintenanceAutoPlay(false), []);
    const handleMaintenanceResume = useCallback(() => setIsMaintenanceAutoPlay(true), []);

    // Responsive cardsToShow for Maintenance Schedule
    useEffect(() => {
        const updateMaintenanceCardsToShow = () => {
            if (typeof window === 'undefined') return;
            if (window.innerWidth >= 1024) setMaintenanceCardsToShow(3);
            else if (window.innerWidth >= 768) setMaintenanceCardsToShow(2);
            else setMaintenanceCardsToShow(1);
        };
        updateMaintenanceCardsToShow();
        window.addEventListener('resize', updateMaintenanceCardsToShow);
        return () => window.removeEventListener('resize', updateMaintenanceCardsToShow);
    }, []);

    // Swipe support for Maintenance Schedule
    const handleMaintenanceTouchStart = (e: React.TouchEvent) => {
        maintenanceTouchStartX.current = e.touches[0].clientX;
    };

    const handleMaintenanceTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = maintenanceTouchStartX.current - touchEndX;
        if (Math.abs(diff) > 50) { // Threshold for swipe
            if (diff > 0) {
                setMaintenanceActiveIndex((prev) => (prev + 1) % maintenanceSchedules.length);
            } else {
                setMaintenanceActiveIndex((prev) => (prev - 1 + maintenanceSchedules.length) % maintenanceSchedules.length);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Normal Header Section - Scrolls with content */}
            <div className="backdrop-blur-lg bg-background/95 border-b shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Cpu className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    Enhanced ML Pipeline
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Risk-based maintenance with intelligent scheduling
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                System Active
                            </Badge>
                            <Button variant="outline" size="sm" onClick={handleRefreshData} disabled={isLoading}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80" align="end">
                                    <DropdownMenuLabel className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Risk-Based Controls
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <div className="px-2 py-1.5 space-y-3">
                                        <div>
                                            <Label htmlFor="riskThresholdDropdown" className="text-xs font-medium">Risk Threshold (%)</Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input
                                                    id="riskThresholdDropdown"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={riskThreshold}
                                                    onChange={(e) => setRiskThreshold(Number(e.target.value))}
                                                    className="w-16 h-8 text-xs"
                                                />
                                                <span className="text-xs text-muted-foreground">%</span>
                                            </div>
                                            <Progress value={riskThreshold} className="w-full h-1 mt-1" />
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium">Maintenance Filter</Label>
                                            <Select value={maintenanceFilter} onValueChange={setMaintenanceFilter}>
                                                <SelectTrigger className="w-full h-8 mt-1">
                                                    <SelectValue placeholder="Filter by type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="Preventive">Preventive</SelectItem>
                                                    <SelectItem value="Predictive">Predictive</SelectItem>
                                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                                    <SelectItem value="Condition-Based">Condition-Based</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium">Equipment Filter</Label>
                                            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                                                <SelectTrigger className="w-full h-8 mt-1">
                                                    <SelectValue placeholder="Select equipment" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Equipment</SelectItem>
                                                    {rulPredictions.map((prediction) => (
                                                        <SelectItem key={prediction.equipment} value={prediction.equipment}>
                                                            {prediction.equipment}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium">Schedule Mode</Label>
                                            <Button
                                                variant={isSchedulingMode ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setIsSchedulingMode(!isSchedulingMode)}
                                                className="w-full h-8 mt-1"
                                            >
                                                <CalendarIcon className="h-3 w-3 mr-1" />
                                                {isSchedulingMode ? 'Active' : 'Inactive'}
                                            </Button>
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator />

                                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                        Configure risk thresholds and maintenance parameters
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Settings className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80" align="end">
                                    <DropdownMenuLabel className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-primary" />
                                        Pipeline Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={handleDeployRiskModel}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Cpu className="h-4 w-4" />
                                        {isLoading ? 'Deploying...' : 'Deploy Risk Model'}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleRetrainModels}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Activity className="h-4 w-4" />
                                        {isLoading ? 'Retraining...' : 'Retrain Models'}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleConfigureRiskThresholds}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Configure Risk Thresholds
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleScheduleMaintenanceGlobal}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        Schedule Maintenance
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={handleExportRiskReport}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Download className="h-4 w-4" />
                                        {isLoading ? 'Exporting...' : 'Export Risk Report'}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleDataIngestion}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Database className="h-4 w-4" />
                                        Data Ingestion
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleModelTraining}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Brain className="h-4 w-4" />
                                        {isLoading ? 'Training...' : 'Model Training'}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={handleRiskAssessment}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Risk Assessment
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                        Quick access to all pipeline management actions
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content without extra top padding */}
            <div className="container mx-auto px-6 py-6 space-y-8">
                {/* Risk-Based Performance Metrics */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '0ms',
                            boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25), 0 0 6px rgba(16, 185, 129, 0.2), 0 0 12px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${cardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Pipeline Uptime</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">99.2%</p>
                                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Excellent performance</p>
                                </div>
                                <div className={`p-3 rounded-full bg-green-100 dark:bg-green-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${cardsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '100ms',
                            boxShadow: '0 3px 8px rgba(59, 130, 246, 0.25), 0 0 6px rgba(59, 130, 246, 0.2), 0 0 12px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${cardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Processing Time</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">2.8s</p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Fast response</p>
                                </div>
                                <div className={`p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${cardsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '200ms',
                            boxShadow: '0 3px 8px rgba(139, 92, 246, 0.25), 0 0 6px rgba(139, 92, 246, 0.2), 0 0 12px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${cardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Records/Day</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">15.2K</p>
                                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">High throughput</p>
                                </div>
                                <div className={`p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${cardsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                                    <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '300ms',
                            boxShadow: '0 3px 8px rgba(245, 158, 11, 0.25), 0 0 6px rgba(245, 158, 11, 0.2), 0 0 12px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${cardsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Risk Prediction Accuracy</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">94.5%</p>
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Highly accurate</p>
                                </div>
                                <div className={`p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${cardsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
                                    <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pipeline Status Overview */}
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '400ms',
                            boxShadow: '0 3px 8px rgba(16, 185, 129, 0.25), 0 0 6px rgba(16, 185, 129, 0.2), 0 0 12px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${metricsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Pipelines</p>
                                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">14</p>
                                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Running successfully</p>
                                </div>
                                <div className={`p-3 rounded-full bg-green-100 dark:bg-green-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${metricsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '500ms',
                            boxShadow: '0 3px 8px rgba(59, 130, 246, 0.25), 0 0 6px rgba(59, 130, 246, 0.2), 0 0 12px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${metricsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Models in Production</p>
                                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">10</p>
                                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Deployed models</p>
                                </div>
                                <div className={`p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${metricsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '900ms' }}>
                                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '600ms',
                            boxShadow: '0 3px 8px rgba(139, 92, 246, 0.25), 0 0 6px rgba(139, 92, 246, 0.2), 0 0 12px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${metricsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Risk Assessments</p>
                                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">8</p>
                                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Active assessments</p>
                                </div>
                                <div className={`p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${metricsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
                                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card
                        className={`border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 transform transition-all duration-700 ease-out hover:scale-105 hover:shadow-2xl ${metricsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                            }`}
                        style={{
                            transitionDelay: '700ms',
                            boxShadow: '0 3px 8px rgba(245, 158, 11, 0.25), 0 0 6px rgba(245, 158, 11, 0.2), 0 0 12px rgba(245, 158, 11, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        }}
                    >
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`transform transition-all duration-500 ${metricsVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} style={{ transitionDelay: '900ms' }}>
                                    <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Scheduled Maintenance</p>
                                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">12</p>
                                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70">This month</p>
                                </div>
                                <div className={`p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${metricsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: '1100ms' }}>
                                    <Wrench className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Enhanced RUL Predictions Table */}
                <Card className="border border-border shadow-lg bg-gradient-to-br from-background via-background to-muted/5">
                    <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <div className="p-1.5 rounded-lg bg-primary/15">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Enhanced RUL Predictions
                                </span>
                                <div className="text-xs font-normal text-muted-foreground mt-0.5">
                                    Real-time Remaining Useful Life predictions with risk-based maintenance scheduling
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-b border-border">
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-48">
                                                <div className="flex items-center gap-1.5">
                                                    <Database className="h-3 w-3 text-primary/70" />
                                                    Equipment
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">
                                                <div className="flex items-center gap-1.5">
                                                    <Activity className="h-3 w-3 text-primary/70" />
                                                    Condition
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">
                                                <div className="flex items-center gap-1.5">
                                                    <Target className="h-3 w-3 text-primary/70" />
                                                    Risk Score
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20">
                                                <div className="flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3 w-3 text-primary/70" />
                                                    Priority
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-36">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarIcon className="h-3 w-3 text-primary/70" />
                                                    Next Maintenance
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-28">
                                                <div className="flex items-center gap-1.5">
                                                    <BarChart3 className="h-3 w-3 text-primary/70" />
                                                    Cost Impact
                                                </div>
                                            </th>
                                            <th className="text-left p-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">
                                                <div className="flex items-center gap-1.5">
                                                    <Zap className="h-3 w-3 text-primary/70" />
                                                    Actions
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rulPredictions.map((prediction, index) => (
                                            <tr
                                                key={index}
                                                className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary/30 border-b border-border"
                                                style={{
                                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                                }}
                                            >
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/15 transition-colors duration-300">
                                                            <Wrench className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                                                                {prediction.equipment}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">
                                                                {prediction.vibration} • {prediction.operatingHours.toLocaleString()}h
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 shadow-sm"
                                                        style={{
                                                            backgroundColor: prediction.condition === 'Critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                                prediction.condition === 'Poor' ? 'rgba(245, 158, 11, 0.15)' :
                                                                    prediction.condition === 'Fair' ? 'rgba(234, 179, 8, 0.15)' :
                                                                        prediction.condition === 'Good' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: prediction.condition === 'Critical' ? 'rgb(239, 68, 68)' :
                                                                prediction.condition === 'Poor' ? 'rgb(245, 158, 11)' :
                                                                    prediction.condition === 'Fair' ? 'rgb(234, 179, 8)' :
                                                                        prediction.condition === 'Good' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                                            borderColor: prediction.condition === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                                prediction.condition === 'Poor' ? 'rgba(245, 158, 11, 0.3)' :
                                                                    prediction.condition === 'Fair' ? 'rgba(234, 179, 8, 0.3)' :
                                                                        prediction.condition === 'Good' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${prediction.condition === 'Critical' ? 'bg-red-500 animate-pulse' :
                                                                prediction.condition === 'Poor' ? 'bg-orange-500' :
                                                                    prediction.condition === 'Fair' ? 'bg-yellow-500' :
                                                                        prediction.condition === 'Good' ? 'bg-blue-500' : 'bg-green-500'
                                                                }`} />
                                                            {prediction.condition}
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1">
                                                                <div className="relative w-16 h-2 bg-muted/30 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${prediction.riskScore >= 80 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                                            prediction.riskScore >= 60 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                                                                                'bg-gradient-to-r from-green-500 to-green-600'
                                                                            }`}
                                                                        style={{
                                                                            width: '0%',
                                                                            '--progress-width': `${prediction.riskScore}%`,
                                                                            animation: `progressFill 1.5s ease-out ${index * 0.2}s forwards`
                                                                        } as React.CSSProperties}
                                                                    >
                                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <span className={`text-sm font-bold font-mono ${prediction.riskScore >= 80 ? 'text-red-600' :
                                                                prediction.riskScore >= 60 ? 'text-orange-600' :
                                                                    'text-green-600'
                                                                }`}>
                                                                {prediction.riskScore}%
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            RUL: {prediction.predictedRUL}h
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 shadow-sm"
                                                        style={{
                                                            backgroundColor: prediction.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                                prediction.priority === 'High' ? 'rgba(245, 158, 11, 0.15)' :
                                                                    prediction.priority === 'Medium' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: prediction.priority === 'Critical' ? 'rgb(239, 68, 68)' :
                                                                prediction.priority === 'High' ? 'rgb(245, 158, 11)' :
                                                                    prediction.priority === 'Medium' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                                            borderColor: prediction.priority === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                                prediction.priority === 'High' ? 'rgba(245, 158, 11, 0.3)' :
                                                                    prediction.priority === 'Medium' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${prediction.priority === 'Critical' ? 'bg-red-500 animate-pulse' :
                                                                prediction.priority === 'High' ? 'bg-orange-500' :
                                                                    prediction.priority === 'Medium' ? 'bg-blue-500' : 'bg-green-500'
                                                                }`} />
                                                            {prediction.priority}
                                                        </div>
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-foreground text-xs">
                                                            {prediction.nextMaintenance}
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 shadow-sm"
                                                            style={{
                                                                backgroundColor: prediction.maintenanceType === 'Emergency' ? 'rgba(239, 68, 68, 0.15)' :
                                                                    prediction.maintenanceType === 'Predictive' ? 'rgba(59, 130, 246, 0.15)' :
                                                                        prediction.maintenanceType === 'Condition-Based' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                                color: prediction.maintenanceType === 'Emergency' ? 'rgb(239, 68, 68)' :
                                                                    prediction.maintenanceType === 'Predictive' ? 'rgb(59, 130, 246)' :
                                                                        prediction.maintenanceType === 'Condition-Based' ? 'rgb(139, 92, 246)' : 'rgb(16, 185, 129)',
                                                                borderColor: prediction.maintenanceType === 'Emergency' ? 'rgba(239, 68, 68, 0.3)' :
                                                                    prediction.maintenanceType === 'Predictive' ? 'rgba(59, 130, 246, 0.3)' :
                                                                        prediction.maintenanceType === 'Condition-Based' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                            }}
                                                        >
                                                            {prediction.maintenanceType}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1">
                                                            <DollarSign className="h-3 w-3 text-green-600" />
                                                            <span className="font-mono font-bold text-sm text-foreground">
                                                                ${prediction.costImpact.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            <span>{prediction.downtimeImpact}h</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 h-7 shadow-sm"
                                                        style={{
                                                            backgroundColor: prediction.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                                prediction.priority === 'High' ? 'rgba(245, 158, 11, 0.15)' :
                                                                    prediction.priority === 'Medium' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: prediction.priority === 'Critical' ? 'rgb(239, 68, 68)' :
                                                                prediction.priority === 'High' ? 'rgb(245, 158, 11)' :
                                                                    prediction.priority === 'Medium' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                                            borderColor: prediction.priority === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                                prediction.priority === 'High' ? 'rgba(245, 158, 11, 0.3)' :
                                                                    prediction.priority === 'Medium' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                        }}
                                                        onClick={() => {
                                                            if (prediction.priority === 'Critical') {
                                                                handleImmediateAction(prediction.equipment);
                                                            } else if (prediction.riskLevel === 'High Risk') {
                                                                handleImmediateAction(prediction.equipment);
                                                            } else if (prediction.riskLevel === 'Medium Risk') {
                                                                handleScheduleMaintenanceAction(prediction.equipment);
                                                            } else {
                                                                handleMonitorAction(prediction.equipment);
                                                            }
                                                        }}
                                                        disabled={isLoading}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${prediction.priority === 'Critical' ? 'bg-red-500 animate-pulse' :
                                                                prediction.priority === 'High' ? 'bg-orange-500' :
                                                                    prediction.priority === 'Medium' ? 'bg-blue-500' : 'bg-green-500'
                                                                }`} />
                                                            {isLoading ? 'Processing...' :
                                                                prediction.priority === 'Critical' ? 'Emergency' :
                                                                    prediction.riskLevel === 'High Risk' ? 'Immediate' :
                                                                        prediction.riskLevel === 'Medium Risk' ? 'Schedule' : 'Monitor'}
                                                        </div>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Schedule */}
                <Card className="border border-border shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <CalendarIcon className="h-6 w-6 text-primary" />
                                    Maintenance Schedule
                                </CardTitle>
                                <CardDescription>
                                    Intelligent maintenance scheduling based on risk assessment and equipment criticality
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsMaintenanceAutoPlay(!isMaintenanceAutoPlay)}
                                    className="gap-2"
                                    aria-label={isMaintenanceAutoPlay ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                                >
                                    {isMaintenanceAutoPlay ? (
                                        <>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                            Auto-Play
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                            Manual
                                        </>
                                    )}
                                </Button>
                                <Badge className="bg-white/20 text-primary">
                                    {maintenanceActiveIndex + 1} / {maintenanceSchedules.length}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative w-full flex flex-col items-center group overflow-x-hidden">
                            <button
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 text-primary rounded-full p-2 shadow hover:bg-primary/20 transition"
                                onClick={() => maintenanceEmblaApi && maintenanceEmblaApi.scrollPrev()}
                                aria-label="Previous"
                            >
                                <ChevronRight className="rotate-180" />
                            </button>
                            <div
                                className="w-full px-6 py-8 overflow-hidden"
                                onMouseEnter={handleMaintenancePause}
                                onMouseLeave={handleMaintenanceResume}
                                onTouchStart={handleMaintenancePause}
                                onTouchEnd={handleMaintenanceResume}
                                ref={maintenanceEmblaRef}
                                role="region"
                                aria-roledescription="carousel"
                                aria-label="Maintenance Schedule Carousel"
                                tabIndex={0}
                            >
                                <div className="flex gap-x-6 -ml-3 md:-ml-6">
                                    {maintenanceSchedules.map((schedule, idx) => {
                                        const isActive = idx === maintenanceActiveIndex;
                                        const isVisible = Math.abs(idx - maintenanceActiveIndex) < maintenanceCardsToShow || (idx - maintenanceActiveIndex + maintenanceSchedules.length) % maintenanceSchedules.length < maintenanceCardsToShow;
                                        return (
                                            <div
                                                key={schedule.id}
                                                className="px-3 w-[35%] min-w-[380px] max-w-[450px] h-[320px] flex-shrink-0 flex flex-col justify-between"
                                                aria-label={`Maintenance Schedule card for ${schedule.equipment}`}
                                                aria-current={isActive ? 'true' : 'false'}
                                                tabIndex={isActive ? 0 : -1}
                                                role="group"
                                                aria-roledescription="slide"
                                            >
                                                <div
                                                    className={
                                                        `box-border rounded-2xl h-full w-full flex flex-col justify-between transition-all duration-500 ease-out overflow-hidden relative group/card ` +
                                                        (isActive
                                                            ? `bg-gradient-to-br from-white/20 to-white/10 dark:from-zinc-900/30 dark:to-zinc-800/20 text-card-foreground border-2 border-primary/60 shadow-xl ring-1 ring-primary/30 backdrop-blur-xl`
                                                            : 'bg-gradient-to-br from-white/10 to-white/5 dark:from-zinc-900/20 dark:to-zinc-800/10 text-card-foreground border border-primary/30 hover:border-primary/50 shadow-lg backdrop-blur-md')
                                                    }
                                                    onClick={() => { maintenanceEmblaApi && maintenanceEmblaApi.scrollTo(idx); handleViewDetails(schedule); }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        transform: isActive ? 'scale(1.05) translateY(-4px)' : 'scale(0.98) translateY(0)',
                                                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: isActive ?
                                                            `0 12px 24px -8px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.2)'}, 0 0 20px 6px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)'}, inset 0 1px 0 rgba(255, 255, 255, 0.15)` :
                                                            `0 6px 16px -4px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.06)'}, inset 0 1px 0 rgba(255, 255, 255, 0.08)`
                                                    }}
                                                >
                                                    {/* Enhanced Animated Background Elements */}
                                                    <div className="absolute inset-0 overflow-hidden">
                                                        {/* Primary floating orb */}
                                                        <div
                                                            className={`absolute -top-8 -right-8 w-16 h-16 rounded-full bg-gradient-to-br from-primary/15 to-primary/8 blur-lg transition-all duration-700 ${isActive ? 'scale-125 opacity-50' : 'scale-100 opacity-25'
                                                                }`}
                                                            style={{
                                                                animation: isActive ? 'float 6s ease-in-out infinite, pulse 4s ease-in-out infinite' : 'none',
                                                                transform: isActive ? 'translate(0, 0) rotate(0deg)' : 'translate(0, 0)',
                                                                filter: isActive ? 'blur(8px) brightness(1.2)' : 'blur(6px)'
                                                            }}
                                                        />
                                                        {/* Secondary floating orb */}
                                                        <div
                                                            className={`absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-gradient-to-tr from-accent/15 to-accent/8 blur-md transition-all duration-700 ${isActive ? 'scale-110 opacity-40' : 'scale-100 opacity-15'
                                                                }`}
                                                            style={{
                                                                animation: isActive ? 'float 8s ease-in-out infinite reverse, pulse 5s ease-in-out infinite' : 'none',
                                                                transform: isActive ? 'translate(0, 0) rotate(0deg)' : 'translate(0, 0)',
                                                                filter: isActive ? 'blur(6px) brightness(1.1)' : 'blur(4px)'
                                                            }}
                                                        />
                                                        {/* Animated particles for active state */}
                                                        {isActive && (
                                                            <>
                                                                <div
                                                                    className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full"
                                                                    style={{
                                                                        animation: 'particleFloat 3s ease-in-out infinite',
                                                                        animationDelay: '0s'
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute top-8 right-8 w-1.5 h-1.5 bg-accent/40 rounded-full"
                                                                    style={{
                                                                        animation: 'particleFloat 4s ease-in-out infinite',
                                                                        animationDelay: '1s'
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute bottom-4 left-4 w-1 h-1 bg-primary/50 rounded-full"
                                                                    style={{
                                                                        animation: 'particleFloat 5s ease-in-out infinite',
                                                                        animationDelay: '2s'
                                                                    }}
                                                                />
                                                                <div
                                                                    className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-accent/30 rounded-full"
                                                                    style={{
                                                                        animation: 'particleFloat 3.5s ease-in-out infinite',
                                                                        animationDelay: '0.5s'
                                                                    }}
                                                                />
                                                            </>
                                                        )}
                                                        {/* Animated border glow for active state */}
                                                        {isActive && (
                                                            <div
                                                                className="absolute inset-0 rounded-2xl"
                                                                style={{
                                                                    background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                                                                    animation: 'borderGlow 4s linear infinite',
                                                                    zIndex: 1
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="p-3 relative z-10 flex flex-col h-full">
                                                        {/* Enhanced Header Section with Priority and Status */}
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap" style={{
                                                            animation: isActive ? 'slideInFromTop 0.6s ease-out' : 'none'
                                                        }}>
                                                            <Badge
                                                                variant={schedule.priority === 'Critical' ? 'destructive' :
                                                                    schedule.priority === 'High' ? 'secondary' :
                                                                        schedule.priority === 'Medium' ? 'outline' : 'default'}
                                                                className="text-sm font-bold tracking-wider shadow-sm transition-all duration-300 group-hover/card:scale-105 border backdrop-blur-sm"
                                                                style={{
                                                                    opacity: isActive ? 1 : 0.2,
                                                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                                                    transition: 'all 0.4s cubic-bezier(0.68,-0.55,0.27,1.55) 0.1s',
                                                                    backgroundColor: schedule.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                                        schedule.priority === 'High' ? 'rgba(245, 158, 11, 0.15)' :
                                                                            schedule.priority === 'Medium' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.15)',
                                                                    color: schedule.priority === 'Critical' ? 'rgb(239, 68, 68)' :
                                                                        schedule.priority === 'High' ? 'rgb(245, 158, 11)' :
                                                                            schedule.priority === 'Medium' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                                                    borderColor: schedule.priority === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                                        schedule.priority === 'High' ? 'rgba(245, 158, 11, 0.3)' :
                                                                            schedule.priority === 'Medium' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                                                                    animation: isActive ? 'textReveal 0.8s ease-out' : 'none'
                                                                }}
                                                            >
                                                                {schedule.priority}
                                                            </Badge>
                                                            <Badge
                                                                variant={schedule.status === 'Scheduled' ? 'outline' :
                                                                    schedule.status === 'In Progress' ? 'secondary' :
                                                                        schedule.status === 'Completed' ? 'default' : 'destructive'}
                                                                className="text-sm font-bold tracking-wider shadow-sm transition-all duration-300 group-hover/card:scale-105 border backdrop-blur-sm"
                                                                style={{
                                                                    opacity: isActive ? 1 : 0.2,
                                                                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                                                                    transition: 'all 0.4s cubic-bezier(0.68,-0.55,0.27,1.55) 0.2s',
                                                                    backgroundColor: schedule.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.1)' :
                                                                        schedule.status === 'In Progress' ? 'rgba(245, 158, 11, 0.15)' :
                                                                            schedule.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                                    color: schedule.status === 'Scheduled' ? 'rgb(59, 130, 246)' :
                                                                        schedule.status === 'In Progress' ? 'rgb(245, 158, 11)' :
                                                                            schedule.status === 'Completed' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                                                                    borderColor: schedule.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.3)' :
                                                                        schedule.status === 'In Progress' ? 'rgba(245, 158, 11, 0.3)' :
                                                                            schedule.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                                                                    animation: isActive ? 'textReveal 0.8s ease-out 0.1s' : 'none'
                                                                }}
                                                            >
                                                                {schedule.status}
                                                            </Badge>
                                                            <span className="ml-auto text-sm text-muted-foreground font-medium flex items-center gap-1" style={{
                                                                opacity: isActive ? 1 : 0.2,
                                                                transform: isActive ? 'translateX(0)' : 'translateX(8px)',
                                                                transition: 'all 0.6s cubic-bezier(0.25,0.46,0.45,0.94) 0.4s',
                                                                animation: isActive ? 'slideInFromRight 0.8s ease-out, textFloat 4s ease-in-out infinite' : 'none'
                                                            }}>
                                                                <CalendarIcon className="h-4 w-4" />
                                                                {schedule.scheduledDate.toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>

                                                        {/* Enhanced Title Section with Equipment Icon */}
                                                        <div className="mb-2" style={{
                                                            opacity: isActive ? 1 : 0.2,
                                                            transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                                                            transition: 'all 0.4s ease-in-out 0.2s',
                                                            animation: isActive ? 'slideInFromLeft 0.7s ease-out' : 'none'
                                                        }}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`p-1.5 rounded-md transition-all duration-400 ${isActive ? 'bg-primary/15 shadow-sm' : 'bg-primary/12'
                                                                    }`}>
                                                                    <Wrench className={`h-4 w-4 transition-all duration-400 ${isActive ? 'text-primary scale-105' : 'text-primary/80'
                                                                        }`} />
                                                                </div>
                                                                <h4 className="font-bold text-lg leading-tight text-card-foreground" style={{
                                                                    color: isActive ? undefined : 'var(--theme-primary, #3B82F6)',
                                                                    backdropFilter: 'blur(2px)',
                                                                    animation: isActive ? 'slideInFromLeft 0.7s ease-out' : 'none'
                                                                }}>
                                                                    {schedule.equipment}
                                                                </h4>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Description Section */}
                                                        <div className="mb-2 flex-grow" style={{
                                                            opacity: isActive ? 1 : 0.2,
                                                            transform: isActive ? 'translateY(0)' : 'translateY(4px)',
                                                            transition: 'all 0.4s ease-in-out 0.3s',
                                                            animation: isActive ? 'fadeInUp 0.9s ease-out' : 'none'
                                                        }}>
                                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed" style={{
                                                                backdropFilter: 'blur(2px)',
                                                                lineHeight: '1.4',
                                                                animation: isActive ? 'textSlideUpReveal 1.2s ease-out, textFadeInBlur 1.5s ease-out' : 'none'
                                                            }}>
                                                                {schedule.description}
                                                            </p>
                                                        </div>

                                                        {/* Enhanced Metadata Section with Icons and Animations */}
                                                        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground mb-3" style={{
                                                            opacity: isActive ? 1 : 0.2,
                                                            transform: isActive ? 'translateY(0)' : 'translateY(3px)',
                                                            transition: 'all 0.5s cubic-bezier(0.25,0.46,0.45,0.94) 0.8s',
                                                            animation: isActive ? 'slideInFromBottom 1.1s ease-out' : 'none'
                                                        }}>
                                                            <div className={`flex items-center gap-2 group/metadata pr-2 transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                                }`} style={{
                                                                    color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                                                                    transition: 'color 0.3s ease-in-out',
                                                                    transitionDelay: '0.8s',
                                                                    animation: isActive ? 'textSlideInStagger 0.8s ease-out 0.8s, textPulse 4s ease-in-out infinite' : 'none'
                                                                }}>
                                                                <div className={`p-1 rounded-sm transition-all duration-300 ${isActive ? 'bg-primary/15 shadow-sm' : 'bg-muted/50'
                                                                    }`}>
                                                                    <Wrench className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-primary scale-105' : 'text-muted-foreground/80'
                                                                        }`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                                                                </div>
                                                                <span className="font-medium transition-colors duration-300" style={{ transitionDelay: '0.8s' }}>
                                                                    {schedule.maintenanceType}
                                                                </span>
                                                            </div>
                                                            <div className={`flex items-center gap-2 group/metadata pr-2 transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                                }`} style={{
                                                                    color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                                                                    transition: 'color 0.3s ease-in-out',
                                                                    transitionDelay: '0.9s',
                                                                    animation: isActive ? 'textSlideInStagger 0.8s ease-out 0.9s, textPulse 4s ease-in-out infinite 0.5s' : 'none'
                                                                }}>
                                                                <div className={`p-1 rounded-sm transition-all duration-300 ${isActive ? 'bg-primary/15 shadow-sm' : 'bg-muted/50'
                                                                    }`}>
                                                                    <Clock className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-primary scale-105' : 'text-muted-foreground/80'
                                                                        }`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                                                                </div>
                                                                <span className="font-medium transition-colors duration-300" style={{ transitionDelay: '0.9s' }}>
                                                                    {schedule.estimatedDuration}h duration
                                                                </span>
                                                            </div>
                                                            <div className={`flex items-center gap-2 group/metadata transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                                }`} style={{
                                                                    color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                                                                    transition: 'color 0.3s ease-in-out',
                                                                    transitionDelay: '1.0s',
                                                                    animation: isActive ? 'textSlideInStagger 0.8s ease-out 1.0s, textPulse 4s ease-in-out infinite 1s' : 'none'
                                                                }}>
                                                                <div className={`p-1 rounded-sm transition-all duration-300 ${isActive ? 'bg-primary/15 shadow-sm' : 'bg-muted/50'
                                                                    }`}>
                                                                    <Target className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-primary scale-105' : 'text-muted-foreground/80'
                                                                        }`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                                                                </div>
                                                                <span className="font-medium transition-colors duration-300" style={{ transitionDelay: '1.0s' }}>
                                                                    Risk: {schedule.riskScore}%
                                                                </span>
                                                            </div>
                                                            <div className={`flex items-center gap-2 group/metadata transition-all duration-300 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                                                }`} style={{
                                                                    color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined,
                                                                    transition: 'color 0.3s ease-in-out',
                                                                    transitionDelay: '1.1s',
                                                                    animation: isActive ? 'textSlideInStagger 0.8s ease-out 1.1s, textPulse 4s ease-in-out infinite 1.5s' : 'none'
                                                                }}>
                                                                <div className={`p-1 rounded-sm transition-all duration-300 ${isActive ? 'bg-primary/15 shadow-sm' : 'bg-muted/50'
                                                                    }`}>
                                                                    <Database className={`h-4 w-4 transition-all duration-300 ${isActive ? 'text-primary scale-105' : 'text-muted-foreground/80'
                                                                        }`} style={{ color: isActive ? 'var(--theme-primary, #3B82F6)' : undefined }} />
                                                                </div>
                                                                <span className="font-medium transition-colors duration-300" style={{ transitionDelay: '1.1s' }}>
                                                                    ${schedule.estimatedCost.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Action Buttons Section */}
                                                        <div className="flex flex-row gap-2 mt-auto justify-center relative" style={{
                                                            opacity: isActive ? 1 : 0.2,
                                                            transform: isActive ? 'scale(1)' : 'scale(0.98)',
                                                            transition: 'all 0.5s cubic-bezier(0.68,-0.55,0.27,1.55) 1.2s',
                                                            animation: isActive ? 'slideInFromBottom 1.3s ease-out' : 'none'
                                                        }}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-md px-3 py-1.5 text-sm font-bold border shadow-sm transition-all duration-300 hover:scale-105 hover:translate-y-[-1px] focus:ring-2 focus:ring-accent focus:outline-none active:scale-95 group/action relative overflow-hidden z-10 backdrop-blur-sm text-card-foreground"
                                                                style={{
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                                    color: 'rgb(59, 130, 246)',
                                                                    borderColor: 'rgba(59, 130, 246, 0.3)'
                                                                }}
                                                                onClick={e => { e.stopPropagation(); handleViewDetails(schedule); }}
                                                                aria-label="View maintenance details"
                                                                title="View maintenance details"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1.5 group-hover/action:scale-105 transition-transform duration-200" />
                                                                <span className="group-hover/action:text-primary transition-colors duration-200 relative z-10">View</span>
                                                            </Button>
                                                            <div className="w-px h-full" style={{
                                                                backgroundColor: 'var(--theme-primary, #3B82F6)',
                                                                opacity: isActive ? 0.4 : 0.15,
                                                                transform: isActive ? 'scaleY(1)' : 'scaleY(0.8)',
                                                                transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
                                                                transitionDelay: '1.3s'
                                                            }}></div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="rounded-md px-3 py-1.5 text-sm font-bold border shadow-sm transition-all duration-300 hover:scale-105 hover:translate-y-[-1px] focus:ring-2 focus:ring-primary focus:outline-none active:scale-95 group/action relative overflow-hidden z-10 backdrop-blur-sm text-card-foreground"
                                                                style={{
                                                                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                                    color: 'rgb(59, 130, 246)',
                                                                    borderColor: 'rgba(59, 130, 246, 0.3)'
                                                                }}
                                                                onClick={e => { e.stopPropagation(); handleScheduleMaintenance(schedule); }}
                                                                aria-label="Schedule maintenance"
                                                                title="Schedule maintenance"
                                                            >
                                                                <CalendarIcon className="h-4 w-4 mr-1.5 group-hover/action:scale-105 transition-transform duration-200" />
                                                                <span className="group-hover/action:text-primary transition-colors duration-200 relative z-10">Schedule</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-primary/10 text-primary rounded-full p-2 shadow hover:bg-primary/20 transition"
                                onClick={() => maintenanceEmblaApi && maintenanceEmblaApi.scrollNext()}
                                aria-label="Next"
                            >
                                <ChevronRight />
                            </button>

                            {/* Auto-sliding Dots Navigation */}
                            <div className="flex justify-center items-center gap-2 mt-6 mb-4">
                                {maintenanceSchedules.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => maintenanceEmblaApi && maintenanceEmblaApi.scrollTo(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 ${index === maintenanceActiveIndex
                                            ? 'bg-primary scale-125 shadow-lg shadow-primary/30'
                                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 scale-100'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                        style={{
                                            animation: index === maintenanceActiveIndex ? 'dotPulse 2s ease-in-out infinite' : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk-Based Analytics */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            Risk-Based Analytics Dashboard
                        </CardTitle>
                        <CardDescription>
                            Advanced analytics and insights for risk-based decision making
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <EnhancedChart
                                title="Risk Score Trends"
                                type="line"
                                data={{
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                    datasets: [{
                                        label: 'Average Risk Score',
                                        data: [45, 52, 48, 61, 58, 55],
                                        borderColor: '#ef4444',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                        tension: 0.4
                                    }, {
                                        label: 'Critical Equipment Risk',
                                        data: [65, 72, 68, 81, 78, 75],
                                        borderColor: '#7c3aed',
                                        backgroundColor: 'rgba(124, 58, 237, 0.1)',
                                        tension: 0.4
                                    }]
                                }}
                                height={300}
                                customOptions={{
                                    scales: {
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Risk Score'
                                            },
                                            min: 0,
                                            max: 100
                                        }
                                    }
                                }}
                            />

                            <EnhancedChart
                                title="Maintenance Cost vs Risk"
                                type="scatter"
                                data={{
                                    datasets: [{
                                        label: 'Equipment Risk vs Cost',
                                        data: [
                                            { x: 25, y: 5000 },
                                            { x: 45, y: 12000 },
                                            { x: 65, y: 15000 },
                                            { x: 85, y: 50000 }
                                        ],
                                        backgroundColor: '#3b82f6'
                                    }]
                                }}
                                height={300}
                                customOptions={{
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Risk Score'
                                            }
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Maintenance Cost ($)'
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Pipeline Management */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Activity className="h-6 w-6 text-primary" />
                                Pipeline Status
                            </CardTitle>
                            <CardDescription>
                                Monitor and control your ML pipeline operations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pipelineStatuses.map((pipeline, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(pipeline.status)}`} />
                                            <div>
                                                <h4 className="font-semibold">{pipeline.name}</h4>
                                                <p className="text-sm text-muted-foreground">{pipeline.lastRun}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 group-hover:scale-105 shadow-sm"
                                                style={{
                                                    backgroundColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' :
                                                        pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.15)' :
                                                            pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                                    color: pipeline.status === 'Active' ? 'rgb(16, 185, 129)' :
                                                        pipeline.status === 'Training' ? 'rgb(245, 158, 11)' :
                                                            pipeline.status === 'Failed' ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)',
                                                    borderColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' :
                                                        pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.3)' :
                                                            pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
                                                }}
                                            >
                                                {pipeline.status}
                                            </Badge>
                                            <div className="flex gap-1">
                                                {pipeline.status === 'Active' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                                            style={{
                                                                backgroundColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' :
                                                                    pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.15)' :
                                                                        pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                                                color: pipeline.status === 'Active' ? 'rgb(16, 185, 129)' :
                                                                    pipeline.status === 'Training' ? 'rgb(245, 158, 11)' :
                                                                        pipeline.status === 'Failed' ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)',
                                                                borderColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' :
                                                                    pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.3)' :
                                                                        pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
                                                            }}
                                                            onClick={() => handleTogglePipeline(pipeline.name, 'pause')}
                                                            disabled={isLoading}
                                                        >
                                                            <Pause className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0 text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                                            style={{
                                                                backgroundColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' :
                                                                    pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.15)' :
                                                                        pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                                                color: pipeline.status === 'Active' ? 'rgb(16, 185, 129)' :
                                                                    pipeline.status === 'Training' ? 'rgb(245, 158, 11)' :
                                                                        pipeline.status === 'Failed' ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)',
                                                                borderColor: pipeline.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' :
                                                                    pipeline.status === 'Training' ? 'rgba(245, 158, 11, 0.3)' :
                                                                        pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
                                                            }}
                                                            onClick={() => handleTogglePipeline(pipeline.name, 'stop')}
                                                            disabled={isLoading}
                                                        >
                                                            <Square className="h-3 w-3" />
                                                        </Button>
                                                    </>
                                                )}
                                                {pipeline.status === 'Idle' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                                        style={{
                                                            backgroundColor: pipeline.status === 'Idle' ? 'rgba(107, 114, 128, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: pipeline.status === 'Idle' ? 'rgb(107, 114, 128)' : 'rgb(16, 185, 129)',
                                                            borderColor: pipeline.status === 'Idle' ? 'rgba(107, 114, 128, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                        }}
                                                        onClick={() => handleTogglePipeline(pipeline.name, 'start')}
                                                        disabled={isLoading}
                                                    >
                                                        <Play className="h-3 w-3" />
                                                    </Button>
                                                )}
                                                {pipeline.status === 'Failed' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                                        style={{
                                                            backgroundColor: pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                                            color: pipeline.status === 'Failed' ? 'rgb(239, 68, 68)' : 'rgb(107, 114, 128)',
                                                            borderColor: pipeline.status === 'Failed' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
                                                        }}
                                                        onClick={() => handlePipelineAction('Restart', pipeline.name)}
                                                        disabled={isLoading}
                                                    >
                                                        <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Model Performance */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <BarChart3 className="h-6 w-6 text-primary" />
                                Model Performance
                            </CardTitle>
                            <CardDescription>
                                Monitor the accuracy and performance of your ML models
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <EnhancedChart
                                    title="Model Accuracy Over Time"
                                    type="line"
                                    data={{
                                        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                                        datasets: [{
                                            label: 'Vibration Model',
                                            data: [85, 87, 89, 91, 92, 94],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Temperature Model',
                                            data: [82, 84, 86, 88, 89, 91],
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'RUL Prediction Model',
                                            data: [78, 81, 84, 87, 89, 92],
                                            borderColor: '#f59e0b',
                                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Risk Assessment Model',
                                            data: [80, 83, 86, 89, 91, 93],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4
                                        }]
                                    }}
                                    height={300}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Accuracy (%)'
                                                },
                                                min: 75,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Real-time Integration Status */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Activity className="h-6 w-6 text-primary" />
                            Real-time Risk Integration Status
                        </CardTitle>
                        <CardDescription>
                            Monitor the integration and status of your risk management systems
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Sensor Data Collection</h4>
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">Real-time vibration, temperature, and pressure data</p>
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                                        Active
                                    </Badge>
                                </div>
                                <div className="p-6 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Risk Assessment</h4>
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">Continuous risk scoring and assessment</p>
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                                        Active
                                    </Badge>
                                </div>
                                <div className="p-6 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Maintenance Scheduling</h4>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">Intelligent maintenance scheduling</p>
                                    <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300">
                                        In Progress
                                    </Badge>
                                </div>
                                <div className="p-6 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold">Alert System</h4>
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">Risk-based alert notifications</p>
                                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
                                        Active
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Assessment Dashboard */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Shield className="h-6 w-6 text-primary" />
                            Risk Assessment Dashboard
                        </CardTitle>
                        <CardDescription>
                            Comprehensive risk analysis and mitigation strategies for equipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">Equipment Risk Scores</h4>
                                <div className="space-y-4">
                                    {riskAssessments.map((assessment, index) => (
                                        <div key={index} className="p-4 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-semibold">{assessment.equipment}</span>
                                                <div className="flex items-center gap-2">
                                                    {getRiskLevelIcon(assessment.riskScore)}
                                                    <span className="font-bold text-lg">{assessment.riskScore}%</span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Vibration:</span>
                                                    <span className="font-mono font-medium">{assessment.factors.vibration}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Temperature:</span>
                                                    <span className="font-mono font-medium">{assessment.factors.temperature}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Operating Hours:</span>
                                                    <span className="font-mono font-medium">{assessment.factors.operatingHours}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Age:</span>
                                                    <span className="font-mono font-medium">{assessment.factors.age}%</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                                    style={{
                                                        backgroundColor: assessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.15)' :
                                                            assessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                        color: assessment.riskScore >= 80 ? 'rgb(239, 68, 68)' :
                                                            assessment.riskScore >= 60 ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)',
                                                        borderColor: assessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.3)' :
                                                            assessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                                                    }}
                                                >
                                                    {assessment.riskScore >= 80 ? 'Critical Risk' : assessment.riskScore >= 60 ? 'High Risk' : 'Medium Risk'}
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                                    style={{
                                                        backgroundColor: assessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.15)' :
                                                            assessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                                        color: assessment.riskScore >= 80 ? 'rgb(239, 68, 68)' :
                                                            assessment.riskScore >= 60 ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)',
                                                        borderColor: assessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.3)' :
                                                            assessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                                                    }}
                                                    onClick={() => handleRiskAnalysis(assessment.equipment)}
                                                    disabled={isLoading}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Analyze
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4 text-lg">Risk Mitigation Actions</h4>
                                <div className="space-y-4">
                                    {riskAssessments.map((assessment, index) => (
                                        <div key={index} className="p-4 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                            <h5 className="font-semibold mb-3 text-primary">{assessment.equipment}</h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Recommendations:</span>
                                                    <ul className="text-sm text-muted-foreground mt-2 space-y-2">
                                                        {assessment.recommendations.slice(0, 2).map((rec, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                                                <span>{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <Separator />
                                                <div>
                                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Mitigation Actions:</span>
                                                    <ul className="text-sm text-muted-foreground mt-2 space-y-2">
                                                        {assessment.mitigationActions.slice(0, 2).map((action, idx) => (
                                                            <li key={idx} className="flex items-start gap-2">
                                                                <Wrench className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                                                <span>{action}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk-Based Maintenance Planning */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="h-6 w-6 text-primary" />
                            Risk-Based Maintenance Planning
                        </CardTitle>
                        <CardDescription>
                            Intelligent maintenance scheduling based on risk assessment and equipment criticality
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Risk Threshold Configuration */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="riskThresholdPlanning" className="text-sm font-medium">Risk Threshold (%)</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            id="riskThresholdPlanning"
                                            type="number"
                                            value={riskThreshold}
                                            onChange={(e) => setRiskThreshold(Number(e.target.value))}
                                            min="0"
                                            max="100"
                                            className="w-20"
                                        />
                                        <span className="text-sm text-muted-foreground">%</span>
                                    </div>
                                    <Progress value={riskThreshold} className="w-full h-2 mt-2" />
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Equipment Filter</Label>
                                    <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select equipment" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Equipment</SelectItem>
                                            <SelectItem value="critical">Critical Equipment</SelectItem>
                                            <SelectItem value="high-risk">High Risk Equipment</SelectItem>
                                            <SelectItem value="scheduled">Scheduled Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Maintenance Type</Label>
                                    <Select value={maintenanceFilter} onValueChange={setMaintenanceFilter}>
                                        <SelectTrigger className="mt-2">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="preventive">Preventive</SelectItem>
                                            <SelectItem value="predictive">Predictive</SelectItem>
                                            <SelectItem value="emergency">Emergency</SelectItem>
                                            <SelectItem value="condition-based">Condition-Based</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Risk Distribution Chart */}
                            <div>
                                <h4 className="font-semibold mb-3">Risk Distribution</h4>
                                <EnhancedChart
                                    title=""
                                    type="doughnut"
                                    data={{
                                        labels: ['Low Risk', 'Medium Risk', 'High Risk', 'Critical'],
                                        datasets: [{
                                            data: [30, 40, 20, 10],
                                            backgroundColor: [
                                                '#10b981', // Green
                                                '#f59e0b', // Yellow
                                                '#ef4444', // Red
                                                '#7c3aed'  // Purple
                                            ]
                                        }]
                                    }}
                                    height={200}
                                />
                            </div>

                            {/* Maintenance Schedule Overview */}
                            <div>
                                <h4 className="font-semibold mb-3">Upcoming Maintenance</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                        <div>
                                            <div className="font-medium text-sm">Emergency</div>
                                            <div className="text-xs text-muted-foreground">2 tasks</div>
                                        </div>
                                        <Badge variant="destructive">Critical</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                        <div>
                                            <div className="font-medium text-sm">High Priority</div>
                                            <div className="text-xs text-muted-foreground">5 tasks</div>
                                        </div>
                                        <Badge variant="secondary">High</Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                        <div>
                                            <div className="font-medium text-sm">Scheduled</div>
                                            <div className="text-xs text-muted-foreground">12 tasks</div>
                                        </div>
                                        <Badge variant="outline">Medium</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Advanced Analytics Dashboard */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <BarChart className="h-6 w-6 text-primary" />
                            Advanced Analytics Dashboard
                        </CardTitle>
                        <CardDescription>
                            Deep insights and predictive analytics for maintenance optimization
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold mb-4">Predictive Maintenance Trends</h4>
                                <EnhancedChart
                                    title=""
                                    type="line"
                                    data={{
                                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                                        datasets: [{
                                            label: 'Preventive Maintenance',
                                            data: [12, 15, 18, 14, 16, 20],
                                            borderColor: '#3b82f6',
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Predictive Maintenance',
                                            data: [8, 12, 15, 18, 22, 25],
                                            borderColor: '#10b981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            tension: 0.4
                                        }, {
                                            label: 'Emergency Maintenance',
                                            data: [3, 2, 1, 2, 1, 0],
                                            borderColor: '#ef4444',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            tension: 0.4
                                        }]
                                    }}
                                    height={250}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Number of Maintenance Events'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Cost Analysis</h4>
                                <EnhancedChart
                                    title=""
                                    type="bar"
                                    data={{
                                        labels: ['Preventive', 'Predictive', 'Emergency', 'Condition-Based'],
                                        datasets: [{
                                            label: 'Average Cost per Event',
                                            data: [5000, 8000, 25000, 12000],
                                            backgroundColor: [
                                                '#3b82f6',
                                                '#10b981',
                                                '#ef4444',
                                                '#f59e0b'
                                            ]
                                        }]
                                    }}
                                    height={250}
                                    customOptions={{
                                        scales: {
                                            y: {
                                                title: {
                                                    display: true,
                                                    text: 'Cost ($)'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Equipment Health Monitoring */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Thermometer className="h-6 w-6 text-primary" />
                            Equipment Health Monitoring
                        </CardTitle>
                        <CardDescription>
                            Real-time monitoring of equipment health and performance metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {rulPredictions.map((prediction, index) => (
                                <div key={index} className="p-4 border rounded-xl bg-card hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-sm">{prediction.equipment}</h4>
                                        <Badge
                                            variant="outline"
                                            className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                            style={{
                                                backgroundColor: prediction.condition === 'Critical' ? 'rgba(239, 68, 68, 0.15)' :
                                                    prediction.condition === 'Poor' ? 'rgba(245, 158, 11, 0.15)' :
                                                        prediction.condition === 'Fair' ? 'rgba(234, 179, 8, 0.15)' :
                                                            prediction.condition === 'Good' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: prediction.condition === 'Critical' ? 'rgb(239, 68, 68)' :
                                                    prediction.condition === 'Poor' ? 'rgb(245, 158, 11)' :
                                                        prediction.condition === 'Fair' ? 'rgb(234, 179, 8)' :
                                                            prediction.condition === 'Good' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                                borderColor: prediction.condition === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                    prediction.condition === 'Poor' ? 'rgba(245, 158, 11, 0.3)' :
                                                        prediction.condition === 'Fair' ? 'rgba(234, 179, 8, 0.3)' :
                                                            prediction.condition === 'Good' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                            }}
                                        >
                                            {prediction.condition}
                                        </Badge>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Vibration</span>
                                                <span>{prediction.vibration}</span>
                                            </div>
                                            <Progress
                                                value={parseFloat(prediction.vibration) * 10}
                                                className="h-1"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>Operating Hours</span>
                                                <span>{prediction.operatingHours.toLocaleString()}</span>
                                            </div>
                                            <Progress
                                                value={(prediction.operatingHours / 25000) * 100}
                                                className="h-1"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                <span>RUL</span>
                                                <span>{prediction.predictedRUL}h</span>
                                            </div>
                                            <Progress
                                                value={(prediction.predictedRUL / 5000) * 100}
                                                className="h-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Risk Score</span>
                                            <span className="font-semibold">{prediction.riskScore}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Alert Management System */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Bell className="h-6 w-6 text-primary" />
                            Alert Management System
                        </CardTitle>
                        <CardDescription>
                            Real-time alerts and notifications for critical events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    <div>
                                        <h4 className="font-semibold text-red-700 dark:text-red-300">Critical Alert</h4>
                                        <p className="text-sm text-red-600 dark:text-red-400">Reserve Motor Unit vibration levels exceeded critical threshold</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                        color: 'rgb(239, 68, 68)',
                                        borderColor: 'rgba(239, 68, 68, 0.3)'
                                    }}>
                                        Acknowledge
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}>
                                        View Details
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <h4 className="font-semibold text-orange-700 dark:text-orange-300">Warning Alert</h4>
                                        <p className="text-sm text-orange-600 dark:text-orange-400">Secondary Water Pump temperature trending upward</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                                        color: 'rgb(245, 158, 11)',
                                        borderColor: 'rgba(245, 158, 11, 0.3)'
                                    }}>
                                        Acknowledge
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}>
                                        View Details
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Info className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Info Alert</h4>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">Scheduled maintenance completed for Auxiliary Motor Unit</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}>
                                        Acknowledge
                                    </Button>
                                    <Button size="sm" variant="outline" className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm" style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}>
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Maintenance Details Dialog */}
            <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Maintenance Details</DialogTitle>
                        <DialogDescription>
                            Detailed information about the selected maintenance schedule
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMaintenance && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium">Equipment</Label>
                                    <p className="text-sm text-muted-foreground">{selectedMaintenance.equipment}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Maintenance Type</Label>
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                        style={{
                                            backgroundColor: selectedMaintenance.maintenanceType === 'Emergency' ? 'rgba(239, 68, 68, 0.08)' :
                                                selectedMaintenance.maintenanceType === 'Predictive' ? 'rgba(59, 130, 246, 0.08)' :
                                                    selectedMaintenance.maintenanceType === 'Condition-Based' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                            color: selectedMaintenance.maintenanceType === 'Emergency' ? 'rgb(239, 68, 68)' :
                                                selectedMaintenance.maintenanceType === 'Predictive' ? 'rgb(59, 130, 246)' :
                                                    selectedMaintenance.maintenanceType === 'Condition-Based' ? 'rgb(139, 92, 246)' : 'rgb(16, 185, 129)',
                                            borderColor: selectedMaintenance.maintenanceType === 'Emergency' ? 'rgba(239, 68, 68, 0.3)' :
                                                selectedMaintenance.maintenanceType === 'Predictive' ? 'rgba(59, 130, 246, 0.3)' :
                                                    selectedMaintenance.maintenanceType === 'Condition-Based' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        {selectedMaintenance.maintenanceType}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Scheduled Date</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedMaintenance.scheduledDate.toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Duration</Label>
                                    <p className="text-sm text-muted-foreground">{selectedMaintenance.estimatedDuration} hours</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Priority</Label>
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                        style={{
                                            backgroundColor: selectedMaintenance.priority === 'Critical' ? 'rgba(239, 68, 68, 0.08)' :
                                                selectedMaintenance.priority === 'High' ? 'rgba(245, 158, 11, 0.08)' :
                                                    selectedMaintenance.priority === 'Medium' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                            color: selectedMaintenance.priority === 'Critical' ? 'rgb(239, 68, 68)' :
                                                selectedMaintenance.priority === 'High' ? 'rgb(245, 158, 11)' :
                                                    selectedMaintenance.priority === 'Medium' ? 'rgb(59, 130, 246)' : 'rgb(16, 185, 129)',
                                            borderColor: selectedMaintenance.priority === 'Critical' ? 'rgba(239, 68, 68, 0.3)' :
                                                selectedMaintenance.priority === 'High' ? 'rgba(245, 158, 11, 0.3)' :
                                                    selectedMaintenance.priority === 'Medium' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        {selectedMaintenance.priority}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Risk Score</Label>
                                    <p className="text-sm text-muted-foreground">{selectedMaintenance.riskScore}%</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Estimated Cost</Label>
                                    <p className="text-sm text-muted-foreground">${selectedMaintenance.estimatedCost.toLocaleString()}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Status</Label>
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                        style={{
                                            backgroundColor: selectedMaintenance.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.08)' :
                                                selectedMaintenance.status === 'In Progress' ? 'rgba(245, 158, 11, 0.08)' :
                                                    selectedMaintenance.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                                            color: selectedMaintenance.status === 'Scheduled' ? 'rgb(59, 130, 246)' :
                                                selectedMaintenance.status === 'In Progress' ? 'rgb(245, 158, 11)' :
                                                    selectedMaintenance.status === 'Completed' ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
                                            borderColor: selectedMaintenance.status === 'Scheduled' ? 'rgba(59, 130, 246, 0.3)' :
                                                selectedMaintenance.status === 'In Progress' ? 'rgba(245, 158, 11, 0.3)' :
                                                    selectedMaintenance.status === 'Completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                        }}
                                    >
                                        {selectedMaintenance.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Description</Label>
                                <p className="text-sm text-muted-foreground mt-1">{selectedMaintenance.description}</p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Required Parts</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {selectedMaintenance.requiredParts.map((part, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                            style={{
                                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                                color: 'rgb(59, 130, 246)',
                                                borderColor: 'rgba(59, 130, 246, 0.3)'
                                            }}
                                        >
                                            {part}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => setShowMaintenanceDialog(false)}
                                    className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                    style={{
                                        backgroundColor: 'rgba(107, 114, 128, 0.08)',
                                        color: 'rgb(107, 114, 128)',
                                        borderColor: 'rgba(107, 114, 128, 0.3)'
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleScheduleMaintenance(selectedMaintenance)}
                                    className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                    style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <Wrench className="h-4 w-4 mr-2" />
                                    Schedule Now
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Risk Analysis Dialog */}
            <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Risk Analysis Details</DialogTitle>
                        <DialogDescription>
                            Comprehensive risk analysis and mitigation strategies
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRiskAssessment && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">{selectedRiskAssessment.equipment}</h3>
                                <Badge
                                    variant="outline"
                                    className="text-xs font-bold tracking-wide border backdrop-blur-sm transition-all duration-300 shadow-sm"
                                    style={{
                                        backgroundColor: selectedRiskAssessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.08)' :
                                            selectedRiskAssessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                                        color: selectedRiskAssessment.riskScore >= 80 ? 'rgb(239, 68, 68)' :
                                            selectedRiskAssessment.riskScore >= 60 ? 'rgb(245, 158, 11)' : 'rgb(59, 130, 246)',
                                        borderColor: selectedRiskAssessment.riskScore >= 80 ? 'rgba(239, 68, 68, 0.3)' :
                                            selectedRiskAssessment.riskScore >= 60 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    Risk Score: {selectedRiskAssessment.riskScore}%
                                </Badge>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Risk Factors Breakdown</Label>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Vibration:</span>
                                            <span className="font-mono">{selectedRiskAssessment.factors.vibration}%</span>
                                        </div>
                                        <Progress value={selectedRiskAssessment.factors.vibration} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Temperature:</span>
                                            <span className="font-mono">{selectedRiskAssessment.factors.temperature}%</span>
                                        </div>
                                        <Progress value={selectedRiskAssessment.factors.temperature} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Operating Hours:</span>
                                            <span className="font-mono">{selectedRiskAssessment.factors.operatingHours}%</span>
                                        </div>
                                        <Progress value={selectedRiskAssessment.factors.operatingHours} className="h-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Age:</span>
                                            <span className="font-mono">{selectedRiskAssessment.factors.age}%</span>
                                        </div>
                                        <Progress value={selectedRiskAssessment.factors.age} className="h-2" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Recommendations</Label>
                                <ul className="space-y-2 mt-2">
                                    {selectedRiskAssessment.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Mitigation Actions</Label>
                                <ul className="space-y-2 mt-2">
                                    {selectedRiskAssessment.mitigationActions.map((action, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    onClick={() => setShowRiskDialog(false)}
                                    className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                    style={{
                                        backgroundColor: 'rgba(107, 114, 128, 0.08)',
                                        color: 'rgb(107, 114, 128)',
                                        borderColor: 'rgba(107, 114, 128, 0.3)'
                                    }}
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleRiskAnalysis(selectedRiskAssessment.equipment)}
                                    className="text-xs font-bold border shadow-sm transition-all duration-300 backdrop-blur-sm"
                                    style={{
                                        backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                        color: 'rgb(59, 130, 246)',
                                        borderColor: 'rgba(59, 130, 246, 0.3)'
                                    }}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Apply Mitigation
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EnhancedMLPipelines; 