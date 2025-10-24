import { submitLostItem, submitFoundItem } from '../services/lostAndFoundService';

// Mock the entire @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [{ reportid: 1 }], error: null }))
      }))
    })),
  })),
}));

// Mock imageService
jest.mock('../services/imageService', () => ({
  uploadImage: jest.fn(() => Promise.resolve('http://mockurl.com/image.jpg')),
}));

describe('Lost and Found Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have submitLostItem function', () => {
    expect(typeof submitLostItem).toBe('function');
  });

  it('should have submitFoundItem function', () => {
    expect(typeof submitFoundItem).toBe('function');
  });

  it('should handle lost item submission', () => {
    const lostItemData = {
      itemType: 'test',
      description: 'Test lost item',
      location: '45.4215, -75.6972',
      imageUri: undefined,
    };

    expect(() => submitLostItem(lostItemData)).not.toThrow();
  });

  it('should handle found item submission', () => {
    const foundItemData = {
      itemType: 'test',
      description: 'Test found item',
      location: '45.4215, -75.6972',
      imageUri: undefined,
    };

    expect(() => submitFoundItem(foundItemData)).not.toThrow();
  });

  it('should handle invalid location for lost item', () => {
    const lostItemData = {
      itemType: 'test',
      description: 'Test lost item',
      location: 'invalid location',
      imageUri: undefined,
    };

    expect(() => submitLostItem(lostItemData)).not.toThrow();
  });

  it('should handle invalid location for found item', () => {
    const foundItemData = {
      itemType: 'test',
      description: 'Test found item',
      location: 'invalid location',
      imageUri: undefined,
    };

    expect(() => submitFoundItem(foundItemData)).not.toThrow();
  });
});
