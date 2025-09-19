// Marker and Report Category Colors
// These colors are used consistently across the app for visual consistency

export const MARKER_COLORS = {
  event: '#7C3AED',  // purple-600
  lost:  '#EAB308',  // yellow-500
  found: '#22C55E',  // green-500
  safety: '#EF4444', // red-500
  default: '#9E9E9E', // gray-500
} as const;

// Category display names mapping
export const CATEGORY_DISPLAY_NAMES = {
  All: "All",
  Events: "event",
  Hazards: "safety", 
  Lost: "lost",
  Found: "found",
} as const;

// Database category names (for filtering)
export const DB_CATEGORY_NAMES = {
  event: "event",
  safety: "safety",
  lost: "lost", 
  found: "found",
} as const;

// Icon names for each category (using Ionicons)
export const CATEGORY_ICONS = {
  event: "calendar-outline",
  safety: "alert-circle-outline", 
  lost: "help-circle-outline",
  found: "checkmark-circle-outline",
  default: "information-circle-outline",
} as const;

// Icon sizes for different contexts
export const ICON_SIZES = {
  marker: 20,
  markerSmall: 18,
  detail: 28,
  list: 24,
} as const;

// Marker styling constants
export const MARKER_STYLES = {
  wrapperSize: 44,
  wrapperRadius: 22,
  elevation: 4,
  baseRadius: 6,
  maxRadius: 40,
  thresholdMeters: 2,
} as const;

// Type definitions for better type safety
export type MarkerCategory = keyof typeof MARKER_COLORS;
export type CategoryDisplayName = keyof typeof CATEGORY_DISPLAY_NAMES;
export type DBCategoryName = keyof typeof DB_CATEGORY_NAMES;
