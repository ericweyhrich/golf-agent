import { useEffect, useRef, useState } from 'react';
import { calculateDistance } from '../utils/distanceCalculations';
import './InteractiveGolfMap.css';

const InteractiveGolfMap = ({
  holeNumber,
  holeData,
  playerGPS,
  shots,
  selectedTee,
  onTapLocation,
  onYardageCalculated,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const playerMarker = useRef(null);
  const greenMarker = useRef(null);
  const shotMarkers = useRef([]);
  const shotPolyline = useRef(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const measurementMarkers = useRef([]);
  const measurementLine = useRef([]);
  const measurementLabels = useRef([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Prevent re-initialization

    const initMap = () => {
      if (!window.google?.maps) {
        setTimeout(initMap, 100);
        return;
      }

      const centerLat = holeData?.greenLat || playerGPS?.lat || 42.1955;
      const centerLng = holeData?.greenLon || playerGPS?.lng || -88.3601;

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 18,
        mapTypeId: window.google.maps.MapTypeId.SATELLITE,
        fullscreenControl: false,
        streetViewControl: false,
        gestureHandling: 'greedy',
      });
    };

    initMap();
  }, []); // Only initialize map once

  // Handle click listener - re-register when measurement mode changes
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e) => {
      const clickedLat = e.latLng.lat();
      const clickedLng = e.latLng.lng();
      const tapPos = { lat: clickedLat, lng: clickedLng };

      if (measurementMode) {
        // In measurement mode, collect points for distance measurement
        const newPoints = [...measurementPoints, tapPos];
        setMeasurementPoints(newPoints);

        if (newPoints.length === 2) {
          // Calculate distance between the two points
          const dist = calculateDistance(newPoints[0], newPoints[1]);
          // Distance will be displayed in the useEffect below
        }
      } else {
        // Normal mode: record shot location
        onTapLocation(tapPos);
      }
    };

    const listener = map.current.addListener('click', handleMapClick);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [measurementMode, measurementPoints, holeData, onTapLocation]);

  // Pan to hole location when hole data changes
  useEffect(() => {
    if (!map.current || !holeData?.greenLat) return;
    map.current.panTo(new window.google.maps.LatLng(holeData.greenLat, holeData.greenLon));
  }, [holeData?.hole]);

  // Update player position marker (don't pan to it - keep map on hole)
  useEffect(() => {
    if (!map.current || !playerGPS) return;

    if (playerMarker.current) {
      playerMarker.current.setPosition(new window.google.maps.LatLng(playerGPS.lat, playerGPS.lng));
    } else {
      playerMarker.current = new window.google.maps.Marker({
        map: map.current,
        position: { lat: playerGPS.lat, lng: playerGPS.lng },
        title: 'Player Position',
        icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      });
    }
  }, [playerGPS]);

  // Render shot trail
  useEffect(() => {
    if (!map.current || !shots || shots.length === 0) return;

    // Clear existing markers
    shotMarkers.current.forEach((marker) => {
      marker.setMap(null);
    });
    shotMarkers.current = [];

    if (shotPolyline.current) {
      shotPolyline.current.setMap(null);
    }

    // Create shot path
    const shotPath = shots.map((shot) => new window.google.maps.LatLng(shot.gpsLat, shot.gpsLon));

    // Draw polyline
    shotPolyline.current = new window.google.maps.Polyline({
      map: map.current,
      path: shotPath,
      strokeColor: '#0066FF',
      strokeWeight: 2,
      strokeOpacity: 0.7,
      geodesic: false,
    });

    // Create markers for each shot
    shots.forEach((shot, index) => {
      const marker = new window.google.maps.Marker({
        map: map.current,
        position: { lat: shot.gpsLat, lng: shot.gpsLon },
        title: `Shot ${index + 1}: ${shot.club}`,
      });

      marker.addListener('click', () => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div><strong>Shot ${index + 1}</strong><br>${shot.club}</div>`,
          position: marker.getPosition(),
        });
        infoWindow.open(map.current);
      });

      shotMarkers.current.push(marker);
    });
  }, [shots]);

  // Render green marker (if we have coordinates)
  useEffect(() => {
    if (!map.current || !holeData?.greenLat) return;

    if (greenMarker.current) {
      greenMarker.current.setMap(null);
    }

    greenMarker.current = new window.google.maps.Marker({
      map: map.current,
      position: { lat: holeData.greenLat, lng: holeData.greenLon },
      title: `Hole ${holeNumber} Green`,
      icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    });

    greenMarker.current.addListener('click', () => {
      const infoWindow = new window.google.maps.InfoWindow({
        content: `<div><strong>Hole ${holeNumber}</strong><br>Green</div>`,
        position: greenMarker.current.getPosition(),
      });
      infoWindow.open(map.current);
    });
  }, [holeData, holeNumber]);

  // Render measurement markers and lines
  useEffect(() => {
    if (!map.current) return;

    // Clear previous measurement markers
    measurementMarkers.current.forEach((marker) => {
      marker.setMap(null);
    });
    measurementMarkers.current = [];

    // Clear previous measurement lines and labels
    if (measurementLine.current) {
      measurementLine.current.forEach(line => line.setMap(null));
      measurementLine.current = [];
    }

    // Close all measurement labels (InfoWindows)
    if (measurementLabels.current) {
      measurementLabels.current.forEach(label => label.close());
      measurementLabels.current = [];
    }

    if (measurementPoints.length > 0) {
      // Add marker for each measurement point
      measurementPoints.forEach((point, idx) => {
        const marker = new window.google.maps.Marker({
          map: map.current,
          position: point,
          title: `Point ${idx + 1}`,
          icon: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + (idx === 0 ? 'red' : 'orange') + '.png',
        });
        measurementMarkers.current.push(marker);
      });

      // If we have two or more points, draw lines and show distances
      if (measurementPoints.length >= 2) {
        // Draw lines between consecutive points
        for (let i = 0; i < measurementPoints.length - 1; i++) {
          const currentPoint = measurementPoints[i];
          const nextPoint = measurementPoints[i + 1];
          const distance = calculateDistance(currentPoint, nextPoint);

          // Line between consecutive points
          const line = new window.google.maps.Polyline({
            map: map.current,
            path: [currentPoint, nextPoint],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 3,
          });

          // Label with distance
          const midLat = (currentPoint.lat + nextPoint.lat) / 2;
          const midLng = (currentPoint.lng + nextPoint.lng) / 2;
          const label = new window.google.maps.InfoWindow({
            content: `<div style="font-weight: bold; font-size: 14px; background: white; padding: 4px 8px; border-radius: 4px;">${distance} yds</div>`,
            position: { lat: midLat, lng: midLng },
            disableAutoPan: true,
          });
          label.open(map.current);
          measurementLine.current.push(line);
          measurementLabels.current.push(label);
        }

        // Draw line from last point to green
        if (holeData?.greenLat && holeData?.greenLon) {
          const lastPoint = measurementPoints[measurementPoints.length - 1];
          const distToGreen = calculateDistance(lastPoint, { lat: holeData.greenLat, lng: holeData.greenLon });

          const lineToGreen = new window.google.maps.Polyline({
            map: map.current,
            path: [lastPoint, { lat: holeData.greenLat, lng: holeData.greenLon }],
            geodesic: true,
            strokeColor: '#00AA00',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            strokeDasharray: [5, 5],
          });

          // Label for distance to green
          const midLatGreen = (lastPoint.lat + holeData.greenLat) / 2;
          const midLngGreen = (lastPoint.lng + holeData.greenLon) / 2;
          const labelGreen = new window.google.maps.InfoWindow({
            content: `<div style="font-weight: bold; font-size: 14px; background: white; padding: 4px 8px; border-radius: 4px;">${distToGreen} yds</div>`,
            position: { lat: midLatGreen, lng: midLngGreen },
            disableAutoPan: true,
          });
          labelGreen.open(map.current);
          measurementLine.current.push(lineToGreen);
          measurementLabels.current.push(labelGreen);
        }
      }
    }
  }, [measurementPoints, measurementMode, holeData]);

  // Reset measurement when changing holes
  useEffect(() => {
    setMeasurementPoints([]);
  }, [holeNumber]);

  return (
    <div className="interactive-golf-map">
      <div ref={mapContainer} className="map-container" />
      <div className="measurement-controls">
        <button
          className={`measurement-btn ${measurementMode ? 'active' : ''}`}
          onClick={() => {
            setMeasurementMode(!measurementMode);
            setMeasurementPoints([]);
          }}
        >
          📐 {measurementMode ? 'Measuring' : 'Measure'}
        </button>
        {measurementMode && measurementPoints.length > 0 && (
          <button
            className="measurement-reset-btn"
            onClick={() => setMeasurementPoints([])}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default InteractiveGolfMap;
