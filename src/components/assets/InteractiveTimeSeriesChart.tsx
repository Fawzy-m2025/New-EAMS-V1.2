import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TimeSeriesDataPoint {
  date: string;
  utilization: number;
  efficiency: number;
  availability: number;
  mtbf: number;
  mttr: number;
  oee: number;
}

interface InteractiveTimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  description?: string;
}

export function InteractiveTimeSeriesChart({
  data,
  title,
  description
}: InteractiveTimeSeriesChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<keyof Omit<TimeSeriesDataPoint, 'date'>>('utilization');
  const [timeRange, setTimeRange] = useState('3M');

  const metrics = [
    { value: 'utilization', label: 'Utilization Rate (%)', color: '#3b82f6', target: 85 },
    { value: 'efficiency', label: 'Efficiency (%)', color: '#10b981', target: 90 },
    { value: 'availability', label: 'Availability (%)', color: '#8b5cf6', target: 95 },
    { value: 'mtbf', label: 'MTBF (hours)', color: '#f59e0b', target: 2000 },
    { value: 'mttr', label: 'MTTR (hours)', color: '#ef4444', target: 4 },
    { value: 'oee', label: 'OEE (%)', color: '#06b6d4', target: 80 }
  ];

  const selectedMetricConfig = metrics.find(m => m.value === selectedMetric);

  const filterDataByTimeRange = (data: TimeSeriesDataPoint[]) => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return data;
    }

    return data.filter(point => new Date(point.date) >= cutoffDate);
  };

  const filteredData = filterDataByTimeRange(data);
  const currentValue = filteredData[filteredData.length - 1]?.[selectedMetric] || 0;
  const previousValue = filteredData[filteredData.length - 2]?.[selectedMetric] || 0;
  const trend = currentValue - previousValue;
  const trendPercentage = previousValue ? ((trend / previousValue) * 100) : 0;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';

  // Transform data for Chart.js format
  const chartData = {
    labels: filteredData.map(item => item.date),
    datasets: [
      {
        label: selectedMetricConfig?.label || selectedMetric,
        data: filteredData.map(item => item[selectedMetric]),
        borderColor: selectedMetricConfig?.color || '#3b82f6',
        backgroundColor: (selectedMetricConfig?.color || '#3b82f6') + '20',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      // Target line
      ...(selectedMetricConfig?.target ? [{
        label: 'Target',
        data: Array(filteredData.length).fill(selectedMetricConfig.target),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      }] : [])
    ],
  };

  const customOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: selectedMetric.includes('mtbf') ? undefined : 100,
        ticks: {
          callback: function (value: any) {
            return value + (selectedMetric.includes('mtbf') || selectedMetric.includes('mttr') ? 'h' : '%');
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return context.dataset.label + ': ' +
              context.parsed.y.toFixed(1) +
              (selectedMetric.includes('mtbf') || selectedMetric.includes('mttr') ? 'h' : '%');
          },
        },
      },
    },
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as any)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1M">1M</SelectItem>
                <SelectItem value="3M">3M</SelectItem>
                <SelectItem value="6M">6M</SelectItem>
                <SelectItem value="1Y">1Y</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current value and trend */}
        <div className="flex items-center gap-4 mt-4">
          <div>
            <div className="text-2xl font-bold" style={{ color: selectedMetricConfig?.color }}>
              {currentValue.toFixed(1)}
              {selectedMetric.includes('mtbf') || selectedMetric.includes('mttr') ? 'h' : '%'}
            </div>
            <div className="text-sm text-muted-foreground">Current {selectedMetricConfig?.label}</div>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {Math.abs(trendPercentage).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs last period</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <EnhancedChart
          title=""
          type="line"
          data={chartData}
          height={400}
          preset="analytics"
          colorScheme="gradient"
          animation="fade"
          showControls={true}
          showLegend={true}
          interactive={true}
          exportable={true}
          refreshable={true}
          customOptions={customOptions}
        />
      </CardContent>
    </Card>
  );
}
