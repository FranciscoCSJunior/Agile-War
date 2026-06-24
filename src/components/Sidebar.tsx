import { useGameStore } from '../store/gameStore';
import { ADJACENCY, CONTINENT_MAP, CONTINENTS, TERRITORY_MAP } from '../data/mapData';

const PHASE_LABEL: Record<string, string> = {
  'setup-placement': 'Posicionamento Inicial',
  reinforce: 'Reforço',
  attack: 'Ataque',
  fortify: 'Fortificação',
  gameover: 'Fim de Jogo',
};

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const territories = useGameStore((s) => s.territories);
  const reinforcementsRemaining = useGameStore((s) => s.reinforcementsRemaining);
  const setupPool = useGameStore((s) => s.setupPool);
  const setupPlayerIndex = useGameStore((s) => s.setupPlayerIndex);
  const selectedSource = useGameStore((s) => s.selectedSource);
  const fortifyTarget = useGameStore((s) => s.fortifyTarget);
  const fortifyAmount = useGameStore((s) => s.fortifyAmount);
  const actionHint = useGameStore((s) => s.actionHint);
  const log = useGameStore((s) => s.log);

  const goToAttackPhase = useGameStore((s) => s.goToAttackPhase);
  const endAttackPhase = useGameStore((s) => s.endAttackPhase);
  const setFortifyAmount = useGameStore((s) => s.setFortifyAmount);
  const confirmFortify = useGameStore((s) => s.confirmFortify);
  const skipFortify = useGameStore((s) => s.skipFortify);
  const clearFortifySelection = useGameStore((s) => s.clearFortifySelection);

  const territoryCounts = (playerId: string) =>
    Object.values(territories).filter((t) => t.ownerId === playerId).length;

  const continentsOwnedBy = (playerId: string) =>
    CONTINENTS.filter((c) => c.territoryIds.every((id) => territories[id]?.ownerId === playerId));

  const objectiveProgress = (playerId: string, continentId: string) => {
    const continent = CONTINENT_MAP[continentId as keyof typeof CONTINENT_MAP];
    if (!continent) return { owned: 0, total: 0 };
    const owned = continent.territoryIds.filter((id) => territories[id]?.ownerId === playerId).length;
    return { owned, total: continent.territoryIds.length };
  };

  const hasAnyAttackOption = (playerId: string | undefined) => {
    if (!playerId) return false;
    return Object.entries(territories).some(([id, t]) => {
      if (t.ownerId !== playerId || t.armies < 2) return false;
      return (ADJACENCY[id] ?? []).some((nid) => territories[nid]?.ownerId !== playerId);
    });
  };

  const activePlayer = phase === 'setup-placement' ? players[setupPlayerIndex] : players[currentPlayerIndex];

  return (
    <aside className={open ? 'sidebar' : 'sidebar collapsed'}>
      <button
        type="button"
        className="sidebar-toggle-btn"
        onClick={onToggle}
        title={open ? 'Minimizar painel' : 'Expandir painel'}
      >
        {open ? '‹' : '›'}
      </button>

      {open && <div className="sidebar-content">
      <div className="turn-banner" style={{ borderColor: activePlayer?.color }}>
        <span className="swatch" style={{ background: activePlayer?.color }} />
        <div>
          <strong>{activePlayer?.name}</strong>
          <div className="phase-tag">{PHASE_LABEL[phase] ?? phase}</div>
          {activePlayer && (
            <div className="objective-line-banner">
              Objetivo: conquistar{' '}
              <strong style={{ color: CONTINENT_MAP[activePlayer.objectiveContinentId].color }}>
                {CONTINENT_MAP[activePlayer.objectiveContinentId].fullName}
              </strong>{' '}
              ({objectiveProgress(activePlayer.id, activePlayer.objectiveContinentId).owned}/
              {objectiveProgress(activePlayer.id, activePlayer.objectiveContinentId).total})
            </div>
          )}
        </div>
      </div>

      <div className="phase-controls">
        {phase === 'setup-placement' && (
          <p>
            Exércitos restantes para posicionar: <strong>{setupPool[activePlayer?.id] ?? 0}</strong>
            <br />
            Clique em um território seu no mapa para reforçá-lo.
          </p>
        )}

        {phase === 'reinforce' && (
          <>
            <p>
              Exércitos para distribuir: <strong>{reinforcementsRemaining}</strong>
            </p>
            <p className="hint">Clique nos seus territórios no mapa para posicionar.</p>
            <button
              type="button"
              className="primary-btn"
              disabled={reinforcementsRemaining > 0}
              onClick={goToAttackPhase}
            >
              Avançar para Ataque
            </button>
          </>
        )}

        {phase === 'attack' && (
          <>
            {actionHint ? (
              <p className="hint hint-warning">{actionHint}</p>
            ) : (
              <p className="hint">
                {selectedSource
                  ? `Origem selecionada: ${TERRITORY_MAP[selectedSource]?.name}. Clique num território inimigo adjacente (borda vermelha) para atacar.`
                  : 'Clique num território seu com borda dourada (2+ exércitos e fronteira com inimigo) para escolher a origem do ataque.'}
              </p>
            )}
            {!selectedSource && !hasAnyAttackOption(activePlayer?.id) && (
              <p className="hint hint-warning">
                Nenhum dos seus territórios pode atacar agora (sem 2+ exércitos numa fronteira
                inimiga). Reforce-os nos próximos turnos ou siga para a Fortificação.
              </p>
            )}
            <button type="button" className="primary-btn" onClick={endAttackPhase}>
              Ir para Fortificação
            </button>
          </>
        )}

        {phase === 'fortify' && (
          <>
            {!selectedSource && (
              <p className="hint">Clique num território seu (2+ exércitos) para mover tropas.</p>
            )}
            {selectedSource && !fortifyTarget && (
              <p className="hint">
                Origem: {TERRITORY_MAP[selectedSource]?.name}. Clique noutro território seu
                adjacente (borda verde) como destino.
              </p>
            )}
            {selectedSource && fortifyTarget && (
              <div className="fortify-controls">
                <p>
                  Mover de <strong>{TERRITORY_MAP[selectedSource]?.name}</strong> para{' '}
                  <strong>{TERRITORY_MAP[fortifyTarget]?.name}</strong>
                </p>
                <div className="amount-stepper">
                  <button type="button" onClick={() => setFortifyAmount(fortifyAmount - 1)}>
                    −
                  </button>
                  <span>{fortifyAmount}</span>
                  <button type="button" onClick={() => setFortifyAmount(fortifyAmount + 1)}>
                    +
                  </button>
                </div>
                <button type="button" className="primary-btn" onClick={confirmFortify}>
                  Confirmar e finalizar turno
                </button>
                <button type="button" className="secondary-btn" onClick={clearFortifySelection}>
                  Cancelar seleção
                </button>
              </div>
            )}
            <button type="button" className="secondary-btn" onClick={skipFortify}>
              Pular fortificação / Finalizar turno
            </button>
          </>
        )}
      </div>

      <div className="players-panel">
        <h4>Jogadores</h4>
        {players.map((p, i) => {
          const objectiveContinent = CONTINENT_MAP[p.objectiveContinentId];
          const progress = objectiveProgress(p.id, p.objectiveContinentId);
          return (
            <div
              key={p.id}
              className={
                i === currentPlayerIndex && phase !== 'setup-placement'
                  ? 'player-row active'
                  : 'player-row'
              }
            >
              <div className="player-row-main">
                <span className="swatch" style={{ background: p.color }} />
                <span className={p.eliminated ? 'player-name eliminated' : 'player-name'}>
                  {p.name} {p.eliminated && '(eliminado)'}
                </span>
                <span className="territory-count">{territoryCounts(p.id)} territ.</span>
                <span className="continent-badges">
                  {continentsOwnedBy(p.id).map((c) => (
                    <span key={c.id} className="mini-swatch" title={c.fullName} style={{ background: c.color }} />
                  ))}
                </span>
              </div>
              {!p.eliminated && (
                <div className="objective-line" title={`Objetivo: conquistar ${objectiveContinent.fullName}`}>
                  <span className="mini-swatch" style={{ background: objectiveContinent.color }} />
                  Meta: {objectiveContinent.fullName} ({progress.owned}/{progress.total})
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="log-panel">
        <h4>Eventos</h4>
        <div className="log-list">
          {log
            .slice(-8)
            .reverse()
            .map((entry, i) => (
              <div key={i} className="log-entry">
                {entry}
              </div>
            ))}
        </div>
      </div>
      </div>}
    </aside>
  );
}
