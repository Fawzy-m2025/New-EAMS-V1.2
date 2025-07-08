import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColor {
  name: string;
  value: string;
  hsl: string;
  rgb: string;
}

interface ThemeColorsContextValue {
  selectedColor: ThemeColor;
  setSelectedColor: (color: ThemeColor) => void;
  getThemeClasses: () => {
    primary: string;
    primaryForeground: string;
    accent: string;
    ring: string;
    chart: string;
    gradient: string;
    glassBg: string;
    glassBorder: string;
    glassHover: string;
    cardBg: string;
    cardBorder: string;
    buttonPrimary: string;
    buttonSecondary: string;
    iconPrimary: string;
    badgePrimary: string;
    progressBg: string;
  };
}

const defaultColors: ThemeColor[] = [
  { name: 'Purple', value: '262 83% 58%', hsl: 'hsl(262, 83%, 58%)', rgb: '147, 51, 234' },
  { name: 'Blue', value: '217 91% 60%', hsl: 'hsl(217, 91%, 60%)', rgb: '59, 130, 246' },
  { name: 'Green', value: '142 76% 36%', hsl: 'hsl(142, 76%, 36%)', rgb: '34, 197, 94' },
  { name: 'Orange', value: '25 95% 53%', hsl: 'hsl(25, 95%, 53%)', rgb: '249, 115, 22' },
  { name: 'Red', value: '0 84% 60%', hsl: 'hsl(0, 84%, 60%)', rgb: '239, 68, 68' },
  { name: 'Pink', value: '330 81% 60%', hsl: 'hsl(330, 81%, 60%)', rgb: '236, 72, 153' },
  { name: 'Indigo', value: '263 70% 50%', hsl: 'hsl(263, 70%, 50%)', rgb: '99, 102, 241' },
  { name: 'Teal', value: '173 58% 39%', hsl: 'hsl(173, 58%, 39%)', rgb: '20, 184, 166' },
  // New Financial Hub Color Palette
  { name: 'Financial Dark', value: '210 100% 2%', hsl: 'hsl(210, 100%, 2%)', rgb: '6, 7, 10' },
  { name: 'Financial Teal', value: '200 52% 24%', hsl: 'hsl(200, 52%, 24%)', rgb: '25, 72, 95' },
  { name: 'Financial Indigo', value: '235 48% 34%', hsl: 'hsl(235, 48%, 34%)', rgb: '45, 52, 128' },
  { name: 'Financial Cyan', value: '195 40% 48%', hsl: 'hsl(195, 40%, 48%)', rgb: '76, 157, 176' },
  { name: 'Financial Gold', value: '45 100% 55%', hsl: 'hsl(45, 100%, 55%)', rgb: '255, 192, 29' },
  { name: 'Financial Light Yellow', value: '45 100% 85%', hsl: 'hsl(45, 100%, 85%)', rgb: '255, 235, 175' },
  { name: 'Financial Pale Green', value: '65 35% 75%', hsl: 'hsl(65, 35%, 75%)', rgb: '217, 224, 164' },
];

const ThemeColorsContext = createContext<ThemeColorsContextValue | undefined>(undefined);

export function ThemeColorsProvider({ children }: { children: React.ReactNode }) {
  const [selectedColor, setSelectedColor] = useState<ThemeColor>(defaultColors[0]);

  useEffect(() => {
    // Load saved color from localStorage
    const savedColor = localStorage.getItem('theme-color');
    if (savedColor) {
      try {
        const parsedColor = JSON.parse(savedColor);
        const foundColor = defaultColors.find(color => color.value === parsedColor.value);
        if (foundColor) {
          setSelectedColor(foundColor);
        }
      } catch (error) {
        console.error('Error parsing saved theme color:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Apply color to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary', selectedColor.value);
    root.style.setProperty('--sidebar-primary', selectedColor.value);
    root.style.setProperty('--ring', selectedColor.value);
    root.style.setProperty('--chart-1', selectedColor.value);
    root.style.setProperty('--theme-color-rgb', selectedColor.rgb);

    // Save to localStorage
    localStorage.setItem('theme-color', JSON.stringify(selectedColor));
  }, [selectedColor]);

  const getThemeClasses = () => {
    const colorValue = selectedColor.value;

    return {
      primary: `hsl(${colorValue})`,
      primaryForeground: 'hsl(var(--primary-foreground))',
      accent: `hsl(${colorValue} / 0.1)`,
      ring: `hsl(${colorValue})`,
      chart: `hsl(${colorValue})`,
      gradient: `linear-gradient(135deg, hsl(${colorValue}), hsl(${colorValue} / 0.8))`,
      glassBg: `hsl(${colorValue} / 0.05)`,
      glassBorder: `hsl(${colorValue} / 0.15)`,
      glassHover: `hsl(${colorValue} / 0.08)`,
      cardBg: `hsl(${colorValue} / 0.03)`,
      cardBorder: `hsl(${colorValue} / 0.12)`,
      buttonPrimary: `hsl(${colorValue})`,
      buttonSecondary: `hsl(${colorValue} / 0.1)`,
      iconPrimary: `hsl(${colorValue})`,
      badgePrimary: `hsl(${colorValue} / 0.1)`,
      progressBg: `hsl(${colorValue})`,
    };
  };

  return (
    <ThemeColorsContext.Provider value={{ selectedColor, setSelectedColor, getThemeClasses }}>
      {children}
    </ThemeColorsContext.Provider>
  );
}

export function useThemeColors() {
  const context = useContext(ThemeColorsContext);
  if (!context) {
    throw new Error('useThemeColors must be used within a ThemeColorsProvider');
  }
  return context;
}

export { defaultColors };
export type { ThemeColor };
