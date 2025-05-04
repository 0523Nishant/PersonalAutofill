import { UserData, Settings, AutofillHistoryItem } from './types';

// Keys for Chrome storage
const STORAGE_KEYS = {
  USER_DATA: 'autofill_user_data',
  SETTINGS: 'autofill_settings',
  HISTORY: 'autofill_history'
};

// Default settings
const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  autoFillOnLoad: false,
  showFillNotification: true,
  fillOnlyEmpty: true,
  fillDelay: 200,
  mappingProfile: 'standard',
  trackHistory: true
};

// Helper function to check if Chrome storage is available
const isChromeAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
};

// Helper to get storage implementation (chrome.storage.local or localStorage)
const getStorage = () => {
  if (isChromeAvailable()) {
    return chrome.storage.local;
  }
  
  // Fallback to localStorage for development
  return {
    get: async (keys: string | string[] | Record<string, any> | null) => {
      const keyList = typeof keys === 'string' ? [keys] : 
                     Array.isArray(keys) ? keys : 
                     keys ? Object.keys(keys) : [];
      
      const result: Record<string, any> = {};
      for (const key of keyList) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            result[key] = JSON.parse(item);
          } catch (e) {
            result[key] = item;
          }
        }
      }
      return result;
    },
    set: async (items: Record<string, any>) => {
      for (const [key, value] of Object.entries(items)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    },
    remove: async (keys: string | string[]) => {
      const keyList = Array.isArray(keys) ? keys : [keys];
      keyList.forEach(key => localStorage.removeItem(key));
    },
    clear: async () => {
      localStorage.clear();
    }
  };
};

// Get user data from storage
export const getUserData = async (): Promise<UserData | null> => {
  const storage = getStorage();
  const result = await storage.get(STORAGE_KEYS.USER_DATA);
  return result[STORAGE_KEYS.USER_DATA] || null;
};

// Save user data to storage
export const saveUserData = async (data: UserData): Promise<void> => {
  const storage = getStorage();
  await storage.set({ [STORAGE_KEYS.USER_DATA]: data });
};

// Get settings from storage
export const getSettings = async (): Promise<Settings> => {
  const storage = getStorage();
  const result = await storage.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
};

// Save settings to storage
export const saveSettings = async (settings: Settings): Promise<void> => {
  const storage = getStorage();
  await storage.set({ [STORAGE_KEYS.SETTINGS]: settings });
};

// Get autofill history from storage
export const getAutofillHistory = async (): Promise<AutofillHistoryItem[]> => {
  const storage = getStorage();
  const result = await storage.get(STORAGE_KEYS.HISTORY);
  return result[STORAGE_KEYS.HISTORY] || [];
};

// Add item to autofill history
export const addAutofillHistoryItem = async (item: AutofillHistoryItem): Promise<void> => {
  const storage = getStorage();
  const history = await getAutofillHistory();
  
  // Add new item at the start of the array (most recent first)
  const updatedHistory = [item, ...history].slice(0, 50);  // Limit to 50 items
  
  await storage.set({ [STORAGE_KEYS.HISTORY]: updatedHistory });
};

// Clear autofill history
export const clearAutofillHistory = async (): Promise<void> => {
  const storage = getStorage();
  await storage.set({ [STORAGE_KEYS.HISTORY]: [] });
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  const storage = getStorage();
  await storage.remove([
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.SETTINGS,
    STORAGE_KEYS.HISTORY
  ]);
};
