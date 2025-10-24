import { useColorScheme } from '../hooks/useColorScheme';

// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme', () => {
  it('should export useColorScheme from react-native', () => {
    expect(useColorScheme).toBeDefined();
    expect(typeof useColorScheme).toBe('function');
  });

  it('should be a function that can be called', () => {
    expect(() => useColorScheme()).not.toThrow();
  });
});
