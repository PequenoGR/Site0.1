import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Code2,
  Copy,
  Check,
  Lock,
  Globe,
  HelpCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { copyToClipboard } from '../lib/clipboard';

export const DocsPage: React.FC = () => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedProtected, setCopiedProtected] = useState(false);
  const [copiedRobloxProtected, setCopiedRobloxProtected] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://luauraw.dev';

  const publicExample = `loadstring(game:HttpGet("${origin}/raw/fly-speed-v2"))()`;

  const protectedExample = `loadstring(game:HttpGet("${origin}/raw/admin-hub-vip?key=key_demo_vip_access_2026"))()`;

  const robustProtectedExample = `-- Exemplo Robusto com Tratamento de Erros no Luau
local scriptUrl = "${origin}/raw/admin-hub-vip?key=key_demo_vip_access_2026"

local success, result = pcall(function()
    return game:HttpGet(scriptUrl)
end)

if success and result then
    local executable, loadErr = loadstring(result)
    if executable then
        executable()
        print("[LuauRaw] Script executado com sucesso!")
    else
        warn("[LuauRaw] Erro ao compilar script: " .. tostring(loadErr))
    end
else
    warn("[LuauRaw] Falha ao baixar código RAW: " .. tostring(result))
end`;

  const copyCode = async (text: string, setter: (val: boolean) => void) => {
    const success = await copyToClipboard(text);
    if (success) {
      setter(true);
      showToast('Copiado com sucesso!', 'Código pronto para a área de transferência.');
      setTimeout(() => setter(false), 2000);
    } else {
      showToast('Erro ao copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-black text-slate-100 tracking-tight">
            Guia de Uso: Luau & Loadstring RAW
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Aprenda a executar seus scripts Luau hospedados no Roblox Studio e executores através de links RAW diretos.
        </p>
      </div>

      {/* 1. Public Script Example */}
      <div
        className={`p-6 rounded-2xl border space-y-3 ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <Globe className="w-5 h-5" />
          <span>1. Como Executar um Script Público (🔓)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Scripts públicos não possuem restrição de acesso. Qualquer cliente HTTP pode requisitar a URL e receber imediatamente o código Luau em formato <code className="font-mono text-cyan-400">text/plain</code>.
        </p>

        <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
            <span>Comando no Roblox / Executor Luau</span>
            <button
              onClick={() => copyCode(publicExample, setCopiedPublic)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copiedPublic ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPublic ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <code className="text-slate-200 break-all">{publicExample}</code>
        </div>
      </div>

      {/* 2. Password Protected Script Example */}
      <div
        className={`p-6 rounded-2xl border space-y-3 ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Lock className="w-5 h-5" />
          <span>2. Como Executar um Script Protegido por Senha / Chave (🔒)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Como a função <code className="font-mono text-amber-300">game:HttpGet</code> é uma requisição de máquina pura (sem formulários visuais do browser), o LuauRaw adota a autenticação via <strong>Token de Acesso seguro</strong> na query string <code className="font-mono text-amber-300">?key=SUA_CHAVE</code>.
        </p>

        <div className="relative p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
            <span>Loadstring com Chave de Acesso (Token)</span>
            <button
              onClick={() => copyCode(protectedExample, setCopiedProtected)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copiedProtected ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedProtected ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <code className="text-slate-200 break-all">{protectedExample}</code>
        </div>
      </div>

      {/* 3. Robust Error-Handling Script Template */}
      <div
        className={`p-6 rounded-2xl border space-y-3 ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Terminal className="w-5 h-5" />
          <span>3. Execução Robusta em Luau (com Proteção pcall)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Se o script estiver protegido e alguém tentar rodar sem a chave, o LuauRaw retorna um erro amigável em Luau puro (não quebra o parser com HTML). Veja este código recomendado para produções:
        </p>

        <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
            <span>Luau Script Wrapper</span>
            <button
              onClick={() => copyCode(robustProtectedExample, setCopiedRobloxProtected)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copiedRobloxProtected ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedRobloxProtected ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="text-cyan-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {robustProtectedExample}
          </pre>
        </div>
      </div>

      {/* Technical FAQ */}
      <div
        className={`p-6 rounded-2xl border space-y-3 ${
          mode === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Dúvidas Frequentes</span>
        </h3>
        <div className="space-y-2 text-xs text-slate-400">
          <div>
            <strong className="text-slate-200 block">Onde a senha mestra é salva?</strong>
            A senha é processada no backend com bcrypt (salt 10 rounds). Nem mesmo administradores têm acesso à senha em texto puro.
          </div>
          <div>
            <strong className="text-slate-200 block">Existe limite de tamanho para o script?</strong>
            Sim, o endpoint aceita scripts de até 1MB por padrão, o suficiente para milhares de linhas de código Luau.
          </div>
          <div>
            <strong className="text-slate-200 block">O endpoint tem proteção contra ataques?</strong>
            Sim! Há rate limiting em memória protegendo tanto a API REST contra força bruta quanto o endpoint RAW contra requisições abusivas.
          </div>
        </div>
      </div>
    </div>
  );
};
