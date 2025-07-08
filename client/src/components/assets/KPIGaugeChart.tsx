
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KPIGaugeChartProps {
  title: string;
  value: number;
  maxValue: number;
  unit: string;
  target?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function KPIGaugeChart({
  title,
  value,
  maxValue,
  unit,
  target,
  color = '#3b82f6',
  size = 'md',
  className
}: KPIGaugeChartProps) {
  const percentage = (value / maxValue) * 100;
  const targetPercentage = target ? (target / maxValue) * 100 : undefined;
  
  const sizes = {
    sm: { width: 120, height: 120, strokeWidth: 8 },
    md: { width: 160, height: 160, strokeWidth: 12 },
    lg: { width: 200, height: 200, strokeWidth: 16 }
  };
  
  const { width, height, strokeWidth } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getStatusColor = () => {
    if (target) {
      if (value >= target) return '#22c55e';
      if (value >= target * 0.8) return '#eab308';
      return '#ef4444';
    }
    return color;
  };

  const getStatusText = () => {
    if (!target) return 'On Track';
    if (value >= target) return 'Target Met';
    if (value >= target * 0.8) return 'Near Target';
    return 'Below Target';
  };

  return (
    <Card className={cn("text-center", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">
          {target && `Target: ${target}${unit}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative inline-flex items-center justify-center">
          <svg
            width={width}
            height={height}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Progress circle */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={radius}
              stroke={getStatusColor()}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Target indicator */}
            {targetPercentage && (
              <circle
                cx={width / 2 + radius * Math.cos((targetPercentage / 100) * 2 * Math.PI - Math.PI / 2)}
                cy={height / 2 + radius * Math.sin((targetPercentage / 100) * 2 * Math.PI - Math.PI / 2)}
                r={4}
                fill="#ef4444"
                className="animate-pulse"
              />
            )}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: getStatusColor() }}>
              {value.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">{unit}</span>
            <span className="text-xs font-medium mt-1">
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ backgroundColor: `${getStatusColor()}20`, color: getStatusColor() }}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
