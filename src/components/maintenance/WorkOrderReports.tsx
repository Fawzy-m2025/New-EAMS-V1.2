import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Download, FileText, Calendar, Filter, TrendingUp,
  BarChart3, PieChart, Users, Clock, DollarSign
} from 'lucide-react';
import type { WorkOrder } from '@/types/eams';

interface WorkOrderReportsProps {
  workOrders: WorkOrder[];
}

export function WorkOrderReports({ workOrders }: WorkOrderReportsProps) {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('last-30-days');

  const generateReport = (type: string) => {
    console.log(`Generating ${type} report for ${dateRange}`);
    // In a real app, this would generate and download the report
  };

  const reportTemplates = [
    {
      id: 'summary',
      title: 'Work Order Summary',
      description: 'Comprehensive overview of all work orders',
      icon: <FileText className="h-5 w-5" />,
      metrics: ['Total Orders', 'Completion Rate', 'Avg Time', 'Cost Analysis']
    },
    {
      id: 'performance',
      title: 'Performance Report',
      description: 'Technician and equipment performance metrics',
      icon: <TrendingUp className="h-5 w-5" />,
      metrics: ['Technician KPIs', 'Equipment Reliability', 'Efficiency Trends']
    },
    {
      id: 'financial',
      title: 'Financial Analysis',
      description: 'Cost breakdown and budget analysis',
      icon: <DollarSign className="h-5 w-5" />,
      metrics: ['Labor Costs', 'Parts Costs', 'Budget Variance', 'ROI']
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Regulatory and safety compliance tracking',
      icon: <BarChart3 className="h-5 w-5" />,
      metrics: ['Safety Metrics', 'Audit Trail', 'Regulatory Status']
    }
  ];

  const quickStats = [
    {
      label: 'Reports Generated',
      value: '247',
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Avg Report Time',
      value: '2.3s',
      change: '-15%',
      trend: 'down'
    },
    {
      label: 'Data Accuracy',
      value: '99.8%',
      change: '+0.2%',
      trend: 'up'
    },
    {
      label: 'Export Success',
      value: '100%',
      change: '0%',
      trend: 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Work Order Summary</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="compliance">Compliance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button className="hover-scale" onClick={() => generateReport(reportType)}>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat) => (
              <div key={stat.label} className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{stat.value}</span>
                  <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' :
                    stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTemplates.map((template) => (
          <Card key={template.id} className={`${glassCardClass} hover:shadow-lg transition-all duration-200`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {template.icon}
                {template.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {template.metrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport(template.id)}
                    className="flex-1 hover-scale"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => generateReport(template.id)}
                    className="flex-1 hover-scale"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Monthly Work Order Summary - December 2024', type: 'Summary', date: '2024-12-15', size: '2.4 MB' },
              { name: 'Technician Performance Q4 2024', type: 'Performance', date: '2024-12-10', size: '1.8 MB' },
              { name: 'Equipment Maintenance Costs - November', type: 'Financial', date: '2024-12-05', size: '3.1 MB' },
              { name: 'Safety Compliance Report - Q4', type: 'Compliance', date: '2024-12-01', size: '1.2 MB' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{report.name}</h4>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{report.type}</span>
                    <span>{report.date}</span>
                    <span>{report.size}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
