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

interface VibrationDataEntryFormProps {
    open: boolean;
    onClose: () => void;
}

const zoneOptions = [
    { value: 'A', label: 'Zone A' },
    { value: 'B', label: 'Zone B' },
    { value: 'C', label: 'Zone C' },
    { value: 'D', label: 'Zone D' },
];

const initialForm = {
    date: '',
    zone: '',
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

const getInputColor = (value: string, required = false) => {
    if (!value && required) return 'border-red-500 focus:ring-red-500';
    if (value) return 'border-green-500 focus:ring-green-500';
    return '';
};

// ISO 10816 thresholds (example for demonstration)
const ISO10816_THRESHOLDS = [
    { zone: 'A', max: 1.8, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Good' },
    { zone: 'B', max: 4.5, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Satisfactory' },
    { zone: 'C', max: 7.1, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', label: 'Unsatisfactory' },
    { zone: 'D', max: Infinity, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Unacceptable' },
];

function getISO10816Zone(rms: number) {
    return ISO10816_THRESHOLDS.find(z => rms <= z.max) || ISO10816_THRESHOLDS[ISO10816_THRESHOLDS.length - 1];
}

function calcRMSVelocity(values: any) {
    // Example: use velV, velH, velAxl for RMS calculation
    const v = [values.velV, values.velH, values.velAxl].map(Number).filter(x => !isNaN(x));
    if (v.length === 0) return 0;
    return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0) / v.length);
}

const measurementPoints = [
    { key: 'pump.nde', label: 'Pump NDE', cx: 60, cy: 100, color: '#3b82f6' },
    { key: 'pump.de', label: 'Pump DE', cx: 140, cy: 100, color: '#2563eb' },
    { key: 'motor.nde', label: 'Motor NDE', cx: 260, cy: 100, color: '#22c55e' },
    { key: 'motor.de', label: 'Motor DE', cx: 340, cy: 100, color: '#16a34a' },
];

const pumpBrands = ['Grundfos', 'KSB', 'Sulzer', 'Wilo', 'Ebara'];
const motorBrands = ['Siemens', 'ABB', 'WEG', 'Baldor', 'Toshiba'];

const VibrationDataEntryForm: React.FC<VibrationDataEntryFormProps> = ({ open, onClose }) => {
    const methods = useForm({ defaultValues: initialForm });
    const { control, handleSubmit, watch, setValue, formState } = methods;
    const values = watch();
    const [activePoint, setActivePoint] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('data');
    const [pumpBrandSuggestions, setPumpBrandSuggestions] = useState<string[]>([]);
    const [motorBrandSuggestions, setMotorBrandSuggestions] = useState<string[]>([]);
    const { getThemeClasses } = useThemeColors();
    const themeClasses = getThemeClasses();

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

    const onSubmit = (data: any) => {
        // TODO: Save or process the data
        onClose();
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
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden" aria-describedby="dialog-description">
<DialogHeader>
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-blue-600" />
            <div>
                <DialogTitle className="text-xl">Vibration Data Entry & Trends</DialogTitle>
                <DialogDescription id="dialog-description" className="sr-only">A dialog for entering vibration data and viewing trends for equipment monitoring.</DialogDescription>
                <p className="text-sm text-muted-foreground">Advanced vibration monitoring & analytics</p>
            </div>
        </div>
<div className="flex items-center gap-2">
    {(() => {
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
        let aiColor = '';
        switch (overallZone.zone) {
            case 'A':
                aiInsight = 'Keep Operation';
                aiColor = 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
                break;
            case 'B':
                aiInsight = 'Monitor Closely';
                aiColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                break;
            case 'C':
                aiInsight = 'Need Maintenance';
                aiColor = 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
                break;
            case 'D':
                aiInsight = 'Emergency - Immediately Stopped';
                aiColor = 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
                break;
            default:
                aiInsight = 'Unknown Status';
                aiColor = 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
        return (
            <>
                <Badge className={`px-3 py-1 rounded text-sm font-bold ${overallZone.color}`}>
                    Overall Status: Zone {overallZone.zone} ({overallZone.label})
                </Badge>
                <Badge className={`px-3 py-1 rounded text-sm font-bold ${aiColor}`}>
                    AI Insight: {aiInsight}
                </Badge>
            </>
        );
    })()}
</div>
    </div>
</DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-2 border">
                        <TabsTrigger value="data" className="flex items-center gap-2"><Settings className="h-4 w-4" /> Data Entry</TabsTrigger>
                        <TabsTrigger value="trends" className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Trends</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 overflow-y-auto max-h-[calc(95vh-200px)]">
                        {/* Data Entry Tab */}
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
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <div className="relative">
                                                        <ThemedInput
                                                            {...field}
                                                            readOnly
                                                            placeholder="Select date (mm/dd/yyyy)"
                                                            className={`${getInputColor(field.value, true)} pr-10 cursor-pointer`}
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
                                        </div>
                                    )} />
                                    <Controller name="zone" control={control} rules={{ required: true }} render={({ field }) => (
                                        <div>
                                            <Label>Zone</Label>
                                            <ThemedSelect value={field.value} onValueChange={field.onChange} className={getInputColor(field.value, true)}>
                                                {zoneOptions.map(opt => (
                                                    <ThemedSelectItem key={opt.value} value={opt.value}>{opt.label}</ThemedSelectItem>
                                                ))}
                                            </ThemedSelect>
                                        </div>
                                    )} />
                                    <Controller name="pumpNo" control={control} rules={{ required: true }} render={({ field }) => (
                                        <div>
                                            <Label>Pump No.</Label>
                                            <ThemedInput {...field} className={getInputColor(field.value, true)} />
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
                                                                setMotorBrandSuggestions(val ? motorBrands.filter(b => b.toLowerCase().includes(val)) : []);
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
                                    <Controller name="pumpStation" control={control} render={({ field }) => (
                                        <div>
                                            <Label>Pump Station</Label>
                                            <ThemedInput {...field} className={getInputColor(field.value)} />
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
                                                            setPumpBrandSuggestions(val ? pumpBrands.filter(b => b.toLowerCase().includes(val)) : []);
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
                                                                        value={typeof f.value === 'boolean' || typeof f.value === 'object' ? '' : f.value || ''}
                                                                        placeholder={field.toUpperCase()}
                                                                        type="number"
                                                                        className={getInputColor(f.value)}
                                                                        onFocus={() => setActivePoint('pump.nde')}
                                                                        onBlur={() => setActivePoint(null)}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span className="font-semibold">{field.toUpperCase()}</span><br />
                                                                    {['velV', 'velH', 'velAxl'].includes(field) ? (
                                                                        <>Enter velocity (mm/s). ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D greater than 7.1</>
                                                                    ) : (
                                                                        <>Enter {field.toUpperCase()} value.</>
                                                                    )}
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
                                                                        value={typeof f.value === 'boolean' || typeof f.value === 'object' ? '' : f.value || ''}
                                                                        placeholder={field.toUpperCase()}
                                                                        type="number"
                                                                        className={getInputColor(f.value)}
                                                                        onFocus={() => setActivePoint('pump.de')}
                                                                        onBlur={() => setActivePoint(null)}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span className="font-semibold">{field.toUpperCase()}</span><br />
                                                                    {['velV', 'velH', 'velAxl'].includes(field) ? (
                                                                        <>Enter velocity (mm/s). ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D greater than 7.1</>
                                                                    ) : (
                                                                        <>Enter {field.toUpperCase()} value.</>
                                                                    )}
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
                                                                        value={typeof f.value === 'boolean' || typeof f.value === 'object' ? '' : f.value || ''}
                                                                        placeholder={field.toUpperCase()}
                                                                        type="number"
                                                                        className={getInputColor(f.value)}
                                                                        onFocus={() => setActivePoint('motor.nde')}
                                                                        onBlur={() => setActivePoint(null)}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span className="font-semibold">{field.toUpperCase()}</span><br />
                                                                    {['velV', 'velH', 'velAxl'].includes(field) ? (
                                                                        <>Enter velocity (mm/s). ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D greater than 7.1</>
                                                                    ) : (
                                                                        <>Enter {field.toUpperCase()} value.</>
                                                                    )}
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
                                                                        value={typeof f.value === 'boolean' || typeof f.value === 'object' ? '' : f.value || ''}
                                                                        placeholder={field.toUpperCase()}
                                                                        type="number"
                                                                        className={getInputColor(f.value)}
                                                                        onFocus={() => setActivePoint('motor.de')}
                                                                        onBlur={() => setActivePoint(null)}
                                                                    />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <span className="font-semibold">{field.toUpperCase()}</span><br />
                                                                    {['velV', 'velH', 'velAxl'].includes(field) ? (
                                                                        <>Enter velocity (mm/s). ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D greater than 7.1</>
                                                                    ) : (
                                                                        <>Enter {field.toUpperCase()} value.</>
                                                                    )}
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
            </DialogContent>
        </Dialog>
    );
};

export default VibrationDataEntryForm;
