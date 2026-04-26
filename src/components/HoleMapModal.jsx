import { ShotMap } from './ShotMap';
import { RED_TAIL_COURSE } from '../data/courseData';

export function HoleMapModal({ holeNumber, holes, setup, onClose }) {
  const hole = holes[holeNumber];
  const holeInfo = RED_TAIL_COURSE.holes.find(h => h.hole === holeNumber);

  if (!hole || !holeInfo) return null;

  const score = hole.score || 0;
  const par = hole.par || 0;
  const vspar = score - par;
  const totalStrokes = hole.totalStrokes || 0;

  return (
    <div className="hole-map-modal-overlay">
      <div className="hole-map-modal">
        <div className="hole-map-header">
          <h2>Hole {holeNumber} Complete</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="hole-map-stats-top">
          <div className="stat-box">
            <div className="stat-label">Score</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Par</div>
            <div className="stat-value">{par}</div>
          </div>
          <div className="stat-box">
            <div className={`stat-label vs-par ${vspar > 0 ? 'over' : vspar < 0 ? 'under' : 'even'}`}>
              vs Par
            </div>
            <div className={`stat-value ${vspar > 0 ? 'over' : vspar < 0 ? 'under' : 'even'}`}>
              {vspar > 0 ? '+' : ''}{vspar}
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Strokes</div>
            <div className="stat-value">{totalStrokes}</div>
          </div>
        </div>

        <div className="hole-map-container-main">
          <ShotMap holes={holes} holeNumber={holeNumber} setup={setup} />
        </div>

        <div className="hole-map-details">
          <div className="details-column">
            <h4>Shot Summary</h4>
            {hole.shots && hole.shots.length > 0 ? (
              <ul className="shots-list">
                {hole.shots.map((shot, idx) => (
                  <li key={idx}>
                    <strong>Shot {idx + 1}:</strong> {shot.club}
                    {shot.endGPS && ` - ${shot.endGPS} yds`}
                    {shot.lie && ` (${shot.lie})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No shot data recorded</p>
            )}
          </div>
          <div className="details-column">
            <h4>Hole Info</h4>
            <p><strong>Hole:</strong> {holeNumber}</p>
            <p><strong>Par:</strong> {par}</p>
            <p><strong>Handicap:</strong> {holeInfo.handicap}</p>
            <p><strong>Distance:</strong> {holeInfo[setup?.tee] || '—'} yards</p>
          </div>
        </div>

        <button className="btn btn-primary continue-btn" onClick={onClose}>
          Continue to Next Hole
        </button>
      </div>
    </div>
  );
}
