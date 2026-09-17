import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Key, Copy, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';
import { copyToClipboard as copyUtil } from '../lib/clipboard';

interface PasswordModalProps {
  scriptId: string;
  scriptTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUnlocked?: (code: string, accessKey?: string) => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  scriptId,
  scriptTitle,
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedKey, setUnlockedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://luauraw.dev';

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor digite a senha do script.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.unlockScript(scriptId, password);
      showToast('Desbloqueado com sucesso!', 'Código Luau liberado.');
      if (res.accessKey) {
        setUnlockedKey(res.accessKey);
      }
      if (onUnlocked) {
        onUnlocked(res.code, res.accessKey);
      }
    } catch (err: any) {
      setError(err.message || 'Senha incorreta.');
      showToast('Acesso negado', err.message || 'Senha incorreta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'key' | 'loadstring') => {
    const success = await copyUtil(text);
    if (success) {
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else {
        setCopiedLoadstring(true);
        setTimeout(() => setCopiedLoadstring(false), 2000);
      }
      showToast('Copiado!', 'Copiado para a área de transferência.');
    } else {
      showToast('Erro ao copiar', 'Falha ao acessar área de transferência.', 'error');
    }
  };

  const loadstringWithKey = `loadstring(game:HttpGet("${origin}/raw/${scriptId}?key=${unlockedKey || 'SUA_CHAVE'}"))()`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`relative w-full max-w-lg rounded-2xl border shadow-2xl p-6 ${
              mode === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Script Protegido por Senha</h3>
                <p className="text-xs text-slate-400 truncate max-w-sm">{scriptTitle} ({scriptId})</p>
              </div>
            </div>

            {!unlockedKey ? (
              <form onSubmit={handleUnlock} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5 leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção sobre loadstrings protegidos:</strong>
                    <p className="mt-1 text-slate-300">
                      Clientes HTTP como <code className="text-amber-300 font-mono">game:HttpGet</code> não conseguem submeter formulários web. 
                      Ao digitar a senha abaixo, o sistema gera uma chave de acesso segura para ser usada diretamente no seu loadstring com <code className="text-amber-300 font-mono">?key=CHAVE</code>.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Senha do Script
                  </label>
                  <input
                    id="input-script-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha definida pelo autor..."
                    required
                    autoFocus
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                      mode === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    } ${accentClasses.ring}`}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                      mode === 'dark' ? 'border-slate-800 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-submit-unlock"
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2 text-xs font-bold rounded-xl text-slate-950 flex items-center gap-2 transition-all shadow-md ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{loading ? 'Validando...' : 'Desbloquear Script'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Acesso Autorizado! Chave gerada com sucesso.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Sua Chave de Acesso (Token)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={unlockedKey}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-cyan-400 focus:outline-none select-all"
                    />
                    <button
                      id="btn-copy-unlocked-key"
                      onClick={() => handleCopy(unlockedKey, 'key')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Loadstring Pronto para Luau/Roblox
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={loadstringWithKey}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-amber-300 focus:outline-none select-all"
                    />
                    <button
                      id="btn-copy-unlocked-loadstring"
                      onClick={() => handleCopy(loadstringWithKey, 'loadstring')}
                      className={`px-3 py-2 rounded-xl font-bold text-slate-950 text-xs flex items-center gap-1.5 transition-colors shadow-sm ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
                    >
                      {copiedLoadstring ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLoadstring ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    id="btn-done-unlock"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Fechar e Ver Código
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
