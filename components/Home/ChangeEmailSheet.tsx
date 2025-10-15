import React from 'react';
import {
  Modal,
  Animated,
  Pressable,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { Colors, CommonColors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];

type ChangeEmailSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
  currentEmail: string;
  newEmail: string;
  onChangeNewEmail: (value: string) => void;
  onSubmit: () => void;
};

export const ChangeEmailSheet: React.FC<ChangeEmailSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  insetsBottom,
  uiTheme,
  currentEmail,
  newEmail,
  onChangeNewEmail,
  onSubmit,
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
            { color: uiTheme.textPrimary, marginBottom: 8 },
          ]}
        >
          Change Email
        </ThemedText>
        <ThemedText
          style={[
            styles.subtitle,
            { color: uiTheme.textSecondary, marginBottom: 20 },
          ]}
        >
          We'll send a confirmation link to your new email address
        </ThemedText>
        
        <View style={styles.fieldGroup}>
          <ThemedText
            style={[styles.label, { color: uiTheme.textSecondary }]}
          >
            Current Email
          </ThemedText>
          <View
            style={[
              styles.currentEmailBox,
              {
                backgroundColor: uiTheme.chipBg,
                borderColor: uiTheme.divider,
              },
            ]}
          >
            <ThemedText style={[styles.currentEmail, { color: uiTheme.textSecondary }]}>
              {currentEmail}
            </ThemedText>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText
            style={[styles.label, { color: uiTheme.textSecondary }]}
          >
            New Email
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: uiTheme.inputBg,
                color: uiTheme.textPrimary,
                borderColor: uiTheme.divider,
              },
            ]}
            placeholder='you@example.com'
            placeholderTextColor={uiTheme.textSecondary}
            keyboardType='email-address'
            autoCapitalize='none'
            value={newEmail}
            onChangeText={onChangeNewEmail}
            accessibilityLabel='New email address'
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: uiTheme.accent }]}
          onPress={onSubmit}
        >
          <ThemedText
            style={[styles.primaryBtnText, { color: CommonColors.white }]}
          >
            Send Confirmation Email
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
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  currentEmailBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  currentEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 15,
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

ChangeEmailSheet.displayName = 'ChangeEmailSheet';

