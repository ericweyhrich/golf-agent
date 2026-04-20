import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CourseSetup } from './components/CourseSetup';
import { RoundTracker } from './components/RoundTracker';
import { RoundSummary } from './components/RoundSummary';
import './App.css';

function App() {
  const [appState, setAppState] = useState('setup'); // setup, tracking, summary
  const [currentSetup, setCurrentSetup] = useState(null);
  const [completedRound, setCompletedRound] = useState(null);
  const [roundHistory, setRoundHistory] = useLocalStorage('golfRoundHistory', []);

  const handleStartRound = (setup) => {
    setCurrentSetup(setup);
    setAppState('tracking');
  };

  const handleFinishRound = (holes, setup) => {
    const round = {
      id: Date.now(),
      holes,
      setup,
      completedAt: new Date().toISOString(),
    };

    setCompletedRound(round);
    setRoundHistory([...roundHistory, round]);
    setAppState('summary');
  };

  const handleNewRound = () => {
    setCurrentSetup(null);
    setCompletedRound(null);
    setAppState('setup');
  };

  return (
    <div className="app">
      {appState === 'setup' && <CourseSetup onStart={handleStartRound} />}
      {appState === 'tracking' && (
        <RoundTracker setup={currentSetup} onFinish={handleFinishRound} />
      )}
      {appState === 'summary' && completedRound && (
        <RoundSummary
          round={completedRound}
          onNewRound={handleNewRound}
          onViewRound={() => {}}
        />
      )}
    </div>
  );
}

export default App;
