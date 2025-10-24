import {
  MARKER_COLORS,
  CATEGORY_DISPLAY_NAMES,
  DB_CATEGORY_NAMES,
  CATEGORY_ICONS,
  ICON_SIZES,
  MARKER_STYLES,
  MarkerCategory,
  CategoryDisplayName,
  DBCategoryName,
} from '../constants/Markers';

describe('Markers Constants', () => {
  describe('MARKER_COLORS', () => {
    it('should have all required marker colors', () => {
      expect(MARKER_COLORS.event).toBe('#7C3AED');
      expect(MARKER_COLORS.lost).toBe('#EAB308');
      expect(MARKER_COLORS.found).toBe('#22C55E');
      expect(MARKER_COLORS.safety).toBe('#EF4444');
      expect(MARKER_COLORS.default).toBe('#9E9E9E');
    });

    it('should have valid hex color values', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      Object.values(MARKER_COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex);
      });
    });
  });

  describe('CATEGORY_DISPLAY_NAMES', () => {
    it('should have all required display names', () => {
      expect(CATEGORY_DISPLAY_NAMES.All).toBe('All');
      expect(CATEGORY_DISPLAY_NAMES.Events).toBe('Events');
      expect(CATEGORY_DISPLAY_NAMES.Hazards).toBe('Hazards');
      expect(CATEGORY_DISPLAY_NAMES.Lost).toBe('Lost');
      expect(CATEGORY_DISPLAY_NAMES.Found).toBe('Found');
    });
  });

  describe('DB_CATEGORY_NAMES', () => {
    it('should have all required database category names', () => {
      expect(DB_CATEGORY_NAMES.event).toBe('event');
      expect(DB_CATEGORY_NAMES.safety).toBe('safety');
      expect(DB_CATEGORY_NAMES.lost).toBe('lost');
      expect(DB_CATEGORY_NAMES.found).toBe('found');
    });
  });

  describe('CATEGORY_ICONS', () => {
    it('should have all required category icons', () => {
      expect(CATEGORY_ICONS.event).toBe('calendar-outline');
      expect(CATEGORY_ICONS.safety).toBe('alert-circle-outline');
      expect(CATEGORY_ICONS.lost).toBe('help-circle-outline');
      expect(CATEGORY_ICONS.found).toBe('checkmark-circle-outline');
      expect(CATEGORY_ICONS.default).toBe('information-circle-outline');
    });
  });

  describe('ICON_SIZES', () => {
    it('should have all required icon sizes', () => {
      expect(ICON_SIZES.marker).toBe(20);
      expect(ICON_SIZES.markerSmall).toBe(18);
      expect(ICON_SIZES.detail).toBe(28);
      expect(ICON_SIZES.list).toBe(24);
    });

    it('should have positive icon sizes', () => {
      Object.values(ICON_SIZES).forEach(size => {
        expect(size).toBeGreaterThan(0);
      });
    });
  });

  describe('MARKER_STYLES', () => {
    it('should have all required marker style properties', () => {
      expect(MARKER_STYLES.wrapperSize).toBe(44);
      expect(MARKER_STYLES.wrapperRadius).toBe(22);
      expect(MARKER_STYLES.elevation).toBe(4);
      expect(MARKER_STYLES.baseRadius).toBe(6);
      expect(MARKER_STYLES.maxRadius).toBe(40);
      expect(MARKER_STYLES.thresholdMeters).toBe(2);
    });

    it('should have positive style values', () => {
      Object.values(MARKER_STYLES).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Type definitions', () => {
    it('should have correct MarkerCategory type', () => {
      const category: MarkerCategory = 'event';
      expect(category).toBe('event');
    });

    it('should have correct CategoryDisplayName type', () => {
      const displayName: CategoryDisplayName = 'All';
      expect(displayName).toBe('All');
    });

    it('should have correct DBCategoryName type', () => {
      const dbName: DBCategoryName = 'event';
      expect(dbName).toBe('event');
    });
  });
});
