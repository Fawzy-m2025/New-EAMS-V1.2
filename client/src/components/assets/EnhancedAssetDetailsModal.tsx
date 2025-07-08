
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity, AlertTriangle, Calendar, Edit, FileText,
  Gauge, MapPin, Settings, Thermometer, TrendingUp,
  Wrench, Zap, Package, Clock, DollarSign, User,
  QrCode, Download, Share, Bell, Building, Layers,
  Factory, ChevronRight, Users, Link
} from "lucide-react";
import { Equipment, Zone } from "@/types/eams";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { HierarchyBreadcrumb } from "./HierarchyBreadcrumb";

interface EnhancedAssetDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onEdit?: () => void;
  zones?: Zone[]; // For finding related assets
  onNavigateToAsset?: (assetId: string) => void;
  onNavigateToHierarchy?: (nodeId: string, level: string) => void;
}

// Function to generate trend data from equipment if historical data is available
// For now, using sample data as placeholder since historical data isn't stored
const getVibrationTrendData = (equipment: Equipment) => {
  if (equipment.conditionMonitoring?.vibration) {
    return [
      { date: equipment.conditionMonitoring.vibration.measurementDate, rms: equipment.conditionMonitoring.vibration.rmsVelocity, peak: equipment.conditionMonitoring.vibration.peakVelocity, zone: equipment.conditionMonitoring.vibration.iso10816Zone },
      // Placeholder for additional historical data points
      { date: 'Previous', rms: equipment.conditionMonitoring.vibration.rmsVelocity * 0.9, peak: equipment.conditionMonitoring.vibration.peakVelocity * 0.9, zone: equipment.conditionMonitoring.vibration.iso10816Zone },
    ];
  }
  return [];
};

const getTemperatureTrendData = (equipment: Equipment) => {
  if (equipment.conditionMonitoring?.thermography) {
    return [
      { date: equipment.conditionMonitoring.thermography.measurementDate, temp: equipment.conditionMonitoring.thermography.maxTemperature, baseline: equipment.conditionMonitoring.thermography.baseline, delta: equipment.conditionMonitoring.thermography.deltaT },
      // Placeholder for additional historical data points
      { date: 'Previous', temp: equipment.conditionMonitoring.thermography.maxTemperature * 0.95, baseline: equipment.conditionMonitoring.thermography.baseline, delta: equipment.conditionMonitoring.thermography.deltaT * 0.9 },
    ];
  }
  return [];
};

const maintenanceHistory = [
  {
    id: 'MAINT-001',
    date: '2024-12-01',
    type: 'Preventive',
    description: 'Quarterly inspection and lubrication',
    technician: 'John Smith',
    duration: '4 hours',
    cost: 500,
    status: 'Completed'
  },
  {
    id: 'MAINT-002',
    date: '2024-09-01',
    type: 'Corrective',
    description: 'Bearing replacement',
    technician: 'Sarah Wilson',
    duration: '8 hours',
    cost: 1200,
    status: 'Completed'
  },
  {
    id: 'MAINT-003',
    date: '2024-06-01',
    type: 'Preventive',
    description: 'Oil change and filter replacement',
    technician: 'Mike Johnson',
    duration: '2 hours',
    cost: 300,
    status: 'Completed'
  }
];

export function EnhancedAssetDetailsModal({
  open,
  onOpenChange,
  equipment,
  onEdit,
  zones = [],
  onNavigateToAsset,
  onNavigateToHierarchy
}: EnhancedAssetDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!equipment) return null;

  // Helper function to find related assets in the same hierarchy
  const getRelatedAssets = () => {
    if (!zones.length) return [];

    const relatedAssets: Equipment[] = [];

    zones.forEach(zone => {
      zone.stations.forEach(station => {
        // Find assets in the same line or system
        if (equipment.lineId) {
          const line = station.lines.find(l => l.id === equipment.lineId);
          if (line) {
            relatedAssets.push(...line.equipment.filter(eq => eq.id !== equipment.id));
          }
        }

        if (equipment.systemId) {
          const system = station.systems.find(s => s.id === equipment.systemId);
          if (system) {
            relatedAssets.push(...system.equipment.filter(eq => eq.id !== equipment.id));
          }
        }
      });
    });

    return relatedAssets.slice(0, 5); // Limit to 5 related assets
  };

  // Helper function to get parent hierarchy info
  const getParentHierarchy = () => {
    if (!zones.length) return null;

    for (const zone of zones) {
      if (zone.id === equipment.zoneId) {
        const station = zone.stations.find(s => s.id === equipment.stationId);
        if (station) {
          const line = station.lines.find(l => l.id === equipment.lineId);
          const system = station.systems.find(s => s.id === equipment.systemId);

          return {
            zone,
            station,
            line,
            system
          };
        }
      }
    }

    return null;
  };

  const relatedAssets = getRelatedAssets();
  const parentHierarchy = getParentHierarchy();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fault': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentIcon = () => {
    if (equipment.type === 'mechanical') {
      if (equipment.category.includes('pump')) return <Gauge className="h-5 w-5 text-blue-600" />;
      if (equipment.category.includes('valve')) return <Settings className="h-5 w-5 text-purple-600" />;
      return <Settings className="h-5 w-5 text-gray-600" />;
    }
    if (equipment.type === 'electrical') {
      return <Zap className="h-5 w-5 text-yellow-600" />;
    }
    return <Activity className="h-5 w-5 text-green-600" />;
  };

  const healthScore = equipment.conditionMonitoring?.overallCondition ?
    ({ 'excellent': 95, 'good': 80, 'fair': 65, 'poor': 40, 'critical': 20 }[equipment.conditionMonitoring.overallCondition] || 50) : 50;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getEquipmentIcon()}
              <div>
                <DialogTitle className="text-xl">{equipment.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {equipment.manufacturer} {equipment.model} • {equipment.assetTag}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(equipment.status)}>
                {equipment.status}
              </Badge>
              <Badge className={getConditionColor(equipment.condition)}>
                {equipment.condition}
              </Badge>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          </div>

          {/* Hierarchy Breadcrumbs */}
          {equipment.breadcrumbs && equipment.breadcrumbs.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <HierarchyBreadcrumb
                breadcrumbs={equipment.breadcrumbs}
                onNavigate={(breadcrumb) => {
                  if (onNavigateToHierarchy) {
                    onNavigateToHierarchy(breadcrumb.id, breadcrumb.level);
                  }
                }}
              />
            </div>
          )}
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[calc(95vh-200px)]">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Asset Health Score */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Health Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthScore}%</div>
                    <Progress value={healthScore} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on condition monitoring
                    </p>
                  </CardContent>
                </Card>

                {/* Operating Hours */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{equipment.operatingHours?.toLocaleString() || 'N/A'}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total runtime
                    </p>
                  </CardContent>
                </Card>

                {/* Active Alerts */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {equipment.conditionMonitoring?.alerts?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Require attention
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Asset Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Asset Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Serial Number</span>
                      <span className="text-sm font-medium">{equipment.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="text-sm font-medium capitalize">{equipment.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm font-medium capitalize">{equipment.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Installation Date</span>
                      <span className="text-sm font-medium">{equipment.installationDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Warranty Expiry</span>
                      <span className="text-sm font-medium">{equipment.warrantyExpiry || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pump Station</span>
                      <span className="text-sm font-medium">{equipment.location?.pumpStation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Building</span>
                      <span className="text-sm font-medium">{equipment.location?.building}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Floor</span>
                      <span className="text-sm font-medium">{equipment.location?.floor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Room/Zone</span>
                      <span className="text-sm font-medium">{equipment.location?.room}</span>
                    </div>
                    {equipment.location?.coordinates && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coordinates</span>
                        <span className="text-sm font-medium">
                          {equipment.location.coordinates.latitude.toFixed(4)}, {equipment.location.coordinates.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Active Alerts */}
              {equipment.conditionMonitoring?.alerts && equipment.conditionMonitoring.alerts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {equipment.conditionMonitoring.alerts.map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                              }`} />
                            <div>
                              <div className="font-medium">{alert.message}</div>
                              <div className="text-sm text-muted-foreground">
                                Threshold: {alert.threshold} | Actual: {alert.actualValue}
                              </div>
                            </div>
                          </div>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Hierarchy Tab */}
            <TabsContent value="hierarchy" className="space-y-4">
              {/* Parent Hierarchy */}
              {parentHierarchy && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Parent Hierarchy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Zone */}
                      <div
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onNavigateToHierarchy?.(parentHierarchy.zone.id, 'zone')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Zone</span>
                        </div>
                        <p className="text-sm">{parentHierarchy.zone.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {parentHierarchy.zone.stations.length} stations
                        </p>
                      </div>

                      {/* Station */}
                      <div
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => onNavigateToHierarchy?.(parentHierarchy.station.id, 'station')}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Station</span>
                        </div>
                        <p className="text-sm">{parentHierarchy.station.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {parentHierarchy.station.lines.length + parentHierarchy.station.systems.length} items
                        </p>
                      </div>

                      {/* Line or System */}
                      {(parentHierarchy.line || parentHierarchy.system) && (
                        <div
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            const item = parentHierarchy.line || parentHierarchy.system;
                            const level = parentHierarchy.line ? 'line' : 'system';
                            onNavigateToHierarchy?.(item!.id, level);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {parentHierarchy.line ? (
                              <Layers className="h-4 w-4 text-purple-500" />
                            ) : (
                              <Factory className="h-4 w-4 text-orange-500" />
                            )}
                            <span className="font-medium">
                              {parentHierarchy.line ? 'Line' : 'System'}
                            </span>
                          </div>
                          <p className="text-sm">
                            {parentHierarchy.line?.name || parentHierarchy.system?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(parentHierarchy.line?.equipment.length || parentHierarchy.system?.equipment.length || 0)} equipment
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Assets */}
              {relatedAssets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Related Assets
                      <Badge variant="secondary">{relatedAssets.length}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Other equipment in the same {equipment.lineId ? 'line' : 'system'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {relatedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => onNavigateToAsset?.(asset.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                              {asset.type === 'mechanical' ? (
                                <Settings className="h-4 w-4" />
                              ) : asset.type === 'electrical' ? (
                                <Zap className="h-4 w-4" />
                              ) : (
                                <Activity className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{asset.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {asset.manufacturer} {asset.model}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(asset.status)}>
                              {asset.status}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Asset Path */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Asset Path
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-mono">{equipment.path}</p>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Asset ID:</span>
                      <span className="font-mono">{equipment.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Asset Tag:</span>
                      <span className="font-mono">{equipment.assetTag}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Serial Number:</span>
                      <span className="font-mono">{equipment.serialNumber}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Condition Monitoring Tab */}
            <TabsContent value="monitoring" className="space-y-4">
              {equipment.conditionMonitoring?.vibration && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Vibration Analysis (ISO 10816)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">RMS Velocity</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.vibration.rmsVelocity} mm/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Peak Velocity</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.vibration.peakVelocity} mm/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Displacement</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.vibration.displacement} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">ISO 10816 Zone</span>
                          <Badge variant={equipment.conditionMonitoring.vibration.iso10816Zone === 'A' ? 'default' : 'secondary'}>
                            Zone {equipment.conditionMonitoring.vibration.iso10816Zone}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <EnhancedChart
                          title="Vibration Trend"
                          type="line"
                          height={200}
                          data={{
                            labels: getVibrationTrendData(equipment).map(d => d.date),
                            datasets: [
                              {
                                label: 'RMS (mm/s)',
                                data: getVibrationTrendData(equipment).map(d => d.rms),
                                borderColor: '#8884d8',
                                backgroundColor: '#8884d8' + '20',
                                fill: true,
                                tension: 0.4,
                              },
                              {
                                label: 'Peak (mm/s)',
                                data: getVibrationTrendData(equipment).map(d => d.peak),
                                borderColor: '#82ca9d',
                                backgroundColor: '#82ca9d' + '20',
                                fill: true,
                                tension: 0.4,
                              }
                            ]
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {equipment.conditionMonitoring?.thermography && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Thermal Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Max Temperature</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.thermography.maxTemperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Temperature</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.thermography.avgTemperature}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Baseline</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.thermography.baseline}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Delta T</span>
                          <span className="text-sm font-medium">{equipment.conditionMonitoring.thermography.deltaT}°C</span>
                        </div>
                      </div>
                      <div>
                        <EnhancedChart
                          title="Temperature Trend"
                          type="line"
                          height={200}
                          data={{
                            labels: getTemperatureTrendData(equipment).map(d => d.date),
                            datasets: [
                              {
                                label: 'Baseline',
                                data: getTemperatureTrendData(equipment).map(d => d.baseline),
                                borderColor: '#82ca9d',
                                backgroundColor: '#82ca9d' + '20',
                                fill: true,
                                tension: 0.4,
                              },
                              {
                                label: 'Temperature',
                                data: getTemperatureTrendData(equipment).map(d => d.temp),
                                borderColor: '#8884d8',
                                backgroundColor: '#8884d8' + '20',
                                fill: true,
                                tension: 0.4,
                              }
                            ]
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Last Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{equipment.lastMaintenanceDate || 'N/A'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Next Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">{equipment.nextMaintenanceDate || 'TBD'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Maintenance Cost YTD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">$2,000</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {maintenanceHistory.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{record.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.date} • {record.technician} • {record.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={record.type === 'Preventive' ? 'default' : 'secondary'}>
                            {record.type}
                          </Badge>
                          <div className="text-sm font-medium mt-1">${record.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Technical Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(equipment.specifications || {}).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Asset History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Asset Created</div>
                        <div className="text-sm text-muted-foreground">{equipment.createdAt}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Last Updated</div>
                        <div className="text-sm text-muted-foreground">{equipment.updatedAt}</div>
                      </div>
                    </div>
                    {equipment.history && equipment.history.length > 0 ? (
                      equipment.history.map((event, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div>
                            <div className="font-medium capitalize">{event.eventType.replace('_', ' ')}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.timestamp} - {event.details}
                              {event.performedBy && ` by ${event.performedBy}`}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground p-3">
                        No additional history events recorded.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No documents uploaded yet</p>
                    <Button variant="outline" className="mt-4">
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
