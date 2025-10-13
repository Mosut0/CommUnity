import React from 'react';
import { TouchableOpacity, Animated, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { Colors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];

type SpeedDialProps = {
  isExpanded: boolean;
  animation: Animated.Value;
  onToggle: () => void;
  onPressCreate: () => void;
  onPressForums: () => void;
  uiTheme: ThemeConfig;
  theme: ThemeName;
};

export const SpeedDial: React.FC<SpeedDialProps> = ({
  isExpanded,
  animation,
  onToggle,
  onPressCreate,
  onPressForums,
  uiTheme,
  theme,
}) => (
  <>
    {isExpanded && <Pressable style={styles.fabOverlay} onPress={onToggle} accessibilityLabel="Close actions overlay" />}

    <TouchableOpacity
      style={[styles.fab, theme === 'dark' ? styles.fabDark : styles.fabLight]}
      onPress={onToggle}
      accessibilityLabel={isExpanded ? 'Close actions' : 'Open actions'}
      accessibilityRole="button"
    >
      <Animated.View
        style={{
          transform: [{ rotate: animation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }],
        }}
      >
        <MaterialIcons name={isExpanded ? 'close' : 'more-vert'} size={26} color={uiTheme.fabIcon} />
      </Animated.View>
    </TouchableOpacity>

    <Animated.View
      pointerEvents={isExpanded ? 'auto' : 'none'}
      style={styles.actionsContainer}
    >
      <Animated.View
        style={[
          styles.speedDialButton,
          theme === 'dark' ? styles.fabDark : styles.fabLight,
          {
            transform: [
              { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -136] }) },
              { scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
            ],
            opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.speedDialTouchable}
          onPress={onPressForums}
          accessibilityLabel="Open Forums"
          accessibilityRole="button"
        >
          <MaterialIcons name="format-list-bulleted" size={22} color={uiTheme.fabIcon} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.speedDialButton,
          theme === 'dark' ? styles.fabDark : styles.fabLight,
          {
            transform: [
              { translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
              { scale: animation.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
            ],
            opacity: animation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.speedDialTouchable}
          onPress={onPressCreate}
          accessibilityLabel="Create report"
          accessibilityRole="button"
        >
          <MaterialIcons name="add" size={26} color={uiTheme.fabIcon} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  </>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 70,
  },
  fabLight: {
    backgroundColor: Colors.light.fabBackground,
  },
  fabDark: {
    backgroundColor: Colors.dark.fabBackground,
  },
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 40,
  },
  actionsContainer: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    zIndex: 60,
  },
  speedDialButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  speedDialTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

SpeedDial.displayName = 'SpeedDial';
