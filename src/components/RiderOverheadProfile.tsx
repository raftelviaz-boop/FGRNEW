import React from 'react';
import { motion } from 'motion/react';
import { 
  PlayerState, 
  RiderCard, 
  BikeCard, 
  TerrainCategory 
} from '../types';

interface RiderOverheadProfileProps {
  playerKey: 'P1' | 'P2' | 'P3' | 'P4' | string;
  player: PlayerState;
  rider: RiderCard | null;
  bike?: BikeCard | null;
  score?: number;
  basePoints?: number;
  bikePoints?: number;
  actionPoints?: number;
  isLeader?: boolean;
  isSprint: boolean;
  isInterval: boolean;
  isVictory: boolean;
  isDefeat?: boolean;
  activeAction?: any;
  color: 'cyan' | 'rose' | 'amber' | 'emerald';
  gapMeters?: string;
  terrain?: TerrainCategory;
  phase?: string;
}

export const RiderOverheadProfile: React.FC<RiderOverheadProfileProps> = ({
  playerKey,
  player,
  rider,
  isSprint,
  isInterval,
  isVictory,
  color,
}) => {
  const isCyan = color === 'cyan';
  const isRose = color === 'rose';
  const isAmber = color === 'amber';
  const isEmerald = color === 'emerald';
  const specialty = rider?.specialty || 'SPRINTER';

  // Specific facial/accessory theme per specialty
  const theme = {
    CLIMBER: {
      bg: isCyan 
        ? 'from-emerald-600 via-teal-700 to-cyan-900' 
        : isRose
        ? 'from-emerald-700 via-teal-800 to-rose-950'
        : isAmber
        ? 'from-amber-600 via-emerald-800 to-amber-950'
        : 'from-emerald-600 via-teal-800 to-emerald-950',
      capColor: '#059669',
      capBrim: '#10b981',
      glassesColor: '#34d399',
      skinColor: '#e0a97a',
      jersey: isCyan ? '#06b6d4' : isRose ? '#f43f5e' : isAmber ? '#f59e0b' : '#10b981',
      specialtyLabel: 'Climber',
      specialtyColor: 'text-emerald-400'
    },
    SPRINTER: {
      bg: isCyan 
        ? 'from-amber-500 via-orange-600 to-cyan-900' 
        : isRose
        ? 'from-amber-600 via-red-600 to-rose-950'
        : isAmber
        ? 'from-amber-500 via-orange-600 to-amber-950'
        : 'from-emerald-500 via-teal-600 to-emerald-950',
      capColor: '#d97706',
      capBrim: '#f59e0b',
      glassesColor: '#fbbf24',
      skinColor: '#d89b6b',
      jersey: isCyan ? '#00f0ff' : isRose ? '#ff3355' : isAmber ? '#f59e0b' : '#10b981',
      specialtyLabel: 'Sprinter',
      specialtyColor: 'text-amber-400'
    },
    HANDLER: {
      bg: isCyan 
        ? 'from-blue-600 via-indigo-700 to-cyan-950' 
        : isRose
        ? 'from-indigo-600 via-purple-700 to-rose-950'
        : isAmber
        ? 'from-orange-600 via-amber-700 to-amber-950'
        : 'from-teal-600 via-emerald-700 to-emerald-950',
      capColor: '#3b82f6',
      capBrim: '#60a5fa',
      glassesColor: '#38bdf8',
      skinColor: '#dfa275',
      jersey: isCyan ? '#0ea5e9' : isRose ? '#e11d48' : isAmber ? '#f59e0b' : '#10b981',
      specialtyLabel: 'Handler',
      specialtyColor: 'text-sky-400'
    }
  }[specialty];

  // Rider display name (e.g., "Budi" or "Rama")
  const riderShortName = rider?.name 
    ? (rider.name.includes('"') 
        ? rider.name.split('"')[0].trim() 
        : rider.name.split(' ')[0]) 
    : playerKey;

  // Bersihkan tanda '#' dari nama player (misal 'Rider#127' -> 'Rider127')
  const rawPlayerName = player.name || playerKey;
  const cleanPlayerName = rawPlayerName.replace(/#/g, '').trim();

  return (
    <div 
      className="relative flex flex-col items-center select-none pointer-events-auto"
      title={`${cleanPlayerName} • ${riderShortName} (${theme.specialtyLabel})`}
    >
      {/* Horizontal Compact Capsule: [Foto Profil] [Nama Player / Rider (Specialty)] */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ 
          scale: 1,
          opacity: 1,
          y: isSprint ? [-1, 1, -1] : [0, -0.6, 0]
        }}
        transition={{ 
          y: { repeat: Infinity, duration: isSprint ? 0.35 : 1.5, ease: 'easeInOut' } 
        }}
        className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl backdrop-blur-md border shadow-lg transition-transform duration-200 whitespace-nowrap ${
          isCyan
            ? 'bg-[#081326]/92 border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
            : isRose
            ? 'bg-[#220914]/92 border-rose-400/50 shadow-[0_0_12px_rgba(255,51,85,0.3)]'
            : isAmber
            ? 'bg-[#221808]/92 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            : 'bg-[#082015]/92 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
        }`}
      >
        {/* Left: Foto Profil (Foto Upload Kustom atau Avatar Vektor) */}
        <div className="relative shrink-0">
          <div className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full p-[1.5px] shadow-sm ${
            isCyan
              ? 'bg-gradient-to-b from-cyan-300 via-cyan-500 to-blue-700'
              : isRose
              ? 'bg-gradient-to-b from-rose-300 via-rose-500 to-red-800'
              : isAmber
              ? 'bg-gradient-to-b from-amber-300 via-amber-500 to-orange-800'
              : 'bg-gradient-to-b from-emerald-300 via-emerald-500 to-teal-800'
          }`}>
            {/* Animated aura during sprint or attack */}
            {(isSprint || isInterval) && (
              <div 
                className={`absolute -inset-0.5 rounded-full animate-ping opacity-35 ${
                  isCyan ? 'bg-cyan-400' : isRose ? 'bg-rose-400' : isAmber ? 'bg-amber-400' : 'bg-emerald-400'
                }`} 
              />
            )}

            {/* Victory Glow */}
            {isVictory && (
              <div className="absolute -inset-0.5 rounded-full bg-amber-400/50 animate-pulse" />
            )}

            {/* Inner Photo Container with Crisp Cyclist Portrait or Uploaded Photo */}
            <div className={`w-full h-full rounded-full overflow-hidden relative bg-gradient-to-b ${theme.bg} flex items-center justify-center border border-black/50`}>
              {player.customPhoto ? (
                <img 
                  src={player.customPhoto} 
                  alt={cleanPlayerName}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <svg 
                  viewBox="0 0 40 40" 
                  className="w-full h-full transform translate-y-[2px]" 
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id={`visor-grad-${playerKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff007f" />
                      <stop offset="50%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#ffe600" />
                    </linearGradient>
                    <linearGradient id={`jersey-grad-${playerKey}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={theme.jersey} />
                      <stop offset="100%" stopColor="#090d16" />
                    </linearGradient>
                  </defs>

                  {/* Jersey Shoulders & Collar */}
                  <path 
                    d="M 5 40 Q 20 32 35 40 L 35 45 L 5 45 Z" 
                    fill={`url(#jersey-grad-${playerKey})`} 
                  />
                  <line x1="20" y1="33" x2="20" y2="40" stroke="#ffffff" strokeWidth="1" strokeDasharray="1.5 0.8" />

                  {/* Neck */}
                  <path d="M 16 28 L 24 28 L 23 35 L 17 35 Z" fill={theme.skinColor} />

                  {/* Chin & Jaw */}
                  <ellipse cx="20" cy="24" rx="6.5" ry="7.5" fill={theme.skinColor} />

                  {/* Ears */}
                  <circle cx="13" cy="24" r="1.8" fill={theme.skinColor} />
                  <circle cx="27" cy="24" r="1.8" fill={theme.skinColor} />

                  {/* Cyclist Cap / Helmet */}
                  <path 
                    d="M 12 21 Q 20 13 28 21 Q 29 15 20 12 Q 11 15 12 21 Z" 
                    fill={theme.capColor} 
                  />
                  <path 
                    d="M 13 19 Q 20 16 27 19 Q 24 16 20 15.5 Q 16 16 13 19 Z" 
                    fill={theme.capBrim} 
                    stroke="#0f172a" 
                    strokeWidth="0.4"
                  />
                  <path d="M 18 13 L 18 18" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
                  <path d="M 22 13 L 22 18" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />

                  {/* Mirrored Cyclist Sunglasses */}
                  <path 
                    d="M 14.5 21 Q 20 20 25.5 21 L 25 24 Q 20 25 15 24 Z" 
                    fill={`url(#visor-grad-${playerKey})`} 
                    stroke="#0f172a" 
                    strokeWidth="0.6" 
                  />
                  <line x1="19.5" y1="20.8" x2="20.5" y2="20.8" stroke="#000000" strokeWidth="0.8" />
                  <path d="M 16 22 L 18 23" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" opacity="0.8" />
                  <path d="M 22 22 L 24 23" stroke="#ffffff" strokeWidth="0.6" strokeLinecap="round" opacity="0.8" />

                  {/* Nose & Mouth */}
                  <path d="M 20 24.5 L 20 26 L 20.8 26.2" stroke="#b45309" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M 18.5 28 Q 20 29 21.5 28" stroke="#78350f" strokeWidth="0.7" strokeLinecap="round" fill="none" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Right: Nama Player (Atas) & Rider + Spesialis (Bawah) */}
        <div className="flex flex-col text-left justify-center min-w-0 pr-0.5">
          {/* Baris 1: Nama Player tanpa tanda # */}
          <div className="flex items-center gap-1 leading-tight">
            <span className={`text-[6.5px] font-mono font-black px-1 rounded uppercase leading-none ${
              isCyan ? 'bg-cyan-500/25 text-cyan-300' : isRose ? 'bg-rose-500/25 text-rose-300' : isAmber ? 'bg-amber-500/25 text-amber-300' : 'bg-emerald-500/25 text-emerald-300'
            }`}>
              {playerKey}
            </span>
            <span className="text-[10.5px] sm:text-[11.5px] font-black text-white leading-tight truncate max-w-[90px] sm:max-w-[120px]">
              {cleanPlayerName}
            </span>
          </div>

          {/* Baris 2: Nama Rider & Spesialisasi */}
          <div className="flex items-center gap-1 text-[8.5px] sm:text-[9.5px] font-mono leading-tight mt-0.5">
            <span className="text-zinc-200 font-bold truncate max-w-[70px] sm:max-w-[85px]">
              {riderShortName}
            </span>
            <span className="text-zinc-500 font-bold">•</span>
            <span className={`font-bold ${theme.specialtyColor}`}>
              {theme.specialtyLabel}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Subtle Downward Pointer Caret pointing to rider helmet */}
      <div 
        className={`w-0 h-0 border-x-[3.5px] border-x-transparent border-t-[4.5px] -mt-[1px] ${
          isCyan ? 'border-t-cyan-400/80' : isRose ? 'border-t-rose-400/80' : isAmber ? 'border-t-amber-400/80' : 'border-t-emerald-400/80'
        }`} 
      />
    </div>
  );
};
