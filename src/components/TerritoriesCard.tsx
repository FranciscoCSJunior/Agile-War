import { useGameStore } from '../store/gameStore';
import { CONTINENTS } from '../data/mapData';

export function TerritoriesCard() {
  const setHoveredContinentId = useGameStore((s) => s.setHoveredContinentId);
  const hoveredContinentId = useGameStore((s) => s.hoveredContinentId);
  const phase = useGameStore((s) => s.phase);

  if (phase === 'gameover' || phase === 'setup-players') return null;

  return (
    <div className="territories-card">
      <div className="tc-header">Métodos Ágeis</div>
      <div className="tc-list">
        {CONTINENTS.map((c) => {
          const isHovered = hoveredContinentId === c.id;
          return (
            <div
              key={c.id}
              className={`tc-row${isHovered ? ' active' : ''}`}
              onMouseEnter={() => setHoveredContinentId(c.id)}
              onMouseLeave={() => setHoveredContinentId(null)}
              style={{ '--tc-color': c.color } as React.CSSProperties}
            >
              <span className="tc-dot" style={{ background: c.color }} />
              <span className="tc-name">{c.name}</span>
              <span className="tc-fullname">{c.fullName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
