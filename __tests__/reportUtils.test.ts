import {
  parseLocation,
  coordinatesToLocationString,
  getMarkerColor,
  getCategoryIcon,
  getReportTitle,
  getReportDescription,
  matchesFilter,
  getDistanceKm,
  formatDistance,
  filterReportsByDistance,
  clusterReports,
} from '@/utils/reportUtils';
import { Report } from '@/types/report';

describe('reportUtils', () => {
  describe('parseLocation', () => {
    it('should parse valid location string', () => {
      const result = parseLocation('(40.7128,-74.0060)');
      expect(result).toEqual({ latitude: 40.7128, longitude: -74.006 });
    });

    it('should handle swapped coordinates', () => {
      const result = parseLocation('(-74.0060,40.7128)');
      expect(result).toEqual({ latitude: -74.006, longitude: 40.7128 });
    });

    it('should return null for invalid format', () => {
      const result = parseLocation('invalid');
      expect(result).toBeNull();
    });

    it('should return null for out of bounds coordinates', () => {
      const result = parseLocation('(200,300)');
      expect(result).toBeNull();
    });

    it('should return null for NaN values', () => {
      const result = parseLocation('(abc,def)');
      expect(result).toBeNull();
    });
  });

  describe('coordinatesToLocationString', () => {
    it('should convert coordinates to location string', () => {
      const result = coordinatesToLocationString(40.7128, -74.006);
      expect(result).toBe('(40.7128,-74.006)');
    });
  });

  describe('getMarkerColor', () => {
    it('should return correct color for event', () => {
      const color = getMarkerColor('event');
      expect(color).toBe('#7C3AED');
    });

    it('should return correct color for safety', () => {
      const color = getMarkerColor('safety');
      expect(color).toBe('#EF4444');
    });

    it('should return default color for unknown category', () => {
      const color = getMarkerColor('unknown' as any);
      expect(color).toBe('#9E9E9E');
    });
  });

  describe('getCategoryIcon', () => {
    it('should return correct icon for event', () => {
      const icon = getCategoryIcon('event');
      expect(icon).toBe('calendar-outline');
    });

    it('should return correct icon for safety', () => {
      const icon = getCategoryIcon('safety');
      expect(icon).toBe('alert-circle-outline');
    });

    it('should return default icon for unknown category', () => {
      const icon = getCategoryIcon('unknown' as any);
      expect(icon).toBe('information-circle-outline');
    });
  });

  describe('getReportTitle', () => {
    it('should return event title', () => {
      const report = {
        category: 'event',
        eventtype: 'Community Meeting',
      } as Report;

      const title = getReportTitle(report);
      expect(title).toBe('Event: Community Meeting');
    });

    it('should return hazard title', () => {
      const report = {
        category: 'safety',
        hazardtype: 'Pothole',
      } as Report;

      const title = getReportTitle(report);
      expect(title).toBe('Hazard: Pothole');
    });

    it('should return lost item title', () => {
      const report = {
        category: 'lost',
        itemtype: 'Wallet',
      } as Report;

      const title = getReportTitle(report);
      expect(title).toBe('Lost: Wallet');
    });

    it('should return default title for unknown category', () => {
      const report = {
        reportid: 1,
        userid: 'user1',
        category: 'event' as any,
        description: 'Test',
        location: '(40.7128,-74.0060)',
        createdat: '2024-01-01',
      } as Report;

      // Override category to test unknown case
      (report as any).category = 'unknown';

      const title = getReportTitle(report);
      expect(title).toBe('Report');
    });
  });

  describe('getReportDescription', () => {
    it('should return description with event time', () => {
      const report = {
        category: 'event',
        description: 'Test event',
        time: '2024-01-01T14:00:00Z',
      } as Report;

      const desc = getReportDescription(report);
      expect(desc).toContain('Test event');
      expect(desc).toContain('Event Time:');
    });

    it('should return description with contact info for lost item', () => {
      const report = {
        category: 'lost',
        description: 'Lost wallet',
        contactinfo: 'test@example.com',
      } as Report;

      const desc = getReportDescription(report);
      expect(desc).toContain('Lost wallet');
      expect(desc).toContain('Contact: test@example.com');
    });

    it('should return plain description for reports without extras', () => {
      const report = {
        category: 'safety',
        description: 'Pothole on road',
      } as Report;

      const desc = getReportDescription(report);
      expect(desc).toBe('Pothole on road');
    });
  });

  describe('matchesFilter', () => {
    it('should match all filter', () => {
      const report = { category: 'event' } as Report;
      expect(matchesFilter(report, 'all')).toBe(true);
    });

    it('should match event filter', () => {
      const report = { category: 'event' } as Report;
      expect(matchesFilter(report, 'event')).toBe(true);
    });

    it('should match hazard filter for safety category', () => {
      const report = { category: 'safety' } as Report;
      expect(matchesFilter(report, 'hazard')).toBe(true);
    });

    it('should not match wrong filter', () => {
      const report = { category: 'event' } as Report;
      expect(matchesFilter(report, 'lost')).toBe(false);
    });
  });

  describe('getDistanceKm', () => {
    it('should calculate distance between two points', () => {
      // Distance between New York and Los Angeles (approx 3944 km)
      const distance = getDistanceKm(40.7128, -74.006, 34.0522, -118.2437);
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = getDistanceKm(40.7128, -74.006, 40.7128, -74.006);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format kilometers correctly', () => {
      expect(formatDistance(1.5, 'km')).toBe('1.5 km');
      expect(formatDistance(0.5, 'km')).toBe('500 m');
    });

    it('should format miles correctly', () => {
      expect(formatDistance(1.60934, 'miles')).toBe('5280 ft');
      expect(formatDistance(0.5, 'miles')).toBe('1640 ft');
    });
  });

  describe('filterReportsByDistance', () => {
    it('should filter reports within distance', () => {
      const reports: Report[] = [
        {
          reportid: 1,
          location: '(40.7128,-74.0060)',
          category: 'event',
          description: 'Near',
        } as Report,
        {
          reportid: 2,
          location: '(34.0522,-118.2437)',
          category: 'event',
          description: 'Far',
        } as Report,
      ];

      const userLocation = { latitude: 40.7128, longitude: -74.006 };
      const filtered = filterReportsByDistance(reports, userLocation, 100);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].reportid).toBe(1);
    });
  });

  describe('clusterReports', () => {
    it('should cluster nearby reports', () => {
      const reports: Report[] = [
        {
          reportid: 1,
          location: '(40.7128,-74.0060)',
          category: 'event',
        } as Report,
        {
          reportid: 2,
          location: '(40.7128,-74.0060)',
          category: 'safety',
        } as Report,
        {
          reportid: 3,
          location: '(34.0522,-118.2437)',
          category: 'lost',
        } as Report,
      ];

      const clusters = clusterReports(reports, 5);

      expect(clusters).toHaveLength(2);
      expect(clusters[0].members).toHaveLength(2);
      expect(clusters[1].members).toHaveLength(1);
    });

    it('should handle reports with invalid locations', () => {
      const reports: Report[] = [
        {
          reportid: 1,
          location: 'invalid',
          category: 'event',
        } as Report,
      ];

      const clusters = clusterReports(reports, 5);
      expect(clusters).toHaveLength(0);
    });
  });
});
