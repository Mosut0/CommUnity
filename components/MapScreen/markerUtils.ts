import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { MARKER_COLORS, CATEGORY_ICONS, ICON_SIZES } from '@/constants/Markers';

export interface Report {
  reportid: number;
  category: string;
  description: string;
  location: string;
  createdAt: string;
  imageurl?: string;
  eventtype?: string;
  hazardtype?: string;
  itemtype?: string;
  contactinfo?: string;
  time?: string;
}

export const getMarkerColor = (category: string): string => {
  switch (category) {
    case "event":
      return MARKER_COLORS.event;
    case "safety":
      return MARKER_COLORS.safety;
    case "lost":
      return MARKER_COLORS.lost;
    case "found":
      return MARKER_COLORS.found;
    default:
      return MARKER_COLORS.default;
  }
};

export const getReportTitle = (report: Report): string => {
  switch (report.category) {
    case "event":
      return `Event: ${report.eventtype || ""}`;
    case "safety":
      return `Hazard: ${report.hazardtype || ""}`;
    case "lost":
      return `Lost: ${report.itemtype || ""}`;
    case "found":
      return `Found: ${report.itemtype || ""}`;
    default:
      return "Report";
  }
};

export const getIconProps = (category: string, color: string, size: number = ICON_SIZES.marker) => {
  const iconName = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || CATEGORY_ICONS.default;
  const iconSize = category === 'lost' || category === 'found' ? size - 2 : size;
  
  return {
    name: iconName as any,
    size: iconSize,
    color: color
  };
};

export const parseLocation = (
  locationStr: string
): { latitude: number; longitude: number } | null => {
  try {
    const coordsStr = locationStr.substring(1, locationStr.length - 1).trim();
    const parts = coordsStr.split(",").map(s => parseFloat(s.trim()));
    if (parts.length < 2) return null;
    let [lat, lng] = parts;

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      const tmp = lat;
      lat = lng;
      lng = tmp;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn('parseLocation: coordinates out of bounds for', locationStr, '->', { lat, lng });
      return null;
    }

    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error("Error parsing location:", error);
    return null;
  }
};

export const metersToDegreeOffset = (lat: number, meters: number) => {
  const latDegree = meters / 111320;
  const lngDegree = meters / (111320 * Math.cos((lat * Math.PI) / 180));
  return { latDegree, lngDegree };
};

export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const deg2rad = (deg: number): number => deg * (Math.PI / 180);
  
  let R = 6371;
  let dLat = deg2rad(lat2 - lat1);
  let dLon = deg2rad(lon2 - lon1);
  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  return d;
};
