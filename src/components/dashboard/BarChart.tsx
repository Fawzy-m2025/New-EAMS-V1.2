import { useEffect, useState } from "react";
import { EnhancedChart } from "@/components/charts/EnhancedChart";
import { cn } from "@/lib/utils";
import { useThemeColors } from "@/hooks/use-theme-colors";

interface BarChartProps {
  title: string;
  description?: string;
  data: Array<{
    name: string;
    category?: string;
    value?: number;
    [key: string]: number | string | undefined;
  }>;
  categories: Array<{
    name: string;
    color: string;
  }>;
  className?: string;
  height?: number;
}

export function BarChart({
  title,
  description,
  data,
  categories,
  className,
  height = 300,
}: BarChartProps) {
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
      borderRadius: 6,
    })),
  };

  return (
    <EnhancedChart
      title={title}
      description={description}
      type="bar"
      data={chartData}
      height={height}
      className={className}
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
}
