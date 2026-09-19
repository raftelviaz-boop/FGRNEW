import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Crown, 
  Flame, 
  Zap, 
  RotateCcw, 
  BookOpen, 
  CheckCircle2, 
  Award,
  Sparkles
} from 'lucide-react';
import { PlayerState } from '../types';
import { sound } from '../audio/sound';

interface MatchEndModalProps {
  winner: PlayerState;
  loser: PlayerState;
  allPlayers?: PlayerState[];
  totalRounds: number;
  targetWins: number;
  onRematch: () => void;
  onOpenCodex: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  winner,
  loser,
  allPlayers,
  totalRounds,
  targetWins,
  onRematch,
  onOpenCodex
}) => {
  useEffect(() => {
    sound.playWinFanfare();

    // Trigger confetti bursts
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const sortedPlayers = allPlayers && allPlayers.length > 2
    ? [...allPlayers].sort((a, b) => b.wins - a.wins)
    : [winner, loser];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl max-h-[94vh] overflow-y-auto bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl flex flex-col items-center text-center my-auto">
        {/* Crown Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-2 shadow-xl shadow-amber-500/20 animate-bounce">
          <Crown className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-mono font-black uppercase mb-1.5">
          <Sparkles className="w-3 h-3" /> FIRST TO {targetWins} WINS CHAMPION!
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          {winner.name} ADALAH JUARA RACE!
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-md">
          Berhasil mengamankan {targetWins} kemenangan Event dalam total {totalRounds} ronde balapan!
        </p>

        {/* Podium Statistics Comparison (Grid for 2, 3 or 4 players) */}
        <div className={`w-full grid gap-2 sm:gap-3 my-3 sm:my-4 ${sortedPlayers.length > 2 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2'}`}>
          {sortedPlayers.map((p, idx) => {
            const isFirst = idx === 0;
            const rankLabel = idx === 0 ? 'CHAMPION 🥇' : idx === 1 ? 'RUNNER UP 🥈' : idx === 2 ? '3RD PLACE 🥉' : '4TH PLACE';
            return (
              <div 
                key={`podium-${p.id || idx}`}
                className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-left flex flex-col justify-between ${
                  isFirst
                    ? 'bg-amber-950/25 border-2 border-amber-400/80 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/60 border border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 gap-1">
                    <span className={`font-black text-xs sm:text-sm truncate ${isFirst ? 'text-amber-400' : 'text-zinc-300'}`}>
                      {p.name}
                    </span>
                    <span className={`text-[7.5px] sm:text-[8.5px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                      isFirst ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {rankLabel}
                    </span>
                  </div>
                  <div className="space-y-1 text-[10px] sm:text-xs text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Checkpoints:</span>
                      <strong className={isFirst ? 'text-amber-400' : 'text-white'}>{p.wins} 🏆</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy Dipakai:</span>
                      <strong>{p.stats.energySpent}⚡</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Kartu Aksi:</span>
                      <strong>{p.stats.skillsPlayed + p.stats.itemsUsed}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2 w-full mt-1">
          <button
            onClick={() => {
              sound.playPedalRatchet();
              onRematch();
            }}
            className="w-full py-2.5 sm:py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MAIN ULANG (REMATCH)</span>
          </button>

          <button
            onClick={onOpenCodex}
            className="w-full py-2.5 sm:py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>KARTU CODEX & ATURAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
