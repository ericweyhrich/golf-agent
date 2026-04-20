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

export function useGPS(onDistanceCalculated) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [startPosition, setStartPosition] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const startGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation not available on this device');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setStartTime(Date.now());
        setGpsLoading(false);
      },
      (error) => {
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          startPosition.lat,
          startPosition.lon,
          position.coords.latitude,
          position.coords.longitude
        );

        if (onDistanceCalculated) {
          onDistanceCalculated(distance);
        }

        setStartPosition(null);
        setStartTime(null);
        setGpsLoading(false);
      },
      (error) => {
        let message = 'GPS error';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'GPS permission denied';
        }
        setGpsError(message);
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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
  };
}
