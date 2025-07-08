
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Search, Filter, Download, FileText, TrendingUp, TrendingDown, Zap, AlertTriangle, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

const AssetReports = () => {
  const [selectedAssetClass, setSelectedAssetClass] = useState("all");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const assetLifecycle = [
    { name: "New (0-2 years)", value: 25, color: "#10B981" },
    { name: "Prime (3-7 years)", value: 40, color: "#3B82F6" },
    { name: "Mature (8-12 years)", value: 20, color: "#F59E0B" },
    { name: "Aging (13+ years)", value: 15, color: "#EF4444" }
  ];

  const maintenanceEfficiency = [
    { name: "Jan", planned: 85, unplanned: 15, emergency: 5 },
    { name: "Feb", planned: 88, unplanned: 12, emergency: 3 },
    { name: "Mar", planned: 82, unplanned: 18, emergency: 8 },
    { name: "Apr", planned: 90, unplanned: 10, emergency: 2 },
    { name: "May", planned: 87, unplanned: 13, emergency: 4 },
    { name: "Jun", planned: 92, unplanned: 8, emergency: 1 }
  ];

  const assetUtilization = [
    { name: "Q1", critical: 95, important: 87, standard: 78, low: 45 },
    { name: "Q2", critical: 97, important: 89, standard: 82, low: 48 },
    { name: "Q3", critical: 93, important: 85, standard: 79, low: 42 },
    { name: "Q4", critical: 96, important: 91, standard: 84, low: 50 }
  ];

  const downtimeAnalysis = [
    { name: "Week 1", mechanical: 12, electrical: 8, control: 4, external: 2 },
    { name: "Week 2", mechanical: 15, electrical: 6, control: 3, external: 1 },
    { name: "Week 3", mechanical: 10, electrical: 12, control: 7, external: 3 },
    { name: "Week 4", mechanical: 8, electrical: 9, control: 5, external: 2 }
  ];

  const costTrends = [
    { name: "Jan", acquisition: 450000, maintenance: 125000, operation: 280000, disposal: 15000 },
    { name: "Feb", acquisition: 320000, maintenance: 135000, operation: 295000, disposal: 22000 },
    { name: "Mar", acquisition: 680000, maintenance: 142000, operation: 310000, disposal: 18000 },
    { name: "Apr", acquisition: 520000, maintenance: 128000, operation: 285000, disposal: 25000 },
    { name: "May", acquisition: 750000, maintenance: 155000, operation: 325000, disposal: 12000 },
    { name: "Jun", acquisition: 420000, maintenance: 148000, operation: 315000, disposal: 30000 }
  ];

  const reliabilityMetrics = [
    { name: "Pumps", mtbf: 342, mttr: 4.2, availability: 94.5 },
    { name: "Compressors", mtbf: 289, mttr: 6.8, availability: 91.2 },
    { name: "Motors", mtbf: 445, mttr: 2.1, availability: 97.8 },
    { name: "Conveyors", mtbf: 267, mttr: 8.5, availability: 88.9 }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asset Performance Reports</h1>
            <p className="text-muted-foreground">Comprehensive asset analytics and utilization reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Asset Utilization"
            value="89.2%"
            icon={<Zap className="text-blue-600 h-4 w-4" />}
            description="+3.1% from last month"
          />
          <StatCard
            title="MTBF Average"
            value="335 hrs"
            icon={<Clock className="text-green-600 h-4 w-4" />}
            description="Mean time between failures"
          />
          <StatCard
            title="Maintenance Cost"
            value="$148K"
            icon={<DollarSign className="text-orange-600 h-4 w-4" />}
            description="Monthly expenditure"
          />
          <StatCard
            title="Critical Assets"
            value="8"
            icon={<AlertTriangle className="text-red-600 h-4 w-4" />}
            description="Require immediate attention"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter asset reports by class and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search assets..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedAssetClass} onValueChange={setSelectedAssetClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Asset Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="rotating">Rotating Equipment</SelectItem>
                  <SelectItem value="static">Static Equipment</SelectItem>
                  <SelectItem value="electrical">Electrical Systems</SelectItem>
                  <SelectItem value="instrumentation">Instrumentation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Metric Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="reliability">Reliability</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cost">Cost Analysis</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title="Maintenance Strategy Effectiveness"
            description="Monthly breakdown of maintenance types"
            data={maintenanceEfficiency}
            categories={[
              { name: "planned", color: "#10B981" },
              { name: "unplanned", color: "#F59E0B" },
              { name: "emergency", color: "#EF4444" }
            ]}
          />
          <AreaChart
            title="Asset Utilization by Criticality"
            description="Quarterly utilization rates by asset criticality"
            data={assetUtilization}
            categories={[
              { name: "critical", color: "#EF4444" },
              { name: "important", color: "#F59E0B" },
              { name: "standard", color: "#3B82F6" },
              { name: "low", color: "#6B7280" }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DonutChart
            title="Asset Lifecycle Distribution"
            description="Assets by age category"
            data={assetLifecycle}
          />
          <BarChart
            title="Downtime Root Cause Analysis"
            description="Weekly breakdown of downtime causes"
            data={downtimeAnalysis}
            categories={[
              { name: "mechanical", color: "#3B82F6" },
              { name: "electrical", color: "#F59E0B" },
              { name: "control", color: "#10B981" },
              { name: "external", color: "#EF4444" }
            ]}
          />
          <AreaChart
            title="Asset Cost Trends"
            description="Monthly cost breakdown by category"
            data={costTrends}
            categories={[
              { name: "acquisition", color: "#3B82F6" },
              { name: "maintenance", color: "#F59E0B" },
              { name: "operation", color: "#10B981" }
            ]}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default AssetReports;
