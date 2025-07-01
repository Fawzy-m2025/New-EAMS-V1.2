import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';

interface ThemedSelectProps {
  children: React.ReactNode;
  className?: string;
  themeVariant?: 'default' | 'glass';
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ThemedSelect({
  children,
  className,
  themeVariant = 'default',
  ...props
}: ThemedSelectProps) {
  const { getThemeClasses } = useThemeColors();
  const themeClasses = getThemeClasses();

  const getVariantClasses = () => {
    switch (themeVariant) {
      case 'glass':
        return 'backdrop-blur-xl border-0 shadow-lg transition-all duration-300';
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
      default:
        return {
          borderColor: 'hsl(var(--primary))',
        };
    }
  };

  return (
    <Select {...props}>
      <SelectTrigger
        className={cn(getVariantClasses(), className)}
        style={getVariantStyles()}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        className="backdrop-blur-xl border-0"
        style={{
          background: themeClasses.glassBg,
          borderColor: 'hsl(var(--primary))',
        }}
      >
        {children}
      </SelectContent>
    </Select>
  );
}

export { SelectItem as ThemedSelectItem };
