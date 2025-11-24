// Unified Report Types for the CommUnity App
// This file provides type-safe interfaces for all report-related data

export type ReportCategory =
  | 'event'
  | 'hazard'
  | 'lost'
  | 'found'
  | 'other';

export interface BaseReport {
  reportid: number;
  userid: string;
  category: ReportCategory;
  description: string;
  location: string; // Format: "(lat,lng)"
  createdat: string;
  imageurl?: string;
}

// Category-specific data interfaces
export interface EventData {
  eventtype: string;
  time: string; // ISO string
}

export interface HazardData {
  hazardtype: string;
}

export interface LostItemData {
  itemtype: string;
  contactinfo: string;
}

export interface FoundItemData {
  itemtype: string;
  contactinfo: string;
}

// Union type for category-specific data
export type CategorySpecificData =
  | { category: 'event'; data: EventData }
  | { category: 'hazard'; data: HazardData }
  | { category: 'lost'; data: LostItemData }
  | { category: 'found'; data: FoundItemData }

// Complete report interface with category-specific data
export interface Report extends BaseReport {
  eventtype?: string;
  hazardtype?: string;
  itemtype?: string;
  contactinfo?: string;
  time?: string;
}

// Report creation data interfaces
export interface CreateEventReportData {
  eventType: string;
  description: string;
  location: string; // "lat,lng" format
  date: Date;
  time: string;
  imageUri?: string;
}

export interface CreateHazardReportData {
  hazardType: string;
  description: string;
  location: string; // "lat,lng" format
  date: Date;
  imageUri?: string;
}

export interface CreateLostItemReportData {
  itemName: string;
  description: string;
  location: string; // "lat,lng" format
  date: Date;
  contactInfo: string;
  imageUri?: string;
}

export interface CreateFoundItemReportData {
  itemName: string;
  description: string;
  location: string; // "lat,lng" format
  contactInfo: string;
  imageUri?: string;
}

export type CreateReportData =
  | { type: 'event'; data: CreateEventReportData }
  | { type: 'hazard'; data: CreateHazardReportData }
  | { type: 'lost'; data: CreateLostItemReportData }
  | { type: 'found'; data: CreateFoundItemReportData };

// Report update data (partial updates)
export interface UpdateReportData {
  description?: string;
  location?: string;
  imageurl?: string;
}

export interface UpdateEventData {
  eventtype?: string;
  time?: string;
}

export interface UpdateHazardData {
  hazardtype?: string;
}

export interface UpdateLostItemData {
  itemtype?: string;
  contactinfo?: string;
}

export interface UpdateFoundItemData {
  itemtype?: string;
  contactinfo?: string;
}

// Service response types
export interface ReportServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: any;
}

// Filter and query types
export interface ReportFilters {
  category?: ReportCategory;
  distanceRadius?: number;
  userLocation?: { latitude: number; longitude: number };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportQueryOptions {
  filters?: ReportFilters;
  limit?: number;
  offset?: number;
  orderBy?: 'createdat' | 'distance';
  orderDirection?: 'asc' | 'desc';
}
