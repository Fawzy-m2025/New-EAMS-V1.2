import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Gauge, Target, TrendingUp, Activity } from "lucide-react";

const KPIDashboard = () => {
  const kpiData = [
    { name: "Jan", sales: 4000, revenue: 2400, customerSatisfaction: 85 },
    { name: "Feb", sales: 3000, revenue: 1398, customerSatisfaction: 90 },
    { name: "Mar", sales: 2000, revenue: 9800, customerSatisfaction: 78 },
    { name: "Apr", sales: 2780, revenue: 3908, customerSatisfaction: 82 },
    { name: "May", sales: 1890, revenue: 4800, customerSatisfaction: 88 },
    { name: "Jun", sales: 2390, revenue: 3800, customerSatisfaction: 93 }
  ];

  const departmentKPI = [
    { name: "Sales", value: 85, color: "#3B82F6" },
    { name: "Marketing", value: 78, color: "#10B981" },
    { name: "Operations", value: 92, color: "#F59E0B" },
    { name: "Finance", value: 88, color: "#EF4444" },
    { name: "HR", value: 80, color: "#8B5CF6" }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">KPI Dashboard</h1>
            <p className="text-muted-foreground">Key Performance Indicators across all departments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Data</Button>
            <Button>Create Custom KPI</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Overall KPI Score"
            value="87.5%"
            icon={<Target className="text-green-600 h-4 w-4" />}
            description="+3.2% from last quarter"
          />
          <StatCard
            title="Sales Performance"
            value="92%"
            icon={<TrendingUp className="text-blue-600 h-4 w-4" />}
            description="Above target"
          />
          <StatCard
            title="Operational Efficiency"
            value="89%"
            icon={<Activity className="text-orange-600 h-4 w-4" />}
            description="Target: 85%"
          />
          <StatCard
            title="Customer Satisfaction"
            value="94%"
            icon={<Gauge className="text-purple-600 h-4 w-4" />}
            description="Excellent performance"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>KPI Trends</CardTitle>
            <CardContent>
              <AreaChart
                title="Key Performance Indicators Over Time"
                description="Monthly KPI trends across key metrics"
                data={kpiData}
                categories={[
                  { name: "sales", color: "#3B82F6" },
                  { name: "revenue", color: "#10B981" },
                  { name: "customerSatisfaction", color: "#F59E0B" }
                ]}
              />
            </CardContent>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title="Departmental KPI Performance"
            description="Current performance by department"
            data={departmentKPI}
            categories={[
              { name: "value", color: "#3B82F6" }
            ]}
          />
          <DonutChart
            title="KPI Distribution by Department"
            description="Current KPI scores distribution"
            data={departmentKPI}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default KPIDashboard;
