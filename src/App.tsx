import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flame, 
  Zap, 
  Users, 
  User, 
  Play, 
  RotateCcw, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Layers,
  Settings, 
  HelpCircle,
  Activity,
  Globe,
  CheckCircle2,
  Clock,
  LogOut,
  Radio
} from 'lucide-react';
import { 
  PlayerState, 
  RoundPhase, 
  EventCard, 
  HazardCard, 
  ActionCard, 
  RiderCard, 
  BikeCard, 
  GameSettings,
  UserProfile
} from './types';
import { 
  EVENTS_33_DECK, 
  HAZARDS_POOL, 
  RIDERS_POOL, 
  BIKES_POOL, 
  ACTION_CARDS_POOL 
} from './data/cards';
import { 
  shuffleArray, 
  drawRiderOptions, 
  drawBikeOptions, 
  drawStarterHand, 
  getEventDeck,
  calculateBasePoints, 
  calculateActionPoints, 
  makeAiRiderChoice, 
  makeAiBikeChoice, 
  makeAiActionDecisions 
} from './utils/gameLogic';
import { fetchCurrentUser, logoutUser, recordMatchResult } from './utils/auth';
import { socketManager } from './utils/multiplayerSocket';

import { RaceProgress } from './components/RaceProgress';
import { DraftPhase } from './components/DraftPhase';
import { EventReveal } from './components/EventReveal';
import { ActionPhase } from './components/ActionPhase';
import { RaceAnimationScreen } from './components/RaceAnimationScreen';
import { RoundResultModal } from './components/RoundResultModal';
import { MatchEndModal } from './components/MatchEndModal';
import { CardCodexModal } from './components/CardCodexModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileHeader } from './components/UserProfileHeader';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { RaceEmoteOverlay } from './components/RaceEmoteOverlay';
import { sound } from './audio/sound';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);

  // Online Match State
  const [onlineRoom, setOnlineRoom] = useState<any>(null);
  const [isOnlineHost, setIsOnlineHost] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentReadyAction, setOpponentReadyAction] = useState(false);
  const [opponentReadyNextRound, setOpponentReadyNextRound] = useState(false);
  const [onlineOpponentName, setOnlineOpponentName] = useState('Teman');
  const [onlineOpponentAvatar, setOnlineOpponentAvatar] = useState('SPRINTER');
  const [onlineStatusToast, setOnlineStatusToast] = useState<string | null>(null);

  // Game settings
  const [settings, setSettings] = useState<GameSettings>({
    targetWins: 10,
    startingEnergy: 3,
    energyPerRound: 2,
    maxEnergyCap: 10,
    enableHazards: true,
    soundEnabled: true,
    gameMode: 'PVE',
    expertMode: false
  });

  const [soundOn, setSoundOn] = useState(true);
  const [showCodex, setShowCodex] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Match State
  const [currentRound, setCurrentRound] = useState(1);
  const [roundPhase, setRoundPhase] = useState<RoundPhase>('DRAFT_RIDER');
  const [eventDeck, setEventDeck] = useState<EventCard[]>([]);
  const [currentEvent, setCurrentEvent] = useState<EventCard | null>(null);
  const [currentHazard, setCurrentHazard] = useState<HazardCard | undefined>(undefined);

  // Players
  const [player1, setPlayer1] = useState<PlayerState>({
    id: 'p1',
    name: 'Kamu',
    isAi: false,
    wins: 0,
    energy: 3,
    maxEnergy: 10,
    selectedRider: null,
    selectedBike: null,
    tacticalHand: [],
    playedActionsThisRound: [],
    usedUltimateThisMatch: false,
    riderDraftOptions: [],
    bikeDraftOptions: [],
    stats: {
      totalPointsScored: 0,
      energySpent: 0,
      skillsPlayed: 0,
      itemsUsed: 0,
      ultimatesUsed: 0,
      cleanWins: 0
    }
  });

  const [player2, setPlayer2] = useState<PlayerState>({
    id: 'p2',
    name: 'Lawan',
    isAi: true,
    aiPersonality: 'BALANCED',
    wins: 0,
    energy: 3,
    maxEnergy: 10,
    selectedRider: null,
    selectedBike: null,
    tacticalHand: [],
    playedActionsThisRound: [],
    usedUltimateThisMatch: false,
    riderDraftOptions: [],
    bikeDraftOptions: [],
    stats: {
      totalPointsScored: 0,
      energySpent: 0,
      skillsPlayed: 0,
      itemsUsed: 0,
      ultimatesUsed: 0,
      cleanWins: 0
    }
  });

  // Current selections in draft
  const [selectedRiderCandidate, setSelectedRiderCandidate] = useState<RiderCard | null>(null);
  const [selectedBikeCandidate, setSelectedBikeCandidate] = useState<BikeCard | null>(null);
  const [selectedActionsP1, setSelectedActionsP1] = useState<ActionCard[]>([]);
  const [selectedActionsP2, setSelectedActionsP2] = useState<ActionCard[]>([]);

  // Modal states for round result & match over
  const [showRaceAnimation, setShowRaceAnimation] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [roundWinner, setRoundWinner] = useState<'P1' | 'P2' | 'P3' | 'P4' | 'DRAW'>('DRAW');
  const [p1FinalRoundPoints, setP1FinalRoundPoints] = useState(0);
  const [p2FinalRoundPoints, setP2FinalRoundPoints] = useState(0);
  const [p1FinalRoundActions, setP1FinalRoundActions] = useState<ActionCard[]>([]);
  const [p2FinalRoundActions, setP2FinalRoundActions] = useState<ActionCard[]>([]);
  const [p1RaceBreakdown, setP1RaceBreakdown] = useState({ base: 0, bike: 0, actions: 0, total: 0 });
  const [p2RaceBreakdown, setP2RaceBreakdown] = useState({ base: 0, bike: 0, actions: 0, total: 0 });

  // Multiplayer Extra Players (for 3 or 4 players arena)
  const [extraPlayers, setExtraPlayers] = useState<PlayerState[]>([]);
  const [extraFinalRoundPoints, setExtraFinalRoundPoints] = useState<number[]>([]);
  const [extraFinalRoundActions, setExtraFinalRoundActions] = useState<ActionCard[][]>([]);
  const [extraRaceBreakdowns, setExtraRaceBreakdowns] = useState<Array<{ base: number; bike: number; actions: number; total: number }>>([]);

  // Load User & auto-connect
  useEffect(() => {
    fetchCurrentUser().then(user => {
      if (user) {
        setCurrentUser(user);
        setPlayer1(prev => ({ 
          ...prev, 
          name: user.nickname,
          avatar: user.avatar,
          customPhoto: user.customPhoto
        }));
        socketManager.connect({
          userId: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          customPhoto: user.customPhoto
        });
      }

      // Check if URL has ?room=... param
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        if (user) {
          setShowMultiplayerModal(true);
        } else {
          setShowAuthModal(true);
        }
      }
    });
  }, []);

  // Sound toggle effect
  useEffect(() => {
    sound.enabled = soundOn;
  }, [soundOn]);

  // SOCKET SUBSCRIPTION FOR REAL-TIME ONLINE MULTIPLAYER
  useEffect(() => {
    const unsubscribe = socketManager.subscribe((event) => {
      if (settings.gameMode !== 'PVP_ONLINE') return;

      if (event.type === 'PLAYER_RIDER_CHOSEN_STATUS') {
        const isMe = event.userId === currentUser?.id;
        if (!isMe) {
          const countInfo = event.totalReady && event.totalPlayers ? ` (${event.totalReady}/${event.totalPlayers})` : '';
          setOnlineStatusToast(`${event.nickname || 'Pembalap lawan'} telah memilih Rider!${countInfo}`);
          setTimeout(() => setOnlineStatusToast(null), 2500);
        }
      }

      if (event.type === 'BOTH_RIDERS_LOCKED') {
        setWaitingForOpponent(false);

        if (event.allRiders) {
          setPlayer1(prev => ({
            ...prev,
            selectedRider: event.allRiders[prev.id] || prev.selectedRider,
            bikeDraftOptions: drawBikeOptions()
          }));
          setPlayer2(prev => ({
            ...prev,
            selectedRider: event.allRiders[prev.id] || prev.selectedRider,
            bikeDraftOptions: []
          }));
          setExtraPlayers(prevList => prevList.map(ep => ({
            ...ep,
            selectedRider: event.allRiders[ep.id] || ep.selectedRider,
            bikeDraftOptions: []
          })));
        } else {
          const myRider = isOnlineHost ? event.p1Rider : event.p2Rider;
          const oppRider = isOnlineHost ? event.p2Rider : event.p1Rider;

          setPlayer1(prev => ({
            ...prev,
            selectedRider: myRider,
            bikeDraftOptions: drawBikeOptions()
          }));

          setPlayer2(prev => ({
            ...prev,
            selectedRider: oppRider,
            bikeDraftOptions: []
          }));
        }

        setSelectedRiderCandidate(null);
        setSelectedBikeCandidate(null);
        setRoundPhase('DRAFT_BIKE');
        sound.playCardFlip();
      }

      if (event.type === 'PLAYER_BIKE_CHOSEN_STATUS') {
        const isMe = event.userId === currentUser?.id;
        if (!isMe) {
          const countInfo = event.totalReady && event.totalPlayers ? ` (${event.totalReady}/${event.totalPlayers})` : '';
          setOnlineStatusToast(`${event.nickname || 'Lawan'} telah merakit sepedanya!${countInfo}`);
          setTimeout(() => setOnlineStatusToast(null), 2500);
        }
      }

      if (event.type === 'BOTH_BIKES_LOCKED') {
        setWaitingForOpponent(false);

        if (event.allBikes) {
          setPlayer1(prev => ({ ...prev, selectedBike: event.allBikes[prev.id] || prev.selectedBike }));
          setPlayer2(prev => ({ ...prev, selectedBike: event.allBikes[prev.id] || prev.selectedBike }));
          setExtraPlayers(prevList => prevList.map(ep => ({
            ...ep,
            selectedBike: event.allBikes[ep.id] || ep.selectedBike
          })));
        } else {
          const myBike = isOnlineHost ? event.p1Bike : event.p2Bike;
          const oppBike = isOnlineHost ? event.p2Bike : event.p1Bike;
          setPlayer1(prev => ({ ...prev, selectedBike: myBike }));
          setPlayer2(prev => ({ ...prev, selectedBike: oppBike }));
        }

        setCurrentEvent(event.currentEvent);
        setCurrentHazard(event.currentHazard);
        setSelectedBikeCandidate(null);
        setRoundPhase('EVENT_REVEAL');
        sound.playBellRing();
      }

      if (event.type === 'PHASE_CHANGED') {
        setRoundPhase(event.roundPhase);
      }

      if (event.type === 'PLAYER_ACTION_STATUS') {
        const isMe = event.userId === currentUser?.id;
        if (!isMe) {
          const countInfo = event.totalReady && event.totalPlayers ? ` (${event.totalReady}/${event.totalPlayers})` : '';
          setOpponentReadyAction(true);
          setOnlineStatusToast(`${event.nickname || 'Lawan'} telah mengunci taktiknya! ⚡${countInfo}`);
          setTimeout(() => setOnlineStatusToast(null), 3000);
        }
      }

      if (event.type === 'ACTIONS_RESOLVED') {
        setWaitingForOpponent(false);
        setOpponentReadyAction(false);

        if (event.allActions) {
          const myActions = event.allActions[player1.id]?.actions || [];
          const mySpent = event.allActions[player1.id]?.energySpent || 0;
          const oppActions = event.allActions[player2.id]?.actions || [];
          const oppSpent = event.allActions[player2.id]?.energySpent || 0;

          const extraActions = extraPlayers.map(p => event.allActions[p.id]?.actions || []);
          const extraSpent = extraPlayers.map(p => event.allActions[p.id]?.energySpent || 0);

          executeRoundResolution(myActions, oppActions, mySpent, oppSpent, extraActions, extraSpent);
        } else {
          const myActions = isOnlineHost ? event.p1Actions : event.p2Actions;
          const oppActions = isOnlineHost ? event.p2Actions : event.p1Actions;
          const mySpent = isOnlineHost ? event.p1EnergySpent : event.p2EnergySpent;
          const oppSpent = isOnlineHost ? event.p2EnergySpent : event.p1EnergySpent;

          executeRoundResolution(myActions, oppActions, mySpent, oppSpent);
        }
      }

      if (event.type === 'PLAYER_NEXT_ROUND_READY') {
        const isMe = event.userId === currentUser?.id;
        if (!isMe) {
          setOpponentReadyNextRound(true);
        }
      }

      if (event.type === 'ADVANCE_ROUND') {
        setWaitingForOpponent(false);
        setOpponentReadyNextRound(false);
        setShowRoundResult(false);

        setCurrentRound(event.nextRound);
        setRoundPhase('DRAFT_RIDER');
        setSelectedRiderCandidate(null);
        setSelectedBikeCandidate(null);
        setSelectedActionsP1([]);
        setSelectedActionsP2([]);

        const myNextRiders = isOnlineHost ? event.nextP1Riders : event.nextP2Riders;
        const oppNextRiders = isOnlineHost ? event.nextP2Riders : event.nextP1Riders;

        setPlayer1(prev => ({
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + settings.energyPerRound),
          selectedRider: null,
          selectedBike: null,
          riderDraftOptions: myNextRiders || drawRiderOptions(),
          bikeDraftOptions: []
        }));

        setPlayer2(prev => ({
          ...prev,
          energy: Math.min(prev.maxEnergy, prev.energy + settings.energyPerRound),
          selectedRider: null,
          selectedBike: null,
          riderDraftOptions: oppNextRiders || drawRiderOptions(),
          bikeDraftOptions: []
        }));

        setExtraPlayers(prevList => prevList.map(ep => ({
          ...ep,
          energy: Math.min(ep.maxEnergy, ep.energy + settings.energyPerRound),
          selectedRider: null,
          selectedBike: null,
          riderDraftOptions: drawRiderOptions(),
          bikeDraftOptions: []
        })));

        sound.playBellRing();
      }

      if (event.type === 'PLAYER_DISCONNECTED' || event.type === 'PLAYER_LEFT') {
        sound.playPedalRatchet();
        setOnlineStatusToast(`${event.nickname || 'Pembalap'} terputus dari balapan.`);
      }
    });

    return () => unsubscribe();
  }, [settings.gameMode, isOnlineHost, currentEvent, currentHazard, player1, player2, extraPlayers, currentUser]);

  // INITIALIZE A NEW LOCAL MATCH
  const startNewMatch = (
    targetWins = settings.targetWins, 
    mode = settings.gameMode, 
    racerCount = settings.racerCount || 2
  ) => {
    const rawDeck = getEventDeck(settings.expertMode);
    const shuffledEvents = shuffleArray(rawDeck);
    const p1StarterHand = drawStarterHand(settings.expertMode);
    const p2StarterHand = drawStarterHand(settings.expertMode);

    const p1RiderOpts = drawRiderOptions();
    const p2RiderOpts = drawRiderOptions();

    const p1Name = currentUser?.nickname || (mode === 'PVP_LOCAL' ? 'Player 1' : 'Kamu');

    const initialP1: PlayerState = {
      id: currentUser?.id || 'p1',
      name: p1Name,
      avatar: currentUser?.avatar,
      customPhoto: currentUser?.customPhoto,
      isAi: false,
      wins: 0,
      energy: settings.startingEnergy,
      maxEnergy: settings.maxEnergyCap,
      selectedRider: null,
      selectedBike: null,
      tacticalHand: p1StarterHand,
      playedActionsThisRound: [],
      usedUltimateThisMatch: false,
      riderDraftOptions: p1RiderOpts,
      bikeDraftOptions: [],
      stats: {
        totalPointsScored: 0,
        energySpent: 0,
        skillsPlayed: 0,
        itemsUsed: 0,
        ultimatesUsed: 0,
        cleanWins: 0
      }
    };

    const initialP2: PlayerState = {
      id: 'p2',
      name: mode === 'PVP_LOCAL' ? 'Player 2' : 'Lawan AI',
      isAi: mode === 'PVE',
      aiPersonality: settings.expertMode ? 'AGGRESSIVE' : 'BALANCED',
      wins: 0,
      energy: settings.startingEnergy,
      maxEnergy: settings.maxEnergyCap,
      selectedRider: null,
      selectedBike: null,
      tacticalHand: p2StarterHand,
      playedActionsThisRound: [],
      usedUltimateThisMatch: false,
      riderDraftOptions: p2RiderOpts,
      bikeDraftOptions: [],
      stats: {
        totalPointsScored: 0,
        energySpent: 0,
        skillsPlayed: 0,
        itemsUsed: 0,
        ultimatesUsed: 0,
        cleanWins: 0
      }
    };

    // Pre-pick AI Rider for P2
    if (initialP2.isAi) {
      const chosen = makeAiRiderChoice(p2RiderOpts);
      initialP2.selectedRider = chosen;
      initialP2.bikeDraftOptions = drawBikeOptions();
      const chosenBike = makeAiBikeChoice(initialP2.bikeDraftOptions, chosen);
      initialP2.selectedBike = chosenBike;
    }

    // Set up extra players if racerCount > 2 (3 or 4 racers)
    const extras: PlayerState[] = [];
    if (racerCount >= 3) {
      const p3RiderOpts = drawRiderOptions();
      const p3Starter = drawStarterHand(settings.expertMode);
      const isAiP3 = mode === 'PVE';
      const initialP3: PlayerState = {
        id: 'p3',
        name: mode === 'PVP_LOCAL' ? 'Player 3' : 'Pembalap 3 (AI)',
        avatar: 'PUNCHEUR',
        isAi: isAiP3,
        aiPersonality: 'CLUTCH',
        wins: 0,
        energy: settings.startingEnergy,
        maxEnergy: settings.maxEnergyCap,
        selectedRider: null,
        selectedBike: null,
        tacticalHand: p3Starter,
        playedActionsThisRound: [],
        usedUltimateThisMatch: false,
        riderDraftOptions: p3RiderOpts,
        bikeDraftOptions: [],
        stats: { totalPointsScored: 0, energySpent: 0, skillsPlayed: 0, itemsUsed: 0, ultimatesUsed: 0, cleanWins: 0 }
      };
      if (isAiP3) {
        const chosen = makeAiRiderChoice(p3RiderOpts);
        initialP3.selectedRider = chosen;
        initialP3.bikeDraftOptions = drawBikeOptions();
        initialP3.selectedBike = makeAiBikeChoice(initialP3.bikeDraftOptions, chosen);
      }
      extras.push(initialP3);
    }

    if (racerCount >= 4) {
      const p4RiderOpts = drawRiderOptions();
      const p4Starter = drawStarterHand(settings.expertMode);
      const isAiP4 = mode === 'PVE';
      const initialP4: PlayerState = {
        id: 'p4',
        name: mode === 'PVP_LOCAL' ? 'Player 4' : 'Pembalap 4 (AI)',
        avatar: 'ROULEUR',
        isAi: isAiP4,
        aiPersonality: 'AGGRESSIVE',
        wins: 0,
        energy: settings.startingEnergy,
        maxEnergy: settings.maxEnergyCap,
        selectedRider: null,
        selectedBike: null,
        tacticalHand: p4Starter,
        playedActionsThisRound: [],
        usedUltimateThisMatch: false,
        riderDraftOptions: p4RiderOpts,
        bikeDraftOptions: [],
        stats: { totalPointsScored: 0, energySpent: 0, skillsPlayed: 0, itemsUsed: 0, ultimatesUsed: 0, cleanWins: 0 }
      };
      if (isAiP4) {
        const chosen = makeAiRiderChoice(p4RiderOpts);
        initialP4.selectedRider = chosen;
        initialP4.bikeDraftOptions = drawBikeOptions();
        initialP4.selectedBike = makeAiBikeChoice(initialP4.bikeDraftOptions, chosen);
      }
      extras.push(initialP4);
    }

    setExtraPlayers(extras);
    setExtraFinalRoundPoints([]);
    setExtraFinalRoundActions([]);
    setExtraRaceBreakdowns([]);

    setEventDeck(shuffledEvents);
    setCurrentRound(1);
    setPlayer1(initialP1);
    setPlayer2(initialP2);
    setSelectedRiderCandidate(null);
    setSelectedBikeCandidate(null);
    setSelectedActionsP1([]);
    setSelectedActionsP2([]);
    setShowRoundResult(false);
    setRoundPhase('DRAFT_RIDER');
    setGameStarted(true);
    setOnlineRoom(null);
    setWaitingForOpponent(false);

    sound.playBellRing();
  };

  // START ONLINE MULTIPLAYER MATCH WITH FRIEND (2, 3, or 4 players)
  const handleStartOnlineMatch = (roomData: any, isHost: boolean) => {
    setIsOnlineHost(isHost);
    setOnlineRoom(roomData);

    const otherPlayers = roomData.players.filter((p: any) => p.userId !== currentUser?.id);
    const opponent = otherPlayers[0];
    const remainingOpponents = otherPlayers.slice(1);

    const oppName = opponent?.nickname || 'Teman';
    const oppAvatar = opponent?.avatar || 'SPRINTER';
    setOnlineOpponentName(oppName);
    setOnlineOpponentAvatar(oppAvatar);

    const targetWins = roomData.settings.targetWins;
    const expertMode = roomData.settings.expertMode;

    setSettings(s => ({
      ...s,
      gameMode: 'PVP_ONLINE',
      racerCount: roomData.players.length,
      targetWins,
      expertMode,
      enableHazards: roomData.settings.enableHazards
    }));

    const rawDeck = getEventDeck(expertMode);
    const shuffledEvents = shuffleArray(rawDeck);
    const myStarter = drawStarterHand(expertMode);
    const oppStarter = drawStarterHand(expertMode);

    const myRiders = drawRiderOptions();
    const oppRiders = drawRiderOptions();

    const initialP1: PlayerState = {
      id: currentUser?.id || 'p1',
      name: currentUser?.nickname || 'Kamu',
      avatar: currentUser?.avatar,
      customPhoto: currentUser?.customPhoto,
      isAi: false,
      wins: 0,
      energy: 3,
      maxEnergy: 10,
      selectedRider: null,
      selectedBike: null,
      tacticalHand: myStarter,
      playedActionsThisRound: [],
      usedUltimateThisMatch: false,
      riderDraftOptions: myRiders,
      bikeDraftOptions: [],
      stats: {
        totalPointsScored: 0,
        energySpent: 0,
        skillsPlayed: 0,
        itemsUsed: 0,
        ultimatesUsed: 0,
        cleanWins: 0
      }
    };

    const initialP2: PlayerState = {
      id: opponent?.userId || 'p2',
      name: oppName,
      avatar: oppAvatar,
      customPhoto: opponent?.customPhoto,
      isAi: false,
      wins: 0,
      energy: 3,
      maxEnergy: 10,
      selectedRider: null,
      selectedBike: null,
      tacticalHand: oppStarter,
      playedActionsThisRound: [],
      usedUltimateThisMatch: false,
      riderDraftOptions: oppRiders,
      bikeDraftOptions: [],
      stats: {
        totalPointsScored: 0,
        energySpent: 0,
        skillsPlayed: 0,
        itemsUsed: 0,
        ultimatesUsed: 0,
        cleanWins: 0
      }
    };

    // Extra opponents in online match (P3, P4)
    const onlineExtras: PlayerState[] = remainingOpponents.map((extraOpp: any, idx: number) => {
      const extraStarter = drawStarterHand(expertMode);
      const extraRiders = drawRiderOptions();
      return {
        id: extraOpp.userId || `p${idx + 3}`,
        name: extraOpp.nickname || `Teman ${idx + 2}`,
        avatar: extraOpp.avatar || (idx === 0 ? 'PUNCHEUR' : 'ROULEUR'),
        customPhoto: extraOpp.customPhoto,
        isAi: false,
        wins: 0,
        energy: 3,
        maxEnergy: 10,
        selectedRider: null,
        selectedBike: null,
        tacticalHand: extraStarter,
        playedActionsThisRound: [],
        usedUltimateThisMatch: false,
        riderDraftOptions: extraRiders,
        bikeDraftOptions: [],
        stats: {
          totalPointsScored: 0,
          energySpent: 0,
          skillsPlayed: 0,
          itemsUsed: 0,
          ultimatesUsed: 0,
          cleanWins: 0
        }
      };
    });

    setExtraPlayers(onlineExtras);
    setExtraFinalRoundPoints([]);
    setExtraFinalRoundActions([]);
    setExtraRaceBreakdowns([]);

    if (isHost) {
      socketManager.startGame({
        eventDeck: shuffledEvents,
        p1State: initialP1,
        p2State: initialP2,
        allPlayersState: [initialP1, initialP2, ...onlineExtras]
      });
    }

    setEventDeck(shuffledEvents);
    setCurrentRound(1);
    setPlayer1(initialP1);
    setPlayer2(initialP2);
    setSelectedRiderCandidate(null);
    setSelectedBikeCandidate(null);
    setSelectedActionsP1([]);
    setSelectedActionsP2([]);
    setShowRoundResult(false);
    setRoundPhase('DRAFT_RIDER');
    setGameStarted(true);
    setWaitingForOpponent(false);

    sound.playBellRing();
  };

  // ACTIVE HAND REFILL
  const handleRefillHand = (playerId: 'p1' | 'p2') => {
    const isP1 = playerId === 'p1';
    const targetPlayer = isP1 ? player1 : player2;
    const maxHand = settings.expertMode ? 4 : 5;

    if (targetPlayer.energy < 1 || targetPlayer.tacticalHand.length >= maxHand) {
      return;
    }

    const availableCards = ACTION_CARDS_POOL.filter(
      c => !targetPlayer.tacticalHand.some(h => h.id === c.id)
    );
    const shuffled = shuffleArray(availableCards.length > 0 ? availableCards : ACTION_CARDS_POOL);
    const drawnCard = shuffled[0];
    if (!drawnCard) return;

    if (isP1) {
      setPlayer1(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - 1),
        tacticalHand: [...prev.tacticalHand, drawnCard],
        stats: {
          ...prev.stats,
          energySpent: prev.stats.energySpent + 1
        }
      }));
    } else {
      setPlayer2(prev => ({
        ...prev,
        energy: Math.max(0, prev.energy - 1),
        tacticalHand: [...prev.tacticalHand, drawnCard],
        stats: {
          ...prev.stats,
          energySpent: prev.stats.energySpent + 1
        }
      }));
    }

    sound.playCardFlip();
  };

  // STEP 1 CONFIRMATION (Rider selected) -> Proceed to STEP 2 (Bike draft)
  const handleConfirmRider = () => {
    if (!selectedRiderCandidate) return;

    if (settings.gameMode === 'PVP_ONLINE') {
      setWaitingForOpponent(true);
      socketManager.submitRider(selectedRiderCandidate);
      return;
    }

    const drawnBikes = drawBikeOptions();
    setPlayer1(prev => ({
      ...prev,
      selectedRider: selectedRiderCandidate,
      bikeDraftOptions: drawnBikes
    }));

    setSelectedRiderCandidate(null);
    setSelectedBikeCandidate(null);
    setRoundPhase('DRAFT_BIKE');
    sound.playCardFlip();
  };

  // STEP 2 CONFIRMATION (Bike selected) -> Reveal Event
  const handleConfirmBike = () => {
    if (!selectedBikeCandidate) return;

    if (settings.gameMode === 'PVP_ONLINE') {
      setWaitingForOpponent(true);
      let nextEvent = eventDeck[0] || EVENTS_33_DECK[0];
      let nextHazard: HazardCard | undefined = undefined;
      if (settings.enableHazards && Math.random() < 0.45) {
        const shuffledHazards = shuffleArray(HAZARDS_POOL);
        nextHazard = shuffledHazards[0];
      }
      socketManager.submitBike(selectedBikeCandidate, nextEvent, nextHazard);
      return;
    }

    const nextEvent = eventDeck[0] || EVENTS_33_DECK[0];
    const remainingDeck = eventDeck.slice(1);

    let nextHazard: HazardCard | undefined = undefined;
    if (settings.enableHazards && Math.random() < 0.45) {
      const shuffledHazards = shuffleArray(HAZARDS_POOL);
      nextHazard = shuffledHazards[0];
    }

    setPlayer1(prev => ({
      ...prev,
      selectedBike: selectedBikeCandidate
    }));

    setCurrentEvent(nextEvent);
    setCurrentHazard(nextHazard);
    setEventDeck(remainingDeck);
    setSelectedBikeCandidate(null);
    setRoundPhase('EVENT_REVEAL');

    sound.playCardFlip();
  };

  // STEP 3 & 4 -> PROCEED TO STEP 5 (Action Phase)
  const handleProceedToActionPhase = () => {
    if (settings.gameMode === 'PVP_ONLINE') {
      socketManager.proceedActionPhase();
    }
    setSelectedActionsP1([]);
    setSelectedActionsP2([]);
    setRoundPhase('ACTION_PHASE');
  };

  // STEP 5: TOGGLE TACTICAL CARDS
  const handleToggleActionP1 = (action: ActionCard) => {
    setSelectedActionsP1(prev => {
      const exists = prev.some(a => a.id === action.id);
      if (exists) {
        return prev.filter(a => a.id !== action.id);
      } else {
        return [...prev, action];
      }
    });
  };

  const handleToggleActionP2 = (action: ActionCard) => {
    setSelectedActionsP2(prev => {
      const exists = prev.some(a => a.id === action.id);
      if (exists) {
        return prev.filter(a => a.id !== action.id);
      } else {
        return [...prev, action];
      }
    });
  };

  // STEP 5: LOCK ACTIONS & SUBMIT
  const handleLockActionsAndResolve = () => {
    if (!currentEvent) return;

    if (settings.gameMode === 'PVP_ONLINE') {
      const p1EnergySpent = selectedActionsP1.reduce((sum, a) => sum + a.cost, 0);
      setWaitingForOpponent(true);
      socketManager.submitActions(selectedActionsP1, p1EnergySpent);
      return;
    }

    // Local / AI Resolution
    let p2ActionsToPlay: ActionCard[] = [];
    if (player2.isAi) {
      const p1Base = calculateBasePoints(player1.selectedRider, player1.selectedBike, currentEvent, currentHazard);
      const p1ActionCalc = calculateActionPoints(selectedActionsP1, currentEvent, p1Base.totalBase, 0);

      p2ActionsToPlay = makeAiActionDecisions(
        player2,
        p1Base.totalBase + p1ActionCalc.actionPoints,
        0,
        currentEvent,
        currentHazard
      );
    } else {
      p2ActionsToPlay = selectedActionsP2;
    }

    const p1EnergySpent = selectedActionsP1.reduce((sum, a) => sum + a.cost, 0);
    const p2EnergySpent = p2ActionsToPlay.reduce((sum, a) => sum + a.cost, 0);

    // AI decisions for extra players (P3, P4)
    const extraActionsList: ActionCard[][] = [];
    const extraSpentList: number[] = [];

    extraPlayers.forEach(p => {
      if (p.isAi) {
        const p1Base = calculateBasePoints(player1.selectedRider, player1.selectedBike, currentEvent, currentHazard);
        const aiActions = makeAiActionDecisions(
          p,
          p1Base.totalBase,
          0,
          currentEvent,
          currentHazard
        );
        extraActionsList.push(aiActions);
        extraSpentList.push(aiActions.reduce((sum, a) => sum + a.cost, 0));
      } else {
        extraActionsList.push([]);
        extraSpentList.push(0);
      }
    });

    executeRoundResolution(
      selectedActionsP1, 
      p2ActionsToPlay, 
      p1EnergySpent, 
      p2EnergySpent, 
      extraActionsList, 
      extraSpentList
    );
  };

  // EXECUTE ROUND CALCULATION AND ANIMATE (Supports 2, 3, or 4 players)
  const executeRoundResolution = (
    p1Actions: ActionCard[], 
    p2Actions: ActionCard[], 
    p1Spent: number, 
    p2Spent: number,
    extraActionsList?: ActionCard[][],
    extraSpentList?: number[]
  ) => {
    if (!currentEvent) return;

    const p1Base = calculateBasePoints(player1.selectedRider, player1.selectedBike, currentEvent, currentHazard);
    const p2Base = calculateBasePoints(player2.selectedRider, player2.selectedBike, currentEvent, currentHazard);

    const p1ActionCalc = calculateActionPoints(p1Actions, currentEvent, p1Base.totalBase, p2Base.totalBase);
    const p2ActionCalc = calculateActionPoints(p2Actions, currentEvent, p2Base.totalBase, p1Base.totalBase + p1ActionCalc.actionPoints);

    // Calculate extra players (P3, P4)
    const extraBaseList = extraPlayers.map(p => calculateBasePoints(p.selectedRider, p.selectedBike, currentEvent, currentHazard));
    const extraActionCalcs = extraPlayers.map((p, idx) => {
      const actions = extraActionsList?.[idx] || [];
      return calculateActionPoints(actions, currentEvent, extraBaseList[idx].totalBase, p1Base.totalBase);
    });

    const maxOppReductionP1 = Math.max(p2ActionCalc.opponentReduction, ...(extraActionCalcs.map(c => c.opponentReduction || 0)));
    const maxOppReductionP2 = Math.max(p1ActionCalc.opponentReduction, ...(extraActionCalcs.map(c => c.opponentReduction || 0)));

    const p1Final = Math.max(0, p1Base.totalBase + p1ActionCalc.actionPoints - maxOppReductionP1);
    const p2Final = Math.max(0, p2Base.totalBase + p2ActionCalc.actionPoints - maxOppReductionP2);

    const extraFinalPoints = extraPlayers.map((p, idx) => {
      const oppReduction = Math.max(p1ActionCalc.opponentReduction, p2ActionCalc.opponentReduction);
      return Math.max(0, extraBaseList[idx].totalBase + extraActionCalcs[idx].actionPoints - oppReduction);
    });

    setP1FinalRoundPoints(p1Final);
    setP2FinalRoundPoints(p2Final);
    setP1FinalRoundActions(p1Actions);
    setP2FinalRoundActions(p2Actions);

    setExtraFinalRoundPoints(extraFinalPoints);
    setExtraFinalRoundActions(extraActionsList || extraPlayers.map(() => []));

    const p1RiderBase = p1Base.riderBase + p1Base.riderTerrainBonus;
    const p1BikeBase = p1Base.bikePerformancePoints + p1Base.bikeAbilityBonus + p1Base.synergyBonus - p1Base.hazardPenalty;
    const p1ActBonus = p1ActionCalc.actionPoints - maxOppReductionP1;

    const p2RiderBase = p2Base.riderBase + p2Base.riderTerrainBonus;
    const p2BikeBase = p2Base.bikePerformancePoints + p2Base.bikeAbilityBonus + p2Base.synergyBonus - p2Base.hazardPenalty;
    const p2ActBonus = p2ActionCalc.actionPoints - maxOppReductionP2;

    setP1RaceBreakdown({
      base: p1RiderBase,
      bike: p1BikeBase,
      actions: p1ActBonus,
      total: p1Final
    });

    setP2RaceBreakdown({
      base: p2RiderBase,
      bike: p2BikeBase,
      actions: p2ActBonus,
      total: p2Final
    });

    const extraBreakdowns = extraPlayers.map((p, idx) => {
      const b = extraBaseList[idx];
      const riderBase = b.riderBase + b.riderTerrainBonus;
      const bikeBase = b.bikePerformancePoints + b.bikeAbilityBonus + b.synergyBonus - b.hazardPenalty;
      const actBonus = extraActionCalcs[idx].actionPoints - Math.max(p1ActionCalc.opponentReduction, p2ActionCalc.opponentReduction);
      return {
        base: riderBase,
        bike: bikeBase,
        actions: actBonus,
        total: extraFinalPoints[idx]
      };
    });
    setExtraRaceBreakdowns(extraBreakdowns);

    // Determine round winner across all participating racers
    const scores = [
      { key: 'P1' as const, score: p1Final },
      { key: 'P2' as const, score: p2Final },
      ...extraPlayers.map((p, idx) => ({ key: (idx === 0 ? 'P3' : 'P4') as 'P3' | 'P4', score: extraFinalPoints[idx] }))
    ];
    scores.sort((a, b) => b.score - a.score);

    let winner: 'P1' | 'P2' | 'P3' | 'P4' | 'DRAW' = 'DRAW';
    if (scores[0].score > (scores[1]?.score ?? -1)) {
      winner = scores[0].key;
    } else {
      winner = 'DRAW';
    }

    setRoundWinner(winner);

    const p1PlayedUltimate = p1Actions.some(a => a.isUltimate);
    const p2PlayedUltimate = p2Actions.some(a => a.isUltimate);

    setPlayer1(prev => {
      const remainingHand = prev.tacticalHand.filter(card => !p1Actions.some(a => a.id === card.id));
      const newEnergy = Math.max(0, Math.min(prev.maxEnergy, prev.energy - p1Spent + p1ActionCalc.energyGained));

      return {
        ...prev,
        wins: winner === 'P1' ? prev.wins + 1 : prev.wins,
        energy: newEnergy,
        tacticalHand: remainingHand,
        usedUltimateThisMatch: prev.usedUltimateThisMatch || p1PlayedUltimate,
        stats: {
          ...prev.stats,
          totalPointsScored: prev.stats.totalPointsScored + p1Final,
          energySpent: prev.stats.energySpent + p1Spent,
          skillsPlayed: prev.stats.skillsPlayed + p1Actions.filter(a => a.type === 'SKILL').length,
          itemsUsed: prev.stats.itemsUsed + p1Actions.filter(a => a.type === 'ITEM').length,
          ultimatesUsed: prev.stats.ultimatesUsed + (p1PlayedUltimate ? 1 : 0)
        }
      };
    });

    setPlayer2(prev => {
      const remainingHand = prev.tacticalHand.filter(card => !p2Actions.some(a => a.id === card.id));
      const newEnergy = Math.max(0, Math.min(prev.maxEnergy, prev.energy - p2Spent + p2ActionCalc.energyGained));

      return {
        ...prev,
        wins: winner === 'P2' ? prev.wins + 1 : prev.wins,
        energy: newEnergy,
        tacticalHand: remainingHand,
        usedUltimateThisMatch: prev.usedUltimateThisMatch || p2PlayedUltimate,
        stats: {
          ...prev.stats,
          totalPointsScored: prev.stats.totalPointsScored + p2Final,
          energySpent: prev.stats.energySpent + p2Spent,
          skillsPlayed: prev.stats.skillsPlayed + p2Actions.filter(a => a.type === 'SKILL').length,
          itemsUsed: prev.stats.itemsUsed + p2Actions.filter(a => a.type === 'ITEM').length,
          ultimatesUsed: prev.stats.ultimatesUsed + (p2PlayedUltimate ? 1 : 0)
        }
      };
    });

    // Update stats and energy for extra players (P3, P4)
    setExtraPlayers(prevList => prevList.map((prev, idx) => {
      const playerKey = idx === 0 ? 'P3' : 'P4';
      const actions = extraActionsList?.[idx] || [];
      const spent = extraSpentList?.[idx] || 0;
      const calc = extraActionCalcs[idx];
      const remainingHand = prev.tacticalHand.filter(card => !actions.some(a => a.id === card.id));
      const newEnergy = Math.max(0, Math.min(prev.maxEnergy, prev.energy - spent + (calc?.energyGained || 0)));
      const playedUlt = actions.some(a => a.isUltimate);
      const won = winner === playerKey;

      return {
        ...prev,
        wins: won ? prev.wins + 1 : prev.wins,
        energy: newEnergy,
        tacticalHand: remainingHand,
        usedUltimateThisMatch: prev.usedUltimateThisMatch || playedUlt,
        stats: {
          ...prev.stats,
          totalPointsScored: prev.stats.totalPointsScored + (extraFinalPoints[idx] || 0),
          energySpent: prev.stats.energySpent + spent,
          skillsPlayed: prev.stats.skillsPlayed + actions.filter(a => a.type === 'SKILL').length,
          itemsUsed: prev.stats.itemsUsed + actions.filter(a => a.type === 'ITEM').length,
          ultimatesUsed: prev.stats.ultimatesUsed + (playedUlt ? 1 : 0)
        }
      };
    }));

    setShowRaceAnimation(true);
  };

  // STEP 7: PROCEED TO NEXT ROUND OR END MATCH (Supports 2, 3, 4 players)
  const handleProceedToNextRound = () => {
    const allNextWins = [
      { player: player1, wins: roundWinner === 'P1' ? player1.wins + 1 : player1.wins },
      { player: player2, wins: roundWinner === 'P2' ? player2.wins + 1 : player2.wins },
      ...extraPlayers.map((p, idx) => ({
        player: p,
        wins: roundWinner === (idx === 0 ? 'P3' : 'P4') ? p.wins + 1 : p.wins
      }))
    ];

    const matchChamp = allNextWins.find(item => item.wins >= settings.targetWins);
    if (matchChamp) {
      setShowRoundResult(false);
      setRoundPhase('MATCH_OVER');

      const iWon = matchChamp.player.id === player1.id;
      recordMatchResult(iWon, matchChamp.wins).then(updatedUser => {
        if (updatedUser) setCurrentUser(updatedUser);
      });
      return;
    }

    if (settings.gameMode === 'PVP_ONLINE') {
      setWaitingForOpponent(true);
      const nextP1R = drawRiderOptions();
      const nextP2R = drawRiderOptions();
      socketManager.readyNextRound({
        nextP1Riders: isOnlineHost ? nextP1R : undefined,
        nextP2Riders: isOnlineHost ? nextP2R : undefined
      });
      return;
    }

    // Local proceeding
    setShowRoundResult(false);
    const maxHand = settings.expertMode ? 4 : 5;
    const refillCost = settings.expertMode ? 1 : 0;

    const p1Available = ACTION_CARDS_POOL.filter(c => !player1.tacticalHand.some(h => h.id === c.id));
    const p1Shuffled = shuffleArray(p1Available.length > 0 ? p1Available : ACTION_CARDS_POOL);
    const p1NewCard = p1Shuffled[0];
    const p1CanDraw = player1.tacticalHand.length < maxHand && p1NewCard;
    const p1EnergyGain = p1CanDraw 
      ? Math.max(0, settings.energyPerRound - refillCost)
      : settings.energyPerRound;

    const p2Available = ACTION_CARDS_POOL.filter(c => !player2.tacticalHand.some(h => h.id === c.id));
    const p2Shuffled = shuffleArray(p2Available.length > 0 ? p2Available : ACTION_CARDS_POOL);
    const p2NewCard = p2Shuffled[0];
    const p2CanDraw = player2.tacticalHand.length < maxHand && p2NewCard;
    const p2EnergyGain = p2CanDraw 
      ? Math.max(0, settings.energyPerRound - refillCost)
      : settings.energyPerRound;

    const nextP1Riders = drawRiderOptions();
    const nextP2Riders = drawRiderOptions();

    setPlayer1(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + p1EnergyGain),
      tacticalHand: p1CanDraw ? [...prev.tacticalHand, p1NewCard] : prev.tacticalHand,
      selectedRider: null,
      selectedBike: null,
      riderDraftOptions: nextP1Riders,
      bikeDraftOptions: []
    }));

    setPlayer2(prev => {
      let aiChosenRider = null;
      let aiBikes: BikeCard[] = [];
      let aiChosenBike = null;

      if (prev.isAi) {
        aiChosenRider = makeAiRiderChoice(nextP2Riders);
        aiBikes = drawBikeOptions();
        aiChosenBike = makeAiBikeChoice(aiBikes, aiChosenRider);
      }

      return {
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + p2EnergyGain),
        tacticalHand: p2CanDraw ? [...prev.tacticalHand, p2NewCard] : prev.tacticalHand,
        selectedRider: aiChosenRider,
        selectedBike: aiChosenBike,
        riderDraftOptions: nextP2Riders,
        bikeDraftOptions: aiBikes
      };
    });

    // Advance extra players (P3, P4)
    setExtraPlayers(prevList => prevList.map(prev => {
      let aiChosenRider = null;
      let aiBikes: BikeCard[] = [];
      let aiChosenBike = null;
      const nextRiders = drawRiderOptions();

      if (prev.isAi) {
        aiChosenRider = makeAiRiderChoice(nextRiders);
        aiBikes = drawBikeOptions();
        aiChosenBike = makeAiBikeChoice(aiBikes, aiChosenRider);
      }

      const available = ACTION_CARDS_POOL.filter(c => !prev.tacticalHand.some(h => h.id === c.id));
      const shuffled = shuffleArray(available.length > 0 ? available : ACTION_CARDS_POOL);
      const newCard = shuffled[0];
      const canDraw = prev.tacticalHand.length < maxHand && newCard;
      const energyGain = canDraw 
        ? Math.max(0, settings.energyPerRound - refillCost)
        : settings.energyPerRound;

      return {
        ...prev,
        energy: Math.min(prev.maxEnergy, prev.energy + energyGain),
        tacticalHand: canDraw ? [...prev.tacticalHand, newCard] : prev.tacticalHand,
        selectedRider: aiChosenRider,
        selectedBike: aiChosenBike,
        riderDraftOptions: nextRiders,
        bikeDraftOptions: aiBikes
      };
    }));

    setCurrentRound(prev => prev + 1);
    setSelectedRiderCandidate(null);
    setSelectedBikeCandidate(null);
    setSelectedActionsP1([]);
    setSelectedActionsP2([]);
    setRoundPhase('DRAFT_RIDER');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setPlayer1(prev => ({ ...prev, name: 'Kamu' }));
    sound.playPedalRatchet();
  };

  const handleOpenMultiplayerModal = () => {
    if (!currentUser) {
      setShowAuthModal(true);
    } else {
      setShowMultiplayerModal(true);
    }
  };

  const allPlayersInMatch = [player1, player2, ...extraPlayers];
  const winningPlayerInMatch = allPlayersInMatch.find(p => p.wins >= settings.targetWins);
  const isMatchOver = roundPhase === 'MATCH_OVER' || Boolean(winningPlayerInMatch);
  const matchWinner = winningPlayerInMatch || (player1.wins >= player2.wins ? player1 : player2);
  const matchLoser = allPlayersInMatch.find(p => p.id !== matchWinner.id) || player2;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Toast notification for online match updates */}
      <AnimatePresence>
        {onlineStatusToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-900/95 border border-amber-400/60 shadow-2xl text-xs font-bold text-amber-300 flex items-center gap-2 backdrop-blur-md"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{onlineStatusToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Main Navigation Bar */}
      <header className="w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5 leading-none">
              FGR TCG <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">FIXED GEAR RACE</span>
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono">Tactical Racing Card Game • Online Multiplayer</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Profile & Auth Header Pill */}
          <UserProfileHeader
            user={currentUser}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onOpenMultiplayer={handleOpenMultiplayerModal}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              setPlayer1(prev => ({
                ...prev,
                name: updated.nickname,
                avatar: updated.avatar,
                customPhoto: updated.customPhoto
              }));
              socketManager.connect({
                userId: updated.id,
                nickname: updated.nickname,
                avatar: updated.avatar,
                customPhoto: updated.customPhoto
              });
            }}
          />

          <button
            onClick={() => setShowCodex(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-bold text-zinc-300 hover:text-white border border-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Codex</span>
          </button>

          <button
            onClick={() => setSoundOn(!soundOn)}
            className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title={soundOn ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
          </button>

          {gameStarted && (
            <button
              onClick={() => {
                if (settings.gameMode === 'PVP_ONLINE') {
                  socketManager.leaveRoom();
                }
                setGameStarted(false);
                setOnlineRoom(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Keluar / Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          )}
        </div>
      </header>

      {/* Online Room Banner if in active online match */}
      {gameStarted && settings.gameMode === 'PVP_ONLINE' && onlineRoom && (
        <div className="w-full bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-mono font-bold text-emerald-400">
              BALAPAN ONLINE LIVE • ROOM {onlineRoom.roomCode}
            </span>
            <span className="text-zinc-400 hidden sm:inline">
              | Lawan: <strong className="text-white">{onlineOpponentName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {waitingForOpponent && (
              <span className="text-[11px] text-amber-400 font-mono flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" /> Menunggu respon lawan...
              </span>
            )}
            {opponentReadyAction && roundPhase === 'ACTION_PHASE' && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Lawan sudah siap!
              </span>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col items-center w-full">
        {!gameStarted ? (
          /* START SCREEN & MATCH SETTINGS */
          <div className="w-full max-w-4xl mx-auto py-10 px-4 flex flex-col items-center text-center my-auto animate-in fade-in duration-300">
            {/* Logo Badge */}
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10 animate-pulse">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-amber-400 text-xs font-mono font-black mb-3">
              <Sparkles className="w-3.5 h-3.5" /> TACTICAL RACE CARD GAME
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
              FGR — FIXED GEAR RACE TCG
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
              Pilih 1 dari 2 Rider, kombinasikan dengan setup Bike, taklukkan 33 Event medan balapan, dan gunakan ⚡ Energy secara taktis untuk meraih <strong>10 Kemenangan!</strong>
            </p>

            {/* QUICK ONLINE MABAR BANNER */}
            <div className="w-full max-w-lg mb-6 p-4 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/60 border-2 border-emerald-500/40 flex items-center justify-between gap-3 shadow-xl">
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 mb-0.5">
                  <Users className="w-4 h-4" />
                  <span>MAIN BARENG TEMAN ONLINE</span>
                  <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1 rounded">LIVE</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Buat Room, bagikan Kode Balap, dan adu taktik 1v1 dengan teman!
                </p>
              </div>

              <button
                onClick={handleOpenMultiplayerModal}
                className="px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Mabar Sekarang</span>
              </button>
            </div>

            {/* Match Setup Options Box */}
            <div className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 mb-8 text-left shadow-2xl space-y-5">
              <h3 className="text-xs font-mono font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <Settings className="w-3.5 h-3.5 text-amber-400" /> PENGATURAN PERTANDINGAN
              </h3>

              {/* Target Wins */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  🎯 Target Kemenangan (Checkpoints):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '5 Wins (Quick)', val: 5 },
                    { label: '7 Wins (Standard)', val: 7 },
                    { label: '10 Wins (Official)', val: 10 }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => setSettings(s => ({ ...s, targetWins: opt.val }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        settings.targetWins === opt.val
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode Selector (3 options) */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2">
                  👥 Mode Permainan:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSettings(s => ({ ...s, gameMode: 'PVE' }))}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      settings.gameMode === 'PVE'
                        ? 'bg-blue-500 text-black border-blue-400 shadow-md font-black'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Solo vs AI</span>
                  </button>

                  <button
                    onClick={() => setSettings(s => ({ ...s, gameMode: 'PVP_LOCAL' }))}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      settings.gameMode === 'PVP_LOCAL'
                        ? 'bg-blue-500 text-black border-blue-400 shadow-md font-black'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Pass & Play</span>
                  </button>

                  <button
                    onClick={handleOpenMultiplayerModal}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      settings.gameMode === 'PVP_ONLINE'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md font-black'
                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/30'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>Online Teman</span>
                  </button>
                </div>
              </div>

              {/* Racer Count: 2, 3, or 4 Racers */}
              <div>
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between mb-2">
                  <span>🚴 Jumlah Pembalap di Arena:</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    {settings.racerCount === 4 ? '🔥 RAME (4 Pembalap)' : settings.racerCount === 3 ? '⚡ TRIO (3 Pembalap)' : 'DUEL (2 Pembalap)'}
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 2, label: '2 Pembalap', sub: 'Duel 1v1' },
                    { val: 3, label: '3 Pembalap', sub: 'Trio Sprint' },
                    { val: 4, label: '4 Pembalap', sub: 'Peloton Rame 🔥' }
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, racerCount: opt.val }))}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                        settings.racerCount === opt.val
                          ? 'bg-amber-400 text-black border-amber-400 shadow-md font-black'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={`text-[9px] ${settings.racerCount === opt.val ? 'text-black/80' : 'text-zinc-500'}`}>
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hazards Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-zinc-300 block">Extra Event / Hazards ⚠️</span>
                  <span className="text-[11px] text-zinc-500">Kondisi cuaca hujan, jalan rusak & kejutan balap</span>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, enableHazards: !s.enableHazards }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.enableHazards ? 'bg-amber-400' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                      settings.enableHazards ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* EXPERT MODE TOGGLE */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-2 border-red-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
                      <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-red-400">MODE PAKAR / EXPERT MODE</span>
                        <span className="text-[9px] font-mono font-bold bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/40">
                          VETERAN
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block">
                        Deck 50 Kartu Ekstrim + Hand Refill Strain (-1⚡)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playPedalRatchet();
                      setSettings(s => ({ ...s, expertMode: !s.expertMode }));
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                      settings.expertMode ? 'bg-red-500 shadow-lg shadow-red-500/30' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black absolute top-1 transition-all ${
                        settings.expertMode ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Launch Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => startNewMatch()}
                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black text-base tracking-wide flex items-center gap-2.5 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>{settings.expertMode ? 'MULAI EXPERT RACE (50 DECK)!' : 'MULAI RACE SEKARANG!'}</span>
              </button>

              <button
                onClick={handleOpenMultiplayerModal}
                className="px-6 py-4 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white font-bold text-sm tracking-wide flex items-center gap-2 border border-emerald-500/40 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Main Bareng Teman</span>
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE MATCH PLAY SCREEN */
          <div className="w-full flex flex-col flex-1">
            {/* Top Victory Progress Bar */}
            <RaceProgress
              player1={player1}
              player2={player2}
              extraPlayers={extraPlayers}
              targetWins={settings.targetWins}
              currentRound={currentRound}
              eventsRemaining={eventDeck.length}
              totalDeckSize={settings.expertMode ? 50 : 33}
              isExpertMode={settings.expertMode}
            />

            {/* Waiting indicator for online match */}
            {settings.gameMode === 'PVP_ONLINE' && waitingForOpponent && (
              <div className="max-w-md mx-auto my-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 shadow-lg animate-pulse">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Pilihan kamu tersimpan! Menunggu teman mengunci pilihan...</span>
              </div>
            )}

            {/* Active Stage Router */}
            <div className="flex-1 flex flex-col justify-center py-4">
              {(roundPhase === 'DRAFT_RIDER' || roundPhase === 'DRAFT_BIKE') && (
                <DraftPhase
                  phase={roundPhase}
                  activePlayer={player1}
                  onSelectRider={rider => setSelectedRiderCandidate(rider)}
                  onSelectBike={bike => setSelectedBikeCandidate(bike)}
                  onConfirmSelection={roundPhase === 'DRAFT_RIDER' ? handleConfirmRider : handleConfirmBike}
                  selectedRiderCandidate={selectedRiderCandidate}
                  selectedBikeCandidate={selectedBikeCandidate}
                />
              )}

              {roundPhase === 'EVENT_REVEAL' && currentEvent && (
                <EventReveal
                  event={currentEvent}
                  hazard={currentHazard}
                  player1={player1}
                  player2={player2}
                  extraPlayers={extraPlayers}
                  onProceedToActionPhase={handleProceedToActionPhase}
                />
              )}

              {roundPhase === 'ACTION_PHASE' && currentEvent && (
                <ActionPhase
                  event={currentEvent}
                  hazard={currentHazard}
                  player1={player1}
                  player2={player2}
                  extraPlayers={extraPlayers}
                  selectedActionsP1={selectedActionsP1}
                  selectedActionsP2={selectedActionsP2}
                  onToggleActionP1={handleToggleActionP1}
                  onToggleActionP2={handleToggleActionP2}
                  onLockActions={handleLockActionsAndResolve}
                  isAiOpponent={player2.isAi}
                  gameMode={settings.gameMode}
                  isExpertMode={settings.expertMode}
                  onRefillHand={handleRefillHand}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* RACE EMOTE OVERLAY (Real-time Taunts & Reactions during Online Matches) */}
      <RaceEmoteOverlay isOnlineMatch={settings.gameMode === 'PVP_ONLINE' && gameStarted} />

      {/* FULL RACE SPRINT ANIMATION SCREEN */}
      {showRaceAnimation && currentEvent && (
        <RaceAnimationScreen
          currentRound={currentRound}
          event={currentEvent}
          hazard={currentHazard}
          player1={player1}
          player2={player2}
          p1Base={p1RaceBreakdown.base}
          p1Bike={p1RaceBreakdown.bike}
          p1Actions={p1FinalRoundActions}
          p1ActionBonus={p1RaceBreakdown.actions}
          p1Total={p1FinalRoundPoints}
          p2Base={p2RaceBreakdown.base}
          p2Bike={p2RaceBreakdown.bike}
          p2Actions={p2FinalRoundActions}
          p2ActionBonus={p2RaceBreakdown.actions}
          p2Total={p2FinalRoundPoints}
          winner={roundWinner}
          targetWins={settings.targetWins}
          extraRacers={extraPlayers.map((ep, idx) => ({
            playerKey: (idx === 0 ? 'P3' : 'P4') as 'P3' | 'P4',
            player: ep,
            base: extraRaceBreakdowns[idx]?.base ?? 0,
            bike: extraRaceBreakdowns[idx]?.bike ?? 0,
            actions: extraFinalRoundActions[idx] ?? [],
            actionBonus: extraRaceBreakdowns[idx]?.actions ?? 0,
            total: extraFinalRoundPoints[idx] ?? 0
          }))}
          onFinishAnimation={() => {
            setShowRaceAnimation(false);
            setShowRoundResult(true);
          }}
        />
      )}

      {/* ROUND RESULT MODAL */}
      {showRoundResult && currentEvent && (
        <RoundResultModal
          currentRound={currentRound}
          event={currentEvent}
          hazard={currentHazard}
          player1={player1}
          player2={player2}
          p1TotalPoints={p1FinalRoundPoints}
          p2TotalPoints={p2FinalRoundPoints}
          p1Actions={p1FinalRoundActions}
          p2Actions={p2FinalRoundActions}
          winner={roundWinner}
          targetWins={settings.targetWins}
          onNextRound={handleProceedToNextRound}
          onReplayRace={() => {
            setShowRoundResult(false);
            setShowRaceAnimation(true);
          }}
          isExpertMode={settings.expertMode}
          extraPlayers={extraPlayers}
          extraResults={extraPlayers.map((ep, idx) => ({
            player: ep,
            key: (idx === 0 ? 'P3' : 'P4') as 'P3' | 'P4',
            totalPoints: extraFinalRoundPoints[idx] ?? 0,
            actions: extraFinalRoundActions[idx] ?? []
          }))}
        />
      )}

      {/* MATCH OVER CHAMPION MODAL */}
      {isMatchOver && (
        <MatchEndModal
          winner={matchWinner}
          loser={matchLoser}
          totalRounds={currentRound}
          targetWins={settings.targetWins}
          onRematch={() => {
            if (settings.gameMode === 'PVP_ONLINE') {
              handleOpenMultiplayerModal();
            } else {
              startNewMatch();
            }
          }}
          onOpenCodex={() => setShowCodex(true)}
        />
      )}

      {/* CODEX & ENCYCLOPEDIA MODAL */}
      {showCodex && (
        <CardCodexModal onClose={() => setShowCodex(false)} />
      )}

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setPlayer1(prev => ({ 
            ...prev, 
            name: user.nickname,
            avatar: user.avatar,
            customPhoto: user.customPhoto 
          }));
          socketManager.connect({
            userId: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            customPhoto: user.customPhoto
          });
          setShowMultiplayerModal(true);
        }}
      />

      {/* MULTIPLAYER LOBBY MODAL */}
      {currentUser && (
        <MultiplayerLobbyModal
          isOpen={showMultiplayerModal}
          onClose={() => setShowMultiplayerModal(false)}
          currentUser={currentUser}
          onStartOnlineMatch={handleStartOnlineMatch}
        />
      )}

      {/* Clean Footer */}
      <footer className="w-full border-t border-zinc-900 py-3 px-4 text-center text-zinc-600 text-[11px] font-mono">
        FGR Fixed Gear Race Tactical Card Game • Online Multiplayer & Akun Rider • First to 10 Wins
      </footer>
    </div>
  );
}
