import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { TrendingDown, DollarSign, Calendar, Calculator } from 'lucide-react';

interface DepreciationDataPoint {
  year: number;
  bookValue: number;
  taxValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  marketValue?: number;
}

interface DepreciationChartProps {
  data: DepreciationDataPoint[];
  title: string;
  method: string;
  originalValue: number;
  salvageValue: number;
}

export function DepreciationChart({
  data,
  title,
  method,
  originalValue,
  salvageValue
}: DepreciationChartProps) {
  const currentBookValue = data[data.length - 1]?.bookValue || 0;
  const totalDepreciation = originalValue - currentBookValue;
  const depreciationRate = ((totalDepreciation / originalValue) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      "straight-line": "#3b82f6",
      "declining-balance": "#10b981",
      "sum-of-years": "#8b5cf6",
      "units-of-production": "#f59e0b"
    };
    return colors[method as keyof typeof colors] || "#6b7280";
  };

  // Transform data for Chart.js format
  const chartData = {
    labels: data.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Book Value',
        data: data.map(item => item.bookValue),
        borderColor: getMethodColor(method),
        backgroundColor: getMethodColor(method) + '20',
        borderWidth: 3,
        tension: 0.4,
        type: 'line' as const,
      },
      {
        label: 'Tax Value',
        data: data.map(item => item.taxValue),
        borderColor: '#ef4444',
        backgroundColor: '#ef4444' + '20',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        type: 'line' as const,
      },
      {
        label: 'Market Value',
        data: data.map(item => item.marketValue || 0),
        borderColor: '#22c55e',
        backgroundColor: '#22c55e' + '20',
        borderWidth: 2,
        borderDash: [3, 3],
        tension: 0.4,
        type: 'line' as const,
      },
      {
        label: 'Annual Depreciation',
        data: data.map(item => item.depreciationExpense),
        backgroundColor: getMethodColor(method) + '30',
        borderColor: getMethodColor(method),
        borderWidth: 1,
        type: 'bar' as const,
      }
    ],
  };

  const customOptions = {
    scales: {
      y: {
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
    },
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>Depreciation analysis using {method} method</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentBookValue)}
            </div>
            <Badge variant="secondary">
              {depreciationRate.toFixed(1)}% Depreciated
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Original Value</div>
            <div className="text-lg font-semibold">{formatCurrency(originalValue)}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Book Value</div>
            <div className="text-lg font-semibold text-blue-600">{formatCurrency(currentBookValue)}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Salvage Value</div>
            <div className="text-lg font-semibold">{formatCurrency(salvageValue)}</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Depreciation</div>
            <div className="text-lg font-semibold text-red-600">{formatCurrency(totalDepreciation)}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <EnhancedChart
          title=""
          type="line"
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

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Method Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium capitalize">{method}</span>
              </div>
              <div className="flex justify-between">
                <span>Useful Life:</span>
                <span className="font-medium">{data.length} years</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Rate:</span>
                <span className="font-medium">{(100 / data.length).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Impact
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Tax Savings:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(totalDepreciation * 0.25)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net Book Value:</span>
                <span className="font-medium">{formatCurrency(currentBookValue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Depreciation Rate:</span>
                <span className="font-medium">{depreciationRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span className="font-medium">Year 1</span>
              </div>
              <div className="flex justify-between">
                <span>End Date:</span>
                <span className="font-medium">Year {data.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Life:</span>
                <span className="font-medium">
                  {Math.max(0, data.length - Math.ceil(depreciationRate / (100 / data.length)))} years
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
