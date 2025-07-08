import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Equipment } from '@/types/eams';
import { allHierarchicalEquipment } from '@/data/hierarchicalAssetData';
import { saveToLocalStorage, loadFromLocalStorage } from '@/utils/localStorageUtils';
import type { VibrationHistoryRecord } from '@/data/vibrationHistoryData';
import { initialVibrationHistory } from '@/data/vibrationHistoryData';

interface AssetContextType {
  equipment: Equipment[];
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  resetData: () => void;
  simulateRealTimeUpdate: () => void;
  dataUpdateTrigger: number;
  triggerDataUpdate: () => void;
  vibrationHistory: VibrationHistoryRecord[];
  addVibrationHistoryEntry: (entry: VibrationHistoryRecord) => void;
  getVibrationHistoryByEquipment: (equipmentId: string) => VibrationHistoryRecord[];
  clearVibrationHistory: () => void;
  monitoredEquipment: Equipment[];
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider = ({ children }: { children: ReactNode }) => {
  // Force clear old data and use new hierarchical equipment data
  // Check if we need to migrate from old data structure
  const storedData = localStorage.getItem('equipment');
  const needsMigration = !storedData ||
    (storedData && !storedData.includes('ZONE-A')) ||
    (storedData && !storedData.includes('hierarchical'));

  if (needsMigration) {
    localStorage.removeItem('equipment');
    console.log('🔄 Migrating to new hierarchical equipment data...');
  }

  // Initialize with new hierarchical equipment data
  const initialEquipment = needsMigration ? allHierarchicalEquipment : loadFromLocalStorage('equipment', allHierarchicalEquipment);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);

  // Debug logging
  console.log(`📊 Equipment data loaded: ${equipment.length} items`);
  console.log(`🏭 Sample equipment:`, equipment.slice(0, 2).map(eq => ({
    name: eq.name,
    manufacturer: eq.manufacturer,
    station: eq.location?.station
  })));

  // NEW: Vibration history state
  const loadedVibrationHistory = loadFromLocalStorage('vibrationHistory', initialVibrationHistory);
  const [vibrationHistory, setVibrationHistory] = useState<VibrationHistoryRecord[]>(loadedVibrationHistory);

  // Save to local storage whenever equipment changes
  useEffect(() => {
    // Add a version marker to the saved data
    const dataWithVersion = {
      version: 'hierarchical-v1',
      data: equipment,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('equipment', JSON.stringify(dataWithVersion));
  }, [equipment]);

  // Persist vibration history
  useEffect(() => {
    saveToLocalStorage('vibrationHistory', vibrationHistory);
  }, [vibrationHistory]);

  // Function to reset local storage to default data
  const resetData = () => {
    localStorage.removeItem('equipment');
    localStorage.removeItem('vibrationHistory');
    console.log('🔄 Reset to new hierarchical equipment data (96 items)');
    setEquipment(allHierarchicalEquipment);
    setVibrationHistory(initialVibrationHistory);
  };

  // State to trigger updates across all modules
  const [dataUpdateTrigger, setDataUpdateTrigger] = useState<number>(0);

  // Function to trigger data updates
  const triggerDataUpdate = () => {
    setDataUpdateTrigger(prev => prev + 1);
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
      triggerDataUpdate(); // Trigger update notification
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

  // Add a new vibration history entry
  const addVibrationHistoryEntry = (entry: VibrationHistoryRecord) => {
    setVibrationHistory(prev => [...prev, entry]);
  };

  // Get vibration history for a specific equipment
  const getVibrationHistoryByEquipment = (equipmentId: string) => {
    return vibrationHistory.filter(record => record.equipmentId === equipmentId);
  };

  // Add a function to clear vibration history
  const clearVibrationHistory = () => {
    localStorage.removeItem('vibrationHistory');
    setVibrationHistory(initialVibrationHistory);
  };

  // Utility to get monitored equipment from vibration history
  const getMonitoredEquipmentFromVibrationHistory = () => {
    const uniqueIds = Array.from(new Set(vibrationHistory.map(r => r.equipmentId)));
    return uniqueIds.map(id => allHierarchicalEquipment.find(eq => eq.id === id)).filter(Boolean);
  };
  const monitoredEquipment = getMonitoredEquipmentFromVibrationHistory();

  return (
    <AssetContext.Provider value={{ equipment, setEquipment, resetData, simulateRealTimeUpdate, dataUpdateTrigger, triggerDataUpdate, vibrationHistory, addVibrationHistoryEntry, getVibrationHistoryByEquipment, clearVibrationHistory, monitoredEquipment }}>
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
