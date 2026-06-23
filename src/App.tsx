import './App.css';
import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/SetupScreen';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { QuizModal } from './components/QuizModal';
import { GameOverScreen } from './components/GameOverScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  if (phase === 'setup-players') {
    return (
      <div className="app-root">
        <SetupScreen />
      </div>
    );
  }

  if (phase === 'gameover') {
    return (
      <div className="app-root">
        <GameOverScreen />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="game-layout">
        <Board />
        <Sidebar />
      </div>
      <QuizModal />
    </div>
  );
}

export default App;
