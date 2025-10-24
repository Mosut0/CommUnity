import { makeFormStyles, getTheme, modalStyles } from '../components/formStyles';
import { Colors } from '../constants/Colors';

describe('Form Styles', () => {
  describe('makeFormStyles', () => {
    it('should create form styles with light theme', () => {
      const lightTheme = Colors.light;
      const styles = makeFormStyles(lightTheme);
      
      expect(styles.container).toBeDefined();
      expect(styles.input).toBeDefined();
      expect(styles.submitButton).toBeDefined();
      expect(styles.container.backgroundColor).toBe(lightTheme.pageBg);
    });

    it('should create form styles with dark theme', () => {
      const darkTheme = Colors.dark;
      const styles = makeFormStyles(darkTheme);
      
      expect(styles.container).toBeDefined();
      expect(styles.input).toBeDefined();
      expect(styles.submitButton).toBeDefined();
      expect(styles.container.backgroundColor).toBe(darkTheme.pageBg);
    });

    it('should apply custom overrides', () => {
      const lightTheme = Colors.light;
      const customStyles = {
        customButton: {
          backgroundColor: 'red',
          padding: 10,
        },
      };
      
      const styles = makeFormStyles(lightTheme, customStyles);
      
      expect(styles.container).toBeDefined();
      expect(styles.customButton).toBeDefined();
      expect(styles.customButton.backgroundColor).toBe('red');
    });

    it('should have all required base form styles', () => {
      const lightTheme = Colors.light;
      const styles = makeFormStyles(lightTheme);
      
      expect(styles.container).toBeDefined();
      expect(styles.scrollContent).toBeDefined();
      expect(styles.inputGroup).toBeDefined();
      expect(styles.label).toBeDefined();
      expect(styles.input).toBeDefined();
      expect(styles.textArea).toBeDefined();
      expect(styles.locationDisplay).toBeDefined();
      expect(styles.locationText).toBeDefined();
      expect(styles.submitButton).toBeDefined();
      expect(styles.submitButtonText).toBeDefined();
      expect(styles.disabledButton).toBeDefined();
      expect(styles.loadingContainer).toBeDefined();
      expect(styles.loadingText).toBeDefined();
    });
  });

  describe('getTheme', () => {
    it('should return light theme for light color scheme', () => {
      const theme = getTheme('light');
      expect(theme).toBe(Colors.light);
    });

    it('should return dark theme for dark color scheme', () => {
      const theme = getTheme('dark');
      expect(theme).toBe(Colors.dark);
    });
  });

  describe('modalStyles', () => {
    it('should have all required modal styles', () => {
      expect(modalStyles.centeredView).toBeDefined();
      expect(modalStyles.modalView).toBeDefined();
      expect(modalStyles.header).toBeDefined();
      expect(modalStyles.closeButton).toBeDefined();
      expect(modalStyles.placeholder).toBeDefined();
      expect(modalStyles.scrollView).toBeDefined();
      expect(modalStyles.scrollContent).toBeDefined();
      expect(modalStyles.optionsContainer).toBeDefined();
      expect(modalStyles.optionButton).toBeDefined();
      expect(modalStyles.optionButtonText).toBeDefined();
      expect(modalStyles.headerTitle).toBeDefined();
    });

    it('should have correct modal view properties', () => {
      expect(modalStyles.modalView.width).toBe('90%');
      expect(modalStyles.modalView.maxHeight).toBe('80%');
      expect(modalStyles.modalView.borderRadius).toBe(20);
    });

    it('should have correct centered view properties', () => {
      expect(modalStyles.centeredView.flex).toBe(1);
      expect(modalStyles.centeredView.justifyContent).toBe('flex-end');
      expect(modalStyles.centeredView.alignItems).toBe('center');
    });
  });
});
