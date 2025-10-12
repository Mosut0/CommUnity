import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WelcomeScreen from '../app/welcome';
import { useRouter } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('WelcomeScreen', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock push function
    mockPush = jest.fn();
    
    // Mock the useRouter hook to return our mock functions
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    // Check if the main title is rendered
    expect(getByText('CommUnity')).toBeTruthy();
    
    // Check if the tagline is rendered
    expect(getByText('Connect. Share. Stay Informed.')).toBeTruthy();
    
    // Check if both buttons are rendered
    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('I Already Have an Account')).toBeTruthy();
  });

  it('navigates to sign-up page when "Get Started" button is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    // Find and press the "Get Started" button
    const getStartedButton = getByText('Get Started');
    fireEvent.press(getStartedButton);
    
    // Verify that router.push was called with the correct route
    expect(mockPush).toHaveBeenCalledWith('/sign-up');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('navigates to sign-in page when "I Already Have an Account" button is pressed', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    // Find and press the "I Already Have an Account" button
    const signInButton = getByText('I Already Have an Account');
    fireEvent.press(signInButton);
    
    // Verify that router.push was called with the correct route
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('renders feature icons and text', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    // Check if all feature texts are rendered
    expect(getByText('Interactive Maps')).toBeTruthy();
    expect(getByText('Real-time Updates')).toBeTruthy();
    expect(getByText('Safety Reports')).toBeTruthy();
  });

  it('renders the app description', () => {
    const { getByText } = render(<WelcomeScreen />);
    
    // Check if the description is rendered
    const description = getByText(/Join your local community to report events/i);
    expect(description).toBeTruthy();
  });
});
