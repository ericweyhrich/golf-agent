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

  const handleImportRound = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const data = JSON.parse(content);

        // Validate imported round structure
        if (data.round && data.round.holes && data.round.setup) {
          setCompletedRound(data.round);
          setAppState('summary');
          console.log('Round imported successfully');
        } else {
          alert('Invalid round file format. Please make sure this is a valid exported round.');
        }
      } catch (error) {
        console.error('Failed to import round:', error);
        alert('Failed to import round. The file may be corrupted or in an incorrect format.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="app">
      {appState === 'setup' && (
        <CourseSetup onStart={handleStartRound} onImportRound={handleImportRound} />
      )}
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
