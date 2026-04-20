import { RED_TAIL_COURSE } from '../data/courseData';

export function RoundSummary({ round, onNewRound, onViewRound }) {
  const { holes, setup, completedAt } = round;

  const downloadRound = (roundData) => {
    try {
      // Create JSON payload with all round data
      const roundJson = {
        round: roundData,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(roundJson, null, 2);

      // Create blob
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Generate filename with date
      const dateStr = new Date(completedAt || new Date()).toISOString().split('T')[0];
      const filename = `golf-round-${dateStr}-${Date.now()}.json`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('Round downloaded:', filename);
    } catch (error) {
      console.error('Failed to download round:', error);
      alert('Failed to download round data. Please try again.');
    }
  };

  const calculateStats = () => {
    const holeArray = Object.values(holes).filter(h => h.score);
    const scores = holeArray.map(h => h.score);

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const totalPar = holeArray.reduce((acc, h) => acc + h.par, 0);

    const front = RED_TAIL_COURSE.frontNine
      .filter(h => holes[h] && holes[h].score)
      .map(h => holes[h].score)
      .reduce((a, b) => a + b, 0);

    const back = RED_TAIL_COURSE.backNine
      .filter(h => holes[h] && holes[h].score)
      .map(h => holes[h].score)
      .reduce((a, b) => a + b, 0);

    const frontPar = RED_TAIL_COURSE.frontNine
      .filter(h => holes[h] && holes[h].score)
      .reduce((acc, h) => acc + holes[h].par, 0);

    const backPar = RED_TAIL_COURSE.backNine
      .filter(h => holes[h] && holes[h].score)
      .reduce((acc, h) => acc + holes[h].par, 0);

    // Driving stats - collect tee shots from each completed hole
    const teeShots = [];
    holeArray.forEach(hole => {
      if (hole.shots && hole.shots[0]) {
        teeShots.push(hole.shots[0]);
      }
    });

    // Driving distances - distance left after tee shot
    const drivingDistances = teeShots
      .filter(shot => shot.endGPS)
      .map(shot => parseInt(shot.endGPS) || 0);

    const fairwayHits = teeShots.filter(shot => shot.lie && shot.lie.includes('Fairway')).length;

    // GIR (Greens in Regulation) - reached green in par-2 or better strokes
    const girCount = holeArray.filter(hole => {
      const approaches = Math.max(1, (hole.totalStrokes || 0) - (hole.putts || 0));
      return approaches <= Math.max(1, hole.par - 2);
    }).length;

    // Penalty strokes - from shots with Water/OB/Lost Ball lies
    let totalPenaltyStrokes = 0;
    holeArray.forEach(hole => {
      if (hole.shots) {
        hole.shots.forEach(shot => {
          if (shot.lie && (
            shot.lie.includes('Water') ||
            shot.lie.includes('Out of Bounds') ||
            shot.lie.includes('Lost Ball')
          )) {
            totalPenaltyStrokes += 1;
          }
        });
      }
    });

    // Putting stats
    const totalPutts = holeArray.reduce((sum, h) => sum + (h.putts || 0), 0);
    const onePutts = holeArray.filter(h => h.putts === 1).length;
    const twoPutts = holeArray.filter(h => h.putts === 2).length;
    const threePlusPutts = holeArray.filter(h => (h.putts || 0) >= 3).length;

    const stats = {
      scores,
      totalScore,
      totalPar,
      vspar: totalScore - totalPar,
      front,
      back,
      frontPar,
      backPar,
      birdies: scores.filter((s, i) => {
        return holeArray[i] && s === holeArray[i].par - 1;
      }).length,
      eagles: scores.filter((s, i) => {
        return holeArray[i] && s <= holeArray[i].par - 2;
      }).length,
      pars: scores.filter((s, i) => {
        return holeArray[i] && s === holeArray[i].par;
      }).length,
      bogeys: scores.filter((s, i) => {
        return holeArray[i] && s === holeArray[i].par + 1;
      }).length,
      doubleBogeys: scores.filter((s, i) => {
        return holeArray[i] && s >= holeArray[i].par + 2;
      }).length,
      // Driving stats
      avgDrivingDistance: drivingDistances.length > 0
        ? Math.round(drivingDistances.reduce((a, b) => a + b, 0) / drivingDistances.length)
        : 0,
      maxDrivingDistance: drivingDistances.length > 0 ? Math.max(...drivingDistances) : 0,
      totalDrives: teeShots.length,
      fairwayHits,
      drivingAccuracy: teeShots.length > 0 ? Math.round((fairwayHits / teeShots.length) * 100) : 0,
      // GIR
      girCount,
      girPercentage: holeArray.length > 0 ? Math.round((girCount / holeArray.length) * 100) : 0,
      // Penalties
      penaltyStrokes: totalPenaltyStrokes,
      // Putting
      totalPutts,
      avgPutts: holeArray.length > 0 ? (totalPutts / holeArray.length).toFixed(1) : 0,
      onePutts,
      twoPutts,
      threePlusPutts,
    };

    return stats;
  };

  const stats = calculateStats();
  const date = new Date(completedAt || new Date());

  return (
    <div className="summary-container">
      <div className="summary-card">
        <div className="summary-header">
          <h1>Round Summary</h1>
          <p className="course-name">Red Tail Golf Club</p>
        </div>

        <div className="summary-meta">
          <div className="meta-item">
            <span className="label">Date</span>
            <span className="value">{date.toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <span className="label">Tees</span>
            <span className="value">{setup.tee.charAt(0).toUpperCase() + setup.tee.slice(1)}</span>
          </div>
          <div className="meta-item">
            <span className="label">Weather</span>
            <span className="value">{setup.weather}</span>
          </div>
        </div>

        <div className="score-section">
          <h2>Total Score</h2>
          <div className="main-score">
            <div className="score-box">
              <span className="score">{stats.totalScore}</span>
              <span className="label">Score</span>
            </div>
            <div className="score-box">
              <span className={`score ${stats.vspar > 0 ? 'over' : stats.vspar < 0 ? 'under' : 'even'}`}>
                {stats.vspar > 0 ? '+' : ''}{stats.vspar}
              </span>
              <span className="label">vs Par</span>
            </div>
            <div className="score-box">
              <span className="score">{stats.totalPar}</span>
              <span className="label">Par</span>
            </div>
          </div>
        </div>

        <div className="nine-holes">
          <div className="nine">
            <h3>Front 9</h3>
            <div className="score-display">
              <span className="score">{stats.front}</span>
              <span className="par">({stats.frontPar})</span>
              <span className={`vs-par ${stats.front - stats.frontPar > 0 ? 'over' : stats.front - stats.frontPar < 0 ? 'under' : 'even'}`}>
                {stats.front - stats.frontPar > 0 ? '+' : ''}{stats.front - stats.frontPar}
              </span>
            </div>
          </div>
          <div className="nine">
            <h3>Back 9</h3>
            <div className="score-display">
              <span className="score">{stats.back}</span>
              <span className="par">({stats.backPar})</span>
              <span className={`vs-par ${stats.back - stats.backPar > 0 ? 'over' : stats.back - stats.backPar < 0 ? 'under' : 'even'}`}>
                {stats.back - stats.backPar > 0 ? '+' : ''}{stats.back - stats.backPar}
              </span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.birdies}</span>
            <span className="stat-label">Birdies</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.pars}</span>
            <span className="stat-label">Pars</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.bogeys}</span>
            <span className="stat-label">Bogeys</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.eagles}</span>
            <span className="stat-label">Eagles</span>
          </div>
        </div>

        {/* Driving Stats */}
        <div className="stats-section">
          <h3>Driving Stats</h3>
          <div className="stats-grid-2col">
            <div className="stat-box">
              <div className="stat-label">Avg Distance</div>
              <div className="stat-value">{stats.avgDrivingDistance} yds</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Longest Drive</div>
              <div className="stat-value">{stats.maxDrivingDistance} yds</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Drives</div>
              <div className="stat-value">{stats.totalDrives}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Fairways Hit</div>
              <div className="stat-value">{stats.fairwayHits}/{stats.totalDrives}</div>
            </div>
            <div className="stat-box" style={{ gridColumn: 'span 2' }}>
              <div className="stat-label">Driving Accuracy</div>
              <div className="stat-value">{stats.drivingAccuracy}%</div>
            </div>
          </div>
        </div>

        {/* GIR Stats */}
        <div className="stats-section">
          <h3>Greens in Regulation</h3>
          <div className="stats-grid-2col">
            <div className="stat-box">
              <div className="stat-label">GIR</div>
              <div className="stat-value">{stats.girCount}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">GIR %</div>
              <div className="stat-value">{stats.girPercentage}%</div>
            </div>
          </div>
        </div>

        {/* Penalty Stats */}
        {stats.penaltyStrokes > 0 && (
          <div className="stats-section penalty-section">
            <h3>Penalty Strokes</h3>
            <div className="stats-grid-2col">
              <div className="stat-box penalty">
                <div className="stat-label">Penalty Strokes</div>
                <div className="stat-value">{stats.penaltyStrokes}</div>
              </div>
            </div>
          </div>
        )}

        {/* Putting Stats */}
        <div className="stats-section">
          <h3>Putting Stats</h3>
          <div className="stats-grid-2col">
            <div className="stat-box">
              <div className="stat-label">Total Putts</div>
              <div className="stat-value">{stats.totalPutts}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Avg Putts/Hole</div>
              <div className="stat-value">{stats.avgPutts}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">1-Putts</div>
              <div className="stat-value">{stats.onePutts}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">2-Putts</div>
              <div className="stat-value">{stats.twoPutts}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">3+ Putts</div>
              <div className="stat-value">{stats.threePlusPutts}</div>
            </div>
          </div>
        </div>

        <div className="scorecard-table">
          <h3>Scorecard</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Hole</th>
                  {RED_TAIL_COURSE.frontNine.map(h => (
                    <td key={h}>{h}</td>
                  ))}
                  <th>9</th>
                </tr>
                <tr>
                  <th>Par</th>
                  {RED_TAIL_COURSE.frontNine.map(h => (
                    <td key={h}>{holes[h]?.par}</td>
                  ))}
                  <th>{RED_TAIL_COURSE.frontNine.reduce((a, h) => a + holes[h]?.par, 0)}</th>
                </tr>
                <tr>
                  <th>Score</th>
                  {RED_TAIL_COURSE.frontNine.map(h => (
                    <td key={h} className={holes[h]?.score ? (holes[h].score > holes[h].par ? 'over' : holes[h].score < holes[h].par ? 'under' : 'even') : ''}>
                      {holes[h]?.score || '-'}
                    </td>
                  ))}
                  <th>{stats.front}</th>
                </tr>
              </thead>
            </table>
            <table>
              <thead>
                <tr>
                  <th>Hole</th>
                  {RED_TAIL_COURSE.backNine.map(h => (
                    <td key={h}>{h}</td>
                  ))}
                  <th>9</th>
                </tr>
                <tr>
                  <th>Par</th>
                  {RED_TAIL_COURSE.backNine.map(h => (
                    <td key={h}>{holes[h]?.par}</td>
                  ))}
                  <th>{RED_TAIL_COURSE.backNine.reduce((a, h) => a + holes[h]?.par, 0)}</th>
                </tr>
                <tr>
                  <th>Score</th>
                  {RED_TAIL_COURSE.backNine.map(h => (
                    <td key={h} className={holes[h]?.score ? (holes[h].score > holes[h].par ? 'over' : holes[h].score < holes[h].par ? 'under' : 'even') : ''}>
                      {holes[h]?.score || '-'}
                    </td>
                  ))}
                  <th>{stats.back}</th>
                </tr>
              </thead>
            </table>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={onNewRound}>
            Start New Round
          </button>
          <button className="btn btn-success" onClick={() => downloadRound(round)}>
            ⬇️ Download Round
          </button>
        </div>
      </div>
    </div>
  );
}
