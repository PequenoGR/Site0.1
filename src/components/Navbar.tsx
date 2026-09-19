import React from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { Logo } from './Logo';
import { useAppVersion } from '../context/VersionContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: string) => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onNavigate,
}) => {
  const { version } = useAppVersion();
  const { accentInfo } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full bg-black border-b border-slate-900 text-white shadow-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-5xl mx-auto">
        {/* Left Side: Clean Brand Logo ScriptsGR + Single Dynamic Version Badge next to Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            id="btn-navbar-logo"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center cursor-pointer select-none py-1 group"
          >
            <Logo size="sm" />
          </div>

          {/* Dynamic Real-Time Version Pill - exclusively located next to logo */}
          <div
            id="app-version-badge"
            style={{
              borderColor: `${accentInfo.accentHex}60`,
              backgroundColor: `${accentInfo.accentHex}15`,
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-mono font-bold tracking-wider transition-all duration-300 shadow-xs"
            title="Versão do Sistema (Atualizada a cada ação)"
          >
            <Sparkles
              style={{ color: accentInfo.accentHex }}
              className="w-3 h-3 animate-pulse shrink-0"
            />
            <span style={{ color: accentInfo.accentHex }}>{version}</span>
          </div>
        </div>

        {/* Right Side: Hamburger Menu Button Only */}
        <div className="flex items-center">
          <button
            id="btn-main-menu-toggle"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-white hover:bg-slate-900 transition-colors flex items-center justify-center"
            aria-label="Abrir menu de navegação"
            title="Menu"
          >
            <Menu className="w-6 h-6 text-white stroke-[2.2]" />
          </button>
        </div>
      </div>
    </header>
  );
};
