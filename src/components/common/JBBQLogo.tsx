import React, { useState } from 'react';

interface JBBQLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isLao?: boolean;
}

export const JBBQLogo: React.FC<JBBQLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isLao = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Size mappings
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: { title: 'text-xs', sub: 'text-[9px]' },
    md: { title: 'text-sm', sub: 'text-[10px]' },
    lg: { title: 'text-base', sub: 'text-xs' },
    xl: { title: 'text-xl', sub: 'text-xs' },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      
      {/* Modern J + BBQ Mascot Emblem */}
      <div 
        className={`${iconDimensions[size]} relative rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 flex items-center justify-center p-0.5 shadow-lg shadow-orange-600/30 border border-amber-300/40 overflow-hidden shrink-0 group`}
      >
        {/* Ambient fire glow inside container */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-300/40 to-transparent pointer-events-none" />

        {!imgError ? (
          <img
            src="/src/assets/images/j_bbq_mascot_logo_1791169418345.jpg"
            alt="J BBQ Mascot Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-[14px]"
          />
        ) : (
          /* High-Fidelity Modern Vector SVG: Letter 'J' fused with BBQ Mascot */
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Dark Charcoal Sizzle Plate Background */}
            <circle cx="50" cy="50" r="46" fill="#0F172A" />

            {/* Glowing Flame Aura */}
            <path
              d="M50 12C50 12 60 25 56 34C63 27 70 35 68 46C66 57 56 59 56 59C56 59 62 50 54 42C48 35 44 26 50 12Z"
              fill="url(#flameGradient)"
              opacity="0.85"
            />

            {/* Stylized Modern Letter "J" Body as BBQ Mascot */}
            <path
              d="M48 24H68C70.2 24 72 25.8 72 28V36C72 38.2 70.2 40 68 40H60V64C60 74 52 82 40 82C28 82 20 74 20 64C20 61.8 21.8 60 24 60H32C34.2 60 36 61.8 36 64C36 66.2 37.8 68 40 68C42.2 68 44 66.2 44 64V28C44 25.8 45.8 24 48 24Z"
              fill="url(#jBodyGradient)"
            />

            {/* BBQ Chef Hat on top of J */}
            <path
              d="M52 14C50 14 48 16 48 18C46 18 44 20 44 22H68C68 20 66 18 64 18C64 16 62 14 60 14C58 14 56 15 56 16C56 15 54 14 52 14Z"
              fill="#FFFFFF"
            />

            {/* Cute Mascot Eyes on the Stem of J */}
            <ellipse cx="50" cy="34" rx="2.5" ry="3.5" fill="#0F172A" />
            <circle cx="49" cy="33" r="1" fill="#FFFFFF" />

            {/* Cute Sizzle Smile */}
            <path
              d="M47 43Q51 47 55 43"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Rosy BBQ Sizzle Cheeks */}
            <circle cx="45" cy="42" r="1.5" fill="#EF4444" opacity="0.8" />
            <circle cx="57" cy="42" r="1.5" fill="#EF4444" opacity="0.8" />

            {/* BBQ Skewer Accent piercing curve of J */}
            <line x1="16" y1="56" x2="30" y2="70" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="20" cy="60" r="3" fill="#EA580C" />
            <circle cx="26" cy="66" r="3" fill="#B91C1C" />

            {/* Gradients */}
            <defs>
              <linearGradient id="jBodyGradient" x1="20" y1="24" x2="72" y2="82" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="0.5" stopColor="#F97316" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
              <linearGradient id="flameGradient" x1="50" y1="12" x2="68" y2="59" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF08A" />
                <stop offset="0.6" stopColor="#F97316" />
                <stop offset="1" stopColor="#DC2626" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-white ${textSizes[size].title}`}>
              J-BUFFET POS
            </span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              BBQ
            </span>
          </div>
          <span className={`text-amber-400 font-extrabold uppercase tracking-wider block ${textSizes[size].sub}`}>
            {isLao ? 'ບາບີຄິວ & ບຸບເຟ່ OS v2.4' : 'MODERN BBQ RESTAURANT OS'}
          </span>
        </div>
      )}

    </div>
  );
};
