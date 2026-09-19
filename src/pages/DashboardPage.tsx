import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Terminal,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { api } from '../lib/api';
import { ConsoleScriptCard } from '../components/ConsoleScriptCard';
import { ScriptDetailModal } from '../components/ScriptDetailModal';
import { PasswordModal } from '../components/PasswordModal';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { useAppVersion } from '../context/VersionContext';

interface DashboardPageProps {
  onNavigate: (tab: string, scriptId?: string) => void;
  searchQuery?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, searchQuery = '' }) => {
  const { showToast } = useToast();
  const { accentInfo } = useTheme();
  const { incrementVersion } = useAppVersion();

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Selected script for console modal popup
  const [selectedModalScript, setSelectedModalScript] = useState<ScriptItem | null>(null);

  // Unlock modal state
  const [unlockTarget, setUnlockTarget] = useState<ScriptItem | null>(null);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await api.getScripts({
        filter: 'all',
        search: localSearch,
        scope: 'explore',
      });
      const list = Array.isArray(res?.scripts) ? res.scripts : [];
      setScripts(list);
    } catch (err: any) {
      showToast('Erro ao carregar scripts', err.message, 'error');
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    fetchScripts();
  }, [localSearch]);

  const handleDeleteScript = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o script "${id}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await api.deleteScript(id);
      incrementVersion('Script excluído');
      showToast('Script excluído!', 'O script e seus links RAW foram removidos com sucesso.');
      setScripts((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      showToast('Erro ao excluir', err.message, 'error');
    }
  };

  const handleSearchSubmit = () => {
    incrementVersion('Pesquisa realizada');
    fetchScripts();
  };

  return (
    <div className="space-y-5">
      {/* Console Search Bar */}
      <div
        style={{
          borderColor: accentInfo.accentHex,
          boxShadow: `0 0 25px ${accentInfo.glowRgba}`,
        }}
        className="bg-[#111827]/90 border-2 rounded-2xl p-1.5 sm:p-2 pl-4 sm:pl-5 flex items-center gap-3 max-w-4xl mx-auto w-full my-4 sm:my-6 transition-all duration-300"
      >
        <Search style={{ color: accentInfo.accentHex }} className="w-5 sm:w-6 h-5 sm:h-6 shrink-0" />
        <input
          id="input-console-search"
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit();
          }}
          placeholder="Pesquisar scripts..."
          className="w-full bg-transparent border-none text-slate-100 text-sm sm:text-base placeholder-slate-400 focus:outline-none"
        />
        <button
          id="btn-console-search"
          onClick={handleSearchSubmit}
          style={{
            backgroundColor: accentInfo.accentHex,
          }}
          className="text-white font-extrabold px-6 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base transition-all shrink-0 shadow-md active:scale-95"
        >
          Pesquisar
        </button>
      </div>

      {/* Script Grid matching screenshot (4-columns) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div
            style={{ borderColor: accentInfo.accentHex, borderTopColor: 'transparent' }}
            className="w-8 h-8 border-2 rounded-full animate-spin mb-3"
          />
          <p className="text-sm font-medium">Carregando scripts...</p>
        </div>
      ) : (!Array.isArray(scripts) || scripts.length === 0) ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-400 max-w-5xl mx-auto w-full">
          <Terminal className="w-10 h-10 text-slate-500 mb-3" />
          <h3 className="text-base font-bold text-slate-200 mb-1">Nenhum script encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
            {localSearch
              ? `Nenhum script corresponde à busca "${localSearch}".`
              : 'Clique nos três tracinhos do menu para adicionar seu primeiro script.'}
          </p>
          <button
            id="btn-empty-create"
            onClick={() => onNavigate('create')}
            style={{
              backgroundColor: accentInfo.accentHex,
            }}
            className="px-4 py-2 rounded-xl font-bold text-xs text-white flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Script</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 max-w-5xl mx-auto w-full">
          {scripts.map((script) => (
            <ConsoleScriptCard
              key={script.id}
              script={script}
              onClick={(s) => {
                incrementVersion(`Script selecionado: ${s.title}`);
                setSelectedModalScript(s);
              }}
            />
          ))}
        </div>
      )}

      {/* Script Detail Quick Modal */}
      <ScriptDetailModal
        script={selectedModalScript}
        isOpen={Boolean(selectedModalScript)}
        onClose={() => setSelectedModalScript(null)}
        onView={(id) => onNavigate('view', id)}
        onEdit={(id) => onNavigate('edit', id)}
        onDelete={handleDeleteScript}
        onManageRaw={(id) => onNavigate('raw-manager', id)}
      />

      {/* Unlock Password Modal */}
      {unlockTarget && (
        <PasswordModal
          scriptId={unlockTarget.id}
          scriptTitle={unlockTarget.title}
          isOpen={Boolean(unlockTarget)}
          onClose={() => setUnlockTarget(null)}
          onUnlocked={() => {
            incrementVersion('Script desbloqueado');
            fetchScripts();
          }}
        />
      )}
    </div>
  );
};
