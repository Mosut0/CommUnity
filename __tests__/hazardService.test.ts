import { submitHazard } from '../services/hazardService';

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

describe('Hazard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have submitHazard function', () => {
    expect(typeof submitHazard).toBe('function');
  });

  it('should handle location parsing', () => {
    const hazardData = {
      hazardType: 'test',
      description: 'Test hazard',
      location: '45.4215, -75.6972',
      imageUri: undefined,
    };

    expect(() => submitHazard(hazardData)).not.toThrow();
  });

  it('should handle invalid location', () => {
    const hazardData = {
      hazardType: 'test',
      description: 'Test hazard',
      location: 'invalid location',
      imageUri: undefined,
    };

    expect(() => submitHazard(hazardData)).not.toThrow();
  });
});
