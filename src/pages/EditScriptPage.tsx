import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  KeyRound,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowLeft,
  Trash2,
  Gamepad2,
  Sparkles,
  Download,
  Copy,
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { useAppVersion } from '../context/VersionContext';
import { copyToClipboard } from '../lib/clipboard';
import { RobloxGameSelectorModal } from '../components/RobloxGameSelectorModal';
import { CATEGORIES_LIST } from '../lib/robloxGames';

interface EditScriptPageProps {
  scriptId: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const EditScriptPage: React.FC<EditScriptPageProps> = ({ scriptId, onNavigate }) => {
  const { showToast } = useToast();
  const { incrementVersion } = useAppVersion();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Universal');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedGameName, setSelectedGameName] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isOwner, setIsOwner] = useState(true);
  const [authorName, setAuthorName] = useState('');

  // Password modal/state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  // Status
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      try {
        const res = await api.getScriptById(scriptId);
        setName(res.script.title || '');
        setCategory(res.script.category || 'Universal');
        setPhotoPreview(res.script.thumbnailUrl || null);
        setCode(res.script.code || '');
        setHasPassword(Boolean(res.script.isPasswordProtected));
        setIsOwner(Boolean(res.script.isOwner));
        setAuthorName(res.script.authorUsername || res.script.authorEmail || 'Outro usuário');
        if (!res.script.isOwner) {
          showToast('Permissão Negada', 'Apenas o autor que criou este script pode editá-lo.', 'error');
          onNavigate('view', scriptId);
          return;
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

  // When user selects a game from Roblox catalog
  const handleGameSelected = (game: {
    name: string;
    category: string;
    thumbnailUrl: string;
    placeId?: string;
  }) => {
    setSelectedGameName(game.name);
    setPhotoPreview(game.thumbnailUrl);
    if (game.category) {
      setCategory(game.category);
    }
  };

  // File input ref for loading scripts from folders
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Script from file/folder
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        showToast('Script Carregado!', `Arquivo "${file.name}" carregado com sucesso.`);
      }
    };
    reader.onerror = () => {
      showToast('Erro ao ler arquivo', 'Não foi possível carregar o arquivo das pastas.', 'error');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download Code as .lua file
  const handleDownloadCode = () => {
    if (!code) {
      showToast('Aviso', 'Escreva ou cole algum código antes de fazer o download.', 'info');
      return;
    }
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'script';
    link.download = `${safeName}.lua`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    incrementVersion('Download de script');
    showToast('Download iniciado', `${safeName}.lua foi baixado.`);
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    if (!code) {
      showToast('Aviso', 'Não há código para copiar.', 'info');
      return;
    }
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      incrementVersion('Cópia de código');
      showToast('Copiado!', 'Código copiado para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Save / Submit Edited Script
  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast('Nome obrigatório', 'Por favor informe o Name do script.', 'error');
      return;
    }

    if (!code.trim()) {
      showToast('Código obrigatório', 'Por favor insira o código no campo Code.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateScript(scriptId, {
        title: name.trim(),
        category: category,
        description: selectedGameName ? `Jogo: ${selectedGameName}` : '',
        thumbnailUrl: photoPreview || '',
        code: code,
        isPasswordProtected: hasPassword,
        ...(password.trim() ? { password: password.trim() } : {}),
      });

      incrementVersion(`Script atualizado: ${name}`);
      showToast('Script atualizado com sucesso!', `As alterações foram salvas.`);
      onNavigate('dashboard');
    } catch (err: any) {
      showToast('Erro ao salvar script', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este script? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      await api.deleteScript(scriptId);
      incrementVersion('Script excluído');
      showToast('Script excluído!', 'O script foi removido com sucesso.');
      onNavigate('dashboard');
    } catch (err: any) {
      showToast('Erro ao excluir', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 pb-16 select-none">
      {/* Roblox Game Selector Modal */}
      <RobloxGameSelectorModal
        isOpen={isGameSelectorOpen}
        onClose={() => setIsGameSelectorOpen(false)}
        onSelectGame={handleGameSelected}
        currentThumbnailUrl={photoPreview}
        currentGameName={selectedGameName || name}
      />

      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-4">
        {/* Top Back and Delete Row */}
        <div className="w-full flex items-center justify-between pb-0.5 px-0.5">
          <button
            type="button"
            id="btn-edit-back"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {isOwner ? (
            <button
              type="button"
              id="btn-edit-delete"
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              Autor: @{authorName}
            </span>
          )}
        </div>

        {!isOwner && (
          <div className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-semibold">
            Você está visualizando este script em modo leitura. Apenas o criador ({authorName}) pode alterá-lo ou apagá-lo.
          </div>
        )}

        {/* 1. Official Roblox Game Photo Selector Box */}
        <div
          id="btn-edit-choose-roblox-game"
          onClick={() => isOwner && setIsGameSelectorOpen(true)}
          className={`w-full aspect-[4/3] rounded-2xl bg-[#14234b] border border-[#2b5d84] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200 shadow-xl group ${
            isOwner ? 'cursor-pointer hover:brightness-110 active:scale-[0.99]' : 'cursor-default'
          }`}
        >
          {photoPreview ? (
            <>
              <img
                src={photoPreview}
                alt="Game Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.includes('/api/roblox/icon/')) {
                    img.src = `/api/roblox/icon/2753915549`;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                <div className="self-end px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Foto Oficial Roblox</span>
                </div>
                
                {isOwner && (
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-medium text-blue-300 flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Clique para trocar de jogo ou buscar por ID</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <span className="text-base sm:text-lg font-extrabold text-[#b8dff0] tracking-wide drop-shadow-md">
                Escolher Jogo do Roblox
              </span>
            </div>
          )}
        </div>

        {/* 2. Name Section */}
        <div className="w-full flex flex-col items-center gap-1.5">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide text-center">
            Name
          </label>
          <div className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2.5 transition-all focus-within:border-[#4367c2] focus-within:ring-1 focus-within:ring-[#4367c2]">
            <input
              id="input-edit-script-name"
              type="text"
              value={name}
              disabled={!isOwner}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder-slate-500 focus:outline-none disabled:opacity-60"
            />
          </div>
        </div>

        {/* 3. Categoria Dropdown Section */}
        <div className="w-full flex flex-col items-center gap-1.5 relative">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide text-center">
            Categoria
          </label>
          <div
            id="dropdown-edit-category-select"
            onClick={() => isOwner && setIsCategoryOpen(!isCategoryOpen)}
            className={`w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all ${
              isOwner ? 'cursor-pointer hover:bg-[#25396e] active:scale-[0.99]' : 'opacity-70 cursor-default'
            }`}
          >
            <span className="text-xs sm:text-sm font-semibold text-white truncate pr-2">
              {category}
            </span>
            <span className="text-white text-xs font-bold shrink-0">
              {isCategoryOpen ? (
                <ChevronUp className="w-4 h-4 stroke-[3]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[3]" />
              )}
            </span>
          </div>

          {/* Categoria dropdown list */}
          {isCategoryOpen && isOwner && (
            <div className="absolute top-full mt-1.5 z-40 w-full bg-[#172346] border border-[#2e4785] rounded-xl overflow-hidden shadow-2xl py-1 max-h-60 overflow-y-auto">
              {CATEGORIES_LIST.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setIsCategoryOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                    category === cat
                      ? 'bg-[#2a4585] text-white font-bold'
                      : 'text-slate-300 hover:bg-[#1e2f5b] hover:text-white'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-blue-300 shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Code Section - 100% Symmetrical & Centered */}
        <div className="w-full flex flex-col items-center gap-2">
          {/* Centered Code Header Title */}
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm sm:text-base font-bold text-[#00e676] tracking-wide uppercase">
              Code
            </span>
            <div className="border border-[#00e676]/80 rounded px-1.5 py-0.5 flex items-center justify-center">
              <span className="text-[10px] font-black text-[#00e676] font-mono leading-none">&lt;/&gt;</span>
            </div>
          </div>

          {/* Symmetrical Action Buttons Toolbar with Equal Widths */}
          <div className={`w-full grid ${isOwner ? 'grid-cols-4' : 'grid-cols-2'} gap-1.5 sm:gap-2`}>
            {/* Senha Button (Owner Only) */}
            {isOwner && (
              <button
                id="btn-edit-script-password"
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm ${
                  hasPassword
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400/50'
                    : 'bg-[#1e2f5b] hover:bg-[#273d75] text-[#b8c6dc] border border-[#2e4785]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Senha</span>
              </button>
            )}

            {/* Carregar Button (Owner Only) */}
            {isOwner && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".lua,.luau,.txt,.text,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  id="btn-edit-script-load-file"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Carregar arquivo do dispositivo"
                  className="py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm bg-[#1e2f5b] hover:bg-[#273d75] text-cyan-200 border border-[#2e4785]"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Carregar</span>
                </button>
              </>
            )}

            {/* Download Button */}
            <button
              id="btn-edit-script-download"
              type="button"
              onClick={handleDownloadCode}
              title="Baixar código como arquivo .lua"
              className="py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm bg-[#1e2f5b] hover:bg-[#273d75] text-blue-200 border border-[#2e4785]"
            >
              <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Baixar</span>
            </button>

            {/* Copiar Button */}
            <button
              id="btn-edit-script-copy"
              type="button"
              onClick={handleCopyCode}
              title="Copiar código para a área de transferência"
              className="py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm bg-[#1e2f5b] hover:bg-[#273d75] text-emerald-200 border border-[#2e4785]"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Code Dark Blue Text Area Box */}
          <div className="w-full bg-[#1b2b54] border border-[#293e78] rounded-xl p-3 shadow-inner">
            <textarea
              id="textarea-edit-script-code"
              rows={7}
              value={code}
              disabled={!isOwner}
              onChange={(e) => setCode(e.target.value)}
              placeholder=""
              spellCheck={false}
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed disabled:opacity-60"
            />
          </div>
        </div>

        {/* 6. Primary Action Button to Save/Publish */}
        {isOwner && (
          <div className="w-full pt-1">
            <button
              id="btn-save-edited-script"
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2e52b2] hover:bg-[#3760cc] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>{submitting ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#172346] border border-[#2e4785] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Senha do Script</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {hasPassword
                ? 'Este script está protegido por senha. Você pode alterar ou remover a senha.'
                : 'Defina uma senha para proteger o script contra visualização não autorizada.'}
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a nova senha (ou deixe em branco)..."
                className="w-full bg-[#1b2b54] border border-[#293e78] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {hasPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setHasPassword(false);
                    setPassword('');
                    setIsPasswordModalOpen(false);
                    showToast('Senha Desativada', 'O script ficará público ao salvar.');
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-xs font-bold transition-colors"
                >
                  Remover Senha
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (password.trim()) {
                    setHasPassword(true);
                    showToast('Senha Definida', 'A senha será aplicada ao salvar.');
                  }
                  setIsPasswordModalOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
