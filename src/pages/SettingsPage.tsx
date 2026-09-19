import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  Palette,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppVersion } from '../context/VersionContext';
import { AccentColor, ThemeMode } from '../types';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { ConsoleColorSelector } from '../components/ConsoleColorSelector';

export const SettingsPage: React.FC = () => {
  const { mode, setMode, accent, setAccent, accentInfo } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { incrementVersion } = useAppVersion();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

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
      incrementVersion('Senha alterada');
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
    incrementVersion(`Tema alterado: ${newAccent}`);
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
          <Settings style={{ color: accentInfo.accentHex }} className="w-6 h-6" />
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Configurações &amp; Personalização</h1>
        </div>
        <p className="text-xs text-slate-400">
          Personalize as cores da interface e gerencie as preferências da sua conta.
        </p>
      </div>

      {/* Seletor de Cores estilo Console (Idêntico à Imagem) */}
      <ConsoleColorSelector
        currentAccent={accent}
        onSelectAccent={(newAccent) => handleSavePreferences(mode, newAccent)}
      />

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
              <Shield style={{ color: accentInfo.accentHex }} className="w-4 h-4" />
              <span>Segurança da Conta &amp; Alteração de Senha</span>
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
              style={{
                backgroundColor: accentInfo.accentHex,
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingPassword ? 'Gravando...' : 'Atualizar Senha'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
