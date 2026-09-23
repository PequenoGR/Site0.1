import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { AccentColor } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useAppVersion } from '../context/VersionContext';

interface ColorOption {
  id: AccentColor;
  name: string;
  circleGradient: string;
  glowColor: string;
}

interface ConsoleColorSelectorProps {
  currentAccent: AccentColor;
  onSelectAccent: (accent: AccentColor) => void;
}

export const ConsoleColorSelector: React.FC<ConsoleColorSelectorProps> = ({
  currentAccent,
  onSelectAccent,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { accentInfo } = useTheme();
  const { incrementVersion } = useAppVersion();

  const colors: ColorOption[] = [
    {
      id: 'black',
      name: 'Preto Ônix / Carbon',
      circleGradient: 'bg-gradient-to-br from-[#3f3f46] via-[#18181b] to-[#09090b]',
      glowColor: 'rgba(255, 255, 255, 0.25)',
    },
    {
      id: 'white',
      name: 'Branco Neve / Silver',
      circleGradient: 'bg-gradient-to-br from-[#ffffff] via-[#f1f5f9] to-[#cbd5e1]',
      glowColor: 'rgba(255, 255, 255, 0.65)',
    },
    {
      id: 'red',
      name: 'Vermelho',
      circleGradient: 'bg-gradient-to-br from-[#ff4d4d] to-[#dc2626]',
      glowColor: 'rgba(239, 68, 68, 0.45)',
    },
    {
      id: 'blue',
      name: 'Azul Royal',
      circleGradient: 'bg-gradient-to-br from-[#60a5fa] to-[#1d4ed8]',
      glowColor: 'rgba(59, 130, 246, 0.45)',
    },
    {
      id: 'orange',
      name: 'Laranja Neon / Solar',
      circleGradient: 'bg-gradient-to-br from-[#fb923c] to-[#ea580c]',
      glowColor: 'rgba(249, 115, 22, 0.45)',
    },
    {
      id: 'yellow',
      name: 'Amarelo Cyber',
      circleGradient: 'bg-gradient-to-br from-[#fde047] to-[#ca8a04]',
      glowColor: 'rgba(234, 179, 8, 0.45)',
    },
    {
      id: 'emerald',
      name: 'Verde Esmeralda',
      circleGradient: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
      glowColor: 'rgba(16, 185, 129, 0.45)',
    },
    {
      id: 'lime',
      name: 'Verde Lima / Limão',
      circleGradient: 'bg-gradient-to-br from-[#a3e635] to-[#4d7c0f]',
      glowColor: 'rgba(132, 204, 22, 0.45)',
    },
    {
      id: 'cyan',
      name: 'Ciano Menta',
      circleGradient: 'bg-gradient-to-br from-[#06b6d4] to-[#34d399]',
      glowColor: 'rgba(6, 182, 212, 0.45)',
    },
    {
      id: 'teal',
      name: 'Turquesa / Aqua',
      circleGradient: 'bg-gradient-to-br from-[#2dd4bf] to-[#0f766e]',
      glowColor: 'rgba(20, 184, 166, 0.45)',
    },
    {
      id: 'pink',
      name: 'Rosa',
      circleGradient: 'bg-gradient-to-br from-[#ff77c2] to-[#ec4899]',
      glowColor: 'rgba(244, 63, 94, 0.45)',
    },
    {
      id: 'rose',
      name: 'Rosa Crimson',
      circleGradient: 'bg-gradient-to-br from-[#fb7185] to-[#be123c]',
      glowColor: 'rgba(244, 63, 94, 0.45)',
    },
    {
      id: 'violet',
      name: 'Roxo Sunset',
      circleGradient: 'bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899]',
      glowColor: 'rgba(168, 85, 247, 0.45)',
    },
    {
      id: 'purple',
      name: 'Púrpura / Roxo Profundo',
      circleGradient: 'bg-gradient-to-br from-[#c084fc] to-[#7e22ce]',
      glowColor: 'rgba(168, 85, 247, 0.45)',
    },
    {
      id: 'indigo',
      name: 'Índigo Galáxia',
      circleGradient: 'bg-gradient-to-br from-[#818cf8] to-[#3730a3]',
      glowColor: 'rgba(99, 102, 241, 0.45)',
    },
    {
      id: 'amber',
      name: 'Dourado / Âmbar',
      circleGradient: 'bg-gradient-to-br from-[#d97706] to-[#78350f]',
      glowColor: 'rgba(217, 119, 6, 0.45)',
    },
    {
      id: 'slate',
      name: 'Cinza Grafite / Chumbo',
      circleGradient: 'bg-gradient-to-br from-[#94a3b8] to-[#334155]',
      glowColor: 'rgba(148, 163, 184, 0.4)',
    },
  ];

  const handleSelect = (color: ColorOption) => {
    onSelectAccent(color.id);
    incrementVersion(`Cor selecionada: ${color.name}`);
  };

  return (
    <div className="w-full max-w-md mx-auto select-none my-6">
      {/* Console Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: accentInfo.headerBgHex,
          borderColor: accentInfo.cardBorderHex,
        }}
        className="text-white px-5 py-3.5 rounded-t-2xl flex items-center justify-between cursor-pointer transition-colors shadow-lg border-t border-x"
      >
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-wide text-white drop-shadow-sm font-sans">
            Cores
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/90 border border-white/20">
            {colors.length} opções
          </span>
        </div>
        <div className="text-white">
          {isOpen ? (
            <ChevronUp className="w-6 h-6 stroke-[3.5] text-white" />
          ) : (
            <ChevronDown className="w-6 h-6 stroke-[3.5] text-white" />
          )}
        </div>
      </div>

      {/* Console Container Body */}
      {isOpen && (
        <div
          style={{
            borderColor: accentInfo.cardBorderHex,
          }}
          className="bg-[#162044] border-x-[2.5px] border-b-[2.5px] rounded-b-2xl p-3 sm:p-3.5 shadow-2xl transition-all"
        >
          {/* Scrollable Container with Visible Scrollbar */}
          <div
            className="max-h-[390px] overflow-y-auto space-y-2.5 sm:space-y-3 pr-2 custom-scrollbar"
            style={{
              scrollbarColor: `${accentInfo.accentHex} rgba(15, 23, 42, 0.7)`,
            }}
          >
            {colors.map((color) => {
              const isSelected = currentAccent === color.id;

              return (
                <div
                  key={color.id}
                  onClick={() => handleSelect(color)}
                  style={{
                    borderColor: isSelected ? accentInfo.accentHex : 'transparent',
                    boxShadow: isSelected ? `0 0 16px ${accentInfo.glowRgba}` : undefined,
                  }}
                  className={`bg-[#202e5c] hover:bg-[#293c78] h-14 sm:h-16 rounded-2xl flex items-center justify-between px-4 cursor-pointer transition-all duration-150 active:scale-[0.99] border ${
                    isSelected ? 'ring-1' : 'hover:border-[#3b62c4]/60'
                  }`}
                >
                  {/* Circular Color Dot */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg shrink-0 ${color.circleGradient}`}
                      style={{
                        boxShadow: `0 4px 10px ${color.glowColor}, inset 0 2px 4px rgba(255,255,255,0.35)`,
                      }}
                    />
                    <span className="text-sm sm:text-base font-bold text-slate-100 tracking-wide font-sans">
                      {color.name}
                    </span>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div
                      style={{
                        backgroundColor: `${accentInfo.accentHex}33`,
                        borderColor: accentInfo.accentHex,
                      }}
                      className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0"
                    >
                      <Check
                        style={{ color: accentInfo.accentHex }}
                        className="w-4 h-4 stroke-[3]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
