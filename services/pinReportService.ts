// Pin Reporting Service
// Handles reporting pins, tracking strikes, and managing shadowbans

import { supabase } from '@/lib/supabase';

export interface UserModerationStatus {
  id: number;
  user_id: string;
  strike_count: number;
  is_shadowbanned: boolean;
  shadowban_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface PinReport {
  report_id: number;
  pin_id: number;
  reporter_user_id: string;
  reason: string | null;
  created_at: string;
}

export interface ReportPinResponse {
  success: boolean;
  error?: string;
  data?: PinReport;
}

export interface ModerationStatusResponse {
  success: boolean;
  error?: string;
  data?: UserModerationStatus;
}

/**
 * Report a pin as inappropriate
 * @param pinId - The ID of the pin being reported
 * @param reporterUserId - The ID of the user reporting the pin
 * @param reason - Optional reason for the report
 * @returns Response with success status and data or error
 */
export async function reportPin(
  pinId: number,
  reporterUserId: string,
  reason?: string
): Promise<ReportPinResponse> {
  try {
    // Insert the report
    const { data, error } = await supabase
      .from('pin_reports')
      .insert({
        pin_id: pinId,
        reporter_user_id: reporterUserId,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate report error
      if (error.code === '23505') {
        return {
          success: false,
          error: 'You have already reported this pin',
        };
      }
      console.error('Error reporting pin:', error);
      return {
        success: false,
        error: error.message || 'Failed to report pin',
      };
    }

    return {
      success: true,
      data: data as PinReport,
    };
  } catch (error) {
    console.error('Unexpected error reporting pin:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get the total number of unique reports for a pin
 * @param pinId - The ID of the pin
 * @returns The count of unique reports
 */
export async function getPinReportCount(pinId: number): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('pin_reports')
      .select('*', { count: 'exact', head: true })
      .eq('pin_id', pinId);

    if (error) {
      console.error('Error getting pin report count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error getting pin report count:', error);
    return 0;
  }
}

/**
 * Check if a user has already reported a specific pin
 * @param pinId - The ID of the pin
 * @param userId - The ID of the user
 * @returns True if the user has already reported this pin
 */
export async function hasUserReportedPin(
  pinId: number,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pin_reports')
      .select('report_id')
      .eq('pin_id', pinId)
      .eq('reporter_user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking if user reported pin:', error);
      return false;
    }

    return data !== null;
  } catch (error) {
    console.error('Unexpected error checking user report:', error);
    return false;
  }
}

/**
 * Get all reports submitted by a user
 * @param userId - The ID of the user
 * @returns Array of reports submitted by the user
 */
export async function getUserReports(userId: string): Promise<PinReport[]> {
  try {
    const { data, error } = await supabase
      .from('pin_reports')
      .select('*')
      .eq('reporter_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user reports:', error);
      return [];
    }

    return (data as PinReport[]) || [];
  } catch (error) {
    console.error('Unexpected error getting user reports:', error);
    return [];
  }
}

/**
 * Add a strike to a user's record
 * This is typically called automatically by the database trigger,
 * but can be used manually for admin purposes
 * @param userId - The ID of the user
 * @returns Response with success status
 */
export async function addStrikeToUser(
  userId: string
): Promise<ModerationStatusResponse> {
  try {
    // First, ensure the user has a moderation record
    const { error: upsertError } = await supabase
      .from('user_moderation')
      .upsert(
        {
          user_id: userId,
          strike_count: 0,
          is_shadowbanned: false,
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: true,
        }
      );

    if (upsertError) {
      console.error('Error ensuring moderation record:', upsertError);
    }

    // Increment the strike count
    const { data, error } = await supabase.rpc('increment_user_strikes', {
      target_user_id: userId,
    });

    if (error) {
      // If the RPC doesn't exist, do it manually
      // First get current strike count
      const { data: currentData, error: fetchError } = await supabase
        .from('user_moderation')
        .select('strike_count')
        .eq('user_id', userId)
        .single();

      if (fetchError || !currentData) {
        console.error('Error fetching current strikes:', fetchError);
        return {
          success: false,
          error: fetchError?.message || 'Failed to fetch current strikes',
        };
      }

      // Increment the strike count
      const { data: updateData, error: updateError } = await supabase
        .from('user_moderation')
        .update({
          strike_count: currentData.strike_count + 1,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error adding strike to user:', updateError);
        return {
          success: false,
          error: updateError.message || 'Failed to add strike',
        };
      }

      // Check if we need to shadowban
      const modStatus = updateData as UserModerationStatus;
      if (modStatus.strike_count >= 5 && !modStatus.is_shadowbanned) {
        await shadowbanUser(userId, 'Automatic: 5 or more strikes');
      }

      return {
        success: true,
        data: updateData as UserModerationStatus,
      };
    }

    // Fetch the updated status
    const status = await getUserModerationStatus(userId);
    return status;
  } catch (error) {
    console.error('Unexpected error adding strike to user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Shadowban a user
 * @param userId - The ID of the user to shadowban
 * @param reason - Reason for the shadowban
 * @returns Response with success status
 */
export async function shadowbanUser(
  userId: string,
  reason?: string
): Promise<ModerationStatusResponse> {
  try {
    const { data, error } = await supabase
      .from('user_moderation')
      .update({
        is_shadowbanned: true,
        shadowban_reason: reason || 'Manual shadowban',
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error shadowbanning user:', error);
      return {
        success: false,
        error: error.message || 'Failed to shadowban user',
      };
    }

    return {
      success: true,
      data: data as UserModerationStatus,
    };
  } catch (error) {
    console.error('Unexpected error shadowbanning user:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Remove shadowban from a user (admin function)
 * @param userId - The ID of the user
 * @returns Response with success status
 */
export async function unshadowbanUser(
  userId: string
): Promise<ModerationStatusResponse> {
  try {
    const { data, error } = await supabase
      .from('user_moderation')
      .update({
        is_shadowbanned: false,
        shadowban_reason: null,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing shadowban:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove shadowban',
      };
    }

    return {
      success: true,
      data: data as UserModerationStatus,
    };
  } catch (error) {
    console.error('Unexpected error removing shadowban:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Check if a user is shadowbanned
 * @param userId - The ID of the user
 * @returns True if the user is shadowbanned
 */
export async function isUserShadowbanned(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_moderation')
      .select('is_shadowbanned')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking shadowban status:', error);
      return false;
    }

    return data?.is_shadowbanned || false;
  } catch (error) {
    console.error('Unexpected error checking shadowban status:', error);
    return false;
  }
}

/**
 * Get a user's strike count
 * @param userId - The ID of the user
 * @returns The user's strike count (0 if no record exists)
 */
export async function getUserStrikeCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_moderation')
      .select('strike_count')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user strike count:', error);
      return 0;
    }

    return data?.strike_count || 0;
  } catch (error) {
    console.error('Unexpected error getting user strike count:', error);
    return 0;
  }
}

/**
 * Get a user's full moderation status
 * @param userId - The ID of the user
 * @returns The user's moderation status or null
 */
export async function getUserModerationStatus(
  userId: string
): Promise<ModerationStatusResponse> {
  try {
    // Try to get existing record
    const { data, error } = await supabase
      .from('user_moderation')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user moderation status:', error);
      return {
        success: false,
        error: error.message || 'Failed to get moderation status',
      };
    }

    // If no record exists, create one
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('user_moderation')
        .insert({
          user_id: userId,
          strike_count: 0,
          is_shadowbanned: false,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating moderation record:', insertError);
        return {
          success: false,
          error: insertError.message || 'Failed to create moderation record',
        };
      }

      return {
        success: true,
        data: newData as UserModerationStatus,
      };
    }

    return {
      success: true,
      data: data as UserModerationStatus,
    };
  } catch (error) {
    console.error('Unexpected error getting moderation status:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get all shadowbanned user IDs (for filtering)
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
