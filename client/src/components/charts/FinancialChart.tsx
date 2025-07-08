import React, { useMemo } from 'react';
import { EnhancedChart } from './EnhancedChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useThemeColors } from '@/hooks/use-theme-colors';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Target,
  Zap,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialDataPoint {
  label: string;
  value: number;
  change?: number;
  changePercent?: number;
  target?: number;
  category?: string;
}

interface FinancialChartProps {
  title: string;
  description?: string;
  data: FinancialDataPoint[];
  type: 'line' | 'bar' | 'area' | 'doughnut' | 'pie';
  height?: number;
  className?: string;
  showTarget?: boolean;
  showChange?: boolean;
  showPercentage?: boolean;
  currency?: string;
  format?: 'currency' | 'number' | 'percentage';
  targetValue?: number;
  onDataPointClick?: (dataPoint: FinancialDataPoint) => void;
}

export function FinancialChart({
  title,
  description,
  data,
  type,
  height = 400,
  className,
  showTarget = false,
  showChange = true,
  showPercentage = false,
  currency = 'USD',
  format = 'currency',
  targetValue,
  onDataPointClick,
}: FinancialChartProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  // Calculate summary metrics
  const summary = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const avg = total / data.length;
    const max = Math.max(...data.map(item => item.value));
    const min = Math.min(...data.map(item => item.value));

    // Calculate overall change if available
    const changes = data.filter(item => item.change !== undefined).map(item => item.change!);
    const totalChange = changes.length > 0 ? changes.reduce((sum, change) => sum + change, 0) : 0;
    const avgChangePercent = changes.length > 0 ? (totalChange / total) * 100 : 0;

    return {
      total,
      avg,
      max,
      min,
      totalChange,
      avgChangePercent,
      isPositive: totalChange >= 0,
    };
  }, [data]);

  // Format value based on format type
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (type === 'doughnut' || type === 'pie') {
      return {
        labels: data.map(item => item.label),
        datasets: [{
          label: title,
          data: data.map(item => item.value),
          backgroundColor: [
            themeClasses.primary,
            themeClasses.chart,
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      };
    }

    return {
      labels: data.map(item => item.label),
      datasets: [
        {
          label: title,
          data: data.map(item => item.value),
          borderColor: themeClasses.primary,
          backgroundColor: themeClasses.primary + '20',
          fill: type === 'area',
          tension: 0.4,
        },
        ...(showTarget && targetValue ? [{
          label: 'Target',
          data: data.map(() => targetValue),
          borderColor: '#ef4444',
          backgroundColor: '#ef4444' + '20',
          borderDash: [5, 5],
          fill: false,
          tension: 0,
        }] : []),
      ],
    };
  }, [data, type, title, themeClasses, showTarget, targetValue]);

  // Custom options for financial charts
  const customOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const dataPoint = data[context.dataIndex];
            let label = `${context.dataset.label}: ${formatValue(context.parsed.y)}`;

            if (dataPoint.change !== undefined && showChange) {
              const changeText = dataPoint.change >= 0 ? '+' : '';
              label += ` (${changeText}${formatValue(dataPoint.change)})`;
            }

            if (dataPoint.changePercent !== undefined && showPercentage) {
              const percentText = dataPoint.changePercent >= 0 ? '+' : '';
              label += ` (${percentText}${dataPoint.changePercent.toFixed(1)}%)`;
            }

            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatValue(value);
          },
        },
      },
    },
  };

  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: themeClasses.primary + '20' }}>
              {type === 'line' && <LineChart className="h-4 w-4" style={{ color: themeClasses.primary }} />}
              {type === 'bar' && <BarChart3 className="h-4 w-4" style={{ color: themeClasses.primary }} />}
              {type === 'area' && <Activity className="h-4 w-4" style={{ color: themeClasses.primary }} />}
              {type === 'doughnut' && <PieChart className="h-4 w-4" style={{ color: themeClasses.primary }} />}
              {type === 'pie' && <PieChart className="h-4 w-4" style={{ color: themeClasses.primary }} />}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                summary.isPositive ? "border-green-200 text-green-700" : "border-red-200 text-red-700"
              )}
            >
              {summary.isPositive ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatValue(summary.totalChange)}
            </Badge>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold">{formatValue(summary.total)}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold">{formatValue(summary.avg)}</div>
            <div className="text-xs text-muted-foreground">Average</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold">{formatValue(summary.max)}</div>
            <div className="text-xs text-muted-foreground">Maximum</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-2xl font-bold">{formatValue(summary.min)}</div>
            <div className="text-xs text-muted-foreground">Minimum</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <EnhancedChart
          title=""
          type={type}
          data={chartData}
          height={height}
          preset="financial"
          colorScheme="financial"
          animation="fade"
          showControls={false}
          showLegend={true}
          interactive={true}
          exportable={true}
          refreshable={true}
          customOptions={customOptions}
          onDataPointClick={(dataPoint) => {
            if (onDataPointClick && data[dataPoint.index]) {
              onDataPointClick(data[dataPoint.index]);
            }
          }}
        />
      </CardContent>
    </Card>
  );
} 