// Custom hook for managing reports state and operations
// This hook provides a centralized way to manage reports across the app

import { useState, useEffect, useCallback, useRef } from 'react';
import { Report, ReportQueryOptions, CreateReportData } from '@/types/report';
import {
  fetchReports,
  fetchReportById,
  createReport,
  subscribeToReports,
} from '@/services/reportService';
import { ReportFilters } from '@/types/report';

interface UseReportsOptions {
  autoFetch?: boolean;
  filters?: ReportFilters;
  queryOptions?: Omit<ReportQueryOptions, 'filters'>;
}

interface UseReportsReturn {
  // State
  reports: Report[];
  loading: boolean;
  error: string | null;
  selectedReport: Report | null;

  // Actions
  refreshReports: () => Promise<void>;
  fetchReport: (id: number) => Promise<Report | null>;
  addReport: (reportData: CreateReportData, userId: string) => Promise<boolean>;
  selectReport: (report: Report | null) => void;
  clearError: () => void;

  // Utilities
  isOwner: (report: Report, userId: string) => boolean;
}

export function useReports(options: UseReportsOptions = {}): UseReportsReturn {
  const { autoFetch = true, filters, queryOptions } = options;

  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Refs for cleanup
  const isMountedRef = useRef(true);
  const subscriptionRef = useRef<(() => void) | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
    };
  }, []);

  // Refresh reports function
  const refreshReports = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const queryOptionsWithFilters: ReportQueryOptions = {
        ...(queryOptions || {}),
        filters,
      };

      const result = await fetchReports(queryOptionsWithFilters);

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        setReports(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch reports');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Error refreshing reports:', err);
      setError('An unexpected error occurred');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [filters, queryOptions]);

  // Fetch single report
  const fetchReport = useCallback(
    async (id: number): Promise<Report | null> => {
      try {
        const result = await fetchReportById(id);
        if (result.success && result.data) {
          return result.data;
        } else {
          setError(result.error?.message || 'Failed to fetch report');
          return null;
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('An unexpected error occurred');
        return null;
      }
    },
    []
  );

  // Add new report
  const addReport = useCallback(
    async (reportData: CreateReportData, userId: string): Promise<boolean> => {
      try {
        const result = await createReport(reportData, userId);
        if (result.success && result.data) {
          // Add to local state
          setReports(prev => [result.data!, ...prev]);
          return true;
        } else {
          setError(result.error?.message || 'Failed to create report');
          return false;
        }
      } catch (err) {
        console.error('Error creating report:', err);
        setError('An unexpected error occurred');
        return false;
      }
    },
    []
  );

  // Select report
  const selectReport = useCallback((report: Report | null) => {
    setSelectedReport(report);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user owns a report
  const isOwner = useCallback((report: Report, userId: string): boolean => {
    return report.userid === userId;
  }, []);

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      refreshReports();
    }
  }, [autoFetch, refreshReports]);

  // Set up real-time subscription
  useEffect(() => {
    if (autoFetch) {
      const cleanup = subscribeToReports(
        () => {
          // Refresh reports when changes occur
          refreshReports();
        },
        err => {
          console.error('Subscription error:', err);
          setError('Connection error - data may not be up to date');
        }
      );

      subscriptionRef.current = cleanup;

      return cleanup;
    }
  }, [autoFetch, refreshReports]);

  return {
    // State
    reports,
    loading,
    error,
    selectedReport,

    // Actions
    refreshReports,
    fetchReport,
    addReport,
    selectReport,
    clearError,

    // Utilities
    isOwner,
  };
}

// Hook for managing a single report
export function useReport(reportId: number | null) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchReportById(id);
      if (result.success && result.data) {
        setReport(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch report');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReport(reportId);
    } else {
      setReport(null);
    }
  }, [reportId, fetchReport]);

  return {
    report,
    loading,
    error,
    refetch: () => (reportId ? fetchReport(reportId) : Promise.resolve()),
  };
}
