
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends ButtonProps {
  themeVariant?: 'primary' | 'secondary' | 'gradient' | 'glass';
}

export function ThemedButton({ 
  className, 
  themeVariant = 'primary',
  variant,
  children,
  ...props 
}: ThemedButtonProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  const getThemedClasses = () => {
    switch (themeVariant) {
      case 'primary':
        return 'transition-all duration-200 hover:scale-105';
      case 'secondary':
        return cn(
          'border transition-all duration-200 hover:scale-105',
        );
      case 'gradient':
        return 'text-white border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105';
      case 'glass':
        return 'backdrop-blur-xl border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105';
      default:
        return '';
    }
  };

  const getThemedStyles = () => {
    switch (themeVariant) {
      case 'primary':
        return {
          backgroundColor: themeClasses.buttonPrimary,
          color: themeClasses.primaryForeground,
        };
      case 'secondary':
        return {
          backgroundColor: themeClasses.buttonSecondary,
          borderColor: themeClasses.cardBorder,
          color: themeClasses.primary,
        };
      case 'gradient':
        return {
          background: themeClasses.gradient,
        };
      case 'glass':
        return {
          background: themeClasses.glassBg,
          borderColor: themeClasses.glassBorder,
          color: themeClasses.primary,
        };
      default:
        return {};
    }
  };

  return (
    <Button
      variant={variant}
      className={cn(getThemedClasses(), className)}
      style={getThemedStyles()}
      {...props}
    >
      {children}
    </Button>
  );
}
