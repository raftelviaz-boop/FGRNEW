import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Zap, Flag, Flame, Layers } from 'lucide-react';
import { PlayerState } from '../types';

interface RaceProgressProps {
  player1: PlayerState;
  player2: PlayerState;
  extraPlayers?: PlayerState[];
  targetWins: number;
  currentRound: number;
  eventsRemaining: number;
  totalDeckSize?: number;
  isExpertMode?: boolean;
}

const PLAYER_THEMES = [
  {
    key: 'P1',
    border: 'border-cyan-500/30',
    badgeBg: 'bg-cyan-600/20 border-cyan-500/40 text-cyan-400',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400 ring-cyan-400 shadow-cyan-400',
    pin: 'bg-cyan-500 text-black border-cyan-300'
  },
  {
    key: 'P2',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-600/20 border-rose-500/40 text-rose-400',
    text: 'text-rose-400',
    dot: 'bg-rose-400 ring-rose-400 shadow-rose-400',
    pin: 'bg-rose-500 text-white border-rose-300'
  },
  {
    key: 'P3',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-600/20 border-amber-500/40 text-amber-400',
    text: 'text-amber-400',
    dot: 'bg-amber-400 ring-amber-400 shadow-amber-400',
    pin: 'bg-amber-500 text-black border-amber-300'
  },
  {
    key: 'P4',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400 ring-emerald-400 shadow-emerald-400',
    pin: 'bg-emerald-500 text-black border-emerald-300'
  }
];

export const RaceProgress: React.FC<RaceProgressProps> = ({
  player1,
  player2,
  extraPlayers = [],
  targetWins,
  currentRound,
  eventsRemaining,
  totalDeckSize = 33,
  isExpertMode = false
}) => {
  const allPlayers = [player1, player2, ...extraPlayers];

  return (
    <div className="w-full bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-md px-2.5 sm:px-4 py-2 sm:py-2.5 sticky top-0 z-30 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col gap-1.5 sm:gap-2">
        {/* Top Info Row */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              RND #{currentRound}
            </span>
            <span className="bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded-md border border-zinc-700 hidden xs:inline-flex items-center gap-1">
              🚴 {allPlayers.length} Pembalap
            </span>
            {isExpertMode && (
              <span className="bg-red-500/20 text-red-400 font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-red-500/40 flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                EXPERT
              </span>
            )}
            <span className="text-zinc-400 hidden sm:inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Deck Event: <strong className="text-zinc-200">{eventsRemaining} / {totalDeckSize}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-zinc-800/80 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-zinc-700/60 flex items-center gap-1 text-zinc-300 font-bold text-[10px] sm:text-xs">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>TARGET: <strong className="text-amber-400">{targetWins} WINS</strong></span>
            </div>
          </div>
        </div>

        {/* Racers Header & Energy Bars (Responsive grid based on player count) */}
        <div className={`grid gap-1.5 sm:gap-2.5 ${
          allPlayers.length === 2 ? 'grid-cols-2' : 
          allPlayers.length === 3 ? 'grid-cols-3' : 
          'grid-cols-2 sm:grid-cols-4'
        }`}>
          {allPlayers.map((player, idx) => {
            const theme = PLAYER_THEMES[idx % PLAYER_THEMES.length];
            const isMe = idx === 0;
            return (
              <div 
                key={player.id || idx}
                className={`flex items-center justify-between bg-zinc-950/90 p-1.5 sm:p-2 rounded-xl border ${theme.border}`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${theme.badgeBg} flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0`}>
                    {player.isAi ? `AI${idx > 1 ? idx : ''}` : isMe ? 'P1' : `P${idx + 1}`}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-[10px] sm:text-xs truncate flex items-center gap-1">
                      <span className="truncate">{player.name.split(' ')[0]}</span>
                      <span className={`text-[9px] font-mono ${theme.text}`}>
                        ({player.wins}/{targetWins}🏆)
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-amber-400 font-mono">
                      <Zap className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{player.energy}⚡</span>
                    </div>
                  </div>
                </div>

                {/* Wins Checkpoint Dots (Compact) */}
                <div className="hidden xs:flex items-center gap-0.5 shrink-0 ml-1">
                  {Array.from({ length: targetWins }).map((_, dotIdx) => (
                    <div
                      key={dotIdx}
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                        dotIdx < player.wins
                          ? `${theme.dot} ring-1 shadow-sm`
                          : 'bg-zinc-800 border border-zinc-700'
                      }`}
                      title={`Checkpoint ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Race Track Progress Bar with Staggered Pins */}
        <div className="relative w-full bg-zinc-950 h-8 sm:h-9 rounded-full border border-zinc-800 overflow-hidden flex items-center px-2">
          {/* Moving Asphalt Dashes */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.05)_50%)] bg-[length:16px_100%] animate-pulse" />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] border-b border-dashed border-zinc-800" />

          {/* Finish Arch at 100% */}
          <div className="absolute right-1.5 sm:right-2 flex items-center gap-0.5 text-amber-400 font-mono text-[9px] sm:text-[10px] font-bold z-30 bg-zinc-950/90 px-1.5 py-0.5 rounded-full border border-amber-400/30">
            <Flag className="w-3 h-3 text-amber-400 animate-bounce" />
            <span>FINISH</span>
          </div>

          {/* Animated Pins for each racer */}
          {allPlayers.map((player, idx) => {
            const theme = PLAYER_THEMES[idx % PLAYER_THEMES.length];
            const topPositions = ['top-0.5', 'bottom-0.5', 'top-1.5', 'bottom-1.5'];
            const verticalClass = topPositions[idx % topPositions.length];
            const zIndex = 20 - idx;

            return (
              <motion.div
                key={player.id || idx}
                className={`absolute ${verticalClass} z-${zIndex} transition-all duration-700 ease-out flex items-center gap-0.5`}
                style={{ left: `calc(${(player.wins / targetWins) * 76}% + 4px)` }}
              >
                <div className={`px-1.5 py-0.5 rounded-full ${theme.pin} text-[8px] sm:text-[9px] font-black shadow-md flex items-center gap-0.5 whitespace-nowrap`}>
                  <span className="animate-pulse">🚴</span> {player.name.split(' ')[0]} ({player.wins})
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

