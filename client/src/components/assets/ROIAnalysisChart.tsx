import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

interface ROIDataPoint {
  year: string;
  cumulativeInvestment: number;
  cumulativeSavings: number;
  netCashFlow: number;
  roi: number;
}

interface ROIAnalysisChartProps {
  data: ROIDataPoint[];
  title?: string;
  description?: string;
}

export function ROIAnalysisChart({
  data,
  title = "ROI Analysis",
  description = "Return on investment analysis over time"
}: ROIAnalysisChartProps) {
  // Transform data for Chart.js format
  const chartData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Cumulative Investment',
        data: data.map(item => item.cumulativeInvestment),
        backgroundColor: '#ef4444' + '20',
        borderColor: '#ef4444',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Cumulative Savings',
        data: data.map(item => item.cumulativeSavings),
        backgroundColor: '#22c55e' + '20',
        borderColor: '#22c55e',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Net Cash Flow',
        data: data.map(item => item.netCashFlow),
        backgroundColor: '#3b82f6' + '20',
        borderColor: '#3b82f6',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'ROI %',
        data: data.map(item => item.roi),
        backgroundColor: '#f59e0b' + '20',
        borderColor: '#f59e0b',
        borderWidth: 2,
        yAxisID: 'y1',
        type: 'line' as const,
      }
    ],
  };

  const customOptions = {
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Amount ($)',
        },
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'ROI (%)',
        },
        ticks: {
          callback: function (value: any) {
            return value + '%';
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Calculate summary metrics
  const totalInvestment = data[data.length - 1]?.cumulativeInvestment || 0;
  const totalSavings = data[data.length - 1]?.cumulativeSavings || 0;
  const netROI = data[data.length - 1]?.roi || 0;
  const paybackPeriod = data.find(item => item.netCashFlow >= 0)?.year || 'N/A';

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-800">
              <TrendingUp className="h-3 w-3 mr-1" />
              ROI: {netROI.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalInvestment)}
            </div>
            <div className="text-xs text-muted-foreground">Total Investment</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalSavings)}
            </div>
            <div className="text-xs text-muted-foreground">Total Savings</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalSavings - totalInvestment)}
            </div>
            <div className="text-xs text-muted-foreground">Net Benefit</div>
          </div>

          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold text-orange-600">
              {paybackPeriod}
            </div>
            <div className="text-xs text-muted-foreground">Payback Period</div>
          </div>
        </div>

        {/* Chart */}
        <EnhancedChart
          title=""
          type="bar"
          data={chartData}
          height={400}
          preset="financial"
          colorScheme="financial"
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
