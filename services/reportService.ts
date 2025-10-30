// Centralized Report Service
// This service handles all report-related operations including CRUD operations
// and provides a unified interface for report management

import { supabase } from '@/lib/supabase';
import { uploadImage } from '@/services/imageService';
import {
  Report,
  CreateReportData,
  UpdateReportData,
  UpdateEventData,
  UpdateHazardData,
  UpdateLostItemData,
  UpdateFoundItemData,
  ReportServiceResponse,
  ReportFilters,
  ReportQueryOptions,
  ReportCategory,
} from '@/types/report';

/**
 * Convert location string to latitude and longitude
 */
function locationToPoint(locationStr: string): { lat: number; lng: number } {
  const parts = locationStr.split(',');
  if (parts.length !== 2) {
    return { lat: 0, lng: 0 };
  }
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  if (isNaN(lat) || isNaN(lng)) {
    return { lat: 0, lng: 0 };
  }
  return { lat, lng };
}

/**
 * Fetch all reports with optional filtering
 */
export async function fetchReports(
  options: ReportQueryOptions = {}
): Promise<ReportServiceResponse<Report[]>> {
  try {
    let query = supabase
      .from('reports')
      .select('*')
      .order('createdat', { ascending: false });

    // Apply filters
    if (options.filters?.category) {
      query = query.eq('category', options.filters.category);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data: reportsData, error: reportsError } = await query;

    if (reportsError) {
      console.error('Error fetching reports:', reportsError);
      return { success: false, error: reportsError };
    }

    if (!reportsData || reportsData.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch additional details for each report based on category
    const enhancedReports = await Promise.all(
      reportsData.map(async report => {
        try {
          let additionalData = {};

          switch (report.category) {
            case 'event':
              const { data: eventData } = await supabase
                .from('events')
                .select('*')
                .eq('reportid', report.reportid)
                .maybeSingle();
              additionalData = eventData || {};
              break;

            case 'safety':
              const { data: hazardData } = await supabase
                .from('hazards')
                .select('*')
                .eq('reportid', report.reportid)
                .maybeSingle();
              additionalData = hazardData || {};
              break;

            case 'lost':
              const { data: lostItemData } = await supabase
                .from('lostitems')
                .select('*')
                .eq('reportid', report.reportid)
                .maybeSingle();
              additionalData = lostItemData || {};
              break;

            case 'found':
              const { data: foundItemData } = await supabase
                .from('founditems')
                .select('*')
                .eq('reportid', report.reportid)
                .maybeSingle();
              additionalData = foundItemData || {};
              break;
          }

          return { ...report, ...additionalData } as Report;
        } catch (error) {
          console.error(`Error processing report ${report.reportid}:`, error);
          return report as Report;
        }
      })
    );

    return { success: true, data: enhancedReports };
  } catch (error) {
    console.error('Error in fetchReports:', error);
    return { success: false, error };
  }
}

/**
 * Fetch a single report by ID
 */
export async function fetchReportById(
  reportId: number
): Promise<ReportServiceResponse<Report>> {
  try {
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('reportid', reportId)
      .single();

    if (reportError) {
      console.error('Error fetching report:', reportError);
      return { success: false, error: reportError };
    }

    if (!reportData) {
      return { success: false, error: 'Report not found' };
    }

    // Fetch additional details based on category
    let additionalData = {};

    switch (reportData.category) {
      case 'event':
        const { data: eventData } = await supabase
          .from('events')
          .select('*')
          .eq('reportid', reportData.reportid)
          .maybeSingle();
        additionalData = eventData || {};
        break;

      case 'safety':
        const { data: hazardData } = await supabase
          .from('hazards')
          .select('*')
          .eq('reportid', reportData.reportid)
          .maybeSingle();
        additionalData = hazardData || {};
        break;

      case 'lost':
        const { data: lostItemData } = await supabase
          .from('lostitems')
          .select('*')
          .eq('reportid', reportData.reportid)
          .maybeSingle();
        additionalData = lostItemData || {};
        break;

      case 'found':
        const { data: foundItemData } = await supabase
          .from('founditems')
          .select('*')
          .eq('reportid', reportData.reportid)
          .maybeSingle();
        additionalData = foundItemData || {};
        break;
    }

    const enhancedReport = { ...reportData, ...additionalData } as Report;
    return { success: true, data: enhancedReport };
  } catch (error) {
    console.error('Error in fetchReportById:', error);
    return { success: false, error };
  }
}

/**
 * Create a new report
 */
export async function createReport(
  reportData: CreateReportData,
  userId: string
): Promise<ReportServiceResponse<Report>> {
  try {
    // Upload image if provided
    let imageUrl = null;
    if (reportData.data.imageUri) {
      imageUrl = await uploadImage(reportData.data.imageUri);
    }

    // Insert report into 'reports' table
    const { data: reportResult, error: reportError } = await supabase
      .from('reports')
      .insert({
        userid: userId,
        category: reportData.type,
        description: reportData.data.description,
        location: `(${locationToPoint(reportData.data.location).lat},${locationToPoint(reportData.data.location).lng})`,
        imageurl: imageUrl,
      })
      .select()
      .single();

    if (reportError) {
      console.error('Report insert error:', reportError);
      return { success: false, error: reportError };
    }

    const reportId = reportResult.reportid;

    // Insert category-specific data
    let categoryError = null;

    switch (reportData.type) {
      case 'event':
        const eventDateTime = new Date(reportData.data.date);
        if (reportData.data.time) {
          const [hours, minutes] = reportData.data.time.split(':').map(Number);
          eventDateTime.setHours(hours, minutes);
        }

        const { error: eventError } = await supabase.from('events').insert({
          reportid: reportId,
          eventtype: reportData.data.eventType,
          time: eventDateTime.toISOString(),
        });
        categoryError = eventError;
        break;

      case 'safety':
        const { error: hazardError } = await supabase.from('hazards').insert({
          reportid: reportId,
          hazardtype: reportData.data.hazardType,
        });
        categoryError = hazardError;
        break;

      case 'lost':
        const { error: lostError } = await supabase.from('lostitems').insert({
          reportid: reportId,
          itemtype: reportData.data.itemName,
          contactinfo: reportData.data.contactInfo,
        });
        categoryError = lostError;
        break;

      case 'found':
        const { error: foundError } = await supabase.from('founditems').insert({
          reportid: reportId,
          itemtype: reportData.data.itemName,
          contactinfo: reportData.data.contactInfo,
        });
        categoryError = foundError;
        break;
    }

    if (categoryError) {
      console.error('Category data insert error:', categoryError);
      // Clean up the main report if category data insertion failed
      await supabase.from('reports').delete().eq('reportid', reportId);
      return { success: false, error: categoryError };
    }

    // Fetch the complete report with all data
    const completeReport = await fetchReportById(reportId);
    return completeReport;
  } catch (error) {
    console.error('Error in createReport:', error);
    return { success: false, error };
  }
}

/**
 * Update a report
 */
export async function updateReport(
  reportId: number,
  reportData: UpdateReportData,
  categoryData?:
    | UpdateEventData
    | UpdateHazardData
    | UpdateLostItemData
    | UpdateFoundItemData
): Promise<ReportServiceResponse<Report>> {
  try {
    // Update main report data
    const { error: reportError } = await supabase
      .from('reports')
      .update(reportData)
      .eq('reportid', reportId);

    if (reportError) {
      console.error('Report update error:', reportError);
      return { success: false, error: reportError };
    }

    // Update category-specific data if provided
    if (categoryData) {
      // First, get the report to determine its category
      const { data: report } = await supabase
        .from('reports')
        .select('category')
        .eq('reportid', reportId)
        .single();

      if (report) {
        let categoryError = null;

        switch (report.category) {
          case 'event':
            const { error: eventError } = await supabase
              .from('events')
              .update(categoryData as UpdateEventData)
              .eq('reportid', reportId);
            categoryError = eventError;
            break;

          case 'safety':
            const { error: hazardError } = await supabase
              .from('hazards')
              .update(categoryData as UpdateHazardData)
              .eq('reportid', reportId);
            categoryError = hazardError;
            break;

          case 'lost':
            const { error: lostError } = await supabase
              .from('lostitems')
              .update(categoryData as UpdateLostItemData)
              .eq('reportid', reportId);
            categoryError = lostError;
            break;

          case 'found':
            const { error: foundError } = await supabase
              .from('founditems')
              .update(categoryData as UpdateFoundItemData)
              .eq('reportid', reportId);
            categoryError = foundError;
            break;
        }

        if (categoryError) {
          console.error('Category data update error:', categoryError);
          return { success: false, error: categoryError };
        }
      }
    }

    // Fetch the updated report
    const updatedReport = await fetchReportById(reportId);
    return updatedReport;
  } catch (error) {
    console.error('Error in updateReport:', error);
    return { success: false, error };
  }
}

/**
 * Delete a report
 */
export async function deleteReport(
  reportId: number
): Promise<ReportServiceResponse<boolean>> {
  try {
    // Delete from main reports table (cascade will handle related tables)
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('reportid', reportId);

    if (error) {
      console.error('Report delete error:', error);
      return { success: false, error };
    }

    return { success: true, data: true };
  } catch (error) {
    console.error('Error in deleteReport:', error);
    return { success: false, error };
  }
}

/**
 * Get reports by user ID
 */
export async function fetchReportsByUser(
  userId: string
): Promise<ReportServiceResponse<Report[]>> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('userid', userId)
      .order('createdat', { ascending: false });

    if (error) {
      console.error('Error fetching user reports:', error);
      return { success: false, error };
    }

    // Process reports to include category-specific data
    const enhancedReports = await Promise.all(
      (data || []).map(async report => {
        let additionalData = {};

        switch (report.category) {
          case 'event':
            const { data: eventData } = await supabase
              .from('events')
              .select('*')
              .eq('reportid', report.reportid)
              .maybeSingle();
            additionalData = eventData || {};
            break;

          case 'safety':
            const { data: hazardData } = await supabase
              .from('hazards')
              .select('*')
              .eq('reportid', report.reportid)
              .maybeSingle();
            additionalData = hazardData || {};
            break;

          case 'lost':
            const { data: lostItemData } = await supabase
              .from('lostitems')
              .select('*')
              .eq('reportid', report.reportid)
              .maybeSingle();
            additionalData = lostItemData || {};
            break;

          case 'found':
            const { data: foundItemData } = await supabase
              .from('founditems')
              .select('*')
              .eq('reportid', report.reportid)
              .maybeSingle();
            additionalData = foundItemData || {};
            break;
        }

        return { ...report, ...additionalData } as Report;
      })
    );

    return { success: true, data: enhancedReports };
  } catch (error) {
    console.error('Error in fetchReportsByUser:', error);
    return { success: false, error };
  }
}

/**
 * Set up real-time subscription for reports
 */
export function subscribeToReports(
  onUpdate: (payload: any) => void,
  onError?: (error: any) => void
) {
  const channelName = `reports-updates-${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'reports',
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'events',
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'hazards',
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lostitems',
      },
      onUpdate
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'founditems',
      },
      onUpdate
    )
    .subscribe(status => {
      if (status === 'CHANNEL_ERROR' && onError) {
        onError(new Error('Subscription error'));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
