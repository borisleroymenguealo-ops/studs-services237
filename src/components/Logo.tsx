/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true, size = 'md' }) => {
  const iconSize = 
    size === 'sm' ? 'w-8 h-8' : 
    size === 'lg' ? 'w-14 h-14' : 
    size === 'xl' ? 'w-24 h-24' : 
    'w-11 h-11';
  
  return (
    <div className={`flex items-center space-x-3.5 ${className}`}>
      {/* High-Fidelity SVG Replication of the STUD'S App Logo */}
      <div className={`${iconSize} flex-shrink-0 relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[2px_2px_2px_rgba(0,0,0,0.1)]">
          <defs>
            {/* Real gradient as seen in the image */}
            <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B4793" />
              <stop offset="100%" stopColor="#1D70B8" />
            </linearGradient>
          </defs>
          
          {/* Main circle */}
          <circle cx="50" cy="50" r="46" fill="url(#logoBlueGrad)" />
          
          {/* Subtle curved inner guidelines */}
          <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 3" opacity="0.3" />

          {/* Minimalist house on the left */}
          <path d="M 18 44 L 28 34 L 38 44 L 38 58 L 18 58 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M 28 34 L 14 46 M 28 34 L 42 46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          {/* House Window */}
          <rect x="25" y="46" width="6" height="6" fill="none" stroke="#0B4793" strokeWidth="1.5" />
          <line x1="28" y1="46" x2="28" y2="52" stroke="#0B4793" strokeWidth="1" />
          <line x1="25" y1="49" x2="31" y2="49" stroke="#0B4793" strokeWidth="1" />

          {/* Student outline/silhouette */}
          {/* Head */}
          <circle cx="56" cy="37" r="5" fill="#FFFFFF" />
          {/* Graduation Cap */}
          <polygon points="56,28 65,32 56,36 47,32" fill="#FFFFFF" />
          <path d="M 48 33.5 L 48 37" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          
          {/* Body and walking limbs */}
          {/* Torso */}
          <path d="M 56 42 C 51 42, 48 46, 48 51 L 51 52 C 52 48, 55 47, 58 47 Z" fill="#FFFFFF" />
          {/* Walking legs */}
          <path d="M 52 51 L 46 62 M 55 51 L 61 63" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Briefcase in left hand */}
          <path d="M 39 48 H 46 V 54 H 39 Z" fill="#FFFFFF" rx="1.2" />
          <path d="M 41 48 V 46 H 44 V 48" fill="none" stroke="#FFFFFF" strokeWidth="1" />
          
          {/* Broom/brush in right hand */}
          <line x1="62" y1="45" x2="57" y2="59" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Brush head */}
          <polygon points="57,59 52,64 61,64" fill="#FFFFFF" />
          <line x1="54" y1="64" x2="54" y2="67" stroke="#FFFFFF" strokeWidth="0.8" />
          <line x1="56" y1="64" x2="56" y2="67" stroke="#FFFFFF" strokeWidth="0.8" />
          <line x1="58" y1="64" x2="58" y2="67" stroke="#FFFFFF" strokeWidth="0.8" />

          {/* Stars sparkles */}
          <polygon points="72,25 74,28 77,29 74,30 72,33 70,30 67,29 70,28" fill="#FFFFFF" />
          <polygon points="80,19 81.5,21 83.5,21.5 81.5,22 80,24 78.5,22 76.5,21.5 78.5,21" fill="#FFFFFF" />
        </svg>
      </div>
      
      {showText && (
        <div className="font-sans">
          <div className="flex items-center">
            <span className={`font-sans font-black ${size === 'lg' ? 'text-base sm:text-lg' : 'text-sm sm:text-base'} text-slate-900 tracking-tight leading-none uppercase`}>
              STUD'S <span className="text-blue-700 font-black">App</span>
            </span>
            <span className={`ml-2 px-1.5 ${size === 'lg' ? 'py-0.8 text-[9px]' : 'py-0.5 text-[8px]'} bg-blue-700 text-white rounded font-mono font-black tracking-normal uppercase border border-blue-800 shadow-sm`}>
              NFC
            </span>
          </div>
          <p className={`${size === 'lg' ? 'text-[11px] mt-1.5' : 'text-[10px] mt-1'} text-slate-500 font-mono font-bold leading-none`}>Étudiants à votre service</p>
        </div>
      )}
    </div>
  );
};
