// Mock data for Condition Monitoring
import type { Equipment } from '@/types/eams';
import { masterEquipmentData } from './masterEquipmentData';

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

export const monitoredEquipment: Equipment[] = masterEquipmentData.map(eq => ({
    id: eq.id,
    name: eq.name,
    type: eq.type as any,
    category: eq.type.toLowerCase() === 'motor' ? 'motor' : 'pump',
    manufacturer: 'Default Manufacturer',
    model: 'Default Model',
    serialNumber: eq.id,
    assetTag: eq.id,
    location: {
        pumpStation: 'Default Station',
        building: 'Default Building',
        floor: '1',
        room: 'A1',
        coordinates: { latitude: 0, longitude: 0 }
    },
    specifications: {},
    status: mapStatus(eq.status),
    condition: mapCondition(eq.condition),
    installationDate: '2023-01-01',
    warrantyExpiry: '2025-01-01',
    lastMaintenanceDate: '2024-06-01',
    nextMaintenanceDate: eq.maintenanceSchedule,
    operatingHours: 1000,
    tags: [],
    notes: '',
    conditionMonitoring: {
        vibration: {
            rmsVelocity: eq.vibration,
            peakVelocity: eq.vibration * 1.2,
            displacement: eq.vibration * 0.1,
            frequency: [50, 100, 150, 200],
            spectrum: [eq.vibration, eq.vibration * 0.8, eq.vibration * 0.6, eq.vibration * 0.4],
            iso10816Zone: 'B',
            measurementDate: '2024-06-25T10:00:00Z',
            measuredBy: 'System'
        },
        thermography: {
            maxTemperature: eq.temperature,
            avgTemperature: eq.temperature - 5,
            hotSpots: [],
            baseline: eq.temperature - 10,
            deltaT: 5,
            measurementDate: '2024-06-25T10:00:00Z'
        },
        oilAnalysis: {
            viscosity: 32,
            acidity: 0.1,
            moisture: 0.05,
            metalContent: { iron: 10, copper: 2, aluminum: 1, chromium: 0, lead: 0, tin: 0 },
            particleCount: 100,
            condition: 'normal',
            analysisDate: '2024-06-25T10:00:00Z',
            measurementDate: '2024-06-25T10:00:00Z'
        },
        lastUpdated: '2024-06-25T10:00:00Z',
        overallCondition: mapCondition(eq.condition),
        alerts: eq.alerts.map(alert => ({
            id: alert.id,
            type: 'vibration',
            severity: alert.severity as any,
            message: alert.message,
            threshold: 5,
            actualValue: eq.vibration,
            timestamp: alert.timestamp,
            acknowledged: false
        }))
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-06-25T10:00:00Z'
}));

export const initialVibrationData = masterEquipmentData.reduce((acc, eq) => {
    acc[eq.id] = {
        vibration: eq.vibration,
        temperature: eq.temperature
    };
    return acc;
}, {} as Record<string, { vibration: number; temperature: number }>); 