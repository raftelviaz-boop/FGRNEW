export type CardType = 
  | 'RIDER'
  | 'BUILD_BIKE'
  | 'EVENT'
  | 'EXTRA_EVENT'
  | 'ITEM'
  | 'SKILL'
  | 'ULTIMATE';

// 4 Kategori Event Utama
export type TerrainCategory = 
  | 'TANJAKAN'   // Climbs / Hills
  | 'DATAR'      // Flat / Straight
  | 'TIKUNGAN'   // Corners / Chicanes / Technical
  | 'TURUNAN';   // Descents / Downhill

// 3 Jenis Rider Utama
export type RiderSpecialty = 
  | 'CLIMBER'    // Spesialis Tanjakan
  | 'SPRINTER'   // Spesialis Datar
  | 'HANDLER';   // Spesialis Tikungan

export interface RiderCard {
  id: string;
  type: 'RIDER';
  name: string;
  nickname: string;
  specialty: RiderSpecialty;
  basePower: number;
  favoredTerrain: TerrainCategory[];
  terrainBonus: number; // e.g. +3 on favored terrain
  abilityName: string;
  abilityDescription: string;
  quote?: string;
  avatarIcon: string;
  colorTheme: string;
}

// 3 Informasi Penting Sepeda: Komponen, Performance (4 Event), Ability
export interface BikeComponents {
  frameset: string;
  gearRatio: string;
  wheelset: string;
  handlebar: string;
}

export interface BikePerformance {
  tanjakan: number;
  datar: number;
  tikungan: number;
  turunan: number;
}

export interface BikeAbilityEffect {
  skillPointBonus?: number;       // e.g. +1 point jika aktifkan skill
  itemEnergyDiscount?: number;     // e.g. Diskon 1 Energy untuk item
  turunanBonus?: number;           // e.g. +2 point di Turunan
  ignoreRoadHazard?: boolean;      // e.g. Kebal hazard jalan rusak
  riderSynergyBonus?: number;      // e.g. +2 jika rider cocok
}

export interface BikeCard {
  id: string;
  type: 'BUILD_BIKE';
  name: string;
  // A. Komponen
  components: BikeComponents;
  // B. Performance 4 Event
  performance: BikePerformance;
  // C. Ability Sepeda
  abilityName: string;
  abilityDescription: string;
  abilityEffect?: BikeAbilityEffect;
  riderSynergy?: RiderSpecialty;
  colorTheme?: string;
}

// Kartu Event (Tanjakan, Datar, Tikungan, Turunan)
export interface EventCard {
  id: string;
  code: string; // e.g. "E-001"
  type: 'EVENT';
  title: string;
  location: string;
  category: TerrainCategory;
  description: string;
  flavor: string;
  specialRule?: string;
  multiplier?: number;
}

// Kartu Extra Event (Jalan Rusak, Penutupan Jalan, Pohon Tumbang, Tumpahan Oli, dll)
export interface HazardCard {
  id: string;
  code: string; // e.g. "H-01"
  type: 'EXTRA_EVENT';
  title: string;
  hazardType: 'JALAN_RUSAK' | 'PENUTUPAN_JALAN' | 'POHON_TUMBANG' | 'TUMPAHAN_OLI' | 'HUJAN_LICIN' | 'WEATHER' | 'ROAD' | 'CROWD' | 'PELOTON';
  description: string;
  effect: {
    affectedTerrain?: TerrainCategory;
    affectedSpecialty?: RiderSpecialty;
    pointDelta: number;
    description: string;
  };
}

// Kartu Aksi: Item (5), Skill (6), Ultimate (7)
export interface ActionCard {
  id: string;
  type: 'ITEM' | 'SKILL' | 'ULTIMATE';
  subType: 'ITEM' | 'SKILL' | 'ULTIMATE_ITEM' | 'ULTIMATE_SKILL';
  name: string;
  cost: number; // in Energy ⚡
  isUltimate: boolean;
  effectDescription: string;
  applyEffect: {
    pointBonus?: number;
    terrainBonusMap?: Partial<Record<TerrainCategory, number>>;
    energyDelta?: number;
    opponentPointReduction?: number;
    drawCards?: number;
    conditionalBehindBonus?: number;
    ignoreHazard?: boolean;
  };
  flavor?: string;
  colorTheme: string;
}

export type AnyCard = RiderCard | BikeCard | EventCard | HazardCard | ActionCard;

export interface PlayerState {
  id: string;
  name: string;
  avatar?: string;
  customPhoto?: string;
  isAi: boolean;
  aiPersonality?: 'AGGRESSIVE' | 'BALANCED' | 'CONSERVATIVE' | 'CLUTCH';
  wins: number; // Checkpoints earned (Goal: 10)
  energy: number; // Current ⚡
  maxEnergy: number;
  
  // Current round active picks
  selectedRider: RiderCard | null;
  selectedBike: BikeCard | null;
  
  // Tactical Hand (Skills, Items, Ultimates)
  tacticalHand: ActionCard[];
  playedActionsThisRound: ActionCard[];
  usedUltimateThisMatch: boolean;

  // Temporary Round Draft options
  riderDraftOptions: RiderCard[];
  bikeDraftOptions: BikeCard[];

  // Stats for match
  stats: {
    totalPointsScored: number;
    energySpent: number;
    skillsPlayed: number;
    itemsUsed: number;
    ultimatesUsed: number;
    cleanWins: number;
  };
}

export type RoundPhase = 
  | 'DRAFT_RIDER'   // Step 1: Draw 2 Riders -> Pick 1
  | 'DRAFT_BIKE'    // Step 2: Draw 2 Bikes -> Pick 1
  | 'EVENT_REVEAL'  // Step 3 & 4: Flip Event (+ optional Hazard / Extra Event), calculate Performance
  | 'ACTION_PHASE'  // Step 5: Play Skills / Items / Ultimates (Kartu Aksi)
  | 'ROUND_RESULT'  // Step 6: Compare Points, award trophy checkpoint
  | 'MATCH_OVER';   // Step 7: Check 10 wins

export interface RoundLog {
  roundNumber: number;
  event: EventCard;
  hazard?: HazardCard;
  p1: {
    rider: RiderCard;
    bike: BikeCard;
    actions: ActionCard[];
    basePoints: number;
    actionPoints: number;
    totalPoints: number;
  };
  p2: {
    rider: RiderCard;
    bike: BikeCard;
    actions: ActionCard[];
    basePoints: number;
    actionPoints: number;
    totalPoints: number;
  };
  winnerId: string | 'DRAW';
}

export interface GameSettings {
  targetWins: number; // default 10 (or 5, 7, 10, 15)
  startingEnergy: number; // default 3
  energyPerRound: number; // default 2
  maxEnergyCap: number; // default 10
  enableHazards: boolean; // default true
  soundEnabled: boolean;
  gameMode: 'PVE' | 'PVP_LOCAL' | 'PVP_ONLINE';
  expertMode: boolean; // Veteran Mode with Hand Refill strain, tighter hand limits & 50+ event deck
  racerCount: number; // 2, 3, or 4 racers in match
}

// User Profile & Authentication
export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatar: string; // rider avatar id
  customPhoto?: string; // custom uploaded photo data URL or URL
  friendCode: string; // e.g. "FGR-8291"
  isGuest?: boolean;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    winStreak: number;
    bestStreak: number;
    checkpointsWon: number;
  };
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

// Real-Time Online Multiplayer Types
export interface RoomPlayer {
  userId: string;
  nickname: string;
  avatar: string;
  customPhoto?: string;
  role: 'HOST' | 'GUEST';
  isReady: boolean;
  isConnected: boolean;
}

export interface OnlineRoom {
  roomCode: string;
  hostId: string;
  maxPlayers?: number;
  players: RoomPlayer[];
  settings: GameSettings;
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  currentRound: number;
  roundPhase: RoundPhase;
  currentEvent?: EventCard | null;
  currentHazard?: HazardCard | null;
  p1ReadyAction?: boolean;
  p2ReadyAction?: boolean;
  p1ReadyDraft?: boolean;
  p2ReadyDraft?: boolean;
  p1ReadyNextRound?: boolean;
  p2ReadyNextRound?: boolean;
  lastRoundResult?: {
    winner: 'P1' | 'P2' | 'P3' | 'P4' | 'DRAW';
    p1Points: number;
    p2Points: number;
    p3Points?: number;
    p4Points?: number;
    p1Actions: ActionCard[];
    p2Actions: ActionCard[];
    p3Actions?: ActionCard[];
    p4Actions?: ActionCard[];
    p1Breakdown: { base: number; bike: number; actions: number; total: number };
    p2Breakdown: { base: number; bike: number; actions: number; total: number };
    p3Breakdown?: { base: number; bike: number; actions: number; total: number };
    p4Breakdown?: { base: number; bike: number; actions: number; total: number };
  };
}

export interface EmoteTaunt {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  text: string;
  timestamp: number;
}

