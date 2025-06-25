import type { Equipment } from "@/types/eams";

// Asset categories for filtering
export const assetCategories = [
  { value: "pump", label: "Pumps" },
  { value: "motor", label: "Motors" },
  { value: "butterfly_valve", label: "Butterfly Valves" },
  { value: "panel", label: "Panels" },
  { value: "transformer", label: "Transformers" }
];

// Pump stations for location filtering
export const pumpStations = [
  "Station A",
  "Station B", 
  "Station C",
  "Main Building",
  "Power House",
  "Office Building"
];

// Asset manufacturers for filtering
export const assetManufacturers = [
  "Grundfos",
  "Caterpillar", 
  "Keystone",
  "Carrier",
  "Schneider Electric",
  "ABB",
  "Siemens",
  "GE"
];

export const enhancedAssetData: Equipment[] = [
  {
    id: "EQ-001",
    name: "Main Centrifugal Pump P-001",
    type: "mechanical",
    category: "pump",
    manufacturer: "Grundfos",
    model: "NK 150-315",
    serialNumber: "GF2024001",
    assetTag: "AST-001",
    location: {
      pumpStation: "Station A",
      building: "Main Building",
      floor: "Ground Floor",
      room: "Pump Room 1",
      coordinates: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    },
    specifications: {
      ratedPower: 45,
      ratedVoltage: 480,
      ratedCurrent: 65,
      flowRate: 1500,
      pressure: 85,
      speed: 1750,
      efficiency: 85,
      temperature: 40
    },
    status: "operational",
    condition: "good",
    installationDate: "2023-06-15",
    warrantyExpiry: "2026-06-15",
    lastMaintenanceDate: "2024-11-15",
    nextMaintenanceDate: "2025-02-15",
    operatingHours: 8760,
    tags: ["critical", "high-priority", "24/7"],
    notes: "Primary pump for main circulation system",
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 2.1,
        peakVelocity: 8.5,
        displacement: 0.05,
        frequency: [1750, 3500, 5250],
        spectrum: [2.1, 1.8, 0.9],
        iso10816Zone: "A",
        measurementDate: "2024-12-01",
        measuredBy: "John Smith"
      },
      alignment: {
        angularMisalignment: 0.02,
        parallelMisalignment: 0.03,
        verticalOffset: 0.01,
        horizontalOffset: 0.02,
        tolerance: 0.05,
        status: "acceptable",
        measurementDate: "2024-11-20"
      },
      thermography: {
        maxTemperature: 45.2,
        avgTemperature: 38.5,
        hotSpots: [],
        baseline: 35.0,
        deltaT: 3.5,
        measurementDate: "2024-12-01"
      },
      oilAnalysis: {
        viscosity: 32.5,
        acidity: 0.8,
        moisture: 0.02,
        metalContent: {
          iron: 15,
          copper: 8,
          aluminum: 5,
          chromium: 2,
          lead: 1,
          tin: 0
        },
        particleCount: 18,
        condition: "good",
        analysisDate: "2024-11-25",
        measurementDate: "2024-11-20"
      },
      lastUpdated: "2024-12-01",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2023-06-15",
    updatedAt: "2024-12-01"
  },
  {
    id: "EQ-002",
    name: "Emergency Generator G-001",
    type: "electrical",
    category: "motor",
    manufacturer: "Caterpillar",
    model: "C15",
    serialNumber: "CAT2023045",
    assetTag: "AST-002",
    location: {
      building: "Power House",
      floor: "Ground Floor",
      room: "Generator Room",
      coordinates: {
        latitude: 40.7130,
        longitude: -74.0065
      }
    },
    specifications: {
      ratedPower: 500,
      ratedVoltage: 480,
      ratedCurrent: 600,
      frequency: 60,
      efficiency: 92
    },
    status: "operational",
    condition: "excellent",
    installationDate: "2023-01-10",
    warrantyExpiry: "2026-01-10",
    lastMaintenanceDate: "2024-10-05",
    nextMaintenanceDate: "2025-01-05",
    operatingHours: 120,
    tags: ["emergency", "critical", "backup"],
    notes: "Backup power generator for critical systems",
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 1.2,
        peakVelocity: 4.5,
        displacement: 0.02,
        frequency: [1800, 3600],
        spectrum: [1.2, 0.8],
        iso10816Zone: "A",
        measurementDate: "2024-11-05",
        measuredBy: "Mike Johnson"
      },
      thermography: {
        maxTemperature: 65.5,
        avgTemperature: 55.2,
        hotSpots: [],
        baseline: 50.0,
        deltaT: 5.2,
        measurementDate: "2024-11-05"
      },
      lastUpdated: "2024-11-05",
      overallCondition: "excellent",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2023-01-10",
    updatedAt: "2024-11-05"
  },
  {
    id: "EQ-003",
    name: "Butterfly Valve BV-101",
    type: "mechanical",
    category: "butterfly_valve",
    manufacturer: "Keystone",
    model: "AR2",
    serialNumber: "KS2023789",
    assetTag: "AST-003",
    location: {
      pumpStation: "Station A",
      building: "Main Building",
      floor: "Ground Floor",
      room: "Pump Room 1"
    },
    specifications: {
      diameter: 12,
      pressure: 150
    },
    status: "operational",
    condition: "good",
    installationDate: "2023-06-15",
    warrantyExpiry: "2025-06-15",
    lastMaintenanceDate: "2024-09-20",
    nextMaintenanceDate: "2025-03-20",
    operatingHours: 8760,
    tags: ["isolation", "flow-control"],
    notes: "Main isolation valve for pump P-001",
    conditionMonitoring: {
      lastUpdated: "2024-09-20",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2023-06-15",
    updatedAt: "2024-09-20"
  },
  {
    id: "EQ-004",
    name: "HVAC Unit 12",
    type: "mechanical",
    category: "pump",
    manufacturer: "Carrier",
    model: "50TC",
    serialNumber: "CR2022456",
    assetTag: "AST-004",
    location: {
      building: "Office Building",
      floor: "Roof",
      coordinates: {
        latitude: 40.7135,
        longitude: -74.0070
      }
    },
    specifications: {
      ratedPower: 25,
      flowRate: 2000,
      temperature: 22,
      efficiency: 80
    },
    status: "maintenance",
    condition: "fair",
    installationDate: "2022-03-15",
    warrantyExpiry: "2025-03-15",
    lastMaintenanceDate: "2024-11-10",
    nextMaintenanceDate: "2025-02-10",
    operatingHours: 12500,
    tags: ["hvac", "comfort"],
    notes: "Main HVAC unit for east wing offices",
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 3.5,
        peakVelocity: 12.2,
        displacement: 0.08,
        frequency: [1200, 2400, 3600],
        spectrum: [3.5, 2.1, 1.2],
        iso10816Zone: "B",
        measurementDate: "2024-11-10",
        measuredBy: "Sarah Wilson"
      },
      thermography: {
        maxTemperature: 52.8,
        avgTemperature: 45.6,
        hotSpots: [
          {
            location: "Compressor",
            temperature: 52.8
          }
        ],
        baseline: 42.0,
        deltaT: 3.6,
        measurementDate: "2024-11-10"
      },
      lastUpdated: "2024-11-10",
      overallCondition: "fair",
      alerts: [
        {
          id: "ALT-001",
          type: "vibration",
          severity: "warning",
          message: "Elevated vibration levels in fan bearing",
          threshold: 3.0,
          actualValue: 3.5,
          timestamp: "2024-11-10T14:35:00Z",
          acknowledged: false
        }
      ]
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2022-03-15",
    updatedAt: "2024-11-10"
  },
  {
    id: "EQ-005",
    name: "Distribution Panel DP-101",
    type: "electrical",
    category: "panel",
    manufacturer: "Schneider Electric",
    model: "PowerPact",
    serialNumber: "SE2023123",
    assetTag: "AST-005",
    location: {
      building: "Main Building",
      floor: "Basement",
      room: "Electrical Room 1"
    },
    specifications: {
      ratedVoltage: 480,
      ratedCurrent: 800
    },
    status: "operational",
    condition: "good",
    installationDate: "2023-02-20",
    warrantyExpiry: "2028-02-20",
    lastMaintenanceDate: "2024-08-15",
    nextMaintenanceDate: "2025-02-15",
    tags: ["electrical", "distribution", "critical"],
    notes: "Main distribution panel for production area",
    conditionMonitoring: {
      thermography: {
        maxTemperature: 42.5,
        avgTemperature: 35.8,
        hotSpots: [],
        baseline: 35.0,
        deltaT: 0.8,
        measurementDate: "2024-08-15"
      },
      lastUpdated: "2024-08-15",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2023-02-20",
    updatedAt: "2024-08-15"
  },
  {
    id: "EQ-006",
    name: "Transformer T-001",
    type: "electrical",
    category: "transformer",
    manufacturer: "ABB",
    model: "DryType",
    serialNumber: "ABB2022789",
    assetTag: "AST-006",
    location: {
      building: "Main Building",
      floor: "Basement",
      room: "Electrical Room 1"
    },
    specifications: {
      ratedPower: 1000,
      ratedVoltage: 13800,
      efficiency: 98
    },
    status: "operational",
    condition: "excellent",
    installationDate: "2022-05-10",
    warrantyExpiry: "2032-05-10",
    lastMaintenanceDate: "2024-05-15",
    nextMaintenanceDate: "2025-05-15",
    tags: ["electrical", "critical", "power"],
    notes: "Main step-down transformer",
    conditionMonitoring: {
      thermography: {
        maxTemperature: 65.2,
        avgTemperature: 58.5,
        hotSpots: [],
        baseline: 60.0,
        deltaT: -1.5,
        measurementDate: "2024-05-15"
      },
      oilAnalysis: {
        viscosity: 9.8,
        acidity: 0.05,
        moisture: 0.001,
        metalContent: {
          iron: 2,
          copper: 1,
          aluminum: 0,
          chromium: 0,
          lead: 0,
          tin: 0
        },
        particleCount: 5,
        condition: "excellent",
        analysisDate: "2024-05-10",
        measurementDate: "2024-05-10"
      },
      lastUpdated: "2024-05-15",
      overallCondition: "excellent",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2022-05-10",
    updatedAt: "2024-05-15"
  },
  {
    id: "EQ-PUMP-001",
    name: "Main Water Pump",
    type: "mechanical",
    category: "pump",
    manufacturer: "Grundfos",
    model: "CRN 15-4",
    serialNumber: "PUMP2023001",
    assetTag: "PUMP-001",
    location: {
      pumpStation: "Central Station",
      building: "Pump House A",
      floor: "Ground",
      room: "Main Hall"
    },
    specifications: {
      ratedPower: 7.5,
      flowRate: 15.0,
      pressure: 16.0
    },
    status: "operational",
    condition: "fair",
    installationDate: "2022-05-15",
    operatingHours: 12000,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 4.2,
        peakVelocity: 6.8,
        displacement: 0.09,
        frequency: [30, 60, 90, 120],
        spectrum: [4.2, 3.5, 2.1, 1.3],
        iso10816Zone: "B",
        measurementDate: "2025-06-24",
        measuredBy: "Technician John"
      },
      alignment: {
        angularMisalignment: 0.02,
        parallelMisalignment: 0.03,
        verticalOffset: 0.015,
        horizontalOffset: 0.02,
        tolerance: 0.05,
        status: "acceptable",
        measurementDate: "2025-05-01"
      },
      thermography: {
        maxTemperature: 72,
        avgTemperature: 65,
        hotSpots: ["Bearing Housing"],
        baseline: 60,
        deltaT: 12,
        measurementDate: "2025-06-24"
      },
      oilAnalysis: {
        viscosity: 42.5,
        moisture: 0.02,
        acidity: 0.09,
        metalContent: {
          iron: 18,
          copper: 5,
          aluminum: 3,
          chromium: 2,
          lead: 1,
          tin: 0
        },
        particleCount: 22,
        condition: "warning",
        analysisDate: "2025-05-15",
        measurementDate: "2025-05-15"
      },
      lastUpdated: "2025-06-24",
      overallCondition: "fair",
      alerts: [
        {
          id: "ALERT-PUMP-001",
          type: "vibration",
          message: "Elevated vibration levels detected on Main Water Pump",
          severity: "warning",
          timestamp: "2025-06-24T08:30:00",
          threshold: 4.5,
          actualValue: 4.2,
          acknowledged: false
        }
      ]
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2022-05-15",
    updatedAt: "2025-06-24"
  },
  {
    id: "EQ-MOTOR-002",
    name: "Drive Motor Unit",
    type: "electrical",
    category: "motor",
    manufacturer: "Siemens",
    model: "1LA7 160-4",
    serialNumber: "MOTOR2023002",
    assetTag: "MOTOR-002",
    location: {
      pumpStation: "Central Station",
      building: "Pump House A",
      floor: "Ground",
      room: "Main Hall"
    },
    specifications: {
      ratedPower: 11.0,
      flowRate: 0.0,
      pressure: 0.0
    },
    status: "operational",
    condition: "good",
    installationDate: "2022-05-15",
    operatingHours: 11500,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 1.6,
        peakVelocity: 2.9,
        displacement: 0.03,
        frequency: [30, 60, 90, 120],
        spectrum: [1.6, 1.2, 0.8, 0.5],
        iso10816Zone: "A",
        measurementDate: "2025-06-24",
        measuredBy: "Technician John"
      },
      alignment: {
        angularMisalignment: 0.01,
        parallelMisalignment: 0.015,
        verticalOffset: 0.01,
        horizontalOffset: 0.01,
        tolerance: 0.05,
        status: "acceptable",
        measurementDate: "2025-05-01"
      },
      thermography: {
        maxTemperature: 58,
        avgTemperature: 52,
        hotSpots: [],
        baseline: 50,
        deltaT: 8,
        measurementDate: "2025-06-24"
      },
      oilAnalysis: {
        viscosity: 40.0,
        moisture: 0.01,
        acidity: 0.05,
        metalContent: {
          iron: 12,
          copper: 3,
          aluminum: 2,
          chromium: 1,
          lead: 0,
          tin: 0
        },
        particleCount: 18,
        condition: "normal",
        analysisDate: "2025-05-15",
        measurementDate: "2025-05-15"
      },
      lastUpdated: "2025-06-24",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2022-05-15",
    updatedAt: "2025-06-24"
  },
  {
    id: "EQ-PUMP-003",
    name: "Secondary Water Pump",
    type: "mechanical",
    category: "pump",
    manufacturer: "Grundfos",
    model: "CRN 10-3",
    serialNumber: "PUMP2023003",
    assetTag: "PUMP-003",
    location: {
      pumpStation: "Station B",
      building: "Pump House B",
      floor: "Ground",
      room: "Secondary Hall"
    },
    specifications: {
      ratedPower: 5.5,
      flowRate: 10.0,
      pressure: 12.0
    },
    status: "maintenance",
    condition: "poor",
    installationDate: "2021-08-10",
    operatingHours: 15000,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 6.5,
        peakVelocity: 9.2,
        displacement: 0.15,
        frequency: [30, 60, 90, 120],
        spectrum: [6.5, 5.0, 3.2, 2.0],
        iso10816Zone: "C",
        measurementDate: "2025-06-23",
        measuredBy: "Technician Sarah"
      },
      alignment: {
        angularMisalignment: 0.04,
        parallelMisalignment: 0.05,
        verticalOffset: 0.03,
        horizontalOffset: 0.04,
        tolerance: 0.05,
        status: "unacceptable",
        measurementDate: "2025-04-15"
      },
      thermography: {
        maxTemperature: 85,
        avgTemperature: 78,
        hotSpots: ["Motor Connection", "Bearing"],
        baseline: 65,
        deltaT: 20,
        measurementDate: "2025-06-23"
      },
      oilAnalysis: {
        viscosity: 48.0,
        moisture: 0.05,
        acidity: 0.12,
        metalContent: {
          iron: 25,
          copper: 10,
          aluminum: 8,
          chromium: 5,
          lead: 3,
          tin: 1
        },
        particleCount: 30,
        condition: "critical",
        analysisDate: "2025-05-10",
        measurementDate: "2025-05-10"
      },
      lastUpdated: "2025-06-23",
      overallCondition: "poor",
      alerts: [
        {
          id: "ALERT-PUMP-003",
          type: "vibration",
          message: "High vibration levels detected on Secondary Water Pump",
          severity: "critical",
          timestamp: "2025-06-23T10:15:00",
          threshold: 5.0,
          actualValue: 6.5,
          acknowledged: false
        },
        {
          id: "ALERT-PUMP-003-TEMP",
          type: "temperature",
          message: "Overheating detected on Secondary Water Pump",
          severity: "critical",
          timestamp: "2025-06-23T10:20:00",
          threshold: 80,
          actualValue: 85,
          acknowledged: false
        }
      ]
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2021-08-10",
    updatedAt: "2025-06-23"
  },
  {
    id: "EQ-MOTOR-004",
    name: "Auxiliary Motor Unit",
    type: "electrical",
    category: "motor",
    manufacturer: "ABB",
    model: "M2BAX 132",
    serialNumber: "MOTOR2023004",
    assetTag: "MOTOR-004",
    location: {
      pumpStation: "Station B",
      building: "Pump House B",
      floor: "Ground",
      room: "Secondary Hall"
    },
    specifications: {
      ratedPower: 7.5,
      flowRate: 0.0,
      pressure: 0.0
    },
    status: "operational",
    condition: "excellent",
    installationDate: "2023-01-20",
    operatingHours: 5000,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 0.8,
        peakVelocity: 1.5,
        displacement: 0.01,
        frequency: [30, 60, 90, 120],
        spectrum: [0.8, 0.6, 0.4, 0.2],
        iso10816Zone: "A",
        measurementDate: "2025-06-22",
        measuredBy: "Technician Mike"
      },
      alignment: {
        angularMisalignment: 0.005,
        parallelMisalignment: 0.01,
        verticalOffset: 0.005,
        horizontalOffset: 0.005,
        tolerance: 0.05,
        status: "acceptable",
        measurementDate: "2025-04-10"
      },
      thermography: {
        maxTemperature: 45,
        avgTemperature: 40,
        hotSpots: [],
        baseline: 40,
        deltaT: 5,
        measurementDate: "2025-06-22"
      },
      oilAnalysis: {
        viscosity: 38.0,
        moisture: 0.01,
        acidity: 0.03,
        metalContent: {
          iron: 5,
          copper: 2,
          aluminum: 1,
          chromium: 0,
          lead: 0,
          tin: 0
        },
        particleCount: 10,
        condition: "normal",
        analysisDate: "2025-05-20",
        measurementDate: "2025-05-20"
      },
      lastUpdated: "2025-06-22",
      overallCondition: "excellent",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2023-01-20",
    updatedAt: "2025-06-22"
  },
  {
    id: "EQ-PUMP-005",
    name: "Backup Water Pump",
    type: "mechanical",
    category: "pump",
    manufacturer: "Caterpillar",
    model: "CAT-P 200",
    serialNumber: "PUMP2023005",
    assetTag: "PUMP-005",
    location: {
      pumpStation: "Station C",
      building: "Pump House C",
      floor: "Ground",
      room: "Backup Area"
    },
    specifications: {
      ratedPower: 10.0,
      flowRate: 20.0,
      pressure: 18.0
    },
    status: "operational",
    condition: "good",
    installationDate: "2022-11-05",
    operatingHours: 8000,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 2.3,
        peakVelocity: 4.1,
        displacement: 0.05,
        frequency: [30, 60, 90, 120],
        spectrum: [2.3, 1.8, 1.0, 0.7],
        iso10816Zone: "A",
        measurementDate: "2025-06-20",
        measuredBy: "Technician Anna"
      },
      alignment: {
        angularMisalignment: 0.015,
        parallelMisalignment: 0.02,
        verticalOffset: 0.01,
        horizontalOffset: 0.015,
        tolerance: 0.05,
        status: "acceptable",
        measurementDate: "2025-03-25"
      },
      thermography: {
        maxTemperature: 60,
        avgTemperature: 55,
        hotSpots: [],
        baseline: 50,
        deltaT: 10,
        measurementDate: "2025-06-20"
      },
      oilAnalysis: {
        viscosity: 41.0,
        moisture: 0.015,
        acidity: 0.07,
        metalContent: {
          iron: 10,
          copper: 4,
          aluminum: 2,
          chromium: 1,
          lead: 0,
          tin: 0
        },
        particleCount: 15,
        condition: "normal",
        analysisDate: "2025-05-05",
        measurementDate: "2025-05-05"
      },
      lastUpdated: "2025-06-20",
      overallCondition: "good",
      alerts: [
        {
          id: "ALERT-PUMP-005",
          type: "temperature",
          message: "Slightly elevated temperature on Backup Water Pump",
          severity: "info",
          timestamp: "2025-06-20T09:45:00",
          threshold: 55,
          actualValue: 60,
          acknowledged: false
        }
      ]
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2022-11-05",
    updatedAt: "2025-06-20"
  },
  {
    id: "EQ-MOTOR-006",
    name: "Reserve Motor Unit",
    type: "electrical",
    category: "motor",
    manufacturer: "GE",
    model: "GE-X 250",
    serialNumber: "MOTOR2023006",
    assetTag: "MOTOR-006",
    location: {
      pumpStation: "Station C",
      building: "Pump House C",
      floor: "Ground",
      room: "Backup Area"
    },
    specifications: {
      ratedPower: 15.0,
      flowRate: 0.0,
      pressure: 0.0
    },
    status: "offline",
    condition: "critical",
    installationDate: "2020-03-15",
    operatingHours: 20000,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 8.0,
        peakVelocity: 12.0,
        displacement: 0.2,
        frequency: [30, 60, 90, 120],
        spectrum: [8.0, 6.5, 4.5, 3.0],
        iso10816Zone: "D",
        measurementDate: "2025-06-18",
        measuredBy: "Technician Mark"
      },
      alignment: {
        angularMisalignment: 0.06,
        parallelMisalignment: 0.08,
        verticalOffset: 0.05,
        horizontalOffset: 0.06,
        tolerance: 0.05,
        status: "unacceptable",
        measurementDate: "2025-02-20"
      },
      thermography: {
        maxTemperature: 95,
        avgTemperature: 85,
        hotSpots: ["Stator", "Bearing"],
        baseline: 70,
        deltaT: 25,
        measurementDate: "2025-06-18"
      },
      oilAnalysis: {
        viscosity: 50.0,
        moisture: 0.08,
        acidity: 0.15,
        metalContent: {
          iron: 30,
          copper: 15,
          aluminum: 10,
          chromium: 8,
          lead: 5,
          tin: 2
        },
        particleCount: 35,
        condition: "critical",
        analysisDate: "2025-04-30",
        measurementDate: "2025-04-30"
      },
      lastUpdated: "2025-06-18",
      overallCondition: "critical",
      alerts: [
        {
          id: "ALERT-MOTOR-006",
          type: "vibration",
          message: "Severe vibration levels detected on Reserve Motor Unit",
          severity: "critical",
          timestamp: "2025-06-18T14:20:00",
          threshold: 6.0,
          actualValue: 8.0,
          acknowledged: false
        },
        {
          id: "ALERT-MOTOR-006-TEMP",
          type: "temperature",
          message: "Critical overheating on Reserve Motor Unit",
          severity: "critical",
          timestamp: "2025-06-18T14:25:00",
          threshold: 85,
          actualValue: 95,
          acknowledged: false
        }
      ]
    },
    failureHistory: [],
    maintenanceHistory: [],
    history: [],
    createdAt: "2020-03-15",
    updatedAt: "2025-06-18"
  }
];

// Alias for backward compatibility
export const industrialAssets = enhancedAssetData;
