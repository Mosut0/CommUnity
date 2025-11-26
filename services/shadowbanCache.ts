/**
 * Shadowban Cache Management
 * Centralized cache for shadowbanned user IDs to improve performance
 * This module is imported by both reportService and pinReportService to avoid circular dependencies
 */

import { getShadowbannedUserIds } from '@/services/pinReportService';

// Cache for shadowbanned user IDs to reduce database queries
// Tradeoff: Newly shadowbanned users might appear for up to CACHE_TTL duration
// Note: This is client-side caching (per-device), not server-side
let cachedShadowbannedIds: string[] | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (balance between performance and consistency)

/**
 * Get shadowbanned user IDs with caching
 * @returns Array of shadowbanned user IDs
 */
export async function getCachedShadowbannedUserIds(): Promise<string[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedShadowbannedIds && now < cacheExpiry) {
    return cachedShadowbannedIds;
  }

  // Fetch fresh data from database via pinReportService
  const shadowbannedIds = await getShadowbannedUserIds();

  // Update cache
  cachedShadowbannedIds = shadowbannedIds;
  cacheExpiry = now + CACHE_TTL;

  return shadowbannedIds;
}

/**
 * Manually invalidate the shadowbanned users cache
 * Call this when a user is shadowbanned or unshadowbanned to ensure immediate effect
 */
export function invalidateShadowbanCache(): void {
  cachedShadowbannedIds = null;
  cacheExpiry = 0;
}
