import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FilterBar } from '../components/Home/FilterBar';
import { Colors } from '../constants/Colors';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: function Ionicons({ name, size, color, ...props }: any) {
    const MockedIcon = require('react-native').Text;
    return <MockedIcon {...props}>{name}</MockedIcon>;
  },
}));

describe('FilterBar', () => {
  const mockOnFilterPress = jest.fn();
  const mockOnScrollOffsetChange = jest.fn();
  const mockFilterScrollRef = { current: null };

  const defaultProps = {
    selectedFilter: 'all' as const,
    onFilterPress: mockOnFilterPress,
    theme: 'light' as const,
    uiTheme: Colors.light,
    filterScrollRef: mockFilterScrollRef,
    onScrollOffsetChange: mockOnScrollOffsetChange,
    scrollEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} />
    );
    
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Events')).toBeTruthy();
    expect(getByText('Hazards')).toBeTruthy();
    expect(getByText('Lost')).toBeTruthy();
    expect(getByText('Found')).toBeTruthy();
  });

  it('handles filter press', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} />
    );
    
    const eventsButton = getByText('Events');
    fireEvent.press(eventsButton);
    
    expect(mockOnFilterPress).toHaveBeenCalledWith('event');
  });

  it('shows selected filter', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} selectedFilter="event" />
    );
    
    expect(getByText('Events')).toBeTruthy();
  });

  it('works with dark theme', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} theme="dark" uiTheme={Colors.dark} />
    );
    
    expect(getByText('All')).toBeTruthy();
  });

  it('handles disabled scroll', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} scrollEnabled={false} />
    );
    
    // Should render correctly even when scroll is disabled
    expect(getByText('All')).toBeTruthy();
  });

  it('renders all filter options', () => {
    const { getByText } = render(
      <FilterBar {...defaultProps} />
    );
    
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Events')).toBeTruthy();
    expect(getByText('Hazards')).toBeTruthy();
    expect(getByText('Lost')).toBeTruthy();
    expect(getByText('Found')).toBeTruthy();
  });
});
