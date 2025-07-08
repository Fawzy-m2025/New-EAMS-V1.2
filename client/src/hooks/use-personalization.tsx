
import { createContext, useContext, useEffect, useState } from 'react';

interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  compactMode: boolean;
  sidebarCollapsed: boolean;
  notificationSettings: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  layoutPreferences: {
    cardSize: 'compact' | 'comfortable' | 'spacious';
    gridDensity: 'dense' | 'normal' | 'loose';
    showTooltips: boolean;
  };
  dashboardWidgets: string[];
}

const defaultSettings: PersonalizationSettings = {
  theme: 'system',
  accentColor: '262 83% 58%',
  animations: true,
  reducedMotion: false,
  highContrast: false,
  compactMode: false,
  sidebarCollapsed: false,
  notificationSettings: {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
  },
  layoutPreferences: {
    cardSize: 'comfortable',
    gridDensity: 'normal',
    showTooltips: true,
  },
  dashboardWidgets: ['revenue', 'expenses', 'profit', 'assets'],
};

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (updates: Partial<PersonalizationSettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export function usePersonalization() {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
}

interface PersonalizationProviderProps {
  children: React.ReactNode;
}

export function PersonalizationProvider({ children }: PersonalizationProviderProps) {
  const [settings, setSettings] = useState<PersonalizationSettings>(() => {
    try {
      const saved = localStorage.getItem('personalization-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Auto-save settings to localStorage
  useEffect(() => {
    localStorage.setItem('personalization-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply accessibility settings
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [settings.reducedMotion, settings.highContrast, settings.compactMode]);

  const updateSettings = (updates: Partial<PersonalizationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('personalization-settings');
  };

  const exportSettings = () => {
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = (settingsJson: string): boolean => {
    try {
      const imported = JSON.parse(settingsJson);
      setSettings({ ...defaultSettings, ...imported });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <PersonalizationContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
}

// Helper hooks for specific settings
export function useAnimationSettings() {
  const { settings, updateSettings } = usePersonalization();
  return {
    animations: settings.animations,
    reducedMotion: settings.reducedMotion,
    setAnimations: (animations: boolean) => updateSettings({ animations }),
    setReducedMotion: (reducedMotion: boolean) => updateSettings({ reducedMotion }),
  };
}

export function useLayoutSettings() {
  const { settings, updateSettings } = usePersonalization();
  return {
    ...settings.layoutPreferences,
    updateLayout: (updates: Partial<PersonalizationSettings['layoutPreferences']>) =>
      updateSettings({
        layoutPreferences: { ...settings.layoutPreferences, ...updates }
      }),
  };
}

export function useNotificationSettings() {
  const { settings, updateSettings } = usePersonalization();
  return {
    ...settings.notificationSettings,
    updateNotifications: (updates: Partial<PersonalizationSettings['notificationSettings']>) =>
      updateSettings({
        notificationSettings: { ...settings.notificationSettings, ...updates }
      }),
  };
}
