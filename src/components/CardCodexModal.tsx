import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  BookOpen, 
  Layers, 
  Zap, 
  Trophy, 
  HelpCircle, 
  Search,
  Mountain,
  Compass,
  Package,
  Star,
  ShieldAlert,
  Wrench,
  Flame,
  RotateCw
} from 'lucide-react';
import { 
  RIDERS_POOL, 
  BIKES_POOL, 
  EVENTS_33_DECK, 
  EXPERT_50_DECK,
  HAZARDS_POOL, 
  ACTION_CARDS_POOL 
} from '../data/cards';
import { CardView } from './CardView';

interface CardCodexModalProps {
  onClose: () => void;
}

export const CardCodexModal: React.FC<CardCodexModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'RULES' | 'RIDERS' | 'BIKES' | 'EVENTS' | 'ACTIONS'>('RULES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerrainFilter, setSelectedTerrainFilter] = useState<string>('ALL');
  const [actionCategoryFilter, setActionCategoryFilter] = useState<'ALL' | 'ITEM' | 'SKILL' | 'ULTIMATE'>('ALL');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<'ALL' | 'MAIN_EVENTS' | 'EXTRA_EVENTS'>('ALL');

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[94vh] sm:h-[92vh] bg-zinc-950 border-2 border-zinc-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                FGR TCG CODEX & ENSIKLOPEDIA
              </h2>
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Sistem 7 Kartu: Rider (3 Jenis), Bike (3 Info), Kartu Event (3-4), & Kartu Aksi (5-7)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 overflow-x-auto bg-zinc-950 px-2 sm:px-4 py-2 gap-1 scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'RULES'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> ATURAN MAIN
          </button>

          <button
            onClick={() => setActiveTab('RIDERS')}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'RIDERS'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            🚴 1. KARTU RIDER ({RIDERS_POOL.length})
          </button>

          <button
            onClick={() => setActiveTab('BIKES')}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'BIKES'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            ⚙️ 2. KARTU BIKE ({BIKES_POOL.length})
          </button>

          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'EVENTS'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            🎴 3-4. KARTU EVENT ({EVENTS_33_DECK.length + HAZARDS_POOL.length})
          </button>

          <button
            onClick={() => setActiveTab('ACTIONS')}
            className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'ACTIONS'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            ⚡ 5-7. KARTU AKSI ({ACTION_CARDS_POOL.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-zinc-950 text-zinc-300">
          {/* TAB 1: RULES */}
          {activeTab === 'RULES' && (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              {/* Win condition card */}
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-zinc-900 p-3.5 sm:p-5 rounded-2xl border border-amber-500/40">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  <h3 className="text-sm sm:text-lg font-black text-white">
                    🎯 TUJUAN BALAPAN : FIRST TO 10 CHECKPOINTS WINS
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Tersedia <strong>33 Kartu Event Lintasan</strong>. Pemain yang terlebih dahulu mengumpulkan <strong>10 Kemenangan Checkpoint</strong> dinobatkan sebagai Juara Balapan Fixed Gear!
                </p>
              </div>

              {/* 7 Card Structure */}
              <div>
                <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" /> STRUKTUR LENGKAP 7 JENIS KARTU
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* 1. Rider */}
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-red-400">
                      <span>1. KARTU RIDER</span>
                      <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">3 Jenis</span>
                    </div>
                    <p className="text-zinc-300">
                      Terbagi ke 3 spesialisasi utama:
                    </p>
                    <ul className="list-disc list-inside text-zinc-400 space-y-0.5 text-[11px]">
                      <li><strong className="text-emerald-400">Climber:</strong> Ahli rute Tanjakan</li>
                      <li><strong className="text-amber-400">Sprinter:</strong> Ahli rute Datar</li>
                      <li><strong className="text-blue-400">Handler:</strong> Ahli rute Tikungan</li>
                    </ul>
                  </div>

                  {/* 2. Bike */}
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between font-bold text-cyan-400">
                      <span>2. KARTU BIKE</span>
                      <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">3 Informasi Penting</span>
                    </div>
                    <ul className="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px]">
                      <li><strong className="text-cyan-300">A. Komponen:</strong> Frameset, Gear Ratio, Wheelset, Handlebar</li>
                      <li><strong className="text-cyan-300">B. Performa Medan:</strong> Tanjakan, Datar, Tikungan, Turunan</li>
                      <li><strong className="text-cyan-300">C. Ability Sepeda:</strong> Efek khusus (misal: bonus +1 poin skill, bonus turunan, diskon energy)</li>
                    </ul>
                  </div>

                  {/* 3-4. Kartu Event */}
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-400">
                      <span>🎴 KELOMPOK KARTU EVENT</span>
                      <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">Kartu 3 & 4</span>
                    </div>
                    <ul className="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px]">
                      <li><strong className="text-amber-300">3. Kartu Event:</strong> Ada 4 event medan (Tanjakan, Datar, Tikungan, Turunan).</li>
                      <li><strong className="text-rose-400">4. Extra Event (Hazard):</strong> Rintangan darurat (Jalan Rusak, Penutupan Jalan, Pohon Tumbang, Tumpahan Oli, Hujan Licin).</li>
                    </ul>
                  </div>

                  {/* 5-7. Kartu Aksi */}
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between font-bold text-purple-400">
                      <span>⚡ KELOMPOK KARTU AKSI</span>
                      <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300">Kartu 5, 6, 7</span>
                    </div>
                    <ul className="list-disc list-inside text-zinc-300 space-y-0.5 text-[11px]">
                      <li><strong className="text-emerald-400">5. Item:</strong> Energy Gel, Isotonic Drink, Clipless Shoes, Chain Lube, dll.</li>
                      <li><strong className="text-amber-300">6. Skill:</strong> Skid, Lompat (Bunny Hop), Overtake (Salip), Drafting, Aero Tuck, dll.</li>
                      <li><strong className="text-purple-300">7. Ultimate:</strong> Ultimate Item & Ultimate Skill (hanya 1x per match).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alur 1 Ronde */}
              <div className="bg-zinc-900/50 p-3.5 sm:p-5 rounded-2xl border border-zinc-800">
                <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> ALUR 1 RONDE BALAPAN
                </h3>
                <ol className="space-y-2 text-xs sm:text-sm text-zinc-300">
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <strong className="text-white">Pilih Rider:</strong> Ambil 2 kartu Rider dari tim, pilih 1 (Climber / Sprinter / Handler).
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <strong className="text-white">Pilih Build Bike:</strong> Ambil 2 kartu Bike, periksa komponen, performa medan & ability.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <strong className="text-white">Buka Kartu Event & Extra Event:</strong> Buka 1 Kartu Event (Tanjakan / Datar / Tikungan / Turunan) serta potensi Extra Event.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      <strong className="text-white">Hitung Performance Point:</strong> Rider + Performance Sepeda pada event tersebut + Sinergi & Ability.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      5
                    </span>
                    <div>
                      <strong className="text-white">Fase Kartu Aksi (⚡ Energy):</strong> Mainkan Kartu Item, Skill, atau Ultimate untuk menambah poin atau mengganggu lawan.
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-black flex items-center justify-center shrink-0 text-[10px]">
                      6
                    </span>
                    <div>
                      <strong className="text-white">Penentuan Pemenang:</strong> Pembalap dengan total poin tertinggi memenangkan checkpoint ronde (+1 🏆).
                    </div>
                  </li>
                </ol>
              </div>

              {/* ATURAN KHUSUS EXPERT MODE */}
              <div className="bg-red-950/20 p-3.5 sm:p-5 rounded-2xl border-2 border-red-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-base font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-500 fill-red-500" /> ATURAN VETERAN: EXPERT MODE
                  </h3>
                  <span className="text-[10px] bg-red-500/20 text-red-300 font-mono font-bold px-2 py-0.5 rounded border border-red-500/30">
                    KOMPLEKSITAS TAKTIS TINGGI
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-red-500/20 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> 1. Grand Tour 50+ Deck
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      Total deck event diperpanjang menjadi <strong>50 Kartu Lintasan</strong> dengan rute-rute ekstrim (Alpe d'Huez +18%, Rawamangun Wood Velodrome, Red Hook Crit Chicane, dll).
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-red-500/20 space-y-1">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> 2. Hand Refill Strain (-1⚡)
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      Menarik kartu aksi baru tiap ronde memakan biaya <strong>1⚡ Energy</strong> (Stamina Tax). Batas tangan diperketat menjadi <strong>4 kartu</strong> untuk manajemen sumber daya ketat.
                    </p>
                  </div>

                  <div className="p-3 bg-zinc-900/80 rounded-xl border border-red-500/20 space-y-1">
                    <span className="font-bold text-purple-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> 3. Tactical Dig & Ruthless AI
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      Pemain dapat melakukan <em>Tactical Refill</em> secara manual saat Fase Aksi. AI lawan berpikir lebih agresif dalam membaca celah poin dan momentum sprint.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RIDERS (3 Jenis) */}
          {activeTab === 'RIDERS' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-zinc-300 font-medium">
                  3 Jenis Spesialisasi: <strong className="text-emerald-400">CLIMBER (Tanjakan)</strong> • <strong className="text-amber-400">SPRINTER (Datar)</strong> • <strong className="text-blue-400">HANDLER (Tikungan)</strong>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                {RIDERS_POOL.map((rider, idx) => (
                  <motion.div 
                    key={`codex-rider-${rider.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="w-full flex justify-center"
                  >
                    <CardView card={rider} size="compact" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BIKES (3 Info) */}
          {activeTab === 'BIKES' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                Memuat <strong>3 Informasi Penting</strong>: A. Komponen (Frameset, Ratio, Wheelset, Handlebar), B. Performance (Tanjakan, Datar, Tikungan, Turunan), C. Ability Sepeda.
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                {BIKES_POOL.map((bike, idx) => (
                  <motion.div 
                    key={`codex-bike-${bike.id}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="w-full flex justify-center"
                  >
                    <CardView card={bike} size="compact" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: KARTU EVENT (3-4: 33 Event + Extra Event) */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari event, hazard, rute..."
                    className="w-full bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Event Category Switch */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEventCategoryFilter('ALL')}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      eventCategoryFilter === 'ALL' ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    SEMUA ({EVENTS_33_DECK.length + HAZARDS_POOL.length})
                  </button>
                  <button
                    onClick={() => setEventCategoryFilter('MAIN_EVENTS')}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      eventCategoryFilter === 'MAIN_EVENTS' ? 'bg-amber-400 text-black border-amber-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    3. EVENT ({EVENTS_33_DECK.length})
                  </button>
                  <button
                    onClick={() => setEventCategoryFilter('EXTRA_EVENTS')}
                    className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                      eventCategoryFilter === 'EXTRA_EVENTS' ? 'bg-rose-500 text-white border-rose-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    4. EXTRA EVENT ({HAZARDS_POOL.length})
                  </button>
                </div>

                {/* Terrain filter for main events */}
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pt-1 sm:pt-0">
                  {['ALL', 'TANJAKAN', 'DATAR', 'TIKUNGAN', 'TURUNAN'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTerrainFilter(t)}
                      className={`text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        selectedTerrainFilter === t
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 justify-items-center">
                {/* Main Events */}
                {eventCategoryFilter !== 'EXTRA_EVENTS' &&
                  EVENTS_33_DECK
                    .filter(ev => {
                      const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ev.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        ev.location.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesTerrain = selectedTerrainFilter === 'ALL' || ev.category === selectedTerrainFilter;
                      return matchesSearch && matchesTerrain;
                    })
                    .map((event, idx) => (
                      <motion.div 
                        key={`codex-ev-${event.id}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="w-full flex justify-center"
                      >
                        <CardView card={event} size="compact" />
                      </motion.div>
                    ))}

                {/* Extra Events / Hazards */}
                {eventCategoryFilter !== 'MAIN_EVENTS' && selectedTerrainFilter === 'ALL' &&
                  HAZARDS_POOL
                    .filter(hz => {
                      return hz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hz.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        hz.description.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .map((hazard, idx) => (
                      <motion.div 
                        key={`codex-hz-${hazard.id}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="w-full flex justify-center"
                      >
                        <CardView card={hazard} size="compact" />
                      </motion.div>
                    ))}
              </div>
            </div>
          )}

          {/* TAB 5: KARTU AKSI (5-7: Item, Skill, Ultimate) */}
          {activeTab === 'ACTIONS' && (
            <div className="space-y-4">
              {/* Action subfilter */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800">
                <span className="text-xs text-zinc-300 font-medium">
                  Kartu Aksi: <strong className="text-emerald-400">5. Item</strong> • <strong className="text-amber-400">6. Skill</strong> • <strong className="text-purple-400">7. Ultimate</strong>
                </span>

                <div className="flex items-center gap-1">
                  {(['ALL', 'ITEM', 'SKILL', 'ULTIMATE'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActionCategoryFilter(cat)}
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        actionCategoryFilter === cat
                          ? 'bg-amber-400 text-black border-amber-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {cat === 'ALL' ? 'SEMUA' : cat === 'ITEM' ? '5. ITEM' : cat === 'SKILL' ? '6. SKILL' : '7. ULTIMATE'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                {ACTION_CARDS_POOL
                  .filter(act => {
                    if (actionCategoryFilter === 'ALL') return true;
                    return act.type === actionCategoryFilter;
                  })
                  .map((action, idx) => (
                    <motion.div 
                      key={`codex-act-${action.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="w-full flex justify-center"
                    >
                      <CardView card={action} size="compact" />
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
