import React, { useState, useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Copy, Trash2, Save, Maximize2, Minimize2, Check, Code2 } from 'lucide-react';
import { useToast } from './Toast';
import { useTheme } from '../context/ThemeContext';

interface LuauEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: () => void;
  readOnly?: boolean;
  minHeight?: string;
}

export const LuauEditor: React.FC<LuauEditorProps> = ({
  value,
  onChange,
  onSave,
  readOnly = false,
  minHeight = '420px',
}) => {
  const { mode, accentClasses } = useTheme();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [monacoLoaded, setMonacoLoaded] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lineCount = value.split('\n').length;
  const charCount = value.length;

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setMonacoLoaded(true);

    // Register Ctrl+S / Cmd+S shortcut inside editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) {
        onSave();
        showToast('Código salvo!', 'Alterações salvas com sucesso.');
      }
    });
  };

  // Keyboard shortcut for saving when outside Monaco
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onSave) {
          onSave();
          showToast('Código salvo!', 'Alterações salvas com sucesso.');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      showToast('Código copiado!', 'O código Luau foi copiado para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Erro ao copiar', 'Não foi possível acessar a área de transferência.', 'error');
    }
  };

  const handleClear = () => {
    if (window.confirm('Deseja realmente limpar todo o código do editor?')) {
      onChange('');
      showToast('Editor limpo', 'O conteúdo foi removido.', 'info');
    }
  };

  const editorTheme = mode === 'dark' ? 'vs-dark' : 'light';

  return (
    <div
      ref={containerRef}
      className={`flex flex-col border rounded-xl overflow-hidden transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none bg-slate-950'
          : mode === 'dark'
          ? 'border-slate-800 bg-slate-900/90 shadow-xl'
          : 'border-slate-300 bg-white shadow-lg'
      }`}
      style={{ minHeight: isFullscreen ? '100vh' : minHeight }}
    >
      {/* Editor Toolbar */}
      <div
        className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b select-none text-xs font-medium ${
          mode === 'dark'
            ? 'bg-slate-950/80 border-slate-800/80 text-slate-400'
            : 'bg-slate-100/90 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/40 text-slate-300 font-mono text-[11px]">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Luau / Lua</span>
          </div>
          <span className="hidden sm:inline-block text-slate-500">•</span>
          <span className="hidden sm:inline-block font-mono text-[11px]">
            {lineCount} {lineCount === 1 ? 'linha' : 'linhas'} ({charCount} carac.)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="btn-editor-wrap"
            onClick={() => setWordWrap(!wordWrap)}
            title="Quebra de linha automática"
            className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold border ${
              wordWrap
                ? `${accentClasses.badgeBg}`
                : mode === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            Quebra Linha: {wordWrap ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            id="btn-editor-copy"
            onClick={handleCopy}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all text-[11px] ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : mode === 'dark'
                ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border-slate-700/60'
                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300 border-slate-300'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          {!readOnly && (
            <button
              type="button"
              id="btn-editor-clear"
              onClick={handleClear}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-colors text-[11px] text-rose-400 hover:bg-rose-500/10 border-rose-500/30`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          {onSave && !readOnly && (
            <button
              type="button"
              id="btn-editor-save"
              onClick={() => {
                onSave();
                showToast('Script salvo!', 'Código e configurações gravados com sucesso.');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded font-semibold text-slate-950 transition-all text-[11px] shadow-sm ${accentClasses.primaryBg} ${accentClasses.primaryHover}`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar (Ctrl+S)</span>
            </button>
          )}

          <button
            type="button"
            id="btn-editor-fullscreen"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Sair de tela cheia' : 'Tela cheia'}
            className={`p-1 rounded transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Monaco Code Surface */}
      <div className="relative flex-1 w-full min-h-[360px] flex">
        <Editor
          height={isFullscreen ? 'calc(100vh - 45px)' : '100%'}
          language="lua"
          theme={editorTheme}
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          loading={
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Carregando Editor Luau...</p>
            </div>
          }
          options={{
            readOnly,
            fontSize: 13.5,
            fontFamily: "'Fira Code', monospace",
            fontLigatures: true,
            tabSize: 4,
            insertSpaces: true,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            minimap: { enabled: isFullscreen },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? 'on' : 'off',
            automaticLayout: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Footer Info Bar */}
      <div
        className={`px-4 py-1.5 flex items-center justify-between text-[11px] font-mono border-t ${
          mode === 'dark'
            ? 'bg-slate-950/60 border-slate-800/80 text-slate-500'
            : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
      >
        <span>UTF-8 • Luau Mode</span>
        <span>Atalho: Salve com Ctrl + S</span>
      </div>
    </div>
  );
};
