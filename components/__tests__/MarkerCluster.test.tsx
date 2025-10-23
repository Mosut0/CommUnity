import { renderHook } from '@testing-library/react';
import { useMarkerClusters, getDisplayCoords, Cluster } from '../MapScreen/MarkerCluster';
import { Report } from '../MapScreen/markerUtils';

describe('useMarkerClusters', () => {
  const reports: Report[] = [
    { reportid: 1, category: 'event', description: '', location: '(0,0)', createdAt: '' },
    { reportid: 2, category: 'event', description: '', location: '(0.00001,0.00001)', createdAt: '' },
    { reportid: 3, category: 'event', description: '', location: '(1,1)', createdAt: '' },
  ];

  it('clusters nearby reports', () => {
    const { result } = renderHook(() => useMarkerClusters(reports, 2000));
    expect(result.current.length).toBeLessThan(reports.length);
  });
});

describe('getDisplayCoords', () => {
  it('returns coords for single-member cluster', () => {
    const report = { reportid: 1, category: 'event', description: '', location: '(0,0)', createdAt: '' };
    const clusters: Cluster[] = [
      { center: { latitude: 0, longitude: 0 }, members: [report] },
    ];
    const coords = getDisplayCoords(report, { latitude: 0, longitude: 0 }, clusters);
    expect(coords).toEqual({ latitude: 0, longitude: 0 });
  });
});
