
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Shield, Search, Filter, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PreventiveMaintenance = () => {
  const schedules = [
    { id: "PM-001", asset: "Pump Station Alpha", task: "Monthly Inspection", frequency: "Monthly", nextDue: "2024-01-25", status: "Scheduled", priority: "Medium" },
    { id: "PM-002", asset: "Generator Unit 1", task: "Oil Change", frequency: "Quarterly", nextDue: "2024-01-18", status: "Overdue", priority: "High" },
    { id: "PM-003", asset: "Control Panel CP-01", task: "Calibration Check", frequency: "Bi-Annual", nextDue: "2024-02-15", status: "Scheduled", priority: "Low" },
    { id: "PM-004", asset: "Valve Assembly V-12", task: "Seal Replacement", frequency: "Annual", nextDue: "2024-01-30", status: "In Progress", priority: "Medium" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Preventive Maintenance</h1>
            <p className="text-muted-foreground">Scheduled maintenance and inspection programs</p>
          </div>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Create Schedule
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Active Schedules"
            value="287"
            icon={<Calendar className="text-primary h-4 w-4" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Due This Week"
            value="18"
            icon={<Clock className="text-orange-600 h-4 w-4" />}
            description="Require attention"
          />
          <StatCard 
            title="Completed Tasks"
            value="156"
            icon={<CheckCircle className="text-green-600 h-4 w-4" />}
            description="This month"
          />
          <StatCard 
            title="Compliance Rate"
            value="94.7%"
            icon={<Shield className="text-primary h-4 w-4" />}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Management</CardTitle>
            <CardDescription>Search and filter maintenance schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search schedules..." className="pl-10" />
                </div>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maintenance Schedules</CardTitle>
            <CardDescription>Preventive maintenance tasks and schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{schedule.task}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{schedule.id}</span>
                        <span>•</span>
                        <span>{schedule.asset}</span>
                        <span>•</span>
                        <span>{schedule.frequency}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">Next Due: {schedule.nextDue}</div>
                      <div className="flex gap-2">
                        <Badge variant={schedule.priority === 'High' ? 'destructive' : schedule.priority === 'Medium' ? 'secondary' : 'outline'}>
                          {schedule.priority}
                        </Badge>
                        <Badge variant={schedule.status === 'Overdue' ? 'destructive' : schedule.status === 'In Progress' ? 'secondary' : 'default'}>
                          {schedule.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PreventiveMaintenance;
