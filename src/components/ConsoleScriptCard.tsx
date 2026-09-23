import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { ScriptItem } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { accentInfo } = useTheme();
  const hasThumbnail = Boolean(script.thumbnailUrl && script.thumbnailUrl.trim().length > 0);
  const displayName = script.category || script.title || 'Script';

  return (
    <div
      id={`console-card-${script.id}`}
      onClick={() => onClick(script)}
      style={{
        backgroundColor: accentInfo.cardBgHex,
        borderColor: accentInfo.cardBorderHex,
      }}
      className="group rounded-xl overflow-hidden border-2 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.98] select-none shadow-lg"
    >
      {/* Top Media / Thumbnail Section */}
      <div className="w-full aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
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

        {/* Fallback "Sem foto" */}
        <div
          className={`fallback-placeholder w-full h-full bg-black flex flex-col items-center justify-center ${
            hasThumbnail ? 'hidden' : 'flex'
          }`}
        >
          <span className="text-5xl sm:text-6xl font-black text-white leading-none">?</span>
          <span className="text-sm sm:text-base font-black text-white tracking-wide mt-1 font-['Nunito',sans-serif]">
            Sem foto
          </span>
        </div>
      </div>

      {/* Bottom Color Stats & Title Bar */}
      <div
        style={{ backgroundColor: accentInfo.cardBgHex }}
        className="p-3 sm:p-4 flex flex-col justify-between flex-1 min-h-[90px] sm:min-h-[105px]"
      >
        {/* Badges container */}
        <div className="flex flex-col gap-1.5">
          {/* Top View Counter Badge */}
          <div className="bg-black/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-black text-white w-fit shadow-xs">
            <Eye className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>{script.accessCount || 0}</span>
          </div>

          {/* Bottom Time Ago Badge */}
          <div className="bg-black/90 rounded-md px-2.5 py-1 flex items-center gap-1.5 text-xs font-black text-white w-fit shadow-xs">
            <Clock className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span>{formatConsoleTime(script.createdAt)}</span>
          </div>
        </div>

        {/* Script / Game Name Display in Large Bold Font */}
        {displayName && (
          <div className="mt-2.5">
            <h3 className={`text-xl sm:text-2xl font-black leading-tight font-['Nunito',sans-serif] drop-shadow-sm truncate ${
              accentInfo.cardBgHex === '#f8fafc' ? 'text-slate-900' : 'text-white'
            }`}>
              {displayName}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
