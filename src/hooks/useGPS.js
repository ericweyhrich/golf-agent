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

export function useGPS(onDistanceCalculated, onEndPositionCaptured) {
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
    let accuracyThreshold = 20; // meters - good accuracy threshold

    const handleSuccess = (position) => {
      const accuracy = position.coords.accuracy;

      // If we get good accuracy, use this position
      if (accuracy < accuracyThreshold || accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;

        // If accuracy is excellent (< 10m), use it immediately
        if (accuracy < 10) {
          if (watchId) navigator.geolocation.clearWatch(watchId);
          setStartPosition({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setStartTime(Date.now());
          setGpsLoading(false);
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
      setGpsError(message);
      setGpsLoading(false);
    };

    // Watch for position with timeout
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    // Auto-stop after 3 seconds even if accuracy isn't perfect
    setTimeout(() => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          setStartPosition({
            lat: bestPosition.coords.latitude,
            lon: bestPosition.coords.longitude,
          });
          setStartTime(Date.now());
          setGpsLoading(false);
        }
      }
    }, 3000);
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
    let accuracyThreshold = 20; // meters

    const handleSuccess = (position) => {
      const accuracy = position.coords.accuracy;

      if (accuracy < accuracyThreshold || accuracy < bestAccuracy) {
        bestAccuracy = accuracy;
        bestPosition = position;

        // If accuracy is excellent (< 10m), use it immediately
        if (accuracy < 10) {
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
      setGpsError(message);
      setGpsLoading(false);
    };

    // Watch for position
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    // Auto-stop after 3 seconds even if accuracy isn't perfect
    setTimeout(() => {
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
    }, 3000);
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
