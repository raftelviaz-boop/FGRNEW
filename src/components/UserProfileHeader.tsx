import React, { useState, useRef } from 'react';
import { 
  User, 
  Trophy, 
  Flame, 
  Copy, 
  Check, 
  LogOut, 
  Users, 
  ChevronDown,
  Camera,
  Trash2,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { AVATAR_PRESETS, updateUserProfile } from '../utils/auth';
import { compressAndCropProfilePhoto } from '../utils/imageCompressor';
import { sound } from '../audio/sound';

interface UserProfileHeaderProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenMultiplayer: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export function UserProfileHeader({ 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenMultiplayer,
  onUpdateUser 
}: UserProfileHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const avatarInfo = AVATAR_PRESETS.find(a => a.id === user?.avatar) || AVATAR_PRESETS[0];

  const getRankTitle = (wins: number) => {
    if (wins >= 25) return 'Legenda Keirin 🏆';
    if (wins >= 15) return 'Master Criterium 🏁';
    if (wins >= 8) return 'Alleycat Courier 📦';
    if (wins >= 3) return 'Cat 3 Track Racer ⚡';
    return 'Rookie Fixie Rider 🚴';
  };

  const handleCopyCode = () => {
    if (!user?.friendCode) return;
    navigator.clipboard.writeText(user.friendCode);
    setCopied(true);
    sound.playBellRing();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerUpload = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input agar bisa pilih file yang sama jika ingin ganti lagi
    e.target.value = '';

    setUploading(true);
    setUploadError(null);

    try {
      // Kompresi dan potong 1:1 persegi secara otomatis
      const compressedDataUrl = await compressAndCropProfilePhoto(file, 180);
      
      // Simpan ke storage dan server
      const updated = await updateUserProfile({ customPhoto: compressedDataUrl });
      
      if (updated) {
        sound.playBellRing();
        if (onUpdateUser) {
          onUpdateUser(updated);
        }
      }
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses gambar foto profil.');
      sound.playPedalRatchet();
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setUploadError(null);

    try {
      const updated = await updateUserProfile({ customPhoto: null });
      if (updated && onUpdateUser) {
        onUpdateUser(updated);
      }
      sound.playCardFlip();
    } catch (err: any) {
      setUploadError(err.message || 'Gagal menghapus foto profil.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenAuth}
          className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <User className="w-3.5 h-3.5 fill-black" />
          <span className="hidden xs:inline">Masuk</span>
          <span className="xs:hidden">Akun</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-1.5 sm:gap-2">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Quick Play with Friend Action Button */}
      <button
        onClick={onOpenMultiplayer}
        className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 shrink-0"
        title="Main Bareng Teman Online"
      >
        <Users className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden sm:inline">Mabar</span>
      </button>

      {/* Backdrop on mobile when dropdown is open */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden"
          onClick={() => setShowDropdown(false)}
        />
      )}

      {/* User Badge Dropdown Toggle */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left transition-colors cursor-pointer shrink-0"
          title={user.nickname}
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 relative bg-zinc-800">
            {user.customPhoto ? (
              <img
                src={user.customPhoto}
                alt={user.nickname}
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className={`w-full h-full rounded-lg bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-sm shadow-sm`}>
                {avatarInfo.icon}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-zinc-900" />
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-black text-white leading-tight flex items-center gap-1">
              {user.nickname}
              {user.isGuest && (
                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded font-mono font-normal">
                  Tamu
                </span>
              )}
            </span>
            <span className="text-[10px] text-amber-400 font-mono">
              {getRankTitle(user.stats.matchesWon)}
            </span>
          </div>

          <ChevronDown className="w-3 h-3 text-zinc-400 hidden xs:block" />
        </button>

        {/* Dropdown Menu (Optimized for both mobile and desktop) */}
        {showDropdown && (
          <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-72 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            {/* Header row with close button for mobile */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2 sm:hidden">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Profil Rider
              </span>
              <button
                onClick={() => setShowDropdown(false)}
                className="w-6 h-6 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>
            {/* Profile Card with Photo and Upload Trigger */}
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <div className="relative group shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-zinc-900 shadow-md flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                  ) : user.customPhoto ? (
                    <img
                      src={user.customPhoto}
                      alt={user.nickname}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-tr ${avatarInfo.gradient} flex items-center justify-center text-xl`}>
                      {avatarInfo.icon}
                    </div>
                  )}
                </div>

                {/* Quick Hover Camera Button to Change Photo */}
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer disabled:opacity-40"
                  title="Klik untuk ganti foto profil"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span className="text-[8px] font-bold text-amber-200 mt-0.5">Ubah</span>
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white truncate">{user.nickname}</div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">
                  {user.customPhoto ? 'Foto Profil Kustom' : avatarInfo.title}
                </div>
                <div className="text-[10px] text-amber-400 font-bold">{getRankTitle(user.stats.matchesWon)}</div>
              </div>
            </div>

            {/* Upload/Remove Custom Photo Actions */}
            <div className="py-2.5 border-b border-zinc-800 space-y-1.5">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={uploading}
                className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{user.customPhoto ? 'Ganti Foto Profil' : 'Unggah Foto Profil'}</span>
              </button>

              {user.customPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="w-full px-3 py-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-red-400 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus & Pakai Avatar Default</span>
                </button>
              )}

              {uploadError && (
                <p className="text-[10px] text-red-400 font-mono leading-tight px-1 text-center">
                  ⚠️ {uploadError}
                </p>
              )}
            </div>

            {/* Friend Code */}
            <div className="py-2.5 border-b border-zinc-800">
              <div className="text-[10px] font-mono text-zinc-400 uppercase mb-1">Friend Code Kamu:</div>
              <div className="flex items-center justify-between bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-xs font-mono font-black text-amber-400 tracking-wider">
                  {user.friendCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-zinc-400 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="py-2.5 border-b border-zinc-800 grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800/80">
                <div className="text-[10px] text-zinc-400 font-mono">Total Menang</div>
                <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {user.stats.matchesWon}
                </div>
              </div>
              <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800/80">
                <div className="text-[10px] text-zinc-400 font-mono">Win Streak</div>
                <div className="text-sm font-black text-red-400 flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" />
                  {user.stats.winStreak}x
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-1">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenMultiplayer();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-zinc-900 text-xs text-zinc-200 hover:text-white font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Buka Lobby Main Bareng</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onOpenAuth();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-zinc-900 text-xs text-zinc-200 hover:text-white font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Ganti Akun / Masuk Lain</span>
              </button>

              <button
                onClick={() => {
                  setShowDropdown(false);
                  onLogout();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-red-500/10 text-xs text-red-400 font-bold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
