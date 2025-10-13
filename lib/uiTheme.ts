import { Colors } from '@/constants/Colors';

// Shared UI theme tokens sourced from the centralized Colors map
export type UiTheme = typeof Colors.light;

export const lightTheme: UiTheme = Colors.light;
export const darkTheme: UiTheme = Colors.dark;

export function resolveTheme(
  colorScheme: 'light' | 'dark' | null | undefined
): UiTheme {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
