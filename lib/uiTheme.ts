// Shared UI theme tokens extracted from forums page for reuse in auth screens
export type UiTheme = {
  chipBg: string;
  cardBg: string;
  pageBg: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  overlay: string;
  primaryBtnBg: string;
  primaryBtnText: string;
};

export const darkTheme: UiTheme = {
  chipBg: '#1F2937',
  cardBg: '#0F172A',
  pageBg: '#0B1220',
  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  divider: '#1F2A37',
  overlay: 'rgba(0,0,0,0.6)',
  primaryBtnBg: '#2563EB',
  primaryBtnText: '#FFFFFF',
};

export const lightTheme: UiTheme = {
  chipBg: '#F1F5F9',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  divider: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.25)',
  primaryBtnBg: '#2563EB',
  primaryBtnText: '#FFFFFF',
};

export function resolveTheme(colorScheme: 'light' | 'dark' | null | undefined) {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
