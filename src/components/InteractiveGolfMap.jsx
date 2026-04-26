import { useEffect, useRef, useState } from 'react';
import { calculateAllDistances, calculateDistance } from '../utils/distanceCalculations';
import { getHoleHazards } from '../data/hazardData';
import './InteractiveGolfMap.css';

const InteractiveGolfMap = ({
  holeNumber,
  holeData,
  playerGPS,
  shots,
  courseGeoJSON,
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
  const hazardPolygons = useRef([]);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurementPoints, setMeasurementPoints] = useState([]);
  const measurementMarkers = useRef([]);
  const measurementLine = useRef(null);
  const measurementLabel = useRef(null);

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
        zoom: 20,
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
        // Normal mode: calculate distances from tap location
        const distances = calculateAllDistances(
          { lat: clickedLat, lng: clickedLng },
          holeData,
          courseGeoJSON
        );

        onTapLocation(tapPos);
        onYardageCalculated(distances);
      }
    };

    const listener = map.current.addListener('click', handleMapClick);

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [measurementMode, measurementPoints, holeData, courseGeoJSON, onTapLocation, onYardageCalculated]);

  // Styling function for hazard features
  const getHazardStyle = (feature) => {
    const type = feature.properties.type;
    const styles = {
      hole_outline: { strokeColor: '#000', strokeWeight: 3, fillColor: 'transparent', fillOpacity: 0 },
      green: { strokeColor: '#2d5a2d', strokeWeight: 2, fillColor: '#90ee90', fillOpacity: 0.5 },
      fairway: { strokeColor: '#2d5a2d', strokeWeight: 1, fillColor: '#90ee90', fillOpacity: 0.4 },
      rough: { strokeColor: '#4a6b3d', strokeWeight: 1, fillColor: '#7cb342', fillOpacity: 0.3 },
      bunker: { strokeColor: '#c9a85d', strokeWeight: 2, fillColor: '#e8d7b8', fillOpacity: 0.6 },
      water: { strokeColor: '#1e88e5', strokeWeight: 2, fillColor: '#64b5f6', fillOpacity: 0.5 },
      oob: { strokeColor: '#d32f2f', strokeWeight: 2, fillColor: '#ffcdd2', fillOpacity: 0.3 },
    };
    return styles[type] || { strokeColor: '#999', strokeWeight: 1, fillOpacity: 0.2 };
  };

  // Helper: Convert GeoJSON coordinates to Google Maps LatLng
  const geoJsonToGoogleMaps = (coords) => {
    return coords.map(([lng, lat]) => new window.google.maps.LatLng(lat, lng));
  };

  // Render mapped features from courseGeoJSON (only for current hole)
  useEffect(() => {
    if (!map.current || !courseGeoJSON?.features) return;

    // Clear previous polygons
    hazardPolygons.current.forEach(polygon => {
      polygon.setMap(null);
    });
    hazardPolygons.current = [];

    // Filter features to only show current hole's boundary
    const currentHoleFeatures = courseGeoJSON.features.filter(
      feature => feature.properties.hole === holeNumber
    );

    // Render each feature
    currentHoleFeatures.forEach((feature) => {
      const style = getHazardStyle(feature);
      const coords = feature.geometry.coordinates[0];
      const paths = geoJsonToGoogleMaps(coords);

      const polygon = new window.google.maps.Polygon({
        map: map.current,
        paths,
        strokeColor: style.strokeColor,
        strokeWeight: style.strokeWeight,
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
      });

      // Add info window on click
      polygon.addListener('click', () => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<strong>${feature.properties.name}</strong><br>Type: ${feature.properties.type}`,
          position: paths[0],
        });
        infoWindow.open(map.current);
      });

      hazardPolygons.current.push(polygon);
    });
  }, [courseGeoJSON, holeNumber]);

  // Fit map to hole boundary and create masking overlay
  useEffect(() => {
    if (!map.current || !courseGeoJSON?.features) return;

    const currentHoleFeatures = courseGeoJSON.features.filter(
      feature => feature.properties.hole === holeNumber
    );

    if (currentHoleFeatures.length === 0) return;

    // Calculate bounds from hole boundary
    const bounds = new window.google.maps.LatLngBounds();

    currentHoleFeatures.forEach(feature => {
      const coords = feature.geometry.coordinates[0];
      coords.forEach(([lng, lat]) => {
        bounds.extend(new window.google.maps.LatLng(lat, lng));
      });
    });

    // Fit map to hole boundary with minimal padding and zoom in
    map.current.fitBounds(bounds, 5);
    // Zoom in more to fill the screen with just the hole outline
    setTimeout(() => {
      const currentZoom = map.current.getZoom();
      map.current.setZoom(currentZoom + 2);
    }, 100);
  }, [courseGeoJSON, holeNumber]);

  // Pan to hole location when hole data changes
  useEffect(() => {
    if (!map.current || !holeData?.greenLat) return;
    map.current.panTo(new window.google.maps.LatLng(holeData.greenLat, holeData.greenLon));
  }, [holeData?.hole]);

  // Update player position marker
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

    map.current.panTo(new window.google.maps.LatLng(playerGPS.lat, playerGPS.lng));
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

  // Render measurement markers and line
  useEffect(() => {
    if (!map.current) return;

    // Clear previous measurement markers
    measurementMarkers.current.forEach((marker) => {
      marker.setMap(null);
    });
    measurementMarkers.current = [];

    // Clear previous measurement line
    if (measurementLine.current) {
      measurementLine.current.setMap(null);
      measurementLine.current = null;
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

      // If we have two points, draw a line and show distance
      if (measurementPoints.length === 2) {
        const dist = calculateDistance(measurementPoints[0], measurementPoints[1]);

        measurementLine.current = new window.google.maps.Polyline({
          map: map.current,
          path: measurementPoints,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 3,
        });

        // Add distance label at midpoint
        const midLat = (measurementPoints[0].lat + measurementPoints[1].lat) / 2;
        const midLng = (measurementPoints[0].lng + measurementPoints[1].lng) / 2;

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-weight: bold; font-size: 14px; color: #333;">${dist} yards</div>`,
          position: { lat: midLat, lng: midLng },
        });
        infoWindow.open(map.current);
      }
    }
  }, [measurementPoints, measurementMode]);

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
