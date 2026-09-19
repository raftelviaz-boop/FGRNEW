import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Layers, 
  CheckCircle2, 
  Star,
  Activity,
  ShieldAlert,
  Mountain,
  Compass,
  TrendingDown,
  Wrench,
  Sparkles,
  Package
} from 'lucide-react';
import { 
  RiderCard, 
  BikeCard, 
  EventCard, 
  HazardCard, 
  ActionCard,
  TerrainCategory 
} from '../types';
import { TERRAIN_META } from '../utils/gameLogic';

interface CardViewProps {
  card: RiderCard | BikeCard | EventCard | HazardCard | ActionCard;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showBack?: boolean;
  size?: 'compact' | 'sm' | 'md' | 'lg';
  highlightAffinity?: TerrainCategory;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  selected = false,
  disabled = false,
  onClick,
  showBack = false,
  size = 'md',
  highlightAffinity
}) => {
  if (showBack) {
    return (
      <motion.div 
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[200px] sm:max-w-[230px] aspect-[1/1.44] rounded-2xl border-2 border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-4 flex flex-col items-center justify-center text-center shadow-xl select-none transition-transform duration-200 ease-out"
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-zinc-900/80 mb-2 shadow-lg shadow-amber-500/10">
          <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-pulse" />
        </div>
        <span className="text-xs sm:text-sm font-black tracking-widest text-zinc-300 uppercase font-mono">FGR TCG</span>
        <span className="text-[10px] sm:text-xs text-amber-400/80 font-mono mt-0.5 tracking-wider">FIXED GEAR RACE</span>
      </motion.div>
    );
  }

  // Consistent aspect ratio & comfortable sizing across all cards
  const sizeClasses = {
    compact: 'w-full max-w-[165px] sm:max-w-[215px] aspect-[1/1.44] p-2 sm:p-3 rounded-xl sm:rounded-2xl',
    sm: 'w-full max-w-[185px] sm:max-w-[225px] aspect-[1/1.44] p-2.5 sm:p-3 rounded-2xl',
    md: 'w-full max-w-[215px] sm:max-w-[245px] aspect-[1/1.44] p-3 sm:p-3.5 rounded-2xl',
    lg: 'w-full max-w-[245px] sm:max-w-[280px] aspect-[1/1.44] p-3.5 sm:p-4 rounded-2xl'
  }[size || 'md'];

  // Base CSS transition & transform feedback classes for hover & active selection
  const baseCardClasses = `group relative border-2 cursor-pointer select-none flex flex-col justify-between overflow-hidden transition-all duration-250 ease-out transform
    ${sizeClasses}
    ${disabled 
      ? 'opacity-40 cursor-not-allowed filter grayscale pointer-events-none' 
      : 'hover:-translate-y-1.5 hover:scale-[1.04] sm:hover:scale-[1.05] active:scale-[0.98]'}
  `;

  // 1. KARTU RIDER (Climber, Sprinter, Handler)
  if (card.type === 'RIDER') {
    const isAffinityMatch = highlightAffinity && card.favoredTerrain.includes(highlightAffinity);

    const specialtyBadge = {
      CLIMBER: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Mountain, label: 'CLIMBER' },
      SPRINTER: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Zap, label: 'SPRINTER' },
      HANDLER: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Compass, label: 'HANDLER' }
    }[card.specialty];

    const SpecialtyIcon = specialtyBadge.icon;

    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`${baseCardClasses}
          ${selected 
            ? 'scale-[1.04] sm:scale-[1.05] -translate-y-1.5 border-amber-400 ring-2 ring-amber-400/70 bg-zinc-900 shadow-xl shadow-amber-500/25 z-10' 
            : 'border-zinc-800 hover:border-zinc-500 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black hover:shadow-xl hover:shadow-black/60'}
          ${isAffinityMatch && !selected ? 'ring-2 ring-emerald-400/80 shadow-emerald-500/20' : ''}`}
      >
        {/* Top Header */}
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 uppercase tracking-tight">
              🚴 RIDER
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/30">
              <span className="text-[8px] sm:text-[9px] text-zinc-400">PWR</span>
              <span className="font-black text-xs sm:text-sm text-amber-300">{card.basePower}</span>
            </div>
          </div>

          <div>
            <h3 className="font-black text-white text-xs sm:text-sm leading-tight tracking-tight group-hover:text-amber-300 transition-colors truncate">
              {card.name}
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium italic truncate">
              "{card.nickname}"
            </p>
          </div>
        </div>

        {/* Center Specialty & Terrains */}
        <div className="my-1.5 bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/80 space-y-1 w-full">
          <div className="flex items-center justify-between text-[9px] sm:text-[10px]">
            <span className="text-zinc-400 font-semibold">Spesialis:</span>
            <span className={`font-black px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${specialtyBadge.bg}`}>
              <SpecialtyIcon className="w-3 h-3" />
              <span>{specialtyBadge.label}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1 pt-0.5">
            {card.favoredTerrain.map(terrain => {
              const meta = TERRAIN_META[terrain];
              const isCurrent = highlightAffinity === terrain;
              return (
                <span
                  key={terrain}
                  className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-all truncate ${
                    isCurrent
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-sm'
                      : meta.bgBadge
                  }`}
                >
                  {meta.label} (+{card.terrainBonus})
                </span>
              );
            })}
          </div>
        </div>

        {/* Ability Description */}
        <div className="w-full">
          <div className="text-[9px] sm:text-[10px] leading-tight bg-zinc-950/90 p-1.5 sm:p-2 rounded-xl border border-zinc-800/80">
            <span className="font-bold text-amber-300 block truncate flex items-center gap-1 mb-0.5">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              {card.abilityName}
            </span>
            <span className="text-zinc-300 line-clamp-2 leading-snug">{card.abilityDescription}</span>
          </div>
        </div>

        {selected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-0.5 rounded-full shadow-md z-10 ring-2 ring-amber-300"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </div>
    );
  }

  // 2. KARTU BIKE (Komponen, Performance, Ability)
  if (card.type === 'BUILD_BIKE') {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`${baseCardClasses}
          ${selected 
            ? 'scale-[1.04] sm:scale-[1.05] -translate-y-1.5 border-cyan-400 ring-2 ring-cyan-400/70 bg-zinc-900 shadow-xl shadow-cyan-500/25 z-10' 
            : 'border-zinc-800 hover:border-zinc-500 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black hover:shadow-xl hover:shadow-black/60'}`}
      >
        {/* Header */}
        <div className="w-full space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase tracking-tight">
              ⚙️ BIKE
            </span>
            {card.riderSynergy && (
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded-md border border-amber-500/30">
                +{card.riderSynergy}
              </span>
            )}
          </div>

          <h3 className="font-black text-white text-xs sm:text-sm leading-tight tracking-tight group-hover:text-cyan-300 transition-colors truncate">
            {card.name}
          </h3>
        </div>

        {/* A. KOMPONEN BIKE */}
        <div className="my-1 bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/80 space-y-0.5 w-full">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider pb-0.5 border-b border-zinc-900">
            <span className="flex items-center gap-1">
              <Wrench className="w-2.5 h-2.5 text-cyan-400" /> KOMPONEN
            </span>
            <span className="text-zinc-400 font-mono text-[8px] sm:text-[9px] truncate max-w-[65px]">{card.components.gearRatio}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[8px] sm:text-[9px]">
            <div className="truncate text-zinc-300"><span className="text-zinc-500 font-bold">F:</span> {card.components.frameset}</div>
            <div className="truncate text-zinc-300"><span className="text-zinc-500 font-bold">G:</span> {card.components.gearRatio}</div>
            <div className="truncate text-zinc-300"><span className="text-zinc-500 font-bold">W:</span> {card.components.wheelset}</div>
            <div className="truncate text-zinc-300"><span className="text-zinc-500 font-bold">B:</span> {card.components.handlebar}</div>
          </div>
        </div>

        {/* B. PERFORMANCE 4 MEDAN */}
        <div className="my-1 bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/80 space-y-1 w-full">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
            <span>PERFORMA MEDAN</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center font-mono">
            {/* Tanjakan */}
            <div className={`p-1 rounded-md border transition-colors ${highlightAffinity === 'TANJAKAN' ? 'bg-emerald-500/25 border-emerald-400 ring-1 ring-emerald-400/60' : 'bg-zinc-900/90 border-zinc-800'}`}>
              <span className="text-[7px] sm:text-[8px] text-zinc-400 block">⛰️</span>
              <span className="text-[9px] sm:text-xs font-black text-emerald-400">+{card.performance.tanjakan}</span>
            </div>
            {/* Datar */}
            <div className={`p-1 rounded-md border transition-colors ${highlightAffinity === 'DATAR' ? 'bg-amber-500/25 border-amber-400 ring-1 ring-amber-400/60' : 'bg-zinc-900/90 border-zinc-800'}`}>
              <span className="text-[7px] sm:text-[8px] text-zinc-400 block">⚡</span>
              <span className="text-[9px] sm:text-xs font-black text-amber-400">+{card.performance.datar}</span>
            </div>
            {/* Tikungan */}
            <div className={`p-1 rounded-md border transition-colors ${highlightAffinity === 'TIKUNGAN' ? 'bg-blue-500/25 border-blue-400 ring-1 ring-blue-400/60' : 'bg-zinc-900/90 border-zinc-800'}`}>
              <span className="text-[7px] sm:text-[8px] text-zinc-400 block">🔄</span>
              <span className="text-[9px] sm:text-xs font-black text-blue-400">+{card.performance.tikungan}</span>
            </div>
            {/* Turunan */}
            <div className={`p-1 rounded-md border transition-colors ${highlightAffinity === 'TURUNAN' ? 'bg-cyan-500/25 border-cyan-400 ring-1 ring-cyan-400/60' : 'bg-zinc-900/90 border-zinc-800'}`}>
              <span className="text-[7px] sm:text-[8px] text-zinc-400 block">📉</span>
              <span className="text-[9px] sm:text-xs font-black text-cyan-400">+{card.performance.turunan}</span>
            </div>
          </div>
        </div>

        {/* C. ABILITY SEPEDA */}
        <div className="w-full">
          <div className="text-[9px] sm:text-[10px] leading-tight bg-zinc-950/90 p-1.5 sm:p-2 rounded-xl border border-zinc-800/80">
            <span className="font-mono font-bold text-cyan-300 block truncate flex items-center gap-1 mb-0.5">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
              {card.abilityName}
            </span>
            <span className="text-zinc-300 line-clamp-2 leading-snug">{card.abilityDescription}</span>
          </div>
        </div>

        {selected && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 bg-cyan-400 text-black p-0.5 rounded-full shadow-md z-10 ring-2 ring-cyan-300"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </motion.div>
        )}
      </div>
    );
  }

  // 3. KARTU EVENT
  if (card.type === 'EVENT') {
    const meta = TERRAIN_META[card.category];

    return (
      <div
        className={`relative border-2 border-amber-500/70 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white flex flex-col justify-between shadow-xl overflow-hidden select-none transition-all duration-250 ease-out hover:-translate-y-1 hover:scale-[1.03] ${sizeClasses}`}
      >
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-500/30">
              {card.code}
            </span>
            <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${meta.bgBadge}`}>
              {meta.label}
            </span>
          </div>

          <h3 className="font-black text-xs sm:text-sm text-white leading-tight tracking-tight mt-0.5 line-clamp-2">
            {card.title}
          </h3>
          <p className="text-[9px] sm:text-[10px] text-zinc-400 font-medium flex items-center gap-1 truncate">
            📍 {card.location}
          </p>
        </div>

        <div className="my-1.5 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800 w-full">
          <p className="text-[9px] sm:text-xs text-zinc-200 leading-relaxed line-clamp-3">
            {card.description}
          </p>
        </div>

        <div className="border-t border-zinc-800/80 pt-1 w-full">
          <p className="text-[8px] sm:text-[9px] text-zinc-500 italic font-serif truncate">
            "{card.flavor}"
          </p>
        </div>
      </div>
    );
  }

  // 4. KARTU EXTRA EVENT (Hazard)
  if (card.type === 'EXTRA_EVENT') {
    return (
      <div
        className={`relative border-2 border-rose-500/70 bg-gradient-to-b from-zinc-900 via-zinc-950 to-rose-950/30 text-white flex flex-col justify-between shadow-xl overflow-hidden select-none transition-all duration-250 ease-out hover:-translate-y-1 hover:scale-[1.03] ${sizeClasses}`}
      >
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {card.code}
            </span>
            <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5" /> HAZARD
            </span>
          </div>

          <h3 className="font-black text-xs sm:text-sm text-white leading-tight mt-0.5 truncate">
            {card.title}
          </h3>
        </div>

        <div className="my-1.5 bg-rose-950/40 p-2 rounded-xl border border-rose-800/40 text-[9px] sm:text-xs text-rose-200 w-full">
          <p className="leading-snug line-clamp-3">{card.description}</p>
        </div>

        <div className="text-[8px] sm:text-[9px] text-rose-400 font-bold bg-rose-950/60 p-1 rounded-lg border border-rose-900/50 text-center truncate w-full">
          ⚠️ {card.effect.description}
        </div>
      </div>
    );
  }

  // 5-7. KARTU AKSI (Item, Skill, Ultimate Item & Ultimate Skill)
  const isUltimate = card.isUltimate;
  const isItem = card.type === 'ITEM';

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`${baseCardClasses}
        ${selected 
          ? 'scale-[1.04] sm:scale-[1.05] -translate-y-1.5 border-amber-400 ring-2 ring-amber-400/70 bg-zinc-900 shadow-xl shadow-amber-500/25 z-10' 
          : isUltimate 
            ? 'border-purple-500/80 bg-gradient-to-b from-purple-950/60 via-zinc-950 to-zinc-950 shadow-purple-500/10 hover:border-purple-400 hover:shadow-purple-500/20' 
            : isItem 
              ? 'border-emerald-500/60 bg-gradient-to-b from-emerald-950/40 via-zinc-950 to-zinc-950 hover:border-emerald-400 hover:shadow-emerald-500/20' 
              : 'border-amber-500/60 bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 hover:border-amber-400 hover:shadow-amber-500/20'}`}
    >
      <div className="space-y-1 w-full">
        <div className="flex items-center justify-between gap-1">
          <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md border uppercase tracking-tight
            ${isUltimate 
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse' 
              : isItem 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}
          >
            {isUltimate ? (
              <>
                <Star className="w-2.5 h-2.5 fill-current text-purple-300" />
                <span className="truncate">{card.subType === 'ULTIMATE_ITEM' ? 'ULT ITEM' : 'ULT SKILL'}</span>
              </>
            ) : isItem ? (
              <>
                <Package className="w-2.5 h-2.5" />
                <span>ITEM</span>
              </>
            ) : (
              <>
                <Zap className="w-2.5 h-2.5" />
                <span>SKILL</span>
              </>
            )}
          </span>

          <div className="flex items-center gap-1 font-mono text-[9px] sm:text-xs font-black text-amber-300 bg-zinc-900/90 px-1.5 py-0.5 rounded-md border border-amber-500/40">
            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
            <span>{card.cost}⚡</span>
          </div>
        </div>

        <h3 className="font-black text-white text-xs sm:text-sm leading-tight group-hover:text-amber-300 transition-colors truncate">
          {card.name}
        </h3>
      </div>

      <div className="my-1.5 bg-zinc-950/85 p-2 rounded-xl border border-zinc-800/80 text-[9px] sm:text-[10px] w-full">
        <p className="text-zinc-200 font-medium leading-snug line-clamp-3">
          {card.effectDescription}
        </p>
      </div>

      {card.flavor ? (
        <p className="text-[8px] sm:text-[9px] text-zinc-500 italic truncate w-full">
          "{card.flavor}"
        </p>
      ) : (
        <div className="h-2" />
      )}

      {selected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1.5 right-1.5 bg-amber-400 text-black p-0.5 rounded-full shadow-md z-10 ring-2 ring-amber-300"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </motion.div>
      )}
    </div>
  );
};
