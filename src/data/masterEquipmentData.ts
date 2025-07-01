// Master equipment data for all modules
export interface MasterEquipment {
    id: string;
    name: string;
    type: string;
    status: string;
    condition: string;
    healthScore: number;
    riskLevel: string;
    trend: string;
    vibration: number;
    temperature: number;
    alerts: {
        id: string;
        severity: string;
        message: string;
        timestamp: string;
    }[];
    rul: number;
    maintenanceSchedule: string;
    // Add more fields as needed for other modules
}

export const masterEquipmentData: MasterEquipment[] = [
    {
        id: "EQ-PUMP-001",
        name: "Main Water Pump",
        type: "Pump",
        status: "operational",
        condition: "good",
        healthScore: 92,
        riskLevel: "low",
        trend: "improving",
        vibration: 2.1,
        temperature: 65,
        alerts: [
            {
                id: "ALERT-001",
                severity: "high",
                message: "Vibration above threshold",
                timestamp: "2024-06-25T10:00:00Z"
            }
        ],
        rul: 3200,
        maintenanceSchedule: "2024-07-10"
    },
    {
        id: "EQ-MOTOR-002",
        name: "Drive Motor Unit",
        type: "Motor",
        status: "operational",
        condition: "fair",
        healthScore: 78,
        riskLevel: "medium",
        trend: "declining",
        vibration: 3.2,
        temperature: 72,
        alerts: [
            {
                id: "ALERT-002",
                severity: "medium",
                message: "Temperature above normal",
                timestamp: "2024-06-24T14:30:00Z"
            }
        ],
        rul: 2100,
        maintenanceSchedule: "2024-07-15"
    },
    {
        id: "EQ-PUMP-003",
        name: "Secondary Water Pump",
        type: "Pump",
        status: "operational",
        condition: "critical",
        healthScore: 55,
        riskLevel: "critical",
        trend: "declining",
        vibration: 5.8,
        temperature: 80,
        alerts: [
            {
                id: "ALERT-003",
                severity: "critical",
                message: "Critical vibration and temperature",
                timestamp: "2024-06-23T09:00:00Z"
            }
        ],
        rul: 900,
        maintenanceSchedule: "2024-06-28"
    },
    {
        id: "EQ-MOTOR-004",
        name: "Auxiliary Motor Unit",
        type: "Motor",
        status: "operational",
        condition: "excellent",
        healthScore: 98,
        riskLevel: "excellent",
        trend: "improving",
        vibration: 1.2,
        temperature: 60,
        alerts: [],
        rul: 5000,
        maintenanceSchedule: "2024-08-01"
    }
    // Add more equipment as needed
]; 