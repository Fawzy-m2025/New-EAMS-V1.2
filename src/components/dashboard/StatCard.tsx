import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  return (
    <Card className={cn(glassCardClass, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div
            className="p-2 rounded-lg transition-all duration-200"
            style={{ backgroundColor: themeClasses.accent }}
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold" style={{ color: themeClasses.primary }}>
            {value}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive
                ? "text-green-600 bg-green-100 dark:bg-green-900/20"
                : "text-red-600 bg-red-100 dark:bg-red-900/20"
            )}>
              {trend.isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
