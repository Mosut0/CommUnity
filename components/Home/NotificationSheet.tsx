import React, { useState, useEffect } from 'react';
import {
  Modal,
  Animated,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { ThemedText } from '@/components/ThemedText';
import { Colors, CommonColors, type ThemeName } from '@/constants/Colors';
import { MARKER_COLORS } from '@/constants/Markers';
import { supabase } from '@/lib/supabase';

type ThemeConfig = (typeof Colors)[ThemeName];

const REPORT_TYPES = [
  { key: 'hazard', label: 'Hazards', icon: 'alert-circle-outline' as const },
  { key: 'event', label: 'Events', icon: 'calendar-outline' as const },
  { key: 'lost', label: 'Lost items', icon: 'help-circle-outline' as const },
  {
    key: 'found',
    label: 'Found items',
    icon: 'checkmark-circle-outline' as const,
  },
];

type NotificationSheetProps = {
  visible: boolean;
  animation: Animated.Value;
  onRequestClose: () => void;
  onPressBack: () => void;
  insetsBottom: number;
  uiTheme: ThemeConfig;
};

export const NotificationSheet: React.FC<NotificationSheetProps> = ({
  visible,
  animation,
  onRequestClose,
  onPressBack,
  insetsBottom,
  uiTheme,
}) => {
  const [prefs, setPrefs] = useState<any>({
    notify_types: [],
    notify_radius_m: 1000,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible]);

  const loadPreferences = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST102') {
      console.warn('Error fetching prefs', error);
    }

    setPrefs(data || { notify_types: [], notify_radius_m: 1000 });
    setLoading(false);
  };

  const toggleType = (type: string) => {
    const types = prefs.notify_types || [];
    const exists = types.includes(type);
    const updated = exists
      ? types.filter((t: string) => t !== type)
      : [...types, type];
    setPrefs({ ...prefs, notify_types: updated });
  };

  const getIconColor = (key: string) => {
    switch (key) {
      case 'hazard':
        return MARKER_COLORS.hazard;
      case 'event':
        return MARKER_COLORS.event;
      case 'lost':
        return MARKER_COLORS.lost;
      case 'found':
        return MARKER_COLORS.found;
      default:
        return uiTheme.textSecondary;
    }
  };

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notification_preferences')
      .upsert(
        {
          user_id: user.id,
          notify_types: prefs.notify_types,
          notify_radius_m: prefs.notify_radius_m,
        },
        { onConflict: 'user_id' }
      )
      .select();

    if (error) {
      Alert.alert('Error', 'Failed to save preferences');
      console.error(error);
      return;
    }

    Alert.alert('Saved', 'Notification preferences updated');
    onRequestClose();
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
          <View style={styles.sheetHandleWrap}>
            <View
              style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]}
            />
          </View>
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
              Notification Preferences
            </ThemedText>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={{ color: uiTheme.textSecondary }}>
                Loading...
              </ThemedText>
            </View>
          ) : (
            <>
              <View
                style={[styles.sheetSection, { borderColor: uiTheme.divider }]}
              >
                <View style={styles.sectionHeader}>
                  <ThemedText
                    style={[
                      styles.sectionTitle,
                      { color: uiTheme.textPrimary },
                    ]}
                  >
                    Report Types
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sectionSubtitle,
                      { color: uiTheme.textSecondary },
                    ]}
                  >
                    Choose which types of reports you want to be notified about
                  </ThemedText>
                </View>
                {REPORT_TYPES.map((r, index) => (
                  <View key={r.key}>
                    {index > 0 && (
                      <View
                        style={[
                          styles.rowDivider,
                          { backgroundColor: uiTheme.divider },
                        ]}
                      />
                    )}
                    <View style={styles.sheetRow}>
                      <View
                        style={[
                          styles.sheetIcon,
                          { backgroundColor: uiTheme.chipBg },
                        ]}
                      >
                        <Ionicons
                          name={r.icon}
                          size={r.key === 'lost' || r.key === 'found' ? 20 : 22}
                          color={getIconColor(r.key)}
                        />
                      </View>
                      <View style={styles.sheetRowTextWrap}>
                        <ThemedText
                          style={[
                            styles.sheetRowTitle,
                            { color: uiTheme.textPrimary },
                          ]}
                        >
                          {r.label}
                        </ThemedText>
                      </View>
                      <Switch
                        value={(prefs.notify_types || []).includes(r.key)}
                        onValueChange={() => toggleType(r.key)}
                        trackColor={{
                          false: uiTheme.divider,
                          true: uiTheme.tint,
                        }}
                        thumbColor={
                          (prefs.notify_types || []).includes(r.key)
                            ? uiTheme.tint
                            : '#f4f3f4'
                        }
                      />
                    </View>
                  </View>
                ))}
              </View>

              <View
                style={[styles.sheetSection, { borderColor: uiTheme.divider }]}
              >
                <View style={styles.sectionHeader}>
                  <ThemedText
                    style={[
                      styles.sectionTitle,
                      { color: uiTheme.textPrimary },
                    ]}
                  >
                    Notification Radius
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.sectionSubtitle,
                      { color: uiTheme.textSecondary },
                    ]}
                  >
                    {prefs.notify_radius_m || 1000} meters (
                    {((prefs.notify_radius_m || 1000) / 1000).toFixed(1)} km)
                  </ThemedText>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    minimumValue={100}
                    maximumValue={50000}
                    step={100}
                    value={prefs.notify_radius_m || 1000}
                    onValueChange={val =>
                      setPrefs({ ...prefs, notify_radius_m: Math.round(val) })
                    }
                    minimumTrackTintColor={uiTheme.tint}
                    maximumTrackTintColor={uiTheme.divider}
                    thumbTintColor={uiTheme.tint}
                  />
                  <View style={styles.sliderLabels}>
                    <ThemedText
                      style={[
                        styles.sliderLabel,
                        { color: uiTheme.textSecondary },
                      ]}
                    >
                      100m
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.sliderLabel,
                        { color: uiTheme.textSecondary },
                      ]}
                    >
                      50km
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.saveButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: uiTheme.accent, marginTop: 14 },
                  ]}
                  onPress={handleSave}
                >
                  <ThemedText
                    style={[
                      styles.primaryBtnText,
                      { color: CommonColors.white },
                    ]}
                  >
                    Save
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
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
    maxHeight: '90%',
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
    paddingVertical: 4,
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sheetSection: {
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    opacity: 0.65,
    marginLeft: 68,
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 11,
  },
  saveButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
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

NotificationSheet.displayName = 'NotificationSheet';
