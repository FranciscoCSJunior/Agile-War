import { create } from 'zustand';
import type {
  FeedbackState,
  Phase,
  Player,
  Question,
  TerritoryState,
  WinReason,
} from '../types';
import {
  ADJACENCY,
  ALL_TERRITORY_IDS,
  CONTINENT_MAP,
  CONTINENTS,
  TERRITORY_MAP,
  areAdjacent,
} from '../data/mapData';
import { QUESTIONS } from '../data/questions';
import { PLAYER_COLORS, PLAYER_COLOR_NAMES, SETUP_POOL_BY_PLAYERS, shuffle } from '../utils/random';

interface GameStore {
  phase: Phase;
  players: Player[];
  currentPlayerIndex: number;
  territories: Record<string, TerritoryState>;

  reinforcementsRemaining: number;

  setupPool: Record<string, number>;
  setupPlayerIndex: number;

  selectedSource: string | null;
  fortifyTarget: string | null;
  fortifyAmount: number;

  actionHint: string | null;

  pendingQuestion: Question | null;
  pendingAttack: { sourceId: string; targetId: string } | null;
  feedback: FeedbackState | null;

  quizDeck: Question[];

  log: string[];
  winnerId: string | null;
  winReason: WinReason | null;

  startSetup: (numPlayers: number, names: string[]) => void;
  placeSetupArmy: (territoryId: string) => void;

  selectAttackSource: (territoryId: string) => void;
  selectAttackTarget: (territoryId: string) => void;
  answerQuestion: (choiceIndex: number) => void;
  closeFeedback: () => void;
  endAttackPhase: () => void;

  placeReinforcement: (territoryId: string) => void;
  goToAttackPhase: () => void;

  selectFortifyTarget: (territoryId: string) => void;
  setFortifyAmount: (n: number) => void;
  confirmFortify: () => void;
  skipFortify: () => void;
  clearFortifySelection: () => void;
  endTurn: () => void;

  resetGame: () => void;
  hoveredContinentId: string | null;
  setHoveredContinentId: (id: string | null) => void;
}

const initialState = {
  phase: 'setup-players' as Phase,
  players: [] as Player[],
  currentPlayerIndex: 0,
  territories: {} as Record<string, TerritoryState>,
  reinforcementsRemaining: 0,
  setupPool: {} as Record<string, number>,
  setupPlayerIndex: 0,
  selectedSource: null as string | null,
  fortifyTarget: null as string | null,
  fortifyAmount: 1,
  actionHint: null as string | null,
  pendingQuestion: null as Question | null,
  pendingAttack: null as { sourceId: string; targetId: string } | null,
  feedback: null as FeedbackState | null,
  quizDeck: [] as Question[],
  log: [] as string[],
  winnerId: null as string | null,
  winReason: null as WinReason | null,
  hoveredContinentId: null as string | null,
};

function currentPlayerId(s: Pick<GameStore, 'players' | 'currentPlayerIndex'>): string {
  return s.players[s.currentPlayerIndex]?.id;
}

function ownedTerritoryIds(
  territories: Record<string, TerritoryState>,
  playerId: string,
): string[] {
  return Object.keys(territories).filter((id) => territories[id].ownerId === playerId);
}

function computeReinforcements(
  territories: Record<string, TerritoryState>,
  playerId: string,
): number {
  const owned = ownedTerritoryIds(territories, playerId);
  const base = Math.max(3, Math.floor(owned.length / 3));
  let bonus = 0;
  for (const c of CONTINENTS) {
    const fullyOwned = c.territoryIds.every((id) => territories[id]?.ownerId === playerId);
    if (fullyOwned) bonus += c.bonus;
  }
  return base + bonus;
}

function drawQuestion(deck: Question[]): { question: Question; rest: Question[] } {
  let d = deck;
  if (d.length === 0) {
    d = shuffle(QUESTIONS);
  }
  const [question, ...rest] = d;
  return { question, rest };
}

function nextActivePlayerIndex(players: Player[], fromIndex: number): number {
  const n = players.length;
  let idx = fromIndex;
  for (let i = 0; i < n; i++) {
    idx = (idx + 1) % n;
    if (!players[idx].eliminated) return idx;
  }
  return fromIndex;
}

function countRemainingPlayers(players: Player[]): number {
  return players.filter((p) => !p.eliminated).length;
}

// O jogador domina por completo o continente que é o seu objetivo?
function continentFullyOwnedBy(
  territories: Record<string, TerritoryState>,
  continentId: Player['objectiveContinentId'],
  playerId: string,
): boolean {
  const continent = CONTINENT_MAP[continentId];
  if (!continent) return false;
  return continent.territoryIds.every((id) => territories[id]?.ownerId === playerId);
}

// Algum território do jogador, com 2+ exércitos, faz fronteira com um inimigo?
function hasAnyValidAttack(territories: Record<string, TerritoryState>, playerId: string): boolean {
  return Object.entries(territories).some(([id, t]) => {
    if (t.ownerId !== playerId || t.armies < 2) return false;
    return (ADJACENCY[id] ?? []).some((nid) => territories[nid]?.ownerId !== playerId);
  });
}

export const useGameStore = create<GameStore>()((set, get) => ({
  ...initialState,

  startSetup: (numPlayers, names) => {
    // Cada jogador recebe um continente-objetivo distinto (sorteado entre os 7
    // métodos ágeis). Como numPlayers <= 6 < 7 continentes, sempre há
    // continentes suficientes para que nenhum objetivo se repita.
    const shuffledContinentIds = shuffle(CONTINENTS.map((c) => c.id));

    const players: Player[] = Array.from({ length: numPlayers }, (_, i) => ({
      id: `p${i + 1}`,
      name: names[i]?.trim() || `Jogador ${i + 1} (${PLAYER_COLOR_NAMES[i]})`,
      color: PLAYER_COLORS[i],
      eliminated: false,
      objectiveContinentId: shuffledContinentIds[i],
    }));

    let territories: Record<string, TerritoryState> = {};
    let foundValid = false;
    let attempts = 0;

    while (attempts < 2000) {
      const shuffledTerritoryIds = shuffle(ALL_TERRITORY_IDS);
      const tempTerritories: Record<string, TerritoryState> = {};
      shuffledTerritoryIds.forEach((id, i) => {
        const owner = players[i % players.length];
        tempTerritories[id] = { ownerId: owner.id, armies: 1 };
      });

      // Verifica se nenhum jogador possui territórios no seu continente objetivo
      const isValid = players.every((p) => {
        const objectiveContinent = CONTINENT_MAP[p.objectiveContinentId];
        return objectiveContinent.territoryIds.every(
          (tId) => tempTerritories[tId]?.ownerId !== p.id
        );
      });

      if (isValid) {
        territories = tempTerritories;
        foundValid = true;
        break;
      }
      attempts++;
    }

    if (!foundValid) {
      // Fallback em caso de emergência (segurança adicional)
      const shuffledTerritoryIds = shuffle(ALL_TERRITORY_IDS);
      shuffledTerritoryIds.forEach((id, i) => {
        const owner = players[i % players.length];
        territories[id] = { ownerId: owner.id, armies: 1 };
      });
    }

    const poolPerPlayer = SETUP_POOL_BY_PLAYERS[numPlayers] ?? 5;
    const setupPool: Record<string, number> = {};
    players.forEach((p) => {
      setupPool[p.id] = poolPerPlayer;
    });

    set({
      ...initialState,
      phase: 'setup-placement',
      players,
      territories,
      setupPool,
      setupPlayerIndex: 0,
      quizDeck: shuffle(QUESTIONS),
      log: [
        'O território foi sorteado entre os jogadores. Posicionem seus exércitos iniciais.',
        'Cada jogador recebeu um continente-objetivo: confira no painel quem precisa conquistar o quê.',
      ],
    });
  },

  placeSetupArmy: (territoryId) => {
    const s = get();
    if (s.phase !== 'setup-placement') return;
    const playerId = s.players[s.setupPlayerIndex].id;
    const territory = s.territories[territoryId];
    if (!territory || territory.ownerId !== playerId) return;
    if ((s.setupPool[playerId] ?? 0) <= 0) return;

    const territories = {
      ...s.territories,
      [territoryId]: { ...territory, armies: territory.armies + 1 },
    };
    const setupPool = { ...s.setupPool, [playerId]: s.setupPool[playerId] - 1 };

    const anyPoolLeft = Object.values(setupPool).some((v) => v > 0);
    if (!anyPoolLeft) {
      // Caso raro: o sorteio inicial de territórios já deixou algum jogador
      // com todo o seu continente-objetivo. Ele vence imediatamente, sem
      // precisar esperar pelo seu primeiro ataque bem-sucedido.
      const playerWithObjective = s.players.find((p) =>
        continentFullyOwnedBy(territories, p.objectiveContinentId, p.id),
      );
      if (playerWithObjective) {
        const continentName = CONTINENT_MAP[playerWithObjective.objectiveContinentId].fullName;
        set({
          territories,
          setupPool,
          phase: 'gameover',
          winnerId: playerWithObjective.id,
          winReason: 'objective',
          log: [
            ...s.log,
            `${playerWithObjective.name} já começa a partida controlando todo o continente ${continentName}, seu objetivo, e vence o jogo imediatamente!`,
          ],
        });
        return;
      }

      const firstPlayerId = s.players[0].id;
      set({
        territories,
        setupPool,
        phase: 'reinforce',
        currentPlayerIndex: 0,
        reinforcementsRemaining: computeReinforcements(territories, firstPlayerId),
        log: [...s.log, 'Posicionamento inicial concluído. Início das rodadas!'],
      });
      return;
    }

    // o jogador atual continua posicionando até esgotar seu próprio pool;
    // só então a vez passa ao próximo jogador que ainda tenha exércitos.
    if (setupPool[playerId] > 0) {
      set({ territories, setupPool });
      return;
    }

    let nextIdx = s.setupPlayerIndex;
    for (let i = 0; i < s.players.length; i++) {
      nextIdx = (nextIdx + 1) % s.players.length;
      if (setupPool[s.players[nextIdx].id] > 0) break;
    }

    set({
      territories,
      setupPool,
      setupPlayerIndex: nextIdx,
      log: [...s.log, `${s.players[nextIdx].name} agora posiciona seus exércitos iniciais.`],
    });
  },

  selectAttackSource: (territoryId) => {
    const s = get();
    if (s.phase !== 'attack') return;
    const pid = currentPlayerId(s);
    const t = s.territories[territoryId];
    if (!t || t.ownerId !== pid) return;
    if (s.selectedSource === territoryId) {
      set({ selectedSource: null, actionHint: null });
      return;
    }
    if (t.armies < 2) {
      set({
        actionHint: `${TERRITORY_MAP[territoryId]?.name} tem só 1 exército — escolha um território com 2 ou mais para atacar dele.`,
      });
      return;
    }
    const hasTarget = (ADJACENCY[territoryId] ?? []).some(
      (id) => s.territories[id]?.ownerId !== pid,
    );
    set({
      selectedSource: territoryId,
      actionHint: hasTarget
        ? null
        : `${TERRITORY_MAP[territoryId]?.name} não faz fronteira com nenhum território inimigo agora. Escolha outra origem ou siga para a Fortificação.`,
    });
  },

  selectAttackTarget: (territoryId) => {
    const s = get();
    if (s.phase !== 'attack') return;
    const pid = currentPlayerId(s);
    const target = s.territories[territoryId];
    if (!target || target.ownerId === pid) return;

    if (!s.selectedSource) {
      set({
        actionHint: `Primeiro clique em um território seu (com 2+ exércitos) para escolher a origem do ataque a ${TERRITORY_MAP[territoryId]?.name}.`,
      });
      return;
    }
    if (!areAdjacent(s.selectedSource, territoryId)) {
      set({
        actionHint: `${TERRITORY_MAP[territoryId]?.name} não faz fronteira com ${TERRITORY_MAP[s.selectedSource]?.name}. Escolha um território inimigo com borda vermelha.`,
      });
      return;
    }

    const { question, rest } = drawQuestion(s.quizDeck);
    set({
      quizDeck: rest,
      pendingQuestion: question,
      pendingAttack: { sourceId: s.selectedSource, targetId: territoryId },
      actionHint: null,
    });
  },

  answerQuestion: (choiceIndex) => {
    const s = get();
    if (!s.pendingAttack || !s.pendingQuestion) return;
    const { sourceId, targetId } = s.pendingAttack;
    const question = s.pendingQuestion;
    const correct = choiceIndex === question.correctIndex;
    const pid = currentPlayerId(s);

    const territories = { ...s.territories };
    let message = '';
    let conquered = false;

    if (correct) {
      const sourceArmies = territories[sourceId].armies;
      const moved = Math.max(1, Math.floor(sourceArmies / 2));
      const previousOwnerId = territories[targetId].ownerId;
      territories[sourceId] = { ...territories[sourceId], armies: sourceArmies - moved };
      territories[targetId] = { ownerId: pid, armies: moved };
      conquered = true;
      message = `Resposta correta! ${TERRITORY_MAP[targetId].name} foi conquistado.`;

      let players = s.players;
      if (previousOwnerId && previousOwnerId !== pid) {
        const stillHasTerritory = Object.values(territories).some(
          (t) => t.ownerId === previousOwnerId,
        );
        if (!stillHasTerritory) {
          players = s.players.map((p) =>
            p.id === previousOwnerId ? { ...p, eliminated: true } : p,
          );
          const loserName = s.players.find((p) => p.id === previousOwnerId)?.name;
          message += ` ${loserName} foi eliminado!`;
        }
      }

      const allTerritoriesOwnedByCurrent = Object.values(territories).every(
        (t) => t.ownerId === pid,
      );
      const remaining = countRemainingPlayers(players);
      const winnerName = s.players.find((p) => p.id === pid)?.name;

      const currentPlayer = s.players.find((p) => p.id === pid);
      const reachedObjective =
        !!currentPlayer && continentFullyOwnedBy(territories, currentPlayer.objectiveContinentId, pid);

      if (reachedObjective) {
        const continentName = CONTINENT_MAP[currentPlayer!.objectiveContinentId].fullName;
        const winMsg = `${winnerName} conquistou ${continentName} e cumpriu seu objetivo! ${winnerName} venceu o jogo!`;
        set({
          territories,
          players,
          phase: 'gameover',
          winnerId: pid,
          winReason: 'objective',
          pendingAttack: null,
          pendingQuestion: null,
          feedback: { correct, question, conquered, message },
          log: [...s.log, message, winMsg],
        });
        return;
      }

      if (allTerritoriesOwnedByCurrent || remaining <= 1) {
        const winReason: WinReason = allTerritoriesOwnedByCurrent ? 'domination' : 'elimination';
        set({
          territories,
          players,
          phase: 'gameover',
          winnerId: pid,
          winReason,
          pendingAttack: null,
          pendingQuestion: null,
          feedback: { correct, question, conquered, message },
          log: [...s.log, message, `${winnerName} venceu o jogo!`],
        });
        return;
      }

      set({
        territories,
        players,
        log: [...s.log, message],
      });
    } else {
      const sourceArmies = territories[sourceId].armies;
      territories[sourceId] = { ...territories[sourceId], armies: Math.max(1, sourceArmies - 1) };
      message = `Resposta incorreta. A alternativa correta era "${question.alternatives[question.correctIndex]}". Você perdeu 1 exército em ${TERRITORY_MAP[sourceId].name}.`;
      set({ territories, log: [...s.log, message] });
    }

    set({
      pendingAttack: null,
      pendingQuestion: null,
      feedback: { correct, question, conquered, message },
    });
  },

  closeFeedback: () => {
    const s = get();
    const src = s.selectedSource;
    const stillValidSource = src && s.territories[src]?.ownerId === currentPlayerId(s) && s.territories[src].armies >= 2;
    set({ feedback: null, selectedSource: stillValidSource ? src : null, actionHint: null });
  },

  endAttackPhase: () => {
    const s = get();
    if (s.phase !== 'attack') return;
    set({
      phase: 'fortify',
      selectedSource: null,
      fortifyTarget: null,
      fortifyAmount: 1,
      actionHint: null,
    });
  },

  placeReinforcement: (territoryId) => {
    const s = get();
    if (s.phase !== 'reinforce') return;
    const pid = currentPlayerId(s);
    const t = s.territories[territoryId];
    if (!t || t.ownerId !== pid) return;
    if (s.reinforcementsRemaining <= 0) return;

    set({
      territories: { ...s.territories, [territoryId]: { ...t, armies: t.armies + 1 } },
      reinforcementsRemaining: s.reinforcementsRemaining - 1,
    });
  },

  goToAttackPhase: () => {
    const s = get();
    if (s.phase !== 'reinforce' || s.reinforcementsRemaining > 0) return;
    const pid = currentPlayerId(s);
    const hint = hasAnyValidAttack(s.territories, pid)
      ? null
      : 'Nenhum dos seus territórios com 2+ exércitos faz fronteira com um inimigo agora. Você pode seguir direto para a Fortificação.';
    set({ phase: 'attack', actionHint: hint });
  },

  selectFortifyTarget: (territoryId) => {
    const s = get();
    if (s.phase !== 'fortify') return;
    const pid = currentPlayerId(s);
    const t = s.territories[territoryId];
    if (!t || t.ownerId !== pid) return;

    if (!s.selectedSource) {
      if (t.armies < 2) return;
      set({ selectedSource: territoryId, fortifyTarget: null, fortifyAmount: 1 });
      return;
    }
    if (s.selectedSource === territoryId) {
      set({ selectedSource: null, fortifyTarget: null });
      return;
    }
    if (!areAdjacent(s.selectedSource, territoryId)) return;
    set({ fortifyTarget: territoryId, fortifyAmount: 1 });
  },

  setFortifyAmount: (n) => {
    const s = get();
    if (!s.selectedSource) return;
    const max = s.territories[s.selectedSource].armies - 1;
    set({ fortifyAmount: Math.min(Math.max(1, n), Math.max(1, max)) });
  },

  confirmFortify: () => {
    const s = get();
    if (s.phase !== 'fortify' || !s.selectedSource || !s.fortifyTarget) return;
    const src = s.territories[s.selectedSource];
    const dst = s.territories[s.fortifyTarget];
    const amount = Math.min(s.fortifyAmount, src.armies - 1);
    if (amount < 1) return;

    const territories = {
      ...s.territories,
      [s.selectedSource]: { ...src, armies: src.armies - amount },
      [s.fortifyTarget]: { ...dst, armies: dst.armies + amount },
    };
    set({ territories });
    get().endTurn();
  },

  skipFortify: () => {
    get().endTurn();
  },

  clearFortifySelection: () => {
    set({ selectedSource: null, fortifyTarget: null, fortifyAmount: 1 });
  },

  endTurn: () => {
    const s = get();
    const nextIdx = nextActivePlayerIndex(s.players, s.currentPlayerIndex);
    const nextPid = s.players[nextIdx].id;
    set({
      currentPlayerIndex: nextIdx,
      phase: 'reinforce',
      selectedSource: null,
      fortifyTarget: null,
      fortifyAmount: 1,
      actionHint: null,
      reinforcementsRemaining: computeReinforcements(s.territories, nextPid),
      log: [...s.log, `Turno de ${s.players[nextIdx].name}.`],
    });
  },

  resetGame: () => set({ ...initialState }),
  setHoveredContinentId: (id) => set({ hoveredContinentId: id }),
}));

export { computeReinforcements, ownedTerritoryIds, hasAnyValidAttack, continentFullyOwnedBy };
