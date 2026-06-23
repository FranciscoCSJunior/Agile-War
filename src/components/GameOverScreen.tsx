import { useGameStore } from '../store/gameStore';
import { CONTINENT_MAP } from '../data/mapData';

export function GameOverScreen() {
  const players = useGameStore((s) => s.players);
  const winnerId = useGameStore((s) => s.winnerId);
  const winReason = useGameStore((s) => s.winReason);
  const resetGame = useGameStore((s) => s.resetGame);

  const winner = players.find((p) => p.id === winnerId);

  const reasonMessage = (() => {
    if (!winner) return '';
    if (winReason === 'objective') {
      const continentName = CONTINENT_MAP[winner.objectiveContinentId].fullName;
      return `Cumpriu seu objetivo: conquistou todo o continente ${continentName}!`;
    }
    if (winReason === 'elimination') {
      return 'Eliminou todos os adversários do tabuleiro!';
    }
    return 'Dominou os métodos ágeis e conquistou todo o tabuleiro.';
  })();

  return (
    <div className="screen gameover-screen">
      <h1>Fim de jogo!</h1>
      {winner && (
        <div className="winner-banner" style={{ borderColor: winner.color }}>
          <span className="swatch big" style={{ background: winner.color }} />
          <h2>{winner.name} venceu!</h2>
          <p>{reasonMessage}</p>
        </div>
      )}
      <button type="button" className="primary-btn" onClick={resetGame}>
        Jogar novamente
      </button>
    </div>
  );
}
