import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Plus,
  Terminal,
  User as UserIcon,
  Sparkles,
  Search,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onNavigate,
  searchQuery = '',
  setSearchQuery,
}) => {
  const { mode, setMode, accent, accentClasses } = useTheme();
  const { user } = useAuth();

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors ${
        mode === 'dark'
          ? 'bg-slate-900/80 border-slate-800/80 text-slate-100'
          : 'bg-white/80 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2.5 max-w-7xl mx-auto gap-3">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            id="btn-mobile-menu"
            onClick={onOpenMobileMenu}
            className={`p-2 rounded-xl md:hidden transition-colors ${
              mode === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 cursor-pointer md:hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-sm">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">LuauRaw</span>
          </div>

          {/* Quick Search on Desktop */}
          {setSearchQuery && (
            <div className="hidden sm:flex items-center relative min-w-[240px] md:min-w-[320px]">
              <Search className="w-4 h-4 absolute left-3 text-slate-500 pointer-events-none" />
              <input
                id="navbar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por título, ID ou descrição..."
                className={`w-full pl-9 pr-4 py-1.5 rounded-xl text-xs border transition-all focus:outline-none ${
                  mode === 'dark'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-200 placeholder-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400'
                } ${accentClasses.ring}`}
              />
            </div>
          )}
        </div>

        {/* Right Side: Quick Action, Theme Switcher & User */}
        <div className="flex items-center gap-2">
          {/* Quick Create Script Button */}
          <button
            id="btn-navbar-new-script"
            onClick={() => onNavigate('create')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 shadow-sm transition-all ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Script</span>
          </button>

          {/* Theme Mode Toggle (Dark / Light) */}
          <button
            id="btn-theme-toggle"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            title={mode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className={`p-2 rounded-xl border transition-colors ${
              mode === 'dark'
                ? 'bg-slate-800/80 border-slate-700/60 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Settings / Accent Indicator */}
          <button
            id="btn-navbar-settings"
            onClick={() => onNavigate('settings')}
            title="Personalizar cores e configurações"
            className={`p-2 rounded-xl border transition-colors relative ${
              mode === 'dark'
                ? 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${accentClasses.text}`} />
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${accentClasses.primaryBg}`}
            />
          </button>

          {/* User Profile avatar or Login button */}
          {user ? (
            <button
              id="btn-navbar-profile"
              onClick={() => onNavigate('settings')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border border-slate-700/60 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                {user.username}
              </span>
            </button>
          ) : (
            <button
              id="btn-navbar-login"
              onClick={() => onNavigate('login')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 ${accentClasses.primaryBg}`}
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
