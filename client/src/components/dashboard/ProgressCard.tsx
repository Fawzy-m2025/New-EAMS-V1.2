import { Card, CardContent, CardHeader, CardTitle, glassCardClass } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  currentValue: number;
  maxValue: number;
  prefix?: string;
  suffix?: string;
  color?: string;
  className?: string;
}

export function ProgressCard({
  title,
  currentValue,
  maxValue,
  prefix = "",
  suffix = "",
  color,
  className,
}: ProgressCardProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();
  const percentage = Math.round((currentValue / maxValue) * 100);

  return (
    <Card className={cn(glassCardClass, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span
            className="text-lg font-bold"
            style={{ color: themeClasses.primary }}
          >
            {prefix}{currentValue.toLocaleString()}{suffix}
          </span>
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          className="h-2"
          style={{
            backgroundColor: `${themeClasses.accent}`,
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{prefix}{maxValue.toLocaleString()}{suffix}</span>
        </div>
      </CardContent>
    </Card>
  );
}
