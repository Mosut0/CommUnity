import {
  getDistanceKm,
  kmToMiles,
  milesToKm,
  formatDistance,
  getFormattedDistance,
} from '../utils/distance';

describe('Distance Utils', () => {
  describe('getDistanceKm', () => {
    it('should calculate distance between two points correctly', () => {
      // Test with known coordinates (Ottawa to Toronto)
      const lat1 = 45.4215;
      const lon1 = -75.6972;
      const lat2 = 43.6532;
      const lon2 = -79.3832;

      const distance = getDistanceKm(lat1, lon1, lat2, lon2);

      // Expected distance is approximately 350km
      expect(distance).toBeCloseTo(350, -1);
    });

    it('should return 0 for same coordinates', () => {
      const lat1 = 45.4215;
      const lon1 = -75.6972;

      const distance = getDistanceKm(lat1, lon1, lat1, lon1);

      expect(distance).toBe(0);
    });

    it('should handle edge cases', () => {
      // Test with extreme coordinates
      const distance1 = getDistanceKm(0, 0, 0, 180);
      const distance2 = getDistanceKm(0, 0, 0, -180);

      // Both should be approximately half the Earth's circumference
      expect(distance1).toBeCloseTo(20015, 0);
      expect(distance2).toBeCloseTo(20015, 0);
    });

     it('should handle negative coordinates', () => {
       const lat1 = -45.4215;
       const lon1 = -75.6972;
       const lat2 = 45.4215;
       const lon2 = 75.6972;

       const distance = getDistanceKm(lat1, lon1, lat2, lon2);

       expect(distance).toBeGreaterThan(0);
       expect(distance).toBeCloseTo(17794, -2); // Actual calculated distance
     });
  });

  describe('kmToMiles', () => {
    it('should convert kilometers to miles correctly', () => {
      expect(kmToMiles(1)).toBeCloseTo(0.621371, 5);
      expect(kmToMiles(10)).toBeCloseTo(6.21371, 4);
      expect(kmToMiles(100)).toBeCloseTo(62.1371, 3);
    });

    it('should handle zero', () => {
      expect(kmToMiles(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(kmToMiles(-10)).toBeCloseTo(-6.21371, 4);
    });
  });

  describe('milesToKm', () => {
    it('should convert miles to kilometers correctly', () => {
      expect(milesToKm(1)).toBeCloseTo(1.60934, 4);
      expect(milesToKm(10)).toBeCloseTo(16.0934, 3);
      expect(milesToKm(100)).toBeCloseTo(160.934, 2);
    });

    it('should handle zero', () => {
      expect(milesToKm(0)).toBe(0);
    });

    it('should handle negative values', () => {
      expect(milesToKm(-10)).toBeCloseTo(-16.0934, 3);
    });

    it('should be inverse of kmToMiles', () => {
      const km = 100;
      const miles = kmToMiles(km);
      const backToKm = milesToKm(miles);

      expect(backToKm).toBeCloseTo(km, 5);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in kilometers correctly', () => {
      expect(formatDistance(1.5, 'km')).toBe('1.5 km away');
      expect(formatDistance(5.7, 'km')).toBe('5.7 km away');
      expect(formatDistance(10.0, 'km')).toBe('10 km away');
      expect(formatDistance(15.3, 'km')).toBe('15 km away');
    });

    it('should format distance in miles correctly', () => {
      expect(formatDistance(1.5, 'miles')).toBe('0.9 mi away');
      expect(formatDistance(5.7, 'miles')).toBe('3.5 mi away');
      expect(formatDistance(10.0, 'miles')).toBe('6.2 mi away');
      expect(formatDistance(15.3, 'miles')).toBe('9.5 mi away');
    });

    it('should handle zero distance', () => {
      expect(formatDistance(0, 'km')).toBe('0.0 km away');
      expect(formatDistance(0, 'miles')).toBe('0.0 mi away');
    });

    it('should handle very small distances', () => {
      expect(formatDistance(0.1, 'km')).toBe('0.1 km away');
      expect(formatDistance(0.1, 'miles')).toBe('0.1 mi away');
    });

    it('should handle very large distances', () => {
      expect(formatDistance(1000, 'km')).toBe('1000 km away');
      expect(formatDistance(1000, 'miles')).toBe('621 mi away');
    });
  });

  describe('getFormattedDistance', () => {
    it('should calculate and format distance in kilometers', () => {
      const lat1 = 45.4215;
      const lon1 = -75.6972;
      const lat2 = 43.6532;
      const lon2 = -79.3832;

      const result = getFormattedDistance(lat1, lon1, lat2, lon2, 'km');

      expect(result).toMatch(/^\d+(\.\d+)? km away$/);
    });

    it('should calculate and format distance in miles', () => {
      const lat1 = 45.4215;
      const lon1 = -75.6972;
      const lat2 = 43.6532;
      const lon2 = -79.3832;

      const result = getFormattedDistance(lat1, lon1, lat2, lon2, 'miles');

      expect(result).toMatch(/^\d+(\.\d+)? mi away$/);
    });

    it('should return 0 distance for same coordinates', () => {
      const lat1 = 45.4215;
      const lon1 = -75.6972;

      const resultKm = getFormattedDistance(lat1, lon1, lat1, lon1, 'km');
      const resultMiles = getFormattedDistance(lat1, lon1, lat1, lon1, 'miles');

      expect(resultKm).toBe('0.0 km away');
      expect(resultMiles).toBe('0.0 mi away');
    });

    it('should handle edge cases', () => {
      // Test with coordinates at opposite sides of the world
      const result = getFormattedDistance(0, 0, 0, 180, 'km');

      expect(result).toMatch(/^\d+ km away$/);
      expect(parseFloat(result)).toBeGreaterThan(10000);
    });

    it('should be consistent with individual functions', () => {
      const lat1 = 45.4215;
      const lon1 = -75.6972;
      const lat2 = 43.6532;
      const lon2 = -79.3832;

      const distanceKm = getDistanceKm(lat1, lon1, lat2, lon2);
      const formattedKm = formatDistance(distanceKm, 'km');
      const resultKm = getFormattedDistance(lat1, lon1, lat2, lon2, 'km');

      expect(resultKm).toBe(formattedKm);

      const distanceMiles = kmToMiles(distanceKm);
      const formattedMiles = formatDistance(distanceKm, 'miles');
      const resultMiles = getFormattedDistance(lat1, lon1, lat2, lon2, 'miles');

      expect(resultMiles).toBe(formattedMiles);
    });
  });
});
