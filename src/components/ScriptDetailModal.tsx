import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Code2,
  Lock,
  Globe,
  Eye,
  KeyRound,
  Edit,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';
import { useAppVersion } from '../context/VersionContext';
import { copyToClipboard } from '../lib/clipboard';
import { formatConsoleTime } from './ConsoleScriptCard';
import { getRawUrl, getLoadstring } from '../lib/rawUrl';

interface ScriptDetailModalProps {
  script: ScriptItem | null;
  isOpen: boolean;
  onClose: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onManageRaw: (id: string) => void;
}

export const ScriptDetailModal: React.FC<ScriptDetailModalProps> = ({
  script,
  isOpen,
  onClose,
  onView,
  onEdit,
  onDelete,
  onManageRaw,
}) => {
  const { showToast } = useToast();
  const { accentInfo } = useTheme();
  const { incrementVersion } = useAppVersion();
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);

  if (!isOpen || !script) return null;

  const activeKey = script.accessKeys && script.accessKeys.length > 0 ? script.accessKeys[0].key : undefined;
  const rawUrl = getRawUrl(script, activeKey, true);
  const loadstringCode = getLoadstring(rawUrl);

  const handleCopyRaw = async () => {
    const success = await copyToClipboard(rawUrl);
    if (success) {
      setCopiedRaw(true);
      incrementVersion('Cópia de Link RAW');
      showToast('Link RAW Copiado!', rawUrl);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleCopyLoadstring = async () => {
    const success = await copyToClipboard(loadstringCode);
    if (success) {
      setCopiedLoadstring(true);
      incrementVersion('Cópia de Script');
      showToast('Script Copiado!', 'Código copiado com sucesso.');
      setTimeout(() => setCopiedLoadstring(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header with image or badge */}
        <div className="relative h-44 bg-black flex items-center justify-center overflow-hidden border-b border-slate-800">
          {script.thumbnailUrl ? (
            <img
              src={script.thumbnailUrl}
              alt={script.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white leading-none">?</span>
              <span className="text-sm font-bold text-white tracking-wide mt-1">Sem foto</span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-white border border-white/20 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Top Badges on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="bg-black/80 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-black text-white shadow-md">
              <Eye className="w-3.5 h-3.5 text-white" />
              <span>{script.accessCount || 0} visualizações</span>
            </div>
            <div className="bg-black/80 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-black text-white shadow-md">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>{formatConsoleTime(script.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {script.isPasswordProtected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Lock className="w-3 h-3" />
                    <span>Protegido</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <Globe className="w-3 h-3" />
                    <span>Público</span>
                  </span>
                )}
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  ID: {script.id}
                </span>
                {script.authorUsername && (
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                    Autor: @{script.authorUsername}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {script.title}
              </h2>
              {script.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {script.description}
                </p>
              )}
            </div>
          </div>

          {/* Security Notice for Password Protected Script */}
          {script.isPasswordProtected && !script.isOwner && !script.isUnlocked && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-300 text-xs">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Script protegido com senha. Clique em <strong>Ver Código</strong> para digitar a senha ou use a chave autorizada.</span>
            </div>
          )}

          {/* RAW Link & Script Box */}
          <div 
            style={{ borderColor: accentInfo.cardBorderHex }}
            className="p-3.5 rounded-2xl bg-[#090d16] border shadow-lg space-y-3 transition-all"
          >
            {/* RAW Link Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Link RAW</span>
                <span className="text-[10px] text-slate-500 font-mono">HTTPS</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-black border border-slate-800 text-cyan-300 font-mono text-[11px] truncate select-all">
                  {rawUrl}
                </div>
                <button
                  type="button"
                  id="modal-btn-copy-raw"
                  onClick={handleCopyRaw}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-98 shrink-0"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors shrink-0"
                  title="Abrir no Navegador"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Script Loadstring Section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Script (Loadstring)</span>
                <span className="text-[10px] text-slate-500 font-mono">text/plain</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-slate-800 text-slate-300 font-mono text-[11px] break-all select-all">
                {loadstringCode}
              </div>
              <button
                type="button"
                id="modal-btn-copy-loadstring"
                onClick={handleCopyLoadstring}
                style={{
                  backgroundColor: copiedLoadstring ? '#10b981' : accentInfo.accentHex,
                }}
                className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all hover:brightness-110"
              >
                {copiedLoadstring ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                <span>{copiedLoadstring ? 'Script Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onView(script.id);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm text-xs"
              >
                <Code2 className="w-3.5 h-3.5 text-white" />
                <span>Ver Código</span>
              </button>
            </div>

            {script.isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    onClose();
                    onEdit(script.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                  title="Editar Script"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onDelete(script.id);
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Excluir Script"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
