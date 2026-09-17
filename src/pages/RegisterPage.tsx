import React, { useState } from 'react';
import { Terminal, Lock, User, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';

interface RegisterPageProps {
  onNavigate: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || username.length < 3) {
      showToast('Nome de usuário curto', 'Mínimo de 3 caracteres.', 'error');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      showToast('E-mail inválido', 'Informe um e-mail válido.', 'error');
      return;
    }

    if (!password || password.length < 6) {
      showToast('Senha curta', 'A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      showToast('Conta criada com sucesso!', `Bem-vindo ao ScriptsGR, @${username}!`);
      onNavigate('dashboard');
    } catch (err: any) {
      showToast('Erro no cadastro', err.message || 'Falha ao registrar conta.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] px-4">
      <div
        className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl space-y-6 ${
          mode === 'dark' ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 mx-auto flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Terminal className="w-6 h-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100">Criar Nova Conta</h1>
          <p className="text-xs text-slate-400">
            Hospede scripts Luau com links RAW seguros e proteção por chave
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome de Usuário
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="input-register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: luau_dev"
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
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                id="input-register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
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
                id="input-register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600'
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                } ${accentClasses.ring}`}
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Senhas criptografadas com bcrypt e proteção anti-bruteforce.</span>
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            disabled={submitting}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
          >
            <span>{submitting ? 'Cadastrando...' : 'Criar Minha Conta'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
          Já possui conta?{' '}
          <button
            onClick={() => onNavigate('login')}
            className={`font-bold hover:underline ${accentClasses.text}`}
          >
            Entrar agora
          </button>
        </div>
      </div>
    </div>
  );
};
