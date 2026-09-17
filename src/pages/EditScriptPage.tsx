import React, { useState, useEffect, useRef } from 'react';
import {
  Code2,
  KeyRound,
  ChevronUp,
  Check,
  X,
  Upload,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { copyToClipboard } from '../lib/clipboard';

interface EditScriptPageProps {
  scriptId: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

const CATEGORIES = [
  'Geral',
  'Blox Fruits',
  'Universal',
  'Arsenal',
  'Pet Simulator 99',
  'Da Hood',
  'Blade Ball',
  'BedWars',
  'Outros',
];

export const EditScriptPage: React.FC<EditScriptPageProps> = ({ scriptId, onNavigate }) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Geral');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [code, setCode] = useState('');

  // Password modal/state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  // Status
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      try {
        const res = await api.getScriptById(scriptId);
        setName(res.script.title || '');
        setCategory(res.script.category || 'Geral');
        setPhotoPreview(res.script.thumbnailUrl || null);
        setCode(res.script.code || '');
        setHasPassword(Boolean(res.script.isPasswordProtected));
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

  // Photo Upload Handler (file or drag)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Formato Inválido', 'Por favor envie um arquivo de imagem (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Trigger file selection
  const handleUploadClick = () => {
    fileInputRef.current?.click();
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
        description: '',
        thumbnailUrl: photoPreview || '',
        code: code,
        isPasswordProtected: hasPassword,
        ...(password.trim() ? { password: password.trim() } : {}),
      });

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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-full max-w-[340px] sm:max-w-[380px] flex flex-col items-center gap-4">
        {/* Top Back and Delete Row */}
        <div className="w-full flex items-center justify-between pb-1">
          <button
            type="button"
            id="btn-edit-back"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            id="btn-edit-delete"
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>
        </div>

        {/* 1. Upload Photo Container */}
        <div
          id="btn-edit-upload-photo"
          onClick={handleUploadClick}
          className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-r from-[#29687a] via-[#1a4b6e] to-[#123668] border border-[#2b5d84] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-200 hover:brightness-110 active:scale-[0.99] shadow-xl group"
        >
          {photoPreview ? (
            <>
              <img
                src={photoPreview}
                alt="Upload Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Upload className="w-5 h-5 text-white" />
                <span className="text-xs font-bold text-white">Alterar Foto</span>
              </div>
            </>
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
          <div className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2 sm:py-2.5 transition-all focus-within:border-[#4367c2] focus-within:ring-1 focus-within:ring-[#4367c2]">
            <input
              id="input-edit-script-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=""
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 3. Categoria Dropdown Section */}
        <div className="w-full flex flex-col items-center gap-1.5 relative">
          <label className="text-xs sm:text-sm font-bold text-[#b8c6dc] tracking-wide">
            Categoria
          </label>
          <div
            id="dropdown-edit-category-select"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-xl px-3.5 py-2 sm:py-2.5 flex items-center justify-between cursor-pointer transition-all hover:bg-[#25396e] active:scale-[0.99]"
          >
            <span className="text-xs sm:text-sm font-semibold text-white">
              {category}
            </span>
            <span className="text-white text-xs font-bold">
              {isCategoryOpen ? (
                <ChevronUp className="w-4 h-4 stroke-[3]" />
              ) : (
                <span className="font-mono text-sm leading-none">^</span>
              )}
            </span>
          </div>

          {/* Categoria dropdown list */}
          {isCategoryOpen && (
            <div className="absolute top-full mt-1.5 z-40 w-full bg-[#172346] border border-[#2e4785] rounded-xl overflow-hidden shadow-2xl py-1">
              {CATEGORIES.map((cat) => (
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
                  <span>{cat}</span>
                  {category === cat && <Check className="w-3.5 h-3.5 text-blue-300" />}
                </button>
              ))}
            </div>
          )}
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
            <button
              id="btn-edit-script-password"
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className={`px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all ${
                hasPassword
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#1e2f5b] hover:bg-[#25396e] text-[#b8c6dc] border border-[#2e4785]'
              }`}
            >
              <KeyRound className="w-3 h-3 text-amber-400 stroke-[2.5]" />
              <span>Senha</span>
            </button>

            {/* Download & Copiar group */}
            <div className="flex items-center bg-[#4665c2] rounded-md overflow-hidden text-[11px] sm:text-xs font-bold text-white shadow-xs">
              <button
                id="btn-edit-script-download"
                type="button"
                onClick={handleDownloadCode}
                className="px-2.5 py-1 hover:bg-[#3b57aa] transition-colors flex items-center gap-1 border-r border-[#3b57aa]"
              >
                <span>Download</span>
              </button>
              <button
                id="btn-edit-script-copy"
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
          <textarea
            id="textarea-edit-script-code"
            rows={7}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder=""
            spellCheck={false}
            className="w-full bg-transparent text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 6. Primary Action Button to Save/Publish */}
        <div className="w-full pt-2">
          <button
            id="btn-save-edit-script"
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-[#2e52b2] hover:bg-[#3760cc] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>{submitting ? 'Salvando...' : 'Salvar Alterações'}</span>
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
              Caso queira alterar a senha ou proteger o script, digite a nova senha abaixo.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a nova senha..."
              className="w-full bg-[#101933] border border-[#2e4785] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4367c2]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              {hasPassword && (
                <button
                  type="button"
                  onClick={() => {
                    setPassword('');
                    setHasPassword(false);
                    setIsPasswordModalOpen(false);
                    showToast('Senha desativada', 'O script agora é público.');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors mr-auto"
                >
                  Remover Senha
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (password.trim().length > 0 && password.trim().length < 4) {
                    showToast('Senha curta', 'A senha deve ter no mínimo 4 caracteres.', 'error');
                    return;
                  }
                  if (password.trim().length >= 4) {
                    setHasPassword(true);
                  }
                  setIsPasswordModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#2e52b2] hover:bg-[#3760cc] text-white transition-colors"
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
