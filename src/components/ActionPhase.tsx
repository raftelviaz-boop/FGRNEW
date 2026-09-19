import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  X, 
  ArrowRight,
  Flag,
  RotateCw,
  Plus
} from 'lucide-react';
import { 
  EventCard, 
  HazardCard, 
  PlayerState, 
  ActionCard 
} from '../types';
import { calculateBasePoints, calculateActionPoints, TERRAIN_META } from '../utils/gameLogic';
import { CardView } from './CardView';
import { sound } from '../audio/sound';

interface ActionPhaseProps {
  event: EventCard;
  hazard?: HazardCard;
  player1: PlayerState;
  player2: PlayerState;
  extraPlayers?: PlayerState[];
  selectedActionsP1: ActionCard[];
  selectedActionsP2?: ActionCard[];
  onToggleActionP1: (action: ActionCard) => void;
  onToggleActionP2?: (action: ActionCard) => void;
  onLockActions: () => void;
  isAiOpponent: boolean;
  gameMode?: 'PVE' | 'PVP_LOCAL' | 'PVP_ONLINE';
  isExpertMode?: boolean;
  onRefillHand?: (playerId: 'p1' | 'p2') => void;
}

export const ActionPhase: React.FC<ActionPhaseProps> = ({
  event,
  hazard,
  player1,
  player2,
  extraPlayers = [],
  selectedActionsP1,
  selectedActionsP2 = [],
  onToggleActionP1,
  onToggleActionP2,
  onLockActions,
  isAiOpponent,
  gameMode = 'PVE',
  isExpertMode = false,
  onRefillHand
}) => {
  const [activeTab, setActiveTab] = useState<'P1' | 'P2'>('P1');

  // Base point calculation
  const p1Base = calculateBasePoints(player1.selectedRider, player1.selectedBike, event, hazard);
  const p2Base = calculateBasePoints(player2.selectedRider, player2.selectedBike, event, hazard);

  // Dynamic Energy Spent for selected actions
  const energySpentP1 = selectedActionsP1.reduce((sum, a) => sum + a.cost, 0);
  const remainingEnergyP1 = player1.energy - energySpentP1;

  const energySpentP2 = selectedActionsP2.reduce((sum, a) => sum + a.cost, 0);
  const remainingEnergyP2 = player2.energy - energySpentP2;

  // Real-time Action Points preview for P1
  const p1ActionCalc = calculateActionPoints(
    selectedActionsP1,
    event,
    p1Base.totalBase,
    p2Base.totalBase
  );

  // Real-time Action Points preview for P2 (in PVP mode)
  const p2ActionCalc = calculateActionPoints(
    selectedActionsP2,
    event,
    p2Base.totalBase,
    p1Base.totalBase
  );

  const previewP1Total = Math.max(0, p1Base.totalBase + p1ActionCalc.actionPoints);
  const previewP2Total = Math.max(0, p2Base.totalBase + p2ActionCalc.actionPoints);

  const terrainMeta = TERRAIN_META[event.category];

  // Active Player in Tab (for PVP Local)
  const isP1Tab = activeTab === 'P1' || isAiOpponent;
  const currentPlayer = isP1Tab ? player1 : player2;
  const currentSelectedActions = isP1Tab ? selectedActionsP1 : selectedActionsP2;
  const currentRemainingEnergy = isP1Tab ? remainingEnergyP1 : remainingEnergyP2;
  const currentEnergySpent = isP1Tab ? energySpentP1 : energySpentP2;
  const currentToggleAction = isP1Tab ? onToggleActionP1 : (onToggleActionP2 || (() => {}));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-5xl mx-auto py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center"
    >
      {/* Step Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] sm:text-xs font-mono font-bold text-amber-400 mb-1.5">
          LANGKAH 5 : FASE AKSI TACTICAL & ENERGY ⚡
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          {isAiOpponent ? 'MAINKAN SKILL ATAU SIMPAN ENERGY?' : 'FASE AKSI TACTICAL'}
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-xl mx-auto px-2">
          {isAiOpponent 
            ? 'Pilih kartu aksi untuk mendongkrak skor ronde ini. Lawan juga memiliki kartu taktis dan akan melakukan perlawanan!'
            : 'Pemain dapat bergantian memilih kartu taktis secara rahasia sebelum memulai adu sprint finis!'}
        </p>
      </div>

      {/* 2-Player Tab Selector if Local PVP */}
      {!isAiOpponent && (
        <div className="flex items-center gap-2 mb-4 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('P1')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'P1'
                ? 'bg-blue-500 text-black shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🔵 {player1.name}</span>
            <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">{selectedActionsP1.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('P2')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'P2'
                ? 'bg-rose-500 text-white shadow-md font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>🔴 {player2.name}</span>
            <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">{selectedActionsP2.length}</span>
          </button>
        </div>
      )}

      {/* Live Match Point Clash Preview (Supports 2, 3, or 4 Racers) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-zinc-950/90 border-2 border-zinc-800 rounded-2xl p-2.5 sm:p-4 mb-4 shadow-xl"
      >
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-800 text-[10px] sm:text-xs">
          <span className="font-mono text-zinc-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" /> ARENA LIVE PREVIEW ({2 + extraPlayers.length} PEMBALAP)
          </span>
          <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded border ${terrainMeta.bgBadge} whitespace-nowrap`}>
            Medan: {terrainMeta.label}
          </span>
        </div>

        <div className={`grid gap-2 sm:gap-3 ${extraPlayers.length > 0 ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {/* P1 Current Status */}
          <div className="bg-zinc-900/90 border border-blue-500/40 rounded-xl p-2 sm:p-3 flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-blue-500/20 text-blue-400 text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
                  P1
                </span>
                <span className="font-bold text-white text-[11px] sm:text-xs truncate">{player1.name}</span>
                <span className="text-[9px] sm:text-[10px] text-blue-400 font-mono bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20 shrink-0">
                  {player1.energy}⚡
                </span>
              </div>
              <div className="text-[9px] sm:text-[11px] text-zinc-400 font-mono mt-0.5 sm:mt-1 truncate">
                Base: <strong className="text-white">{p1Base.totalBase}</strong> + Aksi:{' '}
                <strong className="text-amber-400">+{p1ActionCalc.actionPoints}</strong>
              </div>
            </div>
            <div className="text-right pl-1 shrink-0">
              <span className="text-[8px] sm:text-[10px] font-mono text-zinc-400 uppercase block">Live PTS</span>
              <motion.div 
                key={previewP1Total}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xl sm:text-2xl font-black text-blue-400 font-mono"
              >
                {previewP1Total}
              </motion.div>
            </div>
          </div>

          {/* P2 / AI Status */}
          <div className="bg-zinc-900/90 border border-rose-500/40 rounded-xl p-2 sm:p-3 flex items-center justify-between">
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-rose-500/20 text-rose-400 text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0">
                  {player2.isAi ? 'AI' : 'P2'}
                </span>
                <span className="font-bold text-white text-[11px] sm:text-xs truncate">{player2.name}</span>
                <span className="text-[9px] sm:text-[10px] text-rose-400 font-mono bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/20 shrink-0">
                  {player2.energy}⚡
                </span>
              </div>
              <div className="text-[9px] sm:text-[11px] text-zinc-400 font-mono mt-0.5 sm:mt-1 truncate">
                {isAiOpponent ? (
                  <span>Base: <strong className="text-white">{p2Base.totalBase}</strong></span>
                ) : (
                  <span>Base: <strong className="text-white">{p2Base.totalBase}</strong> + Aksi: <strong className="text-rose-400">+{p2ActionCalc.actionPoints}</strong></span>
                )}
              </div>
            </div>
            <div className="text-right pl-1 shrink-0">
              <span className="text-[8px] sm:text-[10px] font-mono text-zinc-400 uppercase block">
                {isAiOpponent ? 'Base' : 'Live PTS'}
              </span>
              <motion.div 
                key={isAiOpponent ? p2Base.totalBase : previewP2Total}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-xl sm:text-2xl font-black text-rose-400 font-mono"
              >
                {isAiOpponent ? p2Base.totalBase : previewP2Total}
              </motion.div>
            </div>
          </div>

          {/* Extra Racers (P3, P4) */}
          {extraPlayers.map((extraP, idx) => {
            const extraBase = calculateBasePoints(extraP.selectedRider, extraP.selectedBike, event, hazard);
            const badgeKey = idx === 0 ? 'P3' : 'P4';
            const isAmber = idx === 0;
            return (
              <div 
                key={extraP.id}
                className={`bg-zinc-900/90 border rounded-xl p-2 sm:p-3 flex items-center justify-between ${
                  isAmber ? 'border-amber-500/40' : 'border-emerald-500/40'
                }`}
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded text-[9px] sm:text-[10px] font-black flex items-center justify-center shrink-0 ${
                      isAmber ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {badgeKey}
                    </span>
                    <span className="font-bold text-white text-[11px] sm:text-xs truncate">{extraP.name}</span>
                    <span className={`text-[9px] sm:text-[10px] font-mono px-1 py-0.5 rounded border shrink-0 ${
                      isAmber ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {extraP.energy}⚡
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-zinc-400 font-mono mt-0.5 sm:mt-1 truncate">
                    Base: <strong className="text-white">{extraBase.totalBase}</strong> PTS
                  </div>
                </div>
                <div className="text-right pl-1 shrink-0">
                  <span className="text-[8px] sm:text-[10px] font-mono text-zinc-400 uppercase block">Base</span>
                  <div className={`text-xl sm:text-2xl font-black font-mono ${isAmber ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {extraBase.totalBase}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* OPPONENT / AI TACTICAL STATUS BOX (Visible in AI Mode) */}
      {isAiOpponent && (
        <div className="w-full bg-rose-950/20 border border-rose-500/30 rounded-xl p-2.5 sm:p-3 mb-4 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-rose-300 font-mono uppercase">
                  POSTURE MUSUH ({player2.name})
                </span>
                <span className="text-[8px] sm:text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                  ⚡ SIAP COUNTER
                </span>
              </div>
              <p className="text-[9px] sm:text-[11px] text-zinc-400">
                Punya <strong className="text-amber-400">{player2.tacticalHand.length} kartu taktis</strong> & <strong className="text-rose-400">{player2.energy}⚡ Energy</strong>.
              </p>
            </div>
          </div>

          {/* AI Mystery Card Stack Visual */}
          <div className="flex items-center gap-1 shrink-0">
            {player2.tacticalHand.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-6 h-9 sm:w-8 sm:h-12 rounded-md bg-gradient-to-br from-rose-950 to-zinc-900 border border-rose-500/40 shadow-sm flex flex-col items-center justify-center text-rose-400"
                title={`Kartu Taktis AI #${i + 1}`}
              >
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-rose-500/40 text-rose-400" />
                <span className="text-[6px] sm:text-[7px] text-zinc-500 font-mono">TC</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Battery & Player Hand */}
      <div className="w-full mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-zinc-300">
              KARTU TANGAN ({currentPlayer.name}):
            </span>
            <span className="text-[10px] sm:text-xs text-zinc-500 font-mono">
              ({currentPlayer.tacticalHand.length} / {isExpertMode ? '4' : '5'} Kartu)
            </span>
            {isExpertMode && (
              <span className="text-[9px] font-mono font-black bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-red-400" /> EXPERT HAND
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Tactical Hand Refill Button (Expert / Tactical Dig) */}
            {onRefillHand && (
              <button
                onClick={() => onRefillHand(isP1Tab ? 'p1' : 'p2')}
                disabled={
                  currentRemainingEnergy < 1 || 
                  currentPlayer.tacticalHand.length >= (isExpertMode ? 4 : 5)
                }
                className={`px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold font-mono border flex items-center gap-1.5 transition-all ${
                  currentRemainingEnergy >= 1 && currentPlayer.tacticalHand.length < (isExpertMode ? 4 : 5)
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 hover:border-amber-400 cursor-pointer shadow-sm active:scale-95'
                    : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed opacity-60'
                }`}
                title={
                  currentPlayer.tacticalHand.length >= (isExpertMode ? 4 : 5)
                    ? 'Tangan sudah penuh!'
                    : currentRemainingEnergy < 1
                    ? 'Butuh 1⚡ Energy untuk Refill Kartu'
                    : 'Bayar 1⚡ Energy untuk menarik 1 kartu taktis baru!'
                }
              >
                <RotateCw className="w-3 h-3 text-amber-400" />
                <span>Refill Tangan <strong className="text-amber-400 font-black">(-1⚡)</strong></span>
              </button>
            )}

            {/* Energy Battery Indicator */}
            <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow-inner">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-300">
                Sisa:{' '}
                <strong className={currentRemainingEnergy < 0 ? 'text-red-400' : 'text-amber-400'}>
                  {currentRemainingEnergy}⚡
                </strong>{' '}
                <span className="text-zinc-500">/ {currentPlayer.energy}⚡</span>
              </span>
            </div>
          </div>
        </div>

        {/* Hand Cards Grid - 2-cols on mobile, up to 5-cols on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full justify-items-center max-w-4xl mx-auto">
          {currentPlayer.tacticalHand.map((actionCard, idx) => {
            const isSelected = currentSelectedActions.some((a) => a.id === actionCard.id);
            const canAfford = currentRemainingEnergy >= actionCard.cost || isSelected;
            const isUltimateLocked =
              actionCard.isUltimate &&
              (currentPlayer.usedUltimateThisMatch ||
                (currentSelectedActions.some((a) => a.isUltimate) && !isSelected));

            const isDisabled = !canAfford || isUltimateLocked;

            return (
              <motion.div 
                key={`hand-card-${actionCard.id}-${idx}`} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                className="w-full flex flex-col items-center"
              >
                <CardView
                  card={actionCard}
                  size="compact"
                  selected={isSelected}
                  disabled={isDisabled}
                  highlightAffinity={event.category}
                  onClick={() => {
                    if (isDisabled) return;
                    if (actionCard.cost > 0) {
                      sound.playEnergyZap();
                    } else {
                      sound.playCardFlip();
                    }
                    currentToggleAction(actionCard);
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Action Tags Summary */}
      <AnimatePresence>
        {currentSelectedActions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full bg-zinc-900/90 border border-amber-500/30 rounded-xl p-2 sm:p-3 mb-4 flex flex-wrap items-center gap-1.5 shadow-sm"
          >
            <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AKSI AKTIF:
            </span>
            {currentSelectedActions.map((action, idx) => (
              <motion.div
                key={`selected-act-${action.id}-${idx}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/40 text-[10px] sm:text-xs px-2 py-0.5 rounded-lg font-bold"
              >
                <span>{action.name}</span>
                <span className="font-mono text-[9px] text-zinc-400">({action.cost}⚡)</span>
                <button
                  onClick={() => currentToggleAction(action)}
                  className="hover:text-red-400 p-0.5 cursor-pointer ml-0.5"
                >
                  <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock Actions & Determine Winner Button */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.playPedalRatchet();
            onLockActions();
          }}
          disabled={currentRemainingEnergy < 0}
          className={`w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 shadow-xl ${
            currentRemainingEnergy >= 0
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-amber-500/20 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>
            {currentSelectedActions.length === 0
              ? 'SIMPAN ENERGY & ADU FINISH 🏁'
              : 'KUNCI AKSI & ADU FINISH 🏁'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono text-center">
          {currentSelectedActions.length === 0
            ? 'Hemat seluruh ⚡ Energy untuk ronde berikutnya.'
            : `Menghabiskan ${currentEnergySpent}⚡ Energy untuk ronde ini.`}
        </span>
      </div>
    </motion.div>
  );
};

