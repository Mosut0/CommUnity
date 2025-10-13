import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { MARKER_COLORS } from '@/constants/Markers';
import { Colors, type ThemeName } from '@/constants/Colors';

import type { FilterValue } from './types';

type ThemeConfig = (typeof Colors)[ThemeName];

type FilterBarProps = {
  selectedFilter: FilterValue;
  onFilterPress: (filter: FilterValue) => void;
  theme: ThemeName;
  uiTheme: ThemeConfig;
  filterScrollRef: React.MutableRefObject<ScrollView | null>;
  onScrollOffsetChange: (offset: number) => void;
  scrollEnabled?: boolean;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedFilter,
  onFilterPress,
  theme,
  uiTheme,
  filterScrollRef,
  onScrollOffsetChange,
  scrollEnabled = true,
}) => {
  const renderFilterButton = (value: FilterValue, label: string, icon: React.ComponentProps<typeof Ionicons>['name'], color: string) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.filterButton,
        selectedFilter === value && { backgroundColor: uiTheme.filterButtonActiveBg },
      ]}
      onPress={() => onFilterPress(value)}
      disabled={!scrollEnabled}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedFilter === value }}
    >
      <Ionicons
        name={icon}
        size={value === 'lost' || value === 'found' ? 20 : 22}
        color={selectedFilter === value ? color : uiTheme.filterIconInactive}
      />
      <ThemedText style={styles.filterText}>{label}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      ref={filterScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterContent}
      style={[styles.filterBarInline, theme === 'dark' ? styles.filterBarDark : styles.filterBarLight]}
      onScroll={(e) => onScrollOffsetChange(e.nativeEvent.contentOffset.x)}
      scrollEventThrottle={16}
    >
      {renderFilterButton('all', 'All', 'layers', uiTheme.accentAlt)}
      {renderFilterButton('hazard', 'Hazards', 'alert-circle-outline', MARKER_COLORS.safety)}
      {renderFilterButton('event', 'Events', 'calendar-outline', MARKER_COLORS.event)}
      {renderFilterButton('lost', 'Lost', 'help-circle-outline', MARKER_COLORS.lost)}
      {renderFilterButton('found', 'Found', 'checkmark-circle-outline', MARKER_COLORS.found)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  filterText: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '500',
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    gap: 8,
  },
  filterBarLight: {
    backgroundColor: Colors.light.pageBg,
  },
  filterBarDark: {
    backgroundColor: Colors.dark.pageBg,
  },
  filterBarInline: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
});

FilterBar.displayName = 'FilterBar';
