import React, { createContext, useContext, useState, useCallback } from 'react';

interface VersionContextType {
  version: string;
  actionCount: number;
  incrementVersion: (actionName?: string) => string;
}

// Versão oficial do site definida pelo criador
export const SITE_OFFICIAL_VERSION = 'v1.0.0';

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const version = SITE_OFFICIAL_VERSION;
  const [actionCount] = useState<number>(0);

  // Mantido para compatibilidade de tipos sem alterar a versão nos cliques
  const incrementVersion = useCallback((_actionName?: string) => {
    return SITE_OFFICIAL_VERSION;
  }, []);

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

