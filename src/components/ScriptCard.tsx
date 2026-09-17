import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  Eye,
  Edit,
  Trash2,
  Lock,
  Globe,
  KeyRound,
  ExternalLink,
  Calendar,
  Activity,
  Terminal,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';

interface ScriptCardProps {
  script: ScriptItem;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onManageRaw: (id: string) => void;
  onUnlockRequest?: (script: ScriptItem) => void;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  onEdit,
  onView,
  onDelete,
  onManageRaw,
  onUnlockRequest,
}) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://luauraw.dev';
  
  // Default key to use in loadstring if available
  const activeKey = script.accessKeys && script.accessKeys.length > 0 ? script.accessKeys[0].key : undefined;
  
  const rawUrl = script.isPasswordProtected && activeKey
    ? `${origin}/raw/${script.id}?key=${activeKey}`
    : `${origin}/raw/${script.id}`;

  const loadstringCode = `loadstring(game:HttpGet("${rawUrl}"))()`;

  const copyRawUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(rawUrl);
      setCopiedRaw(true);
      showToast('Link RAW Copiado!', rawUrl);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      showToast('Erro ao copiar', 'Falha ao acessar área de transferência.', 'error');
    }
  };

  const copyLoadstring = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(loadstringCode);
      setCopiedLoadstring(true);
      showToast('Loadstring Copiado!', 'Código pronto para ser executado no Luau.');
      setTimeout(() => setCopiedLoadstring(false), 2000);
    } catch {
      showToast('Erro ao copiar', 'Falha ao acessar área de transferência.', 'error');
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 hover:shadow-xl ${
        mode === 'dark'
          ? 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700/90 hover:bg-slate-900'
          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
      }`}
    >
      {/* Top Header & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Visibility Badge */}
            {script.isPasswordProtected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Lock className="w-3 h-3" />
                <span>Protegido</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Globe className="w-3 h-3" />
                <span>Público</span>
              </span>
            )}

            {/* Unique ID Badge */}
            <span
              onClick={copyRawUrl}
              title="Clique para copiar link RAW deste ID"
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono cursor-pointer transition-colors ${
                mode === 'dark' ? 'bg-slate-800/90 text-slate-300 hover:text-cyan-400' : 'bg-slate-100 text-slate-700 hover:text-cyan-600'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>{script.id}</span>
            </span>
          </div>

          {/* Access counter badge */}
          <div
            title="Total de requisições RAW / acessos"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0 px-2 py-0.5 rounded-lg bg-slate-800/40 border border-slate-700/40"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{script.accessCount || 0} acessos</span>
          </div>
        </div>

        {/* Script Title & Description */}
        <h3
          onClick={() => onView(script.id)}
          className="text-base font-bold text-slate-100 group-hover:text-cyan-400 transition-colors cursor-pointer line-clamp-1"
        >
          {script.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
          {script.description || 'Sem descrição cadastrada.'}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Criado: {formatDate(script.createdAt)}</span>
          </div>
          {script.updatedAt && (
            <div className="hidden sm:flex items-center gap-1">
              <span>Atualizado: {formatDate(script.updatedAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Code / Loadstring Quick Preview Bar */}
      <div className={`mx-5 my-1 p-2.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 select-all ${
        mode === 'dark' ? 'bg-slate-950/80 border-slate-800/80 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-800'
      }`}>
        <div className="truncate flex-1 text-slate-400">
          <span className="text-cyan-400 font-semibold">loadstring</span>(game:HttpGet(&quot;...&quot;))()
        </div>
        <button
          id={`btn-copy-loadstring-${script.id}`}
          onClick={copyLoadstring}
          title="Copiar Loadstring Luau completo"
          className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
            copiedLoadstring
              ? 'bg-emerald-500 text-slate-950'
              : `${accentClasses.primaryBg} text-slate-950 ${accentClasses.primaryHover}`
          }`}
        >
          {copiedLoadstring ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copiedLoadstring ? 'Loadstring Copiado' : 'Copiar Loadstring'}</span>
        </button>
      </div>

      {/* Action Buttons Bar */}
      <div
        className={`p-4 pt-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-t text-xs ${
          mode === 'dark' ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            id={`btn-copy-raw-${script.id}`}
            onClick={copyRawUrl}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              copiedRaw
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : mode === 'dark'
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700/60'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRaw ? 'RAW Copiado' : 'Copiar RAW'}</span>
          </button>

          <button
            id={`btn-view-${script.id}`}
            onClick={() => onView(script.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            title="Ver código e detalhes"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver</span>
          </button>

          <button
            id={`btn-manage-raw-${script.id}`}
            onClick={() => onManageRaw(script.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
            title="Gerenciar Link RAW e Chaves"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RAW / Chaves</span>
          </button>
        </div>

        {/* Owner actions */}
        <div className="flex items-center gap-1">
          {script.isOwner && (
            <>
              <button
                id={`btn-edit-${script.id}`}
                onClick={() => onEdit(script.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
                title="Editar Script"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                id={`btn-delete-${script.id}`}
                onClick={() => onDelete(script.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Excluir Script"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {!script.isOwner && script.isPasswordProtected && onUnlockRequest && (
            <button
              onClick={() => onUnlockRequest(script)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 hover:bg-amber-500/20"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Desbloquear</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
