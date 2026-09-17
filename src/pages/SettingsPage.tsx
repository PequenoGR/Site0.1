import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Key,
  Save,
  Check,
  Palette,
  Terminal,
  Server,
  Lock,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AccentColor, ThemeMode } from '../types';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const { mode, setMode, accent, setAccent, accentClasses } = useTheme();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const ACCENTS: { id: AccentColor; name: string; colorClass: string; desc: string }[] = [
    { id: 'cyan', name: 'Ciano Neon', colorClass: 'bg-cyan-500', desc: 'Estilo clássico terminal Luau' },
    { id: 'emerald', name: 'Esmeralda', colorClass: 'bg-emerald-500', desc: 'Verde vibrante motor Roblox' },
    { id: 'violet', name: 'Violeta Cyber', colorClass: 'bg-violet-500', desc: 'Roxo sofisticado' },
    { id: 'amber', name: 'Âmbar Dourado', colorClass: 'bg-amber-500', desc: 'Tons quentes e elegantes' },
    { id: 'rose', name: 'Rosa Crimson', colorClass: 'bg-rose-500', desc: 'Destaque vívido e moderno' },
    { id: 'blue', name: 'Azul Royal', colorClass: 'bg-blue-600', desc: 'Equilíbrio e clareza visual' },
  ];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      showToast('Senha curta', 'A nova senha deve ter no mínimo 6 caracteres.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Senhas não coincidem', 'Verifique a confirmação da nova senha.', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await api.updatePreferences({
        currentPassword,
        newPassword,
      });
      showToast('Senha atualizada!', 'Sua senha foi alterada com sucesso.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('Erro ao atualizar senha', err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (newThemeMode: ThemeMode, newAccent: AccentColor) => {
    setMode(newThemeMode);
    setAccent(newAccent);
    if (user) {
      try {
        await api.updatePreferences({
          themePreference: newThemeMode,
          accentColor: newAccent,
        });
        showToast('Tema salvo!', `Modo ${newThemeMode} com destaque ${newAccent}.`);
      } catch {
        // saved locally
      }
    } else {
      showToast('Tema aplicado!', `Modo ${newThemeMode} com destaque ${newAccent}.`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Configurações & Personalização</h1>
        </div>
        <p className="text-xs text-slate-400">
          Personalize a aparência do sistema com temas dinâmicos (claro/escuro e cores de destaque) e gerencie sua segurança.
        </p>
      </div>

      {/* Visual Customization Card */}
      <div
        className={`p-6 rounded-2xl border space-y-6 ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-1 text-slate-100">
            <Palette className={`w-4 h-4 ${accentClasses.text}`} />
            <span>Tema da Interface (Modo Escuro / Modo Claro)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Escolha se prefere uma interface escura de alto contraste ou uma interface clara limpa e moderna.
          </p>
        </div>

        {/* Dark / Light Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => handleSavePreferences('dark', accent)}
            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
              mode === 'dark'
                ? 'bg-slate-950 border-cyan-500/50 ring-2 ring-cyan-500/30'
                : 'bg-slate-900/50 border-slate-800 text-slate-400'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-100">Modo Escuro (Dark)</span>
                {mode === 'dark' && <Check className="w-4 h-4 text-cyan-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Ideal para programar e passar longas horas.</p>
            </div>
          </div>

          <div
            onClick={() => handleSavePreferences('light', accent)}
            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
              mode === 'light'
                ? 'bg-slate-50 border-cyan-500/50 ring-2 ring-cyan-500/30'
                : 'bg-slate-100/60 border-slate-200 text-slate-600'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Modo Claro (Light)</span>
                {mode === 'light' && <Check className="w-4 h-4 text-cyan-600" />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Visual nítido, claro e moderno.</p>
            </div>
          </div>
        </div>

        {/* Accent Color Palette Selector */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Cor de Destaque Dinâmica (Accent Color)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Altera a tonalidade dos botões, badges, barras de status e realces de sintaxe.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {ACCENTS.map((item) => {
              const isSelected = accent === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSavePreferences(mode, item.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-slate-950/80 border-slate-700 ring-2 ring-slate-400/40'
                      : mode === 'dark'
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full shrink-0 shadow-md ${item.colorClass}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Preview Component Box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
          <span className="text-[11px] font-mono text-slate-400 block">Prévia Dinâmica do Tema:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-bold text-slate-950 shadow-md ${accentClasses.primaryBg}`}
            >
              Botão Principal
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accentClasses.badgeBg}`}>
              Badge Ativa
            </span>
            <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs ${accentClasses.border}`}>
              loadstring(game:HttpGet(&quot;...&quot;))()
            </div>
          </div>
        </div>
      </div>

      {/* Security & Password Card */}
      {user && (
        <form
          onSubmit={handleUpdatePassword}
          className={`p-6 rounded-2xl border space-y-4 ${
            mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-1 text-slate-100">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Segurança da Conta & Alteração de Senha</span>
            </h2>
            <p className="text-xs text-slate-400">
              Usuário conectado: <span className="font-semibold text-slate-200">@{user.username}</span> ({user.email})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Senha Atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual..."
                className="w-full px-3.5 py-2 rounded-xl text-xs border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres..."
                className="w-full px-3.5 py-2 rounded-xl text-xs border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha..."
                className="w-full px-3.5 py-2 rounded-xl text-xs border bg-slate-950 border-slate-800 text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword || !newPassword}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Gravando...' : 'Atualizar Senha'}</span>
            </button>
          </div>
        </form>
      )}

      {/* System Information Card */}
      <div
        className={`p-6 rounded-2xl border space-y-3 text-xs ${
          mode === 'dark' ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Informações do Servidor LuauRaw</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
          <div>• Engine: Express + Node.js (Porta 3000)</div>
          <div>• Hashing: bcryptjs (Salts 10 rounds)</div>
          <div>• Editor: Monaco Editor Luau Syntax</div>
          <div>• Formato RAW: text/plain; charset=utf-8</div>
          <div>• Rate Limit: Proteção anti-bruteforce ativa</div>
          <div>• Compatibilidade: loadstring(game:HttpGet(...))()</div>
        </div>
      </div>
    </div>
  );
};
