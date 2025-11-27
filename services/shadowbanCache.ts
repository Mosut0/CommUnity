/**
 * Shadowban Cache Management
 * Centralized cache for shadowbanned user IDs to improve performance
 * This module owns the fetching logic to avoid circular dependencies with pinReportService
 */

import { supabase } from '@/lib/supabase';

// Cache for shadowbanned user IDs to reduce database queries
// Tradeoff: Newly shadowbanned users might appear for up to CACHE_TTL duration
// Note: This is client-side caching (per-device), not server-side
let cachedShadowbannedIds: string[] | null = null;
let cacheExpiry: number = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes (balance between performance and consistency)

/**
 * Get all shadowbanned user IDs directly from database
 * This is the base function that queries the database without caching
 * @returns Array of shadowbanned user IDs
 */
export async function getShadowbannedUserIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('user_moderation')
      .select('user_id')
      .eq('is_shadowbanned', true);

    if (error) {
      console.error('Error getting shadowbanned users:', error);
      return [];
    }

    return (data || []).map((record: any) => record.user_id);
  } catch (error) {
    console.error('Unexpected error getting shadowbanned users:', error);
    return [];
  }
}

/**
 * Get shadowbanned user IDs with caching
 * This is the recommended function for most use cases
 * @returns Array of shadowbanned user IDs
 */
export async function getCachedShadowbannedUserIds(): Promise<string[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedShadowbannedIds && now < cacheExpiry) {
    return cachedShadowbannedIds;
  }

  // Fetch fresh data from database
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
