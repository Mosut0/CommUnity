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
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' },
        },
        error: null,
      }),
    },
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

  describe('updateReport', () => {
    it('should update a report with only common fields', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      // Mock for update query
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
      });

      // Mock for fetchReportById (called after update)
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 1,
              description: 'Updated description',
              category: 'event',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const updateData = { description: 'Updated description' };
      const result = await updateReport(1, updateData);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
    });

    it('should update a report with category-specific data (event)', async () => {
      const mockReportUpdate = jest.fn().mockReturnThis();
      const mockReportEq = jest.fn().mockReturnThis();
      const mockReportSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });
      const mockCategoryUpdate = jest.fn().mockReturnThis();
      const mockCategoryEq = jest.fn().mockReturnThis();
      const mockCategorySelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      // Mock for report update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockReportUpdate,
        eq: mockReportEq,
        select: mockReportSelect,
      });

      // Mock for fetching report category
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { category: 'event' }, error: null }),
      });

      // Mock for category update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockCategoryUpdate,
        eq: mockCategoryEq,
        select: mockCategorySelect,
      });

      // Mock for fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 1,
              description: 'Updated event',
              category: 'event',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              eventtype: 'Workshop',
              time: '2024-01-15T14:00:00.000Z',
            },
            error: null,
          }),
        });

      const updateData = { description: 'Updated event' };
      const categoryData = {
        eventtype: 'Workshop',
        time: '2024-01-15T14:00:00.000Z',
      };

      const result = await updateReport(1, updateData, categoryData);

      expect(result.success).toBe(true);
      expect(mockReportUpdate).toHaveBeenCalledWith(updateData);
      expect(mockCategoryUpdate).toHaveBeenCalledWith(categoryData);
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should update a report with category-specific data (safety)', async () => {
      const mockReportUpdate = jest.fn().mockReturnThis();
      const mockReportEq = jest.fn().mockReturnThis();
      const mockReportSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });
      const mockCategoryUpdate = jest.fn().mockReturnThis();
      const mockCategoryEq = jest.fn().mockReturnThis();
      const mockCategorySelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      // Mock for report update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockReportUpdate,
        eq: mockReportEq,
        select: mockReportSelect,
      });

      // Mock for fetching report category
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { category: 'safety' }, error: null }),
      });

      // Mock for category update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockCategoryUpdate,
        eq: mockCategoryEq,
        select: mockCategorySelect,
      });

      // Mock for fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 2,
              description: 'Updated hazard',
              category: 'safety',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: { hazardtype: 'Broken Sidewalk' },
            error: null,
          }),
        });

      const updateData = { description: 'Updated hazard' };
      const categoryData = { hazardtype: 'Broken Sidewalk' };

      const result = await updateReport(2, updateData, categoryData);

      expect(result.success).toBe(true);
      expect(mockCategoryUpdate).toHaveBeenCalledWith(categoryData);
      expect(supabase.from).toHaveBeenCalledWith('hazards');
    });

    it('should update a report with category-specific data (lost item)', async () => {
      const mockReportUpdate = jest.fn().mockReturnThis();
      const mockReportEq = jest.fn().mockReturnThis();
      const mockReportSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });
      const mockCategoryUpdate = jest.fn().mockReturnThis();
      const mockCategoryEq = jest.fn().mockReturnThis();
      const mockCategorySelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      // Mock for report update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockReportUpdate,
        eq: mockReportEq,
        select: mockReportSelect,
      });

      // Mock for fetching report category
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { category: 'lost' }, error: null }),
      });

      // Mock for category update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockCategoryUpdate,
        eq: mockCategoryEq,
        select: mockCategorySelect,
      });

      // Mock for fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 3,
              description: 'Updated lost item',
              category: 'lost',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              itemtype: 'Keys',
              contactinfo: 'email@example.com',
            },
            error: null,
          }),
        });

      const updateData = { description: 'Updated lost item' };
      const categoryData = {
        itemtype: 'Keys',
        contactinfo: 'email@example.com',
      };

      const result = await updateReport(3, updateData, categoryData);

      expect(result.success).toBe(true);
      expect(mockCategoryUpdate).toHaveBeenCalledWith(categoryData);
      expect(supabase.from).toHaveBeenCalledWith('lostitems');
    });

    it('should update a report with category-specific data (found item)', async () => {
      const mockReportUpdate = jest.fn().mockReturnThis();
      const mockReportEq = jest.fn().mockReturnThis();
      const mockReportSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });
      const mockCategoryUpdate = jest.fn().mockReturnThis();
      const mockCategoryEq = jest.fn().mockReturnThis();
      const mockCategorySelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      // Mock for report update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockReportUpdate,
        eq: mockReportEq,
        select: mockReportSelect,
      });

      // Mock for fetching report category
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { category: 'found' }, error: null }),
      });

      // Mock for category update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockCategoryUpdate,
        eq: mockCategoryEq,
        select: mockCategorySelect,
      });

      // Mock for fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 4,
              description: 'Updated found item',
              category: 'found',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              itemtype: 'Wallet',
              contactinfo: 'phone@123456789',
            },
            error: null,
          }),
        });

      const updateData = { description: 'Updated found item' };
      const categoryData = {
        itemtype: 'Wallet',
        contactinfo: 'phone@123456789',
      };

      const result = await updateReport(4, updateData, categoryData);

      expect(result.success).toBe(true);
      expect(mockCategoryUpdate).toHaveBeenCalledWith(categoryData);
      expect(supabase.from).toHaveBeenCalledWith('founditems');
    });

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed');

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await updateReport(1, { description: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });

    it('should handle category update errors', async () => {
      const mockCategoryError = new Error('Category update failed');

      // Mock for report update (succeeds)
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null }),
      });

      // Mock for fetching report category
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: { category: 'event' }, error: null }),
      });

      // Mock for category update (fails)
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ error: mockCategoryError }),
      });

      const result = await updateReport(
        1,
        { description: 'Test' },
        { eventtype: 'Test', time: '2024-01-01T00:00:00.000Z' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockCategoryError);
    });

    it('should handle updating a non-existent report', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null }),
      });

      // Mock fetchReportById to return not found
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      const result = await updateReport(999999, { description: 'Test' });

      expect(result.success).toBe(false);
    });

    it('should only update common fields when categoryData is not provided', async () => {
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockResolvedValue({ data: [{}], error: null });

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
      });

      // Mock fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              reportid: 1,
              description: 'Updated',
              category: 'event',
            },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const result = await updateReport(1, { description: 'Updated' });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({ description: 'Updated' });
      // Should only call update once (not update category tables)
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('should handle updating report without fetching category if report not found', async () => {
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: [{}], error: null }),
      });

      // Mock fetching report category - returns null
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Mock fetchReportById
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { reportid: 1, category: 'event' },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Test' }, error: null }),
        });

      const result = await updateReport(
        1,
        { description: 'Test' },
        { eventtype: 'New', time: '2024-01-01T00:00:00.000Z' }
      );

      expect(result.success).toBe(true);
    });
  });

  describe('deleteReport', () => {
    it('should delete a report successfully', async () => {
      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('reports');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('reportid', 1);
    });

    it('should handle delete errors', async () => {
      const mockError = new Error('Delete failed');

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError);
    });

    it('should handle deleting a non-existent report', async () => {
      // Supabase doesn't return an error when deleting non-existent rows
      // It just returns success with no rows affected
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null, data: [] }),
      });

      const result = await deleteReport(999999);

      expect(result.success).toBe(true);
    });

    it('should cascade delete category-specific data (event)', async () => {
      // This test verifies that when we delete a report,
      // the database CASCADE constraint deletes related event data
      const mockDelete = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(true);
      // Should only delete from reports table (cascade handles the rest)
      expect(supabase.from).toHaveBeenCalledWith('reports');
      expect(supabase.from).toHaveBeenCalledTimes(1);
    });

    it('should handle database connection errors during delete', async () => {
      const mockError = { code: 'CONNECTION_ERROR', message: 'Connection lost' };

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it('should handle permission errors (RLS policy violations)', async () => {
      const mockError = {
        code: '42501',
        message: 'new row violates row-level security policy',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const result = await deleteReport(1);

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('Integration: Update and Delete flows', () => {
    it('should successfully update then delete a report', async () => {
      // Update
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({ data: [{}], error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { reportid: 1, description: 'Updated', category: 'event' },
            error: null,
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest
            .fn()
            .mockResolvedValue({ data: { eventtype: 'Meeting' }, error: null }),
        });

      const updateResult = await updateReport(1, { description: 'Updated' });
      expect(updateResult.success).toBe(true);

      // Delete
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const deleteResult = await deleteReport(1);
      expect(deleteResult.success).toBe(true);
    });

    it('should handle update failure before delete', async () => {
      const mockError = new Error('Update failed');

      // Failed update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ error: mockError }),
      });

      const updateResult = await updateReport(1, { description: 'Test' });
      expect(updateResult.success).toBe(false);

      // Should still be able to delete even if update failed
      (supabase.from as jest.Mock).mockReturnValueOnce({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      });

      const deleteResult = await deleteReport(1);
      expect(deleteResult.success).toBe(true);
    });
  });
});
