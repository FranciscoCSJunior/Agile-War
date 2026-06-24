import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  ADJACENCY,
  CONTINENT_CENTERS,
  CONTINENT_PATHS,
  CONTINENTS,
  LAYOUT,
  SEA_ROUTES,
  TERRITORIES,
  TERRITORY_PATHS,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '../data/mapData';

export function Board() {
  const [hoveredTerritoryId, setHoveredTerritoryId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const territories = useGameStore((s) => s.territories);
  const selectedSource = useGameStore((s) => s.selectedSource);
  const fortifyTarget = useGameStore((s) => s.fortifyTarget);
  const setupPlayerIndex = useGameStore((s) => s.setupPlayerIndex);
  const hoveredContinentId = useGameStore((s) => s.hoveredContinentId);

  const placeSetupArmy = useGameStore((s) => s.placeSetupArmy);
  const selectAttackSource = useGameStore((s) => s.selectAttackSource);
  const selectAttackTarget = useGameStore((s) => s.selectAttackTarget);
  const placeReinforcement = useGameStore((s) => s.placeReinforcement);
  const selectFortifyTarget = useGameStore((s) => s.selectFortifyTarget);

  const activePlayerId =
    phase === 'setup-placement' ? players[setupPlayerIndex]?.id : players[currentPlayerIndex]?.id;

  const playerColorOf = useMemo(() => {
    const map: Record<string, string> = {};
    players.forEach((p) => (map[p.id] = p.color));
    return map;
  }, [players]);

  const hoveredTerritory = useMemo(() => {
    if (!hoveredTerritoryId) return null;
    return TERRITORIES.find((t) => t.id === hoveredTerritoryId);
  }, [hoveredTerritoryId]);

  const hoveredTerritoryState = hoveredTerritory ? territories[hoveredTerritory.id] : null;

  const hoveredTerritoryContinent = useMemo(() => {
    if (!hoveredTerritory) return null;
    return CONTINENTS.find((c) => c.id === hoveredTerritory.continentId);
  }, [hoveredTerritory]);

  const hoveredTerritoryOwner = useMemo(() => {
    if (!hoveredTerritoryState?.ownerId) return null;
    return players.find((p) => p.id === hoveredTerritoryState.ownerId);
  }, [hoveredTerritoryState, players]);

  const validAttackTargets = useMemo(() => {
    if (phase !== 'attack' || !selectedSource) return new Set<string>();
    const pid = players[currentPlayerIndex]?.id;
    return new Set(
      (ADJACENCY[selectedSource] ?? []).filter((id) => territories[id]?.ownerId !== pid),
    );
  }, [phase, selectedSource, territories, players, currentPlayerIndex]);

  // Territórios próprios com 2+ exércitos que fazem fronteira com inimigo:
  // possíveis origens de ataque (realçados mesmo antes de selecionar nada).
  const validAttackSources = useMemo(() => {
    if (phase !== 'attack') return new Set<string>();
    const pid = players[currentPlayerIndex]?.id;
    return new Set(
      Object.entries(territories)
        .filter(
          ([id, t]) =>
            t.ownerId === pid &&
            t.armies >= 2 &&
            (ADJACENCY[id] ?? []).some((nid) => territories[nid]?.ownerId !== pid),
        )
        .map(([id]) => id),
    );
  }, [phase, territories, players, currentPlayerIndex]);

  const validFortifyTargets = useMemo(() => {
    if (phase !== 'fortify' || !selectedSource) return new Set<string>();
    const pid = players[currentPlayerIndex]?.id;
    return new Set(
      (ADJACENCY[selectedSource] ?? []).filter((id) => territories[id]?.ownerId === pid),
    );
  }, [phase, selectedSource, territories, players, currentPlayerIndex]);

  function handleClick(territoryId: string) {
    const t = territories[territoryId];
    if (!t) return;

    if (phase === 'setup-placement') {
      placeSetupArmy(territoryId);
      return;
    }
    if (phase === 'reinforce') {
      placeReinforcement(territoryId);
      return;
    }
    if (phase === 'attack') {
      const pid = players[currentPlayerIndex]?.id;
      if (t.ownerId === pid) {
        selectAttackSource(territoryId);
      } else {
        // Sempre delega ao store, mesmo sem origem selecionada ou sem
        // adjacência válida: assim o jogador recebe uma mensagem explicando
        // por que aquele clique não iniciou um ataque, em vez de nada acontecer.
        selectAttackTarget(territoryId);
      }
      return;
    }
    if (phase === 'fortify') {
      selectFortifyTarget(territoryId);
    }
  }

  return (
    <>
      <svg
        className="board-svg"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Tabuleiro de War dos Métodos Ágeis"
    >
      {/* Mar de fundo */}
      <rect x={0} y={0} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} className="board-sea" />

      {/* Rotas marítimas (ligações entre continentes) */}
      {SEA_ROUTES.map(([a, b]) => {
        const pa = LAYOUT[a];
        const pb = LAYOUT[b];
        if (!pa || !pb) return null;
        // curva leve para parecer rota de navio
        const mx = (pa.x + pb.x) / 2;
        const my = (pa.y + pb.y) / 2 - Math.hypot(pb.x - pa.x, pb.y - pa.y) * 0.12;
        return (
          <path
            key={`route-${a}-${b}`}
            d={`M ${pa.x},${pa.y} Q ${mx},${my} ${pb.x},${pb.y}`}
            className="sea-route"
            pointerEvents="none"
          />
        );
      })}

      {/* Territórios: fill + hairline de países */}
      {TERRITORIES.map((t) => {
        const d = TERRITORY_PATHS[t.id];
        if (!d) return null;
        const state = territories[t.id];
        const owned = state?.ownerId ? playerColorOf[state.ownerId] : '#2c3540';
        const isSelected = selectedSource === t.id;
        const isFortifyTarget = fortifyTarget === t.id;
        const isValidAttackTarget = validAttackTargets.has(t.id);
        const isValidFortifyTarget = validFortifyTargets.has(t.id);
        const isOwnedByActive = state?.ownerId === activePlayerId;
        const isPotentialAttackSource =
          phase === 'attack' && !selectedSource && validAttackSources.has(t.id);

        const clickable =
          (phase === 'setup-placement' && isOwnedByActive) ||
          (phase === 'reinforce' && isOwnedByActive) ||
          (phase === 'attack' && (isOwnedByActive || isValidAttackTarget)) ||
          (phase === 'fortify' && (isOwnedByActive || isValidFortifyTarget));

        // divisas de países: hairline escuro
        let stroke = 'rgba(0,0,0,0.4)';
        let strokeWidth = 0.3;
        if (isSelected || isFortifyTarget) {
          stroke = '#ffffff'; strokeWidth = 1.5;
        } else if (isValidAttackTarget) {
          stroke = '#ff5252'; strokeWidth = 1.5;
        } else if (isValidFortifyTarget) {
          stroke = '#a3e635'; strokeWidth = 1.5;
        } else if (isPotentialAttackSource) {
          stroke = '#fbbf24'; strokeWidth = 1.5;
        }

        if (hoveredTerritoryId === t.id) {
          stroke = '#ffffff';
          strokeWidth = 1.8;
        }

        const isContinentHovered = hoveredContinentId === t.continentId;
        const fillOpacity = hoveredContinentId ? (isContinentHovered ? 1.0 : 0.25) : 1.0;

        return (
          <path
            key={t.id}
            d={d}
            fill={owned}
            fillOpacity={fillOpacity}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            className={clickable ? 'territory-path clickable' : 'territory-path'}
            style={{ transition: 'fill-opacity 0.2s, stroke 0.15s, stroke-width 0.15s' }}
            onClick={() => {
              if (phase === 'attack' || clickable) handleClick(t.id);
            }}
            onMouseEnter={() => {
              setHoveredTerritoryId(t.id);
            }}
            onMouseLeave={() => {
              setHoveredTerritoryId(null);
            }}
            onMouseMove={(e) => {
              setMousePos({ x: e.clientX, y: e.clientY });
            }}
          />
        );
      })}

      {/* Contorno de continente — grosso e colorido, distingue territórios */}
      {CONTINENTS.map((c) => {
        const d = CONTINENT_PATHS[c.id];
        if (!d) return null;
        const isHovered = hoveredContinentId === c.id;
        return (
          <path
            key={`cont-${c.id}`}
            d={d}
            fill="none"
            stroke={isHovered ? c.color : '#000000'}
            strokeWidth={isHovered ? 2.5 : 1.2}
            strokeOpacity={isHovered ? 1.0 : 0.8}
            strokeLinejoin="round"
            pointerEvents="none"
            style={{ transition: 'stroke 0.2s, stroke-width 0.2s, stroke-opacity 0.2s' }}
          />
        );
      })}

      {/* Rótulos de continente */}
      {CONTINENTS.map((c) => {
        const center = CONTINENT_CENTERS[c.id];
        if (!center) return null;
        return (
          <text
            key={`label-${c.id}`}
            x={center.x}
            y={center.y}
            textAnchor="middle"
            className="continent-label"
            fill={c.color}
            pointerEvents="none"
          >
            {c.name}
          </text>
        );
      })}

      {/* Badge de exércitos + nome do território */}
      {TERRITORIES.map((t) => {
        const pos = LAYOUT[t.id];
        const state = territories[t.id];
        if (!pos) return null;
        return (
          <g key={`info-${t.id}`} transform={`translate(${pos.x}, ${pos.y})`} pointerEvents="none">
            <circle r={11} className="army-badge" />
            <text textAnchor="middle" dy={4} className="army-count">
              {state?.armies ?? ''}
            </text>
            <text textAnchor="middle" className="territory-label">
              {t.name.split(' ').map((word, idx) => {
                const dy = t.id === 'safe-large-solution'
                  ? (idx === 0 ? -35 : 10)
                  : (idx === 0 ? 25 : 10);
                return (
                  <tspan key={idx} x={0} dy={dy}>
                    {word}
                  </tspan>
                );
              })}
            </text>
          </g>
        );
      })}
    </svg>
      {hoveredTerritoryId && hoveredTerritory && (
        <div className="territory-tooltip" style={{ left: mousePos.x, top: mousePos.y }}>
          <div className="tooltip-title">{hoveredTerritory.name}</div>
          {hoveredTerritoryContinent && (
            <div className="tooltip-row">
              <span className="label">Método:</span>
              <span className="value">
                <span className="tooltip-color-swatch" style={{ background: hoveredTerritoryContinent.color }} />
                {hoveredTerritoryContinent.fullName}
              </span>
            </div>
          )}
          <div className="tooltip-row">
            <span className="label">Dono:</span>
            <span className="value">
              {hoveredTerritoryOwner ? (
                <>
                  <span className="tooltip-color-swatch" style={{ background: hoveredTerritoryOwner.color }} />
                  {hoveredTerritoryOwner.name}
                </>
              ) : (
                'Neutro'
              )}
            </span>
          </div>
          <div className="tooltip-row">
            <span className="label">Exércitos:</span>
            <span className="value">{hoveredTerritoryState?.armies ?? 0}</span>
          </div>
        </div>
      )}
    </>
  );
}
