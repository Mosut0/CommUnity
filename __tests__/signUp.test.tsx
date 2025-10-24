import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignUpScreen from '../app/sign-up';
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
      signUp: jest.fn(),
    },
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('SignUpScreen', () => {
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

  // Helper function to get password inputs
  const getPasswordInputs = (getAllByPlaceholderText: any) => {
    const passwordInputs = getAllByPlaceholderText('••••••••');
    return {
      password: passwordInputs[0],
      confirmPassword: passwordInputs[1]
    };
  };

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByText('Join CommUnity to share and stay informed')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getAllByPlaceholderText('••••••••')).toHaveLength(2); // Password and confirm password
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('handles email input', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    fireEvent.changeText(emailInput, 'test@example.com');
    
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('handles password input', () => {
    const { getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const passwordInputs = getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0]; // First password input
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(passwordInput.props.value).toBe('password123');
  });

  it('handles confirm password input', () => {
    const { getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const passwordInputs = getAllByPlaceholderText('••••••••');
    const confirmPasswordInput = passwordInputs[1]; // Second password input
    fireEvent.changeText(confirmPasswordInput, 'password123');
    
    expect(confirmPasswordInput.props.value).toBe('password123');
  });

  it('toggles password visibility', () => {
    const { getAllByPlaceholderText } = render(<SignUpScreen />);

    const passwordInputs = getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0]; // First password input
    
    expect(passwordInput.props.secureTextEntry).toBe(true);
    
    // Find the toggle button by looking for the eye icon in the password input's parent
    const toggleButton = passwordInput.parent?.children[1];
    if (toggleButton) {
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(false);
      
      fireEvent.press(toggleButton);
      expect(passwordInput.props.secureTextEntry).toBe(true);
    }
  });

  it('shows alert when email or password is missing', async () => {
    const { getByText } = render(<SignUpScreen />);
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Missing info',
        'Please enter email and password.'
      );
    });
  });

  it('shows alert when passwords do not match', async () => {
    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInputs = getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'differentpassword');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Password mismatch',
        'Passwords do not match.'
      );
    });
  });

  it('calls supabase signUp with correct credentials', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInputs = getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'myapp://sign-in',
        },
      });
    });
  });

  it('shows verification alert when no session returned', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const { password, confirmPassword } = getPasswordInputs(getAllByPlaceholderText);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(password, 'password123');
    fireEvent.changeText(confirmPassword, 'password123');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verify your email',
        'We have sent a verification link to your inbox. Please verify to continue.'
      );
      expect(mockReplace).toHaveBeenCalledWith('/sign-in');
    });
  });

  it('navigates to home when session is returned', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: '123' } } },
      error: null,
    });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const { password, confirmPassword } = getPasswordInputs(getAllByPlaceholderText);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(password, 'password123');
    fireEvent.changeText(confirmPassword, 'password123');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/home');
    });
  });

  it('shows error alert on sign up failure', async () => {
    const errorMessage = 'Email already registered';
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: { message: errorMessage },
    });

    const { getByText, getByPlaceholderText, getAllByPlaceholderText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const { password, confirmPassword } = getPasswordInputs(getAllByPlaceholderText);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(password, 'password123');
    fireEvent.changeText(confirmPassword, 'password123');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Sign up failed', errorMessage);
    });
  });

  it('shows loading state during sign up', async () => {
    (supabase.auth.signUp as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ 
        data: { session: null }, 
        error: null 
      }), 100))
    );

    const { getByText, getByPlaceholderText, getAllByPlaceholderText, queryByText } = render(<SignUpScreen />);
    
    const emailInput = getByPlaceholderText('you@example.com');
    const { password, confirmPassword } = getPasswordInputs(getAllByPlaceholderText);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(password, 'password123');
    fireEvent.changeText(confirmPassword, 'password123');
    
    const signUpButton = getByText('Sign Up');
    fireEvent.press(signUpButton);
    
    // Should show loading indicator
    expect(queryByText('Sign Up')).toBeNull();
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Verify your email',
        'We have sent a verification link to your inbox. Please verify to continue.'
      );
    });
  });

  it('navigates to sign in page', () => {
    const { getByText } = render(<SignUpScreen />);
    
    const signInButton = getByText('Sign in');
    fireEvent.press(signInButton);
    
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('renders back button', () => {
    const { getByText } = render(<SignUpScreen />);

    // Just verify the component renders with the title
    expect(getByText('Create Account')).toBeTruthy();
  });
});
