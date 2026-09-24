import React, { useState, useRef } from 'react';
import {
  Code2,
  Lock,
  KeyRound,
  Download,
  Copy,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowLeft,
  UserCheck,
  LogIn,
  Gamepad2,
  Search,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useAppVersion } from '../context/VersionContext';
import { copyToClipboard } from '../lib/clipboard';
import { RobloxGameSelectorModal } from '../components/RobloxGameSelectorModal';
import { CATEGORIES_LIST, POPULAR_ROBLOX_GAMES } from '../lib/robloxGames';

interface CreateScriptPageProps {
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const CreateScriptPage: React.FC<CreateScriptPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { incrementVersion } = useAppVersion();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Universal');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  // Default to Universal script thumbnail from verified database
  const [selectedGameName, setSelectedGameName] = useState<string>('Universal / Geral');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    POPULAR_ROBLOX_GAMES[0]?.thumbnailUrl || 'https://tr.rbxcdn.com/180DAY-774ec14539b264f85fdb6e8a34dfa344/512/512/Image/Png/noFilter'
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>('2753915549');
  
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [code, setCode] = useState('');
  
  // Password modal/state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  // Status
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // When user picks a verified game from the Roblox catalog / Place ID search
  const handleGameSelected = (game: {
    name: string;
    category: string;
    thumbnailUrl: string;
    placeId?: string;
  }) => {
    setSelectedGameName(game.name);
    setPhotoPreview(game.thumbnailUrl);
    setSelectedPlaceId(game.placeId);
    
    // Auto-update category
    if (game.category) {
      setCategory(game.category);
    }
    
    // Auto-suggest name if empty
    if (!name.trim()) {
      setName(`${game.name} Hub`);
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
        if (!name.trim()) {
          const cleanName = file.name.replace(/\.(lua|luau|txt|json|js|ts)$/i, '');
          setName(cleanName);
        }
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

  // Save / Submit Script
  const handleSubmit = async () => {
    if (!user) {
      showToast(
        'Login Obrigatório',
        'Você precisa estar conectado à sua conta para publicar. Apenas você terá permissão para editar ou apagar o script.',
        'error'
      );
      onNavigate('login');
      return;
    }

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
      const res = await api.createScript({
        title: name.trim(),
        category: category,
        description: selectedGameName ? `Jogo: ${selectedGameName}` : '',
        thumbnailUrl: photoPreview || '',
        code: code,
        isPasswordProtected: hasPassword && Boolean(password),
        password: hasPassword ? password : '',
      });

      incrementVersion(`Script criado: ${res.script.title}`);
      showToast('Script criado com sucesso!', `Script ${res.script.title} registrado com imagem oficial do jogo.`);
      onNavigate('dashboard');
    } catch (err: any) {
      showToast('Erro ao criar script', err.message, 'error');
      if (err.message && err.message.toLowerCase().includes('logado')) {
        onNavigate('login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 pb-16 select-none">
      {/* Roblox Game Selector Modal */}
      <RobloxGameSelectorModal
        isOpen={isGameSelectorOpen}
        onClose={() => setIsGameSelectorOpen(false)}
        onSelectGame={handleGameSelected}
        currentThumbnailUrl={photoPreview}
        currentGameName={selectedGameName}
      />

      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center gap-4">
        {/* Top Back Row & Author status */}
        <div className="w-full flex items-center justify-between pb-0.5 px-0.5">
          <button
            type="button"
            id="btn-create-back"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              <UserCheck className="w-3 h-3" />
              <span>@{user.username}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-full hover:bg-amber-900/60 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Fazer Login</span>
            </button>
          )}
        </div>

        {!user && (
          <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-200">Faça login para postar</p>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                Para garantir que apenas quem botou o script possa editá-lo ou apagá-lo, o login é obrigatório.
              </p>
            </div>
          </div>
        )}

        {/* 1. Official Roblox Game Photo Selector Box */}
        <div
          id="btn-choose-roblox-game"
          onClick={() => setIsGameSelectorOpen(true)}
          className="w-full aspect-[4/3] rounded-2xl bg-[#14234b] border border-[#2b5d84] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.99] shadow-xl group"
        >
          {photoPreview ? (
            <>
              <img
                src={photoPreview}
                alt={selectedGameName || "Roblox Game Preview"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (category && category !== 'Universal' && !img.src.includes('/api/roblox/icon/')) {
                    img.src = `/api/roblox/icon/2753915549`;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-3.5">
                <div className="self-end px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Foto Oficial Roblox</span>
                </div>
                
                <div className="space-y-0.5">
                  <p className="text-sm font-extrabold text-white drop-shadow-md truncate">
                    {selectedGameName || 'Jogo Selecionado'}
                  </p>
                  <p className="text-[11px] font-medium text-blue-300 flex items-center gap-1">
                    <Gamepad2 className="w-3.5 h-3.5" />
                    <span>Clique para trocar de jogo ou buscar por ID</span>
                  </p>
                </div>
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
              <span className="text-[11px] text-slate-400">
                Puxa a foto oficial do Roblox automaticamente
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
              id="input-script-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Blox Fruits Auto Farm / Hub"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Categoria Dropdown Section */}
        <div className="w-full flex flex-col items-center gap-1.5 relative">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide text-center">
            Categoria
          </label>
          <div
            id="dropdown-category-select"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-all hover:bg-[#25396e] active:scale-[0.99]"
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
          {isCategoryOpen && (
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

          {/* Symmetrical 4-Button Toolbar with Equal Widths */}
          <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* Senha Button */}
            <button
              id="btn-script-password"
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

            {/* Carregar Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".lua,.luau,.txt,.text,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              id="btn-script-load-file"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Carregar arquivo do dispositivo"
              className="py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-sm bg-[#1e2f5b] hover:bg-[#273d75] text-cyan-200 border border-[#2e4785]"
            >
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Carregar</span>
            </button>

            {/* Download Button */}
            <button
              id="btn-script-download"
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
              id="btn-script-copy"
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
              id="textarea-script-code"
              rows={7}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole seu código Lua/Luau aqui..."
              spellCheck={false}
              className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 6. Primary Action Button to Save/Publish */}
        <div className="w-full pt-1">
          <button
            id="btn-save-new-script"
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2e52b2] hover:bg-[#3760cc] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Salvando...' : 'Salvar Script'}</span>
          </button>
        </div>

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
              Defina uma senha para proteger o código. Usuários precisarão digitar esta senha para visualizar ou desbloquear.
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha (opcional)..."
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
                    showToast('Senha Removida', 'O script agora é público.');
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
                    showToast('Senha Definida', 'O script está protegido.');
                  } else {
                    setHasPassword(false);
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
