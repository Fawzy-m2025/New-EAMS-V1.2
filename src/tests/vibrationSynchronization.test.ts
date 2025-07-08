// Unit tests for vibration forms synchronization
import { describe, it, expect, beforeEach } from 'vitest';
import {
    convertDataEntryFormToUnified,
    convertEnhancedFormToUnified,
    createLegacyFlatStructure,
    validateVibrationData,
    calcRMSVelocity,
    getISO10816Zone,
    ISO10816_THRESHOLDS
} from '@/data/vibrationHistoryData';
import { analyzeVibrationData, getVibrationInputColor, getVibrationTooltip } from '@/utils/vibrationUtils';
import { validateVibrationFormData } from '@/utils/vibrationValidation';

describe('Vibration Forms Synchronization', () => {
    // Test data for VibrationDataEntryForm format
    const dataEntryFormData = {
        pump: {
            nde: { bv: '2.1', bg: '1.5', accV: '3.2', accH: '2.8', accAxl: '2.5', velV: '2.0', velH: '1.8', velAxl: '1.9', temp: '65' },
            de: { bv: '2.3', bg: '1.7', accV: '3.5', accH: '3.0', accAxl: '2.7', velV: '2.2', velH: '2.0', velAxl: '2.1', temp: '67' }
        },
        motor: {
            nde: { bv: '1.8', bg: '1.2', accV: '2.8', accH: '2.5', accAxl: '2.2', velV: '1.7', velH: '1.5', velAxl: '1.6', temp: '62' },
            de: { bv: '1.9', bg: '1.3', accV: '2.9', accH: '2.6', accAxl: '2.3', velV: '1.8', velH: '1.6', velAxl: '1.7', temp: '63' }
        },
        positions: { pLeg1: '1.5', pLeg2: '1.6', pLeg3: '1.4', pLeg4: '1.7', mLeg1: '1.3', mLeg2: '1.4', mLeg3: '1.2', mLeg4: '1.5' }
    };

    // Test data for EnhancedVibrationForm format
    const enhancedFormData = {
        vibrationData: {
            pump: {
                nde: { velocity: '2.0', acceleration: '3.2', displacement: '15', temperature: '65', velocityH: '1.8', velocityV: '2.0', velocityA: '1.9' },
                de: { velocity: '2.2', acceleration: '3.5', displacement: '17', temperature: '67', velocityH: '2.0', velocityV: '2.2', velocityA: '2.1' }
            },
            motor: {
                nde: { velocity: '1.7', acceleration: '2.8', displacement: '12', temperature: '62', velocityH: '1.5', velocityV: '1.7', velocityA: '1.6' },
                de: { velocity: '1.8', acceleration: '2.9', displacement: '13', temperature: '63', velocityH: '1.6', velocityV: '1.8', velocityA: '1.7' }
            }
        }
    };

    describe('Data Structure Conversion', () => {
        it('should convert VibrationDataEntryForm data to unified structure', () => {
            const unified = convertDataEntryFormToUnified(dataEntryFormData);
            
            expect(unified.pump?.nde?.velV).toBe('2.0');
            expect(unified.pump?.nde?.velocityV).toBe('2.0'); // Mapped for compatibility
            expect(unified.pump?.de?.temp).toBe('67');
            expect(unified.motor?.nde?.accH).toBe('2.5');
            expect(unified.positions).toEqual(dataEntryFormData.positions);
        });

        it('should convert EnhancedVibrationForm data to unified structure', () => {
            const unified = convertEnhancedFormToUnified(enhancedFormData);
            
            expect(unified.pump?.nde?.velocityV).toBe('2.0');
            expect(unified.pump?.nde?.velV).toBe('2.0'); // Mapped for compatibility
            expect(unified.pump?.de?.temperature).toBe('67');
            expect(unified.motor?.nde?.accelerationH).toBe(undefined); // Not in test data
        });

        it('should create legacy flat structure for backward compatibility', () => {
            const unified = convertDataEntryFormToUnified(dataEntryFormData);
            const legacy = createLegacyFlatStructure(unified);
            
            expect(legacy.pumpNDE_velV).toBe('2.0');
            expect(legacy.pumpDE_temp).toBe('67');
            expect(legacy.motorNDE_accH).toBe('2.5');
            expect(legacy.motorDE_velAxl).toBe('1.7');
        });
    });

    describe('ISO 10816 Compliance', () => {
        it('should calculate RMS velocity correctly', () => {
            const testPoint = { velV: 2.0, velH: 1.8, velAxl: 1.9 };
            const rms = calcRMSVelocity(testPoint);
            
            expect(rms).toBeCloseTo(1.9, 1); // Expected RMS calculation
        });

        it('should determine correct ISO 10816 zones', () => {
            expect(getISO10816Zone(1.5).zone).toBe('A'); // Good
            expect(getISO10816Zone(3.0).zone).toBe('B'); // Satisfactory
            expect(getISO10816Zone(6.0).zone).toBe('C'); // Unsatisfactory
            expect(getISO10816Zone(8.0).zone).toBe('D'); // Unacceptable
        });

        it('should have consistent ISO 10816 thresholds', () => {
            expect(ISO10816_THRESHOLDS).toHaveLength(4);
            expect(ISO10816_THRESHOLDS[0].zone).toBe('A');
            expect(ISO10816_THRESHOLDS[0].max).toBe(1.8);
            expect(ISO10816_THRESHOLDS[3].zone).toBe('D');
        });
    });

    describe('Validation Consistency', () => {
        it('should validate vibration data correctly', () => {
            const unified = convertDataEntryFormToUnified(dataEntryFormData);
            const validation = validateVibrationData(unified);
            
            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should detect invalid vibration values', () => {
            const invalidData = {
                pump: {
                    nde: { velV: '150', velH: '-5', temp: '250' } // Invalid values
                }
            };
            const unified = convertDataEntryFormToUnified(invalidData);
            const validation = validateVibrationData(unified);
            
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
        });

        it('should validate form data with unified validation', () => {
            const formData = {
                date: '2024-01-15',
                selectedEquipment: 'EQ-001',
                pumpNo: 'P-001',
                operatingHours: '1000'
            };
            const unified = convertDataEntryFormToUnified(dataEntryFormData);
            const validation = validateVibrationFormData(formData, unified);
            
            expect(validation.isValid).toBe(true);
        });
    });

    describe('UI Consistency', () => {
        it('should provide consistent input colors based on values', () => {
            const goodColor = getVibrationInputColor('1.5'); // Zone A
            const badColor = getVibrationInputColor('8.0');  // Zone D
            
            expect(goodColor).toContain('green');
            expect(badColor).toContain('red');
        });

        it('should generate consistent tooltips', () => {
            const velocityTooltip = getVibrationTooltip('velV', 'velocity');
            const tempTooltip = getVibrationTooltip('temp', 'temperature');
            
            expect(velocityTooltip).toContain('ISO 10816');
            expect(tempTooltip).toContain('temperature');
        });
    });

    describe('Data Analysis Consistency', () => {
        it('should analyze vibration data consistently', () => {
            const unified = convertDataEntryFormToUnified(dataEntryFormData);
            const analysis = analyzeVibrationData(unified);
            
            expect(analysis.overallRMS).toBeGreaterThan(0);
            expect(analysis.worstZone).toBeDefined();
            expect(analysis.measurements).toHaveLength(4); // Pump NDE, DE, Motor NDE, DE
            expect(analysis.recommendations).toBeDefined();
        });

        it('should generate appropriate alerts for critical vibration', () => {
            const criticalData = {
                pump: {
                    nde: { velV: '10.0', velH: '9.5', velAxl: '8.8' } // Critical values
                }
            };
            const unified = convertDataEntryFormToUnified(criticalData);
            const analysis = analyzeVibrationData(unified);
            
            expect(analysis.worstZone.zone).toBe('D');
            expect(analysis.alerts.some(alert => alert.includes('CRITICAL'))).toBe(true);
        });
    });
});

// Integration test helper functions
export const testHelpers = {
    // Create test data for VibrationDataEntryForm
    createDataEntryTestData: (overrides = {}) => ({
        date: '2024-01-15',
        zone: 'A',
        selectedStation: 'A01',
        selectedEquipment: 'EQ-001',
        pumpNo: 'P-001',
        ...dataEntryFormData,
        ...overrides
    }),

    // Create test data for EnhancedVibrationForm
    createEnhancedTestData: (overrides = {}) => ({
        date: '2024-01-15',
        time: '10:30',
        selectedEquipment: ['EQ-001'],
        operator: 'Test Operator',
        ...enhancedFormData,
        ...overrides
    }),

    // Verify data consistency between forms
    verifyDataConsistency: (dataEntryResult: any, enhancedResult: any) => {
        expect(dataEntryResult.vibrationData).toBeDefined();
        expect(enhancedResult.vibrationData).toBeDefined();
        
        // Check that both forms produce compatible vibration data
        const dataEntryRMS = calcRMSVelocity(dataEntryResult.vibrationData.pump?.nde);
        const enhancedRMS = calcRMSVelocity(enhancedResult.vibrationData.pump?.nde);
        
        expect(Math.abs(dataEntryRMS - enhancedRMS)).toBeLessThan(0.5); // Allow small variance
    }
};
