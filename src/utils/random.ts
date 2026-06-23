export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const PLAYER_COLORS = [
  '#f5f5f5', // branco
  '#3a3a3a', // preto/grafite
  '#ff4fa3', // magenta
  '#22d3ee', // ciano
  '#a3e635', // lima
  '#b45309', // âmbar/marrom
];

export const PLAYER_COLOR_NAMES = [
  'Branco',
  'Grafite',
  'Magenta',
  'Ciano',
  'Lima',
  'Âmbar',
];

export const SETUP_POOL_BY_PLAYERS: Record<number, number> = {
  2: 5,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
};
