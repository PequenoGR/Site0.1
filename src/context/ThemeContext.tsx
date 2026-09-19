import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, ThemeMode } from '../types';

interface ThemeAccentInfo {
  accentHex: string;
  cardBgHex: string;
  cardBorderHex: string;
  headerBgHex: string;
  slotBgHex: string;
  glowRgba: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  accentClasses: {
    primaryBg: string;
    primaryHover: string;
    text: string;
    border: string;
    badgeBg: string;
    ring: string;
    gradient: string;
  };
  accentInfo: ThemeAccentInfo;
}

const THEME_STORAGE_KEY = 'luauraw_theme_mode';
const ACCENT_STORAGE_KEY = 'luauraw_accent_color';

export const ACCENT_PALETTES: Record<AccentColor, ThemeAccentInfo> = {
  red: {
    accentHex: '#ef4444',
    cardBgHex: '#dc2626',
    cardBorderHex: '#991b1b',
    headerBgHex: '#7f1d1d',
    slotBgHex: '#450a0a',
    glowRgba: 'rgba(239, 68, 68, 0.4)',
  },
  pink: {
    accentHex: '#ec4899',
    cardBgHex: '#db2777',
    cardBorderHex: '#9d174d',
    headerBgHex: '#831843',
    slotBgHex: '#500724',
    glowRgba: 'rgba(236, 72, 153, 0.4)',
  },
  emerald: {
    accentHex: '#10b981',
    cardBgHex: '#059669',
    cardBorderHex: '#065f46',
    headerBgHex: '#064e3b',
    slotBgHex: '#022c22',
    glowRgba: 'rgba(16, 185, 129, 0.4)',
  },
  violet: {
    accentHex: '#8b5cf6',
    cardBgHex: '#7c3aed',
    cardBorderHex: '#5b21b6',
    headerBgHex: '#4c1d95',
    slotBgHex: '#2e1065',
    glowRgba: 'rgba(139, 92, 246, 0.4)',
  },
  amber: {
    accentHex: '#f59e0b',
    cardBgHex: '#d97706',
    cardBorderHex: '#92400e',
    headerBgHex: '#78350f',
    slotBgHex: '#451a03',
    glowRgba: 'rgba(245, 158, 11, 0.4)',
  },
  cyan: {
    accentHex: '#06b6d4',
    cardBgHex: '#0891b2',
    cardBorderHex: '#155e75',
    headerBgHex: '#164e63',
    slotBgHex: '#083344',
    glowRgba: 'rgba(6, 182, 212, 0.4)',
  },
  rose: {
    accentHex: '#f43f5e',
    cardBgHex: '#e11d48',
    cardBorderHex: '#9f1239',
    headerBgHex: '#881337',
    slotBgHex: '#4c0519',
    glowRgba: 'rgba(244, 63, 94, 0.4)',
  },
  blue: {
    accentHex: '#3b82f6',
    cardBgHex: '#4870f7',
    cardBorderHex: '#1e3a8a',
    headerBgHex: '#23356c',
    slotBgHex: '#172554',
    glowRgba: 'rgba(59, 130, 246, 0.4)',
  },
};

const ACCENT_CONFIGS: Record<AccentColor, ThemeContextType['accentClasses']> = {
  red: {
    primaryBg: 'bg-red-500',
    primaryHover: 'hover:bg-red-400',
    text: 'text-red-400',
    border: 'border-red-500/40',
    badgeBg: 'bg-red-500/15 text-red-400 border-red-500/30',
    ring: 'focus:ring-red-500/50',
    gradient: 'from-red-500 to-rose-600',
  },
  pink: {
    primaryBg: 'bg-pink-500',
    primaryHover: 'hover:bg-pink-400',
    text: 'text-pink-400',
    border: 'border-pink-500/40',
    badgeBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
    ring: 'focus:ring-pink-500/50',
    gradient: 'from-pink-500 to-rose-400',
  },
  emerald: {
    primaryBg: 'bg-emerald-500',
    primaryHover: 'hover:bg-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    ring: 'focus:ring-emerald-500/50',
    gradient: 'from-emerald-500 to-teal-600',
  },
  violet: {
    primaryBg: 'bg-violet-500',
    primaryHover: 'hover:bg-violet-400',
    text: 'text-violet-400',
    border: 'border-violet-500/40',
    badgeBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    ring: 'focus:ring-violet-500/50',
    gradient: 'from-violet-500 to-purple-600',
  },
  amber: {
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    ring: 'focus:ring-amber-500/50',
    gradient: 'from-amber-500 to-orange-600',
  },
  cyan: {
    primaryBg: 'bg-cyan-500',
    primaryHover: 'hover:bg-cyan-400',
    text: 'text-cyan-400',
    border: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    ring: 'focus:ring-cyan-500/50',
    gradient: 'from-cyan-500 to-blue-600',
  },
  rose: {
    primaryBg: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-400',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    ring: 'focus:ring-rose-500/50',
    gradient: 'from-rose-500 to-pink-600',
  },
  blue: {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    ring: 'focus:ring-blue-500/50',
    gradient: 'from-blue-600 to-indigo-600',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || 'dark';
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    return (localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor) || 'blue';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
  };

  const accentInfo = ACCENT_PALETTES[accent] || ACCENT_PALETTES.blue;
  const accentClasses = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.blue;

  // Apply CSS custom properties dynamically on root document
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Set dynamic CSS properties based on active accent
    root.style.setProperty('--app-accent', accentInfo.accentHex);
    root.style.setProperty('--app-card-bg', accentInfo.cardBgHex);
    root.style.setProperty('--app-card-border', accentInfo.cardBorderHex);
    root.style.setProperty('--app-header-bg', accentInfo.headerBgHex);
    root.style.setProperty('--app-slot-bg', accentInfo.slotBgHex);
    root.style.setProperty('--app-glow', accentInfo.glowRgba);
  }, [mode, accent, accentInfo]);

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, accentClasses, accentInfo }}>
      <div className={mode === 'dark' ? 'dark text-slate-100' : 'light text-slate-800'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
