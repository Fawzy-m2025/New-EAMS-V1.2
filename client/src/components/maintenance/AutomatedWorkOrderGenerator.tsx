import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle,
    Clock,
    Target,
    Zap,
    Gauge,
    Activity,
    BarChart3,
    Settings,
    Users,
    FileText,
    Shield,
    Database,
    Cpu,
    Wrench,
    Eye,
    ChevronDown,
    Download,
    XCircle,
    DollarSign,
    AlertCircle,
    Calendar,
    Bell,
    Play,
    Pause,
    RotateCcw,
    Filter,
    Search,
    Plus,
    Trash2,
    Edit,
    Copy,
    ExternalLink,
    Star,
    StarOff,
    Timer,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Activity as ActivityIcon,
    Target as TargetIcon,
    Zap as ZapIcon,
    Shield as ShieldIcon,
    Clock as ClockIcon,
    DollarSign as DollarSignIcon,
    Users as UsersIcon,
    FileText as FileTextIcon,
    Settings as SettingsIcon,
    Database as DatabaseIcon,
    Cpu as CpuIcon,
    Wrench as WrenchIcon,
    Eye as EyeIcon,
    Bell as BellIcon,
    Calendar as CalendarIcon,
    AlertTriangle as AlertTriangleIcon,
    CheckCircle as CheckCircleIcon,
    Minus as MinusIcon,
    ChevronDown as ChevronDownIcon,
    Download as DownloadIcon,
    XCircle as XCircleIcon,
    Plus as PlusIcon,
    Trash2 as Trash2Icon,
    Edit as EditIcon,
    Copy as CopyIcon,
    ExternalLink as ExternalLinkIcon,
    Star as StarIcon,
    StarOff as StarOffIcon,
    Timer as TimerIcon,
    TrendingUp as TrendingUpIcon2,
    TrendingDown as TrendingDownIcon2,
    Activity as ActivityIcon2,
    Target as TargetIcon2,
    Zap as ZapIcon2,
    Shield as ShieldIcon2,
    Clock as ClockIcon2,
    DollarSign as DollarSignIcon2,
    Users as UsersIcon2,
    FileText as FileTextIcon2,
    Settings as SettingsIcon2,
    Database as DatabaseIcon2,
    Cpu as CpuIcon2,
    Wrench as WrenchIcon2,
    Eye as EyeIcon2,
    Bell as BellIcon2,
    Calendar as CalendarIcon2,
    AlertTriangle as AlertTriangleIcon2,
    CheckCircle as CheckCircleIcon2,
    Minus as MinusIcon2,
    ChevronDown as ChevronDownIcon2,
    Download as DownloadIcon2,
    XCircle as XCircleIcon2,
    Plus as PlusIcon2,
    Trash2 as Trash2Icon2,
    Edit as EditIcon2,
    Copy as CopyIcon2,
    ExternalLink as ExternalLinkIcon2,
    Star as StarIcon2,
    StarOff as StarOffIcon2,
    Timer as TimerIcon2,
    ListTodo,
    ArrowUpDown
} from 'lucide-react';
import mlService from '@/services/mlService';
import { enhancedAssetData } from '@/data/enhancedAssetData';
import type { WorkOrder, Priority } from '@/types/eams';

// Enhanced Work Order types for automated generation
interface AutomatedWorkOrder extends WorkOrder {
    generatedBy: 'predictive' | 'condition' | 'scheduled' | 'manual';
    rulHours?: number;
    confidence?: number;
    triggerConditions?: {
        vibration?: number;
        temperature?: number;
        pressure?: number;
        oilQuality?: number;
        operatingHours?: number;
    };
    recommendations?: string[];
    estimatedSavings?: number;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    automationLevel?: 'fully-automated' | 'semi-automated' | 'manual-review';
    nextReviewDate?: string;
    escalationRules?: {
        autoEscalate: boolean;
        escalationDelay: number; // hours
        escalationLevel: number;
    };
}

interface PredictiveTrigger {
    id: string;
    equipmentId: string;
    equipmentName: string;
    triggerType: 'rul' | 'condition' | 'trend' | 'threshold';
    currentValue: number;
    threshold: number;
    rulHours: number;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
    createdAt: string;
    lastUpdated: string;
    recommendations: string[];
}

interface WorkOrderTemplate {
    id: string;
    name: string;
    description: string;
    category: 'predictive' | 'preventive' | 'corrective' | 'emergency';
    equipmentTypes: string[];
    estimatedHours: number;
    procedures: string[];
    requiredSkills: string[];
    requiredParts: string[];
    tasks: {
        id: string;
        title: string;
        description: string;
        estimatedDuration: number; // minutes
        requiredSkills: string[];
        requiredTools: string[];
        safetyNotes: string[];
        qualityChecks: string[];
        dependencies: string[]; // task IDs that must be completed first
    }[];
    priorityMapping: {
        rulHours: number;
        priority: Priority;
    }[];
    automationRules: {
        autoGenerate: boolean;
        autoAssign: boolean;
        autoSchedule: boolean;
        reviewRequired: boolean;
    };
}

const AutomatedWorkOrderGenerator: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
    const [automationEnabled, setAutomationEnabled] = useState(true);
    const [generatedWorkOrders, setGeneratedWorkOrders] = useState<AutomatedWorkOrder[]>([]);
    const [predictiveTriggers, setPredictiveTriggers] = useState<PredictiveTrigger[]>([]);
    const [workOrderTemplates, setWorkOrderTemplates] = useState<WorkOrderTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Automation settings
    const [autoGenerationEnabled, setAutoGenerationEnabled] = useState(true);
    const [autoAssignmentEnabled, setAutoAssignmentEnabled] = useState(false);
    const [autoSchedulingEnabled, setAutoSchedulingEnabled] = useState(true);
    const [reviewRequired, setReviewRequired] = useState(true);
    const [escalationEnabled, setEscalationEnabled] = useState(true);

    // Priority thresholds
    const [criticalRulThreshold, setCriticalRulThreshold] = useState(168); // 1 week
    const [highRulThreshold, setHighRulThreshold] = useState(720); // 1 month
    const [mediumRulThreshold, setMediumRulThreshold] = useState(2160); // 3 months

    // Get available equipment
    const availableEquipment = enhancedAssetData.map(asset => ({
        id: asset.id,
        name: asset.name,
        category: asset.category
    }));

    // Initialize work order templates
    useEffect(() => {
        const templates: WorkOrderTemplate[] = [
            {
                id: 'template-001',
                name: 'Predictive Vibration Repair',
                description: 'Automated work order for vibration-based predictive maintenance',
                category: 'predictive',
                equipmentTypes: ['pump', 'motor', 'compressor'],
                estimatedHours: 4,
                procedures: [
                    'Analyze vibration data and identify root cause',
                    'Schedule maintenance during planned downtime',
                    'Replace bearings or balance rotating components',
                    'Perform post-maintenance vibration analysis',
                    'Update condition monitoring baselines'
                ],
                requiredSkills: ['Vibration Analysis', 'Mechanical Repair'],
                requiredParts: ['Bearings', 'Couplings', 'Balancing Equipment'],
                tasks: [
                    {
                        id: 'task-001',
                        title: 'Analyze vibration data and identify root cause',
                        description: 'Use vibration analysis tools to identify the root cause of the vibration',
                        estimatedDuration: 60,
                        requiredSkills: ['Vibration Analysis'],
                        requiredTools: ['Vibration Analyzer'],
                        safetyNotes: ['Wear protective gloves'],
                        qualityChecks: ['Vibration data consistency'],
                        dependencies: []
                    },
                    {
                        id: 'task-002',
                        title: 'Schedule maintenance during planned downtime',
                        description: 'Schedule the maintenance work during a planned downtime',
                        estimatedDuration: 30,
                        requiredSkills: ['Scheduling'],
                        requiredTools: [],
                        safetyNotes: ['Ensure safety protocols are followed'],
                        qualityChecks: ['Maintenance schedule adherence'],
                        dependencies: ['task-001']
                    },
                    {
                        id: 'task-003',
                        title: 'Replace bearings or balance rotating components',
                        description: 'Replace worn or damaged bearings or balance rotating components',
                        estimatedDuration: 120,
                        requiredSkills: ['Mechanical Repair'],
                        requiredTools: ['Wrench', 'Bearings', 'Balancing Equipment'],
                        safetyNotes: ['Use proper lifting techniques'],
                        qualityChecks: ['Bearing alignment', 'Vibration analysis'],
                        dependencies: ['task-002']
                    },
                    {
                        id: 'task-004',
                        title: 'Perform post-maintenance vibration analysis',
                        description: 'Perform vibration analysis after the maintenance work',
                        estimatedDuration: 60,
                        requiredSkills: ['Vibration Analysis'],
                        requiredTools: ['Vibration Analyzer'],
                        safetyNotes: ['Wear protective gloves'],
                        qualityChecks: ['Vibration data consistency'],
                        dependencies: ['task-003']
                    },
                    {
                        id: 'task-005',
                        title: 'Update condition monitoring baselines',
                        description: 'Update the condition monitoring baselines based on the analysis results',
                        estimatedDuration: 30,
                        requiredSkills: ['Condition Monitoring'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Baseline update accuracy'],
                        dependencies: ['task-004']
                    }
                ],
                priorityMapping: [
                    { rulHours: 168, priority: 'critical' },
                    { rulHours: 720, priority: 'high' },
                    { rulHours: 2160, priority: 'medium' }
                ],
                automationRules: {
                    autoGenerate: true,
                    autoAssign: false,
                    autoSchedule: true,
                    reviewRequired: true
                }
            },
            {
                id: 'template-002',
                name: 'Predictive Maintenance - Oil Analysis',
                description: 'Automated work order based on oil analysis results',
                category: 'predictive',
                equipmentTypes: ['pump', 'motor', 'engine'],
                estimatedHours: 2,
                procedures: [
                    'Review oil analysis report',
                    'Schedule oil change and filter replacement',
                    'Inspect for wear particles and contamination',
                    'Update oil analysis schedule',
                    'Document findings and recommendations'
                ],
                requiredSkills: ['Oil Analysis', 'Lubrication'],
                requiredParts: ['Oil Filters', 'Lubricating Oil'],
                tasks: [
                    {
                        id: 'task-006',
                        title: 'Review oil analysis report',
                        description: 'Review the oil analysis report to identify any issues',
                        estimatedDuration: 30,
                        requiredSkills: ['Oil Analysis'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Report accuracy'],
                        dependencies: []
                    },
                    {
                        id: 'task-007',
                        title: 'Schedule oil change and filter replacement',
                        description: 'Schedule the oil change and filter replacement',
                        estimatedDuration: 30,
                        requiredSkills: ['Scheduling'],
                        requiredTools: [],
                        safetyNotes: ['Ensure safety protocols are followed'],
                        qualityChecks: ['Oil change completion'],
                        dependencies: ['task-006']
                    },
                    {
                        id: 'task-008',
                        title: 'Inspect for wear particles and contamination',
                        description: 'Inspect the oil for wear particles and contamination',
                        estimatedDuration: 60,
                        requiredSkills: ['Lubrication'],
                        requiredTools: ['Oil Inspection Kit'],
                        safetyNotes: ['Wear protective gloves'],
                        qualityChecks: ['Wear particle inspection'],
                        dependencies: ['task-007']
                    },
                    {
                        id: 'task-009',
                        title: 'Update oil analysis schedule',
                        description: 'Update the oil analysis schedule based on the inspection results',
                        estimatedDuration: 30,
                        requiredSkills: ['Condition Monitoring'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Schedule update accuracy'],
                        dependencies: ['task-008']
                    },
                    {
                        id: 'task-010',
                        title: 'Document findings and recommendations',
                        description: 'Document the findings and recommendations from the oil analysis',
                        estimatedDuration: 30,
                        requiredSkills: ['Documentation'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Document completeness'],
                        dependencies: ['task-009']
                    }
                ],
                priorityMapping: [
                    { rulHours: 168, priority: 'critical' },
                    { rulHours: 720, priority: 'high' },
                    { rulHours: 2160, priority: 'medium' }
                ],
                automationRules: {
                    autoGenerate: true,
                    autoAssign: false,
                    autoSchedule: true,
                    reviewRequired: true
                }
            },
            {
                id: 'template-003',
                name: 'Thermal Imaging Inspection',
                description: 'Automated work order for thermal imaging findings',
                category: 'predictive',
                equipmentTypes: ['electrical', 'mechanical'],
                estimatedHours: 3,
                procedures: [
                    'Perform thermal imaging inspection',
                    'Identify hot spots and temperature anomalies',
                    'Document findings with thermal images',
                    'Schedule corrective actions if needed',
                    'Update inspection schedule'
                ],
                requiredSkills: ['Thermal Imaging', 'Electrical/Mechanical'],
                requiredParts: ['Thermal Camera', 'Cleaning Supplies'],
                tasks: [
                    {
                        id: 'task-011',
                        title: 'Perform thermal imaging inspection',
                        description: 'Use thermal imaging equipment to inspect the equipment',
                        estimatedDuration: 60,
                        requiredSkills: ['Thermal Imaging'],
                        requiredTools: ['Thermal Camera'],
                        safetyNotes: ['Wear protective gloves'],
                        qualityChecks: ['Inspection accuracy'],
                        dependencies: []
                    },
                    {
                        id: 'task-012',
                        title: 'Identify hot spots and temperature anomalies',
                        description: 'Identify any hot spots or temperature anomalies',
                        estimatedDuration: 30,
                        requiredSkills: ['Electrical/Mechanical'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Anomaly detection'],
                        dependencies: ['task-011']
                    },
                    {
                        id: 'task-013',
                        title: 'Document findings with thermal images',
                        description: 'Document the findings using thermal images',
                        estimatedDuration: 60,
                        requiredSkills: ['Documentation'],
                        requiredTools: ['Thermal Camera'],
                        safetyNotes: [],
                        qualityChecks: ['Image quality'],
                        dependencies: ['task-012']
                    },
                    {
                        id: 'task-014',
                        title: 'Schedule corrective actions if needed',
                        description: 'Schedule corrective actions based on the inspection results',
                        estimatedDuration: 30,
                        requiredSkills: ['Scheduling'],
                        requiredTools: [],
                        safetyNotes: ['Ensure safety protocols are followed'],
                        qualityChecks: ['Action plan accuracy'],
                        dependencies: ['task-013']
                    },
                    {
                        id: 'task-015',
                        title: 'Update inspection schedule',
                        description: 'Update the inspection schedule based on the action plan',
                        estimatedDuration: 30,
                        requiredSkills: ['Condition Monitoring'],
                        requiredTools: [],
                        safetyNotes: [],
                        qualityChecks: ['Schedule update accuracy'],
                        dependencies: ['task-014']
                    }
                ],
                priorityMapping: [
                    { rulHours: 168, priority: 'critical' },
                    { rulHours: 720, priority: 'high' },
                    { rulHours: 2160, priority: 'medium' }
                ],
                automationRules: {
                    autoGenerate: true,
                    autoAssign: false,
                    autoSchedule: true,
                    reviewRequired: true
                }
            },
            {
                id: 'template-004',
                name: 'Motor Bearing Replacement',
                description: 'Comprehensive motor bearing replacement with alignment check',
                category: 'corrective',
                equipmentTypes: ['motor', 'pump'],
                estimatedHours: 6,
                procedures: [
                    'Safety isolation and lockout',
                    'Remove motor from equipment',
                    'Disassemble motor and remove old bearings',
                    'Install new bearings with proper lubrication',
                    'Reassemble motor and perform alignment check',
                    'Test run and verify operation'
                ],
                requiredSkills: ['Mechanical Repair', 'Motor Maintenance', 'Alignment'],
                requiredParts: ['Motor Bearings', 'Grease', 'Alignment Tools'],
                tasks: [
                    {
                        id: 'task-016',
                        title: 'Safety isolation and lockout',
                        description: 'Perform proper safety isolation and lockout procedures',
                        estimatedDuration: 30,
                        requiredSkills: ['Safety Procedures'],
                        requiredTools: ['Lockout/Tagout Kit'],
                        safetyNotes: ['Follow LOTO procedures strictly', 'Verify zero energy state'],
                        qualityChecks: ['LOTO verification', 'Safety checklist completion'],
                        dependencies: []
                    },
                    {
                        id: 'task-017',
                        title: 'Remove motor from equipment',
                        description: 'Safely remove motor from its mounting position',
                        estimatedDuration: 90,
                        requiredSkills: ['Mechanical Repair'],
                        requiredTools: ['Hoist', 'Wrenches', 'Lifting Equipment'],
                        safetyNotes: ['Use proper lifting techniques', 'Secure motor during transport'],
                        qualityChecks: ['Motor condition assessment', 'Mounting hardware inspection'],
                        dependencies: ['task-016']
                    },
                    {
                        id: 'task-018',
                        title: 'Disassemble motor and remove old bearings',
                        description: 'Carefully disassemble motor and extract worn bearings',
                        estimatedDuration: 120,
                        requiredSkills: ['Motor Maintenance'],
                        requiredTools: ['Bearing Puller', 'Heat Gun', 'Cleaning Supplies'],
                        safetyNotes: ['Handle bearings carefully', 'Avoid damage to motor shaft'],
                        qualityChecks: ['Bearing condition analysis', 'Shaft inspection'],
                        dependencies: ['task-017']
                    },
                    {
                        id: 'task-019',
                        title: 'Install new bearings with proper lubrication',
                        description: 'Install new bearings with correct lubrication and seating',
                        estimatedDuration: 90,
                        requiredSkills: ['Motor Maintenance'],
                        requiredTools: ['Bearing Heater', 'Grease Gun', 'Torque Wrench'],
                        safetyNotes: ['Follow bearing installation procedures', 'Use correct grease type'],
                        qualityChecks: ['Bearing seating verification', 'Lubrication adequacy'],
                        dependencies: ['task-018']
                    },
                    {
                        id: 'task-020',
                        title: 'Reassemble motor and perform alignment check',
                        description: 'Reassemble motor and perform precision alignment',
                        estimatedDuration: 120,
                        requiredSkills: ['Alignment'],
                        requiredTools: ['Dial Indicators', 'Alignment Tools', 'Feeler Gauges'],
                        safetyNotes: ['Ensure proper alignment tolerances', 'Check coupling condition'],
                        qualityChecks: ['Alignment accuracy', 'Coupling gap verification'],
                        dependencies: ['task-019']
                    },
                    {
                        id: 'task-021',
                        title: 'Test run and verify operation',
                        description: 'Perform test run and verify all operational parameters',
                        estimatedDuration: 60,
                        requiredSkills: ['Motor Testing'],
                        requiredTools: ['Vibration Meter', 'Thermal Camera', 'Ammeter'],
                        safetyNotes: ['Monitor for unusual sounds or vibrations', 'Check temperature rise'],
                        qualityChecks: ['Vibration levels', 'Temperature readings', 'Current draw'],
                        dependencies: ['task-020']
                    }
                ],
                priorityMapping: [
                    { rulHours: 24, priority: 'critical' },
                    { rulHours: 168, priority: 'high' },
                    { rulHours: 720, priority: 'medium' }
                ],
                automationRules: {
                    autoGenerate: true,
                    autoAssign: true,
                    autoSchedule: true,
                    reviewRequired: false
                }
            },
            {
                id: 'template-005',
                name: 'Electrical Panel Maintenance',
                description: 'Comprehensive electrical panel inspection and maintenance',
                category: 'preventive',
                equipmentTypes: ['electrical'],
                estimatedHours: 4,
                procedures: [
                    'Safety procedures and PPE setup',
                    'Visual inspection of panel components',
                    'Thermal imaging of electrical connections',
                    'Tighten loose connections and clean contacts',
                    'Test protective devices and verify operation',
                    'Document findings and update maintenance records'
                ],
                requiredSkills: ['Electrical Maintenance', 'Thermal Imaging', 'Electrical Testing'],
                requiredParts: ['Contact Cleaner', 'Terminal Blocks', 'Protective Devices'],
                tasks: [
                    {
                        id: 'task-022',
                        title: 'Safety procedures and PPE setup',
                        description: 'Establish proper safety procedures and don appropriate PPE',
                        estimatedDuration: 15,
                        requiredSkills: ['Electrical Safety'],
                        requiredTools: ['PPE Kit', 'Safety Barriers'],
                        safetyNotes: ['Wear arc flash protection', 'Establish work boundaries'],
                        qualityChecks: ['PPE verification', 'Safety briefing completion'],
                        dependencies: []
                    },
                    {
                        id: 'task-023',
                        title: 'Visual inspection of panel components',
                        description: 'Perform thorough visual inspection of all panel components',
                        estimatedDuration: 45,
                        requiredSkills: ['Electrical Inspection'],
                        requiredTools: ['Flashlight', 'Magnifying Glass'],
                        safetyNotes: ['Maintain safe distance', 'Look for signs of overheating'],
                        qualityChecks: ['Component condition assessment', 'Visual defect identification'],
                        dependencies: ['task-022']
                    },
                    {
                        id: 'task-024',
                        title: 'Thermal imaging of electrical connections',
                        description: 'Use thermal imaging to identify hot spots in connections',
                        estimatedDuration: 60,
                        requiredSkills: ['Thermal Imaging'],
                        requiredTools: ['Thermal Camera'],
                        safetyNotes: ['Maintain safe distance', 'Document temperature readings'],
                        qualityChecks: ['Temperature baseline comparison', 'Hot spot documentation'],
                        dependencies: ['task-023']
                    },
                    {
                        id: 'task-025',
                        title: 'Tighten loose connections and clean contacts',
                        description: 'Tighten loose connections and clean electrical contacts',
                        estimatedDuration: 90,
                        requiredSkills: ['Electrical Maintenance'],
                        requiredTools: ['Torque Wrench', 'Contact Cleaner', 'Wire Brush'],
                        safetyNotes: ['Follow torque specifications', 'Use appropriate cleaning agents'],
                        qualityChecks: ['Torque verification', 'Contact cleanliness'],
                        dependencies: ['task-024']
                    },
                    {
                        id: 'task-026',
                        title: 'Test protective devices and verify operation',
                        description: 'Test all protective devices and verify proper operation',
                        estimatedDuration: 60,
                        requiredSkills: ['Electrical Testing'],
                        requiredTools: ['Multimeter', 'Test Equipment'],
                        safetyNotes: ['Follow testing procedures', 'Verify device settings'],
                        qualityChecks: ['Device operation verification', 'Setting accuracy'],
                        dependencies: ['task-025']
                    },
                    {
                        id: 'task-027',
                        title: 'Document findings and update maintenance records',
                        description: 'Document all findings and update maintenance records',
                        estimatedDuration: 30,
                        requiredSkills: ['Documentation'],
                        requiredTools: ['Maintenance Software'],
                        safetyNotes: [],
                        qualityChecks: ['Record completeness', 'Data accuracy'],
                        dependencies: ['task-026']
                    }
                ],
                priorityMapping: [
                    { rulHours: 720, priority: 'high' },
                    { rulHours: 2160, priority: 'medium' },
                    { rulHours: 4320, priority: 'low' }
                ],
                automationRules: {
                    autoGenerate: true,
                    autoAssign: false,
                    autoSchedule: true,
                    reviewRequired: true
                }
            }
        ];
        setWorkOrderTemplates(templates);
    }, []);

    // Generate predictive triggers based on equipment data
    const generatePredictiveTriggers = async () => {
        try {
            setLoading(true);

            // Simulate API call to get predictive data
            const triggers: PredictiveTrigger[] = [];

            enhancedAssetData.forEach(asset => {
                if (selectedEquipment === 'all' || asset.id === selectedEquipment) {
                    // Generate vibration-based triggers
                    const vibrationValue = Math.random() * 10 + 2;
                    if (vibrationValue > 7) {
                        triggers.push({
                            id: `trigger-${asset.id}-vib`,
                            equipmentId: asset.id,
                            equipmentName: asset.name,
                            triggerType: 'threshold',
                            currentValue: vibrationValue,
                            threshold: 7,
                            rulHours: Math.random() * 1000 + 100,
                            confidence: Math.random() * 20 + 80,
                            severity: vibrationValue > 9 ? 'critical' : vibrationValue > 8 ? 'high' : 'medium',
                            status: 'active',
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                            recommendations: [
                                'Schedule bearing replacement',
                                'Check alignment and balance',
                                'Monitor vibration trends'
                            ]
                        });
                    }

                    // Generate RUL-based triggers
                    const rulHours = Math.random() * 2000 + 500;
                    if (rulHours < 1000) {
                        triggers.push({
                            id: `trigger-${asset.id}-rul`,
                            equipmentId: asset.id,
                            equipmentName: asset.name,
                            triggerType: 'rul',
                            currentValue: rulHours,
                            threshold: 1000,
                            rulHours: rulHours,
                            confidence: Math.random() * 15 + 85,
                            severity: rulHours < 168 ? 'critical' : rulHours < 720 ? 'high' : 'medium',
                            status: 'active',
                            createdAt: new Date().toISOString(),
                            lastUpdated: new Date().toISOString(),
                            recommendations: [
                                'Schedule predictive maintenance',
                                'Prepare replacement parts',
                                'Plan downtime window'
                            ]
                        });
                    }
                }
            });

            setPredictiveTriggers(triggers);
            setError(null);
        } catch (err) {
            console.error('Error generating predictive triggers:', err);
            setError('Failed to generate predictive triggers');
        } finally {
            setLoading(false);
        }
    };

    // Generate automated work orders from triggers
    const generateAutomatedWorkOrders = async () => {
        try {
            setLoading(true);

            const newWorkOrders: AutomatedWorkOrder[] = [];

            predictiveTriggers.forEach(trigger => {
                // Find appropriate template
                const template = workOrderTemplates.find(t =>
                    t.equipmentTypes.includes(trigger.equipmentName.toLowerCase().includes('pump') ? 'pump' : 'motor')
                );

                if (template) {
                    // Determine priority based on RUL
                    let priority: Priority = 'low';
                    if (trigger.rulHours < criticalRulThreshold) priority = 'critical';
                    else if (trigger.rulHours < highRulThreshold) priority = 'high';
                    else if (trigger.rulHours < mediumRulThreshold) priority = 'medium';

                    // Calculate due date based on RUL
                    const dueDate = new Date();
                    dueDate.setHours(dueDate.getHours() + trigger.rulHours);

                    const workOrder: AutomatedWorkOrder = {
                        id: `AWO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        title: `${template.name} - ${trigger.equipmentName}`,
                        description: `Automated work order generated based on ${trigger.triggerType} analysis. ${trigger.recommendations.join(' ')}`,
                        priority: priority,
                        status: 'open',
                        assignedTo: autoAssignmentEnabled ? ['Available Technician'] : [],
                        equipmentId: trigger.equipmentId,
                        equipmentName: trigger.equipmentName,
                        location: 'To be determined',
                        type: 'Predictive',
                        createdDate: new Date().toISOString(),
                        dueDate: dueDate.toISOString(),
                        scheduledDate: autoSchedulingEnabled ? dueDate.toISOString() : undefined,
                        estimatedHours: template.estimatedHours,
                        cost: {
                            labor: template.estimatedHours * 80,
                            parts: 500,
                            external: 0,
                            total: template.estimatedHours * 80 + 500
                        },
                        procedures: template.procedures,
                        generatedBy: 'predictive',
                        rulHours: trigger.rulHours,
                        confidence: trigger.confidence,
                        triggerConditions: {
                            vibration: trigger.triggerType === 'threshold' ? trigger.currentValue : undefined,
                            temperature: undefined,
                            pressure: undefined,
                            oilQuality: undefined,
                            operatingHours: undefined
                        },
                        recommendations: trigger.recommendations,
                        estimatedSavings: trigger.rulHours * 100, // Rough estimate
                        riskLevel: trigger.severity,
                        automationLevel: reviewRequired ? 'semi-automated' : 'fully-automated',
                        nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                        escalationRules: {
                            autoEscalate: escalationEnabled,
                            escalationDelay: 24, // 24 hours
                            escalationLevel: 1
                        }
                    };

                    newWorkOrders.push(workOrder);
                }
            });

            setGeneratedWorkOrders(prev => [...prev, ...newWorkOrders]);
            setError(null);
        } catch (err) {
            console.error('Error generating automated work orders:', err);
            setError('Failed to generate automated work orders');
        } finally {
            setLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        generatePredictiveTriggers();
    }, [selectedEquipment]);

    // Auto-generate work orders when triggers change
    useEffect(() => {
        if (autoGenerationEnabled && predictiveTriggers.length > 0) {
            generateAutomatedWorkOrders();
        }
    }, [predictiveTriggers, autoGenerationEnabled]);

    // Calculate statistics
    const totalTriggers = predictiveTriggers.length;
    const activeTriggers = predictiveTriggers.filter(t => t.status === 'active').length;
    const criticalTriggers = predictiveTriggers.filter(t => t.severity === 'critical').length;
    const generatedCount = generatedWorkOrders.length;
    const pendingReview = generatedWorkOrders.filter(wo => wo.status === 'open' && wo.automationLevel === 'semi-automated').length;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        Automated Work Order Generator
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        AI-powered work order generation based on predictive analytics and condition monitoring
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={automationEnabled}
                            onCheckedChange={setAutomationEnabled}
                        />
                        <Label>Automation Enabled</Label>
                    </div>
                    <Button
                        onClick={generatePredictiveTriggers}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Refresh Triggers
                    </Button>
                </div>
            </div>

            {/* Equipment Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Equipment Selection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Label htmlFor="equipment-select">Select Equipment:</Label>
                        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                            <SelectTrigger className="w-[300px]">
                                <SelectValue placeholder="Select equipment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Equipment</SelectItem>
                                {availableEquipment.map(equipment => (
                                    <SelectItem key={equipment.id} value={equipment.id}>
                                        {equipment.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Badge variant="outline">
                            {availableEquipment.length} Equipment
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="triggers">Predictive Triggers</TabsTrigger>
                    <TabsTrigger value="generated">Generated Orders</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Triggers</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">{activeTriggers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Predictive triggers
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{criticalTriggers}</div>
                                <p className="text-xs text-muted-foreground">
                                    Require immediate attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Generated Orders</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{generatedCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    Automated work orders
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{pendingReview}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awaiting approval
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Automation Status */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Automation Status</CardTitle>
                                <CardDescription>Current automation system status and performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Auto Generation</span>
                                        <Badge variant={autoGenerationEnabled ? "default" : "secondary"}>
                                            {autoGenerationEnabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Auto Assignment</span>
                                        <Badge variant={autoAssignmentEnabled ? "default" : "secondary"}>
                                            {autoAssignmentEnabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Auto Scheduling</span>
                                        <Badge variant={autoSchedulingEnabled ? "default" : "secondary"}>
                                            {autoSchedulingEnabled ? "Enabled" : "Disabled"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Review Required</span>
                                        <Badge variant={reviewRequired ? "default" : "secondary"}>
                                            {reviewRequired ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Priority Distribution</CardTitle>
                                <CardDescription>Distribution of generated work orders by priority</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <EnhancedChart
                                    title="Work Order Priority Distribution"
                                    type="doughnut"
                                    data={{
                                        labels: ['Critical', 'High', 'Medium', 'Low'],
                                        datasets: [{
                                            data: [
                                                generatedWorkOrders.filter(wo => wo.priority === 'critical').length,
                                                generatedWorkOrders.filter(wo => wo.priority === 'high').length,
                                                generatedWorkOrders.filter(wo => wo.priority === 'medium').length,
                                                generatedWorkOrders.filter(wo => wo.priority === 'low').length
                                            ],
                                            backgroundColor: [
                                                '#ef4444',
                                                '#f97316',
                                                '#f59e0b',
                                                '#10b981'
                                            ]
                                        }]
                                    }}
                                    height={200}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Automation Activity</CardTitle>
                            <CardDescription>Latest automated work order generation events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {generatedWorkOrders.slice(0, 5).map((workOrder, index) => (
                                    <div key={workOrder.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                                <Brain className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{workOrder.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Generated {new Date(workOrder.createdDate).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={workOrder.priority === 'critical' ? 'destructive' : workOrder.priority === 'high' ? 'secondary' : 'outline'}>
                                                {workOrder.priority}
                                            </Badge>
                                            <Badge variant="outline">
                                                {workOrder.automationLevel}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Predictive Triggers Tab */}
                <TabsContent value="triggers" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Predictive Triggers</CardTitle>
                            <CardDescription>Active triggers that can generate automated work orders</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Trigger Type</TableHead>
                                        <TableHead>Current Value</TableHead>
                                        <TableHead>RUL (Hours)</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {predictiveTriggers.map(trigger => (
                                        <TableRow key={trigger.id}>
                                            <TableCell className="font-medium">{trigger.equipmentName}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {trigger.triggerType.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{trigger.currentValue.toFixed(2)}</TableCell>
                                            <TableCell>{trigger.rulHours.toFixed(0)}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    trigger.severity === 'critical' ? 'destructive' :
                                                        trigger.severity === 'high' ? 'secondary' :
                                                            trigger.severity === 'medium' ? 'default' : 'outline'
                                                }>
                                                    {trigger.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={trigger.status === 'active' ? 'default' : 'secondary'}>
                                                    {trigger.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline">
                                                    Generate WO
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Generated Orders Tab */}
                <TabsContent value="generated" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Work Orders</CardTitle>
                            <CardDescription>Automatically generated work orders awaiting review or execution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Work Order</TableHead>
                                        <TableHead>Equipment</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>RUL (Hours)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Automation Level</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {generatedWorkOrders.map(workOrder => (
                                        <TableRow key={workOrder.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{workOrder.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {workOrder.id}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{workOrder.equipmentName}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    workOrder.priority === 'critical' ? 'destructive' :
                                                        workOrder.priority === 'high' ? 'secondary' :
                                                            workOrder.priority === 'medium' ? 'default' : 'outline'
                                                }>
                                                    {workOrder.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{workOrder.rulHours?.toFixed(0)}</TableCell>
                                            <TableCell>
                                                <Badge variant={workOrder.status === 'open' ? 'default' : 'secondary'}>
                                                    {workOrder.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {workOrder.automationLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Order Templates</CardTitle>
                            <CardDescription>Predefined templates for automated work order generation with detailed task descriptions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {workOrderTemplates.map(template => (
                                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <CardTitle>{template.name}</CardTitle>
                                                        <CardDescription className="mt-1">{template.description}</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{template.category}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Template Overview */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-primary">{template.estimatedHours}h</div>
                                                        <div className="text-sm text-muted-foreground">Estimated Hours</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">{template.tasks.length}</div>
                                                        <div className="text-sm text-muted-foreground">Total Tasks</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">{template.requiredSkills.length}</div>
                                                        <div className="text-sm text-muted-foreground">Required Skills</div>
                                                    </div>
                                                </div>

                                                {/* Automation Rules */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <span className="text-sm font-medium">Auto Generate</span>
                                                        <Badge variant={template.automationRules.autoGenerate ? "default" : "secondary"}>
                                                            {template.automationRules.autoGenerate ? "Enabled" : "Disabled"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                                        <span className="text-sm font-medium">Review Required</span>
                                                        <Badge variant={template.automationRules.reviewRequired ? "default" : "secondary"}>
                                                            {template.automationRules.reviewRequired ? "Yes" : "No"}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Detailed Tasks */}
                                                <div className="space-y-4">
                                                    <h4 className="text-lg font-semibold flex items-center gap-2">
                                                        <ListTodo className="h-5 w-5 text-primary" />
                                                        Detailed Tasks
                                                    </h4>
                                                    <div className="space-y-4">
                                                        {template.tasks.map((task, index) => (
                                                            <div key={task.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                                            {index + 1}
                                                                        </div>
                                                                        <div>
                                                                            <h5 className="font-semibold">{task.title}</h5>
                                                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline">{task.estimatedDuration}min</Badge>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                                    {/* Required Skills */}
                                                                    <div>
                                                                        <h6 className="font-medium text-primary mb-2 flex items-center gap-1">
                                                                            <Users className="h-4 w-4" />
                                                                            Skills Required
                                                                        </h6>
                                                                        <div className="space-y-1">
                                                                            {task.requiredSkills.map((skill, idx) => (
                                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                                    {skill}
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Required Tools */}
                                                                    <div>
                                                                        <h6 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                                                                            <Wrench className="h-4 w-4" />
                                                                            Tools Required
                                                                        </h6>
                                                                        <div className="space-y-1">
                                                                            {task.requiredTools.length > 0 ? (
                                                                                task.requiredTools.map((tool, idx) => (
                                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                                        {tool}
                                                                                    </Badge>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-muted-foreground text-xs">None required</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Safety Notes */}
                                                                    <div>
                                                                        <h6 className="font-medium text-orange-600 mb-2 flex items-center gap-1">
                                                                            <Shield className="h-4 w-4" />
                                                                            Safety Notes
                                                                        </h6>
                                                                        <div className="space-y-1">
                                                                            {task.safetyNotes.length > 0 ? (
                                                                                task.safetyNotes.map((note, idx) => (
                                                                                    <div key={idx} className="text-xs text-orange-700 bg-orange-50 p-1 rounded">
                                                                                        {note}
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-muted-foreground text-xs">No special safety requirements</span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Quality Checks */}
                                                                    <div>
                                                                        <h6 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                                                                            <CheckCircle className="h-4 w-4" />
                                                                            Quality Checks
                                                                        </h6>
                                                                        <div className="space-y-1">
                                                                            {task.qualityChecks.map((check, idx) => (
                                                                                <div key={idx} className="text-xs text-green-700 bg-green-50 p-1 rounded">
                                                                                    {check}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Dependencies */}
                                                                {task.dependencies.length > 0 && (
                                                                    <div className="mt-3 pt-3 border-t">
                                                                        <h6 className="font-medium text-purple-600 mb-2 flex items-center gap-1">
                                                                            <ArrowUpDown className="h-4 w-4" />
                                                                            Dependencies
                                                                        </h6>
                                                                        <div className="flex gap-2">
                                                                            {task.dependencies.map((depId, idx) => {
                                                                                const depTask = template.tasks.find(t => t.id === depId);
                                                                                return (
                                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                                        {depTask ? depTask.title : depId}
                                                                                    </Badge>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-4 border-t">
                                                    <Button className="flex-1" variant="outline">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Template
                                                    </Button>
                                                    <Button className="flex-1" variant="outline">
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Duplicate Template
                                                    </Button>
                                                    <Button className="flex-1" variant="outline">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Preview Work Order
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Automation Settings */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Automation Settings</CardTitle>
                                <CardDescription>Configure automated work order generation behavior</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="auto-generation">Auto Generation</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically generate work orders from triggers
                                            </p>
                                        </div>
                                        <Switch
                                            id="auto-generation"
                                            checked={autoGenerationEnabled}
                                            onCheckedChange={setAutoGenerationEnabled}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="auto-assignment">Auto Assignment</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically assign work orders to technicians
                                            </p>
                                        </div>
                                        <Switch
                                            id="auto-assignment"
                                            checked={autoAssignmentEnabled}
                                            onCheckedChange={setAutoAssignmentEnabled}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="auto-scheduling">Auto Scheduling</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically schedule work orders based on RUL
                                            </p>
                                        </div>
                                        <Switch
                                            id="auto-scheduling"
                                            checked={autoSchedulingEnabled}
                                            onCheckedChange={setAutoSchedulingEnabled}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="review-required">Review Required</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Require manual review before work order approval
                                            </p>
                                        </div>
                                        <Switch
                                            id="review-required"
                                            checked={reviewRequired}
                                            onCheckedChange={setReviewRequired}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="escalation-enabled">Auto Escalation</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically escalate unaddressed work orders
                                            </p>
                                        </div>
                                        <Switch
                                            id="escalation-enabled"
                                            checked={escalationEnabled}
                                            onCheckedChange={setEscalationEnabled}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Priority Thresholds */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Priority Thresholds</CardTitle>
                                <CardDescription>Configure RUL thresholds for priority assignment</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="critical-threshold">Critical Priority (Hours)</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Slider
                                                id="critical-threshold"
                                                value={[criticalRulThreshold]}
                                                onValueChange={([value]) => setCriticalRulThreshold(value)}
                                                max={1000}
                                                min={24}
                                                step={24}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-medium w-16">{criticalRulThreshold}h</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Work orders with RUL below this threshold will be marked as critical
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="high-threshold">High Priority (Hours)</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Slider
                                                id="high-threshold"
                                                value={[highRulThreshold]}
                                                onValueChange={([value]) => setHighRulThreshold(value)}
                                                max={2000}
                                                min={168}
                                                step={168}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-medium w-16">{highRulThreshold}h</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Work orders with RUL below this threshold will be marked as high priority
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="medium-threshold">Medium Priority (Hours)</Label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <Slider
                                                id="medium-threshold"
                                                value={[mediumRulThreshold]}
                                                onValueChange={([value]) => setMediumRulThreshold(value)}
                                                max={5000}
                                                min={720}
                                                step={720}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-medium w-16">{mediumRulThreshold}h</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Work orders with RUL below this threshold will be marked as medium priority
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default AutomatedWorkOrderGenerator; 