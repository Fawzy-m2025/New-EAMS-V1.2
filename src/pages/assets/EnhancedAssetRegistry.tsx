import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import {
  Plus, Download, Upload, Eye, Edit, Trash2,
  Settings, Activity, AlertTriangle, TrendingUp, Gauge, Thermometer, Zap,
  Wrench, Calendar, BarChart3, Cog, Package,
  Table as TableIcon, LayoutGrid, Filter, RefreshCw, TreePine,
  Network, Building, Layers, ChevronRight, ChevronDown
} from "lucide-react";
import type { Equipment, EquipmentType, EquipmentCategory, EquipmentStatus, ConditionStatus, EAMSFilter } from "@/types/eams";
import { EnhancedAssetFormModal } from "@/components/assets/EnhancedAssetFormModal";
import { EnhancedAssetDetailsModal } from "@/components/assets/EnhancedAssetDetailsModal";
import { FloatingFilterPanel } from "@/components/assets/FloatingFilterPanel";
import { useAssetContext } from "@/contexts/AssetContext";
import { hierarchicalAssetStructure } from "@/data/hierarchicalAssetData";

const EnhancedAssetRegistry = () => {
  const { equipment, setEquipment, resetData, simulateRealTimeUpdate } = useAssetContext();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'tree'>('table');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<EAMSFilter>({
    search: '',
    equipmentTypes: [],
    categories: [],
    status: [],
    conditions: [],
    locations: [],
    manufacturers: []
  });

  // Enhanced fuzzy search function
  const fuzzySearch = (searchTerm: string, targetString: string): boolean => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const target = targetString.toLowerCase();

    // Direct substring match (highest priority)
    if (target.includes(search)) return true;

    // Fuzzy matching - allow for typos and partial matches
    let searchIndex = 0;
    for (let i = 0; i < target.length && searchIndex < search.length; i++) {
      if (target[i] === search[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === search.length;
  };

  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      // Enhanced search with fuzzy matching
      if (filters.search) {
        const searchableFields = [
          eq.name,
          eq.manufacturer,
          eq.model,
          eq.serialNumber,
          eq.assetTag,
          eq.location?.zone || '',
          eq.location?.station || '',
          eq.location?.line || '',
          eq.location?.system || '',
          eq.location?.building || '',
          eq.location?.room || '',
          eq.path || '',
          eq.category.replace('_', ' ')
        ];

        const hasMatch = searchableFields.some(field =>
          fuzzySearch(filters.search, field)
        );

        if (!hasMatch) return false;
      }

      if (filters.equipmentTypes?.length && !filters.equipmentTypes.includes(eq.type)) {
        return false;
      }

      if (filters.categories?.length && !filters.categories.includes(eq.category)) {
        return false;
      }

      if (filters.status?.length && !filters.status.includes(eq.status)) {
        return false;
      }

      if (filters.conditions?.length && !filters.conditions.includes(eq.condition)) {
        return false;
      }

      if (filters.locations?.length) {
        const locationMatches = filters.locations.some(location =>
          (eq.location?.zone || '').includes(location) ||
          (eq.location?.station || '').includes(location) ||
          (eq.location?.line || '').includes(location) ||
          (eq.location?.system || '').includes(location)
        );
        if (!locationMatches) return false;
      }

      if (filters.manufacturers?.length && !filters.manufacturers.includes(eq.manufacturer)) {
        return false;
      }

      return true;
    });
  }, [equipment, filters]);

  // Calculate enhanced KPIs
  const totalEquipment = filteredEquipment.length;
  const operationalEquipment = filteredEquipment.filter(eq => eq.status === 'operational').length;
  const criticalAlerts = filteredEquipment.reduce((sum, eq) =>
    sum + (eq.conditionMonitoring?.alerts?.filter(alert => alert.severity === 'critical').length || 0), 0
  );
  const avgConditionScore = filteredEquipment.reduce((sum, eq) => {
    const scores = { excellent: 5, good: 4, fair: 3, poor: 2, critical: 1 };
    return sum + scores[eq.condition];
  }, 0) / (filteredEquipment.length || 1);

  // Asset type distribution
  const assetTypeDistribution = useMemo(() => {
    const distribution = { mechanical: 0, electrical: 0, instrumentation: 0 };
    filteredEquipment.forEach(eq => {
      distribution[eq.type]++;
    });
    return distribution;
  }, [filteredEquipment]);

  // Tree structure for hierarchical view
  const treeStructure = useMemo(() => {
    const tree: any = {};

    filteredEquipment.forEach(equipment => {
      const zone = equipment.location?.zone || 'Unknown Zone';
      const station = equipment.location?.station || 'Unknown Station';
      const line = equipment.location?.line || equipment.location?.system || 'Station Equipment';

      if (!tree[zone]) {
        tree[zone] = {};
      }
      if (!tree[zone][station]) {
        tree[zone][station] = {};
      }
      if (!tree[zone][station][line]) {
        tree[zone][station][line] = [];
      }

      tree[zone][station][line].push(equipment);
    });

    return tree;
  }, [filteredEquipment]);

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'fault': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'decommissioned': return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: ConditionStatus) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'good': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'fair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'poor': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentIcon = (type: EquipmentType, category: EquipmentCategory) => {
    if (type === 'mechanical') {
      if (category.includes('pump')) return <Gauge className="h-5 w-5 text-blue-600" />;
      if (category.includes('valve')) return <Settings className="h-5 w-5 text-purple-600" />;
      return <Cog className="h-5 w-5 text-gray-600" />;
    }
    if (type === 'electrical') {
      return <Zap className="h-5 w-5 text-yellow-600" />;
    }
    return <Activity className="h-5 w-5 text-green-600" />;
  };

  const handleAddAsset = () => {
    setSelectedEquipment(null);
    setFormMode('create');
    setShowFormModal(true);
  };

  const handleEditAsset = (asset: Equipment) => {
    setSelectedEquipment(asset);
    setFormMode('edit');
    setShowFormModal(true);
  };

  const handleViewAsset = (asset: Equipment) => {
    setSelectedEquipment(asset);
    setShowDetailModal(true);
  };

  const handleSaveAsset = (asset: Equipment) => {
    if (formMode === 'create') {
      setEquipment(prev => [...prev, asset]);
    } else {
      setEquipment(prev => prev.map(eq => eq.id === asset.id ? asset : eq));
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    setEquipment(prev => prev.filter(eq => eq.id !== assetId));
  };

  // Clear search function
  const handleClearSearch = () => {
    setFilters(prev => ({ ...prev, search: '' }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Industrial Asset Registry</h1>
            <p className="text-muted-foreground">
              Comprehensive EAMS for {totalEquipment} industrial facility assets
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Assets
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button onClick={handleAddAsset} className="gap-2 hover-scale">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
            <Button variant="outline" onClick={resetData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Data
            </Button>
            <Button variant="outline" onClick={simulateRealTimeUpdate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Now
            </Button>
          </div>
        </div>

        {/* Enhanced KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Assets"
            value={totalEquipment.toString()}
            icon={<Package className="text-primary h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
            description={`${assetTypeDistribution.mechanical}M | ${assetTypeDistribution.electrical}E | ${assetTypeDistribution.instrumentation}I`}
          />
          <StatCard
            title="Operational Rate"
            value={`${Math.round((operationalEquipment / totalEquipment) * 100)}%`}
            icon={<Activity className="text-green-600 h-4 w-4" />}
            trend={{ value: 5, isPositive: true }}
            description={`${operationalEquipment}/${totalEquipment} assets active`}
          />
          <StatCard
            title="Critical Alerts"
            value={criticalAlerts.toString()}
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Immediate attention required"
          />
          <StatCard
            title="Health Score"
            value={avgConditionScore.toFixed(1)}
            icon={<TrendingUp className="text-blue-600 h-4 w-4" />}
            trend={{ value: 2, isPositive: true }}
            description="Average condition rating"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mechanical">Mechanical</TabsTrigger>
            <TabsTrigger value="electrical">Electrical</TabsTrigger>
            <TabsTrigger value="instrumentation">Instrumentation</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Equipment Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Asset Registry</CardTitle>
                    <CardDescription>Comprehensive industrial equipment management</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <FloatingFilterPanel
                      filters={filters}
                      onFiltersChange={setFilters}
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </Button>
                    </FloatingFilterPanel>
                    <div className="flex gap-1 border rounded-md p-1">
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                        className="gap-2"
                      >
                        <TableIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                        className="gap-2"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'tree' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('tree')}
                        className="gap-2"
                        title="Tree view"
                      >
                        <TreePine className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetData}
                      className="gap-2"
                      title="Reset to new hierarchical equipment data"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset Data
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedEquipment(null);
                        setFormMode('create');
                        setShowFormModal(true);
                      }}
                      className="gap-2"
                      title="Test hierarchical form"
                    >
                      <Plus className="h-4 w-4" />
                      Add Equipment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Results Summary */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredEquipment.length} of {equipment.length} assets
                    {filters.search && (
                      <span className="ml-2 font-medium">
                        for "{filters.search}"
                      </span>
                    )}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>

                {/* Enhanced Equipment Table */}
                {viewMode === 'table' && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Equipment</TableHead>
                          <TableHead>Type/Category</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Last Maintenance</TableHead>
                          <TableHead>Alerts</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEquipment.map((eq) => (
                          <TableRow key={eq.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {getEquipmentIcon(eq.type, eq.category)}
                                <div>
                                  <div className="font-medium">{eq.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {eq.manufacturer} {eq.model}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {eq.assetTag} • {eq.serialNumber}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="mb-1">
                                  {eq.type}
                                </Badge>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {eq.category.replace('_', ' ')}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div className="font-medium">
                                {eq.location?.station || 'N/A'}
                              </div>
                              <div className="text-muted-foreground">
                                {eq.location?.zone} • {eq.location?.line || eq.location?.system}
                              </div>
                              {eq.location?.building && (
                                <div className="text-xs text-muted-foreground">
                                  {eq.location.building} - {eq.location.room}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(eq.status)}>
                                {eq.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getConditionColor(eq.condition)}>
                                {eq.condition}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>{eq.lastMaintenanceDate || 'N/A'}</div>
                              <div className="text-muted-foreground">
                                Next: {eq.nextMaintenanceDate || 'TBD'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {eq.conditionMonitoring?.alerts?.length ? (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm">{eq.conditionMonitoring.alerts.length}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewAsset(eq)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAsset(eq)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAsset(eq.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Card View */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredEquipment.map((eq) => (
                      <Card key={eq.id} className="glass-card hover:shadow-lg transition-all duration-200 hover-scale">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getEquipmentIcon(eq.type, eq.category)}
                              <div className="font-medium text-sm">{eq.name}</div>
                            </div>
                            {eq.conditionMonitoring?.alerts?.length ? (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            ) : null}
                          </div>
                          <div className="flex gap-1">
                            <Badge className={getStatusColor(eq.status)} />
                            <Badge className={getConditionColor(eq.condition)} />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Location</span>
                            <span className="font-medium">{eq.location?.station}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Path</span>
                            <span className="text-muted-foreground">{eq.location?.zone} • {eq.location?.line || eq.location?.system}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Asset Tag</span>
                            <span className="font-medium">{eq.assetTag}</span>
                          </div>
                          {eq.specifications?.ratedPower && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Power</span>
                              <span className="text-sm font-medium">{eq.specifications.ratedPower} kW</span>
                            </div>
                          )}
                          <div className="flex gap-1 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewAsset(eq)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAsset(eq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Tree View */}
                {viewMode === 'tree' && (
                  <div className="space-y-3">
                    {Object.entries(treeStructure).map(([zoneName, stations]) => (
                      <Card key={zoneName} className="overflow-hidden">
                        <div
                          className="flex items-center gap-3 p-4 bg-card hover:bg-accent/50 cursor-pointer transition-colors border-b"
                          onClick={() => {
                            const nodeId = `zone-${zoneName}`;
                            const newExpanded = new Set(expandedNodes);
                            if (newExpanded.has(nodeId)) {
                              newExpanded.delete(nodeId);
                            } else {
                              newExpanded.add(nodeId);
                            }
                            setExpandedNodes(newExpanded);
                          }}
                        >
                          {expandedNodes.has(`zone-${zoneName}`) ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Network className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-lg text-foreground">{zoneName}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {Object.values(stations as any).reduce((sum: number, stationEquipment: any) =>
                              sum + Object.values(stationEquipment).reduce((stationSum: number, lineEquipment: any) =>
                                stationSum + (Array.isArray(lineEquipment) ? lineEquipment.length : 0), 0), 0
                            )} items
                          </Badge>
                        </div>

                        {expandedNodes.has(`zone-${zoneName}`) && (
                          <div className="p-4 space-y-3 bg-muted/20">
                            {Object.entries(stations as any).map(([stationName, lines]) => (
                              <div key={stationName} className="border-l-2 border-primary/30 pl-4">
                                <div
                                  className="flex items-center gap-3 p-3 bg-card rounded-lg cursor-pointer hover:bg-accent/50 transition-colors border"
                                  onClick={() => {
                                    const nodeId = `station-${zoneName}-${stationName}`;
                                    const newExpanded = new Set(expandedNodes);
                                    if (newExpanded.has(nodeId)) {
                                      newExpanded.delete(nodeId);
                                    } else {
                                      newExpanded.add(nodeId);
                                    }
                                    setExpandedNodes(newExpanded);
                                  }}
                                >
                                  {expandedNodes.has(`station-${zoneName}-${stationName}`) ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Building className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground">{stationName}</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {Object.values(lines as any).reduce((sum: number, lineEquipment: any) =>
                                      sum + (Array.isArray(lineEquipment) ? lineEquipment.length : 0), 0
                                    )} items
                                  </Badge>
                                </div>

                                {expandedNodes.has(`station-${zoneName}-${stationName}`) && (
                                  <div className="mt-3 space-y-2">
                                    {Object.entries(lines as any).map(([lineName, equipmentList]) => (
                                      <div key={lineName} className="border-l-2 border-primary/20 pl-4">
                                        <div
                                          className="flex items-center gap-3 p-2 bg-muted/30 rounded cursor-pointer hover:bg-accent/30 transition-colors"
                                          onClick={() => {
                                            const nodeId = `line-${zoneName}-${stationName}-${lineName}`;
                                            const newExpanded = new Set(expandedNodes);
                                            if (newExpanded.has(nodeId)) {
                                              newExpanded.delete(nodeId);
                                            } else {
                                              newExpanded.add(nodeId);
                                            }
                                            setExpandedNodes(newExpanded);
                                          }}
                                        >
                                          {expandedNodes.has(`line-${zoneName}-${stationName}-${lineName}`) ? (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                          ) : (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                          )}
                                          <Layers className="h-4 w-4 text-primary" />
                                          <span className="font-medium text-sm text-foreground">{lineName}</span>
                                          <Badge variant="outline" className="ml-auto text-xs">
                                            {Array.isArray(equipmentList) ? equipmentList.length : 0} items
                                          </Badge>
                                        </div>

                                        {expandedNodes.has(`line-${zoneName}-${stationName}-${lineName}`) && (
                                          <div className="mt-3 space-y-2">
                                            {Array.isArray(equipmentList) && equipmentList.map((equipment: Equipment) => (
                                              <div
                                                key={equipment.id}
                                                className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:bg-accent/30 transition-colors cursor-pointer"
                                                onClick={() => handleViewAsset(equipment)}
                                              >
                                                <div className="flex items-center gap-3 flex-1">
                                                  {equipment.category === 'pump' && <Activity className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'motor' && <Zap className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'valve' && <Settings className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'strainer' && <Filter className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'sensor' && <Gauge className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'actuator' && <Wrench className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'tank' && <Package className="h-4 w-4 text-primary" />}
                                                  {equipment.category === 'compressor' && <Activity className="h-4 w-4 text-primary" />}

                                                  <div className="flex-1">
                                                    <div className="font-medium text-sm text-foreground">{equipment.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                      {equipment.manufacturer} • {equipment.model} • {equipment.assetTag}
                                                    </div>
                                                  </div>

                                                  <div className="flex items-center gap-2">
                                                    <Badge className={getStatusColor(equipment.status)} variant="secondary">
                                                      {equipment.status}
                                                    </Badge>
                                                    <Badge className={getConditionColor(equipment.condition)} variant="secondary">
                                                      {equipment.condition}
                                                    </Badge>
                                                  </div>

                                                  <div className="flex gap-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewAsset(equipment);
                                                      }}
                                                    >
                                                      <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditAsset(equipment);
                                                      }}
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mechanical Equipment Tab */}
          <TabsContent value="mechanical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment
                .filter(eq => eq.type === 'mechanical')
                .map((eq) => (
                  <Card key={eq.id} className="glass-card hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{eq.name}</CardTitle>
                        {getEquipmentIcon(eq.type, eq.category)}
                      </div>
                      <CardDescription>{eq.manufacturer} {eq.model}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(eq.status)}>{eq.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Condition</span>
                        <Badge className={getConditionColor(eq.condition)}>{eq.condition}</Badge>
                      </div>
                      {eq.specifications.ratedPower && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Power</span>
                          <span className="text-sm font-medium">{eq.specifications.ratedPower} kW</span>
                        </div>
                      )}
                      {eq.conditionMonitoring.vibration && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Vibration</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{eq.conditionMonitoring.vibration.rmsVelocity} mm/s</span>
                            <Badge variant={eq.conditionMonitoring.vibration.iso10816Zone === 'A' ? 'default' : 'secondary'}>
                              Zone {eq.conditionMonitoring.vibration.iso10816Zone}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewAsset(eq)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(eq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Electrical Equipment Tab */}
          <TabsContent value="electrical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment
                .filter(eq => eq.type === 'electrical')
                .map((eq) => (
                  <Card key={eq.id} className="glass-card hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{eq.name}</CardTitle>
                        {getEquipmentIcon(eq.type, eq.category)}
                      </div>
                      <CardDescription>{eq.manufacturer} {eq.model}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(eq.status)}>{eq.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Condition</span>
                        <Badge className={getConditionColor(eq.condition)}>{eq.condition}</Badge>
                      </div>
                      {eq.specifications.ratedVoltage && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Voltage</span>
                          <span className="text-sm font-medium">{eq.specifications.ratedVoltage} V</span>
                        </div>
                      )}
                      {eq.specifications.ratedCurrent && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="text-sm font-medium">{eq.specifications.ratedCurrent} A</span>
                        </div>
                      )}
                      {eq.conditionMonitoring.thermography && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Temperature</span>
                          <div className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            <span className="text-sm font-medium">{eq.conditionMonitoring.thermography.maxTemperature}°C</span>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewAsset(eq)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAsset(eq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Condition Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Vibration Monitoring (ISO 10816)
                  </CardTitle>
                  <CardDescription>Real-time vibration analysis and trending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEquipment
                      .filter(eq => eq.conditionMonitoring.vibration)
                      .map(eq => (
                        <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{eq.name}</div>
                            <div className="text-sm text-muted-foreground">
                              RMS: {eq.conditionMonitoring.vibration?.rmsVelocity} mm/s
                            </div>
                          </div>
                          <Badge variant={eq.conditionMonitoring.vibration?.iso10816Zone === 'A' ? 'default' : 'secondary'}>
                            Zone {eq.conditionMonitoring.vibration?.iso10816Zone}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Thermal Monitoring
                  </CardTitle>
                  <CardDescription>Infrared thermography analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredEquipment
                      .filter(eq => eq.conditionMonitoring.thermography)
                      .map(eq => (
                        <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{eq.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Max: {eq.conditionMonitoring.thermography?.maxTemperature}°C
                            </div>
                          </div>
                          <Badge variant={eq.conditionMonitoring.thermography?.deltaT && eq.conditionMonitoring.thermography.deltaT > 10 ? 'destructive' : 'default'}>
                            ΔT: {eq.conditionMonitoring.thermography?.deltaT}°C
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Maintenance Schedule
                </CardTitle>
                <CardDescription>Preventive and corrective maintenance planning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipment
                    .filter(eq => eq.nextMaintenanceDate)
                    .sort((a, b) => new Date(a.nextMaintenanceDate!).getTime() - new Date(b.nextMaintenanceDate!).getTime())
                    .map(eq => {
                      const daysUntilMaintenance = Math.ceil(
                        (new Date(eq.nextMaintenanceDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      return (
                        <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getEquipmentIcon(eq.type, eq.category)}
                            <div>
                              <div className="font-medium">{eq.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {eq.location?.station} • {eq.assetTag}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{eq.nextMaintenanceDate}</div>
                            <Badge variant={daysUntilMaintenance <= 7 ? 'destructive' : daysUntilMaintenance <= 30 ? 'secondary' : 'default'}>
                              {daysUntilMaintenance > 0 ? `${daysUntilMaintenance} days` : `${Math.abs(daysUntilMaintenance)} days overdue`}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Equipment Performance
                  </CardTitle>
                  <CardDescription>Key performance indicators and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Overall Equipment Effectiveness (OEE)</span>
                      <span className="font-medium">87.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mean Time Between Failures (MTBF)</span>
                      <span className="font-medium">2,840 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Mean Time To Repair (MTTR)</span>
                      <span className="font-medium">4.2 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Availability</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                  </CardTitle>
                  <CardDescription>Current condition monitoring alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredEquipment
                      .flatMap(eq => eq.conditionMonitoring.alerts.map(alert => ({ ...alert, equipmentName: eq.name })))
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .slice(0, 5)
                      .map(alert => (
                        <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-500' :
                              alert.severity === 'warning' ? 'text-orange-500' : 'text-blue-500'
                              }`} />
                            <div>
                              <div className="text-sm font-medium">{alert.equipmentName}</div>
                              <div className="text-xs text-muted-foreground">{alert.message}</div>
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
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Modals */}
        <EnhancedAssetFormModal
          open={showFormModal}
          onOpenChange={setShowFormModal}
          equipment={selectedEquipment}
          onSave={handleSaveAsset}
          zones={hierarchicalAssetStructure.zones}
        />

        <EnhancedAssetDetailsModal
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
          equipment={selectedEquipment}
          zones={hierarchicalAssetStructure.zones}
          onEdit={() => {
            setShowDetailModal(false);
            handleEditAsset(selectedEquipment!);
          }}
        />
      </div>
    </AppLayout>
  );
};

export default EnhancedAssetRegistry;
