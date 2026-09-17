import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Code2,
  Terminal,
  Lock,
  Globe,
  Activity,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  List,
  Gamepad2,
  Zap,
  Sword,
  ShieldCheck,
  Rocket,
  Crown,
  Package,
  Link2,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { api } from '../lib/api';
import { ScriptCard } from '../components/ScriptCard';
import { PasswordModal } from '../components/PasswordModal';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface DashboardPageProps {
  onNavigate: (tab: string, scriptId?: string) => void;
  searchQuery?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, searchQuery = '' }) => {
  const { user } = useAuth();
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'public' | 'protected'>('all');
  const [activeScope, setActiveScope] = useState<'mine' | 'explore'>('mine');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Unlock modal state
  const [unlockTarget, setUnlockTarget] = useState<ScriptItem | null>(null);

  const categories = [
    { id: 'all', label: 'Todos os Scripts', icon: Layers },
    { id: 'roblox', label: 'Roblox & Jogos', icon: Gamepad2, query: 'roblox' },
    { id: 'utils', label: 'Utilitários & Speed', icon: Zap, query: 'speed' },
    { id: 'combat', label: 'Combate & PVP', icon: Sword, query: 'pvp' },
    { id: 'protected', label: 'Protegidos & Keys', icon: ShieldCheck, filter: 'protected' },
    { id: 'hubs', label: 'Hubs & GUIs', icon: Rocket, query: 'hub' },
    { id: 'vip', label: 'VIP & Admin', icon: Crown, query: 'vip' },
    { id: 'libs', label: 'Bibliotecas Luau', icon: Package, query: 'luau' },
  ];

  const handleSelectCategory = (cat: typeof categories[0]) => {
    setSelectedCategory(cat.id);
    if (cat.filter) {
      setActiveFilter(cat.filter as any);
      setLocalSearch('');
    } else if (cat.query) {
      setActiveFilter('all');
      setLocalSearch(cat.query);
    } else {
      setActiveFilter('all');
      setLocalSearch('');
    }
  };

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await api.getScripts({
        filter: activeFilter,
        search: localSearch,
        scope: activeScope,
      });
      setScripts(res.scripts);
    } catch (err: any) {
      showToast('Erro ao carregar scripts', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchScripts();
  }, [activeFilter, activeScope, localSearch]);

  const handleDeleteScript = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o script "${id}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await api.deleteScript(id);
      showToast('Script excluído!', 'O script e seus links RAW foram removidos com sucesso.');
      setScripts((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      showToast('Erro ao excluir', err.message, 'error');
    }
  };

  // Calculate statistics
  const totalScripts = scripts.length;
  const totalAccesses = scripts.reduce((acc, s) => acc + (s.accessCount || 0), 0);
  const publicCount = scripts.filter((s) => !s.isPasswordProtected).length;
  const protectedCount = scripts.filter((s) => s.isPasswordProtected).length;

  return (
    <div className="space-y-6">
      {/* ScriptsGR Platform Hero Banner */}
      <div
        className={`relative overflow-hidden p-6 sm:p-7 rounded-3xl border transition-all ${
          mode === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800'
            : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${accentClasses.badgeBg}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Plataforma Oficial ScriptsGR</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>RAW 200 OK Ativo</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
              ScriptsGR Hub & RAW Loader
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Hospedagem de scripts Luau de alta performance para Roblox. Links RAW limpos em <code className="font-mono text-cyan-300">text/plain</code> prontos para execução imediata via <code className="font-mono text-cyan-300">loadstring</code>, com sistema de chaves e senhas criptografadas.
            </p>

            {/* Quick Feature Badges (Flaticon Style Icons) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-semibold text-slate-400">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero Latência RAW</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tokens Antifurto</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>100% Compatível Luau</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-row md:flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              id="btn-hero-create-script"
              onClick={() => onNavigate('create')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
            >
              <Plus className="w-4 h-4" />
              <span>Novo Script</span>
            </button>
            <button
              id="btn-hero-raw-manager"
              onClick={() => onNavigate('raw-manager')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition-all ${
                mode === 'dark'
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
              }`}
            >
              <Link2 className="w-4 h-4 text-cyan-400" />
              <span>Gerenciar RAW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pacotes & Categorias de Scripts (Flaticon Style Icon Bar) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Pacotes de Ícones & Categorias</span>
          </div>
          <span className="text-[11px] text-slate-500">Filtragem rápida de scripts</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-${cat.id}`}
                onClick={() => handleSelectCategory(cat)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all active:scale-98 ${
                  isSelected
                    ? `${accentClasses.badgeBg} font-bold shadow-sm`
                    : mode === 'dark'
                    ? 'bg-slate-900/80 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 hover:border-slate-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <IconComp className={`w-4 h-4 ${isSelected ? accentClasses.text : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Welcome & Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Total de Scripts</span>
            <Code2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{totalScripts}</div>
          <p className="text-[11px] text-slate-500 mt-1">Scripts cadastrados</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Requisições RAW</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalAccesses}</div>
          <p className="text-[11px] text-slate-500 mt-1">Execuções de loadstring</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Públicos 🔓</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{publicCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Acesso direto sem senha</p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
            <span>Protegidos 🔒</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{protectedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Com senha e token key</p>
        </div>
      </div>

      {/* Control Bar: Scope, Filters, Search & View Mode */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
          mode === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Left: Scope Selection (Meus Scripts / Explorar) & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {user && (
            <div className="flex items-center p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold">
              <button
                id="tab-scope-mine"
                onClick={() => setActiveScope('mine')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeScope === 'mine'
                    ? `${accentClasses.primaryBg} text-slate-950 font-bold shadow-sm`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Meus Scripts
              </button>
              <button
                id="tab-scope-explore"
                onClick={() => setActiveScope('explore')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeScope === 'explore'
                    ? `${accentClasses.primaryBg} text-slate-950 font-bold shadow-sm`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Explorar Todos
              </button>
            </div>
          )}

          {/* Visibility filter pills */}
          <div className="flex items-center gap-1.5">
            <button
              id="filter-all"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeFilter === 'all'
                  ? `${accentClasses.badgeBg} font-bold`
                  : mode === 'dark'
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({totalScripts})
            </button>
            <button
              id="filter-public"
              onClick={() => setActiveFilter('public')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeFilter === 'public'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold'
                  : mode === 'dark'
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔓 Públicos
            </button>
            <button
              id="filter-protected"
              onClick={() => setActiveFilter('protected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeFilter === 'protected'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold'
                  : mode === 'dark'
                  ? 'border-slate-800 text-slate-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔒 Protegidos
            </button>
          </div>
        </div>

        {/* Right: Search, Refresh & Create CTA */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              id="input-filter-search"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar scripts..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none transition-all ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              } ${accentClasses.ring}`}
            />
          </div>

          <button
            id="btn-refresh-scripts"
            onClick={fetchScripts}
            title="Atualizar lista"
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn-dashboard-new-script"
            onClick={() => onNavigate('create')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 shadow-md transition-all ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <Plus className="w-4 h-4" />
            <span>Novo Script</span>
          </button>
        </div>
      </div>

      {/* Script List or Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Carregando seus scripts Luau...</p>
        </div>
      ) : scripts.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed ${
            mode === 'dark' ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-600'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-cyan-400">
            <Terminal className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-1">Nenhum script encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            {localSearch
              ? `Não foram encontrados scripts correspondentes à busca "${localSearch}".`
              : 'Você ainda não possui nenhum script salvo. Crie seu primeiro script Luau agora para obter um link RAW e testar no loadstring!'}
          </p>
          <button
            id="btn-empty-create"
            onClick={() => onNavigate('create')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Meu Primeiro Script</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onEdit={(id) => onNavigate('edit', id)}
              onView={(id) => onNavigate('view', id)}
              onDelete={handleDeleteScript}
              onManageRaw={(id) => onNavigate('raw-manager', id)}
              onUnlockRequest={(s) => setUnlockTarget(s)}
            />
          ))}
        </div>
      )}

      {/* Unlock Password Modal */}
      {unlockTarget && (
        <PasswordModal
          scriptId={unlockTarget.id}
          scriptTitle={unlockTarget.title}
          isOpen={Boolean(unlockTarget)}
          onClose={() => setUnlockTarget(null)}
          onUnlocked={() => {
            fetchScripts();
          }}
        />
      )}
    </div>
  );
};
