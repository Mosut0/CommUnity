import React from 'react';
import {
  Modal,
  Animated,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { Colors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];

type ProfileSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  onPressChangePassword: () => void;
  onPressChangeDistance: () => void;
  onPressChangeUnit: () => void;
  onPressSignOut: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
};

export const ProfileSheet: React.FC<ProfileSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  onPressChangePassword,
  onPressChangeDistance,
  onPressChangeUnit,
  onPressSignOut,
  insetsBottom,
  uiTheme,
}) => {
  return (
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
            opacity: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
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
          <View style={styles.sheetHeaderRow}>
            <ThemedText
              style={[styles.sheetTitle, { color: uiTheme.textPrimary }]}
            >
              Settings
            </ThemedText>
          </View>

          <View style={[styles.sheetSection, { borderColor: uiTheme.divider }]}>
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={onPressChangePassword}
            >
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons
                  name='lock-outline'
                  size={20}
                  color={uiTheme.textSecondary}
                />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}
                >
                  Change Password
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Update your account password
                </ThemedText>
              </View>
              <MaterialIcons
                name='chevron-right'
                size={20}
                color={uiTheme.textSecondary}
              />
            </TouchableOpacity>
            <View
              style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]}
            />
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={onPressChangeDistance}
            >
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons
                  name='my-location'
                  size={20}
                  color={uiTheme.textSecondary}
                />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}
                >
                  Change Distance
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Radius filter for reports
                </ThemedText>
              </View>
              <MaterialIcons
                name='chevron-right'
                size={20}
                color={uiTheme.textSecondary}
              />
            </TouchableOpacity>
            <View
              style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]}
            />
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={onPressChangeUnit}
            >
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons
                  name='straighten'
                  size={20}
                  color={uiTheme.textSecondary}
                />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}
                >
                  Distance Unit
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Switch between km and miles
                </ThemedText>
              </View>
              <MaterialIcons
                name='chevron-right'
                size={20}
                color={uiTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.sheetSection, { borderColor: uiTheme.divider }]}>
            <TouchableOpacity style={styles.sheetRow} onPress={onPressSignOut}>
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons name='logout' size={20} color={uiTheme.danger} />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.danger }]}
                >
                  Sign Out
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Return to login screen
                </ThemedText>
              </View>
              <MaterialIcons
                name='chevron-right'
                size={20}
                color={uiTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

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
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetSection: {
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 14,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowTextWrap: {
    flex: 1,
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    opacity: 0.65,
    marginLeft: 68, // icon width + padding
  },
});

ProfileSheet.displayName = 'ProfileSheet';
