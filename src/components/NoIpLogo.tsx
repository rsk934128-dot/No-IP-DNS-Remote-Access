import React from 'react';

interface NoIpLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  showIconOnly?: boolean;
}

export const NoIpLogo: React.FC<NoIpLogoProps> = ({ 
  className = 'h-8', 
  variant = 'dark',
  showIconOnly = false
}) => {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none cursor-pointer ${className}`} id="no-ip-brand-logo">
      {/* Official No-IP PWA & Brand App Icon */}
      <div className="relative flex-shrink-0">
        <img
          src="/icon.svg"
          alt="No-IP App Icon"
          className="h-8 w-8 rounded-xl shadow-xs hover:opacity-95 transition-transform hover:scale-105"
        />
      </div>
      
      {/* Logotype */}
      {!showIconOnly && (
        <div className="flex items-baseline font-black tracking-tight text-xl font-sans">
          <span className={isLight ? 'text-white' : 'text-[#0a2540] dark:text-white'}>no</span>
          <span className="text-[#ff6600] font-bold mx-0.5">-</span>
          <span className={isLight ? 'text-white' : 'text-[#0a2540] dark:text-white'}>ip</span>
          <span className="text-[10px] text-[#ff6600] font-bold ml-0.5 -translate-y-2">®</span>
        </div>
      )}
    </div>
  );
};

