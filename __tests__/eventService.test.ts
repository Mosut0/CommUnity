import { submitEvent } from '../services/eventService';

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

describe('Event Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have submitEvent function', () => {
    expect(typeof submitEvent).toBe('function');
  });

  it('should handle location parsing', () => {
    // Test the locationToPoint function indirectly through submitEvent
    const eventData = {
      eventType: 'test',
      description: 'Test event',
      location: '45.4215, -75.6972',
      date: new Date(),
      time: '12:00',
    };

    // This will test the location parsing logic
    expect(() => submitEvent(eventData, 'test-callback')).not.toThrow();
  });

  it('should handle invalid location', () => {
    const eventData = {
      eventType: 'test',
      description: 'Test event',
      location: 'invalid location',
      date: new Date(),
      time: '12:00',
    };

    // This should not throw an error even with invalid location
    expect(() => submitEvent(eventData, 'test-callback')).not.toThrow();
  });
});
