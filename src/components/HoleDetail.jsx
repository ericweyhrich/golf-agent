import { useState } from 'react';
import { GOLF_CLUBS, RED_TAIL_COURSE } from '../data/courseData';
import { useGPS } from '../hooks/useGPS';

const SHOT_LIES = [
  { base: 'Fairway', options: ['Fairway Center', 'Fairway Left', 'Fairway Right'] },
  { base: 'Rough', options: ['Rough Left', 'Rough Right'] },
  { base: 'Bunker', options: ['Bunker Left', 'Bunker Right'] },
  { base: 'Green', options: ['Green'] },
  { base: 'Water', options: ['Water'] },
  { base: 'Out of Bounds', options: ['Out of Bounds Left', 'Out of Bounds Right'] },
  { base: 'Lost Ball', options: ['Lost Ball Left', 'Lost Ball Right'] },
];

const getAllLies = () => {
  return SHOT_LIES.flatMap(lie => lie.options);
};

export function HoleDetail({ hole, tee, holeData, onUpdate, onNavigate }) {
  const holeInfo = RED_TAIL_COURSE.holes.find(h => h.hole === hole);
  const holeYardage = holeInfo?.[tee] || 0;

  // State management
  const [shots, setShots] = useState(holeData?.shots || []);
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [showContinueFinishModal, setShowContinueFinishModal] = useState(false);
  const [showPuttsModal, setShowPuttsModal] = useState(false);
  const [putts, setPutts] = useState('');
  const [totalStrokes, setTotalStrokes] = useState('');

  const currentShot = shots[currentShotIndex] || {};
  const shotNumber = currentShotIndex + 1;

  const gps = useGPS(
    (distance) => {
      updateCurrentShot('endGPS', distance);
    },
    (endPos) => {
      updateCurrentShot('gpsLat', endPos.lat);
      updateCurrentShot('gpsLon', endPos.lon);
    }
  );

  const updateCurrentShot = (field, value) => {
    const newShots = [...shots];
    if (!newShots[currentShotIndex]) {
      newShots[currentShotIndex] = {};
    }
    newShots[currentShotIndex][field] = value;
    setShots(newShots);
  };

  const handleStartGPS = () => {
    updateCurrentShot('gpsActive', true);
    gps.startGPS();
  };

  const handleEndGPS = () => {
    gps.endGPS();
  };

  const handleLieSelect = (lie) => {
    updateCurrentShot('lie', lie);
    setShowContinueFinishModal(true);
  };

  const handleContinueToNextShot = () => {
    setShowContinueFinishModal(false);
    setCurrentShotIndex(currentShotIndex + 1);
  };

  const handleFinishHole = () => {
    setShowContinueFinishModal(false);
    setShowPuttsModal(true);
  };

  const handleSavePutts = () => {
    const holesCompleted = shots.filter(s => s.lie).length;
    const calculatedTotalStrokes = holesCompleted + (putts ? parseInt(putts) : 0);

    setTotalStrokes(calculatedTotalStrokes);
    onUpdate({
      hole,
      totalStrokes: calculatedTotalStrokes,
      putts: putts ? parseInt(putts) : 0,
      penaltyStrokes: shots.filter(s =>
        s.lie && (s.lie.includes('Water') || s.lie.includes('Out of Bounds') || s.lie.includes('Lost Ball'))
      ).length,
      shots: shots.filter(s => s.lie),
      score: calculatedTotalStrokes,
    });
    setShowPuttsModal(false);
  };

  const getShotLabel = (index) => {
    if (index === 0) return 'First Shot';
    if (index === 1) return 'Second Shot';
    if (index === 2) return 'Third Shot';
    return `Shot ${index + 1}`;
  };

  const getStartGPS = () => {
    if (currentShotIndex === 0) return holeYardage;
    return shots[currentShotIndex - 1]?.endGPS || null;
  };

  const par = holeInfo?.par || 0;

  return (
    <div className="hole-detail">
      <div className="detail-header">
        <button className="nav-btn" onClick={() => onNavigate(hole - 1)}>
          ← Prev
        </button>
        <h2>Hole {hole}</h2>
        <button className="nav-btn" onClick={() => onNavigate(hole + 1)}>
          Next →
        </button>
      </div>

      <div className="hole-info-bar">
        <div className="hole-info-item">
          <span className="label">Par</span>
          <span className="value">{holeInfo?.par}</span>
        </div>
        <div className="hole-info-item">
          <span className="label">Yards</span>
          <span className="value">{holeInfo?.[tee]}</span>
        </div>
        <div className="hole-info-item">
          <span className="label">HCP</span>
          <span className="value">{holeInfo?.handicap}</span>
        </div>
      </div>

      <div className="shots-section">
        {/* Current Shot Card */}
        <div className="shot-card active-shot">
          <h3>{getShotLabel(currentShotIndex)}</h3>

          <div className="shot-start-gps">
            <span className="label">Start:</span>
            <span className="value">{getStartGPS() !== null ? `${getStartGPS()} yards` : '—'}</span>
          </div>

          <div className="input-group">
            <label htmlFor="shot-club">Club</label>
            <select
              id="shot-club"
              value={currentShot.club || ''}
              onChange={(e) => updateCurrentShot('club', e.target.value)}
            >
              <option value="">Select club...</option>
              {GOLF_CLUBS.map(club => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>

          <div className="gps-controls">
            {!currentShot.gpsActive && !currentShot.endGPS ? (
              <button
                className="btn-gps btn-gps-start"
                onClick={handleStartGPS}
                disabled={gps.gpsLoading}
              >
                {gps.gpsLoading ? '⏳' : '📍'} Start GPS
              </button>
            ) : currentShot.gpsActive && !currentShot.endGPS ? (
              <button
                className="btn-gps btn-gps-end"
                onClick={handleEndGPS}
                disabled={gps.gpsLoading}
              >
                {gps.gpsLoading ? '⏳' : '📍'} End GPS
              </button>
            ) : currentShot.endGPS ? (
              <div className="gps-result">
                ✅ Distance recorded: {currentShot.endGPS} yards away
              </div>
            ) : null}
          </div>

          {gps.gpsError && currentShot.gpsActive && (
            <div className="gps-error">{gps.gpsError}</div>
          )}

          {/* Lie Selection - Shows only after GPS is complete */}
          {currentShot.endGPS && !currentShot.lie && (
            <div className="lie-selection">
              <label>Where did it land?</label>
              <div className="lie-buttons">
                {getAllLies().map(lie => (
                  <button
                    key={lie}
                    className="lie-btn"
                    onClick={() => handleLieSelect(lie)}
                  >
                    {lie}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentShot.lie && (
            <div className="shot-complete">
              ✅ Club: {currentShot.club} | Distance: {currentShot.endGPS} yards | Lie: {currentShot.lie}
            </div>
          )}
        </div>

        {/* Previous Shots Summary */}
        {shots.map((shot, idx) => (
          idx < currentShotIndex && shot.lie && (
            <div key={idx} className="shot-card completed-shot">
              <h4>{getShotLabel(idx)}</h4>
              <p>Club: {shot.club} | Distance: {shot.endGPS} yards | Lie: {shot.lie}</p>
            </div>
          )
        ))}
      </div>

      {/* Continue/Finish Modal */}
      {showContinueFinishModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Shot Complete</h3>
            <p>Continue to next shot or finish hole?</p>
            <div className="modal-buttons">
              <button className="btn btn-primary" onClick={handleContinueToNextShot}>
                Continue Shot
              </button>
              <button className="btn btn-success" onClick={handleFinishHole}>
                Finish Hole
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Putts Modal */}
      {showPuttsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Hole Complete</h3>
            <p>How many putts?</p>
            <div className="modal-input">
              <select
                value={putts}
                onChange={(e) => setPutts(e.target.value)}
                autoFocus
              >
                <option value="">Select...</option>
                {Array.from({ length: 11 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div className="modal-buttons">
              <button
                className="btn btn-success"
                onClick={handleSavePutts}
                disabled={!putts}
              >
                Finish Hole & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
