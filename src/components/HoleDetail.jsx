import { useState, useEffect, useRef } from 'react';
import { RED_TAIL_COURSE } from '../data/courseData';
import { useGPS } from '../hooks/useGPS';
import InteractiveGolfMap from './InteractiveGolfMap';
import ShotMarkerModal from './ShotMarkerModal';
import { HoleMapModal } from './HoleMapModal';
import HoleBoundaryMapper from './HoleBoundaryMapper';

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
  const [showMapper, setShowMapper] = useState(false);
  const [mappedFeatures, setMappedFeatures] = useState(holeData?.features || []);
  const gpsPollingRef = useRef(null);
  const [playerGPS, setPlayerGPS] = useState(null);

  const gps = useGPS();

  // Sync mapped features when hole data changes
  useEffect(() => {
    setMappedFeatures(holeData?.features || []);
  }, [holeData?.features]);

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

  const handleSaveMapperFeatures = (features) => {
    console.log('Mapped features for hole', hole, ':', features);
    // Save features to state
    setMappedFeatures(features);
    // Also pass features to parent for persistence
    onUpdate({
      hole,
      features,
      shots: holeData?.shots || shots,
      totalStrokes: holeData?.totalStrokes,
      putts: holeData?.putts,
      score: holeData?.score
    });
    setShowMapper(false);
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
        <button className="btn-map-hole" onClick={() => setShowMapper(true)} title="Map hole boundaries">
          📍 Map Hole
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

      {/* Interactive map - PRIMARY interface */}
      <div className="map-section">
        <InteractiveGolfMap
          holeNumber={hole}
          holeData={holeInfo}
          playerGPS={playerGPS}
          shots={shots}
          courseGeoJSON={mappedFeatures.length > 0 ? { type: 'FeatureCollection', features: mappedFeatures } : null}
          selectedTee={tee}
          onTapLocation={handleMapTap}
          onYardageCalculated={handleYardageCalculated}
        />
      </div>

      {/* Shot summary at bottom */}
      <div className="shots-summary">
        <div className="shots-list">
          {shots.map((shot, idx) => (
            <div key={idx} className="shot-item">
              <span className="shot-num">{idx + 1}</span>
              <span className="shot-club">{shot.club}</span>
              <span className="shot-lie">{shot.lie}</span>
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

      {/* Hole boundary mapper */}
      {showMapper && (
        <HoleBoundaryMapper
          holeNumber={hole}
          holeData={{ ...holeInfo, features: mappedFeatures }}
          onSaveFeatures={handleSaveMapperFeatures}
          onClose={() => setShowMapper(false)}
        />
      )}
    </div>
  );
}
