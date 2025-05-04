import { useState, useEffect } from 'react';
import { getUserData, getSettings, getAutofillHistory } from './storage';
import { UserData, Settings, AutofillHistoryItem } from './types';

// Hook to get and update user data
export const useUserData = () => {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userData = await getUserData();
      setData(userData);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Hook to get and update settings
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refetch: fetchSettings };
};

// Hook to get autofill history
export const useAutofillHistory = () => {
  const [history, setHistory] = useState<AutofillHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAutofillHistory();
      setHistory(data);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, loading, error, refetch: fetchHistory };
};

// Hook to listen for changes in chrome.storage
export const useChromeStorageListener = (callback: () => void) => {
  useEffect(() => {
    // Set up storage change listener if Chrome API is available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(callback);
      
      // Clean up listener when component unmounts
      return () => {
        chrome.storage.onChanged.removeListener(callback);
      };
    }
  }, [callback]);
};
