// Mock data and types for EnhancedMLPipelines

// import { masterEquipmentData } from './masterEquipmentData';

import type { RULPrediction, MaintenanceSchedule, RiskAssessment, PipelineStatus } from '../types/ml';
import { aggregateVibrationHistory } from '../lib/utils';

function mapCondition(condition: string): 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent' {
    switch (condition?.toLowerCase?.()) {
        case 'critical': return 'Critical';
        case 'poor': return 'Poor';
        case 'fair': return 'Fair';
        case 'good': return 'Good';
        case 'excellent': return 'Excellent';
        default: return 'Fair';
    }
}

function mapRiskLevel(risk: string): 'High Risk' | 'Medium Risk' | 'Low Risk' {
    switch (risk?.toLowerCase?.()) {
        case 'critical': return 'High Risk';
        case 'high': return 'High Risk';
        case 'medium': return 'Medium Risk';
        case 'low': return 'Low Risk';
        case 'excellent': return 'Low Risk';
        default: return 'Medium Risk';
    }
}

function mapPriority(risk: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    switch (risk?.toLowerCase?.()) {
        case 'critical': return 'Critical';
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        case 'excellent': return 'Low';
        default: return 'Medium';
    }
}

export function getRULPredictionsFromHistory(vibrationHistory) {
    const equipment = aggregateVibrationHistory(vibrationHistory);
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return [];
    }
    return equipment.map(eq => ({
        equipment: eq.name,
        condition: mapCondition(eq.condition),
        vibration: `${eq.vibration} mm/s`,
        operatingHours: 5000,
        predictedRUL: eq.rul,
        riskLevel: mapRiskLevel(eq.riskLevel),
        riskScore: eq.healthScore,
        lastMaintenance: '2024-06-01',
        nextMaintenance: eq.maintenanceSchedule,
        maintenanceType: 'Predictive',
        priority: mapPriority(eq.riskLevel),
        costImpact: 10000,
        downtimeImpact: 2
    })) as RULPrediction[];
}

export function getMaintenanceSchedulesFromHistory(vibrationHistory) {
    const equipment = aggregateVibrationHistory(vibrationHistory);
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return [];
    }
    return equipment.map(eq => ({
        id: eq.id,
        equipment: eq.name,
        maintenanceType: 'Predictive' as const,
        scheduledDate: new Date(eq.maintenanceSchedule),
        status: eq.status as any,
        priority: mapPriority(eq.riskLevel),
        estimatedCost: eq.estimatedCost || 10000,
        riskScore: eq.healthScore,
        description: eq.description || `Scheduled predictive maintenance for ${eq.name}`,
        requiredParts: eq.requiredParts || ['Standard Kit'],
        estimatedDuration: eq.estimatedDuration || 4,
        assignedTechnician: eq.assignedTechnician || 'Unassigned'
    })) as MaintenanceSchedule[];
}

export function getRiskAssessmentsFromHistory(vibrationHistory) {
    const equipment = aggregateVibrationHistory(vibrationHistory);
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return [];
    }
    return equipment.map(eq => ({
        equipment: eq.name,
        riskLevel: mapRiskLevel(eq.riskLevel),
        riskScore: eq.healthScore,
        factors: {
            vibration: eq.vibration || Math.round(Math.random() * 10 + 70),
            temperature: 35,
            operatingHours: eq.rul || Math.round(Math.random() * 5000 + 1000),
            age: eq.age || Math.round(Math.random() * 10 + 1),
            criticality: eq.criticality || Math.round(Math.random() * 10 + 1),
            environment: eq.environment || Math.round(Math.random() * 10 + 1)
        },
        recommendations: [
            'Increase monitoring frequency',
            'Schedule preventive maintenance',
            'Review operating parameters'
        ],
        mitigationActions: [
            'Replace worn components',
            'Lubricate moving parts',
            'Inspect for leaks'
        ]
    })) as RiskAssessment[];
}

export function getPipelineStatusesFromHistory(vibrationHistory) {
    const equipment = aggregateVibrationHistory(vibrationHistory);
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return [];
    }
    return equipment.map(eq => ({
        pipelineId: eq.id,
        name: eq.name,
        equipment: eq.name,
        status: 'Active',
        lastRun: '2024-06-25T10:00:00Z',
        description: `ML pipeline for ${eq.name}`
    })) as PipelineStatus[];
} 