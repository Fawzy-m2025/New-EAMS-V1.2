
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
import { TrendingDown, Search, Filter, Download, Upload, Calculator, DollarSign, Calendar, BarChart3, FileText, AlertTriangle, Settings } from "lucide-react";
import { Equipment, EquipmentType } from "@/types/eams";
import { DepreciationChart } from "@/components/assets/DepreciationChart";
import { DepreciationScheduleTable } from "@/components/assets/DepreciationScheduleTable";

interface DepreciationData {
  equipmentId: string;
  equipment: Equipment;
  method: "straight-line" | "declining-balance" | "sum-of-years" | "units-of-production";
  originalValue: number;
  salvageValue: number;
  usefulLife: number;
  currentAge: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
  taxValue: number;
  depreciationRate: number;
  schedule: {
    year: number;
    beginningBookValue: number;
    depreciationExpense: number;
    accumulatedDepreciation: number;
    endingBookValue: number;
    taxDepreciation: number;
    variance: number;
  }[];
  chartData: {
    year: number;
    bookValue: number;
    taxValue: number;
    depreciationExpense: number;
    accumulatedDepreciation: number;
    marketValue: number;
  }[];
}

// Sample depreciation data
const sampleDepreciationData: DepreciationData[] = [
  {
    equipmentId: "EQ-001",
    equipment: {
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
        room: "Pump Room 1"
      },
      specifications: {},
      status: "operational",
      condition: "good",
      installationDate: "2023-01-15",
      operatingHours: 8760,
      conditionMonitoring: {
        lastUpdated: "2024-12-15",
        overallCondition: "good",
        alerts: []
      },
      failureHistory: [],
      maintenanceHistory: [],
      createdAt: "2023-01-15",
      updatedAt: "2024-12-15"
    },
    method: "straight-line",
    originalValue: 25000,
    salvageValue: 2500,
    usefulLife: 15,
    currentAge: 1.9,
    annualDepreciation: 1500,
    accumulatedDepreciation: 2850,
    bookValue: 22150,
    taxValue: 21800,
    depreciationRate: 6.67,
    schedule: Array.from({ length: 15 }, (_, i) => ({
      year: i + 1,
      beginningBookValue: 25000 - (i * 1500),
      depreciationExpense: 1500,
      accumulatedDepreciation: (i + 1) * 1500,
      endingBookValue: 25000 - ((i + 1) * 1500),
      taxDepreciation: 1600,
      variance: 100
    })),
    chartData: Array.from({ length: 15 }, (_, i) => ({
      year: i + 1,
      bookValue: 25000 - ((i + 1) * 1500),
      taxValue: 25000 - ((i + 1) * 1600),
      depreciationExpense: 1500,
      accumulatedDepreciation: (i + 1) * 1500,
      marketValue: 25000 - ((i + 1) * 1400)
    }))
  }
];

const AssetDepreciationPage = () => {
  const [depreciationData, setDepreciationData] = useState<DepreciationData[]>(sampleDepreciationData);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<EquipmentType | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<DepreciationData | null>(sampleDepreciationData[0]);
  const [scheduleViewMode, setScheduleViewMode] = useState<'annual' | 'quarterly' | 'monthly'>('annual');

  const filteredData = useMemo(() => {
    return depreciationData.filter(item => {
      const matchesSearch = item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = methodFilter === "all" || item.method === methodFilter;
      const matchesType = typeFilter === "all" || item.equipment.type === typeFilter;
      
      return matchesSearch && matchesMethod && matchesType;
    });
  }, [depreciationData, searchTerm, methodFilter, typeFilter]);

  const stats = useMemo(() => {
    const totalOriginalValue = depreciationData.reduce((sum, item) => sum + item.originalValue, 0);
    const totalBookValue = depreciationData.reduce((sum, item) => sum + item.bookValue, 0);
    const totalTaxValue = depreciationData.reduce((sum, item) => sum + item.taxValue, 0);
    const totalDepreciation = depreciationData.reduce((sum, item) => sum + item.accumulatedDepreciation, 0);
    const totalVariance = depreciationData.reduce((sum, item) => sum + Math.abs(item.bookValue - item.taxValue), 0);
    const avgDepreciationRate = depreciationData.reduce((sum, item) => sum + item.depreciationRate, 0) / depreciationData.length;

    return { totalOriginalValue, totalBookValue, totalTaxValue, totalDepreciation, totalVariance, avgDepreciationRate };
  }, [depreciationData]);

  const getMethodColor = (method: string) => {
    const colors = {
      "straight-line": "bg-blue-100 text-blue-800",
      "declining-balance": "bg-green-100 text-green-800",
      "sum-of-years": "bg-purple-100 text-purple-800",
      "units-of-production": "bg-orange-100 text-orange-800"
    };
    return colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Asset Depreciation</h1>
            <p className="text-muted-foreground">Comprehensive depreciation management and financial reporting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculate
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatCard 
            title="Original Value"
            value={`$${stats.totalOriginalValue.toLocaleString()}`}
            icon={<DollarSign className="text-green-600 h-4 w-4" />}
            description="Total acquisition cost"
          />
          <StatCard 
            title="Book Value"
            value={`$${stats.totalBookValue.toLocaleString()}`}
            icon={<BarChart3 className="text-blue-600 h-4 w-4" />}
            description="Current GAAP value"
          />
          <StatCard 
            title="Tax Value"
            value={`$${stats.totalTaxValue.toLocaleString()}`}
            icon={<FileText className="text-purple-600 h-4 w-4" />}
            description="Current tax basis"
          />
          <StatCard 
            title="Total Depreciation"
            value={`$${stats.totalDepreciation.toLocaleString()}`}
            icon={<TrendingDown className="text-red-600 h-4 w-4" />}
            description="Accumulated depreciation"
          />
          <StatCard 
            title="Book vs Tax Variance"
            value={`$${stats.totalVariance.toLocaleString()}`}
            icon={<AlertTriangle className="text-orange-600 h-4 w-4" />}
            description="Variance amount"
          />
          <StatCard 
            title="Avg Depreciation Rate"
            value={`${stats.avgDepreciationRate.toFixed(1)}%`}
            icon={<Calendar className="text-purple-600 h-4 w-4" />}
            description="Annual depreciation"
          />
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Depreciation Overview</CardTitle>
                <CardDescription>Track asset depreciation across all equipment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="straight-line">Straight Line</SelectItem>
                        <SelectItem value="declining-balance">Declining Balance</SelectItem>
                        <SelectItem value="sum-of-years">Sum of Years</SelectItem>
                        <SelectItem value="units-of-production">Units of Production</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EquipmentType | "all")}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="instrumentation">Instrumentation</SelectItem>
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
                        <TableHead>Asset</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Original Value</TableHead>
                        <TableHead>Book Value</TableHead>
                        <TableHead>Tax Value</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow 
                          key={item.equipmentId} 
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => setSelectedAsset(item)}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.equipment.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.equipment.manufacturer} {item.equipment.model}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Age: {item.currentAge.toFixed(1)} years
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getMethodColor(item.method)}>
                              {item.method.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${item.originalValue.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-blue-600">
                            ${item.bookValue.toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium text-purple-600">
                            ${item.taxValue.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className={Math.abs(item.bookValue - item.taxValue) > 1000 ? 'text-orange-600' : 'text-green-600'}>
                              ${Math.abs(item.bookValue - item.taxValue).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-24">
                              <Progress 
                                value={(item.currentAge / item.usefulLife) * 100} 
                                className="h-2"
                              />
                              <div className="text-xs text-muted-foreground mt-1">
                                {((item.currentAge / item.usefulLife) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm">
                                <Calculator className="h-4 w-4" />
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

          <TabsContent value="analytics" className="space-y-6">
            {selectedAsset && (
              <DepreciationChart 
                data={selectedAsset.chartData}
                title={selectedAsset.equipment.name}
                method={selectedAsset.method}
                originalValue={selectedAsset.originalValue}
                salvageValue={selectedAsset.salvageValue}
              />
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            {selectedAsset && (
              <DepreciationScheduleTable 
                schedule={selectedAsset.schedule}
                assetName={selectedAsset.equipment.name}
                method={selectedAsset.method}
                viewMode={scheduleViewMode}
                onViewModeChange={setScheduleViewMode}
              />
            )}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Compliance Reports
                  </CardTitle>
                  <CardDescription>Generate compliance reports for various standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    GAAP Compliance Report
                  </Button>
                  <Button className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    IFRS Alignment Report
                  </Button>
                  <Button className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    SOX Documentation
                  </Button>
                  <Button className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Tax Depreciation Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    ERP Integration
                  </CardTitle>
                  <CardDescription>Connect with enterprise systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">SAP Integration</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Oracle NetSuite</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Microsoft Dynamics 365</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AssetDepreciationPage;
