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
    cardBgHex: '#2563eb',
    cardBorderHex: '#1d4ed8',
    headerBgHex: '#1e3a8a',
    slotBgHex: '#172554',
    glowRgba: 'rgba(59, 130, 246, 0.4)',
  },
  black: {
    accentHex: '#a1a1aa',
    cardBgHex: '#18181b',
    cardBorderHex: '#3f3f46',
    headerBgHex: '#09090b',
    slotBgHex: '#000000',
    glowRgba: 'rgba(255, 255, 255, 0.25)',
  },
  white: {
    accentHex: '#ffffff',
    cardBgHex: '#f8fafc',
    cardBorderHex: '#cbd5e1',
    headerBgHex: '#475569',
    slotBgHex: '#1e293b',
    glowRgba: 'rgba(255, 255, 255, 0.5)',
  },
  orange: {
    accentHex: '#f97316',
    cardBgHex: '#ea580c',
    cardBorderHex: '#c2410c',
    headerBgHex: '#7c2d12',
    slotBgHex: '#431407',
    glowRgba: 'rgba(249, 115, 22, 0.45)',
  },
  yellow: {
    accentHex: '#eab308',
    cardBgHex: '#ca8a04',
    cardBorderHex: '#a16207',
    headerBgHex: '#713f12',
    slotBgHex: '#422006',
    glowRgba: 'rgba(234, 179, 8, 0.45)',
  },
  purple: {
    accentHex: '#a855f7',
    cardBgHex: '#9333ea',
    cardBorderHex: '#7e22ce',
    headerBgHex: '#581c87',
    slotBgHex: '#3b0764',
    glowRgba: 'rgba(168, 85, 247, 0.45)',
  },
  lime: {
    accentHex: '#84cc16',
    cardBgHex: '#65a30d',
    cardBorderHex: '#4d7c0f',
    headerBgHex: '#365314',
    slotBgHex: '#1a2e05',
    glowRgba: 'rgba(132, 204, 22, 0.45)',
  },
  slate: {
    accentHex: '#94a3b8',
    cardBgHex: '#334155',
    cardBorderHex: '#475569',
    headerBgHex: '#1e293b',
    slotBgHex: '#0f172a',
    glowRgba: 'rgba(148, 163, 184, 0.35)',
  },
  indigo: {
    accentHex: '#6366f1',
    cardBgHex: '#4f46e5',
    cardBorderHex: '#4338ca',
    headerBgHex: '#312e81',
    slotBgHex: '#1e1b4b',
    glowRgba: 'rgba(99, 102, 241, 0.45)',
  },
  teal: {
    accentHex: '#14b8a6',
    cardBgHex: '#0d9488',
    cardBorderHex: '#0f766e',
    headerBgHex: '#115e59',
    slotBgHex: '#134e4a',
    glowRgba: 'rgba(20, 184, 166, 0.45)',
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
  black: {
    primaryBg: 'bg-zinc-800',
    primaryHover: 'hover:bg-zinc-700',
    text: 'text-zinc-200',
    border: 'border-zinc-700',
    badgeBg: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    ring: 'focus:ring-zinc-400/50',
    gradient: 'from-zinc-800 to-black',
  },
  white: {
    primaryBg: 'bg-slate-200',
    primaryHover: 'hover:bg-white',
    text: 'text-slate-100',
    border: 'border-white/40',
    badgeBg: 'bg-white/15 text-white border-white/30',
    ring: 'focus:ring-white/50',
    gradient: 'from-slate-100 to-white',
  },
  orange: {
    primaryBg: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-400',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    ring: 'focus:ring-orange-500/50',
    gradient: 'from-orange-500 to-amber-600',
  },
  yellow: {
    primaryBg: 'bg-yellow-500',
    primaryHover: 'hover:bg-yellow-400',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    badgeBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    ring: 'focus:ring-yellow-500/50',
    gradient: 'from-yellow-400 to-amber-500',
  },
  purple: {
    primaryBg: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    ring: 'focus:ring-purple-500/50',
    gradient: 'from-purple-600 to-indigo-600',
  },
  lime: {
    primaryBg: 'bg-lime-500',
    primaryHover: 'hover:bg-lime-400',
    text: 'text-lime-400',
    border: 'border-lime-500/40',
    badgeBg: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    ring: 'focus:ring-lime-500/50',
    gradient: 'from-lime-500 to-emerald-600',
  },
  slate: {
    primaryBg: 'bg-slate-600',
    primaryHover: 'hover:bg-slate-500',
    text: 'text-slate-300',
    border: 'border-slate-500/40',
    badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    ring: 'focus:ring-slate-400/50',
    gradient: 'from-slate-600 to-slate-800',
  },
  indigo: {
    primaryBg: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-500',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    ring: 'focus:ring-indigo-500/50',
    gradient: 'from-indigo-600 to-violet-700',
  },
  teal: {
    primaryBg: 'bg-teal-500',
    primaryHover: 'hover:bg-teal-400',
    text: 'text-teal-400',
    border: 'border-teal-500/40',
    badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    ring: 'focus:ring-teal-500/50',
    gradient: 'from-teal-500 to-cyan-600',
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
