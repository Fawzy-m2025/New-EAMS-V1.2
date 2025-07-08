import React, { useState, useEffect } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Settings, Edit, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, getMonth, getYear, setMonth, setYear } from 'date-fns';
import { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardContent } from '@/components/ui/themed-card';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedButton } from '@/components/ui/themed-button';
import { Badge } from '@/components/ui/badge';
import { ThemedSelect, ThemedSelectItem } from '@/components/ui/themed-select';
import { useAssetContext } from '@/contexts/AssetContext';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { EquipmentType, EquipmentCategory, ConditionStatus, EquipmentStatus } from '@/types/eams';
import type { VibrationHistoryRecord, UnifiedVibrationData } from '@/data/vibrationHistoryData';
import { convertDataEntryFormToUnified, createLegacyFlatStructure, validateVibrationData } from '@/data/vibrationHistoryData';
import { allHierarchicalEquipment, zoneA } from '@/data/hierarchicalAssetData';
import { getVibrationInputColor, getVibrationTooltip, analyzeVibrationData, ISO10816_THRESHOLDS, getISO10816Zone, calcRMSVelocity } from '@/utils/vibrationUtils';

interface VibrationDataEntryFormProps {
    open: boolean;
    onClose: () => void;
    record?: VibrationHistoryRecord | null;
    readOnly?: boolean;
}

// Generate zone options from hierarchical data
const zoneOptions = [
    { value: 'A', label: 'Zone A' }
];

// Generate station options from hierarchical data with error handling
const stationOptions = (zoneA?.stations || []).map(station => ({
    value: station?.id || '',
    label: station?.name || 'Unknown Station',
    stationCode: (station?.name || '').replace('Pump Station ', '')
}));

// Generate equipment options from hierarchical data with error handling
const equipmentOptions = (allHierarchicalEquipment || []).map(equipment => ({
    value: equipment?.id || '',
    label: equipment?.name || 'Unknown Equipment',
    manufacturer: equipment?.manufacturer || '',
    model: equipment?.model || '',
    assetTag: equipment?.assetTag || '',
    category: equipment?.category || '',
    location: equipment?.location || {},
    serialNumber: equipment?.serialNumber || '',
    specifications: equipment?.specifications || {}
}));

const initialForm = {
    date: '',
    zone: '',
    selectedStation: '',
    selectedEquipment: '',
    equipmentType: '', // pump, motor, etc.
    pumpNo: '',
    motorBrand: '',
    serialNumbers: '',
    project: '',
    pumpStation: '',
    pumpBrand: '',
    operationHr: '',
    operationPower: '',
    pumpHead: '',
    pumpFlowRate: '',
    dischargeP: '',
    mainHeaderP: '',
    suctionP: '',
    fatPumpPower: '',
    ratedMotorPower: '',
    pumpId: '',
    motorId: '',
    // Hierarchical location fields
    hierarchicalLocation: '',
    equipmentCategory: '',
    manufacturer: '',
    model: '',
    assetTag: '',
    // Vibration measurements
    pump: {
        nde: { bv: '', bg: '', accV: '', accH: '', accAxl: '', velV: '', velH: '', velAxl: '', temp: '' },
        de: { bv: '', bg: '', accV: '', accH: '', accAxl: '', velV: '', velH: '', velAxl: '', temp: '' },
    },
    motor: {
        nde: { bv: '', bg: '', accV: '', accH: '', accAxl: '', velV: '', velH: '', velAxl: '', temp: '' },
        de: { bv: '', bg: '', accV: '', accH: '', accAxl: '', velV: '', velH: '', velAxl: '', temp: '' },
    },
    positions: {
        pLeg1: '', pLeg2: '', pLeg3: '', pLeg4: '',
        mLeg1: '', mLeg2: '', mLeg3: '', mLeg4: '',
    },
};

// Use standardized input color function
const getInputColor = getVibrationInputColor;

const measurementPoints = [
    { key: 'pump.nde', label: 'Pump NDE', cx: 60, cy: 100, color: '#3b82f6' },
    { key: 'pump.de', label: 'Pump DE', cx: 140, cy: 100, color: '#2563eb' },
    { key: 'motor.nde', label: 'Motor NDE', cx: 260, cy: 100, color: '#22c55e' },
    { key: 'motor.de', label: 'Motor DE', cx: 340, cy: 100, color: '#16a34a' },
];

const getUnique = (arr: any[], key: string): string[] => Array.from(new Set(arr.map(item => String(item[key]))));

// These will be derived from context data inside the component
// --- Add this mapping for zones to pump stations ---
const zoneToStations: Record<string, string[]> = {
    'A': Array.from({ length: 15 }, (_, i) => `A${i + 1}`),
    'B': Array.from({ length: 10 }, (_, i) => `B${i + 1}`), // Example for other zones
    'C': Array.from({ length: 8 }, (_, i) => `C${i + 1}`),
    'D': Array.from({ length: 5 }, (_, i) => `D${i + 1}`),
};

const VibrationDataEntryForm: React.FC<VibrationDataEntryFormProps> = ({ open, onClose, record, readOnly = false }) => {
    const { equipment, setEquipment, addVibrationHistoryEntry, triggerDataUpdate } = useAssetContext();
    const { toast } = useToast();
    const methods = useForm({ defaultValues: initialForm });
    const { control, handleSubmit, watch, setValue, formState, reset } = methods;
    const { errors } = formState;
    const values = watch();
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState<'success' | 'error' | null>(null);
    const [alertDetails, setAlertDetails] = useState<{ pumpNo?: string; date?: string }>({});
    const [activePoint, setActivePoint] = useState<string | null>(null);


    const [activeTab, setActiveTab] = useState('data');
    const [pumpBrandSuggestions, setPumpBrandSuggestions] = useState<string[]>([]);
    const [motorBrandSuggestions, setMotorBrandSuggestions] = useState<string[]>([]);
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedStation, setSelectedStation] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const [filteredStations, setFilteredStations] = useState(stationOptions);
    const [filteredEquipment, setFilteredEquipment] = useState(equipmentOptions);
    const [addMode, setAddMode] = useState(false);

    // Hierarchical equipment selection handlers
    const handleZoneChange = (zone: string) => {
        setSelectedZone(zone);
        setSelectedStation('');
        setSelectedEquipment('');
        setValue('zone', zone);
        setValue('selectedStation', '');
        setValue('selectedEquipment', '');

        // Filter stations by zone
        const stationsInZone = stationOptions.filter(station =>
            station && station.stationCode && station.stationCode.startsWith(zone)
        );
        setFilteredStations(stationsInZone);
    };

    const handleStationChange = (stationId: string) => {
        setSelectedStation(stationId);
        setSelectedEquipment('');
        setValue('selectedStation', stationId);
        setValue('selectedEquipment', '');

        // Find station details
        const station = stationOptions.find(s => s.value === stationId);
        if (station) {
            setValue('pumpStation', station.label);
        }

        // Filter equipment by station
        const equipmentInStation = equipmentOptions.filter(eq =>
            eq && eq.location && eq.location.station === station?.label
        );
        setFilteredEquipment(equipmentInStation);
    };

    const handleEquipmentChange = (equipmentId: string) => {
        setSelectedEquipment(equipmentId);
        setValue('selectedEquipment', equipmentId);

        // Find equipment details and populate form
        const equipment = equipmentOptions.find(eq => eq.value === equipmentId);
        if (equipment) {
            setValue('pumpNo', equipment.assetTag || '');
            setValue('assetTag', equipment.assetTag || '');
            setValue('manufacturer', equipment.manufacturer || '');
            setValue('model', equipment.model || '');
            setValue('serialNumbers', equipment.serialNumber || '');
            setValue('equipmentCategory', equipment.category || '');
            setValue('hierarchicalLocation',
                `${equipment.location?.zone || ''} → ${equipment.location?.station || ''} → ${equipment.location?.line || equipment.location?.system || ''}`
            );

            // Set category-specific fields
            if (equipment.category === 'pump') {
                setValue('pumpBrand', equipment.manufacturer || '');
                setValue('pumpId', equipment.value);
                setValue('pumpFlowRate', equipment.specifications?.flowRate?.toString() || '');
                setValue('pumpHead', equipment.specifications?.head?.toString() || '');
                setValue('ratedMotorPower', equipment.specifications?.ratedPower?.toString() || '');
            } else if (equipment.category === 'motor') {
                setValue('motorBrand', equipment.manufacturer || '');
                setValue('motorId', equipment.value);
                setValue('ratedMotorPower', equipment.specifications?.ratedPower?.toString() || '');
            }
        }
    };
    // Derive pumps and motors from context equipment
    const allPumps = equipment.filter(eq => eq.category === 'pump');
    const allMotors = equipment.filter(eq => eq.category === 'motor');
    const pumpBrands = getUnique(allPumps, 'manufacturer');
    const motorBrands = getUnique(allMotors, 'manufacturer');

    // NEW: Add Equipment form state
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

    // NEW: Handler for Add Equipment submit
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
        const id = `EQ-${Date.now()}`;
        setEquipment(prev => [
            ...prev,
            {
                id,
                name: newEquipment.name,
                type: newEquipment.type as EquipmentType,
                category: newEquipment.category as EquipmentCategory,
                manufacturer: newEquipment.manufacturer,
                model: newEquipment.model,
                serialNumber: newEquipment.serialNumber,
                assetTag: id,
                location: { pumpStation: newEquipment.location },
                specifications: {},
                status: newEquipment.status as EquipmentStatus,
                condition: newEquipment.condition as ConditionStatus,
                installationDate: new Date().toISOString().split('T')[0],
                warrantyExpiry: '',
                lastMaintenanceDate: '',
                nextMaintenanceDate: '',
                operatingHours: 0,
                tags: [],
                notes: '',
                conditionMonitoring: {
                    vibration: {
                        rmsVelocity: 0,
                        peakVelocity: 0,
                        displacement: 0,
                        frequency: [],
                        spectrum: [],
                        iso10816Zone: 'A',
                        measurementDate: '',
                        measuredBy: '',
                    },
                    lastUpdated: '',
                    overallCondition: newEquipment.condition as ConditionStatus,
                    alerts: [],
                },
                failureHistory: [],
                maintenanceHistory: [],
                history: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as any // Type assertion to satisfy Equipment type
        ]);
        triggerDataUpdate();
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

    // Auto-speak the overall status and AI insight when the form opens or values change
    useEffect(() => {
        if (open) {
            const pumpNdeRms = calcRMSVelocity(values.pump?.nde || {});
            const pumpDeRms = calcRMSVelocity(values.pump?.de || {});
            const motorNdeRms = calcRMSVelocity(values.motor?.nde || {});
            const motorDeRms = calcRMSVelocity(values.motor?.de || {});
            const zones = [
                getISO10816Zone(pumpNdeRms),
                getISO10816Zone(pumpDeRms),
                getISO10816Zone(motorNdeRms),
                getISO10816Zone(motorDeRms)
            ];
            const overallZone = zones.reduce((worst, current) =>
                ISO10816_THRESHOLDS.indexOf(current) > ISO10816_THRESHOLDS.indexOf(worst) ? current : worst,
                ISO10816_THRESHOLDS[0]
            );
            let aiInsight = '';
            switch (overallZone.zone) {
                case 'A':
                    aiInsight = 'Keep Operation';
                    break;
                case 'B':
                    aiInsight = 'Monitor Closely';
                    break;
                case 'C':
                    aiInsight = 'Need Maintenance';
                    break;
                case 'D':
                    aiInsight = 'Emergency - Immediately Stopped';
                    break;
                default:
                    aiInsight = 'Unknown Status';
            }
            const statusText = `Overall Status: Zone ${overallZone.zone}, ${overallZone.label}.`;
            const insightText = `AI Insight: ${aiInsight}.`;
            const utteranceStatus = new SpeechSynthesisUtterance(statusText);
            const utteranceInsight = new SpeechSynthesisUtterance(insightText);
            utteranceStatus.volume = 1.0;
            utteranceInsight.volume = 1.0;

            // Attempt to select a female voice
            const voices = window.speechSynthesis.getVoices();
            // Log available voices to console for debugging
            console.log("Available voices:", voices.map(v => ({ name: v.name, lang: v.lang })));
            const femaleVoice = voices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('woman') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('amy') || // Common female voice names
                voice.name.toLowerCase().includes('emma') ||
                voice.name.toLowerCase().includes('victoria') ||
                (voice.lang.includes('en') && !voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('man')) // Fallback to English voice excluding male
            );
            if (femaleVoice) {
                utteranceStatus.voice = femaleVoice;
                utteranceInsight.voice = femaleVoice;
                console.log("Selected female voice:", femaleVoice.name);
            } else {
                console.log("No female voice found, using default voice.");
            }

            // Cancel any ongoing speech to avoid overlap
            window.speechSynthesis.cancel();
            console.log("Speech triggered at:", new Date().toISOString());

            // Speak status first, then insight after a delay
            window.speechSynthesis.speak(utteranceStatus);
            setTimeout(() => {
                window.speechSynthesis.speak(utteranceInsight);
            }, 1500); // Increased interval of 1.5 seconds between messages
        }
    }, [open, values.pump?.nde, values.pump?.de, values.motor?.nde, values.motor?.de]);

    useEffect(() => {
        if (record) {
            // Map record fields to form fields
            reset({
                date: record.date,
                zone: record.zone,
                pumpNo: record.pumpNo,
                motorBrand: record.motorBrand,
                serialNumbers: record.serialNumbers,
                project: record.project,
                pumpStation: record.pumpStation,
                pumpBrand: record.pumpBrand,
                operationHr: record.operationHr,
                operationPower: record.operationPower,
                pumpHead: record.pumpHead,
                pumpFlowRate: record.pumpFlowRate,
                dischargeP: record.dischargeP,
                mainHeaderP: record.mainHeaderP,
                suctionP: record.suctionP,
                fatPumpPower: record.fatPumpPower,
                ratedMotorPower: record.ratedMotorPower,
                pumpId: record.equipmentId,
                motorId: record.equipmentId,
                pump: record.pumpData,
                motor: record.motorData,
                positions: record.positions,
            });
            setSelectedZone(record.zone || '');
            setSelectedStation(record.pumpStation || '');
        } else {
            reset(initialForm);
            setSelectedZone('');
            setSelectedStation('');
        }
    }, [record, reset]);

    const onSubmit = (data: any) => {
        console.log("onSubmit function triggered with data:", data);
        let hasError = Object.keys(errors).length > 0;
        setShowAlert(true);

        if (hasError) {
            setAlertType('error');
            setAlertDetails({});
            toast({
                title: "Submission Error",
                description: "Please ensure all required fields are filled. Check fields marked with a red asterisk (*).",
                variant: "destructive",
                duration: 5000,
            });
            return;
        }

        // Convert form data to unified structure
        const unifiedVibrationData = convertDataEntryFormToUnified(data);

        // Validate vibration data
        const validation = validateVibrationData(unifiedVibrationData);
        if (!validation.isValid) {
            setAlertType('error');
            setAlertDetails({});
            toast({
                title: "Validation Error",
                description: `Data validation failed: ${validation.errors.join(', ')}`,
                variant: "destructive",
                duration: 7000,
            });
            return;
        }

        // Analyze vibration data for insights
        const analysis = analyzeVibrationData(unifiedVibrationData);

        setAlertType('success');
        setAlertDetails({ pumpNo: data.pumpNo, date: data.date });

        // Create enhanced vibration history record with unified structure
        const record: VibrationHistoryRecord = {
            id: `VH-${Date.now()}`,
            equipmentId: data.pumpId || data.motorId || '',
            equipmentName: data.pumpNo || 'Unknown Equipment',
            equipmentCategory: data.equipmentCategory || 'pump',
            date: data.date,
            time: new Date().toLocaleTimeString(),

            // Unified vibration data structure
            vibrationData: unifiedVibrationData,

            // Legacy support for backward compatibility
            pumpData: data.pump,
            motorData: data.motor,
            positions: data.positions,

            // Equipment and operational details
            zone: data.zone,
            pumpNo: data.pumpNo,
            motorBrand: data.motorBrand,
            serialNumbers: data.serialNumbers,
            project: data.project,
            pumpStation: data.pumpStation,
            pumpBrand: data.pumpBrand,
            operationHr: data.operationHr,
            operationPower: data.operationPower,
            pumpHead: data.pumpHead,
            pumpFlowRate: data.pumpFlowRate,
            dischargeP: data.dischargeP,
            mainHeaderP: data.mainHeaderP,
            suctionP: data.suctionP,
            fatPumpPower: data.fatPumpPower,
            ratedMotorPower: data.ratedMotorPower,

            // AI-enhanced condition assessment
            overallCondition: analysis.worstZone.zone === 'A' ? 'excellent' :
                analysis.worstZone.zone === 'B' ? 'good' :
                    analysis.worstZone.zone === 'C' ? 'acceptable' : 'unacceptable',
            priority: analysis.alerts.some(a => a.includes('CRITICAL')) ? 'critical' :
                analysis.alerts.some(a => a.includes('WARNING')) ? 'high' : 'low',
            maintenanceRequired: analysis.worstZone.zone === 'C' || analysis.worstZone.zone === 'D',
            immediateAction: analysis.worstZone.zone === 'D',
            recommendations: analysis.recommendations.join('; '),

            // Metadata
            enteredBy: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'completed',

            // Legacy flat structure for backward compatibility
            ...createLegacyFlatStructure(unifiedVibrationData),
            vibrationRMS: analysis.overallRMS
        };
        addVibrationHistoryEntry(record);
        triggerDataUpdate();
        toast({
            title: "Submission Successful",
            description: `Vibration data logged for equipment on ${data.date}.`,
            variant: "default",
            duration: 7000,
        });
    };

    // Render bearing position input fields
    const renderPositionButtons = (prefix: 'pLeg' | 'mLeg') => (
        <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(num => (
                <Controller
                    key={prefix + num}
                    name={`positions.${prefix}${num}` as any}
                    control={control}
                    render={({ field }) => (
                        <div>
                            <Label>{prefix === 'pLeg' ? 'Pump' : 'Motor'} Leg {num}</Label>
                            <ThemedInput
                                {...field}
                                value={field.value ?? ''}
                                placeholder={`Value for Leg ${num}`}
                                className={getInputColor(field.value)}
                            />
                        </div>
                    )}
                />
            ))}
        </div>
    );

    const rmsData = [
        { label: 'Pump NDE', value: calcRMSVelocity(values.pump?.nde || {}) },
        { label: 'Pump DE', value: calcRMSVelocity(values.pump?.de || {}) },
        { label: 'Motor NDE', value: calcRMSVelocity(values.motor?.nde || {}) },
        { label: 'Motor DE', value: calcRMSVelocity(values.motor?.de || {}) },
    ];
    const chartData = {
        labels: rmsData.map(d => d.label),
        datasets: [
            {
                label: 'RMS Velocity (mm/s)',
                data: rmsData.map(d => d.value),
                backgroundColor: ['#3b82f6', '#2563eb', '#22c55e', '#16a34a'],
                borderColor: ['#1d4ed8', '#1e40af', '#15803d', '#166534'],
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const combinedTrendData = {
        labels: ['NDE', 'DE'],
        datasets: [
            {
                label: 'Pump RMS Velocity',
                data: [rmsData[0].value, rmsData[1].value],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.2)',
                tension: 0.4,
                fill: false,
            },
            {
                label: 'Motor RMS Velocity',
                data: [rmsData[2].value, rmsData[3].value],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34,197,94,0.2)',
                tension: 0.4,
                fill: false,
            },
        ],
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <form onSubmit={addMode ? handleAddEquipment : handleSubmit(onSubmit)} className="flex flex-col h-full">
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col" aria-describedby="dialog-description">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <div>
                                    <DialogTitle className="text-xl">
                                        {addMode ? 'Add New Equipment' : 'Vibration Data Entry & Trends'}
                                    </DialogTitle>
                                    <DialogDescription id="dialog-description" className="sr-only">
                                        {addMode ? 'A dialog for adding new equipment to be monitored.' : 'A dialog for entering vibration data and viewing trends for equipment monitoring.'}
                                    </DialogDescription>
                                    <p className="text-sm text-muted-foreground">
                                        {addMode ? 'Register new equipment for monitoring and analytics.' : 'Advanced vibration monitoring & analytics'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={() => setAddMode(m => !m)}>
                                    {addMode ? 'Back to Vibration Entry' : 'Add Equipment'}
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>
                    {addMode ? (
                        <div className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Name*</Label>
                                    <Input value={newEquipment.name} onChange={e => setNewEquipment({ ...newEquipment, name: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Type*</Label>
                                    <Input value={newEquipment.type} onChange={e => setNewEquipment({ ...newEquipment, type: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Category*</Label>
                                    <Input value={newEquipment.category} onChange={e => setNewEquipment({ ...newEquipment, category: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Manufacturer*</Label>
                                    <Input value={newEquipment.manufacturer} onChange={e => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Model*</Label>
                                    <Input value={newEquipment.model} onChange={e => setNewEquipment({ ...newEquipment, model: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Serial Number*</Label>
                                    <Input value={newEquipment.serialNumber} onChange={e => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })} required />
                                </div>
                                <div>
                                    <Label>Location</Label>
                                    <Input value={newEquipment.location} onChange={e => setNewEquipment({ ...newEquipment, location: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                                <TabsList className="grid w-full grid-cols-2 border">
                                    <TabsTrigger value="data" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Data Entry</TabsTrigger>
                                    <TabsTrigger value="trends" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trends</TabsTrigger>
                                </TabsList>

                                <div className="mt-4 overflow-y-auto flex-1">
                                    <TabsContent value="data" className="space-y-6">
                                        <Card className="border glass-card">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    Equipment Data
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* All equipment fields with color-coded validation */}
                                                <Controller name="date" control={control} rules={{ required: true }} render={({ field }) => (
                                                    <div>
                                                        <Label>Date <span className="text-red-500">*</span></Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <div className="relative">
                                                                    <ThemedInput
                                                                        {...field}
                                                                        readOnly
                                                                        placeholder="Select date (mm/dd/yyyy)"
                                                                        className={`${getInputColor(field.value, true)} pr-10 cursor-pointer ${errors.date ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                                        value={field.value ? format(new Date(field.value), 'MM/dd/yyyy') : ''}
                                                                    />
                                                                    <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <div className="p-2 flex gap-2 justify-center">
                                                                    <Select
                                                                        value={field.value ? String(getMonth(new Date(field.value))) : String(new Date().getMonth())}
                                                                        onValueChange={(value) => {
                                                                            const currentDate = field.value ? new Date(field.value) : new Date();
                                                                            const newDate = setMonth(currentDate, parseInt(value));
                                                                            field.onChange(format(newDate, 'yyyy-MM-dd'));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="w-[120px]">
                                                                            <SelectValue placeholder="Month" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Array.from({ length: 12 }, (_, i) => (
                                                                                <SelectItem key={i} value={String(i)}>
                                                                                    {format(new Date(2023, i, 1), 'MMM')}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <Select
                                                                        value={field.value ? String(getYear(new Date(field.value))) : String(new Date().getFullYear())}
                                                                        onValueChange={(value) => {
                                                                            const currentDate = field.value ? new Date(field.value) : new Date();
                                                                            const newDate = setYear(currentDate, parseInt(value));
                                                                            field.onChange(format(newDate, 'yyyy-MM-dd'));
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="w-[100px]">
                                                                            <SelectValue placeholder="Year" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {Array.from({ length: 50 }, (_, i) => {
                                                                                const year = new Date().getFullYear() - i;
                                                                                return (
                                                                                    <SelectItem key={year} value={String(year)}>
                                                                                        {year}
                                                                                    </SelectItem>
                                                                                );
                                                                            })}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={field.value ? new Date(field.value) : undefined}
                                                                    onSelect={(date) => {
                                                                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                                                                    }}
                                                                    initialFocus
                                                                    className="rounded-md border shadow-md"
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                        {errors.date && <p className="text-red-500 text-sm mt-1">Date is required</p>}
                                                    </div>
                                                )} />
                                                {/* Hierarchical Equipment Selection */}
                                                <div className="col-span-2">
                                                    <Label className="text-lg font-semibold">Equipment Selection</Label>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 border rounded-lg bg-muted/20">
                                                        {/* Zone Selection */}
                                                        <Controller name="zone" control={control} render={({ field }) => (
                                                            <div>
                                                                <Label>Zone <span className="text-red-500">*</span></Label>
                                                                <Select value={selectedZone} onValueChange={handleZoneChange}>
                                                                    <SelectTrigger><SelectValue placeholder="Select Zone" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {zoneOptions.map(zone => (
                                                                            <SelectItem key={zone.value} value={zone.value}>
                                                                                {String(zone.label)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )} />

                                                        {/* Station Selection */}
                                                        <Controller name="selectedStation" control={control} render={({ field }) => (
                                                            <div>
                                                                <Label>Pump Station <span className="text-red-500">*</span></Label>
                                                                <Select value={selectedStation} onValueChange={handleStationChange} disabled={!selectedZone}>
                                                                    <SelectTrigger><SelectValue placeholder="Select Station" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredStations.filter(station => station && station.value && station.label).map(station => (
                                                                            <SelectItem key={station.value} value={station.value}>
                                                                                {String(station.label)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )} />

                                                        {/* Equipment Selection */}
                                                        <Controller name="selectedEquipment" control={control} render={({ field }) => (
                                                            <div>
                                                                <Label>Equipment <span className="text-red-500">*</span></Label>
                                                                <Select value={selectedEquipment} onValueChange={handleEquipmentChange} disabled={!selectedStation}>
                                                                    <SelectTrigger><SelectValue placeholder="Select Equipment" /></SelectTrigger>
                                                                    <SelectContent>
                                                                        {filteredEquipment.filter(equipment => equipment && equipment.value && equipment.label).map(equipment => (
                                                                            <SelectItem key={equipment.value} value={equipment.value}>
                                                                                {`${equipment.label} (${equipment.manufacturer || ''} • ${equipment.category || ''} • ${equipment.assetTag || ''})`}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        )} />
                                                    </div>
                                                </div>

                                                {/* Equipment Details Display */}
                                                {selectedEquipment && (
                                                    <div className="col-span-2">
                                                        <Label className="text-lg font-semibold">Equipment Details</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-lg bg-blue-50/50">
                                                            <Controller name="hierarchicalLocation" control={control} render={({ field }) => (
                                                                <div>
                                                                    <Label>Location Path</Label>
                                                                    <ThemedInput {...field} readOnly className="bg-muted" />
                                                                </div>
                                                            )} />
                                                            <Controller name="assetTag" control={control} render={({ field }) => (
                                                                <div>
                                                                    <Label>Asset Tag</Label>
                                                                    <ThemedInput {...field} readOnly className="bg-muted" />
                                                                </div>
                                                            )} />
                                                            <Controller name="manufacturer" control={control} render={({ field }) => (
                                                                <div>
                                                                    <Label>Manufacturer</Label>
                                                                    <ThemedInput {...field} readOnly className="bg-muted" />
                                                                </div>
                                                            )} />
                                                            <Controller name="model" control={control} render={({ field }) => (
                                                                <div>
                                                                    <Label>Model</Label>
                                                                    <ThemedInput {...field} readOnly className="bg-muted" />
                                                                </div>
                                                            )} />
                                                        </div>
                                                    </div>
                                                )}
                                                <Controller name="pumpNo" control={control} rules={{ required: true }} render={({ field }) => (
                                                    <div>
                                                        <Label>Pump No. <span className="text-red-500">*</span></Label>
                                                        <ThemedInput {...field} className={`${getInputColor(field.value, true)} ${errors.pumpNo ? 'border-red-500 focus:ring-red-500' : ''}`} />
                                                        {errors.pumpNo && <p className="text-red-500 text-sm mt-1">Pump No. is required</p>}
                                                    </div>
                                                )} />
                                                <Controller name="motorBrand" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Motor Brand</Label>
                                                        <div className="relative">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <ThemedInput
                                                                        {...field}
                                                                        className={getInputColor(field.value)}
                                                                        onChange={e => {
                                                                            field.onChange(e);
                                                                            const val = e.target.value.toLowerCase();
                                                                            setMotorBrandSuggestions(val ? motorBrands.filter(b => b.toLowerCase().includes(val.toLowerCase())) : []);
                                                                        }}
                                                                        autoComplete="off"
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>Start typing to see suggestions for motor brands.</TooltipContent>
                                                            </Tooltip>
                                                            {motorBrandSuggestions.length > 0 && (
                                                                <ul className="absolute z-10 rounded shadow w-full mt-1" style={{ background: themeClasses.cardBg, border: `1px solid ${themeClasses.cardBorder}` }}>
                                                                    {motorBrandSuggestions.map(s => (
                                                                        <li key={s} className="px-3 py-1 cursor-pointer hover:opacity-80" style={{ color: themeClasses.primary }} onMouseDown={() => { field.onChange(s); setMotorBrandSuggestions([]); }}>{s}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                )} />
                                                <Controller name="serialNumbers" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Serial Numbers</Label>
                                                        <ThemedInput {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="project" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Project</Label>
                                                        <ThemedInput {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                {/* Pump Station Dropdown (dynamic) */}
                                                <Controller name="pumpStation" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Pump Station</Label>
                                                        <Select value={selectedStation} onValueChange={value => { setSelectedStation(value); field.onChange(value); }} disabled={!selectedZone}>
                                                            <SelectTrigger><SelectValue placeholder={selectedZone ? "Select Pump Station" : "Select Zone first"} /></SelectTrigger>
                                                            <SelectContent>
                                                                {filteredStations
                                                                    .filter(station => station && station.value && station.label)
                                                                    .map(station => (
                                                                        <SelectItem key={station.value} value={station.value}>{station.label}</SelectItem>
                                                                    ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )} />
                                                <Controller name="pumpBrand" control={control} render={({ field }) => (
                                                    <div className="relative">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <ThemedInput
                                                                    {...field}
                                                                    className={getInputColor(field.value)}
                                                                    onChange={e => {
                                                                        field.onChange(e);
                                                                        const val = e.target.value.toLowerCase();
                                                                        setPumpBrandSuggestions(val ? pumpBrands.filter(b => b.toLowerCase().includes(val.toLowerCase())) : []);
                                                                    }}
                                                                    autoComplete="off"
                                                                />
                                                            </TooltipTrigger>
                                                            <TooltipContent>Start typing to see suggestions for pump brands.</TooltipContent>
                                                        </Tooltip>
                                                        {pumpBrandSuggestions.length > 0 && (
                                                            <ul className="absolute z-10 rounded shadow w-full mt-1" style={{ background: themeClasses.cardBg, border: `1px solid ${themeClasses.cardBorder}` }}>
                                                                {pumpBrandSuggestions.map(s => (
                                                                    <li key={s} className="px-3 py-1 cursor-pointer hover:opacity-80" style={{ color: themeClasses.primary }} onMouseDown={() => { field.onChange(s); setPumpBrandSuggestions([]); }}>{s}</li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )} />
                                                <Controller name="operationHr" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Operation Hr</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="operationPower" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Operation Power</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="pumpHead" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Pump Head</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="pumpFlowRate" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Pump Flow Rate</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="dischargeP" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Discharge P</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="mainHeaderP" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Main Header P</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="suctionP" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Suction P</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="fatPumpPower" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>FAT Pump Power</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller name="ratedMotorPower" control={control} render={({ field }) => (
                                                    <div>
                                                        <Label>Rated Motor Power</Label>
                                                        <ThemedInput type="number" {...field} className={getInputColor(field.value)} />
                                                    </div>
                                                )} />
                                                <Controller
                                                    name="pumpId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Pump</Label>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Pump" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {allPumps.map(pump => (
                                                                        <SelectItem key={pump.id} value={pump.id}>{pump.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name="motorId"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div>
                                                            <Label>Motor</Label>
                                                            <Select value={field.value} onValueChange={field.onChange}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Motor" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {allMotors.map(motor => (
                                                                        <SelectItem key={motor.id} value={motor.id}>{motor.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                        <Card className="border glass-card">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Activity className="h-4 w-4" />
                                                    Vibration Measurements
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Pump NDE/DE */}
                                                    <div>
                                                        <h4 className="font-semibold mb-2" style={{ color: themeClasses.primary }}>Pump</h4>
                                                        <div className="mb-2 text-xs text-muted-foreground">Non-Drive End (NDE)</div>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            {['bv', 'bg', 'accV', 'accH', 'accAxl', 'velV', 'velH', 'velAxl', 'temp'].map((field) => (
                                                                <Controller
                                                                    key={`pump.nde.${field}`}
                                                                    name={`pump.nde.${field}` as any}
                                                                    control={control}
                                                                    render={({ field: f }) => (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <ThemedInput
                                                                                    {...f}
                                                                                    value={f.value ?? ''}
                                                                                    placeholder={field.toUpperCase()}
                                                                                    type="number"
                                                                                    className={getInputColor(f.value)}
                                                                                    onFocus={() => setActivePoint('pump.nde')}
                                                                                    onBlur={() => setActivePoint(null)}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {getVibrationTooltip(field, ['velV', 'velH', 'velAxl'].includes(field) ? 'velocity' :
                                                                                    ['accV', 'accH', 'accAxl'].includes(field) ? 'acceleration' :
                                                                                        field === 'temp' ? 'temperature' : 'velocity')}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* Live RMS and ISO 10816 zone for Pump NDE */}
                                                        {(() => {
                                                            const nde = values.pump?.nde || {};
                                                            const rms = calcRMSVelocity(nde);
                                                            const zone = getISO10816Zone(rms);
                                                            return (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="font-semibold">RMS Velocity:</span>
                                                                    <span className="font-mono">{rms.toFixed(2)} mm/s</span>
                                                                    <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>Zone {zone.zone} ({zone.label})</Badge>
                                                                    {zone.zone === 'D' && <span className="text-red-600 font-semibold ml-2">Warning: Unacceptable!</span>}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="mb-2 text-xs text-muted-foreground">Drive End (DE)</div>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            {['bv', 'bg', 'accV', 'accH', 'accAxl', 'velV', 'velH', 'velAxl', 'temp'].map((field) => (
                                                                <Controller
                                                                    key={`pump.de.${field}`}
                                                                    name={`pump.de.${field}` as any}
                                                                    control={control}
                                                                    render={({ field: f }) => (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <ThemedInput
                                                                                    {...f}
                                                                                    value={f.value ?? ''}
                                                                                    placeholder={field.toUpperCase()}
                                                                                    type="number"
                                                                                    className={getInputColor(f.value)}
                                                                                    onFocus={() => setActivePoint('pump.de')}
                                                                                    onBlur={() => setActivePoint(null)}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {getVibrationTooltip(field, ['velV', 'velH', 'velAxl'].includes(field) ? 'velocity' :
                                                                                    ['accV', 'accH', 'accAxl'].includes(field) ? 'acceleration' :
                                                                                        field === 'temp' ? 'temperature' : 'velocity')}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* Live RMS and ISO 10816 zone for Pump DE */}
                                                        {(() => {
                                                            const de = values.pump?.de || {};
                                                            const rms = calcRMSVelocity(de);
                                                            const zone = getISO10816Zone(rms);
                                                            return (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="font-semibold">RMS Velocity:</span>
                                                                    <span className="font-mono">{rms.toFixed(2)} mm/s</span>
                                                                    <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>Zone {zone.zone} ({zone.label})</Badge>
                                                                    {zone.zone === 'D' && <span className="text-red-600 font-semibold ml-2">Warning: Unacceptable!</span>}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="mb-2">{renderPositionButtons('pLeg')}</div>
                                                    </div>
                                                    {/* Motor NDE/DE */}
                                                    <div>
                                                        <h4 className="font-semibold mb-2" style={{ color: themeClasses.primary }}>Motor</h4>
                                                        <div className="mb-2 text-xs text-muted-foreground">Non-Drive End (NDE)</div>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            {['bv', 'bg', 'accV', 'accH', 'accAxl', 'velV', 'velH', 'velAxl', 'temp'].map((field) => (
                                                                <Controller
                                                                    key={`motor.nde.${field}`}
                                                                    name={`motor.nde.${field}` as any}
                                                                    control={control}
                                                                    render={({ field: f }) => (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <ThemedInput
                                                                                    {...f}
                                                                                    value={f.value ?? ''}
                                                                                    placeholder={field.toUpperCase()}
                                                                                    type="number"
                                                                                    className={getInputColor(f.value)}
                                                                                    onFocus={() => setActivePoint('motor.nde')}
                                                                                    onBlur={() => setActivePoint(null)}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {getVibrationTooltip(field, ['velV', 'velH', 'velAxl'].includes(field) ? 'velocity' :
                                                                                    ['accV', 'accH', 'accAxl'].includes(field) ? 'acceleration' :
                                                                                        field === 'temp' ? 'temperature' : 'velocity')}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* Live RMS and ISO 10816 zone for Motor NDE */}
                                                        {(() => {
                                                            const nde = values.motor?.nde || {};
                                                            const rms = calcRMSVelocity(nde);
                                                            const zone = getISO10816Zone(rms);
                                                            return (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="font-semibold">RMS Velocity:</span>
                                                                    <span className="font-mono">{rms.toFixed(2)} mm/s</span>
                                                                    <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>Zone {zone.zone} ({zone.label})</Badge>
                                                                    {zone.zone === 'D' && <span className="text-red-600 font-semibold ml-2">Warning: Unacceptable!</span>}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="mb-2 text-xs text-muted-foreground">Drive End (DE)</div>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            {['bv', 'bg', 'accV', 'accH', 'accAxl', 'velV', 'velH', 'velAxl', 'temp'].map((field) => (
                                                                <Controller
                                                                    key={`motor.de.${field}`}
                                                                    name={`motor.de.${field}` as any}
                                                                    control={control}
                                                                    render={({ field: f }) => (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <ThemedInput
                                                                                    {...f}
                                                                                    value={f.value ?? ''}
                                                                                    placeholder={field.toUpperCase()}
                                                                                    type="number"
                                                                                    className={getInputColor(f.value)}
                                                                                    onFocus={() => setActivePoint('motor.de')}
                                                                                    onBlur={() => setActivePoint(null)}
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {getVibrationTooltip(field, ['velV', 'velH', 'velAxl'].includes(field) ? 'velocity' :
                                                                                    ['accV', 'accH', 'accAxl'].includes(field) ? 'acceleration' :
                                                                                        field === 'temp' ? 'temperature' : 'velocity')}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        {/* Live RMS and ISO 10816 zone for Motor DE */}
                                                        {(() => {
                                                            const de = values.motor?.de || {};
                                                            const rms = calcRMSVelocity(de);
                                                            const zone = getISO10816Zone(rms);
                                                            return (
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="font-semibold">RMS Velocity:</span>
                                                                    <span className="font-mono">{rms.toFixed(2)} mm/s</span>
                                                                    <Badge className={`px-2 py-1 rounded text-xs font-bold ${zone.color}`}>Zone {zone.zone} ({zone.label})</Badge>
                                                                    {zone.zone === 'D' && <span className="text-red-600 font-semibold ml-2">Warning: Unacceptable!</span>}
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="mb-2">{renderPositionButtons('mLeg')}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    {/* Trends Tab */}
                                    <TabsContent value="trends" className="space-y-6">
                                        <Card className="border glass-card">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4" />
                                                    Vibration Trends
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                <EnhancedChart
                                                    title="RMS Velocity (Current Readings)"
                                                    type="bar"
                                                    data={chartData}
                                                    height={200}
                                                />
                                                <EnhancedChart
                                                    title="Pump & Motor RMS Velocity Trend"
                                                    type="line"
                                                    data={combinedTrendData}
                                                    height={220}
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    )}
                    {/* Footer always at the bottom */}
                    <div className="flex justify-end gap-2 border-t pt-4 bg-background mt-4">
                        {!readOnly && <Button type="submit">Submit</Button>}
                        <Button type="button" variant="secondary" onClick={() => {
                            console.log("Close button clicked");
                            toast({
                                title: "Closing",
                                description: "Close button clicked.",
                            });
                            onClose();
                        }}>Close</Button>
                    </div>
                    <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                        <AlertDialogContent className="sm:max-w-[500px] p-8 rounded-lg border-2 border-blue-600 shadow-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-3xl font-extrabold mb-2 text-center">{alertType === 'error' ? 'Submission Failed' : 'Submission Successful!'}</AlertDialogTitle>
                                <AlertDialogDescription className="text-lg text-center">
                                    {alertType === 'error' ? (
                                        <span className="text-red-600 font-semibold block text-xl">Please ensure all required fields are filled. Required fields are marked with a red asterisk (*).</span>
                                    ) : (
                                        <span className="text-green-600 font-semibold block text-xl">Vibration data for <b>Pump No. {alertDetails.pumpNo}</b> has been recorded on <b>{alertDetails.date}</b>.<br />All analytics have been updated. Check the Trends tab for detailed insights.</span>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex justify-center mt-4">
                                <AlertDialogAction className="bg-blue-600 hover:bg-blue-700 text-xl px-8 py-3 rounded-lg" onClick={() => {
                                    setShowAlert(false);
                                    if (alertType === 'success') {
                                        onClose();
                                    }
                                }}>Understood</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DialogContent>
            </form>
        </Dialog>
    );
};

export default VibrationDataEntryForm;
