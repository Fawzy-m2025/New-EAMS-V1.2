// Mock data for Advanced Predictive Analytics

// import { masterEquipmentData } from './masterEquipmentData';

function mapRiskLevel(risk: string | undefined | null): 'critical' | 'high' | 'medium' | 'low' | 'excellent' {
    if (typeof risk !== 'string') return 'medium';
    switch (risk.toLowerCase()) {
        case 'critical': return 'critical';
        case 'high': return 'high';
        case 'medium': return 'medium';
        case 'low': return 'low';
        case 'excellent': return 'excellent';
        default: return 'medium';
    }
}

function mapPriority(risk: string | undefined | null): 'critical' | 'high' | 'medium' | 'low' {
    if (typeof risk !== 'string') return 'medium';
    switch (risk.toLowerCase()) {
        case 'critical': return 'critical';
        case 'high': return 'high';
        case 'medium': return 'medium';
        case 'low': return 'low';
        case 'excellent': return 'low';
        default: return 'medium';
    }
}

// Helper: group vibration history by equipmentId
function groupByEquipment(vibrationHistory) {
    const map = new Map();
    for (const record of vibrationHistory) {
        if (!map.has(record.equipmentId)) map.set(record.equipmentId, []);
        map.get(record.equipmentId).push(record);
    }
    return map;
}

export function getEquipmentHealthScores(vibrationHistory) {
    if (!vibrationHistory || !Array.isArray(vibrationHistory) || vibrationHistory.length === 0) {
        return [];
    }
    const grouped = groupByEquipment(vibrationHistory);
    return Array.from(grouped.entries()).map(([equipmentId, records]) => {
        // Use the most recent record for health score
        const latest = records[records.length - 1];
        return {
            assetId: equipmentId,
            assetName: latest.pumpNo || latest.motorBrand || 'Unknown',
            score: 80 + Math.round(Math.random() * 20 - 10), // Placeholder: random health
            riskLevel: mapRiskLevel(latest.riskLevel),
            trend: 'stable',
            lastUpdated: latest.date,
            componentScores: {
                vibration: latest.positions?.vibrationRMS ?? 80,
                temperature: 85,
                pressure: 90,
                oil: 75,
                alignment: 95
            },
            predictedFailureDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
            confidence: 90
        };
    });
}

export function getEquipmentPredictiveAlerts(vibrationHistory) {
    if (!vibrationHistory || !Array.isArray(vibrationHistory) || vibrationHistory.length === 0) {
        return [];
    }
    // Example: alert if vibrationRMS > threshold
    return vibrationHistory.flatMap(record => {
        const alerts = [];
        if (record.positions?.vibrationRMS > 10) {
            alerts.push({
                equipmentId: record.equipmentId,
                severity: 'critical',
                message: 'High vibration detected',
                date: record.date
            });
        }
        return alerts;
    });
}

export function getEquipmentWeibullData(vibrationHistory) {
    if (!vibrationHistory || !Array.isArray(vibrationHistory) || vibrationHistory.length === 0) {
        return [];
    }
    const grouped = groupByEquipment(vibrationHistory);
    return Array.from(grouped.entries()).map(([equipmentId, records]) => ({
        equipmentId,
        shapeParameter: 2.8,
        scaleParameter: 8000,
        lastUpdated: records[records.length - 1].date
    }));
}

export function getEquipmentMaintenanceOptimization(vibrationHistory) {
    if (!vibrationHistory || !Array.isArray(vibrationHistory) || vibrationHistory.length === 0) {
        return [];
    }
    const grouped = groupByEquipment(vibrationHistory);
    return Array.from(grouped.entries()).map(([equipmentId, records]) => ({
        equipmentId,
        costSavings: 100000,
        uptimeImprovement: 5,
        maintenanceEfficiency: 90,
        roi: 200
    }));
}

export function getEquipmentPrescriptiveActions(vibrationHistory) {
    if (!vibrationHistory || !Array.isArray(vibrationHistory) || vibrationHistory.length === 0) {
        return [];
    }
    const grouped = groupByEquipment(vibrationHistory);
    return Array.from(grouped.entries()).map(([equipmentId, records]) => ({
        equipmentId,
        action: 'Inspect and maintain',
        priority: 'high',
        dueDate: records[records.length - 1].date
    }));
} 