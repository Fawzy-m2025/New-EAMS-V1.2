import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedChart } from '@/components/charts/EnhancedChart';
import {
  Download, Filter, RefreshCw, TrendingUp, BarChart3,
  Activity, Target, Clock, Users, AlertTriangle, CheckCircle
} from 'lucide-react';
import type { WorkOrder } from '@/types/eams';
import { useAssetContext } from '@/contexts/AssetContext';
import { vibrationHistory } from '@/utils/enhancedMLPipelineData';

interface AdvancedStatisticalChartsProps {
  workOrders: WorkOrder[];
}

interface ChartData {
  name: string;
  value: number;
  percentage?: number;
  trend?: number;
  category?: string;
  [key: string]: any;
}

export function AdvancedStatisticalCharts({ workOrders }: AdvancedStatisticalChartsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('3M');
  const [selectedChart, setSelectedChart] = useState('completion-rates');

  // Advanced data processing functions
  const calculateCompletionRates = () => {
    const statusCounts = workOrders.reduce((acc, wo) => {
      acc[wo.status] = (acc[wo.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('-', ' ').toUpperCase(),
      value: count,
      percentage: Math.round((count / workOrders.length) * 100)
    }));

    return {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Work Orders by Status',
        data: data.map(item => item.value),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
      }],
    };
  };

  const calculateAssetUtilization = () => {
    const assetData = workOrders.reduce((acc, wo) => {
      const asset = wo.equipmentName || 'Unknown';
      if (!acc[asset]) {
        acc[asset] = { count: 0, totalHours: 0, avgCost: 0 };
      }
      acc[asset].count += 1;
      acc[asset].totalHours += wo.actualHours || wo.estimatedHours;
      acc[asset].avgCost += (typeof wo.cost === 'object' ? wo.cost.total : wo.cost || 0);
      return acc;
    }, {} as Record<string, any>);

    const data = Object.entries(assetData)
      .map(([asset, data]) => ({
        name: asset.substring(0, 20) + (asset.length > 20 ? '...' : ''),
        value: data.count,
        workOrders: data.count,
        totalHours: Math.round(data.totalHours),
        avgCost: Math.round(data.avgCost / data.count),
        utilization: Math.min(Math.round((data.totalHours / 168) * 100), 100)
      }))
      .sort((a, b) => b.workOrders - a.workOrders)
      .slice(0, 10);

    return {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Asset Utilization',
        data: data.map(item => item.utilization),
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  };

  const calculateProcessingTimes = () => {
    const completedOrders = workOrders.filter(wo => wo.actualHours);
    const timeRanges = ['0-2h', '2-4h', '4-8h', '8-16h', '16h+'];

    const data = timeRanges.map(range => {
      let count = 0;
      const [min, max] = range === '16h+' ? [16, Infinity] :
        range.split('-').map(h => parseFloat(h.replace('h', '')));

      completedOrders.forEach(wo => {
        const hours = wo.actualHours!;
        if (hours >= min && hours < max) count++;
      });

      return {
        name: range,
        value: count,
        percentage: Math.round((count / completedOrders.length) * 100)
      };
    });

    return {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Processing Time Distribution',
        data: data.map(item => item.value),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
      }],
    };
  };

  const calculatePriorityTrends = () => {
    const priorities = ['low', 'medium', 'high', 'critical', 'emergency'];

    const data = priorities.map(priority => {
      const count = workOrders.filter(wo => wo.priority === priority).length;
      const completed = workOrders.filter(wo =>
        wo.priority === priority && wo.status === 'completed'
      ).length;

      return {
        name: priority.toUpperCase(),
        value: count,
        total: count,
        completed: completed,
        completionRate: count > 0 ? Math.round((completed / count) * 100) : 0
      };
    });

    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Total Orders',
          data: data.map(item => item.total),
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Completed Orders',
          data: data.map(item => item.completed),
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          borderWidth: 2,
          borderRadius: 6,
        }
      ],
    };
  };

  const calculateCostAnalysis = () => {
    const monthlyData = workOrders.reduce((acc, wo) => {
      const date = new Date(wo.createdDate);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const cost = typeof wo.cost === 'object' ? wo.cost.total : wo.cost || 0;

      if (!acc[month]) {
        acc[month] = { labor: 0, parts: 0, external: 0, total: 0, count: 0 };
      }

      if (typeof wo.cost === 'object') {
        acc[month].labor += wo.cost.labor || 0;
        acc[month].parts += wo.cost.parts || 0;
        acc[month].external += wo.cost.external || 0;
      }
      acc[month].total += cost;
      acc[month].count += 1;

      return acc;
    }, {} as Record<string, any>);

    const data = Object.entries(monthlyData).map(([month, data]) => ({
      name: month,
      value: Math.round(data.total),
      Labor: Math.round(data.labor),
      Parts: Math.round(data.parts),
      External: Math.round(data.external),
      Total: Math.round(data.total),
      avgCost: Math.round(data.total / data.count)
    }));

    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Labor',
          data: data.map(item => item.Labor),
          backgroundColor: '#3b82f6' + '20',
          borderColor: '#3b82f6',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Parts',
          data: data.map(item => item.Parts),
          backgroundColor: '#10b981' + '20',
          borderColor: '#10b981',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'External',
          data: data.map(item => item.External),
          backgroundColor: '#f59e0b' + '20',
          borderColor: '#f59e0b',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        }
      ],
    };
  };

  const calculateEfficiencyMetrics = () => {
    const data = [
      {
        name: 'On-Time Completion',
        value: 87,
        target: 95,
        actual: 87,
        variance: -8
      },
      {
        name: 'First-Pass Yield',
        value: 92,
        target: 90,
        actual: 92,
        variance: 2
      },
      {
        name: 'Resource Utilization',
        value: 85,
        target: 80,
        actual: 85,
        variance: 5
      },
      {
        name: 'Cost Variance',
        value: -5,
        target: 0,
        actual: -5,
        variance: -5
      },
      {
        name: 'Response Time',
        value: 94,
        target: 100,
        actual: 94,
        variance: -6
      }
    ];

    return {
      labels: data.map(item => item.name),
      datasets: [
        {
          label: 'Actual',
          data: data.map(item => item.actual),
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: 'Target',
          data: data.map(item => item.target),
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderDash: [5, 5],
          borderRadius: 6,
        }
      ],
    };
  };

  const handleExportChart = () => {
    // Export functionality will be handled by EnhancedChart
    console.log('Exporting chart data...');
  };

  const renderChartByType = () => {
    switch (selectedChart) {
      case 'completion-rates':
        return (
          <EnhancedChart
            title="Work Order Completion Rates"
            description="Distribution of work orders by completion status"
            type="pie"
            data={calculateCompletionRates()}
            height={400}
            preset="dashboard"
            colorScheme="financial"
            animation="bounce"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      case 'asset-utilization':
        return (
          <EnhancedChart
            title="Asset Utilization Analysis"
            description="Top 10 assets by work order frequency and utilization"
            type="bar"
            data={calculateAssetUtilization()}
            height={400}
            preset="analytics"
            colorScheme="financial"
            animation="slide"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      case 'processing-times':
        return (
          <EnhancedChart
            title="Processing Time Distribution"
            description="Distribution of work order completion times"
            type="bar"
            data={calculateProcessingTimes()}
            height={400}
            preset="financial"
            colorScheme="gradient"
            animation="zoom"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      case 'priority-trends':
        return (
          <EnhancedChart
            title="Priority Level Analysis"
            description="Work orders by priority level and completion rates"
            type="bar"
            data={calculatePriorityTrends()}
            height={400}
            preset="presentation"
            colorScheme="vibrant"
            animation="flip"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      case 'cost-analysis':
        return (
          <EnhancedChart
            title="Monthly Cost Analysis"
            description="Breakdown of maintenance costs by category over time"
            type="area"
            data={calculateCostAnalysis()}
            height={400}
            preset="analytics"
            colorScheme="gradient"
            animation="fade"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      case 'efficiency-metrics':
        return (
          <EnhancedChart
            title="Efficiency Metrics vs Targets"
            description="Key performance indicators compared to targets"
            type="bar"
            data={calculateEfficiencyMetrics()}
            height={400}
            preset="financial"
            colorScheme="financial"
            animation="slide"
            showControls={true}
            showLegend={true}
            interactive={true}
            exportable={true}
            refreshable={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Advanced Statistical Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive analytics and insights for maintenance operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportChart}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Time Range:</span>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="6M">6 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chart Type:</span>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completion-rates">Completion Rates</SelectItem>
                <SelectItem value="asset-utilization">Asset Utilization</SelectItem>
                <SelectItem value="processing-times">Processing Times</SelectItem>
                <SelectItem value="priority-trends">Priority Trends</SelectItem>
                <SelectItem value="cost-analysis">Cost Analysis</SelectItem>
                <SelectItem value="efficiency-metrics">Efficiency Metrics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {renderChartByType()}
      </CardContent>
    </Card>
  );
}
