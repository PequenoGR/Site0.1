import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeConfig = {
    sm: {
      text: 'text-xl sm:text-2xl',
      underlineH: 'h-[3px] sm:h-[4px]',
      underlineW: 'w-[32px] sm:w-[38px]',
      underlineBottom: '-bottom-[3px]',
      rotate: 'rotate-[3deg]',
    },
    md: {
      text: 'text-2xl sm:text-3xl',
      underlineH: 'h-[4px] sm:h-[5px]',
      underlineW: 'w-[42px] sm:w-[50px]',
      underlineBottom: '-bottom-[4px]',
      rotate: 'rotate-[3deg]',
    },
    lg: {
      text: 'text-4xl sm:text-5xl',
      underlineH: 'h-[7px] sm:h-[8px]',
      underlineW: 'w-[68px] sm:w-[82px]',
      underlineBottom: '-bottom-[6px]',
      rotate: 'rotate-[3deg]',
    },
    xl: {
      text: 'text-5xl sm:text-6xl',
      underlineH: 'h-[9px] sm:h-[10px]',
      underlineW: 'w-[88px] sm:w-[105px]',
      underlineBottom: '-bottom-[8px]',
      rotate: 'rotate-[3deg]',
    },
  };

  const current = sizeConfig[size];

  return (
    <div
      className={`inline-flex items-baseline select-none font-black tracking-tight text-white leading-none relative ${className}`}
      style={{ fontFamily: "'Nunito', 'Fredoka', 'Inter', -apple-system, sans-serif" }}
    >
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
  );
};
