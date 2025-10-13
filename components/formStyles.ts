import { StyleSheet } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { Colors, CommonColors } from '@/constants/Colors';
import type { ThemeName } from '@/constants/Colors';

type ThemeColors = typeof Colors.light;

type BaseFormStyles = {
  container: ViewStyle;
  scrollContent: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  textArea: TextStyle;
  locationDisplay: ViewStyle;
  locationText: TextStyle;
  submitButton: ViewStyle;
  submitButtonText: TextStyle;
  disabledButton: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
};

type StylesRecord = Record<string, ViewStyle | TextStyle | ImageStyle>;

const baseFormStyles = (theme: ThemeColors): BaseFormStyles => ({
  container: {
    flex: 1,
    backgroundColor: theme.pageBg,
    padding: 16,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 32,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: theme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.divider,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.textPrimary,
    minHeight: 50,
  },
  textArea: {
    backgroundColor: theme.inputBg,
    borderWidth: 1,
    borderColor: theme.divider,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: theme.textPrimary,
    height: 100,
    textAlignVertical: 'top',
  },
  locationDisplay: {
    backgroundColor: theme.chipBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.divider,
  },
  locationText: {
    color: theme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: theme.primaryBtnBg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: theme.primaryBtnText,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.pageBg,
    gap: 16,
  },
  loadingText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
});

export const makeFormStyles = <T extends StylesRecord = {}>(
  theme: ThemeColors,
  overrides?: T,
) =>
  StyleSheet.create({
    ...baseFormStyles(theme),
    ...(overrides ?? {}),
  } as BaseFormStyles & T);

export const getTheme = (colorScheme: ThemeName): ThemeColors =>
  Colors[colorScheme];

export const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 105,
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 0,
    shadowColor: CommonColors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: -5,
    marginTop: -15,
    marginLeft: -25,
  },
  closeButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  optionsContainer: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 20,
  },
});

export type { ThemeColors, BaseFormStyles };
