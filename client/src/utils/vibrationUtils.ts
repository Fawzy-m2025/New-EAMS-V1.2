// Shared vibration utilities for both VibrationDataEntryForm and EnhancedVibrationForm
// Ensures consistent ISO 10816 compliance and data processing across forms

import { VibrationMeasurementPoint, UnifiedVibrationData, ISO10816_THRESHOLDS, getISO10816Zone, calcRMSVelocity } from '@/data/vibrationHistoryData';

/**
 * Safe parsing function for numeric values with validation
 */
export function safeParseFloat(value: any, fallback = 0, context = 'numeric value'): number {
    try {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }

        const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);

        if (isNaN(numValue) || !isFinite(numValue)) {
            console.warn(`Invalid ${context}: ${value}, using fallback: ${fallback}`);
            return fallback;
        }

        return numValue;
    } catch (error) {
        console.error(`Error parsing ${context}:`, error);
        return fallback;
    }
}

/**
 * Standardized input color coding for vibration forms with enhanced error handling
 */
export function getVibrationInputColor(value: string | number | null | undefined, required = false): string {
    const baseClasses = 'transition-colors duration-200';

    try {
        // Handle null/undefined values
        if (value === null || value === undefined) {
            return required
                ? `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30`
                : `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        }

        // Handle empty string values
        if (value === '') {
            return required
                ? `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30`
                : `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        }

        // Safe numeric conversion with validation
        const numValue = safeParseFloat(value, 0, 'vibration input value');

        // Validate numeric range (vibration values should be positive)
        if (numValue < 0) {
            console.warn(`Negative vibration value detected: ${numValue}`);
            return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30`;
        }

        // Color coding based on ISO 10816 zones for velocity values
        const zone = getISO10816Zone(numValue);
        if (!zone || !zone.zone) {
            console.warn(`Invalid ISO zone for value: ${numValue}`);
            return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        }

        switch (zone.zone) {
            case 'A':
                return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50/30`;
            case 'B':
                return `${baseClasses} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50/30`;
            case 'C':
                return `${baseClasses} border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-orange-50/30`;
            case 'D':
                return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50/30`;
            default:
                return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        }
    } catch (error) {
        console.error('Error in getVibrationInputColor:', error);
        return `${baseClasses} border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
    }
}

/**
 * Generate standardized vibration measurement tooltips with enhanced validation
 */
export function getVibrationTooltip(field: string | null | undefined, measurementType: 'velocity' | 'acceleration' | 'displacement' | 'temperature' = 'velocity'): string {
    try {
        // Validate input parameters
        if (!field || typeof field !== 'string') {
            console.warn(`Invalid field parameter in getVibrationTooltip: ${field}`);
            return `Enter ${measurementType} value.`;
        }

        const fieldUpper = field.toUpperCase();
        const validMeasurementTypes = ['velocity', 'acceleration', 'displacement', 'temperature'];

        if (!validMeasurementTypes.includes(measurementType)) {
            console.warn(`Invalid measurement type: ${measurementType}`);
            return `${fieldUpper}: Enter measurement value.`;
        }

        switch (measurementType) {
            case 'velocity':
                if (['velV', 'velH', 'velAxl', 'velocityV', 'velocityH', 'velocityA'].includes(field)) {
                    return `${fieldUpper}: Enter velocity (mm/s). ISO 10816: A ≤ 1.8, B ≤ 4.5, C ≤ 7.1, D &gt; 7.1`;
                }
                return `${fieldUpper}: Enter velocity (mm/s). Measure vibration amplitude.`;
            case 'acceleration':
                if (['accV', 'accH', 'accAxl', 'accelerationV', 'accelerationH', 'accelerationA'].includes(field)) {
                    return `${fieldUpper}: Enter acceleration (mm/s²). Higher values indicate potential mechanical issues.`;
                }
                return `${fieldUpper}: Enter acceleration (mm/s²). Measure vibration intensity.`;
            case 'displacement':
                if (['displacementV', 'displacementH', 'displacementA'].includes(field)) {
                    return `${fieldUpper}: Enter displacement (μm). Measure shaft movement relative to bearing.`;
                }
                return `${fieldUpper}: Enter displacement (μm). Measure relative movement.`;
            case 'temperature':
                if (['temp', 'temperature'].includes(field)) {
                    return `${fieldUpper}: Enter temperature (°C). Normal range: 40-80°C, Critical: &gt;80°C`;
                }
                return `${fieldUpper}: Enter temperature (°C). Monitor thermal conditions.`;
            default:
                return `${fieldUpper}: Enter ${measurementType} value.`;
        }
    } catch (error) {
        console.error('Error in getVibrationTooltip:', error);
        return `Enter ${measurementType || 'measurement'} value.`;
    }
}

/**
 * Standardized vibration measurement field definitions
 */
export const VIBRATION_FIELD_DEFINITIONS = {
    // VibrationDataEntryForm fields
    bv: { label: 'BV', tooltip: 'Bearing Vibration', unit: 'mm/s', type: 'velocity' as const },
    bg: { label: 'BG', tooltip: 'Bearing Gap', unit: 'μm', type: 'displacement' as const },
    accV: { label: 'ACC-V', tooltip: 'Acceleration Vertical', unit: 'mm/s²', type: 'acceleration' as const },
    accH: { label: 'ACC-H', tooltip: 'Acceleration Horizontal', unit: 'mm/s²', type: 'acceleration' as const },
    accAxl: { label: 'ACC-A', tooltip: 'Acceleration Axial', unit: 'mm/s²', type: 'acceleration' as const },
    velV: { label: 'VEL-V', tooltip: 'Velocity Vertical', unit: 'mm/s', type: 'velocity' as const },
    velH: { label: 'VEL-H', tooltip: 'Velocity Horizontal', unit: 'mm/s', type: 'velocity' as const },
    velAxl: { label: 'VEL-A', tooltip: 'Velocity Axial', unit: 'mm/s', type: 'velocity' as const },
    temp: { label: 'TEMP', tooltip: 'Temperature', unit: '°C', type: 'temperature' as const },

    // EnhancedVibrationForm fields
    velocity: { label: 'VEL', tooltip: 'Overall Velocity', unit: 'mm/s', type: 'velocity' as const },
    acceleration: { label: 'ACC', tooltip: 'Overall Acceleration', unit: 'mm/s²', type: 'acceleration' as const },
    displacement: { label: 'DISP', tooltip: 'Overall Displacement', unit: 'μm', type: 'displacement' as const },
    temperature: { label: 'TEMP', tooltip: 'Temperature', unit: '°C', type: 'temperature' as const },
    velocityH: { label: 'VEL-H', tooltip: 'Velocity Horizontal', unit: 'mm/s', type: 'velocity' as const },
    velocityV: { label: 'VEL-V', tooltip: 'Velocity Vertical', unit: 'mm/s', type: 'velocity' as const },
    velocityA: { label: 'VEL-A', tooltip: 'Velocity Axial', unit: 'mm/s', type: 'velocity' as const },
    accelerationH: { label: 'ACC-H', tooltip: 'Acceleration Horizontal', unit: 'mm/s²', type: 'acceleration' as const },
    accelerationV: { label: 'ACC-V', tooltip: 'Acceleration Vertical', unit: 'mm/s²', type: 'acceleration' as const },
    accelerationA: { label: 'ACC-A', tooltip: 'Acceleration Axial', unit: 'mm/s²', type: 'acceleration' as const },
    displacementH: { label: 'DISP-H', tooltip: 'Displacement Horizontal', unit: 'μm', type: 'displacement' as const },
    displacementV: { label: 'DISP-V', tooltip: 'Displacement Vertical', unit: 'μm', type: 'displacement' as const },
    displacementA: { label: 'DISP-A', tooltip: 'Displacement Axial', unit: 'μm', type: 'displacement' as const }
};

/**
 * Get field definition for any vibration measurement field with enhanced validation
 */
export function getFieldDefinition(fieldName: string | null | undefined) {
    try {
        // Validate input parameter
        if (!fieldName || typeof fieldName !== 'string') {
            console.warn(`Invalid fieldName parameter in getFieldDefinition: ${fieldName}`);
            return {
                label: 'UNKNOWN',
                tooltip: 'Enter measurement value',
                unit: '',
                type: 'velocity' as const
            };
        }

        const definition = VIBRATION_FIELD_DEFINITIONS[fieldName as keyof typeof VIBRATION_FIELD_DEFINITIONS];

        if (definition) {
            return definition;
        }

        // Fallback with enhanced context
        console.info(`Field definition not found for: ${fieldName}, using fallback`);
        return {
            label: fieldName.toUpperCase(),
            tooltip: `Enter ${fieldName} value`,
            unit: '',
            type: 'velocity' as const
        };
    } catch (error) {
        console.error('Error in getFieldDefinition:', error);
        return {
            label: 'ERROR',
            tooltip: 'Enter measurement value',
            unit: '',
            type: 'velocity' as const
        };
    }
}

/**
 * Standardized vibration analysis for both forms with comprehensive error handling
 */
export function analyzeVibrationData(data: UnifiedVibrationData | null | undefined) {
    // Initialize analysis with safe defaults
    const analysis = {
        overallRMS: 0,
        worstZone: ISO10816_THRESHOLDS[0] || { zone: 'A', label: 'Good', threshold: 1.8 },
        measurements: [] as Array<{
            location: string;
            rms: number;
            zone: typeof ISO10816_THRESHOLDS[0];
            status: 'good' | 'warning' | 'critical';
        }>,
        recommendations: [] as string[],
        alerts: [] as string[]
    };

    try {
        // Validate input data
        if (!data || typeof data !== 'object') {
            console.warn('Invalid vibration data provided to analyzeVibrationData');
            analysis.alerts.push('No vibration data available for analysis');
            analysis.recommendations.push('Enter vibration measurements to generate analysis');
            return analysis;
        }

        // Safely extract measurement points with null checks
        const measurementPoints = [
            { data: data.pump?.nde, location: 'Pump NDE' },
            { data: data.pump?.de, location: 'Pump DE' },
            { data: data.motor?.nde, location: 'Motor NDE' },
            { data: data.motor?.de, location: 'Motor DE' },
            { data: data.compressor?.nde, location: 'Compressor NDE' },
            { data: data.compressor?.de, location: 'Compressor DE' }
        ].filter(point => point.data !== null && point.data !== undefined);

        if (measurementPoints.length === 0) {
            console.info('No valid measurement points found in vibration data');
            analysis.alerts.push('No measurement points available');
            analysis.recommendations.push('Add vibration measurements to begin analysis');
            return analysis;
        }

        let totalRMS = 0;
        let measurementCount = 0;

        measurementPoints.forEach(point => {
            try {
                if (point.data) {
                    // Safe RMS calculation with validation
                    const rms = calcRMSVelocity(point.data);

                    // Validate RMS value
                    if (isNaN(rms) || !isFinite(rms) || rms < 0) {
                        console.warn(`Invalid RMS value for ${point.location}: ${rms}`);
                        return; // Skip this measurement point
                    }

                    const zone = getISO10816Zone(rms);

                    // Validate zone data
                    if (!zone || !zone.zone) {
                        console.warn(`Invalid zone data for ${point.location}, RMS: ${rms}`);
                        return; // Skip this measurement point
                    }

                    let status: 'good' | 'warning' | 'critical' = 'good';
                    if (zone.zone === 'D') status = 'critical';
                    else if (zone.zone === 'C') status = 'critical';
                    else if (zone.zone === 'B') status = 'warning';

                    analysis.measurements.push({
                        location: point.location,
                        rms: Math.round(rms * 100) / 100, // Round to 2 decimal places
                        zone,
                        status
                    });

                    // Track worst zone with safe array operations
                    const currentZoneIndex = ISO10816_THRESHOLDS.findIndex(threshold => threshold.zone === zone.zone);
                    const worstZoneIndex = ISO10816_THRESHOLDS.findIndex(threshold => threshold.zone === analysis.worstZone.zone);

                    if (currentZoneIndex > worstZoneIndex && currentZoneIndex !== -1) {
                        analysis.worstZone = zone;
                    }

                    // Safe mathematical operations
                    totalRMS = Math.max(0, totalRMS + rms);
                    measurementCount++;

                    // Generate alerts and recommendations with safe string formatting
                    const formattedRMS = rms.toFixed(2);
                    if (zone.zone === 'D') {
                        analysis.alerts.push(`CRITICAL: ${point.location} vibration (${formattedRMS} mm/s) exceeds acceptable limits`);
                        analysis.recommendations.push(`Immediate shutdown and inspection required for ${point.location}`);
                    } else if (zone.zone === 'C') {
                        analysis.alerts.push(`WARNING: ${point.location} vibration (${formattedRMS} mm/s) is unsatisfactory`);
                        analysis.recommendations.push(`Schedule maintenance for ${point.location} within 1 week`);
                    } else if (zone.zone === 'B') {
                        analysis.recommendations.push(`Monitor ${point.location} vibration trends closely`);
                    }
                }
            } catch (error) {
                console.error(`Error processing measurement point ${point.location}:`, error);
            }
        });

        // Safe overall RMS calculation with bounds checking
        analysis.overallRMS = measurementCount > 0
            ? Math.max(0, Math.round((totalRMS / measurementCount) * 100) / 100)
            : 0;

        return analysis;
    } catch (error) {
        console.error('Error in analyzeVibrationData:', error);
        analysis.alerts.push('Error occurred during vibration analysis');
        analysis.recommendations.push('Please check vibration data and try again');
        return analysis;
    }
}

/**
 * Generate standardized vibration report data with comprehensive error handling
 */
export function generateVibrationReport(data: UnifiedVibrationData | null | undefined, equipmentInfo: any) {
    try {
        // Validate input parameters
        if (!data) {
            console.warn('No vibration data provided for report generation');
            return {
                timestamp: new Date().toISOString(),
                equipment: equipmentInfo || { name: 'Unknown Equipment', id: 'N/A' },
                analysis: {
                    overallRMS: 0,
                    worstZone: { zone: 'A', label: 'No Data', threshold: 0 },
                    measurements: [],
                    recommendations: ['No vibration data available'],
                    alerts: ['No data provided for analysis']
                },
                compliance: {
                    standard: 'ISO 10816',
                    overallZone: 'N/A',
                    overallStatus: 'No Data',
                    compliant: false
                },
                summary: {
                    totalMeasurements: 0,
                    criticalAlerts: 0,
                    warnings: 0,
                    recommendations: 1
                },
                error: 'No vibration data provided'
            };
        }

        const analysis = analyzeVibrationData(data);

        // Validate analysis results
        if (!analysis || !analysis.worstZone) {
            console.error('Invalid analysis results from analyzeVibrationData');
            throw new Error('Failed to analyze vibration data');
        }

        // Safe equipment info handling
        const safeEquipmentInfo = equipmentInfo || {
            name: 'Unknown Equipment',
            id: 'N/A',
            location: 'Unknown Location'
        };

        // Safe alert filtering with error handling
        const criticalAlerts = analysis.alerts?.filter(alert =>
            typeof alert === 'string' && alert.includes('CRITICAL')
        ).length || 0;

        const warnings = analysis.alerts?.filter(alert =>
            typeof alert === 'string' && alert.includes('WARNING')
        ).length || 0;

        return {
            timestamp: new Date().toISOString(),
            equipment: safeEquipmentInfo,
            analysis,
            compliance: {
                standard: 'ISO 10816',
                overallZone: analysis.worstZone.zone || 'Unknown',
                overallStatus: analysis.worstZone.label || 'Unknown',
                compliant: analysis.worstZone.zone !== 'D'
            },
            summary: {
                totalMeasurements: Math.max(0, analysis.measurements?.length || 0),
                criticalAlerts: Math.max(0, criticalAlerts),
                warnings: Math.max(0, warnings),
                recommendations: Math.max(0, analysis.recommendations?.length || 0)
            }
        };
    } catch (error) {
        console.error('Error generating vibration report:', error);
        return {
            timestamp: new Date().toISOString(),
            equipment: equipmentInfo || { name: 'Unknown Equipment', id: 'N/A' },
            analysis: {
                overallRMS: 0,
                worstZone: { zone: 'A', label: 'Error', threshold: 0 },
                measurements: [],
                recommendations: ['Error occurred during analysis'],
                alerts: ['Report generation failed']
            },
            compliance: {
                standard: 'ISO 10816',
                overallZone: 'Error',
                overallStatus: 'Error',
                compliant: false
            },
            summary: {
                totalMeasurements: 0,
                criticalAlerts: 0,
                warnings: 0,
                recommendations: 1
            },
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

/**
 * Export standardized constants and functions
 */
export {
    ISO10816_THRESHOLDS,
    getISO10816Zone,
    calcRMSVelocity
};
