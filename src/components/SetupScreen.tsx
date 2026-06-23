import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CONTINENTS } from '../data/mapData';
import { PLAYER_COLORS, PLAYER_COLOR_NAMES } from '../utils/random';

export function SetupScreen() {
  const startSetup = useGameStore((s) => s.startSetup);
  const [numPlayers, setNumPlayers] = useState(3);
  const [names, setNames] = useState<string[]>(['', '', '', '', '', '']);

  return (
    <div className="screen setup-screen">
      <h1>War dos Métodos Ágeis</h1>
      <p className="subtitle">
        Gerência de Projetos de Software — Revisão III. Conquiste os 7 continentes (métodos
        ágeis) respondendo corretamente às questões da revisão para tomar territórios inimigos.
      </p>

      <div className="continent-legend">
        {CONTINENTS.map((c) => (
          <div key={c.id} className="legend-item">
            <span className="swatch" style={{ background: c.color }} />
            <span>
              {c.fullName} <small>(+{c.bonus} ao controlar todo o continente)</small>
            </span>
          </div>
        ))}
      </div>

      <div className="player-count-picker">
        <span>Número de jogadores:</span>
        {[2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            className={n === numPlayers ? 'count-btn active' : 'count-btn'}
            onClick={() => setNumPlayers(n)}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="player-names">
        {Array.from({ length: numPlayers }, (_, i) => (
          <div key={i} className="player-name-row">
            <span className="swatch" style={{ background: PLAYER_COLORS[i] }} />
            <input
              type="text"
              placeholder={`Jogador ${i + 1} (${PLAYER_COLOR_NAMES[i]})`}
              value={names[i]}
              onChange={(e) => {
                const next = [...names];
                next[i] = e.target.value;
                setNames(next);
              }}
              maxLength={20}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        className="primary-btn"
        onClick={() => startSetup(numPlayers, names.slice(0, numPlayers))}
      >
        Sortear territórios e começar
      </button>

      <div className="rules-box">
        <h3>Como jogar</h3>
        <p>
          1. <strong>Posicionamento inicial:</strong> cada jogador recebe territórios
          aleatórios, um continente-objetivo sorteado e um time de exércitos para distribuir
          clicando nos próprios territórios.
        </p>
        <p>
          2. <strong>Reforço:</strong> a cada turno você recebe exércitos (com bônus por
          continente inteiro controlado) para reforçar seus territórios.
        </p>
        <p>
          3. <strong>Ataque:</strong> selecione um território seu (com 2+ exércitos) e um
          território inimigo adjacente. Responda a pergunta da revisão — acertou, conquista o
          território; errou, perde 1 exército.
        </p>
        <p>
          4. <strong>Fortificação:</strong> ao final do turno, mova exércitos entre dois
          territórios seus conectados.
        </p>
        <p>
          <strong>Objetivo:</strong> cada jogador recebe um continente-alvo para conquistar
          (visível na barra lateral durante a partida). Quem conquistar as 4 províncias do seu
          continente-objetivo vence o jogo imediatamente. Também é possível vencer dominando
          todo o tabuleiro ou sendo o último jogador restante.
        </p>
      </div>
    </div>
  );
}
