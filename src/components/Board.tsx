import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  ADJACENCY,
  CONTINENT_CENTERS,
  CONTINENTS,
  LAYOUT,
  TERRITORIES,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '../data/mapData';

const TERRITORY_RADIUS = 22;
const BLOB_RADIUS = 150;

export function Board() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const territories = useGameStore((s) => s.territories);
  const selectedSource = useGameStore((s) => s.selectedSource);
  const fortifyTarget = useGameStore((s) => s.fortifyTarget);
  const setupPlayerIndex = useGameStore((s) => s.setupPlayerIndex);

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

  const drawnEdges = useMemo(() => {
    const seen = new Set<string>();
    const edges: [string, string][] = [];
    for (const [a, neighbors] of Object.entries(ADJACENCY)) {
      for (const b of neighbors) {
        const key = a < b ? `${a}|${b}` : `${b}|${a}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([a, b]);
        }
      }
    }
    return edges;
  }, []);

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
    <svg
      className="board-svg"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      role="img"
      aria-label="Tabuleiro de War dos Métodos Ágeis"
    >
      {CONTINENTS.map((c) => {
        const center = CONTINENT_CENTERS[c.id];
        return (
          <g key={c.id}>
            <circle
              cx={center.x}
              cy={center.y}
              r={BLOB_RADIUS}
              fill={c.color}
              opacity={0.1}
              stroke={c.color}
              strokeOpacity={0.4}
              strokeWidth={2}
            />
            <text
              x={center.x}
              y={center.y - BLOB_RADIUS + 18}
              textAnchor="middle"
              className="continent-label"
              fill={c.color}
            >
              {c.fullName}
            </text>
          </g>
        );
      })}

      {drawnEdges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={LAYOUT[a].x}
          y1={LAYOUT[a].y}
          x2={LAYOUT[b].x}
          y2={LAYOUT[b].y}
          className="edge-line"
        />
      ))}

      {TERRITORIES.map((t) => {
        const pos = LAYOUT[t.id];
        const state = territories[t.id];
        const owned = state?.ownerId ? playerColorOf[state.ownerId] : '#555';
        const isSelected = selectedSource === t.id;
        const isFortifyTarget = fortifyTarget === t.id;
        const isValidAttackTarget = validAttackTargets.has(t.id);
        const isValidFortifyTarget = validFortifyTargets.has(t.id);
        const isOwnedByActive = state?.ownerId === activePlayerId;
        const clickable =
          (phase === 'setup-placement' && isOwnedByActive) ||
          (phase === 'reinforce' && isOwnedByActive) ||
          (phase === 'attack' && (isOwnedByActive || isValidAttackTarget)) ||
          (phase === 'fortify' && (isOwnedByActive || isValidFortifyTarget));

        const isPotentialAttackSource =
          phase === 'attack' && !selectedSource && validAttackSources.has(t.id);

        let ringColor = 'transparent';
        if (isSelected || isFortifyTarget) ringColor = '#ffffff';
        else if (isValidAttackTarget) ringColor = '#ff5252';
        else if (isValidFortifyTarget) ringColor = '#a3e635';
        else if (isPotentialAttackSource) ringColor = '#fbbf24';

        return (
          <g
            key={t.id}
            transform={`translate(${pos.x}, ${pos.y})`}
            className={clickable ? 'territory clickable' : 'territory'}
            onClick={() => {
              // Em fase de ataque, sempre repassamos o clique (mesmo em
              // territórios "não clicáveis") para que o store explique por
              // que o clique não é válido naquele momento.
              if (phase === 'attack' || clickable) handleClick(t.id);
            }}
          >
            <circle
              r={TERRITORY_RADIUS + 5}
              fill="none"
              stroke={ringColor}
              strokeWidth={ringColor === 'transparent' ? 0 : 3}
            />
            <circle r={TERRITORY_RADIUS} fill={owned} stroke="#0a0a0a" strokeWidth={1.5} />
            <text textAnchor="middle" dy={5} className="army-count">
              {state?.armies ?? ''}
            </text>
            <text textAnchor="middle" dy={TERRITORY_RADIUS + 14} className="territory-label">
              {t.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
