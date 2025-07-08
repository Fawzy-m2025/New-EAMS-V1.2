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
import { useState, useMemo, useEffect } from "react";
import { TrendingDown, Search, Filter, Download, Upload, Calculator, DollarSign, Calendar, BarChart3, FileText, AlertTriangle, Settings } from "lucide-react";
import { Equipment, EquipmentType } from "@/types/eams";
import { DepreciationChart } from "@/components/assets/DepreciationChart";
import { DepreciationScheduleTable } from "@/components/assets/DepreciationScheduleTable";
import { allHierarchicalEquipment, equipmentSummary } from "@/data/hierarchicalAssetData";

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

// Generate realistic depreciation data based on equipment type and specifications
const generateDepreciationData = (equipment: Equipment[]): DepreciationData[] => {
  return equipment.map((asset) => {
    // Determine asset values based on category and specifications
    let originalValue = 10000; // Base value
    let usefulLife = 10; // Base useful life
    let method: "straight-line" | "declining-balance" | "sum-of-years" | "units-of-production" = "straight-line";

    // Category-specific valuations
    switch (asset.category) {
      case 'pump':
        originalValue = asset.name.includes('Priming') ? 15000 : 35000;
        usefulLife = 15;
        method = "straight-line";
        break;
      case 'motor':
        originalValue = 25000;
        usefulLife = 20;
        method = "straight-line";
        break;
      case 'valve':
        originalValue = asset.specifications?.diameter ?
          parseInt(asset.specifications.diameter.toString()) * 50 : 5000;
        usefulLife = 25;
        method = "straight-line";
        break;
      case 'strainer':
        originalValue = 8000;
        usefulLife = 15;
        method = "straight-line";
        break;
      case 'sensor':
        originalValue = 12000;
        usefulLife = 10;
        method = "declining-balance";
        break;
      case 'actuator':
        originalValue = 18000;
        usefulLife = 15;
        method = "straight-line";
        break;
      case 'tank':
        originalValue = asset.specifications?.capacity ?
          (asset.specifications.capacity as number) * 1000 : 45000;
        usefulLife = 30;
        method = "straight-line";
        break;
      case 'compressor':
        originalValue = 55000;
        usefulLife = 20;
        method = "straight-line";
        break;
      default:
        originalValue = 15000;
        usefulLife = 15;
    }

    // Manufacturer adjustments
    const manufacturerMultipliers: { [key: string]: number } = {
      'HMS': 1.2,
      'SAER': 1.1,
      'ELDIN': 1.0,
      'ABB': 1.3,
      'ROBUSCHI/Italy': 1.4,
      'McWANE': 1.1,
      'TVN': 1.0,
      'AMA': 0.9,
      'El Haggar Misr': 0.8,
      'HC': 1.0,
      'EEC': 1.1
    };

    const multiplier = manufacturerMultipliers[asset.manufacturer] || 1.0;
    originalValue *= multiplier;

    const salvageValue = originalValue * 0.1; // 10% salvage value
    const installationDate = new Date(asset.installationDate || '2020-01-15');
    const currentAge = (Date.now() - installationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    const annualDepreciation = (originalValue - salvageValue) / usefulLife;
    const accumulatedDepreciation = Math.min(annualDepreciation * currentAge, originalValue - salvageValue);
    const bookValue = originalValue - accumulatedDepreciation;
    const taxValue = bookValue * 0.95; // Slight difference for tax purposes
    const depreciationRate = (annualDepreciation / originalValue) * 100;

    // Generate schedule
    const schedule = Array.from({ length: usefulLife }, (_, i) => {
      const year = i + 1;
      const yearlyDepreciation = method === "declining-balance" && year > 1 ?
        (originalValue - (i * annualDepreciation)) * 0.2 : annualDepreciation;
      const accumulated = Math.min((i + 1) * annualDepreciation, originalValue - salvageValue);
      const endingBookValue = Math.max(originalValue - accumulated, salvageValue);

      return {
        year,
        beginningBookValue: year === 1 ? originalValue : Math.max(originalValue - (i * annualDepreciation), salvageValue),
        depreciationExpense: yearlyDepreciation,
        accumulatedDepreciation: accumulated,
        endingBookValue,
        taxDepreciation: yearlyDepreciation * 1.05,
        variance: yearlyDepreciation * 0.05
      };
    });

    // Generate chart data
    const chartData = Array.from({ length: usefulLife }, (_, i) => {
      const year = i + 1;
      const accumulated = Math.min((i + 1) * annualDepreciation, originalValue - salvageValue);
      const bookValue = Math.max(originalValue - accumulated, salvageValue);
      const marketValue = bookValue * (0.9 + Math.random() * 0.2); // Market fluctuation

      return {
        year,
        bookValue,
        taxValue: bookValue * 0.95,
        depreciationExpense: annualDepreciation,
        accumulatedDepreciation: accumulated,
        marketValue
      };
    });

    return {
      equipmentId: asset.id,
      equipment: asset,
      method,
      originalValue,
      salvageValue,
      usefulLife,
      currentAge,
      annualDepreciation,
      accumulatedDepreciation,
      bookValue,
      taxValue,
      depreciationRate,
      schedule,
      chartData
    };
  });
};

const AssetDepreciationPage = () => {
  const [depreciationData, setDepreciationData] = useState<DepreciationData[]>(
    generateDepreciationData(allHierarchicalEquipment)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<EquipmentType | "all">("all");
  const [selectedAsset, setSelectedAsset] = useState<DepreciationData | null>(null);
  const [scheduleViewMode, setScheduleViewMode] = useState<'annual' | 'quarterly' | 'monthly'>('annual');

  // Set initial selected asset
  useEffect(() => {
    if (depreciationData.length > 0 && !selectedAsset) {
      setSelectedAsset(depreciationData[0]);
    }
  }, [depreciationData, selectedAsset]);

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

        {/* Equipment Category Depreciation Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Object.entries(equipmentSummary.byCategory).map(([category, count]) => {
            const categoryData = depreciationData.filter(item => item.equipment.category === category);
            const totalValue = categoryData.reduce((sum, item) => sum + item.bookValue, 0);

            return (
              <StatCard
                key={category}
                title={category.charAt(0).toUpperCase() + category.slice(1)}
                value={count.toString()}
                icon={<Calculator className="text-primary h-4 w-4" />}
                description={`$${Math.round(totalValue / 1000)}K value`}
              />
            );
          })}
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
