import React, { useState } from 'react';
import {
  Code2,
  Lock,
  Globe,
  Save,
  ArrowLeft,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  Info,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { LuauEditor } from '../components/LuauEditor';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

interface CreateScriptPageProps {
  onNavigate: (tab: string, scriptId?: string) => void;
}

const TEMPLATES = [
  {
    name: 'Exemplo Padrão Luau',
    code: `--[[
    Script Luau Criado com LuauRaw
    Hospedado para uso via loadstring(game:HttpGet(...))()
]]

local Players = game:GetService("Players")
local player = Players.LocalPlayer

print("[LuauRaw] Script iniciado com sucesso para: " .. tostring(player.Name))

-- Adicione sua lógica Luau abaixo:
local function init()
    warn("[LuauRaw] Módulos carregados!")
end

init()
`,
  },
  {
    name: 'Notificação & Print Luau',
    code: `--[[
    Roblox Luau Starter Template
]]

local StarterGui = game:GetService("StarterGui")

local function notify(title, message)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = message,
        Duration = 5,
    })
end

notify("LuauRaw", "Script carregado com sucesso!")
`,
  },
  {
    name: 'Template em Branco',
    code: `-- Novo Script Luau\n\n`,
  },
];

export const CreateScriptPage: React.FC<CreateScriptPageProps> = ({ onNavigate }) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = TEMPLATES.find((t) => t.name === e.target.value);
    if (selected) {
      if (code.trim() && !window.confirm('Substituir o código atual pelo modelo selecionado?')) {
        return;
      }
      setCode(selected.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Título obrigatório', 'Por favor informe um nome para o script.', 'error');
      return;
    }

    if (!code.trim()) {
      showToast('Código obrigatório', 'O código Luau não pode estar vazio.', 'error');
      return;
    }

    if (isProtected && (!password || password.length < 4)) {
      showToast('Senha inválida', 'Para scripts protegidos, informe uma senha com no mínimo 4 caracteres.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createScript({
        title: title.trim(),
        description: description.trim(),
        code,
        isPasswordProtected: isProtected,
        password: isProtected ? password : '',
      });

      showToast('Script criado com sucesso!', `Identificador gerado: ${res.script.id}`);
      onNavigate('view', res.script.id);
    } catch (err: any) {
      showToast('Erro ao criar script', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-back-dashboard"
            onClick={() => onNavigate('dashboard')}
            className={`p-2 rounded-xl border transition-colors ${
              mode === 'dark' ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Criar Novo Script Luau</h1>
            <p className="text-xs text-slate-400">
              Configure nome, visibilidade e escreva seu código com destaque de sintaxe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              mode === 'dark' ? 'border-slate-800 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-600'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-create-script-submit"
            disabled={submitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-2 shadow-lg transition-all active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Gravando...' : 'Criar Script'}</span>
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
          {/* Script Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome do Script <span className="text-rose-400">*</span>
            </label>
            <input
              id="input-script-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Main Teleport Hub, Speed Controller..."
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              } ${accentClasses.ring}`}
            />
          </div>

          {/* Template selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Modelo Inicial (Template)
            </label>
            <select
              id="select-script-template"
              onChange={handleTemplateChange}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-200'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              } ${accentClasses.ring}`}
            >
              {TEMPLATES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Descrição Opcional
            </label>
            <textarea
              id="input-script-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a finalidade do script, versão, instruções ou jogos compatíveis..."
              className={`w-full px-4 py-2 rounded-xl text-xs border focus:outline-none transition-all resize-none ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
              } ${accentClasses.ring}`}
            />
          </div>
        </div>

        {/* Visibility & Security Card */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Visibilidade & Proteção do Link RAW
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Public Option */}
            <div
              onClick={() => setIsProtected(false)}
              className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                !isProtected
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-100 ring-1 ring-emerald-500/30'
                  : mode === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  !isProtected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">🔓 Público</span>
                  {!isProtected && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Selecionado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Qualquer pessoa ou executor com o link RAW pode acessar. Retorna o código diretamente no loadstring.
                </p>
              </div>
            </div>

            {/* Password Protected Option */}
            <div
              onClick={() => setIsProtected(true)}
              className={`cursor-pointer p-4 rounded-xl border flex items-start gap-3 transition-all ${
                isProtected
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100 ring-1 ring-amber-500/30'
                  : mode === 'dark'
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isProtected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">🔒 Protegido por Senha</span>
                  {isProtected && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Selecionado
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Apenas usuários com a senha ou chave de acesso podem executar. A senha é criptografada com hash seguro.
                </p>
              </div>
            </div>
          </div>

          {/* Password Input (Only shown if protected) */}
          {isProtected && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Defina a Senha de Acesso</span>
                </label>
                <span className="text-[11px] text-slate-400">Armazenada via bcrypt hash</span>
              </div>

              <div className="relative">
                <input
                  id="input-create-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite uma senha forte (mínimo 4 caracteres)..."
                  required={isProtected}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm border focus:outline-none transition-all ${
                    mode === 'dark'
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } ${accentClasses.ring}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Como funcionará no loadstring:</strong> Ao criar o script protegido, o sistema gera automaticamente uma <strong>Chave de Acesso (Token)</strong>. 
                  Você poderá copiar a URL pronta <code className="text-amber-300 font-mono">/raw/ID?key=TOKEN</code> para rodar diretamente sem que o jogador precise interagir com formulários web!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Código Luau</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">Monaco Editor • Luau Syntax</span>
        </div>

        <LuauEditor
          value={code}
          onChange={setCode}
          onSave={() => {
            // trigger submit or save draft
          }}
          minHeight="480px"
        />
      </div>
    </form>
  );
};
