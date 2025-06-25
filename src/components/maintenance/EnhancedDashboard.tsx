import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CinematicKPICarousel } from './CinematicKPICarousel';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import {
  Activity, Users, MapPin, Clock, TrendingUp, BarChart3, Brain,
  Target, Zap, ArrowRight, ChevronRight
} from 'lucide-react';
import type { WorkOrder } from '@/types/eams';

interface EnhancedDashboardProps {
  workOrders: WorkOrder[];
  onNavigateToAnalytics: (tab: string) => void;
}

export function EnhancedDashboard({ workOrders, onNavigateToAnalytics }: EnhancedDashboardProps) {
  // Quick analytics data
  const completionData = [
    { name: 'Jan', completed: 45, pending: 12 },
    { name: 'Feb', completed: 52, pending: 8 },
    { name: 'Mar', completed: 48, pending: 15 },
    { name: 'Apr', completed: 61, pending: 6 },
    { name: 'May', completed: 55, pending: 11 },
    { name: 'Jun', completed: 67, pending: 4 }
  ];

  const priorityData = [
    { name: 'Low', value: 35, color: '#10b981' },
    { name: 'Medium', value: 45, color: '#f59e0b' },
    { name: 'High', value: 15, color: '#ef4444' },
    { name: 'Critical', value: 5, color: '#dc2626' }
  ];

  const utilizationData = [
    { name: 'Mon', utilization: 85 },
    { name: 'Tue', utilization: 92 },
    { name: 'Wed', utilization: 78 },
    { name: 'Thu', utilization: 95 },
    { name: 'Fri', utilization: 88 },
    { name: 'Sat', utilization: 45 },
    { name: 'Sun', utilization: 32 }
  ];

  // Transform data for Chart.js format
  const completionChartData = {
    labels: completionData.map(item => item.name),
    datasets: [
      {
        label: 'Completed',
        data: completionData.map(item => item.completed),
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6' + '30',
        tension: 0.4,
      },
      {
        label: 'Pending',
        data: completionData.map(item => item.pending),
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b' + '30',
        tension: 0.4,
      }
    ],
  };

  const priorityChartData = {
    labels: priorityData.map(item => item.name),
    datasets: [{
      label: 'Priority Distribution',
      data: priorityData.map(item => item.value),
      backgroundColor: priorityData.map(item => item.color),
      borderColor: priorityData.map(item => item.color),
      borderWidth: 2,
    }],
  };

  const utilizationChartData = {
    labels: utilizationData.map(item => item.name),
    datasets: [{
      label: 'Utilization (%)',
      data: utilizationData.map(item => item.utilization),
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      borderWidth: 2,
      borderRadius: 4,
    }],
  };

  const quickStats = [
    {
      title: 'Active Work Orders',
      value: workOrders.filter(wo => wo.status === 'in-progress').length.toString(),
      change: '+12%',
      isPositive: true,
      icon: Activity
    },
    {
      title: 'Available Technicians',
      value: '24',
      change: '+2',
      isPositive: true,
      icon: Users
    },
    {
      title: 'Avg Response Time',
      value: '2.3h',
      change: '-15%',
      isPositive: true,
      icon: Clock
    },
    {
      title: 'Equipment Uptime',
      value: '98.7%',
      change: '+0.3%',
      isPositive: true,
      icon: TrendingUp
    }
  ];

  const analyticsActions = [
    {
      title: 'Advanced Statistics',
      description: 'Deep dive into performance metrics',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500',
      tab: 'advanced-stats'
    },
    {
      title: 'KPI Dashboard',
      description: 'Comprehensive KPI monitoring',
      icon: Target,
      color: 'from-purple-500 to-pink-500',
      tab: 'kpi-dashboard'
    },
    {
      title: 'Statistical Charts',
      description: 'Interactive data visualizations',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      tab: 'statistical-charts'
    },
    {
      title: 'AI Insights',
      description: 'Machine learning predictions',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      tab: 'ai-insights'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Cinematic KPI Carousel */}
      <CinematicKPICarousel workOrders={workOrders} />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={glassCardClass}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <Badge
                    className={`text-xs ${stat.isPositive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Order Completion Trend */}
        <EnhancedChart
          title="Completion Trends"
          description="Monthly work order completion vs pending"
          type="line"
          data={completionChartData}
          height={250}
          preset="analytics"
          colorScheme="gradient"
          animation="fade"
          showControls={false}
          showLegend={true}
          interactive={true}
          exportable={false}
          refreshable={false}
        />

        {/* Priority Distribution */}
        <EnhancedChart
          title="Priority Distribution"
          description="Work orders by priority level"
          type="doughnut"
          data={priorityChartData}
          height={250}
          preset="dashboard"
          colorScheme="vibrant"
          animation="bounce"
          showControls={false}
          showLegend={true}
          interactive={true}
          exportable={false}
          refreshable={false}
        />

        {/* Weekly Utilization */}
        <EnhancedChart
          title="Weekly Utilization"
          description="Technician utilization by day"
          type="bar"
          data={utilizationChartData}
          height={250}
          preset="financial"
          colorScheme="financial"
          animation="slide"
          showControls={false}
          showLegend={true}
          interactive={true}
          exportable={false}
          refreshable={false}
        />
      </div>

      {/* Analytics Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={index}
              className={glassCardClass}
              onClick={() => onNavigateToAnalytics(action.tab)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Explore
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={glassCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Quick Actions</h3>
                <p className="text-sm text-muted-foreground">Common maintenance tasks</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                View Equipment Map
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Assign Technicians
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Activity className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className={glassCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm text-muted-foreground">Key metrics overview</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <span className="font-semibold text-green-600">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <span className="font-semibold text-blue-600">2.3h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <span className="font-semibold text-purple-600">98.7%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={glassCardClass}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Brain className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Predictive analytics</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-800">Predictive Alert</div>
                <div className="text-xs text-orange-600">Pump #3 may need maintenance in 7 days</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Optimization</div>
                <div className="text-xs text-blue-600">Schedule optimization can save 15% time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
