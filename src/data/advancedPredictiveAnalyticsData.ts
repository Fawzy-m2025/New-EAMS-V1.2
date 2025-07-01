// Mock data for Advanced Predictive Analytics

import { masterEquipmentData } from './masterEquipmentData';

function mapRiskLevel(risk: string): 'critical' | 'high' | 'medium' | 'low' | 'excellent' {
    switch (risk.toLowerCase()) {
        case 'critical': return 'critical';
        case 'high': return 'high';
        case 'medium': return 'medium';
        case 'low': return 'low';
        case 'excellent': return 'excellent';
        default: return 'medium';
    }
}

function mapPriority(risk: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (risk.toLowerCase()) {
        case 'critical': return 'critical';
        case 'high': return 'high';
        case 'medium': return 'medium';
        case 'low': return 'low';
        case 'excellent': return 'low';
        default: return 'medium';
    }
}

export const equipmentHealthScores = masterEquipmentData.map(eq => ({
    assetId: eq.id,
    assetName: eq.name,
    score: eq.healthScore,
    riskLevel: mapRiskLevel(eq.riskLevel),
    trend: eq.trend,
    lastUpdated: '2024-06-25'
}));

export const equipmentPredictiveAlerts = masterEquipmentData.flatMap(eq =>
    eq.alerts.map(alert => ({
        ...alert,
        equipmentId: eq.id,
        severity: mapPriority(alert.severity)
    }))
);

export const equipmentWeibullData = masterEquipmentData.map(eq => ({
    equipmentId: eq.id,
    shapeParameter: 3.0,
    scaleParameter: eq.rul,
    lastUpdated: '2024-06-25'
}));

export const equipmentMaintenanceOptimization = masterEquipmentData.map(eq => ({
    equipmentId: eq.id,
    costSavings: 100000,
    uptimeImprovement: 5,
    maintenanceEfficiency: 90,
    roi: 200
}));

export const equipmentPrescriptiveActions = masterEquipmentData.map(eq => ({
    equipmentId: eq.id,
    action: 'Inspect and maintain',
    priority: mapPriority(eq.riskLevel),
    dueDate: eq.maintenanceSchedule
})); 