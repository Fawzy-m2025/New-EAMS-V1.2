// Mock data for Condition Monitoring
import type { Equipment } from '@/types/eams';

function mapStatus(status: string): 'operational' | 'maintenance' | 'offline' {
    switch (status.toLowerCase()) {
        case 'operational': return 'operational';
        case 'maintenance': return 'maintenance';
        case 'offline': return 'offline';
        default: return 'operational';
    }
}

function mapCondition(condition: string): 'critical' | 'poor' | 'fair' | 'good' | 'excellent' {
    switch (condition.toLowerCase()) {
        case 'critical': return 'critical';
        case 'poor': return 'poor';
        case 'fair': return 'fair';
        case 'good': return 'good';
        case 'excellent': return 'excellent';
        default: return 'fair';
    }
}

export function getMonitoredEquipment(equipment: any[]): Equipment[] {
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return [];
    }
    // Return the real equipment objects, not remapped/mock data
    return equipment;
}

export function getInitialVibrationData(equipment: any[]) {
    if (!equipment || !Array.isArray(equipment) || equipment.length === 0) {
        return {};
    }
    return equipment.reduce((acc, eq) => {
        acc[eq.id] = {
            vibration: eq.vibration,
            temperature: eq.temperature
        };
        return acc;
    }, {} as Record<string, { vibration: number; temperature: number }>);
} 