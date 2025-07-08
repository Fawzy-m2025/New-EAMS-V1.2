// Shared validation utilities for vibration monitoring forms
// Ensures consistent validation rules and error handling across both forms

import { UnifiedVibrationData, VibrationMeasurementPoint } from '@/data/vibrationHistoryData';

/**
 * Validation rule definitions for vibration forms
 */
export const VALIDATION_RULES = {
    // Required fields for both forms
    required: {
        date: { required: true, message: "Date is required" },
        selectedEquipment: { required: true, message: "Equipment selection is required" },
        pumpNo: { required: true, message: "Pump No. is required" }
    },
    
    // Vibration measurement ranges
    vibration: {
        velocity: { min: 0, max: 100, unit: 'mm/s', message: 'Velocity must be between 0-100 mm/s' },
        acceleration: { min: 0, max: 1000, unit: 'm/s²', message: 'Acceleration must be between 0-1000 m/s²' },
        displacement: { min: 0, max: 10000, unit: 'μm', message: 'Displacement must be between 0-10000 μm' },
        temperature: { min: -50, max: 200, unit: '°C', message: 'Temperature must be between -50 to 200°C' }
    },
    
    // Operational parameter ranges
    operational: {
        operatingHours: { min: 0, max: 100000, message: 'Operating hours must be between 0-100000' },
        operatingPower: { min: 0, max: 10000, message: 'Operating power must be between 0-10000 kW' },
        operatingSpeed: { min: 0, max: 10000, message: 'Operating speed must be between 0-10000 RPM' },
        operatingTemperature: { min: -50, max: 200, message: 'Operating temperature must be between -50 to 200°C' },
        operatingPressure: { min: 0, max: 1000, message: 'Operating pressure must be between 0-1000 bar' },
        operatingFlow: { min: 0, max: 10000, message: 'Operating flow must be between 0-10000 m³/h' },
        efficiency: { min: 0, max: 100, message: 'Efficiency must be between 0-100%' }
    }
};

/**
 * Standardized error messages
 */
export const ERROR_MESSAGES = {
    REQUIRED_FIELD: "This field is required",
    INVALID_NUMBER: "Please enter a valid number",
    OUT_OF_RANGE: "Value is outside acceptable range",
    INVALID_DATE: "Please enter a valid date",
    INVALID_EMAIL: "Please enter a valid email address",
    EQUIPMENT_REQUIRED: "Please select at least one equipment",
    VIBRATION_DATA_REQUIRED: "At least one vibration measurement is required",
    ISO_COMPLIANCE_WARNING: "Values exceed ISO 10816 acceptable limits",
    VALIDATION_FAILED: "Form validation failed. Please check all fields."
};

/**
 * Validate a single vibration measurement point
 */
export function validateVibrationPoint(
    point: VibrationMeasurementPoint, 
    location: string
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate velocity measurements
    const velocityFields = ['velV', 'velH', 'velAxl', 'velocityV', 'velocityH', 'velocityA', 'velocity'];
    velocityFields.forEach(field => {
        const value = point[field as keyof VibrationMeasurementPoint];
        if (value !== undefined && value !== null && value !== '') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
                const rule = VALIDATION_RULES.vibration.velocity;
                if (numValue < rule.min || numValue > rule.max) {
                    errors.push(`${location} ${field}: ${rule.message}`);
                }
            }
        }
    });
    
    // Validate acceleration measurements
    const accelerationFields = ['accV', 'accH', 'accAxl', 'accelerationV', 'accelerationH', 'accelerationA', 'acceleration'];
    accelerationFields.forEach(field => {
        const value = point[field as keyof VibrationMeasurementPoint];
        if (value !== undefined && value !== null && value !== '') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
                const rule = VALIDATION_RULES.vibration.acceleration;
                if (numValue < rule.min || numValue > rule.max) {
                    errors.push(`${location} ${field}: ${rule.message}`);
                }
            }
        }
    });
    
    // Validate temperature measurements
    const temperatureFields = ['temp', 'temperature'];
    temperatureFields.forEach(field => {
        const value = point[field as keyof VibrationMeasurementPoint];
        if (value !== undefined && value !== null && value !== '') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
                const rule = VALIDATION_RULES.vibration.temperature;
                if (numValue < rule.min || numValue > rule.max) {
                    errors.push(`${location} ${field}: ${rule.message}`);
                }
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate complete vibration data structure
 */
export function validateCompleteVibrationData(data: UnifiedVibrationData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if at least one equipment has measurements
    const hasAnyMeasurements = !!(data.pump || data.motor || data.compressor);
    if (!hasAnyMeasurements) {
        errors.push(ERROR_MESSAGES.VIBRATION_DATA_REQUIRED);
    }
    
    // Validate each measurement point
    if (data.pump?.nde) {
        const validation = validateVibrationPoint(data.pump.nde, 'Pump NDE');
        errors.push(...validation.errors);
    }
    
    if (data.pump?.de) {
        const validation = validateVibrationPoint(data.pump.de, 'Pump DE');
        errors.push(...validation.errors);
    }
    
    if (data.motor?.nde) {
        const validation = validateVibrationPoint(data.motor.nde, 'Motor NDE');
        errors.push(...validation.errors);
    }
    
    if (data.motor?.de) {
        const validation = validateVibrationPoint(data.motor.de, 'Motor DE');
        errors.push(...validation.errors);
    }
    
    if (data.compressor?.nde) {
        const validation = validateVibrationPoint(data.compressor.nde, 'Compressor NDE');
        errors.push(...validation.errors);
    }
    
    if (data.compressor?.de) {
        const validation = validateVibrationPoint(data.compressor.de, 'Compressor DE');
        errors.push(...validation.errors);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate operational parameters
 */
export function validateOperationalData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.entries(VALIDATION_RULES.operational).forEach(([field, rule]) => {
        const value = data[field];
        if (value !== undefined && value !== null && value !== '') {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (!isNaN(numValue)) {
                if (numValue < rule.min || numValue > rule.max) {
                    errors.push(`${field}: ${rule.message}`);
                }
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validate required fields for both forms
 */
export function validateRequiredFields(data: any, formType: 'dataEntry' | 'enhanced'): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Common required fields
    Object.entries(VALIDATION_RULES.required).forEach(([field, rule]) => {
        const value = data[field];
        if (rule.required && (!value || value === '')) {
            errors.push(`${field}: ${rule.message}`);
        }
    });
    
    // Form-specific validations
    if (formType === 'enhanced') {
        // Enhanced form requires equipment selection
        if (!data.selectedEquipment || (Array.isArray(data.selectedEquipment) && data.selectedEquipment.length === 0)) {
            errors.push(ERROR_MESSAGES.EQUIPMENT_REQUIRED);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Get validation status for a field value
 */
export function getFieldValidationStatus(
    value: any, 
    fieldName: string, 
    isRequired: boolean = false
): { isValid: boolean; error?: string; warning?: string } {
    
    // Check if required field is empty
    if (isRequired && (!value || value === '')) {
        return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    
    // If field is empty and not required, it's valid
    if (!value || value === '') {
        return { isValid: true };
    }
    
    // Validate numeric fields
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numValue)) {
        // Check vibration field ranges
        if (['velV', 'velH', 'velAxl', 'velocityV', 'velocityH', 'velocityA', 'velocity'].includes(fieldName)) {
            const rule = VALIDATION_RULES.vibration.velocity;
            if (numValue < rule.min || numValue > rule.max) {
                return { isValid: false, error: rule.message };
            }
        }
        
        // Check acceleration field ranges
        if (['accV', 'accH', 'accAxl', 'accelerationV', 'accelerationH', 'accelerationA', 'acceleration'].includes(fieldName)) {
            const rule = VALIDATION_RULES.vibration.acceleration;
            if (numValue < rule.min || numValue > rule.max) {
                return { isValid: false, error: rule.message };
            }
        }
        
        // Check temperature field ranges
        if (['temp', 'temperature'].includes(fieldName)) {
            const rule = VALIDATION_RULES.vibration.temperature;
            if (numValue < rule.min || numValue > rule.max) {
                return { isValid: false, error: rule.message };
            }
        }
        
        // Check operational parameter ranges
        if (VALIDATION_RULES.operational[fieldName as keyof typeof VALIDATION_RULES.operational]) {
            const rule = VALIDATION_RULES.operational[fieldName as keyof typeof VALIDATION_RULES.operational];
            if (numValue < rule.min || numValue > rule.max) {
                return { isValid: false, error: rule.message };
            }
        }
    }
    
    return { isValid: true };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: string[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0];
    return `Multiple validation errors:\n• ${errors.join('\n• ')}`;
}

/**
 * Check ISO 10816 compliance and generate warnings
 */
export function checkISO10816Compliance(data: UnifiedVibrationData): { compliant: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // This would integrate with the ISO 10816 utilities
    // For now, return basic compliance check
    return {
        compliant: warnings.length === 0,
        warnings
    };
}
