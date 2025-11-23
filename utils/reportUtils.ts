// Report utility functions for parsing, formatting, and manipulating reports
import { Report, ReportCategory } from '@/types/report';
import { MARKER_COLORS, CATEGORY_ICONS, ICON_SIZES } from '@/constants/Markers';

/**
 * Parse location string in format "(lat,lng)" to coordinates
 */
export function parseLocation(
  locationStr: string
): { latitude: number; longitude: number } | null {
  try {
    // Expected format: "(lat,lng)"
    const coordsStr = locationStr.substring(1, locationStr.length - 1).trim();
    const parts = coordsStr.split(',').map(s => parseFloat(s.trim()));
    if (parts.length < 2) return null;
    let [lat, lng] = parts;

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    // Basic validation: lat must be between -90 and 90, lng between -180 and 180.
    // If values look swapped (e.g., lat outside [-90,90]), swap them.
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      const tmp = lat;
      lat = lng;
      lng = tmp;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn(
        'parseLocation: coordinates out of bounds for',
        locationStr,
        '->',
        { lat, lng }
      );
      return null;
    }

    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('Error parsing location:', error);
    return null;
  }
}

/**
 * Convert coordinates to location string format
 */
export function coordinatesToLocationString(
  latitude: number,
  longitude: number
): string {
  return `(${latitude},${longitude})`;
}

/**
 * Get marker color for a report category
 */
export function getMarkerColor(category: ReportCategory): string {
  if (category in MARKER_COLORS) {
    return MARKER_COLORS[category as keyof typeof MARKER_COLORS];
  }
  return MARKER_COLORS.default;
}

/**
 * Get icon name for a report category
 */
export function getCategoryIcon(category: ReportCategory): string {
  if (category in CATEGORY_ICONS) {
    return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
  }
  return CATEGORY_ICONS.default;
}

/**
 * Get icon size for different contexts
 */
export function getIconSize(context: keyof typeof ICON_SIZES): number {
  return ICON_SIZES[context];
}

/**
 * Generate display title for a report based on its category and type
 */
export function getReportTitle(report: Report): string {
  switch (report.category) {
    case 'event':
      return `Event: ${report.eventtype || 'Unknown Event'}`;
    case 'hazard':
      return `Hazard: ${report.hazardtype || 'Unknown Hazard'}`;
    case 'lost':
      return `Lost: ${report.itemtype || 'Unknown Item'}`;
    case 'found':
      return `Found: ${report.itemtype || 'Unknown Item'}`;
    case 'infrastructure':
      return 'Infrastructure Issue';
    case 'wildlife':
      return 'Wildlife Sighting';
    case 'health':
      return 'Health Concern';
    case 'other':
      return 'Other Report';
    default:
      return 'Report';
  }
}

/**
 * Generate display description for a report
 */
export function getReportDescription(report: Report): string {
  let description = report.description;

  // Add category-specific information
  if (report.category === 'event' && report.time) {
    const eventTime = new Date(report.time).toLocaleString();
    description += `\n\nEvent Time: ${eventTime}`;
  }

  if (
    (report.category === 'lost' || report.category === 'found') &&
    report.contactinfo
  ) {
    description += `\n\nContact: ${report.contactinfo}`;
  }

  return description;
}

/**
 * Check if a report matches the given filter
 */
export function matchesFilter(
  report: Report,
  filter: 'all' | 'hazard' | 'event' | 'lost' | 'found'
): boolean {
  if (filter === 'all') return true;
  if (filter === 'hazard') return report.category === 'hazard';
  if (filter === 'event') return report.category === 'event';
  if (filter === 'lost') return report.category === 'lost';
  if (filter === 'found') return report.category === 'found';
  return true;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(
  distanceKm: number,
  unit: 'km' | 'miles' = 'km'
): string {
  if (unit === 'miles') {
    const miles = distanceKm * 0.621371;
    return miles < 1
      ? `${Math.round(miles * 5280)} ft`
      : `${miles.toFixed(1)} mi`;
  }
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1)} km`;
}

/**
 * Filter reports by distance from a location
 */
export function filterReportsByDistance(
  reports: Report[],
  userLocation: { latitude: number; longitude: number },
  maxDistanceKm: number
): Report[] {
  return reports.filter(report => {
    const coords = parseLocation(report.location);
    if (!coords) return false;

    const distance = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      coords.latitude,
      coords.longitude
    );

    return distance <= maxDistanceKm;
  });
}

/**
 * Sort reports by distance from a location
 */
export function sortReportsByDistance(
  reports: Report[],
  userLocation: { latitude: number; longitude: number }
): Report[] {
  return reports.sort((a, b) => {
    const coordsA = parseLocation(a.location);
    const coordsB = parseLocation(b.location);

    if (!coordsA || !coordsB) return 0;

    const distanceA = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      coordsA.latitude,
      coordsA.longitude
    );

    const distanceB = getDistanceKm(
      userLocation.latitude,
      userLocation.longitude,
      coordsB.latitude,
      coordsB.longitude
    );

    return distanceA - distanceB;
  });
}

/**
 * Cluster reports that are within a proximity threshold
 */
export function clusterReports(
  reports: Report[],
  thresholdMeters: number = 2
): Array<{
  center: { latitude: number; longitude: number };
  members: Report[];
}> {
  const clusters: Array<{
    center: { latitude: number; longitude: number };
    members: Report[];
  }> = [];

  const pushToCluster = (
    report: Report,
    coords: { latitude: number; longitude: number }
  ) => {
    for (const cluster of clusters) {
      const distance =
        getDistanceKm(
          cluster.center.latitude,
          cluster.center.longitude,
          coords.latitude,
          coords.longitude
        ) * 1000; // Convert to meters

      if (distance <= thresholdMeters) {
        cluster.members.push(report);
        // Update cluster center (simple average)
        const latSum =
          cluster.center.latitude * (cluster.members.length - 1) +
          coords.latitude;
        const lngSum =
          cluster.center.longitude * (cluster.members.length - 1) +
          coords.longitude;
        cluster.center.latitude = latSum / cluster.members.length;
        cluster.center.longitude = lngSum / cluster.members.length;
        return;
      }
    }
    clusters.push({
      center: { latitude: coords.latitude, longitude: coords.longitude },
      members: [report],
    });
  };

  reports.forEach(report => {
    const coords = parseLocation(report.location);
    if (coords) {
      pushToCluster(report, coords);
    }
  });

  return clusters;
}

/**
 * Get display coordinates for a report to avoid marker stacking
 */
export function getDisplayCoords(
  report: Report,
  coords: { latitude: number; longitude: number },
  clusters: Array<{
    center: { latitude: number; longitude: number };
    members: Report[];
  }>
): { latitude: number; longitude: number } {
  // Find the cluster containing this report
  const cluster = clusters.find(cl =>
    cl.members.some(m => m.reportid === report.reportid)
  );

  if (!cluster || cluster.members.length <= 1) {
    return coords;
  }

  const index = cluster.members.findIndex(m => m.reportid === report.reportid);
  const count = cluster.members.length;

  // Increase radius with cluster size to reduce overlap for larger groups
  const baseRadius = 6;
  const radiusMeters = Math.min(baseRadius + count * 2, 40); // cap at 40m

  const angle = (2 * Math.PI * index) / count;
  const { latDegree, lngDegree } = metersToDegreeOffset(
    cluster.center.latitude,
    radiusMeters
  );

  const adjustedLat = cluster.center.latitude + Math.cos(angle) * latDegree;
  const adjustedLng = cluster.center.longitude + Math.sin(angle) * lngDegree;

  return { latitude: adjustedLat, longitude: adjustedLng };
}

/**
 * Convert meters to degree offset for a given latitude
 */
function metersToDegreeOffset(lat: number, meters: number) {
  const latDegree = meters / 111320; // approx meters per degree latitude
  const lngDegree = meters / (111320 * Math.cos((lat * Math.PI) / 180));
  return { latDegree, lngDegree };
}
