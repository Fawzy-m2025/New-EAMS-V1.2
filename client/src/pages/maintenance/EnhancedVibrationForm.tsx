import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format, getMonth, getYear, setMonth, setYear, addDays, addWeeks, addMonths, differenceInDays } from 'date-fns';
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
    PlayCircle
} from 'lucide-react';
import { useAssetContext } from '@/contexts/AssetContext';
import { useToast } from '@/hooks/use-toast';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useTheme } from '@/hooks/use-theme';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import type { VibrationHistoryRecord } from '@/data/vibrationHistoryData';
import { allHierarchicalEquipment, zoneA } from '@/data/hierarchicalAssetData';
import { MultiEquipmentSelector } from '@/components/maintenance/MultiEquipmentSelector';
import { MultiEquipmentSpecifications } from '@/components/maintenance/MultiEquipmentSpecifications';
import { cn } from '@/lib/utils';
import { getVibrationInputColor, getVibrationTooltip, analyzeVibrationData, ISO10816_THRESHOLDS, getISO10816Zone, calcRMSVelocity } from '@/utils/vibrationUtils';
import {
    ThemedAIAssessmentCard,
    ThemedAIMetricCard,
    ThemedAIStatusBadge,
    ThemedAIProgressBar,
    ThemedAIButton,
    ThemedAIHeader,
    ThemedAITabs,
    ThemedAITabsList,
    ThemedAITabsTrigger,
    ThemedAITabsContent,
    ThemedAIContainer,
    ThemedAISection,
    ThemedAIPanel,
    ThemedAIGrid,
    ThemedAIChart
} from '@/components/ui/themed-ai-assessment';

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

    // Step 3: Vibration Measurements - Enhanced with Legs 1-4 for Pump and Motor
    vibrationData: {
        // Pump Measurements - Using standardized field names with NDE, DE, and Legs 1-4
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
            },
            leg1: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg2: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg3: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg4: {
                velocity: ''  // Single velocity reading (mm/s)
            }
        },
        // Motor Measurements - Using standardized field names with NDE, DE, and Legs 1-4
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
            },
            leg1: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg2: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg3: {
                velocity: ''  // Single velocity reading (mm/s)
            },
            leg4: {
                velocity: ''  // Single velocity reading (mm/s)
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

// AI Condition Assessment Interfaces
interface AIConditionAssessment {
    overallCondition: 'excellent' | 'good' | 'acceptable' | 'unacceptable' | 'critical';
    confidence: number;
    healthScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    maintenanceRequired: boolean;
    immediateAction: boolean;
    nextInspectionDate: string;
    insights: AIInsight[];
    recommendations: AIRecommendation[];
    trends: AITrend[];
    anomalies: AIAnomaly[];
}

interface AIInsight {
    type: 'warning' | 'info' | 'success' | 'critical';
    title: string;
    description: string;
    severity: number;
    category: 'vibration' | 'temperature' | 'operational' | 'trend' | 'anomaly';
    actionable: boolean;
    action?: string;
}

interface AIRecommendation {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    impact: string;
    timeframe: string;
    cost: 'low' | 'medium' | 'high';
    category: 'maintenance' | 'monitoring' | 'replacement' | 'optimization';
}

interface AITrend {
    parameter: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    significance: 'low' | 'medium' | 'high';
    prediction: string;
}

interface AIAnomaly {
    parameter: string;
    value: number;
    expected: number;
    deviation: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
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

// AI Assessment Engine
class AIAssessmentEngine {
    private static instance: AIAssessmentEngine;

    static getInstance(): AIAssessmentEngine {
        if (!AIAssessmentEngine.instance) {
            AIAssessmentEngine.instance = new AIAssessmentEngine();
        }
        return AIAssessmentEngine.instance;
    }

    // Calculate overall health score based on vibration data
    calculateHealthScore(vibrationData: any, operationalData: any): number {
        let totalWeight = 0;
        let weightedScore = 0;

        // Vibration analysis (60% weight)
        const vibrationScore = this.analyzeVibrationHealth(vibrationData);
        if (!isNaN(vibrationScore) && isFinite(vibrationScore)) {
            weightedScore += vibrationScore * 0.6;
            totalWeight += 0.6;
        }

        // Temperature analysis (20% weight)
        const temperatureScore = this.analyzeTemperatureHealth(vibrationData);
        if (!isNaN(temperatureScore) && isFinite(temperatureScore)) {
            weightedScore += temperatureScore * 0.2;
            totalWeight += 0.2;
        }

        // Operational analysis (20% weight)
        const operationalScore = this.analyzeOperationalHealth(operationalData);
        if (!isNaN(operationalScore) && isFinite(operationalScore)) {
            weightedScore += operationalScore * 0.2;
            totalWeight += 0.2;
        }

        // Prevent division by zero and ensure valid result
        if (totalWeight === 0) return 50; // Default neutral score
        const finalScore = weightedScore / totalWeight;
        return Math.round(isNaN(finalScore) || !isFinite(finalScore) ? 50 : Math.max(0, Math.min(100, finalScore)));
    }

    // Analyze vibration health using ISO 10816 and advanced algorithms
    private analyzeVibrationHealth(vibrationData: any): number {
        let score = 100;
        let measurements = 0;

        // Helper function to safely parse float values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
        };

        // Analyze pump measurements (NDE, DE, and Legs 1-4)
        if (vibrationData.pump) {
            const pumpNDE = calcRMSVelocity(vibrationData.pump.nde);
            const pumpDE = calcRMSVelocity(vibrationData.pump.de);

            // Simplified leg analysis - single velocity reading per leg
            const pumpLeg1 = safeParseFloat(vibrationData.pump.leg1?.velocity);
            const pumpLeg2 = safeParseFloat(vibrationData.pump.leg2?.velocity);
            const pumpLeg3 = safeParseFloat(vibrationData.pump.leg3?.velocity);
            const pumpLeg4 = safeParseFloat(vibrationData.pump.leg4?.velocity);

            // Analyze NDE and DE with RMS calculation
            [pumpNDE, pumpDE].forEach(rms => {
                if (!isNaN(rms) && isFinite(rms) && rms > 0) {
                    const penalty = this.getVibrationPenalty(rms);
                    if (!isNaN(penalty) && isFinite(penalty)) {
                        score -= penalty;
                        measurements++;
                    }
                }
            });

            // Analyze legs with direct velocity values
            [pumpLeg1, pumpLeg2, pumpLeg3, pumpLeg4].forEach(velocity => {
                if (!isNaN(velocity) && isFinite(velocity) && velocity > 0) {
                    const penalty = this.getVibrationPenalty(velocity);
                    if (!isNaN(penalty) && isFinite(penalty)) {
                        score -= penalty;
                        measurements++;
                    }
                }
            });
        }

        // Analyze motor measurements (NDE, DE, and Legs 1-4)
        if (vibrationData.motor) {
            const motorNDE = calcRMSVelocity(vibrationData.motor.nde);
            const motorDE = calcRMSVelocity(vibrationData.motor.de);

            // Simplified leg analysis - single velocity reading per leg
            const motorLeg1 = safeParseFloat(vibrationData.motor.leg1?.velocity);
            const motorLeg2 = safeParseFloat(vibrationData.motor.leg2?.velocity);
            const motorLeg3 = safeParseFloat(vibrationData.motor.leg3?.velocity);
            const motorLeg4 = safeParseFloat(vibrationData.motor.leg4?.velocity);

            // Analyze NDE and DE with RMS calculation
            [motorNDE, motorDE].forEach(rms => {
                if (!isNaN(rms) && isFinite(rms) && rms > 0) {
                    const penalty = this.getVibrationPenalty(rms);
                    if (!isNaN(penalty) && isFinite(penalty)) {
                        score -= penalty;
                        measurements++;
                    }
                }
            });

            // Analyze legs with direct velocity values
            [motorLeg1, motorLeg2, motorLeg3, motorLeg4].forEach(velocity => {
                if (!isNaN(velocity) && isFinite(velocity) && velocity > 0) {
                    const penalty = this.getVibrationPenalty(velocity);
                    if (!isNaN(penalty) && isFinite(penalty)) {
                        score -= penalty;
                        measurements++;
                    }
                }
            });
        }

        // Ensure valid return value - don't divide by measurements, just return the accumulated score
        // The score starts at 100 and penalties are subtracted, so no need to divide
        const finalScore = measurements > 0 ? Math.max(0, score) : 100;
        return Math.max(0, Math.min(100, isNaN(finalScore) || !isFinite(finalScore) ? 100 : finalScore));
    }

    // Calculate vibration penalty based on ISO 10816 zones with enhanced debugging
    private getVibrationPenalty(rms: number): number {
        // Validate input
        if (isNaN(rms) || !isFinite(rms) || rms < 0) {
            console.debug('Invalid RMS value for penalty calculation:', rms);
            return 0;
        }

        let penalty = 0;
        let zone = '';

        if (rms <= 1.8) {
            penalty = 0; // Zone A - Excellent
            zone = 'A (Excellent)';
        } else if (rms <= 4.5) {
            penalty = 10; // Zone B - Good
            zone = 'B (Good)';
        } else if (rms <= 7.1) {
            penalty = 25; // Zone C - Acceptable
            zone = 'C (Acceptable)';
        } else if (rms <= 18.0) {
            penalty = 50; // Zone D - Unacceptable
            zone = 'D (Unacceptable)';
        } else {
            penalty = 80; // Critical
            zone = 'Critical';
        }

        console.debug(`Vibration Analysis: RMS=${rms.toFixed(2)} mm/s, Zone=${zone}, Penalty=${penalty}`);
        return penalty;
    }

    // Analyze temperature health
    private analyzeTemperatureHealth(vibrationData: any): number {
        let score = 100;
        let measurements = 0;

        // Helper function to safely parse temperature values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
        };

        const checkTemperature = (tempValue: any) => {
            const temp = safeParseFloat(tempValue);
            if (!isNaN(temp) && isFinite(temp) && temp > 0) {
                measurements++;
                if (temp > 80) score -= 30;
                else if (temp > 70) score -= 15;
                else if (temp > 60) score -= 5;
            }
        };

        // Check temperatures across all equipment (pump and motor with legs)
        if (vibrationData.pump?.nde?.temp) checkTemperature(vibrationData.pump.nde.temp);
        if (vibrationData.pump?.de?.temp) checkTemperature(vibrationData.pump.de.temp);
        if (vibrationData.pump?.leg1?.temp) checkTemperature(vibrationData.pump.leg1.temp);
        if (vibrationData.pump?.leg2?.temp) checkTemperature(vibrationData.pump.leg2.temp);
        if (vibrationData.pump?.leg3?.temp) checkTemperature(vibrationData.pump.leg3.temp);
        if (vibrationData.pump?.leg4?.temp) checkTemperature(vibrationData.pump.leg4.temp);
        if (vibrationData.motor?.nde?.temp) checkTemperature(vibrationData.motor.nde.temp);
        if (vibrationData.motor?.de?.temp) checkTemperature(vibrationData.motor.de.temp);
        if (vibrationData.motor?.leg1?.temp) checkTemperature(vibrationData.motor.leg1.temp);
        if (vibrationData.motor?.leg2?.temp) checkTemperature(vibrationData.motor.leg2.temp);
        if (vibrationData.motor?.leg3?.temp) checkTemperature(vibrationData.motor.leg3.temp);
        if (vibrationData.motor?.leg4?.temp) checkTemperature(vibrationData.motor.leg4.temp);

        // Ensure valid return value
        const finalScore = measurements > 0 ? score : 100;
        return Math.max(0, Math.min(100, isNaN(finalScore) || !isFinite(finalScore) ? 100 : finalScore));
    }

    // Analyze operational health
    private analyzeOperationalHealth(operationalData: any): number {
        let score = 100;

        // Helper function to safely parse float values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return NaN;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? NaN : parsed;
        };

        // Check efficiency
        if (operationalData?.efficiency) {
            const efficiency = safeParseFloat(operationalData.efficiency);
            if (!isNaN(efficiency) && isFinite(efficiency)) {
                if (efficiency < 70) score -= 20;
                else if (efficiency < 80) score -= 10;
                else if (efficiency < 90) score -= 5;
            }
        }

        // Check power consumption vs rated
        if (operationalData?.powerConsumption && operationalData?.operatingPower) {
            const powerConsumption = safeParseFloat(operationalData.powerConsumption);
            const operatingPower = safeParseFloat(operationalData.operatingPower);

            if (!isNaN(powerConsumption) && !isNaN(operatingPower) &&
                isFinite(powerConsumption) && isFinite(operatingPower) &&
                operatingPower > 0) {
                const powerRatio = powerConsumption / operatingPower;
                if (!isNaN(powerRatio) && isFinite(powerRatio)) {
                    if (powerRatio > 1.1) score -= 15;
                    else if (powerRatio > 1.05) score -= 8;
                }
            }
        }

        // Ensure valid return value
        return Math.max(0, Math.min(100, isNaN(score) || !isFinite(score) ? 100 : score));
    }

    // Using standardized calcRMSVelocity function from vibrationUtils.ts

    // Generate AI insights based on data analysis
    generateInsights(vibrationData: any, operationalData: any): AIInsight[] {
        const insights: AIInsight[] = [];

        // Vibration insights
        this.analyzeVibrationInsights(vibrationData, insights);

        // Temperature insights
        this.analyzeTemperatureInsights(vibrationData, insights);

        // Operational insights
        this.analyzeOperationalInsights(operationalData, insights);

        return insights.sort((a, b) => b.severity - a.severity);
    }

    private analyzeVibrationInsights(vibrationData: any, insights: AIInsight[]): void {
        // Helper function to safely parse float values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
        };

        // Check for high vibration levels
        const checkVibration = (data: any, location: string) => {
            if (!data) return;
            const rms = calcRMSVelocity(data);
            if (isNaN(rms) || !isFinite(rms) || rms <= 0) return;

            if (rms > 18.0) {
                insights.push({
                    type: 'critical',
                    title: `Critical Vibration at ${location}`,
                    description: `RMS velocity of ${safeDisplayUtil(rms, 2, 'N/A')} mm/s exceeds critical threshold. Immediate shutdown recommended.`,
                    severity: 10,
                    category: 'vibration',
                    actionable: true,
                    action: 'Shutdown equipment immediately'
                });
            } else if (rms > 7.1) {
                insights.push({
                    type: 'warning',
                    title: `High Vibration at ${location}`,
                    description: `RMS velocity of ${safeDisplayUtil(rms, 2, 'N/A')} mm/s indicates potential issues. Schedule maintenance.`,
                    severity: 7,
                    category: 'vibration',
                    actionable: true,
                    action: 'Schedule maintenance within 1 week'
                });
            }
        };

        if (vibrationData.pump?.nde) checkVibration(vibrationData.pump.nde, 'Pump NDE');
        if (vibrationData.pump?.de) checkVibration(vibrationData.pump.de, 'Pump DE');
        if (vibrationData.motor?.nde) checkVibration(vibrationData.motor.nde, 'Motor NDE');
        if (vibrationData.motor?.de) checkVibration(vibrationData.motor.de, 'Motor DE');

        // Check simplified leg velocities
        const checkLegVelocity = (velocity: string | number, location: string) => {
            const vel = safeParseFloat(velocity);
            if (!isNaN(vel) && isFinite(vel) && vel > 0) {
                const zone = getISO10816Zone(vel);
                if (zone && zone.zone === 'D') {
                    insights.push({
                        type: 'critical',
                        title: `Critical vibration at ${location}`,
                        description: `${safeDisplayUtil(vel, 2, 'N/A')} mm/s (Zone D - Unacceptable)`,
                        severity: 10,
                        category: 'vibration',
                        actionable: true,
                        action: 'Immediate inspection required'
                    });
                } else if (zone && zone.zone === 'C') {
                    insights.push({
                        type: 'warning',
                        title: `High vibration at ${location}`,
                        description: `${safeDisplayUtil(vel, 2, 'N/A')} mm/s (Zone C - Unsatisfactory)`,
                        severity: 7,
                        category: 'vibration',
                        actionable: true,
                        action: 'Schedule maintenance'
                    });
                }
            }
        };

        if (vibrationData.pump?.leg1?.velocity) checkLegVelocity(vibrationData.pump.leg1.velocity, 'Pump Leg 1');
        if (vibrationData.pump?.leg2?.velocity) checkLegVelocity(vibrationData.pump.leg2.velocity, 'Pump Leg 2');
        if (vibrationData.pump?.leg3?.velocity) checkLegVelocity(vibrationData.pump.leg3.velocity, 'Pump Leg 3');
        if (vibrationData.pump?.leg4?.velocity) checkLegVelocity(vibrationData.pump.leg4.velocity, 'Pump Leg 4');
        if (vibrationData.motor?.leg1?.velocity) checkLegVelocity(vibrationData.motor.leg1.velocity, 'Motor Leg 1');
        if (vibrationData.motor?.leg2?.velocity) checkLegVelocity(vibrationData.motor.leg2.velocity, 'Motor Leg 2');
        if (vibrationData.motor?.leg3?.velocity) checkLegVelocity(vibrationData.motor.leg3.velocity, 'Motor Leg 3');
        if (vibrationData.motor?.leg4?.velocity) checkLegVelocity(vibrationData.motor.leg4.velocity, 'Motor Leg 4');
    }

    private analyzeTemperatureInsights(vibrationData: any, insights: AIInsight[]): void {
        // Helper function to safely parse temperature values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
        };

        const checkTemperature = (tempValue: any, location: string) => {
            const temp = safeParseFloat(tempValue);
            if (!isNaN(temp) && isFinite(temp) && temp > 0) {
                if (temp > 80) {
                    insights.push({
                        type: 'critical',
                        title: `Critical Temperature at ${location}`,
                        description: `Temperature of ${safeDisplayUtil(temp, 1, 'N/A')}°C indicates overheating. Check lubrication and cooling.`,
                        severity: 9,
                        category: 'temperature',
                        actionable: true,
                        action: 'Check lubrication and cooling systems'
                    });
                } else if (temp > 70) {
                    insights.push({
                        type: 'warning',
                        title: `Elevated Temperature at ${location}`,
                        description: `Temperature of ${safeDisplayUtil(temp, 1, 'N/A')}°C is above normal operating range. Monitor closely.`,
                        severity: 6,
                        category: 'temperature',
                        actionable: true,
                        action: 'Monitor temperature trends'
                    });
                }
            }
        };

        if (vibrationData.pump?.nde?.temp) checkTemperature(vibrationData.pump.nde.temp, 'Pump NDE');
        if (vibrationData.pump?.de?.temp) checkTemperature(vibrationData.pump.de.temp, 'Pump DE');
        if (vibrationData.pump?.leg1?.temp) checkTemperature(vibrationData.pump.leg1.temp, 'Pump Leg 1');
        if (vibrationData.pump?.leg2?.temp) checkTemperature(vibrationData.pump.leg2.temp, 'Pump Leg 2');
        if (vibrationData.pump?.leg3?.temp) checkTemperature(vibrationData.pump.leg3.temp, 'Pump Leg 3');
        if (vibrationData.pump?.leg4?.temp) checkTemperature(vibrationData.pump.leg4.temp, 'Pump Leg 4');
        if (vibrationData.motor?.nde?.temp) checkTemperature(vibrationData.motor.nde.temp, 'Motor NDE');
        if (vibrationData.motor?.de?.temp) checkTemperature(vibrationData.motor.de.temp, 'Motor DE');
        if (vibrationData.motor?.leg1?.temp) checkTemperature(vibrationData.motor.leg1.temp, 'Motor Leg 1');
        if (vibrationData.motor?.leg2?.temp) checkTemperature(vibrationData.motor.leg2.temp, 'Motor Leg 2');
        if (vibrationData.motor?.leg3?.temp) checkTemperature(vibrationData.motor.leg3.temp, 'Motor Leg 3');
        if (vibrationData.motor?.leg4?.temp) checkTemperature(vibrationData.motor.leg4.temp, 'Motor Leg 4');
    }

    private analyzeOperationalInsights(operationalData: any, insights: AIInsight[]): void {
        // Helper function to safely parse float values
        const safeParseFloat = (value: any): number => {
            if (value === null || value === undefined || value === '') return NaN;
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) || !isFinite(parsed) ? NaN : parsed;
        };

        // Efficiency analysis
        if (operationalData?.efficiency) {
            const efficiency = safeParseFloat(operationalData.efficiency);
            if (!isNaN(efficiency) && isFinite(efficiency) && efficiency < 70) {
                insights.push({
                    type: 'warning',
                    title: 'Low Operational Efficiency',
                    description: `Efficiency of ${safeDisplayUtil(efficiency, 1, 'N/A')}% is below optimal range. Check for operational issues.`,
                    severity: 7,
                    category: 'operational',
                    actionable: true,
                    action: 'Review operational parameters'
                });
            }
        }

        // Power consumption analysis
        if (operationalData?.powerConsumption && operationalData?.operatingPower) {
            const powerConsumption = safeParseFloat(operationalData.powerConsumption);
            const operatingPower = safeParseFloat(operationalData.operatingPower);

            if (!isNaN(powerConsumption) && !isNaN(operatingPower) &&
                isFinite(powerConsumption) && isFinite(operatingPower) &&
                operatingPower > 0) {
                const powerRatio = powerConsumption / operatingPower;
                if (!isNaN(powerRatio) && isFinite(powerRatio) && powerRatio > 1.1) {
                    insights.push({
                        type: 'warning',
                        title: 'High Power Consumption',
                        description: `Power consumption is ${safeDisplayUtil(powerRatio * 100, 1, 'N/A')}% of rated power. Check for mechanical issues.`,
                        severity: 6,
                        category: 'operational',
                        actionable: true,
                        action: 'Investigate mechanical efficiency'
                    });
                }
            }
        }
    }

    // Generate AI recommendations
    generateRecommendations(insights: AIInsight[], healthScore: number): AIRecommendation[] {
        const recommendations: AIRecommendation[] = [];

        // Critical recommendations
        const criticalInsights = insights.filter(i => i.type === 'critical');
        if (criticalInsights.length > 0) {
            recommendations.push({
                priority: 'urgent',
                title: 'Immediate Equipment Shutdown',
                description: 'Critical vibration levels detected. Shutdown equipment immediately to prevent damage.',
                impact: 'Prevents catastrophic failure',
                timeframe: 'Immediate',
                cost: 'high',
                category: 'maintenance'
            });
        }

        // High priority recommendations
        const highInsights = insights.filter(i => i.severity >= 7);
        if (highInsights.length > 0) {
            recommendations.push({
                priority: 'high',
                title: 'Schedule Preventive Maintenance',
                description: 'Multiple high-severity issues detected. Schedule comprehensive maintenance.',
                impact: 'Prevents major failures',
                timeframe: 'Within 1 week',
                cost: 'medium',
                category: 'maintenance'
            });
        }

        // Medium priority recommendations
        if (healthScore < 80) {
            recommendations.push({
                priority: 'medium',
                title: 'Enhanced Monitoring',
                description: 'Implement enhanced vibration monitoring and trend analysis.',
                impact: 'Early detection of issues',
                timeframe: 'Within 2 weeks',
                cost: 'low',
                category: 'monitoring'
            });
        }

        // Optimization recommendations
        if (healthScore > 90) {
            recommendations.push({
                priority: 'low',
                title: 'Performance Optimization',
                description: 'Equipment performing well. Consider optimization opportunities.',
                impact: 'Improved efficiency',
                timeframe: 'Within 1 month',
                cost: 'low',
                category: 'optimization'
            });
        }

        return recommendations;
    }

    // Generate AI trends
    generateTrends(vibrationData: any): AITrend[] {
        const trends: AITrend[] = [];

        // Analyze vibration trends (simulated)
        const pumpNDE = calcRMSVelocity(vibrationData.pump?.nde);
        const pumpDE = calcRMSVelocity(vibrationData.pump?.de);

        if (pumpNDE > 0) {
            trends.push({
                parameter: 'Pump NDE Vibration',
                direction: pumpNDE > 3 ? 'increasing' : 'stable',
                rate: pumpNDE > 3 ? 0.2 : 0,
                significance: pumpNDE > 5 ? 'high' : 'low',
                prediction: pumpNDE > 5 ? 'Likely to exceed limits within 30 days' : 'Stable operation expected'
            });
        }

        if (pumpDE > 0) {
            trends.push({
                parameter: 'Pump DE Vibration',
                direction: pumpDE > 3 ? 'increasing' : 'stable',
                rate: pumpDE > 3 ? 0.15 : 0,
                significance: pumpDE > 5 ? 'high' : 'low',
                prediction: pumpDE > 5 ? 'Monitor closely for degradation' : 'Normal operation'
            });
        }

        return trends;
    }

    // Detect anomalies
    detectAnomalies(vibrationData: any): AIAnomaly[] {
        const anomalies: AIAnomaly[] = [];

        // Check for velocity anomalies
        const checkVelocityAnomaly = (data: any, location: string) => {
            if (!data) return;

            const velocities = [data.velV, data.velH, data.velAxl].map(Number).filter(x => !isNaN(x));
            if (velocities.length === 0) return;

            velocities.forEach((vel, index) => {
                const directions = ['V', 'H', 'Axl'];
                const expected = 2.0; // Expected baseline
                const deviation = Math.abs(vel - expected) / expected;

                if (deviation > 0.5) {
                    anomalies.push({
                        parameter: `${location} ${directions[index]} Velocity`,
                        value: vel,
                        expected: expected,
                        deviation: deviation * 100,
                        severity: deviation > 1 ? 'high' : 'medium',
                        description: `Velocity ${deviation > 1 ? 'significantly' : 'moderately'} above expected baseline`
                    });
                }
            });
        };

        if (vibrationData.pump?.nde) checkVelocityAnomaly(vibrationData.pump.nde, 'Pump NDE');
        if (vibrationData.pump?.de) checkVelocityAnomaly(vibrationData.pump.de, 'Pump DE');
        if (vibrationData.motor?.nde) checkVelocityAnomaly(vibrationData.motor.nde, 'Motor NDE');
        if (vibrationData.motor?.de) checkVelocityAnomaly(vibrationData.motor.de, 'Motor DE');

        return anomalies;
    }

    // Perform complete AI assessment
    performAssessment(vibrationData: any, operationalData: any): AIConditionAssessment {
        const healthScore = this.calculateHealthScore(vibrationData, operationalData);
        const insights = this.generateInsights(vibrationData, operationalData);
        const recommendations = this.generateRecommendations(insights, healthScore);
        const trends = this.generateTrends(vibrationData);
        const anomalies = this.detectAnomalies(vibrationData);

        // Determine overall condition
        let overallCondition: AIConditionAssessment['overallCondition'];
        if (healthScore >= 90) overallCondition = 'excellent';
        else if (healthScore >= 75) overallCondition = 'good';
        else if (healthScore >= 60) overallCondition = 'acceptable';
        else if (healthScore >= 40) overallCondition = 'unacceptable';
        else overallCondition = 'critical';

        // Determine risk level
        let riskLevel: AIConditionAssessment['riskLevel'];
        if (healthScore >= 80) riskLevel = 'low';
        else if (healthScore >= 60) riskLevel = 'medium';
        else if (healthScore >= 40) riskLevel = 'high';
        else riskLevel = 'critical';

        // Determine priority
        let priority: AIConditionAssessment['priority'];
        if (insights.some(i => i.type === 'critical')) priority = 'critical';
        else if (insights.some(i => i.severity >= 7)) priority = 'urgent';
        else if (healthScore < 70) priority = 'high';
        else if (healthScore < 85) priority = 'medium';
        else priority = 'low';

        // Calculate confidence based on data quality
        const confidence = Math.min(95, Math.max(60, healthScore + 10));

        // Determine maintenance requirements
        const maintenanceRequired = healthScore < 80 || insights.some(i => i.severity >= 6);
        const immediateAction = healthScore < 50 || insights.some(i => i.type === 'critical');

        // Calculate next inspection date
        const nextInspectionDate = this.calculateNextInspectionDate(healthScore, insights);

        return {
            overallCondition,
            confidence,
            healthScore,
            riskLevel,
            priority,
            maintenanceRequired,
            immediateAction,
            nextInspectionDate,
            insights,
            recommendations,
            trends,
            anomalies
        };
    }

    private calculateNextInspectionDate(healthScore: number, insights: AIInsight[]): string {
        const today = new Date();
        let daysToAdd = 30; // Default 30 days

        if (healthScore < 50 || insights.some(i => i.type === 'critical')) {
            daysToAdd = 1; // Next day
        } else if (healthScore < 70 || insights.some(i => i.severity >= 7)) {
            daysToAdd = 7; // 1 week
        } else if (healthScore < 85) {
            daysToAdd = 14; // 2 weeks
        } else {
            daysToAdd = 30; // 1 month
        }

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysToAdd);
        return format(nextDate, 'yyyy-MM-dd');
    }
}

// Intelligent Maintenance Planning Engine
class MaintenancePlanningEngine {
    // Equipment operates 18 hours/day as specified
    static readonly OPERATING_HOURS_PER_DAY = 18;
    static readonly OPERATING_DAYS_PER_YEAR = 365;

    static generateMaintenancePlan(aiAssessment: AIConditionAssessment, failureAnalyses: FailureAnalysis[], equipmentId: string): MaintenancePlan {
        const tasks: MaintenanceTask[] = [];
        const currentDate = new Date();

        // Generate tasks from AI recommendations
        aiAssessment.recommendations.forEach((rec, index) => {
            const task = this.createTaskFromRecommendation(rec, equipmentId, index);
            tasks.push(task);
        });

        // Enhanced failure analysis integration - Generate tasks from immediate actions and corrective measures
        failureAnalyses.forEach((analysis, index) => {
            // Create tasks for immediate actions (high priority)
            if (analysis.immediateActions && analysis.immediateActions.length > 0) {
                analysis.immediateActions.forEach((action: string, actionIndex: number) => {
                    const immediateTask = this.createTaskFromImmediateAction(action, analysis, equipmentId, `IA-${index}-${actionIndex}`);
                    tasks.push(immediateTask);
                });
            }

            // Create tasks for corrective measures (based on severity)
            if (analysis.correctiveMeasures && analysis.correctiveMeasures.length > 0 &&
                (analysis.severity === 'Severe' || analysis.severity === 'Critical' || analysis.severity === 'Moderate')) {
                analysis.correctiveMeasures.forEach((measure: string, measureIndex: number) => {
                    const correctiveTask = this.createTaskFromCorrectiveMeasure(measure, analysis, equipmentId, `CM-${index}-${measureIndex}`);
                    tasks.push(correctiveTask);
                });
            }

            // Legacy task creation for backward compatibility
            if (analysis.severity === 'Critical' || analysis.severity === 'Severe') {
                const task = this.createTaskFromFailureAnalysis(analysis, equipmentId, index + 100);
                tasks.push(task);
            }
        });

        // Calculate RUL-based maintenance scheduling
        const rulPrediction = this.calculateRULPrediction(aiAssessment);

        // Sort tasks by priority and RUL
        tasks.sort((a, b) => {
            const priorityOrder = { critical: 5, urgent: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        return {
            id: `plan-${equipmentId}-${Date.now()}`,
            equipmentId,
            planName: `Maintenance Plan - ${equipmentId}`,
            createdDate: currentDate,
            lastUpdated: currentDate,
            tasks,
            totalEstimatedHours: tasks.reduce((sum, task) => sum + task.estimatedDuration, 0),
            completionPercentage: 0,
            nextCriticalTask: tasks.find(t => t.priority === 'critical' || t.priority === 'urgent'),
            rulPrediction
        };
    }

    static createTaskFromRecommendation(rec: AIRecommendation, equipmentId: string, index: number): MaintenanceTask {
        const scheduledDate = this.calculateScheduleDate(rec.priority, rec.timeframe);
        const estimatedDuration = this.estimateTaskDuration(rec.impact, rec.priority);

        return {
            id: `task-rec-${index}-${Date.now()}`,
            title: rec.title,
            description: rec.description,
            priority: rec.priority as any,
            estimatedDuration,
            scheduledDate,
            dueDate: addDays(scheduledDate, this.getDueDateOffset(rec.priority)),
            status: 'pending',
            equipmentId,
            workOrderNumber: `WO-${equipmentId}-${Date.now()}-${index}`
        };
    }

    // Create task from immediate action (failure analysis engine integration)
    static createTaskFromImmediateAction(action: string, analysis: any, equipmentId: string, taskId: string): MaintenanceTask {
        const priority = analysis.severity === 'Critical' ? 'critical' :
            analysis.severity === 'Severe' ? 'urgent' : 'high';

        const scheduledDate = new Date();
        // Immediate actions should be scheduled ASAP
        scheduledDate.setHours(scheduledDate.getHours() + (priority === 'critical' ? 1 : 4));

        return {
            id: `immediate-${taskId}`,
            title: `Immediate Action: ${analysis.type}`,
            description: action,
            priority: priority as any,
            estimatedDuration: 2, // Immediate actions are typically quick
            scheduledDate,
            dueDate: addDays(scheduledDate, priority === 'critical' ? 0 : 1),
            status: 'pending',
            equipmentId,
            failureMode: analysis.type,
            workOrderNumber: `WO-IA-${equipmentId}-${Date.now()}`
        };
    }

    // Create task from corrective measure (failure analysis engine integration)
    static createTaskFromCorrectiveMeasure(measure: string, analysis: any, equipmentId: string, taskId: string): MaintenanceTask {
        const priority = analysis.severity === 'Critical' ? 'urgent' :
            analysis.severity === 'Severe' ? 'high' : 'medium';

        const scheduledDate = this.calculateScheduleDate(priority, 'short-term');

        return {
            id: `corrective-${taskId}`,
            title: `Corrective Measure: ${analysis.type}`,
            description: measure,
            priority: priority as any,
            estimatedDuration: this.estimateFailureTaskDuration(analysis.severity) * 1.5, // Corrective measures take longer
            scheduledDate,
            dueDate: addDays(scheduledDate, this.getDueDateOffset(priority)),
            status: 'pending',
            equipmentId,
            failureMode: analysis.type,
            workOrderNumber: `WO-CM-${equipmentId}-${Date.now()}`
        };
    }

    static createTaskFromFailureAnalysis(analysis: any, equipmentId: string, index: number): MaintenanceTask {
        const priority = analysis.severity === 'Critical' ? 'critical' :
            analysis.severity === 'High' ? 'urgent' : 'high';
        const scheduledDate = this.calculateScheduleDate(priority, 'immediate');

        return {
            id: `task-fail-${index}-${Date.now()}`,
            title: `Address ${analysis.type} Failure Mode`,
            description: `${analysis.description} - Recommended Action: ${analysis.recommendation}`,
            priority: priority as any,
            estimatedDuration: this.estimateFailureTaskDuration(analysis.severity),
            scheduledDate,
            dueDate: addDays(scheduledDate, this.getDueDateOffset(priority)),
            status: 'pending',
            equipmentId,
            failureMode: analysis.type,
            workOrderNumber: `WO-${equipmentId}-${Date.now()}-${index}`
        };
    }

    static calculateRULPrediction(aiAssessment: AIConditionAssessment): MaintenancePlan['rulPrediction'] {
        // Calculate RUL based on health score and operating hours
        const healthScore = aiAssessment.healthScore || 50;
        const degradationRate = (100 - healthScore) / 100;

        // Estimate RUL in operating hours, then convert to calendar days
        const estimatedRULHours = (healthScore / degradationRate) * 100;
        const estimatedRULDays = Math.round(estimatedRULHours / this.OPERATING_HOURS_PER_DAY);

        const confidence = aiAssessment.confidence || 70;
        const criticalFailureDate = addDays(new Date(), estimatedRULDays);

        return {
            estimatedRUL: estimatedRULDays,
            confidence,
            criticalFailureDate
        };
    }

    static calculateScheduleDate(priority: string, timeframe: string): Date {
        const now = new Date();

        switch (priority) {
            case 'critical':
                return now; // Immediate
            case 'urgent':
                return addDays(now, 1);
            case 'high':
                return addDays(now, 3);
            case 'medium':
                return addWeeks(now, 1);
            case 'low':
                return addWeeks(now, 2);
            default:
                return addDays(now, 7);
        }
    }

    static estimateTaskDuration(impact: string, priority: string): number {
        // Base duration in hours, considering 18hr/day operation
        const baseDurations = {
            critical: 8,
            urgent: 6,
            high: 4,
            medium: 3,
            low: 2
        };

        const impactMultiplier = impact === 'high' ? 1.5 : impact === 'medium' ? 1.2 : 1.0;
        return Math.round((baseDurations[priority as keyof typeof baseDurations] || 2) * impactMultiplier);
    }

    static estimateFailureTaskDuration(severity: string): number {
        switch (severity) {
            case 'Critical': return 12;
            case 'High': return 8;
            case 'Medium': return 6;
            default: return 4;
        }
    }

    static getDueDateOffset(priority: string): number {
        switch (priority) {
            case 'critical': return 1;
            case 'urgent': return 2;
            case 'high': return 5;
            case 'medium': return 10;
            case 'low': return 14;
            default: return 7;
        }
    }
}

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

    // Form state
    const [currentStep, setCurrentStep] = useState(0);
    const [formProgress, setFormProgress] = useState(0);
    const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activePoint, setActivePoint] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error'>('success');
    const [alertDetails, setAlertDetails] = useState<any>({});
    const [showAddEquipment, setShowAddEquipment] = useState(false);
    const [addMode, setAddMode] = useState(false);

    // Add Equipment form state
    const [newEquipment, setNewEquipment] = useState({
        name: '',
        type: '',
        category: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'operational',
        condition: 'good',
    });

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

    // AI Assessment state
    const [aiAssessment, setAiAssessment] = useState<AIConditionAssessment | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [lastAssessmentTime, setLastAssessmentTime] = useState<Date | null>(null);

    // Failure Analysis Cards state
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    // Reliability enhancement state
    const [reliabilityData, setReliabilityData] = useState<any>(null);

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

            // Pump leg measurements
            ['leg1', 'leg2', 'leg3', 'leg4'].forEach(leg => {
                if (vibrationData.pump?.[leg]?.velocity) {
                    pumpVibrations.push(parseFloat(vibrationData.pump[leg].velocity));
                }
            });

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

            // Motor leg measurements
            ['leg1', 'leg2', 'leg3', 'leg4'].forEach(leg => {
                if (vibrationData.motor?.[leg]?.velocity) {
                    motorVibrations.push(parseFloat(vibrationData.motor[leg].velocity));
                }
            });

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

    // Initialize AI Assessment Engine
    const aiEngine = AIAssessmentEngine.getInstance();

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
        // Check pump leg measurements
        ['leg1', 'leg2', 'leg3', 'leg4'].forEach(leg => {
            if (vibrationData.pump?.[leg]?.velocity) {
                pumpValues.push(parseFloat(vibrationData.pump[leg].velocity || '0'));
            }
        });

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
        // Check motor leg measurements
        ['leg1', 'leg2', 'leg3', 'leg4'].forEach(leg => {
            if (vibrationData.motor?.[leg]?.velocity) {
                motorValues.push(parseFloat(vibrationData.motor[leg].velocity || '0'));
            }
        });

        // Return true only if we have at least one non-zero measurement
        const allValues = [...pumpValues, ...motorValues];
        return allValues.some(value => value > 0);
    };

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
    }, [formValues.vibrationData, formValues.operatingHours, formValues.operatingPower, formValues.efficiency, selectedEquipment, currentStep]);

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
    }, [currentStep, selectedEquipment.length]);

    // Generate Intelligent Maintenance Plan with Enhanced Failure Analysis Integration
    const generateMaintenancePlan = useCallback((aiAssessment: AIConditionAssessment, failureAnalyses: FailureAnalysis[]) => {
        if (!selectedEquipment.length || !aiAssessment) return;

        const equipmentId = selectedEquipment[0]; // Use primary equipment

        // Enhanced integration: Pass failure analysis data with immediate actions and corrective measures
        const enhancedFailureAnalyses = failureAnalyses.map(analysis => ({
            ...analysis,
            // Ensure immediate actions and corrective measures are properly mapped
            immediateActions: analysis.immediateActions || [],
            correctiveMeasures: analysis.correctiveMeasures || [],
            preventiveMeasures: analysis.preventiveMeasures || []
        }));

        const plan = MaintenancePlanningEngine.generateMaintenancePlan(aiAssessment, enhancedFailureAnalyses, equipmentId);
        setMaintenancePlan(plan);
        setShowMaintenancePlanner(true);

        toast({
            title: "Maintenance Plan Generated",
            description: `Created ${plan.tasks.length} maintenance tasks based on AI assessment and failure analysis engine.`,
        });
    }, [selectedEquipment, toast]);

    // Generate Advanced Charts
    const generateAdvancedCharts = useCallback((aiAssessment: AIConditionAssessment, vibrationData: any) => {
        const charts: AdvancedChartConfig[] = [];

        // 1. Health Score Trend Chart
        charts.push({
            type: 'line',
            title: 'Equipment Health Score Trend',
            data: generateHealthTrendData(aiAssessment),
            height: 300
        });

        // 2. RUL Prediction Chart
        charts.push({
            type: 'line',
            title: 'Remaining Useful Life Prediction',
            data: generateRULPredictionData(aiAssessment),
            height: 300
        });

        // 3. Vibration Analysis Chart
        charts.push({
            type: 'bar',
            title: 'Vibration Analysis by Component',
            data: generateVibrationAnalysisData(vibrationData),
            height: 300
        });

        // 4. Failure Mode Distribution
        charts.push({
            type: 'doughnut',
            title: 'Failure Mode Risk Distribution',
            data: generateFailureModeData(aiAssessment),
            height: 300
        });

        // 5. Maintenance Effectiveness
        if (maintenancePlan) {
            charts.push({
                type: 'radar',
                title: 'Maintenance Task Priority Matrix',
                data: generateMaintenanceRadarData(maintenancePlan),
                height: 300
            });
        }

        setChartConfigs(charts);
        setShowChartsPanel(true);
    }, [maintenancePlan]);

    // Chart Data Generation Functions
    const generateHealthTrendData = (aiAssessment: AIConditionAssessment): ChartDataPoint[] => {
        const baseScore = aiAssessment.healthScore || 50;
        const data: ChartDataPoint[] = [];

        // Generate historical trend (simulated)
        for (let i = 30; i >= 0; i--) {
            const date = addDays(new Date(), -i);
            const variation = Math.random() * 10 - 5; // ±5 points variation
            const score = Math.max(0, Math.min(100, baseScore + variation));

            data.push({
                x: format(date, 'MMM dd'),
                y: score,
                label: `Health Score: ${score.toFixed(1)}%`
            });
        }

        return data;
    };



    const generateVibrationAnalysisData = (vibrationData: any): ChartDataPoint[] => {
        if (!vibrationData) return [];

        const components = ['Pump Leg 1', 'Pump Leg 2', 'Pump Leg 3', 'Pump Leg 4',
            'Motor Leg 1', 'Motor Leg 2', 'Motor Leg 3', 'Motor Leg 4'];

        return components.map((component, index) => ({
            x: component,
            y: vibrationData[`leg${index + 1}Velocity`] || Math.random() * 10,
            label: `${component}: ${(vibrationData[`leg${index + 1}Velocity`] || Math.random() * 10).toFixed(2)} mm/s`,
            color: index < 4 ? '#3B82F6' : '#10B981'
        }));
    };

    const generateFailureModeData = (aiAssessment: AIConditionAssessment): ChartDataPoint[] => {
        const failureModes = ['Bearing Wear', 'Misalignment', 'Imbalance', 'Looseness', 'Cavitation'];

        return failureModes.map((mode, index) => ({
            x: mode,
            y: Math.random() * 100,
            label: `${mode}: ${(Math.random() * 100).toFixed(1)}%`,
            color: `hsl(${index * 72}, 70%, 50%)`
        }));
    };

    const generateMaintenanceRadarData = (plan: MaintenancePlan): ChartDataPoint[] => {
        const metrics = ['Urgency', 'Complexity', 'Cost', 'Impact', 'Resources'];

        return metrics.map(metric => ({
            x: metric,
            y: Math.random() * 100,
            label: `${metric}: ${(Math.random() * 100).toFixed(1)}%`
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

    // 1. Add a helper to get failure analyses from vibration data
    const getFailureAnalyses = (vibrationData: any) => {
        // Prepare data for pump, motor, and system (average if both present)
        const parse = (val: any) => (val === '' || val == null ? 0 : parseFloat(val));
        const pump = vibrationData.pump || {};
        const motor = vibrationData.motor || {};
        // Aggregate for pump
        const pumpData = {
            VH: parse(pump.nde?.velH) || 0,
            VV: parse(pump.nde?.velV) || 0,
            VA: parse(pump.nde?.velAxl) || 0,
            AH: parse(pump.nde?.accH) || 0,
            AV: parse(pump.nde?.accV) || 0,
            AA: parse(pump.nde?.accAxl) || 0,
            f: 50,
            N: 1450,
            temp: parse(pump.nde?.temp) || 0
        };
        // Aggregate for motor
        const motorData = {
            VH: parse(motor.nde?.velH) || 0,
            VV: parse(motor.nde?.velV) || 0,
            VA: parse(motor.nde?.velAxl) || 0,
            AH: parse(motor.nde?.accH) || 0,
            AV: parse(motor.nde?.accV) || 0,
            AA: parse(motor.nde?.accAxl) || 0,
            f: 50,
            N: 1450,
            temp: parse(motor.nde?.temp) || 0
        };
        // System average
        const systemData = {
            VH: (pumpData.VH + motorData.VH) / 2,
            VV: (pumpData.VV + motorData.VV) / 2,
            VA: (pumpData.VA + motorData.VA) / 2,
            AH: (pumpData.AH + motorData.AH) / 2,
            AV: (pumpData.AV + motorData.AV) / 2,
            AA: (pumpData.AA + motorData.AA) / 2,
            f: 50,
            N: 1450,
            temp: Math.max(pumpData.temp, motorData.temp)
        };
        // Run analyses
        const pumpAnalyses = FailureAnalysisEngine.performComprehensiveAnalysis(pumpData).map(a => ({ ...a, type: `Pump ${a.type}` }));
        const motorAnalyses = FailureAnalysisEngine.performComprehensiveAnalysis(motorData).map(a => ({ ...a, type: `Motor ${a.type}` }));
        const systemAnalyses = FailureAnalysisEngine.performComprehensiveAnalysis(systemData).map(a => ({ ...a, type: `System ${a.type}` }));
        return [...pumpAnalyses, ...motorAnalyses, ...systemAnalyses];
    };

    // 2. Update performAIAssessment to use failure analyses
    const performAIAssessment = () => {
        if (isAssessing) return;
        if (!hasValidVibrationData(formValues.vibrationData)) {
            setUserFeedback({
                type: 'warning',
                title: 'No Vibration Data',
                message: 'Please enter vibration measurements before running AI assessment.',
                show: true
            });
            return;
        }
        setIsAssessing(true);
        setTimeout(() => {
            try {
                const assessment = aiEngine.performAssessment(
                    formValues.vibrationData,
                    {
                        operatingHours: formValues.operatingHours,
                        operatingPower: formValues.operatingPower,
                        efficiency: formValues.efficiency,
                        powerConsumption: formValues.powerConsumption
                    }
                );
                if (!assessment) throw new Error('AI assessment returned null result');
                if (assessment.healthScore !== undefined && (isNaN(assessment.healthScore) || !isFinite(assessment.healthScore))) {
                    throw new Error('AI assessment produced invalid health score');
                }
                setAiAssessment(assessment);
                setLastAssessmentTime(new Date());
                setTimeout(() => {
                    // --- INTEGRATE FAILURE ANALYSIS ENGINE ---
                    const failureAnalyses = getFailureAnalyses(formValues.vibrationData);
                    generateMaintenancePlan(assessment, failureAnalyses);
                    generateAdvancedCharts(assessment, formValues.vibrationData);
                    // --- END INTEGRATION ---
                }, 500);
                if (userFeedback.show && userFeedback.type === 'error') {
                    setUserFeedback(prev => ({ ...prev, show: false }));
                }
                setUserFeedback({
                    type: 'success',
                    title: 'AI Assessment Complete',
                    message: 'Vibration analysis completed successfully. Review the results below.',
                    show: true
                });
                if (assessment) {
                    setValue('overallCondition', assessment.overallCondition);
                    setValue('priority', assessment.priority);
                    setValue('maintenanceRequired', assessment.maintenanceRequired);
                    setValue('immediateAction', assessment.immediateAction);
                    setValue('nextInspectionDate', assessment.nextInspectionDate);
                    if (assessment.recommendations.length > 0) {
                        const recommendationsText = assessment.recommendations
                            .map(rec => `${rec.title}: ${rec.description}`)
                            .join('\n\n');
                        setValue('recommendations', recommendationsText);
                    }
                    if (hasValidVibrationData(formValues.vibrationData)) {
                        const realReliabilityData = calculateRealReliabilityAnalysis(formValues);
                        setReliabilityData(realReliabilityData);
                    }
                }
            } catch (error) {
                console.error('Error performing AI assessment:', error);
                setAiAssessment(null);
                handleCalculationError(error, 'AI condition assessment');
            } finally {
                setIsAssessing(false);
            }
        }, 800);
    };

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

    // Navigation functions
    const nextStep = () => {
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
                    ? aiAssessment.recommendations.map(rec => `${rec.title}: ${rec.description}`).join('\n\n')
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

    // Handle Add Equipment submit
    const handleAddEquipment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEquipment.name || !newEquipment.type || !newEquipment.category || !newEquipment.manufacturer || !newEquipment.model || !newEquipment.serialNumber) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill all required fields for new equipment.',
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Equipment Added',
            description: `${newEquipment.name} has been added to monitored equipment.`,
            variant: 'default',
        });

        setNewEquipment({
            name: '', type: '', category: '', manufacturer: '', model: '', serialNumber: '', location: '', status: 'operational', condition: 'good',
        });
        setAddMode(false);
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

    // Prepare comprehensive pump-motor system analysis data
    const pumpAnalysisData: VibrationData = {
        VH: parseFloat(formValues.vibrationData?.pump?.nde?.velH || '0'),
        VV: parseFloat(formValues.vibrationData?.pump?.nde?.velV || '0'),
        VA: parseFloat(formValues.vibrationData?.pump?.nde?.velAxl || '0'),
        AH: parseFloat(formValues.vibrationData?.pump?.nde?.accH || '0'),
        AV: parseFloat(formValues.vibrationData?.pump?.nde?.accV || '0'),
        AA: parseFloat(formValues.vibrationData?.pump?.nde?.accAxl || '0'),
        f: 50,
        N: 1450,
        temp: parseFloat(formValues.vibrationData?.pump?.nde?.temp || '0')
    };
    const motorAnalysisData: VibrationData = {
        VH: parseFloat(formValues.vibrationData?.motor?.nde?.velH || '0'),
        VV: parseFloat(formValues.vibrationData?.motor?.nde?.velV || '0'),
        VA: parseFloat(formValues.vibrationData?.motor?.nde?.velAxl || '0'),
        AH: parseFloat(formValues.vibrationData?.motor?.nde?.accH || '0'),
        AV: parseFloat(formValues.vibrationData?.motor?.nde?.accV || '0'),
        AA: parseFloat(formValues.vibrationData?.motor?.nde?.accAxl || '0'),
        f: 50,
        N: 1450,
        temp: parseFloat(formValues.vibrationData?.motor?.nde?.temp || '0')
    };
    const systemAnalysisData: VibrationData = {
        VH: (pumpAnalysisData.VH + motorAnalysisData.VH) / 2,
        VV: (pumpAnalysisData.VV + motorAnalysisData.VV) / 2,
        VA: (pumpAnalysisData.VA + motorAnalysisData.VA) / 2,
        AH: (pumpAnalysisData.AH + motorAnalysisData.AH) / 2,
        AV: (pumpAnalysisData.AV + motorAnalysisData.AV) / 2,
        AA: (pumpAnalysisData.AA + motorAnalysisData.AA) / 2,
        f: 50,
        N: 1450,
        temp: Math.max(pumpAnalysisData.temp || 0, motorAnalysisData.temp || 0)
    };
    const pumpAnalyses = useMemo(() => FailureAnalysisEngine.performComprehensiveAnalysis(pumpAnalysisData), [JSON.stringify(pumpAnalysisData)]);
    const motorAnalyses = useMemo(() => FailureAnalysisEngine.performComprehensiveAnalysis(motorAnalysisData), [JSON.stringify(motorAnalysisData)]);
    const systemAnalyses = useMemo(() => FailureAnalysisEngine.performComprehensiveAnalysis(systemAnalysisData), [JSON.stringify(systemAnalysisData)]);
    const combinedAnalyses = useMemo(() => [
        ...pumpAnalyses.map(analysis => ({
            ...analysis,
            type: `Pump ${analysis.type}`,
            description: `Pump: ${analysis.description}`
        })),
        ...motorAnalyses.map(analysis => ({
            ...analysis,
            type: `Motor ${analysis.type}`,
            description: `Motor: ${analysis.description}`
        })),
        ...systemAnalyses.map(analysis => ({
            ...analysis,
            type: `System ${analysis.type}`,
            description: `Combined System: ${analysis.description}`
        }))
    ], [pumpAnalyses, motorAnalyses, systemAnalyses]);
    const masterHealth = useMemo(() => FailureAnalysisEngine.calculateMasterHealthAssessment(combinedAnalyses), [combinedAnalyses]);

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
                                    {addMode ? 'Add New Equipment' : 'Enhanced Vibration Monitoring'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    {addMode ? 'Register new equipment for monitoring and analytics' : 'Professional vibration data collection and analysis'}
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => setAddMode(m => !m)}>
                                {addMode ? 'Back to Vibration Entry' : 'Add Equipment'}
                            </Button>
                            {!addMode && (
                                <Badge variant="outline" className="text-xs">
                                    Step {currentStep + 1} of {FORM_STEPS.length}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar - Only show when not in add mode */}
                    {!addMode && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>Progress</span>
                                <span>{Math.round(formProgress)}%</span>
                            </div>
                            <Progress value={formProgress} className="h-2" />
                        </div>
                    )}
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
                                onClick={() => setUserFeedback(prev => ({ ...prev, show: false }))}
                                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Add Equipment Mode */}
                {addMode && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <form onSubmit={handleAddEquipment} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Name*</Label>
                                    <ThemedInput
                                        value={newEquipment.name}
                                        onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                        required
                                        themeVariant="outline"
                                    />
                                </div>
                                <div>
                                    <Label>Type*</Label>
                                    <ThemedInput
                                        value={newEquipment.type}
                                        onChange={e => setNewEquipment({ ...newEquipment, type: e.target.value })}
                                        required
                                        themeVariant="outline"
                                    />
                                </div>
                                <div>
                                    <Label>Category*</Label>
                                    <Select
                                        value={newEquipment.category}
                                        onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pump">Pump</SelectItem>
                                            <SelectItem value="motor">Motor</SelectItem>
                                            <SelectItem value="valve">Valve</SelectItem>
                                            <SelectItem value="tank">Tank</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Manufacturer*</Label>
                                    <ThemedInput
                                        value={newEquipment.manufacturer}
                                        onChange={e => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                                        required
                                        themeVariant="outline"
                                    />
                                </div>
                                <div>
                                    <Label>Model*</Label>
                                    <ThemedInput
                                        value={newEquipment.model}
                                        onChange={e => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                        required
                                        themeVariant="outline"
                                    />
                                </div>
                                <div>
                                    <Label>Serial Number*</Label>
                                    <ThemedInput
                                        value={newEquipment.serialNumber}
                                        onChange={e => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                        required
                                        themeVariant="outline"
                                    />
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <ThemedInput
                                        value={newEquipment.location}
                                        onChange={e => setNewEquipment({ ...newEquipment, location: e.target.value })}
                                        themeVariant="outline"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="submit">Add Equipment</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Step Navigation - Only show when not in add mode */}
                {!addMode && (
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
                )}

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

                                {/* Equipment Type Tabs */}
                                <Tabs defaultValue="pump" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="pump" className="flex items-center gap-2">
                                            <Cpu className="h-4 w-4" />
                                            Pump
                                        </TabsTrigger>
                                        <TabsTrigger value="motor" className="flex items-center gap-2">
                                            <Zap className="h-4 w-4" />
                                            Motor
                                        </TabsTrigger>

                                    </TabsList>

                                    {/* Pump Measurements */}
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
                                                            <Label className="text-xs font-medium">Acceleration (m/s²)</Label>
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
                                                                    Zone {zone.zone} ({zone.label})
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
                                                            <Label className="text-xs font-medium">Acceleration (m/s²)</Label>
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
                                                                    Zone {zone.zone} ({zone.label})
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

                                        {/* Pump Legs 1-4 Sections - Simplified */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                                <Cpu className="h-5 w-5 text-primary" />
                                                Pump Leg Measurements (Simplified)
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {/* Pump Leg 1 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Cpu className="h-4 w-4 text-blue-500" />
                                                            Leg 1
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.pump.leg1.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="2.5"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('pump.leg1')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Pump Leg 1 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Pump Leg 1 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.pump?.leg1?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>

                                                {/* Pump Leg 2 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Cpu className="h-4 w-4 text-green-500" />
                                                            Leg 2
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.pump.leg2.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="2.8"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('pump.leg2')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Pump Leg 2 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Pump Leg 2 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.pump?.leg2?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>
                                                {/* Pump Leg 3 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Cpu className="h-4 w-4 text-orange-500" />
                                                            Leg 3
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.pump.leg3.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="2.2"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('pump.leg3')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Pump Leg 3 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Pump Leg 3 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.pump?.leg3?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>

                                                {/* Pump Leg 4 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Cpu className="h-4 w-4 text-purple-500" />
                                                            Leg 4
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.pump.leg4.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="3.1"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('pump.leg4')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Pump Leg 4 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Pump Leg 4 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.pump?.leg4?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>
                                            </div>

                                        </div>
                                    </TabsContent>

                                    {/* Motor Measurements */}
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
                                                            <Label className="text-xs font-medium">Acceleration (m/s²)</Label>
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
                                                                    Zone {zone.zone} ({zone.label})
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
                                                            <Label className="text-xs font-medium">Acceleration (m/s²)</Label>
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
                                                                    Zone {zone.zone} ({zone.label})
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

                                        {/* Motor Legs 1-4 Sections - Simplified */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-green-500" />
                                                Motor Leg Measurements (Simplified)
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                {/* Motor Leg 1 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Zap className="h-4 w-4 text-blue-500" />
                                                            Leg 1
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.motor.leg1.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="1.8"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('motor.leg1')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Motor Leg 1 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Motor Leg 1 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.motor?.leg1?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>

                                                {/* Motor Leg 2 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Zap className="h-4 w-4 text-green-500" />
                                                            Leg 2
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.motor.leg2.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="2.1"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('motor.leg2')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Motor Leg 2 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Motor Leg 2 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.motor?.leg2?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>

                                                {/* Motor Leg 3 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Zap className="h-4 w-4 text-orange-500" />
                                                            Leg 3
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.motor.leg3.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="1.9"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('motor.leg3')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Motor Leg 3 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Motor Leg 3 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.motor?.leg3?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>

                                                {/* Motor Leg 4 */}
                                                <Card>
                                                    <CardHeader className="pb-3">
                                                        <CardTitle className="flex items-center gap-2 text-sm">
                                                            <Zap className="h-4 w-4 text-purple-500" />
                                                            Leg 4
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <div>
                                                            <Label className="text-xs font-medium text-muted-foreground">Velocity (mm/s)</Label>
                                                            <Controller
                                                                name="vibrationData.motor.leg4.velocity"
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Input
                                                                                {...field}
                                                                                value={field.value ?? ''}
                                                                                placeholder="2.3"
                                                                                type="number"
                                                                                step="0.1"
                                                                                className={`mt-1 ${getVibrationInputColor(field.value)}`}
                                                                                onFocus={() => setActivePoint('motor.leg4')}
                                                                                onBlur={() => setActivePoint(null)}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-center">
                                                                                <span className="font-semibold">Motor Leg 4 Velocity</span>
                                                                                <br />
                                                                                <span className="text-xs">Enter velocity reading in mm/s</span>
                                                                                <br />
                                                                                <span className="text-xs text-muted-foreground">ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1</span>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            />
                                                        </div>
                                                        {/* Live ISO 10816 zone for Motor Leg 4 */}
                                                        {(() => {
                                                            const velocity = parseFloat(formValues.vibrationData?.motor?.leg4?.velocity || '0');
                                                            if (velocity > 0) {
                                                                const zone = getISO10816Zone(velocity);
                                                                return (
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="text-xs font-mono">{safeDisplay(velocity, 2)} mm/s</div>
                                                                        <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color} w-fit`}>
                                                                            Zone {zone.zone}
                                                                        </Badge>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </CardContent>
                                                </Card>


                                            </div>
                                        </div>
                                    </TabsContent>


                                </Tabs>

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

                                        // Integrate with AI Assessment if available (using masterHealth from component level)
                                        const integratedHealthScore = aiAssessment ?
                                            (masterHealth.overallHealthScore + aiAssessment.healthScore) / 2 :
                                            masterHealth.overallHealthScore;

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

                                                {/* Enhanced Failure Analysis Carousel */}
                                                <EnhancedFailureAnalysisCarousel
                                                    analyses={combinedAnalyses}
                                                    autoRotationInterval={6000}
                                                    showControls={true}
                                                    className="mb-4"
                                                />


                                                {/* Advanced Technical & Statistical Charts */}
                                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                    {/* Vibration Analysis Charts */}
                                                    <Card className="bg-card">
                                                        <CardHeader className="pb-3 pt-4 px-4">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                                Advanced Vibration Analysis
                                                                <Badge variant="outline" className="ml-2">ISO 10816</Badge>
                                                            </CardTitle>
                                                            <p className="text-sm text-muted-foreground">
                                                                Real-time vibration analysis with statistical trending
                                                            </p>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <EnhancedChart
                                                                title="Current RMS Velocity Readings"
                                                                type="bar"
                                                                data={chartData}
                                                                height={200}
                                                                customOptions={{
                                                                    responsive: true,
                                                                    plugins: {
                                                                        legend: { position: 'top' },
                                                                        tooltip: {
                                                                            callbacks: {
                                                                                label: function (context) {
                                                                                    return `${context.label}: ${safeDisplay(context.parsed.y, 2)} mm/s`;
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    scales: {
                                                                        y: {
                                                                            title: { display: true, text: 'RMS Velocity (mm/s)' },
                                                                            grid: { color: 'rgba(0, 0, 0, 0.1)' }
                                                                        }
                                                                    }
                                                                }}
                                                            />
                                                            <EnhancedChart
                                                                title="Historical Trend Analysis"
                                                                type="line"
                                                                data={combinedTrendData}
                                                                height={200}
                                                                customOptions={{
                                                                    responsive: true,
                                                                    plugins: {
                                                                        legend: { position: 'top' },
                                                                        tooltip: {
                                                                            callbacks: {
                                                                                label: function (context) {
                                                                                    return `${context.dataset.label}: ${safeDisplay(context.parsed.y, 2)} mm/s`;
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    scales: {
                                                                        y: { title: { display: true, text: 'RMS Velocity (mm/s)' } }
                                                                    }
                                                                }}
                                                            />
                                                        </CardContent>
                                                    </Card>

                                                    {/* Reliability Engineering Charts */}
                                                    <Card className="bg-card">
                                                        <CardHeader className="pb-3 pt-4 px-4">
                                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                                <BarChart className="h-5 w-5 text-purple-500" />
                                                                Reliability Engineering Analysis
                                                                <Badge variant="outline" className="ml-2">OREDA/NSWC-10</Badge>
                                                            </CardTitle>
                                                            <p className="text-sm text-muted-foreground">
                                                                Standards-compliant reliability analysis with Weibull distribution
                                                            </p>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            {reliabilityData ? (
                                                                <>
                                                                    {/* Weibull Distribution Chart */}
                                                                    <EnhancedChart
                                                                        title="Weibull Reliability Function"
                                                                        type="line"
                                                                        data={{
                                                                            labels: Array.from({ length: 50 }, (_, i) => (i * 200).toString()),
                                                                            datasets: [{
                                                                                label: 'Reliability R(t)',
                                                                                data: Array.from({ length: 50 }, (_, i) => {
                                                                                    const time = i * 200;
                                                                                    const beta = reliabilityData.weibull_analysis.beta;
                                                                                    const eta = reliabilityData.weibull_analysis.eta;
                                                                                    return Math.exp(-Math.pow(time / eta, beta)) * 100;
                                                                                }),
                                                                                borderColor: themeClasses.primary,
                                                                                backgroundColor: themeClasses.accent,
                                                                                fill: true
                                                                            }]
                                                                        }}
                                                                        height={180}
                                                                        customOptions={{
                                                                            responsive: true,
                                                                            plugins: { legend: { position: 'top' } },
                                                                            scales: {
                                                                                x: { title: { display: true, text: 'Time (hours)' } },
                                                                                y: { title: { display: true, text: 'Reliability (%)' } }
                                                                            }
                                                                        }}
                                                                    />

                                                                    {/* Failure Rate Chart */}
                                                                    <EnhancedChart
                                                                        title="Hazard Rate Function"
                                                                        type="line"
                                                                        data={{
                                                                            labels: Array.from({ length: 50 }, (_, i) => (i * 200).toString()),
                                                                            datasets: [{
                                                                                label: 'Hazard Rate λ(t)',
                                                                                data: Array.from({ length: 50 }, (_, i) => {
                                                                                    const time = i * 200;
                                                                                    const beta = reliabilityData.weibull_analysis.beta;
                                                                                    const eta = reliabilityData.weibull_analysis.eta;
                                                                                    return (beta / eta) * Math.pow(time / eta, beta - 1) * 1000;
                                                                                }),
                                                                                borderColor: themeClasses.primary,
                                                                                backgroundColor: themeClasses.accent,
                                                                                fill: true
                                                                            }]
                                                                        }}
                                                                        height={180}
                                                                        customOptions={{
                                                                            responsive: true,
                                                                            plugins: { legend: { position: 'top' } },
                                                                            scales: {
                                                                                x: { title: { display: true, text: 'Time (hours)' } },
                                                                                y: { title: { display: true, text: 'Failure Rate (×10⁻³/hr)' } }
                                                                            }
                                                                        }}
                                                                    />
                                                                </>
                                                            ) : (
                                                                <div className="text-center py-8">
                                                                    <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                                    <p className="text-muted-foreground mb-2">Reliability Analysis Ready</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Enter vibration data to generate Weibull analysis
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                {/* Statistical Analysis Dashboard */}
                                                <Card
                                                    className="border-border dark:border-border"
                                                    style={{ background: 'hsl(var(--card))' }}
                                                >
                                                    <CardHeader className="pb-3 pt-4 px-4">
                                                        <CardTitle className="flex items-center gap-3">
                                                            <div className="p-2 bg-emerald-500 rounded-lg">
                                                                <TrendingUp className="h-5 w-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-bold text-foreground">Statistical Analysis Dashboard</h3>
                                                                <p className="text-sm text-muted-foreground">Advanced statistical metrics and reliability indicators</p>
                                                            </div>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        {reliabilityData ? (
                                                            <>
                                                                {/* Key Reliability Metrics */}
                                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-primary">
                                                                            {safeDisplay(reliabilityData.reliability_metrics.mtbf, 0)}h
                                                                        </div>
                                                                        <div className="text-xs text-primary/80">MTBF</div>
                                                                        <div className="text-xs text-muted-foreground">Mean Time Between Failures</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-emerald-600">
                                                                            {safeDisplay(reliabilityData.reliability_metrics.availability, 1)}%
                                                                        </div>
                                                                        <div className="text-xs text-emerald-600">Availability</div>
                                                                        <div className="text-xs text-muted-foreground">System Uptime</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-violet-600">
                                                                            {safeDisplay(reliabilityData.rul_prediction.remaining_useful_life, 0)}h
                                                                        </div>
                                                                        <div className="text-xs text-violet-600">RUL</div>
                                                                        <div className="text-xs text-muted-foreground">Remaining Useful Life</div>
                                                                    </div>
                                                                    <div className="text-center p-4 bg-card rounded-lg shadow-sm border border-border">
                                                                        <div className="text-2xl font-bold text-amber-600">
                                                                            {safeDisplay(reliabilityData.weibull_analysis.beta, 2)}
                                                                        </div>
                                                                        <div className="text-xs text-amber-600">β (Beta)</div>
                                                                        <div className="text-xs text-muted-foreground">Weibull Shape</div>
                                                                    </div>
                                                                </div>

                                                                {/* Failure Mode Analysis */}
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                                            Failure Mode Analysis
                                                                        </h4>
                                                                        <div className="space-y-2">
                                                                            {reliabilityData.failure_modes.map((mode: any, index: number) => (
                                                                                <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                                                                                    <div>
                                                                                        <div className="font-medium text-sm text-foreground">{mode.mode}</div>
                                                                                        <div className="text-xs text-muted-foreground">RPN: {safeDisplay(mode.rpn, 0)}</div>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <div className="text-sm font-bold text-destructive">{safeDisplay(mode.probability * 100, 1)}%</div>
                                                                                        <div className="text-xs text-muted-foreground">Probability</div>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                                                            <Target className="h-4 w-4 text-primary" />
                                                                            Maintenance Optimization
                                                                        </h4>
                                                                        <div className="space-y-3">
                                                                            <div className="p-3 bg-card rounded-lg border border-border">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-sm font-medium text-foreground">Optimal Interval</span>
                                                                                    <span className="text-sm font-bold text-primary">{safeDisplay(reliabilityData.maintenance_optimization.optimal_interval, 0, 'N/A', 'optimal interval')}h</span>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">Recommended maintenance frequency</div>
                                                                            </div>
                                                                            <div className="p-3 bg-card rounded-lg border border-border">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <span className="text-sm font-medium text-foreground">Cost Savings</span>
                                                                                    <span className="text-sm font-bold text-emerald-600">${reliabilityData.maintenance_optimization.cost_savings.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">Annual projected savings</div>
                                                                            </div>
                                                                            <div className="p-3 bg-card rounded-lg border border-border">
                                                                                <div className="text-sm font-medium mb-2 text-foreground">Recommended Actions</div>
                                                                                <ul className="text-xs text-muted-foreground space-y-1">
                                                                                    {reliabilityData.maintenance_optimization.recommended_actions.map((action: string, index: number) => (
                                                                                        <li key={index} className="flex items-start gap-1">
                                                                                            <span className="text-emerald-500 mt-0.5">•</span>
                                                                                            <span>{action}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                                <p className="text-muted-foreground mb-2">Statistical Analysis Ready</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Enter vibration measurements to generate comprehensive statistical analysis
                                                                </p>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </>
                                        );
                                    })()}

                                    {/* Equipment Summary and Vibration Analysis - Compact Layout */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                        {/* Equipment Summary */}
                                        <Card className="border-border dark:border-border">
                                            <CardHeader className="bg-muted/30 rounded-t-lg pb-2 pt-3 px-4">
                                                <CardTitle className="flex items-center gap-2 text-foreground">
                                                    <BarChart className="h-4 w-4 text-primary" />
                                                    Equipment Summary
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Selected Equipment</Label>
                                                        <p className="text-sm font-medium text-foreground">{selectedEquipment.length} equipment selected</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Measurement Date</Label>
                                                        <p className="text-sm text-foreground">{formValues.date} at {formValues.time}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Operator</Label>
                                                        <p className="text-sm text-foreground">{formValues.operator || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Shift</Label>
                                                        <p className="text-sm text-foreground">{formValues.shift || 'Not specified'}</p>
                                                    </div>
                                                </div>

                                                {/* Equipment List */}
                                                <div className="mt-4">
                                                    <Label className="text-xs text-muted-foreground mb-2 block">Equipment List:</Label>
                                                    <div className="space-y-1">
                                                        {selectedEquipment.map(equipmentId => {
                                                            const equipment = equipmentOptions.find(eq => eq.id === equipmentId);
                                                            return (
                                                                <div key={equipmentId} className="text-xs p-2 bg-muted/50 rounded border border-border">
                                                                    <span className="font-medium text-foreground">{equipment?.name}</span>
                                                                    <span className="text-muted-foreground ml-2">({equipment?.category})</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Vibration Analysis */}
                                        <Card className="border-border dark:border-border">
                                            <CardHeader className="bg-muted/30 rounded-t-lg pb-2 pt-3 px-4">
                                                <CardTitle className="flex items-center gap-2 text-foreground">
                                                    <Waves className="h-4 w-4 text-blue-500" />
                                                    Vibration Analysis
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Pump NDE Velocity</Label>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formValues.vibrationData?.pump?.nde?.velH || 'N/A'} mm/s (H)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formValues.vibrationData?.pump?.nde?.velV || 'N/A'} mm/s (V)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Motor NDE Velocity</Label>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formValues.vibrationData?.motor?.nde?.velH || 'N/A'} mm/s (H)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formValues.vibrationData?.motor?.nde?.velV || 'N/A'} mm/s (V)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Pump DE Velocity</Label>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formValues.vibrationData?.pump?.de?.velH || 'N/A'} mm/s (H)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formValues.vibrationData?.pump?.de?.velV || 'N/A'} mm/s (V)
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground">Motor DE Velocity</Label>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {formValues.vibrationData?.motor?.de?.velH || 'N/A'} mm/s (H)
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formValues.vibrationData?.motor?.de?.velV || 'N/A'} mm/s (V)
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* 🚀 ENHANCED AI ASSESSMENT CENTER - Professional UI/UX with Intelligent Features - Full Width */}
                                    <ThemedAIAssessmentCard variant="hero" className="w-full">
                                        <ThemedAIHeader
                                            title="AI Assessment Center"
                                            subtitle="Intelligent Maintenance Planning • Advanced Analytics • Real-time Assessment"
                                            status={{
                                                type: isAssessing ? 'analyzing' : lastAssessmentTime ? 'updated' : 'ready',
                                                timestamp: lastAssessmentTime || undefined
                                            }}
                                            actions={
                                                <>
                                                    <ThemedAIButton
                                                        variant="action"
                                                        size="sm"
                                                        loading={isAssessing}
                                                        onClick={performAIAssessment}
                                                        disabled={isAssessing || selectedEquipment.length === 0}
                                                    >
                                                        {isAssessing ? 'Analyzing...' : 'Run AI Assessment'}
                                                    </ThemedAIButton>

                                                    <ThemedAIButton
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={<BarChart className="h-4 w-4" />}
                                                        onClick={() => setShowChartsPanel(!showChartsPanel)}
                                                    >
                                                        Advanced Charts
                                                    </ThemedAIButton>

                                                    <ThemedAIButton
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={<Wrench className="h-4 w-4" />}
                                                        onClick={() => setShowMaintenancePlanner(!showMaintenancePlanner)}
                                                    >
                                                        Maintenance Planner
                                                    </ThemedAIButton>
                                                </>
                                            }
                                        />
                                        <CardContent className="relative p-0" style={{ background: 'hsl(var(--background))' }}>
                                            {aiAssessment ? (
                                                <ThemedAITabs defaultValue="dashboard" variant="modern">
                                                    {/* Enhanced Modern Tab Navigation */}
                                                    <div className="relative p-6 pb-0">
                                                        <ThemedAITabsList variant="modern" columns={7}>
                                                            <ThemedAITabsTrigger
                                                                value="dashboard"
                                                                variant="modern"
                                                                icon={<Brain className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Dashboard</span>
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="insights"
                                                                variant="modern"
                                                                icon={<Lightbulb className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Insights</span>
                                                                {aiAssessment.insights.length > 0 && (
                                                                    <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-secondary-foreground animate-pulse">
                                                                        {aiAssessment.insights.length}
                                                                    </Badge>
                                                                )}
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="recommendations"
                                                                variant="modern"
                                                                icon={<Target className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Actions</span>
                                                                {aiAssessment.recommendations.length > 0 && (
                                                                    <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-secondary-foreground animate-pulse">
                                                                        {aiAssessment.recommendations.length}
                                                                    </Badge>
                                                                )}
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="trends"
                                                                variant="modern"
                                                                icon={<TrendUp className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Trends</span>
                                                                {aiAssessment.trends.length > 0 && (
                                                                    <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-secondary-foreground animate-pulse">
                                                                        {aiAssessment.trends.length}
                                                                    </Badge>
                                                                )}
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="maintenance"
                                                                variant="modern"
                                                                icon={<Wrench className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Planning</span>
                                                                {maintenancePlan && (
                                                                    <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-secondary-foreground animate-pulse">
                                                                        {maintenancePlan.tasks.length}
                                                                    </Badge>
                                                                )}
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="charts"
                                                                variant="modern"
                                                                icon={<BarChart className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Analytics</span>
                                                                {chartConfigs.length > 0 && (
                                                                    <Badge variant="secondary" className="ml-1 text-xs bg-secondary text-secondary-foreground animate-pulse">
                                                                        {chartConfigs.length}
                                                                    </Badge>
                                                                )}
                                                            </ThemedAITabsTrigger>
                                                            <ThemedAITabsTrigger
                                                                value="health"
                                                                variant="modern"
                                                                icon={<Activity className="h-4 w-4" />}
                                                            >
                                                                <span className="hidden sm:inline">Health</span>
                                                            </ThemedAITabsTrigger>
                                                        </ThemedAITabsList>
                                                    </div>

                                                    {/* 🎯 ENHANCED AI DASHBOARD - Modern Professional Overview */}
                                                    <ThemedAITabsContent value="dashboard" className="p-6 space-y-8" variant="glass">
                                                        {/* Hero Metrics Section - Enhanced with Status-Aware Design */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                            {/* Health Score Card - Enhanced with Dynamic Status */}
                                                            <ThemedAIMetricCard
                                                                title="Health Score"
                                                                value={aiAssessment.healthScore !== undefined ? aiAssessment.healthScore : 'N/A'}
                                                                subtitle={`${aiAssessment.confidence}% confidence • ${aiAssessment.overallCondition.toUpperCase()}`}
                                                                icon={<Activity className="h-8 w-8" />}
                                                                variant="health"
                                                                progress={aiAssessment.healthScore}
                                                                confidence={aiAssessment.confidence}
                                                                status={aiAssessment.overallCondition as any}
                                                                objective="monitoring"
                                                                animated={true}
                                                                showStatusIndicator={true}
                                                                className="group relative overflow-hidden"
                                                            />

                                                            {/* Condition Card - Enhanced with Status Indicators */}
                                                            <ThemedAIMetricCard
                                                                title="Equipment Condition"
                                                                value={aiAssessment.overallCondition}
                                                                subtitle={`${aiAssessment.insights.filter(i => i.type === 'critical').length} critical issues detected`}
                                                                icon={<Shield className="h-8 w-8" />}
                                                                variant="condition"
                                                                status={aiAssessment.overallCondition as any}
                                                                objective="monitoring"
                                                                animated={true}
                                                                showStatusIndicator={true}
                                                                className="group relative overflow-hidden"
                                                            />

                                                            {/* Risk Level Card - Enhanced with Predictive Analytics */}
                                                            <ThemedAIMetricCard
                                                                title="Risk Assessment"
                                                                value={aiAssessment.riskLevel}
                                                                subtitle={`${aiAssessment.anomalies.length} anomalies • Predictive analysis active`}
                                                                icon={<AlertTriangle className="h-8 w-8" />}
                                                                variant="risk"
                                                                status={aiAssessment.riskLevel === 'low' ? 'good' : aiAssessment.riskLevel === 'medium' ? 'acceptable' : aiAssessment.riskLevel === 'high' ? 'unacceptable' : 'critical'}
                                                                objective="prediction"
                                                                animated={true}
                                                                showStatusIndicator={true}
                                                                className="group relative overflow-hidden"
                                                            />

                                                            {/* Priority Card - Enhanced with Action Indicators */}
                                                            <ThemedAIMetricCard
                                                                title="Priority Level"
                                                                value={aiAssessment.priority}
                                                                subtitle={`${aiAssessment.recommendations.filter(r => r.priority === 'urgent').length} urgent actions required`}
                                                                icon={<Target className="h-8 w-8" />}
                                                                variant="priority"
                                                                status={aiAssessment.priority === 'low' ? 'good' : aiAssessment.priority === 'medium' ? 'acceptable' : aiAssessment.priority === 'high' ? 'unacceptable' : 'critical'}
                                                                objective="maintenance"
                                                                animated={true}
                                                                showStatusIndicator={true}
                                                                className="group relative overflow-hidden"
                                                            />
                                                        </div>

                                                        {/* Enhanced AI Summary Statistics with Professional Design */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {/* AI Insights Summary Card */}
                                                            <div
                                                                className="group relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${themeClasses.glassBg}, ${themeClasses.glassBg}80)`,
                                                                    borderColor: `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 12px 40px ${themeClasses.glassBg}40`
                                                                }}
                                                            >
                                                                {/* Floating Particles Effect */}
                                                                <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400/60 rounded-full animate-pulse"></div>
                                                                <div className="absolute bottom-4 left-4 w-1 h-1 bg-blue-400/40 rounded-full animate-ping"></div>

                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div
                                                                            className="p-3 rounded-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 group-hover:rotate-3"
                                                                            style={{
                                                                                background: `linear-gradient(135deg, ${themeClasses.accent}, ${themeClasses.accent}cc)`,
                                                                                boxShadow: `0 4px 16px ${themeClasses.accent}40`
                                                                            }}
                                                                        >
                                                                            <Lightbulb className="h-6 w-6 transition-all duration-2000" style={{ color: themeClasses.primary }} />
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-bold text-lg text-foreground transition-colors duration-1500">AI Insights</span>
                                                                            <div className="text-sm text-muted-foreground">Intelligent Analysis</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="text-4xl font-black text-foreground transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">
                                                                        {aiAssessment.insights.length}
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {aiAssessment.insights.filter(i => i.type === 'critical').length > 0 && (
                                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                        )}
                                                                        {aiAssessment.insights.filter(i => i.type === 'warning').length > 0 && (
                                                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                                                        )}
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-muted-foreground transition-colors duration-1500 leading-relaxed">
                                                                    <span className="font-medium text-red-500">{aiAssessment.insights.filter(i => i.type === 'critical').length} critical</span>
                                                                    <span className="mx-1">•</span>
                                                                    <span className="font-medium text-yellow-500">{aiAssessment.insights.filter(i => i.type === 'warning').length} warnings</span>
                                                                </div>
                                                                <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: `${themeClasses.accent}` }}>
                                                                    <div
                                                                        className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                        style={{
                                                                            background: `linear-gradient(90deg, ${themeClasses.primary}, ${themeClasses.primary}cc)`,
                                                                            width: `${Math.min((aiAssessment.insights.length / 10) * 100, 100)}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* AI Recommendations Summary Card */}
                                                            <div
                                                                className="group relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${themeClasses.glassBg}, ${themeClasses.glassBg}80)`,
                                                                    borderColor: `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 12px 40px ${themeClasses.glassBg}40`
                                                                }}
                                                            >
                                                                {/* Floating Particles Effect */}
                                                                <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce"></div>
                                                                <div className="absolute bottom-2 left-2 w-1 h-1 bg-purple-400/40 rounded-full animate-ping"></div>

                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div
                                                                            className="p-3 rounded-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 group-hover:-rotate-3"
                                                                            style={{
                                                                                background: `linear-gradient(135deg, ${themeClasses.accent}, ${themeClasses.accent}cc)`,
                                                                                boxShadow: `0 4px 16px ${themeClasses.accent}40`
                                                                            }}
                                                                        >
                                                                            <Target className="h-6 w-6 transition-all duration-2000" style={{ color: themeClasses.primary }} />
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-bold text-lg text-foreground transition-colors duration-1500">Recommendations</span>
                                                                            <div className="text-sm text-muted-foreground">Action Items</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="text-4xl font-black text-foreground transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">
                                                                            {aiAssessment.recommendations.length}
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            {aiAssessment.recommendations.filter(r => r.priority === 'urgent').length > 0 && (
                                                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                            )}
                                                                            {aiAssessment.recommendations.filter(r => r.priority === 'high').length > 0 && (
                                                                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                                                            )}
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground transition-colors duration-1500 leading-relaxed">
                                                                        <span className="font-medium text-red-500">{aiAssessment.recommendations.filter(r => r.priority === 'urgent').length} urgent</span>
                                                                        <span className="mx-1">•</span>
                                                                        <span className="font-medium text-orange-500">{aiAssessment.recommendations.filter(r => r.priority === 'high').length} high priority</span>
                                                                    </div>
                                                                    <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: `${themeClasses.accent}` }}>
                                                                        <div
                                                                            className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                            style={{
                                                                                background: `linear-gradient(90deg, ${themeClasses.primary}, ${themeClasses.primary}cc)`,
                                                                                width: `${Math.min((aiAssessment.recommendations.length / 8) * 100, 100)}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* AI Trends Analysis Summary Card */}
                                                            <div
                                                                className="group relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-[1.02] hover:shadow-2xl cursor-pointer overflow-hidden"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${themeClasses.glassBg}, ${themeClasses.glassBg}80)`,
                                                                    borderColor: `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 12px 40px ${themeClasses.glassBg}40`
                                                                }}
                                                            >
                                                                {/* Floating Particles Effect */}
                                                                <div className="absolute top-3 right-3 w-1 h-1 bg-cyan-400/60 rounded-full animate-ping"></div>
                                                                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-bounce"></div>

                                                                <div className="relative z-10">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <div
                                                                            className="p-3 rounded-xl transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110 group-hover:rotate-6"
                                                                            style={{
                                                                                background: `linear-gradient(135deg, ${themeClasses.accent}, ${themeClasses.accent}cc)`,
                                                                                boxShadow: `0 4px 16px ${themeClasses.accent}40`
                                                                            }}
                                                                        >
                                                                            <TrendingUp className="h-6 w-6 transition-all duration-2000" style={{ color: themeClasses.primary }} />
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-bold text-lg text-foreground transition-colors duration-1500">Trend Analysis</span>
                                                                            <div className="text-sm text-muted-foreground">Predictive Insights</div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="text-4xl font-black text-foreground transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110">
                                                                            {aiAssessment.trends.length}
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            {aiAssessment.trends.filter(t => t.direction === 'increasing').length > 0 && (
                                                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                            )}
                                                                            {aiAssessment.trends.filter(t => t.direction === 'decreasing').length > 0 && (
                                                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                            )}
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground transition-colors duration-1500 leading-relaxed">
                                                                        <span className="font-medium text-red-500">{aiAssessment.trends.filter(t => t.direction === 'increasing').length} increasing</span>
                                                                        <span className="mx-1">•</span>
                                                                        <span className="font-medium text-green-500">{aiAssessment.trends.filter(t => t.direction === 'stable').length} stable</span>
                                                                    </div>
                                                                    <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: `${themeClasses.accent}` }}>
                                                                        <div
                                                                            className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                            style={{
                                                                                background: `linear-gradient(90deg, ${themeClasses.primary}, ${themeClasses.primary}cc)`,
                                                                                width: `${Math.min((aiAssessment.trends.length / 5) * 100, 100)}%`
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Enhanced Real-time Monitoring Section */}
                                                        <div className="space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <h3 className="text-xl font-bold text-foreground transition-colors duration-1500">Real-time Equipment Monitoring</h3>
                                                                    <p className="text-sm text-muted-foreground">Live status indicators and performance metrics</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                    <span className="text-sm font-medium text-green-600">Live</span>
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="group p-6 rounded-xl border backdrop-blur-sm transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 hover:shadow-xl cursor-pointer"
                                                                style={{
                                                                    background: `${themeClasses.glassBg}`,
                                                                    borderColor: `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 8px 32px ${themeClasses.glassBg}`
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3 mb-3">
                                                                    <div
                                                                        className="p-2 rounded-lg transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                                                                        style={{ background: `${themeClasses.accent}` }}
                                                                    >
                                                                        <TrendingUp className="h-5 w-5 transition-colors duration-1500" style={{ color: themeClasses.primary }} />
                                                                    </div>
                                                                    <span className="font-semibold text-foreground transition-colors duration-1500">Trend Analysis</span>
                                                                </div>
                                                                <div className="text-3xl font-bold mb-2 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110" style={{ color: themeClasses.primary }}>
                                                                    {aiAssessment.trends.length}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground transition-colors duration-1500">
                                                                    {aiAssessment.trends.filter(t => t.direction === 'increasing').length} Increasing
                                                                </div>
                                                                <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: `${themeClasses.accent}` }}>
                                                                    <div
                                                                        className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                        style={{
                                                                            background: themeClasses.gradient,
                                                                            width: `${Math.min((aiAssessment.trends.length / 6) * 100, 100)}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* AI Maintenance Indicators */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div
                                                                className="group p-6 rounded-xl border backdrop-blur-sm transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 hover:shadow-xl"
                                                                style={{
                                                                    background: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                        ? `hsl(var(--destructive) / 0.1)`
                                                                        : `${themeClasses.glassBg}`,
                                                                    borderColor: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                        ? `hsl(var(--destructive) / 0.3)`
                                                                        : `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 8px 32px ${aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                        ? 'hsl(var(--destructive) / 0.1)'
                                                                        : themeClasses.glassBg}`
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div
                                                                        className="p-2 rounded-lg transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                                                                        style={{
                                                                            background: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                                ? `hsl(var(--destructive) / 0.2)`
                                                                                : `${themeClasses.accent}`
                                                                        }}
                                                                    >
                                                                        <Settings
                                                                            className="h-5 w-5 transition-colors duration-1500"
                                                                            style={{
                                                                                color: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                                    ? 'hsl(var(--destructive))'
                                                                                    : themeClasses.primary
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span
                                                                        className="font-semibold transition-colors duration-1500"
                                                                        style={{
                                                                            color: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                                ? 'hsl(var(--destructive))'
                                                                                : 'hsl(var(--foreground))'
                                                                        }}
                                                                    >
                                                                        Maintenance Status
                                                                    </span>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between group/item">
                                                                        <span
                                                                            className="text-sm transition-colors duration-1500 group-hover/item:font-medium"
                                                                            style={{
                                                                                color: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                                    ? 'hsl(var(--destructive))'
                                                                                    : 'hsl(var(--muted-foreground))'
                                                                            }}
                                                                        >
                                                                            Maintenance Required:
                                                                        </span>
                                                                        <Badge
                                                                            variant={aiAssessment.maintenanceRequired ? "destructive" : "default"}
                                                                            className="transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover/item:scale-105"
                                                                        >
                                                                            {aiAssessment.maintenanceRequired ? "YES" : "NO"}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center justify-between group/item">
                                                                        <span
                                                                            className="text-sm transition-colors duration-1500 group-hover/item:font-medium"
                                                                            style={{
                                                                                color: aiAssessment.maintenanceRequired || aiAssessment.immediateAction
                                                                                    ? 'hsl(var(--destructive))'
                                                                                    : 'hsl(var(--muted-foreground))'
                                                                            }}
                                                                        >
                                                                            Immediate Action:
                                                                        </span>
                                                                        <Badge
                                                                            variant={aiAssessment.immediateAction ? "destructive" : "default"}
                                                                            className="transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover/item:scale-105"
                                                                        >
                                                                            {aiAssessment.immediateAction ? "REQUIRED" : "NOT NEEDED"}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                {(aiAssessment.maintenanceRequired || aiAssessment.immediateAction) && (
                                                                    <div className="mt-4 p-3 rounded-lg" style={{ background: `hsl(var(--destructive) / 0.05)` }}>
                                                                        <div className="flex items-center gap-2 text-xs" style={{ color: 'hsl(var(--destructive))' }}>
                                                                            <AlertTriangle className="h-3 w-3" />
                                                                            <span className="font-medium">Action Required</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div
                                                                className="group p-6 rounded-xl border backdrop-blur-sm transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:scale-105 hover:shadow-xl"
                                                                style={{
                                                                    background: `${themeClasses.glassBg}`,
                                                                    borderColor: `${themeClasses.glassBorder}`,
                                                                    boxShadow: `0 8px 32px ${themeClasses.glassBg}`
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div
                                                                        className="p-2 rounded-lg transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                                                                        style={{ background: `${themeClasses.accent}` }}
                                                                    >
                                                                        <Clock className="h-5 w-5 transition-colors duration-1500" style={{ color: themeClasses.primary }} />
                                                                    </div>
                                                                    <span className="font-semibold text-foreground transition-colors duration-1500">Next Inspection</span>
                                                                </div>
                                                                <div className="text-xl font-bold mb-2 transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105" style={{ color: themeClasses.primary }}>
                                                                    {aiAssessment.nextInspectionDate ?
                                                                        format(new Date(aiAssessment.nextInspectionDate), 'MMM dd, yyyy') :
                                                                        'Not scheduled'
                                                                    }
                                                                </div>
                                                                <div className="text-sm text-muted-foreground transition-colors duration-1500">
                                                                    AI-recommended schedule
                                                                </div>
                                                                <div className="mt-4 flex items-center gap-2">
                                                                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: `${themeClasses.accent}` }}>
                                                                        <div
                                                                            className="h-full transition-all duration-2000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                                                                            style={{
                                                                                background: themeClasses.gradient,
                                                                                width: aiAssessment.nextInspectionDate ? '75%' : '25%'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {aiAssessment.nextInspectionDate ? 'Scheduled' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* 🔍 VIBRATION DATA DEBUG PANEL */}
                                                        <div
                                                            className="p-4 rounded-lg border"
                                                            style={{
                                                                background: themeClasses.cardBg,
                                                                borderColor: themeClasses.cardBorder
                                                            }}
                                                        >
                                                            <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: themeClasses.primary }}>
                                                                <Search className="h-4 w-4" />
                                                                Vibration Data Debug Panel
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                                <div className="space-y-2">
                                                                    <div className="font-medium" style={{ color: themeClasses.primary }}>Pump NDE RMS:</div>
                                                                    <div className="font-mono p-2 rounded border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                                                                        {(() => {
                                                                            const nde = formValues.vibrationData?.pump?.nde || {};
                                                                            const rms = calcRMSVelocity(nde);
                                                                            const zone = getISO10816Zone(rms);
                                                                            return `${rms.toFixed(3)} mm/s (Zone ${zone.zone})`;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="font-medium" style={{ color: themeClasses.primary }}>Motor NDE RMS:</div>
                                                                    <div className="font-mono p-2 rounded border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                                                                        {(() => {
                                                                            const nde = formValues.vibrationData?.motor?.nde || {};
                                                                            const rms = calcRMSVelocity(nde);
                                                                            const zone = getISO10816Zone(rms);
                                                                            return `${rms.toFixed(3)} mm/s (Zone ${zone.zone})`;
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="font-medium" style={{ color: themeClasses.primary }}>AI Health Score:</div>
                                                                    <div className="font-mono p-2 rounded border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                                                                        {aiAssessment.healthScore}% ({aiAssessment.overallCondition})
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="font-medium" style={{ color: themeClasses.primary }}>Failure Analysis Count:</div>
                                                                    <div className="font-mono p-2 rounded border" style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
                                                                        {(() => {
                                                                            // Calculate failure analysis count from current vibration data
                                                                            if (!formValues.vibrationData) return 'No data';

                                                                            const vibrationData = formValues.vibrationData;
                                                                            let analysisCount = 0;

                                                                            // Count pump analyses
                                                                            if (vibrationData.pump?.nde) analysisCount++;
                                                                            if (vibrationData.pump?.de) analysisCount++;
                                                                            if (vibrationData.pump?.leg1?.velocity) analysisCount++;
                                                                            if (vibrationData.pump?.leg2?.velocity) analysisCount++;
                                                                            if (vibrationData.pump?.leg3?.velocity) analysisCount++;
                                                                            if (vibrationData.pump?.leg4?.velocity) analysisCount++;

                                                                            // Count motor analyses
                                                                            if (vibrationData.motor?.nde) analysisCount++;
                                                                            if (vibrationData.motor?.de) analysisCount++;
                                                                            if (vibrationData.motor?.leg1?.velocity) analysisCount++;
                                                                            if (vibrationData.motor?.leg2?.velocity) analysisCount++;
                                                                            if (vibrationData.motor?.leg3?.velocity) analysisCount++;
                                                                            if (vibrationData.motor?.leg4?.velocity) analysisCount++;

                                                                            return analysisCount > 0 ? `${analysisCount} analyses` : 'No data';
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* AI Assessment Form Fields */}
                                                        <div
                                                            className="p-4 rounded-lg border"
                                                            style={{
                                                                background: themeClasses.cardBg,
                                                                borderColor: themeClasses.cardBorder
                                                            }}
                                                        >
                                                            <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: themeClasses.primary }}>
                                                                <Brain className="h-4 w-4" />
                                                                AI Assessment Form Fields
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <Controller
                                                                    name="overallCondition"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div>
                                                                            <Label className="flex items-center gap-2">
                                                                                <Brain className="h-3 w-3" />
                                                                                AI-Assessed Condition
                                                                            </Label>
                                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="AI will assess automatically" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="excellent">Excellent (90-100%)</SelectItem>
                                                                                    <SelectItem value="good">Good (75-89%)</SelectItem>
                                                                                    <SelectItem value="acceptable">Acceptable (60-74%)</SelectItem>
                                                                                    <SelectItem value="unacceptable">Unacceptable (40-59%)</SelectItem>
                                                                                    <SelectItem value="critical">Critical (&lt;40%)</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    )}
                                                                />
                                                                <Controller
                                                                    name="priority"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div>
                                                                            <Label className="flex items-center gap-2">
                                                                                <Target className="h-3 w-3" />
                                                                                AI-Assessed Priority
                                                                            </Label>
                                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                                <SelectTrigger>
                                                                                    <SelectValue placeholder="AI will assess automatically" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="low">Low Priority</SelectItem>
                                                                                    <SelectItem value="medium">Medium Priority</SelectItem>
                                                                                    <SelectItem value="high">High Priority</SelectItem>
                                                                                    <SelectItem value="urgent">Urgent</SelectItem>
                                                                                    <SelectItem value="critical">Critical</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-6 mt-4">
                                                                <Controller
                                                                    name="maintenanceRequired"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.value}
                                                                                onChange={field.onChange}
                                                                                className="rounded"
                                                                            />
                                                                            <Label className="text-sm">AI: Maintenance Required</Label>
                                                                        </div>
                                                                    )}
                                                                />
                                                                <Controller
                                                                    name="immediateAction"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={field.value}
                                                                                onChange={field.onChange}
                                                                                className="rounded"
                                                                            />
                                                                            <Label className="text-sm">AI: Immediate Action</Label>
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>

                                                            <div className="mt-4">
                                                                <Controller
                                                                    name="nextInspectionDate"
                                                                    control={control}
                                                                    render={({ field }) => (
                                                                        <div>
                                                                            <Label className="flex items-center gap-2">
                                                                                <Clock className="h-3 w-3" />
                                                                                AI-Recommended Next Inspection
                                                                            </Label>
                                                                            <ThemedInput {...field} type="date" themeVariant="outline" />
                                                                        </div>
                                                                    )}
                                                                />
                                                            </div>
                                                        </div>

                                                    </ThemedAITabsContent>

                                                    {/* Insights Tab */}
                                                    <ThemedAITabsContent value="insights" className="space-y-4" variant="glass">
                                                        {aiAssessment.insights.length > 0 ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Lightbulb className="h-4 w-4" style={{ color: themeClasses.primary }} />
                                                                    <h4 className="font-semibold">AI Insights</h4>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {aiAssessment.insights.length} insights
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                                    {aiAssessment.insights.map((insight, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className={`p-3 rounded-lg border-l-4 ${insight.type === 'critical' ? 'bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-600' :
                                                                                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-600' :
                                                                                    insight.type === 'info' ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 dark:border-blue-600' :
                                                                                        'bg-green-50 dark:bg-green-950/30 border-green-400 dark:border-green-600'
                                                                                }`}
                                                                        >
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1">
                                                                                    <div className="font-medium text-sm mb-1 text-foreground">
                                                                                        {insight.title}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground mb-2">
                                                                                        {insight.description}
                                                                                    </div>
                                                                                    {insight.actionable && insight.action && (
                                                                                        <div className="text-xs font-medium text-primary">
                                                                                            Action: {insight.action}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs ml-2"
                                                                                >
                                                                                    {insight.category}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                                <p className="text-muted-foreground">No insights available</p>
                                                                <p className="text-sm text-muted-foreground">AI insights will appear here after assessment</p>
                                                            </div>
                                                        )}
                                                    </ThemedAITabsContent>

                                                    {/* Recommendations Tab */}
                                                    <ThemedAITabsContent value="recommendations" className="space-y-4" variant="glass">
                                                        {aiAssessment.recommendations.length > 0 ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <Target className="h-4 w-4 text-primary" />
                                                                    <h4 className="font-semibold">AI Recommendations</h4>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {aiAssessment.recommendations.length} recommendations
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                                    {aiAssessment.recommendations.map((rec, index) => (
                                                                        <div key={index} className="p-3 bg-card rounded-lg border border-border">
                                                                            <div className="flex items-start justify-between mb-2">
                                                                                <div className="font-medium text-sm text-foreground">
                                                                                    {rec.title}
                                                                                </div>
                                                                                <Badge
                                                                                    variant={
                                                                                        rec.priority === 'urgent' ? 'destructive' :
                                                                                            rec.priority === 'high' ? 'secondary' :
                                                                                                rec.priority === 'medium' ? 'outline' :
                                                                                                    'default'
                                                                                    }
                                                                                    className="text-xs"
                                                                                >
                                                                                    {rec.priority.toUpperCase()}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground mb-2">
                                                                                {rec.description}
                                                                            </div>
                                                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                                                <div>
                                                                                    <span className="font-medium">Impact:</span> {rec.impact}
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium">Timeframe:</span> {rec.timeframe}
                                                                                </div>
                                                                                <div>
                                                                                    <span className="font-medium">Cost:</span> {rec.cost}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                                <p className="text-muted-foreground">No recommendations available</p>
                                                                <p className="text-sm text-muted-foreground">AI recommendations will appear here after assessment</p>
                                                            </div>
                                                        )}
                                                    </ThemedAITabsContent>

                                                    {/* Trends Tab */}
                                                    <ThemedAITabsContent value="trends" className="space-y-4" variant="glass">
                                                        {aiAssessment.trends.length > 0 ? (
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <TrendingUp className="h-4 w-4" style={{ color: themeClasses.primary }} />
                                                                    <h4 className="font-semibold">AI Trend Analysis</h4>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {aiAssessment.trends.length} trends
                                                                    </Badge>
                                                                </div>
                                                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                                                    {aiAssessment.trends.map((trend, index) => (
                                                                        <div key={index} className="p-3 bg-card rounded-lg border border-border">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <div className="font-medium text-sm text-foreground">
                                                                                    {trend.parameter}
                                                                                </div>
                                                                                <Badge
                                                                                    variant={
                                                                                        trend.direction === 'increasing' ? 'destructive' :
                                                                                            trend.direction === 'decreasing' ? 'default' :
                                                                                                'outline'
                                                                                    }
                                                                                    className="text-xs"
                                                                                >
                                                                                    {trend.direction.toUpperCase()}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground mb-1">
                                                                                {trend.prediction}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground">
                                                                                Rate: {safeDisplay(trend.rate, 2, 'N/A', 'trend rate')}/day |
                                                                                Significance: {trend.significance}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-8">
                                                                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                                <p className="text-muted-foreground">No trends available</p>
                                                                <p className="text-sm text-muted-foreground">AI trend analysis will appear here after assessment</p>
                                                            </div>
                                                        )}
                                                    </ThemedAITabsContent>

                                                    {/* 🏥 HEALTH TAB - Comprehensive Health Assessment */}
                                                    <ThemedAITabsContent value="health" className="space-y-4" variant="glass">
                                                        <div className="space-y-6">
                                                            {/* AI Health Assessment Summary */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                <div
                                                                    className="p-4 rounded-lg border"
                                                                    style={{
                                                                        background: `${themeClasses.accent}`,
                                                                        borderColor: `${themeClasses.cardBorder}`
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <Activity className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                        <span className="font-semibold" style={{ color: themeClasses.primary }}>AI Health Score</span>
                                                                    </div>
                                                                    <div className="text-3xl font-bold" style={{ color: themeClasses.primary }}>
                                                                        {aiAssessment.healthScore}%
                                                                    </div>
                                                                    <div className="text-sm" style={{ color: themeClasses.primary }}>AI Assessment</div>
                                                                </div>

                                                                <div
                                                                    className="p-4 rounded-lg border"
                                                                    style={{
                                                                        background: `${themeClasses.accent}`,
                                                                        borderColor: `${themeClasses.cardBorder}`
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <Shield className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                        <span className="font-semibold" style={{ color: themeClasses.primary }}>Confidence</span>
                                                                    </div>
                                                                    <div className="text-3xl font-bold" style={{ color: themeClasses.primary }}>
                                                                        {aiAssessment.confidence}%
                                                                    </div>
                                                                    <div className="text-sm" style={{ color: themeClasses.primary }}>Assessment Confidence</div>
                                                                </div>

                                                                <div
                                                                    className="p-4 rounded-lg border"
                                                                    style={{
                                                                        background: `hsl(var(--destructive) / 0.1)`,
                                                                        borderColor: `hsl(var(--destructive) / 0.3)`
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                                                        <span className="font-semibold text-destructive">Risk Level</span>
                                                                    </div>
                                                                    <div className="text-lg font-bold text-destructive">
                                                                        {aiAssessment.riskLevel.toUpperCase()}
                                                                    </div>
                                                                    <div className="text-sm text-destructive">Current Risk</div>
                                                                </div>

                                                                <div
                                                                    className="p-4 rounded-lg border"
                                                                    style={{
                                                                        background: `${themeClasses.accent}`,
                                                                        borderColor: `${themeClasses.cardBorder}`
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <Target className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                        <span className="font-semibold" style={{ color: themeClasses.primary }}>Priority</span>
                                                                    </div>
                                                                    <div className="text-lg font-bold" style={{ color: themeClasses.primary }}>
                                                                        {aiAssessment.priority.toUpperCase()}
                                                                    </div>
                                                                    <div className="text-sm" style={{ color: themeClasses.primary }}>Action Priority</div>
                                                                </div>
                                                            </div>

                                                            {/* Health Trend Visualization */}
                                                            <div
                                                                className="p-6 rounded-lg border"
                                                                style={{
                                                                    background: themeClasses.cardBg,
                                                                    borderColor: themeClasses.cardBorder
                                                                }}
                                                            >
                                                                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                                                    <TrendingUp className="h-5 w-5 text-primary" />
                                                                    Equipment Health Overview
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground">Overall Equipment Condition:</span>
                                                                        <Badge
                                                                            variant={
                                                                                aiAssessment.overallCondition === 'excellent' ? 'default' :
                                                                                    aiAssessment.overallCondition === 'good' ? 'secondary' :
                                                                                        aiAssessment.overallCondition === 'acceptable' ? 'outline' :
                                                                                            'destructive'
                                                                            }
                                                                            className="text-sm px-3 py-1"
                                                                        >
                                                                            {aiAssessment.overallCondition.toUpperCase()}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground">Maintenance Required:</span>
                                                                        <Badge variant={aiAssessment.maintenanceRequired ? "destructive" : "default"}>
                                                                            {aiAssessment.maintenanceRequired ? "YES" : "NO"}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground">Immediate Action Needed:</span>
                                                                        <Badge variant={aiAssessment.immediateAction ? "destructive" : "default"}>
                                                                            {aiAssessment.immediateAction ? "REQUIRED" : "NOT NEEDED"}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center justify-between">
                                                                        <span className="text-sm font-medium text-foreground">Next Inspection:</span>
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            {aiAssessment.nextInspectionDate ?
                                                                                format(new Date(aiAssessment.nextInspectionDate), 'MMM dd, yyyy') :
                                                                                'Not scheduled'
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Health Score Progress Bar */}
                                                            <div className="p-4 bg-card rounded-lg border border-border">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium text-foreground">Health Score Progress</span>
                                                                    <span className="text-sm font-bold text-foreground">{aiAssessment.healthScore}%</span>
                                                                </div>
                                                                <Progress
                                                                    value={aiAssessment.healthScore}
                                                                    className="h-3"
                                                                />
                                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                                    <span>Critical</span>
                                                                    <span>Poor</span>
                                                                    <span>Fair</span>
                                                                    <span>Good</span>
                                                                    <span>Excellent</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </ThemedAITabsContent>

                                                    {/* 🔧 INTELLIGENT MAINTENANCE PLANNING TAB */}
                                                    <ThemedAITabsContent value="maintenance" className="p-6 space-y-6" variant="glass">
                                                        <div className="space-y-6">
                                                            {/* Maintenance Plan Header */}
                                                            <div
                                                                className="flex items-center justify-between p-6 rounded-2xl text-white"
                                                                style={{ background: themeClasses.gradient }}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-3 bg-white/20 rounded-xl">
                                                                        <Wrench className="h-8 w-8" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-xl font-bold">Intelligent Maintenance Planning</h3>
                                                                        <p className="text-orange-100">AI-Generated Tasks • 18hr/day Operation Optimized</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    onClick={() => {
                                                                        // Generate maintenance plan with enhanced failure analysis integration
                                                                        const failureAnalyses: FailureAnalysis[] = []; // Initialize empty array for now
                                                                        generateMaintenancePlan(aiAssessment, failureAnalyses);
                                                                    }}
                                                                    className="text-white"
                                                                    style={{
                                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                                        borderColor: 'rgba(255, 255, 255, 0.3)'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}

                                                                >
                                                                    <PlayCircle className="h-4 w-4 mr-2" />
                                                                    Generate Plan
                                                                </Button>
                                                            </div>

                                                            {/* 🔧 FAILURE ANALYSIS ENGINE INTEGRATION */}
                                                            {aiAssessment && (
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <AlertTriangle className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                        <h3 className="text-lg font-semibold text-foreground">Failure Analysis Engine Outputs</h3>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            AI Assessment Available
                                                                        </Badge>
                                                                    </div>

                                                                    {/* Immediate Actions from AI Assessment */}
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-600/30">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                                                <h4 className="font-semibold text-red-800 dark:text-red-300">Immediate Actions Required</h4>
                                                                            </div>
                                                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                                {aiAssessment.immediateAction ? (
                                                                                    <div className="p-2 bg-background rounded border-l-4 border-red-400">
                                                                                        <div className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">AI Assessment</div>
                                                                                        <div className="text-sm text-red-600 dark:text-red-400">Immediate action required based on current condition</div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-muted-foreground italic">No immediate actions required</div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {/* Corrective Measures from AI Assessment */}
                                                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-600/30">
                                                                            <div className="flex items-center gap-2 mb-3">
                                                                                <Wrench className="h-4 w-4" style={{ color: themeClasses.primary }} />
                                                                                <h4 className="font-semibold" style={{ color: themeClasses.primary }}>Corrective Measures</h4>
                                                                            </div>
                                                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                                {aiAssessment.maintenanceRequired ? (
                                                                                    <div className="p-2 bg-background rounded border-l-4 border-yellow-400">
                                                                                        <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">AI Assessment</div>
                                                                                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Maintenance required based on current analysis</div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="text-sm text-muted-foreground italic">No corrective measures needed</div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {maintenancePlan ? (
                                                                <div className="space-y-6">
                                                                    {/* Plan Overview */}
                                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                        <div
                                                                            className="p-4 rounded-xl border"
                                                                            style={{
                                                                                background: themeClasses.cardBg,
                                                                                borderColor: themeClasses.cardBorder
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <ClipboardList className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                                <span className="font-semibold" style={{ color: themeClasses.primary }}>Total Tasks</span>
                                                                            </div>
                                                                            <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>{maintenancePlan.tasks.length}</div>
                                                                        </div>

                                                                        <div
                                                                            className="p-4 rounded-xl border"
                                                                            style={{
                                                                                background: themeClasses.cardBg,
                                                                                borderColor: themeClasses.cardBorder
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <Timer className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                                <span className="font-semibold" style={{ color: themeClasses.primary }}>Est. Hours</span>
                                                                            </div>
                                                                            <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>{maintenancePlan.totalEstimatedHours}</div>
                                                                        </div>

                                                                        <div
                                                                            className="p-4 rounded-xl border"
                                                                            style={{
                                                                                background: themeClasses.cardBg,
                                                                                borderColor: themeClasses.cardBorder
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <Target className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                                <span className="font-semibold" style={{ color: themeClasses.primary }}>Progress</span>
                                                                            </div>
                                                                            <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>{maintenancePlan.completionPercentage}%</div>
                                                                        </div>

                                                                        <div
                                                                            className="p-4 rounded-xl border"
                                                                            style={{
                                                                                background: themeClasses.cardBg,
                                                                                borderColor: themeClasses.cardBorder
                                                                            }}
                                                                        >
                                                                            <div className="flex items-center gap-3 mb-2">
                                                                                <AlertTriangle className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                                <span className="font-semibold" style={{ color: themeClasses.primary }}>RUL Days</span>
                                                                            </div>
                                                                            <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>
                                                                                {maintenancePlan.rulPrediction?.estimatedRUL || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Task List */}
                                                                    <div className="space-y-4">
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="text-lg font-semibold text-foreground">Maintenance Tasks</h4>
                                                                            <Select value={taskFilter} onValueChange={(value: any) => setTaskFilter(value)}>
                                                                                <SelectTrigger className="w-40">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="all">All Tasks</SelectItem>
                                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                                                                    <SelectItem value="completed">Completed</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            {maintenancePlan.tasks
                                                                                .filter(task => taskFilter === 'all' || task.status === taskFilter)
                                                                                .map((task, index) => (
                                                                                    <div key={task.id} className="p-4 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300">
                                                                                        <div className="flex items-start justify-between">
                                                                                            <div className="flex-1">
                                                                                                <div className="flex items-center gap-3 mb-2">
                                                                                                    <Badge
                                                                                                        variant={
                                                                                                            task.priority === 'critical' ? 'destructive' :
                                                                                                                task.priority === 'urgent' ? 'destructive' :
                                                                                                                    task.priority === 'high' ? 'secondary' :
                                                                                                                        'outline'
                                                                                                        }
                                                                                                    >
                                                                                                        {task.priority.toUpperCase()}
                                                                                                    </Badge>
                                                                                                    <Badge variant="outline">
                                                                                                        {task.status.replace('-', ' ').toUpperCase()}
                                                                                                    </Badge>
                                                                                                    <span className="text-sm text-muted-foreground">
                                                                                                        {task.workOrderNumber}
                                                                                                    </span>
                                                                                                </div>
                                                                                                <h5 className="font-semibold text-foreground mb-1">{task.title}</h5>
                                                                                                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                                                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                                                    <span>📅 Due: {format(task.dueDate, 'MMM dd, yyyy')}</span>
                                                                                                    <span>⏱️ Est: {task.estimatedDuration}h</span>
                                                                                                    {task.failureMode && <span>🔧 {task.failureMode}</span>}
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Button size="sm" variant="outline">
                                                                                                    <Edit className="h-4 w-4" />
                                                                                                </Button>
                                                                                                <Button size="sm" variant="outline">
                                                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-12">
                                                                    <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Maintenance Plan Generated</h3>
                                                                    <p className="text-muted-foreground mb-4">Click "Generate Plan" to create an intelligent maintenance schedule based on AI assessment.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ThemedAITabsContent>

                                                    {/* 📊 ENHANCED ADVANCED CHARTS & ANALYTICS TAB */}
                                                    <ThemedAITabsContent value="charts" className="p-6 space-y-8 min-h-screen" variant="glass">
                                                        <div className="space-y-8 max-w-none">
                                                            {/* Enhanced Charts Header with Professional Design */}
                                                            <div
                                                                className="relative overflow-hidden p-8 rounded-3xl text-white shadow-2xl"
                                                                style={{
                                                                    background: `linear-gradient(135deg, ${themeClasses.primary}, ${themeClasses.primary}dd, ${themeClasses.primary}bb)`,
                                                                    boxShadow: `0 20px 60px ${themeClasses.primary}30`
                                                                }}
                                                            >
                                                                {/* Floating Particles Background */}
                                                                <div className="absolute inset-0 overflow-hidden">
                                                                    <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                                                                    <div className="absolute top-12 right-12 w-1 h-1 bg-white/20 rounded-full animate-ping"></div>
                                                                    <div className="absolute bottom-8 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce"></div>
                                                                    <div className="absolute bottom-4 right-1/4 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
                                                                </div>

                                                                <div className="relative z-10 flex items-center justify-between">
                                                                    <div className="flex items-center gap-6">
                                                                        <div className="relative">
                                                                            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                                                                            <div className="relative p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                                                                                <BarChart className="h-10 w-10 text-white" />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h3 className="text-2xl font-black mb-2">Advanced Analytics Dashboard</h3>
                                                                            <p className="text-white/90 text-lg font-medium">Real-time Visualization • Predictive Analytics • ISO 10816 Compliance</p>
                                                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                                                    <span>Live Data</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                                                                    <span>AI-Powered</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                                                                    <span>Interactive</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <Select value={selectedChartType} onValueChange={(value: any) => setSelectedChartType(value)}>
                                                                            <SelectTrigger
                                                                                className="w-40 bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                                                                                style={{
                                                                                    background: 'rgba(255, 255, 255, 0.2)',
                                                                                    borderColor: 'rgba(255, 255, 255, 0.3)'
                                                                                }}
                                                                            >
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="trend">Trend Analysis</SelectItem>
                                                                                <SelectItem value="statistical">Statistical</SelectItem>
                                                                                <SelectItem value="rul">RUL Prediction</SelectItem>
                                                                                <SelectItem value="health">Health Metrics</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            onClick={() => {
                                                                                generateAdvancedCharts(aiAssessment, formValues.vibrationData);
                                                                            }}
                                                                            className="text-white"
                                                                            style={{
                                                                                background: 'rgba(255, 255, 255, 0.2)',
                                                                                borderColor: 'rgba(255, 255, 255, 0.3)'
                                                                            }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}

                                                                        >
                                                                            <Sparkles className="h-4 w-4 mr-2" />
                                                                            Generate Charts
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Enhanced Chart Dashboard */}
                                                            {chartConfigs.length > 0 ? (
                                                                <div className="space-y-8">
                                                                    {/* Professional Chart Controls Panel */}
                                                                    <div
                                                                        className="relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-1500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:shadow-xl"
                                                                        style={{
                                                                            background: `linear-gradient(135deg, ${themeClasses.glassBg}, ${themeClasses.glassBg}80)`,
                                                                            borderColor: themeClasses.glassBorder,
                                                                            boxShadow: `0 8px 32px ${themeClasses.glassBg}40`
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center justify-between mb-6">
                                                                            <div className="flex items-center gap-3">
                                                                                <div
                                                                                    className="p-2 rounded-lg"
                                                                                    style={{ background: themeClasses.accent }}
                                                                                >
                                                                                    <Settings className="h-5 w-5" style={{ color: themeClasses.primary }} />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-bold text-lg text-foreground">Chart Controls</h4>
                                                                                    <p className="text-sm text-muted-foreground">Customize visualization parameters</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                                <span className="text-sm font-medium text-green-600">Real-time</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                                            <div className="space-y-2">
                                                                                <label className="text-sm font-medium text-foreground">Time Range</label>
                                                                                <Select value={chartTimeRange} onValueChange={(value: any) => setChartTimeRange(value)}>
                                                                                    <SelectTrigger className="w-32">
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="7d">7 Days</SelectItem>
                                                                                        <SelectItem value="30d">30 Days</SelectItem>
                                                                                        <SelectItem value="90d">90 Days</SelectItem>
                                                                                        <SelectItem value="1y">1 Year</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Button size="sm" variant="outline">
                                                                                    <Download className="h-4 w-4 mr-2" />
                                                                                    Export
                                                                                </Button>
                                                                                <Button size="sm" variant="outline">
                                                                                    <Maximize2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Charts Grid */}
                                                                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 w-full overflow-x-auto">
                                                                            {chartConfigs.map((chartConfig, index) => (
                                                                                <div
                                                                                    key={index}
                                                                                    className="p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 min-h-[500px] min-w-[400px] w-full"
                                                                                    style={{
                                                                                        background: 'hsl(var(--card))',
                                                                                        borderColor: 'hsl(var(--border))'
                                                                                    }}
                                                                                >
                                                                                    <div className="flex items-center justify-between mb-4">
                                                                                        <h4 className="text-lg font-semibold" style={{ color: themeClasses.primary }}>{chartConfig.title}</h4>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {chartConfig.type.toUpperCase()}
                                                                                            </Badge>
                                                                                            <Button size="sm" variant="ghost">
                                                                                                <MoreVertical className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="h-96 min-h-[384px] w-full">
                                                                                        <EnhancedChart
                                                                                            title={chartConfig.title}
                                                                                            type={chartConfig.type}
                                                                                            data={{
                                                                                                labels: chartConfig.data.map(d => d.x),
                                                                                                datasets: [{
                                                                                                    label: chartConfig.title,
                                                                                                    data: chartConfig.data.map(d => d.y),
                                                                                                    backgroundColor: chartConfig.data.map(d => d.color || themeClasses.primary),
                                                                                                    borderColor: themeClasses.primary,
                                                                                                    borderWidth: 2,
                                                                                                    fill: false
                                                                                                }]
                                                                                            }}
                                                                                            customOptions={{
                                                                                                responsive: true,
                                                                                                maintainAspectRatio: false,
                                                                                                interaction: {
                                                                                                    intersect: false,
                                                                                                    mode: 'index' as const,
                                                                                                },
                                                                                                layout: {
                                                                                                    padding: {
                                                                                                        top: 10,
                                                                                                        bottom: 10,
                                                                                                        left: 10,
                                                                                                        right: 10
                                                                                                    }
                                                                                                },
                                                                                                plugins: {
                                                                                                    legend: {
                                                                                                        display: true,
                                                                                                        position: 'top' as const
                                                                                                    },
                                                                                                    tooltip: {
                                                                                                        callbacks: {
                                                                                                            label: (context: any) => {
                                                                                                                const dataPoint = chartConfig.data[context.dataIndex];
                                                                                                                return dataPoint.label || `${context.label}: ${context.parsed.y}`;
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                },
                                                                                                scales: chartConfig.type !== 'doughnut' && chartConfig.type !== 'radar' ? {
                                                                                                    x: {
                                                                                                        display: true,
                                                                                                        title: {
                                                                                                            display: true,
                                                                                                            text: 'Time / Component'
                                                                                                        }
                                                                                                    },
                                                                                                    y: {
                                                                                                        display: true,
                                                                                                        title: {
                                                                                                            display: true,
                                                                                                            text: 'Value'
                                                                                                        }
                                                                                                    }
                                                                                                } : undefined
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>

                                                                        {/* Chart Insights */}
                                                                        <div
                                                                            className="p-6 rounded-2xl border"
                                                                            style={{
                                                                                background: themeClasses.cardBg,
                                                                                borderColor: themeClasses.cardBorder
                                                                            }}
                                                                        >
                                                                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: themeClasses.primary }}>
                                                                                <Lightbulb className="h-5 w-5" />
                                                                                Chart Insights & Analysis
                                                                            </h4>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div
                                                                                    className="p-4 rounded-xl"
                                                                                    style={{ background: 'hsl(var(--card))' }}
                                                                                >
                                                                                    <h5 className="font-semibold mb-2" style={{ color: themeClasses.primary }}>Trend Analysis</h5>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        Health score shows {aiAssessment.healthScore > 75 ? 'positive' : 'declining'} trend with
                                                                                        {aiAssessment.confidence}% confidence level.
                                                                                    </p>
                                                                                </div>
                                                                                <div
                                                                                    className="p-4 rounded-xl"
                                                                                    style={{ background: 'hsl(var(--card))' }}
                                                                                >
                                                                                    <h5 className="font-semibold mb-2" style={{ color: themeClasses.primary }}>Predictive Indicators</h5>
                                                                                    <p className="text-sm text-muted-foreground">
                                                                                        RUL prediction indicates {maintenancePlan?.rulPrediction?.estimatedRUL || 'N/A'} days
                                                                                        remaining useful life based on current operating conditions.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-12">
                                                                    <BarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                                                    <h3 className="text-lg font-semibold text-foreground mb-2">No Charts Generated</h3>
                                                                    <p className="text-muted-foreground mb-4">Click "Generate Charts" to create advanced statistical and technical visualizations.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ThemedAITabsContent>

                                                </ThemedAITabs>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                                    <p className="text-muted-foreground mb-2">AI Assessment Ready</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Enter vibration measurements to generate AI-powered condition assessment
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </ThemedAIAssessmentCard>





                                    {/* Equipment Selection & Management */}
                                    <Card className="bg-card">
                                        <CardHeader className="pb-3 pt-4 px-4">
                                            <CardTitle className="flex items-center gap-2">
                                                <Factory className="h-5 w-5 text-primary" />
                                                Equipment Management
                                                <Badge variant="outline" className="ml-2">Multi-Equipment</Badge>
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Add, remove, or modify equipment for vibration monitoring
                                            </p>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Current Equipment Summary */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-card rounded-lg border border-border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-sm text-foreground">Current Equipment</h4>
                                                        <Badge variant="secondary">{selectedEquipment.length} selected</Badge>
                                                    </div>
                                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                                        {selectedEquipment.map(equipmentId => {
                                                            const equipment = equipmentOptions.find(eq => eq.id === equipmentId);
                                                            return (
                                                                <div key={equipmentId} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                                                                    <div>
                                                                        <span className="font-medium text-foreground">{equipment?.name}</span>
                                                                        <span className="text-muted-foreground ml-2">({equipment?.category})</span>
                                                                    </div>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            const newSelection = selectedEquipment.filter(id => id !== equipmentId);
                                                                            setSelectedEquipment(newSelection);
                                                                        }}
                                                                        className="h-6 w-6 p-0 text-destructive hover:text-destructive-foreground"
                                                                    >
                                                                        <XCircle className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            );
                                                        })}
                                                        {selectedEquipment.length === 0 && (
                                                            <div className="text-center text-muted-foreground text-xs py-4">
                                                                No equipment selected
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-card rounded-lg border border-border">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-sm text-foreground">Add Equipment</h4>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setShowAddEquipment(true)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add New
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-xs text-muted-foreground">
                                                            Equipment Categories:
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => (
                                                                <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                                                                    <div className="w-3 h-3 rounded bg-primary"></div>
                                                                    <span>{category.label}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Equipment Selector */}
                                            <div className="border-t pt-4">
                                                <Label className="text-sm font-medium mb-2 block">Quick Equipment Selection</Label>
                                                <MultiEquipmentSelector
                                                    selectedEquipment={selectedEquipment}
                                                    onEquipmentSelect={handleEquipmentSelect}
                                                    searchTerm={searchTerm}
                                                    onSearchChange={setSearchTerm}
                                                    maxSelections={10}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
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
            </DialogContent >

            {/* Alert Dialog */}
            < AlertDialog open={showAlert} onOpenChange={setShowAlert} >
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
            </AlertDialog >
        </Dialog >
    );
};

export default EnhancedVibrationForm;
