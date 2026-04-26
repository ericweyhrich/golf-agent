import distance from '@turf/distance';
import nearestPoint from '@turf/nearest-point';
import { point, featureCollection } from '@turf/helpers';

// Convert meters to yards
const metersToYards = (meters) => Math.round(meters * 1.09361);

// Calculate distance between two GPS points (returns yards)
export const calculateDistance = (from, to) => {
  if (!from || !to) return 0;

  const dist = distance(
    [from.lon || from.lng, from.lat],
    [to.lon || to.lng, to.lat],
    { units: 'meters' }
  );

  return metersToYards(dist);
};

// Calculate distance to green from player position
export const calculateDistanceToGreen = (playerPos, greenPos) => {
  return calculateDistance(playerPos, greenPos);
};

// Find nearest feature (bunker, water, etc) and return distance
export const calculateDistanceToNearestFeature = (playerPos, features, featureType) => {
  if (!features || features.length === 0) return null;

  const playerPoint = point([playerPos.lng, playerPos.lat]);

  // Filter features by type
  const relevantFeatures = features.filter(
    (f) => f.properties?.type === featureType
  );

  if (relevantFeatures.length === 0) return null;

  const nearestFeature = nearestPoint(playerPoint, featureCollection(relevantFeatures));

  // nearestPoint returns the closest feature with its geometry
  // Calculate distance from player to that feature's closest point
  const dist = distance(
    playerPoint,
    nearestFeature,
    { units: 'meters' }
  );

  return metersToYards(dist);
};

// Calculate all distances for a tap location (used in modal)
export const calculateAllDistances = (playerPos, holeData, courseGeoJSON) => {
  const distances = {};

  // Distance to green
  if (holeData?.greenLat && holeData?.greenLon) {
    distances.toGreen = calculateDistanceToGreen(playerPos, {
      lat: holeData.greenLat,
      lng: holeData.greenLon,
    });
  }

  // Distance to nearest bunker
  if (courseGeoJSON?.features) {
    const bunkerDist = calculateDistanceToNearestFeature(
      playerPos,
      courseGeoJSON.features,
      'bunker'
    );
    if (bunkerDist) distances.nearestBunker = bunkerDist;

    // Distance to nearest water
    const waterDist = calculateDistanceToNearestFeature(
      playerPos,
      courseGeoJSON.features,
      'water'
    );
    if (waterDist) distances.nearestWater = waterDist;

    // Distance to nearest out of bounds
    const oobDist = calculateDistanceToNearestFeature(
      playerPos,
      courseGeoJSON.features,
      'oob'
    );
    if (oobDist) distances.nearestOB = oobDist;
  }

  return distances;
};

// Calculate distance traveled for a shot (from shot start to shot end)
export const calculateShotDistance = (shotStart, shotEnd) => {
  return calculateDistance(shotStart, shotEnd);
};

// Haversine formula for accurate GPS distance (fallback)
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return Math.round(distanceKm * 1093.61); // Convert to yards
};
