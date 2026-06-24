export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const PLAYER_COLORS = [
  '#d42b2b', // vermelho
  '#1a5fb4', // azul
  '#e6c619', // amarelo
  '#26a65b', // verde
  '#1a1a1a', // preto
  '#f0f0f0', // branco
];

export const PLAYER_COLOR_NAMES = [
  'Vermelho',
  'Azul',
  'Amarelo',
  'Verde',
  'Preto',
  'Branco',
];

export const SETUP_POOL_BY_PLAYERS: Record<number, number> = {
  2: 5,
  3: 5,
  4: 5,
  5: 5,
  6: 5,
};
