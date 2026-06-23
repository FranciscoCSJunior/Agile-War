// Simulação de validação do fluxo de vitória por objetivo.
// Roda com: node --experimental-strip-types sim-objective-tmp.ts
import { useGameStore } from './src/store/gameStore.ts';
import { CONTINENT_MAP, ADJACENCY } from './src/data/mapData.ts';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FALHOU:', msg);
    process.exit(1);
  }
  console.log('OK:', msg);
}

// 1. Inicia o jogo com 2 jogadores.
useGameStore.getState().startSetup(2, ['Alice', 'Bob']);
let s = useGameStore.getState();
assert(s.phase === 'setup-placement', 'fase inicial é setup-placement');
assert(s.players.length === 2, '2 jogadores criados');

const p1 = s.players[0];
const p2 = s.players[1];
assert(!!p1.objectiveContinentId, 'p1 tem objectiveContinentId definido');
assert(!!p2.objectiveContinentId, 'p2 tem objectiveContinentId definido');
assert(
  p1.objectiveContinentId !== p2.objectiveContinentId,
  `objetivos são distintos entre os 2 jogadores (p1=${p1.objectiveContinentId}, p2=${p2.objectiveContinentId})`,
);

const objectiveContinent = CONTINENT_MAP[p1.objectiveContinentId];
const objTerritories = objectiveContinent.territoryIds;
assert(objTerritories.length === 4, `continente-objetivo de p1 (${objectiveContinent.fullName}) tem 4 territórios`);

// 2. Monta artificialmente um estado onde p1 já possui 3 dos 4 territórios do
//    seu continente-objetivo, e o 4º pertence a p2 com 1 exército, adjacente
//    a um território de p1 com 3 exércitos — para forçar um ataque
//    determinístico que deve conquistar o objetivo.
const lastTerritoryId = objTerritories[3];
const sourceCandidates = objTerritories
  .slice(0, 3)
  .filter((id) => (ADJACENCY[id] ?? []).includes(lastTerritoryId));
assert(sourceCandidates.length > 0, 'existe território de p1 adjacente ao 4º território do objetivo (ciclo interno do continente)');
const sourceId = sourceCandidates[0];

const territories = { ...s.territories };
for (const id of objTerritories.slice(0, 3)) {
  territories[id] = { ownerId: p1.id, armies: id === sourceId ? 3 : 1 };
}
territories[lastTerritoryId] = { ownerId: p2.id, armies: 1 };
// Garante que p2 tenha ao menos outro território em outro lugar do tabuleiro,
// para não disparar eliminação em vez de objetivo nesta rodada de teste.
const someOtherId = Object.keys(territories).find(
  (id) => !objTerritories.includes(id) && territories[id].ownerId !== p1.id,
);
if (someOtherId) {
  territories[someOtherId] = { ...territories[someOtherId], ownerId: p2.id, armies: 2 };
}

useGameStore.setState({
  territories,
  phase: 'attack',
  currentPlayerIndex: 0,
  winnerId: null,
  winReason: null,
});

s = useGameStore.getState();
assert(s.territories[sourceId].ownerId === p1.id && s.territories[sourceId].armies >= 2, 'origem do ataque pertence a p1 com 2+ exércitos');
assert(s.territories[lastTerritoryId].ownerId === p2.id, '4º território do objetivo pertence a p2 antes do ataque');

// 3. Executa o ataque: seleciona origem e alvo (dispara uma pergunta).
useGameStore.getState().selectAttackSource(sourceId);
s = useGameStore.getState();
assert(s.selectedSource === sourceId, 'origem selecionada corretamente');

useGameStore.getState().selectAttackTarget(lastTerritoryId);
s = useGameStore.getState();
assert(!!s.pendingQuestion && !!s.pendingAttack, 'pergunta de quiz foi sorteada para o ataque');

// 4. Responde corretamente (lendo o índice correto do próprio estado, já que
//    o conteúdo da pergunta sorteada é aleatório).
const correctIndex = s.pendingQuestion!.correctIndex;
useGameStore.getState().answerQuestion(correctIndex);
s = useGameStore.getState();

// 5. Verifica o resultado: jogo deve terminar, com p1 vencendo por objetivo.
assert(s.territories[lastTerritoryId].ownerId === p1.id, 'p1 conquistou o último território do continente-objetivo');
assert(s.phase === 'gameover', `fase final é gameover (obtido: ${s.phase})`);
assert(s.winnerId === p1.id, `vencedor é p1 (obtido: ${s.winnerId})`);
assert(s.winReason === 'objective', `motivo da vitória é 'objective' (obtido: ${s.winReason})`);
assert(
  s.log.some((l) => l.includes('cumpriu seu objetivo')),
  'log registra a mensagem de vitória por objetivo',
);

console.log('\nTODOS OS TESTES PASSARAM — fluxo de vitória por objetivo validado.');
