import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import {
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle,
  DollarSign, Users, Calendar, Activity, Target
} from 'lucide-react';
import type { WorkOrder } from '@/types/eams';

interface WorkOrderAnalyticsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderAnalytics({ workOrders }: WorkOrderAnalyticsProps) {
  // Calculate analytics data
  const totalOrders = workOrders.length;
  const completedOrders = workOrders.filter(wo => wo.status === 'completed').length;
  const inProgressOrders = workOrders.filter(wo => wo.status === 'in-progress').length;
  const overdueOrders = workOrders.filter(wo =>
    new Date(wo.dueDate) < new Date() && wo.status !== 'completed'
  ).length;

  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const avgCompletionTime = workOrders
    .filter(wo => wo.actualHours)
    .reduce((acc, wo) => acc + (wo.actualHours || 0), 0) /
    workOrders.filter(wo => wo.actualHours).length || 0;

  // Priority distribution data for Chart.js
  const priorityData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      label: 'Work Orders by Priority',
      data: [
        workOrders.filter(wo => wo.priority === 'critical').length,
        workOrders.filter(wo => wo.priority === 'high').length,
        workOrders.filter(wo => wo.priority === 'medium').length,
        workOrders.filter(wo => wo.priority === 'low').length
      ],
      backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
      borderColor: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
      borderWidth: 2,
    }],
  };

  // Status distribution data for Chart.js
  const statusData = {
    labels: ['Open', 'Assigned', 'In Progress', 'Completed'],
    datasets: [{
      label: 'Work Orders by Status',
      data: [
        workOrders.filter(wo => wo.status === 'open').length,
        workOrders.filter(wo => wo.status === 'assigned').length,
        workOrders.filter(wo => wo.status === 'in-progress').length,
        workOrders.filter(wo => wo.status === 'completed').length
      ],
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // Monthly trend data for Chart.js
  const monthlyData = {
    labels: Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toLocaleDateString('en-US', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Created',
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 20) + 5),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6' + '20',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 18) + 3),
        borderColor: '#10b981',
        backgroundColor: '#10b981' + '20',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Cost analysis data
  const totalCost = workOrders.reduce((acc, wo) => {
    if (wo.cost && typeof wo.cost === 'object') {
      return acc + (wo.cost.total || 0);
    }
    return acc;
  }, 0);

  const avgCostPerOrder = totalOrders > 0 ? totalCost / totalOrders : 0;

  return (
    <div className={glassCardClass}>
      <div className="space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={glassCardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{completionRate}%</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+5.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className={glassCardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                  <p className="text-2xl font-bold">{avgCompletionTime.toFixed(1)}h</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">-12% faster</span>
              </div>
            </CardContent>
          </Card>

          <Card className={glassCardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue Orders</p>
                  <p className="text-2xl font-bold">{overdueOrders}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">-3 from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className={glassCardClass}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cost per Order</p>
                  <p className="text-2xl font-bold">${avgCostPerOrder.toFixed(0)}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-orange-600" />
                <span className="text-xs text-orange-600">+8% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <EnhancedChart
            title="Work Orders by Priority"
            description="Distribution of work orders by priority level"
            type="pie"
            data={priorityData}
            height={300}
            preset="dashboard"
            colorScheme="financial"
            animation="bounce"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />

          {/* Status Distribution */}
          <EnhancedChart
            title="Status Distribution"
            description="Current status of all work orders"
            type="bar"
            data={statusData}
            height={300}
            preset="financial"
            colorScheme="financial"
            animation="slide"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />

          {/* Monthly Trends */}
          <EnhancedChart
            title="Monthly Work Order Trends"
            description="Created vs completed work orders over the last 6 months"
            type="area"
            data={monthlyData}
            height={300}
            className="lg:col-span-2"
            preset="analytics"
            colorScheme="gradient"
            animation="fade"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Technician Performance */}
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['John Smith', 'Mike Johnson', 'Sarah Wilson', 'Emergency Team'].map((tech, index) => (
                  <div key={tech} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">{tech}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{Math.floor(Math.random() * 10) + 5} orders</Badge>
                      <span className="text-xs text-green-600">{95 - index * 2}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Analysis */}
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Most Serviced Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Centrifugal Pump P-001', orders: 8 },
                  { name: 'Emergency Generator G-001', orders: 6 },
                  { name: 'HVAC Unit 12', orders: 4 },
                  { name: 'Butterfly Valve BV-101', orders: 3 }
                ].map((equipment) => (
                  <div key={equipment.name} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">{equipment.name}</span>
                    <Badge variant="outline">{equipment.orders} orders</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className={glassCardClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workOrders.slice(0, 4).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <div>
                      <p className="text-sm font-medium">{order.title}</p>
                      <p className="text-xs text-muted-foreground">{order.dueDate}</p>
                    </div>
                    <Badge
                      className={
                        new Date(order.dueDate) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {new Date(order.dueDate) < new Date() ? 'Overdue' : 'Due Soon'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
