// Vibration history data structure for logging all vibration form submissions
import { allHierarchicalEquipment } from './hierarchicalAssetData';

// Unified vibration measurement structure for both forms
export interface VibrationMeasurementPoint {
    // Core measurements (compatible with both forms)
    bv?: string | number;           // Bearing vibration (VibrationDataEntryForm)
    bg?: string | number;           // Bearing gap (VibrationDataEntryForm)
    accV?: string | number;         // Acceleration Vertical (VibrationDataEntryForm)
    accH?: string | number;         // Acceleration Horizontal (VibrationDataEntryForm)
    accAxl?: string | number;       // Acceleration Axial (VibrationDataEntryForm)
    velV?: string | number;         // Velocity Vertical (VibrationDataEntryForm)
    velH?: string | number;         // Velocity Horizontal (VibrationDataEntryForm)
    velAxl?: string | number;       // Velocity Axial (VibrationDataEntryForm)
    temp?: string | number;         // Temperature (VibrationDataEntryForm)

    // Enhanced measurements (EnhancedVibrationForm compatibility)
    velocity?: string | number;     // Overall velocity
    acceleration?: string | number; // Overall acceleration
    displacement?: string | number; // Overall displacement
    temperature?: string | number;  // Temperature (enhanced form)
    velocityH?: string | number;    // Velocity Horizontal (enhanced form)
    velocityV?: string | number;    // Velocity Vertical (enhanced form)
    velocityA?: string | number;    // Velocity Axial (enhanced form)
    accelerationH?: string | number; // Acceleration Horizontal (enhanced form)
    accelerationV?: string | number; // Acceleration Vertical (enhanced form)
    accelerationA?: string | number; // Acceleration Axial (enhanced form)
    displacementH?: string | number; // Displacement Horizontal (enhanced form)
    displacementV?: string | number; // Displacement Vertical (enhanced form)
    displacementA?: string | number; // Displacement Axial (enhanced form)
}

export interface VibrationEquipmentData {
    nde: VibrationMeasurementPoint;  // Non-Drive End
    de: VibrationMeasurementPoint;   // Drive End
}

export interface UnifiedVibrationData {
    pump?: VibrationEquipmentData;
    motor?: VibrationEquipmentData;
    compressor?: VibrationEquipmentData;
    positions?: {
        pLeg1?: string | boolean;
        pLeg2?: string | boolean;
        pLeg3?: string | boolean;
        pLeg4?: string | boolean;
        mLeg1?: string | boolean;
        mLeg2?: string | boolean;
        mLeg3?: string | boolean;
        mLeg4?: string | boolean;
    };
}

// Enhanced vibration history record with unified structure
export interface VibrationHistoryRecord {
    id: string;
    equipmentId: string;
    equipmentName?: string;
    equipmentCategory?: string;
    date: string;
    time?: string;

    // Unified vibration data structure
    vibrationData: UnifiedVibrationData;

    // Legacy support (for backward compatibility)
    pumpData?: any;
    motorData?: any;
    positions?: any;

    // Equipment and operational details
    zone: string;
    pumpNo: string;
    motorBrand: string;
    serialNumbers: string;
    project: string;
    pumpStation: string;
    pumpBrand: string;
    operationHr: string;
    operationPower: string;
    pumpHead: string;
    pumpFlowRate: string;
    dischargeP: string;
    mainHeaderP: string;
    suctionP: string;
    fatPumpPower: string;
    ratedMotorPower: string;

    // Enhanced operational data (from EnhancedVibrationForm)
    operator?: string;
    shift?: string;
    operatingHours?: string;
    operatingSpeed?: string;
    operatingTemperature?: string;
    operatingPressure?: string;
    operatingFlow?: string;
    operatingVoltage?: string;
    operatingCurrent?: string;
    operatingFrequency?: string;
    operatingEfficiency?: string;
    ambientTemperature?: string;
    humidity?: string;
    vibrationLevel?: string;
    noiseLevel?: string;
    suctionPressure?: string;
    dischargePressure?: string;
    flowRate?: string;
    head?: string;
    powerConsumption?: string;
    efficiency?: string;

    // AI Assessment data (from EnhancedVibrationForm)
    overallCondition?: 'excellent' | 'good' | 'acceptable' | 'unacceptable' | 'critical' | 'unknown';
    priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
    maintenanceRequired?: boolean;
    immediateAction?: boolean;
    nextInspectionDate?: string;
    recommendations?: string;
    notes?: string;

    // Metadata
    enteredBy?: string;
    createdAt?: string;
    updatedAt?: string;
    status?: string;

    // Legacy flat structure (for backward compatibility)
    pumpNDE_bv?: string;
    pumpNDE_bg?: string;
    pumpNDE_accV?: string;
    pumpNDE_accH?: string;
    pumpNDE_accAxl?: string;
    pumpNDE_velV?: string;
    pumpNDE_velH?: string;
    pumpNDE_velAxl?: string;
    pumpNDE_temp?: string;
    pumpDE_bv?: string;
    pumpDE_bg?: string;
    pumpDE_accV?: string;
    pumpDE_accH?: string;
    pumpDE_accAxl?: string;
    pumpDE_velV?: string;
    pumpDE_velH?: string;
    pumpDE_velAxl?: string;
    pumpDE_temp?: string;
    motorNDE_bv?: string;
    motorNDE_bg?: string;
    motorNDE_accV?: string;
    motorNDE_accH?: string;
    motorNDE_accAxl?: string;
    motorNDE_velV?: string;
    motorNDE_velH?: string;
    motorNDE_velAxl?: string;
    motorNDE_temp?: string;
    motorDE_bv?: string;
    motorDE_bg?: string;
    motorDE_accV?: string;
    motorDE_accH?: string;
    motorDE_accAxl?: string;
    motorDE_velV?: string;
    motorDE_velH?: string;
    motorDE_velAxl?: string;
    motorDE_temp?: string;
    vibrationRMS?: number;
}

// Utility functions for vibration data transformation and synchronization

/**
 * Converts VibrationDataEntryForm data to unified structure
 */
export function convertDataEntryFormToUnified(formData: any): UnifiedVibrationData {
    return {
        pump: formData.pump ? {
            nde: {
                bv: formData.pump.nde?.bv,
                bg: formData.pump.nde?.bg,
                accV: formData.pump.nde?.accV,
                accH: formData.pump.nde?.accH,
                accAxl: formData.pump.nde?.accAxl,
                velV: formData.pump.nde?.velV,
                velH: formData.pump.nde?.velH,
                velAxl: formData.pump.nde?.velAxl,
                temp: formData.pump.nde?.temp,
                // Map to enhanced form fields for compatibility
                velocityV: formData.pump.nde?.velV,
                velocityH: formData.pump.nde?.velH,
                velocityA: formData.pump.nde?.velAxl,
                accelerationV: formData.pump.nde?.accV,
                accelerationH: formData.pump.nde?.accH,
                accelerationA: formData.pump.nde?.accAxl,
                temperature: formData.pump.nde?.temp
            },
            de: {
                bv: formData.pump.de?.bv,
                bg: formData.pump.de?.bg,
                accV: formData.pump.de?.accV,
                accH: formData.pump.de?.accH,
                accAxl: formData.pump.de?.accAxl,
                velV: formData.pump.de?.velV,
                velH: formData.pump.de?.velH,
                velAxl: formData.pump.de?.velAxl,
                temp: formData.pump.de?.temp,
                // Map to enhanced form fields for compatibility
                velocityV: formData.pump.de?.velV,
                velocityH: formData.pump.de?.velH,
                velocityA: formData.pump.de?.velAxl,
                accelerationV: formData.pump.de?.accV,
                accelerationH: formData.pump.de?.accH,
                accelerationA: formData.pump.de?.accAxl,
                temperature: formData.pump.de?.temp
            }
        } : undefined,
        motor: formData.motor ? {
            nde: {
                bv: formData.motor.nde?.bv,
                bg: formData.motor.nde?.bg,
                accV: formData.motor.nde?.accV,
                accH: formData.motor.nde?.accH,
                accAxl: formData.motor.nde?.accAxl,
                velV: formData.motor.nde?.velV,
                velH: formData.motor.nde?.velH,
                velAxl: formData.motor.nde?.velAxl,
                temp: formData.motor.nde?.temp,
                // Map to enhanced form fields for compatibility
                velocityV: formData.motor.nde?.velV,
                velocityH: formData.motor.nde?.velH,
                velocityA: formData.motor.nde?.velAxl,
                accelerationV: formData.motor.nde?.accV,
                accelerationH: formData.motor.nde?.accH,
                accelerationA: formData.motor.nde?.accAxl,
                temperature: formData.motor.nde?.temp
            },
            de: {
                bv: formData.motor.de?.bv,
                bg: formData.motor.de?.bg,
                accV: formData.motor.de?.accV,
                accH: formData.motor.de?.accH,
                accAxl: formData.motor.de?.accAxl,
                velV: formData.motor.de?.velV,
                velH: formData.motor.de?.velH,
                velAxl: formData.motor.de?.velAxl,
                temp: formData.motor.de?.temp,
                // Map to enhanced form fields for compatibility
                velocityV: formData.motor.de?.velV,
                velocityH: formData.motor.de?.velH,
                velocityA: formData.motor.de?.velAxl,
                accelerationV: formData.motor.de?.accV,
                accelerationH: formData.motor.de?.accH,
                accelerationA: formData.motor.de?.accAxl,
                temperature: formData.motor.de?.temp
            }
        } : undefined,
        positions: formData.positions
    };
}

/**
 * Converts EnhancedVibrationForm data to unified structure
 */
export function convertEnhancedFormToUnified(formData: any): UnifiedVibrationData {
    const vibrationData = formData.vibrationData || {};

    return {
        pump: vibrationData.pump ? {
            nde: {
                // Enhanced form fields
                velocity: vibrationData.pump.nde?.velocity,
                acceleration: vibrationData.pump.nde?.acceleration,
                displacement: vibrationData.pump.nde?.displacement,
                temperature: vibrationData.pump.nde?.temperature,
                velocityH: vibrationData.pump.nde?.velocityH,
                velocityV: vibrationData.pump.nde?.velocityV,
                velocityA: vibrationData.pump.nde?.velocityA,
                accelerationH: vibrationData.pump.nde?.accelerationH,
                accelerationV: vibrationData.pump.nde?.accelerationV,
                accelerationA: vibrationData.pump.nde?.accelerationA,
                displacementH: vibrationData.pump.nde?.displacementH,
                displacementV: vibrationData.pump.nde?.displacementV,
                displacementA: vibrationData.pump.nde?.displacementA,
                // Map to data entry form fields for compatibility
                velV: vibrationData.pump.nde?.velocityV,
                velH: vibrationData.pump.nde?.velocityH,
                velAxl: vibrationData.pump.nde?.velocityA,
                accV: vibrationData.pump.nde?.accelerationV,
                accH: vibrationData.pump.nde?.accelerationH,
                accAxl: vibrationData.pump.nde?.accelerationA,
                temp: vibrationData.pump.nde?.temperature
            },
            de: {
                // Enhanced form fields
                velocity: vibrationData.pump.de?.velocity,
                acceleration: vibrationData.pump.de?.acceleration,
                displacement: vibrationData.pump.de?.displacement,
                temperature: vibrationData.pump.de?.temperature,
                velocityH: vibrationData.pump.de?.velocityH,
                velocityV: vibrationData.pump.de?.velocityV,
                velocityA: vibrationData.pump.de?.velocityA,
                accelerationH: vibrationData.pump.de?.accelerationH,
                accelerationV: vibrationData.pump.de?.accelerationV,
                accelerationA: vibrationData.pump.de?.accelerationA,
                displacementH: vibrationData.pump.de?.displacementH,
                displacementV: vibrationData.pump.de?.displacementV,
                displacementA: vibrationData.pump.de?.displacementA,
                // Map to data entry form fields for compatibility
                velV: vibrationData.pump.de?.velocityV,
                velH: vibrationData.pump.de?.velocityH,
                velAxl: vibrationData.pump.de?.velocityA,
                accV: vibrationData.pump.de?.accelerationV,
                accH: vibrationData.pump.de?.accelerationH,
                accAxl: vibrationData.pump.de?.accelerationA,
                temp: vibrationData.pump.de?.temperature
            }
        } : undefined,
        motor: vibrationData.motor ? {
            nde: {
                // Enhanced form fields
                velocity: vibrationData.motor.nde?.velocity,
                acceleration: vibrationData.motor.nde?.acceleration,
                displacement: vibrationData.motor.nde?.displacement,
                temperature: vibrationData.motor.nde?.temperature,
                velocityH: vibrationData.motor.nde?.velocityH,
                velocityV: vibrationData.motor.nde?.velocityV,
                velocityA: vibrationData.motor.nde?.velocityA,
                accelerationH: vibrationData.motor.nde?.accelerationH,
                accelerationV: vibrationData.motor.nde?.accelerationV,
                accelerationA: vibrationData.motor.nde?.accelerationA,
                displacementH: vibrationData.motor.nde?.displacementH,
                displacementV: vibrationData.motor.nde?.displacementV,
                displacementA: vibrationData.motor.nde?.displacementA,
                // Map to data entry form fields for compatibility
                velV: vibrationData.motor.nde?.velocityV,
                velH: vibrationData.motor.nde?.velocityH,
                velAxl: vibrationData.motor.nde?.velocityA,
                accV: vibrationData.motor.nde?.accelerationV,
                accH: vibrationData.motor.nde?.accelerationH,
                accAxl: vibrationData.motor.nde?.accelerationA,
                temp: vibrationData.motor.nde?.temperature
            },
            de: {
                // Enhanced form fields
                velocity: vibrationData.motor.de?.velocity,
                acceleration: vibrationData.motor.de?.acceleration,
                displacement: vibrationData.motor.de?.displacement,
                temperature: vibrationData.motor.de?.temperature,
                velocityH: vibrationData.motor.de?.velocityH,
                velocityV: vibrationData.motor.de?.velocityV,
                velocityA: vibrationData.motor.de?.velocityA,
                accelerationH: vibrationData.motor.de?.accelerationH,
                accelerationV: vibrationData.motor.de?.accelerationV,
                accelerationA: vibrationData.motor.de?.accelerationA,
                displacementH: vibrationData.motor.de?.displacementH,
                displacementV: vibrationData.motor.de?.displacementV,
                displacementA: vibrationData.motor.de?.displacementA,
                // Map to data entry form fields for compatibility
                velV: vibrationData.motor.de?.velocityV,
                velH: vibrationData.motor.de?.velocityH,
                velAxl: vibrationData.motor.de?.velocityA,
                accV: vibrationData.motor.de?.accelerationV,
                accH: vibrationData.motor.de?.accelerationH,
                accAxl: vibrationData.motor.de?.accelerationA,
                temp: vibrationData.motor.de?.temperature
            }
        } : undefined,
        compressor: vibrationData.compressor ? {
            nde: vibrationData.compressor.nde,
            de: vibrationData.compressor.de
        } : undefined
    };
}

/**
 * Standardized ISO 10816 thresholds and zone definitions
 */
export const ISO10816_THRESHOLDS = [
    { zone: 'A', max: 1.8, color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Good' },
    { zone: 'B', max: 4.5, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Satisfactory' },
    { zone: 'C', max: 7.1, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400', label: 'Unsatisfactory' },
    { zone: 'D', max: Infinity, color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Unacceptable' },
];

/**
 * Standardized ISO 10816 zone calculation
 */
export function getISO10816Zone(rms: number) {
    // Validate input
    if (isNaN(rms) || !isFinite(rms) || rms < 0) {
        return ISO10816_THRESHOLDS[0]; // Return Zone A for invalid inputs
    }

    return ISO10816_THRESHOLDS.find(z => rms <= z.max) || ISO10816_THRESHOLDS[ISO10816_THRESHOLDS.length - 1];
}

/**
 * Standardized RMS velocity calculation for both forms
 */
export function calcRMSVelocity(values: VibrationMeasurementPoint | any): number {
    if (!values) return 0;

    // Helper function to safely parse and validate numbers
    const safeParseFloat = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
        return isNaN(parsed) || !isFinite(parsed) || parsed < 0 ? null : parsed;
    };

    // Try different field combinations for compatibility
    let velocities: number[] = [];

    // VibrationDataEntryForm format
    if (values.velV !== undefined || values.velH !== undefined || values.velAxl !== undefined) {
        velocities = [values.velV, values.velH, values.velAxl]
            .map(v => safeParseFloat(v))
            .filter(x => x !== null) as number[];
    }

    // EnhancedVibrationForm format
    if (velocities.length === 0 && (values.velocityV !== undefined || values.velocityH !== undefined || values.velocityA !== undefined)) {
        velocities = [values.velocityV, values.velocityH, values.velocityA]
            .map(v => safeParseFloat(v))
            .filter(x => x !== null) as number[];
    }

    // Fallback to overall velocity
    if (velocities.length === 0 && values.velocity !== undefined) {
        const vel = safeParseFloat(values.velocity);
        if (vel !== null) velocities = [vel];
    }

    if (velocities.length === 0) return 0;

    // Calculate RMS with additional safety checks
    const sumOfSquares = velocities.reduce((sum, x) => sum + x * x, 0);
    const rms = Math.sqrt(sumOfSquares / velocities.length);

    // Return 0 if result is invalid
    return isNaN(rms) || !isFinite(rms) ? 0 : rms;
}

/**
 * Create legacy flat structure for backward compatibility
 */
export function createLegacyFlatStructure(vibrationData: UnifiedVibrationData): Partial<VibrationHistoryRecord> {
    const legacy: Partial<VibrationHistoryRecord> = {};

    if (vibrationData.pump?.nde) {
        const nde = vibrationData.pump.nde;
        legacy.pumpNDE_bv = String(nde.bv || '');
        legacy.pumpNDE_bg = String(nde.bg || '');
        legacy.pumpNDE_accV = String(nde.accV || nde.accelerationV || '');
        legacy.pumpNDE_accH = String(nde.accH || nde.accelerationH || '');
        legacy.pumpNDE_accAxl = String(nde.accAxl || nde.accelerationA || '');
        legacy.pumpNDE_velV = String(nde.velV || nde.velocityV || '');
        legacy.pumpNDE_velH = String(nde.velH || nde.velocityH || '');
        legacy.pumpNDE_velAxl = String(nde.velAxl || nde.velocityA || '');
        legacy.pumpNDE_temp = String(nde.temp || nde.temperature || '');
    }

    if (vibrationData.pump?.de) {
        const de = vibrationData.pump.de;
        legacy.pumpDE_bv = String(de.bv || '');
        legacy.pumpDE_bg = String(de.bg || '');
        legacy.pumpDE_accV = String(de.accV || de.accelerationV || '');
        legacy.pumpDE_accH = String(de.accH || de.accelerationH || '');
        legacy.pumpDE_accAxl = String(de.accAxl || de.accelerationA || '');
        legacy.pumpDE_velV = String(de.velV || de.velocityV || '');
        legacy.pumpDE_velH = String(de.velH || de.velocityH || '');
        legacy.pumpDE_velAxl = String(de.velAxl || de.velocityA || '');
        legacy.pumpDE_temp = String(de.temp || de.temperature || '');
    }

    if (vibrationData.motor?.nde) {
        const nde = vibrationData.motor.nde;
        legacy.motorNDE_bv = String(nde.bv || '');
        legacy.motorNDE_bg = String(nde.bg || '');
        legacy.motorNDE_accV = String(nde.accV || nde.accelerationV || '');
        legacy.motorNDE_accH = String(nde.accH || nde.accelerationH || '');
        legacy.motorNDE_accAxl = String(nde.accAxl || nde.accelerationA || '');
        legacy.motorNDE_velV = String(nde.velV || nde.velocityV || '');
        legacy.motorNDE_velH = String(nde.velH || nde.velocityH || '');
        legacy.motorNDE_velAxl = String(nde.velAxl || nde.velocityA || '');
        legacy.motorNDE_temp = String(nde.temp || nde.temperature || '');
    }

    if (vibrationData.motor?.de) {
        const de = vibrationData.motor.de;
        legacy.motorDE_bv = String(de.bv || '');
        legacy.motorDE_bg = String(de.bg || '');
        legacy.motorDE_accV = String(de.accV || de.accelerationV || '');
        legacy.motorDE_accH = String(de.accH || de.accelerationH || '');
        legacy.motorDE_accAxl = String(de.accAxl || de.accelerationA || '');
        legacy.motorDE_velV = String(de.velV || de.velocityV || '');
        legacy.motorDE_velH = String(de.velH || de.velocityH || '');
        legacy.motorDE_velAxl = String(de.velAxl || de.velocityA || '');
        legacy.motorDE_temp = String(de.temp || de.temperature || '');
    }

    return legacy;
}

/**
 * Validate vibration data consistency across both forms
 */
export function validateVibrationData(data: UnifiedVibrationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required measurements
    if (!data.pump && !data.motor && !data.compressor) {
        errors.push('At least one equipment type (pump, motor, or compressor) must have measurements');
    }

    // Validate measurement ranges
    const validateMeasurementPoint = (point: VibrationMeasurementPoint, location: string) => {
        // Velocity validation (mm/s)
        const velocities = [point.velV, point.velH, point.velAxl, point.velocityV, point.velocityH, point.velocityA, point.velocity]
            .filter(v => v !== undefined && v !== null && v !== '');

        velocities.forEach(vel => {
            const value = typeof vel === 'string' ? parseFloat(vel) : vel;
            if (!isNaN(value) && (value < 0 || value > 100)) {
                errors.push(`${location}: Velocity value ${value} mm/s is outside acceptable range (0-100 mm/s)`);
            }
        });

        // Temperature validation (°C)
        const temperatures = [point.temp, point.temperature].filter(t => t !== undefined && t !== null && t !== '');
        temperatures.forEach(temp => {
            const value = typeof temp === 'string' ? parseFloat(temp) : temp;
            if (!isNaN(value) && (value < -50 || value > 200)) {
                errors.push(`${location}: Temperature value ${value}°C is outside acceptable range (-50 to 200°C)`);
            }
        });
    };

    // Validate all measurement points
    if (data.pump?.nde) validateMeasurementPoint(data.pump.nde, 'Pump NDE');
    if (data.pump?.de) validateMeasurementPoint(data.pump.de, 'Pump DE');
    if (data.motor?.nde) validateMeasurementPoint(data.motor.nde, 'Motor NDE');
    if (data.motor?.de) validateMeasurementPoint(data.motor.de, 'Motor DE');
    if (data.compressor?.nde) validateMeasurementPoint(data.compressor.nde, 'Compressor NDE');
    if (data.compressor?.de) validateMeasurementPoint(data.compressor.de, 'Compressor DE');

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Generate realistic vibration data for all hierarchical equipment
const generateVibrationHistoryData = (): VibrationHistoryRecord[] => {
    const records: VibrationHistoryRecord[] = [];
    const months = [
        '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
        '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    ];

    // Filter equipment that can have vibration monitoring (rotating equipment)
    const monitorableEquipment = allHierarchicalEquipment.filter(eq =>
        ['pump', 'motor', 'compressor'].includes(eq.category)
    );

    // Equipment-specific vibration patterns based on type and manufacturer
    const getVibrationPattern = (equipment: any) => {
        const basePattern = [1.2, 2.8, 4.5, 7.0, 9.5, 12.2, 14.8, 10.5, 6.0, 3.5, 2.0, 1.0];

        // Adjust pattern based on equipment category
        let multiplier = 1.0;
        switch (equipment.category) {
            case 'pump':
                multiplier = equipment.name.includes('Priming') ? 0.8 : 1.0; // Priming pumps typically have lower vibration
                break;
            case 'motor':
                multiplier = 0.7; // Motors typically have lower vibration than pumps
                break;
            case 'compressor':
                multiplier = 1.3; // Compressors typically have higher vibration
                break;
        }

        // Adjust based on manufacturer quality
        const manufacturerMultipliers: { [key: string]: number } = {
            'HMS': 0.9,
            'SAER': 0.9,
            'ELDIN': 1.0,
            'ABB': 0.8,
            'ROBUSCHI/Italy': 0.85,
            'El Haggar Misr': 1.1
        };

        const manufacturerMultiplier = manufacturerMultipliers[equipment.manufacturer] || 1.0;

        return basePattern.map(val => val * multiplier * manufacturerMultiplier);
    };

    // Generate realistic vibration readings based on equipment specifications
    const generateVibrationReading = (baseValue: number, variation: number = 0.2) => {
        return (baseValue + (Math.random() - 0.5) * variation).toFixed(2);
    };

    monitorableEquipment.slice(0, 10).forEach((equipment, eqIdx) => { // Limit to first 10 for performance
        const vibrationPattern = getVibrationPattern(equipment);

        months.forEach((month, mIdx) => {
            const date = `${month}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
            const vibrationRMS = vibrationPattern[mIdx % vibrationPattern.length] + (Math.random() - 0.5) * 0.5;

            const pumpBaseVibration = equipment.category === 'pump' ? vibrationRMS : vibrationRMS * 0.8;
            const motorBaseVibration = equipment.category === 'motor' ? vibrationRMS : vibrationRMS * 0.7;

            records.push({
                id: `VH-${equipment.id}-${month}`,
                equipmentId: equipment.id,
                date,
                pumpData: {
                    nde: {
                        bv: generateVibrationReading(pumpBaseVibration),
                        bg: generateVibrationReading(pumpBaseVibration * 0.9),
                        accV: generateVibrationReading(pumpBaseVibration * 2.5),
                        accH: generateVibrationReading(pumpBaseVibration * 2.3),
                        accAxl: generateVibrationReading(pumpBaseVibration * 1.8),
                        velV: generateVibrationReading(pumpBaseVibration),
                        velH: generateVibrationReading(pumpBaseVibration * 0.95),
                        velAxl: generateVibrationReading(pumpBaseVibration * 0.85),
                        temp: generateVibrationReading(45, 10)
                    },
                    de: {
                        bv: generateVibrationReading(pumpBaseVibration * 1.1),
                        bg: generateVibrationReading(pumpBaseVibration),
                        accV: generateVibrationReading(pumpBaseVibration * 2.7),
                        accH: generateVibrationReading(pumpBaseVibration * 2.5),
                        accAxl: generateVibrationReading(pumpBaseVibration * 2.0),
                        velV: generateVibrationReading(pumpBaseVibration * 1.05),
                        velH: generateVibrationReading(pumpBaseVibration),
                        velAxl: generateVibrationReading(pumpBaseVibration * 0.9),
                        temp: generateVibrationReading(47, 10)
                    }
                },
                motorData: {
                    nde: {
                        bv: generateVibrationReading(motorBaseVibration),
                        bg: generateVibrationReading(motorBaseVibration * 0.9),
                        accV: generateVibrationReading(motorBaseVibration * 2.0),
                        accH: generateVibrationReading(motorBaseVibration * 1.9),
                        accAxl: generateVibrationReading(motorBaseVibration * 1.5),
                        velV: generateVibrationReading(motorBaseVibration),
                        velH: generateVibrationReading(motorBaseVibration * 0.95),
                        velAxl: generateVibrationReading(motorBaseVibration * 0.8),
                        temp: generateVibrationReading(42, 8)
                    },
                    de: {
                        bv: generateVibrationReading(motorBaseVibration * 1.05),
                        bg: generateVibrationReading(motorBaseVibration * 0.95),
                        accV: generateVibrationReading(motorBaseVibration * 2.1),
                        accH: generateVibrationReading(motorBaseVibration * 2.0),
                        accAxl: generateVibrationReading(motorBaseVibration * 1.6),
                        velV: generateVibrationReading(motorBaseVibration * 1.02),
                        velH: generateVibrationReading(motorBaseVibration * 0.98),
                        velAxl: generateVibrationReading(motorBaseVibration * 0.85),
                        temp: generateVibrationReading(44, 8)
                    }
                },
                positions: {
                    pLeg1: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    pLeg2: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    pLeg3: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    pLeg4: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    mLeg1: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    mLeg2: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    mLeg3: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    mLeg4: vibrationRMS < 3 ? 'OK' : vibrationRMS < 6 ? 'Warning' : 'Critical',
                    vibrationRMS
                },
                vibrationRMS,
                zone: equipment.location?.zone || 'A',
                pumpNo: equipment.assetTag || equipment.name,
                motorBrand: equipment.category === 'motor' ? equipment.manufacturer : 'Associated Motor',
                serialNumbers: equipment.serialNumber || `SN-${equipment.id}`,
                project: 'Toshka Water Project',
                pumpStation: equipment.location?.station || 'Unknown Station',
                pumpBrand: equipment.category === 'pump' ? equipment.manufacturer : 'Associated Pump',
                operationHr: equipment.operatingHours?.toString() || '8760',
                operationPower: equipment.specifications?.ratedPower?.toString() || '75',
                pumpHead: equipment.specifications?.head?.toString() || '50',
                pumpFlowRate: equipment.specifications?.flowRate?.toString() || '100',
                dischargeP: equipment.specifications?.pressure?.toString() || '5.5',
                mainHeaderP: '5.0',
                suctionP: '0.5',
                fatPumpPower: equipment.specifications?.ratedPower?.toString() || '75',
                ratedMotorPower: equipment.specifications?.ratedPower?.toString() || '75',
                enteredBy: 'System Generated',
                // Detailed vibration readings
                pumpNDE_bv: generateVibrationReading(pumpBaseVibration),
                pumpNDE_bg: generateVibrationReading(pumpBaseVibration * 0.9),
                pumpNDE_accV: generateVibrationReading(pumpBaseVibration * 2.5),
                pumpNDE_accH: generateVibrationReading(pumpBaseVibration * 2.3),
                pumpNDE_accAxl: generateVibrationReading(pumpBaseVibration * 1.8),
                pumpNDE_velV: generateVibrationReading(pumpBaseVibration),
                pumpNDE_velH: generateVibrationReading(pumpBaseVibration * 0.95),
                pumpNDE_velAxl: generateVibrationReading(pumpBaseVibration * 0.85),
                pumpNDE_temp: generateVibrationReading(45, 10),
                pumpDE_bv: generateVibrationReading(pumpBaseVibration * 1.1),
                pumpDE_bg: generateVibrationReading(pumpBaseVibration),
                pumpDE_accV: generateVibrationReading(pumpBaseVibration * 2.7),
                pumpDE_accH: generateVibrationReading(pumpBaseVibration * 2.5),
                pumpDE_accAxl: generateVibrationReading(pumpBaseVibration * 2.0),
                pumpDE_velV: generateVibrationReading(pumpBaseVibration * 1.05),
                pumpDE_velH: generateVibrationReading(pumpBaseVibration),
                pumpDE_velAxl: generateVibrationReading(pumpBaseVibration * 0.9),
                pumpDE_temp: generateVibrationReading(47, 10),
                motorNDE_bv: generateVibrationReading(motorBaseVibration),
                motorNDE_bg: generateVibrationReading(motorBaseVibration * 0.9),
                motorNDE_accV: generateVibrationReading(motorBaseVibration * 2.0),
                motorNDE_accH: generateVibrationReading(motorBaseVibration * 1.9),
                motorNDE_accAxl: generateVibrationReading(motorBaseVibration * 1.5),
                motorNDE_velV: generateVibrationReading(motorBaseVibration),
                motorNDE_velH: generateVibrationReading(motorBaseVibration * 0.95),
                motorNDE_velAxl: generateVibrationReading(motorBaseVibration * 0.8),
                motorNDE_temp: generateVibrationReading(42, 8),
                motorDE_bv: generateVibrationReading(motorBaseVibration * 1.05),
                motorDE_bg: generateVibrationReading(motorBaseVibration * 0.95),
                motorDE_accV: generateVibrationReading(motorBaseVibration * 2.1),
                motorDE_accH: generateVibrationReading(motorBaseVibration * 2.0),
                motorDE_accAxl: generateVibrationReading(motorBaseVibration * 1.6),
                motorDE_velV: generateVibrationReading(motorBaseVibration * 1.02),
                motorDE_velH: generateVibrationReading(motorBaseVibration * 0.98),
                motorDE_velAxl: generateVibrationReading(motorBaseVibration * 0.85),
                motorDE_temp: generateVibrationReading(44, 8),
            });
        });
    });

    return records;
};

export const exampleVibrationHistory: VibrationHistoryRecord[] = generateVibrationHistoryData();

export const initialVibrationHistory: VibrationHistoryRecord[] = exampleVibrationHistory; 