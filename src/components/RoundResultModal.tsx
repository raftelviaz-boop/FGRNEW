import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  ArrowRight, 
  Award,
  RotateCcw
} from 'lucide-react';
import { 
  EventCard, 
  HazardCard, 
  PlayerState, 
  ActionCard 
} from '../types';
import { TERRAIN_META } from '../utils/gameLogic';
import { sound } from '../audio/sound';

interface RoundResultModalProps {
  currentRound: number;
  event: EventCard;
  hazard?: HazardCard;
  player1: PlayerState;
  player2: PlayerState;
  p1TotalPoints: number;
  p2TotalPoints: number;
  p1Actions: ActionCard[];
  p2Actions: ActionCard[];
  winner: 'P1' | 'P2' | 'P3' | 'P4' | 'DRAW';
  targetWins: number;
  onNextRound: () => void;
  onReplayRace?: () => void;
  isExpertMode?: boolean;
  extraPlayers?: PlayerState[];
  extraResults?: Array<{
    player: PlayerState;
    key: 'P3' | 'P4';
    totalPoints: number;
    actions: ActionCard[];
  }>;
}

export const RoundResultModal: React.FC<RoundResultModalProps> = ({
  currentRound,
  event,
  hazard,
  player1,
  player2,
  p1TotalPoints,
  p2TotalPoints,
  p1Actions,
  p2Actions,
  winner,
  targetWins,
  onNextRound,
  onReplayRace,
  isExpertMode = false,
  extraPlayers,
  extraResults = []
}) => {
  const isP1Winner = winner === 'P1';
  const isP2Winner = winner === 'P2';
  const isP3Winner = winner === 'P3';
  const isP4Winner = winner === 'P4';
  const isDraw = winner === 'DRAW';

  const winningPlayer = 
    isP1Winner ? player1 : 
    isP2Winner ? player2 : 
    isP3Winner ? extraPlayers?.[0] : 
    isP4Winner ? extraPlayers?.[1] : null;

  const allPlayersList = [
    { key: 'P1', player: player1, total: p1TotalPoints, actions: p1Actions, isWinner: isP1Winner, color: 'blue' },
    { key: 'P2', player: player2, total: p2TotalPoints, actions: p2Actions, isWinner: isP2Winner, color: 'rose' },
    ...extraResults.map(er => ({
      key: er.key,
      player: er.player,
      total: er.totalPoints,
      actions: er.actions,
      isWinner: winner === er.key,
      color: er.key === 'P3' ? 'amber' : 'emerald'
    }))
  ];

  const terrainMeta = TERRAIN_META[event.category];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg max-h-[94vh] overflow-y-auto bg-zinc-950 border-2 border-zinc-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col items-center my-auto"
      >
        {/* Top Header */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-mono text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
            HASIL RONDE #{currentRound}
          </span>
          <span className={`font-mono text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${terrainMeta.bgBadge}`}>
            {terrainMeta.label}
          </span>
        </div>

        {/* Winner Banner */}
        <div className="text-center my-1.5">
          {winningPlayer && (
            <motion.div 
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center mb-1 shadow-lg ${
                isP1Winner ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-cyan-500/20' :
                isP2Winner ? 'bg-rose-500/20 border-rose-400 text-rose-400 shadow-rose-500/20' :
                isP3Winner ? 'bg-amber-500/20 border-amber-400 text-amber-400 shadow-amber-500/20' :
                'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-emerald-500/20'
              }`}>
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                {winningPlayer.name} MENANG RONDE!
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-400 font-semibold">
                +1 Kemenangan ({winningPlayer.wins}/{targetWins} 🏆)
              </p>
            </motion.div>
          )}

          {isDraw && (
            <motion.div 
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-1">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                PHOTO FINISH — HASIL IMBANG!
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-400 font-semibold">
                Pembalap menyentuh garis finis bersamaan!
              </p>
            </motion.div>
          )}
        </div>

        {/* Score Comparison Display (Supports 2, 3, or 4 Players) */}
        <div className={`w-full grid gap-2 my-2 ${allPlayersList.length > 2 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2'}`}>
          {allPlayersList.map((item) => (
            <div
              key={item.key}
              className={`p-2 sm:p-2.5 rounded-xl border-2 flex flex-col justify-between ${
                item.isWinner
                  ? item.color === 'blue' ? 'bg-blue-950/50 border-blue-400 shadow-lg shadow-blue-500/10'
                    : item.color === 'rose' ? 'bg-rose-950/50 border-rose-400 shadow-lg shadow-rose-500/10'
                    : item.color === 'amber' ? 'bg-amber-950/50 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-emerald-950/50 border-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-900/60 border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[10px] sm:text-xs text-white truncate">{item.player.name}</span>
                  {item.isWinner && (
                    <span className="text-[7px] sm:text-[8px] font-black bg-amber-400 text-black px-1.5 py-0.5 rounded shadow">
                      WIN
                    </span>
                  )}
                </div>
                <div className="text-[9px] sm:text-[11px] text-zinc-400 space-y-0.5 font-mono">
                  <div className="truncate">🚴 <strong className="text-white">{item.player.selectedRider?.name || 'Rider'}</strong></div>
                  <div className="truncate">⚙️ <strong className="text-white">{item.player.selectedBike?.name || 'Bike'}</strong></div>
                  
                  <div className="pt-1 border-t border-zinc-800/80">
                    <div className="text-[8px] text-zinc-400 font-bold uppercase mb-0.5">
                      Aksi ({item.actions.length}):
                    </div>
                    {item.actions.length > 0 ? (
                      <div className="flex flex-wrap gap-0.5">
                        {item.actions.map((a, idx) => (
                          <span key={`${item.key}-act-${a.id}-${idx}`} className="text-[7px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 px-1 py-0.5 rounded">
                            {a.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[8px] text-zinc-500 italic">Hemat (0 Kartu)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-1.5 pt-1 border-t border-zinc-800 flex items-baseline justify-between">
                <span className="text-[8px] sm:text-[9px] text-zinc-400 font-mono">TOTAL:</span>
                <span className={`text-base sm:text-lg font-black font-mono ${
                  item.color === 'blue' ? 'text-blue-400' :
                  item.color === 'rose' ? 'text-rose-400' :
                  item.color === 'amber' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {item.total} PTS
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Duel Commentary / Summary Box */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-2 sm:p-2.5 mb-1.5 text-[9px] sm:text-xs font-mono">
          <div className="text-amber-400 font-bold flex items-center gap-1 mb-0.5">
            <Flame className="w-3 h-3 text-orange-500" />
            <span>ANALISIS ADU SPRINT:</span>
          </div>
          {p2Actions.length > 0 ? (
            <p className="text-zinc-300 leading-snug">
              🔥 <strong className="text-rose-400">{player2.name}</strong> memainkan <strong className="text-white">{p2Actions.length} kartu aksi</strong> ({p2Actions.map(a => a.name).join(', ')}).
            </p>
          ) : (
            <p className="text-zinc-400 leading-snug">
              ⚡ <strong className="text-zinc-300">{player2.name}</strong> memilih menghemat energi untuk ronde berikutnya.
            </p>
          )}
        </div>

        {/* Energy Replenish Notice */}
        <div className="w-full bg-zinc-900/90 border border-amber-500/30 rounded-xl p-1.5 sm:p-2 mb-3 flex items-center justify-between text-[9px] sm:text-xs text-zinc-300 font-mono">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Energy Regen ronde berikutnya:</span>
          </div>
          <div className="text-right font-bold">
            <span className="text-amber-400">+2⚡ Regen</span>
            {isExpertMode && (
              <span className="text-red-400 text-[9px] block">(-1⚡ Hand Refill Strain)</span>
            )}
          </div>
        </div>

        {/* Action Buttons: Next Round & Replay Race Animation */}
        <div className="w-full flex flex-col sm:flex-row gap-1.5 sm:gap-2">
          {onReplayRace && (
            <button
              onClick={() => {
                sound.playSprintBurst();
                onReplayRace();
              }}
              className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-98"
            >
              <span>🎬 PUTAR ULANG ANIMASI</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playPedalRatchet();
              onNextRound();
            }}
            className="w-full sm:flex-1 py-2 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-[11px] sm:text-xs tracking-wide flex items-center justify-center gap-1.5 shadow-xl shadow-amber-500/20 active:scale-98 cursor-pointer"
          >
            <span>LANJUT KE RONDE #{currentRound + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
