import { useState } from 'react';
import './App.css';
import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/SetupScreen';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { TurnNotice } from './components/TurnNotice';
import { PlayersCard } from './components/PlayersCard';
import { TerritoriesCard } from './components/TerritoriesCard';
import { QuizModal } from './components/QuizModal';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const phase = useGameStore((s) => s.phase);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (phase === 'setup-players') {
    return (
      <div className="app-root screen-mode">
        <SetupScreen />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="app-root screen-mode">
        <GameOverScreen />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="game-layout">
        <Board />
        <div className="bottom-left-container">
          <TerritoriesCard />
          <PlayersCard />
        </div>
        <TurnNotice />
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />
      </div>
      <QuizModal />
    </div>
  );
}

export default App;
