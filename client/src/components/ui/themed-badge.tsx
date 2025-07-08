import React from 'react';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';

interface ThemedBadgeProps extends BadgeProps {
  themeVariant?: 'primary' | 'secondary' | 'glass' | 'gradient';
}

export function ThemedBadge({
  className,
  themeVariant = 'primary',
  children,
  ...props
}: ThemedBadgeProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  const getThemedClasses = () => {
    switch (themeVariant) {
      case 'primary':
        return 'transition-all duration-200 hover:scale-105';
      case 'secondary':
        return 'border transition-all duration-200 hover:scale-105';
      case 'glass':
        return 'backdrop-blur-xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105';
      case 'gradient':
        return 'text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105';
      default:
        return '';
    }
  };

  const getThemedStyles = () => {
    switch (themeVariant) {
      case 'primary':
        return {
          backgroundColor: themeClasses.badgePrimary,
          color: themeClasses.primary,
        };
      case 'secondary':
        return {
          backgroundColor: themeClasses.accent,
          borderColor: 'hsl(var(--primary))',
          color: themeClasses.primary,
        };
      case 'glass':
        return {
          background: themeClasses.glassBg,
          borderColor: 'hsl(var(--primary))',
          color: themeClasses.primary,
        };
      case 'gradient':
        return {
          background: themeClasses.gradient,
        };
      default:
        return {};
    }
  };

  return (
    <Badge
      className={cn(getThemedClasses(), className)}
      style={getThemedStyles()}
      {...props}
    >
      {children}
    </Badge>
  );
}
