import React, { useState } from 'react';
import { Terminal, Lock, User, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { Logo } from '../components/Logo';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Campos obrigatórios', 'Informe seu usuário ou e-mail e senha.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      showToast('Bem-vindo de volta!', 'Login realizado com sucesso.');
      onNavigate('dashboard');
    } catch (err: any) {
      showToast('Erro ao entrar', err.message || 'Credenciais inválidas.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('demo');
    setPassword('demo123');
    showToast('Credenciais Preenchidas', 'Conta demo carregada para teste imediato.');
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div
        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 ${
          mode === 'dark' ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Brand Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="py-2">
            <Logo size="lg" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Acesse sua Conta</h1>
          <p className="text-xs text-slate-400">
            Gerencie seus scripts Luau e links RAW diretos para loadstring
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-300">
              Ambiente de teste: Use a conta <strong className="text-cyan-400 font-mono">demo</strong> / <strong className="text-cyan-400 font-mono">demo123</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 text-[11px] font-bold hover:bg-cyan-400 transition-colors shrink-0"
          >
            Preencher
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="input-login-identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="demo ou seu@email.com"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                } ${accentClasses.ring}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                } ${accentClasses.ring}`}
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <span>{submitting ? 'Verificando...' : 'Entrar no ScriptsGR'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer link to register */}
        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Não tem uma conta?{' '}
          <button
            onClick={() => onNavigate('register')}
            className={`font-bold hover:underline ${accentClasses.text}`}
          >
            Cadastre-se gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
};
