import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../hooks/useColorScheme.web';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Mock react-native
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme.web', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the actual color scheme from react-native', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe('dark');
    expect(useRNColorScheme).toHaveBeenCalled();
  });

  it('should handle light theme', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('light');
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe('light');
  });

  it('should handle dark theme', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe('dark');
  });

  it('should handle null color scheme', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(null);
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe(null);
  });

  it('should handle undefined color scheme', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(undefined);
    
    const { result } = renderHook(() => useColorScheme());
    
    expect(result.current).toBe(undefined);
  });
});
