import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

export function ShotMap({ holes }) {
  // Collect all shot positions from the round
  const shotPositions = [];

  Object.entries(holes).forEach(([holeNum, holeData]) => {
    if (holeData.shots && Array.isArray(holeData.shots)) {
      holeData.shots.forEach((shot, shotIndex) => {
        if (shot.gpsLat && shot.gpsLon) {
          shotPositions.push({
            hole: parseInt(holeNum),
            shot: shotIndex + 1,
            lat: shot.gpsLat,
            lon: shot.gpsLon,
            distance: shot.endGPS || 0,
            lie: shot.lie || 'Unknown',
          });
        }
      });
    }
  });

  // Create a line connecting all shots
  const shotLine = shotPositions.map(pos => [pos.lat, pos.lon]);

  // Center map on Red Tail Golf Club
  const center = [RED_TAIL_COURSE.latitude, RED_TAIL_COURSE.longitude];

  return (
    <div className="shot-map-container">
      <h3>🗺️ Shot Map</h3>
      {shotPositions.length === 0 ? (
        <div className="no-shots-message">
          <p>No GPS data recorded yet. Complete a shot with GPS to see the map.</p>
        </div>
      ) : (
        <>
          <MapContainer center={center} zoom={16} className="shot-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />

            {/* Draw line connecting all shots */}
            {shotLine.length > 1 && (
              <Polyline
                positions={shotLine}
                color="blue"
                weight={3}
                opacity={0.7}
                dashArray="5, 5"
              />
            )}

            {/* Draw markers for each shot */}
            {shotPositions.map((pos, index) => (
              <Marker key={index} position={[pos.lat, pos.lon]}>
                <Popup>
                  <div className="shot-popup">
                    <strong>Hole {pos.hole}, Shot {pos.shot}</strong>
                    <p>Distance: {pos.distance} yards</p>
                    <p>Lie: {pos.lie}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Mark the golf course center */}
            <Marker position={center}>
              <Popup>
                <strong>Red Tail Golf Club</strong>
              </Popup>
            </Marker>
          </MapContainer>

          <div className="shot-map-stats">
            <p><strong>Total Shots Mapped:</strong> {shotPositions.length}</p>
            <p><strong>Holes with GPS:</strong> {new Set(shotPositions.map(s => s.hole)).size}</p>
          </div>
        </>
      )}
    </div>
  );
}
