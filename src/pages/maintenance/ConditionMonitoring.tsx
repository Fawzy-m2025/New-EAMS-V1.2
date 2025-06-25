import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Activity, Thermometer, Gauge, AlertTriangle, TrendingUp,
  Calendar, Settings, Eye, Download, RefreshCw
} from "lucide-react";
import type { Equipment, ConditionAlert } from "@/types/eams";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import VibrationDataEntryForm from './VibrationDataEntryForm';
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { ChevronDown } from 'lucide-react';

// Interfaces for new features
interface WeibullAnalysis {
  shapeParameter: number;      // β (beta)
  scaleParameter: number;      // η (eta) 
  reliabilityFunction: (t: number) => number;
  meanTimeToFailure: number;
}

interface RCFAFramework {
  failureEvent: { description: string; timestamp: Date; severity: string; };
  causalFactors: { immediate: string[]; contributing: string[]; root: string[]; };
  fishboneAnalysis: { people: string[]; process: string[]; equipment: string[]; };
  recommendedActions: { description: string; priority: string; status: string; }[];
}

interface VibrationMeasurement {
  pump: {
    nde: { bv: number; bg: number; accV: number; accH: number; accAxl: number; velV: number; velH: number; velAxl: number; temp: number; };
    de: { bv: number; bg: number; accV: number; accH: number; accAxl: number; velV: number; velH: number; velAxl: number; temp: number; };
  };
  motor: {
    nde: { bv: number; bg: number; accV: number; accH: number; accAxl: number; velV: number; velH: number; velAxl: number; temp: number; };
    de: { bv: number; bg: number; accV: number; accH: number; accAxl: number; velV: number; velH: number; velAxl: number; temp: number; };
  };
  positions: {
    pLeg1: boolean; pLeg2: boolean; pLeg3: boolean; pLeg4: boolean;
    mLeg1: boolean; mLeg2: boolean; mLeg3: boolean; mLeg4: boolean;
  };
}

const ConditionMonitoring = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [vibrationData, setVibrationData] = useState<VibrationMeasurement>({
    pump: {
      nde: { bv: 0, bg: 0, accV: 0, accH: 0, accAxl: 0, velV: 0, velH: 0, velAxl: 0, temp: 0 },
      de: { bv: 0, bg: 0, accV: 0, accH: 0, accAxl: 0, velV: 0, velH: 0, velAxl: 0, temp: 0 },
    },
    motor: {
      nde: { bv: 0, bg: 0, accV: 0, accH: 0, accAxl: 0, velV: 0, velH: 0, velAxl: 0, temp: 0 },
      de: { bv: 0, bg: 0, accV: 0, accH: 0, accAxl: 0, velV: 0, velH: 0, velAxl: 0, temp: 0 },
    },
    positions: {
      pLeg1: false, pLeg2: false, pLeg3: false, pLeg4: false,
      mLeg1: false, mLeg2: false, mLeg3: false, mLeg4: false,
    }
  });
  const [vibrationDropdown, setVibrationDropdown] = useState<string>('statistic');
  const [showVibrationForm, setShowVibrationForm] = useState(false);

  // Dynamic condition monitoring data to be fetched from asset management and work orders
  // TODO: Replace with actual API calls or state management to fetch real data
  const monitoredEquipment: Equipment[] = [
    // Example data for testing frontend features, aligned with asset registry for pump and motor
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
  // Note: Integration with work orders (e.g., from src/data/testWorkOrders.ts) will update alerts, maintenanceHistory, and failureHistory
  // This can be achieved through API calls or state management to sync with work order data

  // Calculate KPIs (same as original)
  const totalMonitored = monitoredEquipment.length;
  const activeAlerts = monitoredEquipment.reduce((sum, eq) =>
    sum + eq.conditionMonitoring.alerts.filter(alert => !alert.acknowledged).length, 0
  );
  const criticalAlerts = monitoredEquipment.reduce((sum, eq) =>
    sum + eq.conditionMonitoring.alerts.filter(alert => alert.severity === 'critical').length, 0
  );
  const healthScore = monitoredEquipment.reduce((sum, eq) => {
    const scores = { excellent: 100, good: 80, fair: 60, poor: 40, critical: 20 };
    return sum + scores[eq.condition];
  }, 0) / monitoredEquipment.length;

  // Dynamic Weibull Analysis based on asset and work order data
  // TODO: Calculate parameters dynamically using historical failure data from work orders
  const weibullAnalysis: WeibullAnalysis = {
    shapeParameter: 2.5, // To be calculated based on failure distribution
    scaleParameter: 10000, // To be derived from asset operating hours and failure history
    reliabilityFunction: (t: number) => Math.exp(-Math.pow(t / 10000, 2.5)), // Dynamic calculation
    meanTimeToFailure: 8862 // To be updated based on real data analysis
  };

  // Dynamic RCFA Framework linked to work order failure events
  // TODO: Populate from actual work order data with failure analysis
  const rcfaData: RCFAFramework = {
    failureEvent: { description: "Bearing failure on Dynamic Pump Asset", timestamp: new Date(), severity: "High" }, // From work order
    causalFactors: { immediate: ["High vibration"], contributing: ["Poor lubrication"], root: ["Inadequate maintenance schedule"] }, // From analysis in work orders
    fishboneAnalysis: { people: ["Training gaps"], process: ["Missed inspections"], equipment: ["Bearing wear"] }, // Detailed in work order reports
    recommendedActions: [{ description: "Revise maintenance schedule", priority: "High", status: "Open" }] // Actions tied to work order tasks
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-orange-100 text-orange-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVibrationInputChange = (section: string, subsection: string, field: string, value: number) => {
    setVibrationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handlePositionToggle = (position: string) => {
    setVibrationData(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [position]: !prev.positions[position]
      }
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Condition Monitoring</h1>
            <p className="text-muted-foreground">ISO 10816 compliant equipment health monitoring</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2 hover-scale">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monitored Equipment"
            value={totalMonitored.toString()}
            icon={<Activity className="text-primary h-4 w-4" />}
            trend={{ value: 5, isPositive: true }}
            description="Real-time monitoring"
          />
          <StatCard
            title="Active Alerts"
            value={activeAlerts.toString()}
            icon={<AlertTriangle className="text-orange-600 h-4 w-4" />}
            description="Require attention"
          />
          <StatCard
            title="Critical Alerts"
            value={criticalAlerts.toString()}
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Immediate action needed"
          />
          <StatCard
            title="Health Score"
            value={`${Math.round(healthScore)}%`}
            icon={<TrendingUp className="text-green-600 h-4 w-4" />}
            trend={{ value: 3, isPositive: true }}
            description="Overall fleet health"
          />
        </div>

          {/* Main Content Tabs with SmartNavigation Style and Behavior */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex items-center justify-between bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-2 w-full relative" onClick={() => setOpenDropdown(null)}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'vibration', label: 'Vibration', children: [
                  { id: 'statistic', label: 'Statistic Analysis' },
                  { id: 'form', label: 'Vibration Reading Form' }
                ]},
                { id: 'thermal', label: 'Thermal' },
                { id: 'oil', label: 'Oil Analysis' },
                { id: 'alerts', label: 'Alerts' },
                { id: 'predictive', label: 'Predictive' }
              ].map((item) => {
                const isActive = activeTab === item.id || (item.children && item.children.some(child => child.id === vibrationDropdown && activeTab === item.id));
                if (item.children) {
                  return (
                    <DropdownMenu
                      key={item.id}
                      open={openDropdown === item.id}
                      onOpenChange={(open) => setOpenDropdown(open ? item.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <TabsTrigger
                          value={item.id}
                          className={`
                            relative gap-2 transition-all duration-300 hover-scale
                            ${isActive
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'hover:bg-primary/10 hover:text-primary'
                            }
                          `}
                        >
                          <span className="font-medium">{item.label}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${openDropdown === item.id || activeTab === item.id ? 'rotate-180' : ''}`} />
                        </TabsTrigger>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-56 bg-background/95 backdrop-blur-md border border-border/50 shadow-xl"
                        align="start"
                      >
                        {item.children.map((child) => (
                          <DropdownMenuItem
                            key={child.id}
                            onClick={() => {
                              if (item.id === 'vibration') {
                                setVibrationDropdown(child.id);
                                setShowVibrationForm(child.id === 'form');
                              }
                              setActiveTab(item.id);
                              setOpenDropdown(null);
                            }}
                            className={`
                              flex items-center gap-3 cursor-pointer transition-all duration-200
                              ${vibrationDropdown === child.id && activeTab === item.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-primary/10 hover:text-primary'
                              }
                            `}
                          >
                            <span>{child.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className={`
                      relative gap-2 transition-all duration-300 hover-scale
                      ${isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'hover:bg-primary/10 hover:text-primary'
                      }
                    `}
                  >
                    <span className="font-medium">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

          {/* Overview Tab (same as original) */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {monitoredEquipment.map((equipment) => (
                <Card key={equipment.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{equipment.name}</CardTitle>
                        <CardDescription>{equipment.manufacturer} {equipment.model}</CardDescription>
                      </div>
                      <Badge className={`${getConditionColor(equipment.condition)} bg-transparent border-current`}>
                        {equipment.condition}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vibration Monitoring */}
                    {equipment.conditionMonitoring.vibration && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Vibration (ISO 10816)</span>
                          </div>
                          <Badge className={getZoneColor(equipment.conditionMonitoring.vibration.iso10816Zone)}>
                            Zone {equipment.conditionMonitoring.vibration.iso10816Zone}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">RMS Velocity</div>
                            <div className="font-medium">{equipment.conditionMonitoring.vibration.rmsVelocity} mm/s</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Peak Velocity</div>
                            <div className="font-medium">{equipment.conditionMonitoring.vibration.peakVelocity} mm/s</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Thermal Monitoring */}
                    {equipment.conditionMonitoring.thermography && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">Thermal Analysis</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Max Temperature</div>
                            <div className="font-medium">{equipment.conditionMonitoring.thermography.maxTemperature}°C</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Delta T</div>
                            <div className="font-medium">{equipment.conditionMonitoring.thermography.deltaT}°C</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Oil Analysis */}
                    {equipment.conditionMonitoring.oilAnalysis && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Oil Analysis</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Condition</div>
                            <div className="font-medium capitalize">{equipment.conditionMonitoring.oilAnalysis.condition}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Viscosity</div>
                            <div className="font-medium">{equipment.conditionMonitoring.oilAnalysis.viscosity} cSt</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Alerts */}
                    {equipment.conditionMonitoring.alerts.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Active Alerts</span>
                        </div>
                        <div className="space-y-1">
                          {equipment.conditionMonitoring.alerts.slice(0, 2).map((alert) => (
                            <div key={alert.id} className="p-2 border rounded text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{alert.message}</span>
                                <Badge className={getAlertColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vibration Monitoring Tab - Enhanced with Data Entry */}
          <TabsContent value="vibration" className="space-y-4">
            {vibrationDropdown === 'statistic' && (
              <div className="space-y-4">
                {/* RMS Velocity Trend Chart with Example Data */}
                <EnhancedChart
                  title="RMS Velocity Trend - Pump & Motor"
                  type="line"
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'Main Water Pump (mm/s)',
                        data: [3.8, 4.0, 3.9, 4.1, 4.3, 4.2],
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        fill: true,
                      },
                      {
                        label: 'Drive Motor Unit (mm/s)',
                        data: [1.5, 1.7, 1.4, 1.6, 1.8, 1.6],
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        fill: true,
                      },
                    ],
                  }}
                />
                {/* Vibration Analysis (ISO 10816) with Additional Standards */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Advanced Vibration Analysis (ISO 10816 & More)
                    </CardTitle>
                    <CardDescription>Enhanced analysis with multiple standards</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Standards Compliance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">ISO 10816 Zone</div>
                            <div className="text-lg font-bold">B</div>
                            <div className="text-xs text-yellow-600">Satisfactory</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">ISO 20816 Compliance</div>
                            <div className="text-lg font-bold">Compliant</div>
                            <div className="text-xs text-green-600">Within Limits</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">API 610 Status</div>
                            <div className="text-lg font-bold">Normal</div>
                            <div className="text-xs text-green-600">Acceptable</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Note: Additional standards (ISO 13373, NEMA MG-1, IEC 60034) analysis available via API integration.
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Advanced Algorithms</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">FFT Analysis</div>
                            <div className="text-lg font-bold">Normal</div>
                            <div className="text-xs text-green-600">No Critical Peaks</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Envelope Analysis</div>
                            <div className="text-lg font-bold">Stable</div>
                            <div className="text-xs text-green-600">Bearing OK</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Phase Analysis</div>
                            <div className="text-lg font-bold">Aligned</div>
                            <div className="text-xs text-green-600">No Misalignment</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Note: Order tracking and harmonic analysis to be integrated with backend services.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Weibull Analysis and Statistical Metrics */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Statistical Analysis & Reliability
                    </CardTitle>
                    <CardDescription>Weibull analysis and performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Weibull Reliability Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Shape Parameter (β)</div>
                            <div className="text-lg font-bold">2.5</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Scale Parameter (η)</div>
                            <div className="text-lg font-bold">10000</div>
                            <div className="text-xs text-muted-foreground">hours</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Mean Time to Failure</div>
                            <div className="text-lg font-bold">8862</div>
                            <div className="text-xs text-muted-foreground">hours</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Reliability at 5000h</div>
                            <div className="text-lg font-bold">83.65%</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Note: Weibull analysis for failure prediction to be dynamically calculated via backend API.
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">MTBF</div>
                            <div className="text-lg font-bold">9000h</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">MTTR</div>
                            <div className="text-lg font-bold">24h</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">OEE</div>
                            <div className="text-lg font-bold">85%</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Availability</div>
                            <div className="text-lg font-bold">98%</div>
                          </div>
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          Note: Metrics like Reliability and Maintainability to be integrated from statistical backend.
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-3">Trend Analysis</h3>
                        <div className="text-sm text-muted-foreground">
                          Placeholder for SPC charts, moving averages, exponential smoothing, seasonal decomposition, and anomaly detection to be implemented with backend Python services.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Custom Alert Rules Placeholder */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Custom Alert Rules
                    </CardTitle>
                    <CardDescription>User-defined alert configurations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-3">Alert Configuration</h3>
                      <div className="text-sm text-muted-foreground">
                        Placeholder for API-driven custom alert rules based on vibration, temperature, RUL, and statistical deviations. Real-time rule engine to be implemented in backend.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {vibrationDropdown === 'form' && showVibrationForm && (
              <VibrationDataEntryForm open={showVibrationForm} onClose={() => setShowVibrationForm(false)} />
            )}
            {vibrationDropdown !== 'form' && (
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Vibration Analysis (ISO 10816)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Existing Vibration Data Display */}
                    {monitoredEquipment
                      .filter(eq => eq.conditionMonitoring.vibration)
                      .map(equipment => (
                        <div key={equipment.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold">{equipment.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {equipment.location.pumpStation} • {equipment.assetTag}
                              </p>
                            </div>
                            <Badge className={getZoneColor(equipment.conditionMonitoring.vibration!.iso10816Zone)}>
                              ISO Zone {equipment.conditionMonitoring.vibration!.iso10816Zone}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="text-sm text-muted-foreground">RMS Velocity</div>
                              <div className="text-lg font-bold">{equipment.conditionMonitoring.vibration!.rmsVelocity}</div>
                              <div className="text-xs text-muted-foreground">mm/s</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="text-sm text-muted-foreground">Peak Velocity</div>
                              <div className="text-lg font-bold">{equipment.conditionMonitoring.vibration!.peakVelocity}</div>
                              <div className="text-xs text-muted-foreground">mm/s</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="text-sm text-muted-foreground">Displacement</div>
                              <div className="text-lg font-bold">{equipment.conditionMonitoring.vibration!.displacement}</div>
                              <div className="text-xs text-muted-foreground">mm</div>
                            </div>
                            <div className="p-3 bg-muted/50 rounded">
                              <div className="text-sm text-muted-foreground">Last Measured</div>
                              <div className="text-sm font-medium">
                                {new Date(equipment.conditionMonitoring.vibration!.measurementDate).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                by {equipment.conditionMonitoring.vibration!.measuredBy}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Frequency Spectrum</h4>
                            <div className="grid grid-cols-4 gap-2">
                              {equipment.conditionMonitoring.vibration!.frequency.map((freq, index) => (
                                <div key={index} className="text-center">
                                  <div className="h-16 bg-blue-200 rounded-t relative">
                                    <div
                                      className="absolute bottom-0 w-full bg-blue-600 rounded-t"
                                      style={{
                                        height: `${(equipment.conditionMonitoring.vibration!.spectrum[index] / Math.max(...equipment.conditionMonitoring.vibration!.spectrum)) * 100}%`
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">{freq} Hz</div>
                                  <div className="text-xs font-medium">{equipment.conditionMonitoring.vibration!.spectrum[index]}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Thermal Monitoring Tab (same as original) */}
          <TabsContent value="thermal" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Thermal Analysis
                </CardTitle>
                <CardDescription>Infrared thermography monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monitoredEquipment
                    .filter(eq => eq.conditionMonitoring.thermography)
                    .map(equipment => (
                      <div key={equipment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{equipment.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {equipment.location.pumpStation} • {equipment.assetTag}
                            </p>
                          </div>
                          <Badge variant={equipment.conditionMonitoring.thermography!.deltaT > 10 ? 'destructive' : 'default'}>
                            ΔT: {equipment.conditionMonitoring.thermography!.deltaT}°C
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Max Temperature</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.thermography!.maxTemperature}</div>
                            <div className="text-xs text-muted-foreground">°C</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Avg Temperature</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.thermography!.avgTemperature}</div>
                            <div className="text-xs text-muted-foreground">°C</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Baseline</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.thermography!.baseline}</div>
                            <div className="text-xs text-muted-foreground">°C</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Hot Spots</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.thermography!.hotSpots.length}</div>
                            <div className="text-xs text-muted-foreground">detected</div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-sm text-muted-foreground">
                            Last measurement: {new Date(equipment.conditionMonitoring.thermography!.measurementDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Oil Analysis Tab (same as original) */}
          <TabsContent value="oil" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Oil Analysis
                </CardTitle>
                <CardDescription>Lubricant condition monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monitoredEquipment
                    .filter(eq => eq.conditionMonitoring.oilAnalysis)
                    .map(equipment => (
                      <div key={equipment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{equipment.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {equipment.location.pumpStation} • {equipment.assetTag}
                            </p>
                          </div>
                          <Badge variant={equipment.conditionMonitoring.oilAnalysis!.condition === 'normal' ? 'default' : 'destructive'}>
                            {equipment.conditionMonitoring.oilAnalysis!.condition}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Viscosity</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.oilAnalysis!.viscosity}</div>
                            <div className="text-xs text-muted-foreground">cSt @ 40°C</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Moisture</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.oilAnalysis!.moisture}</div>
                            <div className="text-xs text-muted-foreground">%</div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded">
                            <div className="text-sm text-muted-foreground">Acidity (TAN)</div>
                            <div className="text-lg font-bold">{equipment.conditionMonitoring.oilAnalysis!.acidity}</div>
                            <div className="text-xs text-muted-foreground">mg KOH/g</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-3">Metal Content (ppm)</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {Object.entries(equipment.conditionMonitoring.oilAnalysis!.metalContent).map(([metal, value]) => (
                              <div key={metal} className="p-2 bg-muted/30 rounded text-center">
                                <div className="text-xs text-muted-foreground capitalize">{metal}</div>
                                <div className="text-sm font-bold">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-muted-foreground">
                          Analysis date: {new Date(equipment.conditionMonitoring.oilAnalysis!.analysisDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab (same as original) */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Condition Monitoring Alerts
                </CardTitle>
                <CardDescription>Active alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monitoredEquipment
                    .flatMap(eq => eq.conditionMonitoring.alerts.map(alert => ({ ...alert, equipmentName: eq.name, equipmentId: eq.id })))
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map(alert => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                              }`} />
                            <div>
                              <h3 className="font-semibold">{alert.equipmentName}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Type: </span>
                                  <span className="font-medium capitalize">{alert.type}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Threshold: </span>
                                  <span className="font-medium">{alert.threshold}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Actual: </span>
                                  <span className="font-medium">{alert.actualValue}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time: </span>
                                  <span className="font-medium">
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getAlertColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            {!alert.acknowledged && (
                              <Button variant="outline" size="sm">
                                Acknowledge
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {monitoredEquipment.every(eq => eq.conditionMonitoring.alerts.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-sm">All equipment is operating within normal parameters</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Predictive Analytics Tab */}
          <TabsContent value="predictive" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Predictive Analytics & Failure Analysis
                </CardTitle>
                <CardDescription>Advanced predictive maintenance and big data integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Weibull Analysis */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Weibull Reliability Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-sm text-muted-foreground">Shape Parameter (β)</div>
                        <div className="text-lg font-bold">3.0</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-sm text-muted-foreground">Scale Parameter (η)</div>
                        <div className="text-lg font-bold">8000</div>
                        <div className="text-xs text-muted-foreground">hours</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-sm text-muted-foreground">Mean Time to Failure</div>
                        <div className="text-lg font-bold">7100</div>
                        <div className="text-xs text-muted-foreground">hours</div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="text-sm text-muted-foreground">Reliability at 5000h</div>
                        <div className="text-lg font-bold">60.00%</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Note: Adjusted for critical equipment (e.g., Reserve Motor Unit with RMS velocity 8.0 mm/s) to simulate wear-out failures. Weibull analysis for failure prediction and reliability modeling, including system reliability analysis for series/parallel configurations.</p>
                      <p className="text-sm text-muted-foreground">Tools for maintenance optimization and Life Cycle Cost (LCC) analysis are under development.</p>
                    </div>
                  </div>

                  {/* RCFA and PFMEA Integration */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Root Cause Failure Analysis (RCFA) & PFMEA</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-md font-medium">Failure Event</h4>
                        <p className="text-sm">Centrifugal Pump Bearing Replacement (Equipment P-201)</p>
                        <p className="text-xs text-muted-foreground">Severity: High | Date: 12/13/2024</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-md font-medium">Immediate Causes</h4>
                          <ul className="list-disc list-inside text-sm">
                            <li>Elevated vibration {'>'}7.1 mm/s</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-md font-medium">Contributing Factors</h4>
                          <ul className="list-disc list-inside text-sm">
                            <li>Bearing deterioration</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-md font-medium">Root Causes</h4>
                          <ul className="list-disc list-inside text-sm">
                            <li>Insufficient lubrication schedule</li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-md font-medium">Recommended Actions</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-sm">Implement revised lubrication schedule</p>
                            <p className="text-xs text-muted-foreground">Priority: High | Status: Open</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">PFMEA System (Simulated)</h4>
                        <p className="text-sm">Failure Mode for P-201: Bearing Failure</p>
                        <p className="text-sm">Risk Priority Number (RPN): 240 (Severity: 8, Occurrence: 5, Detection: 6)</p>
                        <p className="text-sm text-muted-foreground">Upcoming features include failure mode identification, Risk Priority Number (RPN) calculation, criticality analysis, and mitigation tracking.</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => {
                          // TODO: Link to work order creation for new failure analysis
                          alert('New RCFA creation will be linked to work order system.');
                        }}>Add New RCFA</Button>
                      </div>
                    </div>
                  </div>

                  {/* Machine Learning Pipeline */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Machine Learning Pipeline</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">ML Pipeline Status</h4>
                        <p className="text-sm text-muted-foreground">Pipeline for data ingestion, preprocessing, feature engineering, model training, deployment, and monitoring is under development.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Predictive Models</h4>
                        <p className="text-sm text-muted-foreground">Models for Remaining Useful Life (RUL) prediction, replacement scheduling, and condition-based maintenance triggers are being trained.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Real-Time Integration</h4>
                        <p className="text-sm text-muted-foreground">Integration with real-time data streams for continuous predictions is planned.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Simulated RUL Predictions</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left text-muted-foreground">
                            <thead className="text-xs uppercase bg-muted/30">
                              <tr>
                                <th className="p-2">Equipment</th>
                                <th className="p-2">Condition</th>
                                <th className="p-2">Vibration RMS (mm/s)</th>
                                <th className="p-2">Operating Hours</th>
                                <th className="p-2">Predicted RUL (hours)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b">
                                <td className="p-2">Reserve Motor Unit</td>
                                <td className="p-2">Critical</td>
                                <td className="p-2">8.0</td>
                                <td className="p-2">20000</td>
                                <td className="p-2 font-bold">500</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">Auxiliary Motor Unit</td>
                                <td className="p-2">Excellent</td>
                                <td className="p-2">0.8</td>
                                <td className="p-2">5000</td>
                                <td className="p-2 font-bold">5000</td>
                              </tr>
                              <tr className="border-b">
                                <td className="p-2">Secondary Water Pump</td>
                                <td className="p-2">Poor</td>
                                <td className="p-2">6.5</td>
                                <td className="p-2">15000</td>
                                <td className="p-2 font-bold">800</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Automated Work Orders */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Automated Work Orders</h3>
                    <div className="p-3 bg-muted/50 rounded">
                      <p className="text-sm text-muted-foreground">Backend logic to generate and pre-populate work orders from predictive alerts and RUL estimations is in progress. This will integrate with the existing work order system for seamless workflow automation.</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded mt-3">
                      <h4 className="text-md font-medium">Simulated Predicted Work Orders</h4>
                      <div className="space-y-2">
                        <div className="p-2 border rounded">
                          <p className="text-sm font-medium">Predictive Vibration Repair for Secondary Water Pump</p>
                          <p className="text-sm text-muted-foreground">Description: High vibration levels (6.5 mm/s) and overheating detected. Immediate action required.</p>
                          <p className="text-xs text-muted-foreground">Equipment ID: EQ-PUMP-003 | Priority: High | Status: Open</p>
                        </div>
                        <div className="p-2 border rounded">
                          <p className="text-sm font-medium">Predictive Maintenance for Reserve Motor Unit</p>
                          <p className="text-sm text-muted-foreground">Description: Severe vibration levels (8.0 mm/s) and critical overheating detected. Low RUL (500 hours).</p>
                          <p className="text-xs text-muted-foreground">Equipment ID: EQ-MOTOR-006 | Priority: Critical | Status: Open</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Big Data Techniques */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Big Data Analytics</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Clustering Analysis</h4>
                        <p className="text-sm text-muted-foreground">Implementation of clustering techniques for equipment grouping to identify similar operational patterns is underway.</p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Simulated Equipment Groups:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            <li>Group 1: Excellent/Good (RMS {'<'} 2.5 mm/s) - Auxiliary Motor Unit, Backup Water Pump</li>
                            <li>Group 2: Poor/Critical (RMS {'>'} 6.0 mm/s) - Reserve Motor Unit, Secondary Water Pump</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Association Rule Mining</h4>
                        <p className="text-sm text-muted-foreground">Development of association rule mining to uncover failure patterns and correlations between equipment issues is planned.</p>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Simulated Failure Correlations:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            <li>High Vibration + Overheating {'->'} Bearing Failure (Secondary Water Pump)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Neural Networks</h4>
                        <p className="text-sm text-muted-foreground">Neural network models for advanced pattern recognition in equipment data are being developed.</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Technical Charts */}
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-3">Advanced Statistical Charts</h3>
                    <div className="space-y-6">
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Reliability & Probability of Failure Chart</h4>
                        <EnhancedChart
                          title="Equipment Reliability and Probability of Failure Over Time"
                          type="line"
                          data={{
                            labels: ['0h', '2000h', '4000h', '6000h', '8000h', '10000h'],
                            datasets: [
                              {
                                label: 'Reserve Motor Unit Reliability (Critical)',
                                data: [100, 95, 85, 70, 55, 40],
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                fill: true,
                              },
                              {
                                label: 'Reserve Motor Unit Failure Probability',
                                data: [0, 5, 15, 30, 45, 60],
                                borderColor: 'rgba(255, 159, 64, 1)',
                                backgroundColor: 'rgba(255, 159, 64, 0.1)',
                                fill: true,
                              },
                              {
                                label: 'Auxiliary Motor Unit Reliability (Excellent)',
                                data: [100, 99, 97, 94, 90, 85],
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                fill: true,
                              },
                              {
                                label: 'Auxiliary Motor Unit Failure Probability',
                                data: [0, 1, 3, 6, 10, 15],
                                borderColor: 'rgba(54, 162, 235, 1)',
                                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                                fill: true,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated reliability and probability of failure curves based on Weibull analysis for different equipment conditions.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Failure Rate Chart</h4>
                        <EnhancedChart
                          title="Failure Rate Over Time (Bathtub Curve)"
                          type="line"
                          data={{
                            labels: ['0h', '2000h', '4000h', '6000h', '8000h', '10000h'],
                            datasets: [
                              {
                                label: 'Failure Rate (Typical Equipment)',
                                data: [0.05, 0.02, 0.01, 0.015, 0.03, 0.06],
                                borderColor: 'rgba(255, 159, 64, 1)',
                                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                fill: true,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated failure rate following the bathtub curve model, showing early failures, useful life, and wear-out phases.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Failure Pattern Chart</h4>
                        <EnhancedChart
                          title="Failure Patterns by Cause"
                          type="bar"
                          data={{
                            labels: ['Bearing Failure', 'Overheating', 'Misalignment', 'Lubrication Issues'],
                            datasets: [
                              {
                                label: 'Occurrences',
                                data: [5, 3, 2, 4],
                                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                                borderColor: 'rgba(153, 102, 255, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated distribution of failure causes based on historical work order data.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Property of Failure Chart (Pareto Analysis)</h4>
                        <EnhancedChart
                          title="Pareto Analysis of Failure Impact"
                          type="bar"
                          data={{
                            labels: ['Bearing Failure', 'Overheating', 'Misalignment', 'Lubrication Issues'],
                            datasets: [
                              {
                                label: 'Downtime Impact (Hours)',
                                data: [120, 80, 50, 30],
                                backgroundColor: 'rgba(255, 205, 86, 0.6)',
                                borderColor: 'rgba(255, 205, 86, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated Pareto chart showing the impact of failure causes on downtime, highlighting the most critical issues.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">International Statistical Chart (Control Chart)</h4>
                        <EnhancedChart
                          title="Control Chart for Vibration Levels (ISO 13373)"
                          type="line"
                          data={{
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            datasets: [
                              {
                                label: 'Vibration RMS (mm/s)',
                                data: [4.2, 4.0, 4.5, 4.1, 4.3, 4.2],
                                borderColor: 'rgba(54, 162, 235, 1)',
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                fill: true,
                              },
                              {
                                label: 'Upper Control Limit',
                                data: [4.8, 4.8, 4.8, 4.8, 4.8, 4.8],
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'transparent',
                                fill: false,
                                borderDash: [5, 5],
                              },
                              {
                                label: 'Lower Control Limit',
                                data: [3.6, 3.6, 3.6, 3.6, 3.6, 3.6],
                                borderColor: 'rgba(255, 99, 132, 1)',
                                backgroundColor: 'transparent',
                                fill: false,
                                borderDash: [5, 5],
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated control chart for monitoring vibration levels with statistical process control limits, aligned with ISO 13373 for condition monitoring and diagnostics.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">MTBF Trend Chart (ISO 14224)</h4>
                        <EnhancedChart
                          title="Mean Time Between Failures Trend"
                          type="line"
                          data={{
                            labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
                            datasets: [
                              {
                                label: 'MTBF (Hours)',
                                data: [8500, 8700, 8800, 8600, 8900, 9000],
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                fill: true,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated Mean Time Between Failures (MTBF) trend over time, following ISO 14224 guidelines for reliability data collection and analysis.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">Vibration Severity Chart (ISO 10816)</h4>
                        <EnhancedChart
                          title="Vibration Severity Across Equipment"
                          type="bar"
                          data={{
                            labels: ['Main Water Pump', 'Drive Motor', 'Secondary Pump', 'Auxiliary Motor', 'Backup Pump', 'Reserve Motor'],
                            datasets: [
                              {
                                label: 'RMS Velocity (mm/s)',
                                data: [4.2, 1.6, 6.5, 0.8, 2.3, 8.0],
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated vibration severity levels for monitored equipment, categorized per ISO 10816 standards for machinery vibration evaluation.</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <h4 className="text-md font-medium">FMEA Risk Priority Number (RPN) Distribution (IEC 60812)</h4>
                        <EnhancedChart
                          title="FMEA Risk Priority Numbers by Failure Mode"
                          type="bar"
                          data={{
                            labels: ['Bearing Failure', 'Seal Leakage', 'Motor Overload', 'Impeller Damage', 'Shaft Misalignment'],
                            datasets: [
                              {
                                label: 'RPN (Severity x Occurrence x Detection)',
                                data: [240, 180, 150, 120, 200],
                                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                        <p className="text-sm text-muted-foreground mt-2">Simulated Risk Priority Numbers (RPN) for various failure modes, calculated based on IEC 60812 for Failure Mode and Effects Analysis (FMEA).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ConditionMonitoring;
