import { useState } from 'react';
import { GOLF_CLUBS } from '../data/courseData';
import { calculateDistance } from '../utils/distanceCalculations';
import './ShotStatsTab.css';

const ShotStatsTab = ({ shots, gps, holeData, holeNumber, onShotSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [currentDistance, setCurrentDistance] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedLandingPosition, setSelectedLandingPosition] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastShotDetails, setLastShotDetails] = useState(null);

  const landingPositionOptions = ['Fairway', 'Rough', 'Bunker', 'Hazard', 'Green', 'Out of Bounds'];

  const handleStartShot = async () => {
    try {
      const position = gps.getCurrentPosition();
      if (position) {
        setStartLocation({ lat: position.latitude, lng: position.longitude });
        setIsRecording(true);
      } else {
        alert('Unable to get GPS location. Please ensure location services are enabled.');
      }
    } catch (error) {
      console.error('Error getting start location:', error);
      alert('Error getting GPS location');
    }
  };

  const handleEndShot = async () => {
    try {
      const position = gps.getCurrentPosition();
      if (position) {
        const endLoc = { lat: position.latitude, lng: position.longitude };
        setEndLocation(endLoc);

        // Calculate distance
        const distance = calculateDistance(startLocation, endLoc);
        setCurrentDistance(Math.round(distance));
        setShowForm(true);
        setIsRecording(false);
      } else {
        alert('Unable to get GPS location. Please ensure location services are enabled.');
      }
    } catch (error) {
      console.error('Error getting end location:', error);
      alert('Error getting GPS location');
    }
  };

  const handleSaveShot = () => {
    if (!selectedClub || !selectedLandingPosition) {
      alert('Please select both club and landing position');
      return;
    }

    const shotNumber = shots.length + 1;
    const shotObject = {
      club: selectedClub,
      lie: selectedLandingPosition,
      gpsLat: endLocation.lat,
      gpsLon: endLocation.lng,
      distance: currentDistance,
      startLat: startLocation.lat,
      startLon: startLocation.lng,
      timestamp: Date.now(),
    };

    setLastShotDetails({
      number: shotNumber,
      club: selectedClub,
      distance: currentDistance,
      lie: selectedLandingPosition,
    });
    setShowConfirmation(true);
  };

  const handleConfirmShot = () => {
    const shotObject = {
      club: selectedClub,
      lie: selectedLandingPosition,
      gpsLat: endLocation.lat,
      gpsLon: endLocation.lng,
      distance: currentDistance,
      startLat: startLocation.lat,
      startLon: startLocation.lng,
      timestamp: Date.now(),
    };

    onShotSave(shotObject);

    // Reset form
    setShowConfirmation(false);
    setShowForm(false);
    setIsRecording(false);
    setStartLocation(null);
    setEndLocation(null);
    setCurrentDistance(null);
    setSelectedClub('');
    setSelectedLandingPosition('');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsRecording(false);
    setStartLocation(null);
    setEndLocation(null);
    setCurrentDistance(null);
    setSelectedClub('');
    setSelectedLandingPosition('');
  };

  return (
    <div className="shot-stats-tab">
      {/* Recording Section */}
      <div className="recording-section">
        <h3>Record Shot</h3>
        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleStartShot}
            disabled={isRecording}
          >
            {isRecording ? '🔴 Recording...' : '▶ Start Shot'}
          </button>
          <button
            className="btn btn-success"
            onClick={handleEndShot}
            disabled={!isRecording}
          >
            ⏹ End Shot
          </button>
        </div>

        {currentDistance !== null && !showForm && (
          <div className="distance-display">
            <p className="distance-label">Shot Distance</p>
            <p className="distance-value">{currentDistance} yds</p>
          </div>
        )}
      </div>

      {/* Shot Details Form */}
      {showForm && (
        <div className="shot-form">
          <h3>Shot Details</h3>

          <div className="form-group">
            <label>Club</label>
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              autoFocus
            >
              <option value="">Select Club...</option>
              {GOLF_CLUBS.map((club) => (
                <option key={club} value={club}>
                  {club}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Landing Position</label>
            <select
              value={selectedLandingPosition}
              onChange={(e) => setSelectedLandingPosition(e.target.value)}
            >
              <option value="">Select Landing Position...</option>
              {landingPositionOptions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group distance-readonly">
            <label>Distance</label>
            <p className="distance-value">{currentDistance} yds</p>
          </div>

          <div className="form-buttons">
            <button className="btn btn-success" onClick={handleSaveShot}>
              Save Shot
            </button>
            <button className="btn btn-secondary" onClick={handleCancelForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && lastShotDetails && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Shot #{lastShotDetails.number} Recorded</h3>
            <div className="confirmation-details">
              <p>
                <strong>Club:</strong> {lastShotDetails.club}
              </p>
              <p>
                <strong>Distance:</strong> {lastShotDetails.distance} yds
              </p>
              <p>
                <strong>Landing Position:</strong> {lastShotDetails.lie}
              </p>
            </div>
            <div className="modal-buttons">
              <button className="btn btn-success" onClick={handleConfirmShot}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shot History Section */}
      <div className="shot-history-section">
        <h3>Shot History</h3>
        {shots.length === 0 ? (
          <p className="no-shots">No shots recorded yet</p>
        ) : (
          <div className="shots-list">
            {shots.map((shot, idx) => (
              <div key={idx} className="shot-card">
                <div className="shot-number">#{idx + 1}</div>
                <div className="shot-details">
                  <div className="shot-info">
                    <span className="shot-club">{shot.club}</span>
                    <span className="shot-distance">{shot.distance} yds</span>
                  </div>
                  <div className="shot-lie">{shot.lie}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotStatsTab;
