import React from 'react';
import { Modal, Animated, Pressable, View, TouchableOpacity, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors, CommonColors, type ThemeName } from '@/constants/Colors';

import type { DistanceUnit } from './types';

type ThemeConfig = (typeof Colors)[ThemeName];

type DistanceUnitSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
  distanceUnit: DistanceUnit;
  onSelectUnit: (unit: DistanceUnit) => void;
  onSubmit: () => void;
};

export const DistanceUnitSheet: React.FC<DistanceUnitSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  insetsBottom,
  uiTheme,
  distanceUnit,
  onSelectUnit,
  onSubmit,
}) => (
  <Modal transparent animationType="none" visible={visible} onRequestClose={onRequestClose}>
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
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
            opacity: animation,
          },
        ]}
      >
        <View style={styles.sheetHandleWrap}>
          <View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} />
        </View>
        <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary, marginBottom: 20 }]}>
          Distance Unit
        </ThemedText>

        <View style={styles.radioGroup}>
          <TouchableOpacity style={styles.radioOption} onPress={() => onSelectUnit('km')}>
            <View style={[styles.radioCircle, { borderColor: uiTheme.divider }]}>
              {distanceUnit === 'km' && <View style={[styles.radioInner, { backgroundColor: uiTheme.accent }]} />}
            </View>
            <ThemedText style={[styles.radioLabel, { color: uiTheme.textPrimary }]}>Kilometers (km)</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioOption} onPress={() => onSelectUnit('miles')}>
            <View style={[styles.radioCircle, { borderColor: uiTheme.divider }]}>
              {distanceUnit === 'miles' && <View style={[styles.radioInner, { backgroundColor: uiTheme.accent }]} />}
            </View>
            <ThemedText style={[styles.radioLabel, { color: uiTheme.textPrimary }]}>Miles (mi)</ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: uiTheme.accent, marginTop: 14 }]} onPress={onSubmit}>
          <ThemedText style={[styles.primaryBtnText, { color: CommonColors.white }]}>Save</ThemedText>
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
  radioGroup: {
    gap: 2,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
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

DistanceUnitSheet.displayName = 'DistanceUnitSheet';
