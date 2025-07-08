import { useEffect, useState } from "react";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface ThemedDonutChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  className?: string;
  height?: number;
}

export function ThemedDonutChart({
  title,
  description,
  data,
  className,
  height = 300,
}: ThemedDonutChartProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  // Transform data for Chart.js format
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      label: title,
      data: data.map(item => item.value),
      backgroundColor: data.map((item, index) =>
        item.color || (index === 0 ? themeClasses.primary : `hsl(${262 + (index * 30)} 83% ${58 + (index * 10)}%)`)
      ),
      borderColor: data.map((item, index) =>
        (item.color || (index === 0 ? themeClasses.primary : `hsl(${262 + (index * 30)} 83% ${58 + (index * 10)}%)`)) + '80'
      ),
      borderWidth: 2,
    }],
  };

  return (
    <EnhancedChart
      title={title}
      description={description}
      type="doughnut"
      data={chartData}
      height={height}
      className={cn("glass-card", className)}
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
}
