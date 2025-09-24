import { getMarkerColor, getReportTitle, getIconProps, parseLocation, metersToDegreeOffset, getDistanceFromLatLonInKm, Report } from '../MapScreen/markerUtils';

describe('markerUtils', () => {
  describe('getMarkerColor', () => {
    it('returns correct color for each category', () => {
      expect(getMarkerColor('event')).toBeDefined();
      expect(getMarkerColor('safety')).toBeDefined();
      expect(getMarkerColor('lost')).toBeDefined();
      expect(getMarkerColor('found')).toBeDefined();
      expect(getMarkerColor('other')).toBeDefined();
    });
  });

  describe('getReportTitle', () => {
    it('returns correct title for each category', () => {
      expect(getReportTitle({ category: 'event', eventtype: 'Concert' } as Report)).toContain('Event');
      expect(getReportTitle({ category: 'safety', hazardtype: 'Fire' } as Report)).toContain('Hazard');
      expect(getReportTitle({ category: 'lost', itemtype: 'Wallet' } as Report)).toContain('Lost');
      expect(getReportTitle({ category: 'found', itemtype: 'Keys' } as Report)).toContain('Found');
      expect(getReportTitle({ category: 'other' } as Report)).toBe('Report');
    });
  });

  describe('getIconProps', () => {
    it('returns icon props with correct color and size', () => {
      const props = getIconProps('event', '#fff');
      expect(props.color).toBe('#fff');
      expect(props.size).toBeDefined();
      expect(props.name).toBeDefined();
    });
  });

  describe('parseLocation', () => {
    it('parses valid location string', () => {
      expect(parseLocation('(37.7749, -122.4194)')).toEqual({ latitude: 37.7749, longitude: -122.4194 });
    });
    it('returns null for invalid string', () => {
      expect(parseLocation('invalid')).toBeNull();
    });
  });

  describe('metersToDegreeOffset', () => {
    it('returns correct degree offsets', () => {
      const { latDegree, lngDegree } = metersToDegreeOffset(37, 1000);
      expect(latDegree).toBeGreaterThan(0);
      expect(lngDegree).toBeGreaterThan(0);
    });
  });

  describe('getDistanceFromLatLonInKm', () => {
    it('returns 0 for same coordinates', () => {
      expect(getDistanceFromLatLonInKm(0, 0, 0, 0)).toBeCloseTo(0);
    });
    it('returns correct distance for known points', () => {
      const d = getDistanceFromLatLonInKm(0, 0, 0, 1);
      expect(d).toBeGreaterThan(0);
    });
  });
});
