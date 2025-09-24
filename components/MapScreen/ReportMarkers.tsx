import React from 'react';
import { Report } from './markerUtils';
import { ReportMarker } from './ReportMarker';
import { Cluster, getDisplayCoords } from './MarkerCluster';

interface ReportMarkersProps {
  reports: Report[];
  selectedReport: Report | null;
  onReportPress: (report: Report) => void;
  clusters: Cluster[];
  markerReadyRef: React.MutableRefObject<Map<number, boolean>>;
  markerRefs: React.MutableRefObject<{ [key: number]: any | null }>;
  location: { coords: { latitude: number; longitude: number } };
  distanceRadius: number;
  filter: 'all' | 'hazard' | 'event' | 'lost' | 'found';
}

export const ReportMarkers: React.FC<ReportMarkersProps> = ({
  reports,
  selectedReport,
  onReportPress,
  clusters,
  markerReadyRef,
  markerRefs,
  location,
  distanceRadius,
  filter,
}) => {
  const { parseLocation, getDistanceFromLatLonInKm } = require('./markerUtils');

  return (
    <>
      {reports.map((report) => {
        const matchesFilter = (() => {
          if (filter === 'all') return true;
          if (filter === 'hazard') return report.category === 'safety';
          if (filter === 'event') return report.category === 'event';
          if (filter === 'lost') return report.category === 'lost';
          if (filter === 'found') return report.category === 'found';
          return true;
        })();

        if (!matchesFilter) return null;

        const coords = parseLocation(report.location);
        if (!coords) return null;

        const distance = getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          coords.latitude,
          coords.longitude
        );

        if (distance > distanceRadius) return null;

        const tracksViewChanges = !markerReadyRef.current.get(report.reportid);
        const displayCoords = getDisplayCoords(report, coords, clusters);

        return (
          <ReportMarker
            key={report.reportid}
            report={report}
            selectedReport={selectedReport}
            onPress={onReportPress}
            tracksViewChanges={tracksViewChanges}
            displayCoords={displayCoords}
            markerRef={(ref) => { markerRefs.current[report.reportid] = ref; }}
            onLayout={() => {
              markerReadyRef.current.set(report.reportid, true);
            }}
          />
        );
      })}
    </>
  );
};
