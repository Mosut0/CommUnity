/**
 * Distance conversion utilities
 */

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

export function formatDistance(
  distanceKm: number,
  unit: 'km' | 'miles'
): string {
  if (unit === 'miles') {
    const miles = kmToMiles(distanceKm);
    const value = miles < 10 ? miles.toFixed(1) : Math.round(miles).toString();
    return `${value} mi away`;
  } else {
    const value =
      distanceKm < 10
        ? distanceKm.toFixed(1)
        : Math.round(distanceKm).toString();
    return `${value} km away`;
  }
}

/**
 * Get formatted distance string between two coordinates
 */
export function getFormattedDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'km' | 'miles'
): string {
  const distanceKm = getDistanceKm(lat1, lon1, lat2, lon2);
  return formatDistance(distanceKm, unit);
}
