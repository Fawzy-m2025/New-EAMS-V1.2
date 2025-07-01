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
    return savedData ? JSON.parse(savedData) : defaultData;
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
