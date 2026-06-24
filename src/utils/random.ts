export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const PLAYER_COLORS = [
  '#ff4d4d', // vermelho
  '#3b82f6', // azul
  '#ffca28', // amarelo
  '#10b981', // verde
  '#a855f7', // roxo
  '#f8fafc', // branco
];

export const PLAYER_COLOR_NAMES = [
  'Vermelho',
  'Azul',
  'Amarelo',
  'Verde',
  'Roxo',
  'Branco',
];

export const SETUP_POOL_BY_PLAYERS: Record<number, number> = {
  2: 5,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
};
