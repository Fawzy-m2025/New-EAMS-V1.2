
export type EquipmentType = "mechanical" | "electrical" | "instrumentation";
export type EquipmentCategory = "pump" | "valve" | "motor" | "transformer" | "panel" | "butterfly_valve" | "compressor" | "tank" | "filter" | "sensor" | "other";
export type EquipmentStatus = "operational" | "maintenance" | "fault" | "offline" | "decommissioned" | "testing";
export type ConditionStatus = "excellent" | "good" | "fair" | "poor" | "critical";

export type Priority = "low" | "medium" | "high" | "critical" | "emergency";

// Hierarchical Asset Structure Types
export type HierarchyLevel = "zone" | "station" | "line" | "system" | "equipment";

export interface HierarchyNode {
  id: string;
  name: string;
  level: HierarchyLevel;
  parentId?: string;
  children?: HierarchyNode[];
  path: string; // Full hierarchy path (e.g., "Zone A/Pump Station A01/Line 1")
  breadcrumbs: BreadcrumbItem[];
  assetCount?: number; // Number of assets in this node and its children
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  level: HierarchyLevel;
  path: string;
}

export interface Zone extends HierarchyNode {
  level: "zone";
  description?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  stations: Station[];
}

export interface Station extends HierarchyNode {
  level: "station";
  zoneId: string;
  stationType: "pump_station" | "control_station" | "power_station" | "treatment_station";
  capacity?: number;
  operationalStatus: "active" | "inactive" | "maintenance" | "emergency";
  lines: Line[];
  systems: System[];
}

export interface Line extends HierarchyNode {
  level: "line";
  stationId: string;
  lineNumber: number;
  capacity?: number;
  operationalStatus: "active" | "inactive" | "maintenance" | "emergency";
  equipment: Equipment[];
}

export interface System extends HierarchyNode {
  level: "system";
  stationId: string;
  systemType: "priming" | "water_hammer" | "control" | "power" | "cooling" | "filtration" | "other";
  operationalStatus: "active" | "inactive" | "maintenance" | "emergency";
  equipment: Equipment[];
}

export interface EAMSFilter {
  search: string;
  equipmentTypes: EquipmentType[];
  categories: EquipmentCategory[];
  status: EquipmentStatus[];
  conditions: ConditionStatus[];
  locations: string[];
  manufacturers: string[];
  // Hierarchical filters
  zones: string[];
  stations: string[];
  lines: string[];
  systems: string[];
  hierarchyLevel?: HierarchyLevel;
  parentNodeId?: string;
}

// Hierarchy management interfaces
export interface HierarchyTreeNode {
  id: string;
  name: string;
  level: HierarchyLevel;
  parentId?: string;
  children: HierarchyTreeNode[];
  assetCount: number;
  isExpanded: boolean;
  isSelected: boolean;
  path: string;
  breadcrumbs: BreadcrumbItem[];
  icon?: string;
  status?: "active" | "inactive" | "maintenance" | "emergency";
}

export interface HierarchyFilter {
  selectedNodes: string[];
  expandedNodes: string[];
  searchTerm: string;
  showOnlyWithAssets: boolean;
  levelFilter?: HierarchyLevel;
}

export interface HierarchyStats {
  totalZones: number;
  totalStations: number;
  totalLines: number;
  totalSystems: number;
  totalEquipment: number;
  operationalEquipment: number;
  maintenanceEquipment: number;
  faultEquipment: number;
  criticalAlerts: number;
}

export interface AssetPath {
  zone: string;
  station: string;
  line?: string;
  system?: string;
  equipment?: string;
  fullPath: string;
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

export interface Equipment extends HierarchyNode {
  level: "equipment";
  type: EquipmentType;
  category: EquipmentCategory;
  manufacturer: string;
  model: string;
  serialNumber: string;
  assetTag?: string;

  // Hierarchical location information
  zoneId: string;
  stationId: string;
  lineId?: string; // Optional for equipment in systems
  systemId?: string; // Optional for equipment in lines

  // Legacy location support for backward compatibility
  location: {
    zone?: string;
    station?: string;
    line?: string;
    system?: string;
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
    volume?: number; // For tanks
    vacuumLevel?: number; // For vacuum pumps
    quantity?: number; // For multiple units
    nozzleSize?: number; // For tanks
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
