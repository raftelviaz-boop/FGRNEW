import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowRight, 
  ShieldAlert, 
  Layers,
  Wrench,
  Sparkles
} from 'lucide-react';
import { 
  EventCard, 
  HazardCard, 
  PlayerState 
} from '../types';
import { calculateBasePoints, TERRAIN_META } from '../utils/gameLogic';
import { CardView } from './CardView';
import { sound } from '../audio/sound';

interface EventRevealProps {
  event: EventCard;
  hazard?: HazardCard;
  player1: PlayerState;
  player2: PlayerState;
  extraPlayers?: PlayerState[];
  onProceedToActionPhase: () => void;
}

export const EventReveal: React.FC<EventRevealProps> = ({
  event,
  hazard,
  player1,
  player2,
  extraPlayers = [],
  onProceedToActionPhase
}) => {
  const allRacers = [
    { key: 'P1', player: player1, color: 'blue', border: 'border-blue-500/40', badgeBg: 'bg-blue-500/20 text-blue-400', ptsText: 'text-blue-400' },
    { key: 'P2', player: player2, color: 'rose', border: 'border-rose-500/40', badgeBg: 'bg-rose-500/20 text-rose-400', ptsText: 'text-rose-400' },
    ...extraPlayers.map((p, idx) => ({
      key: idx === 0 ? 'P3' : 'P4',
      player: p,
      color: idx === 0 ? 'amber' : 'emerald',
      border: idx === 0 ? 'border-amber-500/40' : 'border-emerald-500/40',
      badgeBg: idx === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400',
      ptsText: idx === 0 ? 'text-amber-400' : 'text-emerald-400'
    }))
  ];

  const terrainMeta = TERRAIN_META[event.category];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2 sm:px-4 flex flex-col items-center pb-8"
    >
      {/* Top Banner */}
      <div className="text-center mb-3 sm:mb-5">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[9px] sm:text-xs font-mono font-bold text-amber-400 mb-1">
          LANGKAH 3 & 4 : DRAW EVENT & HITUNG POINT
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          KONDISI RACE TELAH TERBUKA!
        </h2>
        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5 max-w-md mx-auto px-2">
          Event ronde ini adalah medan{' '}
          <strong className={terrainMeta.textBadge}>{terrainMeta.label}</strong> ({terrainMeta.desc}).
        </p>
      </div>

      {/* Main Stage: Event Card + Optional Hazard */}
      <div className="flex flex-row items-stretch justify-center gap-2.5 sm:gap-5 mb-4 sm:mb-6 w-full max-w-md sm:max-w-lg">
        <motion.div 
          initial={{ rotateY: 90, scale: 0.9 }}
          animate={{ rotateY: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center flex-1 min-w-0"
        >
          <span className="text-[9px] sm:text-xs font-mono font-bold text-amber-400 mb-1 flex items-center gap-1 truncate">
            <Layers className="w-3 h-3" /> 3. EVENT UTAMA
          </span>
          <CardView card={event} size="compact" />
        </motion.div>

        {hazard && (
          <motion.div 
            initial={{ rotateY: 90, scale: 0.9 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            <span className="text-[9px] sm:text-xs font-mono font-bold text-rose-400 mb-1 flex items-center gap-1 truncate">
              <ShieldAlert className="w-3 h-3" /> 4. EXTRA EVENT
            </span>
            <CardView card={hazard} size="compact" />
          </motion.div>
        )}
      </div>

      {/* Performance Calculation Comparison Board (Responsive for 2, 3, or 4 racers) */}
      <div className={`w-full grid gap-2.5 sm:gap-4 mb-4 sm:mb-6 ${
        allRacers.length > 2 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {allRacers.map((racer, idx) => {
          const base = calculateBasePoints(racer.player.selectedRider, racer.player.selectedBike, event, hazard);
          return (
            <motion.div 
              key={racer.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`bg-zinc-950/90 border-2 ${racer.border} rounded-2xl p-2.5 sm:p-3.5 shadow-xl flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-md ${racer.badgeBg} font-black text-[10px] flex items-center justify-center`}>
                      {racer.key}
                    </span>
                    <h4 className="font-black text-white text-xs sm:text-sm truncate max-w-[110px]">{racer.player.name}</h4>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-zinc-400">
                    <strong className="text-amber-400">{racer.player.energy}⚡</strong>
                  </span>
                </div>

                {/* Selected Rider & Bike mini cards */}
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[8px] font-mono text-zinc-400 block">RIDER</span>
                    <span className="font-black text-[10px] text-white block truncate">
                      {racer.player.selectedRider?.name || 'Rider'}
                    </span>
                    <span className="text-[8px] text-amber-400 font-bold truncate block">
                      {racer.player.selectedRider?.specialty}
                    </span>
                  </div>

                  <div className="bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800">
                    <span className="text-[8px] font-mono text-zinc-400 block">BIKE</span>
                    <span className="font-black text-[10px] text-white block truncate">
                      {racer.player.selectedBike?.name || 'Bike'}
                    </span>
                    <span className="text-[8px] text-cyan-400 font-mono flex items-center gap-1 truncate">
                      <Wrench className="w-2.5 h-2.5 shrink-0" /> {racer.player.selectedBike?.components.gearRatio}
                    </span>
                  </div>
                </div>

                {/* Point Breakdown List */}
                <div className="space-y-0.5 text-[9px] sm:text-[11px] text-zinc-300 font-mono bg-zinc-900/70 p-2 rounded-xl border border-zinc-800">
                  <div className="flex justify-between">
                    <span>Base Power:</span>
                    <span className="font-bold text-white">+{base.riderBase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={base.riderTerrainMatch ? 'text-amber-300 font-bold' : 'text-zinc-500'}>
                      Medan ({event.category}):
                    </span>
                    <span className={`font-bold ${base.riderTerrainMatch ? 'text-amber-400' : 'text-zinc-500'}`}>
                      +{base.riderTerrainBonus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-300">Bike Power:</span>
                    <span className="font-bold text-cyan-400">+{base.bikePerformancePoints}</span>
                  </div>
                  {base.synergyBonus > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Sinergi:</span>
                      <span>+{base.synergyBonus}</span>
                    </div>
                  )}
                  {base.bikeAbilityBonus > 0 && (
                    <div className="flex justify-between text-cyan-300 font-bold">
                      <span className="truncate mr-1">{base.bikeAbilityNote || 'Bike Ability'}:</span>
                      <span>+{base.bikeAbilityBonus}</span>
                    </div>
                  )}
                  {base.hazardPenalty !== 0 && (
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span className="truncate mr-1">Hazard:</span>
                      <span>{base.hazardPenalty > 0 ? `+${base.hazardPenalty}` : base.hazardPenalty}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Base Point */}
              <div className="mt-2 pt-1.5 border-t border-zinc-800 flex items-center justify-between">
                <span className="font-mono text-[9px] text-zinc-400 uppercase font-bold">Base Point:</span>
                <div className="flex items-center gap-1">
                  <span className={`text-lg sm:text-xl font-black ${racer.ptsText} font-mono`}>{base.totalBase}</span>
                  <span className="text-[9px] font-bold text-zinc-400">PTS</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Button: Proceed to Tactical Card Play */}
      <button
        onClick={() => {
          sound.playBellRing();
          onProceedToActionPhase();
        }}
        className="w-full max-w-md py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
      >
        <Zap className="w-4 h-4 fill-black" />
        <span>MASUK KE FASE KARTU AKSI</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
