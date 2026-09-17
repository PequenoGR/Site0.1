import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentColor, ThemeMode } from '../types';

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
}

const THEME_STORAGE_KEY = 'luauraw_theme_mode';
const ACCENT_STORAGE_KEY = 'luauraw_accent_color';

const ACCENT_CONFIGS: Record<AccentColor, ThemeContextType['accentClasses']> = {
  cyan: {
    primaryBg: 'bg-cyan-500',
    primaryHover: 'hover:bg-cyan-400',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    ring: 'focus:ring-cyan-500/50',
    gradient: 'from-cyan-500 to-blue-600',
  },
  emerald: {
    primaryBg: 'bg-emerald-500',
    primaryHover: 'hover:bg-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    ring: 'focus:ring-emerald-500/50',
    gradient: 'from-emerald-500 to-teal-600',
  },
  violet: {
    primaryBg: 'bg-violet-500',
    primaryHover: 'hover:bg-violet-400',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    ring: 'focus:ring-violet-500/50',
    gradient: 'from-violet-500 to-purple-600',
  },
  amber: {
    primaryBg: 'bg-amber-500',
    primaryHover: 'hover:bg-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    ring: 'focus:ring-amber-500/50',
    gradient: 'from-amber-500 to-orange-600',
  },
  rose: {
    primaryBg: 'bg-rose-500',
    primaryHover: 'hover:bg-rose-400',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    ring: 'focus:ring-rose-500/50',
    gradient: 'from-rose-500 to-pink-600',
  },
  blue: {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-500',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
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
    return (localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor) || 'cyan';
  });

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem(ACCENT_STORAGE_KEY, newAccent);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [mode]);

  const accentClasses = ACCENT_CONFIGS[accent] || ACCENT_CONFIGS.cyan;

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent, accentClasses }}>
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
