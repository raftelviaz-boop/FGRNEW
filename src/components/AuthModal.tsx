import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Zap, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  Trophy, 
  Bike,
  Flame,
  ArrowRight,
  HelpCircle,
  Camera,
  Trash2,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS, loginUser, registerUser, loginAsGuest } from '../utils/auth';
import { compressAndCropProfilePhoto } from '../utils/imageCompressor';
import { sound } from '../audio/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'GUEST';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'LOGIN' }: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'GUEST'>(initialMode);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('SPRINTER');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setPhotoProcessing(true);
    setErrorMsg(null);
    try {
      const compressed = await compressAndCropProfilePhoto(file, 180);
      setCustomPhoto(compressed);
      sound.playBellRing();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses foto.');
    } finally {
      setPhotoProcessing(false);
    }
  };

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await loginUser(username, password);
    setLoading(false);

    if (res.success && res.user) {
      sound.playBellRing();
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Gagal login. Periksa username dan password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nickname.trim()) {
      setErrorMsg('Nickname Rider harus diisi.');
      return;
    }

    setLoading(true);
    const res = await registerUser(username, password, nickname, selectedAvatar, customPhoto || undefined);
    setLoading(false);

    if (res.success && res.user) {
      sound.playWinFanfare();
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Gagal mendaftar. Silakan coba username lain.');
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const chosenNick = nickname.trim() || `Rider${Math.floor(100 + Math.random() * 900)}`;
    const res = await loginAsGuest(chosenNick, selectedAvatar, customPhoto || undefined);
    setLoading(false);

    if (res.success && res.user) {
      sound.playBellRing();
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || 'Gagal masuk sebagai tamu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Bike className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              FGR RIDER PASSPORT
            </span>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight">
            {tab === 'LOGIN' && 'Masuk Akun Rider'}
            {tab === 'REGISTER' && 'Daftar Akun Rider Baru'}
            {tab === 'GUEST' && 'Masuk Kilat / Tamu'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {tab === 'LOGIN' && 'Masuk untuk sinkronisasi kemenangan & main bareng teman online.'}
            {tab === 'REGISTER' && 'Buat akun permanen untuk menyimpan statistik, piala & friend code.'}
            {tab === 'GUEST' && 'Pilih nama & avatar untuk langsung balapan dengan teman tanpa password.'}
          </p>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => { setTab('LOGIN'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'LOGIN' 
                  ? 'bg-amber-400 text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setTab('REGISTER'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'REGISTER' 
                  ? 'bg-amber-400 text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Daftar
            </button>
            <button
              type="button"
              onClick={() => { setTab('GUEST'); setErrorMsg(null); }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                tab === 'GUEST' 
                  ? 'bg-amber-400 text-black shadow-md' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Tamu Kilat
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {/* TAB 1: LOGIN */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Username:
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: fixiebomb"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Password:
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Memproses Masuk...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setTab('GUEST')}
                  className="text-xs text-zinc-400 hover:text-amber-400 transition-colors underline cursor-pointer"
                >
                  Atau masuk kilat tanpa password sebagai Tamu
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Nickname Rider (Ditampilkan ke Teman):
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="contoh: Keirin King"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Username:
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username unik"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                    Password:
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="minimal 4 huruf"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  Pilih Avatar & Persona Rider:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedAvatar === av.id
                          ? 'bg-zinc-800 border-amber-400 ring-1 ring-amber-400 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${av.gradient} flex items-center justify-center text-lg shadow-inner`}>
                        {av.icon}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 text-center truncate w-full">
                        {av.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Profile Photo Upload (Optional) */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Foto Profil Pribadi (Opsional):
                </label>
                <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-700 flex items-center justify-center shrink-0">
                    {photoProcessing ? (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    ) : customPhoto ? (
                      <img src={customPhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-200">
                      {customPhoto ? 'Foto Terpasang' : 'Tampilkan Wajah Asli Kamu'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {customPhoto ? 'Foto ini akan menggantikan avatar kartun' : 'Otomatis di-crop rapi persegi 1:1'}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoProcessing}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-amber-400 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{customPhoto ? 'Ganti Foto' : 'Pilih Foto'}</span>
                      </button>
                      {customPhoto && (
                        <button
                          type="button"
                          onClick={() => setCustomPhoto(null)}
                          className="text-[11px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Mendaftarkan Akun...' : 'Daftar & Langsung Main'}
                <Sparkles className="w-4 h-4 fill-black" />
              </button>
            </form>
          )}

          {/* TAB 3: GUEST LOGIN */}
          {tab === 'GUEST' && (
            <form onSubmit={handleGuestLogin} className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs leading-relaxed">
                🚀 <strong>Masuk Kilat:</strong> Cukup tentukan nama panggilan rider kamu. Kamu akan langsung mendapat Friend Code unik untuk main bareng teman seketika!
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Nama Panggilan Rider:
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="contoh: Tracklocrosser"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  Pilih Avatar Cadangan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      type="button"
                      key={av.id}
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedAvatar === av.id
                          ? 'bg-zinc-800 border-amber-400 ring-1 ring-amber-400 shadow-md'
                          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-tr ${av.gradient} flex items-center justify-center text-lg shadow-inner`}>
                        {av.icon}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-200 text-center truncate w-full">
                        {av.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Profile Photo Upload for Guest */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Foto Profil Kamu (Opsional):
                </label>
                <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-700 flex items-center justify-center shrink-0">
                    {photoProcessing ? (
                      <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                    ) : customPhoto ? (
                      <img src={customPhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-200">
                      {customPhoto ? 'Foto Terpasang' : 'Tampilkan Foto Kamu'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Muncul di atas rider saat bertanding & multiplayer
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoProcessing}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-bold text-amber-400 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{customPhoto ? 'Ganti Foto' : 'Pilih Foto'}</span>
                      </button>
                      {customPhoto && (
                        <button
                          type="button"
                          onClick={() => setCustomPhoto(null)}
                          className="text-[11px] text-zinc-500 hover:text-red-400 font-mono flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Menyiapkan Rider...' : 'Mulai Sebagai Tamu'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
