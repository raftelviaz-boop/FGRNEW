import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  Plus, 
  LogIn, 
  Copy, 
  Check, 
  Play, 
  Share2, 
  Sparkles, 
  Settings, 
  Flame, 
  AlertCircle,
  MessageSquare,
  Bike,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { UserProfile, GameSettings } from '../types';
import { AVATAR_PRESETS } from '../utils/auth';
import { socketManager } from '../utils/multiplayerSocket';
import { sound } from '../audio/sound';

interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onStartOnlineMatch: (roomData: any, isHost: boolean) => void;
}

export function MultiplayerLobbyModal({
  isOpen,
  onClose,
  currentUser,
  onStartOnlineMatch
}: MultiplayerLobbyModalProps) {
  const [tab, setTab] = useState<'CREATE' | 'JOIN' | 'IN_ROOM'>('CREATE');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [refreshingRooms, setRefreshingRooms] = useState(false);

  // Settings for newly created room
  const [targetWins, setTargetWins] = useState(7);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [enableHazards, setEnableHazards] = useState(true);
  const [expertMode, setExpertMode] = useState(false);

  // Connect socket with current user info
  useEffect(() => {
    if (isOpen && currentUser) {
      socketManager.connect({
        userId: currentUser.id,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        customPhoto: currentUser.customPhoto
      });

      fetchPublicRooms();
    }
  }, [isOpen, currentUser]);

  const fetchPublicRooms = async () => {
    setRefreshingRooms(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.rooms) {
        setPublicRooms(data.rooms);
      }
    } catch (e) {
      console.warn('Failed to fetch rooms', e);
    } finally {
      setRefreshingRooms(false);
    }
  };

  // Socket event listener for room lifecycle
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = socketManager.subscribe((event) => {
      if (event.type === 'ROOM_CREATED') {
        setActiveRoom(event.room);
        setIsHost(true);
        setTab('IN_ROOM');
        sound.playBellRing();
      } else if (event.type === 'ROOM_UPDATED') {
        setActiveRoom(event.room);
        const amHost = event.room.hostId === currentUser.id;
        setIsHost(amHost);
        setTab('IN_ROOM');
      } else if (event.type === 'ERROR') {
        setErrorMsg(event.message);
        sound.playPedalRatchet();
      } else if (event.type === 'GAME_STARTED') {
        sound.playWinFanfare();
        onStartOnlineMatch(event.room, isHost);
        onClose();
      } else if (event.type === 'PLAYER_LEFT') {
        sound.playPedalRatchet();
        setActiveRoom(event.room);
      }
    });

    return () => unsubscribe();
  }, [isOpen, currentUser, isHost, onStartOnlineMatch, onClose]);

  // Check URL parameters for direct join link: ?room=FGR-XXXX
  useEffect(() => {
    if (isOpen) {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam && tab !== 'IN_ROOM') {
        setRoomCodeInput(roomParam.toUpperCase());
        setTab('JOIN');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateRoom = () => {
    setErrorMsg(null);
    socketManager.createRoom({
      targetWins,
      enableHazards,
      expertMode,
      racerCount: maxPlayers
    }, maxPlayers);
  };

  const handleJoinRoom = (codeToJoin?: string) => {
    const code = (codeToJoin || roomCodeInput).trim().toUpperCase();
    if (!code) {
      setErrorMsg('Masukkan kode room terlebih dahulu.');
      return;
    }
    setErrorMsg(null);
    socketManager.joinRoom(code);
  };

  const handleLeaveRoom = () => {
    socketManager.leaveRoom();
    setActiveRoom(null);
    setTab('CREATE');
    fetchPublicRooms();
  };

  const handleToggleReady = () => {
    socketManager.toggleReady();
    sound.playBellRing();
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopied(true);
    sound.playBellRing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (!activeRoom) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${activeRoom.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playBellRing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    if (!activeRoom || activeRoom.players.length < 2) return;
    sound.playBellRing();
    onStartOnlineMatch(activeRoom, isHost);
    onClose();
  };

  const hostPlayer = activeRoom?.players?.find((p: any) => p.role === 'HOST') || activeRoom?.players?.[0];
  const guestPlayer = activeRoom?.players?.find((p: any) => p.role === 'GUEST') || activeRoom?.players?.[1];

  const myPlayerState = activeRoom?.players?.find((p: any) => p.userId === currentUser.id);
  const isReady = myPlayerState?.isReady ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Main Bareng Teman <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">ONLINE</span>
              </h2>
              <p className="text-xs text-zinc-400">Balapan Fixed Gear taktis 1v1 secara live dengan temanmu!</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Only when not in an active room) */}
        {tab !== 'IN_ROOM' && (
          <div className="px-6 pt-4 flex gap-2 border-b border-zinc-850 pb-3">
            <button
              onClick={() => { setTab('CREATE'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'CREATE'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Room (Host)</span>
            </button>

            <button
              onClick={() => { setTab('JOIN'); setErrorMsg(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tab === 'JOIN'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Gabung Room Teman</span>
            </button>
          </div>
        )}

        {/* Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB: CREATE ROOM */}
          {tab === 'CREATE' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-4">
                <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-amber-400" /> Aturan Pertandingan
                </h3>

                {/* Kapasitas Pembalap / Arena Capacity */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 flex items-center justify-between mb-1.5">
                    <span>🚴 Kapasitas Pembalap di Arena:</span>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {maxPlayers === 4 ? '🔥 RAME (4 Pembalap)' : maxPlayers === 3 ? '⚡ TRIO (3 Pembalap)' : 'DUEL 1v1'}
                    </span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 2, label: '2 Pembalap', sub: 'Duel 1v1' },
                      { val: 3, label: '3 Pembalap', sub: 'Trio Sprint' },
                      { val: 4, label: '4 Pembalap', sub: 'Peloton GP' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setMaxPlayers(opt.val)}
                        className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center ${
                          maxPlayers === opt.val
                            ? 'bg-gradient-to-tr from-amber-400 to-orange-500 text-black border-amber-400 shadow-sm font-black'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`text-[9px] ${maxPlayers === opt.val ? 'text-black/80' : 'text-zinc-500'}`}>
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Wins */}
                <div>
                  <label className="text-xs font-bold text-zinc-400 block mb-1.5">
                    Target Kemenangan (Checkpoints):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 5, label: '5 Wins (Cepat)' },
                      { val: 7, label: '7 Wins (Standar)' },
                      { val: 10, label: '10 Wins (Resmi)' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => setTargetWins(opt.val)}
                        className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          targetWins === opt.val
                            ? 'bg-amber-400 text-black border-amber-400 shadow-sm'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hazards Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block">Extra Event & Hazards</span>
                    <span className="text-[10px] text-zinc-500">Jalan rusak, hujan licin, dan kondisi ekstra</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableHazards(!enableHazards)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      enableHazards ? 'bg-amber-400' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                        enableHazards ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Expert Mode Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                  <div>
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Mode Pakar (Grand Deck 50)
                    </span>
                    <span className="text-[10px] text-zinc-500">Maks 4 kartu tangan, biaya -1⚡ untuk refill kartu</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpertMode(!expertMode)}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      expertMode ? 'bg-red-500' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                        expertMode ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Room & Dapatkan Kode Balap</span>
              </button>
            </div>
          )}

          {/* TAB: JOIN ROOM */}
          {tab === 'JOIN' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-3">
                <label className="text-xs font-bold text-zinc-300 block">
                  Masukkan Kode Room Teman:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="contoh: FGR-4892"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm tracking-wider text-amber-400 font-bold uppercase focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleJoinRoom()}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Gabung</span>
                  </button>
                </div>
              </div>

              {/* Public Open Rooms List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-zinc-400 uppercase">
                    Room Terbuka Lainnya:
                  </span>
                  <button
                    onClick={fetchPublicRooms}
                    disabled={refreshingRooms}
                    className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${refreshingRooms ? 'animate-spin' : ''}`} />
                    <span>Segarkan</span>
                  </button>
                </div>

                {publicRooms.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                    Belum ada room publik yang terbuka. Jadilah yang pertama membuat room!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {publicRooms.map((room) => (
                      <div
                        key={room.roomCode}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm">
                            🚴
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>Room {room.roomCode}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">oleh {room.hostName}</span>
                            </div>
                            <div className="text-[10px] text-amber-400 font-mono">
                              Target {room.targetWins} Kemenangan {room.expertMode ? '• Pakar' : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleJoinRoom(room.roomCode)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-black text-xs font-bold text-zinc-200 transition-all cursor-pointer"
                        >
                          Masuk
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: IN_ROOM (LOBBY VIEW) */}
          {tab === 'IN_ROOM' && activeRoom && (
            <div className="space-y-5">
              {/* Room Code Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Kode Room Balapan:</span>
                  <span className="text-2xl font-mono font-black text-amber-400 tracking-wider">
                    {activeRoom.roomCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Salin Kode Room"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>

                  <button
                    onClick={handleCopyShareLink}
                    className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Salin Tautan Langsung"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan Link</span>
                  </button>
                </div>
              </div>

              {/* Match Rules Pill */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
                <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  🎯 Target: <strong className="text-white">{activeRoom.settings?.targetWins} Wins</strong>
                </span>
                <span className="bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  ⚠️ Hazards: <strong className="text-white">{activeRoom.settings?.enableHazards ? 'Aktif' : 'Nonaktif'}</strong>
                </span>
                {activeRoom.settings?.expertMode && (
                  <span className="bg-red-500/10 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-bold">
                    🔥 Mode Pakar
                  </span>
                )}
              </div>

              {/* Dynamic Players Grid (Supports 2, 3, or 4 Players) */}
              {(() => {
                const roomMax = activeRoom.maxPlayers || 4;
                const allSlots = Array.from({ length: roomMax }).map((_, index) => {
                  const p = activeRoom.players[index];
                  return {
                    index,
                    player: p,
                    roleTitle: index === 0 ? 'HOST / P1 (BIRU)' : index === 1 ? 'P2 (MERAH)' : index === 2 ? 'P3 (KUNING)' : 'P4 (HIJAU)',
                    colorBadge: index === 0 
                      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' 
                      : index === 1 
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
                      : index === 2 
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                    avatarBg: index === 0 
                      ? 'from-cyan-500 to-blue-600' 
                      : index === 1 
                      ? 'from-rose-500 to-pink-600' 
                      : index === 2 
                      ? 'from-amber-500 to-orange-600' 
                      : 'from-emerald-500 to-teal-600'
                  };
                });

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allSlots.map((slot) => {
                      const p = slot.player;
                      return (
                        <div 
                          key={slot.index} 
                          className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center relative overflow-hidden"
                        >
                          <span className={`absolute top-2.5 left-3 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${slot.colorBadge}`}>
                            {slot.roleTitle}
                          </span>

                          {p ? (
                            <>
                              <div className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${slot.avatarBg} flex items-center justify-center text-2xl mb-1.5 mt-2 shadow-md overflow-hidden border border-white/20`}>
                                {p.customPhoto ? (
                                  <img 
                                    src={p.customPhoto} 
                                    alt={p.nickname} 
                                    className="w-full h-full object-cover rounded-2xl" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  AVATAR_PRESETS.find(a => a.id === p.avatar)?.icon || (slot.index === 0 ? '⚡' : '🚴')
                                )}
                              </div>

                              <h4 className="font-black text-white text-xs sm:text-sm truncate max-w-full">
                                {p.nickname}
                              </h4>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {p.userId === currentUser.id ? '(Kamu)' : slot.index === 0 ? 'Host Room' : `Pembalap ${slot.index + 1}`}
                              </span>

                              <div className="mt-2.5">
                                {slot.index === 0 || p.isReady ? (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Sudah Siap
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                                    Menunggu Siap...
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="py-4 flex flex-col items-center justify-center w-full">
                              <div className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600 mb-1.5 animate-pulse">
                                <Users className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-zinc-400 mb-0.5">
                                Slot {slot.index + 1} Kosong
                              </span>
                              <span className="text-[10px] text-zinc-600 max-w-[170px] leading-tight">
                                Kirim kode <strong className="text-amber-400">{activeRoom.roomCode}</strong> ke teman
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Lobby Action Controls */}
              <div className="space-y-2 pt-2">
                {isHost ? (
                  (() => {
                    const joined = activeRoom.players || [];
                    const guests = joined.slice(1);
                    const allGuestsReady = guests.length > 0 && guests.every((p: any) => p.isReady);
                    const canStart = joined.length >= 2 && allGuestsReady;

                    return (
                      <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={!canStart}
                        className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          canStart
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-xl shadow-amber-500/25 hover:scale-[1.02]'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {joined.length < 2 
                            ? 'Menunggu Pembalap Bergabung (Min 2)...' 
                            : !allGuestsReady 
                              ? 'Menunggu Semua Pembalap Menekan Siap...' 
                              : `MULAI BALAPAN ONLINE (${joined.length} PEMBALAP)!`}
                        </span>
                      </button>
                    );
                  })()
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleReady}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isReady
                        ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 hover:bg-zinc-700'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{isReady ? 'Batalkan Siap' : 'Saya Sudah Siap! (Ready)'}</span>
                  </button>
                )}

                <div className="flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors py-1 cursor-pointer"
                  >
                    Tinggalkan Room
                  </button>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Real-time WebSocket Sync • 0ms Delay
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
