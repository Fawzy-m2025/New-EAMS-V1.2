import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Equipment } from '@/types/eams';
import { industrialAssets } from '@/data/enhancedAssetData';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';

interface AssetContextType {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  resetData: () => void;
  simulateRealTimeUpdate: () => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with data from local storage or default to industrialAssets
  const initialEquipment = loadFromLocalStorage('equipment', industrialAssets);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  
  // Save to local storage whenever equipment changes
  useEffect(() => {
    saveToLocalStorage('equipment', equipment);
  }, [equipment]);

  // Function to reset local storage to default data
  const resetData = () => {
    localStorage.removeItem('equipment');
    setEquipment(industrialAssets);
  };

  // Simulate real-time updates for condition monitoring data (demo purposes)
  const simulateRealTimeUpdate = () => {
    setEquipment(prevEquipment => {
      const updatedEquipment = prevEquipment.map(eq => {
        if (eq.conditionMonitoring && eq.conditionMonitoring.vibration) {
          // Simulate slight fluctuation in vibration data
          const fluctuationRms = Math.random() * 0.4 - 0.2;
          const fluctuationPeak = Math.random() * 0.6 - 0.3;
          const newRmsVelocity = Math.max(0.5, eq.conditionMonitoring.vibration.rmsVelocity + fluctuationRms);
          const newPeakVelocity = Math.max(1.0, eq.conditionMonitoring.vibration.peakVelocity + fluctuationPeak);
          const newZone = newRmsVelocity < 2.8 ? 'A' : newRmsVelocity < 4.5 ? 'B' : newRmsVelocity < 7.1 ? 'C' : 'D';
          
          return {
            ...eq,
            conditionMonitoring: {
              ...eq.conditionMonitoring,
              vibration: {
                ...eq.conditionMonitoring.vibration,
                rmsVelocity: parseFloat(newRmsVelocity.toFixed(2)),
                peakVelocity: parseFloat(newPeakVelocity.toFixed(2)),
                iso10816Zone: newZone as 'A' | 'B' | 'C' | 'D',
                measurementDate: new Date().toISOString().split('T')[0],
              },
              lastUpdated: new Date().toISOString().split('T')[0],
              overallCondition: newZone === 'A' ? 'excellent' as const : newZone === 'B' ? 'good' as const : newZone === 'C' ? 'fair' as const : 'poor' as const,
            },
            condition: newZone === 'A' ? 'excellent' as const : newZone === 'B' ? 'good' as const : newZone === 'C' ? 'fair' as const : 'poor' as const,
          };
        }
        return eq;
      });
      saveToLocalStorage('equipment', updatedEquipment);
      return updatedEquipment;
    });
  };

  // Auto-update simulation every 30 seconds for demo (can be toggled off in production)
  useEffect(() => {
    const interval = setInterval(() => {
      simulateRealTimeUpdate();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AssetContext.Provider value={{ equipment, setEquipment, resetData, simulateRealTimeUpdate }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssetContext must be used within an AssetProvider');
  }
  return context;
};
