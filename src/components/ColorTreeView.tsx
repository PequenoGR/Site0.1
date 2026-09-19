import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Sun,
  Moon,
  Search,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { AccentColor, ThemeMode } from '../types';

interface ColorTreeViewProps {
  currentMode: ThemeMode;
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
  onSelectMode: (mode: ThemeMode) => void;
}

interface TreeChildColor {
  id: AccentColor;
  name: string;
  hex: string;
  bgClass: string;
  desc: string;
}

interface TreeChildMode {
  id: ThemeMode;
  name: string;
  icon: 'moon' | 'sun';
  desc: string;
}

export const ColorTreeView: React.FC<ColorTreeViewProps> = ({
  currentMode,
  currentAccent,
  onSelectAccent,
  onSelectMode,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
    cyber: true,
    vibrant: true,
    modes: true,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const cyberColors: TreeChildColor[] = [
    { id: 'cyan', name: 'Ciano Neon', hex: '#06b6d4', bgClass: 'bg-cyan-500', desc: 'Estilo clássico terminal Luau' },
    { id: 'blue', name: 'Azul Royal', hex: '#2563eb', bgClass: 'bg-blue-600', desc: 'Equilíbrio e clareza visual' },
    { id: 'violet', name: 'Violeta Cyber', hex: '#8b5cf6', bgClass: 'bg-violet-500', desc: 'Roxo futurista de alto contraste' },
  ];

  const vibrantColors: TreeChildColor[] = [
    { id: 'emerald', name: 'Esmeralda', hex: '#10b981', bgClass: 'bg-emerald-500', desc: 'Verde vibrante motor Roblox' },
    { id: 'amber', name: 'Âmbar Dourado', hex: '#f59e0b', bgClass: 'bg-amber-500', desc: 'Tons quentes e dourados' },
    { id: 'rose', name: 'Rosa Crimson', hex: '#f43f5e', bgClass: 'bg-rose-500', desc: 'Destaque vívido e moderno' },
  ];

  const themeModes: TreeChildMode[] = [
    { id: 'dark', name: 'Modo Escuro (Dark)', icon: 'moon', desc: 'Fundo escuro profundo para programar' },
    { id: 'light', name: 'Modo Claro (Light)', icon: 'sun', desc: 'Interface nítida e moderna com fundo claro' },
  ];

  const toggleNode = (nodeKey: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const expandAll = () => {
    setExpandedNodes({ root: true, cyber: true, vibrant: true, modes: true });
  };

  const collapseAll = () => {
    setExpandedNodes({ root: true, cyber: false, vibrant: false, modes: false });
  };

  const filterItem = (text: string) => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  };

  return (
    <div className="bg-[#030712] border border-slate-800 rounded-2xl p-4 sm:p-5 text-slate-100 shadow-xl space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white tracking-tight">Personalização de Cores e Temas</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Selecione uma cor ou modo de interface na árvore abaixo para personalizar o visual.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            title="Expandir todas as pastas"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Expandir</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors"
            title="Recolher pastas"
          >
            <Minimize2 className="w-3 h-3" />
            <span>Recolher</span>
          </button>
        </div>
      </div>

      {/* Search Input for Tree View */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar cor ou tema (ex: Ciano, Azul, Escuro)..."
          className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
      </div>

      {/* Tree Structure */}
      <div className="font-mono text-xs space-y-2 select-none">
        {/* ROOT NODE */}
        <div className="border border-slate-800/80 rounded-xl p-3 bg-slate-950/60">
          <div
            onClick={() => toggleNode('root')}
            className="flex items-center gap-2 cursor-pointer text-slate-200 hover:text-white group"
          >
            {expandedNodes.root ? (
              <ChevronDown className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
            )}
            {expandedNodes.root ? (
              <FolderOpen className="w-4 h-4 text-amber-400" />
            ) : (
              <Folder className="w-4 h-4 text-amber-400" />
            )}
            <span className="font-bold text-slate-100">Paleta de Cores &amp; Temas</span>
          </div>

          {/* Root Children */}
          {expandedNodes.root && (
            <div className="pl-4 mt-2 border-l border-slate-800 ml-2 space-y-3 pt-1">
              
              {/* BRANCH 1: Cyber Colors */}
              <div className="space-y-1.5">
                <div
                  onClick={() => toggleNode('cyber')}
                  className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white py-1"
                >
                  <span className="text-slate-600 font-sans">├──</span>
                  {expandedNodes.cyber ? (
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {expandedNodes.cyber ? (
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="font-semibold text-cyan-300">Cores Primárias &amp; Cyber</span>
                </div>

                {/* Cyber Colors */}
                {expandedNodes.cyber && (
                  <div className="pl-6 border-l border-slate-800 ml-5 space-y-1">
                    {cyberColors
                      .filter((c) => filterItem(c.name) || filterItem(c.desc))
                      .map((c, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        const isSelected = currentAccent === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => onSelectAccent(c.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-cyan-500/15 border border-cyan-500/40 text-white shadow-xs'
                                : 'hover:bg-slate-900 border border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-slate-600 font-sans">{isLast ? '└──' : '├──'}</span>
                              <div className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ${c.bgClass}`} />
                              <span className="font-bold truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline truncate">
                                {c.hex}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" /> Ativo
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 hover:text-slate-300">
                                  Selecionar
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* BRANCH 2: Vibrant Colors */}
              <div className="space-y-1.5">
                <div
                  onClick={() => toggleNode('vibrant')}
                  className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white py-1"
                >
                  <span className="text-slate-600 font-sans">├──</span>
                  {expandedNodes.vibrant ? (
                    <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {expandedNodes.vibrant ? (
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="font-semibold text-emerald-300">Cores Vibrantes &amp; Quentes</span>
                </div>

                {/* Vibrant Colors */}
                {expandedNodes.vibrant && (
                  <div className="pl-6 border-l border-slate-800 ml-5 space-y-1">
                    {vibrantColors
                      .filter((c) => filterItem(c.name) || filterItem(c.desc))
                      .map((c, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        const isSelected = currentAccent === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => onSelectAccent(c.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-emerald-500/15 border border-emerald-500/40 text-white shadow-xs'
                                : 'hover:bg-slate-900 border border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-slate-600 font-sans">{isLast ? '└──' : '├──'}</span>
                              <div className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ${c.bgClass}`} />
                              <span className="font-bold truncate">{c.name}</span>
                              <span className="text-[10px] text-slate-500 font-normal hidden sm:inline truncate">
                                {c.hex}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" /> Ativo
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 hover:text-slate-300">
                                  Selecionar
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* BRANCH 3: Theme Modes */}
              <div className="space-y-1.5">
                <div
                  onClick={() => toggleNode('modes')}
                  className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white py-1"
                >
                  <span className="text-slate-600 font-sans">└──</span>
                  {expandedNodes.modes ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  {expandedNodes.modes ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="font-semibold text-amber-300">Modos de Fundo (Dark / Light)</span>
                </div>

                {/* Theme Modes */}
                {expandedNodes.modes && (
                  <div className="pl-6 border-l border-slate-800 ml-5 space-y-1">
                    {themeModes
                      .filter((m) => filterItem(m.name) || filterItem(m.desc))
                      .map((m, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        const isSelected = currentMode === m.id;
                        return (
                          <div
                            key={m.id}
                            onClick={() => onSelectMode(m.id)}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-500/15 border border-amber-500/40 text-white shadow-xs'
                                : 'hover:bg-slate-900 border border-transparent text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-slate-600 font-sans">{isLast ? '└──' : '├──'}</span>
                              {m.icon === 'moon' ? (
                                <Moon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                              ) : (
                                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="font-bold truncate">{m.name}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                                  <Check className="w-3 h-3" /> Ativo
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 hover:text-slate-300">
                                  Selecionar
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
