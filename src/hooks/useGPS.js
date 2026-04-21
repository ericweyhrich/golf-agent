import { useState } from 'react';

// Haversine formula to calculate distance between two points in yards
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 1760; // Earth's radius in yards (1 mile = 1760 yards)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance);
}

export function useGPS(onDistanceCalculated, onEndPositionCaptured, onStartPositionCaptured) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endPosition, setEndPosition] = useState(null);

  const startGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation not available on this device');
      setGpsLoading(false);
      return;
    }

    // Watch position and get the most accurate reading
    let bestAccuracy = Infinity;
    let bestPosition = null;
    let watchId = null;
    let accuracyThreshold = 30; // meters - good accuracy threshold
    let locked = false;

    const handleSuccess = (position) => {
      if (locked) return; // Already locked in a position

      const accuracy = position.coords.accuracy;
      console.log(`[GPS Start] Accuracy: ${accuracy.toFixed(2)}m, Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`);

      // If we get good accuracy, use this position
      if (accuracy < accuracyThreshold || accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;

        // If accuracy is excellent (< 15m), use it immediately
        if (accuracy < 15) {
          locked = true;
          if (watchId) navigator.geolocation.clearWatch(watchId);
          const startPos = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setStartPosition(startPos);
          setStartTime(Date.now());
          setGpsLoading(false);
          console.log('[GPS Start] Position locked (excellent accuracy)', startPos);

          if (onStartPositionCaptured) {
            onStartPositionCaptured(startPos);
          }
        }
      }
    };

    const handleError = (error) => {
      let message = 'GPS error';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'GPS permission denied. Enable location in settings.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = 'GPS position unavailable';
      } else if (error.code === error.TIMEOUT) {
        message = 'GPS timeout - try again';
      }
      console.error('[GPS Start] Error:', message);
      setGpsError(message);
      setGpsLoading(false);
    };

    // Watch for position with timeout
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    });

    // Auto-stop after 5 seconds even if accuracy isn't perfect
    setTimeout(() => {
      if (locked) return; // Already locked
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          const startPos = {
            lat: bestPosition.coords.latitude,
            lon: bestPosition.coords.longitude,
          };
          setStartPosition(startPos);
          setStartTime(Date.now());
          setGpsLoading(false);
          console.log('[GPS Start] Position locked (timeout)', startPos, `Accuracy: ${bestAccuracy.toFixed(2)}m`);

          if (onStartPositionCaptured) {
            onStartPositionCaptured(startPos);
          }
        } else {
          console.error('[GPS Start] No position found within timeout');
          setGpsError('Could not get GPS position. Try again in a few seconds.');
          setGpsLoading(false);
        }
      }
    }, 5000);
  };

  const endGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!startPosition) {
      setGpsError('Please tap Start GPS first');
      setGpsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setGpsError('Geolocation not available');
      setGpsLoading(false);
      return;
    }

    // Watch position and get the most accurate reading
    let bestAccuracy = Infinity;
    let bestPosition = null;
    let watchId = null;
    let accuracyThreshold = 30; // meters
    let locked = false;

    const handleSuccess = (position) => {
      if (locked) return; // Already locked

      const accuracy = position.coords.accuracy;
      console.log(`[GPS End] Accuracy: ${accuracy.toFixed(2)}m, Lat: ${position.coords.latitude}, Lon: ${position.coords.longitude}`);

      if (accuracy < accuracyThreshold || accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;

        // If accuracy is excellent (< 15m), use it immediately
        if (accuracy < 15) {
          locked = true;
          if (watchId) navigator.geolocation.clearWatch(watchId);

          const distance = calculateDistance(
            startPosition.lat,
            startPosition.lon,
            position.coords.latitude,
            position.coords.longitude
          );

          const endPos = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };

          setEndPosition(endPos);
          console.log(`[GPS End] Position locked (excellent accuracy), Distance: ${distance} yards`, endPos);

          if (onDistanceCalculated) {
            onDistanceCalculated(distance);
          }

          if (onEndPositionCaptured) {
            onEndPositionCaptured(endPos);
          }

          setStartPosition(null);
          setStartTime(null);
          setGpsLoading(false);
        }
      }
    };

    const handleError = (error) => {
      let message = 'GPS error';
      if (error.code === error.PERMISSION_DENIED) {
        message = 'GPS permission denied';
      }
      console.error('[GPS End] Error:', message);
      setGpsError(message);
      setGpsLoading(false);
    };

    // Watch for position
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    });

    // Auto-stop after 5 seconds even if accuracy isn't perfect
    setTimeout(() => {
      if (locked) return; // Already locked
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          const distance = calculateDistance(
            startPosition.lat,
            startPosition.lon,
            bestPosition.coords.latitude,
            bestPosition.coords.longitude
          );

          const endPos = {
            lat: bestPosition.coords.latitude,
            lon: bestPosition.coords.longitude,
          };

          setEndPosition(endPos);
          console.log(`[GPS End] Position locked (timeout), Distance: ${distance} yards, Accuracy: ${bestAccuracy.toFixed(2)}m`, endPos);

          if (onDistanceCalculated) {
            onDistanceCalculated(distance);
          }

          if (onEndPositionCaptured) {
            onEndPositionCaptured(endPos);
          }

          setStartPosition(null);
          setStartTime(null);
          setGpsLoading(false);
        } else {
          console.error('[GPS End] No position found within timeout');
          setGpsError('Could not get GPS position. Try again.');
          setGpsLoading(false);
        }
      }
    }, 5000);
  };

  const resetGPS = () => {
    setStartPosition(null);
    setStartTime(null);
    setGpsError(null);
  };

  return {
    startGPS,
    endGPS,
    resetGPS,
    gpsLoading,
    gpsError,
    hasStartPosition: !!startPosition,
    endPosition,
  };
}
