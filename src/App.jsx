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
    console.log('App: handleStartRound called with setup:', setup);
    console.log('App: before setState - appState:', appState);
    setCurrentSetup(setup);
    setAppState('tracking');
    console.log('App: after setState call');
    setTimeout(() => {
      console.log('App: appState after 500ms:', appState);
    }, 500);
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

  console.log('App: rendering with appState:', appState);
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
