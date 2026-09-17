import React, { useState, useEffect } from 'react';
import {
  Code2,
  Lock,
  Globe,
  Save,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import { LuauEditor } from '../components/LuauEditor';
import { api } from '../lib/api';
import { ScriptItem } from '../types';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

interface EditScriptPageProps {
  scriptId: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const EditScriptPage: React.FC<EditScriptPageProps> = ({ scriptId, onNavigate }) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [script, setScript] = useState<ScriptItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    async function loadScript() {
      setLoading(true);
      try {
        const res = await api.getScriptById(scriptId);
        setScript(res.script);
        setTitle(res.script.title);
        setDescription(res.script.description || '');
        setCode(res.script.code || '');
        setIsProtected(res.script.isPasswordProtected);
      } catch (err: any) {
        showToast('Erro ao carregar script', err.message, 'error');
        onNavigate('dashboard');
      } finally {
        setLoading(false);
      }
    }
    loadScript();
  }, [scriptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Título obrigatório', 'O script deve ter um título.', 'error');
      return;
    }

    if (!code.trim()) {
      showToast('Código obrigatório', 'O código Luau não pode estar vazio.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateScript(scriptId, {
        title: title.trim(),
        description: description.trim(),
        code,
        isPasswordProtected: isProtected,
        password: password ? password : undefined,
      });

      showToast('Script atualizado!', 'Alterações salvas com sucesso.');
      onNavigate('view', scriptId);
    } catch (err: any) {
      showToast('Erro ao atualizar script', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreatingKey(true);
    try {
      const res = await api.createAccessKey(scriptId, newKeyName.trim());
      showToast('Nova chave criada!', res.accessKey.key);
      setNewKeyName('');
      // refresh script
      const fresh = await api.getScriptById(scriptId);
      setScript(fresh.script);
    } catch (err: any) {
      showToast('Erro ao gerar chave', err.message, 'error');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (key: string) => {
    if (!window.confirm('Deseja realmente revogar esta chave de acesso? Qualquer loadstring usando ela perderá o acesso.')) {
      return;
    }
    try {
      await api.revokeAccessKey(scriptId, key);
      showToast('Chave revogada!', 'O token foi excluído.');
      const fresh = await api.getScriptById(scriptId);
      setScript(fresh.script);
    } catch (err: any) {
      showToast('Erro ao revogar chave', err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm">Carregando script para edição...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-10">
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
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Editar Script: {script?.id}</h1>
            <p className="text-xs text-slate-400">
              Modifique o código, metadados ou gerencie as chaves de acesso deste script.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('view', scriptId)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              mode === 'dark' ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-600'
            }`}
          >
            Ver Detalhes
          </button>
          <button
            type="submit"
            id="btn-save-edit-submit"
            disabled={submitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg transition-all active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>

      {/* Script Metadata Card */}
      <div
        className={`p-5 rounded-2xl border ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome do Script <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              } ${accentClasses.ring}`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Identificador (ID RAW)
            </label>
            <input
              readOnly
              value={scriptId}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-mono border bg-slate-950/40 border-slate-800 text-cyan-400 cursor-not-allowed opacity-80"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Descrição
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none transition-all resize-none ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              } ${accentClasses.ring}`}
            />
          </div>
        </div>

        {/* Protection & Passwords */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Visibilidade
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div
              onClick={() => setIsProtected(false)}
              className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                !isProtected
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="text-sm font-bold">🔓 Público</span>
                <p className="text-xs text-slate-400 mt-1">Acesso livre via link RAW para qualquer executor.</p>
              </div>
            </div>

            <div
              onClick={() => setIsProtected(true)}
              className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                isProtected
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-sm font-bold">🔒 Protegido por Senha</span>
                <p className="text-xs text-slate-400 mt-1">Exige chave ou senha para liberar o código RAW.</p>
              </div>
            </div>
          </div>

          {isProtected && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4" />
                <span>Atualizar Senha (deixe em branco para manter a atual)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite nova senha para alterar..."
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm border bg-slate-950 border-slate-800 text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Access Keys Management for Protected Script */}
        {isProtected && script && (
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Chaves de Acesso (Tokens para Loadstring)
              </label>
            </div>

            {/* Create new key */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Nome da chave (Ex: Amigo, Servidor 1, Versão VIP)..."
                className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCreateKey}
                disabled={creatingKey || !newKeyName.trim()}
                className={`px-4 py-2 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-1.5 ${accentClasses.primaryBg}`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gerar Nova Chave</span>
              </button>
            </div>

            {/* Key List */}
            <div className="space-y-2">
              {script.accessKeys && script.accessKeys.length > 0 ? (
                script.accessKeys.map((k) => (
                  <div
                    key={k.key}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200">{k.name}</div>
                      <div className="font-mono text-[11px] text-cyan-400 truncate">{k.key}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(k.key);
                          showToast('Chave copiada!', k.key);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-700"
                        title="Copiar Chave"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(k.key)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                        title="Revogar Chave"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhuma chave de acesso criada ainda.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Luau Code Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Código Luau</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">Pressione Ctrl+S para salvar</span>
        </div>

        <LuauEditor value={code} onChange={setCode} onSave={handleSubmit} minHeight="480px" />
      </div>
    </form>
  );
};
