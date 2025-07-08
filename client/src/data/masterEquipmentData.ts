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
    },
    {
        id: "EQ-PUMP-005",
        name: "Booster Pump",
        type: "Pump",
        status: "operational",
        condition: "good",
        healthScore: 90,
        riskLevel: "low",
        trend: "stable",
        vibration: 2.5,
        temperature: 68,
        alerts: [
            { id: "ALERT-004", severity: "medium", message: "Slight vibration increase", timestamp: "2024-06-22T11:00:00Z" }
        ],
        rul: 3100,
        maintenanceSchedule: "2024-07-12"
    },
    {
        id: "EQ-MOTOR-006",
        name: "Backup Motor",
        type: "Motor",
        status: "operational",
        condition: "good",
        healthScore: 88,
        riskLevel: "medium",
        trend: "improving",
        vibration: 2.0,
        temperature: 66,
        alerts: [
            { id: "ALERT-005", severity: "medium", message: "Temperature slightly high", timestamp: "2024-06-21T13:00:00Z" }
        ],
        rul: 2800,
        maintenanceSchedule: "2024-07-18"
    },
    {
        id: "EQ-PUMP-007",
        name: "Fire Pump",
        type: "Pump",
        status: "operational",
        condition: "critical",
        healthScore: 60,
        riskLevel: "high",
        trend: "declining",
        vibration: 6.0,
        temperature: 85,
        alerts: [
            { id: "ALERT-006", severity: "critical", message: "Critical temperature", timestamp: "2024-06-20T15:00:00Z" },
            { id: "ALERT-007", severity: "high", message: "Vibration above normal", timestamp: "2024-06-20T15:10:00Z" }
        ],
        rul: 800,
        maintenanceSchedule: "2024-06-30"
    },
    {
        id: "EQ-MOTOR-008",
        name: "Ventilation Motor",
        type: "Motor",
        status: "operational",
        condition: "fair",
        healthScore: 80,
        riskLevel: "medium",
        trend: "stable",
        vibration: 3.0,
        temperature: 70,
        alerts: [
            { id: "ALERT-008", severity: "medium", message: "Vibration above normal", timestamp: "2024-06-19T10:00:00Z" }
        ],
        rul: 2000,
        maintenanceSchedule: "2024-07-20"
    },
    {
        id: "EQ-PUMP-009",
        name: "Circulation Pump",
        type: "Pump",
        status: "operational",
        condition: "good",
        healthScore: 85,
        riskLevel: "low",
        trend: "improving",
        vibration: 2.2,
        temperature: 67,
        alerts: [
            { id: "ALERT-009", severity: "medium", message: "Temperature above normal", timestamp: "2024-06-18T09:00:00Z" }
        ],
        rul: 2900,
        maintenanceSchedule: "2024-07-22"
    },
    {
        id: "EQ-MOTOR-010",
        name: "Conveyor Motor",
        type: "Motor",
        status: "operational",
        condition: "poor",
        healthScore: 70,
        riskLevel: "high",
        trend: "declining",
        vibration: 4.5,
        temperature: 75,
        alerts: [
            { id: "ALERT-010", severity: "high", message: "Vibration above threshold", timestamp: "2024-06-17T14:00:00Z" }
        ],
        rul: 1500,
        maintenanceSchedule: "2024-07-25"
    },
    {
        id: "EQ-PUMP-011",
        name: "Process Pump",
        type: "Pump",
        status: "operational",
        condition: "critical",
        healthScore: 58,
        riskLevel: "critical",
        trend: "declining",
        vibration: 6.2,
        temperature: 88,
        alerts: [
            { id: "ALERT-011", severity: "critical", message: "Critical vibration and temperature", timestamp: "2024-06-16T16:00:00Z" },
            { id: "ALERT-012", severity: "high", message: "Vibration above normal", timestamp: "2024-06-16T16:10:00Z" }
        ],
        rul: 700,
        maintenanceSchedule: "2024-07-28"
    },
    {
        id: "EQ-MOTOR-012",
        name: "Compressor Motor",
        type: "Motor",
        status: "operational",
        condition: "good",
        healthScore: 89,
        riskLevel: "medium",
        trend: "improving",
        vibration: 2.3,
        temperature: 69,
        alerts: [
            { id: "ALERT-013", severity: "medium", message: "Temperature above normal", timestamp: "2024-06-15T11:00:00Z" },
            { id: "ALERT-014", severity: "medium", message: "Vibration above normal", timestamp: "2024-06-15T11:10:00Z" }
        ],
        rul: 2700,
        maintenanceSchedule: "2024-07-30"
    }
]; 