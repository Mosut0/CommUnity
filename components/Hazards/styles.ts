import { StyleSheet } from 'react-native';

/* ---------- Theme tokens ---------- */
type UiTheme = {
  chipBg: string;
  cardBg: string;
  pageBg: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  primaryBtnBg: string;
  primaryBtnText: string;
  inputBg: string;
};

const darkTheme: UiTheme = {
  chipBg: "#1F2937",
  cardBg: "#0F172A",
  pageBg: "#0B1220",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  divider: "#1F2A37",
  primaryBtnBg: "#2563EB",
  primaryBtnText: "#FFFFFF",
  inputBg: "#1F2937",
};

const lightTheme: UiTheme = {
  chipBg: "#F1F5F9",
  cardBg: "#FFFFFF",
  pageBg: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  divider: "#E5E7EB",
  primaryBtnBg: "#2563EB",
  primaryBtnText: "#FFFFFF",
  inputBg: "#FFFFFF",
};

export const makeFormStyles = (theme: UiTheme) =>
  StyleSheet.create({
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
      fontWeight: "600",
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

export const getTheme = (colorScheme: 'light' | 'dark') => 
  colorScheme === 'dark' ? darkTheme : lightTheme;

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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
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
    padding: 4
  },
  placeholder: {
    width: 24
  },
  scrollView: {
    width: '100%'
  },
  scrollContent: {
    padding: 20
  },
  optionsContainer: {
    gap: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20
  },
  optionButton: {
    width: '100%',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 20,
  },
});