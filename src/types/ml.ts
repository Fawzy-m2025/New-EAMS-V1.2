// ML-related types for analytics, RUL, risk, pipeline, etc.

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





