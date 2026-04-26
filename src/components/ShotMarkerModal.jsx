import { useState } from 'react';
import './ShotMarkerModal.css';

const GOLF_CLUBS = [
  'Driver',
  '3 Wood',
  '5 Wood',
  '2 Iron',
  '3 Iron',
  '4 Iron',
  '5 Iron',
  '6 Iron',
  '7 Iron',
  '8 Iron',
  '9 Iron',
  'PW',
  'GW',
  'SW',
  'LW',
];

const SHOT_LIES = [
  'Tee Box',
  'Fairway Center',
  'Fairway Left',
  'Fairway Right',
  'Rough',
  'Bunker',
  'Water',
  'Trees',
  'OB',
];

const ShotMarkerModal = ({
  tapLocation,
  distances,
  onSave,
  onCancel,
}) => {
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedLie, setSelectedLie] = useState('');

  const handleSave = () => {
    if (selectedClub && selectedLie) {
      onSave({
        club: selectedClub,
        lie: selectedLie,
        gpsLat: tapLocation.lat,
        gpsLon: tapLocation.lng,
        yardageToGreen: distances?.toGreen || 0,
        yardageToNearestHazard: distances?.nearestHazard || 0,
        timestamp: Date.now(),
      });
      // Reset form
      setSelectedClub('');
      setSelectedLie('');
    }
  };

  return (
    <div className="shot-marker-modal-overlay" onClick={onCancel}>
      <div className="shot-marker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Record Shot</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="modal-body">
          {/* Location info */}
          <div className="location-info">
            <div className="coord">{tapLocation.lat.toFixed(4)}</div>
            <div className="coord">{tapLocation.lng.toFixed(4)}</div>
          </div>

          {/* Distances display */}
          {distances && (
            <div className="distances-display">
              <div className="distance-item">
                <span className="label">To Green:</span>
                <span className="value">{distances.toGreen}yds</span>
              </div>
              <div className="distance-item">
                <span className="label">Nearest Hazard:</span>
                <span className="value">{distances.nearestHazard}yds</span>
              </div>
            </div>
          )}

          {/* Club selection */}
          <div className="form-group">
            <label>Club Used</label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="club-select"
            >
              <option value="">Select club...</option>
              {GOLF_CLUBS.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>

          {/* Lie selection */}
          <div className="form-group">
            <label>Lie</label>
            <div className="lie-buttons">
              {SHOT_LIES.map((lie) => (
                <button
                  key={lie}
                  className={`lie-btn ${selectedLie === lie ? 'active' : ''}`}
                  onClick={() => setSelectedLie(lie)}
                >
                  {lie}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!selectedClub || !selectedLie}
          >
            Save Shot
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShotMarkerModal;
