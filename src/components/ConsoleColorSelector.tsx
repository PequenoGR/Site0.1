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
      id: 'red',
      name: 'Vermelho',
      circleGradient: 'bg-gradient-to-br from-[#ff4d4d] to-[#dc2626]',
      glowColor: 'rgba(239, 68, 68, 0.45)',
    },
    {
      id: 'pink',
      name: 'Rosa',
      circleGradient: 'bg-gradient-to-br from-[#ff77c2] to-[#ec4899]',
      glowColor: 'rgba(244, 63, 94, 0.45)',
    },
    {
      id: 'emerald',
      name: 'Verde',
      circleGradient: 'bg-gradient-to-br from-[#10b981] to-[#059669]',
      glowColor: 'rgba(16, 185, 129, 0.45)',
    },
    {
      id: 'violet',
      name: 'Roxo Sunset',
      circleGradient: 'bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899]',
      glowColor: 'rgba(168, 85, 247, 0.45)',
    },
    {
      id: 'amber',
      name: 'Dourado / Âmbar',
      circleGradient: 'bg-gradient-to-br from-[#d97706] to-[#78350f]',
      glowColor: 'rgba(217, 119, 6, 0.45)',
    },
    {
      id: 'cyan',
      name: 'Ciano Menta',
      circleGradient: 'bg-gradient-to-br from-[#06b6d4] to-[#34d399]',
      glowColor: 'rgba(6, 182, 212, 0.45)',
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
        <span className="font-extrabold text-xl tracking-wide text-white drop-shadow-sm font-sans">
          Cores
        </span>
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
          className="bg-[#162044] border-x-[2.5px] border-b-[2.5px] rounded-b-2xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 shadow-2xl transition-all"
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
      )}
    </div>
  );
};
