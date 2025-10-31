import {
  fetchReports,
  fetchReportById,
  createReport,
} from '@/services/reportService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    removeChannel: jest.fn(),
    channel: jest.fn(),
  },
}));

// Mock the image service
jest.mock('@/services/imageService', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}));

describe('reportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchReports', () => {
    it('should fetch all reports successfully', async () => {
      const mockReports = [
        {
          reportid: 1,
          category: 'event',
          description: 'Test event',
          location: '(40.7128,-74.0060)',
          createdat: '2024-01-01',
          userid: 'user1',
        },
      ];

      const mockSelect = jest.fn().mockReturnThis();
      const mockOrder = jest
        .fn()
        .mockResolvedValue({ data: mockReports, error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      // Mock the category-specific query
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: mockSelect,
          order: mockOrder,
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const result = await fetchReports();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(supabase.from).toHaveBeenCalledWith('reports');
    });

    it('should handle errors when fetching reports', async () => {
      const mockError = new Error('Database error');

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const result = await fetchReports();

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });

    it('should apply filters correctly', async () => {
      const mockEq = jest.fn().mockReturnThis();

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        eq: mockEq,
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      await fetchReports({ filters: { category: 'event' }, limit: 10 });

      expect(mockEq).toHaveBeenCalledWith('category', 'event');
    });
  });

  describe('fetchReportById', () => {
    it('should fetch a single report successfully', async () => {
      const mockReport = {
        reportid: 1,
        category: 'event',
        description: 'Test event',
        location: '(40.7128,-74.0060)',
        createdat: '2024-01-01',
        userid: 'user1',
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReport, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const result = await fetchReportById(1);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.reportid).toBe(1);
    });

    it('should handle report not found', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: new Error('Not found') }),
      });

      const result = await fetchReportById(999);

      expect(result.success).toBe(false);
    });

    it('should fetch category-specific data for different report types', async () => {
      const mockSafetyReport = {
        reportid: 2,
        category: 'safety',
        description: 'Hazard',
        location: '(40.7128,-74.0060)',
        createdat: '2024-01-01',
        userid: 'user1',
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockSafetyReport, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { hazardtype: 'Pothole' },
            error: null,
          }),
        });

      const result = await fetchReportById(2);

      expect(result.success).toBe(true);
      expect(result.data?.category).toBe('safety');
    });
  });

  describe('createReport', () => {
    it('should create an event report successfully', async () => {
      const mockReportData = {
        reportid: 1,
        category: 'event',
        description: 'New event',
        location: '(40.7128,-74.0060)',
        createdat: '2024-01-01',
        userid: 'user1',
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReportData, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReportData, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const createData = {
        type: 'event' as const,
        data: {
          eventType: 'Meeting',
          description: 'New event',
          location: '40.7128,-74.0060',
          date: new Date('2024-01-01'),
          time: '14:00',
        },
      };

      const result = await createReport(createData, 'user1');

      expect(result.success).toBe(true);
    });

    it('should create a safety report successfully', async () => {
      const mockReportData = {
        reportid: 2,
        category: 'safety',
        description: 'Pothole',
        location: '(40.7128,-74.0060)',
        createdat: '2024-01-01',
        userid: 'user1',
      };

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReportData, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue({ error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReportData, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { hazardtype: 'Pothole' },
            error: null,
          }),
        });

      const createData = {
        type: 'safety' as const,
        data: {
          hazardType: 'Pothole',
          description: 'Pothole',
          location: '40.7128,-74.0060',
          date: new Date('2024-01-01'),
        },
      };

      const result = await createReport(createData, 'user1');

      expect(result.success).toBe(true);
    });

    it('should rollback on category data insertion failure', async () => {
      const mockReportData = {
        reportid: 1,
        category: 'event',
      };

      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest
            .fn()
            .mockResolvedValue({ data: mockReportData, error: null }),
        })
        .mockReturnValueOnce({
          insert: jest
            .fn()
            .mockResolvedValue({ error: new Error('Insert failed') }),
        })
        .mockReturnValueOnce({
          delete: mockDelete,
          eq: mockEq,
        });

      const createData = {
        type: 'event' as const,
        data: {
          eventType: 'Meeting',
          description: 'New event',
          location: '40.7128,-74.0060',
          date: new Date('2024-01-01'),
          time: '14:00',
        },
      };

      const result = await createReport(createData, 'user1');

      expect(result.success).toBe(false);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should handle report insertion error', async () => {
      const mockError = new Error('Database error');

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const createData = {
        type: 'event' as const,
        data: {
          eventType: 'Meeting',
          description: 'New event',
          location: '40.7128,-74.0060',
          date: new Date('2024-01-01'),
          time: '14:00',
        },
      };

      const result = await createReport(createData, 'user1');

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });
  });

  describe('fetchReports with empty results', () => {
    it('should return empty array when no reports exist', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await fetchReports();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('fetchReports with pagination', () => {
    it('should handle limit option', async () => {
      const mockLimit = jest.fn().mockResolvedValue({ data: [], error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: mockLimit,
      });

      await fetchReports({ limit: 5 });

      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should handle offset with limit', async () => {
      // When offset is provided, the service uses .range() instead of .limit()
      // This test verifies that pagination options are accepted without errors
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await fetchReports({ offset: 10, limit: 5 });

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
