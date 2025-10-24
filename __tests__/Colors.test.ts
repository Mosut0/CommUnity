import { Colors, ThemeName, CommonColors } from '../constants/Colors';

describe('Colors', () => {
  it('should have light and dark themes', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.dark).toBeDefined();
  });

  it('should have all required color properties for light theme', () => {
    const lightTheme = Colors.light;
    expect(lightTheme.text).toBeDefined();
    expect(lightTheme.background).toBeDefined();
    expect(lightTheme.tint).toBeDefined();
    expect(lightTheme.icon).toBeDefined();
    expect(lightTheme.tabIconDefault).toBeDefined();
    expect(lightTheme.tabIconSelected).toBeDefined();
    expect(lightTheme.pageBg).toBeDefined();
    expect(lightTheme.cardBg).toBeDefined();
    expect(lightTheme.surface).toBeDefined();
    expect(lightTheme.textPrimary).toBeDefined();
    expect(lightTheme.textSecondary).toBeDefined();
    expect(lightTheme.divider).toBeDefined();
    expect(lightTheme.overlay).toBeDefined();
    expect(lightTheme.chipBg).toBeDefined();
    expect(lightTheme.inputBg).toBeDefined();
    expect(lightTheme.accent).toBeDefined();
    expect(lightTheme.accentAlt).toBeDefined();
    expect(lightTheme.danger).toBeDefined();
    expect(lightTheme.fabBackground).toBeDefined();
    expect(lightTheme.fabIcon).toBeDefined();
    expect(lightTheme.fabIconInverse).toBeDefined();
    expect(lightTheme.filterIconInactive).toBeDefined();
    expect(lightTheme.filterButtonActiveBg).toBeDefined();
    expect(lightTheme.profileBorder).toBeDefined();
    expect(lightTheme.sliderTrackInactive).toBeDefined();
    expect(lightTheme.primaryBtnBg).toBeDefined();
    expect(lightTheme.primaryBtnText).toBeDefined();
    expect(lightTheme.headerBg).toBeDefined();
    expect(lightTheme.errorText).toBeDefined();
  });

  it('should have all required color properties for dark theme', () => {
    const darkTheme = Colors.dark;
    expect(darkTheme.text).toBeDefined();
    expect(darkTheme.background).toBeDefined();
    expect(darkTheme.tint).toBeDefined();
    expect(darkTheme.icon).toBeDefined();
    expect(darkTheme.tabIconDefault).toBeDefined();
    expect(darkTheme.tabIconSelected).toBeDefined();
    expect(darkTheme.pageBg).toBeDefined();
    expect(darkTheme.cardBg).toBeDefined();
    expect(darkTheme.surface).toBeDefined();
    expect(darkTheme.textPrimary).toBeDefined();
    expect(darkTheme.textSecondary).toBeDefined();
    expect(darkTheme.divider).toBeDefined();
    expect(darkTheme.overlay).toBeDefined();
    expect(darkTheme.chipBg).toBeDefined();
    expect(darkTheme.inputBg).toBeDefined();
    expect(darkTheme.accent).toBeDefined();
    expect(darkTheme.accentAlt).toBeDefined();
    expect(darkTheme.danger).toBeDefined();
    expect(darkTheme.fabBackground).toBeDefined();
    expect(darkTheme.fabIcon).toBeDefined();
    expect(darkTheme.fabIconInverse).toBeDefined();
    expect(darkTheme.filterIconInactive).toBeDefined();
    expect(darkTheme.filterButtonActiveBg).toBeDefined();
    expect(darkTheme.profileBorder).toBeDefined();
    expect(darkTheme.sliderTrackInactive).toBeDefined();
    expect(darkTheme.primaryBtnBg).toBeDefined();
    expect(darkTheme.primaryBtnText).toBeDefined();
    expect(darkTheme.headerBg).toBeDefined();
    expect(darkTheme.errorText).toBeDefined();
  });

  it('should have different colors for light and dark themes', () => {
    expect(Colors.light.text).not.toBe(Colors.dark.text);
    expect(Colors.light.background).not.toBe(Colors.dark.background);
    expect(Colors.light.tint).not.toBe(Colors.dark.tint);
  });

  it('should have correct theme name type', () => {
    const themeName: ThemeName = 'light';
    expect(themeName).toBe('light');

    const darkThemeName: ThemeName = 'dark';
    expect(darkThemeName).toBe('dark');
  });

  it('should have common colors', () => {
    expect(CommonColors.white).toBe('#FFFFFF');
    expect(CommonColors.black).toBe('#000000ff');
    expect(CommonColors.shadow).toBe('#000000');
  });

  it('should have valid hex color values', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{8}$/;

    expect(Colors.light.text).toMatch(hexColorRegex);
    expect(Colors.light.background).toMatch(hexColorRegex);
    expect(Colors.dark.text).toMatch(hexColorRegex);
    expect(Colors.dark.background).toMatch(hexColorRegex);
  });
});
