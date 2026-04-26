import { useState, useEffect, useRef } from 'react';
import { RED_TAIL_COURSE } from '../data/courseData';
import { useGPS } from '../hooks/useGPS';
import InteractiveGolfMap from './InteractiveGolfMap';
import ShotMarkerModal from './ShotMarkerModal';
import ShotStatsTab from './ShotStatsTab';
import RoundStatsTab from './RoundStatsTab';
import { HoleMapModal } from './HoleMapModal';

export function HoleDetail({ hole, tee, holeData, onUpdate, onNavigate, allHoles, setup }) {
  const holeInfo = RED_TAIL_COURSE.holes.find(h => h.hole === hole);

  // State management
  const [shots, setShots] = useState(holeData?.shots || []);
  const [showShotModal, setShowShotModal] = useState(false);
  const [tapLocation, setTapLocation] = useState(null);
  const [tapDistances, setTapDistances] = useState(null);
  const [showPuttsModal, setShowPuttsModal] = useState(false);
  const [showHoleMapModal, setShowHoleMapModal] = useState(false);
  const [putts, setPutts] = useState('');
  const [holeComplete, setHoleComplete] = useState(false);
  const gpsPollingRef = useRef(null);
  const [playerGPS, setPlayerGPS] = useState(null);
  const [activeTab, setActiveTab] = useState('gps'); // 'gps', 'stats', or 'round'

  const gps = useGPS();

  // Auto-start GPS polling on component mount
  useEffect(() => {
    gps.startGPSPolling((position) => {
      setPlayerGPS({
        lat: position.latitude,
        lng: position.longitude,
      });
    });

    return () => {
      gps.stopGPSPolling();
    };
  }, []);

  const handleMapTap = (location) => {
    setTapLocation(location);
    setShowShotModal(true);
  };

  const handleYardageCalculated = (distances) => {
    setTapDistances(distances);
  };

  const handleSaveShot = (shot) => {
    const newShots = [...shots, shot];
    setShots(newShots);
    setShowShotModal(false);
    setTapLocation(null);
    setTapDistances(null);
  };

  const handleFinishHole = () => {
    gps.stopGPSPolling();
    setShowPuttsModal(true);
  };

  const handleSavePutts = () => {
    const calculatedTotalStrokes = shots.length + (putts ? parseInt(putts) : 0);

    const holeUpdate = {
      hole,
      totalStrokes: calculatedTotalStrokes,
      putts: putts ? parseInt(putts) : 0,
      shots,
      score: calculatedTotalStrokes,
    };

    onUpdate(holeUpdate);
    setShowPuttsModal(false);
    setHoleComplete(true);
    setShowHoleMapModal(true);
  };

  const handleCloseHoleMap = () => {
    setShowHoleMapModal(false);
    setHoleComplete(false);
    onNavigate(hole + 1);
  };

  return (
    <div className="hole-detail map-first-layout">
      {/* Header with navigation & shot count */}
      <div className="detail-header">
        <button className="nav-btn" onClick={() => onNavigate(hole - 1)}>
          ← Prev
        </button>
        <div className="hole-title">
          <h2>Hole {hole}</h2>
          <span className="shots-count">{shots.length} shot{shots.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="nav-btn" onClick={() => onNavigate(hole + 1)}>
          Next →
        </button>
      </div>

      {/* Hole info bar */}
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

      {/* Tab navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'gps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gps')}
        >
          📍 GPS & Measurement
        </button>
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Shot Tracking
        </button>
        <button
          className={`tab-btn ${activeTab === 'round' ? 'active' : ''}`}
          onClick={() => setActiveTab('round')}
        >
          📈 Round Stats
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'gps' && (
          <div className="map-section">
            <InteractiveGolfMap
              holeNumber={hole}
              holeData={holeInfo}
              playerGPS={playerGPS}
              shots={shots}
              selectedTee={tee}
              onTapLocation={handleMapTap}
              onYardageCalculated={handleYardageCalculated}
            />
          </div>
        )}
        {activeTab === 'stats' && (
          <ShotStatsTab
            shots={shots}
            gps={gps}
            holeData={holeInfo}
            holeNumber={hole}
            onShotSave={handleSaveShot}
          />
        )}
        {activeTab === 'round' && (
          <RoundStatsTab
            allHoles={allHoles}
            currentHole={hole}
            tee={tee}
          />
        )}
      </div>

      {/* Shot summary at bottom */}
      <div className="shots-summary">
        <div className="shots-list">
          {shots.map((shot, idx) => (
            <div key={idx} className="shot-item">
              <span className="shot-num">{idx + 1}</span>
              <span className="shot-club">{shot.club}</span>
              <span className="shot-lie">{shot.distance}yds → {shot.lie}</span>
            </div>
          ))}
        </div>
        {shots.length > 0 && (
          <button className="btn-finish-hole" onClick={handleFinishHole}>
            Finish Hole
          </button>
        )}
      </div>

      {/* Shot marker modal - appears on map tap */}
      {showShotModal && tapLocation && (
        <ShotMarkerModal
          tapLocation={tapLocation}
          distances={tapDistances}
          onSave={handleSaveShot}
          onCancel={() => setShowShotModal(false)}
        />
      )}

      {/* Putts modal */}
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

      {/* Hole map modal - post-hole summary */}
      {showHoleMapModal && (
        <HoleMapModal
          holeNumber={hole}
          holes={allHoles}
          setup={setup}
          onClose={handleCloseHoleMap}
        />
      )}
    </div>
  );
}
