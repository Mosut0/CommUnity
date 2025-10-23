import React, { useMemo } from 'react';
import { Report, parseLocation, getDistanceFromLatLonInKm, metersToDegreeOffset } from './markerUtils';

interface MarkerClusterProps {
  reports: Report[];
  thresholdMeters?: number;
}

export interface Cluster {
  center: { latitude: number; longitude: number };
  members: Report[];
}

export const useMarkerClusters = (reports: Report[], thresholdMeters: number = 2): Cluster[] => {
  return useMemo(() => {
    const clusters: Cluster[] = [];

    const pushToCluster = (r: Report, coords: { latitude: number; longitude: number }) => {
      for (const c of clusters) {
        const d = getDistanceFromLatLonInKm(c.center.latitude, c.center.longitude, coords.latitude, coords.longitude) * 1000;
        if (d <= thresholdMeters) {
          c.members.push(r);
          const latSum = c.center.latitude * (c.members.length - 1) + coords.latitude;
          const lngSum = c.center.longitude * (c.members.length - 1) + coords.longitude;
          c.center.latitude = latSum / c.members.length;
          c.center.longitude = lngSum / c.members.length;
          return;
        }
      }
      clusters.push({ center: { latitude: coords.latitude, longitude: coords.longitude }, members: [r] });
    };

    reports.forEach((r) => {
      const c = parseLocation(r.location);
      if (!c) return;
      pushToCluster(r, c);
    });

    return clusters;
  }, [reports, thresholdMeters]);
};

export const getDisplayCoords = (
  report: Report, 
  coords: { latitude: number; longitude: number },
  clusters: Cluster[]
): { latitude: number; longitude: number } => {
  const cluster = clusters.find((cl) => cl.members.some((m) => m.reportid === report.reportid));
  if (!cluster) return coords;
  const count = cluster.members.length;
  if (count <= 1) return coords;

  const index = cluster.members.findIndex((m) => m.reportid === report.reportid);

  const baseRadius = 6;
  const radiusMeters = Math.min(baseRadius + count * 2, 40);

  const angle = (2 * Math.PI * index) / count;
  const { latDegree, lngDegree } = metersToDegreeOffset(cluster.center.latitude, radiusMeters);

  const adjustedLat = cluster.center.latitude + Math.cos(angle) * latDegree;
  const adjustedLng = cluster.center.longitude + Math.sin(angle) * lngDegree;

  return { latitude: adjustedLat, longitude: adjustedLng };
};
