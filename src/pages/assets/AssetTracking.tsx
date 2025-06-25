
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
import { MapPin, Search, Filter, Download, Upload, Eye, Edit, AlertTriangle, Wifi, WifiOff, Battery, Thermometer, QrCode, Clock, Users, TrendingUp, Activity, Navigation } from "lucide-react";
import { Equipment, EquipmentStatus, ConditionStatus } from "@/types/eams";
import { FloatingFilterPanel } from "@/components/assets/FloatingFilterPanel";
import { InteractiveFacilityMap } from "@/components/assets/InteractiveFacilityMap";
import { AssetTimelineViewer } from "@/components/assets/AssetTimelineViewer";
import { CheckInOutSystem } from "@/components/assets/CheckInOutSystem";
import { QRCodeGenerator } from "@/components/assets/QRCodeGenerator";
import { RealTimeMonitoring } from "@/components/assets/RealTimeMonitoring";
import { AuditTrailViewer } from "@/components/assets/AuditTrailViewer";
import type { EAMSFilter } from "@/types/eams";

// Enhanced sample data with real-time tracking capabilities
const sampleEquipmentData: Equipment[] = [
  {
    id: "EQ-001",
    name: "Centrifugal Pump A1",
    type: "mechanical",
    category: "pump",
    manufacturer: "Grundfos",
    model: "CR 10-2",
    serialNumber: "GF2024001",
    assetTag: "PMP-001",
    location: {
      pumpStation: "Main Station",
      building: "Pump House A",
      floor: "Ground Floor",
      room: "Pump Room 1",
      coordinates: { latitude: 40.7128, longitude: -74.0060 }
    },
    specifications: {
      ratedPower: 5.5,
      ratedVoltage: 415,
      flowRate: 50,
      pressure: 8.5,
      speed: 2900
    },
    status: "operational",
    condition: "good",
    installationDate: "2023-01-15",
    lastMaintenanceDate: "2024-11-01",
    nextMaintenanceDate: "2025-02-01",
    operatingHours: 8760,
    conditionMonitoring: {
      vibration: {
        rmsVelocity: 2.1,
        peakVelocity: 8.4,
        displacement: 12,
        frequency: [50, 100, 150],
        spectrum: [2.1, 1.8, 1.2],
        iso10816Zone: "A",
        measurementDate: "2024-12-15",
        measuredBy: "John Smith"
      },
      thermography: {
        maxTemperature: 65,
        avgTemperature: 58,
        hotSpots: [],
        baseline: 55,
        deltaT: 3,
        measurementDate: "2024-12-15"
      },
      lastUpdated: "2024-12-15",
      overallCondition: "good",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    createdAt: "2023-01-15",
    updatedAt: "2024-12-15"
  },
  {
    id: "EQ-002",
    name: "Motor Control Panel B2",
    type: "electrical",
    category: "panel",
    manufacturer: "Schneider Electric",
    model: "PrismaSeT G",
    serialNumber: "SE2024002",
    assetTag: "MCP-002",
    location: {
      pumpStation: "Main Station",
      building: "Control Room",
      floor: "Ground Floor",
      room: "Electrical Room",
      coordinates: { latitude: 40.7129, longitude: -74.0061 }
    },
    specifications: {
      ratedVoltage: 415,
      ratedCurrent: 63
    },
    status: "operational",
    condition: "excellent",
    installationDate: "2023-03-20",
    operatingHours: 8760,
    conditionMonitoring: {
      thermography: {
        maxTemperature: 45,
        avgTemperature: 38,
        hotSpots: [],
        baseline: 35,
        deltaT: 3,
        measurementDate: "2024-12-15"
      },
      lastUpdated: "2024-12-15",
      overallCondition: "excellent",
      alerts: []
    },
    failureHistory: [],
    maintenanceHistory: [],
    createdAt: "2023-03-20",
    updatedAt: "2024-12-15"
  }
];

const AssetTrackingPage = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(sampleEquipmentData);
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
      e.conditionMonitoring.alerts.some(alert => alert.severity === "critical")
    ).length;
    const avgUtilization = equipment.reduce((sum, e) => sum + (e.operatingHours! / 8760), 0) / total * 100;

    return { total, operational, criticalAlerts, avgUtilization };
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
            description="Tracked equipment"
          />
          <StatCard 
            title="Operational"
            value={stats.operational.toString()}
            icon={<Wifi className="text-green-600 h-4 w-4" />}
            trend={{ value: 95, isPositive: true }}
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
                                <div>{item.location.building}</div>
                                <div className="text-muted-foreground">{item.location.room}</div>
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
