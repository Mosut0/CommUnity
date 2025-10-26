import { lightTheme, darkTheme, resolveTheme, UiTheme } from '../lib/uiTheme';
import { Colors } from '../constants/Colors';

describe('UI Theme', () => {
  it('should export light theme', () => {
    expect(lightTheme).toBeDefined();
    expect(lightTheme).toBe(Colors.light);
  });

  it('should export dark theme', () => {
    expect(darkTheme).toBeDefined();
    expect(darkTheme).toBe(Colors.dark);
  });

  it('should resolve light theme for light color scheme', () => {
    const theme = resolveTheme('light');
    expect(theme).toBe(lightTheme);
  });

  it('should resolve dark theme for dark color scheme', () => {
    const theme = resolveTheme('dark');
    expect(theme).toBe(darkTheme);
  });

  it('should resolve light theme for null color scheme', () => {
    const theme = resolveTheme(null);
    expect(theme).toBe(lightTheme);
  });

  it('should resolve light theme for undefined color scheme', () => {
    const theme = resolveTheme(undefined);
    expect(theme).toBe(lightTheme);
  });

  it('should have correct type structure', () => {
    const theme: UiTheme = lightTheme;
    expect(theme).toBeDefined();
    expect(typeof theme).toBe('object');
  });
});
