/**
 * Comprehensive Test Suite for Vibration Data Flow Fix
 * Tests the critical data flow from Step 3 to FailureAnalysisEngine
 */

import { FailureAnalysisEngine, VibrationData } from '../utils/failureAnalysisEngine';
import { safeParseFloat } from '../utils/vibrationUtils';

describe('Vibration Data Flow - Critical Fix Validation', () => {
    
    // Test data representing typical form input
    const mockFormData = {
        operatingFrequency: '50',
        operatingSpeed: '1450',
        vibrationData: {
            pump: {
                nde: {
                    velH: '2.5',
                    velV: '1.8',
                    velAxl: '1.2',
                    accH: '0.8',
                    accV: '0.6',
                    accAxl: '0.4',
                    temp: '45'
                },
                de: {
                    velH: '2.8',
                    velV: '2.1',
                    velAxl: '1.5',
                    accH: '0.9',
                    accV: '0.7',
                    accAxl: '0.5',
                    temp: '48'
                }
            },
            motor: {
                nde: {
                    velH: '1.5',
                    velV: '1.2',
                    velAxl: '0.8',
                    accH: '0.5',
                    accV: '0.4',
                    accAxl: '0.3',
                    temp: '42'
                },
                de: {
                    velH: '1.8',
                    velV: '1.4',
                    velAxl: '1.0',
                    accH: '0.6',
                    accV: '0.5',
                    accAxl: '0.4',
                    temp: '44'
                }
            }
        }
    };

    describe('Operating Parameter Extraction', () => {
        test('should correctly extract operating frequency from form', () => {
            const frequency = safeParseFloat(mockFormData.operatingFrequency);
            expect(frequency).toBe(50);
            expect(frequency).toBeGreaterThan(0);
            expect(frequency).toBeLessThan(1000); // FailureAnalysisEngine limit
        });

        test('should correctly extract operating speed from form', () => {
            const speed = safeParseFloat(mockFormData.operatingSpeed);
            expect(speed).toBe(1450);
            expect(speed).toBeGreaterThan(0);
            expect(speed).toBeLessThan(100000); // FailureAnalysisEngine limit
        });

        test('should handle missing operating parameters with fallbacks', () => {
            const emptyFormData = { operatingFrequency: '', operatingSpeed: '' };
            const frequency = safeParseFloat(emptyFormData.operatingFrequency, 50);
            const speed = safeParseFloat(emptyFormData.operatingSpeed, 1450);
            
            expect(frequency).toBe(50);
            expect(speed).toBe(1450);
        });
    });

    describe('VibrationData Interface Compliance', () => {
        test('should create valid VibrationData for pump analysis', () => {
            const pump = mockFormData.vibrationData.pump;
            
            const pumpData: VibrationData = {
                VH: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.velH), 2) +
                    Math.pow(safeParseFloat(pump.de.velH), 2)
                ) / 2),
                VV: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.velV), 2) +
                    Math.pow(safeParseFloat(pump.de.velV), 2)
                ) / 2),
                VA: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.velAxl), 2) +
                    Math.pow(safeParseFloat(pump.de.velAxl), 2)
                ) / 2),
                AH: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.accH), 2) +
                    Math.pow(safeParseFloat(pump.de.accH), 2)
                ) / 2),
                AV: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.accV), 2) +
                    Math.pow(safeParseFloat(pump.de.accV), 2)
                ) / 2),
                AA: Math.sqrt((
                    Math.pow(safeParseFloat(pump.nde.accAxl), 2) +
                    Math.pow(safeParseFloat(pump.de.accAxl), 2)
                ) / 2),
                f: safeParseFloat(mockFormData.operatingFrequency),
                N: safeParseFloat(mockFormData.operatingSpeed),
                temp: Math.max(
                    safeParseFloat(pump.nde.temp),
                    safeParseFloat(pump.de.temp)
                )
            };

            // Validate all required fields are present and valid
            expect(pumpData.VH).toBeGreaterThan(0);
            expect(pumpData.VV).toBeGreaterThan(0);
            expect(pumpData.VA).toBeGreaterThan(0);
            expect(pumpData.AH).toBeGreaterThan(0);
            expect(pumpData.AV).toBeGreaterThan(0);
            expect(pumpData.AA).toBeGreaterThan(0);
            expect(pumpData.f).toBe(50);
            expect(pumpData.N).toBe(1450);
            expect(pumpData.temp).toBeGreaterThan(0);

            // Test FailureAnalysisEngine validation
            expect(FailureAnalysisEngine.validateVibrationData(pumpData)).toBe(true);
        });

        test('should create valid VibrationData for motor analysis', () => {
            const motor = mockFormData.vibrationData.motor;
            
            const motorData: VibrationData = {
                VH: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.velH), 2) +
                    Math.pow(safeParseFloat(motor.de.velH), 2)
                ) / 2),
                VV: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.velV), 2) +
                    Math.pow(safeParseFloat(motor.de.velV), 2)
                ) / 2),
                VA: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.velAxl), 2) +
                    Math.pow(safeParseFloat(motor.de.velAxl), 2)
                ) / 2),
                AH: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.accH), 2) +
                    Math.pow(safeParseFloat(motor.de.accH), 2)
                ) / 2),
                AV: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.accV), 2) +
                    Math.pow(safeParseFloat(motor.de.accV), 2)
                ) / 2),
                AA: Math.sqrt((
                    Math.pow(safeParseFloat(motor.nde.accAxl), 2) +
                    Math.pow(safeParseFloat(motor.de.accAxl), 2)
                ) / 2),
                f: safeParseFloat(mockFormData.operatingFrequency),
                N: safeParseFloat(mockFormData.operatingSpeed),
                temp: Math.max(
                    safeParseFloat(motor.nde.temp),
                    safeParseFloat(motor.de.temp)
                )
            };

            // Test FailureAnalysisEngine validation
            expect(FailureAnalysisEngine.validateVibrationData(motorData)).toBe(true);
        });
    });

    describe('FailureAnalysisEngine Integration', () => {
        test('should successfully perform comprehensive analysis with valid data', () => {
            const validData: VibrationData = {
                VH: 2.65, VV: 1.95, VA: 1.35,
                AH: 0.85, AV: 0.65, AA: 0.45,
                f: 50, N: 1450, temp: 46.5
            };

            expect(() => {
                const analyses = FailureAnalysisEngine.performComprehensiveAnalysis(validData);
                expect(analyses).toBeDefined();
                expect(Array.isArray(analyses)).toBe(true);
                expect(analyses.length).toBeGreaterThan(0);
                
                // Verify each analysis has required properties
                analyses.forEach(analysis => {
                    expect(analysis.type).toBeDefined();
                    expect(analysis.severity).toBeDefined();
                    expect(analysis.index).toBeDefined();
                    expect(['Good', 'Moderate', 'Severe', 'Critical']).toContain(analysis.severity);
                });
            }).not.toThrow();
        });

        test('should reject invalid data with proper validation', () => {
            const invalidData = {
                VH: -1, VV: 0, VA: 0,
                AH: 0, AV: 0, AA: 0,
                f: -50, N: -1450, temp: 0
            };

            expect(FailureAnalysisEngine.validateVibrationData(invalidData)).toBe(false);
        });
    });

    describe('Data Flow End-to-End', () => {
        test('should maintain data integrity from form to engine', () => {
            // Simulate the complete data flow
            const formFrequency = safeParseFloat(mockFormData.operatingFrequency);
            const formSpeed = safeParseFloat(mockFormData.operatingSpeed);
            
            // Verify operating parameters are correctly passed through
            expect(formFrequency).toBe(50);
            expect(formSpeed).toBe(1450);
            
            // Create VibrationData as the form would
            const pumpData: VibrationData = {
                VH: 2.65, VV: 1.95, VA: 1.35,
                AH: 0.85, AV: 0.65, AA: 0.45,
                f: formFrequency,  // FIXED: Use actual frequency
                N: formSpeed,      // FIXED: Use actual speed
                temp: 48
            };
            
            // Verify the engine receives correct operating parameters
            expect(pumpData.f).toBe(50);
            expect(pumpData.N).toBe(1450);
            
            // Verify analysis can be performed
            expect(FailureAnalysisEngine.validateVibrationData(pumpData)).toBe(true);
            
            const analyses = FailureAnalysisEngine.performComprehensiveAnalysis(pumpData);
            expect(analyses.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle zero vibration values gracefully', () => {
            const zeroData: VibrationData = {
                VH: 0, VV: 0, VA: 0,
                AH: 0, AV: 0, AA: 0,
                f: 50, N: 1450, temp: 25
            };

            expect(FailureAnalysisEngine.validateVibrationData(zeroData)).toBe(false);
        });

        test('should handle extreme operating parameters', () => {
            const extremeData: VibrationData = {
                VH: 1, VV: 1, VA: 1,
                AH: 1, AV: 1, AA: 1,
                f: 999,    // Near maximum
                N: 99999,  // Near maximum
                temp: 25
            };

            expect(FailureAnalysisEngine.validateVibrationData(extremeData)).toBe(true);
        });

        test('should reject out-of-range operating parameters', () => {
            const outOfRangeData: VibrationData = {
                VH: 1, VV: 1, VA: 1,
                AH: 1, AV: 1, AA: 1,
                f: 1001,    // Over maximum
                N: 100001,  // Over maximum
                temp: 25
            };

            expect(FailureAnalysisEngine.validateVibrationData(outOfRangeData)).toBe(false);
        });
    });
});
