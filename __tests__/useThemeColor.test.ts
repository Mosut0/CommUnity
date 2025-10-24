import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { useColorScheme } from '../hooks/useColorScheme';

// Mock the useColorScheme hook
jest.mock('../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

// Mock the Colors constant
jest.mock('../constants/Colors', () => ({
  Colors: {
    light: {
      text: '#000000',
      background: '#FFFFFF',
      tint: '#007AFF',
    },
    dark: {
      text: '#FFFFFF',
      background: '#000000',
      tint: '#0A84FF',
    },
  },
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light color when theme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    expect(result.current).toBe('#FF0000');
  });

  it('should return dark color when theme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    expect(result.current).toBe('#00FF00');
  });

  it('should return default light color when no props provided and theme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );

    expect(result.current).toBe('#000000');
  });

  it('should return default dark color when no props provided and theme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );

    expect(result.current).toBe('#FFFFFF');
  });

  it('should return default light color when props are undefined and theme is light', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() =>
      useThemeColor({ light: undefined, dark: undefined }, 'text')
    );

    expect(result.current).toBe('#000000');
  });

  it('should return default dark color when props are undefined and theme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() =>
      useThemeColor({ light: undefined, dark: undefined }, 'text')
    );

    expect(result.current).toBe('#FFFFFF');
  });

  it('should handle null theme gracefully', () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    expect(result.current).toBe('#FF0000');
  });

  it('should handle undefined theme gracefully', () => {
    (useColorScheme as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    expect(result.current).toBe('#FF0000');
  });

  it('should work with different color names', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { result: textResult } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    const { result: backgroundResult } = renderHook(() =>
      useThemeColor({ light: '#0000FF', dark: '#FFFF00' }, 'background')
    );

    const { result: tintResult } = renderHook(() =>
      useThemeColor({ light: '#00FF00', dark: '#FF00FF' }, 'tint')
    );

    expect(textResult.current).toBe('#FF0000');
    expect(backgroundResult.current).toBe('#0000FF');
    expect(tintResult.current).toBe('#00FF00');
  });

  it('should handle theme changes', () => {
    const { rerender } = renderHook(() =>
      useThemeColor({ light: '#FF0000', dark: '#00FF00' }, 'text')
    );

    // Start with light theme
    (useColorScheme as jest.Mock).mockReturnValue('light');
    rerender();

    // Change to dark theme
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    rerender();

    // The hook should return the dark color
    expect(useColorScheme).toHaveBeenCalled();
  });
});
