
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { Plus, Search, Filter, Users, UserCheck, UserX, Calendar, Mail, Phone } from "lucide-react";
import { useState } from "react";

const Employees = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const employees = [
    {
      id: "EMP-001",
      name: "John Smith",
      email: "john.smith@company.com",
      phone: "+1-555-0123",
      department: "Engineering",
      position: "Senior Mechanical Engineer",
      status: "active",
      hireDate: "2022-03-15",
      manager: "Mike Johnson",
      salary: 85000,
      location: "Building 1"
    },
    {
      id: "EMP-002",
      name: "Sarah Wilson",
      email: "sarah.wilson@company.com",
      phone: "+1-555-0124",
      department: "Operations",
      position: "Operations Manager",
      status: "active",
      hireDate: "2021-07-20",
      manager: "David Brown",
      salary: 95000,
      location: "Building 2"
    },
    {
      id: "EMP-003",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      phone: "+1-555-0125",
      department: "Maintenance",
      position: "Maintenance Supervisor",
      status: "active",
      hireDate: "2020-11-10",
      manager: "Lisa Davis",
      salary: 75000,
      location: "Building 1"
    },
    {
      id: "EMP-004",
      name: "Emily Chen",
      email: "emily.chen@company.com",
      phone: "+1-555-0126",
      department: "HR",
      position: "HR Specialist",
      status: "on-leave",
      hireDate: "2023-01-05",
      manager: "Robert Taylor",
      salary: 62000,
      location: "Building 3"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "on-leave": return "text-yellow-600 bg-yellow-100";
      case "inactive": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(salary);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Management</h1>
            <p className="text-muted-foreground">Manage workforce and organizational structure</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value="247"
            icon={<Users className="text-blue-600 h-4 w-4" />}
            description="Active workforce"
          />
          <StatCard
            title="Active"
            value="235"
            icon={<UserCheck className="text-green-600 h-4 w-4" />}
            description="Working today"
          />
          <StatCard
            title="On Leave"
            value="8"
            icon={<Calendar className="text-yellow-600 h-4 w-4" />}
            description="Temporary absence"
          />
          <StatCard
            title="New Hires"
            value="4"
            icon={<UserX className="text-orange-600 h-4 w-4" />}
            description="This month"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employee Filters</CardTitle>
            <CardDescription>Filter employees by department, status, and location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search employees..." className="pl-10" />
                </div>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Complete employee information and management</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.hireDate}</TableCell>
                    <TableCell>{employee.manager}</TableCell>
                    <TableCell>{formatSalary(employee.salary)}</TableCell>
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

export default Employees;
