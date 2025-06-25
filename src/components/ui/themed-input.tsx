import React from 'react';
import { Input } from '@/components/ui/input';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';

interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  themeVariant?: 'default' | 'glass' | 'outline';
}

export function ThemedInput({
  className,
  themeVariant = 'default',
  ...props
}: ThemedInputProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  const getVariantClasses = () => {
    switch (themeVariant) {
      case 'glass':
        return 'backdrop-blur-xl border-0 shadow-lg transition-all duration-300 focus:shadow-xl';
      case 'outline':
        return 'border-2 transition-all duration-300 focus:shadow-lg';
      default:
        return 'transition-all duration-300';
    }
  };

  const getVariantStyles = () => {
    switch (themeVariant) {
      case 'glass':
        return {
          background: themeClasses.glassBg,
          borderColor: 'hsl(var(--primary))',
        };
      case 'outline':
        return {
          borderColor: 'hsl(var(--primary))',
          '--ring': themeClasses.ring,
        };
      default:
        return {
          borderColor: 'hsl(var(--primary))',
          '--ring': themeClasses.ring,
        };
    }
  };

  return (
    <Input
      className={cn(getVariantClasses(), 'focus:ring-[--ring]', className)}
      style={getVariantStyles()}
      {...props}
    />
  );
}
