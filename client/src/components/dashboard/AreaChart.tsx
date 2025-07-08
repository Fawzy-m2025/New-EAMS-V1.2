import { useEffect, useState } from "react";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface AreaChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    [key: string]: number | string;
  }>;
  categories: Array<{
    name: string;
    color: string;
  }>;
  className?: string;
  height?: number;
}

export function AreaChart({
  title,
  description,
  data,
  categories,
  className,
  height = 300,
}: AreaChartProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  // Transform data for Chart.js format
  const chartData = {
    labels: data.map(item => item.name),
    datasets: categories.map((category, index) => ({
      label: category.name,
      data: data.map(item => item[category.name] as number || 0),
      backgroundColor: category.color + '20',
      borderColor: category.color,
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    })),
  };

  return (
    <EnhancedChart
      title={title}
      description={description}
      type="area"
      data={chartData}
      height={height}
      className={className}
      preset="financial"
      colorScheme="gradient"
      animation="fade"
      showControls={true}
      showLegend={true}
      interactive={true}
      exportable={true}
      refreshable={true}
    />
  );
}
