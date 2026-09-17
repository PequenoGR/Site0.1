import React from 'react';
import { APP_VERSION } from '../version';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showVersion?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showVersion = true }) => {
  const sizeConfig = {
    sm: {
      text: 'text-xl sm:text-2xl',
      underlineH: 'h-[3px] sm:h-[4px]',
      underlineW: 'w-[32px] sm:w-[38px]',
      underlineBottom: '-bottom-[3px]',
      rotate: 'rotate-[3deg]',
      badgeText: 'text-[10px] px-1.5 py-0.5 ml-2 font-bold tracking-normal',
    },
    md: {
      text: 'text-2xl sm:text-3xl',
      underlineH: 'h-[4px] sm:h-[5px]',
      underlineW: 'w-[42px] sm:w-[50px]',
      underlineBottom: '-bottom-[4px]',
      rotate: 'rotate-[3deg]',
      badgeText: 'text-xs px-2 py-0.5 ml-2.5 font-bold tracking-normal',
    },
    lg: {
      text: 'text-4xl sm:text-5xl',
      underlineH: 'h-[7px] sm:h-[8px]',
      underlineW: 'w-[68px] sm:w-[82px]',
      underlineBottom: '-bottom-[6px]',
      rotate: 'rotate-[3deg]',
      badgeText: 'text-sm px-2.5 py-1 ml-3 font-bold tracking-normal',
    },
    xl: {
      text: 'text-5xl sm:text-6xl',
      underlineH: 'h-[9px] sm:h-[10px]',
      underlineW: 'w-[88px] sm:w-[105px]',
      underlineBottom: '-bottom-[8px]',
      rotate: 'rotate-[3deg]',
      badgeText: 'text-base px-3 py-1 ml-3.5 font-bold tracking-normal',
    },
  };

  const current = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-center select-none font-black tracking-tight text-white leading-none relative ${className}`}
      style={{ fontFamily: "'Nunito', 'Fredoka', 'Inter', -apple-system, sans-serif" }}
    >
      <div className="inline-flex items-baseline relative">
        <span className={`${current.text} font-black drop-shadow-sm`}>
          Scripts
        </span>
        <span className={`relative inline-block ${current.text} font-black`}>
          GR
          {/* Red Pill Underline below GR */}
          <span
            className={`absolute left-0.5 ${current.underlineBottom} ${current.underlineW} ${current.underlineH} bg-[#ff3239] rounded-full ${current.rotate} transform origin-left shadow-xs pointer-events-none`}
          />
        </span>
      </div>

      {showVersion && (
        <span
          id="badge-app-version"
          className={`${current.badgeText} text-slate-300 bg-slate-900/90 border border-slate-700/80 rounded-full shadow-xs inline-flex items-center justify-center font-mono`}
          title={`Versão Atual: ${APP_VERSION}`}
        >
          {APP_VERSION}
        </span>
      )}
    </div>
  );
};
