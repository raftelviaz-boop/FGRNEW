import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { RiderCard, BikeCard, PlayerState, RoundPhase } from '../types';
import { CardView } from './CardView';
import { sound } from '../audio/sound';

interface DraftPhaseProps {
  phase: RoundPhase; // 'DRAFT_RIDER' | 'DRAFT_BIKE'
  activePlayer: PlayerState;
  onSelectRider: (rider: RiderCard) => void;
  onSelectBike: (bike: BikeCard) => void;
  onConfirmSelection: () => void;
  selectedRiderCandidate: RiderCard | null;
  selectedBikeCandidate: BikeCard | null;
  isAiChoosing?: boolean;
}

export const DraftPhase: React.FC<DraftPhaseProps> = ({
  phase,
  activePlayer,
  onSelectRider,
  onSelectBike,
  onConfirmSelection,
  selectedRiderCandidate,
  selectedBikeCandidate,
  isAiChoosing = false
}) => {
  const isRiderDraft = phase === 'DRAFT_RIDER';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-4xl mx-auto py-3 sm:py-6 px-2 sm:px-4 flex flex-col items-center"
    >
      {/* Step Header */}
      <div className="text-center mb-4 sm:mb-6">
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700 text-[11px] sm:text-xs font-mono font-bold text-amber-400 mb-1.5 shadow-sm"
        >
          {isRiderDraft ? 'LANGKAH 1 DARI 2' : 'LANGKAH 2 DARI 2'}
        </motion.div>
        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          {isRiderDraft ? (
            <>
              <User className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400" />
              PILIH 1 RIDER UNTUK RONDE INI
            </>
          ) : (
            <>
              <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
              PILIH 1 BUILD BIKE
            </>
          )}
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 max-w-md mx-auto px-2">
          {isRiderDraft
            ? 'Ambil 2 Rider dari pool tim. Pilih 1 Rider yang memiliki kemampuan terbaik untuk ronde ini.'
            : `Pasangkan setup sepeda yang memiliki sinergi atau bonus terrain dengan Rider pilihanmu.`}
        </p>
      </div>

      {/* Selected Rider Context Badge (during Bike Draft) */}
      <AnimatePresence>
        {!isRiderDraft && activePlayer.selectedRider && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-4 w-full max-w-md bg-zinc-950/90 border border-amber-500/40 rounded-xl p-2.5 sm:p-3 flex items-center justify-between shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-base">
                🚴
              </div>
              <div>
                <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide">Rider Terpilih:</span>
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                  {activePlayer.selectedRider.name}
                </h4>
                <span className="text-[10px] sm:text-xs text-amber-400 font-bold">
                  Spesialis: {activePlayer.selectedRider.specialty} (+{activePlayer.selectedRider.terrainBonus})
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-400 block font-mono">Base Power</span>
              <span className="text-base sm:text-lg font-black text-amber-400">{activePlayer.selectedRider.basePower}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2 Cards Draft Choice Grid (Side by side on mobile & desktop) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-6 mb-6 w-full max-w-lg justify-items-center">
        {isRiderDraft ? (
          activePlayer.riderDraftOptions.map((rider, idx) => {
            const isSelected = selectedRiderCandidate?.id === rider.id;
            return (
              <motion.div 
                key={`draft-rider-${rider.id}-${idx}`} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.25 }}
                className="w-full flex flex-col items-center"
              >
                <CardView
                  card={rider}
                  size="compact"
                  selected={isSelected}
                  onClick={() => {
                    sound.playCardFlip();
                    onSelectRider(rider);
                  }}
                />
              </motion.div>
            );
          })
        ) : (
          activePlayer.bikeDraftOptions.map((bike, idx) => {
            const isSelected = selectedBikeCandidate?.id === bike.id;
            const hasSynergy = activePlayer.selectedRider?.specialty === bike.riderSynergy;

            return (
              <motion.div 
                key={`draft-bike-${bike.id}-${idx}`} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.25 }}
                className="w-full flex flex-col items-center relative"
              >
                {hasSynergy && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2.5 z-10 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[8px] sm:text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md"
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Sinergi (+{bike.abilityEffect?.riderSynergyBonus || 1})
                  </motion.div>
                )}
                <CardView
                  card={bike}
                  size="compact"
                  selected={isSelected}
                  onClick={() => {
                    sound.playCardFlip();
                    onSelectBike(bike);
                  }}
                />
              </motion.div>
            );
          })
        )}
      </div>

      {/* Confirm Selection Action Button */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            sound.playPedalRatchet();
            onConfirmSelection();
          }}
          disabled={isRiderDraft ? !selectedRiderCandidate : !selectedBikeCandidate}
          className={`w-full py-3 sm:py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-200 shadow-xl ${
            (isRiderDraft ? selectedRiderCandidate : selectedBikeCandidate)
              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/20 cursor-pointer'
              : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed'
          }`}
        >
          <span>KUNCI PILIHAN & LANJUT</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
        <span className="text-[10px] sm:text-[11px] text-zinc-500 font-mono text-center">
          {(isRiderDraft ? selectedRiderCandidate : selectedBikeCandidate)
            ? 'Klik tombol di atas untuk mengunci kombinasi pilihanmu'
            : 'Pilih salah satu dari 2 kartu di atas'}
        </span>
      </div>
    </motion.div>
  );
};

