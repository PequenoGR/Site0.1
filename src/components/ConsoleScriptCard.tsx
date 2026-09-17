import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { ScriptItem } from '../types';

interface ConsoleScriptCardProps {
  script: ScriptItem;
  onClick: (script: ScriptItem) => void;
}

// Formats relative time matching the console screenshot (e.g. 0min, 8min, 2h, 20h, 30h, 1d)
export function formatConsoleTime(isoString?: string): string {
  if (!isoString) return '0min';
  try {
    const diffMs = Math.max(0, Date.now() - new Date(isoString).getTime());
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) {
      return '0min';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 48) {
      return `${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  } catch {
    return '0min';
  }
}

export const ConsoleScriptCard: React.FC<ConsoleScriptCardProps> = ({ script, onClick }) => {
  const hasThumbnail = Boolean(script.thumbnailUrl && script.thumbnailUrl.trim().length > 0);

  return (
    <div
      id={`console-card-${script.id}`}
      onClick={() => onClick(script)}
      className="group rounded-2xl overflow-hidden bg-[#1a365d] border border-[#2b4c7e] flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/30 active:scale-[0.98] select-none"
    >
      {/* Top Media / Thumbnail Section */}
      <div className="w-full aspect-[4/3] sm:aspect-[16/11] bg-black relative flex items-center justify-center overflow-hidden">
        {hasThumbnail ? (
          <img
            src={script.thumbnailUrl}
            alt={script.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to "Sem foto" if image fails to load
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                (e.target as HTMLElement).style.display = 'none';
                const fallback = parent.querySelector('.fallback-placeholder');
                if (fallback) (fallback as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}

        {/* Fallback "Sem foto" exactly like user screenshot */}
        <div
          className={`fallback-placeholder w-full h-full bg-black flex flex-col items-center justify-center ${
            hasThumbnail ? 'hidden' : 'flex'
          }`}
        >
          <span className="text-4xl sm:text-5xl font-black text-white leading-none">?</span>
          <span className="text-xs sm:text-sm font-black text-white tracking-wide mt-1.5">Sem foto</span>
        </div>

        {/* Title overlay tooltip on hover */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-[11px] font-bold text-white truncate drop-shadow-sm">{script.title}</p>
        </div>
      </div>

      {/* Bottom Darker Blue Stats Bar */}
      <div className="bg-[#1a365d] px-2.5 sm:px-3 py-2 sm:py-2.5 flex flex-col justify-center gap-1.5 min-h-[64px] sm:min-h-[70px]">
        {/* Top View Counter Pill */}
        <div className="bg-black/90 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-xs font-black text-white w-fit shadow-xs">
          <Eye className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>{script.accessCount || 0}</span>
        </div>

        {/* Bottom Time Ago Pill */}
        <div className="bg-black/90 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 text-xs font-black text-white w-fit shadow-xs">
          <Clock className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          <span>{formatConsoleTime(script.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
