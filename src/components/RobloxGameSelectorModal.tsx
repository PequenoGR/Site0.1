import React, { useState } from 'react';
import {
  Search,
  Gamepad2,
  Sparkles,
  Link as LinkIcon,
  Check,
  X,
  ExternalLink,
  Flame,
  Globe,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { POPULAR_ROBLOX_GAMES, RobloxGameItem, ROBLOX_CDN_ICON } from '../lib/robloxGames';
import { useToast } from './Toast';

interface RobloxGameSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: {
    name: string;
    category: string;
    thumbnailUrl: string;
    placeId?: string;
  }) => void;
  currentThumbnailUrl?: string | null;
  currentGameName?: string;
}

export const RobloxGameSelectorModal: React.FC<RobloxGameSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  currentThumbnailUrl,
  currentGameName,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'popular' | 'all' | 'customId'>('popular');
  const [placeIdInput, setPlaceIdInput] = useState('');
  const [searchingId, setSearchingId] = useState(false);
  const [customGameResult, setCustomGameResult] = useState<{
    placeId: string;
    name: string;
    thumbnailUrl: string;
    creator?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Filter games based on search
  const filteredGames = POPULAR_ROBLOX_GAMES.filter((g) => {
    if (activeTab === 'popular' && !g.isPopular && !searchTerm) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.placeId.includes(q) ||
      (g.tags && g.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  // Handle Search by Place ID or Roblox Game URL
  const handleLookupPlaceId = async () => {
    const raw = placeIdInput.trim();
    if (!raw) {
      showToast('ID Necessário', 'Digite o Place ID ou o Link do jogo do Roblox.', 'info');
      return;
    }

    setSearchingId(true);
    setCustomGameResult(null);

    try {
      // First try local popular list
      const matched = POPULAR_ROBLOX_GAMES.find((g) => g.placeId === raw || raw.includes(g.placeId));
      if (matched) {
        setCustomGameResult({
          placeId: matched.placeId,
          name: matched.name,
          thumbnailUrl: matched.thumbnailUrl,
        });
        setSearchingId(false);
        return;
      }

      // Query server endpoint or direct Roblox CDN
      const res = await fetch(`/api/roblox/lookup?placeId=${encodeURIComponent(raw)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.thumbnailUrl) {
          setCustomGameResult({
            placeId: data.placeId,
            name: data.name || `Roblox Game #${data.placeId}`,
            thumbnailUrl: data.thumbnailUrl,
            creator: data.creator,
          });
          showToast('Jogo Encontrado!', `Imagem oficial do Roblox carregada com sucesso.`);
          return;
        }
      }

      // If server lookup returns error, generate direct Roblox Place Icon URL
      let cleanPlaceId = raw.replace(/\D/g, '');
      if (raw.includes('/games/')) {
        const match = raw.match(/\/games\/(\d+)/);
        if (match) cleanPlaceId = match[1];
      }

      if (cleanPlaceId) {
        const directThumb = ROBLOX_CDN_ICON(cleanPlaceId);
        setCustomGameResult({
          placeId: cleanPlaceId,
          name: `Roblox Game #${cleanPlaceId}`,
          thumbnailUrl: directThumb,
        });
        showToast('Jogo Encontrado', 'Miniatura gerada via CDN do Roblox.');
      } else {
        showToast('Não encontrado', 'Não foi possível identificar o Place ID do jogo.', 'error');
      }
    } catch (err: any) {
      showToast('Erro ao buscar', 'Verifique o ID ou Link digitado.', 'error');
    } finally {
      setSearchingId(false);
    }
  };

  const handleSelect = (item: { name: string; category?: string; thumbnailUrl: string; placeId?: string }) => {
    onSelectGame({
      name: item.name,
      category: item.category || 'Geral',
      thumbnailUrl: item.thumbnailUrl,
      placeId: item.placeId,
    });
    showToast('Jogo Selecionado', `${item.name} definido com foto oficial da internet.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-[#2e4785] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#25396e] flex items-center justify-between bg-[#131f3d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Escolher Jogo do Roblox</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Fotos Oficiais da Internet
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Selecione um jogo ou busque pelo ID/Link para puxar a foto oficial do Roblox.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-800 bg-[#0f172a]">
          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'popular'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Mais Jogados</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Todos os Jogos ({POPULAR_ROBLOX_GAMES.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customId')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'customId'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buscar por ID / Link Roblox</span>
          </button>
        </div>

        {/* Search Bar / Input Area */}
        {activeTab !== 'customId' ? (
          <div className="p-3 bg-[#111c38] border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome do jogo (ex: Blox Fruits, Fisch, Blade Ball, Arsenal)..."
                className="w-full bg-[#1e2f5b] border border-[#2e4785] rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#111c38] border-b border-slate-800 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>Insira o Place ID ou Link do Jogo no Roblox:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={placeIdInput}
                  onChange={(e) => setPlaceIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookupPlaceId()}
                  placeholder="Ex: 2753915549 ou https://www.roblox.com/games/2753915549/Blox-Fruits"
                  className="flex-1 bg-[#1e2f5b] border border-[#2e4785] rounded-lg px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleLookupPlaceId}
                  disabled={searchingId}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {searchingId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar Jogo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Game Result Preview */}
            {customGameResult && (
              <div className="p-3 bg-[#172346] border border-blue-500/40 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-lg bg-black overflow-hidden border border-slate-700 shrink-0">
                    <img
                      src={customGameResult.thumbnailUrl}
                      alt={customGameResult.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{customGameResult.name}</h4>
                    <p className="text-[11px] text-emerald-400 font-medium">Place ID: {customGameResult.placeId}</p>
                    {customGameResult.creator && (
                      <p className="text-[10px] text-slate-400 truncate">Criador: {customGameResult.creator}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleSelect({
                      name: customGameResult.name,
                      category: 'Geral',
                      thumbnailUrl: customGameResult.thumbnailUrl,
                      placeId: customGameResult.placeId,
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Usar Esta Foto</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Games Grid Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab !== 'customId' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredGames.map((game) => {
                  const isSelected =
                    currentThumbnailUrl === game.thumbnailUrl ||
                    (currentGameName && currentGameName.toLowerCase() === game.name.toLowerCase());

                  return (
                    <div
                      key={game.id}
                      onClick={() => handleSelect(game)}
                      className={`group relative rounded-xl border p-2 flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] ${
                        isSelected
                          ? 'bg-blue-900/40 border-blue-400 ring-2 ring-blue-500/50'
                          : 'bg-[#162244] border-[#25396e] hover:border-blue-400/80 hover:bg-[#1b2b54]'
                      }`}
                    >
                      {/* Thumbnail Container */}
                      <div className="w-full aspect-square rounded-lg bg-slate-900 overflow-hidden relative border border-slate-700/60 shadow-xs">
                        <img
                          src={game.thumbnailUrl}
                          alt={game.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        {game.placeId !== '0' && (
                          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-slate-300 font-mono backdrop-blur-xs">
                            ID: {game.placeId}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="w-full text-center">
                        <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-blue-300 transition-colors">
                          {game.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{game.category}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredGames.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                  <HelpCircle className="w-8 h-8 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-300">Nenhum jogo encontrado com "{searchTerm}"</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Tente buscar por palavras-chave ou use a aba <strong>"Buscar por ID / Link Roblox"</strong> para puxar qualquer jogo do Roblox!
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'customId' && !customGameResult && (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h4 className="text-sm font-bold text-white">Adicione qualquer jogo do Roblox pelo Place ID</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Basta colar o link da página do jogo (ex: <code>https://www.roblox.com/games/2753915549/Blox-Fruits</code>) ou apenas os números do Place ID. O sistema buscará a miniatura e o nome oficial direto dos servidores do Roblox.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0c1322] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fotos 100% verificadas da internet (Roblox CDN)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
