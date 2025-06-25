
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Search, Filter, Download, Share, TrendingUp, TrendingDown, BarChart3, Activity, Target } from "lucide-react";
import { useState } from "react";

const AnalyticsDashboards = () => {
  const [selectedDashboard, setSelectedDashboard] = useState("operational");
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const operationalKPIs = [
    { name: "Jan", productivity: 85, efficiency: 88, quality: 94, safety: 96 },
    { name: "Feb", productivity: 87, efficiency: 91, quality: 92, safety: 98 },
    { name: "Mar", productivity: 91, efficiency: 89, quality: 96, safety: 95 },
    { name: "Apr", productivity: 89, efficiency: 93, quality: 95, safety: 97 },
    { name: "May", productivity: 93, efficiency: 95, quality: 97, safety: 99 },
    { name: "Jun", productivity: 95, efficiency: 92, quality: 98, safety: 98 }
  ];

  const departmentPerformance = [
    { name: "Jan", operations: 88, maintenance: 85, quality: 92, safety: 96 },
    { name: "Feb", operations: 91, maintenance: 87, quality: 90, safety: 98 },
    { name: "Mar", operations: 89, maintenance: 92, quality: 94, safety: 95 },
    { name: "Apr", operations: 93, maintenance: 88, quality: 96, safety: 97 },
    { name: "May", operations: 95, maintenance: 91, quality: 93, safety: 99 },
    { name: "Jun", operations: 92, maintenance: 94, quality: 97, safety: 98 }
  ];

  const resourceUtilization = [
    { name: "Equipment", value: 87, color: "#3B82F6" },
    { name: "Personnel", value: 92, color: "#10B981" },
    { name: "Materials", value: 78, color: "#F59E0B" },
    { name: "Energy", value: 84, color: "#EF4444" },
    { name: "Space", value: 89, color: "#8B5CF6" }
  ];

  const incidentTrends = [
    { name: "Week 1", minor: 2, major: 0, critical: 0, resolved: 18 },
    { name: "Week 2", minor: 1, major: 1, critical: 0, resolved: 15 },
    { name: "Week 3", minor: 3, major: 0, critical: 1, resolved: 22 },
    { name: "Week 4", minor: 2, major: 1, critical: 0, resolved: 19 }
  ];

  const costAnalysis = [
    { name: "Jan", planned: 850000, actual: 820000, variance: -30000 },
    { name: "Feb", planned: 920000, actual: 950000, variance: 30000 },
    { name: "Mar", planned: 880000, actual: 860000, variance: -20000 },
    { name: "Apr", planned: 950000, actual: 980000, variance: 30000 },
    { name: "May", planned: 900000, actual: 885000, variance: -15000 },
    { name: "Jun", planned: 980000, actual: 1020000, variance: 40000 }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Business Intelligence Dashboards</h1>
            <p className="text-muted-foreground">Comprehensive analytics and key performance indicators</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Share className="h-4 w-4" />
              Share Dashboard
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Create Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall Score"
            value="92.3%"
            icon={<Target className="text-green-600 h-4 w-4" />}
            description="+2.1% from last month"
          />
          <StatCard
            title="Productivity"
            value="95%"
            icon={<TrendingUp className="text-blue-600 h-4 w-4" />}
            description="Above target"
          />
          <StatCard
            title="Efficiency"
            value="92%"
            icon={<Activity className="text-orange-600 h-4 w-4" />}
            description="Target: 90%"
          />
          <StatCard
            title="Quality Score"
            value="98%"
            icon={<TrendingUp className="text-purple-600 h-4 w-4" />}
            description="Excellent performance"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Controls</CardTitle>
            <CardDescription>Configure dashboard view and filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search metrics..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedDashboard} onValueChange={setSelectedDashboard}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Dashboard Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
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
          <AreaChart
            title="Operational KPIs Trend"
            description="Monthly performance across key operational metrics"
            data={operationalKPIs}
            categories={[
              { name: "productivity", color: "#3B82F6" },
              { name: "efficiency", color: "#10B981" },
              { name: "quality", color: "#F59E0B" },
              { name: "safety", color: "#EF4444" }
            ]}
          />
          <BarChart
            title="Department Performance"
            description="Monthly performance by department"
            data={departmentPerformance}
            categories={[
              { name: "operations", color: "#3B82F6" },
              { name: "maintenance", color: "#10B981" },
              { name: "quality", color: "#F59E0B" },
              { name: "safety", color: "#EF4444" }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DonutChart
            title="Resource Utilization"
            description="Current utilization rates"
            data={resourceUtilization}
          />
          <BarChart
            title="Incident Management"
            description="Weekly incident tracking and resolution"
            data={incidentTrends}
            categories={[
              { name: "minor", color: "#F59E0B" },
              { name: "major", color: "#EF4444" },
              { name: "critical", color: "#7C2D12" },
              { name: "resolved", color: "#10B981" }
            ]}
          />
          <AreaChart
            title="Cost Variance Analysis"
            description="Budget vs actual spending"
            data={costAnalysis}
            categories={[
              { name: "planned", color: "#E5E7EB" },
              { name: "actual", color: "#3B82F6" }
            ]}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsDashboards;
