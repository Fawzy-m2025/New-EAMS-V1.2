
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Plus, Download, Upload, Filter, Search, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { useState } from "react";

const Budgeting = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const budgetData = [
    {
      id: "BUD-001",
      category: "Operations",
      department: "Production",
      budgeted: 500000,
      actual: 485000,
      variance: -15000,
      status: "under",
      period: "Q1 2024"
    },
    {
      id: "BUD-002",
      category: "Maintenance",
      department: "Facilities",
      budgeted: 150000,
      actual: 165000,
      variance: 15000,
      status: "over",
      period: "Q1 2024"
    },
    {
      id: "BUD-003",
      category: "Personnel",
      department: "HR",
      budgeted: 300000,
      actual: 295000,
      variance: -5000,
      status: "under",
      period: "Q1 2024"
    },
    {
      id: "BUD-004",
      category: "Equipment",
      department: "Engineering",
      budgeted: 200000,
      actual: 210000,
      variance: 10000,
      status: "over",
      period: "Q1 2024"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "under": return "text-green-600 bg-green-100";
      case "over": return "text-red-600 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBudgeted = budgetData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActual = budgetData.reduce((sum, item) => sum + item.actual, 0);
  const totalVariance = totalActual - totalBudgeted;
  const variancePercentage = ((totalVariance / totalBudgeted) * 100).toFixed(1);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
            <p className="text-muted-foreground">Plan, track, and analyze organizational budgets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Budget
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Budget"
            value={formatCurrency(totalBudgeted)}
            icon={<DollarSign className="text-blue-600 h-4 w-4" />}
            description="Annual allocation"
          />
          <StatCard
            title="Actual Spending"
            value={formatCurrency(totalActual)}
            icon={<TrendingUp className="text-green-600 h-4 w-4" />}
            description="Current period"
          />
          <StatCard
            title="Variance"
            value={formatCurrency(Math.abs(totalVariance))}
            icon={totalVariance >= 0 ? 
              <TrendingUp className="text-red-600 h-4 w-4" /> : 
              <TrendingDown className="text-green-600 h-4 w-4" />
            }
            description={`${variancePercentage}% ${totalVariance >= 0 ? 'over' : 'under'}`}
          />
          <StatCard
            title="Budget Alerts"
            value="3"
            icon={<AlertTriangle className="text-orange-600 h-4 w-4" />}
            description="Require attention"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Budget Filters</CardTitle>
            <CardDescription>Filter budgets by period and department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search budgets..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="q1-2024">Q1 2024</SelectItem>
                  <SelectItem value="q2-2024">Q2 2024</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Current budget vs actual spending analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Budget ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Budgeted</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetData.map((budget) => (
                  <TableRow key={budget.id}>
                    <TableCell className="font-medium">{budget.id}</TableCell>
                    <TableCell>{budget.category}</TableCell>
                    <TableCell>{budget.department}</TableCell>
                    <TableCell>{formatCurrency(budget.budgeted)}</TableCell>
                    <TableCell>{formatCurrency(budget.actual)}</TableCell>
                    <TableCell className={budget.variance >= 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(Math.abs(budget.variance))}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(budget.status)}>
                        {budget.status === "under" ? "Under Budget" : "Over Budget"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Budgeting;
