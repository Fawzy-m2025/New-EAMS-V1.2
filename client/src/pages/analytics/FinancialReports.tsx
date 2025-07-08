
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Search, Filter, Download, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { useState } from "react";

const FinancialReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("quarter");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const revenueData = [
    { name: "Q1 2023", revenue: 2800000, profit: 420000, expenses: 2380000 },
    { name: "Q2 2023", revenue: 3200000, profit: 560000, expenses: 2640000 },
    { name: "Q3 2023", revenue: 3600000, profit: 720000, expenses: 2880000 },
    { name: "Q4 2023", revenue: 3400000, profit: 680000, expenses: 2720000 },
    { name: "Q1 2024", revenue: 3800000, profit: 760000, expenses: 3040000 },
    { name: "Q2 2024", revenue: 4200000, profit: 920000, expenses: 3280000 }
  ];

  const monthlyExpenses = [
    { name: "Jan", operations: 580000, maintenance: 220000, personnel: 450000, utilities: 180000 },
    { name: "Feb", operations: 620000, maintenance: 240000, personnel: 465000, utilities: 195000 },
    { name: "Mar", operations: 650000, maintenance: 280000, personnel: 480000, utilities: 210000 },
    { name: "Apr", operations: 680000, maintenance: 260000, personnel: 495000, utilities: 225000 },
    { name: "May", operations: 710000, maintenance: 290000, personnel: 510000, utilities: 240000 },
    { name: "Jun", operations: 740000, maintenance: 320000, personnel: 525000, utilities: 255000 }
  ];

  const departmentBudgets = [
    { name: "Operations", value: 2400000, color: "#3B82F6" },
    { name: "Maintenance", value: 1800000, color: "#10B981" },
    { name: "Personnel", value: 3200000, color: "#F59E0B" },
    { name: "R&D", value: 1200000, color: "#EF4444" },
    { name: "Administration", value: 800000, color: "#8B5CF6" }
  ];

  const cashflowData = [
    { name: "Week 1", inflow: 850000, outflow: 620000, net: 230000 },
    { name: "Week 2", inflow: 920000, outflow: 680000, net: 240000 },
    { name: "Week 3", inflow: 780000, outflow: 590000, net: 190000 },
    { name: "Week 4", inflow: 1100000, outflow: 750000, net: 350000 }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive financial performance analysis and reporting</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="gap-2">
              <PieChart className="h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(4200000)}
            icon={<DollarSign className="text-green-600 h-4 w-4" />}
            description="+10.5% from last quarter"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrency(920000)}
            icon={<TrendingUp className="text-blue-600 h-4 w-4" />}
            description="21.9% profit margin"
          />
          <StatCard
            title="Operating Expenses"
            value={formatCurrency(3280000)}
            icon={<TrendingDown className="text-orange-600 h-4 w-4" />}
            description="+5.2% from last quarter"
          />
          <StatCard
            title="Cash Flow"
            value={formatCurrency(1010000)}
            icon={<DollarSign className="text-purple-600 h-4 w-4" />}
            description="Monthly net flow"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Filter financial data by period and category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search financial data..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="profit">Profit & Loss</SelectItem>
                  <SelectItem value="cashflow">Cash Flow</SelectItem>
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
            title="Revenue & Profit Trend"
            description="Quarterly revenue, profit, and expense analysis"
            data={revenueData}
            categories={[
              { name: "revenue", color: "#3B82F6" },
              { name: "profit", color: "#10B981" },
              { name: "expenses", color: "#EF4444" }
            ]}
          />
          <BarChart
            title="Weekly Cash Flow Analysis"
            description="Cash inflow, outflow, and net position"
            data={cashflowData}
            categories={[
              { name: "inflow", color: "#10B981" },
              { name: "outflow", color: "#EF4444" },
              { name: "net", color: "#3B82F6" }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BarChart
              title="Monthly Expense Breakdown"
              description="Detailed analysis of operational expenses by category"
              data={monthlyExpenses}
              categories={[
                { name: "operations", color: "#3B82F6" },
                { name: "maintenance", color: "#10B981" },
                { name: "personnel", color: "#F59E0B" },
                { name: "utilities", color: "#EF4444" }
              ]}
              height={400}
            />
          </div>
          <DonutChart
            title="Department Budget Allocation"
            description="Annual budget distribution"
            data={departmentBudgets}
            height={400}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default FinancialReports;
