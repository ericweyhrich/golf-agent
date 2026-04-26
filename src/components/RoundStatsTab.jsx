import './RoundStatsTab.css';

const RoundStatsTab = ({ allHoles, currentHole, tee }) => {
  // Calculate stats from allHoles data
  const calculateStats = () => {
    let frontNineScore = 0;
    let backNineScore = 0;
    let frontNinePar = 0;
    let backNinePar = 0;
    let totalPutts = 0;
    let totalFairways = 0;
    let girCount = 0;
    let holesCompleted = 0;
    let clubDistances = {};
    let totalDistance = 0;
    let shotCount = 0;

    Object.values(allHoles).forEach((hole) => {
      if (!hole || hole.hole === undefined) return;

      const holeInfo = require('../data/courseData').RED_TAIL_COURSE.holes.find(
        h => h.hole === hole.hole
      );
      if (!holeInfo) return;

      const par = holeInfo.par;
      const strokes = hole.totalStrokes || 0;
      const putts = hole.putts || 0;

      // Only count completed holes
      if (strokes > 0) {
        holesCompleted++;

        if (hole.hole <= 9) {
          frontNineScore += strokes;
          frontNinePar += par;
        } else {
          backNineScore += strokes;
          backNinePar += par;
        }

        totalPutts += putts;

        // GIR calculation (strokes <= par)
        if (strokes <= par) {
          girCount++;
        }

        // Fairway tracking (assume fairway if first shot from tee box)
        if (hole.shots && hole.shots.length > 0) {
          // You can enhance this later with more sophisticated fairway detection
          totalFairways++;
        }

        // Track club distances
        if (hole.shots && Array.isArray(hole.shots)) {
          hole.shots.forEach((shot) => {
            if (shot.club && shot.distance) {
              if (!clubDistances[shot.club]) {
                clubDistances[shot.club] = { total: 0, count: 0 };
              }
              clubDistances[shot.club].total += shot.distance;
              clubDistances[shot.club].count += 1;
              totalDistance += shot.distance;
              shotCount += 1;
            }
          });
        }

        // Note: shot.lie now represents landing position (where shot ended up)
        // e.g., 'Fairway', 'Rough', 'Green', 'Bunker', etc.
      }
    });

    // Calculate averages per club
    const clubAverages = {};
    Object.keys(clubDistances).forEach((club) => {
      clubAverages[club] = Math.round(
        clubDistances[club].total / clubDistances[club].count
      );
    });

    const totalScore = frontNineScore + backNineScore;
    const totalPar = frontNinePar + backNinePar;
    const scoreVsPar = totalScore - totalPar;
    const avgDistance = shotCount > 0 ? Math.round(totalDistance / shotCount) : 0;

    return {
      frontNineScore,
      backNineScore,
      totalScore,
      frontNinePar,
      backNinePar,
      totalPar,
      scoreVsPar,
      totalPutts,
      totalFairways,
      girCount,
      holesCompleted,
      avgDistance,
      clubAverages,
    };
  };

  const stats = calculateStats();

  const getScoreClass = (score, par) => {
    if (score === 0) return 'no-score';
    if (score < par) return 'under';
    if (score === par) return 'even';
    return 'over';
  };

  return (
    <div className="round-stats-tab">
      {/* Score Summary Cards */}
      <div className="stats-summary">
        <div className="summary-card large">
          <div className="card-label">Total Score</div>
          <div className={`card-value ${getScoreClass(stats.totalScore, stats.totalPar)}`}>
            {stats.totalScore || '—'}
          </div>
          <div className="card-par">Par {stats.totalPar}</div>
        </div>

        <div className="summary-card">
          <div className="card-label">vs Par</div>
          <div className={`card-value ${getScoreClass(stats.totalScore, stats.totalPar)}`}>
            {stats.totalScore > 0 ? (stats.scoreVsPar > 0 ? '+' : '') + stats.scoreVsPar : '—'}
          </div>
        </div>

        <div className="summary-card">
          <div className="card-label">Holes Done</div>
          <div className="card-value">{stats.holesCompleted}/18</div>
        </div>

        <div className="summary-card">
          <div className="card-label">Total Putts</div>
          <div className="card-value">{stats.totalPutts || '—'}</div>
        </div>
      </div>

      {/* Nine-Hole Breakdown */}
      <div className="nine-hole-section">
        <div className="nine-hole-card">
          <div className="nine-hole-header">Front 9</div>
          <div className="nine-hole-stats">
            <div className="nine-stat">
              <span className="nine-label">Score</span>
              <span className={`nine-value ${stats.frontNineScore > 0 ? getScoreClass(stats.frontNineScore, stats.frontNinePar) : 'no-score'}`}>
                {stats.frontNineScore || '—'}
              </span>
            </div>
            <div className="nine-stat">
              <span className="nine-label">Par</span>
              <span className="nine-value">{stats.frontNinePar}</span>
            </div>
            <div className="nine-stat">
              <span className="nine-label">vs Par</span>
              <span className={`nine-value ${stats.frontNineScore > 0 ? getScoreClass(stats.frontNineScore, stats.frontNinePar) : 'no-score'}`}>
                {stats.frontNineScore > 0 ? (stats.frontNineScore - stats.frontNinePar > 0 ? '+' : '') + (stats.frontNineScore - stats.frontNinePar) : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="nine-hole-card">
          <div className="nine-hole-header">Back 9</div>
          <div className="nine-hole-stats">
            <div className="nine-stat">
              <span className="nine-label">Score</span>
              <span className={`nine-value ${stats.backNineScore > 0 ? getScoreClass(stats.backNineScore, stats.backNinePar) : 'no-score'}`}>
                {stats.backNineScore || '—'}
              </span>
            </div>
            <div className="nine-stat">
              <span className="nine-label">Par</span>
              <span className="nine-value">{stats.backNinePar}</span>
            </div>
            <div className="nine-stat">
              <span className="nine-label">vs Par</span>
              <span className={`nine-value ${stats.backNineScore > 0 ? getScoreClass(stats.backNineScore, stats.backNinePar) : 'no-score'}`}>
                {stats.backNineScore > 0 ? (stats.backNineScore - stats.backNinePar > 0 ? '+' : '') + (stats.backNineScore - stats.backNinePar) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Running Totals */}
      <div className="running-totals">
        <div className="totals-card">
          <div className="totals-icon">🎯</div>
          <div className="totals-label">GIR</div>
          <div className="totals-value">{stats.girCount}/{stats.holesCompleted}</div>
        </div>

        <div className="totals-card">
          <div className="totals-icon">🏌️</div>
          <div className="totals-label">Avg Distance</div>
          <div className="totals-value">{stats.avgDistance} yds</div>
        </div>

        <div className="totals-card">
          <div className="totals-icon">📏</div>
          <div className="totals-label">Fairways</div>
          <div className="totals-value">{stats.totalFairways}/{stats.holesCompleted}</div>
        </div>
      </div>

      {/* Hole-by-Hole Scorecard */}
      <div className="scorecard-section">
        <div className="scorecard-header">Hole-by-Hole Scorecard</div>
        <div className="scorecard-grid">
          {Object.values(allHoles)
            .filter(hole => hole && hole.hole !== undefined)
            .sort((a, b) => a.hole - b.hole)
            .map((hole) => {
              const holeInfo = require('../data/courseData').RED_TAIL_COURSE.holes.find(
                h => h.hole === hole.hole
              );
              if (!holeInfo) return null;

              const score = hole.totalStrokes || 0;
              const par = holeInfo.par;
              const isCompleted = score > 0;
              const isCurrent = hole.hole === currentHole;

              return (
                <div
                  key={hole.hole}
                  className={`scorecard-hole ${isCurrent ? 'current' : ''} ${
                    isCompleted ? getScoreClass(score, par) : 'no-score'
                  }`}
                >
                  <div className="hole-num">{hole.hole}</div>
                  <div className="hole-par">P{par}</div>
                  <div className="hole-score">{isCompleted ? score : '—'}</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Club Distance Averages */}
      {Object.keys(stats.clubAverages).length > 0 && (
        <div className="club-stats-section">
          <div className="club-stats-header">Average Distances by Club</div>
          <div className="club-stats-grid">
            {Object.entries(stats.clubAverages)
              .sort((a, b) => b[1] - a[1])
              .map(([club, avg]) => (
                <div key={club} className="club-stat-item">
                  <div className="club-name">{club}</div>
                  <div className="club-distance">{avg} yds</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundStatsTab;
