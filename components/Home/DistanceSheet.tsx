import React from 'react';
import {
  Modal,
  Animated,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { ThemedText } from '@/components/ThemedText';
import { kmToMiles } from '@/utils/distance';
import { Colors, CommonColors, type ThemeName } from '@/constants/Colors';

import type { DistanceUnit } from './types';

type ThemeConfig = (typeof Colors)[ThemeName];

type DistanceSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
  sliderValue: number;
  onSliderChange: (value: number) => void;
  onSubmit: () => void;
  distanceUnit: DistanceUnit;
};

export const DistanceSheet: React.FC<DistanceSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  insetsBottom,
  uiTheme,
  sliderValue,
  onSliderChange,
  onSubmit,
  distanceUnit,
}) => (
  <Modal
    transparent
    animationType='none'
    visible={visible}
    onRequestClose={onRequestClose}
  >
    <Animated.View
      style={[
        styles.sheetOverlay,
        {
          backgroundColor: uiTheme.overlay,
          opacity: animation,
        },
      ]}
    >
      <Pressable style={styles.overlaySpacer} onPress={onRequestClose} />
      <Animated.View
        style={[
          styles.sheetInner,
          {
            backgroundColor: uiTheme.cardBg,
            borderColor: uiTheme.divider,
            paddingBottom: 20 + insetsBottom,
            borderTopWidth: 1,
            transform: [
              {
                translateY: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [60, 0],
                }),
              },
            ],
            opacity: animation,
          },
        ]}
      >
        <View style={styles.sheetHandleWrap}>
          <View
            style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]}
          />
        </View>
        <ThemedText
          style={[
            styles.sheetTitle,
            { color: uiTheme.textPrimary, marginBottom: 12 },
          ]}
        >
          Distance Radius
        </ThemedText>
        <Slider
          style={styles.slider}
          minimumValue={2}
          maximumValue={100}
          step={1}
          value={sliderValue}
          onValueChange={onSliderChange}
          minimumTrackTintColor={uiTheme.accent}
          maximumTrackTintColor={uiTheme.sliderTrackInactive}
          thumbTintColor={uiTheme.accent}
          accessibilityLabel='Select distance radius'
        />
        <ThemedText
          style={[styles.sliderValueText, { color: uiTheme.textSecondary }]}
        >
          {distanceUnit === 'miles'
            ? `${Math.round(kmToMiles(sliderValue))} miles`
            : `${sliderValue} km`}
        </ThemedText>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: uiTheme.accent }]}
          onPress={onSubmit}
        >
          <ThemedText
            style={[styles.primaryBtnText, { color: CommonColors.white }]}
          >
            Save
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  </Modal>
);

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlaySpacer: {
    flex: 1,
  },
  sheetInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderValueText: {
    marginBottom: 14,
  },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

DistanceSheet.displayName = 'DistanceSheet';
