import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FastForward, 
  Sparkles, 
  AlertTriangle, 
  Trophy,
  Volume2,
  VolumeX,
  Radio,
  ChevronRight,
  Pause,
  Play,
  Flag,
  ArrowDownRight,
  TrendingUp,
  CornerDownRight,
  MoveRight,
  Zap,
  Gauge,
  CloudRain,
  Flame,
  Mountain,
  User
} from 'lucide-react';
import { 
  EventCard, 
  HazardCard, 
  PlayerState, 
  ActionCard,
  TerrainCategory
} from '../types';
import { TERRAIN_META } from '../utils/gameLogic';
import { sound } from '../audio/sound';
import { RiderOverheadProfile } from './RiderOverheadProfile';

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

export interface ExtraRacerData {
  playerKey: 'P3' | 'P4';
  player: PlayerState;
  base: number;
  bike: number;
  actions: ActionCard[];
  actionBonus: number;
  total: number;
}

type RacePhase = 
  | 'BASE_LAUNCH' 
  | 'BIKE_ACCEL' 
  | 'TACTICAL_BOOST' 
  | 'INTERVAL_BURST' 
  | 'FINAL_SPRINT' 
  | 'FINISH_LINE';

interface ComicFx {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

// Pre-generated deterministic confetti particles to eliminate 60fps frame re-render jitters
const STABLE_CONFETTI_PARTICLES = Array.from({ length: 28 }).map((_, i) => {
  const seedX = (i * 37 + 13) % 100;
  const startX = 42 + ((i * 23 + 7) % 16);
  const endX = 15 + seedX * 0.7;
  const endY = -30 + ((i * 43 + 19) % 140);
  const duration = 1.3 + ((i * 17) % 10) * 0.07;
  const color = ['#00f0ff', '#ff3355', '#fde047', '#a855f7', '#22c55e'][i % 5];
  return { id: i, startX, endX, endY, duration, color };
});

// Pre-generated deterministic heavy rain needle streaks for natural wind-slanted downpour
const STABLE_RAIN_DROPS = Array.from({ length: 45 }).map((_, i) => {
  const left = (i * 19 + 7) % 100;
  const top = -20 + ((i * 29) % 35);
  const length = 42 + ((i * 23) % 38); // 42px to 80px long rain streaks
  const opacity = 0.45 + ((i * 17) % 5) * 0.11; // 0.45 to 0.95
  const duration = 0.28 + ((i * 13) % 6) * 0.035; // 0.28s to 0.49s fast downpour
  const delay = ((i * 31) % 12) * 0.04;
  const thickness = i % 5 === 0 ? 2.2 : 1.4;
  return { id: i, left, top, length, opacity, duration, delay, thickness };
});

// Pre-generated deterministic ground puddle splash impacts & ripple rings across ALL road lanes
const STABLE_RAIN_SPLASHES = Array.from({ length: 38 }).map((_, i) => {
  const left = 2 + (i * 27 + 7) % 96; // across road 2% to 98%
  // Cover both upper lane, divider zone, and lower lane evenly across the entire road height
  const topPercent = 14 + ((i * 19 + 5) % 76); // 14% to 90% across full road surface height
  const duration = 0.38 + ((i * 17) % 5) * 0.05;
  const delay = ((i * 23) % 10) * 0.05;
  const scale = 0.7 + ((i * 11) % 5) * 0.15;
  return { id: i, left, topPercent, duration, delay, scale };
});

// Pre-generated deterministic road-wide tire spray plumes & puddle churning streams (full track coverage)
const STABLE_ROAD_TIRE_SPRAYS = Array.from({ length: 36 }).map((_, i) => {
  const left = (i * 29 + 5) % 100; // evenly spread horizontally 0% - 100%
  // Alternate between Lane 1 (Upper Lane: 18% to 46% from top) and Lane 2 (Lower Lane: 58% to 88% from top)
  const isUpperLane = i % 2 === 0;
  const topPercent = isUpperLane 
    ? 20 + ((i * 13) % 26) // 20% to 46%
    : 58 + ((i * 17) % 28); // 58% to 86%
  const width = 32 + ((i * 19) % 36); // 32px to 68px spray streak
  const height = 8 + ((i * 7) % 10);
  const opacity = 0.55 + ((i * 11) % 5) * 0.09;
  const duration = 0.32 + ((i * 13) % 5) * 0.05;
  const delay = ((i * 23) % 12) * 0.04;
  return { id: i, left, topPercent, width, height, opacity, duration, delay, isUpperLane };
});

// 2-Link Natural Inverse Kinematics for Anatomical Leg Flexion
function calculateLegIK(
  hipX: number, 
  hipY: number, 
  pedalX: number, 
  pedalY: number, 
  thighLen: number = 24.5, 
  shinLen: number = 23.5
) {
  const dx = pedalX - hipX;
  const dy = pedalY - hipY;
  const dist = Math.min(thighLen + shinLen - 0.5, Math.max(6, Math.sqrt(dx * dx + dy * dy)));
  
  const alpha = Math.atan2(dy, dx);
  const cosKnee = Math.max(-1, Math.min(1, (thighLen * thighLen + dist * dist - shinLen * shinLen) / (2 * thighLen * dist)));
  const beta = Math.acos(cosKnee);
  
  const kneeX = hipX + thighLen * Math.cos(alpha - beta);
  const kneeY = hipY + thighLen * Math.sin(alpha - beta);
  
  return { kneeX, kneeY };
}

// 2-Link Natural Inverse Kinematics for Realistic Arm Grip (Supple bend, no locking pops)
function calculateArmIK(
  shoulderX: number, 
  shoulderY: number,
  handX: number, 
  handY: number,
  upperArmLen: number = 17.5, 
  forearmLen: number = 16.5
) {
  const dx = handX - shoulderX;
  const dy = handY - shoulderY;
  const dist = Math.min(upperArmLen + forearmLen - 0.5, Math.max(4, Math.sqrt(dx * dx + dy * dy)));
  
  const alpha = Math.atan2(dy, dx);
  const cosElbow = Math.max(-1, Math.min(1, (upperArmLen * upperArmLen + dist * dist - forearmLen * forearmLen) / (2 * upperArmLen * dist)));
  const beta = Math.acos(cosElbow);
  
  const elbowX = shoulderX + upperArmLen * Math.cos(alpha + beta);
  const elbowY = shoulderY + upperArmLen * Math.sin(alpha + beta);
  
  return { elbowX, elbowY };
}

// 2D Flat Vector Stylized Pro Cyclist with Dramatic Lighting, Trails & Particles
const StylizedVectorRider: React.FC<{
  playerKey: 'P1' | 'P2' | 'P3' | 'P4';
  name: string;
  score: number;
  color: 'cyan' | 'rose' | 'amber' | 'emerald';
  wheelAngle: number;
  isInterval: boolean;
  isSprinting: boolean;
  isVictory: boolean;
  isDefeat: boolean;
  isLeader: boolean;
  terrain: TerrainCategory;
  hasAura: boolean;
  hasSpecial: boolean;
  isRaining?: boolean;
}> = ({
  playerKey,
  name,
  score,
  color,
  wheelAngle,
  isInterval,
  isSprinting,
  isVictory,
  isDefeat,
  isLeader,
  terrain,
  hasAura,
  hasSpecial,
  isRaining = false
}) => {
  const rad = (wheelAngle * Math.PI) / 180;

  // Geometry Coordinates
  const rearHubX = 26;
  const rearHubY = 56;
  
  const frontHubX = 106;
  const frontHubY = 56;

  const bbX = 64;
  const bbY = 58;
  const crankR = 8.5;

  // Pedals
  const p1x = bbX + crankR * Math.cos(rad);
  const p1y = bbY + crankR * Math.sin(rad);
  const p2x = bbX - crankR * Math.cos(rad);
  const p2y = bbY - crankR * Math.sin(rad);

  // Bike Cockpit
  const seatClampX = 48;
  const seatClampY = 32;

  const stemClampX = 92;
  const stemClampY = 26;

  const barDropX = 98;
  const barDropY = 35;

  const cadenceSway = Math.sin(rad);
  const cadenceBounce = Math.cos(rad * 2);

  // Posture & Kinematics Calculation (Bike stays steady, rider body sways dynamically)
  const isStanding = (isInterval || isSprinting) && !isVictory && !isDefeat;
  
  let hipX = seatClampX - 1;
  let hipY = seatClampY - 5;
  let shoulderX = 74;
  let shoulderY = 19;
  let headX = shoulderX + 11;
  let headY = shoulderY - 8;
  let handHoldX = barDropX;
  let handHoldY = barDropY;

  if (isVictory) {
    // Upright victory pose (Lepas Stang / Hands-off salute)
    hipX = seatClampX - 2;
    hipY = seatClampY - 8;
    shoulderX = 60;
    shoulderY = 6;
    headX = shoulderX + 3;
    headY = shoulderY - 10;
    handHoldX = 74;
    handHoldY = -10;
  } else if (isDefeat) {
    // Defeat / Exhausted slump (Menunduk lemas)
    hipX = seatClampX - 2;
    hipY = seatClampY - 4;
    shoulderX = 80;
    shoulderY = 25;
    headX = shoulderX + 8;
    headY = shoulderY + 2;
    handHoldX = barDropX;
    handHoldY = barDropY;
  } else if (isStanding) {
    // Explosive out-of-saddle sprint / interval:
    // Bike frame remains steady on asphalt, while rider pumps torso, hips, and arms rhythmically
    hipX = seatClampX + 6 + cadenceSway * 2.2;
    hipY = seatClampY - 10 + cadenceBounce * 1.8;
    shoulderX = 77 + cadenceSway * 2.8;
    shoulderY = 15 + cadenceBounce * 1.8;
    headX = shoulderX + 11 + cadenceSway * 1.2;
    headY = shoulderY - 8;
    handHoldX = barDropX;
    handHoldY = barDropY;
  } else {
    // Smooth seated aero rhythm
    hipX = seatClampX - 1;
    hipY = seatClampY - 5 + cadenceBounce * 0.5;
    shoulderX = 74 + cadenceSway * 0.6;
    shoulderY = 19 + cadenceBounce * 0.5;
    headX = shoulderX + 11;
    headY = shoulderY - 8;
    handHoldX = barDropX;
    handHoldY = barDropY;
  }

  // Terrain-specific posture bias
  if (terrain === 'TANJAKAN' && !isVictory && !isDefeat) {
    // Forward-leaning climbing torque stance
    shoulderX += 2;
    shoulderY += 1;
    headX += 2;
  } else if (terrain === 'TURUNAN' && !isVictory && !isDefeat) {
    // Deep aerodynamic super-tuck
    shoulderY += 2.5;
    headY += 3;
    hipY += 1;
  }

  const arm = calculateArmIK(shoulderX, shoulderY, handHoldX, handHoldY, 17.5, 16.5);
  const nearLeg = calculateLegIK(hipX, hipY, p1x, p1y, 24.5, 23.5);
  const farLeg = calculateLegIK(hipX, hipY, p2x, p2y, 24.5, 23.5);

  const nearShoeAngle = Math.sin(rad - 0.4) * 22;
  const farShoeAngle = Math.sin(rad + Math.PI - 0.4) * 22;

  const THEME_PALETTES: Record<string, { main: string; dark: string; accent: string; rim: string; glow: string; visor: string }> = {
    cyan: { main: '#00e5ff', dark: '#0088cc', accent: '#38bdf8', rim: '#00f0ff', glow: 'rgba(0,240,255,0.4)', visor: '#0284c7' },
    rose: { main: '#ff3355', dark: '#cc1133', accent: '#fb7185', rim: '#ff3355', glow: 'rgba(255,51,85,0.4)', visor: '#e11d48' },
    amber: { main: '#f59e0b', dark: '#b45309', accent: '#fbbf24', rim: '#f59e0b', glow: 'rgba(245,158,11,0.4)', visor: '#d97706' },
    emerald: { main: '#10b981', dark: '#047857', accent: '#34d399', rim: '#10b981', glow: 'rgba(16,185,129,0.4)', visor: '#059669' }
  };
  const theme = THEME_PALETTES[color] || THEME_PALETTES.cyan;

  const jerseyColor = theme.main;
  const jerseyDark = theme.dark;
  const jerseyAccent = theme.accent;
  const rimDecalColor = theme.rim;
  const skinColor = '#fed7aa';
  const skinShadow = '#fcd34d';

  // Pitch angle for the bike relative to terrain
  const bikePitch = terrain === 'TANJAKAN' ? -4.5 : terrain === 'TURUNAN' ? 4.5 : terrain === 'TIKUNGAN' ? -1.5 : 0;

  return (
    <div 
      className="relative flex flex-col items-center select-none overflow-visible transition-transform duration-700 ease-out"
      style={{ transform: `rotate(${bikePitch}deg)` }}
    >
      {/* Defeat Exhaustion Effect */}
      {isDefeat && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute -top-6 z-30 pointer-events-none"
        >
          <span className="text-base">💦</span>
        </motion.div>
      )}

      {/* SVG Canvas for Track Bike & Rider */}
      <div className="relative w-36 sm:w-52 h-28 sm:h-38 flex items-center justify-center overflow-visible">
        
        {/* Kinetic Motion Blur Echoes / Ghosting Trail (Optimized lightweight) */}
        {isStanding && (
          <div 
            className="absolute -left-6 top-1/2 -translate-y-1/2 w-32 h-14 opacity-25 rounded-full pointer-events-none blur-sm"
            style={{ backgroundColor: jerseyColor }}
          />
        )}

        {/* Explosive Action / Boost Electric Flame Aura (Optimized) */}
        {(hasAura || isInterval) && (
          <div
            className="absolute -inset-2 rounded-full pointer-events-none blur-sm animate-pulse"
            style={{ 
              background: `radial-gradient(ellipse at center, ${theme.glow} 0%, rgba(0,0,0,0.15) 60%, transparent 80%)`
            }}
          />
        )}

        <svg 
          viewBox="0 -22 140 106" 
          className="w-full h-full overflow-visible drop-shadow-md"
        >
          <defs>
            <linearGradient id={`frame-grad-${playerKey}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={jerseyColor} />
              <stop offset="60%" stopColor={jerseyAccent} />
              <stop offset="100%" stopColor={jerseyDark} />
            </linearGradient>
            
            <linearGradient id={`aero-visor-${playerKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="50%" stopColor={theme.visor} />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            {/* Headlight Beam Linear Gradient */}
            <linearGradient id={`headlight-beam-${playerKey}`} x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="25%" stopColor={jerseyAccent} stopOpacity="0.55" />
              <stop offset="70%" stopColor={theme.visor} stopOpacity="0.18" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Rear Taillight Flare Gradient */}
            <radialGradient id={`taillight-glow-${playerKey}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff0044" stopOpacity="1" />
              <stop offset="40%" stopColor="#ff0033" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ff0033" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* =========================================================
              FORWARD HIGH-INTENSITY LED HEADLIGHT BEAM
             ========================================================= */}
          {!isVictory && !isDefeat && (
            <g className="pointer-events-none">
              {/* Volumetric Light Cone on the Road Ahead */}
              <polygon 
                points={`${barDropX},${barDropY - 2} ${barDropX + 115},${barDropY - 16} ${barDropX + 125},${barDropY + 48} ${barDropX + 4},${barDropY + 2}`} 
                fill={`url(#headlight-beam-${playerKey})`} 
                opacity="0.8"
              />
              {/* Central Light Bulb Source */}
              <circle cx={barDropX + 2} cy={barDropY} r="3" fill="#ffffff" />
              <circle cx={barDropX + 2} cy={barDropY} r="6" fill={color === 'cyan' ? '#00f0ff' : '#ffffff'} opacity="0.65" />
            </g>
          )}

          {/* =========================================================
              REAR PULSING AERO TAILLIGHT
             ========================================================= */}
          <g className="pointer-events-none">
            <circle cx={seatClampX - 5} cy={seatClampY - 3} r="7" fill={`url(#taillight-glow-${playerKey})`} />
            <circle cx={seatClampX - 5} cy={seatClampY - 3} r="2.2" fill="#ff0044" />
            {/* Speed Light Trail from Taillight */}
            {isStanding && (
              <line 
                x1={seatClampX - 5} 
                y1={seatClampY - 3} 
                x2={seatClampX - 32} 
                y2={seatClampY - 3} 
                stroke="#ff0044" 
                strokeWidth="2" 
                strokeOpacity="0.7" 
                strokeLinecap="round" 
              />
            )}
          </g>

          {/* =========================================================
              TIRE SMOKE & GROUND FRICTION PARTICLES (REAR WHEEL)
             ========================================================= */}
          {!isRaining && (isInterval || isSprinting) && (
            <g opacity="0.7" className="pointer-events-none">
              <circle cx={rearHubX - 14} cy={rearHubY + 18} r="3.5" fill="#cbd5e1" opacity="0.5" />
              <circle cx={rearHubX - 22} cy={rearHubY + 17} r="5" fill="#94a3b8" opacity="0.35" />
              <circle cx={rearHubX - 30} cy={rearHubY + 16} r="6.5" fill="#64748b" opacity="0.2" />
              {/* Sparkles */}
              <line x1={rearHubX - 6} y1={rearHubY + 18} x2={rearHubX - 16} y2={rearHubY + 16} stroke="#fde047" strokeWidth="1.5" />
              <line x1={rearHubX - 9} y1={rearHubY + 20} x2={rearHubX - 18} y2={rearHubY + 22} stroke="#fb923c" strokeWidth="1.5" />
            </g>
          )}

          {/* =========================================================
              DYNAMIC WET ASPHALT WATER ROOSTER TAIL & MIST SPRAY (RAIN HAZARD)
             ========================================================= */}
          {isRaining && (
            <g className="pointer-events-none">
              {/* Rear Wheel Multi-Tier High-Velocity Rooster Tail Spray */}
              <path 
                d={`M ${rearHubX - 4} ${rearHubY + 18} Q ${rearHubX - 22} ${rearHubY + 6} ${rearHubX - 52} ${rearHubY - 12}`} 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.85)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="8 4"
              />
              <path 
                d={`M ${rearHubX - 6} ${rearHubY + 19} Q ${rearHubX - 28} ${rearHubY + 12} ${rearHubX - 60} ${rearHubY + 2}`} 
                fill="none" 
                stroke="rgba(125, 211, 252, 0.75)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
              />
              <path 
                d={`M ${rearHubX - 2} ${rearHubY + 17} Q ${rearHubX - 16} ${rearHubY + 2} ${rearHubX - 38} ${rearHubY - 18}`} 
                fill="none" 
                stroke="rgba(186, 230, 253, 0.7)" 
                strokeWidth="2.4" 
                strokeLinecap="round" 
                strokeDasharray="5 3"
              />
              <path 
                d={`M ${rearHubX - 8} ${rearHubY + 20} Q ${rearHubX - 32} ${rearHubY + 20} ${rearHubX - 68} ${rearHubY + 16}`} 
                fill="none" 
                stroke="rgba(224, 242, 254, 0.6)" 
                strokeWidth="2.8" 
                strokeLinecap="round" 
              />
              
              {/* Fine Vapor Water Plume Cloud behind rear tire */}
              <ellipse 
                cx={rearHubX - 34} 
                cy={rearHubY + 8} 
                rx="24" 
                ry="12" 
                fill="rgba(56, 189, 248, 0.18)" 
              />
              
              {/* Sprayed Flying Droplets (Wide Trajectory Dispersal) */}
              <circle cx={rearHubX - 14} cy={rearHubY + 14} r="2.2" fill="#7dd3fc" opacity="0.95" />
              <circle cx={rearHubX - 24} cy={rearHubY + 8} r="2.6" fill="#38bdf8" opacity="0.9" />
              <circle cx={rearHubX - 35} cy={rearHubY - 2} r="3" fill="#bae6fd" opacity="0.85" />
              <circle cx={rearHubX - 46} cy={rearHubY - 10} r="2.4" fill="#e0f2fe" opacity="0.75" />
              <circle cx={rearHubX - 56} cy={rearHubY + 2} r="2.2" fill="#7dd3fc" opacity="0.7" />
              <circle cx={rearHubX - 65} cy={rearHubY + 14} r="2" fill="#38bdf8" opacity="0.6" />

              {/* Front Wheel Water Slicing Spray (Forward & Rearward Deflection) */}
              <path 
                d={`M ${frontHubX + 8} ${frontHubY + 19} Q ${frontHubX + 22} ${frontHubY + 18} ${frontHubX + 32} ${frontHubY + 14}`} 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.8)" 
                strokeWidth="2.8" 
                strokeLinecap="round" 
              />
              <path 
                d={`M ${frontHubX - 4} ${frontHubY + 18} Q ${frontHubX - 16} ${frontHubY + 12} ${frontHubX - 26} ${frontHubY + 8}`} 
                fill="none" 
                stroke="rgba(186, 230, 253, 0.65)" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeDasharray="4 2"
              />
              <circle cx={frontHubX + 28} cy={frontHubY + 15} r="2" fill="#bae6fd" opacity="0.9" />
              <circle cx={frontHubX - 20} cy={frontHubY + 9} r="1.8" fill="#7dd3fc" opacity="0.8" />

              {/* Under-Frame Water Churn (Between Wheels & BB) */}
              <path 
                d={`M ${bbX - 14} ${bbY + 18} Q ${bbX} ${bbY + 14} ${bbX + 16} ${bbY + 18}`} 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.45)" 
                strokeWidth="3.5" 
                strokeDasharray="4 3"
              />
            </g>
          )}

          {/* =========================================================
              REAR WHEEL (DEEP CARBON DISC/AERO RIM WITH ROTATING DECAL)
             ========================================================= */}
          <g transform={`rotate(${wheelAngle} ${rearHubX} ${rearHubY})`}>
            {/* Outer Tire */}
            <circle cx={rearHubX} cy={rearHubY} r="20" stroke="#05070d" strokeWidth="4.8" fill="#111827" />
            {/* Deep Carbon Rim */}
            <circle cx={rearHubX} cy={rearHubY} r="17.5" stroke="#1e293b" strokeWidth="4" fill="#0b0f19" />
            {/* Vibrant Team Rim Neon Decal */}
            <circle 
              cx={rearHubX} 
              cy={rearHubY} 
              r="15.5" 
              stroke={rimDecalColor} 
              strokeWidth="2.5" 
              fill="none" 
              strokeDasharray="30 65" 
              strokeLinecap="round" 
            />
            {/* 6 Aero Bladed Spokes */}
            {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
              <line
                key={idx}
                x1={rearHubX}
                y1={rearHubY}
                x2={rearHubX + 16 * Math.cos((angle * Math.PI) / 180)}
                y2={rearHubY + 16 * Math.sin((angle * Math.PI) / 180)}
                stroke="#64748b"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}
            {/* Disc Brake Rotor */}
            <circle cx={rearHubX} cy={rearHubY} r="7" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
            {/* Center Axle Hub */}
            <circle cx={rearHubX} cy={rearHubY} r="4.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
          </g>

          {/* =========================================================
              FRONT WHEEL (DEEP CARBON DISC/AERO RIM WITH ROTATING DECAL)
             ========================================================= */}
          <g transform={`rotate(${wheelAngle} ${frontHubX} ${frontHubY})`}>
            {/* Outer Tire */}
            <circle cx={frontHubX} cy={frontHubY} r="20" stroke="#05070d" strokeWidth="4.8" fill="#111827" />
            {/* Deep Carbon Rim */}
            <circle cx={frontHubX} cy={frontHubY} r="17.5" stroke="#1e293b" strokeWidth="4" fill="#0b0f19" />
            {/* Vibrant Team Rim Neon Decal */}
            <circle 
              cx={frontHubX} 
              cy={frontHubY} 
              r="15.5" 
              stroke={rimDecalColor} 
              strokeWidth="2.5" 
              fill="none" 
              strokeDasharray="30 65" 
              strokeLinecap="round" 
            />
            {/* 6 Aero Bladed Spokes */}
            {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
              <line
                key={idx}
                x1={frontHubX}
                y1={frontHubY}
                x2={frontHubX + 16 * Math.cos((angle * Math.PI) / 180)}
                y2={frontHubY + 16 * Math.sin((angle * Math.PI) / 180)}
                stroke="#64748b"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ))}
            {/* Disc Brake Rotor */}
            <circle cx={frontHubX} cy={frontHubY} r="7" fill="#1e293b" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
            {/* Center Axle Hub */}
            <circle cx={frontHubX} cy={frontHubY} r="4.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.2" />
          </g>

          {/* =========================================================
              CARBON BIKE FRAME (AERODYNAMIC MONOCOQUE TUBES)
             ========================================================= */}
          {/* Chainstay */}
          <line x1={rearHubX} y1={rearHubY} x2={bbX} y2={bbY} stroke={`url(#frame-grad-${playerKey})`} strokeWidth="5.5" strokeLinecap="round" />
          {/* Seatstay */}
          <line x1={rearHubX} y1={rearHubY} x2={seatClampX} y2={seatClampY} stroke={`url(#frame-grad-${playerKey})`} strokeWidth="4.8" strokeLinecap="round" />
          {/* Aero Seat Tube (Hugging rear tire) */}
          <line x1={bbX} y1={bbY} x2={seatClampX} y2={seatClampY} stroke={`url(#frame-grad-${playerKey})`} strokeWidth="6.5" strokeLinecap="round" />
          {/* Beefy Aero Downtube */}
          <line x1={bbX} y1={bbY} x2={stemClampX} y2={stemClampY} stroke={`url(#frame-grad-${playerKey})`} strokeWidth="7.5" strokeLinecap="round" />
          {/* Top Tube */}
          <line x1={seatClampX} y1={seatClampY} x2={stemClampX} y2={stemClampY} stroke={`url(#frame-grad-${playerKey})`} strokeWidth="5.5" strokeLinecap="round" />
          {/* Front Carbon Fork */}
          <line x1={stemClampX} y1={stemClampY} x2={frontHubX} y2={frontHubY} stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
          {/* Fork Team Accent Stripe */}
          <line x1={frontHubX - 4} y1={frontHubY - 8} x2={frontHubX - 1} y2={frontHubY - 2} stroke={jerseyColor} strokeWidth="2.5" strokeLinecap="round" />

          {/* Drivetrain: Large Chainring & Chain Links */}
          <circle cx={bbX} cy={bbY} r="7.5" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          <circle cx={bbX} cy={bbY} r="3.5" fill="#0f172a" />
          {/* Top Chain Line */}
          <line x1={rearHubX} y1={rearHubY - 3} x2={bbX} y2={bbY - 5.5} stroke="#cbd5e1" strokeWidth="1.6" strokeDasharray="3 1.5" />
          {/* Bottom Chain Line */}
          <line x1={rearHubX} y1={rearHubY + 3} x2={bbX} y2={bbY + 5.5} stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="3 1.5" />

          {/* Saddle & Aero Seatpost */}
          <line x1={seatClampX} y1={seatClampY} x2={seatClampX - 2} y2={seatClampY - 7} stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          {/* Ergonomic Road Saddle with cutout */}
          <path 
            d={`M ${seatClampX - 9} ${seatClampY - 8} L ${seatClampX + 7} ${seatClampY - 7} Q ${seatClampX + 9} ${seatClampY - 5} ${seatClampX + 5} ${seatClampY - 6}`} 
            fill="#090d16" 
            stroke="#1e293b"
            strokeWidth="1"
          />

          {/* Integrated Stem & Aero Drop Handlebars */}
          <line x1={stemClampX} y1={stemClampY} x2={stemClampX + 6} y2={stemClampY - 2} stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          {/* Handlebar Drops with Team Accent Bar Tape */}
          <path 
            d={`M ${stemClampX + 6} ${stemClampY - 2} L ${stemClampX + 9} ${stemClampY - 2} Q ${stemClampX + 14} ${stemClampY - 2} ${stemClampX + 12} ${stemClampY + 7} L ${barDropX} ${barDropY}`} 
            fill="none" 
            stroke="#0f172a" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Team Bar Tape Accent */}
          <path 
            d={`M ${stemClampX + 10} ${stemClampY + 1} L ${stemClampX + 12} ${stemClampY + 6}`} 
            stroke={jerseyColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />

          {/* =========================================================
              FAR ARM & FAR LEG (IN BACKGROUND LAYER)
             ========================================================= */}
          {isVictory && (
            <g opacity="0.85">
              <path 
                d={`M ${shoulderX} ${shoulderY} L ${shoulderX - 2} -5 L 46 -14`} 
                fill="none" 
                stroke={skinShadow} 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <circle cx="46" cy="-14" r="3.5" fill="#0f172a" />
            </g>
          )}

          {/* FAR LEG */}
          <g opacity="0.65">
            {/* Far Crank Arm & Pedal */}
            <line x1={bbX} y1={bbY} x2={p2x} y2={p2y} stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx={p2x} cy={p2y} r="2.8" fill="#94a3b8" />
            
            {/* Far Bib Shorts & Thigh */}
            <line x1={hipX} y1={hipY} x2={farLeg.kneeX} y2={farLeg.kneeY} stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            
            {/* Far Shin & Sock */}
            <line x1={farLeg.kneeX} y1={farLeg.kneeY} x2={p2x} y2={p2y} stroke={skinShadow} strokeWidth="5" strokeLinecap="round" />
            {/* Far Sock */}
            <line x1={farLeg.kneeX * 0.4 + p2x * 0.6} y1={farLeg.kneeY * 0.4 + p2y * 0.6} x2={p2x} y2={p2y} stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
            
            {/* Far Shoe */}
            <g transform={`rotate(${farShoeAngle} ${p2x} ${p2y})`}>
              <path d={`M ${p2x - 5} ${p2y - 2} L ${p2x + 7} ${p2y} L ${p2x + 5} ${p2y + 4} L ${p2x - 4} ${p2y + 3} Z`} fill="#090d16" />
            </g>
          </g>

          {/* =========================================================
              COMPLETE PRO CYCLING JERSEY & TORSO
             ========================================================= */}
          {/* Base Jersey Body Curve */}
          <path 
            d={`M ${hipX} ${hipY} Q ${(hipX + shoulderX) / 2} ${(hipY + shoulderY) / 2 - (isVictory ? 1 : isDefeat ? 6 : 5)} ${shoulderX} ${shoulderY}`} 
            fill="none" 
            stroke={jerseyColor} 
            strokeWidth="9.5" 
            strokeLinecap="round" 
          />

          {/* Team Side Aero Vent Mesh Panels */}
          <path 
            d={`M ${hipX} ${hipY} Q ${(hipX + shoulderX) / 2} ${(hipY + shoulderY) / 2 - (isVictory ? 1 : isDefeat ? 6 : 5)} ${shoulderX - 2} ${shoulderY + 1}`} 
            fill="none" 
            stroke={jerseyDark} 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* Clean White Dynamic Racing Stripe & Chest Chevron */}
          <path 
            d={`M ${hipX + 3} ${hipY - 2.5} Q ${(hipX + shoulderX) / 2} ${(hipY + shoulderY) / 2 - (isVictory ? 2 : isDefeat ? 7 : 6.5)} ${shoulderX - 3} ${shoulderY - 0.5}`} 
            fill="none" 
            stroke="#ffffff" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />

          {/* Pro Jersey Zipper Seam */}
          <path 
            d={`M ${hipX + 5} ${hipY - 3} Q ${(hipX + shoulderX) / 2 + 1} ${(hipY + shoulderY) / 2 - (isVictory ? 2.5 : isDefeat ? 7.5 : 7)} ${shoulderX - 1} ${shoulderY - 1}`} 
            fill="none" 
            stroke="#090d16" 
            strokeWidth="0.9" 
            strokeDasharray="2 1" 
          />

          {/* Race Number Bib Badge on Lower Back (Nomor Punggung Pro) */}
          <g transform={`translate(${hipX - 1}, ${hipY - 4}) rotate(${isStanding ? -12 : -5})`}>
            {/* White Number Card */}
            <rect x="-3" y="-3" width="7" height="5.5" rx="1" fill="#ffffff" stroke="#090d16" strokeWidth="0.6" />
            {/* Player Number Text */}
            <text x="0.5" y="1" fontSize="3.8" fontFamily="monospace" fontWeight="900" textAnchor="middle" fill="#090d16">
              {playerKey === 'P1' ? '01' : '02'}
            </text>
          </g>

          {/* Jersey High Collar */}
          <path 
            d={`M ${shoulderX - 1} ${shoulderY - 2} L ${shoulderX + 3} ${shoulderY - 3}`} 
            stroke={jerseyDark} 
            strokeWidth="3" 
            strokeLinecap="round" 
          />

          {/* =========================================================
              RIDER HEAD & AERODYNAMIC PRO HELMET WITH VISOR
             ========================================================= */}
          {/* Athlete Face & Neck */}
          <circle cx={headX} cy={headY} r="7.8" fill={skinColor} />
          
          <g transform={`rotate(${isDefeat ? 24 : isVictory ? -15 : 0} ${headX} ${headY})`}>
            {/* Aero TT/Road Helmet Shell in Team Jersey Color */}
            <path 
              d={`M ${headX - 12} ${headY + 1} Q ${headX - 9} ${headY - 11} ${headX + 4} ${headY - 10} Q ${headX + 12} ${headY - 8} ${headX + 10} ${headY + 2} L ${headX - 2} ${headY + 1} Z`} 
              fill={jerseyColor} 
              stroke="#0f172a" 
              strokeWidth="1.2" 
            />

            {/* Helmet Front Aero Air Vent */}
            <path 
              d={`M ${headX - 6} ${headY - 8} Q ${headX} ${headY - 7} ${headX + 5} ${headY - 6}`} 
              fill="none" 
              stroke="#090d16" 
              strokeWidth="1.4" 
              strokeLinecap="round" 
            />
            {/* Helmet Team Contrast Accent Fin */}
            <path 
              d={`M ${headX - 11} ${headY - 2} Q ${headX - 4} ${headY - 7} ${headX + 8} ${headY - 6}`} 
              fill="none" 
              stroke="#ffffff" 
              strokeWidth="1.2" 
            />

            {/* Mirrored Chromatic Visor */}
            <path 
              d={`M ${headX + 1} ${headY - 2} Q ${headX + 9} ${headY - 1} ${headX + 8} ${headY + 4} L ${headX + 3} ${headY + 3} Z`} 
              fill={`url(#aero-visor-${playerKey})`} 
              stroke="#0f172a" 
              strokeWidth="0.9" 
            />
          </g>

          {/* =========================================================
              ARMS, SLEEVES & CYCLING GLOVES
             ========================================================= */}
          {isVictory ? (
            <g>
              {/* Victory Right Arm Salute */}
              <path 
                d={`M ${shoulderX} ${shoulderY} L ${shoulderX + 6} -4 L ${handHoldX} ${handHoldY}`} 
                fill="none" 
                stroke={skinColor} 
                strokeWidth="5.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Jersey Sleeve on Upper Arm */}
              <path 
                d={`M ${shoulderX} ${shoulderY} L ${shoulderX + 3} ${shoulderY - 4}`} 
                stroke={jerseyColor} 
                strokeWidth="6.5" 
                strokeLinecap="round" 
              />
              {/* White Compression Sleeve Cuff */}
              <path 
                d={`M ${shoulderX + 2} ${shoulderY - 3} L ${shoulderX + 3} ${shoulderY - 5}`} 
                stroke="#ffffff" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
              />
              {/* Cycling Glove Mitt */}
              <circle cx={handHoldX} cy={handHoldY} r="3.8" fill="#090d16" stroke={jerseyColor} strokeWidth="1" />
            </g>
          ) : (
            <g>
              {/* Arm IK Stem */}
              <path 
                d={`M ${shoulderX} ${shoulderY} L ${arm.elbowX} ${arm.elbowY} L ${handHoldX} ${handHoldY}`} 
                fill="none" 
                stroke={skinColor} 
                strokeWidth="5.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Jersey Sleeve on Bicep */}
              <path 
                d={`M ${shoulderX} ${shoulderY} L ${(shoulderX * 2 + arm.elbowX) / 3} ${(shoulderY * 2 + arm.elbowY) / 3}`} 
                stroke={jerseyColor} 
                strokeWidth="6.8" 
                strokeLinecap="round" 
              />
              {/* Sleeve Compression Cuff (White/Accent band) */}
              <path 
                d={`M ${(shoulderX + arm.elbowX) / 2 - 1} ${(shoulderY + arm.elbowY) / 2} L ${(shoulderX + arm.elbowX) / 2 + 1} ${(shoulderY + arm.elbowY) / 2 + 1}`} 
                stroke="#ffffff" 
                strokeWidth="6.5" 
                strokeLinecap="round" 
              />
              {/* Pro Cycling Padded Glove on Bar Drop */}
              <circle cx={handHoldX} cy={handHoldY} r="3.5" fill="#090d16" stroke={jerseyColor} strokeWidth="1" />
            </g>
          )}

          {/* =========================================================
              NEAR LEG: PRO BIB SHORTS, SOCKS & ROAD SHOES WITH CLEATS
             ========================================================= */}
          {/* Near Crank Arm */}
          <line x1={bbX} y1={bbY} x2={p1x} y2={p1y} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
          <circle cx={p1x} cy={p1y} r="2.8" fill="#f8fafc" />

          {/* Pro Bib Shorts (Matte Lycra) */}
          <line x1={hipX} y1={hipY} x2={nearLeg.kneeX} y2={nearLeg.kneeY} stroke="#0b0f19" strokeWidth="6.5" strokeLinecap="round" />
          {/* Team Colored Bib Side Stripe */}
          <line 
            x1={hipX + 1} 
            y1={hipY} 
            x2={nearLeg.kneeX * 0.75 + hipX * 0.25} 
            y2={nearLeg.kneeY * 0.75 + hipY * 0.25} 
            stroke={jerseyColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
          />
          {/* Silicone Leg Gripper Band above Knee */}
          <line 
            x1={nearLeg.kneeX * 0.85 + hipX * 0.15} 
            y1={nearLeg.kneeY * 0.85 + hipY * 0.15} 
            x2={nearLeg.kneeX * 0.95 + hipX * 0.05} 
            y2={nearLeg.kneeY * 0.95 + hipY * 0.05} 
            stroke="#ffffff" 
            strokeWidth="6" 
            strokeLinecap="round" 
          />

          {/* Muscular Calf & Shin */}
          <line x1={nearLeg.kneeX} y1={nearLeg.kneeY} x2={p1x} y2={p1y} stroke={skinColor} strokeWidth="5.2" strokeLinecap="round" />

          {/* Tall Aero White Cycling Sock with Team Stripe */}
          <line 
            x1={nearLeg.kneeX * 0.35 + p1x * 0.65} 
            y1={nearLeg.kneeY * 0.35 + p1y * 0.65} 
            x2={p1x} 
            y2={p1y} 
            stroke="#ffffff" 
            strokeWidth="4.8" 
            strokeLinecap="round" 
          />
          {/* Sock Team Stripe Cuff */}
          <line 
            x1={nearLeg.kneeX * 0.35 + p1x * 0.65} 
            y1={nearLeg.kneeY * 0.35 + p1y * 0.65} 
            x2={nearLeg.kneeX * 0.30 + p1x * 0.70} 
            y2={nearLeg.kneeY * 0.30 + p1y * 0.70} 
            stroke={jerseyColor} 
            strokeWidth="4.8" 
            strokeLinecap="round" 
          />
          
          {/* Stiff Carbon Road Shoe with Dual BOA Dials */}
          <g transform={`rotate(${nearShoeAngle} ${p1x} ${p1y})`}>
            {/* Shoe Sole & Carbon Body */}
            <path 
              d={`M ${p1x - 7} ${p1y - 2.5} L ${p1x + 8} ${p1y} L ${p1x + 6} ${p1y + 4.5} L ${p1x - 6} ${p1y + 3.5} Z`} 
              fill="#090d16" 
              stroke="#1e293b"
              strokeWidth="0.8"
            />
            {/* Team Color Accent on Heel */}
            <path d={`M ${p1x - 7} ${p1y - 2} L ${p1x - 4} ${p1y - 1} L ${p1x - 5} ${p1y + 3} Z`} fill={jerseyColor} />
            {/* White BOA Ratchet Dials */}
            <circle cx={p1x + 1} cy={p1y - 1.5} r="1.2" fill="#ffffff" stroke="#090d16" strokeWidth="0.5" />
            <circle cx={p1x + 4} cy={p1y - 0.5} r="1.2" fill="#ffffff" stroke="#090d16" strokeWidth="0.5" />
            {/* Cleat under pedal */}
            <rect x={p1x - 2} y={p1y + 3.5} width="4" height="1.8" fill="#eab308" rx="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
};

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
  extraRacers = []
}) => {
  const [phase, setPhase] = useState<RacePhase>('BASE_LAUNCH');
  const [isFastForward, setIsFastForward] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(!sound.enabled);
  const [activeActionP1, setActiveActionP1] = useState<ActionCard | null>(null);
  const [activeActionP2, setActiveActionP2] = useState<ActionCard | null>(null);
  const [photoFlash, setPhotoFlash] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [comicPopups, setComicPopups] = useState<ComicFx[]>([]);
  const [showEventPopup, setShowEventPopup] = useState<boolean>(true);
  const [showRiderProfiles, setShowRiderProfiles] = useState<boolean>(true);

  // Progressive live scores during animation
  const [p1DisplayScore, setP1DisplayScore] = useState<number>(p1Base);
  const [p2DisplayScore, setP2DisplayScore] = useState<number>(p2Base);
  const [extraDisplayScores, setExtraDisplayScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    extraRacers.forEach(r => {
      initial[r.playerKey] = r.base;
    });
    return initial;
  });

  const racersList = [
    {
      playerKey: 'P1' as const,
      player: player1,
      color: 'cyan' as const,
      base: p1Base,
      bike: p1Bike,
      actions: p1Actions,
      actionBonus: p1ActionBonus,
      total: p1Total
    },
    {
      playerKey: 'P2' as const,
      player: player2,
      color: 'rose' as const,
      base: p2Base,
      bike: p2Bike,
      actions: p2Actions,
      actionBonus: p2ActionBonus,
      total: p2Total
    },
    ...(extraRacers.map((r, idx) => ({
      playerKey: r.playerKey,
      player: r.player,
      color: (idx === 0 ? 'amber' : 'emerald') as 'amber' | 'emerald',
      base: r.base,
      bike: r.bike,
      actions: r.actions,
      actionBonus: r.actionBonus,
      total: r.total
    })))
  ];
  const totalRacers = racersList.length;

  // Auto-dismiss event popup after a brief moment (so it doesn't obstruct visual race viewing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEventPopup(false);
    }, isFastForward ? 1600 : 2800);
    return () => clearTimeout(timer);
  }, [isFastForward]);

  // Voice Narrator Commentary State
  const [isVoiceNarratorEnabled, setIsVoiceNarratorEnabled] = useState<boolean>(true);
  const [narratorSubtitle, setNarratorSubtitle] = useState<string>(
    `Ronde ${currentRound} dimulai! Medan ${TERRAIN_META[event.category]?.label || 'Datar'}${hazard ? ` dengan rintangan ${hazard.title}` : ''}!`
  );

  // Parallax Scrolling Track Offset
  const [trackScrollX, setTrackScrollX] = useState<number>(0);

  const meta = TERRAIN_META[event.category];
  const speedMult = isFastForward ? 0.5 : 1.0;

  // Smooth wheel rotation state - initialized in active drive angle so riders are pedaling immediately
  const [wheelAngle, setWheelAngle] = useState(48);

  const isInterval = phase === 'INTERVAL_BURST';
  const isSprint = phase === 'FINAL_SPRINT' || phase === 'INTERVAL_BURST' || phase === 'TACTICAL_BOOST';

  const isRainHazard = Boolean(
    hazard && (
      hazard.hazardType === 'HUJAN_LICIN' || 
      hazard.hazardType === 'WEATHER' || 
      hazard.title.toLowerCase().includes('hujan') ||
      hazard.title.toLowerCase().includes('rain')
    )
  );

  // Helper to trigger voice commentary and smoothly proceed to the next action ONLY AFTER speech finishes
  const announceCommentary = (
    text: string, 
    rate: number = 1.15,
    onFinished?: () => void
  ) => {
    setNarratorSubtitle(text);
    const adjustedRate = isFastForward ? Math.min(1.8, rate * 1.35) : rate;
    
    let callbackCalled = false;
    const triggerNext = () => {
      if (!callbackCalled) {
        callbackCalled = true;
        if (onFinished) {
          // Natural conversational pause after finishing sentence before transitioning action
          const beatMs = isFastForward ? 120 : 320;
          setTimeout(onFinished, beatMs);
        }
      }
    };

    if (isVoiceNarratorEnabled && sound.enabled && sound.voiceEnabled) {
      // Voice synthesis is active: strictly wait for utterance completion callback
      sound.speak(text, adjustedRate, 1.05, () => {
        triggerNext();
      });
    } else {
      // If voice narration is disabled/muted: allocate natural reading duration based on word count
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      const readingDurationMs = isFastForward 
        ? Math.max(750, Math.min(2000, wordCount * 110)) 
        : Math.max(2200, Math.min(5000, wordCount * 220 + 600));
      
      setTimeout(triggerNext, readingDurationMs);
    }
  };

  // Keyboard Shortcuts Listener for Smooth Pro Interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused(p => {
          if (!p) sound.cancelSpeech();
          return !p;
        });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFastForward(ff => {
          sound.cancelSpeech();
          return !ff;
        });
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const nextMute = !isSoundMuted;
        sound.enabled = !nextMute;
        setIsSoundMuted(nextMute);
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setIsVoiceNarratorEnabled(v => {
          const nextV = !v;
          sound.voiceEnabled = nextV;
          if (!nextV) sound.cancelSpeech();
          return nextV;
        });
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setShowRiderProfiles(p => !p);
      } else if (e.key === 'Enter' || e.key === 'Escape' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        sound.cancelSpeech();
        onFinishAnimation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSoundMuted, onFinishAnimation]);

  // High-performance animation frame loop (lightweight, optimized render pipeline)
  useEffect(() => {
    if (isPaused) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const updateFrame = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;

      let speedFactor = isFastForward ? 1.45 : 1.0;
      if (event.category === 'TANJAKAN') speedFactor *= 0.92;
      if (event.category === 'TURUNAN') speedFactor *= 1.3;
      if (hazard) speedFactor *= 0.94;

      // Natural, brisk and energetic pedaling cadence (RPM) across all race phases
      let baseWheelSpeed = 880; // Energetic natural pro cruising cadence (~146 RPM)
      if (phase === 'BASE_LAUNCH') baseWheelSpeed = 920; // Immediate active acceleration from start
      if (phase === 'BIKE_ACCEL') baseWheelSpeed = 1040; // Shifting up gears (~173 RPM)
      if (phase === 'TACTICAL_BOOST') baseWheelSpeed = 1180; // Tactical power surge (~196 RPM)
      if (phase === 'FINAL_SPRINT') baseWheelSpeed = 1360; // Explosive high-rev sprint (~226 RPM)
      if (phase === 'INTERVAL_BURST') baseWheelSpeed = 1620; // Standing attack cadence (~270 RPM)
      if (phase === 'FINISH_LINE') baseWheelSpeed = 520; // Smooth finish rollout

      const wheelSpeed = baseWheelSpeed * speedFactor;
      const trackSpeed = (isInterval ? 700 : isSprint ? 520 : 360) * speedFactor;

      setWheelAngle(prev => (prev + wheelSpeed * delta) % 360);
      setTrackScrollX(prev => (prev + trackSpeed * delta) % 4800);

      animationFrameId = requestAnimationFrame(updateFrame);
    };

    animationFrameId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, isSprint, isInterval, isPaused, isFastForward, event.category, hazard]);

  const triggerComicFx = (text: string, x: number, y: number, color: string) => {
    const id = Date.now() + Math.random();
    setComicPopups(prev => [...prev.slice(-3), { id, text, x, y, color }]);
    setTimeout(() => {
      setComicPopups(prev => prev.filter(item => item.id !== id));
    }, 900);
  };

  useEffect(() => {
    return () => {
      sound.cancelSpeech();
    };
  }, []);

  // Main Race Animation Sequence Controller with Terrain Sound Variations
  useEffect(() => {
    if (isPaused) return;
    let active = true;

    if (phase === 'BASE_LAUNCH') {
      sound.playSprintBurst();
      sound.playPedalRatchet();
      
      // Immersive Terrain Sound FX on Launch
      sound.playTerrainSound(event.category, false);
      if (isRainHazard) {
        sound.playRainDownpour(3.5);
        sound.playThunderRumble();
        sound.playWetTireSpray();
      }

      setP1DisplayScore(p1Base);
      setP2DisplayScore(p2Base);

      if (event.category === 'TANJAKAN') {
        triggerComicFx('CLIMB ATTACK! ⛰️ 😤', 50, 30, '#f59e0b');
      } else if (event.category === 'TURUNAN') {
        triggerComicFx('SUPER TUCK! ⚡ 💨', 50, 30, '#06b6d4');
      } else if (event.category === 'TIKUNGAN') {
        triggerComicFx('APEX DRIFT! 🌀 🔥', 50, 30, '#ec4899');
      } else {
        triggerComicFx('GO! 🏁 ⚡', 50, 30, '#f59e0b');
      }

      let launchText = `Ronde ${currentRound} dimulai di medan ${meta.label}!`;
      if (hazard) {
        launchText += ` Awas! Terdapat rintangan ${hazard.title}!`;
      } else if (event.category === 'TANJAKAN') {
        launchText += ` Tanjakan terjal menguras tenaga, kayuhan terasa berat!`;
      } else if (event.category === 'TURUNAN') {
        launchText += ` Turunan curam meluncur cepat membelah desiran angin!`;
      } else {
        launchText += ` ${player1.name} dan ${player2.name} langsung tancap gas memacu sepeda!`;
      }

      announceCommentary(launchText, 1.18, () => {
        if (active && !isPaused) {
          sound.playWhoosh();
          setPhase('BIKE_ACCEL');
        }
      });

      return () => {
        active = false;
      };
    } 
    
    if (phase === 'BIKE_ACCEL') {
      sound.playPedalRatchet();

      // Terrain sound nuance during gear acceleration
      if (event.category === 'TURUNAN') {
        sound.playDownhillWind(0.7);
      } else if (event.category === 'TANJAKAN') {
        sound.playHeavyBreathingClimb(1);
      } else if (event.category === 'TIKUNGAN') {
        sound.playTireCornering();
      } else {
        sound.playAeroPacelineHum();
      }

      setP1DisplayScore(p1Base + p1Bike);
      setP2DisplayScore(p2Base + p2Bike);
      extraRacers.forEach(r => {
        setExtraDisplayScores(prev => ({ ...prev, [r.playerKey]: r.base + r.bike }));
      });

      triggerComicFx('GEAR POWER! ⚙️', 50, 35, '#38bdf8');
      triggerComicFx('CADENCE! ⚡', 65, 65, '#ff1e56');

      const hasActions = p1Actions.length > 0 || p2Actions.length > 0 || extraRacers.some(r => r.actions.length > 0);
      const accelText = totalRacers > 2
        ? `Akselerasi gear sepeda multi-peloton! ${totalRacers} pembalap beradu kecepatan!`
        : `Akselerasi gear sepeda! ${player1.name} ${p1Bike} PWR melawan ${player2.name} ${p2Bike} PWR!`;

      announceCommentary(accelText, 1.18, () => {
        if (active && !isPaused) {
          if (hasActions) {
            setPhase('TACTICAL_BOOST');
          } else {
            setPhase('INTERVAL_BURST');
          }
        }
      });

      return () => {
        active = false;
      };
    } 
    
    if (phase === 'TACTICAL_BOOST') {
      sound.playEnergyZap();
      if (p1Actions.length > 0) {
        setActiveActionP1(p1Actions[0]);
        triggerComicFx(`${p1Actions[0].name.toUpperCase()}! ⚡`, 30, 25, '#38bdf8');
      }
      if (p2Actions.length > 0) {
        setActiveActionP2(p2Actions[0]);
        triggerComicFx(`${p2Actions[0].name.toUpperCase()}! 🔥`, 70, 25, '#f43f5e');
      }
      extraRacers.forEach((r, idx) => {
        if (r.actions.length > 0) {
          triggerComicFx(`${r.actions[0].name.toUpperCase()}! 💥`, 50 + (idx === 0 ? -15 : 15), 40, idx === 0 ? '#f59e0b' : '#10b981');
        }
      });

      let tacticalText = 'Kartu aksi taktik diaktifkan!';
      if (totalRacers > 2) {
        tacticalText = 'Para pembalap mengaktifkan kartu taktik andalan di arena balap!';
      } else if (p1Actions.length > 0 && p2Actions.length > 0) {
        tacticalText = `Duel kartu taktik! ${player1.name} memainkan ${p1Actions[0].name}, dibalas ${player2.name} dengan ${p2Actions[0].name}!`;
      } else if (p1Actions.length > 0) {
        tacticalText = `${player1.name} melancarkan strategi kartu aksi ${p1Actions[0].name}!`;
      } else if (p2Actions.length > 0) {
        tacticalText = `${player2.name} melancarkan strategi kartu aksi ${p2Actions[0].name}!`;
      }

      setP1DisplayScore(p1Total);
      setP2DisplayScore(p2Total);
      extraRacers.forEach(r => {
        setExtraDisplayScores(prev => ({ ...prev, [r.playerKey]: r.total }));
      });

      announceCommentary(tacticalText, 1.22, () => {
        if (active && !isPaused) {
          sound.playSprintBurst();
          sound.playSkidDrift();
          setPhase('INTERVAL_BURST');
        }
      });

      return () => {
        active = false;
      };
    } 
    
    if (phase === 'INTERVAL_BURST') {
      sound.playSprintBurst();
      
      // Intense Terrain Sound immersion on Interval Burst!
      sound.playTerrainSound(event.category, true);
      if (isRainHazard) {
        sound.playWetTireSpray();
        sound.playRainDownpour(2.8);
      } else if (hazard) {
        sound.playSkidDrift();
      }

      setScreenShake(true);

      if (event.category === 'TANJAKAN') {
        triggerComicFx('😤 HUFF-PUFF! (Napas Berat)', 50, 20, '#f59e0b');
        triggerComicFx('1200 WATTS CLIMB! ⛰️', 50, 75, '#ef4444');
      } else if (event.category === 'TURUNAN') {
        triggerComicFx('💨 WHOOSH! (Deru Angin)', 50, 20, '#06b6d4');
        triggerComicFx('85 KM/H DESCENT! ⚡', 50, 75, '#38bdf8');
      } else if (event.category === 'TIKUNGAN') {
        triggerComicFx('🔥 SQUEAL! (Grip Ban)', 50, 20, '#ec4899');
        triggerComicFx('HARD LEAN APEX! 🌀', 50, 75, '#f43f5e');
      } else {
        triggerComicFx('⚡ PACELINE! (Aero Hum)', 50, 20, '#ffb703');
        triggerComicFx('MAX CADENCE SPRINT! 🔥', 50, 75, '#ef4444');
      }

      const burstText = event.category === 'TANJAKAN'
        ? `Detik-detik puncak tanjakan! Napas memburu, para pembalap bangkit dari sadel menggenjot habis-habisan!`
        : event.category === 'TURUNAN'
        ? `Melesat kencang membelah angin turunan! Aero tuck maksimal menuju garis finis!`
        : `Detik-detik menuju garis finis! Mode sprint maksimal! Para pembalap bangkit dari sadel!`;

      announceCommentary(burstText, 1.22, () => {
        if (active && !isPaused) {
          setScreenShake(false);
          sound.playWhoosh();
          setPhase('FINAL_SPRINT');
        }
      });

      return () => {
        active = false;
      };
    } 
    
    if (phase === 'FINAL_SPRINT') {
      sound.playWhoosh();
      if (event.category === 'TURUNAN') {
        sound.playDownhillWind(0.9);
      } else if (event.category === 'TANJAKAN') {
        sound.playHeavyBreathingClimb(2);
      } else if (event.category === 'TIKUNGAN') {
        sound.playTireCornering();
      }

      setScreenShake(true);

      const racerNames = racersList.map(r => r.player.name).join(', ');
      const sprintText = `Mendekati garis finis! Adu sprint penentuan antara ${racerNames}!`;
      announceCommentary(sprintText, 1.22, () => {
        if (active && !isPaused) {
          setScreenShake(false);
          setPhotoFlash(true);
          sound.playCameraFlash();
          sound.playBellRing();
          setPhase('FINISH_LINE');
        }
      });

      return () => {
        active = false;
      };
    } 
    
    if (phase === 'FINISH_LINE') {
      const flashTimer = setTimeout(() => {
        if (!active) return;
        setPhotoFlash(false);
        if (winner === 'P1') {
          sound.playWinFanfare();
          announceCommentary(`Garis finis terlewati! ${player1.name} memenangkan ronde dengan gaya selebrasi lepas stang!`, 1.2);
        } else if (winner === 'P2') {
          sound.playLossTone();
          announceCommentary(`Garis finis terlewati! ${player2.name} berhasil merebut kemenangan ronde!`, 1.2);
        } else if (winner === 'P3' && extraRacers[0]) {
          sound.playLossTone();
          announceCommentary(`Garis finis terlewati! ${extraRacers[0].player.name} berhasil merebut kemenangan ronde!`, 1.2);
        } else if (winner === 'P4' && extraRacers[1]) {
          sound.playLossTone();
          announceCommentary(`Garis finis terlewati! ${extraRacers[1].player.name} berhasil merebut kemenangan ronde!`, 1.2);
        } else {
          sound.playBellRing();
          announceCommentary('Hasil foto finis sangat tipis! Ronde berakhir imbang!', 1.2);
        }
      }, 300);

      return () => {
        active = false;
        clearTimeout(flashTimer);
      };
    }
  }, [phase, isPaused, speedMult, p1Base, p1Bike, p1Total, p2Base, p2Bike, p2Total, p1Actions, p2Actions, winner, hazard, event.category, extraRacers]);

  const getRaceProgressPercent = () => {
    switch (phase) {
      case 'BASE_LAUNCH': return 22;
      case 'BIKE_ACCEL': return 46;
      case 'TACTICAL_BOOST': return 66;
      case 'INTERVAL_BURST': return 82;
      case 'FINAL_SPRINT': return 94;
      case 'FINISH_LINE': return 100;
      default: return 20;
    }
  };

  const getScore = (key: 'P1' | 'P2' | 'P3' | 'P4') => {
    if (key === 'P1') return p1DisplayScore;
    if (key === 'P2') return p2DisplayScore;
    return extraDisplayScores[key] ?? 0;
  };

  const highestScore = Math.max(...racersList.map(r => getScore(r.playerKey)));
  const leadingRacers = racersList.filter(r => getScore(r.playerKey) === highestScore);
  const currentLeader = leadingRacers.length === 1 ? leadingRacers[0].playerKey : 'DRAW';

  const lowestScore = Math.min(...racersList.map(r => getScore(r.playerKey)));
  const scoreGap = highestScore - lowestScore;
  const gapMeters = (scoreGap * 11.4 + 14.5).toFixed(1);

  const getRiderPosition = (player: 'P1' | 'P2' | 'P3' | 'P4') => {
    const myScore = getScore(player);
    const allScores = racersList.map(r => getScore(r.playerKey));
    const avgScore = allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);
    const myLead = myScore - avgScore; // Relative lead compared to average pack

    if (phase === 'BASE_LAUNCH') {
      const base = 38;
      const shift = Math.max(-12, Math.min(14, myLead * 1.8));
      return Math.max(20, Math.min(70, base + shift));
    } 
    
    if (phase === 'BIKE_ACCEL') {
      const base = 46;
      const shift = Math.max(-16, Math.min(16, myLead * 2.0));
      return Math.max(22, Math.min(74, base + shift));
    } 
    
    if (phase === 'TACTICAL_BOOST') {
      const base = 54;
      const shift = Math.max(-18, Math.min(18, myLead * 2.2));
      return Math.max(24, Math.min(76, base + shift));
    } 
    
    if (phase === 'INTERVAL_BURST') {
      const base = 62;
      const shift = Math.max(-20, Math.min(20, myLead * 2.4));
      return Math.max(26, Math.min(80, base + shift));
    } 
    
    if (phase === 'FINAL_SPRINT') {
      const base = 70;
      const shift = Math.max(-22, Math.min(22, myLead * 2.6));
      return Math.max(28, Math.min(84, base + shift));
    } 
    
    if (phase === 'FINISH_LINE') {
      if (winner === 'DRAW') return 76;
      if (player === winner) return 82;
      const rank = [...racersList]
        .sort((a, b) => getScore(b.playerKey) - getScore(a.playerKey))
        .findIndex(r => r.playerKey === player);
      return Math.max(30, 72 - Math.max(1, rank) * 12);
    }

    return 38;
  };

  const p1Pos = getRiderPosition('P1');
  const p2Pos = getRiderPosition('P2');
  const progressPercent = getRaceProgressPercent();

  return (
    <div className="fixed inset-0 z-50 bg-[#070913] flex flex-col justify-between overflow-hidden select-none">
      {/* Photo Finish Camera Flash Overlay */}
      {photoFlash && (
        <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-ping duration-300" />
      )}

      {/* =========================================================
          TOP NAVIGATION & TELEMETRY BAR
         ========================================================= */}
      <div className="w-full bg-[#0d1021]/95 border-b border-[#1f2647] px-3 sm:px-6 pt-2.5 pb-2 z-20 backdrop-blur-md flex flex-col gap-2 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          
          {/* Left Badges: Terrain Badge + Active Hazard Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Terrain Category Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-black text-[11px] sm:text-xs shadow-md ${
              event.category === 'TANJAKAN'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200 shadow-amber-950/40'
                : event.category === 'TURUNAN'
                ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-200 shadow-cyan-950/40'
                : 'bg-purple-950/80 border-purple-500/60 text-purple-200 shadow-purple-950/40'
            }`}>
              {event.category === 'TURUNAN' && <CornerDownRight className="w-3.5 h-3.5 text-cyan-300" />}
              {event.category === 'TANJAKAN' && <TrendingUp className="w-3.5 h-3.5 text-amber-300" />}
              {event.category === 'DATAR' && <MoveRight className="w-3.5 h-3.5 text-purple-300" />}
              {event.category === 'TIKUNGAN' && <ArrowDownRight className="w-3.5 h-3.5 text-purple-300" />}
              <span className="tracking-wide uppercase">
                {event.category === 'TANJAKAN' ? '⛰️ TANJAKAN (+8%)' : event.category === 'TURUNAN' ? '↘ TURUNAN (-12%)' : `2D SPRINT • ${meta.label}`}
              </span>
            </div>

            {/* Active Hazard Warning Badge (If present) */}
            {hazard && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-950/80 border border-red-500/70 text-red-200 font-mono font-bold text-[10px] sm:text-xs shadow-lg shadow-red-950/50 animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">
                  HAZARD: {hazard.title} ({hazard.effect.pointDelta > 0 ? `+${hazard.effect.pointDelta}` : hazard.effect.pointDelta} PWR)
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const nextState = !isSoundMuted;
                sound.enabled = !nextState;
                setIsSoundMuted(nextState);
                if (!nextState) {
                  sound.playCardFlip();
                }
              }}
              className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-[#171b33] hover:bg-[#202747] border border-[#2b3560] text-zinc-200 transition-all cursor-pointer shadow-sm"
              title={isSoundMuted ? "Aktifkan Efek Suara" : "Bisukan Efek Suara"}
            >
              {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-zinc-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsPaused(prev => !prev)}
              className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-[#171b33] hover:bg-[#202747] border border-[#2b3560] text-zinc-200 transition-all cursor-pointer shadow-sm"
              title={isPaused ? "Lanjutkan" : "Jeda"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> : <Pause className="w-3.5 h-3.5 text-zinc-200" />}
            </button>

            <button
              type="button"
              onClick={() => setIsFastForward(prev => !prev)}
              className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                isFastForward
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-[#171b33] text-amber-400 border-[#2b3560] hover:bg-[#202747]'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{isFastForward ? '2x' : '1x'}</span>
            </button>

            {/* Toggle Foto Rider */}
            <button
              type="button"
              onClick={() => setShowRiderProfiles(prev => !prev)}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                showRiderProfiles
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/70 shadow-sm shadow-cyan-500/20'
                  : 'bg-[#171b33] text-zinc-400 border-[#2b3560] hover:bg-[#202747]'
              }`}
              title={showRiderProfiles ? "Sembunyikan Foto Rider (P)" : "Tampilkan Foto Rider (P)"}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{showRiderProfiles ? 'Foto ON' : 'Foto OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.cancelSpeech();
                onFinishAnimation();
              }}
              className="px-3 py-1 rounded-xl text-xs font-bold font-mono flex items-center gap-1 bg-[#171b33] hover:bg-[#202747] text-zinc-200 border border-[#2b3560] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
            >
              <Flag className="w-3.5 h-3.5 text-zinc-300" />
              <span>Lewati</span>
            </button>
          </div>
        </div>

        {/* Distance Progress Bar */}
        <div className="w-full flex items-center gap-2 px-0.5">
          <div className="relative flex-1 h-2.5 sm:h-3 bg-[#0a0d18] border border-[#202848] rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15 }}
              className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-[#00f0ff] rounded-full shadow-[0_0_12px_rgba(0,240,255,0.7)]"
            />
          </div>
          <div className="shrink-0 text-amber-400 text-sm sm:text-base drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
            🏁
          </div>
        </div>
      </div>

      {/* =========================================================
          DYNAMIC LIVE HAZARD MARQUEE TICKER (TULISAN BERJALAN - MUNCUL SEBENTAR)
         ========================================================= */}
      <AnimatePresence>
        {showEventPopup && hazard && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="w-full overflow-hidden shrink-0 z-20"
          >
            <div className="w-full bg-gradient-to-r from-red-950 via-rose-900 to-red-950 border-b border-red-500/70 py-1 sm:py-1.5 px-3 overflow-hidden flex items-center shadow-lg relative">
              {/* Pulsing Alert Badge */}
              <div className="shrink-0 flex items-center gap-1.5 bg-red-600 border border-red-400 text-white font-mono font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-md shadow-md mr-3 animate-pulse z-10">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>HAZARD ALERT</span>
              </div>
              
              {/* Running Text Marquee Container */}
              <div className="flex-1 overflow-hidden relative flex items-center">
                <motion.div
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ 
                    repeat: Infinity, 
                    ease: 'linear', 
                    duration: isFastForward ? 14 : 24 
                  }}
                  className="flex w-max"
                >
                  {/* Loop Copy 1 */}
                  <div className="flex shrink-0 items-center gap-4 pr-12 text-[11px] sm:text-xs font-mono font-black text-rose-100 uppercase tracking-widest">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-white font-black">{hazard.title}</span>
                    <span className="text-rose-400">•</span>
                    <span className="text-rose-200 normal-case font-medium">{hazard.description}</span>
                    <span className="text-rose-400">•</span>
                    <span className="text-yellow-300 font-black">DAMPAK: {hazard.effect.pointDelta > 0 ? `+${hazard.effect.pointDelta}` : hazard.effect.pointDelta} POWER</span>
                    {hazard.effect.description && (
                      <>
                        <span className="text-rose-400">•</span>
                        <span className="text-amber-200 normal-case">{hazard.effect.description}</span>
                      </>
                    )}
                    <span className="text-yellow-400">⚠️</span>
                  </div>

                  {/* Loop Copy 2 for infinite seamless stream */}
                  <div className="flex shrink-0 items-center gap-4 pr-12 text-[11px] sm:text-xs font-mono font-black text-rose-100 uppercase tracking-widest">
                    <span className="text-yellow-400">⚠️</span>
                    <span className="text-white font-black">{hazard.title}</span>
                    <span className="text-rose-400">•</span>
                    <span className="text-rose-200 normal-case font-medium">{hazard.description}</span>
                    <span className="text-rose-400">•</span>
                    <span className="text-yellow-300 font-black">DAMPAK: {hazard.effect.pointDelta > 0 ? `+${hazard.effect.pointDelta}` : hazard.effect.pointDelta} POWER</span>
                    {hazard.effect.description && (
                      <>
                        <span className="text-rose-400">•</span>
                        <span className="text-amber-200 normal-case">{hazard.effect.description}</span>
                      </>
                    )}
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* =========================================================
            STAGE ARENA: THEMED BACKGROUNDS ACCORDING TO TERRAIN
           ========================================================= */}
        <div className={`relative flex-1 flex flex-col justify-end w-full overflow-hidden transition-all duration-300 ${
          isInterval ? 'scale-[1.03]' : isSprint ? 'scale-[1.01]' : 'scale-100'
        } ${screenShake ? 'brightness-110' : ''}`}>
          
          {/* Deep Night Atmosphere Sky */}
          <div className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
            event.category === 'TANJAKAN' 
              ? 'bg-gradient-to-b from-[#090b16] via-[#121024] to-[#1c1836]'
              : event.category === 'TURUNAN'
              ? 'bg-gradient-to-b from-[#050b18] via-[#09152b] to-[#10243e]'
              : 'bg-gradient-to-b from-[#080b18] via-[#10142a] to-[#181a38]'
          }`} />

          {/* Distant Stars in Night Sky */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {[
              { top: '15%', left: '10%' }, { top: '25%', left: '30%' }, { top: '10%', left: '55%' },
              { top: '20%', left: '75%' }, { top: '12%', left: '90%' }, { top: '35%', left: '45%' }
            ].map((star, idx) => (
              <div 
                key={idx} 
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{ top: star.top, left: star.left, animationDelay: `${idx * 0.4}s` }}
              />
            ))}
          </div>

          {/* =========================================================
              HIGH-SPEED KINETIC WIND SPEED STREAKS (GPU HARDWARE ACCELERATED)
             ========================================================= */}
          <div className="absolute inset-0 pointer-events-none z-12 overflow-hidden opacity-70">
            {[
              { top: '20%', width: '220px', duration: 0.6, delay: 0 },
              { top: '35%', width: '280px', duration: 0.5, delay: 0.15 },
              { top: '55%', width: '240px', duration: 0.55, delay: 0.3 },
              { top: '75%', width: '260px', duration: 0.48, delay: 0.45 }
            ].map((streak, sIdx) => {
              const speedDuration = (streak.duration / (isInterval ? 1.6 : isSprint ? 1.3 : 1.0));
              return (
                <div
                  key={sIdx}
                  className="absolute h-0.5 rounded-full"
                  style={{ 
                    top: streak.top, 
                    width: streak.width,
                    left: 0,
                    animationName: 'windStreakAnim',
                    animationDuration: `${speedDuration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                    animationDelay: `${streak.delay}s`,
                    willChange: 'transform',
                    background: event.category === 'TURUNAN'
                      ? 'linear-gradient(90deg, transparent, rgba(0,240,255,0.85), transparent)'
                      : event.category === 'TANJAKAN'
                      ? 'linear-gradient(90deg, transparent, rgba(251,191,36,0.85), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)'
                  }}
                />
              );
            })}
            <style>{`
              @keyframes windStreakAnim {
                0% { transform: translateX(110vw); }
                100% { transform: translateX(-40vw); }
              }
            `}</style>
          </div>

          {/* =========================================================
              NATURAL HEAVY RAIN EVENT SYSTEM (DYNAMIC DOWNPOUR, LIGHTNING & SPLASHES)
             ========================================================= */}
          {isRainHazard && (
            <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
              {/* 1. Storm Sky Dark Overcast & Ambient Fog Atmosphere */}
              <div className="absolute inset-0 bg-slate-950/45 mix-blend-multiply transition-opacity duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-b from-sky-950/35 via-transparent to-slate-900/50" />

              {/* 2. Distant Thunderstorm Lightning Flash Flicker */}
              <div 
                className="absolute inset-0 bg-cyan-100/15 pointer-events-none"
                style={{
                  animationName: 'stormLightningAnim',
                  animationDuration: '5.2s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite'
                }}
              />

              {/* 3. Wind-Slanted Fast Falling Rain Needles (Multi-layer Parallax) */}
              <div className="absolute inset-0 overflow-hidden">
                {STABLE_RAIN_DROPS.map((drop) => {
                  const speedMult = isInterval ? 1.4 : isSprint ? 1.2 : 1.0;
                  const duration = drop.duration / speedMult;
                  return (
                    <div
                      key={`rain-drop-${drop.id}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${drop.left}%`,
                        top: `${drop.top}%`,
                        height: `${drop.length}px`,
                        width: `${drop.thickness}px`,
                        opacity: drop.opacity,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(186,230,253,0.85), rgba(56,189,248,0.95))',
                        animationName: 'naturalRainFall',
                        animationDuration: `${duration}s`,
                        animationTimingFunction: 'linear',
                        animationIterationCount: 'infinite',
                        animationDelay: `${drop.delay}s`,
                        willChange: 'transform'
                      }}
                    />
                  );
                })}
              </div>

              {/* 4. Wet Road Asphalt Ripple Rings & Splash Impact Droplets */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {STABLE_RAIN_SPLASHES.map((splash) => (
                  <div
                    key={`rain-splash-${splash.id}`}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${splash.left}%`,
                      top: `${splash.topPercent}%`,
                      width: '24px',
                      height: '10px'
                    }}
                  >
                    {/* Splash expanding water ripple ring */}
                    <div
                      className="absolute rounded-full border border-sky-300/80"
                      style={{
                        width: '18px',
                        height: '7px',
                        animationName: 'rainSplashRing',
                        animationDuration: `${splash.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${splash.delay}s`,
                        transform: `scale(${splash.scale})`,
                        willChange: 'transform, opacity'
                      }}
                    />
                    {/* Splash bouncing water droplet beads */}
                    <div
                      className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200"
                      style={{
                        animationName: 'rainSplashDroplet',
                        animationDuration: `${splash.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${splash.delay}s`,
                        willChange: 'transform, opacity'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 5. Wet Asphalt Mirror Gloss & Shimmer Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-sky-400/10 via-sky-500/5 to-transparent pointer-events-none" />

              {/* 6. Rain Fog Mist Drift along Road Surface */}
              <div 
                className="absolute inset-x-0 bottom-2 h-14 bg-gradient-to-r from-transparent via-sky-200/15 to-transparent blur-sm pointer-events-none"
                style={{
                  animationName: 'rainMistDrift',
                  animationDuration: '3.6s',
                  animationTimingFunction: 'linear',
                  animationIterationCount: 'infinite'
                }}
              />

              {/* Rain & Storm CSS Keyframes */}
              <style>{`
                @keyframes naturalRainFall {
                  0% {
                    transform: translate3d(0, -60px, 0) rotate(-20deg);
                    opacity: 0;
                  }
                  15% {
                    opacity: 0.9;
                  }
                  85% {
                    opacity: 0.9;
                  }
                  100% {
                    transform: translate3d(-18vw, 115vh, 0) rotate(-20deg);
                    opacity: 0.25;
                  }
                }

                @keyframes rainSplashRing {
                  0% {
                    transform: scale(0.2);
                    opacity: 0.95;
                  }
                  60% {
                    transform: scale(1.4);
                    opacity: 0.5;
                  }
                  100% {
                    transform: scale(2.2);
                    opacity: 0;
                  }
                }

                @keyframes rainSplashDroplet {
                  0% {
                    transform: translate3d(0, 0, 0) scale(0.6);
                    opacity: 1;
                  }
                  45% {
                    transform: translate3d(-8px, -14px, 0) scale(1);
                    opacity: 0.85;
                  }
                  100% {
                    transform: translate3d(-16px, -2px, 0) scale(0.2);
                    opacity: 0;
                  }
                }

                @keyframes stormLightningAnim {
                  0%, 88%, 93%, 100% { opacity: 0; }
                  89% { opacity: 0.38; }
                  90% { opacity: 0.05; }
                  91% { opacity: 0.65; }
                  92% { opacity: 0.12; }
                }

                @keyframes rainMistDrift {
                  0% { transform: translateX(30%); opacity: 0.3; }
                  50% { opacity: 0.6; }
                  100% { transform: translateX(-30%); opacity: 0.3; }
                }

                @keyframes roadTireSprayAnim {
                  0% {
                    transform: translate3d(0, 0, 0) scale(0.6);
                    opacity: 0;
                  }
                  25% {
                    opacity: 0.95;
                  }
                  70% {
                    transform: translate3d(-35px, -6px, 0) scale(1.25);
                    opacity: 0.8;
                  }
                  100% {
                    transform: translate3d(-75px, -12px, 0) scale(1.6);
                    opacity: 0;
                  }
                }

                @keyframes roadWakeDrift {
                  0% {
                    background-position: 0px 0px;
                  }
                  100% {
                    background-position: -120px 0px;
                  }
                }
              `}</style>
            </div>
          )}

          {/* =========================================================
              DYNAMIC TERRAIN BACKGROUND SCENERY
             ========================================================= */}
          
          {/* 1. TANJAKAN (Alpine Mountain Peaks, Ridge Silhouette, Pine Trees) */}
          {event.category === 'TANJAKAN' && (
            <div 
              className="absolute inset-0 flex items-end pointer-events-none transition-transform duration-700"
              style={{ 
                transform: `translateX(-${(trackScrollX * 0.25) % 600}px) rotate(-1.8deg)`,
                transformOrigin: 'bottom center'
              }}
            >
              {Array.from({ length: 4 }).map((_, mIdx) => (
                <div key={mIdx} className="w-[600px] shrink-0 relative flex items-end pb-28">
                  {/* Distant Deep Purple Mountains */}
                  <svg viewBox="0 0 600 240" className="w-full h-56 sm:h-72 opacity-90 fill-[#161730]">
                    <polygon points="0,240 60,110 140,160 250,50 340,140 430,70 510,130 600,60 600,240" />
                    {/* Snow capped peaks */}
                    <polygon points="250,50 220,90 280,90" fill="#3b3b64" opacity="0.6" />
                    <polygon points="430,70 405,105 455,105" fill="#3b3b64" opacity="0.6" />
                    <polygon points="600,60 575,95 600,105" fill="#3b3b64" opacity="0.6" />
                  </svg>

                  {/* Mid-ground Hills with Alpine Pine Trees */}
                  <svg viewBox="0 0 600 160" className="absolute bottom-24 w-full h-36 opacity-95 fill-[#1c1f40]">
                    <polygon points="0,160 80,60 180,100 290,40 400,90 500,50 600,100 600,160" />
                    {/* Pine tree silhouettes */}
                    {[40, 70, 110, 160, 220, 270, 310, 370, 440, 480, 540, 580].map((treeX, tIdx) => (
                      <polygon key={tIdx} points={`${treeX},160 ${treeX - 10},120 ${treeX},90 ${treeX + 10},120`} fill="#111326" />
                    ))}
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* 2. TURUNAN (Mountain Canyon Ridge & Valley Overlook) */}
          {event.category === 'TURUNAN' && (
            <div 
              className="absolute inset-0 flex items-end pointer-events-none transition-transform duration-700"
              style={{ 
                transform: `translateX(-${(trackScrollX * 0.3) % 600}px) rotate(1.8deg)`,
                transformOrigin: 'bottom center'
              }}
            >
              {Array.from({ length: 4 }).map((_, cIdx) => (
                <div key={cIdx} className="w-[600px] shrink-0 relative flex items-end pb-28">
                  {/* Descending Alpine Mountain Ridges */}
                  <svg viewBox="0 0 600 240" className="w-full h-56 sm:h-72 opacity-90 fill-[#0d1c33]">
                    <polygon points="0,240 0,60 120,110 240,40 360,130 480,80 600,150 600,240" />
                  </svg>
                  {/* Canyon Valley Slope */}
                  <svg viewBox="0 0 600 160" className="absolute bottom-24 w-full h-36 opacity-95 fill-[#132847]">
                    <polygon points="0,160 0,40 140,80 280,30 420,90 560,50 600,90 600,160" />
                    {[30, 80, 150, 210, 290, 350, 410, 490, 550].map((treeX, tIdx) => (
                      <polygon key={tIdx} points={`${treeX},160 ${treeX - 8},125 ${treeX},100 ${treeX + 8},125`} fill="#091424" />
                    ))}
                  </svg>
                </div>
              ))}
            </div>
          )}

          {/* 3. DATAR & TIKUNGAN (Urban City Skyline with Clean Architectural Windows & Streetlights) */}
          {(event.category === 'DATAR' || event.category === 'TIKUNGAN') && (
            <>
              {/* Skyline Buildings with Clean, Modern Minimalist Windows */}
              <div 
                className="absolute inset-0 flex items-end pointer-events-none opacity-80 pb-24"
                style={{ transform: `translateX(-${(trackScrollX * 0.22) % 460}px)` }}
              >
                {Array.from({ length: 4 }).map((_, blockIdx) => (
                  <div key={blockIdx} className="flex items-end shrink-0 gap-5 px-3">
                    {/* Skyscraper A - Clean High-rise */}
                    <div className="w-32 sm:w-40 h-64 sm:h-76 bg-[#0c1024] border-t-2 border-x border-[#1a2245] rounded-t-sm flex flex-col overflow-hidden p-2.5 relative shadow-2xl">
                      {/* Sleek Rooftop Spire */}
                      <div className="absolute -top-6 left-8 w-1 h-6 bg-[#202852] flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/70 shadow-[0_0_6px_#f43f5e] animate-pulse" />
                      </div>
                      {/* Clean Architectural Window Bands */}
                      <div className="w-full h-full flex flex-col justify-between py-2 opacity-60">
                        {Array.from({ length: 8 }).map((_, rowIdx) => (
                          <div key={rowIdx} className="flex justify-between items-center px-1">
                            {[0, 1, 2, 3].map(colIdx => (
                              <div 
                                key={colIdx} 
                                className={`w-4 sm:w-5 h-1 rounded-[1px] transition-colors ${
                                  rowIdx % 3 === 0 && colIdx < 2
                                    ? 'bg-amber-200/50' 
                                    : 'bg-[#182142]/60'
                                }`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mid-rise Tower B - Clean Glass & Light Columns */}
                    <div className="w-24 sm:w-32 h-48 sm:h-56 bg-[#090d1f] border-t-2 border-x border-[#141b38] rounded-t-sm flex flex-col overflow-hidden p-2 relative shadow-xl">
                      <div className="w-full h-full flex flex-col justify-between py-2 opacity-50">
                        {Array.from({ length: 6 }).map((_, rowIdx) => (
                          <div key={rowIdx} className="flex justify-around items-center">
                            {[0, 1, 2].map(colIdx => (
                              <div 
                                key={colIdx} 
                                className={`w-4 sm:w-5 h-1.5 rounded-[1px] ${
                                  (rowIdx === 2 || rowIdx === 4) && colIdx === 1
                                    ? 'bg-cyan-200/40' 
                                    : 'bg-[#121832]/50'
                                }`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tower C - Wide Metropolitan Complex */}
                    <div className="w-36 sm:w-44 h-72 sm:h-84 bg-[#0e142e] border-t-2 border-x border-[#1c2550] rounded-t-sm flex flex-col overflow-hidden p-3 relative shadow-2xl">
                      <div className="absolute -top-7 right-10 w-1 h-7 bg-[#242f60] flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/70 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                      </div>
                      <div className="w-full h-full flex flex-col justify-between py-2 opacity-65">
                        {Array.from({ length: 10 }).map((_, rowIdx) => (
                          <div key={rowIdx} className="flex justify-between items-center px-1">
                            {[0, 1, 2, 3, 4].map(colIdx => (
                              <div 
                                key={colIdx} 
                                className={`w-3.5 sm:w-4.5 h-1 rounded-[1px] ${
                                  rowIdx % 4 === 1 && (colIdx === 1 || colIdx === 3)
                                    ? 'bg-amber-200/50' 
                                    : 'bg-[#172044]/60'
                                }`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Streetlights */}
              <div 
                className="absolute inset-0 flex items-end pointer-events-none z-5 pb-24"
                style={{ transform: `translateX(-${(trackScrollX * 0.8) % 360}px)` }}
              >
                {Array.from({ length: 4 }).map((_, lightIdx) => (
                  <div key={lightIdx} className="w-[200px] sm:w-[260px] shrink-0 flex flex-col items-center justify-end">
                    <div className="relative flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-cyan-300/70 border border-cyan-400 shadow-[0_0_12px_#00f0ff]" />
                      <div className="w-1.5 h-20 sm:h-28 bg-[#2d3766]" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Floating Brief Event & Hazard Intro UI Popup (Auto-Dismissed after a moment) */}
          <AnimatePresence>
            {showEventPopup && (
              <motion.div
                initial={{ opacity: 0, y: -24, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => setShowEventPopup(false)}
                className="absolute top-3 inset-x-0 z-35 flex justify-center pointer-events-auto cursor-pointer px-3"
              >
                <div className="bg-[#0b0f24]/92 border border-cyan-500/60 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-[0_0_25px_rgba(0,240,255,0.25)] flex items-center gap-2.5 sm:gap-3 max-w-md hover:border-cyan-400 transition-all">
                  <div className={`p-1.5 rounded-xl text-[10px] sm:text-xs font-black shrink-0 ${
                    event.category === 'TANJAKAN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                    event.category === 'TURUNAN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  }`}>
                    {event.category === 'TANJAKAN' ? '⛰️ TANJAKAN' : event.category === 'TURUNAN' ? '↘ TURUNAN' : '⚡ 2D SPRINT'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-black text-white truncate flex items-center gap-1.5">
                      <span>{event.name}</span>
                      {hazard && (
                        <span className="text-[9px] bg-red-950/90 text-rose-300 border border-red-500/70 px-1.5 py-0.5 rounded font-mono font-bold">
                          ⚠️ {hazard.title}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-zinc-300 truncate">
                      {event.description}
                    </p>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-mono text-zinc-400 shrink-0 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/50">
                    ✕
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comic FX Popups */}
          <AnimatePresence>
            {comicPopups.map(fx => (
              <motion.div
                key={fx.id}
                initial={{ scale: 0, rotate: -15, opacity: 0, y: 20 }}
                animate={{ scale: [0.8, 1.25, 1], rotate: [0, 8, -5], opacity: 1, y: -15 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.7 }}
                style={{ left: `${fx.x}%`, top: `${fx.y}%` }}
                className="absolute z-40 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div 
                  className="font-black font-mono text-sm sm:text-xl italic px-3 py-1 rounded-xl shadow-2xl border-2 border-white/90 tracking-wider text-black bg-white"
                  style={{ 
                    backgroundColor: fx.color,
                    boxShadow: `0 0 25px ${fx.color}aa, inset 0 0 10px rgba(0,0,0,0.3)` 
                  }}
                >
                  {fx.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* =========================================================
              CONTINUOUS FULL-BLEED 2D MULTI-LANE TRACK (EXPANDED SPACING & DYNAMIC SLOPE)
             ========================================================= */}
          <div 
            className={`relative w-full ${
              totalRacers === 4 
                ? 'h-[390px] sm:h-[460px] md:h-[500px]'
                : totalRacers === 3
                ? 'h-[330px] sm:h-[390px] md:h-[430px]'
                : 'h-[280px] sm:h-[330px] md:h-[360px]'
            } bg-[#0c1022] border-t-2 border-[#1e254d] flex flex-col justify-end z-10 shadow-2xl overflow-hidden transition-transform duration-700 ease-out`}
            style={{
              transform: event.category === 'TANJAKAN'
                ? 'rotate(-4.8deg) scale(1.08) translateY(14px)'
                : event.category === 'TURUNAN'
                ? 'rotate(4.8deg) scale(1.08) translateY(-14px)'
                : 'rotate(0deg) scale(1) translateY(0px)',
              transformOrigin: 'center center'
            }}
          >
            {/* Dynamic Elevation Gradient Badge on Asphalt (Brief Popup) */}
            <AnimatePresence>
              {showEventPopup && event.category === 'TANJAKAN' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -5 }}
                  transition={{ duration: 0.35 }}
                  className="absolute top-4 left-4 sm:left-6 z-15 pointer-events-none flex items-center gap-2 bg-amber-950/85 border border-amber-400/70 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                >
                  <span className="text-amber-400 font-mono font-black text-[9px] sm:text-xs tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="text-sm">▲▲</span> ELEVASI +8.5% • TANJAKAN TERJAL • HIGH TORQUE
                  </span>
                </motion.div>
              )}

              {showEventPopup && event.category === 'TURUNAN' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.85, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -5 }}
                  transition={{ duration: 0.35 }}
                  className="absolute top-4 left-4 sm:left-6 z-15 pointer-events-none flex items-center gap-2 bg-cyan-950/85 border border-cyan-400/70 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                >
                  <span className="text-cyan-400 font-mono font-black text-[9px] sm:text-xs tracking-wider flex items-center gap-1.5 animate-pulse">
                    <span className="text-sm">▼▼</span> GRADIENT -12.0% • TURUNAN CEPAT • SUPER TUCK
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Red-and-White Checkered Track Kerb (Lowered slightly for precision) */}
            <div 
              className="absolute top-2 sm:top-2.5 inset-x-0 h-3.5 sm:h-4 bg-[repeating-linear-gradient(90deg,#ff3355,#ff3355_24px,#ffffff_24px,#ffffff_48px)] shadow-md border-b border-black/50"
              style={{ backgroundPosition: `-${trackScrollX % 48}px 0px` }}
            />

            {/* Dynamic Center Lane Dividers based on totalRacers */}
            {totalRacers === 2 && (
              <div className="absolute inset-x-0 top-[54%] -translate-y-1/2 flex flex-col gap-1 z-5 pointer-events-none">
                <div 
                  className="w-full h-1 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_32px,transparent_32px,transparent_64px)] opacity-90 shadow-[0_0_8px_#00f0ff]"
                  style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 64}px 0px` }}
                />
                <div 
                  className="w-full h-1 bg-[repeating-linear-gradient(90deg,#ff3355,#ff3355_32px,transparent_32px,transparent_64px)] opacity-90 shadow-[0_0_8px_#ff3355]"
                  style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 64}px 0px` }}
                />
              </div>
            )}

            {totalRacers === 3 && (
              <>
                <div className="absolute inset-x-0 top-[36%] -translate-y-1/2 flex flex-col gap-0.5 z-5 pointer-events-none">
                  <div 
                    className="w-full h-0.5 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_28px,transparent_28px,transparent_56px)] opacity-80"
                    style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 56}px 0px` }}
                  />
                </div>
                <div className="absolute inset-x-0 top-[68%] -translate-y-1/2 flex flex-col gap-0.5 z-5 pointer-events-none">
                  <div 
                    className="w-full h-0.5 bg-[repeating-linear-gradient(90deg,#f59e0b,#f59e0b_28px,transparent_28px,transparent_56px)] opacity-80"
                    style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 56}px 0px` }}
                  />
                </div>
              </>
            )}

            {totalRacers === 4 && (
              <>
                <div className="absolute inset-x-0 top-[27%] -translate-y-1/2 flex flex-col gap-0.5 z-5 pointer-events-none">
                  <div 
                    className="w-full h-0.5 bg-[repeating-linear-gradient(90deg,#00f0ff,#00f0ff_24px,transparent_24px,transparent_48px)] opacity-80"
                    style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 48}px 0px` }}
                  />
                </div>
                <div className="absolute inset-x-0 top-[52%] -translate-y-1/2 flex flex-col gap-0.5 z-5 pointer-events-none">
                  <div 
                    className="w-full h-0.5 bg-[repeating-linear-gradient(90deg,#f59e0b,#f59e0b_24px,transparent_24px,transparent_48px)] opacity-80"
                    style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 48}px 0px` }}
                  />
                </div>
                <div className="absolute inset-x-0 top-[76%] -translate-y-1/2 flex flex-col gap-0.5 z-5 pointer-events-none">
                  <div 
                    className="w-full h-0.5 bg-[repeating-linear-gradient(90deg,#10b981,#10b981_24px,transparent_24px,transparent_48px)] opacity-80"
                    style={{ backgroundPosition: `-${(trackScrollX * 1.1) % 48}px 0px` }}
                  />
                </div>
              </>
            )}

            {/* Asphalt Lane Stencil Markers for each racer */}
            {racersList.map((racer, idx) => {
              const stencilColorClass =
                racer.color === 'cyan' ? 'text-cyan-400' :
                racer.color === 'rose' ? 'text-rose-400' :
                racer.color === 'amber' ? 'text-amber-400' : 'text-emerald-400';
              const stencilLabel =
                racer.color === 'cyan' ? 'BIRU' :
                racer.color === 'rose' ? 'MERAH' :
                racer.color === 'amber' ? 'KUNING' : 'HIJAU';
              
              let topStyle = '15%';
              if (totalRacers === 2) {
                topStyle = idx === 0 ? '16%' : '72%';
              } else if (totalRacers === 3) {
                topStyle = idx === 0 ? '12%' : idx === 1 ? '44%' : '76%';
              } else {
                topStyle = idx === 0 ? '10%' : idx === 1 ? '33%' : idx === 2 ? '58%' : '82%';
              }

              return (
                <div 
                  key={`lane-stencil-${racer.playerKey}`}
                  className={`absolute opacity-35 select-none pointer-events-none font-mono font-black text-[9px] sm:text-xs ${stencilColorClass} tracking-widest flex items-center gap-2`}
                  style={{ 
                    top: topStyle,
                    transform: `translateX(-${(trackScrollX * 0.8) % 480}px)` 
                  }}
                >
                  {Array.from({ length: 6 }).map((_, sIdx) => (
                    <span key={`l-sten-${racer.playerKey}-${sIdx}`} className="mr-36 sm:mr-52 shrink-0">
                      LANE {idx + 1} • {racer.player.name.toUpperCase()} ({stencilLabel}) &gt;&gt;
                    </span>
                  ))}
                </div>
              );
            })}

            {/* Bottom Race Track Rumble Strip */}
            <div 
              className="absolute bottom-0 inset-x-0 h-3.5 sm:h-4 bg-[repeating-linear-gradient(90deg,#ff3355,#ff3355_20px,#ffffff_20px,#ffffff_40px)] opacity-60 shadow-inner"
              style={{ backgroundPosition: `-${trackScrollX % 40}px 0px` }}
            />

            {/* =========================================================
                FULL-TRACK DYNAMIC WET ASPHALT WATER SPRAY SYSTEM (RAIN HAZARD)
               ========================================================= */}
            {isRainHazard && (
              <div className="absolute inset-0 pointer-events-none z-8 overflow-hidden">
                {/* 1. Full-bleed road water film & high-velocity spray streaks */}
                <div 
                  className="absolute inset-0 opacity-45 mix-blend-screen pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(56,189,248,0.28) 0px, rgba(56,189,248,0.28) 12px, transparent 12px, transparent 32px)',
                    backgroundPosition: `-${(trackScrollX * 1.6) % 32}px 0px`
                  }}
                />

                {/* 2. Lane 1 Continuous Hydrodynamic Water Wake Plume (Trailing behind Rider 1) */}
                <div 
                  className="absolute top-10 sm:top-14 h-16 sm:h-22 pointer-events-none transition-all duration-300"
                  style={{
                    left: 0,
                    width: `${Math.max(0, p1Pos)}%`
                  }}
                >
                  {/* Expanding water wake plume behind Rider 1 */}
                  <div className="w-full h-full bg-gradient-to-r from-cyan-500/10 via-cyan-400/30 to-sky-300/60 blur-[1px] rounded-r-full" />
                  {/* High-speed water churn foam ripples */}
                  <div 
                    className="absolute inset-0 opacity-80"
                    style={{
                      backgroundImage: 'radial-gradient(ellipse at center, rgba(186,230,253,0.7) 0%, transparent 70%)',
                      backgroundSize: '36px 14px',
                      backgroundPosition: `-${(trackScrollX * 1.4) % 36}px 0px`
                    }}
                  />
                  {/* Tire track rut streak on asphalt */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400/20 via-sky-300/45 to-white/60 blur-[0.5px]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 8px, transparent 8px, transparent 18px)',
                      backgroundPosition: `-${(trackScrollX * 1.8) % 18}px 0px`
                    }}
                  />
                </div>

                {/* 3. Lane 2 Continuous Hydrodynamic Water Wake Plume (Trailing behind Rider 2) */}
                <div 
                  className="absolute bottom-6 sm:bottom-9 h-16 sm:h-22 pointer-events-none transition-all duration-300"
                  style={{
                    left: 0,
                    width: `${Math.max(0, p2Pos)}%`
                  }}
                >
                  {/* Expanding water wake plume behind Rider 2 */}
                  <div className="w-full h-full bg-gradient-to-r from-rose-500/10 via-sky-400/30 to-sky-300/60 blur-[1px] rounded-r-full" />
                  {/* High-speed water churn foam ripples */}
                  <div 
                    className="absolute inset-0 opacity-80"
                    style={{
                      backgroundImage: 'radial-gradient(ellipse at center, rgba(186,230,253,0.7) 0%, transparent 70%)',
                      backgroundSize: '36px 14px',
                      backgroundPosition: `-${(trackScrollX * 1.4) % 36}px 0px`
                    }}
                  />
                  {/* Tire track rut streak on asphalt */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400/20 via-sky-300/45 to-white/60 blur-[0.5px]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 8px, transparent 8px, transparent 18px)',
                      backgroundPosition: `-${(trackScrollX * 1.8) % 18}px 0px`
                    }}
                  />
                </div>

                {/* 4. Road-Wide Tire Spray Plumes & Puddle Churning Nodes (Full Track Coverage) */}
                {STABLE_ROAD_TIRE_SPRAYS.map((spray) => (
                  <div
                    key={`road-spray-${spray.id}`}
                    className="absolute flex items-center pointer-events-none"
                    style={{
                      left: `${spray.left}%`,
                      top: `${spray.topPercent}%`,
                      width: `${spray.width}px`,
                      height: `${spray.height}px`,
                      opacity: spray.opacity
                    }}
                  >
                    {/* Slanted high-velocity spray mist streak */}
                    <div 
                      className="w-full h-full rounded-full bg-gradient-to-l from-sky-200 via-cyan-400/75 to-transparent blur-[0.5px]"
                      style={{
                        animationName: 'roadTireSprayAnim',
                        animationDuration: `${spray.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${spray.delay}s`,
                        willChange: 'transform, opacity'
                      }}
                    />
                    {/* Fine water spray bead */}
                    <div 
                      className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_5px_#38bdf8]"
                      style={{
                        animationName: 'rainSplashDroplet',
                        animationDuration: `${spray.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${spray.delay}s`,
                        willChange: 'transform, opacity'
                      }}
                    />
                  </div>
                ))}

                {/* 5. Full-Road Rain Splashes & Expanding Water Rings across all lanes */}
                {STABLE_RAIN_SPLASHES.map((splash) => (
                  <div
                    key={`road-splash-ring-${splash.id}`}
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${splash.left}%`,
                      top: `${splash.topPercent}%`,
                      width: '24px',
                      height: '10px'
                    }}
                  >
                    {/* Splash expanding water ripple ring */}
                    <div
                      className="absolute rounded-full border border-sky-300/80"
                      style={{
                        width: '18px',
                        height: '7px',
                        animationName: 'rainSplashRing',
                        animationDuration: `${splash.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${splash.delay}s`,
                        transform: `scale(${splash.scale})`,
                        willChange: 'transform, opacity'
                      }}
                    />
                    {/* Splash bouncing water droplet beads */}
                    <div
                      className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_3px_#38bdf8]"
                      style={{
                        animationName: 'rainSplashDroplet',
                        animationDuration: `${splash.duration}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${splash.delay}s`,
                        willChange: 'transform, opacity'
                      }}
                    />
                  </div>
                ))}

                {/* 6. Wet Asphalt Road-Wide Mirror Reflection Sheen */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-400/15 via-cyan-300/5 to-sky-500/20 pointer-events-none mix-blend-screen" />
              </div>
            )}

            {/* =========================================================
                AERODYNAMIC DRAFTING SLIPSTREAM TUNNEL BETWEEN RIDERS
               ========================================================= */}
            {(() => {
              const sortedByPos = [...racersList]
                .map((racer, idx) => ({
                  ...racer,
                  laneIdx: idx,
                  pos: getRiderPosition(racer.playerKey)
                }))
                .sort((a, b) => b.pos - a.pos);

              const leader = sortedByPos[0];
              const second = sortedByPos[1];

              if (!leader || !second) return null;
              const gap = leader.pos - second.pos;
              if (gap < 6 || gap > 38) return null;

              const tunnelWidth = gap;
              const trailingPos = second.pos;
              
              let trailingY = 'bottom-[16px] sm:bottom-[22px]';
              if (totalRacers === 2) {
                trailingY = second.laneIdx === 0 ? 'bottom-[130px] sm:bottom-[155px]' : 'bottom-[16px] sm:bottom-[22px]';
              } else if (totalRacers === 3) {
                trailingY = second.laneIdx === 0 ? 'bottom-[215px] sm:bottom-[255px]' : second.laneIdx === 1 ? 'bottom-[115px] sm:bottom-[135px]' : 'bottom-[16px] sm:bottom-[22px]';
              } else {
                trailingY = second.laneIdx === 0 ? 'bottom-[295px] sm:bottom-[345px]' : second.laneIdx === 1 ? 'bottom-[200px] sm:bottom-[235px]' : second.laneIdx === 2 ? 'bottom-[105px] sm:bottom-[125px]' : 'bottom-[14px] sm:bottom-[18px]';
              }

              return (
                <div 
                  className={`absolute ${trailingY} z-15 pointer-events-none flex items-center justify-center overflow-visible`}
                  style={{ 
                    left: `${trailingPos}%`, 
                    width: `${tunnelWidth}%`,
                    transition: 'left 0.65s cubic-bezier(0.22, 1, 0.36, 1), width 0.65s cubic-bezier(0.22, 1, 0.36, 1)' 
                  }}
                >
                  {/* Glowing Wind Tunnel Envelope */}
                  <div className="w-full h-14 bg-gradient-to-r from-cyan-400/20 via-cyan-400/35 to-transparent blur-md rounded-r-full animate-pulse" />
                  
                  {/* Animated Wind Chevron Arrows */}
                  <div className="absolute inset-0 flex items-center justify-around opacity-80">
                    <motion.span 
                      animate={{ x: [-8, 8, -8], opacity: [0.3, 0.9, 0.3] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                      className="text-cyan-300 font-black text-xs"
                    >
                      &gt;&gt;&gt;
                    </motion.span>
                  </div>

                  {/* Drafting Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-[8px] sm:text-[9px] font-mono font-black px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-bounce">
                    💨 DRAFTING +15% AERO
                  </div>
                </div>
              );
            })()}

            {/* =========================================================
                CLEAN REALISTIC FINISH LINE ON ASPHALT (BRIEF FLASH ONLY AT FINISH)
               ========================================================= */}
            {phase === 'FINISH_LINE' && (
              <motion.div
                initial={{ left: '110%', opacity: 0 }}
                animate={{ left: ['110%', '50%', '-25%'], opacity: [0, 1, 1, 0] }}
                transition={{ 
                  duration: isFastForward ? 0.35 : 0.5,
                  times: [0, 0.4, 1],
                  ease: 'easeInOut'
                }}
                className="absolute top-0 bottom-0 z-18 -translate-x-1/2 flex flex-col items-center pointer-events-none"
              >
                {/* Seamless Flat Checkered Finish Line Across the Road with Golden Neon Edge */}
                <div className="w-5 sm:w-7 h-full bg-[repeating-linear-gradient(45deg,#000000,#000000_8px,#ffffff_8px,#ffffff_16px)] opacity-95 border-x-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)]" />
              </motion.div>
            )}

            {/* Confetti Explosion on Finish Phase with Stable Particles (No 60fps Jitter) */}
            {phase === 'FINISH_LINE' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {STABLE_CONFETTI_PARTICLES.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ 
                      x: `${p.startX}%`, 
                      y: '40%', 
                      scale: 0, 
                      rotate: 0 
                    }}
                    animate={{ 
                      x: `${p.endX}%`, 
                      y: `${p.endY}%`, 
                      scale: [0, 1.3, 0.8], 
                      rotate: 720 
                    }}
                    transition={{ duration: p.duration, ease: 'easeOut', repeat: Infinity }}
                    className="absolute w-2.5 h-2.5 rounded-xs"
                    style={{ 
                      backgroundColor: p.color 
                    }}
                  />
                ))}
              </div>
            )}

            {/* =========================================================
                ALL RACERS ON DEDICATED LANES (UP TO 4 PLAYERS)
               ========================================================= */}
            {racersList.map((racer, idx) => {
              const pos = getRiderPosition(racer.playerKey);
              const isWinnerRider = phase === 'FINISH_LINE' && winner === racer.playerKey;
              const isDefeatedRider = phase === 'FINISH_LINE' && winner !== 'DRAW' && winner !== racer.playerKey;
              const isCurrentLeader = currentLeader === racer.playerKey;
              const displayScore = getScore(racer.playerKey);
              const activeAction = racer.playerKey === 'P1' ? activeActionP1 : racer.playerKey === 'P2' ? activeActionP2 : (racer.actions[0] || null);
              const activeBonus = racer.playerKey === 'P1' ? p1ActionBonus : racer.playerKey === 'P2' ? p2ActionBonus : racer.actionBonus;

              // Calculate bottom lane offset based on totalRacers
              let laneBottom = 'bottom-[18px] sm:bottom-[24px] md:bottom-[28px]';
              if (totalRacers === 2) {
                laneBottom = idx === 0 ? 'bottom-[130px] sm:bottom-[155px] md:bottom-[170px]' : 'bottom-[18px] sm:bottom-[24px] md:bottom-[28px]';
              } else if (totalRacers === 3) {
                if (idx === 0) laneBottom = 'bottom-[215px] sm:bottom-[255px] md:bottom-[280px]';
                else if (idx === 1) laneBottom = 'bottom-[115px] sm:bottom-[135px] md:bottom-[150px]';
                else laneBottom = 'bottom-[16px] sm:bottom-[22px] md:bottom-[26px]';
              } else {
                // 4 racers
                if (idx === 0) laneBottom = 'bottom-[295px] sm:bottom-[345px] md:bottom-[380px]';
                else if (idx === 1) laneBottom = 'bottom-[200px] sm:bottom-[235px] md:bottom-[260px]';
                else if (idx === 2) laneBottom = 'bottom-[105px] sm:bottom-[125px] md:bottom-[140px]';
                else laneBottom = 'bottom-[14px] sm:bottom-[18px] md:bottom-[22px]';
              }

              const toastBg =
                racer.color === 'cyan' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300' :
                racer.color === 'rose' ? 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-300' :
                racer.color === 'amber' ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-300' :
                'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300';

              return (
                <div
                  key={`racer-slot-${racer.playerKey}`}
                  style={{ 
                    left: `${pos}%`,
                    transition: 'left 0.65s cubic-bezier(0.22, 1, 0.36, 1)' 
                  }}
                  className={`absolute ${laneBottom} -translate-x-1/2 z-20 pointer-events-none overflow-visible`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Photo Profile floating neatly above rider's helmet */}
                    <AnimatePresence>
                      {showRiderProfiles && (
                        <div className="absolute -top-9 sm:-top-10 left-[52%] -translate-x-1/2 z-30 pointer-events-none">
                          <RiderOverheadProfile
                            playerKey={racer.playerKey}
                            player={racer.player}
                            rider={racer.player.selectedRider}
                            isSprint={isSprint}
                            isInterval={isInterval}
                            isVictory={isWinnerRider}
                            color={racer.color}
                          />
                        </div>
                      )}
                    </AnimatePresence>

                    {/* Active Action Toast */}
                    <AnimatePresence>
                      {phase === 'TACTICAL_BOOST' && activeAction && (
                        <motion.div
                          initial={{ scale: 0, y: 10 }}
                          animate={{ scale: 1, y: -2 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 text-white font-mono text-[8px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xl border flex items-center gap-1 whitespace-nowrap animate-bounce z-30 ${toastBg}`}
                        >
                          <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                          <span>{activeAction.name} (+{activeBonus || 0})</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <StylizedVectorRider 
                      playerKey={racer.playerKey}
                      name={racer.player.name}
                      score={displayScore}
                      color={racer.color}
                      wheelAngle={wheelAngle}
                      isInterval={isInterval}
                      isSprinting={isSprint}
                      isVictory={isWinnerRider}
                      isDefeat={isDefeatedRider}
                      isLeader={isCurrentLeader}
                      terrain={event.category}
                      hasAura={phase === 'TACTICAL_BOOST' || isSprint}
                      hasSpecial={racer.actions.length > 0}
                      isRaining={isRainHazard}
                    />
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* =========================================================
          LIVE BROADCAST COMMENTARY SUBTITLE & FOOTER CONTROLS
         ========================================================= */}
      <div className="w-full bg-[#0d1021] border-t border-[#1f2647] p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2 z-30">
        
        {/* Live Subtitle Commentary Ticker */}
        <div className="flex-1 max-w-2xl flex items-center gap-2 bg-[#141830] border border-red-500/40 rounded-xl px-3 py-1.5 shadow-md w-full">
          <div className="flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-wider font-mono shrink-0 animate-pulse">
            <Radio className="w-3 h-3" />
            <span>KOMENTATOR</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-zinc-100 truncate italic flex-1">
            "{narratorSubtitle}"
          </p>

          {/* Subtle Desktop Shortcut Tip */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 shrink-0 border-l border-zinc-700/60 pl-2.5">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Spasi</kbd>
            <span>Jeda</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">F</kbd>
            <span>2x</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">P</kbd>
            <span>Profil</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded border border-zinc-700 text-zinc-300">Enter</kbd>
            <span>Lanjut</span>
          </div>
        </div>

        {/* Bottom Audio Toggle & Finish CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              const nextState = !isVoiceNarratorEnabled;
              setIsVoiceNarratorEnabled(nextState);
              sound.voiceEnabled = nextState;
              if (!nextState) {
                sound.cancelSpeech();
              } else {
                announceCommentary('Komentator balap diaktifkan!', 1.2);
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isVoiceNarratorEnabled
                ? 'bg-red-950/80 text-red-300 border-red-500/70'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            title="Tekan V untuk toggle suara narator"
          >
            {isVoiceNarratorEnabled ? <Volume2 className="w-3.5 h-3.5 text-red-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-500" />}
            <span className="hidden sm:inline">{isVoiceNarratorEnabled ? 'SUARA ON' : 'SUARA OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.cancelSpeech();
              onFinishAnimation();
            }}
            className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              phase === 'FINISH_LINE'
                ? 'bg-amber-400 hover:bg-amber-300 text-black hover:scale-105 active:scale-95 shadow-amber-500/30 animate-pulse font-black'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
            title="Tekan Enter atau Spasi untuk lanjut"
          >
            <span>{phase === 'FINISH_LINE' ? 'LANJUTKAN 🏁' : 'LEWATI'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
