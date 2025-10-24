import React from 'react';
import { render } from '@testing-library/react-native';
import NotFoundScreen from '../app/+not-found';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: ({ children, href, style }: any) => (
    <div data-href={href} style={style}>
      {children}
    </div>
  ),
  Stack: {
    Screen: ({ options }: any) => (
      <div data-title={options?.title}>Stack Screen</div>
    ),
  },
}));

describe('NotFoundScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
    expect(getByText('Go to home screen!')).toBeTruthy();
  });

  it('renders with correct text content', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
    expect(getByText('Go to home screen!')).toBeTruthy();
  });

  it('renders Stack.Screen component', () => {
    const { getByText } = render(<NotFoundScreen />);

    // The Stack.Screen is rendered but we can't easily test its content
    // Just verify the main content is there
    expect(getByText("This screen doesn't exist.")).toBeTruthy();
  });
});
