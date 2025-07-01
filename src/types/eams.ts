
export type EquipmentType = "mechanical" | "electrical" | "instrumentation";
export type EquipmentCategory = "pump" | "valve" | "motor" | "transformer" | "panel" | "butterfly_valve";
export type EquipmentStatus = "operational" | "maintenance" | "fault" | "offline" | "decommissioned" | "testing";
export type ConditionStatus = "excellent" | "good" | "fair" | "poor" | "critical";

export type Priority = "low" | "medium" | "high" | "critical" | "emergency";

export interface EAMSFilter {
  search: string;
  equipmentTypes: EquipmentType[];
  categories: EquipmentCategory[];
  status: EquipmentStatus[];
  conditions: ConditionStatus[];
  locations: string[];
  manufacturers: string[];
}

export interface ConditionAlert {
  id: string;
  type: 'vibration' | 'temperature' | 'pressure' | 'alignment';
  severity: 'warning' | 'critical' | 'info';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled' | 'assigned';
  assignedTo: string | string[];
  equipmentId: string;
  equipmentName?: string;
  location?: string;
  type?: string;
  createdDate: string;
  dueDate: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  cost?: number | {
    labor: number;
    parts: number;
    external: number;
    total: number;
  };
  procedures?: string[];
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assetTag?: string;
  location: {
    pumpStation?: string;
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  specifications: {
    ratedPower?: number;
    ratedVoltage?: number;
    ratedCurrent?: number;
    flowRate?: number;
    pressure?: number;
    speed?: number;
    efficiency?: number;
    diameter?: number;
    temperature?: number;
    frequency?: number;
  };
  status: EquipmentStatus;
  condition: ConditionStatus;
  installationDate?: string;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  operatingHours?: number;
  tags?: string[];
  notes?: string;
  conditionMonitoring: {
    vibration?: {
      rmsVelocity: number;
      peakVelocity: number;
      displacement: number;
      frequency: number[];
      spectrum: number[];
      iso10816Zone: 'A' | 'B' | 'C' | 'D';
      measurementDate: string;
      measuredBy: string;
    };
    alignment?: {
      angularMisalignment: number;
      parallelMisalignment: number;
      verticalOffset: number;
      horizontalOffset: number;
      tolerance: number;
      status: 'acceptable' | 'marginal' | 'unacceptable';
      measurementDate: string;
    };
    thermography?: {
      maxTemperature: number;
      avgTemperature: number;
      hotSpots: any[];
      baseline: number;
      deltaT: number;
      measurementDate: string;
    };
    oilAnalysis?: {
      viscosity: number;
      acidity: number;
      moisture: number;
      metalContent: {
        iron: number;
        copper: number;
        aluminum: number;
        chromium: number;
        lead: number;
        tin: number;
      };
      particleCount: number;
      condition: string;
      analysisDate: string;
      measurementDate: string;
    };
    lastUpdated: string;
    overallCondition: ConditionStatus;
    alerts: ConditionAlert[];
  };
  failureHistory: any[];
  maintenanceHistory: any[];
  history: {
    eventType: 'creation' | 'status_update' | 'condition_update' | 'maintenance' | 'monitoring_update' | 'deletion';
    timestamp: string;
    details: string;
    performedBy?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
