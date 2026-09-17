import React, { useState, useEffect } from 'react';
import {
  Link2,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Play,
  KeyRound,
  AlertTriangle,
  Code2,
  Lock,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react';
import { ScriptItem } from '../types';
import { api } from '../lib/api';
import { useToast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { copyToClipboard } from '../lib/clipboard';

interface RawManagerPageProps {
  initialScriptId?: string;
  onNavigate: (tab: string, scriptId?: string) => void;
}

export const RawManagerPage: React.FC<RawManagerPageProps> = ({ initialScriptId, onNavigate }) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();

  const [scripts, setScripts] = useState<ScriptItem[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(initialScriptId || '');
  const [selectedScript, setSelectedScript] = useState<ScriptItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Key generation & testing
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [testResult, setTestResult] = useState<{ status: number; text: string } | null>(null);
  const [testingRaw, setTestingRaw] = useState(false);

  // Copy state
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://scriptsgr.dev';

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const res = await api.getScripts({ scope: 'mine' });
        const list = Array.isArray(res?.scripts) ? res.scripts : [];
        setScripts(list);

        const targetId = initialScriptId || (list.length > 0 ? list[0].id : '');
        if (targetId) {
          setSelectedScriptId(targetId);
        }
      } catch (err: any) {
        showToast('Erro ao carregar scripts', err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [initialScriptId]);

  useEffect(() => {
    if (!selectedScriptId) return;
    async function loadDetail() {
      try {
        const res = await api.getScriptById(selectedScriptId);
        setSelectedScript(res.script);
        if (res.script.accessKeys && res.script.accessKeys.length > 0) {
          setSelectedKey(res.script.accessKeys[0].key);
        } else {
          setSelectedKey('');
        }
        setTestResult(null);
      } catch (err) {
        // ignore
      }
    }
    loadDetail();
  }, [selectedScriptId]);

  const rawUrl = selectedScript
    ? selectedScript.isPasswordProtected && selectedKey
      ? `${origin}/raw/${selectedScript.id}?key=${selectedKey}`
      : `${origin}/raw/${selectedScript.id}`
    : '';

  const loadstringCode = selectedScript ? `loadstring(game:HttpGet("${rawUrl}"))()` : '';

  const handleCopy = async (text: string, type: 'raw' | 'loadstring') => {
    const success = await copyToClipboard(text);
    if (success) {
      if (type === 'raw') {
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
      } else {
        setCopiedLoadstring(true);
        setTimeout(() => setCopiedLoadstring(false), 2000);
      }
      showToast('Copiado com sucesso!', text);
    } else {
      showToast('Erro ao copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScriptId || !newKeyName.trim()) return;

    setCreatingKey(true);
    try {
      const res = await api.createAccessKey(selectedScriptId, newKeyName.trim());
      showToast('Chave criada!', `Token gerado: ${res.accessKey.key}`);
      setNewKeyName('');
      const fresh = await api.getScriptById(selectedScriptId);
      setSelectedScript(fresh.script);
      setSelectedKey(res.accessKey.key);
    } catch (err: any) {
      showToast('Erro ao criar chave', err.message, 'error');
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (key: string) => {
    if (!selectedScriptId) return;
    if (!window.confirm('Deseja realmente revogar este token de acesso?')) return;
    try {
      await api.revokeAccessKey(selectedScriptId, key);
      showToast('Chave revogada!', 'O token foi cancelado.');
      const fresh = await api.getScriptById(selectedScriptId);
      setSelectedScript(fresh.script);
      if (selectedKey === key) {
        setSelectedKey(fresh.script.accessKeys?.[0]?.key || '');
      }
    } catch (err: any) {
      showToast('Erro ao revogar chave', err.message, 'error');
    }
  };

  const runRawTest = async () => {
    if (!selectedScriptId) return;
    setTestingRaw(true);
    try {
      const res = await api.fetchRaw(selectedScriptId, selectedScript?.isPasswordProtected ? selectedKey : undefined);
      setTestResult(res);
      showToast(
        res.status === 200 ? 'Teste 200 OK' : `Teste Status ${res.status}`,
        res.status === 200 ? 'Código Luau recebido com sucesso!' : 'Acesso negado conforme esperado.'
      );
    } catch (err: any) {
      showToast('Erro ao testar RAW', err.message, 'error');
    } finally {
      setTestingRaw(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="w-6 h-6 text-cyan-400" />
          <h1 className="text-xl font-black text-slate-100 tracking-tight">
            Gerenciamento do Link RAW & Loadstrings
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Entenda a arquitetura de requisições HTTP, configure parâmetros de autenticação e teste endpoints em tempo real.
        </p>
      </div>

      {/* Educational Notice: Why Password Protection Requires Access Keys */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertTriangle className="w-4 h-4" />
          <span>Como funciona o Loadstring com Proteção de Senha?</span>
        </div>
        <p>
          Quando um script Luau é executado no Roblox via <code className="text-amber-300 font-mono">loadstring(game:HttpGet(&quot;url&quot;))()</code>, 
          o cliente HTTP realiza um <strong>GET simples</strong> esperando <strong>código Luau puro</strong>. 
          Ele <strong>não possui navegador web</strong> para exibir formulários de senha em HTML. Se um site retornar HTML, o executor falha com erro de sintaxe.
        </p>
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-cyan-300">
          -- Formato Seguro Autenticado suportado pelo ScriptsGR:
          <br />
          <span className="text-amber-400">loadstring</span>(game:HttpGet(&quot;{origin}/raw/
          <span className="text-cyan-400">ID_DO_SCRIPT</span>?key=<span className="text-emerald-400">CHAVE_DE_ACESSO</span>&quot;))()
        </div>
        <p className="text-slate-400">
          A senha mestra é salva em hash seguro (bcrypt) no servidor e nunca vai na URL. 
          Você gera <strong>Chaves de Acesso (Tokens)</strong> que podem ser concedidas a amigos ou clientes e revogadas a qualquer momento!
        </p>
      </div>

      {/* Script Selector Dropdown */}
      <div
        className={`p-4 rounded-2xl border ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Selecione o Script para Gerenciar
        </label>
        <select
          id="select-raw-script"
          value={selectedScriptId}
          onChange={(e) => setSelectedScriptId(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${
            mode === 'dark'
              ? 'bg-slate-950 border-slate-800 text-slate-100'
              : 'bg-slate-50 border-slate-300 text-slate-900'
          } ${accentClasses.ring}`}
        >
          {scripts.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.id}) — {s.isPasswordProtected ? '🔒 Protegido' : '🔓 Público'}
            </option>
          ))}
        </select>
      </div>

      {selectedScript && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Link Builder & Key Selection */}
          <div className="space-y-4">
            {/* Status Card */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100">{selectedScript.title}</h3>
                </div>
                {selectedScript.isPasswordProtected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Protegido</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    <span>Público</span>
                  </span>
                )}
              </div>

              {/* Access Key Selection if Protected */}
              {selectedScript.isPasswordProtected && (
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-400">
                    Chave de Acesso Selecionada para a URL:
                  </label>
                  {selectedScript.accessKeys && selectedScript.accessKeys.length > 0 ? (
                    <select
                      value={selectedKey}
                      onChange={(e) => setSelectedKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-cyan-400 focus:outline-none"
                    >
                      {selectedScript.accessKeys.map((k) => (
                        <option key={k.key} value={k.key}>
                          {k.name}: {k.key}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-400">
                      Nenhuma chave criada. Crie uma abaixo para poder utilizar o script no loadstring!
                    </p>
                  )}
                </div>
              )}

              {/* RAW URL Output */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-400">URL RAW Direta:</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={rawUrl}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-cyan-400 select-all"
                  />
                  <button
                    id="btn-copy-raw-manager"
                    onClick={() => handleCopy(rawUrl, 'raw')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
                  >
                    {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRaw ? 'RAW Copiado' : 'Copiar RAW'}</span>
                  </button>
                </div>
              </div>

              {/* Loadstring Output */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-400">
                  Comando Loadstring Luau para Execução:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-loadstring-manager"
                    readOnly
                    value={loadstringCode}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-mono bg-slate-950 border border-slate-800 text-amber-300 select-all"
                  />
                  <button
                    id="btn-copy-loadstring-manager"
                    onClick={() => handleCopy(loadstringCode, 'loadstring')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-slate-950 flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
                  >
                    {copiedLoadstring ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLoadstring ? 'Loadstring Copiado' : 'Copiar Loadstring'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Abrir RAW no Navegador</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={runRawTest}
                  disabled={testingRaw}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 text-emerald-400 ${testingRaw ? 'animate-spin' : ''}`} />
                  <span>{testingRaw ? 'Testando...' : 'Testar Requisição RAW'}</span>
                </button>
              </div>
            </div>

            {/* Access Keys Management (Owner only) */}
            {selectedScript.isPasswordProtected && selectedScript.isOwner && (
              <div
                className={`p-5 rounded-2xl border space-y-4 ${
                  mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                    <span>Gerador de Chaves de Acesso (Tokens)</span>
                  </h3>
                </div>

                <form onSubmit={handleCreateKey} className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Nome da chave (Ex: Amigo, Servidor #2)..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={creatingKey || !newKeyName.trim()}
                    className={`px-4 py-2 rounded-xl font-bold text-xs text-slate-950 flex items-center gap-1 ${accentClasses.primaryBg}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Chave</span>
                  </button>
                </form>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedScript.accessKeys && selectedScript.accessKeys.length > 0 ? (
                    selectedScript.accessKeys.map((k) => (
                      <div
                        key={k.key}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          selectedKey === k.key
                            ? 'bg-slate-950 border-cyan-500/40 ring-1 ring-cyan-500/20'
                            : 'bg-slate-950/60 border-slate-800/80'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-200">{k.name}</div>
                          <div className="font-mono text-[11px] text-cyan-400 truncate">{k.key}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKey(k.key);
                              showToast('Chave ativa selecionada', k.name);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                              selectedKey === k.key
                                ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {selectedKey === k.key ? 'Ativa' : 'Usar'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.key)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                            title="Revogar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Nenhuma chave cadastrada.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live RAW Endpoint Tester & Output */}
          <div className="space-y-4">
            <div
              className={`p-5 rounded-2xl border space-y-3 flex flex-col h-full ${
                mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">Testador RAW em Tempo Real</h3>
                </div>
                {testResult && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      testResult.status === 200
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    HTTP {testResult.status} {testResult.status === 200 ? 'OK' : 'Unauthorized'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Veja exatamente o que a função <code className="text-amber-300 font-mono">game:HttpGet()</code> do Roblox recebe ao chamar este link.
              </p>

              {/* Console Output Terminal */}
              <div className="flex-1 min-h-[340px] rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs overflow-auto flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="text-slate-500 text-[11px] pb-2 border-b border-slate-800/80 flex items-center justify-between">
                    <span>Content-Type: text/plain; charset=utf-8</span>
                    <span>X-Content-Type-Options: nosniff</span>
                  </div>

                  {testResult ? (
                    <pre
                      className={`whitespace-pre-wrap break-all ${
                        testResult.status === 200 ? 'text-cyan-300' : 'text-rose-400'
                      }`}
                    >
                      {testResult.text}
                    </pre>
                  ) : (
                    <div className="text-slate-500 italic py-10 text-center">
                      Clique no botão &quot;Testar Requisição RAW&quot; acima para simular a requisição HTTP.
                    </div>
                  )}
                </div>

                {testResult && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Tamanho: {testResult.text.length} bytes</span>
                    <span>Retorno verificado: texto puro sem HTML</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
