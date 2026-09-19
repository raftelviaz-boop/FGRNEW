import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// In-memory data store with disk persistence fallback
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser {
  id: string;
  username: string;
  password?: string;
  nickname: string;
  avatar: string;
  customPhoto?: string;
  friendCode: string;
  isGuest: boolean;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    winStreak: number;
    bestStreak: number;
    checkpointsWon: number;
  };
  createdAt: string;
}

let users: Record<string, StoredUser> = {};
let tokens: Record<string, string> = {}; // token -> userId

// Load existing users if any
try {
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    users = JSON.parse(raw);
  }
} catch (e) {
  console.error('Error loading users file:', e);
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

function generateToken(userId: string) {
  const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  tokens[token] = userId;
  return token;
}

function getUserFromToken(req: express.Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const userId = tokens[token];
  if (!userId) return null;
  return users[userId] || null;
}

// ----------------------------------------------------
// AUTH REST API
// ----------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  const { username, password, nickname, avatar, customPhoto } = req.body;

  if (!username || !password || !nickname) {
    return res.status(400).json({ error: 'Username, password, dan nickname wajib diisi.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username minimal 3 karakter.' });
  }

  const existing = Object.values(users).find(u => !u.isGuest && u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'Username sudah digunakan, silakan pilih yang lain.' });
  }

  const id = 'user_' + Math.random().toString(36).substring(2, 9);
  const friendCode = 'FGR-' + Math.floor(1000 + Math.random() * 9000);

  const newUser: StoredUser = {
    id,
    username: cleanUsername,
    password: String(password),
    nickname: nickname.trim(),
    avatar: avatar || 'SPRINTER',
    customPhoto: customPhoto || undefined,
    friendCode,
    isGuest: false,
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      winStreak: 0,
      bestStreak: 0,
      checkpointsWon: 0
    },
    createdAt: new Date().toISOString()
  };

  users[id] = newUser;
  saveUsers();

  const token = generateToken(id);
  const { password: _, ...safeUser } = newUser;
  return res.json({ success: true, token, user: safeUser });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const user = Object.values(users).find(u => !u.isGuest && u.username.toLowerCase() === cleanUsername);

  if (!user || user.password !== String(password)) {
    return res.status(401).json({ error: 'Username atau password salah.' });
  }

  const token = generateToken(user.id);
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, token, user: safeUser });
});

app.post('/api/auth/guest', (req, res) => {
  const { nickname, avatar, customPhoto } = req.body;

  const id = 'guest_' + Math.random().toString(36).substring(2, 9);
  const friendCode = 'FGR-' + Math.floor(1000 + Math.random() * 9000);
  const chosenNick = (nickname && nickname.trim()) || `Rider${Math.floor(100 + Math.random() * 900)}`;

  const guestUser: StoredUser = {
    id,
    username: 'guest_' + id,
    nickname: chosenNick,
    avatar: avatar || 'CLIMBER',
    customPhoto: customPhoto || undefined,
    friendCode,
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

  users[id] = guestUser;
  saveUsers();

  const token = generateToken(id);
  const { password: _, ...safeUser } = guestUser;
  return res.json({ success: true, token, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

app.post('/api/auth/update-profile', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { nickname, avatar, customPhoto } = req.body;
  if (nickname) user.nickname = nickname.trim();
  if (avatar !== undefined) user.avatar = avatar;
  if (customPhoto !== undefined) user.customPhoto = customPhoto || undefined;

  saveUsers();
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

app.post('/api/auth/record-match', (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { won, checkpoints } = req.body;
  user.stats.matchesPlayed += 1;
  user.stats.checkpointsWon += Number(checkpoints) || 0;
  if (won) {
    user.stats.matchesWon += 1;
    user.stats.winStreak += 1;
    if (user.stats.winStreak > user.stats.bestStreak) {
      user.stats.bestStreak = user.stats.winStreak;
    }
  } else {
    user.stats.winStreak = 0;
  }

  saveUsers();
  const { password: _, ...safeUser } = user;
  return res.json({ success: true, user: safeUser });
});

// List open rooms for browsing
app.get('/api/rooms', (req, res) => {
  const openRooms = Object.values(activeRooms)
    .filter(r => r.status === 'LOBBY' && r.players.length < (r.maxPlayers || 4))
    .map(r => ({
      roomCode: r.roomCode,
      hostName: r.players[0]?.nickname || 'Host',
      hostAvatar: r.players[0]?.avatar || 'SPRINTER',
      targetWins: r.settings.targetWins,
      expertMode: r.settings.expertMode,
      currentPlayers: r.players.length,
      maxPlayers: r.maxPlayers || 4
    }));
  res.json({ success: true, rooms: openRooms });
});

// ----------------------------------------------------
// REAL-TIME WEBSOCKET MULTIPLAYER ROOMS
// ----------------------------------------------------

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  nickname: string;
  avatar: string;
  customPhoto?: string;
  roomCode?: string;
}

interface RoomState {
  roomCode: string;
  hostId: string;
  maxPlayers: number;
  settings: {
    targetWins: number;
    startingEnergy: number;
    energyPerRound: number;
    maxEnergyCap: number;
    enableHazards: boolean;
    soundEnabled: boolean;
    gameMode: 'PVP_ONLINE';
    expertMode: boolean;
    racerCount?: number;
  };
  status: 'LOBBY' | 'PLAYING' | 'FINISHED';
  currentRound: number;
  roundPhase: string;
  players: {
    userId: string;
    nickname: string;
    avatar: string;
    customPhoto?: string;
    role: 'HOST' | 'GUEST';
    isReady: boolean;
    isConnected: boolean;
  }[];
  // Game session in-progress data
  gameData?: {
    eventDeck: any[];
    currentEvent?: any;
    currentHazard?: any;
    p1?: any; // PlayerState
    p2?: any; // PlayerState
    allInitialPlayers?: any[];
    riderChoices?: Record<string, any>;
    bikeChoices?: Record<string, any>;
    actionChoices?: Record<string, { actions: any[]; energySpent: number }>;
    nextRoundReady?: Record<string, boolean>;
    p1ChoiceRider?: any;
    p2ChoiceRider?: any;
    p1ChoiceBike?: any;
    p2ChoiceBike?: any;
    p1Actions?: any[];
    p2Actions?: any[];
    p1EnergySpent?: number;
    p2EnergySpent?: number;
    p1ReadyAction?: boolean;
    p2ReadyAction?: boolean;
    p1ReadyNextRound?: boolean;
    p2ReadyNextRound?: boolean;
    lastResult?: any;
  };
}

const activeRooms: Record<string, RoomState> = {};
const clients: Map<WebSocket, ConnectedClient> = new Map();

function broadcastToRoom(roomCode: string, payload: any) {
  const room = activeRooms[roomCode];
  if (!room) return;

  const msg = JSON.stringify(payload);
  clients.forEach(client => {
    if (client.roomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  });
}

function generateRoomCode(): string {
  let code = '';
  let attempts = 0;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    code = `FGR-${num}`;
    attempts++;
  } while (activeRooms[code] && attempts < 100);
  return code;
}

// ----------------------------------------------------
// SERVER BOOTSTRAP & WEBSOCKET ATTACHMENT
// ----------------------------------------------------

async function startServer() {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const clientState: ConnectedClient = {
      ws,
      userId: '',
      nickname: 'Rider',
      avatar: 'SPRINTER'
    };
    clients.set(ws, clientState);

    ws.on('message', (messageRaw: string) => {
      try {
        const data = JSON.parse(messageRaw.toString());
        const { type } = data;

        if (type === 'IDENTIFY') {
          clientState.userId = data.userId || 'anon_' + Math.random().toString(36).substring(2, 7);
          clientState.nickname = data.nickname || 'Rider';
          clientState.avatar = data.avatar || 'SPRINTER';
          clientState.customPhoto = data.customPhoto;
          ws.send(JSON.stringify({ type: 'IDENTIFIED', success: true }));
          return;
        }

        if (type === 'CREATE_ROOM') {
          const roomCode = generateRoomCode();
          const maxPlayers = Math.min(4, Math.max(2, Number(data.maxPlayers) || 4));
          const newRoom: RoomState = {
            roomCode,
            hostId: clientState.userId,
            maxPlayers,
            status: 'LOBBY',
            currentRound: 1,
            roundPhase: 'LOBBY',
            settings: {
              targetWins: data.settings?.targetWins || 7,
              startingEnergy: 3,
              energyPerRound: 2,
              maxEnergyCap: 10,
              enableHazards: data.settings?.enableHazards ?? true,
              soundEnabled: true,
              gameMode: 'PVP_ONLINE',
              expertMode: data.settings?.expertMode ?? false,
              racerCount: maxPlayers
            },
            players: [
              {
                userId: clientState.userId,
                nickname: clientState.nickname,
                avatar: clientState.avatar,
                customPhoto: clientState.customPhoto,
                role: 'HOST',
                isReady: true,
                isConnected: true
              }
            ]
          };

          activeRooms[roomCode] = newRoom;
          clientState.roomCode = roomCode;

          ws.send(JSON.stringify({
            type: 'ROOM_CREATED',
            roomCode,
            room: newRoom,
            isHost: true
          }));
          return;
        }

        if (type === 'JOIN_ROOM') {
          const targetCode = (data.roomCode || '').trim().toUpperCase();
          const room = activeRooms[targetCode];

          if (!room) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room ${targetCode} tidak ditemukan.` }));
            return;
          }

          if (room.status !== 'LOBBY' && !room.players.some(p => p.userId === clientState.userId)) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room ${targetCode} sedang berlangsung pertandingan.` }));
            return;
          }

          const maxAllowed = room.maxPlayers || 4;
          const existingPlayer = room.players.find(p => p.userId === clientState.userId);
          if (!existingPlayer && room.players.length >= maxAllowed) {
            ws.send(JSON.stringify({ type: 'ERROR', message: `Room ${targetCode} sudah penuh (maksimal ${maxAllowed} pemain).` }));
            return;
          }

          clientState.roomCode = targetCode;

          if (existingPlayer) {
            existingPlayer.isConnected = true;
            existingPlayer.nickname = clientState.nickname;
            existingPlayer.avatar = clientState.avatar;
            existingPlayer.customPhoto = clientState.customPhoto;
          } else {
            room.players.push({
              userId: clientState.userId,
              nickname: clientState.nickname,
              avatar: clientState.avatar,
              customPhoto: clientState.customPhoto,
              role: 'GUEST',
              isReady: false,
              isConnected: true
            });
          }

          broadcastToRoom(targetCode, {
            type: 'ROOM_UPDATED',
            room
          });
          return;
        }

        if (type === 'UPDATE_SETTINGS') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || room.hostId !== clientState.userId || room.status !== 'LOBBY') return;

          room.settings = { ...room.settings, ...data.settings };
          broadcastToRoom(room.roomCode, {
            type: 'ROOM_UPDATED',
            room
          });
          return;
        }

        if (type === 'TOGGLE_READY') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room) return;

          const player = room.players.find(p => p.userId === clientState.userId);
          if (player) {
            player.isReady = !player.isReady;
            broadcastToRoom(room.roomCode, {
              type: 'ROOM_UPDATED',
              room
            });
          }
          return;
        }

        if (type === 'START_GAME') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || room.hostId !== clientState.userId) return;
          if (room.players.length < 2) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Tunggu teman bergabung terlebih dahulu!' }));
            return;
          }

          room.status = 'PLAYING';
          room.currentRound = 1;
          room.roundPhase = 'DRAFT_RIDER';

          // Initialize sync gameData payload provided by host
          room.gameData = {
            eventDeck: data.eventDeck || [],
            currentEvent: null,
            currentHazard: null,
            p1: data.p1State,
            p2: data.p2State,
            allInitialPlayers: data.allPlayersState || [data.p1State, data.p2State],
            riderChoices: {},
            bikeChoices: {},
            actionChoices: {},
            nextRoundReady: {},
            p1ReadyAction: false,
            p2ReadyAction: false,
            p1ReadyNextRound: false,
            p2ReadyNextRound: false
          };

          broadcastToRoom(room.roomCode, {
            type: 'GAME_STARTED',
            room,
            gameData: room.gameData
          });
          return;
        }

        if (type === 'DRAFT_CHOICE_RIDER') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || !room.gameData) return;

          const isP1 = room.players[0]?.userId === clientState.userId;
          if (isP1) {
            room.gameData.p1ChoiceRider = data.rider;
          } else if (room.players[1]?.userId === clientState.userId) {
            room.gameData.p2ChoiceRider = data.rider;
          }

          if (!room.gameData.riderChoices) room.gameData.riderChoices = {};
          room.gameData.riderChoices[clientState.userId] = data.rider;

          const totalConnected = room.players.filter(p => p.isConnected !== false).length;
          const chosenCount = Object.keys(room.gameData.riderChoices).length;

          broadcastToRoom(room.roomCode, {
            type: 'PLAYER_RIDER_CHOSEN_STATUS',
            userId: clientState.userId,
            nickname: clientState.nickname,
            isP1,
            ready: true,
            totalReady: chosenCount,
            totalPlayers: totalConnected
          });

          // Check if all connected players have chosen
          if (chosenCount >= totalConnected && totalConnected >= 2) {
            room.roundPhase = 'DRAFT_BIKE';
            broadcastToRoom(room.roomCode, {
              type: 'BOTH_RIDERS_LOCKED',
              p1Rider: room.gameData.p1ChoiceRider || room.gameData.riderChoices[room.players[0]?.userId],
              p2Rider: room.gameData.p2ChoiceRider || room.gameData.riderChoices[room.players[1]?.userId],
              allRiders: room.gameData.riderChoices,
              roundPhase: 'DRAFT_BIKE'
            });
          }
          return;
        }

        if (type === 'DRAFT_CHOICE_BIKE') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || !room.gameData) return;

          const isP1 = room.players[0]?.userId === clientState.userId;
          if (isP1) {
            room.gameData.p1ChoiceBike = data.bike;
          } else if (room.players[1]?.userId === clientState.userId) {
            room.gameData.p2ChoiceBike = data.bike;
          }

          if (!room.gameData.bikeChoices) room.gameData.bikeChoices = {};
          room.gameData.bikeChoices[clientState.userId] = data.bike;

          if (data.currentEvent) room.gameData.currentEvent = data.currentEvent;
          if (data.currentHazard) room.gameData.currentHazard = data.currentHazard;

          const totalConnected = room.players.filter(p => p.isConnected !== false).length;
          const chosenCount = Object.keys(room.gameData.bikeChoices).length;

          broadcastToRoom(room.roomCode, {
            type: 'PLAYER_BIKE_CHOSEN_STATUS',
            userId: clientState.userId,
            nickname: clientState.nickname,
            isP1,
            ready: true,
            totalReady: chosenCount,
            totalPlayers: totalConnected
          });

          // Check if all connected players have chosen bike
          if (chosenCount >= totalConnected && totalConnected >= 2) {
            room.roundPhase = 'EVENT_REVEAL';
            broadcastToRoom(room.roomCode, {
              type: 'BOTH_BIKES_LOCKED',
              p1Bike: room.gameData.p1ChoiceBike || room.gameData.bikeChoices[room.players[0]?.userId],
              p2Bike: room.gameData.p2ChoiceBike || room.gameData.bikeChoices[room.players[1]?.userId],
              allBikes: room.gameData.bikeChoices,
              currentEvent: room.gameData.currentEvent,
              currentHazard: room.gameData.currentHazard,
              roundPhase: 'EVENT_REVEAL'
            });
          }
          return;
        }

        if (type === 'PROCEED_ACTION_PHASE') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room) return;

          room.roundPhase = 'ACTION_PHASE';
          broadcastToRoom(room.roomCode, {
            type: 'PHASE_CHANGED',
            roundPhase: 'ACTION_PHASE'
          });
          return;
        }

        if (type === 'SUBMIT_ACTIONS') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || !room.gameData) return;

          const isP1 = room.players[0]?.userId === clientState.userId;
          if (isP1) {
            room.gameData.p1Actions = data.actions || [];
            room.gameData.p1EnergySpent = data.energySpent || 0;
            room.gameData.p1ReadyAction = true;
          } else if (room.players[1]?.userId === clientState.userId) {
            room.gameData.p2Actions = data.actions || [];
            room.gameData.p2EnergySpent = data.energySpent || 0;
            room.gameData.p2ReadyAction = true;
          }

          if (!room.gameData.actionChoices) room.gameData.actionChoices = {};
          room.gameData.actionChoices[clientState.userId] = {
            actions: data.actions || [],
            energySpent: data.energySpent || 0
          };

          const totalConnected = room.players.filter(p => p.isConnected !== false).length;
          const readyCount = Object.keys(room.gameData.actionChoices).length;

          broadcastToRoom(room.roomCode, {
            type: 'PLAYER_ACTION_STATUS',
            userId: clientState.userId,
            nickname: clientState.nickname,
            isP1,
            isReady: true,
            totalReady: readyCount,
            totalPlayers: totalConnected
          });

          // If all connected players submitted actions
          if (readyCount >= totalConnected && totalConnected >= 2) {
            const p1Id = room.players[0]?.userId;
            const p2Id = room.players[1]?.userId;
            broadcastToRoom(room.roomCode, {
              type: 'ACTIONS_RESOLVED',
              p1Actions: room.gameData.p1Actions || (p1Id ? room.gameData.actionChoices[p1Id]?.actions : []) || [],
              p2Actions: room.gameData.p2Actions || (p2Id ? room.gameData.actionChoices[p2Id]?.actions : []) || [],
              p1EnergySpent: room.gameData.p1EnergySpent || (p1Id ? room.gameData.actionChoices[p1Id]?.energySpent : 0) || 0,
              p2EnergySpent: room.gameData.p2EnergySpent || (p2Id ? room.gameData.actionChoices[p2Id]?.energySpent : 0) || 0,
              allActions: room.gameData.actionChoices,
              calculatedOutcome: data.calculatedOutcome
            });
          }
          return;
        }

        if (type === 'SYNC_ROUND_RESULT') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || !room.gameData) return;

          room.gameData.lastResult = data.result;
          broadcastToRoom(room.roomCode, {
            type: 'ROUND_RESULT_BROADCAST',
            result: data.result,
            updatedP1: data.updatedP1,
            updatedP2: data.updatedP2,
            allUpdatedPlayers: data.allUpdatedPlayers
          });
          return;
        }

        if (type === 'READY_NEXT_ROUND') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room || !room.gameData) return;

          const isP1 = room.players[0]?.userId === clientState.userId;
          if (isP1) {
            room.gameData.p1ReadyNextRound = true;
          } else if (room.players[1]?.userId === clientState.userId) {
            room.gameData.p2ReadyNextRound = true;
          }

          if (!room.gameData.nextRoundReady) room.gameData.nextRoundReady = {};
          room.gameData.nextRoundReady[clientState.userId] = true;

          const totalConnected = room.players.filter(p => p.isConnected !== false).length;
          const readyCount = Object.keys(room.gameData.nextRoundReady).length;

          broadcastToRoom(room.roomCode, {
            type: 'PLAYER_NEXT_ROUND_READY',
            userId: clientState.userId,
            nickname: clientState.nickname,
            isP1,
            totalReady: readyCount,
            totalPlayers: totalConnected
          });

          if (readyCount >= totalConnected && totalConnected >= 2) {
            // Reset for next round
            room.currentRound += 1;
            room.roundPhase = 'DRAFT_RIDER';
            room.gameData.riderChoices = {};
            room.gameData.bikeChoices = {};
            room.gameData.actionChoices = {};
            room.gameData.nextRoundReady = {};
            room.gameData.p1ChoiceRider = null;
            room.gameData.p2ChoiceRider = null;
            room.gameData.p1ChoiceBike = null;
            room.gameData.p2ChoiceBike = null;
            room.gameData.p1ReadyAction = false;
            room.gameData.p2ReadyAction = false;
            room.gameData.p1ReadyNextRound = false;
            room.gameData.p2ReadyNextRound = false;

            broadcastToRoom(room.roomCode, {
              type: 'ADVANCE_ROUND',
              nextRound: room.currentRound,
              roundPhase: 'DRAFT_RIDER',
              nextP1Riders: data.nextP1Riders,
              nextP2Riders: data.nextP2Riders,
              allNextRiders: data.allNextRiders,
              nextEvent: data.nextEvent,
              nextHazard: data.nextHazard
            });
          }
          return;
        }

        if (type === 'SEND_EMOTE') {
          const room = activeRooms[clientState.roomCode || ''];
          if (!room) return;

          broadcastToRoom(room.roomCode, {
            type: 'EMOTE_RECEIVED',
            senderId: clientState.userId,
            senderName: clientState.nickname,
            emoji: data.emoji,
            text: data.text,
            timestamp: Date.now()
          });
          return;
        }

        if (type === 'LEAVE_ROOM') {
          const roomCode = clientState.roomCode;
          if (roomCode && activeRooms[roomCode]) {
            const room = activeRooms[roomCode];
            room.players = room.players.filter(p => p.userId !== clientState.userId);

            if (room.players.length === 0) {
              delete activeRooms[roomCode];
            } else {
              if (room.hostId === clientState.userId && room.players[0]) {
                room.hostId = room.players[0].userId;
                room.players[0].role = 'HOST';
              }
              broadcastToRoom(roomCode, {
                type: 'PLAYER_LEFT',
                userId: clientState.userId,
                nickname: clientState.nickname,
                room
              });
            }
          }
          clientState.roomCode = undefined;
          ws.send(JSON.stringify({ type: 'LEFT_ROOM' }));
          return;
        }

      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    });

    ws.on('close', () => {
      const roomCode = clientState.roomCode;
      if (roomCode && activeRooms[roomCode]) {
        const room = activeRooms[roomCode];
        const player = room.players.find(p => p.userId === clientState.userId);
        if (player) {
          player.isConnected = false;
          broadcastToRoom(roomCode, {
            type: 'PLAYER_DISCONNECTED',
            userId: clientState.userId,
            nickname: clientState.nickname,
            room
          });
        }
      }
      clients.delete(ws);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server and WebSocket running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
