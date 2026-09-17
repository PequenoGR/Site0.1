import React from 'react';
import { Menu } from 'lucide-react';
import { Logo } from './Logo';

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
  return (
    <header className="sticky top-0 z-30 w-full bg-black border-b border-slate-900 text-white">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-5xl mx-auto">
        {/* Left Side: Clean Brand Logo ScriptsGR */}
        <div
          id="btn-navbar-logo"
          onClick={() => onNavigate('dashboard')}
          className="flex items-center cursor-pointer select-none py-1 group"
        >
          <Logo size="sm" />
        </div>

        {/* Right Side: Hamburger Menu Button */}
        <div className="flex items-center gap-2">
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

