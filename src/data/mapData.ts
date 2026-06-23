import type { ContinentDef, ContinentId, Point, TerritoryDef } from '../types';

// ---------------------------------------------------------------------------
// Conteúdo: 7 continentes = 7 métodos ágeis. Cada território leva o nome de
// uma característica/prática/papel daquele método (Disciplina Gerência de
// Projetos de Software - Revisão III). Cada continente tem exatamente 4
// territórios, para manter o tabuleiro simétrico.
// ---------------------------------------------------------------------------

interface ContinentSeed {
  id: ContinentId;
  name: string;
  fullName: string;
  color: string;
  bonus: number;
  territories: { id: string; name: string }[];
}

const CONTINENT_SEEDS: ContinentSeed[] = [
  {
    id: 'xp',
    name: 'XP',
    fullName: 'Extreme Programming',
    color: '#e74c3c',
    bonus: 3,
    territories: [
      { id: 'xp-pair', name: 'Programação em Par' },
      { id: 'xp-tdd', name: 'TDD' },
      { id: 'xp-ci', name: 'Integração Contínua' },
      { id: 'xp-refactor', name: 'Refatoração' },
    ],
  },
  {
    id: 'scrum',
    name: 'Scrum',
    fullName: 'Scrum',
    color: '#3498db',
    bonus: 4,
    territories: [
      { id: 'scrum-product-backlog', name: 'Product Backlog' },
      { id: 'scrum-sprint-backlog', name: 'Sprint Backlog' },
      { id: 'scrum-daily', name: 'Daily Scrum' },
      { id: 'scrum-master', name: 'Scrum Master' },
    ],
  },
  {
    id: 'lean',
    name: 'Lean SD',
    fullName: 'Lean Software Development',
    color: '#2ecc71',
    bonus: 5,
    territories: [
      { id: 'lean-waste', name: 'Eliminar Desperdício' },
      { id: 'lean-deliver-fast', name: 'Entregar Rápido' },
      { id: 'lean-empower', name: 'Empoderar o Time' },
      { id: 'lean-whole', name: 'Ver o Todo' },
    ],
  },
  {
    id: 'kanban',
    name: 'Kanban',
    fullName: 'Kanban',
    color: '#f1c40f',
    bonus: 3,
    territories: [
      { id: 'kanban-board', name: 'Quadro Kanban' },
      { id: 'kanban-wip', name: 'Limite de WIP' },
      { id: 'kanban-flow', name: 'Fluxo Contínuo' },
      { id: 'kanban-kaizen', name: 'Kaizen' },
    ],
  },
  {
    id: 'fdd',
    name: 'FDD',
    fullName: 'Feature-Driven Development',
    color: '#e67e22',
    bonus: 3,
    territories: [
      { id: 'fdd-domain-model', name: 'Modelagem de Domínio' },
      { id: 'fdd-chief-architect', name: 'Chief Architect' },
      { id: 'fdd-chief-programmer', name: 'Chief Programmer' },
      { id: 'fdd-feature-list', name: 'Lista de Funcionalidades' },
    ],
  },
  {
    id: 'less',
    name: 'LeSS',
    fullName: 'Large-Scale Scrum',
    color: '#9b59b6',
    bonus: 2,
    territories: [
      { id: 'less-po', name: 'PO Único' },
      { id: 'less-backlog', name: 'Backlog Único' },
      { id: 'less-teams', name: 'Times Autogerenciáveis' },
      { id: 'less-simplicity', name: 'Simplicidade Organizacional' },
    ],
  },
  {
    id: 'safe',
    name: 'SAFe',
    fullName: 'Scaled Agile Framework',
    color: '#1abc9c',
    bonus: 4,
    territories: [
      { id: 'safe-team', name: 'Team Level' },
      { id: 'safe-program', name: 'Program Level' },
      { id: 'safe-large-solution', name: 'Large Solution Level' },
      { id: 'safe-portfolio', name: 'Portfolio Level' },
    ],
  },
];

// Pontes extras entre continentes (além do anel principal), para enriquecer
// a conectividade do tabuleiro.
const EXTRA_BRIDGES: [string, string][] = [
  ['scrum-product-backlog', 'fdd-domain-model'],
  ['lean-whole', 'safe-portfolio'],
  ['xp-ci', 'kanban-wip'],
];

// Anel principal entre continentes (na ordem em que aparecem em CONTINENT_SEEDS,
// fechando o ciclo no final): conecta o último território de um continente ao
// primeiro do próximo (ids escolhidos manualmente para ficar tematicamente coerente).
const RING_BRIDGES: [string, string][] = [
  ['xp-refactor', 'scrum-daily'],
  ['scrum-sprint-backlog', 'lean-deliver-fast'],
  ['lean-waste', 'kanban-kaizen'],
  ['kanban-flow', 'fdd-feature-list'],
  ['fdd-chief-architect', 'less-teams'],
  ['less-backlog', 'safe-large-solution'],
  ['safe-team', 'xp-pair'],
];

export const CONTINENTS: ContinentDef[] = CONTINENT_SEEDS.map((c) => ({
  id: c.id,
  name: c.name,
  fullName: c.fullName,
  color: c.color,
  bonus: c.bonus,
  territoryIds: c.territories.map((t) => t.id),
}));

export const TERRITORIES: TerritoryDef[] = CONTINENT_SEEDS.flatMap((c) =>
  c.territories.map((t) => ({ id: t.id, name: t.name, continentId: c.id })),
);

export const TERRITORY_MAP: Record<string, TerritoryDef> = Object.fromEntries(
  TERRITORIES.map((t) => [t.id, t]),
);

export const CONTINENT_MAP: Record<ContinentId, ContinentDef> = Object.fromEntries(
  CONTINENTS.map((c) => [c.id, c]),
) as Record<ContinentId, ContinentDef>;

// ---------------------------------------------------------------------------
// Adjacência: ciclo dentro de cada continente + pontes entre continentes.
// ---------------------------------------------------------------------------

function buildAdjacency(): Record<string, string[]> {
  const adj: Record<string, Set<string>> = {};
  const add = (a: string, b: string) => {
    if (!adj[a]) adj[a] = new Set();
    if (!adj[b]) adj[b] = new Set();
    adj[a].add(b);
    adj[b].add(a);
  };

  for (const c of CONTINENT_SEEDS) {
    const ids = c.territories.map((t) => t.id);
    for (let i = 0; i < ids.length; i++) {
      const next = ids[(i + 1) % ids.length];
      if (ids.length > 1) add(ids[i], next);
    }
  }

  for (const [a, b] of [...RING_BRIDGES, ...EXTRA_BRIDGES]) {
    add(a, b);
  }

  const result: Record<string, string[]> = {};
  for (const id of Object.keys(adj)) {
    result[id] = Array.from(adj[id]);
  }
  return result;
}

export const ADJACENCY: Record<string, string[]> = buildAdjacency();

export function areAdjacent(a: string, b: string): boolean {
  return ADJACENCY[a]?.includes(b) ?? false;
}

// ---------------------------------------------------------------------------
// Layout: posições (x, y) num viewBox de 1000x920. Continentes dispostos em
// anel; territórios de cada continente dispostos em círculo menor ao redor
// do centro do seu continente.
// ---------------------------------------------------------------------------

export const VIEWBOX_WIDTH = 1000;
export const VIEWBOX_HEIGHT = 920;

const CENTER: Point = { x: VIEWBOX_WIDTH / 2, y: VIEWBOX_HEIGHT / 2 - 10 };
const CONTINENT_RING_RADIUS = 300;
const TERRITORY_CLUSTER_RADIUS = 95;

function polar(center: Point, radius: number, angleDeg: number): Point {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(rad),
    y: center.y + radius * Math.sin(rad),
  };
}

function buildLayout(): Record<string, Point> {
  const layout: Record<string, Point> = {};
  const n = CONTINENT_SEEDS.length;

  CONTINENT_SEEDS.forEach((c, ci) => {
    const continentAngle = -90 + ci * (360 / n);
    const continentCenter = polar(CENTER, CONTINENT_RING_RADIUS, continentAngle);
    const ids = c.territories;
    const m = ids.length;
    ids.forEach((t, ti) => {
      // pequena rotação de fase por continente para variar a orientação visual
      const territoryAngle = continentAngle + ti * (360 / m) + 15;
      const pos = polar(continentCenter, TERRITORY_CLUSTER_RADIUS, territoryAngle);
      layout[t.id] = pos;
    });
  });

  return layout;
}

export const LAYOUT: Record<string, Point> = buildLayout();

export function continentCenterOf(_continentId: ContinentId, index: number): Point {
  const n = CONTINENT_SEEDS.length;
  const angle = -90 + index * (360 / n);
  return polar(CENTER, CONTINENT_RING_RADIUS, angle);
}

export const CONTINENT_CENTERS: Record<ContinentId, Point> = Object.fromEntries(
  CONTINENT_SEEDS.map((c, i) => [c.id, continentCenterOf(c.id, i)]),
) as Record<ContinentId, Point>;

export const ALL_TERRITORY_IDS: string[] = TERRITORIES.map((t) => t.id);
