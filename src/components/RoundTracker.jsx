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
      <div className="tracker-header">
        <div className="header-left">
          <h2>Red Tail Golf Club</h2>
          <p>{new Date(setup.date).toLocaleDateString()} • {setup.tee.charAt(0).toUpperCase() + setup.tee.slice(1)} Tees</p>
          <div className="live-weather">
            <span className="weather-icon">{weather.icon}</span>
            <span className="weather-temp">{weather.temperature !== null ? `${weather.temperature}°F` : 'Loading...'}</span>
            <span className="weather-condition">{weather.condition}</span>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="label">Score</span>
            <span className="value">{stats.totalScore || '—'}</span>
          </div>
          <div className="stat-badge">
            <span className="label">Holes</span>
            <span className="value">{stats.holesPlayed}/18</span>
          </div>
        </div>
      </div>

      <div className="hole-grid">
        {RED_TAIL_COURSE.holes.map(hole => {
          const data = holes[hole.hole];
          const isCurrentHole = hole.hole === currentHole;
          const score = data.score;
          const vs_par = score ? score - hole.par : null;

          return (
            <button
              key={hole.hole}
              className={`hole-btn ${isCurrentHole ? 'current' : ''} ${score ? 'completed' : ''}`}
              onClick={() => handleNavigate(hole.hole)}
            >
              <div className="hole-num">{hole.hole}</div>
              <div className="hole-info">
                {score ? (
                  <>
                    <span className="score-value">{score}</span>
                    <span className={`vs-par ${vs_par > 0 ? 'over' : vs_par < 0 ? 'under' : 'even'}`}>
                      {vs_par > 0 ? '+' : ''}{vs_par}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="par">Par {hole.par}</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <HoleDetail
        hole={currentHole}
        tee={setup.tee}
        holeData={holeData}
        onUpdate={handleHoleUpdate}
        onNavigate={handleNavigate}
        allHoles={holes}
        setup={setup}
      />

      <div className="tracker-footer">
        {stats.holesPlayed === 18 && (
          <button className="btn btn-success" onClick={() => onFinish(holes, setup)}>
            Finish Round
          </button>
        )}
      </div>
    </div>
  );
}
