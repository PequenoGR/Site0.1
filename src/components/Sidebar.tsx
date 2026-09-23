import React from 'react';
import {
  LayoutDashboard,
  Code2,
  PlusCircle,
  Settings,
  Terminal,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, logout } = useAuth();
  const { mode, accentInfo } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Painel de Scripts', icon: LayoutDashboard },
    { id: 'my-scripts', label: 'Meus Scripts', icon: Code2 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleNav = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4 bg-slate-950 text-slate-100">
      <div>
        {/* Brand Logo & Close Button */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 cursor-pointer group py-1"
          >
            <Logo size="sm" />
          </div>
          
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Create CTA Button - Botão Laranja Superior */}
        <button
          id="btn-sidebar-create"
          onClick={() => handleNav('create')}
          style={{
            backgroundColor: '#ea580c',
          }}
          className={`w-full py-2.5 px-4 mb-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-white transition-all shadow-md active:scale-98 bg-orange-600 hover:bg-orange-500 shadow-orange-600/30 ${
            currentTab === 'create' ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-slate-950' : ''
          }`}
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>Criar Script</span>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navegação Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNav(item.id)}
                style={
                  isActive
                    ? {
                        backgroundColor: accentInfo.slotBgHex,
                        color: accentInfo.accentHex,
                        borderColor: accentInfo.accentHex,
                      }
                    : {}
                }
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'border font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon
                  style={isActive ? { color: accentInfo.accentHex } : {}}
                  className={`w-4 h-4 ${isActive ? '' : 'text-slate-400'}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Bottom Controls */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div
                style={{ borderColor: accentInfo.accentHex, color: accentInfo.accentHex }}
                className="w-8 h-8 rounded-full bg-slate-800 border flex items-center justify-center font-bold text-xs"
              >
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">@{user.username}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              id="btn-sidebar-logout"
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => handleNav('login')}
              style={{
                backgroundColor: accentInfo.accentHex,
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white transition-all"
            >
              Entrar na Conta
            </button>
            <button
              onClick={() => handleNav('register')}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Cadastrar Grátis
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Slide-out Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpenMobile(false)}
          />
          <div
            className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 bg-slate-950 border-r border-slate-800 animate-in slide-in-from-left duration-200"
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
