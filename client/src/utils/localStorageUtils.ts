/**
 * Utility functions for managing local storage of application data
 * to ensure persistence of user actions across page refreshes.
 */

/**
 * Save data to local storage under a specific key.
 * @param key The key under which to store the data.
 * @param data The data to store.
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to local storage for key ${key}:`, error);
  }
};

/**
 * Load data from local storage for a specific key.
 * @param key The key to retrieve data for.
 * @param defaultData The default data to return if nothing is found in local storage.
 * @returns The data from local storage or the default data if not found.
 */
export const loadFromLocalStorage = <T>(key: string, defaultData: T): T => {
  try {
    const savedData = localStorage.getItem(key);
    if (!savedData) return defaultData;

    const parsed = JSON.parse(savedData);

    // Handle versioned data structure
    if (key === 'equipment' && parsed.version === 'hierarchical-v1') {
      return parsed.data;
    }

    // Handle legacy data or non-versioned data
    if (key === 'equipment' && Array.isArray(parsed)) {
      // Check if it's old data structure (missing hierarchical properties)
      const hasHierarchicalData = parsed.some(item =>
        item.zoneId || item.stationId || item.path?.includes('Zone A')
      );

      if (!hasHierarchicalData) {
        console.log('🔄 Detected old equipment data, using default hierarchical data');
        return defaultData;
      }
    }

    return parsed.data || parsed;
  } catch (error) {
    console.error(`Error loading from local storage for key ${key}:`, error);
    return defaultData;
  }
};

/**
 * Remove data from local storage for a specific key.
 * @param key The key to remove data for.
 */
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from local storage for key ${key}:`, error);
  }
};
