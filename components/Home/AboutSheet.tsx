import React from 'react';
import {
  Modal,
  Animated,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { Colors, type ThemeName } from '@/constants/Colors';

type ThemeConfig = (typeof Colors)[ThemeName];

type AboutSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  onPressBack: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
};

export const AboutSheet: React.FC<AboutSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  onPressBack,
  insetsBottom,
  uiTheme,
}) => {
  const handleOpenTOS = () => {
    const tosUrl = 'https://www.community-app.ca/terms-of-service.html';
    Linking.openURL(tosUrl).catch(err =>
      console.error('Failed to open TOS URL:', err)
    );
  };

  const handleOpenPrivacyPolicy = () => {
    const privacyUrl = 'https://www.community-app.ca/privacy-policy.html';
    Linking.openURL(privacyUrl).catch(err =>
      console.error('Failed to open Privacy Policy URL:', err)
    );
  };

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
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity onPress={onPressBack} style={styles.backButton}>
              <MaterialIcons
                name='arrow-back'
                size={24}
                color={uiTheme.textPrimary}
              />
            </TouchableOpacity>
            <ThemedText
              style={[styles.sheetTitle, { color: uiTheme.textPrimary }]}
            >
              About
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          <View style={[styles.sheetSection, { borderColor: uiTheme.divider }]}>
            <TouchableOpacity style={styles.sheetRow} onPress={handleOpenTOS}>
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons
                  name='description'
                  size={20}
                  color={uiTheme.textSecondary}
                />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}
                >
                  Terms of Service
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Read our terms and conditions
                </ThemedText>
              </View>
              <MaterialIcons
                name='open-in-new'
                size={20}
                color={uiTheme.textSecondary}
              />
            </TouchableOpacity>
            <View
              style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]}
            />
            <TouchableOpacity
              style={styles.sheetRow}
              onPress={handleOpenPrivacyPolicy}
            >
              <View
                style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}
              >
                <MaterialIcons
                  name='privacy-tip'
                  size={20}
                  color={uiTheme.textSecondary}
                />
              </View>
              <View style={styles.sheetRowTextWrap}>
                <ThemedText
                  style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}
                >
                  Privacy Policy
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sheetRowSubtitle,
                    { color: uiTheme.textSecondary },
                  ]}
                >
                  Learn how we protect your data
                </ThemedText>
              </View>
              <MaterialIcons
                name='open-in-new'
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
    paddingTop: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  placeholder: {
    width: 32,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
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

AboutSheet.displayName = 'AboutSheet';
