
import React from 'react';
import { Check, Palette, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useThemeColors, defaultColors, ThemeColor } from '@/hooks/use-theme-colors';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { selectedColor, setSelectedColor } = useThemeColors();

  const handleColorChange = (color: ThemeColor) => {
    setSelectedColor(color);
  };

  const themeOptions = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg hover:bg-accent transition-all duration-200 hover:scale-105"
        >
          <Palette className="h-4 w-4 transition-transform duration-200 group-hover:rotate-12" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 p-4 glass-card border-0"
        sideOffset={5}
      >
        <DropdownMenuLabel className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Customize Theme
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="my-3" />
        
        {/* Theme Mode Selection */}
        <div className="space-y-2 mb-4">
          <p className="text-sm font-medium text-muted-foreground">Appearance</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as any)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 hover:bg-accent",
                  theme === option.value ? "bg-primary/10 text-primary ring-2 ring-primary/20" : ""
                )}
              >
                <option.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-3" />

        {/* Accent Color Selection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Theme Color</p>
          <div className="grid grid-cols-4 gap-2">
            {defaultColors.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorChange(color)}
                className={cn(
                  "relative h-10 w-10 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-lg",
                  selectedColor.value === color.value ? "ring-2 ring-offset-2 ring-current ring-offset-background" : ""
                )}
                style={{ backgroundColor: color.hsl }}
                title={color.name}
              >
                {selectedColor.value === color.value && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator className="my-3" />

        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleColorChange(defaultColors[0]);
                setTheme('system');
              }}
              className="flex-1 text-xs"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const settings = {
                  theme,
                  color: selectedColor,
                };
                navigator.clipboard.writeText(JSON.stringify(settings));
              }}
              className="flex-1 text-xs"
            >
              Export
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
