import {
  reportPin,
  getPinReportCount,
  hasUserReportedPin,
  getUserReports,
  addStrikeToUser,
  shadowbanUser,
  unshadowbanUser,
  isUserShadowbanned,
  getUserStrikeCount,
  getUserModerationStatus,
  getShadowbannedUserIds,
} from '@/services/pinReportService';
import { supabase } from '@/lib/supabase';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    rpc: jest.fn(),
    sql: jest.fn((strings, ...values) => ({ strings, values })),
  },
}));

describe('pinReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reportPin', () => {
    it('should successfully report a pin', async () => {
      const mockReport = {
        report_id: 1,
        pin_id: 100,
        reporter_user_id: 'user123',
        reason: 'Inappropriate content',
        created_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockReport, error: null }),
      });

      const result = await reportPin(100, 'user123', 'Inappropriate content');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReport);
      expect(supabase.from).toHaveBeenCalledWith('pin_reports');
    });

    it('should handle duplicate report error (23505)', async () => {
      const duplicateError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: duplicateError }),
      });

      const result = await reportPin(100, 'user123', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You have already reported this pin');
    });

    it('should handle other database errors', async () => {
      const dbError = {
        code: '42501',
        message: 'Permission denied',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: dbError }),
      });

      const result = await reportPin(100, 'user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should report a pin without a reason', async () => {
      const mockReport = {
        report_id: 2,
        pin_id: 101,
        reporter_user_id: 'user456',
        reason: null,
        created_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockReport, error: null }),
      });

      const result = await reportPin(101, 'user456');

      expect(result.success).toBe(true);
      expect(result.data?.reason).toBeNull();
    });
  });

  describe('getPinReportCount', () => {
    it('should return the correct report count', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
      });

      const count = await getPinReportCount(100);

      expect(count).toBe(5);
      expect(supabase.from).toHaveBeenCalledWith('pin_reports');
    });

    it('should return 0 on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: null, error: new Error('DB error') }),
      });

      const count = await getPinReportCount(100);

      expect(count).toBe(0);
    });

    it('should return 0 for a pin with no reports', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
      });

      const count = await getPinReportCount(999);

      expect(count).toBe(0);
    });
  });

  describe('hasUserReportedPin', () => {
    it('should return true if user has reported the pin', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: { report_id: 1 }, error: null }),
      });

      const result = await hasUserReportedPin(100, 'user123');

      expect(result).toBe(true);
    });

    it('should return false if user has not reported the pin', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await hasUserReportedPin(100, 'user123');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const result = await hasUserReportedPin(100, 'user123');

      expect(result).toBe(false);
    });
  });

  describe('getUserReports', () => {
    it('should return all reports by a user', async () => {
      const mockReports = [
        {
          report_id: 1,
          pin_id: 100,
          reporter_user_id: 'user123',
          reason: 'Spam',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          report_id: 2,
          pin_id: 101,
          reporter_user_id: 'user123',
          reason: 'Inappropriate',
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockReports, error: null }),
      });

      const reports = await getUserReports('user123');

      expect(reports).toEqual(mockReports);
      expect(reports.length).toBe(2);
    });

    it('should return empty array on error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const reports = await getUserReports('user123');

      expect(reports).toEqual([]);
    });

    it('should return empty array for user with no reports', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const reports = await getUserReports('newuser');

      expect(reports).toEqual([]);
    });
  });

  describe('addStrikeToUser', () => {
    it('should add a strike to a user', async () => {
      const mockModStatus = {
        id: 1,
        user_id: 'user123',
        strike_count: 3,
        is_shadowbanned: false,
        shadowban_reason: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock upsert
      (supabase.from as jest.Mock).mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Mock rpc call (will fail and fall back to manual update)
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: new Error('RPC not found'),
      });

      // Mock manual update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockModStatus, error: null }),
      });

      const result = await addStrikeToUser('user123');

      expect(result.success).toBe(true);
      expect(result.data?.strike_count).toBe(3);
    });

    it('should trigger shadowban at 5 strikes', async () => {
      const mockModStatusWith5Strikes = {
        id: 1,
        user_id: 'user123',
        strike_count: 5,
        is_shadowbanned: false,
        shadowban_reason: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockShadowbannedStatus = {
        ...mockModStatusWith5Strikes,
        is_shadowbanned: true,
        shadowban_reason: 'Automatic: 5 or more strikes',
      };

      // Mock upsert
      (supabase.from as jest.Mock).mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Mock rpc call (will fail and fall back to manual update)
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: new Error('RPC not found'),
      });

      // Mock manual update (add strike)
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockModStatusWith5Strikes, error: null }),
      });

      // Mock shadowban update
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShadowbannedStatus, error: null }),
      });

      const result = await addStrikeToUser('user123');

      expect(result.success).toBe(true);
    });

    it('should handle update errors', async () => {
      const dbError = new Error('Update failed');

      // Mock upsert
      (supabase.from as jest.Mock).mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      });

      // Mock rpc call (will fail and fall back to manual update)
      (supabase.rpc as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: new Error('RPC not found'),
      });

      // Mock manual update with error
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: dbError }),
      });

      const result = await addStrikeToUser('user123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('shadowbanUser', () => {
    it('should shadowban a user with a reason', async () => {
      const mockShadowbannedStatus = {
        id: 1,
        user_id: 'user123',
        strike_count: 5,
        is_shadowbanned: true,
        shadowban_reason: 'Manual shadowban for spam',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShadowbannedStatus, error: null }),
      });

      const result = await shadowbanUser('user123', 'Manual shadowban for spam');

      expect(result.success).toBe(true);
      expect(result.data?.is_shadowbanned).toBe(true);
      expect(result.data?.shadowban_reason).toBe('Manual shadowban for spam');
    });

    it('should shadowban a user with default reason', async () => {
      const mockShadowbannedStatus = {
        id: 1,
        user_id: 'user123',
        strike_count: 5,
        is_shadowbanned: true,
        shadowban_reason: 'Manual shadowban',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockShadowbannedStatus, error: null }),
      });

      const result = await shadowbanUser('user123');

      expect(result.success).toBe(true);
      expect(result.data?.shadowban_reason).toBe('Manual shadowban');
    });

    it('should handle shadowban errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
      });

      const result = await shadowbanUser('user123');

      expect(result.success).toBe(false);
    });
  });

  describe('unshadowbanUser', () => {
    it('should remove shadowban from a user', async () => {
      const mockUnshadowbannedStatus = {
        id: 1,
        user_id: 'user123',
        strike_count: 5,
        is_shadowbanned: false,
        shadowban_reason: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUnshadowbannedStatus, error: null }),
      });

      const result = await unshadowbanUser('user123');

      expect(result.success).toBe(true);
      expect(result.data?.is_shadowbanned).toBe(false);
      expect(result.data?.shadowban_reason).toBeNull();
    });

    it('should handle unshadowban errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
      });

      const result = await unshadowbanUser('user123');

      expect(result.success).toBe(false);
    });
  });

  describe('isUserShadowbanned', () => {
    it('should return true if user is shadowbanned', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { is_shadowbanned: true },
          error: null,
        }),
      });

      const result = await isUserShadowbanned('user123');

      expect(result).toBe(true);
    });

    it('should return false if user is not shadowbanned', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { is_shadowbanned: false },
          error: null,
        }),
      });

      const result = await isUserShadowbanned('user123');

      expect(result).toBe(false);
    });

    it('should return false if user has no moderation record', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await isUserShadowbanned('newuser');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const result = await isUserShadowbanned('user123');

      expect(result).toBe(false);
    });
  });

  describe('getUserStrikeCount', () => {
    it('should return the correct strike count', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { strike_count: 3 },
          error: null,
        }),
      });

      const count = await getUserStrikeCount('user123');

      expect(count).toBe(3);
    });

    it('should return 0 if user has no moderation record', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const count = await getUserStrikeCount('newuser');

      expect(count).toBe(0);
    });

    it('should return 0 on database error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const count = await getUserStrikeCount('user123');

      expect(count).toBe(0);
    });
  });

  describe('getUserModerationStatus', () => {
    it('should return existing moderation status', async () => {
      const mockStatus = {
        id: 1,
        user_id: 'user123',
        strike_count: 2,
        is_shadowbanned: false,
        shadowban_reason: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockStatus, error: null }),
      });

      const result = await getUserModerationStatus('user123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatus);
    });

    it('should create a new moderation record if none exists', async () => {
      const newStatus = {
        id: 1,
        user_id: 'newuser',
        strike_count: 0,
        is_shadowbanned: false,
        shadowban_reason: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // First call returns null
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Second call (insert) returns new record
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: newStatus, error: null }),
      });

      const result = await getUserModerationStatus('newuser');

      expect(result.success).toBe(true);
      expect(result.data?.strike_count).toBe(0);
      expect(result.data?.is_shadowbanned).toBe(false);
    });

    it('should handle query errors', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const result = await getUserModerationStatus('user123');

      expect(result.success).toBe(false);
    });

    it('should handle insert errors when creating new record', async () => {
      // First call returns null (no record)
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      // Second call (insert) fails
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
      });

      const result = await getUserModerationStatus('newuser');

      expect(result.success).toBe(false);
    });
  });

  describe('getShadowbannedUserIds', () => {
    it('should return array of shadowbanned user IDs', async () => {
      const mockData = [
        { user_id: 'user1' },
        { user_id: 'user2' },
        { user_id: 'user3' },
      ];

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await getShadowbannedUserIds();

      expect(result).toEqual(['user1', 'user2', 'user3']);
      expect(result.length).toBe(3);
    });

    it('should return empty array if no shadowbanned users', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await getShadowbannedUserIds();

      expect(result).toEqual([]);
    });

    it('should return empty array on database error', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      });

      const result = await getShadowbannedUserIds();

      expect(result).toEqual([]);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full reporting flow: report -> count -> check', async () => {
      // Report a pin
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { report_id: 1, pin_id: 100 },
          error: null,
        }),
      });

      const reportResult = await reportPin(100, 'user1', 'Spam');
      expect(reportResult.success).toBe(true);

      // Get count
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ count: 1, error: null }),
      });

      const count = await getPinReportCount(100);
      expect(count).toBe(1);

      // Check if user reported
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { report_id: 1 },
          error: null,
        }),
      });

      const hasReported = await hasUserReportedPin(100, 'user1');
      expect(hasReported).toBe(true);
    });

    it('should handle strike accumulation leading to shadowban', async () => {
      // Start with 4 strikes
      let strikeCount = 4;

      for (let i = 0; i < 2; i++) {
        strikeCount++;
        const shouldBeShadowbanned = strikeCount >= 5;

        // Mock upsert
        (supabase.from as jest.Mock).mockReturnValueOnce({
          upsert: jest.fn().mockResolvedValue({ error: null }),
        });

        // Mock rpc call (will fail and fall back to manual update)
        (supabase.rpc as jest.Mock).mockResolvedValueOnce({
          data: null,
          error: new Error('RPC not found'),
        });

        // Mock manual update (add strike)
        (supabase.from as jest.Mock).mockReturnValueOnce({
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              strike_count: strikeCount,
              is_shadowbanned: false,
            },
            error: null,
          }),
        });

        // If reaching 5 strikes, mock shadowban call
        if (shouldBeShadowbanned) {
          (supabase.from as jest.Mock).mockReturnValueOnce({
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                strike_count: strikeCount,
                is_shadowbanned: true,
              },
              error: null,
            }),
          });
        }

        await addStrikeToUser('spammer');
      }

      // Verify shadowbanned
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: { is_shadowbanned: true },
          error: null,
        }),
      });

      const isBanned = await isUserShadowbanned('spammer');
      expect(isBanned).toBe(true);
    });
  });
});

