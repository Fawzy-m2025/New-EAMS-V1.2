// Mock data and types for EnhancedMLPipelines

import { masterEquipmentData } from './masterEquipmentData';

function mapCondition(condition: string): 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent' {
    switch (condition.toLowerCase()) {
        case 'critical': return 'Critical';
        case 'poor': return 'Poor';
        case 'fair': return 'Fair';
        case 'good': return 'Good';
        case 'excellent': return 'Excellent';
        default: return 'Fair';
    }
}

function mapRiskLevel(risk: string): 'High Risk' | 'Medium Risk' | 'Low Risk' {
    switch (risk.toLowerCase()) {
        case 'critical': return 'High Risk';
        case 'high': return 'High Risk';
        case 'medium': return 'Medium Risk';
        case 'low': return 'Low Risk';
        case 'excellent': return 'Low Risk';
        default: return 'Medium Risk';
    }
}

function mapPriority(risk: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    switch (risk.toLowerCase()) {
        case 'critical': return 'Critical';
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        case 'excellent': return 'Low';
        default: return 'Medium';
    }
}

export interface RULPrediction {
    equipment: string;
    condition: 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';
    vibration: string;
    operatingHours: number;
    predictedRUL: number;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
    riskScore: number;
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceType: 'Preventive' | 'Predictive' | 'Emergency' | 'Condition-Based';
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    costImpact: number;
    downtimeImpact: number;
}

export interface MaintenanceSchedule {
    id: string;
    equipment: string;
    maintenanceType: 'Preventive' | 'Predictive' | 'Emergency' | 'Condition-Based';
    scheduledDate: Date;
    estimatedDuration: number;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
    assignedTechnician?: string;
    estimatedCost: number;
    riskScore: number;
    description: string;
    requiredParts: string[];
}

export interface RiskAssessment {
    equipment: string;
    riskScore: number;
    factors: {
        vibration: number;
        temperature: number;
        operatingHours: number;
        age: number;
        criticality: number;
        environment: number;
    };
    recommendations: string[];
    mitigationActions: string[];
}

export interface PipelineStatus {
    name: string;
    status: 'Active' | 'Training' | 'Failed' | 'Idle';
    lastRun: string;
    description: string;
}

export const rulPredictions = masterEquipmentData.map(eq => ({
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
}));

export const maintenanceSchedules = masterEquipmentData.map(eq => ({
    id: eq.id,
    equipment: eq.name,
    maintenanceType: 'Predictive',
    scheduledDate: new Date(eq.maintenanceSchedule),
    status: eq.status as any,
    priority: mapPriority(eq.riskLevel)
}));

export const riskAssessments = masterEquipmentData.map(eq => ({
    equipment: eq.name,
    riskLevel: mapRiskLevel(eq.riskLevel),
    riskScore: eq.healthScore,
    impact: 'Medium',
    likelihood: 'Low',
    mitigation: 'Routine check'
}));

export const pipelineStatuses = masterEquipmentData.map(eq => ({
    pipelineId: eq.id,
    equipment: eq.name,
    status: 'Active',
    lastRun: '2024-06-25T10:00:00Z'
})); 