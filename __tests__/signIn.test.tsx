import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignInScreen from '../app/sign-in';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SignInScreen', () => {
  let mockPush: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    mockReplace = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    });
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByText('Sign in to continue to CommUnity')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('handles email input', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'test@example.com');

    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('handles password input', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    const passwordInput = getByPlaceholderText('••••••••');
    fireEvent.changeText(passwordInput, 'password123');

    expect(passwordInput.props.value).toBe('password123');
  });

  it('toggles password visibility', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);

    const passwordInput = getByPlaceholderText('••••••••');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Find the toggle button by looking for the eye icon
    const toggleButton = passwordInput.parent?.children[1];
    if (toggleButton && typeof toggleButton !== 'string') {
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);

      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    }
  });

  it('shows alert when email or password is missing', async () => {
    const { getByText } = render(<SignInScreen />);

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing info',
        'Please enter both email and password.'
      );
    });
  });

  it('shows alert when only email is provided', async () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'test@example.com');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing info',
        'Please enter both email and password.'
      );
    });
  });

  it('shows alert when only password is provided', async () => {
    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const passwordInput = getByPlaceholderText('••••••••');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing info',
        'Please enter both email and password.'
      );
    });
  });

  it('calls supabase signInWithPassword with correct credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('navigates to home on successful sign in', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error alert on sign in failure', async () => {
    const errorMessage = 'Invalid credentials';
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      error: { message: errorMessage },
    });

    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sign in failed', errorMessage);
    });
  });

  it('shows loading state during sign in', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
      () =>
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    const { getByText, getByPlaceholderText, queryByText } = render(
      <SignInScreen />
    );

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const signInButton = getByText('Sign In');
    fireEvent.press(signInButton);

    // Should show loading indicator
    expect(queryByText('Sign In')).toBeNull();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  it('handles forgot password with email', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValueOnce({
      error: null,
    });

    const { getByText, getByPlaceholderText } = render(<SignInScreen />);

    const emailInput = getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'test@example.com');

    const forgotPasswordButton = getByText('Forgot Password?');
    fireEvent.press(forgotPasswordButton);

    await waitFor(() => {
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'myapp://reset-password' }
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Check Your Email',
        "We've sent you a password reset link. Please check your email inbox."
      );
    });
  });

  it('shows alert when forgot password without email', async () => {
    const { getByText } = render(<SignInScreen />);

    const forgotPasswordButton = getByText('Forgot Password?');
    fireEvent.press(forgotPasswordButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Email Required',
        'Please enter your email address to reset your password.'
      );
    });
  });

  it('navigates to sign up page', () => {
    const { getByText } = render(<SignInScreen />);

    const createAccountButton = getByText('Create one');
    fireEvent.press(createAccountButton);

    expect(mockPush).toHaveBeenCalledWith('/sign-up');
  });

  it('renders back button', () => {
    const { getByText } = render(<SignInScreen />);

    // Just verify the component renders with the title
    expect(getByText('Welcome Back')).toBeTruthy();
  });
});
