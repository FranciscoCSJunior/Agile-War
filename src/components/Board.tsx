import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import {
  ADJACENCY,
  CONTINENT_CENTERS,
  CONTINENT_PATHS,
  CONTINENTS,
  LAYOUT,
  SEA_ROUTES,
  TERRITORIES,
  TERRITORY_BOUNDARY_PATHS,
  TERRITORY_PATHS,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from '../data/mapData';

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
        const owned = state?.ownerId ? playerColorOf[state.ownerId] : '#4a4f5e';
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
        let strokeWidth = 0.4;
        if (isSelected || isFortifyTarget) {
          stroke = '#ffffff'; strokeWidth = 2.5;
        } else if (isValidAttackTarget) {
          stroke = '#ff5252'; strokeWidth = 2.5;
        } else if (isValidFortifyTarget) {
          stroke = '#a3e635'; strokeWidth = 2.5;
        } else if (isPotentialAttackSource) {
          stroke = '#fbbf24'; strokeWidth = 2.5;
        }

        return (
          <path
            key={t.id}
            d={d}
            fill={owned}
            fillOpacity={1}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            className={clickable ? 'territory-path clickable' : 'territory-path'}
            onClick={() => {
              if (phase === 'attack' || clickable) handleClick(t.id);
            }}
          />
        );
      })}

      {/* Contorno de continente — grosso e colorido, distingue territórios */}
      {CONTINENTS.map((c) => {
        const d = CONTINENT_PATHS[c.id];
        if (!d) return null;
        return (
          <path
            key={`cont-${c.id}`}
            d={d}
            fill="none"
            stroke={c.color}
            strokeWidth={2.5}
            strokeOpacity={0.9}
            strokeLinejoin="round"
            pointerEvents="none"
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
            <text textAnchor="middle" dy={22} className="territory-label">
              {t.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
