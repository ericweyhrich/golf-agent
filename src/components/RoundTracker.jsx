import { useState, useEffect } from 'react';
import { RED_TAIL_COURSE } from '../data/courseData';
import { useWeather } from '../hooks/useWeather';
import { HoleDetail } from './HoleDetail';

export function RoundTracker({ setup, onFinish }) {
  const weather = useWeather(RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude);
  const [currentHole, setCurrentHole] = useState(1);
  const [holes, setHoles] = useState(
    RED_TAIL_COURSE.holes.reduce((acc, h) => {
      acc[h.hole] = { par: h.par, handicap: h.handicap };
      return acc;
    }, {})
  );

  const handleHoleUpdate = (data) => {
    setHoles({ ...holes, [data.hole]: { ...holes[data.hole], ...data } });
    if (currentHole < 18) {
      setCurrentHole(currentHole + 1);
    }
  };

  const handleNavigate = (hole) => {
    if (hole >= 1 && hole <= 18) {
      setCurrentHole(hole);
    }
  };

  const calculateStats = () => {
    const scores = Object.values(holes)
      .filter(h => h.score)
      .map(h => h.score);

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const totalPar = Object.values(holes)
      .filter(h => h.score)
      .reduce((acc, h) => acc + h.par, 0);

    const frontNine = holes => {
      const front = RED_TAIL_COURSE.frontNine;
      const scores = front
        .filter(h => holes[h] && holes[h].score)
        .map(h => holes[h].score);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null;
    };

    const backNine = holes => {
      const back = RED_TAIL_COURSE.backNine;
      const scores = back
        .filter(h => holes[h] && holes[h].score)
        .map(h => holes[h].score);
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) : null;
    };

    return {
      totalScore: scores.length > 0 ? totalScore : null,
      totalPar,
      vspar: scores.length > 0 ? totalScore - totalPar : null,
      holesPlayed: scores.length,
      frontNine: frontNine(holes),
      backNine: backNine(holes),
    };
  };

  const stats = calculateStats();
  const holeData = holes[currentHole];

  return (
    <div className="round-tracker">
      {/* Header and hole grid moved to footer for mobile space optimization */}

      <HoleDetail
        hole={currentHole}
        tee={setup.tee}
        holeData={holeData}
        onUpdate={handleHoleUpdate}
        onNavigate={handleNavigate}
        allHoles={holes}
        setup={setup}
      />

      {/* Compact footer with hole grid and round info */}
      <div className="round-tracker-footer">
        {/* Scrollable hole grid */}
        <div className="footer-hole-grid">
          {RED_TAIL_COURSE.holes.map(hole => {
            const data = holes[hole.hole];
            const isCurrentHole = hole.hole === currentHole;
            const score = data.score;
            const vs_par = score ? score - hole.par : null;

            return (
              <button
                key={hole.hole}
                className={`footer-hole-btn ${isCurrentHole ? 'current' : ''} ${score ? 'completed' : ''}`}
                onClick={() => handleNavigate(hole.hole)}
                title={`Hole ${hole.hole}`}
              >
                <div className="footer-hole-num">{hole.hole}</div>
                {score && <div style={{ fontSize: '8px' }}>{score}</div>}
              </button>
            );
          })}
        </div>

        {/* Compact info bar with navigation and stats */}
        <div className="footer-info-bar">
          <div className="footer-nav">
            <button onClick={() => handleNavigate(currentHole - 1)} disabled={currentHole === 1}>←</button>
            <span style={{ fontWeight: '600' }}>Hole {currentHole}/18</span>
            <button onClick={() => handleNavigate(currentHole + 1)} disabled={currentHole === 18}>→</button>
          </div>

          <div className="footer-stats">
            <div className="footer-stat-item">
              <span className="footer-stat-label">Score</span>
              <span className="footer-stat-value">{stats.totalScore || '—'}</span>
            </div>
            <div className="footer-stat-item">
              <span className="footer-stat-label">Weather</span>
              <span className="footer-stat-value">{weather.icon} {weather.temperature}°F</span>
            </div>
          </div>

          {stats.holesPlayed === 18 && (
            <button
              className="btn btn-success"
              style={{ padding: '4px 8px', fontSize: '10px', minHeight: '24px' }}
              onClick={() => onFinish(holes, setup)}
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
