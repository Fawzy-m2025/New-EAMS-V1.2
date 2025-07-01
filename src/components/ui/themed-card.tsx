import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';

interface ThemedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated' | 'gradient';
  hover?: boolean;
}

export function ThemedCard({
  children,
  className,
  variant = 'default',
  hover = true
}: ThemedCardProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return cn(
          'backdrop-blur-xl border-0 shadow-2xl transition-all duration-300',
          hover && 'hover:scale-[1.02] hover:shadow-2xl'
        );
      case 'elevated':
        return cn(
          'shadow-lg border transition-all duration-300',
          hover && 'hover:shadow-xl hover:-translate-y-1'
        );
      case 'gradient':
        return cn(
          'border-0 shadow-lg transition-all duration-300',
          hover && 'hover:shadow-xl hover:scale-[1.02]'
        );
      default:
        return cn(
          'border transition-all duration-300',
          hover && 'hover:shadow-md'
        );
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: themeClasses.glassBg,
          borderColor: 'hsl(var(--primary))',
        };
      case 'elevated':
        return {
          background: themeClasses.cardBg,
          borderColor: 'hsl(var(--primary))',
        };
      case 'gradient':
        return {
          background: themeClasses.gradient,
          color: 'white',
        };
      default:
        return {
          borderColor: 'hsl(var(--primary))',
        };
    }
  };

  return (
    <Card
      className={cn(getVariantClasses(), className)}
      style={getVariantStyles()}
    >
      {children}
    </Card>
  );
}

// Export themed versions of card components
export function ThemedCardHeader({ children, className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader className={cn(className)} {...props}>
      {children}
    </CardHeader>
  );
}

export function ThemedCardTitle({ children, className, ...props }: React.ComponentProps<typeof CardTitle>) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  return (
    <CardTitle
      className={cn('gradient-text', className)}
      style={{ color: themeClasses.primary }}
      {...props}
    >
      {children}
    </CardTitle>
  );
}

export function ThemedCardDescription({ children, className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription className={cn(className)} {...props}>
      {children}
    </CardDescription>
  );
}

export function ThemedCardContent({ children, className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent className={cn(className)} {...props}>
      {children}
    </CardContent>
  );
}
