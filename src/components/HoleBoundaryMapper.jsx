import { useState, useRef, useEffect } from 'react';
import './HoleBoundaryMapper.css';

const HoleBoundaryMapper = ({ holeNumber, holeData, onSaveFeatures, onClose }) => {
  const [hazardType, setHazardType] = useState('green');
  const [points, setPoints] = useState([]);
  const [features, setFeatures] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawnLayersRef = useRef([]);
  const pointsRef = useRef([]);

  // Load existing features from hole data or localStorage when mapper opens
  useEffect(() => {
    if (holeData?.features && holeData.features.length > 0) {
      console.log('Loading existing features for hole', holeNumber, ':', holeData.features);
      setFeatures(holeData.features);
    } else {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(`hole_${holeNumber}_boundaries`);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Loaded', parsed.length, 'features from localStorage for hole', holeNumber);
          setFeatures(parsed);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  }, [holeNumber, holeData?.features]);

  // Auto-save features to localStorage whenever they change
  useEffect(() => {
    if (features.length > 0) {
      try {
        localStorage.setItem(`hole_${holeNumber}_boundaries`, JSON.stringify(features));
        console.log('Auto-saved', features.length, 'features to localStorage for hole', holeNumber);
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [features, holeNumber]);


  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const initMap = () => {
      if (!window.google?.maps) {
        setTimeout(initMap, 100);
        return;
      }

      const element = mapRef.current;
      if (!element) {
        console.warn('Map element not found');
        return;
      }

      try {
        // Ensure element has computed style and is in the DOM
        const styles = window.getComputedStyle(element);
        const width = element.offsetWidth;
        const height = element.offsetHeight;

        if (width === 0 || height === 0) {
          console.warn('Map element has zero dimensions, retrying...');
          setTimeout(initMap, 100);
          return;
        }

        mapInstanceRef.current = new window.google.maps.Map(element, {
          center: { lat: holeData?.greenLat || 42.1955, lng: holeData?.greenLon || -88.3601 },
          zoom: 20,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE,
          fullscreenControl: false,
          streetViewControl: false,
        });

        // Add green marker
        if (holeData?.greenLat) {
          new window.google.maps.Marker({
            position: { lat: holeData.greenLat, lng: holeData.greenLon },
            map: mapInstanceRef.current,
            title: `Hole ${holeNumber} Green`,
            icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          });
        }

        // Setup click handler immediately after map is initialized
        const handleMapClick = (e) => {
          const newPoint = [e.latLng.lat(), e.latLng.lng()];
          pointsRef.current = [...pointsRef.current, newPoint];
          setPoints([...pointsRef.current]);

          // Add visual marker (circle)
          const circle = new window.google.maps.Circle({
            map: mapInstanceRef.current,
            center: { lat: newPoint[0], lng: newPoint[1] },
            radius: 8,
            fillColor: '#FFFF00',
            fillOpacity: 0.9,
            strokeColor: '#000',
            strokeWeight: 3,
          });
          drawnLayersRef.current.push(circle);

          // Draw line if more than one point
          if (pointsRef.current.length > 1) {
            const prevPoint = pointsRef.current[pointsRef.current.length - 2];
            const polyline = new window.google.maps.Polyline({
              map: mapInstanceRef.current,
              path: [
                { lat: prevPoint[0], lng: prevPoint[1] },
                { lat: newPoint[0], lng: newPoint[1] },
              ],
              strokeColor: '#ff7800',
              strokeWeight: 2,
              strokeOpacity: 0.7,
            });
            drawnLayersRef.current.push(polyline);
          }
        };

        mapInstanceRef.current.addListener('click', handleMapClick);
      } catch (error) {
        console.error('Map initialization error:', error);
        console.error('Element:', element);
        console.error('Element type:', typeof element);
        console.error('Element constructor:', element?.constructor?.name);
      }
    };

    // Use a longer delay to ensure modal is fully rendered and CSS applied
    setTimeout(initMap, 1000);
  }, [holeNumber, holeData]);

  const completePolygon = () => {
    if (points.length < 3) {
      alert('Please place at least 3 points to create a polygon');
      return;
    }

    // Convert points to GeoJSON format [lng, lat]
    const geoJsonCoordinates = points.map(p => [p[1], p[0]]);

    const newFeature = {
      type: 'Feature',
      properties: { hole: holeNumber, type: hazardType, name: `Hole ${holeNumber} ${hazardType}` },
      geometry: {
        type: 'Polygon',
        coordinates: [geoJsonCoordinates]
      }
    };

    setFeatures([...features, newFeature]);

    // Clear drawn layers
    drawnLayersRef.current.forEach(layer => {
      layer.setMap(null);
    });
    drawnLayersRef.current = [];

    pointsRef.current = [];
    setPoints([]);
    alert(`${hazardType} saved! Start drawing the next feature.`);
  };

  const undoLastPoint = () => {
    if (pointsRef.current.length > 0) {
      pointsRef.current = pointsRef.current.slice(0, -1);
      setPoints([...pointsRef.current]);

      // Remove last 2 layers (marker and line)
      if (drawnLayersRef.current.length > 0) {
        const layer = drawnLayersRef.current.pop();
        layer.setMap(null);
      }
      if (drawnLayersRef.current.length > 0 && pointsRef.current.length > 1) {
        const layer = drawnLayersRef.current.pop();
        layer.setMap(null);
      }
    }
  };

  const clearPoints = () => {
    pointsRef.current = [];
    setPoints([]);
    drawnLayersRef.current.forEach(layer => {
      layer.setMap(null);
    });
    drawnLayersRef.current = [];
  };

  const deleteFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const exportCoordinates = () => {
    const json = JSON.stringify(features, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hole-${holeNumber}-features.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const finishMapping = () => {
    // Explicitly save to localStorage before closing
    if (features.length > 0) {
      try {
        localStorage.setItem(`hole_${holeNumber}_boundaries`, JSON.stringify(features));
        console.log('Explicitly saved', features.length, 'features to localStorage before closing');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    onSaveFeatures(features);
    onClose();
  };

  return (
    <div className="hole-boundary-mapper">
      <div className="mapper-header">
        <h2>Hole {holeNumber} - Boundary Mapper</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="mapper-content">
        <div ref={mapRef} className="mapper-map" style={{ width: '100%', height: '100%' }} />

        <div className="mapper-controls">
          <div className="control-section">
            <h3>Hazard Type</h3>
            <select value={hazardType} onChange={(e) => setHazardType(e.target.value)}>
              <option value="hole_outline">Hole Outline</option>
              <option value="green">Green</option>
              <option value="bunker">Bunker</option>
              <option value="water">Water</option>
              <option value="oob">Out of Bounds</option>
            </select>
          </div>

          <div className="control-section">
            <h3>Drawing Instructions</h3>
            <p>1. Select hazard type above</p>
            <p>2. Click on the map to place points</p>
            <p>3. Click "Complete Polygon" when done</p>
            <p>4. Repeat for each hazard</p>
            <p className="points-count">Points placed: {points.length}</p>
          </div>

          <div className="control-section">
            <h3>Actions</h3>
            <button className="btn-primary" onClick={completePolygon} disabled={points.length < 3}>
              Complete Polygon
            </button>
            <button className="btn-secondary" onClick={undoLastPoint} disabled={points.length === 0}>
              Undo Last Point
            </button>
            <button className="btn-secondary" onClick={clearPoints} disabled={points.length === 0}>
              Clear All Points
            </button>
          </div>

          <div className="control-section">
            <h3>Features Mapped</h3>
            <div className="features-list">
              {features.map((f, idx) => (
                <div key={idx} className="feature-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{f.properties.name} ({f.geometry.coordinates[0].length} points)</span>
                    <button
                      onClick={() => deleteFeature(idx)}
                      style={{
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>Export</h3>
            <button className="btn-primary" onClick={exportCoordinates} disabled={features.length === 0}>
              Download JSON
            </button>
            <button className="btn-primary" onClick={finishMapping}>
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoleBoundaryMapper;
