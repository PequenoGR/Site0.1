import React, { useState, useEffect } from 'react';
import {
  Code2,
  KeyRound,
  ChevronDown,
  Check,
  Download,
  Copy,
  ArrowLeft,
  Edit,
  Lock,
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { copyToClipboard } from '../lib/clipboard';
import { ScriptItem } from '../types';

interface ViewScriptPageProps {
  scriptId: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const ViewScriptPage: React.FC<ViewScriptPageProps> = ({ scriptId, onNavigate }) => {
  const { showToast } = useToast();

  const [script, setScript] = useState<ScriptItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Password unlock if protected
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      try {
        const res = await api.getScriptById(scriptId);
        setScript(res.script);
        if (!res.script.isPasswordProtected) {
          setIsUnlocked(true);
        }
      } catch (err: any) {
        showToast('Erro ao carregar script', err.message, 'error');
        onNavigate('dashboard');
      } finally {
        setLoading(false);
      }
    }
    if (scriptId) {
      loadScript();
    }
  }, [scriptId]);

  const handleDownloadCode = () => {
    if (!script?.code) {
      showToast('Aviso', 'Não há código para baixar.', 'info');
      return;
    }
    const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (script.title || 'script').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `${safeName}.lua`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Download iniciado', `${safeName}.lua foi baixado.`);
  };

  const handleCopyCode = async () => {
    if (!script?.code) {
      showToast('Aviso', 'Não há código para copiar.', 'info');
      return;
    }
    const success = await copyToClipboard(script.code);
    if (success) {
      setCopied(true);
      showToast('Copiado!', 'Código copiado para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUnlock = async () => {
    if (!passwordInput.trim()) return;
    try {
      const res = await api.unlockScript(scriptId, passwordInput.trim());
      setScript((prev) => (prev ? { ...prev, code: res.code } : null));
      setIsUnlocked(true);
      setUnlockModalOpen(false);
      showToast('Desbloqueado!', 'Código liberado com sucesso.');
    } catch (err: any) {
      showToast('Senha incorreta', err.message || 'Senha incorreta para este script.', 'error');
    }
  };

  if (loading || !script) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scriptsgr.dev';
  const rawUrl = `${origin}/raw/${script.id}`;
  const loadstringSnippet = `loadstring(game:HttpGet("${rawUrl}"))()`;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 pb-16 select-none">
      <div className="w-full max-w-[340px] sm:max-w-[380px] flex flex-col items-center gap-4">
        {/* Top Back and Edit Row */}
        <div className="w-full flex items-center justify-between pb-1">
          <button
            type="button"
            id="btn-view-back"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {script.isOwner ? (
            <button
              type="button"
              id="btn-view-goto-edit"
              onClick={() => onNavigate('edit', script.id)}
              className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
              Autor: @{script.authorUsername || 'Anônimo'}
            </span>
          )}
        </div>

        {/* 1. Upload Photo / Script Photo Container */}
        <div
          id="view-photo-container"
          className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-r from-[#29687a] via-[#1a4b6e] to-[#123668] border border-[#2b5d84] flex flex-col items-center justify-center relative overflow-hidden shadow-xl"
        >
          {script.thumbnailUrl ? (
            <img
              src={script.thumbnailUrl}
              alt={script.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#b8dff0] tracking-wide drop-shadow-md">
                Upload Photo
              </span>
            </div>
          )}
        </div>

        {/* 2. Name Section */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide">
            Name
          </label>
          <div className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2 sm:py-2.5">
            <span className="text-sm sm:text-base font-semibold text-white truncate block">
              {script.title}
            </span>
          </div>
        </div>

        {/* 3. Categoria Section */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide">
            Categoria
          </label>
          <div className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-white">
              {script.category || 'Geral'}
            </span>
            <span className="text-white text-xs font-bold font-mono">^</span>
          </div>
        </div>

        {/* 4. Code Header & Action Buttons */}
        <div className="w-full flex items-center justify-between pt-1">
          {/* Green Code </> title */}
          <div className="flex items-center gap-1.5">
            <span className="text-lg sm:text-xl font-black text-[#00e676] tracking-tight">
              Code
            </span>
            <div className="border border-[#00e676] rounded px-1 py-0.2 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#00e676] font-mono leading-none">&lt;/&gt;</span>
            </div>
          </div>

          {/* Right actions: Senha pill & Download / Copiar pill buttons */}
          <div className="flex items-center gap-1.5">
            {/* Senha button */}
            {script.isPasswordProtected ? (
              <button
                id="btn-view-password-status"
                type="button"
                onClick={() => setUnlockModalOpen(true)}
                className="px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold flex items-center gap-1 bg-amber-600 text-white transition-all shadow-xs"
              >
                <KeyRound className="w-3 h-3 text-amber-200 stroke-[2.5]" />
                <span>{isUnlocked ? 'Protegido' : 'Desbloquear'}</span>
              </button>
            ) : null}

            {/* Download & Copiar group */}
            <div className="flex items-center bg-[#4665c2] rounded-md overflow-hidden text-[11px] sm:text-xs font-bold text-white shadow-xs">
              <button
                id="btn-view-script-download"
                type="button"
                onClick={handleDownloadCode}
                className="px-2.5 py-1 hover:bg-[#3b57aa] transition-colors flex items-center gap-1 border-r border-[#3b57aa]"
              >
                <span>Download</span>
              </button>
              <button
                id="btn-view-script-copy"
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 hover:bg-[#3b57aa] transition-colors flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : null}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. Code Dark Blue Text Area Box */}
        <div className="w-full bg-[#1b2b54] border border-[#293e78] rounded-xl p-3 shadow-inner">
          {script.isPasswordProtected && !isUnlocked ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <Lock className="w-6 h-6 text-amber-400" />
              <p className="text-xs text-slate-300">Este script está protegido por senha.</p>
              <button
                type="button"
                onClick={() => setUnlockModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold mt-1"
              >
                Digitar Senha
              </button>
            </div>
          ) : (
            <textarea
              id="textarea-view-script-code"
              rows={7}
              readOnly
              value={script.code || ''}
              placeholder=""
              spellCheck={false}
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed cursor-text select-text"
            />
          )}
        </div>

        {/* 6. Primary Action Button */}
        <div className="w-full pt-2">
          {script.isOwner ? (
            <button
              id="btn-view-primary-action"
              type="button"
              onClick={() => onNavigate('edit', script.id)}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2e52b2] hover:bg-[#3760cc] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Script</span>
            </button>
          ) : script.isPasswordProtected && !isUnlocked ? (
            <button
              id="btn-view-primary-action"
              type="button"
              onClick={() => setUnlockModalOpen(true)}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Desbloquear com Senha</span>
            </button>
          ) : (
            <button
              id="btn-view-primary-action"
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(loadstringSnippet);
                if (ok) {
                  showToast('Loadstring Copiado!', 'Código de carregamento copiado com sucesso.');
                }
              }}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2e52b2] hover:bg-[#3760cc] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Loadstring</span>
            </button>
          )}
        </div>
      </div>

      {/* Unlock Password Modal */}
      {unlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#172346] border border-[#2e4785] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Desbloquear Script</span>
              </div>
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Digite a senha definida pelo criador para visualizar o código fonte deste script.
            </p>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Digite a senha..."
              className="w-full bg-[#101933] border border-[#2e4785] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4367c2]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnlockModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUnlock}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2e52b2] hover:bg-[#3760cc] text-white transition-colors"
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
