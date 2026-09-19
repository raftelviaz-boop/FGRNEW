import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Flag, Pause, Play, Trophy, Volume2, VolumeX, Zap } from 'lucide-react';
import { EventCard, HazardCard, PlayerState, ActionCard, TerrainCategory } from '../types';
import { TERRAIN_META } from '../utils/gameLogic';
import { sound } from '../audio/sound';

interface RaceAnimationScreenProps {
  currentRound: number;
  event: EventCard;
  hazard?: HazardCard;
  player1: PlayerState;
  player2: PlayerState;
  p1Base: number;
  p1Bike: number;
  p1Actions: ActionCard[];
  p1ActionBonus: number;
  p1Total: number;
  p2Base: number;
  p2Bike: number;
  p2Actions: ActionCard[];
  p2ActionBonus: number;
  p2Total: number;
  winner: 'P1' | 'P2' | 'P3' | 'P4' | 'DRAW';
  targetWins: number;
  onFinishAnimation: () => void;
  extraRacers?: Array<{
    playerKey: 'P3' | 'P4';
    player: PlayerState;
    base: number;
    bike: number;
    actions: ActionCard[];
    actionBonus: number;
    total: number;
  }>;
}

type RacePhase = 'START' | 'RACE' | 'SPRINT' | 'FINISH';
type RacerColor = 'cyan' | 'rose' | 'amber' | 'emerald';

const PHASES: RacePhase[] = ['START', 'RACE', 'SPRINT', 'FINISH'];
const PHASE_MS = { START: 1100, RACE: 2400, SPRINT: 1900, FINISH: 0 };
const PHASE_PROGRESS = { START: 20, RACE: 55, SPRINT: 88, FINISH: 100 };
const PHASE_POSITION = { START: 30, RACE: 48, SPRINT: 70, FINISH: 92 };
const LANE_TOP = ['18%', '48%', '72%', '88%'];
const COLORS: Record<RacerColor, { main: string; soft: string }> = {
  cyan: { main: '#22d3ee', soft: 'rgba(34,211,238,.18)' },
  rose: { main: '#fb7185', soft: 'rgba(251,113,133,.18)' },
  amber: { main: '#fbbf24', soft: 'rgba(251,191,36,.18)' },
  emerald: { main: '#34d399', soft: 'rgba(52,211,153,.18)' },
};

interface Racer {
  playerKey: 'P1' | 'P2' | 'P3' | 'P4';
  player: PlayerState;
  color: RacerColor;
  base: number;
  bike: number;
  actions: ActionCard[];
  actionBonus: number;
  total: number;
}

const isRain = (hazard?: HazardCard) => Boolean(
  hazard && (
    hazard.hazardType === 'HUJAN_LICIN' ||
    hazard.hazardType === 'WEATHER' ||
    hazard.title.toLowerCase().includes('hujan') ||
    hazard.title.toLowerCase().includes('rain')
  )
);

function SimpleRider({
  color,
  wheelClass,
  sprint,
  winner,
  loser,
}: {
  color: RacerColor;
  wheelClass: string;
  sprint: boolean;
  winner: boolean;
  loser: boolean;
}) {
  const c = COLORS[color].main;
  return (
    <div className={`relative w-32 sm:w-40 h-24 sm:h-28 ${sprint ? 'scale-[1.04]' : ''} transition-transform duration-300`}>
      {sprint && <div className="absolute inset-2 rounded-full blur-xl" style={{ background: COLORS[color].soft }} />}
      <svg viewBox="0 0 140 90" className="relative z-10 w-full h-full overflow-visible drop-shadow-md" aria-hidden="true">
        <g className={wheelClass} style={{ transformOrigin: '26px 58px' }}>
          <circle cx="26" cy="58" r="19" fill="#111827" stroke="#475569" strokeWidth="3" />
          <circle cx="26" cy="58" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 4" />
        </g>
        <g className={wheelClass} style={{ transformOrigin: '108px 58px' }}>
          <circle cx="108" cy="58" r="19" fill="#111827" stroke="#475569" strokeWidth="3" />
          <circle cx="108" cy="58" r="14" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 4" />
        </g>
        <path d="M26 58 L62 57 L108 58 L82 31 L48 32 Z" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round" />
        <path d="M82 31 L94 25 L108 58" fill="none" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
        <circle cx="62" cy="57" r="7" fill="#111827" stroke="#cbd5e1" strokeWidth="2" />
        <line x1="62" y1="57" x2="70" y2="49" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="57" x2="54" y2="65" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

        {/* Simple rider silhouette */}
        <line x1="49" y1="32" x2="59" y2="20" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        <line x1="59" y1="20" x2="88" y2="27" stroke={c} strokeWidth="8" strokeLinecap="round" />
        <line x1="59" y1="20" x2="73" y2="38" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
        <line x1="73" y1="38" x2="62" y2="57" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        <line x1="73" y1="38" x2="91" y2="48" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        <line x1="91" y1="48" x2="94" y2="25" stroke="#fed7aa" strokeWidth="5" strokeLinecap="round" />
        <circle cx="62" cy="12" r="8" fill="#fed7aa" />
        <path d="M53 11 Q62 1 72 9 L69 14 L54 14 Z" fill={c} />

        {winner && <circle cx="62" cy="12" r="13" fill="none" stroke="#fbbf24" strokeWidth="2" opacity=".8" />}
        {loser && <path d="M56 8 L68 18 M68 8 L56 18" stroke="#94a3b8" strokeWidth="2" />}
      </svg>
    </div>
  );
}

export const RaceAnimationScreen: React.FC<RaceAnimationScreenProps> = ({
  currentRound,
  event,
  hazard,
  player1,
  player2,
  p1Base,
  p1Bike,
  p1Actions,
  p1ActionBonus,
  p1Total,
  p2Base,
  p2Bike,
  p2Actions,
  p2ActionBonus,
  p2Total,
  winner,
  targetWins,
  onFinishAnimation,
  extraRacers = [],
}) => {
  const [phase, setPhase] = useState<RacePhase>('START');
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [voice, setVoice] = useState(!sound.enabled ? false : true);

  const racers = useMemo<Racer[]>(() => [
    { playerKey: 'P1', player: player1, color: 'cyan', base: p1Base, bike: p1Bike, actions: p1Actions, actionBonus: p1ActionBonus, total: p1Total },
    { playerKey: 'P2', player: player2, color: 'rose', base: p2Base, bike: p2Bike, actions: p2Actions, actionBonus: p2ActionBonus, total: p2Total },
    ...extraRacers.map((r, i) => ({ ...r, color: (i === 0 ? 'amber' : 'emerald') as RacerColor })),
  ], [player1, player2, p1Base, p1Bike, p1Actions, p1ActionBonus, p1Total, p2Base, p2Bike, p2Actions, p2ActionBonus, p2Total, extraRacers]);

  const rain = isRain(hazard);
  const meta = TERRAIN_META[event.category];
  const winningScore = Math.max(...racers.map(r => r.total));

  useEffect(() => {
    if (paused || phase === 'FINISH') return;
    const nextIndex = PHASES.indexOf(phase) + 1;
    const timer = window.setTimeout(() => setPhase(PHASES[nextIndex]), PHASE_MS[phase] / (fast ? 1.7 : 1));
    return () => window.clearTimeout(timer);
  }, [phase, paused, fast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); setPaused(v => !v); }
      if (e.key.toLowerCase() === 'f') setFast(v => !v);
      if (e.key.toLowerCase() === 'm') {
        sound.enabled = !sound.enabled;
        setVoice(sound.enabled);
      }
      if (e.key === 'Enter' || e.key === 'Escape') onFinishAnimation();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFinishAnimation]);

  useEffect(() => () => sound.cancelSpeech(), []);

  useEffect(() => {
    if (paused) return;
    if (phase === 'START') {
      sound.playSprintBurst();
      sound.playPedalRatchet();
      sound.playTerrainSound(event.category, false);
      if (rain) sound.playRainDownpour(1.8);
    } else if (phase === 'RACE') {
      sound.playPedalRatchet();
    } else if (phase === 'SPRINT') {
      sound.playSprintBurst();
      if (rain) sound.playWetTireSpray();
    } else if (phase === 'FINISH') {
      sound.playCameraFlash();
      winner === 'DRAW' ? sound.playBellRing() : sound.playWinFanfare();
    }
  }, [phase, paused, event.category, rain, winner]);

  const progress = PHASE_PROGRESS[phase];
  const phasePosition = PHASE_POSITION[phase];
  const sprint = phase === 'SPRINT';
  const wheelAnimation = paused ? '' : fast ? 'animate-[spin_.25s_linear_infinite]' : 'animate-[spin_.45s_linear_infinite]';

  const getPosition = (racer: Racer) => {
    if (phase === 'FINISH') {
      const rank = [...racers].sort((a, b) => b.total - a.total).findIndex(r => r.playerKey === racer.playerKey);
      return Math.max(25, 92 - rank * 18);
    }
    const delta = racer.total - winningScore;
    return Math.max(18, Math.min(82, phasePosition + delta * 0.25));
  };

  const terrainClass = event.category === 'TANJAKAN'
    ? 'bg-gradient-to-b from-amber-950/40 to-zinc-950'
    : event.category === 'TURUNAN'
      ? 'bg-gradient-to-b from-sky-950/50 to-zinc-950'
      : 'bg-gradient-to-b from-slate-900 to-zinc-950';

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#070913] text-white select-none">
      <style>{`
        @keyframes trackMove { from { background-position-x: 0; } to { background-position-x: -240px; } }
        @keyframes rainMove { from { background-position: 0 0; } to { background-position: -80px 160px; } }
        @keyframes pulseSoft { 0%,100%{opacity:.35} 50%{opacity:.7} }
        .fg-track { animation: trackMove .7s linear infinite; }
        .fg-rain { animation: rainMove .32s linear infinite; }
        .fg-soft { animation: pulseSoft 1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .fg-track,.fg-rain,.fg-soft { animation:none!important; } }
      `}</style>

      <header className="shrink-0 border-b border-white/10 bg-[#0d1021]/95 px-3 py-2.5 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-black">ROUND {currentRound}</span>
            <span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-black text-zinc-300">{meta?.label || event.category}</span>
            {hazard && <span className="max-w-[150px] truncate rounded-lg bg-amber-500/15 px-2 py-1 text-[10px] font-black text-amber-300">鈿� {hazard.title}</span>}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">{progress}%</div>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className={`relative flex-1 overflow-hidden ${terrainClass}`}>
        {/* Lightweight road */}
        <div className="absolute inset-0 opacity-60 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,.025)_49%,transparent_50%,rgba(255,255,255,.02)_100%)]" />
        <div className="absolute inset-x-0 top-[50%] h-px bg-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-zinc-950/80 border-t border-white/5" />

        <div className="fg-track absolute inset-x-0 top-[20%] h-1 opacity-30 bg-[repeating-linear-gradient(90deg,white_0_22px,transparent_22px_44px)]" />
        <div className="fg-track absolute inset-x-0 top-[48%] h-1 opacity-20 bg-[repeating-linear-gradient(90deg,white_0_22px,transparent_22px_44px)]" />
        <div className="fg-track absolute inset-x-0 top-[76%] h-1 opacity-20 bg-[repeating-linear-gradient(90deg,white_0_22px,transparent_22px_44px)]" />

        {rain && <div className="fg-rain absolute inset-0 opacity-35 bg-[repeating-linear-gradient(110deg,transparent_0_18px,rgba(125,211,252,.7)_18px_20px,transparent_20px_38px)] pointer-events-none" />}

        {/* Finish line */}
        {phase === 'FINISH' && <div className="absolute inset-y-0 left-[92%] w-5 bg-[repeating-linear-gradient(45deg,#fff_0_8px,#111_8px_16px)] shadow-[0_0_12px_rgba(255,255,255,.45)]" />}

        {/* Simple phase label */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-4 py-1.5 text-[10px] font-black tracking-[.18em] text-zinc-200 backdrop-blur-sm">
          {phase === 'START' ? 'GET READY' : phase === 'RACE' ? 'RACE' : phase === 'SPRINT' ? 'FINAL SPRINT' : 'FINISH'}
        </div>

        {racers.map((racer, index) => {
          const pos = getPosition(racer);
          const isWinner = phase === 'FINISH' && winner === racer.playerKey;
          const isLoser = phase === 'FINISH' && winner !== 'DRAW' && winner !== racer.playerKey;
          const activeAction = racer.actions[0];
          return (
            <div
              key={racer.playerKey}
              className="absolute z-10 -translate-x-1/2 transition-all duration-700 ease-out"
              style={{ left: `${pos}%`, top: LANE_TOP[Math.min(index, LANE_TOP.length - 1)] }}
            >
              <div className="relative flex flex-col items-center">
                <div className="mb-0.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[8px] font-black backdrop-blur-sm">
                  <span style={{ color: COLORS[racer.color].main }}>鈼�</span>
                  <span>{racer.player.name}</span>
                  <span className="text-zinc-400">{racer.total}</span>
                </div>
                {phase === 'SPRINT' && activeAction && (
                  <div className="absolute -top-7 whitespace-nowrap rounded-full bg-black/75 px-2 py-0.5 text-[8px] font-black text-yellow-300">
                    <Zap className="mr-0.5 inline h-2.5 w-2.5" />{activeAction.name} +{racer.actionBonus}
                  </div>
                )}
                <SimpleRider color={racer.color} wheelClass={wheelAnimation} sprint={sprint} winner={isWinner} loser={isLoser} />
              </div>
            </div>
          );
        })}

        {phase === 'FINISH' && (
          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/70 px-4 py-2 text-sm font-black text-amber-300 backdrop-blur">
              {winner === 'DRAW' ? <Flag className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
              {winner === 'DRAW' ? 'PHOTO FINISH 鈥� DRAW' : `${racers.find(r => r.playerKey === winner)?.player.name || 'WINNER'} WINS`}
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-white/10 bg-[#0d1021] p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-zinc-200">
              {phase === 'START' && `Ronde ${currentRound} dimulai di ${meta?.label || event.category}.`}
              {phase === 'RACE' && `Peloton bergerak. Base + Bike menentukan posisi.`}
              {phase === 'SPRINT' && `Semua pembalap masuk fase sprint menuju checkpoint.`}
              {phase === 'FINISH' && (winner === 'DRAW' ? 'Hasil sangat tipis 鈥� ronde imbang.' : 'Checkpoint selesai.')}
            </div>
            <div className="mt-1 text-[9px] text-zinc-500">Target checkpoint: {targetWins}</div>
          </div>

          <button type="button" onClick={() => setPaused(v => !v)} className="rounded-lg bg-white/10 p-2 text-zinc-200" title="Pause / play">
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setFast(v => !v)} className={`rounded-lg px-2.5 py-2 text-[10px] font-black ${fast ? 'bg-white text-black' : 'bg-white/10 text-zinc-300'}`}>2脳</button>
          <button
            type="button"
            onClick={() => {
              const next = !voice;
              setVoice(next);
              sound.enabled = next;
              if (!next) sound.cancelSpeech();
            }}
            className="rounded-lg bg-white/10 p-2 text-zinc-200"
            title="Sound"
          >
            {voice ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button type="button" onClick={onFinishAnimation} className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-black text-black">
            {phase === 'FINISH' ? 'LANJUT' : 'LEWATI'} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default RaceAnimationScreen;
