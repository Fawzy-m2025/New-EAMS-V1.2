
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { AreaChart } from "@/components/dashboard/AreaChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { Plus, Search, Filter, Calendar, DollarSign, Users, Clock, TrendingUp, Target, AlertCircle } from "lucide-react";
import { useState } from "react";

const ProjectList = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const projects = [
    {
      id: "PRJ-001",
      name: "Factory Expansion Phase 1",
      status: "active",
      priority: "high",
      progress: 75,
      budget: 2500000,
      spent: 1875000,
      startDate: "2024-01-15",
      endDate: "2024-06-30",
      manager: "John Smith",
      team: 12,
      department: "Operations"
    },
    {
      id: "PRJ-002",
      name: "Digital Transformation Initiative",
      status: "planning",
      priority: "medium",
      progress: 25,
      budget: 1800000,
      spent: 450000,
      startDate: "2024-03-01",
      endDate: "2024-12-31",
      manager: "Sarah Wilson",
      team: 8,
      department: "IT"
    },
    {
      id: "PRJ-003",
      name: "Safety Compliance Upgrade",
      status: "completed",
      priority: "high",
      progress: 100,
      budget: 800000,
      spent: 780000,
      startDate: "2023-09-01",
      endDate: "2024-02-28",
      manager: "Mike Johnson",
      team: 6,
      department: "HSE"
    },
    {
      id: "PRJ-004",
      name: "Equipment Modernization",
      status: "active",
      priority: "medium",
      progress: 60,
      budget: 3200000,
      spent: 1920000,
      startDate: "2024-02-01",
      endDate: "2024-08-31",
      manager: "Emily Chen",
      team: 15,
      department: "Engineering"
    }
  ];

  const monthlyProgress = [
    { name: "Jan", completed: 2, active: 5, planning: 3 },
    { name: "Feb", completed: 3, active: 6, planning: 2 },
    { name: "Mar", completed: 1, active: 8, planning: 4 },
    { name: "Apr", completed: 4, active: 7, planning: 3 },
    { name: "May", completed: 2, active: 9, planning: 2 },
    { name: "Jun", completed: 3, active: 8, planning: 1 }
  ];

  const budgetUtilization = [
    { name: "Jan", budget: 800000, spent: 650000 },
    { name: "Feb", budget: 950000, spent: 820000 },
    { name: "Mar", budget: 1200000, spent: 1100000 },
    { name: "Apr", budget: 1400000, spent: 1250000 },
    { name: "May", budget: 1600000, spent: 1480000 },
    { name: "Jun", budget: 1800000, spent: 1650000 }
  ];

  const departmentProjects = [
    { name: "Operations", value: 35, color: "#3B82F6" },
    { name: "Engineering", value: 28, color: "#10B981" },
    { name: "IT", value: 20, color: "#F59E0B" },
    { name: "HSE", value: 17, color: "#EF4444" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "planning": return "text-blue-600 bg-blue-100";
      case "completed": return "text-gray-600 bg-gray-100";
      case "on-hold": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const totalSpent = projects.reduce((sum, project) => sum + project.spent, 0);
  const activeProjects = projects.filter(p => p.status === "active").length;
  const avgProgress = Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
            <p className="text-muted-foreground">Monitor and manage organizational projects</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            icon={<DollarSign className="text-blue-600 h-4 w-4" />}
            description="Allocated budget"
          />
          <StatCard
            title="Active Projects"
            value={activeProjects.toString()}
            icon={<Target className="text-green-600 h-4 w-4" />}
            description="Currently running"
          />
          <StatCard
            title="Avg Progress"
            value={`${avgProgress}%`}
            icon={<TrendingUp className="text-orange-600 h-4 w-4" />}
            description="Overall completion"
          />
          <StatCard
            title="Budget Spent"
            value={formatCurrency(totalSpent)}
            icon={<AlertCircle className="text-red-600 h-4 w-4" />}
            description="Total expenditure"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart
            title="Project Status by Month"
            description="Monthly project status distribution"
            data={monthlyProgress}
            categories={[
              { name: "completed", color: "#10B981" },
              { name: "active", color: "#3B82F6" },
              { name: "planning", color: "#F59E0B" }
            ]}
          />
          <AreaChart
            title="Budget vs Spending Trend"
            description="Monthly budget utilization"
            data={budgetUtilization}
            categories={[
              { name: "budget", color: "#3B82F6" },
              { name: "spent", color: "#EF4444" }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Filters</CardTitle>
                <CardDescription>Filter projects by status and priority</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search projects..." className="pl-10" />
                    </div>
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <DonutChart
            title="Projects by Department"
            description="Distribution across departments"
            data={departmentProjects}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Project Portfolio</CardTitle>
            <CardDescription>Complete project information and progress tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Spent</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">{project.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell>{formatCurrency(project.spent)}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.team}
                      </div>
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

export default ProjectList;
