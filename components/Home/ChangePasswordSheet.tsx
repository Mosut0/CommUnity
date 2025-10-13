import React from 'react';
import { Modal, Animated, Pressable, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors, CommonColors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];

type ChangePasswordSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  insetsBottom: number;
  keyboardOffset: number;
  uiTheme: ThemeConfig;
  oldPassword: string;
  newPassword: string;
  onChangeOldPassword: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onSubmit: () => void;
};

export const ChangePasswordSheet: React.FC<ChangePasswordSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  insetsBottom,
  keyboardOffset,
  uiTheme,
  oldPassword,
  newPassword,
  onChangeOldPassword,
  onChangeNewPassword,
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
            marginBottom: keyboardOffset > 0 ? keyboardOffset - insetsBottom : 0,
          },
        ]}
      >
        <View style={styles.sheetHandleWrap}>
          <View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} />
        </View>
        <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary, marginBottom: 12 }]}>
          Change Password
        </ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: uiTheme.inputBg, color: uiTheme.textPrimary, borderColor: uiTheme.divider },
          ]}
          placeholder="Old Password"
          placeholderTextColor={uiTheme.textSecondary}
          secureTextEntry
          value={oldPassword}
          onChangeText={onChangeOldPassword}
          accessibilityLabel="Old password"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: uiTheme.inputBg, color: uiTheme.textPrimary, borderColor: uiTheme.divider },
          ]}
          placeholder="New Password"
          placeholderTextColor={uiTheme.textSecondary}
          secureTextEntry
          value={newPassword}
          onChangeText={onChangeNewPassword}
          accessibilityLabel="New password"
        />
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: uiTheme.accent }]} onPress={onSubmit}>
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
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
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

ChangePasswordSheet.displayName = 'ChangePasswordSheet';
