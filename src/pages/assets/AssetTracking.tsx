import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { MapPin, Search, Filter, Download, Upload, Eye, Edit, AlertTriangle, Wifi, WifiOff, Battery, Thermometer, QrCode, Clock, Users, TrendingUp, Activity, Navigation, Settings } from "lucide-react";
import { Equipment, EquipmentStatus, ConditionStatus } from "@/types/eams";
import { FloatingFilterPanel } from "@/components/assets/FloatingFilterPanel";
import { InteractiveFacilityMap } from "@/components/assets/InteractiveFacilityMap";
import { AssetTimelineViewer } from "@/components/assets/AssetTimelineViewer";
import { CheckInOutSystem } from "@/components/assets/CheckInOutSystem";
import { QRCodeGenerator } from "@/components/assets/QRCodeGenerator";
import { RealTimeMonitoring } from "@/components/assets/RealTimeMonitoring";
import { AuditTrailViewer } from "@/components/assets/AuditTrailViewer";
import type { EAMSFilter } from "@/types/eams";
import { allHierarchicalEquipment, equipmentSummary } from "@/data/hierarchicalAssetData";

// Real hierarchical equipment data with tracking capabilities
// Using the comprehensive equipment data from hierarchicalAssetData.ts

const AssetTrackingPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(allHierarchicalEquipment);
  const [filters, setFilters] = useState<EAMSFilter>({
    search: '',
    equipmentTypes: [],
    categories: [],
    status: [],
    conditions: [],
    locations: [],
    manufacturers: []
  });
  const [selectedAsset, setSelectedAsset] = useState<Equipment | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setEquipment(prev => prev.map(item => ({
        ...item,
        conditionMonitoring: {
          ...item.conditionMonitoring,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesSearch = filters.search === '' ||
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.model.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.assetTag?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesTypes = filters.equipmentTypes.length === 0 ||
        filters.equipmentTypes.includes(item.type);

      const matchesCategories = filters.categories.length === 0 ||
        filters.categories.includes(item.category);

      const matchesStatus = filters.status.length === 0 ||
        filters.status.includes(item.status);

      const matchesConditions = filters.conditions.length === 0 ||
        filters.conditions.includes(item.condition);

      const matchesLocations = filters.locations.length === 0 ||
        filters.locations.some(loc =>
          item.location.pumpStation?.includes(loc) ||
          item.location.building?.includes(loc)
        );

      const matchesManufacturers = filters.manufacturers.length === 0 ||
        filters.manufacturers.includes(item.manufacturer);

      return matchesSearch && matchesTypes && matchesCategories &&
        matchesStatus && matchesConditions && matchesLocations &&
        matchesManufacturers;
    });
  }, [equipment, filters]);

  const stats = useMemo(() => {
    const total = equipment.length;
    const operational = equipment.filter(e => e.status === "operational").length;
    const criticalAlerts = equipment.filter(e =>
      e.conditionMonitoring?.alerts?.some(alert => alert.severity === "critical")
    ).length;
    const avgUtilization = equipment.reduce((sum, e) => sum + (e.operatingHours || 0) / 8760, 0) / total * 100;

    // Enhanced stats with equipment category breakdown
    const categoryBreakdown = {
      pumps: equipment.filter(e => e.category === 'pump').length,
      motors: equipment.filter(e => e.category === 'motor').length,
      valves: equipment.filter(e => e.category === 'valve').length,
      strainers: equipment.filter(e => e.category === 'strainer').length,
      sensors: equipment.filter(e => e.category === 'sensor').length,
      actuators: equipment.filter(e => e.category === 'actuator').length,
      tanks: equipment.filter(e => e.category === 'tank').length,
      compressors: equipment.filter(e => e.category === 'compressor').length
    };

    return {
      total,
      operational,
      criticalAlerts,
      avgUtilization,
      categoryBreakdown,
      // Use equipment summary data for verification
      summaryData: equipmentSummary
    };
  }, [equipment]);

  const getStatusColor = (status: EquipmentStatus) => {
    const colors = {
      operational: "bg-green-100 text-green-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      fault: "bg-red-100 text-red-800",
      offline: "bg-gray-100 text-gray-800",
      decommissioned: "bg-red-100 text-red-800",
      testing: "bg-blue-100 text-blue-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getConditionColor = (condition: ConditionStatus) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Asset Tracking</h1>
            <p className="text-muted-foreground">Real-time equipment monitoring, location tracking, and workflow management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" />
              Generate QR
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={stats.total.toString()}
            icon={<MapPin className="text-primary h-4 w-4" />}
            description={`${stats.categoryBreakdown.pumps} pumps, ${stats.categoryBreakdown.motors} motors, ${stats.categoryBreakdown.valves} valves`}
          />
          <StatCard
            title="Operational"
            value={stats.operational.toString()}
            icon={<Wifi className="text-green-600 h-4 w-4" />}
            trend={{ value: Math.round((stats.operational / stats.total) * 100), isPositive: true }}
            description="Currently active"
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts.toString()}
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Require attention"
          />
          <StatCard
            title="Avg Utilization"
            value={`${Math.round(stats.avgUtilization)}%`}
            icon={<Battery className="text-blue-600 h-4 w-4" />}
            description="Equipment usage"
          />
        </div>

        {/* Equipment Category Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard
            title="Pumps"
            value={stats.categoryBreakdown.pumps.toString()}
            icon={<Activity className="text-blue-600 h-4 w-4" />}
            description="Main & Priming"
          />
          <StatCard
            title="Motors"
            value={stats.categoryBreakdown.motors.toString()}
            icon={<Thermometer className="text-yellow-600 h-4 w-4" />}
            description="Drive units"
          />
          <StatCard
            title="Valves"
            value={stats.categoryBreakdown.valves.toString()}
            icon={<Settings className="text-purple-600 h-4 w-4" />}
            description="Control valves"
          />
          <StatCard
            title="Strainers"
            value={stats.categoryBreakdown.strainers.toString()}
            icon={<Filter className="text-green-600 h-4 w-4" />}
            description="Filtration"
          />
          <StatCard
            title="Sensors"
            value={stats.categoryBreakdown.sensors.toString()}
            icon={<TrendingUp className="text-red-600 h-4 w-4" />}
            description="Monitoring"
          />
          <StatCard
            title="Actuators"
            value={stats.categoryBreakdown.actuators.toString()}
            icon={<Navigation className="text-indigo-600 h-4 w-4" />}
            description="Control units"
          />
          <StatCard
            title="Tanks"
            value={stats.categoryBreakdown.tanks.toString()}
            icon={<Users className="text-cyan-600 h-4 w-4" />}
            description="Water hammer"
          />
          <StatCard
            title="Compressors"
            value={stats.categoryBreakdown.compressors.toString()}
            icon={<Activity className="text-orange-600 h-4 w-4" />}
            description="Air systems"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="map">Facility Map</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="checkin">Check-In/Out</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Equipment Location & Status
                  <div className="flex gap-2">
                    <FloatingFilterPanel
                      filters={filters}
                      onFiltersChange={setFilters}
                    >
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </FloatingFilterPanel>
                  </div>
                </CardTitle>
                <CardDescription>Real-time monitoring of all tracked equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEquipment.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.manufacturer} {item.model}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ID: {item.id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {item.location?.zone || 'Zone A'} → {item.location?.station || 'Unknown Station'}
                                </div>
                                <div className="text-muted-foreground">
                                  {item.location?.line || item.location?.system || 'Station Equipment'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {item.location?.building || 'Equipment Building'} • {item.location?.room || 'Equipment Room'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getConditionColor(item.condition)}>
                              {item.condition}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <Progress
                                value={(item.operatingHours! / 8760) * 100}
                                className="h-2"
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {Math.round((item.operatingHours! / 8760) * 100)}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {item.conditionMonitoring.lastUpdated}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedAsset(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <InteractiveFacilityMap equipment={filteredEquipment} />
          </TabsContent>

          <TabsContent value="timeline">
            <AssetTimelineViewer equipment={filteredEquipment} />
          </TabsContent>

          <TabsContent value="checkin">
            <CheckInOutSystem equipment={filteredEquipment} />
          </TabsContent>

          <TabsContent value="monitoring">
            <RealTimeMonitoring equipment={filteredEquipment} />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrailViewer equipment={filteredEquipment} />
          </TabsContent>
        </Tabs>

        {/* QR Code Generator Modal */}
        {selectedAsset && (
          <QRCodeGenerator
            asset={selectedAsset}
            isOpen={!!selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default AssetTrackingPage;
