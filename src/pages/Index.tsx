import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import {
  ChevronRight,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Wrench,
  Activity,
  AlertTriangle,
  Zap,
  Shield
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  // Chart data
  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [2400000, 2800000, 3200000, 3100000, 3600000, 4200000],
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6" + "20",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Profit",
        data: [600000, 800000, 1000000, 1000000, 1200000, 1400000],
        borderColor: "#10B981",
        backgroundColor: "#10B981" + "20",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expenses",
        data: [1800000, 2000000, 2200000, 2100000, 2400000, 2800000],
        borderColor: "#EF4444",
        backgroundColor: "#EF4444" + "20",
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const assetUtilizationData = {
    labels: ["Production", "Maintenance", "Quality", "Safety"],
    datasets: [
      {
        label: "Utilization (%)",
        data: [88, 75, 95, 98],
        backgroundColor: "#8B5CF6",
        borderColor: "#8B5CF6",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "Target (%)",
        data: [90, 80, 95, 100],
        backgroundColor: "#E5E7EB",
        borderColor: "#E5E7EB",
        borderWidth: 2,
        borderRadius: 6,
      },
      {
        label: "Efficiency (%)",
        data: [92, 85, 96, 99],
        backgroundColor: "#10B981",
        borderColor: "#10B981",
        borderWidth: 2,
        borderRadius: 6,
      }
    ],
  };

  const departmentPerformanceData = {
    labels: ["Operations", "Maintenance", "Administration", "R&D", "Sales"],
    datasets: [{
      label: "Department Budget",
      data: [4200000, 2800000, 1800000, 1200000, 2400000],
      backgroundColor: ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
      borderColor: ["#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
      borderWidth: 2,
    }],
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  System Status: Operational
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-shadow-lg">
                  Toshka Financial
                  <br />
                  <span className="bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                    Insight Hub
                  </span>
                </h1>
                <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
                  Advanced enterprise management platform with real-time analytics,
                  comprehensive reporting, and intelligent automation for optimal business performance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold gap-2 shadow-lg"
                  onClick={() => navigate('/financial')}
                >
                  <PieChart size={20} />
                  Launch Dashboard
                  <ChevronRight size={16} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  onClick={() => navigate('/analytics/dashboards')}
                >
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$4.2M"
            icon={<DollarSign className="text-green-600 h-5 w-5" />}
            description="+12.5% from last month"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Active Assets"
            value="2,847"
            icon={<Package className="text-blue-600 h-5 w-5" />}
            description="98.5% operational"
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatCard
            title="Efficiency Rate"
            value="94.2%"
            icon={<Zap className="text-yellow-600 h-5 w-5" />}
            description="+2.1% from target"
            trend={{ value: 2.1, isPositive: true }}
          />
          <StatCard
            title="Safety Score"
            value="99.7%"
            icon={<Shield className="text-green-600 h-5 w-5" />}
            description="Excellent rating"
            trend={{ value: 0.3, isPositive: true }}
          />
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Frequently used operations and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { icon: Wrench, label: "New Work Order", path: "/maintenance/work-orders", color: "bg-orange-500" },
                { icon: Users, label: "Employee Portal", path: "/hr/employees", color: "bg-blue-500" },
                { icon: Package, label: "Asset Tracking", path: "/assets/tracking", color: "bg-green-500" },
                { icon: DollarSign, label: "Financial Reports", path: "/analytics/financial", color: "bg-purple-500" },
                { icon: AlertTriangle, label: "Safety Alerts", path: "/hse/incidents", color: "bg-red-500" },
                { icon: PieChart, label: "Analytics", path: "/analytics/dashboards", color: "bg-indigo-500" }
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-20 flex-col gap-2 hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center text-white`}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedChart
            title="Financial Performance"
            description="Monthly revenue, expenses, and profit trends"
            type="line"
            data={performanceData}
            height={350}
            preset="analytics"
            colorScheme="gradient"
            animation="fade"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />

          <EnhancedChart
            title="Operational Metrics"
            description="Key performance indicators across departments"
            type="bar"
            data={assetUtilizationData}
            height={350}
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

        {/* Department Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>System Alerts & Notifications</CardTitle>
                <CardDescription>Recent system events and status updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: "success",
                    title: "Maintenance Completed",
                    description: "Pump unit PU-001 maintenance completed successfully",
                    time: "2 minutes ago",
                    icon: Wrench,
                    color: "text-green-600"
                  },
                  {
                    type: "warning",
                    title: "Budget Alert",
                    description: "Q4 operational budget reached 85% threshold",
                    time: "15 minutes ago",
                    icon: AlertTriangle,
                    color: "text-yellow-600"
                  },
                  {
                    type: "info",
                    title: "Asset Update",
                    description: "New equipment registered in inventory system",
                    time: "1 hour ago",
                    icon: Package,
                    color: "text-blue-600"
                  },
                  {
                    type: "success",
                    title: "Safety Milestone",
                    description: "500 days without incidents achieved",
                    time: "3 hours ago",
                    icon: Shield,
                    color: "text-green-600"
                  }
                ].map((alert, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className={`mt-1 ${alert.color}`}>
                      <alert.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{alert.title}</div>
                      <div className="text-sm text-muted-foreground">{alert.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <EnhancedChart
            title="Department Budget"
            description="Annual budget allocation by department"
            type="doughnut"
            data={departmentPerformanceData}
            height={400}
            preset="dashboard"
            colorScheme="vibrant"
            animation="bounce"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
