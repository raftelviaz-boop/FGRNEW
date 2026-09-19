import { OnlineRoom, EmoteTaunt, PlayerState, RiderCard, BikeCard, ActionCard, EventCard, HazardCard } from '../types';

export type SocketEventHandler = (event: { type: string; [key: string]: any }) => void;

class MultiplayerSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Set<SocketEventHandler> = new Set();
  private reconnectTimer: any = null;
  private currentRoomCode: string | null = null;
  private userInfo: { userId: string; nickname: string; avatar: string; customPhoto?: string } | null = null;

  public isConnected = false;

  public connect(userInfo: { userId: string; nickname: string; avatar: string; customPhoto?: string }) {
    this.userInfo = userInfo;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      this.identify(userInfo);
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.userInfo) {
          this.identify(this.userInfo);
        }
        if (this.currentRoomCode) {
          this.joinRoom(this.currentRoomCode);
        }
        this.emitLocal({ type: 'SOCKET_CONNECTED' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handlers.forEach(handler => handler(data));
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.emitLocal({ type: 'SOCKET_DISCONNECTED' });
        // Auto-reconnect after 2 seconds
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.userInfo) {
              this.connect(this.userInfo);
            }
          }, 2000);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket connection error:', err);
      };
    } catch (e) {
      console.error('Error initiating WebSocket:', e);
    }
  }

  public subscribe(handler: SocketEventHandler) {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private emitLocal(event: any) {
    this.handlers.forEach(handler => handler(event));
  }

  private send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('Socket not open. Ready state:', this.ws?.readyState);
    }
  }

  public identify(user: { userId: string; nickname: string; avatar: string; customPhoto?: string }) {
    this.userInfo = user;
    this.send({
      type: 'IDENTIFY',
      userId: user.userId,
      nickname: user.nickname,
      avatar: user.avatar,
      customPhoto: user.customPhoto
    });
  }

  public createRoom(settings: any, maxPlayers: number = 4) {
    this.send({
      type: 'CREATE_ROOM',
      settings,
      maxPlayers
    });
  }

  public joinRoom(roomCode: string) {
    this.currentRoomCode = roomCode;
    this.send({
      type: 'JOIN_ROOM',
      roomCode
    });
  }

  public leaveRoom() {
    this.currentRoomCode = null;
    this.send({
      type: 'LEAVE_ROOM'
    });
  }

  public toggleReady() {
    this.send({
      type: 'TOGGLE_READY'
    });
  }

  public updateSettings(settings: any) {
    this.send({
      type: 'UPDATE_SETTINGS',
      settings
    });
  }

  public startGame(initPayload: {
    eventDeck: EventCard[];
    p1State: PlayerState;
    p2State: PlayerState;
    extraPlayers?: PlayerState[];
    allPlayersState?: PlayerState[];
  }) {
    this.send({
      type: 'START_GAME',
      ...initPayload
    });
  }

  public submitRider(rider: RiderCard) {
    this.send({
      type: 'DRAFT_CHOICE_RIDER',
      rider
    });
  }

  public submitBike(bike: BikeCard, currentEvent?: EventCard, currentHazard?: HazardCard) {
    this.send({
      type: 'DRAFT_CHOICE_BIKE',
      bike,
      currentEvent,
      currentHazard
    });
  }

  public proceedActionPhase() {
    this.send({
      type: 'PROCEED_ACTION_PHASE'
    });
  }

  public submitActions(actions: ActionCard[], energySpent: number, calculatedOutcome?: any) {
    this.send({
      type: 'SUBMIT_ACTIONS',
      actions,
      energySpent,
      calculatedOutcome
    });
  }

  public syncRoundResult(payload: {
    result: any;
    updatedP1: PlayerState;
    updatedP2: PlayerState;
  }) {
    this.send({
      type: 'SYNC_ROUND_RESULT',
      ...payload
    });
  }

  public readyNextRound(payload?: {
    nextP1Riders?: RiderCard[];
    nextP2Riders?: RiderCard[];
    nextEvent?: EventCard;
    nextHazard?: HazardCard;
  }) {
    this.send({
      type: 'READY_NEXT_ROUND',
      ...payload
    });
  }

  public sendEmote(emoji: string, text: string) {
    this.send({
      type: 'SEND_EMOTE',
      emoji,
      text
    });
  }
}

export const socketManager = new MultiplayerSocketManager();
