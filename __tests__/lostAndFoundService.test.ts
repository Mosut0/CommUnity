import {
  submitLostItem,
  submitFoundItem,
} from '../services/lostAndFoundService';

// Mock the entire @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({ data: [{ reportid: 1 }], error: null })
        ),
      })),
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
      itemName: 'Test Item',
      description: 'Test lost item',
      location: '45.4215, -75.6972',
      date: new Date(),
      contactInfo: 'test@example.com',
      imageUri: undefined,
    };

    expect(() => submitLostItem(lostItemData, 'test-callback')).not.toThrow();
  });

  it('should handle found item submission', () => {
    const foundItemData = {
      itemName: 'Test Item',
      description: 'Test found item',
      location: '45.4215, -75.6972',
      contactInfo: 'test@example.com',
      imageUri: undefined,
    };

    expect(() => submitFoundItem(foundItemData, 'test-callback')).not.toThrow();
  });

  it('should handle invalid location for lost item', () => {
    const lostItemData = {
      itemName: 'Test Item',
      description: 'Test lost item',
      location: 'invalid location',
      date: new Date(),
      contactInfo: 'test@example.com',
      imageUri: undefined,
    };

    expect(() => submitLostItem(lostItemData, 'test-callback')).not.toThrow();
  });

  it('should handle invalid location for found item', () => {
    const foundItemData = {
      itemName: 'Test Item',
      description: 'Test found item',
      location: 'invalid location',
      contactInfo: 'test@example.com',
      imageUri: undefined,
    };

    expect(() => submitFoundItem(foundItemData, 'test-callback')).not.toThrow();
  });
});
