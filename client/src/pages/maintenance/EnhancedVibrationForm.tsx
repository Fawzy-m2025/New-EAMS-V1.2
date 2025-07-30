import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemedInput } from '@/components/ui/themed-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FailureAnalysisEngine, VibrationData, FailureAnalysis } from '@/utils/failureAnalysisEngine';
import { FailureAnalysisCard, MasterHealthDashboard, SeverityIndicator } from '@/components/analytics/AnalyticsComponents';
import { EnhancedFailureAnalysisCarousel } from '@/components/analytics/EnhancedFailureAnalysisCarousel';
import { ReliabilityEngineService } from '@/services/reliabilityEngineService';
import {
    CalendarIcon,
    Activity,
    Thermometer,
    Zap,
    Settings,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Info,
    Plus,
    ChevronRight,
    ChevronLeft,
    ArrowLeft,
    MapPin,
    Gauge,
    Waves,
    Factory,
    Cog,
    Shield,
    Target,
    Cpu,
    Database,
    Search,
    Filter,
    Eye,
    Download,
    Upload,
    FileText,
    Edit,
    Brain,
    Lightbulb,
    TrendingDown,
    Clock,
    AlertCircle,
    RefreshCw,
    X,
    CheckCircle2,
    Wrench,
    ClipboardList,
    Timer,
    Zap as Lightning,
    TrendingUp as TrendUp,
    BarChart,
    PieChart,
    LineChart,
    Sparkles,
    Star,
    Award,
    Layers,
    Grid,
    Maximize2,
    Minimize2,
    MoreVertical,
    PlayCircle,
    DollarSign
} from 'lucide-react';
import { useAssetContext } from '@/contexts/AssetContext';
import { useToast } from '@/hooks/use-toast';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTheme } from '@/hooks/use-theme';
// 📊 CHART.JS IMPORTS - Using project's existing Chart.js setup
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    ChartTooltip,
    ChartLegend,
    Filler
);

// 🎨 USE PROJECT'S EXISTING CHART SYSTEM
import { getChartOptions, CHART_COLORS } from '@/utils/chart-config';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import type { VibrationHistoryRecord } from '@/data/vibrationHistoryData';
import { allHierarchicalEquipment, zoneA } from '@/data/hierarchicalAssetData';
import { MultiEquipmentSelector } from '@/components/maintenance/MultiEquipmentSelector';
import { MultiEquipmentSpecifications } from '@/components/maintenance/MultiEquipmentSpecifications';
import { cn } from '@/lib/utils';
import { getVibrationInputColor, getVibrationTooltip, analyzeVibrationData, ISO10816_THRESHOLDS, getISO10816Zone, calcRMSVelocity } from '@/utils/vibrationUtils';
// Removed AI Assessment Center imports

interface EnhancedVibrationFormProps {
    open: boolean;
    onClose: () => void;
    record?: VibrationHistoryRecord | null;
    readOnly?: boolean;
}

// Intelligent Maintenance Planning Interfaces
interface MaintenanceTask {
    id: string;
    title: string;
    description: string;
    priority: 'critical' | 'urgent' | 'high' | 'medium' | 'low';
    estimatedDuration: number; // hours
    scheduledDate: Date;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    assignedTo?: string;
    equipmentId: string;
    failureMode?: string;
    rulDays?: number;
    workOrderNumber?: string;
    completionNotes?: string;
    effectiveness?: number; // 0-100%
}

interface MaintenancePlan {
    id: string;
    equipmentId: string;
    planName: string;
    createdDate: Date;
    lastUpdated: Date;
    tasks: MaintenanceTask[];
    totalEstimatedHours: number;
    completionPercentage: number;
    nextCriticalTask?: MaintenanceTask;
    rulPrediction?: {
        estimatedRUL: number;
        confidence: number;
        criticalFailureDate: Date;
    };
}

interface ChartDataPoint {
    x: number | string | Date;
    y: number;
    label?: string;
    color?: string;
}

interface AdvancedChartConfig {
    type: 'line' | 'bar' | 'scatter' | 'doughnut' | 'radar';
    title: string;
    data: ChartDataPoint[];
    options?: any;
    height?: number;
}

// Multi-step wizard steps
const FORM_STEPS = [
    { id: 'equipment', title: 'Equipment Selection', icon: Factory, description: 'Select equipment for vibration monitoring' },
    { id: 'operational', title: 'Operational Data', icon: Gauge, description: 'Enter operational parameters' },
    { id: 'vibration', title: 'Vibration Measurements', icon: Waves, description: 'Record vibration readings' },
    { id: 'analysis', title: 'Analysis & Review', icon: BarChart, description: 'Review and analyze data' }
];

// Using standardized vibration utilities imported from vibrationUtils.ts

// Equipment categories with enhanced metadata
const EQUIPMENT_CATEGORIES = {
    pump: {
        label: 'Pumps',
        icon: Cpu,
        color: 'bg-blue-500',
        description: 'Centrifugal and positive displacement pumps',
        vibrationLimits: { good: 2.8, acceptable: 7.1, unacceptable: 18.0 }
    },
    motor: {
        label: 'Motors',
        icon: Zap,
        color: 'bg-green-500',
        description: 'Electric motors and drives',
        vibrationLimits: { good: 1.8, acceptable: 4.5, unacceptable: 11.0 }
    }
};

// Generate enhanced equipment options with memory optimization
const generateEquipmentOptions = () => {
    return allHierarchicalEquipment
        .filter(eq => ['pump', 'motor'].includes(eq.category))
        .slice(0, 30) // Limit to first 30 items for memory optimization
        .map(equipment => ({
            id: equipment.id,
            name: equipment.name,
            manufacturer: equipment.manufacturer,
            model: equipment.model,
            assetTag: equipment.assetTag,
            category: equipment.category,
            location: equipment.location,
            serialNumber: equipment.serialNumber,
            specifications: equipment.specifications,
            hierarchicalPath: `${equipment.location?.zone || 'Zone A'} → ${equipment.location?.station || 'Unknown'} → ${equipment.location?.line || equipment.location?.system || 'Equipment'}`,
            categoryInfo: EQUIPMENT_CATEGORIES[equipment.category as keyof typeof EQUIPMENT_CATEGORIES]
        }));
};

const equipmentOptions = generateEquipmentOptions();

// Enhanced form structure with comprehensive data
const initialFormData = {
    // Step 1: Equipment Selection
    selectedEquipment: '',
    equipmentDetails: null as any,
    selectedEquipmentList: [] as string[],

    // Step 2: Operational Data
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    operator: '',
    shift: '',

    // Operating Conditions
    operatingHours: '',
    operatingPower: '',
    operatingSpeed: '',
    operatingTemperature: '',
    operatingPressure: '',
    operatingFlow: '',
    operatingVoltage: '',
    operatingCurrent: '',
    operatingFrequency: '',
    operatingEfficiency: '',

    // Environmental Conditions
    ambientTemperature: '',
    humidity: '',
    vibrationLevel: '',
    noiseLevel: '',

    // Process Parameters
    suctionPressure: '',
    dischargePressure: '',
    flowRate: '',
    head: '',
    powerConsumption: '',
    efficiency: '',

    // Step 3: Vibration Measurements - Using NDE/DE data for FailureAnalysisEngine
    vibrationData: {
        // Pump Measurements - Using standardized field names with NDE, DE
        pump: {
            nde: {
                bv: '',      // Bearing vibration
                bg: '',      // Bearing gap
                accV: '',    // Acceleration Vertical
                accH: '',    // Acceleration Horizontal
                accAxl: '',  // Acceleration Axial
                velV: '',    // Velocity Vertical
                velH: '',    // Velocity Horizontal
                velAxl: '',  // Velocity Axial
                temp: ''     // Temperature
            },
            de: {
                bv: '',      // Bearing vibration
                bg: '',      // Bearing gap
                accV: '',    // Acceleration Vertical
                accH: '',    // Acceleration Horizontal
                accAxl: '',  // Acceleration Axial
                velV: '',    // Velocity Vertical
                velH: '',    // Velocity Horizontal
                velAxl: '',  // Velocity Axial
                temp: ''     // Temperature
            }
        },
        // Motor Measurements - Using standardized field names with NDE, DE
        motor: {
            nde: {
                bv: '',      // Bearing vibration
                bg: '',      // Bearing gap
                accV: '',    // Acceleration Vertical
                accH: '',    // Acceleration Horizontal
                accAxl: '',  // Acceleration Axial
                velV: '',    // Velocity Vertical
                velH: '',    // Velocity Horizontal
                velAxl: '',  // Velocity Axial
                temp: ''     // Temperature
            },
            de: {
                bv: '',      // Bearing vibration
                bg: '',      // Bearing gap
                accV: '',    // Acceleration Vertical
                accH: '',    // Acceleration Horizontal
                accAxl: '',  // Acceleration Axial
                velV: '',    // Velocity Vertical
                velH: '',    // Velocity Horizontal
                velAxl: '',  // Velocity Axial
                temp: ''     // Temperature
            }
        }
    },

    // Step 4: Analysis & Review
    overallCondition: '',
    recommendations: '',
    nextInspectionDate: '',
    notes: '',
    priority: '',
    maintenanceRequired: false,
    immediateAction: false
};

// AI Assessment interfaces
interface AIConditionAssessment {
    healthScore: number;
    overallCondition: string;
    priority: string;
    confidence: number;
    maintenanceRequired: boolean;
    immediateAction: boolean;
    nextInspectionDate: string;
    recommendations: Array<{
        title: string;
        description: string;
    }>;
    anomalies: any[];
}

// Utility function for safe display of values
const safeDisplayUtil = (value: any, decimals: number = 0, fallback: string = 'N/A'): string => {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === 'string' && value.trim() === '') {
        return fallback;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

    if (isNaN(numValue) || !isFinite(numValue)) {
        return fallback;
    }

    return numValue.toFixed(decimals);
};

// Removed AI Assessment Engine







const EnhancedVibrationForm: React.FC<EnhancedVibrationFormProps> = ({
    open,
    onClose,
    record,
    readOnly = false
}) => {
    const { addVibrationHistoryEntry } = useAssetContext();
    const { toast } = useToast();
    const { getThemeClasses } = useThemeColors();
    const { theme } = useTheme();
    const themeClasses = getThemeClasses();
    // Use project's chart system
    const chartOptions = getChartOptions('bar');

    // Form state
    const [currentStep, setCurrentStep] = useState(0);
    const [formProgress, setFormProgress] = useState(0);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePoint, setActivePoint] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [alertDetails, setAlertDetails] = useState<any>({});

    // Intelligent Maintenance Planning State
    const [maintenancePlan, setMaintenancePlan] = useState<MaintenancePlan | null>(null);
    const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
    const [showMaintenancePlanner, setShowMaintenancePlanner] = useState(false);
    const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

    // Advanced Charts State
    const [chartConfigs, setChartConfigs] = useState<AdvancedChartConfig[]>([]);
    const [selectedChartType, setSelectedChartType] = useState<'trend' | 'statistical' | 'rul' | 'health'>('trend');
    const [chartTimeRange, setChartTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [showChartsPanel, setShowChartsPanel] = useState(false);

    // Real-time Data Visualization State
    const [realTimeData, setRealTimeData] = useState<any>({});
    const [isLiveDataActive, setIsLiveDataActive] = useState(false);
    const [dataUpdateInterval, setDataUpdateInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
    const [liveDataBuffer, setLiveDataBuffer] = useState<any[]>([]);
    const [anomalyDetectionActive, setAnomalyDetectionActive] = useState(true);

    // AI Assessment state
    const [aiAssessment, setAiAssessment] = useState<any>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [lastAssessmentTime, setLastAssessmentTime] = useState<Date | null>(null);

    // Failure Analysis Cards state
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    // Reliability enhancement state
    const [reliabilityData, setReliabilityData] = useState<any>(null);

    // Standards Compliance Widget State
    const [showStandardsWidget, setShowStandardsWidget] = useState(false);

    // Enhanced user feedback state
    const [userFeedback, setUserFeedback] = useState<{
        type: 'error' | 'warning' | 'info' | 'success';
        title: string;
        message: string;
        show: boolean;
    }>({
        type: 'info',
        title: '',
        message: '',
        show: false
    });

    // Missing data dialog state
    const [missingDataDialog, setMissingDataDialog] = useState<{
        show: boolean;
        missingData: { type: string; reason: string }[];
        onAccept: () => void;
        onGoBack: () => void;
    }>({
        show: false,
        missingData: [],
        onAccept: () => { },
        onGoBack: () => { }
    });

    // Safe display function with user feedback
    const safeDisplay = (value: any, decimals: number = 0, fallback: string = 'N/A', context: string = ''): string => {
        if (value === null || value === undefined) {
            if (context) {
                setUserFeedback({
                    type: 'warning',
                    title: 'Missing Data',
                    message: `${context} data is missing. Please check your input values.`,
                    show: true
                });
            }
            return fallback;
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

        if (isNaN(numValue) || !isFinite(numValue)) {
            setUserFeedback({
                type: 'error',
                title: 'Calculation Error',
                message: `Unable to calculate ${context || 'value'}. This may be due to invalid input data or a calculation error. Please verify your vibration readings and try again.`,
                show: true
            });
            return fallback;
        }

        return decimals > 0 ? numValue.toFixed(decimals) : Math.round(numValue).toString();
    };

    // Enhanced error handling for calculations
    const handleCalculationError = (error: any, context: string) => {
        console.error(`Calculation error in ${context}:`, error);
        setUserFeedback({
            type: 'error',
            title: 'Calculation Error',
            message: `An error occurred while calculating ${context}. Please check your input values and try again. If the problem persists, please contact support.`,
            show: true
        });
    };

    // Auto-dismiss success messages after 5 seconds
    useEffect(() => {
        if (userFeedback.show && userFeedback.type === 'success') {
            const timer = setTimeout(() => {
                setUserFeedback(prev => ({ ...prev, show: false }));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [userFeedback.show, userFeedback.type]);

    // Toggle card expansion
    const toggleCardExpansion = (cardType: string) => {
        setExpandedCards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cardType)) {
                newSet.delete(cardType);
            } else {
                newSet.add(cardType);
            }
            return newSet;
        });
    };



    // Calculate real reliability analysis based on actual entered vibration data
    const calculateRealReliabilityAnalysis = (formData: any) => {
        try {
            // Validate that we have meaningful vibration data before proceeding
            if (!hasValidVibrationData(formData.vibrationData)) {
                setUserFeedback({
                    type: 'warning',
                    title: 'Insufficient Data',
                    message: 'Reliability analysis requires vibration measurements. Please enter vibration data first.',
                    show: true
                });
                return null; // Return null if no valid vibration data
            }

            // Extract actual vibration measurements from form
            const vibrationData = formData.vibrationData || {};

            // Calculate average vibration levels from actual entered data
            const pumpVibrations = [];
            const motorVibrations = [];

            // Pump NDE/DE measurements
            if (vibrationData.pump?.nde) {
                const nde = vibrationData.pump.nde;
                pumpVibrations.push(
                    parseFloat(nde.velH || '0'),
                    parseFloat(nde.velV || '0'),
                    parseFloat(nde.velAxl || '0')
                );
            }
            if (vibrationData.pump?.de) {
                const de = vibrationData.pump.de;
                pumpVibrations.push(
                    parseFloat(de.velH || '0'),
                    parseFloat(de.velV || '0'),
                    parseFloat(de.velAxl || '0')
                );
            }

            // Motor NDE/DE measurements
            if (vibrationData.motor?.nde) {
                const nde = vibrationData.motor.nde;
                motorVibrations.push(
                    parseFloat(nde.velH || '0'),
                    parseFloat(nde.velV || '0'),
                    parseFloat(nde.velAxl || '0')
                );
            }
            if (vibrationData.motor?.de) {
                const de = vibrationData.motor.de;
                motorVibrations.push(
                    parseFloat(de.velH || '0'),
                    parseFloat(de.velV || '0'),
                    parseFloat(de.velAxl || '0')
                );
            }

            // Calculate averages (filter out zeros and invalid values)
            const pumpNonZero = pumpVibrations.filter(v => !isNaN(v) && isFinite(v) && v > 0);
            const motorNonZero = motorVibrations.filter(v => !isNaN(v) && isFinite(v) && v > 0);

            const pumpAvg = pumpNonZero.length > 0 ? pumpNonZero.reduce((a, b) => a + b, 0) / pumpNonZero.length : 0;
            const motorAvg = motorNonZero.length > 0 ? motorNonZero.reduce((a, b) => a + b, 0) / motorNonZero.length : 0;

            // Calculate system average more safely
            let systemAvg = 0;
            if (pumpAvg > 0 && motorAvg > 0) {
                systemAvg = (pumpAvg + motorAvg) / 2;
            } else if (pumpAvg > 0) {
                systemAvg = pumpAvg;
            } else if (motorAvg > 0) {
                systemAvg = motorAvg;
            } else {
                systemAvg = 1.0; // Default safe value when no data
            }

            // Ensure systemAvg is valid
            systemAvg = isNaN(systemAvg) || !isFinite(systemAvg) ? 1.0 : Math.max(0.1, systemAvg);



            // Get operational parameters from actual form data with safe parsing
            const safeParseFloat = (value: any, defaultValue: number): number => {
                if (value === null || value === undefined || value === '') return defaultValue;
                const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
                return isNaN(parsed) || !isFinite(parsed) ? defaultValue : Math.max(0, parsed);
            };

            const operatingHours = safeParseFloat(formData.operatingHours, 4000);
            const operatingPower = safeParseFloat(formData.operatingPower, 75);
            const efficiency = safeParseFloat(formData.efficiency, 85);
            const temperature = safeParseFloat(formData.ambientTemperature, 25);

            // Calculate reliability metrics based on actual vibration levels
            // Higher vibration = lower reliability
            const baseMTBF = 6000; // Base MTBF in hours
            const vibrationFactor = Math.max(0.1, Math.min(1.0, 1.0 - (systemAvg - 2.0) / 10.0)); // Reduce MTBF with higher vibration
            const temperatureFactor = Math.max(0.8, Math.min(1.0, 1.0 - (temperature - 25) / 100)); // Temperature effect
            const powerFactor = Math.max(0.9, Math.min(1.2, operatingPower / 100)); // Power efficiency effect

            const mtbf = Math.max(100, baseMTBF * vibrationFactor * temperatureFactor * powerFactor); // Ensure minimum MTBF
            const mttr = 24; // Mean time to repair
            const availability = Math.max(0, Math.min(100, (mtbf / (mtbf + mttr)) * 100)); // Ensure valid percentage
            const failureRate = mtbf > 0 ? 1 / mtbf : 0; // Prevent division by zero

            // Weibull parameters based on actual conditions
            const beta = Math.max(1.0, Math.min(3.0, systemAvg > 6 ? 1.2 : systemAvg > 3 ? 2.0 : 2.5)); // Shape parameter
            const eta = Math.max(100, mtbf * Math.pow(Math.log(2), 1 / beta)); // Scale parameter

            // Calculate reliability at current operating time
            const reliabilityAtTime = Math.max(0, Math.min(1, Math.exp(-Math.pow(operatingHours / eta, beta))));

            // Calculate Remaining Useful Life
            const targetReliability = 0.1; // 10% reliability threshold
            const logTarget = Math.log(targetReliability);
            const rulTime = eta * Math.pow(-logTarget, 1 / beta);
            const rul = Math.max(0, isNaN(rulTime) || !isFinite(rulTime) ? 1000 : rulTime - operatingHours);

            // Generate failure modes based on actual vibration levels
            const failureModes = [
                {
                    mode: "Bearing Failure",
                    probability: Math.min(0.8, 0.05 + (systemAvg / 10)),
                    severity: 8,
                    detectability: 6,
                    rpn: Math.round((0.05 + (systemAvg / 10)) * 8 * 6 * 100)
                },
                {
                    mode: "Unbalance",
                    probability: Math.min(0.6, 0.03 + (systemAvg / 15)),
                    severity: 6,
                    detectability: 4,
                    rpn: Math.round((0.03 + (systemAvg / 15)) * 6 * 4 * 100)
                },
                {
                    mode: "Misalignment",
                    probability: Math.min(0.5, 0.02 + (systemAvg / 20)),
                    severity: 7,
                    detectability: 5,
                    rpn: Math.round((0.02 + (systemAvg / 20)) * 7 * 5 * 100)
                },
                {
                    mode: "Looseness",
                    probability: Math.min(0.4, 0.01 + (systemAvg / 25)),
                    severity: 5,
                    detectability: 3,
                    rpn: Math.round((0.01 + (systemAvg / 25)) * 5 * 3 * 100)
                }
            ];

            // Maintenance optimization
            const optimalInterval = Math.max(100, mtbf * 0.7); // 70% of MTBF, minimum 100 hours
            const failureCost = 25000;
            const maintenanceCost = 3000;
            const failureCostPerYear = mtbf > 0 ? (8760 / mtbf * failureCost) : 0;
            const maintenanceCostPerYear = optimalInterval > 0 ? (8760 / optimalInterval * maintenanceCost) : 0;
            const costSavings = Math.max(0, failureCostPerYear - maintenanceCostPerYear);

            // Overall health based on actual vibration levels
            const healthScore = Math.max(0, Math.min(100, 100 - Math.max(0, systemAvg - 1.0) * 12));

            // Trend direction based on vibration severity
            let trendDirection = "improving";
            if (systemAvg > 6.0) trendDirection = "degrading";
            else if (systemAvg > 3.0) trendDirection = "stable";

            // Helper function to ensure valid numbers in results
            const safeRound = (value: number, decimals: number = 0): number => {
                if (isNaN(value) || !isFinite(value)) return 0;
                const factor = Math.pow(10, decimals);
                return Math.round(value * factor) / factor;
            };

            const result = {
                reliability_metrics: {
                    mtbf: safeRound(mtbf),
                    mttr: safeRound(mttr),
                    availability: safeRound(availability, 2),
                    reliability_at_time: safeRound(reliabilityAtTime, 4),
                    failure_rate: safeRound(failureRate, 6)
                },
                weibull_analysis: {
                    beta: safeRound(beta, 2),
                    eta: safeRound(eta),
                    gamma: 0,
                    r_squared: 0.92
                },
                rul_prediction: {
                    remaining_useful_life: safeRound(rul),
                    confidence_interval: {
                        lower: safeRound(rul * 0.8),
                        upper: safeRound(rul * 1.2)
                    },
                    prediction_accuracy: 85
                },
                failure_modes: failureModes,
                maintenance_optimization: {
                    optimal_interval: safeRound(optimalInterval),
                    cost_savings: safeRound(costSavings),
                    recommended_actions: [
                        systemAvg > 5 ? "Immediate inspection required" : "Schedule preventive maintenance",
                        "Monitor vibration trends closely",
                        systemAvg > 4 ? "Check bearing condition" : "Check lubrication levels",
                        systemAvg > 6 ? "Consider equipment replacement" : "Verify alignment",
                        "Review operating parameters"
                    ]
                },
                condition_indicators: {
                    overall_health: safeRound(healthScore, 1),
                    degradation_rate: safeRound(systemAvg / 100, 4),
                    anomaly_score: Math.round(Math.min(100, systemAvg * 15) * 10) / 10,
                    trend_direction: trendDirection
                }
            };


            return result;
        } catch (error) {
            console.error('Error in reliability calculation:', error);
            handleCalculationError(error, 'reliability analysis');
            return null;
        }
    };

    // Removed AI Assessment Engine

    // Initialize Reliability Engine Service
    const reliabilityService = ReliabilityEngineService.getInstance();

    // Form setup
    const methods = useForm({
        defaultValues: initialFormData
    });

    const { control, handleSubmit, watch, setValue, getValues, formState: { errors } } = methods;
    const formValues = watch();

    // Get first equipment for reference
    const firstEquipment = selectedEquipment.length > 0
        ? equipmentOptions.find(eq => eq.id === selectedEquipment[0])
        : null;

    // Calculate form progress
    useEffect(() => {
        const totalSteps = FORM_STEPS.length;
        const progress = ((currentStep + 1) / totalSteps) * 100;
        setFormProgress(progress);
    }, [currentStep]);

    // Helper function to validate if vibration data has meaningful values
    const hasValidVibrationData = (vibrationData: any): boolean => {
        if (!vibrationData) return false;

        // Check pump measurements for non-zero values
        const pumpValues = [];
        if (vibrationData.pump?.nde) {
            pumpValues.push(
                parseFloat(vibrationData.pump.nde.velV || '0'),
                parseFloat(vibrationData.pump.nde.velH || '0'),
                parseFloat(vibrationData.pump.nde.velAxl || '0')
            );
        }
        if (vibrationData.pump?.de) {
            pumpValues.push(
                parseFloat(vibrationData.pump.de.velV || '0'),
                parseFloat(vibrationData.pump.de.velH || '0'),
                parseFloat(vibrationData.pump.de.velAxl || '0')
            );
        }


        // Check motor measurements for non-zero values
        const motorValues = [];
        if (vibrationData.motor?.nde) {
            motorValues.push(
                parseFloat(vibrationData.motor.nde.velV || '0'),
                parseFloat(vibrationData.motor.nde.velH || '0'),
                parseFloat(vibrationData.motor.nde.velAxl || '0')
            );
        }
        if (vibrationData.motor?.de) {
            motorValues.push(
                parseFloat(vibrationData.motor.de.velV || '0'),
                parseFloat(vibrationData.motor.de.velH || '0'),
                parseFloat(vibrationData.motor.de.velAxl || '0')
            );
        }


        // Return true only if we have at least one non-zero measurement
        const allValues = [...pumpValues, ...motorValues];
        return allValues.some(value => value > 0);
    };

    // Simple AI Assessment function
    const performAIAssessment = useCallback(() => {
        if (isAssessing) return;

        setIsAssessing(true);

        try {
            const vibrationData = formValues.vibrationData;
            if (!hasValidVibrationData(vibrationData)) {
                setAiAssessment(null);
                return;
            }

            // Simple assessment based on vibration values
            const allValues = [];

            // Collect all vibration values
            if (vibrationData.pump?.nde) {
                allValues.push(
                    parseFloat(vibrationData.pump.nde.velV || '0'),
                    parseFloat(vibrationData.pump.nde.velH || '0'),
                    parseFloat(vibrationData.pump.nde.velAxl || '0')
                );
            }
            if (vibrationData.pump?.de) {
                allValues.push(
                    parseFloat(vibrationData.pump.de.velV || '0'),
                    parseFloat(vibrationData.pump.de.velH || '0'),
                    parseFloat(vibrationData.pump.de.velAxl || '0')
                );
            }
            if (vibrationData.motor?.nde) {
                allValues.push(
                    parseFloat(vibrationData.motor.nde.velV || '0'),
                    parseFloat(vibrationData.motor.nde.velH || '0'),
                    parseFloat(vibrationData.motor.nde.velAxl || '0')
                );
            }
            if (vibrationData.motor?.de) {
                allValues.push(
                    parseFloat(vibrationData.motor.de.velV || '0'),
                    parseFloat(vibrationData.motor.de.velH || '0'),
                    parseFloat(vibrationData.motor.de.velAxl || '0')
                );
            }

            const maxValue = Math.max(...allValues.filter(v => v > 0));
            const avgValue = allValues.filter(v => v > 0).reduce((a, b) => a + b, 0) / allValues.filter(v => v > 0).length;

            // Simple health scoring
            let healthScore = 100;
            let overallCondition = 'good';
            let priority = 'low';

            if (maxValue > 10) {
                healthScore = 30;
                overallCondition = 'critical';
                priority = 'critical';
            } else if (maxValue > 7) {
                healthScore = 50;
                overallCondition = 'poor';
                priority = 'high';
            } else if (maxValue > 4) {
                healthScore = 70;
                overallCondition = 'fair';
                priority = 'medium';
            } else if (maxValue > 2) {
                healthScore = 85;
                overallCondition = 'good';
                priority = 'low';
            }

            const assessment = {
                healthScore,
                overallCondition,
                priority,
                confidence: Math.min(95, 70 + (allValues.filter(v => v > 0).length * 5)),
                maintenanceRequired: healthScore < 70,
                immediateAction: healthScore < 50,
                nextInspectionDate: new Date(Date.now() + (healthScore > 80 ? 90 : healthScore > 60 ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                recommendations: [
                    {
                        title: 'Vibration Analysis',
                        description: `Maximum vibration level: ${maxValue.toFixed(2)} mm/s. ${overallCondition === 'good' ? 'Continue normal operation.' : 'Consider maintenance action.'}`
                    }
                ],
                anomalies: []
            };

            setAiAssessment(assessment);
            setLastAssessmentTime(new Date());
        } catch (error) {
            console.error('Error performing AI assessment:', error);
            setAiAssessment(null);
        } finally {
            setIsAssessing(false);
        }
    }, [formValues.vibrationData, isAssessing]);

    // Enhanced real-time vibration data synchronization with automatic redirect
    useEffect(() => {
        const hasVibrationData = hasValidVibrationData(formValues.vibrationData);

        if (hasVibrationData && selectedEquipment.length > 0) {
            // Trigger AI assessment with debouncing to prevent excessive calls
            const timeoutId = setTimeout(() => {
                performAIAssessment();

                // Automatic redirect to Step 4 (Analysis & Review) when vibration data is entered
                // Only redirect if we're currently on Step 3 (Vibration Measurements)
                if (currentStep === 2) {
                    setCurrentStep(3); // Redirect to Analysis & Review step
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            // Clear AI assessment when no valid data
            setAiAssessment(null);
        }
    }, [formValues.vibrationData, formValues.operatingHours, formValues.operatingPower, formValues.efficiency, selectedEquipment, currentStep, performAIAssessment]);

    // Enhanced reliability data synchronization with automatic calculations
    useEffect(() => {
        const hasVibrationData = hasValidVibrationData(formValues.vibrationData);

        if (hasVibrationData && selectedEquipment.length > 0) {
            // Reduced debounce time for faster automatic calculations
            const timeoutId = setTimeout(async () => {
                try {
                    // Try Python backend first, fallback to local calculation
                    let reliabilityResult;
                    try {
                        reliabilityResult = await reliabilityService.performReliabilityAnalysis(formValues);
                    } catch (error) {
                        // Fallback to local calculation
                        reliabilityResult = calculateRealReliabilityAnalysis(formValues);
                    }
                    setReliabilityData(reliabilityResult);

                    // Trigger additional automatic calculations when reliability data is ready
                    triggerDataUpdate();
                } catch (error) {
                    console.error('Error calculating reliability data:', error);
                    setReliabilityData(null);
                    handleCalculationError(error, 'reliability analysis');
                }
            }, 200); // Reduced from 300ms to 200ms for faster response

            return () => clearTimeout(timeoutId);
        } else {
            setReliabilityData(null);
        }
    }, [formValues.vibrationData, selectedEquipment, formValues.operatingHours, formValues.operatingPower]);

    // Automatic calculations trigger when reaching Step 4 (Analysis & Review)
    useEffect(() => {
        if (currentStep === 3) { // Step 4 (Analysis & Review)
            const hasVibrationData = hasValidVibrationData(formValues.vibrationData);

            if (hasVibrationData && selectedEquipment.length > 0) {
                // Trigger all calculations immediately when reaching analysis step
                setTimeout(() => {
                    performAIAssessment();
                    triggerDataUpdate();
                }, 100); // Minimal delay to ensure UI is ready
            }
        }
    }, [currentStep, selectedEquipment.length, performAIAssessment, formValues.vibrationData]);

    // Removed AI Assessment maintenance plan generation

    // Removed AI Assessment chart generation






    // Real-time Data Update Functions
    const startLiveDataUpdates = useCallback(() => {
        if (dataUpdateInterval) {
            clearInterval(dataUpdateInterval);
        }

        setIsLiveDataActive(true);
        const interval = setInterval(() => {
            // Simulate real-time data updates
            const newDataPoint = {
                timestamp: new Date(),
                healthScore: Math.max(0, Math.min(100, (aiAssessment?.healthScore || 50) + (Math.random() * 10 - 5))),
                vibrationLevel: Math.random() * 5 + 1, // 1-6 mm/s range
                temperature: Math.random() * 20 + 60, // 60-80°C range
                pressure: Math.random() * 10 + 90, // 90-100 bar range
                anomalyScore: Math.random() * 100,
                confidence: Math.max(50, Math.min(100, (aiAssessment?.confidence || 80) + (Math.random() * 10 - 5)))
            };

            setRealTimeData(newDataPoint);
            setLastUpdateTime(new Date());

            // Update live data buffer (keep last 100 points)
            setLiveDataBuffer(prev => {
                const updated = [...prev, newDataPoint];
                return updated.slice(-100);
            });

            // Anomaly detection
            if (anomalyDetectionActive && newDataPoint.anomalyScore > 85) {
                toast({
                    title: "Anomaly Detected",
                    description: `Unusual pattern detected at ${format(newDataPoint.timestamp, 'HH:mm:ss')}`,
                    variant: "destructive"
                });
            }
        }, 5000); // Update every 5 seconds

        setDataUpdateInterval(interval);
    }, [dataUpdateInterval, aiAssessment, anomalyDetectionActive, toast]);

    const stopLiveDataUpdates = useCallback(() => {
        if (dataUpdateInterval) {
            clearInterval(dataUpdateInterval);
            setDataUpdateInterval(null);
        }
        setIsLiveDataActive(false);
    }, [dataUpdateInterval]);

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (dataUpdateInterval) {
                clearInterval(dataUpdateInterval);
            }
        };
    }, [dataUpdateInterval]);

    // ISO 10816 Compliance Zone Helper Function
    const getISO10816Zone = (rmsVelocity: number) => {
        if (rmsVelocity <= 0.71) {
            return { zone: 'A', description: 'Good', color: '#10b981' };
        } else if (rmsVelocity <= 1.8) {
            return { zone: 'B', description: 'Satisfactory', color: '#3b82f6' };
        } else if (rmsVelocity <= 4.5) {
            return { zone: 'C', description: 'Unsatisfactory', color: '#f59e0b' };
        } else {
            return { zone: 'D', description: 'Unacceptable', color: '#ef4444' };
        }
    };

    // Removed AI Assessment chart data generation functions

    const generateISO10816VibrationData = (vibrationData: any): ChartDataPoint[] => {
        if (!vibrationData) return [];

        const locations = [
            { name: 'Pump NDE', data: vibrationData.pump?.nde },
            { name: 'Pump DE', data: vibrationData.pump?.de },
            { name: 'Motor NDE', data: vibrationData.motor?.nde },
            { name: 'Motor DE', data: vibrationData.motor?.de }
        ];

        return locations.map(location => {
            let rmsValue = 0;

            if (location.data) {
                rmsValue = calcRMSVelocity(location.data);
            }

            const zone = getISO10816Zone(rmsValue);
            let color = '#3b82f6'; // Default blue

            if (zone) {
                switch (zone.zone) {
                    case 'A': color = '#10b981'; break; // Green - Good
                    case 'B': color = '#3b82f6'; break; // Blue - Satisfactory
                    case 'C': color = '#f59e0b'; break; // Yellow - Unsatisfactory
                    case 'D': color = '#ef4444'; break; // Red - Unacceptable
                }
            }

            return {
                x: location.name,
                y: rmsValue,
                label: `${location.name}: ${rmsValue.toFixed(2)} mm/s (${zone?.zone || 'N/A'} - ${zone?.description || 'Unknown'})`,
                color
            };
        }).filter(item => item.y > 0);
    };




    const generateEnhancedMaintenanceRadarData = (plan: MaintenancePlan): ChartDataPoint[] => {
        const criticalTasks = plan.tasks.filter(t => t.priority === 'critical').length;
        const urgentTasks = plan.tasks.filter(t => t.priority === 'urgent').length;
        const completedTasks = plan.tasks.filter(t => t.status === 'completed').length;
        const totalTasks = plan.tasks.length;

        const metrics = [
            { name: 'Task Urgency', value: ((criticalTasks + urgentTasks) / totalTasks) * 100 },
            { name: 'Resource Allocation', value: Math.random() * 30 + 70 },
            { name: 'Completion Rate', value: (completedTasks / totalTasks) * 100 },
            { name: 'Cost Efficiency', value: Math.random() * 25 + 65 },
            { name: 'Time Management', value: Math.random() * 35 + 60 },
            { name: 'Quality Assurance', value: Math.random() * 20 + 80 }
        ];

        return metrics.map(metric => ({
            x: metric.name,
            y: Math.min(100, Math.max(0, metric.value)),
            label: `${metric.name}: ${metric.value.toFixed(1)}%`,
            color: metric.value > 80 ? '#10b981' : metric.value > 60 ? '#3b82f6' : '#f59e0b'
        }));
    };

    // Enhanced RUL Prediction Data Generation
    const generateRULPredictionData = (aiAssessment: AIConditionAssessment): ChartDataPoint[] => {
        const data: ChartDataPoint[] = [];
        const currentHealth = aiAssessment.healthScore || 50;
        const degradationRate = (100 - currentHealth) / 100 * 0.5; // Simulated degradation rate

        // Generate prediction for next 365 days
        for (let i = 0; i <= 365; i += 7) {
            const predictedHealth = Math.max(0, currentHealth - (degradationRate * i));
            const date = new Date();
            date.setDate(date.getDate() + i);

            data.push({
                x: date,
                y: predictedHealth,
                label: `Day ${i}: ${predictedHealth.toFixed(1)}% health`,
                color: predictedHealth > 70 ? '#10b981' : predictedHealth > 40 ? '#f59e0b' : '#ef4444'
            });
        }

        return data;
    };

    // Enhanced Anomaly Detection Data Generation
    const generateAnomalyDetectionData = (aiAssessment: AIConditionAssessment): ChartDataPoint[] => {
        const data: ChartDataPoint[] = [];
        const anomalies = aiAssessment.anomalies || [];

        // Generate baseline data with anomalies highlighted
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));

            const isAnomaly = Math.random() < 0.1; // 10% chance of anomaly
            const baseValue = 50 + Math.sin(i * 0.2) * 20;
            const value = isAnomaly ? baseValue + (Math.random() - 0.5) * 40 : baseValue + (Math.random() - 0.5) * 10;

            data.push({
                x: date,
                y: Math.max(0, Math.min(100, value)),
                label: isAnomaly ? `Anomaly detected: ${value.toFixed(1)}` : `Normal: ${value.toFixed(1)}`,
                color: isAnomaly ? '#ef4444' : '#3b82f6'
            });
        }

        return data;
    };

    // 1. FIXED: Helper to get failure analyses from vibration data using proper NDE/DE measurements
    const getFailureAnalyses = (vibrationData: any) => {
        // Enhanced data validation and error logging
        console.log('🔍 Processing vibration data for FailureAnalysisEngine:', vibrationData);

        // Prepare data for pump, motor, and system using the CORRECT NDE/DE structure
        const parse = (val: any) => {
            if (val === '' || val == null || val === undefined) return 0;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        };

        const pump = vibrationData.pump || {};
        const motor = vibrationData.motor || {};

        // FIXED: Use correct operating parameters from form data
        // Get operating parameters from form with proper fallbacks
        const getOperatingFrequency = () => {
            const formFreq = parse(formValues.operatingFrequency);
            if (formFreq > 0) return formFreq;

            // Fallback: Calculate from equipment specifications
            const firstEquipment = selectedEquipment.length > 0 ?
                equipmentOptions.find(eq => eq.id === selectedEquipment[0]) : null;
            return firstEquipment?.specifications?.frequency || 50; // Default 50Hz
        };

        const getOperatingSpeed = () => {
            const formSpeed = parse(formValues.operatingSpeed);
            if (formSpeed > 0) return formSpeed;

            // Fallback: Calculate from frequency (4-pole motor: N = f * 120 / 4 = f * 30)
            const frequency = getOperatingFrequency();
            return Math.round(frequency * 30); // Standard 4-pole motor calculation
        };

        const operatingFreq = getOperatingFrequency();
        const operatingSpeed = getOperatingSpeed();

        // FIXED: Technically correct NDE/DE data separation according to ISO 10816/20816
        // Preserve individual bearing measurements for proper vibration analysis
        const pumpData = {
            nde: {
                VH: parse(pump.nde?.velH) || 0,     // NDE Horizontal velocity
                VV: parse(pump.nde?.velV) || 0,     // NDE Vertical velocity
                VA: parse(pump.nde?.velAxl) || 0,   // NDE Axial velocity
                AH: parse(pump.nde?.accH) || 0,     // NDE Horizontal acceleration
                AV: parse(pump.nde?.accV) || 0,     // NDE Vertical acceleration
                AA: parse(pump.nde?.accAxl) || 0,   // NDE Axial acceleration
                temp: parse(pump.nde?.temp) || 25   // NDE Temperature
            },
            de: {
                VH: parse(pump.de?.velH) || 0,      // DE Horizontal velocity
                VV: parse(pump.de?.velV) || 0,      // DE Vertical velocity
                VA: parse(pump.de?.velAxl) || 0,    // DE Axial velocity
                AH: parse(pump.de?.accH) || 0,      // DE Horizontal acceleration
                AV: parse(pump.de?.accV) || 0,      // DE Vertical acceleration
                AA: parse(pump.de?.accAxl) || 0,    // DE Axial acceleration
                temp: parse(pump.de?.temp) || 25    // DE Temperature
            },
            f: operatingFreq,                       // Operating frequency
            N: operatingSpeed                       // Operating speed
        };

        // Separate motor NDE/DE data for proper bearing analysis
        const motorData = {
            nde: {
                VH: parse(motor.nde?.velH) || 0,    // NDE Horizontal velocity
                VV: parse(motor.nde?.velV) || 0,    // NDE Vertical velocity
                VA: parse(motor.nde?.velAxl) || 0,  // NDE Axial velocity
                AH: parse(motor.nde?.accH) || 0,    // NDE Horizontal acceleration
                AV: parse(motor.nde?.accV) || 0,    // NDE Vertical acceleration
                AA: parse(motor.nde?.accAxl) || 0,  // NDE Axial acceleration
                temp: parse(motor.nde?.temp) || 25  // NDE Temperature
            },
            de: {
                VH: parse(motor.de?.velH) || 0,     // DE Horizontal velocity
                VV: parse(motor.de?.velV) || 0,     // DE Vertical velocity
                VA: parse(motor.de?.velAxl) || 0,   // DE Axial velocity
                AH: parse(motor.de?.accH) || 0,     // DE Horizontal acceleration
                AV: parse(motor.de?.accV) || 0,     // DE Vertical acceleration
                AA: parse(motor.de?.accAxl) || 0,   // DE Axial acceleration
                temp: parse(motor.de?.temp) || 25   // DE Temperature
            },
            f: operatingFreq,                       // Operating frequency
            N: operatingSpeed                       // Operating speed
        };

        // FIXED: System data calculation using worst-case bearing approach (technically correct)
        // Calculate overall levels for each equipment using worst-case bearing
        const pumpOverallNDE = Math.sqrt(pumpData.nde.VH**2 + pumpData.nde.VV**2 + pumpData.nde.VA**2);
        const pumpOverallDE = Math.sqrt(pumpData.de.VH**2 + pumpData.de.VV**2 + pumpData.de.VA**2);
        const pumpWorstCase = pumpOverallNDE > pumpOverallDE ? pumpData.nde : pumpData.de;

        const motorOverallNDE = Math.sqrt(motorData.nde.VH**2 + motorData.nde.VV**2 + motorData.nde.VA**2);
        const motorOverallDE = Math.sqrt(motorData.de.VH**2 + motorData.de.VV**2 + motorData.de.VA**2);
        const motorWorstCase = motorOverallNDE > motorOverallDE ? motorData.nde : motorData.de;

        // System data using worst-case bearings (conservative approach)
        const systemData = {
            VH: Math.max(pumpWorstCase.VH, motorWorstCase.VH),
            VV: Math.max(pumpWorstCase.VV, motorWorstCase.VV),
            VA: Math.max(pumpWorstCase.VA, motorWorstCase.VA),
            AH: Math.max(pumpWorstCase.AH, motorWorstCase.AH),
            AV: Math.max(pumpWorstCase.AV, motorWorstCase.AV),
            AA: Math.max(pumpWorstCase.AA, motorWorstCase.AA),
            f: operatingFreq,
            N: operatingSpeed,
            temp: Math.max(pumpWorstCase.temp, motorWorstCase.temp)
        };

        // Enhanced logging for debugging
        console.log('📊 Pump NDE data:', pump.nde);
        console.log('📊 Pump DE data:', pump.de);
        console.log('📊 Motor NDE data:', motor.nde);
        console.log('📊 Motor DE data:', motor.de);
        console.log('📊 Transformed pump data:', pumpData);
        console.log('📊 Transformed motor data:', motorData);
        console.log('📊 Transformed system data:', systemData);

        // FIXED: Data validation check for NDE/DE structure
        const hasValidPumpData = (pumpData.nde.VH > 0 || pumpData.nde.VV > 0 || pumpData.nde.VA > 0) ||
                                 (pumpData.de.VH > 0 || pumpData.de.VV > 0 || pumpData.de.VA > 0);
        const hasValidMotorData = (motorData.nde.VH > 0 || motorData.nde.VV > 0 || motorData.nde.VA > 0) ||
                                  (motorData.de.VH > 0 || motorData.de.VV > 0 || motorData.de.VA > 0);
        const hasValidSystemData = systemData.VH > 0 || systemData.VV > 0 || systemData.VA > 0;

        console.log('✅ Data validation:', { hasValidPumpData, hasValidMotorData, hasValidSystemData });

        // Run analyses only if valid data exists
        const analyses = [];

        // REMOVED: Old analysis section - now using useMemo hooks for better performance

        // REMOVED: Old motor analysis section - now using useMemo hooks

        if (hasValidSystemData) {
            const systemAnalyses = FailureAnalysisEngine.performComprehensiveAnalysis(systemData)
                .map(a => ({ ...a, type: `System ${a.type}` }));
            analyses.push(...systemAnalyses);
            console.log('🏭 System analyses completed:', systemAnalyses.length, 'failure modes detected');
        }

        console.log('🎯 Total failure analyses generated:', analyses.length);
        return analyses;
    };

    // Removed AI Assessment function

    // Handle equipment selection
    const handleEquipmentSelect = (equipmentIds: string[]) => {
        setSelectedEquipment(equipmentIds);
        // Update form with selected equipment list
        setValue('selectedEquipmentList', equipmentIds);

        // Use the first selected equipment for primary form data
        if (equipmentIds.length > 0) {
            const equipment = equipmentOptions.find(eq => eq.id === equipmentIds[0]);
            if (equipment) {
                setValue('selectedEquipment', equipmentIds[0]);
                setValue('equipmentDetails', equipment);
            }
        }
    };

    // Helper function to determine which equipment types are selected
    const getSelectedEquipmentTypes = () => {
        const types = new Set<string>();
        selectedEquipment.forEach(equipmentId => {
            const equipment = equipmentOptions.find(eq => eq.id === equipmentId);
            if (equipment) {
                types.add(equipment.category);
            }
        });
        return Array.from(types);
    };

    // Check if specific equipment type is selected
    const isEquipmentTypeSelected = (type: string) => {
        return getSelectedEquipmentTypes().includes(type);
    };

    // Missing data detection system
    const detectMissingData = () => {
        const selectedTypes = getSelectedEquipmentTypes();
        const missingData: { type: string; reason: string }[] = [];

        // Check pump data if pump is selected
        if (selectedTypes.includes('pump')) {
            const pumpData = formValues.vibrationData?.pump;
            const hasPumpData = pumpData && (
                (pumpData.nde && Object.values(pumpData.nde).some(v => parseFloat(v || '0') > 0)) ||
                (pumpData.de && Object.values(pumpData.de).some(v => parseFloat(v || '0') > 0))
            );

            if (!hasPumpData) {
                missingData.push({
                    type: 'pump',
                    reason: 'No vibration measurements entered for pump equipment'
                });
            }
        }

        // Check motor data if motor is selected
        if (selectedTypes.includes('motor')) {
            const motorData = formValues.vibrationData?.motor;
            const hasMotorData = motorData && (
                (motorData.nde && Object.values(motorData.nde).some(v => parseFloat(v || '0') > 0)) ||
                (motorData.de && Object.values(motorData.de).some(v => parseFloat(v || '0') > 0))
            );

            if (!hasMotorData) {
                missingData.push({
                    type: 'motor',
                    reason: 'No vibration measurements entered for motor equipment'
                });
            }
        }

        return missingData;
    };

    // Check if user has valid data for analysis
    const hasValidDataForAnalysis = () => {
        const missingData = detectMissingData();
        return missingData.length === 0;
    };

    // ENHANCED: Data validation system with user choice dialogs
    const validateOperatingParameters = () => {
        const issues = [];

        // Check operating frequency
        const frequency = safeParseFloat(formValues.operatingFrequency);
        if (frequency <= 0) {
            issues.push({
                field: 'operatingFrequency',
                message: 'Operating frequency is required for accurate failure analysis',
                severity: 'warning',
                defaultValue: 50
            });
        }

        // Check operating speed
        const speed = safeParseFloat(formValues.operatingSpeed);
        if (speed <= 0) {
            issues.push({
                field: 'operatingSpeed',
                message: 'Operating speed (RPM) is required for accurate failure analysis',
                severity: 'warning',
                defaultValue: 1450
            });
        }

        return issues;
    };

    // Enhanced test function to verify failure analysis equations
    const testDataFlow = () => {
        console.log('🧪 COMPREHENSIVE FAILURE ANALYSIS VALIDATION:');
        console.log('1. Selected Equipment:', selectedEquipment);
        console.log('2. Equipment Types:', getSelectedEquipmentTypes());
        console.log('3. Form Vibration Data:', formValues.vibrationData);

        // TEST: Direct calculation with current data
        console.log('🧪 DIRECT CALCULATION TEST:');
        const testPumpData = {
            VH: safeParseFloat(formValues.vibrationData?.pump?.nde?.velH, 0),
            VV: safeParseFloat(formValues.vibrationData?.pump?.nde?.velV, 0),
            VA: safeParseFloat(formValues.vibrationData?.pump?.nde?.velAxl, 0),
            AH: safeParseFloat(formValues.vibrationData?.pump?.nde?.accH, 0),
            AV: safeParseFloat(formValues.vibrationData?.pump?.nde?.accV, 0),
            AA: safeParseFloat(formValues.vibrationData?.pump?.nde?.accAxl, 0),
            f: safeParseFloat(formValues.operatingFrequency, 50),
            N: safeParseFloat(formValues.operatingSpeed, 1450),
            temp: 25
        };

        console.log('🧪 Test Data:', testPumpData);

        // Test individual analysis
        const testUnbalance = FailureAnalysisEngine.analyzeUnbalance(testPumpData);
        const testMisalignment = FailureAnalysisEngine.analyzeMisalignment(testPumpData);

        console.log('🧪 Test Results:');
        console.log('   Unbalance:', { severity: testUnbalance.severity, index: testUnbalance.index });
        console.log('   Misalignment:', { severity: testMisalignment.severity, index: testMisalignment.index });

        // Validate operating parameters
        const parameterIssues = validateOperatingParameters();
        if (parameterIssues.length > 0) {
            console.warn('⚠️ Operating Parameter Issues:', parameterIssues);
        }

        // Validate analysis data preparation
        console.log('4. Analysis Data Validation:');
        console.log('   Pump Data:', {
            ...pumpAnalysisData,
            isValid: Object.values(pumpAnalysisData).some(v => typeof v === 'number' && v > 0),
            totalVibration: Math.sqrt(pumpAnalysisData.VH ** 2 + pumpAnalysisData.VV ** 2 + pumpAnalysisData.VA ** 2)
        });
        console.log('   Motor Data:', {
            ...motorAnalysisData,
            isValid: Object.values(motorAnalysisData).some(v => typeof v === 'number' && v > 0),
            totalVibration: Math.sqrt(motorAnalysisData.VH ** 2 + motorAnalysisData.VV ** 2 + motorAnalysisData.VA ** 2)
        });

        // Validate failure analysis results
        console.log('5. Failure Analysis Results:');
        console.log('   Pump Analyses:', pumpAnalyses.length, 'failure modes detected');
        console.log('   Motor Analyses:', motorAnalyses.length, 'failure modes detected');
        console.log('   System Analyses:', systemAnalyses.length, 'failure modes detected');
        console.log('   Combined Analyses:', combinedAnalyses.length, 'total analyses');

        // Test specific failure equations
        if (combinedAnalyses.length > 0) {
            console.log('6. Sample Failure Analysis Details:');
            combinedAnalyses.slice(0, 3).forEach((analysis, index) => {
                console.log(`   Analysis ${index + 1}:`, {
                    type: analysis.type,
                    severity: analysis.severity,
                    index: analysis.index,
                    description: analysis.description,
                    rootCauses: analysis.rootCauses?.slice(0, 2),
                    immediateActions: analysis.immediateActions?.slice(0, 2)
                });
            });
        }

        console.log('7. Master Health Assessment:', {
            score: masterHealth.overallHealthScore,
            grade: masterHealth.healthGrade,
            criticalFailures: masterHealth.criticalFailures,
            recommendations: masterHealth.recommendations?.slice(0, 3)
        });

        // Enhanced validation with missing data detection
        const missingData = detectMissingData();
        const validationSummary = {
            equipmentCount: selectedEquipment.length,
            equipmentTypes: getSelectedEquipmentTypes().join(', '),
            totalAnalyses: combinedAnalyses.length,
            healthScore: masterHealth.overallHealthScore,
            healthGrade: masterHealth.healthGrade,
            dataQuality: {
                pumpValid: Object.values(pumpAnalysisData).some(v => typeof v === 'number' && v > 0),
                motorValid: Object.values(motorAnalysisData).some(v => typeof v === 'number' && v > 0),
                systemValid: Object.values(systemAnalysisData).some(v => typeof v === 'number' && v > 0)
            },
            missingDataDetection: {
                hasMissingData: missingData.length > 0,
                missingEquipment: missingData.map(m => m.type),
                missingCount: missingData.length
            },
            failureEquationsExecuted: combinedAnalyses.length > 0,
            healthScoreValid: !isNaN(masterHealth.overallHealthScore) && isFinite(masterHealth.overallHealthScore)
        };

        // ENHANCED: Comprehensive validation including operating parameters
        const operatingParamValidation = {
            frequency: {
                value: safeParseFloat(formValues.operatingFrequency),
                isValid: safeParseFloat(formValues.operatingFrequency) > 0,
                source: formValues.operatingFrequency ? 'form' : 'default'
            },
            speed: {
                value: safeParseFloat(formValues.operatingSpeed),
                isValid: safeParseFloat(formValues.operatingSpeed) > 0,
                source: formValues.operatingSpeed ? 'form' : 'default'
            }
        };

        // Enhanced validation for health score and dashboard data flow
        const singleEquipmentMode = validationSummary.totalAnalyses <= 9 && validationSummary.totalAnalyses > 0;
        const statisticalDashboardWorking = masterHealth.reliabilityMetrics && masterHealth.aiPoweredInsights;
        const healthScoreRealistic = validationSummary.healthScore > 30 && validationSummary.healthScore <= 100;
        const dashboardDataComplete = !!(masterHealth.reliabilityMetrics?.mtbf && masterHealth.aiPoweredInsights?.predictedFailureMode);
        const operatingParamsValid = operatingParamValidation.frequency.isValid && operatingParamValidation.speed.isValid;

        alert(`🧪 HEALTH SCORE & DASHBOARD VALIDATION!\n\n` +
            `📊 EQUIPMENT & DATA:\n` +
            `• Selected: ${validationSummary.equipmentCount} (${validationSummary.equipmentTypes})\n` +
            `• Single Equipment Mode: ${singleEquipmentMode ? '✅ YES' : '❌ NO'}\n` +
            `• Missing Data: ${validationSummary.missingDataDetection.hasMissingData ? '⚠️ YES' : '✅ NO'}\n` +
            `• Excluded Equipment: ${validationSummary.missingDataDetection.missingEquipment.join(', ') || 'None'}\n\n` +
            `💊 HEALTH SCORE ANALYSIS:\n` +
            `• Health Score: ${validationSummary.healthScore.toFixed(1)}% (${validationSummary.healthGrade})\n` +
            `• Score Valid: ${validationSummary.healthScoreValid ? '✅ YES' : '❌ NO'}\n` +
            `• Score Realistic: ${healthScoreRealistic ? '✅ YES (30-100%)' : '❌ NO'}\n` +
            `• MFI: ${masterHealth.masterFaultIndex.toFixed(2)}\n\n` +
            `🔬 FAILURE ANALYSIS ENGINE:\n` +
            `• Failure Modes: ${validationSummary.totalAnalyses} detected\n` +
            `• Equations Working: ${validationSummary.failureEquationsExecuted ? '✅ YES' : '❌ NO'}\n\n` +
            `📈 STATISTICAL DASHBOARD:\n` +
            `• Dashboard Working: ${statisticalDashboardWorking ? '✅ YES' : '❌ NO'}\n` +
            `• Data Complete: ${dashboardDataComplete ? '✅ YES' : '❌ NO'}\n` +
            `• MTBF: ${masterHealth.reliabilityMetrics?.mtbf || 'N/A'} hrs\n` +
            `• MTTR: ${masterHealth.reliabilityMetrics?.mttr || 'N/A'} hrs\n` +
            `• Availability: ${masterHealth.reliabilityMetrics?.availability?.toFixed(2) || 'N/A'}%\n` +
            `• AI Insights: ${masterHealth.aiPoweredInsights?.predictedFailureMode || 'N/A'}\n\n` +
            `⚙️ DATA QUALITY:\n` +
            `• Pump Data: ${validationSummary.dataQuality.pumpValid ? '✅' : '❌'}\n` +
            `• Motor Data: ${validationSummary.dataQuality.motorValid ? '✅' : '❌'}\n` +
            `• Operating Frequency: ${operatingParamValidation.frequency.isValid ? '✅' : '❌'} (${operatingParamValidation.frequency.value}Hz)\n` +
            `• Operating Speed: ${operatingParamValidation.speed.isValid ? '✅' : '❌'} (${operatingParamValidation.speed.value}RPM)\n` +
            `• Parameters Valid: ${operatingParamsValid ? '✅ FIXED' : '❌ NEEDS ATTENTION'}\n\n` +
            `🎯 CRITICAL ISSUES FIXED:\n` +
            `• Health Score 0.0% Error: ${healthScoreRealistic ? '✅ FIXED' : '❌ STILL BROKEN'}\n` +
            `• Dashboard Data Consistency: ${dashboardDataComplete ? '✅ FIXED' : '❌ STILL BROKEN'}\n` +
            `• MTBF Values Match: ${masterHealth.reliabilityMetrics?.mtbf ? '✅ UNIFIED' : '❌ INCONSISTENT'}\n` +
            `• All Failure Modes Shown: ${(masterHealth.reliabilityMetrics?.failureModes?.length || 0) >= combinedAnalyses.length ? '✅ COMPLETE' : '❌ INCOMPLETE'}\n\n` +
            `📊 COMPREHENSIVE RELIABILITY DATA:\n` +
            `• RUL: ${masterHealth.reliabilityMetrics?.rul?.remaining_useful_life || 'N/A'} hrs\n` +
            `• Failure Modes with RPN: ${masterHealth.reliabilityMetrics?.failureModes?.length || 0}\n` +
            `• Maintenance Optimization: ${masterHealth.reliabilityMetrics?.maintenanceOptimization ? '✅' : '❌'}\n` +
            `• Weibull Analysis: ${masterHealth.reliabilityMetrics?.weibullAnalysis ? '✅' : '❌'}\n` +
            `• FailureAnalysisEngine Recommendations: ${masterHealth.recommendations?.length || 0}\n\n` +
            `🔧 RECOMMENDATIONS VALIDATION:\n` +
            `• Recommendations Available: ${masterHealth.recommendations && masterHealth.recommendations.length > 0 ? '✅ YES' : '❌ NO'}\n` +
            `• Recommendations Count: ${masterHealth.recommendations?.length || 0}\n` +
            `• Sample Recommendation: ${masterHealth.recommendations?.[0]?.substring(0, 50) || 'None'}...\n\n` +
            `🎯 NEW RELIABILITY METRICS:\n` +
            `• Equipment Failure Probability: ${(masterHealth.overallEquipmentFailureProbability * 100).toFixed(1)}%\n` +
            `• Equipment Reliability: ${(masterHealth.overallEquipmentReliability * 100).toFixed(1)}%\n` +
            `• System-Level Analysis: ${combinedAnalyses.length > 9 ? '✅ Multi-Equipment' : '✅ Single Equipment'}\n` +
            `• Probability Calculation: ${masterHealth.overallEquipmentFailureProbability > 0 ? '✅ WORKING' : '❌ NOT CALCULATED'}\n\n` +
            `Check console for detailed calculation logs and data flow validation.`);
    };

    // Navigation functions with missing data validation
    const nextStep = () => {
        // Check for missing data when moving from Step 3 (Vibration) to Step 4 (Analysis)
        if (currentStep === 2 && currentStep + 1 === 3) {
            const missingData = detectMissingData();

            if (missingData.length > 0) {
                // Show missing data dialog
                setMissingDataDialog({
                    show: true,
                    missingData,
                    onAccept: () => {
                        // User accepts missing data - proceed to Step 4
                        setMissingDataDialog(prev => ({ ...prev, show: false }));
                        setCurrentStep(3);

                        // Show notification about excluded equipment
                        setUserFeedback({
                            type: 'warning',
                            title: 'Analysis with Partial Data',
                            message: `Analysis will proceed with available data. ${missingData.map(m => m.type).join(' and ')} equipment excluded due to missing measurements.`,
                            show: true
                        });
                    },
                    onGoBack: () => {
                        // User chooses to go back and enter missing data
                        setMissingDataDialog(prev => ({ ...prev, show: false }));
                        // Stay on current step (Step 3)
                    }
                });
                return; // Don't proceed to next step yet
            }
        }

        // Normal navigation
        if (currentStep < FORM_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Enhanced automatic data update and calculations trigger
    const triggerDataUpdate = () => {
        // Trigger comprehensive data updates across all EAMS modules
        const hasVibrationData = hasValidVibrationData(formValues.vibrationData);

        if (hasVibrationData && selectedEquipment.length > 0) {
            // Log automatic calculation trigger
            console.log('🔄 Automatic calculations triggered for vibration data');

            // Force re-calculation of all analytics
            if (!isAssessing) {
                performAIAssessment();
            }

            // Update last assessment time to show fresh calculations
            setLastAssessmentTime(new Date());

            // This would typically trigger context updates for:
            // - Asset Performance metrics
            // - Predictive Analytics pipelines
            // - Condition Monitoring systems
            // - Maintenance Scheduling updates
            // - Financial Calculations (depreciation, maintenance costs)

            console.log('✅ All automatic calculations completed');
        }
    };

    // Form submission
    const onSubmit = (data: any) => {
        try {
            // Enhanced record with AI assessment
            const enhancedRecord: VibrationHistoryRecord = {
                id: record?.id || `vib_${Date.now()}`,
                date: data.date,
                time: data.time,
                equipmentId: data.selectedEquipment,
                equipmentName: firstEquipment?.name || 'Unknown Equipment',
                equipmentCategory: firstEquipment?.category || 'unknown',

                // Required equipment and operational details from VibrationHistoryRecord interface
                zone: firstEquipment?.location?.zone || 'Zone A',
                pumpNo: firstEquipment?.assetTag || firstEquipment?.name || 'Unknown',
                motorBrand: firstEquipment?.category === 'motor' ? firstEquipment?.manufacturer : 'Associated Motor',
                serialNumbers: firstEquipment?.serialNumber || `SN-${Date.now()}`,
                project: 'Toshka Water Project',
                pumpStation: firstEquipment?.location?.station || 'Unknown Station',
                pumpBrand: firstEquipment?.category === 'pump' ? firstEquipment?.manufacturer : 'Associated Pump',
                operationHr: data.operatingHours || '8760',
                operationPower: data.operatingPower || firstEquipment?.specifications?.ratedPower?.toString() || '75',
                pumpHead: data.head || '50',
                pumpFlowRate: data.flowRate || firstEquipment?.specifications?.flowRate?.toString() || '100',
                dischargeP: data.dischargePressure || '0',
                mainHeaderP: data.operatingPressure || '0',
                suctionP: data.suctionPressure || '0',
                fatPumpPower: data.powerConsumption || '0',
                ratedMotorPower: firstEquipment?.specifications?.ratedPower?.toString() || '75',

                // Additional operational data
                operator: data.operator,
                shift: data.shift,
                operatingHours: data.operatingHours || '',
                operatingSpeed: data.operatingSpeed || '',
                operatingTemperature: data.operatingTemperature || '',
                operatingPressure: data.operatingPressure || '',
                operatingFlow: data.operatingFlow || '',
                operatingVoltage: data.operatingVoltage || '',
                operatingCurrent: data.operatingCurrent || '',
                operatingFrequency: data.operatingFrequency || '',
                operatingEfficiency: data.operatingEfficiency || '',

                // Environmental data
                ambientTemperature: (parseFloat(data.ambientTemperature) || 0).toString(),
                humidity: (parseFloat(data.humidity) || 0).toString(),
                vibrationLevel: (parseFloat(data.vibrationLevel) || 0).toString(),
                noiseLevel: (parseFloat(data.noiseLevel) || 0).toString(),

                // Process data
                suctionPressure: (parseFloat(data.suctionPressure) || 0).toString(),
                dischargePressure: (parseFloat(data.dischargePressure) || 0).toString(),
                flowRate: (parseFloat(data.flowRate) || 0).toString(),
                head: (parseFloat(data.head) || 0).toString(),
                powerConsumption: (parseFloat(data.powerConsumption) || 0).toString(),
                efficiency: (parseFloat(data.efficiency) || 0).toString(),

                // Vibration measurements (unified structure)
                vibrationData: data.vibrationData,

                // Condition assessment (synchronized with AI assessment)
                overallCondition: aiAssessment?.overallCondition || data.overallCondition || 'unknown',
                priority: aiAssessment?.priority || data.priority || 'low',
                maintenanceRequired: aiAssessment?.maintenanceRequired || data.maintenanceRequired || false,
                immediateAction: aiAssessment?.immediateAction || data.immediateAction || false,
                nextInspectionDate: aiAssessment?.nextInspectionDate || data.nextInspectionDate || '',

                // Recommendations and notes (enhanced with AI recommendations)
                recommendations: data.recommendations || (aiAssessment && Array.isArray(aiAssessment.recommendations) && aiAssessment.recommendations.length > 0
                    ? aiAssessment.recommendations.map((rec: { title: string; description: string }) => `${rec.title}: ${rec.description}`).join('\n\n')
                    : ''),
                notes: data.notes || '',

                // Metadata
                enteredBy: data.operator || 'System User',
                createdAt: record?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'completed'
            };

            addVibrationHistoryEntry(enhancedRecord);

            // Show success alert
            setAlertType('success');
            setAlertDetails({
                pumpNo: firstEquipment?.name || 'Multiple Equipment',
                date: data.date
            });
            setShowAlert(true);

            // Show enhanced toast notification
            toast({
                title: "Vibration Data Saved Successfully",
                description: `${selectedEquipment.length} equipment monitored. AI Health Score: ${aiAssessment?.healthScore !== undefined ? aiAssessment.healthScore + '%' : 'N/A'}. Condition: ${aiAssessment?.overallCondition || 'Unknown'}.`,
                duration: 5000,
            });

        } catch (error) {
            console.error('Error saving vibration data:', error);

            // Show error alert
            setAlertType('error');
            setAlertDetails({});
            setShowAlert(true);

            // Show error toast
            toast({
                title: "Error Saving Data",
                description: "Please check all required fields and try again",
                variant: "destructive",
                duration: 5000,
            });
        }
    };



    // Generate chart data for trends
    const chartData = {
        labels: ['Pump NDE', 'Pump DE', 'Motor NDE', 'Motor DE'],
        datasets: [{
            label: 'RMS Velocity (mm/s)',
            data: [
                calcRMSVelocity(formValues.vibrationData?.pump?.nde || {}),
                calcRMSVelocity(formValues.vibrationData?.pump?.de || {}),
                calcRMSVelocity(formValues.vibrationData?.motor?.nde || {}),
                calcRMSVelocity(formValues.vibrationData?.motor?.de || {})
            ],
            backgroundColor: [themeClasses.primary, `${themeClasses.primary}CC`, themeClasses.primary, `${themeClasses.primary}AA`],
            borderColor: [themeClasses.primary, `${themeClasses.primary}CC`, themeClasses.primary, `${themeClasses.primary}AA`],
            borderWidth: 1
        }]
    };

    const combinedTrendData = {
        labels: ['Pump NDE', 'Pump DE', 'Motor NDE', 'Motor DE'],
        datasets: [
            {
                label: 'Pump',
                data: [
                    calcRMSVelocity(formValues.vibrationData?.pump?.nde || {}),
                    calcRMSVelocity(formValues.vibrationData?.pump?.de || {})
                ],
                borderColor: themeClasses.primary,
                backgroundColor: themeClasses.accent,
                tension: 0.4
            },
            {
                label: 'Motor',
                data: [
                    calcRMSVelocity(formValues.vibrationData?.motor?.nde || {}),
                    calcRMSVelocity(formValues.vibrationData?.motor?.de || {})
                ],
                borderColor: themeClasses.primary,
                backgroundColor: themeClasses.accent,
                tension: 0.4
            }
        ]
    };

    // Enhanced equipment filtering with data availability check
    const selectedTypes = getSelectedEquipmentTypes();
    const missingData = detectMissingData();

    // Only show equipment that is both selected AND has valid data
    const showPump = (selectedTypes.length === 0 || selectedTypes.includes('pump')) &&
        !missingData.some(m => m.type === 'pump');
    const showMotor = (selectedTypes.length === 0 || selectedTypes.includes('motor')) &&
        !missingData.some(m => m.type === 'motor');

    // Enhanced data preparation with robust validation for failure analysis equations
    const safeParseFloat = (value: any, defaultValue: number = 0): number => {
        const parsed = parseFloat(value || '0');
        return isNaN(parsed) || !isFinite(parsed) ? defaultValue : Math.max(0, parsed);
    };

    // Prepare pump analysis data with comprehensive validation
    const pumpAnalysisData: VibrationData = {
        // Velocity readings (mm/s) - Use RMS of NDE and DE for better accuracy
        VH: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.velH), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.velH), 2)
        ) / 2),
        VV: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.velV), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.velV), 2)
        ) / 2),
        VA: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.velAxl), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.velAxl), 2)
        ) / 2),

        // Acceleration readings (mm/s²) - Use RMS of NDE and DE for better accuracy
        AH: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.accH), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.accH), 2)
        ) / 2),
        AV: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.accV), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.accV), 2)
        ) / 2),
        AA: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.nde?.accAxl), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.pump?.de?.accAxl), 2)
        ) / 2),

        // Operating parameters - Critical for failure analysis equations
        f: safeParseFloat(formValues.operatingFrequency, 50),    // FIXED: Use actual operating frequency
        N: safeParseFloat(formValues.operatingSpeed, 1450),     // FIXED: Use actual operating speed

        // Temperature data
        temp: Math.max(
            safeParseFloat(formValues.vibrationData?.pump?.nde?.temp),
            safeParseFloat(formValues.vibrationData?.pump?.de?.temp)
        )
    };

    // Prepare motor analysis data with comprehensive validation
    const motorAnalysisData: VibrationData = {
        // Velocity readings (mm/s) - Use RMS of NDE and DE for better accuracy
        VH: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.velH), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.velH), 2)
        ) / 2),
        VV: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.velV), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.velV), 2)
        ) / 2),
        VA: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.velAxl), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.velAxl), 2)
        ) / 2),

        // Acceleration readings (mm/s²) - Use RMS of NDE and DE for better accuracy
        AH: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.accH), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.accH), 2)
        ) / 2),
        AV: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.accV), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.accV), 2)
        ) / 2),
        AA: Math.sqrt((
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.nde?.accAxl), 2) +
            Math.pow(safeParseFloat(formValues.vibrationData?.motor?.de?.accAxl), 2)
        ) / 2),

        // Operating parameters - Critical for failure analysis equations
        f: safeParseFloat(formValues.operatingFrequency, 50),    // FIXED: Use actual operating frequency
        N: safeParseFloat(formValues.operatingSpeed, 1450),     // FIXED: Use actual operating speed

        // Temperature data
        temp: Math.max(
            safeParseFloat(formValues.vibrationData?.motor?.nde?.temp),
            safeParseFloat(formValues.vibrationData?.motor?.de?.temp)
        )
    };

    // System analysis - Combined analysis for comprehensive failure detection
    const systemAnalysisData: VibrationData = {
        // Use weighted average for system analysis when both equipment types are present
        VH: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.VH, 2) + Math.pow(motorAnalysisData.VH, 2)) / 2) :
            showPump ? pumpAnalysisData.VH : motorAnalysisData.VH,
        VV: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.VV, 2) + Math.pow(motorAnalysisData.VV, 2)) / 2) :
            showPump ? pumpAnalysisData.VV : motorAnalysisData.VV,
        VA: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.VA, 2) + Math.pow(motorAnalysisData.VA, 2)) / 2) :
            showPump ? pumpAnalysisData.VA : motorAnalysisData.VA,
        AH: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.AH, 2) + Math.pow(motorAnalysisData.AH, 2)) / 2) :
            showPump ? pumpAnalysisData.AH : motorAnalysisData.AH,
        AV: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.AV, 2) + Math.pow(motorAnalysisData.AV, 2)) / 2) :
            showPump ? pumpAnalysisData.AV : motorAnalysisData.AV,
        AA: showPump && showMotor ?
            Math.sqrt((Math.pow(pumpAnalysisData.AA, 2) + Math.pow(motorAnalysisData.AA, 2)) / 2) :
            showPump ? pumpAnalysisData.AA : motorAnalysisData.AA,

        // Operating parameters remain consistent
        f: safeParseFloat(formValues.operatingFrequency, 50),    // FIXED: Use actual operating frequency
        N: safeParseFloat(formValues.operatingSpeed, 1450),     // FIXED: Use actual operating speed

        // Temperature - use maximum for system analysis
        temp: Math.max(pumpAnalysisData.temp || 0, motorAnalysisData.temp || 0)
    };
    const pumpAnalyses = useMemo(() => {
        // FIXED: Use NDE/DE analysis method for bearing-specific results
        const pumpData = {
            nde: {
                VH: safeParseFloat(formValues.vibrationData?.pump?.nde?.velH, 0),
                VV: safeParseFloat(formValues.vibrationData?.pump?.nde?.velV, 0),
                VA: safeParseFloat(formValues.vibrationData?.pump?.nde?.velAxl, 0),
                AH: safeParseFloat(formValues.vibrationData?.pump?.nde?.accH, 0),
                AV: safeParseFloat(formValues.vibrationData?.pump?.nde?.accV, 0),
                AA: safeParseFloat(formValues.vibrationData?.pump?.nde?.accAxl, 0),
                temp: safeParseFloat(formValues.vibrationData?.pump?.nde?.temp, 25)
            },
            de: {
                VH: safeParseFloat(formValues.vibrationData?.pump?.de?.velH, 0),
                VV: safeParseFloat(formValues.vibrationData?.pump?.de?.velV, 0),
                VA: safeParseFloat(formValues.vibrationData?.pump?.de?.velAxl, 0),
                AH: safeParseFloat(formValues.vibrationData?.pump?.de?.accH, 0),
                AV: safeParseFloat(formValues.vibrationData?.pump?.de?.accV, 0),
                AA: safeParseFloat(formValues.vibrationData?.pump?.de?.accAxl, 0),
                temp: safeParseFloat(formValues.vibrationData?.pump?.de?.temp, 25)
            },
            f: safeParseFloat(formValues.operatingFrequency, 50),
            N: safeParseFloat(formValues.operatingSpeed, 1450)
        };

        try {
            console.log('🚨 PUMP DATA DEBUG:', {
                hasNDEData: Object.values(pumpData.nde).some(v => v > 0),
                hasDEData: Object.values(pumpData.de).some(v => v > 0),
                ndeValues: pumpData.nde,
                deValues: pumpData.de,
                operatingParams: { f: pumpData.f, N: pumpData.N }
            });

            const analyses = FailureAnalysisEngine.performComprehensiveAnalysisWithNDEDE(pumpData);

            console.log('🔧 PUMP ANALYSIS RESULTS:', {
                totalAnalyses: analyses.length,
                ndeCount: analyses.filter(a => a.type.includes('NDE')).length,
                deCount: analyses.filter(a => a.type.includes('DE')).length,
                systemCount: analyses.filter(a => !a.type.includes('NDE') && !a.type.includes('DE')).length,
                allTypes: analyses.map(a => `${a.type} (${a.severity})`),
                severities: {
                    critical: analyses.filter(a => a.severity === 'Critical').length,
                    severe: analyses.filter(a => a.severity === 'Severe').length,
                    moderate: analyses.filter(a => a.severity === 'Moderate').length,
                    good: analyses.filter(a => a.severity === 'Good').length
                }
            });

            return analyses;
        } catch (error) {
            console.error('🔧 Pump Analysis Error:', error);
            console.error('🔧 Error details:', error instanceof Error ? error.stack : 'Unknown error');
            return [];
        }
    }, [
        formValues.vibrationData?.pump?.nde?.velH, formValues.vibrationData?.pump?.nde?.velV, formValues.vibrationData?.pump?.nde?.velAxl,
        formValues.vibrationData?.pump?.nde?.accH, formValues.vibrationData?.pump?.nde?.accV, formValues.vibrationData?.pump?.nde?.accAxl, formValues.vibrationData?.pump?.nde?.temp,
        formValues.vibrationData?.pump?.de?.velH, formValues.vibrationData?.pump?.de?.velV, formValues.vibrationData?.pump?.de?.velAxl,
        formValues.vibrationData?.pump?.de?.accH, formValues.vibrationData?.pump?.de?.accV, formValues.vibrationData?.pump?.de?.accAxl, formValues.vibrationData?.pump?.de?.temp,
        formValues.operatingFrequency, formValues.operatingSpeed
    ]);

    const motorAnalyses = useMemo(() => {
        // FIXED: Use NDE/DE analysis method for bearing-specific results
        const motorData = {
            nde: {
                VH: safeParseFloat(formValues.vibrationData?.motor?.nde?.velH, 0),
                VV: safeParseFloat(formValues.vibrationData?.motor?.nde?.velV, 0),
                VA: safeParseFloat(formValues.vibrationData?.motor?.nde?.velAxl, 0),
                AH: safeParseFloat(formValues.vibrationData?.motor?.nde?.accH, 0),
                AV: safeParseFloat(formValues.vibrationData?.motor?.nde?.accV, 0),
                AA: safeParseFloat(formValues.vibrationData?.motor?.nde?.accAxl, 0),
                temp: safeParseFloat(formValues.vibrationData?.motor?.nde?.temp, 25)
            },
            de: {
                VH: safeParseFloat(formValues.vibrationData?.motor?.de?.velH, 0),
                VV: safeParseFloat(formValues.vibrationData?.motor?.de?.velV, 0),
                VA: safeParseFloat(formValues.vibrationData?.motor?.de?.velAxl, 0),
                AH: safeParseFloat(formValues.vibrationData?.motor?.de?.accH, 0),
                AV: safeParseFloat(formValues.vibrationData?.motor?.de?.accV, 0),
                AA: safeParseFloat(formValues.vibrationData?.motor?.de?.accAxl, 0),
                temp: safeParseFloat(formValues.vibrationData?.motor?.de?.temp, 25)
            },
            f: safeParseFloat(formValues.operatingFrequency, 50),
            N: safeParseFloat(formValues.operatingSpeed, 1450)
        };

        try {
            console.log('🚨 MOTOR USEMEMO: Calling performComprehensiveAnalysisWithNDEDE');
            const analyses = FailureAnalysisEngine.performComprehensiveAnalysisWithNDEDE(motorData);
            console.log('⚡ Motor NDE/DE Analyses Results:', analyses.length, 'total');
            console.log('⚡ Motor Analysis Types:', analyses.map(a => `${a.type} (${a.severity})`));
            return analyses;
        } catch (error) {
            console.error('⚡ Motor Analysis Error:', error);
            return [];
        }
    }, [
        formValues.vibrationData?.motor?.nde?.velH, formValues.vibrationData?.motor?.nde?.velV, formValues.vibrationData?.motor?.nde?.velAxl,
        formValues.vibrationData?.motor?.nde?.accH, formValues.vibrationData?.motor?.nde?.accV, formValues.vibrationData?.motor?.nde?.accAxl, formValues.vibrationData?.motor?.nde?.temp,
        formValues.vibrationData?.motor?.de?.velH, formValues.vibrationData?.motor?.de?.velV, formValues.vibrationData?.motor?.de?.velAxl,
        formValues.vibrationData?.motor?.de?.accH, formValues.vibrationData?.motor?.de?.accV, formValues.vibrationData?.motor?.de?.accAxl, formValues.vibrationData?.motor?.de?.temp,
        formValues.operatingFrequency, formValues.operatingSpeed
    ]);

    const systemAnalyses = useMemo(() => {
        // ENHANCED: Use FailureAnalysisEngine validation before analysis
        if (!FailureAnalysisEngine.validateVibrationData(systemAnalysisData)) {
            console.warn('🏭 System Analysis: Data validation failed - insufficient or invalid vibration data');
            return [];
        }

        try {
            const analyses = FailureAnalysisEngine.performComprehensiveAnalysis(systemAnalysisData);
            console.log('🏭 System Analysis Data:', {
                ...systemAnalysisData,
                dataQuality: 'Valid & Verified',
                totalVibration: Math.sqrt(systemAnalysisData.VH ** 2 + systemAnalysisData.VV ** 2 + systemAnalysisData.VA ** 2),
                validationPassed: true
            });
            console.log('🏭 System Analyses Results:', analyses.map(a => ({
                type: a.type,
                severity: a.severity,
                index: a.index,
                description: a.description
            })));
            return analyses;
        } catch (error) {
            console.error('🏭 System Analysis Error:', error);
            return [];
        }
    }, [JSON.stringify(systemAnalysisData)]);
    const combinedAnalyses = useMemo(() => {
        const selectedTypes = getSelectedEquipmentTypes();
        const missingData = detectMissingData();

        // Only include equipment that is both selected AND has valid data
        const showPump = (selectedTypes.length === 0 || selectedTypes.includes('pump')) &&
            !missingData.some(m => m.type === 'pump');
        const showMotor = (selectedTypes.length === 0 || selectedTypes.includes('motor')) &&
            !missingData.some(m => m.type === 'motor');

        console.log('🎯 Enhanced Equipment Filtering:', {
            selectedEquipment,
            selectedTypes,
            missingData: missingData.map(m => m.type),
            showPump,
            showMotor,
            dataAvailability: {
                pumpHasData: !missingData.some(m => m.type === 'pump'),
                motorHasData: !missingData.some(m => m.type === 'motor')
            }
        });

        const analyses = [];

        // Only include pump analyses if pump equipment is selected
        if (showPump) {
            const pumpMapped = pumpAnalyses.map(analysis => ({
                ...analysis,
                type: `Pump ${analysis.type}`,
                description: `Pump: ${analysis.description}`
            }));
            analyses.push(...pumpMapped);
            console.log('🔧 Added Pump Analyses:', pumpMapped.length);
        }

        // Only include motor analyses if motor equipment is selected
        if (showMotor) {
            const motorMapped = motorAnalyses.map(analysis => ({
                ...analysis,
                type: `Motor ${analysis.type}`,
                description: `Motor: ${analysis.description}`
            }));
            analyses.push(...motorMapped);
            console.log('⚡ Added Motor Analyses:', motorMapped.length);
        }

        // Include system analyses only if both types are selected or no specific selection
        if ((showPump && showMotor) || selectedTypes.length === 0) {
            const systemMapped = systemAnalyses.map(analysis => ({
                ...analysis,
                type: `System ${analysis.type}`,
                description: `Combined System: ${analysis.description}`
            }));
            analyses.push(...systemMapped);
            console.log('🏭 Added System Analyses:', systemMapped.length);
        }

        console.log('📊 Total Combined Analyses:', analyses.length);
        return analyses;
    }, [pumpAnalyses, motorAnalyses, systemAnalyses, selectedEquipment]);
    const masterHealth = useMemo(() => {
        try {
            console.log('🔄 MASTER HEALTH RECALCULATION TRIGGERED');
            console.log('📊 Current vibration data:', {
                pump: {
                    nde: formValues.vibrationData?.pump?.nde,
                    de: formValues.vibrationData?.pump?.de
                },
                motor: {
                    nde: formValues.vibrationData?.motor?.nde,
                    de: formValues.vibrationData?.motor?.de
                }
            });
            console.log('📊 Combined Analyses Input:', {
                count: combinedAnalyses.length,
                types: combinedAnalyses.map(a => a.type),
                severities: combinedAnalyses.map(a => a.severity),
                indices: combinedAnalyses.map(a => a.index?.toFixed(2))
            });

            // Enhanced health calculation with NaN prevention
            const health = FailureAnalysisEngine.calculateMasterHealthAssessment(combinedAnalyses);

            // Validate and sanitize health score
            const sanitizedHealth = {
                ...health,
                overallHealthScore: isNaN(health.overallHealthScore) || !isFinite(health.overallHealthScore)
                    ? 100 // Default to 100% if calculation fails
                    : Math.max(0, Math.min(100, health.overallHealthScore)),
                masterFaultIndex: isNaN(health.masterFaultIndex) || !isFinite(health.masterFaultIndex)
                    ? 0 // Default to 0 if calculation fails
                    : Math.max(0, health.masterFaultIndex)
            };

            // 🚀 CREATE ADVANCED ANALYTICS WITH EXACT SAME DATA AS MAIN SYSTEM
            console.log('🚀 CREATING ADVANCED ANALYTICS with EXACT SAME DATA as main system...');
            console.log('🔍 Main system health score:', sanitizedHealth.overallHealthScore.toFixed(1) + '%');
            console.log('🔍 Main system MFI:', sanitizedHealth.masterFaultIndex.toFixed(3));
            console.log('🔍 Main system RUL:', sanitizedHealth.aiPoweredInsights?.timeToFailure + 'h');

            // Store vibration data globally for advanced physics calculations
            (globalThis as any).currentVibrationData = formValues.vibrationData;

            // Create Advanced Analytics using the EXACT SAME analyses and health data as main system
            const advancedAnalytics = FailureAnalysisEngine.createSimpleAdvancedAnalytics(combinedAnalyses, sanitizedHealth);

            // 📊 Generate advanced chart data for revolutionary analytics
            const chartData = FailureAnalysisEngine.generateAdvancedChartData(advancedAnalytics);

            // Store in global for dashboard access
            (globalThis as any).advancedAnalytics = {
                available: true,
                ...advancedAnalytics,
                chartData
            };

            console.log('✅ ADVANCED ANALYTICS: Created with perfect main system alignment');
            console.log('🎯 Expected Digital Twin Health:', sanitizedHealth.overallHealthScore.toFixed(1) + '%');
            console.log('🎯 Expected Digital Twin RUL:', Math.round((sanitizedHealth.aiPoweredInsights?.timeToFailure || 8760) / 24) + ' days');

            console.log('🏥 Enhanced Master Health Calculation - Data Flow Debug:', {
                step1_originalScore: health.overallHealthScore,
                step2_sanitizedScore: sanitizedHealth.overallHealthScore,
                step3_analysesCount: combinedAnalyses.length,
                step4_hasValidAnalyses: combinedAnalyses.length > 0,
                step5_singleEquipmentMode: combinedAnalyses.length <= 9,
                step6_reliabilityMetrics: {
                    exists: !!sanitizedHealth.reliabilityMetrics,
                    mtbf: sanitizedHealth.reliabilityMetrics?.mtbf,
                    mttr: sanitizedHealth.reliabilityMetrics?.mttr,
                    availability: sanitizedHealth.reliabilityMetrics?.availability
                },
                step7_aiInsights: {
                    exists: !!sanitizedHealth.aiPoweredInsights,
                    predictedFailure: sanitizedHealth.aiPoweredInsights?.predictedFailureMode,
                    timeToFailure: sanitizedHealth.aiPoweredInsights?.timeToFailure,
                    confidence: sanitizedHealth.aiPoweredInsights?.confidenceLevel
                },
                step8_criticalFailures: sanitizedHealth.criticalFailures,
                step9_dataFlowToDashboard: {
                    healthScoreValid: !isNaN(sanitizedHealth.overallHealthScore) && sanitizedHealth.overallHealthScore > 0,
                    hasReliabilityData: !!sanitizedHealth.reliabilityMetrics,
                    hasAIInsights: !!sanitizedHealth.aiPoweredInsights,
                    readyForDashboard: true
                }
            });

            return sanitizedHealth;
        } catch (error) {
            console.error('❌ Master Health Calculation Error:', error);

            // Return safe default values
            return {
                masterFaultIndex: 0,
                overallHealthScore: 100,
                healthGrade: 'A' as const,
                criticalFailures: [],
                recommendations: ['Unable to calculate health score - using default values'],
                overallEquipmentFailureProbability: 0.0,
                overallEquipmentReliability: 1.0,
                failureContributions: []
            };
        }
    }, [
        combinedAnalyses,
        // Add explicit dependencies to force recalculation when vibration data changes
        formValues.vibrationData?.pump?.nde?.velH, formValues.vibrationData?.pump?.nde?.velV, formValues.vibrationData?.pump?.nde?.velAxl,
        formValues.vibrationData?.pump?.nde?.accH, formValues.vibrationData?.pump?.nde?.accV, formValues.vibrationData?.pump?.nde?.accAxl,
        formValues.vibrationData?.pump?.de?.velH, formValues.vibrationData?.pump?.de?.velV, formValues.vibrationData?.pump?.de?.velAxl,
        formValues.vibrationData?.pump?.de?.accH, formValues.vibrationData?.pump?.de?.accV, formValues.vibrationData?.pump?.de?.accAxl,
        formValues.vibrationData?.motor?.nde?.velH, formValues.vibrationData?.motor?.nde?.velV, formValues.vibrationData?.motor?.nde?.velAxl,
        formValues.vibrationData?.motor?.nde?.accH, formValues.vibrationData?.motor?.nde?.accV, formValues.vibrationData?.motor?.nde?.accAxl,
        formValues.vibrationData?.motor?.de?.velH, formValues.vibrationData?.motor?.de?.velV, formValues.vibrationData?.motor?.de?.velAxl,
        formValues.vibrationData?.motor?.de?.accH, formValues.vibrationData?.motor?.de?.accV, formValues.vibrationData?.motor?.de?.accAxl,
        formValues.operatingFrequency, formValues.operatingSpeed
    ]);

    // PDF Report Generation Function (defined after masterHealth)
    const handleGeneratePDFReport = useCallback(async () => {
        try {
            if (!masterHealth) {
                toast({
                    title: "⚠️ No Data Available",
                    description: "Please complete vibration analysis first to generate a report.",
                    variant: "destructive"
                });
                return;
            }

            // Generate equipment ID from selected equipment
            const selectedTypes = getSelectedEquipmentTypes();
            const equipmentId = selectedEquipment.length > 0
                ? `${selectedTypes.join('-').toUpperCase()}-${selectedEquipment[0]}`
                : 'EQUIPMENT-001';

            // Generate timestamp
            const timestamp = new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });

            toast({
                title: "📄 Generating PDF Report",
                description: "Creating professional equipment health report with real calculated data...",
            });

            // Call the FailureAnalysisEngine PDF generation method
            await FailureAnalysisEngine.generatePDFReport(masterHealth, equipmentId, timestamp);

            toast({
                title: "✅ PDF Report Generated",
                description: `Equipment health report for ${equipmentId} has been generated successfully.`,
            });

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast({
                title: "❌ PDF Generation Failed",
                description: error instanceof Error ? error.message : "Failed to generate PDF report. Please try again.",
                variant: "destructive"
            });
        }
    }, [masterHealth, selectedEquipment, getSelectedEquipmentTypes, toast]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="w-screen h-screen max-w-none max-h-none flex flex-col p-0 m-0 rounded-none border-0">
                <DialogHeader className="px-6 py-2 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Waves className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-semibold">
                                    Enhanced Vibration Monitoring
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    Professional vibration data collection and analysis
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                Step {currentStep + 1} of {FORM_STEPS.length}
                            </Badge>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Progress</span>
                            <span>{Math.round(formProgress)}%</span>
                        </div>
                        <Progress value={formProgress} className="h-2" />
                    </div>
                </DialogHeader>

                {/* User Feedback Component */}
                {userFeedback.show && (
                    <div className={`mx-6 mt-4 p-4 rounded-lg border-l-4 ${userFeedback.type === 'error' ? 'bg-red-50 border-red-500 text-red-800' :
                        userFeedback.type === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                            userFeedback.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                                'bg-blue-50 border-blue-500 text-blue-800'
                        }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">{userFeedback.title}</h4>
                                <p className="text-sm">{userFeedback.message}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUserFeedback(prev => ({ ...prev, show: false }))}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}




                {/* Step Navigation */}
                <div className="px-6 py-2 border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        {FORM_STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;

                            return (
                                <div key={step.id} className="flex items-center">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : isCompleted
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'text-muted-foreground'
                                        }`}>
                                        <StepIcon className="h-4 w-4" />
                                        <span className="text-sm font-medium hidden md:block">{step.title}</span>
                                    </div>
                                    {index < FORM_STEPS.length - 1 && (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit(onSubmit)} className="h-full">
                        {/* Step 1: Equipment Selection */}
                        {currentStep === 0 && (
                            <div className="p-6 space-y-6">

                                {/* Multi Equipment Selector */}
                                <MultiEquipmentSelector
                                    selectedEquipment={selectedEquipment}
                                    onEquipmentSelect={handleEquipmentSelect}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    maxSelections={5}
                                />

                                {/* Selected Equipment Summary */}
                                {selectedEquipment.length > 0 && (
                                    <Card className="mt-6">
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Selected Equipment Summary ({selectedEquipment.length})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {selectedEquipment.map(equipmentId => {
                                                    const equipment = equipmentOptions.find(eq => eq.id === equipmentId);
                                                    if (!equipment) return null;

                                                    return (
                                                        <div key={equipmentId} className="p-3 border rounded-lg bg-card">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="p-1 rounded bg-primary/10">
                                                                    {React.createElement(equipment.categoryInfo?.icon || Factory, { className: "h-3 w-3 text-primary" })}
                                                                </div>
                                                                <span className="text-sm font-medium">{equipment.name}</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground space-y-1">
                                                                <div>Asset: {equipment.assetTag}</div>
                                                                <div>Manufacturer: {equipment.manufacturer}</div>
                                                                <div>Location: {equipment.hierarchicalPath}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Step 2: Operational Data */}
                        {currentStep === 1 && (
                            <div className="p-6 space-y-6">

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Measurement Information */}
                                    <Card>
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <CalendarIcon className="h-4 w-4" />
                                                Measurement Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="date"
                                                    control={control}
                                                    rules={{ required: "Date is required" }}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Measurement Date</Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                                        {field.value ? format(new Date(field.value), 'PPP') : 'Select date'}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={field.value ? new Date(field.value) : undefined}
                                                                        onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="time"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Measurement Time</Label>
                                                            <ThemedInput {...field} type="time" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operator"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Operator Name</Label>
                                                            <ThemedInput {...field} placeholder="Enter operator name" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="shift"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Shift</Label>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select shift" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="day">Day Shift</SelectItem>
                                                                    <SelectItem value="night">Night Shift</SelectItem>
                                                                    <SelectItem value="swing">Swing Shift</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Operating Conditions */}
                                    <Card>
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Gauge className="h-4 w-4" />
                                                Operating Conditions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="operatingHours"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Operating Hours</Label>
                                                            <ThemedInput {...field} placeholder="8760" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingPower"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Power (kW)</Label>
                                                            <ThemedInput {...field} placeholder="75" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingSpeed"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Speed (RPM)</Label>
                                                            <ThemedInput {...field} placeholder="1450" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingTemperature"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Temperature (°C)</Label>
                                                            <ThemedInput {...field} placeholder="45" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingVoltage"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Voltage (V)</Label>
                                                            <ThemedInput {...field} placeholder="380" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingCurrent"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Current (A)</Label>
                                                            <ThemedInput {...field} placeholder="125" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingFrequency"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Frequency (Hz)</Label>
                                                            <ThemedInput {...field} placeholder="50" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="operatingEfficiency"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Efficiency (%)</Label>
                                                            <ThemedInput {...field} placeholder="85" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Process Parameters */}
                                    <Card>
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Activity className="h-4 w-4" />
                                                Process Parameters
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="suctionPressure"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Suction Pressure (bar)</Label>
                                                            <ThemedInput {...field} placeholder="1.0" type="number" step="0.1" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="dischargePressure"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Discharge Pressure (bar)</Label>
                                                            <ThemedInput {...field} placeholder="5.5" type="number" step="0.1" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="flowRate"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Flow Rate (m³/h)</Label>
                                                            <ThemedInput {...field} placeholder="100" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="head"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Head (m)</Label>
                                                            <ThemedInput {...field} placeholder="50" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="powerConsumption"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Power Consumption (kW)</Label>
                                                            <ThemedInput {...field} placeholder="65" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="efficiency"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Process Efficiency (%)</Label>
                                                            <ThemedInput {...field} placeholder="92" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Environmental Conditions */}
                                    <Card>
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Thermometer className="h-4 w-4" />
                                                Environmental Conditions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="ambientTemperature"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Ambient Temperature (°C)</Label>
                                                            <ThemedInput {...field} placeholder="25" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="humidity"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Humidity (%)</Label>
                                                            <ThemedInput {...field} placeholder="60" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="vibrationLevel"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Background Vibration (mm/s)</Label>
                                                            <ThemedInput {...field} placeholder="0.5" type="number" step="0.1" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="noiseLevel"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Noise Level (dB)</Label>
                                                            <ThemedInput {...field} placeholder="75" type="number" themeVariant="outline" />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Dynamic Multi-Equipment Specifications */}
                                <MultiEquipmentSpecifications
                                    selectedEquipmentIds={selectedEquipment}
                                    className="bg-card"
                                />
                            </div>
                        )}

                        {/* Step 3: Comprehensive Vibration Measurements */}
                        {currentStep === 2 && (
                            <div className="p-6 space-y-6">

                                {/* ISO 10816 Guidelines */}
                                <Card className="bg-card">
                                    <CardHeader className="pb-3 pt-4 px-4">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Shield className="h-4 w-4" />
                                            ISO 10816 Vibration Guidelines
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }}></div>
                                                <span className="text-sm">Good: &lt; {firstEquipment?.categoryInfo?.vibrationLimits?.good || 2.8} mm/s</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(45, 93%, 47%)' }}></div>
                                                <span className="text-sm">Acceptable: &lt; {firstEquipment?.categoryInfo?.vibrationLimits?.acceptable || 7.1} mm/s</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(0, 84%, 60%)' }}></div>
                                                <span className="text-sm">Unacceptable: &gt; {firstEquipment?.categoryInfo?.vibrationLimits?.unacceptable || 18.0} mm/s</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Equipment Type Tabs - Filtered based on selection */}
                                {(() => {
                                    const selectedTypes = getSelectedEquipmentTypes();
                                    let showPump = selectedTypes.includes('pump');
                                    let showMotor = selectedTypes.includes('motor');

                                    // If no equipment selected, show all tabs
                                    if (selectedTypes.length === 0) {
                                        showPump = true;
                                        showMotor = true;
                                    }

                                    // Show only selected equipment types
                                    const defaultTab = showPump ? 'pump' : showMotor ? 'motor' : 'pump';
                                    const tabCount = (showPump ? 1 : 0) + (showMotor ? 1 : 0);

                                    return (
                                        <Tabs defaultValue={defaultTab} className="w-full">
                                            <TabsList className={`grid w-full grid-cols-${Math.max(1, tabCount)}`}>
                                                {showPump && (
                                                    <TabsTrigger value="pump" className="flex items-center gap-2">
                                                        <Cpu className="h-4 w-4" />
                                                        Pump
                                                    </TabsTrigger>
                                                )}
                                                {showMotor && (
                                                    <TabsTrigger value="motor" className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4" />
                                                        Motor
                                                    </TabsTrigger>
                                                )}
                                            </TabsList>

                                            {/* Pump Measurements */}
                                            {showPump && (
                                                <TabsContent value="pump" className="space-y-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Non-Drive End */}
                                                        <Card>
                                                            <CardHeader className="pb-3 pt-4 px-4">
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <Cpu className="h-4 w-4 text-primary" />
                                                                    Pump - Non-Drive End (NDE)
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Bearing Vibration</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['bv', 'bg'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.nde.${field}`}
                                                                                    name={`vibrationData.pump.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('pump.nde')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, field === 'bg' ? 'displacement' : 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Velocity (mm/s)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['velV', 'velH', 'velAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.nde.${field}`}
                                                                                    name={`vibrationData.pump.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('pump.nde')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Acceleration (mm/s²)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['accV', 'accH', 'accAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.nde.${field}`}
                                                                                    name={`vibrationData.pump.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'acceleration')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Temperature (°C)</Label>
                                                                        <Controller
                                                                            name="vibrationData.pump.nde.temp"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Input
                                                                                            {...field}
                                                                                            placeholder="45"
                                                                                            type="number"
                                                                                            className={`text-xs ${getVibrationInputColor(field.value)}`}
                                                                                        />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        {getVibrationTooltip('temp', 'temperature')}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Live RMS and ISO 10816 zone for Pump NDE */}
                                                                {(() => {
                                                                    const nde = formValues.vibrationData?.pump?.nde || {};
                                                                    const rms = calcRMSVelocity(nde);
                                                                    const zone = getISO10816Zone(rms);
                                                                    return (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="font-semibold text-sm">RMS Velocity:</span>
                                                                            <span className="font-mono text-sm">{safeDisplay(rms, 2)} mm/s</span>
                                                                            <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>
                                                                                Zone {zone.zone} ({zone.description})
                                                                            </Badge>
                                                                            {zone.zone === 'D' && (
                                                                                <span className="text-red-600 font-semibold ml-2 text-sm">Warning: Unacceptable!</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                        </Card>

                                                        {/* Drive End */}
                                                        <Card>
                                                            <CardHeader className="pb-3 pt-4 px-4">
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <Cpu className="h-4 w-4 text-primary" />
                                                                    Pump - Drive End (DE)
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Bearing Vibration</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['bv', 'bg'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.de.${field}`}
                                                                                    name={`vibrationData.pump.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('pump.de')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, field === 'bg' ? 'displacement' : 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Velocity (mm/s)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['velV', 'velH', 'velAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.de.${field}`}
                                                                                    name={`vibrationData.pump.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('pump.de')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Acceleration (mm/s²)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['accV', 'accH', 'accAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`pump.de.${field}`}
                                                                                    name={`vibrationData.pump.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'acceleration')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Temperature (°C)</Label>
                                                                        <Controller
                                                                            name="vibrationData.pump.de.temp"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Input
                                                                                            {...field}
                                                                                            placeholder="47"
                                                                                            type="number"
                                                                                            className={`text-xs ${getVibrationInputColor(field.value)}`}
                                                                                        />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        {getVibrationTooltip('temp', 'temperature')}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Live RMS and ISO 10816 zone for Pump DE */}
                                                                {(() => {
                                                                    const de = formValues.vibrationData?.pump?.de || {};
                                                                    const rms = calcRMSVelocity(de);
                                                                    const zone = getISO10816Zone(rms);
                                                                    return (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="font-semibold text-sm">RMS Velocity:</span>
                                                                            <span className="font-mono text-sm">{safeDisplay(rms, 2)} mm/s</span>
                                                                            <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>
                                                                                Zone {zone.zone} ({zone.description})
                                                                            </Badge>
                                                                            {zone.zone === 'D' && (
                                                                                <span className="text-red-600 font-semibold ml-2 text-sm">Warning: Unacceptable!</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Pump Legs Section Removed - Using NDE/DE data for FailureAnalysisEngine */}



                                                </TabsContent>
                                            )}

                                            {/* Motor Measurements */}
                                            {showMotor && (
                                                <TabsContent value="motor" className="space-y-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Non-Drive End */}
                                                        <Card>
                                                            <CardHeader className="pb-3 pt-4 px-4">
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <Zap className="h-4 w-4 text-green-500" />
                                                                    Motor - Non-Drive End (NDE)
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Bearing Vibration</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['bv', 'bg'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.nde.${field}`}
                                                                                    name={`vibrationData.motor.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('motor.nde')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, field === 'bg' ? 'displacement' : 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Velocity (mm/s)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['velV', 'velH', 'velAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.nde.${field}`}
                                                                                    name={`vibrationData.motor.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('motor.nde')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Acceleration (mm/s²)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['accV', 'accH', 'accAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.nde.${field}`}
                                                                                    name={`vibrationData.motor.nde.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'acceleration')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Temperature (°C)</Label>
                                                                        <Controller
                                                                            name="vibrationData.motor.nde.temp"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Input
                                                                                            {...field}
                                                                                            placeholder="42"
                                                                                            type="number"
                                                                                            className={`text-xs ${getVibrationInputColor(field.value)}`}
                                                                                        />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        {getVibrationTooltip('temp', 'temperature')}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Live RMS and ISO 10816 zone for Motor NDE */}
                                                                {(() => {
                                                                    const nde = formValues.vibrationData?.motor?.nde || {};
                                                                    const rms = calcRMSVelocity(nde);
                                                                    const zone = getISO10816Zone(rms);
                                                                    return (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="font-semibold text-sm">RMS Velocity:</span>
                                                                            <span className="font-mono text-sm">{safeDisplay(rms, 2)} mm/s</span>
                                                                            <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>
                                                                                Zone {zone.zone} ({zone.description})
                                                                            </Badge>
                                                                            {zone.zone === 'D' && (
                                                                                <span className="text-red-600 font-semibold ml-2 text-sm">Warning: Unacceptable!</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                        </Card>

                                                        {/* Drive End */}
                                                        <Card>
                                                            <CardHeader className="pb-3 pt-4 px-4">
                                                                <CardTitle className="flex items-center gap-2">
                                                                    <Zap className="h-4 w-4 text-primary" />
                                                                    Motor - Drive End (DE)
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-4 gap-3">
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Bearing Vibration</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['bv', 'bg'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.de.${field}`}
                                                                                    name={`vibrationData.motor.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('motor.de')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, field === 'bg' ? 'displacement' : 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Velocity (mm/s)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['velV', 'velH', 'velAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.de.${field}`}
                                                                                    name={`vibrationData.motor.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                    onFocus={() => setActivePoint('motor.de')}
                                                                                                    onBlur={() => setActivePoint(null)}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'velocity')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Acceleration (mm/s²)</Label>
                                                                        <div className="space-y-2 mt-1">
                                                                            {['accV', 'accH', 'accAxl'].map((field) => (
                                                                                <Controller
                                                                                    key={`motor.de.${field}`}
                                                                                    name={`vibrationData.motor.de.${field}` as any}
                                                                                    control={control}
                                                                                    render={({ field: f }) => (
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger asChild>
                                                                                                <Input
                                                                                                    {...f}
                                                                                                    value={f.value ?? ''}
                                                                                                    placeholder={field.toUpperCase()}
                                                                                                    type="number"
                                                                                                    className={`text-xs ${getVibrationInputColor(f.value)}`}
                                                                                                />
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                {getVibrationTooltip(field, 'acceleration')}
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="text-xs font-medium">Temperature (°C)</Label>
                                                                        <Controller
                                                                            name="vibrationData.motor.de.temp"
                                                                            control={control}
                                                                            render={({ field }) => (
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Input
                                                                                            {...field}
                                                                                            placeholder="44"
                                                                                            type="number"
                                                                                            className={`text-xs ${getVibrationInputColor(field.value)}`}
                                                                                        />
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent>
                                                                                        {getVibrationTooltip('temp', 'temperature')}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {/* Live RMS and ISO 10816 zone for Motor DE */}
                                                                {(() => {
                                                                    const de = formValues.vibrationData?.motor?.de || {};
                                                                    const rms = calcRMSVelocity(de);
                                                                    const zone = getISO10816Zone(rms);
                                                                    return (
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <span className="font-semibold text-sm">RMS Velocity:</span>
                                                                            <span className="font-mono text-sm">{safeDisplay(rms, 2)} mm/s</span>
                                                                            <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>
                                                                                Zone {zone.zone} ({zone.description})
                                                                            </Badge>
                                                                            {zone.zone === 'D' && (
                                                                                <span className="text-red-600 font-semibold ml-2 text-sm">Warning: Unacceptable!</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    {/* Motor Legs Section Removed - Using NDE/DE data for FailureAnalysisEngine */}






                                                </TabsContent>
                                            )}

                                        </Tabs>
                                    );
                                })()}

                            </div>
                        )}

                        {/* Step 4: Comprehensive Analysis & Review */}
                        {
                            currentStep === 3 && (
                                <div className="p-6 space-y-6">
                                    {(() => {
                                        // Extract vibration data from form for analysis
                                        const formData = getValues();
                                        const vibrationData = formData.vibrationData;

                                        // Check if we have valid vibration data before showing analytics
                                        const hasValidData = hasValidVibrationData(vibrationData);

                                        // Use master health score from failure analysis engine
                                        const integratedHealthScore = masterHealth.overallHealthScore;

                                        const enhancedMasterHealth = {
                                            ...masterHealth,
                                            overallHealthScore: integratedHealthScore,
                                            recommendations: [
                                                ...masterHealth.recommendations
                                            ]
                                        };

                                        // If no valid vibration data, show placeholder messages
                                        if (!hasValidData) {
                                            return (
                                                <div className="space-y-6">
                                                    {/* Main Placeholder Card */}
                                                    <Card
                                                        className="border-border dark:border-border"
                                                        style={{ background: 'hsl(var(--card))' }}
                                                    >
                                                        <CardHeader className="text-center pb-3 pt-4 px-4">
                                                            <CardTitle className="flex flex-col items-center gap-4">
                                                                <div className="p-4 bg-primary rounded-full shadow-lg">
                                                                    <BarChart className="h-8 w-8 text-primary-foreground" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-2xl font-bold text-foreground">Analytics Ready</h3>
                                                                    <p className="text-muted-foreground mt-2">Complete vibration measurements to generate comprehensive analysis</p>
                                                                </div>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-6">
                                                            <div className="text-center">
                                                                <p className="text-lg text-foreground mb-4">
                                                                    Enter vibration measurements in <strong>Step 3</strong> to unlock:
                                                                </p>
                                                            </div>

                                                            {/* Feature Preview Grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                <div className="p-4 bg-card rounded-lg shadow-sm border-l-4 border-primary/60">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <Brain className="h-5 w-5 text-primary" />
                                                                        <span className="font-semibold text-foreground">Unified AI Assessment</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Complete AI-powered analysis center with all assessment features in one location
                                                                    </p>
                                                                </div>

                                                                <div className="p-4 bg-card rounded-lg shadow-sm border-l-4 border-destructive/60">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                                        <span className="font-semibold text-foreground">Failure Analysis</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Comprehensive analysis of 17+ failure modes including unbalance, misalignment, and bearing defects
                                                                    </p>
                                                                </div>

                                                                <div className="p-4 bg-card rounded-lg shadow-sm border-l-4 border-emerald-500/60">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                                                                        <span className="font-semibold text-foreground">Health Dashboard</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Master health assessment with combined scoring and maintenance recommendations
                                                                    </p>
                                                                </div>

                                                                <div className="p-4 bg-card rounded-lg shadow-sm border-l-4 border-amber-500/60">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <BarChart className="h-5 w-5 text-amber-500" />
                                                                        <span className="font-semibold text-foreground">Reliability Metrics</span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        MTBF, RUL predictions, Weibull analysis, and ISO compliance metrics
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Instructions */}
                                                            <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-4 border border-border">
                                                                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                                                    <Info className="h-4 w-4 text-primary" />
                                                                    How to Generate Analytics
                                                                </h4>
                                                                <ol className="text-sm text-muted-foreground space-y-1">
                                                                    <li>1. Navigate back to <strong>Step 3: Vibration Measurements</strong></li>
                                                                    <li>2. Enter vibration readings for pump and/or motor equipment</li>
                                                                    <li>3. Include at least one non-zero measurement (NDE/DE or Leg readings)</li>
                                                                    <li>4. Return to this step to view comprehensive analytics</li>
                                                                </ol>
                                                            </div>

                                                            {/* Quick Navigation */}
                                                            <div className="text-center">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => setCurrentStep(2)}
                                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2"
                                                                >
                                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                                    Go to Step 3: Vibration Measurements
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {/* All AI components consolidated into unified AI Assessment Center below */}

                                                {/* Missing Data Notification */}
                                                {(() => {
                                                    const missingData = detectMissingData();
                                                    if (missingData.length > 0) {
                                                        return (
                                                            <Card className="mb-4 border-yellow-500/20 bg-yellow-500/10">
                                                                <CardHeader className="pb-2">
                                                                    <CardTitle className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                                                                        <AlertTriangle className="h-4 w-4" />
                                                                        Analysis with Partial Data
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="text-xs">
                                                                    <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                                                                        The following equipment was excluded from analysis due to missing vibration data:
                                                                    </p>
                                                                    <ul className="space-y-1">
                                                                        {missingData.map((item, index) => (
                                                                            <li key={index} className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                                                <span className="font-medium capitalize text-foreground">{item.type}</span>
                                                                                <span className="text-yellow-600 dark:text-yellow-400">- {item.reason}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                    <p className="text-yellow-700 dark:text-yellow-300 mt-2 text-xs">
                                                                        To include all selected equipment, go back to Step 3 and enter the missing measurements.
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    }
                                                    return null;
                                                })()}

                                                {/* Debug Panel for Testing */}
                                                <Card className="mb-4 border-primary/20 bg-primary/5">
                                                    <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm text-primary">
                                                            🔍 Debug: Data Flow Verification
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="text-xs">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                            <div>
                                                                <strong>Selected Equipment:</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    {selectedEquipment.length > 0 ? selectedEquipment.map(id => {
                                                                        const eq = equipmentOptions.find(e => e.id === id);
                                                                        return eq ? `${eq.name} (${eq.category})` : id;
                                                                    }).join(', ') : 'None'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <strong>Equipment Types:</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    {getSelectedEquipmentTypes().join(', ') || 'All'}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <strong>Failure Analyses:</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    P:{pumpAnalyses.length} M:{motorAnalyses.length} S:{systemAnalyses.length} = {combinedAnalyses.length}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <strong>Health Score:</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    {masterHealth.overallHealthScore.toFixed(1)}% ({masterHealth.healthGrade})
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <strong>Vibration Data (RMS):</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    Pump: VH={pumpAnalysisData.VH.toFixed(2)} VV={pumpAnalysisData.VV.toFixed(2)} mm/s<br />
                                                                    Motor: VH={motorAnalysisData.VH.toFixed(2)} VV={motorAnalysisData.VV.toFixed(2)} mm/s
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <strong>Failure Equations Status:</strong>
                                                                <div className="text-blue-600 text-xs">
                                                                    {(() => {
                                                                        const pumpValid = Object.values(pumpAnalysisData).some(v => typeof v === 'number' && v > 0);
                                                                        const motorValid = Object.values(motorAnalysisData).some(v => typeof v === 'number' && v > 0);
                                                                        const equationsWorking = combinedAnalyses.length > 0;
                                                                        return `Data: P:${pumpValid ? '✅' : '❌'} M:${motorValid ? '✅' : '❌'} | Equations: ${equationsWorking ? '✅ Working' : '❌ Failed'}`;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Button
                                                                type="button"
                                                                onClick={testDataFlow}
                                                                size="sm"
                                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                            >
                                                                🧪 Test Data Flow
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Enhanced Failure Analysis Carousel */}
                                                <EnhancedFailureAnalysisCarousel
                                                    analyses={combinedAnalyses}
                                                    autoRotationInterval={6000}
                                                    showControls={true}
                                                    className="mb-4"
                                                />

                                                {/* Unified Comprehensive Reliability Analysis Dashboard */}
                                                <Card
                                                    className="border-border dark:border-border"
                                                    style={{ background: 'hsl(var(--card))' }}
                                                >
                                                    <CardHeader className="pb-3 pt-4 px-4">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg">
                                                                    <TrendingUp className="h-5 w-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-foreground">Comprehensive Reliability Analysis Dashboard</h3>
                                                                    <p className="text-sm text-muted-foreground">Unified statistical metrics, failure analysis, and maintenance optimization</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowStandardsWidget(true)}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                                                    title="View International Standards Compliance Assessment"
                                                                >
                                                                    <Shield className="h-4 w-4" />
                                                                    Standards Compliance
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleGeneratePDFReport}
                                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                                    title="Generate PDF Report with Real Calculated Data"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                    Generate PDF Report
                                                                </button>
                                                            </div>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">


                                                        {masterHealth.reliabilityMetrics ? (
                                                            <>
                                                                {/* Master Health Overview */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                                                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                                                        <div className="text-3xl font-bold text-blue-700 mb-1">
                                                                            {masterHealth.overallHealthScore.toFixed(1)}%
                                                                        </div>
                                                                        <div className="text-sm font-medium text-blue-600">Overall Health Score</div>
                                                                        <div className="text-xs text-blue-500">Grade: {masterHealth.healthGrade}</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                                                                        <div className="text-3xl font-bold text-emerald-700 mb-1">
                                                                            {masterHealth.masterFaultIndex.toFixed(2)}
                                                                        </div>
                                                                        <div className="text-sm font-medium text-emerald-600">Master Fault Index</div>
                                                                        <div className="text-xs text-emerald-500">Risk Level: {masterHealth.reliabilityMetrics.riskLevel}</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg border border-violet-200">
                                                                        <div className="text-3xl font-bold text-violet-700 mb-1">
                                                                            {masterHealth.criticalFailures.length}
                                                                        </div>
                                                                        <div className="text-sm font-medium text-violet-600">Critical Failures</div>
                                                                        <div className="text-xs text-violet-500">Immediate Attention Required</div>
                                                                    </div>
                                                                    <div className={`text-center p-4 rounded-lg border ${masterHealth.overallEquipmentFailureProbability <= 0.2
                                                                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                                                        : masterHealth.overallEquipmentFailureProbability <= 0.5
                                                                            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                                                                            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                                                                        }`}>
                                                                        <div className={`text-3xl font-bold mb-1 ${masterHealth.overallEquipmentFailureProbability <= 0.2
                                                                            ? 'text-green-700'
                                                                            : masterHealth.overallEquipmentFailureProbability <= 0.5
                                                                                ? 'text-yellow-700'
                                                                                : 'text-red-700'
                                                                            }`}>
                                                                            {(masterHealth.overallEquipmentFailureProbability * 100).toFixed(1)}%
                                                                        </div>
                                                                        <div className={`text-sm font-medium ${masterHealth.overallEquipmentFailureProbability <= 0.2
                                                                            ? 'text-green-600'
                                                                            : masterHealth.overallEquipmentFailureProbability <= 0.5
                                                                                ? 'text-yellow-600'
                                                                                : 'text-red-600'
                                                                            }`}>Equipment Failure Probability</div>
                                                                        <div className={`text-xs ${masterHealth.overallEquipmentFailureProbability <= 0.2
                                                                            ? 'text-green-500'
                                                                            : masterHealth.overallEquipmentFailureProbability <= 0.5
                                                                                ? 'text-yellow-500'
                                                                                : 'text-red-500'
                                                                            }`}>
                                                                            {masterHealth.overallEquipmentFailureProbability <= 0.2 ? 'Low Risk' :
                                                                                masterHealth.overallEquipmentFailureProbability <= 0.5 ? 'Medium Risk' : 'High Risk'}
                                                                        </div>
                                                                    </div>
                                                                    <div className={`text-center p-4 rounded-lg border ${masterHealth.overallEquipmentReliability >= 0.8
                                                                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                                                        : masterHealth.overallEquipmentReliability >= 0.5
                                                                            ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200'
                                                                            : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                                                                        }`}>
                                                                        <div className={`text-3xl font-bold mb-1 ${masterHealth.overallEquipmentReliability >= 0.8
                                                                            ? 'text-green-700'
                                                                            : masterHealth.overallEquipmentReliability >= 0.5
                                                                                ? 'text-yellow-700'
                                                                                : 'text-red-700'
                                                                            }`}>
                                                                            {(masterHealth.overallEquipmentReliability * 100).toFixed(1)}%
                                                                        </div>
                                                                        <div className={`text-sm font-medium ${masterHealth.overallEquipmentReliability >= 0.8
                                                                            ? 'text-green-600'
                                                                            : masterHealth.overallEquipmentReliability >= 0.5
                                                                                ? 'text-yellow-600'
                                                                                : 'text-red-600'
                                                                            }`}>Equipment Reliability</div>
                                                                        <div className={`text-xs ${masterHealth.overallEquipmentReliability >= 0.8
                                                                            ? 'text-green-500'
                                                                            : masterHealth.overallEquipmentReliability >= 0.5
                                                                                ? 'text-yellow-500'
                                                                                : 'text-red-500'
                                                                            }`}>
                                                                            {masterHealth.overallEquipmentReliability >= 0.8 ? 'High Reliability' :
                                                                                masterHealth.overallEquipmentReliability >= 0.5 ? 'Medium Reliability' : 'Low Reliability'}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Comprehensive Reliability Metrics */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-primary">
                                                                            {masterHealth.reliabilityMetrics.mtbf.toLocaleString()}h
                                                                        </div>
                                                                        <div className="text-xs text-primary/80">MTBF</div>
                                                                        <div className="text-xs text-muted-foreground">Mean Time Between Failures</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-orange-600">
                                                                            {masterHealth.reliabilityMetrics.mttr}h
                                                                        </div>
                                                                        <div className="text-xs text-orange-600">MTTR</div>
                                                                        <div className="text-xs text-muted-foreground">Mean Time To Repair</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-emerald-600">
                                                                            {masterHealth.reliabilityMetrics.availability.toFixed(1)}%
                                                                        </div>
                                                                        <div className="text-xs text-emerald-600">Availability</div>
                                                                        <div className="text-xs text-muted-foreground">System Uptime</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-violet-600">
                                                                            {masterHealth.reliabilityMetrics.rul?.remaining_useful_life?.toLocaleString() || 'N/A'}h
                                                                        </div>
                                                                        <div className="text-xs text-violet-600">RUL</div>
                                                                        <div className="text-xs text-muted-foreground">Remaining Useful Life</div>
                                                                    </div>
                                                                </div>

                                                                {/* Advanced Analysis Section */}
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                    {/* Failure Mode Analysis Table */}
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                            Complete Failure Mode Analysis
                                                                        </h4>
                                                                        <div className="max-h-80 overflow-y-auto border border-border rounded-lg">
                                                                            {masterHealth.reliabilityMetrics.failureModes && masterHealth.reliabilityMetrics.failureModes.length > 0 ? (
                                                                                <table className="w-full text-sm">
                                                                                    <thead className="bg-muted/50 sticky top-0">
                                                                                        <tr>
                                                                                            <th className="text-left p-3 font-medium text-foreground border-b border-border">Failure Mode</th>
                                                                                            <th className="text-center p-3 font-medium text-foreground border-b border-border">RPN</th>
                                                                                            <th className="text-center p-3 font-medium text-foreground border-b border-border">Probability</th>
                                                                                            <th className="text-center p-3 font-medium text-foreground border-b border-border">Severity</th>
                                                                                            <th className="text-center p-3 font-medium text-foreground border-b border-border">Occurrence</th>
                                                                                            <th className="text-center p-3 font-medium text-foreground border-b border-border">Detection</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody>
                                                                                        {masterHealth.reliabilityMetrics.failureModes.map((mode, index) => (
                                                                                            <tr key={index} className="hover:bg-muted/30 transition-colors">
                                                                                                <td className="p-3 font-medium text-foreground border-b border-border/50">
                                                                                                    {mode.mode}
                                                                                                </td>
                                                                                                <td className="p-3 text-center font-bold text-destructive border-b border-border/50">
                                                                                                    {mode.rpn}
                                                                                                </td>
                                                                                                <td className="p-3 text-center font-bold text-orange-600 border-b border-border/50">
                                                                                                    {(mode.probability * 100).toFixed(1)}%
                                                                                                </td>
                                                                                                <td className="p-3 text-center text-muted-foreground border-b border-border/50">
                                                                                                    {mode.severity_score}
                                                                                                </td>
                                                                                                <td className="p-3 text-center text-muted-foreground border-b border-border/50">
                                                                                                    {mode.occurrence_score}
                                                                                                </td>
                                                                                                <td className="p-3 text-center text-muted-foreground border-b border-border/50">
                                                                                                    {mode.detection_score}
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            ) : (
                                                                                <div className="text-center py-8 text-muted-foreground">
                                                                                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                                                                    <p>No failure modes detected</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Maintenance Optimization & Weibull Analysis */}
                                                                    <div className="space-y-4">
                                                                        {/* Weibull Analysis */}
                                                                        <div>
                                                                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                                <Gauge className="h-4 w-4 text-amber-600" />
                                                                                Weibull Analysis
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="text-center p-3 bg-card rounded-lg border border-border">
                                                                                    <div className="text-xl font-bold text-amber-600">
                                                                                        {masterHealth.reliabilityMetrics.weibullAnalysis?.beta?.toFixed(2) || 'N/A'}
                                                                                    </div>
                                                                                    <div className="text-xs text-amber-600">β (Beta)</div>
                                                                                    <div className="text-xs text-muted-foreground">Shape Parameter</div>
                                                                                </div>
                                                                                <div className="text-center p-3 bg-card rounded-lg border border-border">
                                                                                    <div className="text-sm font-medium text-foreground">
                                                                                        {masterHealth.reliabilityMetrics.weibullAnalysis?.failure_pattern || 'N/A'}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground">Failure Pattern</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Maintenance Optimization */}
                                                                        <div>
                                                                            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                                <Target className="h-4 w-4 text-primary" />
                                                                                Maintenance Optimization
                                                                            </h4>
                                                                            <div className="space-y-3">
                                                                                <div className="p-3 bg-card rounded-lg border border-border">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-foreground">Optimal Interval</span>
                                                                                        <span className="text-sm font-bold text-primary">{masterHealth.reliabilityMetrics.maintenanceOptimization?.optimal_interval?.toLocaleString() || 'N/A'}h</span>
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground">Recommended maintenance frequency</div>
                                                                                </div>
                                                                                <div className="p-3 bg-card rounded-lg border border-border">
                                                                                    <div className="flex items-center justify-between mb-2">
                                                                                        <span className="text-sm font-medium text-foreground">Annual Savings</span>
                                                                                        <span className="text-sm font-bold text-emerald-600">${masterHealth.reliabilityMetrics.maintenanceOptimization?.cost_savings?.toLocaleString() || '0'}</span>
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground">Projected cost reduction</div>
                                                                                </div>
                                                                                <div className="p-3 bg-card rounded-lg border border-border">
                                                                                    <div className="text-sm font-medium mb-2 text-foreground">Recommended Actions</div>
                                                                                    <ul className="text-xs text-muted-foreground space-y-1 max-h-24 overflow-y-auto">
                                                                                        {masterHealth.reliabilityMetrics.maintenanceOptimization?.recommended_actions?.map((action, index) => (
                                                                                            <li key={index} className="flex items-start gap-1">
                                                                                                <span className="text-emerald-500 mt-0.5">•</span>
                                                                                                <span>{action}</span>
                                                                                            </li>
                                                                                        )) || (
                                                                                                <li className="flex items-start gap-1">
                                                                                                    <span className="text-emerald-500 mt-0.5">•</span>
                                                                                                    <span>Continue routine preventive maintenance</span>
                                                                                                </li>
                                                                                            )}
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* AI-Powered Insights */}
                                                                {masterHealth.aiPoweredInsights && (
                                                                    <div className="mt-6 p-4 bg-accent/30 rounded-lg border shadow-sm">
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Cpu className="h-4 w-4 text-primary" />
                                                                            AI-Powered Insights
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-bold text-purple-700">{masterHealth.aiPoweredInsights.predictedFailureMode}</div>
                                                                                <div className="text-xs text-purple-600">Predicted Failure Mode</div>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-bold text-purple-700">{masterHealth.aiPoweredInsights.timeToFailure}h</div>
                                                                                <div className="text-xs text-purple-600">Time to Failure</div>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-lg font-bold text-purple-700">{masterHealth.aiPoweredInsights.confidenceLevel}%</div>
                                                                                <div className="text-xs text-purple-600">Confidence Level</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Unified Intelligent Recommendations System */}
                                                                {(() => {
                                                                    const unifiedRecs = (masterHealth as any).unifiedRecommendations;

                                                                    // DEBUG: Log what we're receiving
                                                                    console.log('🔍 UI DEBUG - Unified Recommendations:', unifiedRecs);
                                                                    if (unifiedRecs) {
                                                                        console.log('🔍 UI DEBUG - Immediate:', unifiedRecs.immediate?.length || 0);
                                                                        console.log('🔍 UI DEBUG - Short-term:', unifiedRecs.shortTerm?.length || 0);
                                                                        console.log('🔍 UI DEBUG - Long-term:', unifiedRecs.longTerm?.length || 0);
                                                                    }

                                                                    if (!unifiedRecs && masterHealth.recommendations && masterHealth.recommendations.length > 0) {
                                                                        // Fallback to old recommendations if unified system not available
                                                                        return (
                                                                            <div className="mt-6 p-4 bg-card rounded-lg border shadow-sm">
                                                                                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                                    Critical Recommendations from FailureAnalysisEngine
                                                                                </h4>
                                                                                <div className="space-y-2">
                                                                                    {masterHealth.recommendations.map((recommendation, index) => (
                                                                                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border">
                                                                                            <div className="flex-shrink-0 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold">
                                                                                                {index + 1}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <p className="text-sm text-foreground font-medium">{recommendation}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                                                                                    <strong>Note:</strong> These recommendations are generated by the FailureAnalysisEngine based on detected failure modes and severity levels.
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    if (!unifiedRecs) return null;

                                                                    return (
                                                                        <div className="mt-6 p-4 bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm border border-primary/20 hover:border-primary/40 shadow-md hover:shadow-xl transition-all duration-500 ease-in-out rounded-lg">
                                                                            <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                                                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
                                                                                    <Brain className="h-5 w-5" />
                                                                                </div>
                                                                                Intelligent Recommendations System
                                                                                <Badge className="bg-primary/10 text-primary text-xs ml-2">
                                                                                    AI-Powered
                                                                                </Badge>
                                                                            </h4>

                                                                            {/* Enhanced Summary Dashboard - Failure Mode Card Style */}
                                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-white/5 dark:bg-zinc-900/10 backdrop-blur-sm rounded-lg border border-primary/20 shadow-md">
                                                                                <div className="text-center p-3 bg-red-500/5 border border-red-500/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                                                    <div className="flex items-center justify-center mb-2">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-600 mr-2">
                                                                                            <AlertTriangle className="h-4 w-4" />
                                                                                        </div>
                                                                                        <div className="text-2xl font-bold text-red-600">{unifiedRecs.summary.criticalActions}</div>
                                                                                    </div>
                                                                                    <div className="text-xs font-medium text-red-600/80">Critical Actions</div>
                                                                                </div>
                                                                                <div className="text-center p-3 bg-blue-500/5 border border-blue-500/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                                                    <div className="flex items-center justify-center mb-2">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-600 mr-2">
                                                                                            <Wrench className="h-4 w-4" />
                                                                                        </div>
                                                                                        <div className="text-2xl font-bold text-blue-600">{unifiedRecs.summary.maintenanceActions}</div>
                                                                                    </div>
                                                                                    <div className="text-xs font-medium text-blue-600/80">Maintenance</div>
                                                                                </div>
                                                                                <div className="text-center p-3 bg-green-500/5 border border-green-500/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                                                    <div className="flex items-center justify-center mb-2">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/20 text-green-600 mr-2">
                                                                                            <Eye className="h-4 w-4" />
                                                                                        </div>
                                                                                        <div className="text-2xl font-bold text-green-600">{unifiedRecs.summary.monitoringActions}</div>
                                                                                    </div>
                                                                                    <div className="text-xs font-medium text-green-600/80">Monitoring</div>
                                                                                </div>
                                                                                <div className="text-center p-3 bg-purple-500/5 border border-purple-500/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                                                    <div className="flex items-center justify-center mb-2">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 mr-2">
                                                                                            <DollarSign className="h-4 w-4" />
                                                                                        </div>
                                                                                        <div className="text-2xl font-bold text-purple-600">{unifiedRecs.summary.estimatedCost}</div>
                                                                                    </div>
                                                                                    <div className="text-xs font-medium text-purple-600/80">Est. Cost</div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Immediate Actions - Failure Mode Card Style */}
                                                                            {unifiedRecs.immediate.length > 0 && (
                                                                                <div className="mb-6">
                                                                                    <h5 className="font-semibold text-base mb-4 flex items-center gap-2 text-foreground">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/20 text-red-600">
                                                                                            <Clock className="h-4 w-4" />
                                                                                        </div>
                                                                                        Immediate Actions Required ({unifiedRecs.immediate.length})
                                                                                    </h5>
                                                                                    <div className="space-y-4">
                                                                                        {unifiedRecs.immediate.map((rec: any, index: number) => (
                                                                                            <div key={index} className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${
                                                                                                rec.priority === 'Critical' ? 'bg-red-500/5 border border-red-500/30' :
                                                                                                'bg-orange-500/5 border border-orange-500/30'
                                                                                            }`}>
                                                                                                <div className="flex items-start gap-3">
                                                                                                    <div className="flex-shrink-0">
                                                                                                        <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                                                                                            rec.priority === 'Critical' ? 'bg-red-500/20 text-red-600' : 'bg-orange-500/20 text-orange-600'
                                                                                                        }`}>
                                                                                                            {rec.priority === 'Critical' ?
                                                                                                                <AlertTriangle className="h-5 w-5" /> :
                                                                                                                <AlertCircle className="h-5 w-5" />
                                                                                                            }
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex-1">
                                                                                                        <div className="flex items-center gap-2 mb-3">
                                                                                                            <Badge className={`text-xs font-medium ${
                                                                                                                rec.priority === 'Critical' ? 'bg-red-500/10 text-red-600' :
                                                                                                                'bg-orange-500/10 text-orange-600'
                                                                                                            }`}>
                                                                                                                {rec.priority}
                                                                                                            </Badge>
                                                                                                            <Badge variant="outline" className={`text-xs ${
                                                                                                                rec.priority === 'Critical' ? 'border-red-500/30 text-red-600' : 'border-orange-500/30 text-orange-600'
                                                                                                            }`}>
                                                                                                                {rec.category}
                                                                                                            </Badge>
                                                                                                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                                                                                                                rec.priority === 'Critical' ? 'bg-red-500/10 text-red-600' : 'bg-orange-500/10 text-orange-600'
                                                                                                            }`}>{rec.timeframe}</span>
                                                                                                        </div>
                                                                                                        <h6 className="text-sm font-bold text-foreground mb-2">Urgent Action:</h6>
                                                                                                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{rec.action}</p>
                                                                                                        <div className={`bg-white/50 dark:bg-zinc-900/50 p-3 rounded-md border mb-3 ${
                                                                                                            rec.priority === 'Critical' ? 'border-red-500/20' : 'border-orange-500/20'
                                                                                                        }`}>
                                                                                                            <h6 className={`text-xs font-semibold mb-1 ${
                                                                                                                rec.priority === 'Critical' ? 'text-red-600' : 'text-orange-600'
                                                                                                            }`}>Critical Justification:</h6>
                                                                                                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                                                                                        </div>
                                                                                                        <p className={`text-xs font-medium ${
                                                                                                            rec.priority === 'Critical' ? 'text-red-600' : 'text-orange-600'
                                                                                                        }`}>Source: {rec.source}</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Short-term Actions - Failure Mode Card Style */}
                                                                            {unifiedRecs.shortTerm.length > 0 && (
                                                                                <div className="mb-6">
                                                                                    <h5 className="font-semibold text-base mb-4 flex items-center gap-2 text-foreground">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500/20 text-orange-600">
                                                                                            <Timer className="h-4 w-4" />
                                                                                        </div>
                                                                                        Short-term Actions ({unifiedRecs.shortTerm.length})
                                                                                    </h5>
                                                                                    <div className="space-y-4">
                                                                                        {unifiedRecs.shortTerm.map((rec: any, index: number) => (
                                                                                            <div key={index} className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/30 shadow-sm hover:shadow-md transition-all duration-300">
                                                                                                <div className="flex items-start gap-3">
                                                                                                    <div className="flex-shrink-0">
                                                                                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-500/20 text-orange-600">
                                                                                                            <Timer className="h-5 w-5" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex-1">
                                                                                                        <div className="flex items-center gap-2 mb-3">
                                                                                                            <Badge className="bg-orange-500/10 text-orange-600 text-xs font-medium">
                                                                                                                {rec.priority}
                                                                                                            </Badge>
                                                                                                            <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-600">
                                                                                                                {rec.category}
                                                                                                            </Badge>
                                                                                                            <span className="text-xs text-orange-600 font-medium bg-orange-500/10 px-2 py-1 rounded">{rec.timeframe}</span>
                                                                                                        </div>
                                                                                                        <h6 className="text-sm font-bold text-foreground mb-2">Action Required:</h6>
                                                                                                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{rec.action}</p>

                                                                                                        <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-md border border-orange-500/20 mb-3">
                                                                                                            <h6 className="text-xs font-semibold text-orange-600 mb-1">Technical Justification:</h6>
                                                                                                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                                                                                        </div>

                                                                                                        {rec.technicalDetails && (
                                                                                                            <div className="bg-primary/5 p-3 rounded-md border border-primary/20 mb-3">
                                                                                                                <h6 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                                                                                                                    <Settings className="h-3 w-3" />
                                                                                                                    Technical Specifications:
                                                                                                                </h6>
                                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                                                                    {rec.technicalDetails.standard && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-primary">Standard:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.standard}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.tolerance && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-primary">Tolerance:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.tolerance}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.tools && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-primary">Tools Required:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.tools}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.verification && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-primary">Verification:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.verification}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                                {rec.technicalDetails.safetyNote && (
                                                                                                                    <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                                                                                                        <span className="text-xs font-medium text-destructive flex items-center gap-1">
                                                                                                                            <AlertTriangle className="h-3 w-3" />
                                                                                                                            Safety: {rec.technicalDetails.safetyNote}
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </div>
                                                                                                        )}

                                                                                                        <div className="flex items-center justify-between">
                                                                                                            <p className="text-xs text-primary font-medium">Source: {rec.source}</p>
                                                                                                            <Badge variant="secondary" className="text-xs">
                                                                                                                Action #{index + 1}
                                                                                                            </Badge>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Long-term Actions - Failure Mode Card Style */}
                                                                            {unifiedRecs.longTerm.length > 0 && (
                                                                                <div className="mb-6">
                                                                                    <h5 className="font-semibold text-base mb-4 flex items-center gap-2 text-foreground">
                                                                                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-600">
                                                                                            <Target className="h-4 w-4" />
                                                                                        </div>
                                                                                        Long-term Actions ({unifiedRecs.longTerm.length})
                                                                                    </h5>
                                                                                    <div className="space-y-4">
                                                                                        {unifiedRecs.longTerm.map((rec: any, index: number) => (
                                                                                            <div key={index} className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/30 shadow-sm hover:shadow-md transition-all duration-300">
                                                                                                <div className="flex items-start gap-3">
                                                                                                    <div className="flex-shrink-0">
                                                                                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500/20 text-blue-600">
                                                                                                            <Target className="h-5 w-5" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex-1">
                                                                                                        <div className="flex items-center gap-2 mb-3">
                                                                                                            <Badge className="bg-blue-500/10 text-blue-600 text-xs font-medium">
                                                                                                                {rec.priority}
                                                                                                            </Badge>
                                                                                                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">
                                                                                                                {rec.category}
                                                                                                            </Badge>
                                                                                                            <span className="text-xs text-blue-600 font-medium bg-blue-500/10 px-2 py-1 rounded">{rec.timeframe}</span>
                                                                                                        </div>
                                                                                                        <h6 className="text-sm font-bold text-foreground mb-2">Strategic Initiative:</h6>
                                                                                                        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{rec.action}</p>

                                                                                                        <div className="bg-white/50 dark:bg-zinc-900/50 p-3 rounded-md border border-blue-500/20 mb-3">
                                                                                                            <h6 className="text-xs font-semibold text-blue-600 mb-1">Business Justification:</h6>
                                                                                                            <p className="text-xs text-muted-foreground">{rec.reason}</p>
                                                                                                        </div>

                                                                                                        {rec.technicalDetails && (
                                                                                                            <div className="bg-green-500/5 p-3 rounded-md border border-green-500/20 mb-3">
                                                                                                                <h6 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                                                                                                                    <Settings className="h-3 w-3" />
                                                                                                                    Implementation Details:
                                                                                                                </h6>
                                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                                                                                                    {rec.technicalDetails.standard && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-green-600 dark:text-green-400">Standard:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.standard}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.frequency && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-green-600 dark:text-green-400">Frequency:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.frequency}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.tools && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-green-600 dark:text-green-400">Tools Required:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.tools}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                    {rec.technicalDetails.kpis && (
                                                                                                                        <div className="flex flex-col">
                                                                                                                            <span className="font-medium text-green-600 dark:text-green-400">KPIs:</span>
                                                                                                                            <span className="text-muted-foreground">{rec.technicalDetails.kpis}</span>
                                                                                                                        </div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        )}

                                                                                                        <div className="flex items-center justify-between">
                                                                                                            <p className="text-xs text-primary font-medium">Source: {rec.source}</p>
                                                                                                            <Badge variant="secondary" className="text-xs">
                                                                                                                Initiative #{index + 1}
                                                                                                            </Badge>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {/* Enhanced AI-Powered Footer - Failure Mode Card Style */}
                                                                            <div className="mt-6 p-4 bg-purple-500/5 border border-purple-500/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                                                                                <div className="flex items-start gap-3">
                                                                                    <div className="flex-shrink-0">
                                                                                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-500/20 text-purple-600">
                                                                                            <Brain className="h-5 w-5" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex-1">
                                                                                        <h6 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                                                                            AI-Powered Intelligent Recommendations
                                                                                            <Badge className="bg-purple-500/10 text-purple-600 text-xs">
                                                                                                Advanced Analytics
                                                                                            </Badge>
                                                                                        </h6>
                                                                                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                                                                            These recommendations are generated by advanced ML algorithms, digital twin analysis,
                                                                                            multi-physics correlation, and edge processing systems with duplicate elimination
                                                                                            and intelligent prioritization.
                                                                                        </p>
                                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                                                                            <div className="flex items-center gap-1 text-purple-600">
                                                                                                <Cpu className="h-3 w-3" />
                                                                                                <span>ML Analytics</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 text-purple-600">
                                                                                                <Database className="h-3 w-3" />
                                                                                                <span>Digital Twin</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 text-purple-600">
                                                                                                <Zap className="h-3 w-3" />
                                                                                                <span>Multi-Physics</span>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-1 text-purple-600">
                                                                                                <Lightning className="h-3 w-3" />
                                                                                                <span>Edge Processing</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-12">
                                                                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                                                <p className="text-lg font-medium text-muted-foreground mb-2">Comprehensive Reliability Analysis Ready</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Enter vibration measurements to generate complete failure analysis, RUL predictions, and maintenance optimization
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>


                                                {/* Phase 3: Advanced Analytics Dashboard */}
                                                {(() => {
                                                    if (!masterHealth || !combinedAnalyses || combinedAnalyses.length === 0) {
                                                        return null;
                                                    }

                                                    // NEW SIMPLE ADVANCED ANALYTICS DASHBOARD
                                                    const advancedAnalytics = (globalThis as any).advancedAnalytics;

                                                    if (!advancedAnalytics || !advancedAnalytics.available) {
                                                        return (
                                                            <Card className="border-border dark:border-border mt-6" style={{ background: 'hsl(var(--card))' }}>
                                                                <CardHeader className="pb-3 pt-4 px-4">
                                                                    <CardTitle className="flex items-center gap-3">
                                                                        <div className="p-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-lg">
                                                                            <Zap className="h-5 w-5 text-white" />
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-lg font-bold text-foreground">Advanced Analytics Dashboard</h3>
                                                                            <p className="text-sm text-muted-foreground">Requires Real Vibration Data Input</p>
                                                                        </div>
                                                                    </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="px-4 pb-4">
                                                                    <div className="text-center py-8">
                                                                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                            <Brain className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                                                                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                                                                                Advanced Analytics Ready
                                                                            </h4>
                                                                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                                                                                AI/ML, Digital Twin, Multi-Physics, and Edge Processing analytics will be calculated when real vibration data is provided.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    }

                                                    return (
                                                        <Card className="border-border dark:border-border mt-6" style={{ background: 'hsl(var(--card))' }}>
                                                            <CardHeader className="pb-3 pt-4 px-4">
                                                                <CardTitle className="flex items-center gap-3">
                                                                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                                                        <Zap className="h-5 w-5 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-foreground">Advanced Analytics Dashboard</h3>
                                                                        <p className="text-sm text-muted-foreground">✅ Perfect Main System Alignment - 100% Equation-Based</p>
                                                                    </div>
                                                                </CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="px-4 pb-4">
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                                                    {/* ML Anomaly Detection */}
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Brain className="h-4 w-4 text-blue-500" />
                                                                            ML Anomaly Detection
                                                                        </h4>
                                                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border">
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <span className="text-sm font-medium">Anomaly Score</span>
                                                                                <Badge className={`${
                                                                                    advancedAnalytics.mlAnomalyDetection.anomalyType === 'Normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                                                    advancedAnalytics.mlAnomalyDetection.anomalyType === 'Mild' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                                                    advancedAnalytics.mlAnomalyDetection.anomalyType === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                                    advancedAnalytics.mlAnomalyDetection.anomalyType === 'Severe' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                                                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                                }`}>
                                                                                    {advancedAnalytics.mlAnomalyDetection.anomalyType}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Confidence:</span>
                                                                                    <span className="font-medium ml-1">{advancedAnalytics.mlAnomalyDetection.confidence}%</span>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Score:</span>
                                                                                    <span className="font-medium ml-1">{(advancedAnalytics.mlAnomalyDetection.anomalyScore * 100).toFixed(1)}%</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3">
                                                                                <span className="text-xs font-medium text-muted-foreground">Detected Patterns:</span>
                                                                                <div className="mt-1 space-y-1">
                                                                                    {advancedAnalytics.mlAnomalyDetection.detectedPatterns.slice(0, 2).map((pattern: string, index: number) => (
                                                                                        <p key={index} className="text-xs text-muted-foreground flex items-start gap-1">
                                                                                            <span className="text-blue-500 mt-0.5">•</span>
                                                                                            {pattern}
                                                                                        </p>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Digital Twin */}
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Cpu className="h-4 w-4 text-purple-500" />
                                                                            Digital Twin
                                                                        </h4>
                                                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-4 border">
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <span className="text-sm font-medium">Operational Status</span>
                                                                                <Badge className={`${
                                                                                    advancedAnalytics.digitalTwin.physicalState.operationalStatus === 'Healthy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                                                    advancedAnalytics.digitalTwin.physicalState.operationalStatus === 'Degraded' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                                    advancedAnalytics.digitalTwin.physicalState.operationalStatus === 'Critical' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                                                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                                }`}>
                                                                                    {advancedAnalytics.digitalTwin.physicalState.operationalStatus}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Health Index:</span>
                                                                                    <div className="font-bold text-lg">{advancedAnalytics.digitalTwin.physicalState.healthIndex.toFixed(1)}%</div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Efficiency:</span>
                                                                                    <div className="font-bold text-lg">{advancedAnalytics.digitalTwin.physicalState.performanceEfficiency.toFixed(1)}%</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                                                <div className="text-xs">
                                                                                    <span className="text-muted-foreground">Remaining Life:</span>
                                                                                    <span className="font-medium ml-1">{advancedAnalytics.digitalTwin.physicalState.remainingLife} days</span>
                                                                                </div>
                                                                                <div className="text-xs mt-1">
                                                                                    <span className="text-muted-foreground">Next Failure:</span>
                                                                                    <span className="font-medium ml-1">{advancedAnalytics.digitalTwin.predictiveInsights.nextFailureMode}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Multi-Physics Analysis */}
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Activity className="h-4 w-4 text-green-500" />
                                                                            Multi-Physics Analysis
                                                                        </h4>
                                                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border">
                                                                            <div className="space-y-3">
                                                                                <div>
                                                                                    <span className="text-sm font-medium">Primary Cause</span>
                                                                                    <p className="text-sm text-muted-foreground mt-1">{advancedAnalytics.multiPhysicsAnalysis.rootCauseAnalysis.primaryCause}</p>
                                                                                </div>
                                                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                                                    <div className="text-center">
                                                                                        <div className="font-medium">Thermal</div>
                                                                                        <div className="text-muted-foreground">{(advancedAnalytics.multiPhysicsAnalysis.physicsInsights.thermalVibrationCorrelation * 100).toFixed(0)}%</div>
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <div className="font-medium">Speed</div>
                                                                                        <div className="text-muted-foreground">{(advancedAnalytics.multiPhysicsAnalysis.physicsInsights.speedVibrationCorrelation * 100).toFixed(0)}%</div>
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <div className="font-medium">Frequency</div>
                                                                                        <div className="text-muted-foreground">{(advancedAnalytics.multiPhysicsAnalysis.physicsInsights.frequencyVibrationCorrelation * 100).toFixed(0)}%</div>
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-xs font-medium text-muted-foreground">Physics Score:</span>
                                                                                    <span className="text-sm font-bold ml-1">{advancedAnalytics.multiPhysicsAnalysis.multiPhysicsScore.toFixed(1)}%</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Edge Processing */}
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Zap className="h-4 w-4 text-orange-500" />
                                                                            Edge Processing
                                                                        </h4>
                                                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-4 border">
                                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Processing Time:</span>
                                                                                    <div className="font-bold">{advancedAnalytics.edgeProcessing.performanceMetrics.latency.toFixed(2)}ms</div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Accuracy:</span>
                                                                                    <div className="font-bold">{advancedAnalytics.edgeProcessing.performanceMetrics.accuracy.toFixed(1)}%</div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Compression:</span>
                                                                                    <div className="font-bold">{advancedAnalytics.edgeProcessing.edgeAnalytics.dataCompression}%</div>
                                                                                </div>
                                                                                <div>
                                                                                    <span className="text-muted-foreground">Trend:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.edgeProcessing.realTimeInsights.trendAnalysis.direction === 'Stable' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                                                        advancedAnalytics.edgeProcessing.realTimeInsights.trendAnalysis.direction === 'Improving' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                                                        advancedAnalytics.edgeProcessing.realTimeInsights.trendAnalysis.direction === 'Degrading' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                                                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                                                    }`}>
                                                                                        {advancedAnalytics.edgeProcessing.realTimeInsights.trendAnalysis.direction}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 🚀 REVOLUTIONARY ADVANCED ANALYTICS SUMMARY */}
                                                                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-950/20 rounded-lg border">
                                                                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                        <span className="text-2xl">🚀</span>
                                                                        Revolutionary Advanced Analytics Summary
                                                                    </h5>
                                                                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center">
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-blue-600">{advancedAnalytics.mlAnomalyDetection.confidence}%</div>
                                                                            <div className="text-xs text-muted-foreground">ML Confidence</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-purple-600">{advancedAnalytics.digitalTwin.physicalState.healthIndex.toFixed(0)}%</div>
                                                                            <div className="text-xs text-muted-foreground">Twin Health</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-green-600">{advancedAnalytics.multiPhysicsAnalysis.multiPhysicsScore.toFixed(0)}%</div>
                                                                            <div className="text-xs text-muted-foreground">Physics Score</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-orange-600">{advancedAnalytics.edgeProcessing.performanceMetrics.latency.toFixed(1)}ms</div>
                                                                            <div className="text-xs text-muted-foreground">Edge Latency</div>
                                                                        </div>
                                                                        {/* 🚀 NEW REVOLUTIONARY METRICS */}
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-red-600">{advancedAnalytics.advancedPhysicsModeling.stressAnalysis.currentStressLevel.toFixed(0)}%</div>
                                                                            <div className="text-xs text-muted-foreground">Stress Level</div>
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-2xl font-bold text-indigo-600">{Math.round(advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.l10LifeHours / 1000)}k</div>
                                                                            <div className="text-xs text-muted-foreground">Bearing Life (h)</div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 📊 USER-FOCUSED ACTIONABLE CHARTS DASHBOARD */}
                                                                <div className="mt-6 p-6 bg-card rounded-lg border border-border shadow-sm">
                                                                    <h5 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                                                                        <span className="text-2xl">📊</span>
                                                                        Actionable Insights Dashboard
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            User-Focused
                                                                        </Badge>
                                                                    </h5>

                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                        {/* 📅 MAINTENANCE TIMELINE CHART */}
                                                                        <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                                                                            <h6 className="font-medium text-sm mb-3 flex items-center gap-1 text-card-foreground">
                                                                                <Calendar className="h-4 w-4 text-primary" />
                                                                                Maintenance Timeline - When to Act
                                                                            </h6>
                                                                            <div className="h-64">
                                                                                <Bar
                                                                                    data={{
                                                                                        labels: advancedAnalytics.chartData.maintenanceTimelineData.map((item: any) => item.timeframe),
                                                                                        datasets: [
                                                                                            {
                                                                                                label: 'Priority Level (%)',
                                                                                                data: advancedAnalytics.chartData.maintenanceTimelineData.map((item: any) => item.priority),
                                                                                                backgroundColor: advancedAnalytics.chartData.maintenanceTimelineData.map((item: any) => {
                                                                                                    if (item.status === 'immediate') return CHART_COLORS.danger;
                                                                                                    if (item.status === 'urgent') return CHART_COLORS.warning;
                                                                                                    if (item.status === 'planned') return CHART_COLORS.primary;
                                                                                                    if (item.status === 'scheduled') return CHART_COLORS.secondary;
                                                                                                    return CHART_COLORS.info;
                                                                                                }),
                                                                                                borderColor: advancedAnalytics.chartData.maintenanceTimelineData.map((item: any) => {
                                                                                                    if (item.status === 'immediate') return CHART_COLORS.danger;
                                                                                                    if (item.status === 'urgent') return CHART_COLORS.warning;
                                                                                                    if (item.status === 'planned') return CHART_COLORS.primary;
                                                                                                    if (item.status === 'scheduled') return CHART_COLORS.secondary;
                                                                                                    return CHART_COLORS.info;
                                                                                                }),
                                                                                                borderWidth: 2,
                                                                                                borderRadius: 4,
                                                                                            }
                                                                                        ]
                                                                                    }}
                                                                                    options={getChartOptions('bar')}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* ⚠️ RISK ASSESSMENT CHART */}
                                                                        <div className="p-4 bg-card rounded-lg border border-border shadow-sm">
                                                                            <h6 className="font-medium text-sm mb-3 flex items-center gap-1 text-card-foreground">
                                                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                                Risk Assessment - What's Most Critical
                                                                            </h6>
                                                                            <div className="h-64">
                                                                                <Bar
                                                                                    data={{
                                                                                        labels: advancedAnalytics.chartData.riskAssessmentData.map((item: any) => item.issue),
                                                                                        datasets: [
                                                                                            {
                                                                                                label: 'Risk Score',
                                                                                                data: advancedAnalytics.chartData.riskAssessmentData.map((item: any) => item.riskScore),
                                                                                                backgroundColor: advancedAnalytics.chartData.riskAssessmentData.map((item: any, index: number) => {
                                                                                                    if (item.riskScore > 50) return CHART_COLORS.danger;
                                                                                                    if (item.riskScore > 30) return CHART_COLORS.warning;
                                                                                                    if (item.riskScore > 15) return CHART_COLORS.primary;
                                                                                                    return CHART_COLORS.success;
                                                                                                }),
                                                                                                borderColor: advancedAnalytics.chartData.riskAssessmentData.map((item: any, index: number) => {
                                                                                                    if (item.riskScore > 50) return CHART_COLORS.danger;
                                                                                                    if (item.riskScore > 30) return CHART_COLORS.warning;
                                                                                                    if (item.riskScore > 15) return CHART_COLORS.primary;
                                                                                                    return CHART_COLORS.success;
                                                                                                }),
                                                                                                borderWidth: 2,
                                                                                                borderRadius: 4,
                                                                                            }
                                                                                        ]
                                                                                    }}
                                                                                    options={{
                                                                                        ...getChartOptions('bar'),
                                                                                        indexAxis: 'y' as const
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 🚀 REVOLUTIONARY FEATURE #1: ADVANCED PHYSICS-BASED MODELING */}
                                                                <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 rounded-lg border border-red-200 dark:border-red-800">
                                                                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                        <span className="text-2xl">🔬</span>
                                                                        Advanced Physics-Based Modeling
                                                                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                                                                            ISO 14224 Compliant
                                                                        </Badge>
                                                                    </h5>
                                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                                                        {/* Stress Analysis */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-red-500">⚡</span>
                                                                                Stress Analysis
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Current Level:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.advancedPhysicsModeling.stressAnalysis.stressCategory === 'Low' ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.stressAnalysis.stressCategory === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.stressAnalysis.stressCategory === 'High' ? 'bg-orange-100 text-orange-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.advancedPhysicsModeling.stressAnalysis.currentStressLevel.toFixed(1)}%
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Category:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.advancedPhysicsModeling.stressAnalysis.stressCategory}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Risk:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.advancedPhysicsModeling.stressAnalysis.stressRisk}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Fatigue Analysis */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-blue-500">🔄</span>
                                                                                Fatigue Analysis
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Remaining Life:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.fatigueCategory === 'Excellent' ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.fatigueCategory === 'Good' ? 'bg-blue-100 text-blue-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.fatigueCategory === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.fatigueLifePercentage}%
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Category:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.fatigueCategory}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Cycles Left:</span>
                                                                                    <span className="font-medium">{(advancedAnalytics.advancedPhysicsModeling.fatigueAnalysis.remainingCycles / 1000000).toFixed(1)}M</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Bearing Life Analysis */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-purple-500">⚙️</span>
                                                                                Bearing L10 Life
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>L10 Life:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.bearingCondition === 'Excellent' ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.bearingCondition === 'Good' ? 'bg-blue-100 text-blue-800' :
                                                                                        advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.bearingCondition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {Math.round(advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.l10LifeHours / 1000)}k h
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Condition:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.bearingCondition}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Load Factor:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.loadFactor}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 💰 COST IMPACT CHART */}
                                                                    <div className="mt-4 p-4 bg-card rounded-lg border border-border shadow-sm">
                                                                        <h6 className="font-medium text-sm mb-3 flex items-center gap-1 text-card-foreground">
                                                                            <DollarSign className="h-4 w-4 text-primary" />
                                                                            Cost Impact Analysis - Financial Planning
                                                                        </h6>
                                                                        <div className="h-64">
                                                                            <Bar
                                                                                data={{
                                                                                    labels: advancedAnalytics.chartData.costImpactData.map((item: any) => item.strategy),
                                                                                    datasets: [
                                                                                        {
                                                                                            label: 'Preventive Cost',
                                                                                            data: advancedAnalytics.chartData.costImpactData.map((item: any) => item.preventiveCost),
                                                                                            backgroundColor: CHART_COLORS.success,
                                                                                            borderColor: CHART_COLORS.success,
                                                                                            borderWidth: 2,
                                                                                            borderRadius: 4,
                                                                                        },
                                                                                        {
                                                                                            label: 'Failure Cost',
                                                                                            data: advancedAnalytics.chartData.costImpactData.map((item: any) => item.failureCost),
                                                                                            backgroundColor: CHART_COLORS.danger,
                                                                                            borderColor: CHART_COLORS.danger,
                                                                                            borderWidth: 2,
                                                                                            borderRadius: 4,
                                                                                        },
                                                                                        {
                                                                                            label: 'Potential Savings',
                                                                                            data: advancedAnalytics.chartData.costImpactData.map((item: any) => item.savings),
                                                                                            backgroundColor: CHART_COLORS.primary,
                                                                                            borderColor: CHART_COLORS.primary,
                                                                                            borderWidth: 2,
                                                                                            borderRadius: 4,
                                                                                        }
                                                                                    ]
                                                                                }}
                                                                                options={getChartOptions('bar')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 🚀 REVOLUTIONARY FEATURE #2: INTELLIGENT TREND ANALYSIS & FORECASTING */}
                                                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                        <span className="text-2xl">📈</span>
                                                                        Intelligent Trend Analysis & Forecasting
                                                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                                                                            Statistical Analysis
                                                                        </Badge>
                                                                    </h5>
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                        {/* Trend Analysis */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-blue-500">📊</span>
                                                                                Statistical Trend Analysis
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Trend Direction:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.intelligentTrendAnalysis.trendDirection === 'Stable' ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.intelligentTrendAnalysis.trendDirection === 'Improving' ? 'bg-blue-100 text-blue-800' :
                                                                                        'bg-yellow-100 text-yellow-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.intelligentTrendAnalysis.trendDirection}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>R² Accuracy:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.trendAnalysis.rSquared}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Confidence:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.trendAnalysis.confidence}%</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Slope:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.trendAnalysis.slope}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Forecasting */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-cyan-500">🔮</span>
                                                                                7-Day Forecast
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Forecast Accuracy:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.intelligentTrendAnalysis.forecast.accuracy > 80 ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.intelligentTrendAnalysis.forecast.accuracy > 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.intelligentTrendAnalysis.forecast.accuracy.toFixed(1)}%
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Confidence:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.forecast.confidence.toFixed(1)}%</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Horizon:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.forecast.forecastHorizon} days</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Change Points:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.intelligentTrendAnalysis.changePoints.totalChanges}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 📈 HEALTH PROGRESSION CHART */}
                                                                    <div className="mt-4 p-4 bg-card rounded-lg border border-border shadow-sm">
                                                                        <h6 className="font-medium text-sm mb-3 flex items-center gap-1 text-card-foreground">
                                                                            <TrendingUp className="h-4 w-4 text-primary" />
                                                                            Equipment Health Over Time
                                                                        </h6>
                                                                        <div className="h-64">
                                                                            <Line
                                                                                data={{
                                                                                    labels: advancedAnalytics.chartData.healthProgressionData.map((item: any) => item.date),
                                                                                    datasets: [
                                                                                        {
                                                                                            label: 'Health Score (%)',
                                                                                            data: advancedAnalytics.chartData.healthProgressionData.map((item: any) => item.health),
                                                                                            borderColor: CHART_COLORS.primary,
                                                                                            backgroundColor: CHART_COLORS.primary + '20',
                                                                                            borderWidth: 3,
                                                                                            fill: true,
                                                                                            tension: 0.4,
                                                                                            pointBackgroundColor: advancedAnalytics.chartData.healthProgressionData.map((item: any) =>
                                                                                                item.trend === 'current' ? CHART_COLORS.danger :
                                                                                                item.trend === 'projected' ? CHART_COLORS.warning :
                                                                                                CHART_COLORS.primary
                                                                                            ),
                                                                                            pointBorderColor: '#ffffff',
                                                                                            pointBorderWidth: 2,
                                                                                            pointRadius: 5,
                                                                                        }
                                                                                    ]
                                                                                }}
                                                                                options={getChartOptions('line')}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 🚀 REVOLUTIONARY FEATURE #3: ENHANCED DIAGNOSTIC REASONING ENGINE */}
                                                                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                        <span className="text-2xl">🧠</span>
                                                                        Enhanced Diagnostic Reasoning Engine
                                                                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs">
                                                                            Expert System
                                                                        </Badge>
                                                                    </h5>
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                        {/* Primary Diagnosis */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-purple-500">🎯</span>
                                                                                Primary Diagnosis
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Condition:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.confidence > 80 ? 'bg-green-100 text-green-800' :
                                                                                        advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                                                                                        'bg-red-100 text-red-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.condition}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Confidence:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.confidence.toFixed(1)}%</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Probability:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.probability.toFixed(1)}%</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Evidence Points:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.primaryDiagnosis.evidence.length}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Engineering Justification */}
                                                                        <div className="p-3 bg-white dark:bg-gray-800 rounded border">
                                                                            <h6 className="font-medium text-sm mb-2 flex items-center gap-1">
                                                                                <span className="text-indigo-500">⚖️</span>
                                                                                Engineering Justification
                                                                            </h6>
                                                                            <div className="space-y-2 text-xs">
                                                                                <div className="flex justify-between">
                                                                                    <span>Standards:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.standardsCompliance.join(', ')}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Approval:</span>
                                                                                    <Badge className={`text-xs ${
                                                                                        advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.engineeringApproval === 'Recommended' ? 'bg-green-100 text-green-800' :
                                                                                        'bg-yellow-100 text-yellow-800'
                                                                                    }`}>
                                                                                        {advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.engineeringApproval}
                                                                                    </Badge>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Root Cause:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.rootCauseAnalysis.primaryRootCause}</span>
                                                                                </div>
                                                                                <div className="flex justify-between">
                                                                                    <span>Alternatives:</span>
                                                                                    <span className="font-medium">{advancedAnalytics.diagnosticReasoningEngine.alternativeHypotheses.length}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* 🎯 ACTION PRIORITY CHART */}
                                                                    <div className="mt-4 p-4 bg-card rounded-lg border border-border shadow-sm">
                                                                        <h6 className="font-medium text-sm mb-3 flex items-center gap-1 text-card-foreground">
                                                                            <Target className="h-4 w-4 text-primary" />
                                                                            Action Priority Matrix - What to Do First
                                                                        </h6>
                                                                        <div className="h-64">
                                                                            <Scatter
                                                                                data={{
                                                                                    datasets: [
                                                                                        {
                                                                                            label: 'Actions (Urgency vs Impact)',
                                                                                            data: advancedAnalytics.chartData.actionPriorityData.map((item: any) => ({
                                                                                                x: item.urgency,
                                                                                                y: item.impact,
                                                                                                action: item.action,
                                                                                                priority: item.priority,
                                                                                                cost: item.cost,
                                                                                                timeframe: item.timeframe,
                                                                                                category: item.category
                                                                                            })),
                                                                                            backgroundColor: advancedAnalytics.chartData.actionPriorityData.map((item: any) => {
                                                                                                if (item.category === 'Critical') return CHART_COLORS.danger;
                                                                                                if (item.category === 'Important') return CHART_COLORS.warning;
                                                                                                if (item.category === 'Monitoring') return CHART_COLORS.info;
                                                                                                if (item.category === 'Preventive') return CHART_COLORS.success;
                                                                                                return CHART_COLORS.secondary;
                                                                                            }),
                                                                                            borderColor: advancedAnalytics.chartData.actionPriorityData.map((item: any) => {
                                                                                                if (item.category === 'Critical') return CHART_COLORS.danger;
                                                                                                if (item.category === 'Important') return CHART_COLORS.warning;
                                                                                                if (item.category === 'Monitoring') return CHART_COLORS.info;
                                                                                                if (item.category === 'Preventive') return CHART_COLORS.success;
                                                                                                return CHART_COLORS.secondary;
                                                                                            }),
                                                                                            borderWidth: 2,
                                                                                            pointRadius: 8,
                                                                                            pointHoverRadius: 12
                                                                                        }
                                                                                    ]
                                                                                }}
                                                                                options={{
                                                                                    responsive: true,
                                                                                    maintainAspectRatio: false,
                                                                                    scales: {
                                                                                        x: {
                                                                                            title: {
                                                                                                display: true,
                                                                                                text: 'Urgency (%)'
                                                                                            },
                                                                                            min: 0,
                                                                                            max: 100
                                                                                        },
                                                                                        y: {
                                                                                            title: {
                                                                                                display: true,
                                                                                                text: 'Impact (%)'
                                                                                            },
                                                                                            min: 0,
                                                                                            max: 100
                                                                                        }
                                                                                    },
                                                                                    plugins: {
                                                                                        tooltip: {
                                                                                            callbacks: {
                                                                                                title: () => 'Action Details',
                                                                                                label: (context: any) => {
                                                                                                    const point = context.raw;
                                                                                                    return [
                                                                                                        `Action: ${point.action}`,
                                                                                                        `Priority: ${point.priority}%`,
                                                                                                        `Cost: ${point.cost}`,
                                                                                                        `Timeframe: ${point.timeframe}`,
                                                                                                        `Category: ${point.category}`,
                                                                                                        `Urgency: ${point.x}%`,
                                                                                                        `Impact: ${point.y}%`
                                                                                                    ];
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 🚀 REVOLUTIONARY AI-POWERED RECOMMENDATIONS */}
                                                                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                                    <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                        <span className="text-2xl">🚀</span>
                                                                        Revolutionary AI-Powered Recommendations
                                                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 text-xs">
                                                                            Enterprise-Grade
                                                                        </Badge>
                                                                    </h5>
                                                                    <div className="space-y-2">
                                                                        {/* ML Anomaly Recommendations */}
                                                                        {advancedAnalytics.mlAnomalyDetection.recommendations && advancedAnalytics.mlAnomalyDetection.recommendations.length > 0 && (
                                                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                                                                                <div className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-1">🤖 ML Analysis</div>
                                                                                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                                                                    {advancedAnalytics.mlAnomalyDetection.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-blue-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Digital Twin Recommendations */}
                                                                        {advancedAnalytics.digitalTwin.predictiveInsights && advancedAnalytics.digitalTwin.predictiveInsights.recommendations && advancedAnalytics.digitalTwin.predictiveInsights.recommendations.length > 0 && (
                                                                            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                                                                                <div className="font-medium text-purple-800 dark:text-purple-300 text-sm mb-1">🔮 Digital Twin</div>
                                                                                <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                                                                                    {advancedAnalytics.digitalTwin.predictiveInsights.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-purple-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Multi-Physics Recommendations */}
                                                                        {advancedAnalytics.multiPhysicsAnalysis.recommendations && advancedAnalytics.multiPhysicsAnalysis.recommendations.length > 0 && (
                                                                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                                                                                <div className="font-medium text-green-800 dark:text-green-300 text-sm mb-1">🔬 Multi-Physics</div>
                                                                                <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                                                                                    {advancedAnalytics.multiPhysicsAnalysis.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-green-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* 🚀 REVOLUTIONARY FEATURE RECOMMENDATIONS */}

                                                                        {/* Advanced Physics Recommendations */}
                                                                        {advancedAnalytics.advancedPhysicsModeling.stressAnalysis.recommendations && advancedAnalytics.advancedPhysicsModeling.stressAnalysis.recommendations.length > 0 && (
                                                                            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
                                                                                <div className="font-medium text-red-800 dark:text-red-300 text-sm mb-1">🔬 Advanced Physics - Stress Analysis</div>
                                                                                <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                                                                                    {advancedAnalytics.advancedPhysicsModeling.stressAnalysis.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-red-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Bearing Life Recommendations */}
                                                                        {advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.recommendations && advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.recommendations.length > 0 && (
                                                                            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                                                                                <div className="font-medium text-purple-800 dark:text-purple-300 text-sm mb-1">⚙️ Advanced Physics - Bearing L10 Life</div>
                                                                                <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
                                                                                    {advancedAnalytics.advancedPhysicsModeling.bearingLifeAnalysis.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-purple-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Diagnostic Reasoning Recommendations */}
                                                                        {advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.technicalReasoning && advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.technicalReasoning.length > 0 && (
                                                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded border border-indigo-200 dark:border-indigo-800">
                                                                                <div className="font-medium text-indigo-800 dark:text-indigo-300 text-sm mb-1">🧠 Diagnostic Reasoning - Engineering Justification</div>
                                                                                <ul className="text-xs text-indigo-700 dark:text-indigo-400 space-y-1">
                                                                                    {advancedAnalytics.diagnosticReasoningEngine.engineeringJustification.technicalReasoning.slice(0, 3).map((rec: string, idx: number) => (
                                                                                        <li key={idx} className="flex items-start gap-1">
                                                                                            <span className="text-indigo-500 mt-0.5">•</span>
                                                                                            <span>{rec}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}

                                                                        {/* Fallback message if no recommendations */}
                                                                        {(!advancedAnalytics.mlAnomalyDetection.recommendations || advancedAnalytics.mlAnomalyDetection.recommendations.length === 0) &&
                                                                         (!advancedAnalytics.digitalTwin.predictiveInsights?.recommendations || advancedAnalytics.digitalTwin.predictiveInsights.recommendations.length === 0) &&
                                                                         (!advancedAnalytics.multiPhysicsAnalysis.recommendations || advancedAnalytics.multiPhysicsAnalysis.recommendations.length === 0) &&
                                                                         (!advancedAnalytics.advancedPhysicsModeling.stressAnalysis.recommendations || advancedAnalytics.advancedPhysicsModeling.stressAnalysis.recommendations.length === 0) && (
                                                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border text-center">
                                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                                    🚀 Revolutionary advanced analytics recommendations will appear here based on detected patterns, physics modeling, trend analysis, and diagnostic reasoning.
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );











                                                })()}
                                            </>
                                        );
                                    })()}






































































                                </div >
                            )
                        }
                    </form >
                </div >

                {/* Footer with Navigation */}
                <div className="border-t bg-muted/30 px-6 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>

                            {currentStep < FORM_STEPS.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={currentStep === 0 && selectedEquipment.length === 0}
                                    className="flex items-center gap-2"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    onClick={handleSubmit(onSubmit)}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Save Vibration Data
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>

            {/* Alert Dialog */}
            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent className="sm:max-w-[500px] p-6 rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-3xl font-extrabold mb-2 text-center">
                            {alertType === 'error' ? 'Submission Failed' : 'Submission Successful!'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-lg text-center">
                            {alertType === 'error' ? (
                                <span className="text-red-600 font-semibold block text-xl">
                                    Please ensure all required fields are filled. Required fields are marked with a red asterisk (*).
                                </span>
                            ) : (
                                <span className="text-green-600 font-semibold block text-xl">
                                    Comprehensive vibration data for <strong>{alertDetails.pumpNo || 'Multiple Equipment'}</strong> has been recorded on <strong>{alertDetails.date}</strong>.
                                    <br />
                                    All analytics have been updated. Check the Trends tab for detailed insights.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex justify-center mt-2">
                        <AlertDialogAction
                            className="text-xl px-8 py-3 rounded-lg"
                            onClick={() => {
                                setShowAlert(false);
                                if (alertType === 'success') {
                                    onClose();
                                }
                            }}
                        >
                            Understood
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Missing Data Dialog */}
            <AlertDialog open={missingDataDialog.show} onOpenChange={(open) => !open && setMissingDataDialog(prev => ({ ...prev, show: false }))}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Missing Vibration Data
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>
                                You have selected equipment but haven't entered vibration measurements for some equipment types:
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <ul className="space-y-1">
                                    {missingDataDialog.missingData.map((item, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <span className="font-medium capitalize">{item.type}:</span>
                                            <span className="text-gray-600">{item.reason}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-sm text-gray-600">
                                How would you like to proceed?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={missingDataDialog.onGoBack}
                            className="w-full sm:w-auto"
                        >
                            Go Back to Enter Data
                        </Button>
                        <Button
                            type="button"
                            onClick={missingDataDialog.onAccept}
                            className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700"
                        >
                            Accept Missing Data & Continue
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Standards Compliance Floating Widget */}
            <Dialog open={showStandardsWidget} onOpenChange={setShowStandardsWidget}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Comprehensive International Standards Compliance</h3>
                                <p className="text-sm text-muted-foreground">ISO 10816, ISO 13374, ISO 14224, API 670, IEC 60812, ISO 31000, MIL-STD-1629A, SAE J1739, AIAG-VDA</p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {(() => {
                        if (!masterHealth || !combinedAnalyses || combinedAnalyses.length === 0) {
                            return (
                                <div className="text-center py-12">
                                    <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium text-muted-foreground mb-2">Standards Compliance Assessment Ready</p>
                                    <p className="text-sm text-muted-foreground">
                                        Complete vibration analysis to view international standards compliance status
                                    </p>
                                </div>
                            );
                        }

                        // Calculate standards compliance
                        const standardsCompliance = FailureAnalysisEngine.assessStandardsCompliance(masterHealth, combinedAnalyses);

                        // Calculate data quality assessment
                        const sampleData = {
                            VH: safeParseFloat(formValues.vibrationData?.pump?.nde?.velH, 0),
                            VV: safeParseFloat(formValues.vibrationData?.pump?.nde?.velV, 0),
                            VA: safeParseFloat(formValues.vibrationData?.pump?.nde?.velAxl, 0),
                            AH: safeParseFloat(formValues.vibrationData?.pump?.nde?.accH, 0),
                            AV: safeParseFloat(formValues.vibrationData?.pump?.nde?.accV, 0),
                            AA: safeParseFloat(formValues.vibrationData?.pump?.nde?.accAxl, 0),
                            f: safeParseFloat(formValues.operatingFrequency, 50),
                            N: safeParseFloat(formValues.operatingSpeed, 1450),
                            temp: safeParseFloat(formValues.vibrationData?.pump?.nde?.temp, 25)
                        };
                        const dataQuality = FailureAnalysisEngine.assessDataQualityISO13379(sampleData);

                        // Calculate API 670 alarm levels
                        const api670Levels = FailureAnalysisEngine.calculateAPI670AlarmLevels(
                            safeParseFloat(formValues.operatingSpeed, 1450),
                            'pump'
                        );

                        return (
                            <div className="space-y-6">
                                {/* Enhanced Compliance Scores */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    {/* Core Standards Compliance */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-foreground">Core Standards Compliance</h4>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full ${
                                                    standardsCompliance.overallCompliance >= 90 ? 'bg-green-500' :
                                                    standardsCompliance.overallCompliance >= 70 ? 'bg-yellow-500' :
                                                    standardsCompliance.overallCompliance >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}></div>
                                                <span className="font-bold text-2xl">{standardsCompliance.overallCompliance}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                                            <div
                                                className={`h-4 rounded-full transition-all duration-1500 ${
                                                    standardsCompliance.overallCompliance >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                                                    standardsCompliance.overallCompliance >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                    standardsCompliance.overallCompliance >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                }`}
                                                style={{ width: `${standardsCompliance.overallCompliance}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">ISO 10816, ISO 13374, ISO 14224, API 670</p>
                                    </div>

                                    {/* Enhanced Standards Compliance */}
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg p-6 border">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-foreground">Enhanced Standards Compliance</h4>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-4 h-4 rounded-full ${
                                                    (standardsCompliance.enhancedCompliance || 0) >= 90 ? 'bg-green-500' :
                                                    (standardsCompliance.enhancedCompliance || 0) >= 70 ? 'bg-yellow-500' :
                                                    (standardsCompliance.enhancedCompliance || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                                }`}></div>
                                                <span className="font-bold text-2xl">{standardsCompliance.enhancedCompliance || 0}%</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                                            <div
                                                className={`h-4 rounded-full transition-all duration-1500 ${
                                                    (standardsCompliance.enhancedCompliance || 0) >= 90 ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                                                    (standardsCompliance.enhancedCompliance || 0) >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                    (standardsCompliance.enhancedCompliance || 0) >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                    'bg-gradient-to-r from-red-400 to-red-600'
                                                }`}
                                                style={{ width: `${standardsCompliance.enhancedCompliance || 0}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">IEC 60812, ISO 31000, MIL-STD-1629A, SAE J1739, AIAG-VDA</p>
                                    </div>
                                </div>

                                {/* Overall System Assessment */}
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-6 border mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-foreground">Total System Compliance</h4>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 90 ? 'bg-green-500' :
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 70 ? 'bg-yellow-500' :
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                            }`}></div>
                                            <span className="font-bold text-2xl">{Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2)}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                                        <div
                                            className={`h-4 rounded-full transition-all duration-1500 ${
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 90 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 70 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                                Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2) >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                'bg-gradient-to-r from-red-400 to-red-600'
                                            }`}
                                            style={{ width: `${Math.round((standardsCompliance.overallCompliance + (standardsCompliance.enhancedCompliance || 0)) / 2)}%` }}
                                        ></div>
                                    </div>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {standardsCompliance.recommendations.map((rec, index) => {
                                            const isMainRecommendation = rec.includes('🏆') || rec.includes('🚨') || rec.includes('💰') || rec.includes('📋');
                                            const isSubRecommendation = rec.startsWith('   ');
                                            const isEmpty = rec.trim() === '';

                                            if (isEmpty) {
                                                return <div key={index} className="h-2"></div>;
                                            }

                                            return (
                                                <div key={index} className={`flex items-start gap-2 p-2 rounded ${
                                                    isMainRecommendation ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                                                    isSubRecommendation ? 'bg-gray-50 dark:bg-gray-800/30 ml-4' :
                                                    ''
                                                }`}>
                                                    <span className={`mt-1 ${
                                                        isMainRecommendation ? 'text-blue-500 font-bold' :
                                                        isSubRecommendation ? 'text-gray-400' :
                                                        'text-blue-500'
                                                    }`}>•</span>
                                                    <span className={`text-sm ${
                                                        isMainRecommendation ? 'text-foreground font-medium' :
                                                        isSubRecommendation ? 'text-muted-foreground' :
                                                        'text-muted-foreground'
                                                    }`}>{rec}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Core Standards Compliance */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-foreground mb-4">Core Standards Compliance</h4>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'ISO 10816', status: standardsCompliance.iso10816Compliance, desc: 'Vibration Evaluation of Machines', category: 'Core' },
                                                { name: 'ISO 13374', status: standardsCompliance.iso13374Compliance, desc: 'Condition Monitoring & Diagnostics', category: 'Core' },
                                                { name: 'ISO 14224', status: standardsCompliance.iso14224Compliance, desc: 'Reliability Data Collection', category: 'Core' },
                                                { name: 'API 670', status: standardsCompliance.api670Compliance, desc: 'Machinery Protection Systems', category: 'Core' }
                                            ].map((standard, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                    <div>
                                                        <span className="font-medium text-base">{standard.name}</span>
                                                        <p className="text-sm text-muted-foreground">{standard.desc}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${standard.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        <Badge className={`${standard.status ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                            {standard.status ? 'Compliant' : 'Non-Compliant'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Enhanced Standards Compliance */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-foreground mb-4">Enhanced Standards Compliance</h4>
                                        <div className="space-y-4">
                                            {[
                                                { name: 'IEC 60812', status: standardsCompliance.iec60812Compliance, desc: 'FMEA Methodology & Analysis', category: 'Enhanced' },
                                                { name: 'ISO 31000', status: standardsCompliance.iso31000Compliance, desc: 'Risk Management Principles', category: 'Enhanced' },
                                                { name: 'MIL-STD-1629A', status: standardsCompliance.milStd1629aCompliance, desc: 'Operating Environment Factors', category: 'Enhanced' },
                                                { name: 'SAE J1739', status: standardsCompliance.saeJ1739Compliance, desc: 'Automotive FMEA Best Practices', category: 'Enhanced' },
                                                { name: 'AIAG-VDA', status: standardsCompliance.aiagVdaCompliance, desc: 'Monitoring Capability Adjustments', category: 'Enhanced' }
                                            ].map((standard, index) => (
                                                <div key={index} className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                    <div>
                                                        <span className="font-medium text-base">{standard.name}</span>
                                                        <p className="text-sm text-muted-foreground">{standard.desc}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${standard.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        <Badge className={`${standard.status ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                            {standard.status ? 'Compliant' : 'Non-Compliant'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Features Display */}
                                {standardsCompliance.enhancedFeatures && standardsCompliance.enhancedFeatures.length > 0 && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 border border-green-200 dark:border-green-800 mb-6">
                                        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            Enhanced Features & Technical Capabilities
                                        </h4>
                                        <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {standardsCompliance.enhancedFeatures.map((feature, index) => {
                                                const isMainFeature = feature.startsWith('✅');
                                                const isSubFeature = feature.startsWith('   ');

                                                return (
                                                    <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${
                                                        isMainFeature ? 'bg-white/70 dark:bg-gray-800/50 border border-green-200 dark:border-green-700' :
                                                        isSubFeature ? 'bg-white/30 dark:bg-gray-800/20 ml-6' :
                                                        'bg-white/50 dark:bg-gray-800/30'
                                                    }`}>
                                                        <div className={`rounded-full mt-1 flex-shrink-0 ${
                                                            isMainFeature ? 'w-2 h-2 bg-green-500' :
                                                            isSubFeature ? 'w-1.5 h-1.5 bg-blue-400' :
                                                            'w-1.5 h-1.5 bg-gray-400'
                                                        }`}></div>
                                                        <span className={`text-sm ${
                                                            isMainFeature ? 'text-foreground font-medium' :
                                                            isSubFeature ? 'text-muted-foreground' :
                                                            'text-foreground'
                                                        }`}>{feature}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Data Quality Assessment */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-foreground mb-4">Data Quality Assessment (ISO 13379-1)</h4>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-base font-medium">Quality Grade</span>
                                                <Badge className={`text-base px-3 py-1 ${
                                                    dataQuality.qualityGrade === 'A' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                                    dataQuality.qualityGrade === 'B' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                    dataQuality.qualityGrade === 'C' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                    Grade {dataQuality.qualityGrade}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-base font-medium">Confidence Level</span>
                                                <span className="text-base font-mono font-bold">{dataQuality.confidence}%</span>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="font-medium text-sm">Recommendations:</h5>
                                                {dataQuality.recommendations.map((rec, index) => (
                                                    <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                        <span className="text-blue-500 mt-1">•</span>
                                                        {rec}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* API 670 Alarm Levels */}
                                <div>
                                    <h4 className="text-lg font-semibold text-foreground mb-4">API 670 Machinery Protection Levels</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {[
                                            { name: 'Alert', value: api670Levels.alert, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', desc: '25% of trip' },
                                            { name: 'Alarm', value: api670Levels.alarm, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', desc: '50% of trip' },
                                            { name: 'Danger', value: api670Levels.danger, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', desc: '75% of trip' },
                                            { name: 'Trip', value: api670Levels.trip, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', desc: 'Shutdown' }
                                        ].map((level, index) => (
                                            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center border">
                                                <Badge className={`${level.color} mb-2`}>{level.name}</Badge>
                                                <p className="text-xl font-bold">{level.value} mm/s</p>
                                                <p className="text-sm text-muted-foreground">{level.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border">
                                        <p className="text-base font-medium mb-2"><strong>Balance Grade:</strong> {api670Levels.balanceGrade}</p>
                                        <div className="space-y-1">
                                            {api670Levels.comments.map((comment, index) => (
                                                <p key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    {comment}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default EnhancedVibrationForm;

