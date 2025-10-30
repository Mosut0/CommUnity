import {
  fetchReports,
  fetchReportById,
  createReport,
  updateReport,
  deleteReport,
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
  });

  describe('createReport', () => {
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
  });

  describe('deleteReport', () => {
    it('should delete a report successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });

    it('should handle deletion errors', async () => {
      const mockError = new Error('Delete failed');

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });
  });
});
