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
import AdvancedPredictiveAnalytics from '@/components/maintenance/AdvancedPredictiveAnalytics';
import { monitoredEquipment, initialVibrationData } from '@/data/conditionMonitoringData';

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

  // Calculate KPIs (same as original)
  const totalMonitored = monitoredEquipment.length;
  const activeAlerts = monitoredEquipment.reduce((sum, eq) =>
    sum + (eq.conditionMonitoring?.alerts?.filter(alert => !alert.acknowledged).length || 0)
    , 0);
  const criticalAlerts = monitoredEquipment.reduce((sum, eq) =>
    sum + (eq.conditionMonitoring?.alerts?.filter(alert => alert.severity === 'critical').length || 0)
    , 0);
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
              {
                id: 'vibration', label: 'Vibration', children: [
                  { id: 'statistic', label: 'Statistic Analysis' },
                  { id: 'form', label: 'Vibration Reading Form' }
                ]
              },
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
                    .flatMap(eq => (eq.conditionMonitoring?.alerts ?? []).map(alert => ({ ...alert, equipmentName: eq.name, equipmentId: eq.id })))
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

                  {monitoredEquipment.every(eq => (eq.conditionMonitoring?.alerts ?? []).length === 0) && (
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
            <AdvancedPredictiveAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ConditionMonitoring;
