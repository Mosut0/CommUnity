import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../components/ThemedView';
import { useThemeColor } from '../hooks/useThemeColor';

// Mock the useThemeColor hook
jest.mock('../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(),
}));

describe('ThemedView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">Test content</ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should use theme color from useThemeColor hook', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FF0000');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">Test content</ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: undefined },
      'background'
    );
  });

  it('should use custom light color when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByTestId } = render(
      <ThemedView lightColor="#FF0000" testID="themed-view">Test content</ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#FF0000', dark: undefined },
      'background'
    );
  });

  it('should use custom dark color when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByTestId } = render(
      <ThemedView darkColor="#0000FF" testID="themed-view">Test content</ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: '#0000FF' },
      'background'
    );
  });

  it('should use both custom light and dark colors when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByTestId } = render(
      <ThemedView lightColor="#FF0000" darkColor="#0000FF" testID="themed-view">
        Test content
      </ThemedView>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#FF0000', dark: '#0000FF' },
      'background'
    );
  });

  it('should pass through additional props to View component', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView 
        testID="themed-view" 
        accessibilityLabel="Test accessibility"
        accessible={true}
      >
        Test content
      </ThemedView>
    );

    const viewElement = getByTestId('themed-view');
    expect(viewElement).toBeTruthy();
  });

  it('should apply custom style when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const customStyle = { padding: 20, margin: 10 };

    const { getByTestId } = render(
      <ThemedView style={customStyle} testID="themed-view">Test content</ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should render children correctly', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <ThemedView testID="nested-view">Nested content</ThemedView>
      </ThemedView>
    );

    expect(getByTestId('nested-view')).toBeTruthy();
  });

  it('should handle empty children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view"></ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should handle null children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">{null}</ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should handle undefined children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">{undefined}</ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should handle multiple children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        <ThemedView testID="child1">Child 1</ThemedView>
        <ThemedView testID="child2">Child 2</ThemedView>
      </ThemedView>
    );

    expect(getByTestId('child1')).toBeTruthy();
    expect(getByTestId('child2')).toBeTruthy();
  });

  it('should handle style array', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const style1 = { padding: 10 };
    const style2 = { margin: 5 };

    const { getByTestId } = render(
      <ThemedView style={[style1, style2]} testID="themed-view">Test content</ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });

  it('should handle conditional rendering', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FFFFFF');

    const showContent = true;

    const { getByTestId } = render(
      <ThemedView testID="themed-view">
        {showContent && <ThemedView testID="conditional">Conditional content</ThemedView>}
      </ThemedView>
    );

    expect(getByTestId('conditional')).toBeTruthy();
  });
});
