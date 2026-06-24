import { useGameStore } from '../store/gameStore';
import { CONTINENT_MAP, CONTINENTS } from '../data/mapData';

export function PlayersCard() {
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const territories = useGameStore((s) => s.territories);
  const phase = useGameStore((s) => s.phase);

  if (phase === 'gameover') return null;

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

  const isActive = (i: number) =>
    i === currentPlayerIndex && phase !== 'setup-placement';

  return (
    <div className="players-card">
      <div className="pc-header">PLACAR</div>

      {players.map((p, i) => {
        const active = isActive(i);
        const objContinent = CONTINENT_MAP[p.objectiveContinentId];
        const progress = objectiveProgress(p.id, p.objectiveContinentId);
        const owned = continentsOwnedBy(p.id);
        const tc = territoryCounts(p.id);

        return (
          <div
            key={p.id}
            className={`pc-row${active ? ' active' : ''}${p.eliminated ? ' eliminated' : ''}`}
            style={active ? { '--pc-color': p.color } as React.CSSProperties : undefined}
          >
            {/* Barra de cor na esquerda */}
            <div className="pc-stripe" style={{ background: p.color }} />

            <div className="pc-body">
              {/* Linha superior: nome + badge de territórios */}
              <div className="pc-top">
                <span className="pc-name">{p.eliminated ? '✕ ' : ''}{p.name}</span>
                <span className="pc-badge" style={{ background: p.color }}>{tc}</span>
              </div>

              {/* Linha inferior: objetivo + continentes dominados */}
              <div className="pc-bottom">
                {objContinent && !p.eliminated && (
                  <span className="pc-obj" style={{ color: objContinent.color }}>
                    🎯 {objContinent.name} {progress.owned}/{progress.total}
                  </span>
                )}
                {owned.length > 0 && (
                  <span className="pc-owned-conts">
                    {owned.map((c) => (
                      <span
                        key={c.id}
                        className="pc-cont-dot"
                        title={c.fullName}
                        style={{ background: c.color }}
                      />
                    ))}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
