import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Link2,
  Settings,
  Terminal,
  BookOpen,
  LogOut,
  Sparkles,
  Lock,
  Globe,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { mode, accentClasses } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Painel de Scripts', icon: LayoutDashboard },
    { id: 'create', label: 'Criar Novo Script', icon: PlusCircle },
    { id: 'raw-manager', label: 'Gerenciador RAW & Keys', icon: Link2 },
    { id: 'docs', label: 'Guia Loadstring & Luau', icon: BookOpen },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleNav = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  const content = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        {/* Brand Logo & Name */}
        <div
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-3 px-2 py-3 mb-6 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black text-lg">
            <Terminal className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-100">Luau</span>
              <span className={`font-black text-base ${accentClasses.text}`}>Raw</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Hospedagem Pastebin Luau</p>
          </div>
        </div>

        {/* Quick Create CTA Button */}
        <button
          id="btn-sidebar-create"
          onClick={() => handleNav('create')}
          className={`w-full py-2.5 px-4 mb-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-slate-950 transition-all shadow-md active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Script Luau</span>
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? `${accentClasses.badgeBg} font-bold shadow-sm`
                    : mode === 'dark'
                    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? accentClasses.text : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Bottom Controls */}
      <div className="pt-4 border-t border-slate-800/80">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
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
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold text-slate-950 ${accentClasses.primaryBg} transition-all`}
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

        {/* Loadstring Syntax Tip Box */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-cyan-400 font-bold mb-1">
            <Code2 className="w-3 h-3" />
            <span>Loadstring Luau</span>
          </div>
          <p className="text-slate-500 leading-tight">loadstring(game:HttpGet(&quot;.../raw/id&quot;))()</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex flex-col w-64 shrink-0 border-r min-h-screen transition-colors ${
          mode === 'dark' ? 'bg-slate-900/95 border-slate-800/90' : 'bg-white border-slate-200'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpenMobile(false)}
          />
          <div
            className={`relative w-72 max-w-[85vw] h-full shadow-2xl z-10 transition-colors ${
              mode === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
            }`}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};
