import { submitLostItem, submitFoundItem } from '../services/lostAndFoundService';
import { createClient } from '../__mocks__/@supabase/supabase-js';

jest.mock('@supabase/supabase-js');

const supabaseMock = createClient();

describe('submitLostItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully report a lost item', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
    });

    const lostItemData = {
      itemName: 'Backpack',
      description: 'Black backpack with a laptop inside',
      location: 'Library, Floor 2',
      date: new Date(),
      contactInfo: 'contact@example.com',
    };

    const result = await submitLostItem(lostItemData, 'user789');

    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith('reports');
  });

  it('should handle lost item insert error', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Lost item insert failed') }),
    });

    const lostItemData = {
      itemName: 'Backpack',
      description: 'Black backpack with a laptop inside',
      location: 'Library, Floor 2',
      date: new Date(),
      contactInfo: 'contact@example.com',
    };

    const result = await submitLostItem(lostItemData, 'user789');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('submitFoundItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully report a found item', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
      select: jest.fn().mockResolvedValue({ data: [{ reportid: 1 }], error: null }),
    });

    const foundItemData = {
      itemName: 'Wallet',
      description: 'Brown leather wallet',
      location: 'Cafeteria',
      contactInfo: 'contact@example.com',
    };

    const result = await submitFoundItem(foundItemData, 'user999');

    expect(result.success).toBe(true);
    expect(supabaseMock.from).toHaveBeenCalledWith('reports');
  });

  it('should handle found item insert error', async () => {
    supabaseMock.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Found item insert failed') }),
    });

    const foundItemData = {
      itemName: 'Wallet',
      description: 'Brown leather wallet',
      location: 'Cafeteria',
      contactInfo: 'contact@example.com',
    };

    const result = await submitFoundItem(foundItemData, 'user999');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
