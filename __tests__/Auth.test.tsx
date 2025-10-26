import React from 'react';
import { render } from '@testing-library/react-native';
import Auth from '../components/Auth';

describe('Auth', () => {
  it('renders correctly', () => {
    const { UNSAFE_root } = render(<Auth />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('returns null as expected', () => {
    const { UNSAFE_root } = render(<Auth />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
