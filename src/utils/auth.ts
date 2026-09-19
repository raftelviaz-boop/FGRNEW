import { UserProfile } from '../types';

const TOKEN_KEY = 'fgr_auth_token';
const GUEST_KEY = 'fgr_guest_user';

export const AVATAR_PRESETS = [
  {
    id: 'SPRINTER',
    title: 'Sprinter Velocity',
    subtitle: 'Spesialis Datar & Kecepatan Tinggi',
    icon: '⚡',
    gradient: 'from-amber-500 to-orange-600',
    border: 'border-amber-400'
  },
  {
    id: 'CLIMBER',
    title: 'Mountain King',
    subtitle: 'Raja Tanjakan & Gradien Curam',
    icon: '⛰️',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400'
  },
  {
    id: 'CRITERIUM',
    title: 'Crit Cornering Ace',
    subtitle: 'Lincah Tikungan & Chicanes',
    icon: '🏁',
    gradient: 'from-blue-500 to-indigo-600',
    border: 'border-blue-400'
  },
  {
    id: 'ALLEYCAT',
    title: 'Urban Messenger',
    subtitle: 'Alleycat Survivor & Skids Legend',
    icon: '📦',
    gradient: 'from-purple-500 to-pink-600',
    border: 'border-purple-400'
  },
  {
    id: 'TRACKLOCROSS',
    title: 'Tracklocross Rover',
    subtitle: 'Tanah, Kerikil & Medan Kasar',
    icon: '🚵',
    gradient: 'from-amber-600 to-yellow-700',
    border: 'border-yellow-500'
  },
  {
    id: 'VELODROME',
    title: 'Pista Masters',
    subtitle: 'Aero Tucked Track Champion',
    icon: '🚴',
    gradient: 'from-red-500 to-rose-600',
    border: 'border-red-400'
  }
];

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    // Check if guest user saved in localStorage
    const savedGuest = localStorage.getItem(GUEST_KEY);
    if (savedGuest) {
      try {
        return JSON.parse(savedGuest);
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      return data.user;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
  } catch (err) {
    console.warn('Could not verify token online:', err);
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.removeItem(GUEST_KEY);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Gagal login' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi server gagal' };
  }
}

export async function registerUser(
  username: string, 
  password: string, 
  nickname: string, 
  avatar: string,
  customPhoto?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, nickname, avatar, customPhoto })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.removeItem(GUEST_KEY);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Gagal mendaftar' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi server gagal' };
  }
}

export async function loginAsGuest(
  nickname: string, 
  avatar: string,
  customPhoto?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  try {
    const res = await fetch('/api/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, avatar, customPhoto })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(GUEST_KEY, JSON.stringify(data.user));
      return { success: true, user: data.user };
    }
    
    // Fallback if offline
    const fallbackUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      username: 'guest',
      nickname: nickname || 'Rider Tamu',
      avatar: avatar || 'SPRINTER',
      customPhoto: customPhoto || undefined,
      friendCode: 'FGR-' + Math.floor(1000 + Math.random() * 9000),
      isGuest: true,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        winStreak: 0,
        bestStreak: 0,
        checkpointsWon: 0
      },
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(fallbackUser));
    return { success: true, user: fallbackUser };
  } catch {
    const fallbackUser: UserProfile = {
      id: 'guest_' + Math.random().toString(36).substring(2, 8),
      username: 'guest',
      nickname: nickname || 'Rider Tamu',
      avatar: avatar || 'SPRINTER',
      customPhoto: customPhoto || undefined,
      friendCode: 'FGR-' + Math.floor(1000 + Math.random() * 9000),
      isGuest: true,
      stats: {
        matchesPlayed: 0,
        matchesWon: 0,
        winStreak: 0,
        bestStreak: 0,
        checkpointsWon: 0
      },
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(fallbackUser));
    return { success: true, user: fallbackUser };
  }
}

export async function updateUserProfile(updates: {
  nickname?: string;
  avatar?: string;
  customPhoto?: string | null;
}): Promise<UserProfile | null> {
  const token = localStorage.getItem(TOKEN_KEY);

  // Update server if authenticated
  if (token) {
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (e) {
      console.warn('Failed to update profile on server, applying locally:', e);
    }
  }

  // Update local guest storage if present
  const savedGuest = localStorage.getItem(GUEST_KEY);
  if (savedGuest) {
    try {
      const guest: UserProfile = JSON.parse(savedGuest);
      if (updates.nickname !== undefined) guest.nickname = updates.nickname;
      if (updates.avatar !== undefined) guest.avatar = updates.avatar;
      if (updates.customPhoto !== undefined) {
        guest.customPhoto = updates.customPhoto || undefined;
      }
      localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
      return guest;
    } catch {
      return null;
    }
  }

  return null;
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(GUEST_KEY);
}

export async function recordMatchResult(won: boolean, checkpoints: number): Promise<UserProfile | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    // Update local guest stats if present
    const saved = localStorage.getItem(GUEST_KEY);
    if (saved) {
      try {
        const u: UserProfile = JSON.parse(saved);
        u.stats.matchesPlayed += 1;
        u.stats.checkpointsWon += checkpoints;
        if (won) {
          u.stats.matchesWon += 1;
          u.stats.winStreak += 1;
          if (u.stats.winStreak > u.stats.bestStreak) u.stats.bestStreak = u.stats.winStreak;
        } else {
          u.stats.winStreak = 0;
        }
        localStorage.setItem(GUEST_KEY, JSON.stringify(u));
        return u;
      } catch {
        return null;
      }
    }
    return null;
  }

  try {
    const res = await fetch('/api/auth/record-match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ won, checkpoints })
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    console.error('Error recording match result:', err);
  }
  return null;
}
