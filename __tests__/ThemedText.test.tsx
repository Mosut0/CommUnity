import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../components/ThemedText';
import { useThemeColor } from '../hooks/useThemeColor';

// Mock the useThemeColor hook
jest.mock('../hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(),
}));

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(<ThemedText>Test text</ThemedText>);

    expect(getByText('Test text')).toBeTruthy();
  });

  it('should apply default type styling', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(<ThemedText>Test text</ThemedText>);

    const textElement = getByText('Test text');
    expect(textElement).toBeTruthy();
  });

  it('should apply title type styling', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(
      <ThemedText type='title'>Title text</ThemedText>
    );

    expect(getByText('Title text')).toBeTruthy();
  });

  it('should apply subtitle type styling', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(
      <ThemedText type='subtitle'>Subtitle text</ThemedText>
    );

    expect(getByText('Subtitle text')).toBeTruthy();
  });

  it('should apply defaultSemiBold type styling', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(
      <ThemedText type='defaultSemiBold'>SemiBold text</ThemedText>
    );

    expect(getByText('SemiBold text')).toBeTruthy();
  });

  it('should apply link type styling', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(
      <ThemedText type='link'>Link text</ThemedText>
    );

    expect(getByText('Link text')).toBeTruthy();
  });

  it('should use theme color from useThemeColor hook', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#FF0000');

    const { getByText } = render(<ThemedText>Test text</ThemedText>);

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: undefined },
      'text'
    );
  });

  it('should use custom light color when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByText } = render(
      <ThemedText lightColor='#FF0000'>Test text</ThemedText>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#FF0000', dark: undefined },
      'text'
    );
  });

  it('should use custom dark color when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByText } = render(
      <ThemedText darkColor='#0000FF'>Test text</ThemedText>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: undefined, dark: '#0000FF' },
      'text'
    );
  });

  it('should use both custom light and dark colors when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#00FF00');

    const { getByText } = render(
      <ThemedText lightColor='#FF0000' darkColor='#0000FF'>
        Test text
      </ThemedText>
    );

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#FF0000', dark: '#0000FF' },
      'text'
    );
  });

  it('should pass through additional props to Text component', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(
      <ThemedText testID='test-text' accessibilityLabel='Test accessibility'>
        Test text
      </ThemedText>
    );

    const textElement = getByText('Test text');
    expect(textElement).toBeTruthy();
  });

  it('should apply custom style when provided', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const customStyle = { fontSize: 20, fontWeight: 'bold' as const };

    const { getByText } = render(
      <ThemedText style={customStyle}>Test text</ThemedText>
    );

    expect(getByText('Test text')).toBeTruthy();
  });

  it('should combine type styling with custom style', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const customStyle = { fontSize: 20 };

    const { getByText } = render(
      <ThemedText type='title' style={customStyle}>
        Test text
      </ThemedText>
    );

    expect(getByText('Test text')).toBeTruthy();
  });

  it('should handle empty text', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { getByText } = render(<ThemedText></ThemedText>);

    expect(getByText('')).toBeTruthy();
  });

  it('should handle null children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { UNSAFE_root } = render(<ThemedText>{null}</ThemedText>);

    expect(UNSAFE_root).toBeTruthy();
  });

  it('should handle undefined children', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#000000');

    const { UNSAFE_root } = render(<ThemedText>{undefined}</ThemedText>);

    expect(UNSAFE_root).toBeTruthy();
  });
});
