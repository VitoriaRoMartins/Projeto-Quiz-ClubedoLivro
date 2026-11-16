import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { AvatarConfig } from '../components/AvatarSystem';

export interface PlayerRecord {
  id: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  lastRoundPoints: number;
  correctCount: number;
  totalCorrectTimeSeconds: number;
  totalAnswered: number;
  previousRank: number;
  currentRank: number;
  isBot?: boolean;
  lastUpdated?: number;
}

export interface RoomControlMessage {
  type: 'ROOM_STATE' | 'PLAYER_UPDATE' | 'RESET_ROOM';
  roomCode: string;
  hostLockMode?: boolean;
  activeQuestionIndex?: number;
  presetId?: string;
  player?: PlayerRecord;
}

const DEFAULT_BOTS: Omit<PlayerRecord, 'previousRank' | 'currentRank'>[] = [
  {
    id: 'bot-atena',
    name: 'Camila (Leitora Voraz)',
    avatar: {
      skinColor: '#fde2c8',
      hairStyle: 'longo',
      hairColor: '#e6b84c',
      expression: 'confiante',
      accessory: 'coroa_louros',
      badge: 'coruja',
      bgColor: '#f59e0b',
    },
    score: 0,
    lastRoundPoints: 0,
    correctCount: 0,
    totalCorrectTimeSeconds: 0,
    totalAnswered: 0,
    isBot: true,
  },
  {
    id: 'bot-hades',
    name: 'Mateus • Clube',
    avatar: {
      skinColor: '#f3c6a5',
      hairStyle: 'curto',
      hairColor: '#271810',
      expression: 'focado',
      accessory: 'oculos',
      badge: 'espada',
      bgColor: '#8b5cf6',
    },
    score: 0,
    lastRoundPoints: 0,
    correctCount: 0,
    totalCorrectTimeSeconds: 0,
    totalAnswered: 0,
    isBot: true,
  },
  {
    id: 'bot-salem',
    name: 'Beatriz M.',
    avatar: {
      skinColor: '#d99b66',
      hairStyle: 'cacheado',
      hairColor: '#5c3824',
      expression: 'feliz',
      accessory: 'chapeu_mago',
      badge: 'livro',
      bgColor: '#10b981',
    },
    score: 0,
    lastRoundPoints: 0,
    correctCount: 0,
    totalCorrectTimeSeconds: 0,
    totalAnswered: 0,
    isBot: true,
  },
  {
    id: 'bot-rosie',
    name: 'Leticia S.',
    avatar: {
      skinColor: '#a86b3c',
      hairStyle: 'coque',
      hairColor: '#b84228',
      expression: 'feliz',
      accessory: 'fones',
      badge: 'rosa',
      bgColor: '#ec4899',
    },
    score: 0,
    lastRoundPoints: 0,
    correctCount: 0,
    totalCorrectTimeSeconds: 0,
    totalAnswered: 0,
    isBot: true,
  },
  {
    id: 'bot-ares',
    name: 'Rafael K.',
    avatar: {
      skinColor: '#693f23',
      hairStyle: 'moicano',
      hairColor: '#271810',
      expression: 'confiante',
      accessory: 'nenhum',
      badge: 'raio',
      bgColor: '#ef4444',
    },
    score: 0,
    lastRoundPoints: 0,
    correctCount: 0,
    totalCorrectTimeSeconds: 0,
    totalAnswered: 0,
    isBot: true,
  },
];

/**
 * Fórmula oficial do Prompt Mestre:
 * Pontos = 1000 * (1 - TempoDecorrido / (2 * TempoTotal))
 * Apenas respostas corretas concedem pontos.
 */
export function calculateQuestionScore(
  isCorrect: boolean,
  elapsedSeconds: number,
  totalSeconds: number
): number {
  if (!isCorrect) return 0;
  const clampedElapsed = Math.max(0, Math.min(elapsedSeconds, totalSeconds));
  const raw = 1000 * (1 - clampedElapsed / (2 * totalSeconds));
  return Math.round(Math.max(500, Math.min(1000, raw)));
}

/**
 * Ordena os participantes conforme critério de desempate:
 * 1. Maior pontuação total (score)
 * 2. Menor tempo acumulado total nas respostas corretas (totalCorrectTimeSeconds)
 */
export function sortAndRankPlayers(
  players: PlayerRecord[],
  prevRankMap?: Record<string, number>
): PlayerRecord[] {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.totalCorrectTimeSeconds !== b.totalCorrectTimeSeconds) {
      return a.totalCorrectTimeSeconds - b.totalCorrectTimeSeconds;
    }
    return a.name.localeCompare(b.name);
  });

  return sorted.map((p, idx) => {
    const newRank = idx + 1;
    const oldRank = prevRankMap?.[p.id] ?? (p.currentRank || newRank);
    return {
      ...p,
      previousRank: oldRank,
      currentRank: newRank,
    };
  });
}

export class RealtimeQuizStore {
  private roomCode: string;
  private bc: BroadcastChannel | null = null;
  private supabase: SupabaseClient | null = null;
  private supaChannel: RealtimeChannel | null = null;
  private listeners: Array<() => void> = [];
  public includeBots: boolean = true;

  constructor(roomCode = 'CLUBE2026') {
    this.roomCode = roomCode.toUpperCase();
    this.initChannels();
  }

  private getStorageKey(): string {
    return `clube_livro_room_${this.roomCode}`;
  }

  private initChannels() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.bc = new BroadcastChannel(`clube_livro_channel_${this.roomCode}`);
      this.bc.onmessage = (ev) => {
        this.handleIncomingMessage(ev.data);
      };
    }

    const supaUrl =
      import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('quiz_supabase_url') || '';
    const supaKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('quiz_supabase_key') || '';

    if (supaUrl && supaKey) {
      try {
        this.supabase = createClient(supaUrl, supaKey);
        this.supaChannel = this.supabase.channel(`room:${this.roomCode}`, {
          config: { broadcast: { self: false } },
        });
        this.supaChannel
          .on('broadcast', { event: 'quiz-event' }, (payload) => {
            if (payload.payload) {
              this.handleIncomingMessage(payload.payload as RoomControlMessage);
            }
          })
          .subscribe();
      } catch (e) {
        console.warn('Supabase Realtime opcional não inicializado:', e);
      }
    }
  }

  public isSupabaseConnected(): boolean {
    return Boolean(this.supabase);
  }

  public setRoomCode(newCode: string) {
    const cleaned = newCode.trim().toUpperCase() || 'CLUBE2026';
    if (cleaned === this.roomCode) return;
    if (this.bc) this.bc.close();
    if (this.supaChannel) this.supaChannel.unsubscribe();
    this.roomCode = cleaned;
    this.initChannels();
    this.notify();
  }

  public getRoomCode(): string {
    return this.roomCode;
  }

  private handleIncomingMessage(msg: RoomControlMessage) {
    if (!msg || msg.roomCode !== this.roomCode) return;
    if (msg.type === 'PLAYER_UPDATE' && msg.player) {
      this.savePlayerDirectly(msg.player);
      this.notify();
    } else if (msg.type === 'RESET_ROOM') {
      localStorage.removeItem(this.getStorageKey());
      this.notify();
    }
  }

  private broadcast(msg: RoomControlMessage) {
    if (this.bc) {
      this.bc.postMessage(msg);
    }
    if (this.supaChannel) {
      this.supaChannel.send({
        type: 'broadcast',
        event: 'quiz-event',
        payload: msg,
      });
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getPlayers(): PlayerRecord[] {
    const raw = localStorage.getItem(this.getStorageKey());
    let stored: PlayerRecord[] = [];
    if (raw) {
      try {
        stored = JSON.parse(raw);
      } catch {
        stored = [];
      }
    }

    if (this.includeBots && stored.filter((p) => p.isBot).length === 0) {
      const botsWithRanks: PlayerRecord[] = DEFAULT_BOTS.map((b, i) => ({
        ...b,
        previousRank: i + 1,
        currentRank: i + 1,
      }));
      stored = [...stored, ...botsWithRanks];
      localStorage.setItem(this.getStorageKey(), JSON.stringify(stored));
    } else if (!this.includeBots) {
      stored = stored.filter((p) => !p.isBot);
    }

    return sortAndRankPlayers(stored);
  }

  private savePlayerDirectly(player: PlayerRecord) {
    const current = this.getPlayers();
    const prevRankMap: Record<string, number> = {};
    current.forEach((p) => {
      prevRankMap[p.id] = p.currentRank;
    });

    const idx = current.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      current[idx] = { ...player, lastUpdated: Date.now() };
    } else {
      current.push({ ...player, lastUpdated: Date.now() });
    }

    const ranked = sortAndRankPlayers(current, prevRankMap);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(ranked));
  }

  public upsertPlayer(player: PlayerRecord) {
    this.savePlayerDirectly(player);
    this.broadcast({
      type: 'PLAYER_UPDATE',
      roomCode: this.roomCode,
      player,
    });
    this.notify();
  }

  /**
   * Atualiza os competidores bots na rodada atual para dar emoção estilo Kahoot
   * caso a pessoa esteja jogando sozinha ou com poucos participantes na sala
   */
  public simulateBotsForRound(questionIndex: number, totalSeconds: number) {
    if (!this.includeBots) return;
    const current = this.getPlayers();
    const prevRankMap: Record<string, number> = {};
    current.forEach((p) => {
      prevRankMap[p.id] = p.currentRank;
    });

    const updated = current.map((p) => {
      if (!p.isBot || p.totalAnswered > questionIndex) return p;
      // Probabilidade de acerto entre 65% e 85%
      const seed = (p.id.charCodeAt(4) + (questionIndex + 1) * 17) % 100;
      const isCorrect = seed < 74;
      const botTime = Number((2.5 + ((seed * 13) % (totalSeconds - 4))).toFixed(1));
      const pts = calculateQuestionScore(isCorrect, botTime, totalSeconds);

      return {
        ...p,
        score: p.score + pts,
        lastRoundPoints: pts,
        correctCount: p.correctCount + (isCorrect ? 1 : 0),
        totalCorrectTimeSeconds: Number(
          (p.totalCorrectTimeSeconds + (isCorrect ? botTime : 0)).toFixed(2)
        ),
        totalAnswered: questionIndex + 1,
        lastUpdated: Date.now(),
      };
    });

    const ranked = sortAndRankPlayers(updated, prevRankMap);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(ranked));
    this.notify();
  }

  public resetRoom() {
    localStorage.removeItem(this.getStorageKey());
    this.broadcast({
      type: 'RESET_ROOM',
      roomCode: this.roomCode,
    });
    this.notify();
  }
}

export const quizStore = new RealtimeQuizStore('CLUBE2026');
