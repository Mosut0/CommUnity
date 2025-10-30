import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReports, useReport } from '@/hooks/useReports';
import * as reportService from '@/services/reportService';
import { Report } from '@/types/report';

// Mock the report service
jest.mock('@/services/reportService');

describe('useReports', () => {
  const mockReports: Report[] = [
    {
      reportid: 1,
      userid: 'user1',
      category: 'event',
      description: 'Test event',
      location: '(40.7128,-74.0060)',
      createdat: '2024-01-01T12:00:00Z',
    },
    {
      reportid: 2,
      userid: 'user2',
      category: 'safety',
      description: 'Test hazard',
      location: '(40.7128,-74.0060)',
      createdat: '2024-01-01T13:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (reportService.fetchReports as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReports,
    });
    (reportService.subscribeToReports as jest.Mock).mockReturnValue(jest.fn());
  });

  it('should fetch reports on mount when autoFetch is true', async () => {
    const { result } = renderHook(() => useReports({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.reports).toHaveLength(2);
    });

    expect(reportService.fetchReports).toHaveBeenCalled();
  });

  it('should not fetch reports on mount when autoFetch is false', () => {
    renderHook(() => useReports({ autoFetch: false }));

    expect(reportService.fetchReports).not.toHaveBeenCalled();
  });

  it('should set loading state correctly', async () => {
    const { result } = renderHook(() => useReports({ autoFetch: true }));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetch errors', async () => {
    (reportService.fetchReports as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Fetch failed' },
    });

    const { result } = renderHook(() => useReports({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.error).toBe('Fetch failed');
    });
  });

  it('should refresh reports manually', async () => {
    const { result } = renderHook(() => useReports({ autoFetch: false }));

    await act(async () => {
      await result.current.refreshReports();
    });

    expect(reportService.fetchReports).toHaveBeenCalled();
    expect(result.current.reports).toHaveLength(2);
  });

  it('should fetch single report', async () => {
    (reportService.fetchReportById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReports[0],
    });

    const { result } = renderHook(() => useReports({ autoFetch: false }));

    let report: Report | null = null;
    await act(async () => {
      report = await result.current.fetchReport(1);
    });

    expect(report).toEqual(mockReports[0]);
    expect(reportService.fetchReportById).toHaveBeenCalledWith(1);
  });

  it('should add new report', async () => {
    const newReport = {
      type: 'event' as const,
      data: {
        eventType: 'Meeting',
        description: 'New event',
        location: '40.7128,-74.0060',
        date: new Date('2024-01-01'),
        time: '14:00',
      },
    };

    const createdReport = {
      ...mockReports[0],
      reportid: 3,
      description: 'New event',
    };

    (reportService.createReport as jest.Mock).mockResolvedValue({
      success: true,
      data: createdReport,
    });

    const { result } = renderHook(() => useReports({ autoFetch: false }));

    let success = false;
    await act(async () => {
      success = await result.current.addReport(newReport, 'user1');
    });

    expect(success).toBe(true);
    expect(result.current.reports).toContainEqual(createdReport);
  });

  it('should update existing report', async () => {
    (reportService.fetchReports as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReports,
    });

    const updatedReport = {
      ...mockReports[0],
      description: 'Updated description',
    };

    (reportService.updateReport as jest.Mock).mockResolvedValue({
      success: true,
      data: updatedReport,
    });

    const { result } = renderHook(() => useReports({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.reports).toHaveLength(2);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateReportData(1, {
        description: 'Updated description',
      });
    });

    expect(success).toBe(true);
    expect(result.current.reports[0].description).toBe('Updated description');
  });

  it('should remove report', async () => {
    (reportService.fetchReports as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReports,
    });

    (reportService.deleteReport as jest.Mock).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useReports({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.reports).toHaveLength(2);
    });

    let success = false;
    await act(async () => {
      success = await result.current.removeReport(1);
    });

    expect(success).toBe(true);
    expect(result.current.reports).toHaveLength(1);
    expect(result.current.reports[0].reportid).toBe(2);
  });

  it('should select report', () => {
    const { result } = renderHook(() => useReports({ autoFetch: false }));

    act(() => {
      result.current.selectReport(mockReports[0]);
    });

    expect(result.current.selectedReport).toEqual(mockReports[0]);
  });

  it('should clear error', async () => {
    (reportService.fetchReports as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Test error' },
    });

    const { result } = renderHook(() => useReports({ autoFetch: true }));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should check if user is owner', () => {
    const { result } = renderHook(() => useReports({ autoFetch: false }));

    const isOwner = result.current.isOwner(mockReports[0], 'user1');
    const isNotOwner = result.current.isOwner(mockReports[0], 'user2');

    expect(isOwner).toBe(true);
    expect(isNotOwner).toBe(false);
  });

  it('should set up real-time subscriptions when autoFetch is true', () => {
    renderHook(() => useReports({ autoFetch: true }));

    expect(reportService.subscribeToReports).toHaveBeenCalled();
  });

  it('should cleanup subscriptions on unmount', () => {
    const cleanup = jest.fn();
    (reportService.subscribeToReports as jest.Mock).mockReturnValue(cleanup);

    const { unmount } = renderHook(() => useReports({ autoFetch: true }));

    unmount();

    expect(cleanup).toHaveBeenCalled();
  });
});

describe('useReport', () => {
  const mockReport: Report = {
    reportid: 1,
    userid: 'user1',
    category: 'event',
    description: 'Test event',
    location: '(40.7128,-74.0060)',
    createdat: '2024-01-01T12:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch report when reportId is provided', async () => {
    (reportService.fetchReportById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReport,
    });

    const { result } = renderHook(() => useReport(1));

    await waitFor(() => {
      expect(result.current.report).toEqual(mockReport);
    });

    expect(reportService.fetchReportById).toHaveBeenCalledWith(1);
  });

  it('should not fetch when reportId is null', () => {
    renderHook(() => useReport(null));

    expect(reportService.fetchReportById).not.toHaveBeenCalled();
  });

  it('should handle fetch errors', async () => {
    (reportService.fetchReportById as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Not found' },
    });

    const { result } = renderHook(() => useReport(1));

    await waitFor(() => {
      expect(result.current.error).toBe('Not found');
    });
  });

  it('should refetch report manually', async () => {
    (reportService.fetchReportById as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReport,
    });

    const { result } = renderHook(() => useReport(1));

    await waitFor(() => {
      expect(result.current.report).toEqual(mockReport);
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.refetch();
    });

    expect(reportService.fetchReportById).toHaveBeenCalledWith(1);
  });
});
