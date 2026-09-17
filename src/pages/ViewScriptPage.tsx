import React, { useState, useEffect } from 'react';
import {
  Code2,
  Lock,
  Globe,
  Copy,
  Check,
  Download,
  Edit,
  ArrowLeft,
  Terminal,
  ExternalLink,
  Calendar,
  Activity,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { LuauEditor } from '../components/LuauEditor';
import { PasswordModal } from '../components/PasswordModal';
import { api } from '../lib/api';
import { copyToClipboard } from '../lib/clipboard';
import { ScriptItem } from '../types';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

interface ViewScriptPageProps {
  scriptId: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const ViewScriptPage: React.FC<ViewScriptPageProps> = ({ scriptId, onNavigate }) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [script, setScript] = useState<ScriptItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scriptsgr.dev';

  const loadScript = async () => {
    setLoading(true);
    try {
      const res = await api.getScriptById(scriptId);
      setScript(res.script);
    } catch (err: any) {
      showToast('Erro ao carregar script', err.message, 'error');
      onNavigate('dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScript();
  }, [scriptId]);

  if (loading || !script) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Carregando visualização do script...</p>
      </div>
    );
  }

  const activeKey = script.accessKeys && script.accessKeys.length > 0 ? script.accessKeys[0].key : undefined;
  const rawUrl = script.isPasswordProtected && activeKey
    ? `${origin}/raw/${script.id}?key=${activeKey}`
    : `${origin}/raw/${script.id}`;

  const loadstringSnippet = `loadstring(game:HttpGet("${rawUrl}"))()`;

  const copyRaw = async () => {
    const success = await copyToClipboard(rawUrl);
    if (success) {
      setCopiedRaw(true);
      showToast('Link RAW Copiado!', rawUrl);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      showToast('Erro ao copiar', 'Não foi possível copiar o link', 'error');
    }
  };

  const copyLoadstring = async () => {
    const success = await copyToClipboard(loadstringSnippet);
    if (success) {
      setCopiedLoadstring(true);
      showToast('Loadstring Copiado!', 'Pronto para executar no Luau / Roblox.');
      setTimeout(() => setCopiedLoadstring(false), 2000);
    } else {
      showToast('Erro ao copiar', 'Não foi possível copiar o comando', 'error');
    }
  };

  const downloadScript = () => {
    if (!script.code) return;
    const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${script.id}.luau`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Download iniciado', `${script.id}.luau baixado com sucesso.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`p-2 rounded-xl border transition-colors ${
              mode === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-100 tracking-tight">{script.title}</h1>
              {script.isPasswordProtected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Lock className="w-3 h-3" />
                  <span>Protegido</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Globe className="w-3 h-3" />
                  <span>Público</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Criado por @{script.authorUsername} • {script.accessCount} acessos totais
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {script.isOwner && (
            <button
              onClick={() => onNavigate('edit', script.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar Script</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('raw-manager', script.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-cyan-400 text-xs font-semibold transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Gerenciar RAW & Keys</span>
          </button>

          {script.code && (
            <button
              onClick={downloadScript}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-slate-950 shadow-md ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar .luau</span>
            </button>
          )}
        </div>
      </div>

      {/* RAW Link & Loadstring Execution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* RAW Link Card */}
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Link RAW Oficial</span>
            </span>
            <a
              href={rawUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Abrir Endpoint</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="input-raw-url"
              readOnly
              value={rawUrl}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-cyan-400 select-all"
            />
            <button
              id="btn-copy-raw"
              onClick={copyRaw}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0"
            >
              {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRaw ? 'RAW Copiado' : 'Copiar RAW'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Retorna Content-Type: text/plain; charset=utf-8 sem HTML ou menus.</p>
        </div>

        {/* Loadstring Card */}
        <div
          className={`p-4 rounded-2xl border space-y-2 ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>Código Loadstring Luau</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Roblox Ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="input-loadstring-code"
              readOnly
              value={loadstringSnippet}
              className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-amber-300 select-all"
            />
            <button
              id="btn-copy-loadstring"
              onClick={copyLoadstring}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-all shrink-0 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
            >
              {copiedLoadstring ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLoadstring ? 'Loadstring Copiado' : 'Copiar Loadstring'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Cole diretamente no console ou executor Luau.</p>
        </div>
      </div>

      {/* Script Description (if any) */}
      {script.description && (
        <div
          className={`p-4 rounded-2xl border ${
            mode === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          } text-xs leading-relaxed`}
        >
          <span className="font-bold text-slate-400 block mb-1">Descrição:</span>
          {script.description}
        </div>
      )}

      {/* Code Viewer or Locked Overlay */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Código Fonte Luau</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {script.code ? `${script.code.split('\n').length} linhas` : 'Acesso Restrito'}
          </span>
        </div>

        {script.isPasswordProtected && !script.isUnlocked && !script.isOwner ? (
          <div className="p-12 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Este script está protegido por senha</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                O autor protegeu este código Luau. Digite a senha para visualizar o código e gerar a chave para uso no loadstring.
              </p>
            </div>
            <button
              onClick={() => setUnlockModalOpen(true)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg ${accentClasses.primaryBg}`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Desbloquear com Senha</span>
            </button>
          </div>
        ) : (
          <LuauEditor
            value={script.code || ''}
            onChange={() => {}}
            readOnly={true}
            minHeight="520px"
          />
        )}
      </div>

      {/* Password Modal */}
      <PasswordModal
        scriptId={script.id}
        scriptTitle={script.title}
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        onUnlocked={(unlockedCode) => {
          setScript((prev) => (prev ? { ...prev, code: unlockedCode, isUnlocked: true } : null));
          setUnlockModalOpen(false);
        }}
      />
    </div>
  );
};
