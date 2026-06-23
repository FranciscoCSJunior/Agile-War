// Tipos centrais do jogo "War dos Métodos Ágeis"

export type ContinentId =
  | 'xp'
  | 'scrum'
  | 'lean'
  | 'kanban'
  | 'fdd'
  | 'less'
  | 'safe';

export interface ContinentDef {
  id: ContinentId;
  name: string;
  fullName: string;
  color: string;
  bonus: number;
  territoryIds: string[];
}

export interface TerritoryDef {
  id: string;
  name: string;
  continentId: ContinentId;
}

export interface Point {
  x: number;
  y: number;
}

export interface Question {
  id: number;
  text: string;
  alternatives: string[];
  correctIndex: number;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  eliminated: boolean;
  objectiveContinentId: ContinentId;
}

export type WinReason = 'objective' | 'domination' | 'elimination';

export interface TerritoryState {
  ownerId: string | null;
  armies: number;
}

export type Phase =
  | 'setup-players'
  | 'setup-placement'
  | 'reinforce'
  | 'attack'
  | 'fortify'
  | 'gameover';

export interface PendingAttack {
  sourceId: string;
  targetId: string;
  question: Question;
}

export interface FeedbackState {
  correct: boolean;
  question: Question;
  conquered: boolean;
  message: string;
}
