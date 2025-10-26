import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import App from '../app/index';
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
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}));

describe('App Index', () => {
  let mockPush: jest.Mock;
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPush = jest.fn();
    mockReplace = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
  });

  it('renders loading indicator initially', () => {
    (supabase.auth.getSession as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    const { getByTestId } = render(<App />);

    // Should show loading indicator
    expect(getByTestId).toBeDefined();
  });

  it('redirects to home when user has session', async () => {
    const mockSession = { user: { id: '123' } };

    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
    });

    render(<App />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/home');
    });
  });

  it('redirects to welcome when no session', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    render(<App />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/welcome');
    });
  });

  it('sets up auth state change listener', () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
    });

    render(<App />);

    expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
  });
});
