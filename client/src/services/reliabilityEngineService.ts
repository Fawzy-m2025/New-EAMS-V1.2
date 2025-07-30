/**
 * Reliability Engine Service - Frontend Integration with Python Backend
 * Provides interface between frontend failure analysis and Python reliability calculations
 */

import { VibrationData, FailureAnalysis, MasterHealthAssessment } from '@/utils/failureAnalysisEngine';

export interface PythonReliabilityRequest {
    vibration_data: {
        pump: {
            nde: VibrationMeasurement;
            de: VibrationMeasurement;
            legs: VibrationMeasurement[];
        };
        motor: {
            nde: VibrationMeasurement;
            de: VibrationMeasurement;
            legs: VibrationMeasurement[];
        };
    };
    operational_data: {
        operating_hours: number;
        operating_power: number;
        efficiency: number;
        temperature: number;
        pressure: number;
        flow_rate: number;
    };
    equipment_info: {
        pump_model: string;
        motor_model: string;
        installation_date: string;
        maintenance_history: MaintenanceRecord[];
    };
}

export interface VibrationMeasurement {
    velocity_h: number;
    velocity_v: number;
    velocity_axial: number;
    acceleration_h: number;
    acceleration_v: number;
    acceleration_axial: number;
    bearing_vibration: number;
    bearing_gap: number;
    temperature: number;
}

export interface MaintenanceRecord {
    date: string;
    type: string;
    description: string;
    cost: number;
}

export interface PythonReliabilityResponse {
    reliability_metrics: {
        mtbf: number; // Mean Time Between Failures (hours)
        mttr: number; // Mean Time To Repair (hours)
        availability: number; // Percentage
        reliability_at_time: number; // Reliability at current operating time
        failure_rate: number; // Failures per hour
    };
    weibull_analysis: {
        beta: number; // Shape parameter
        eta: number; // Scale parameter (characteristic life)
        gamma: number; // Location parameter
        r_squared: number; // Goodness of fit
    };
    rul_prediction: {
        remaining_useful_life: number; // Hours
        confidence_interval: {
            lower: number;
            upper: number;
        };
        prediction_accuracy: number; // Percentage
    };
    failure_modes: {
        mode: string;
        probability: number;
        severity: number;
        detectability: number;
        rpn: number; // Risk Priority Number
    }[];
    maintenance_optimization: {
        optimal_interval: number; // Hours
        cost_savings: number; // Currency
        recommended_actions: string[];
    };
    condition_indicators: {
        overall_health: number; // 0-100
        degradation_rate: number;
        anomaly_score: number;
        trend_direction: 'improving' | 'stable' | 'degrading';
    };
}

export class ReliabilityEngineService {
    private static instance: ReliabilityEngineService;
    private baseUrl: string;

    private constructor() {
        // Use import.meta.env for Vite or fallback to default
        this.baseUrl = (import.meta.env?.VITE_PYTHON_API_URL as string) || 'http://localhost:8000';
    }

    static getInstance(): ReliabilityEngineService {
        if (!ReliabilityEngineService.instance) {
            ReliabilityEngineService.instance = new ReliabilityEngineService();
        }
        return ReliabilityEngineService.instance;
    }

    /**
     * Convert frontend vibration data to Python API format
     */
    private formatVibrationDataForPython(formData: any): PythonReliabilityRequest {
        const vibrationData = formData.vibrationData || {};

        const formatMeasurement = (data: any): VibrationMeasurement => ({
            velocity_h: parseFloat(data?.velH || '0'),
            velocity_v: parseFloat(data?.velV || '0'),
            velocity_axial: parseFloat(data?.velAxl || '0'),
            acceleration_h: parseFloat(data?.accH || '0'),
            acceleration_v: parseFloat(data?.accV || '0'),
            acceleration_axial: parseFloat(data?.accAxl || '0'),
            bearing_vibration: parseFloat(data?.bv || '0'),
            bearing_gap: parseFloat(data?.bg || '0'),
            temperature: parseFloat(data?.temp || '0')
        });

        return {
            vibration_data: {
                pump: {
                    nde: formatMeasurement(vibrationData.pump?.nde),
                    de: formatMeasurement(vibrationData.pump?.de),
                    legs: [] // Legs removed - using NDE/DE data for FailureAnalysisEngine
                },
                motor: {
                    nde: formatMeasurement(vibrationData.motor?.nde),
                    de: formatMeasurement(vibrationData.motor?.de),
                    legs: [] // Legs removed - using NDE/DE data for FailureAnalysisEngine
                }
            },
            operational_data: {
                operating_hours: parseFloat(formData.operatingHours || '0'),
                operating_power: parseFloat(formData.operatingPower || '0'),
                efficiency: parseFloat(formData.efficiency || '0'),
                temperature: parseFloat(formData.ambientTemperature || '0'),
                pressure: parseFloat(formData.dischargePressure || '0'),
                flow_rate: parseFloat(formData.flowRate || '0')
            },
            equipment_info: {
                pump_model: formData.selectedEquipment?.[0] || 'Unknown',
                motor_model: formData.selectedEquipment?.[1] || 'Unknown',
                installation_date: formData.date || new Date().toISOString(),
                maintenance_history: [] // Would be populated from historical data
            }
        };
    }

    /**
     * Call Python reliability engine for comprehensive analysis
     */
    async performReliabilityAnalysis(formData: any): Promise<PythonReliabilityResponse | null> {
        try {
            const requestData = this.formatVibrationDataForPython(formData);

            const response = await fetch(`${this.baseUrl}/api/reliability/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                console.warn('Python reliability engine not available, using fallback calculations');
                return this.generateFallbackAnalysis(requestData);
            }

            return await response.json();
        } catch (error) {
            console.warn('Failed to connect to Python reliability engine:', error);
            return this.generateFallbackAnalysis(this.formatVibrationDataForPython(formData));
        }
    }

    /**
     * Generate fallback reliability analysis when Python backend is unavailable
     */
    private generateFallbackAnalysis(data: PythonReliabilityRequest): PythonReliabilityResponse {
        // Calculate basic reliability metrics using frontend algorithms
        const avgVibration = this.calculateAverageVibration(data.vibration_data);
        const operatingHours = data.operational_data.operating_hours;

        // Simple reliability calculations (would be much more sophisticated in Python)
        const baseReliability = Math.max(0, 100 - (avgVibration * 10));
        const failureRate = avgVibration / 10000; // Simplified calculation
        const mtbf = failureRate > 0 ? 1 / failureRate : 8760; // Hours

        return {
            reliability_metrics: {
                mtbf: mtbf,
                mttr: 24, // Assumed 24 hours repair time
                availability: (mtbf / (mtbf + 24)) * 100,
                reliability_at_time: Math.exp(-operatingHours / mtbf),
                failure_rate: failureRate
            },
            weibull_analysis: {
                beta: 2.0, // Assumed Weibull shape parameter
                eta: mtbf * Math.pow(Math.log(2), 1 / 2), // Scale parameter
                gamma: 0, // Location parameter
                r_squared: 0.85 // Assumed goodness of fit
            },
            rul_prediction: {
                remaining_useful_life: Math.max(0, mtbf - operatingHours),
                confidence_interval: {
                    lower: Math.max(0, mtbf - operatingHours - 1000),
                    upper: mtbf - operatingHours + 1000
                },
                prediction_accuracy: 75 // Assumed accuracy
            },
            failure_modes: [
                {
                    mode: 'Bearing Failure',
                    probability: avgVibration > 5 ? 0.3 : 0.1,
                    severity: 8,
                    detectability: 6,
                    rpn: (avgVibration > 5 ? 0.3 : 0.1) * 8 * 6 * 100
                },
                {
                    mode: 'Unbalance',
                    probability: avgVibration > 3 ? 0.2 : 0.05,
                    severity: 6,
                    detectability: 4,
                    rpn: (avgVibration > 3 ? 0.2 : 0.05) * 6 * 4 * 100
                }
            ],
            maintenance_optimization: {
                optimal_interval: mtbf * 0.7, // 70% of MTBF
                cost_savings: 15000, // Assumed savings
                recommended_actions: [
                    'Schedule preventive maintenance',
                    'Monitor vibration trends',
                    'Check lubrication levels'
                ]
            },
            condition_indicators: {
                overall_health: baseReliability,
                degradation_rate: avgVibration / 100,
                anomaly_score: Math.min(100, avgVibration * 20),
                trend_direction: avgVibration > 5 ? 'degrading' : avgVibration > 3 ? 'stable' : 'improving'
            }
        };
    }

    /**
     * Calculate average vibration across all measurement points
     */
    private calculateAverageVibration(vibrationData: any): number {
        const measurements = [
            vibrationData.pump.nde.velocity_h,
            vibrationData.pump.nde.velocity_v,
            vibrationData.pump.de.velocity_h,
            vibrationData.pump.de.velocity_v,
            vibrationData.motor.nde.velocity_h,
            vibrationData.motor.nde.velocity_v,
            vibrationData.motor.de.velocity_h,
            vibrationData.motor.de.velocity_v
            // Legs removed - using NDE/DE data for FailureAnalysisEngine
        ].filter(val => val > 0);

        return measurements.length > 0 ?
            measurements.reduce((sum, val) => sum + val, 0) / measurements.length : 0;
    }

    /**
     * Enhance frontend failure analysis with Python reliability data
     */
    async enhanceFailureAnalysisWithReliability(
        failureAnalyses: FailureAnalysis[],
        formData: any
    ): Promise<FailureAnalysis[]> {
        const reliabilityData = await this.performReliabilityAnalysis(formData);

        if (!reliabilityData) {
            return failureAnalyses;
        }

        // Enhance each failure analysis with reliability insights
        return failureAnalyses.map(analysis => ({
            ...analysis,
            description: `${analysis.description} | RUL: ${reliabilityData.rul_prediction.remaining_useful_life.toFixed(0)}h | Reliability: ${(reliabilityData.reliability_metrics.reliability_at_time * 100).toFixed(1)}%`,
            preventiveMeasures: [
                ...analysis.preventiveMeasures,
                `Optimal maintenance interval: ${reliabilityData.maintenance_optimization.optimal_interval.toFixed(0)} hours`,
                `Predicted cost savings: $${reliabilityData.maintenance_optimization.cost_savings.toLocaleString()}`
            ]
        }));
    }

    /**
     * Get reliability-enhanced master health assessment
     */
    async getEnhancedMasterHealth(
        masterHealth: MasterHealthAssessment,
        formData: any
    ): Promise<MasterHealthAssessment> {
        const reliabilityData = await this.performReliabilityAnalysis(formData);

        if (!reliabilityData) {
            return masterHealth;
        }

        return {
            ...masterHealth,
            overallHealthScore: (masterHealth.overallHealthScore + reliabilityData.condition_indicators.overall_health) / 2,
            recommendations: [
                ...masterHealth.recommendations,
                `Remaining Useful Life: ${reliabilityData.rul_prediction.remaining_useful_life.toFixed(0)} hours`,
                `MTBF: ${reliabilityData.reliability_metrics.mtbf.toFixed(0)} hours`,
                `Availability: ${reliabilityData.reliability_metrics.availability.toFixed(1)}%`,
                ...reliabilityData.maintenance_optimization.recommended_actions
            ]
        };
    }
}
