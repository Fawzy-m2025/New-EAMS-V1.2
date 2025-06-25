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
import { useState, useMemo } from "react";
import { TrendingUp, Search, Filter, Download, Activity, Zap, Clock, Target, BarChart3, Gauge, DollarSign, Brain } from "lucide-react";
import { Equipment, EquipmentStatus, ConditionStatus } from "@/types/eams";
import { KPIGaugeChart } from "@/components/assets/KPIGaugeChart";
import { InteractiveTimeSeriesChart } from "@/components/assets/InteractiveTimeSeriesChart";
import { ROIAnalysisChart } from "@/components/assets/ROIAnalysisChart";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { industrialAssets } from "@/data/enhancedAssetData";

interface PerformanceMetrics {
  equipmentId: string;
  equipment: Equipment;
  availability: number;
  reliability: number;
  efficiency: number;
  oee: number;
  mtbf: number;
  mttr: number;
  utilizationRate: number;
  energyEfficiency: number;
  maintenanceCost: number;
  downtimeHours: number;
  lastPerformanceUpdate: string;
  lifecycleStage: 'acquisition' | 'utilization' | 'maintenance' | 'disposal';
  healthScore: number;
}

// Generate realistic performance data
const generatePerformanceData = (equipment: Equipment[]): PerformanceMetrics[] => {
  return equipment.slice(0, 20).map((asset, index) => ({
    equipmentId: asset.id,
    equipment: asset,
    availability: 85 + Math.random() * 15,
    reliability: 80 + Math.random() * 20,
    efficiency: 75 + Math.random() * 20,
    oee: 60 + Math.random() * 30,
    mtbf: 1500 + Math.random() * 2000,
    mttr: 2 + Math.random() * 8,
    utilizationRate: 70 + Math.random() * 25,
    energyEfficiency: 80 + Math.random() * 15,
    maintenanceCost: 1000 + Math.random() * 5000,
    downtimeHours: Math.random() * 50,
    lastPerformanceUpdate: "2024-12-15",
    lifecycleStage: (['acquisition', 'utilization', 'maintenance', 'disposal'] as const)[index % 4],
    healthScore: 60 + Math.random() * 40
  }));
};

// Generate time series data
const generateTimeSeriesData = () => {
  const data = [];
  const startDate = new Date('2024-01-01');

  for (let i = 0; i < 12; i++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + i);

    data.push({
      date: date.toISOString().split('T')[0],
      utilization: 75 + Math.random() * 20 + Math.sin(i / 3) * 5,
      efficiency: 80 + Math.random() * 15 + Math.cos(i / 4) * 3,
      availability: 90 + Math.random() * 8 + Math.sin(i / 6) * 2,
      mtbf: 1800 + Math.random() * 400 + Math.cos(i / 5) * 100,
      mttr: 3 + Math.random() * 3 + Math.sin(i / 7) * 0.5,
      oee: 70 + Math.random() * 20 + Math.cos(i / 3) * 5
    });
  }

  return data;
};

// Generate ROI data
const generateROIData = () => {
  return [
    { year: 'Year 0', cumulativeInvestment: 500000, cumulativeSavings: 0, netCashFlow: -500000, roi: 0 },
    { year: 'Year 1', cumulativeInvestment: 520000, cumulativeSavings: 150000, netCashFlow: -370000, roi: -26 },
    { year: 'Year 2', cumulativeInvestment: 540000, cumulativeSavings: 350000, netCashFlow: -190000, roi: -35 },
    { year: 'Year 3', cumulativeInvestment: 560000, cumulativeSavings: 600000, netCashFlow: 40000, roi: 7.1 },
    { year: 'Year 4', cumulativeInvestment: 580000, cumulativeSavings: 900000, netCashFlow: 320000, roi: 55.2 },
    { year: 'Year 5', cumulativeInvestment: 600000, cumulativeSavings: 1250000, netCashFlow: 650000, roi: 108.3 }
  ];
};

const AssetPerformancePage = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>(
    generatePerformanceData(industrialAssets)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "all">("all");
  const [conditionFilter, setConditionFilter] = useState<ConditionStatus | "all">("all");

  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  const roiData = useMemo(() => generateROIData(), []);

  const filteredData = useMemo(() => {
    return performanceData.filter(item => {
      const matchesSearch = item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || item.equipment.status === statusFilter;
      const matchesCondition = conditionFilter === "all" || item.equipment.condition === conditionFilter;

      return matchesSearch && matchesStatus && matchesCondition;
    });
  }, [performanceData, searchTerm, statusFilter, conditionFilter]);

  const stats = useMemo(() => {
    const avgOEE = performanceData.reduce((sum, item) => sum + item.oee, 0) / performanceData.length;
    const avgAvailability = performanceData.reduce((sum, item) => sum + item.availability, 0) / performanceData.length;
    const avgMTBF = performanceData.reduce((sum, item) => sum + item.mtbf, 0) / performanceData.length;
    const totalMaintenanceCost = performanceData.reduce((sum, item) => sum + item.maintenanceCost, 0);
    const avgHealthScore = performanceData.reduce((sum, item) => sum + item.healthScore, 0) / performanceData.length;

    return { avgOEE, avgAvailability, avgMTBF, totalMaintenanceCost, avgHealthScore };
  }, [performanceData]);

  const kpiData = useMemo(() => {
    const utilizationByZone = [
      { name: 'Zone A', utilization: 85 },
      { name: 'Zone B', utilization: 78 },
      { name: 'Zone C', utilization: 92 },
      { name: 'Zone D', utilization: 76 }
    ];

    const maintenanceCostTrend = [
      { name: 'Q1', preventive: 45000, corrective: 32000, emergency: 18000 },
      { name: 'Q2', preventive: 48000, corrective: 28000, emergency: 15000 },
      { name: 'Q3', preventive: 52000, corrective: 25000, emergency: 12000 },
      { name: 'Q4', preventive: 55000, corrective: 22000, emergency: 10000 }
    ];

    return { utilizationByZone, maintenanceCostTrend };
  }, []);

  const getPerformanceColor = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.fair) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (value: number, thresholds: { good: number; fair: number }) => {
    if (value >= thresholds.good) return "bg-green-100 text-green-800";
    if (value >= thresholds.fair) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Asset Performance Analytics</h1>
            <p className="text-muted-foreground">Advanced analytics dashboard with AI-driven insights and ISO 55000 compliance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Average OEE"
            value={`${stats.avgOEE.toFixed(1)}%`}
            icon={<Target className="text-blue-600 h-4 w-4" />}
            trend={{ value: 5.2, isPositive: true }}
            description="Overall Equipment Effectiveness"
          />
          <StatCard
            title="Availability"
            value={`${stats.avgAvailability.toFixed(1)}%`}
            icon={<Clock className="text-green-600 h-4 w-4" />}
            trend={{ value: 2.1, isPositive: true }}
            description="Average uptime"
          />
          <StatCard
            title="Avg MTBF"
            value={`${Math.round(stats.avgMTBF)}h`}
            icon={<TrendingUp className="text-purple-600 h-4 w-4" />}
            description="Mean Time Between Failures"
          />
          <StatCard
            title="Maintenance Cost"
            value={`$${stats.totalMaintenanceCost.toLocaleString()}`}
            icon={<DollarSign className="text-orange-600 h-4 w-4" />}
            description="Total maintenance spend"
          />
          <StatCard
            title="Health Score"
            value={`${stats.avgHealthScore.toFixed(0)}/100`}
            icon={<Gauge className="text-red-600 h-4 w-4" />}
            trend={{ value: 3.8, isPositive: true }}
            description="AI-driven equipment health"
          />
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
            <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
            <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance Table</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InteractiveTimeSeriesChart
                data={timeSeriesData}
                title="Equipment Performance Trends"
                description="Interactive time-series analysis with zoom and pan capabilities"
              />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>Machine learning recommendations and anomaly detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-900">Optimization Opportunity</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      Replace 3 low-efficiency valves in Zone B. Estimated savings: $25,000/year
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-yellow-900">Predictive Alert</span>
                    </div>
                    <p className="text-sm text-yellow-800">
                      Pump P-042 showing early signs of bearing wear. Schedule maintenance in 2-3 weeks.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-900">ISO 55000 Compliance</span>
                    </div>
                    <p className="text-sm text-green-800">
                      Asset lifecycle management is 94% compliant with ISO 55000 standards.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-900">Benchmarking Result</span>
                    </div>
                    <p className="text-sm text-purple-800">
                      Your OEE performance is 12% above industry average for water treatment facilities.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedChart
                title="Utilization by Zone"
                description="Asset utilization rates across facility zones"
                type="bar"
                data={{
                  labels: kpiData.utilizationByZone.map(item => item.name),
                  datasets: [{
                    label: 'Utilization (%)',
                    data: kpiData.utilizationByZone.map(item => item.utilization),
                    backgroundColor: '#3b82f6',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 6,
                  }],
                }}
                height={300}
                preset="financial"
                colorScheme="financial"
                animation="slide"
                showControls={true}
                showLegend={true}
                interactive={true}
                exportable={true}
                refreshable={true}
              />

              <EnhancedChart
                title="Maintenance Cost Breakdown"
                description="Quarterly maintenance spend by type"
                type="bar"
                data={{
                  labels: kpiData.maintenanceCostTrend.map(item => item.name),
                  datasets: [
                    {
                      label: 'Preventive',
                      data: kpiData.maintenanceCostTrend.map(item => item.preventive),
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                      borderWidth: 2,
                      borderRadius: 6,
                    },
                    {
                      label: 'Corrective',
                      data: kpiData.maintenanceCostTrend.map(item => item.corrective),
                      backgroundColor: '#f59e0b',
                      borderColor: '#f59e0b',
                      borderWidth: 2,
                      borderRadius: 6,
                    },
                    {
                      label: 'Emergency',
                      data: kpiData.maintenanceCostTrend.map(item => item.emergency),
                      backgroundColor: '#ef4444',
                      borderColor: '#ef4444',
                      borderWidth: 2,
                      borderRadius: 6,
                    }
                  ],
                }}
                height={300}
                preset="financial"
                colorScheme="financial"
                animation="slide"
                showControls={true}
                showLegend={true}
                interactive={true}
                exportable={true}
                refreshable={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="kpi" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <KPIGaugeChart
                title="Overall Equipment Effectiveness"
                value={stats.avgOEE}
                maxValue={100}
                unit="%"
                target={85}
                color="#3b82f6"
              />

              <KPIGaugeChart
                title="Equipment Availability"
                value={stats.avgAvailability}
                maxValue={100}
                unit="%"
                target={95}
                color="#10b981"
              />

              <KPIGaugeChart
                title="Mean Time Between Failures"
                value={stats.avgMTBF}
                maxValue={3000}
                unit="h"
                target={2500}
                color="#8b5cf6"
              />

              <KPIGaugeChart
                title="Equipment Health Score"
                value={stats.avgHealthScore}
                maxValue={100}
                unit="/100"
                target={80}
                color="#f59e0b"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Stage Analysis</CardTitle>
                <CardDescription>Asset distribution across lifecycle stages per ISO 55000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {['acquisition', 'utilization', 'maintenance', 'disposal'].map((stage, index) => {
                    const count = performanceData.filter(item => item.lifecycleStage === stage).length;
                    const percentage = (count / performanceData.length) * 100;
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

                    return (
                      <div key={stage} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: colors[index] }}>
                          {count}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">{stage}</div>
                        <div className="text-xs mt-1">{percentage.toFixed(1)}%</div>
                        <Progress value={percentage} className="mt-2 h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <ROIAnalysisChart
              data={roiData}
              title="Asset Management ROI Analysis"
              initialInvestment={500000}
              breakEvenPoint="Year 3"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost-Benefit Analysis</CardTitle>
                  <CardDescription>Weibull analysis and maintenance optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-700">Annual Cost Savings</div>
                        <div className="text-xl font-bold text-green-800">$247,500</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-700">Efficiency Improvement</div>
                        <div className="text-xl font-bold text-blue-800">+12.3%</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Key Benefits:</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Reduced unplanned downtime by 35%
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Extended equipment life by 18 months
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Improved energy efficiency by 8%
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          Reduced spare parts inventory by 22%
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Predictive Maintenance ROI</CardTitle>
                  <CardDescription>Based on ISO 10816 vibration analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Traditional Maintenance</span>
                          <span className="font-medium">$180,000/year</span>
                        </div>
                      </div>
                      <div className="p-3 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Predictive Maintenance</span>
                          <span className="font-medium text-green-600">$127,500/year</span>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Annual Savings</span>
                          <span className="font-bold text-blue-600">$52,500</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">5-Year Net Present Value</div>
                      <div className="text-2xl font-bold text-green-600">$1,247,500</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Performance Analytics Table</CardTitle>
                <CardDescription>Detailed equipment performance metrics and KPIs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EquipmentStatus | "all")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="operational">Operational</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="fault">Fault</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={conditionFilter} onValueChange={(value) => setConditionFilter(value as ConditionStatus | "all")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Conditions</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Advanced
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>OEE</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Health Score</TableHead>
                        <TableHead>MTBF/MTTR</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>Maintenance Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.equipmentId} className="hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.equipment.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.equipment.manufacturer} {item.equipment.model}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {item.lifecycleStage}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${getPerformanceColor(item.oee, { good: 80, fair: 60 })}`}>
                                {item.oee.toFixed(1)}%
                              </span>
                              <Progress value={item.oee} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPerformanceBadge(item.availability, { good: 95, fair: 85 })}>
                              {item.availability.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: item.healthScore >= 80 ? '#22c55e' :
                                    item.healthScore >= 60 ? '#eab308' : '#ef4444'
                                }}
                              />
                              <span className="font-medium">{item.healthScore.toFixed(0)}/100</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>MTBF: {Math.round(item.mtbf)}h</div>
                            <div className="text-muted-foreground">MTTR: {item.mttr.toFixed(1)}h</div>
                          </TableCell>
                          <TableCell>
                            <div className="w-20">
                              <Progress value={item.utilizationRate} className="h-2" />
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.utilizationRate.toFixed(1)}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            ${item.maintenanceCost.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Activity className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <BarChart3 className="h-4 w-4" />
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
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AssetPerformancePage;

