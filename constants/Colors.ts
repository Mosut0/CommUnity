/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

const accentColor = '#2563EB';
const dangerColor = '#DC2626';
const accentAltColor = '#0A7EA4';
const filterActiveBg = 'rgba(10, 126, 164, 0.08)';
const filterInactiveIconLight = '#888888';
const filterInactiveIconDark = '#9CA3AF';
const fabIconLight = '#000000ff';
const fabIconDark = '#ffffff';
const fabBackgroundLight = '#FAF9F6';
const fabBackgroundDark = '#0B1220';
const profileBorderLight = '#E2E8F0';
const profileBorderDark = '#374151';
const sliderTrackInactiveLight = '#CBD5E1';
const sliderTrackInactiveDark = '#374151';
const primaryBtnTextLight = '#FAF9F6';
const primaryBtnTextDark = '#FFFFFF';
const headerBgLight = '#FAF9F6';
const headerBgDark = '#111827';
const errorTextLight = '#B91C1C';
const errorTextDark = '#FCA5A5';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FAF9F6',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    pageBg: '#F5F3EE',
    cardBg: '#FAF9F6',
    surface: '#F0EDE5',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    divider: '#E5E2DB',
    overlay: 'rgba(0,0,0,0.25)',
    chipBg: '#F0EDE5',
    inputBg: '#FAF9F6',
    accent: accentColor,
    accentAlt: accentAltColor,
    danger: dangerColor,
    fabBackground: fabBackgroundLight,
    fabIcon: fabIconLight,
    fabIconInverse: fabIconDark,
    filterIconInactive: filterInactiveIconLight,
    filterButtonActiveBg: filterActiveBg,
    profileBorder: profileBorderLight,
    sliderTrackInactive: sliderTrackInactiveLight,
    primaryBtnBg: accentColor,
    primaryBtnText: primaryBtnTextLight,
    headerBg: headerBgLight,
    errorText: errorTextLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#0B1220',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    pageBg: '#0B1220',
    cardBg: '#0F172A',
    surface: '#1F2937',
    textPrimary: '#E5E7EB',
    textSecondary: '#9CA3AF',
    divider: '#1F2A37',
    overlay: 'rgba(0,0,0,0.55)',
    chipBg: '#1F2937',
    inputBg: '#1F2937',
    accent: accentColor,
    accentAlt: accentAltColor,
    danger: dangerColor,
    fabBackground: fabBackgroundDark,
    fabIcon: fabIconDark,
    fabIconInverse: fabIconLight,
    filterIconInactive: filterInactiveIconDark,
    filterButtonActiveBg: filterActiveBg,
    profileBorder: profileBorderDark,
    sliderTrackInactive: sliderTrackInactiveDark,
    primaryBtnBg: accentColor,
    primaryBtnText: primaryBtnTextDark,
    headerBg: headerBgDark,
    errorText: errorTextDark,
  },
};

export type ThemeName = keyof typeof Colors;

export const CommonColors = {
  white: '#FFFFFF',
  black: '#000000ff',
  shadow: '#000000',
};
