import type { ContinentDef, ContinentId, Point, TerritoryDef } from '../types';
import {
  GEO_ADJACENCY,
  TERRITORY_CENTERS,
  TERRITORY_PATHS,
  TERRITORY_BOUNDARY_PATHS,
  CONTINENT_PATHS,
  CONTINENT_CENTERS as WORLD_CONTINENT_CENTERS,
  SEA_ROUTES,
  MAP_VIEWBOX_WIDTH,
  MAP_VIEWBOX_HEIGHT,
} from './worldMap';

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
// Adjacência GEOGRÁFICA: territórios que fazem fronteira no mapa real (derivada
// das bordas dos polígonos em azgaarMap.ts).
// ---------------------------------------------------------------------------

export const ADJACENCY: Record<string, string[]> = GEO_ADJACENCY;

export function areAdjacent(a: string, b: string): boolean {
  return ADJACENCY[a]?.includes(b) ?? false;
}

// ---------------------------------------------------------------------------
// Geometria do mapa (gerada do SVG do Azgaar). LAYOUT = centróide de cada
// território; o contorno (path) de cada território/continente vem junto.
// ---------------------------------------------------------------------------

export const VIEWBOX_WIDTH = MAP_VIEWBOX_WIDTH;
export const VIEWBOX_HEIGHT = MAP_VIEWBOX_HEIGHT;

export const LAYOUT: Record<string, Point> = TERRITORY_CENTERS;

export { TERRITORY_PATHS, TERRITORY_BOUNDARY_PATHS, CONTINENT_PATHS, SEA_ROUTES };

export const CONTINENT_CENTERS: Record<ContinentId, Point> = WORLD_CONTINENT_CENTERS;

export const ALL_TERRITORY_IDS: string[] = TERRITORIES.map((t) => t.id);
