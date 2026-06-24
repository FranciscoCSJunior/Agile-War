import { useGameStore } from '../store/gameStore';
import { CONTINENT_MAP } from '../data/mapData';

export function TurnNotice() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const setupPlayerIndex = useGameStore((s) => s.setupPlayerIndex);
  const setupPool = useGameStore((s) => s.setupPool);
  const reinforcementsRemaining = useGameStore((s) => s.reinforcementsRemaining);
  const selectedSource = useGameStore((s) => s.selectedSource);
  const fortifyTarget = useGameStore((s) => s.fortifyTarget);
  const fortifyAmount = useGameStore((s) => s.fortifyAmount);

  const goToAttackPhase = useGameStore((s) => s.goToAttackPhase);
  const endAttackPhase = useGameStore((s) => s.endAttackPhase);
  const confirmFortify = useGameStore((s) => s.confirmFortify);
  const skipFortify = useGameStore((s) => s.skipFortify);

  const activePlayer =
    phase === 'setup-placement' ? players[setupPlayerIndex] : players[currentPlayerIndex];

  if (!activePlayer || phase === 'gameover') return null;

  let message: React.ReactNode = '';
  let action: React.ReactNode = null;

  if (phase === 'setup-placement') {
    const n = setupPool[activePlayer.id] ?? 0;
    message = <>Posicione <strong>{n}</strong> exército{n !== 1 ? 's' : ''} — clique num território seu no mapa.</>;
  } else if (phase === 'reinforce') {
    message = <>Distribua <strong>{reinforcementsRemaining}</strong> exército{reinforcementsRemaining !== 1 ? 's' : ''} — clique nos seus territórios.</>;
    action = (
      <button
        type="button"
        className="turn-notice-btn"
        disabled={reinforcementsRemaining > 0}
        onClick={goToAttackPhase}
      >
        Avançar para Ataque →
      </button>
    );
  } else if (phase === 'attack') {
    message = selectedSource
      ? 'Origem selecionada — clique num território inimigo adjacente (borda vermelha) para atacar.'
      : 'Selecione um território seu com borda dourada para atacar.';
    action = (
      <button type="button" className="turn-notice-btn secondary" onClick={endAttackPhase}>
        Ir para Fortificação →
      </button>
    );
  } else if (phase === 'fortify') {
    if (selectedSource && fortifyTarget) {
      message = <>Mover <strong>{fortifyAmount}</strong> exército{fortifyAmount !== 1 ? 's' : ''} — use a sidebar para ajustar.</>;
      action = (
        <button type="button" className="turn-notice-btn" onClick={confirmFortify}>
          Confirmar e finalizar turno ✓
        </button>
      );
    } else {
      message = 'Mova exércitos entre territórios seus adjacentes, ou pule.';
      action = (
        <button type="button" className="turn-notice-btn secondary" onClick={skipFortify}>
          Pular / Finalizar turno →
        </button>
      );
    }
  }

  const objContinent = CONTINENT_MAP[activePlayer.objectiveContinentId];

  return (
    <div className="turn-notice" style={{ '--player-color': activePlayer.color } as React.CSSProperties}>
      <span className="turn-notice-dot" style={{ background: activePlayer.color }} />
      <div className="turn-notice-body">
        <span className="turn-notice-title">Sua vez, {activePlayer.name}!</span>
        <span className="turn-notice-msg">{message}</span>
      </div>
      {objContinent && (
        <span
          className="turn-notice-obj"
          style={{ color: objContinent.color }}
          title={`Objetivo: conquistar ${objContinent.fullName}`}
        >
          🎯 {objContinent.name}
        </span>
      )}
      {action && <div className="turn-notice-actions">{action}</div>}
    </div>
  );
}
