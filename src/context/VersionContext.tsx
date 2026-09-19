import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface VersionContextType {
  version: string;
  actionCount: number;
  incrementVersion: (actionName?: string) => string;
}

const VERSION_STORAGE_KEY = 'scriptsgr_app_version';
const ACTION_COUNT_STORAGE_KEY = 'scriptsgr_action_count';

// Base version starting point
const BASE_MAJOR = 1;
const BASE_MINOR = 0;

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actionCount, setActionCount] = useState<number>(() => {
    const saved = localStorage.getItem(ACTION_COUNT_STORAGE_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const calculateVersion = (count: number) => {
    const patch = count;
    return `v${BASE_MAJOR}.${BASE_MINOR}.${patch}`;
  };

  const [version, setVersion] = useState<string>(() => calculateVersion(actionCount));

  const incrementVersion = useCallback((actionName?: string) => {
    const nextCount = actionCount + 1;
    const newVer = calculateVersion(nextCount);
    setActionCount(nextCount);
    setVersion(newVer);
    localStorage.setItem(ACTION_COUNT_STORAGE_KEY, nextCount.toString());
    localStorage.setItem(VERSION_STORAGE_KEY, newVer);
    
    // Dispatch custom event for listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('app_version_change', {
          detail: { version: newVer, action: actionName },
        })
      );
    }
    return newVer;
  }, [actionCount]);

  useEffect(() => {
    // Keep in sync with storage
    const current = calculateVersion(actionCount);
    setVersion(current);
    localStorage.setItem(ACTION_COUNT_STORAGE_KEY, actionCount.toString());
    localStorage.setItem(VERSION_STORAGE_KEY, current);
  }, [actionCount]);

  return (
    <VersionContext.Provider value={{ version, actionCount, incrementVersion }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useAppVersion = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error('useAppVersion must be used within a VersionProvider');
  }
  return context;
};
