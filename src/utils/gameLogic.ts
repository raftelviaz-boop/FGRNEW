import { 
  RiderCard, 
  BikeCard, 
  EventCard, 
  HazardCard, 
  ActionCard, 
  PlayerState, 
  TerrainCategory,
  RiderSpecialty,
  BikePerformance
} from '../types';
import { RIDERS_POOL, BIKES_POOL, EVENTS_33_DECK, EXPERT_50_DECK, HAZARDS_POOL, ACTION_CARDS_POOL } from '../data/cards';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getEventDeck(isExpert: boolean = false): EventCard[] {
  return isExpert ? EXPERT_50_DECK : EVENTS_33_DECK;
}

export function drawRiderOptions(): [RiderCard, RiderCard] {
  const shuffled = shuffleArray(RIDERS_POOL);
  return [shuffled[0], shuffled[1]];
}

export function drawBikeOptions(): [BikeCard, BikeCard] {
  const shuffled = shuffleArray(BIKES_POOL);
  return [shuffled[0], shuffled[1]];
}

export function drawStarterHand(isExpert: boolean = false): ActionCard[] {
  const shuffledSkills = shuffleArray(ACTION_CARDS_POOL.filter(c => c.type === 'SKILL'));
  const shuffledItems = shuffleArray(ACTION_CARDS_POOL.filter(c => c.type === 'ITEM'));
  const shuffledUltimates = shuffleArray(ACTION_CARDS_POOL.filter(c => c.type === 'ULTIMATE'));

  // In expert mode: 3 starter cards (1 Skill, 1 Item, 1 Ultimate)
  // In standard mode: 4 starter cards
  const hand: ActionCard[] = [
    shuffledSkills[0],
    shuffledItems[0],
    shuffledUltimates[0]
  ].filter(Boolean);

  if (!isExpert) {
    const remaining = shuffleArray(ACTION_CARDS_POOL.filter(c => !hand.some(h => h.id === c.id)));
    if (remaining[0]) {
      hand.push(remaining[0]);
    }
  }

  return hand;
}

export interface BasePointsBreakdown {
  riderBase: number;
  riderTerrainBonus: number;
  riderTerrainMatch: boolean;
  bikePerformancePoints: number;
  bikeAbilityBonus: number;
  bikeAbilityNote?: string;
  synergyBonus: number;
  synergyMatch: boolean;
  hazardPenalty: number;
  hazardNote?: string;
  totalBase: number;
}

export function getBikePerformanceForTerrain(bike: BikeCard, terrain: TerrainCategory): number {
  switch (terrain) {
    case 'TANJAKAN':
      return bike.performance.tanjakan;
    case 'DATAR':
      return bike.performance.datar;
    case 'TIKUNGAN':
      return bike.performance.tikungan;
    case 'TURUNAN':
      return bike.performance.turunan;
    default:
      return 3;
  }
}

export function calculateBasePoints(
  rider: RiderCard | null,
  bike: BikeCard | null,
  event: EventCard | null,
  hazard: HazardCard | null | undefined
): BasePointsBreakdown {
  if (!rider || !bike || !event) {
    return {
      riderBase: 0,
      riderTerrainBonus: 0,
      riderTerrainMatch: false,
      bikePerformancePoints: 0,
      bikeAbilityBonus: 0,
      synergyBonus: 0,
      synergyMatch: false,
      hazardPenalty: 0,
      totalBase: 0
    };
  }

  // 1. Rider Base Power & Specialty Terrain Bonus
  const riderBase = rider.basePower;
  const riderTerrainMatch = rider.favoredTerrain.includes(event.category);
  const riderTerrainBonus = riderTerrainMatch ? rider.terrainBonus : 0;

  // 2. Bike Performance based on the 4 Event categories (Tanjakan, Datar, Tikungan, Turunan)
  const bikePerformancePoints = getBikePerformanceForTerrain(bike, event.category);

  // 3. Bike Ability & Synergy Bonus
  let bikeAbilityBonus = 0;
  let bikeAbilityNote = '';

  const synergyMatch = bike.riderSynergy === rider.specialty;
  let synergyBonus = 0;

  if (synergyMatch) {
    synergyBonus = 1;
    if (bike.abilityEffect?.riderSynergyBonus) {
      synergyBonus = bike.abilityEffect.riderSynergyBonus;
    }
  }

  if (bike.abilityEffect?.turunanBonus && event.category === 'TURUNAN') {
    bikeAbilityBonus += bike.abilityEffect.turunanBonus;
    bikeAbilityNote = `+${bike.abilityEffect.turunanBonus} Ability Turunan Sepeda`;
  }

  // 4. Extra Event / Hazard effect
  let hazardPenalty = 0;
  let hazardNote = '';

  const isBikeShielded = bike.abilityEffect?.ignoreRoadHazard;

  if (hazard) {
    if (hazard.hazardType === 'CROWD') {
      hazardPenalty += 1;
      hazardNote = '+1 Sorak Penonton';
    } else if (hazard.hazardType === 'HUJAN_LICIN' || hazard.hazardType === 'WEATHER') {
      if (rider.specialty === 'SPRINTER') {
        hazardPenalty -= 1;
        hazardNote = '-1 Hujan Licin (Sprinter)';
      }
    } else if (hazard.hazardType === 'JALAN_RUSAK' || hazard.hazardType === 'POHON_TUMBANG' || hazard.hazardType === 'PENUTUPAN_JALAN') {
      if (isBikeShielded) {
        hazardNote = '🛡️ Kebal Rintangan (Ability Sepeda)';
      } else {
        hazardPenalty += hazard.effect.pointDelta;
        hazardNote = `${hazard.effect.pointDelta > 0 ? '+' : ''}${hazard.effect.pointDelta} Extra Event ${hazard.title}`;
      }
    } else if (hazard.effect.affectedTerrain === event.category) {
      hazardPenalty += hazard.effect.pointDelta;
      hazardNote = `${hazard.effect.pointDelta > 0 ? '+' : ''}${hazard.effect.pointDelta} Efek Medan Extra Event`;
    } else {
      hazardPenalty += hazard.effect.pointDelta;
      hazardNote = `${hazard.effect.pointDelta > 0 ? '+' : ''}${hazard.effect.pointDelta} ${hazard.title}`;
    }
  }

  const totalBase = Math.max(0, riderBase + riderTerrainBonus + bikePerformancePoints + bikeAbilityBonus + synergyBonus + hazardPenalty);

  return {
    riderBase,
    riderTerrainBonus,
    riderTerrainMatch,
    bikePerformancePoints,
    bikeAbilityBonus,
    bikeAbilityNote,
    synergyBonus,
    synergyMatch,
    hazardPenalty,
    hazardNote,
    totalBase
  };
}

export function calculateActionPoints(
  actions: ActionCard[],
  event: EventCard | null,
  currentPoints: number,
  opponentPoints: number,
  bike?: BikeCard | null
): { actionPoints: number; opponentReduction: number; energyGained: number } {
  let actionPoints = 0;
  let opponentReduction = 0;
  let energyGained = 0;

  if (!event) return { actionPoints: 0, opponentReduction: 0, energyGained: 0 };

  const hasSkillPlayed = actions.some(a => a.type === 'SKILL');
  if (hasSkillPlayed && bike?.abilityEffect?.skillPointBonus) {
    actionPoints += bike.abilityEffect.skillPointBonus;
  }

  actions.forEach(action => {
    // 1. Direct point bonus
    if (action.applyEffect.pointBonus) {
      actionPoints += action.applyEffect.pointBonus;
    }

    // 2. Terrain specific bonus
    if (action.applyEffect.terrainBonusMap && action.applyEffect.terrainBonusMap[event.category]) {
      actionPoints += action.applyEffect.terrainBonusMap[event.category]!;
    }

    // 3. Conditional if behind
    if (action.applyEffect.conditionalBehindBonus && currentPoints <= opponentPoints) {
      actionPoints += action.applyEffect.conditionalBehindBonus;
    }

    // 4. Opponent reduction
    if (action.applyEffect.opponentPointReduction) {
      opponentReduction += action.applyEffect.opponentPointReduction;
    }

    // 5. Energy gains
    if (action.applyEffect.energyDelta && action.applyEffect.energyDelta > 0) {
      energyGained += action.applyEffect.energyDelta;
    }
  });

  return { actionPoints, opponentReduction, energyGained };
}

// SMART AI DECISION LOGIC
export function makeAiRiderChoice(options: RiderCard[]): RiderCard {
  return options[0].basePower >= options[1].basePower ? options[0] : options[1];
}

export function makeAiBikeChoice(options: BikeCard[], chosenRider: RiderCard): BikeCard {
  // Check synergy first
  for (const bike of options) {
    if (bike.riderSynergy === chosenRider.specialty) {
      return bike;
    }
  }
  // Otherwise pick highest overall performance
  const avg1 = (options[0].performance.tanjakan + options[0].performance.datar + options[0].performance.tikungan + options[0].performance.turunan);
  const avg2 = (options[1].performance.tanjakan + options[1].performance.datar + options[1].performance.tikungan + options[1].performance.turunan);
  return avg1 >= avg2 ? options[0] : options[1];
}

export function makeAiActionDecisions(
  aiState: PlayerState,
  humanEstimatedPoints: number,
  aiBasePoints: number,
  event: EventCard,
  hazard?: HazardCard
): ActionCard[] {
  const chosenActions: ActionCard[] = [];
  let currentAiPoints = aiBasePoints;
  let currentEnergy = aiState.energy;
  let usedUltimate = aiState.usedUltimateThisMatch;

  if (aiState.tacticalHand.length === 0 || currentEnergy <= 0) {
    return chosenActions;
  }

  const personality = aiState.aiPersonality || 'BALANCED';

  // 1. FREE RECOVERY / ENERGY CARDS
  const freeEnergyCards = aiState.tacticalHand.filter(c => c.cost === 0 && (c.applyEffect.energyDelta || 0) > 0);
  for (const freeCard of freeEnergyCards) {
    if (!chosenActions.some(c => c.id === freeCard.id)) {
      chosenActions.push(freeCard);
      currentEnergy += freeCard.applyEffect.energyDelta || 0;
    }
  }

  // 2. Score potential value of each card in hand for this exact event
  const evaluatedCards = aiState.tacticalHand
    .filter(card => !chosenActions.some(c => c.id === card.id))
    .map(card => {
      let score = 0;
      let pointValue = card.applyEffect.pointBonus || 0;

      // Terrain bonus match
      if (card.applyEffect.terrainBonusMap && card.applyEffect.terrainBonusMap[event.category]) {
        pointValue += card.applyEffect.terrainBonusMap[event.category]!;
        score += 4;
      }

      // Drafting / Behind bonus
      if (card.applyEffect.conditionalBehindBonus && currentAiPoints <= humanEstimatedPoints) {
        pointValue += card.applyEffect.conditionalBehindBonus;
        score += 5;
      }

      // Opponent disruption
      if (card.applyEffect.opponentPointReduction) {
        pointValue += card.applyEffect.opponentPointReduction;
        score += 3;
      }

      // Hazard nullification
      if (card.applyEffect.ignoreHazard && hazard && hazard.effect.pointDelta < 0) {
        pointValue += Math.abs(hazard.effect.pointDelta);
        score += 3;
      }

      // Bike synergy with skills
      if (card.type === 'SKILL' && aiState.selectedBike?.abilityEffect?.skillPointBonus) {
        pointValue += aiState.selectedBike.abilityEffect.skillPointBonus;
        score += 2;
      }

      score += pointValue * 2 - card.cost;

      return {
        card,
        score,
        pointValue
      };
    });

  evaluatedCards.sort((a, b) => b.score - a.score);

  const pointsGap = humanEstimatedPoints - currentAiPoints;
  const isMatchCritical = aiState.wins >= 8 || pointsGap >= 2;

  for (const { card, pointValue } of evaluatedCards) {
    let effectiveCost = card.cost;
    if (card.type === 'ITEM' && aiState.selectedBike?.abilityEffect?.itemEnergyDiscount) {
      effectiveCost = Math.max(0, effectiveCost - aiState.selectedBike.abilityEffect.itemEnergyDiscount);
    }

    if (currentEnergy < effectiveCost) continue;

    if (card.isUltimate) {
      if (usedUltimate) continue;
      const shouldTriggerUltimate = 
        pointsGap >= 0 || 
        isMatchCritical || 
        personality === 'AGGRESSIVE' || 
        Math.random() < 0.5;

      if (!shouldTriggerUltimate) continue;
    }

    const isTrailing = currentAiPoints <= humanEstimatedPoints;
    const isClose = Math.abs(currentAiPoints - humanEstimatedPoints) <= 1;
    const isGoodValue = pointValue >= 2 || effectiveCost <= 1;

    if (isTrailing || (isClose && isGoodValue) || (currentEnergy >= 5 && isGoodValue)) {
      chosenActions.push(card);
      currentEnergy -= effectiveCost;
      currentAiPoints += pointValue;
      if (card.isUltimate) {
        usedUltimate = true;
      }

      if (currentAiPoints >= humanEstimatedPoints + 2 && personality !== 'AGGRESSIVE') {
        break;
      }
    }
  }

  return chosenActions;
}

export const TERRAIN_META: Record<TerrainCategory, { label: string; icon: string; bgBadge: string; textBadge: string; border: string; desc: string }> = {
  TANJAKAN: {
    label: '⛰️ TANJAKAN',
    icon: 'Mountain',
    bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    textBadge: 'text-emerald-400',
    border: 'border-emerald-500',
    desc: 'Spesialis Climber & Rasio Gigi Ringan'
  },
  DATAR: {
    label: '⚡ DATAR',
    icon: 'Zap',
    bgBadge: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
    textBadge: 'text-amber-400',
    border: 'border-amber-500',
    desc: 'Spesialis Sprinter & Top Speed Berat'
  },
  TIKUNGAN: {
    label: '🔄 TIKUNGAN',
    icon: 'Compass',
    bgBadge: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    textBadge: 'text-blue-400',
    border: 'border-blue-500',
    desc: 'Spesialis Handler, Chicane & Skid Drift'
  },
  TURUNAN: {
    label: '📉 TURUNAN',
    icon: 'TrendingDown',
    bgBadge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    textBadge: 'text-cyan-400',
    border: 'border-cyan-500',
    desc: 'Kecepatan Gravitasi & Aero Downhill'
  }
};
