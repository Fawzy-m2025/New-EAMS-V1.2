import { useEffect, useState } from "react";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface DonutChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  className?: string;
  height?: number;
}

export function DonutChart({
  title,
  description,
  data,
  className,
  height = 300,
}: DonutChartProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  // Transform data for Chart.js format
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [{
      label: title,
      data: data.map(item => item.value),
      backgroundColor: data.map(item => item.color),
      borderColor: data.map(item => item.color + '80'),
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
      className={className}
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
