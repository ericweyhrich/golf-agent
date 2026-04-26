import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RED_TAIL_COURSE } from '../data/courseData';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const greenIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const yellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function ShotMap({ holes, holeNumber = null, setup = null }) {
  // Filter shots by hole if holeNumber is provided
  const relevantHoles = holeNumber ? { [holeNumber]: holes[holeNumber] } : holes;
  const shotPositions = [];

  Object.entries(relevantHoles).forEach(([holeNum, holeData]) => {
    if (holeData && holeData.shots && Array.isArray(holeData.shots)) {
      holeData.shots.forEach((shot, shotIndex) => {
        if (shot.gpsLat && shot.gpsLon) {
          shotPositions.push({
            hole: parseInt(holeNum),
            shot: shotIndex + 1,
            lat: shot.gpsLat,
            lon: shot.gpsLon,
            distance: shot.endGPS || 0,
            club: shot.club || 'Unknown',
            lie: shot.lie || 'Unknown',
          });
        }
      });
    }
  });

  // Get tee box and green info for the hole
  let teeBoxPos = null;
  let greenPos = null;
  let mapCenter = [RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude];
  let mapZoom = 16;

  if (holeNumber) {
    const holeData = RED_TAIL_COURSE.holes.find(h => h.hole === holeNumber);
    if (holeData) {
      greenPos = { lat: holeData.greenLat, lon: holeData.greenLon };

      // Get tee box for selected tee
      if (holeData.teeboxes && setup && setup.tee) {
        const teebox = holeData.teeboxes[setup.tee];
        if (teebox) {
          teeBoxPos = { lat: teebox.lat, lon: teebox.lon };
        }
      }

      // Center map on this hole
      if (greenPos) {
        mapCenter = [greenPos.lat, greenPos.lon];
      }
      mapZoom = 17;
    }
  }

  // Create a line connecting all shots
  const shotLine = shotPositions.map(pos => [pos.lat, pos.lon]);

  // Add tee box and green to shot line if hole-specific view
  if (holeNumber && teeBoxPos && shotLine.length > 0) {
    shotLine.unshift([teeBoxPos.lat, teeBoxPos.lon]);
  }
  if (holeNumber && greenPos && shotLine.length > 0) {
    shotLine.push([greenPos.lat, greenPos.lon]);
  }

  return (
    <div className="shot-map-container">
      <h3>🗺️ {holeNumber ? `Hole ${holeNumber} Map` : 'Shot Map'}</h3>
      {shotPositions.length === 0 ? (
        <div className="no-shots-message">
          <p>No GPS data recorded yet. Complete a shot with GPS to see the map.</p>
        </div>
      ) : (
        <>
          <MapContainer center={mapCenter} zoom={mapZoom} className="shot-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Draw line connecting tee -> shots -> green */}
            {shotLine.length > 1 && (
              <Polyline
                positions={shotLine}
                color="blue"
                weight={3}
                opacity={0.7}
                dashArray="5, 5"
              />
            )}

            {/* Tee Box marker (hole-specific view) */}
            {teeBoxPos && (
              <Marker position={[teeBoxPos.lat, teeBoxPos.lon]} icon={yellowIcon}>
                <Popup>
                  <div className="shot-popup">
                    <strong>Hole {holeNumber} - {setup?.tee.charAt(0).toUpperCase() + setup?.tee.slice(1)} Tees</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Draw markers for each shot */}
            {shotPositions.map((pos, index) => (
              <CircleMarker key={index} center={[pos.lat, pos.lon]} radius={6} fill color="blue" weight={2}>
                <Popup>
                  <div className="shot-popup">
                    <strong>Hole {pos.hole}, Shot {pos.shot}</strong>
                    <p>Club: {pos.club}</p>
                    <p>Distance: {pos.distance} yards</p>
                    <p>Lie: {pos.lie}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Green marker */}
            {greenPos && (
              <Marker position={[greenPos.lat, greenPos.lon]} icon={greenIcon}>
                <Popup>
                  <div className="shot-popup">
                    <strong>Hole {holeNumber} - Green</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Mark the golf course center (full round view) */}
            {!holeNumber && (
              <Marker position={[RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude]}>
                <Popup>
                  <strong>Red Tail Golf Club</strong>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          <div className="shot-map-stats">
            <p><strong>Total Shots Mapped:</strong> {shotPositions.length}</p>
            {!holeNumber && (
              <p><strong>Holes with GPS:</strong> {new Set(shotPositions.map(s => s.hole)).size}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
