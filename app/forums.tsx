import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  useColorScheme,
  Alert,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getFormattedDistance,
  getDistanceKm,
  kmToMiles,
} from '@/utils/distance';
import FillHazardForm from '@/components/Hazards/FillHazardForm';
import FillEventForm from '@/components/Events/FillEventForm';
import LostItemForm from '@/components/LostAndFound/LostItemForm';
import FoundItemForm from '@/components/LostAndFound/FoundItemForm';
import { MARKER_COLORS, CATEGORY_DISPLAY_NAMES } from '@/constants/Markers';
import { Colors } from '@/constants/Colors';
import type { ThemeName } from '@/constants/Colors';

interface Report {
  reportid: number;
  category: string;
  description: string;
  location: string;
  eventtype?: string;
  itemtype?: string;
  hazardtype?: string;
}

// Use constants from the centralized constants file
const dbNameByDisplay: Record<string, string> = {
  All: 'all',
  Events: 'event',
  Lost: 'lost',
  Found: 'found',
  Hazards: 'safety',
};

type ThemeColors = typeof Colors.light;

export default function Forums() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  const uiTheme = Colors[themeName];
  const styles = useMemo(() => makeStyles(uiTheme), [uiTheme]);

  const [selectedTab, setSelectedTab] =
    useState<keyof typeof CATEGORY_DISPLAY_NAMES>('All');
  const [reports, setReports] = useState<Report[]>([]);
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [isDistanceVisible, setIsDistanceVisible] = useState(false);

  const [distanceRadius, setDistanceRadius] = useState<number>(20);
  const [pendingRadius, setPendingRadius] = useState<number>(20);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isHazardFormVisible, setIsHazardFormVisible] = useState(false);
  const [isEventFormVisible, setIsEventFormVisible] = useState(false);
  const [isLostItemVisible, setIsLostItemVisible] = useState(false);
  const [isFoundItemVisible, setIsFoundItemVisible] = useState(false);

  // Location permission + current coordinates
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setErrorMsg(null);
      } catch (e) {
        console.error('Error getting location:', e);
        setErrorMsg('Failed to get location. Please try again.');
      }
    })();
  }, []);

  // Initial user prefs + userId
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error('Error fetching distance radius:', error);
      } else if (data?.user) {
        const r = data.user.user_metadata?.distance_radius || 20;
        const unit = data.user.user_metadata?.distance_unit || 'km';
        setDistanceRadius(r);
        setPendingRadius(r);
        setDistanceUnit(unit);
        setUserId(data.user.id);
      }
    });
  }, []);

  const fetchReports = useCallback(async () => {
    if (!location) return;

    let query = supabase.from('reports').select(`
      reportid,
      category,
      description,
      location,
      eventtype:events(eventtype),
      lostitemtype:lostitems(itemtype),
      founditemtype:founditems(itemtype),
      hazardtype:hazards(hazardtype)
    `);

    if (selectedTab !== 'All') {
      query = query.eq(
        'category',
        dbNameByDisplay[CATEGORY_DISPLAY_NAMES[selectedTab]]
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching reports:', error);
      return;
    }

    const filtered = (data || []).filter((r: any) => {
      const coords = parseLocation(r.location);
      if (!coords) return false;
      const d = getDistanceKm(
        location!.coords.latitude,
        location!.coords.longitude,
        coords.latitude,
        coords.longitude
      );
      return d <= distanceRadius;
    });

    const formatted: Report[] = filtered.map((r: any) => ({
      reportid: r.reportid,
      category: r.category,
      description: r.description,
      location: r.location,
      eventtype: r.eventtype?.[0]?.eventtype || '',
      itemtype:
        r.lostitemtype?.[0]?.itemtype || r.founditemtype?.[0]?.itemtype || '',
      hazardtype: r.hazardtype?.[0]?.hazardtype || '',
    }));

    setReports(formatted);
  }, [selectedTab, distanceRadius, location]);

  // Refresh when filters / tab / location change
  useEffect(() => {
    if (location) fetchReports();
  }, [selectedTab, distanceRadius, location, fetchReports]);

  const parseLocation = (
    loc: string
  ): { latitude: number; longitude: number } | null => {
    try {
      const coordsStr = loc.substring(1, loc.length - 1);
      const [lat, lng] = coordsStr.split(',').map(parseFloat);
      if (isNaN(lat) || isNaN(lng)) return null;
      return { latitude: lat, longitude: lng };
    } catch {
      return null;
    }
  };

  const toKmString = useCallback(
    (locStr: string) => {
      if (!location) return null;
      const c = parseLocation(locStr);
      if (!c) return null;
      return getFormattedDistance(
        location.coords.latitude,
        location.coords.longitude,
        c.latitude,
        c.longitude,
        distanceUnit
      );
    },
    [location, distanceUnit]
  );

  const tabs = useMemo<(keyof typeof CATEGORY_DISPLAY_NAMES)[]>(
    () => ['All', 'Hazards', 'Events', 'Lost', 'Found'],
    []
  );

  const getIconForCategory = useCallback(
    (category: string) => {
      switch (category) {
        case 'event':
          return { name: 'calendar-outline', color: MARKER_COLORS.event };
        case 'lost':
          return { name: 'help-circle-outline', color: MARKER_COLORS.lost };
        case 'found':
          return {
            name: 'checkmark-circle-outline',
            color: MARKER_COLORS.found,
          };
        case 'safety':
          return { name: 'alert-circle-outline', color: MARKER_COLORS.safety };
        default:
          return { name: 'information-circle-outline', color: uiTheme.accent };
      }
    },
    [uiTheme.accent]
  );

  const renderReport = ({ item }: { item: Report }) => {
    const title =
      item.eventtype || item.itemtype || item.hazardtype || 'Details';
    const iconMeta = getIconForCategory(item.category);
    const distanceText = toKmString(item.location);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: './report-details' as any,
            params: { reportId: item.reportid },
          })
        }
      >
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconBubble,
              { backgroundColor: iconMeta.color + '22' },
            ]}
          >
            <Ionicons
              name={iconMeta.name as any}
              size={22}
              color={iconMeta.color}
            />
          </View>

          <View style={styles.cardTextWrap}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {title}
            </Text>
            <Text numberOfLines={2} style={styles.cardSubtitle}>
              {item.description || 'No additional details provided.'}
            </Text>

            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Ionicons
                  name='location-outline'
                  size={14}
                  color={uiTheme.textSecondary}
                />
                <Text style={styles.chipText}>{distanceText ?? 'Nearby'}</Text>
              </View>

              <View style={styles.chip}>
                <MaterialCommunityIcons
                  name='tag-outline'
                  size={14}
                  color={uiTheme.textSecondary}
                />
                <Text style={styles.chipText}>
                  {item.category?.charAt(0).toUpperCase() +
                    item.category?.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Ionicons
          name='chevron-forward'
          size={20}
          color={uiTheme.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  const distanceOptions = [2, 5, 10, 20, 50];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top actions row */}
      <View style={styles.actionsRow}>
        {/* Map (acts as Back) — left */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.back()}
        >
          <Ionicons name='map-outline' size={18} color={uiTheme.textPrimary} />
          <Text style={styles.actionText}>Map</Text>
        </TouchableOpacity>

        <View style={styles.actionSpacer} />

        {/* New Item — right */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setIsCreateVisible(true)}
        >
          <Ionicons
            name='add-circle-outline'
            size={18}
            color={uiTheme.textPrimary}
          />
          <Text style={styles.actionText}>New Item</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabsRow}>
        {tabs.map(t => {
          const active = selectedTab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setSelectedTab(t)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {CATEGORY_DISPLAY_NAMES[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <FlatList
        data={reports}
        keyExtractor={r => String(r.reportid)}
        renderItem={renderReport}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons
              name='search-outline'
              size={26}
              color={uiTheme.textSecondary}
            />
            <Text style={styles.emptyText}>
              No reports within{' '}
              {distanceUnit === 'miles'
                ? `${Math.round(kmToMiles(distanceRadius))} miles`
                : `${distanceRadius} km`}
            </Text>
          </View>
        }
      />

      {/* Create modal */}
      <Modal
        visible={isCreateVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: uiTheme.overlay }]}
          onPress={() => setIsCreateVisible(false)}
        >
          <View
            style={[styles.modalSheet, { paddingBottom: 16 + insets.bottom }]}
          >
            <Text style={styles.modalTitle}>Create new...</Text>
            <View style={styles.modalGrid}>
              {[
                {
                  key: 'safety',
                  label: 'Hazard',
                  icon: 'alert-circle-outline',
                  color: MARKER_COLORS.safety,
                },
                {
                  key: 'event',
                  label: 'Event',
                  icon: 'calendar-outline',
                  color: MARKER_COLORS.event,
                },
                {
                  key: 'lost',
                  label: 'Lost Item',
                  icon: 'help-circle-outline',
                  color: MARKER_COLORS.lost,
                },
                {
                  key: 'found',
                  label: 'Found Item',
                  icon: 'checkmark-circle-outline',
                  color: MARKER_COLORS.found,
                },
              ].map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={styles.modalCell}
                  onPress={() => {
                    if (!userId) {
                      Alert.alert(
                        'Not signed in',
                        'Please sign in to submit a report.'
                      );
                      return;
                    }
                    setIsCreateVisible(false);

                    if (c.key === 'safety') {
                      setIsHazardFormVisible(true);
                    } else if (c.key === 'event') {
                      setIsEventFormVisible(true);
                    } else if (c.key === 'lost') {
                      setIsLostItemVisible(true);
                    } else if (c.key === 'found') {
                      setIsFoundItemVisible(true);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.iconBubbleLg,
                      { backgroundColor: c.color + '22' },
                    ]}
                  >
                    <Ionicons name={c.icon as any} size={24} color={c.color} />
                  </View>
                  <Text style={styles.modalCellText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Hazard form modal */}
      <FillHazardForm
        visible={isHazardFormVisible}
        onSubmit={() => setIsHazardFormVisible(false)}
        onClose={() => setIsHazardFormVisible(false)}
        userId={userId ?? ''}
      />

      {/* Event form modal */}
      <FillEventForm
        visible={isEventFormVisible}
        onSubmit={() => setIsEventFormVisible(false)}
        onClose={() => setIsEventFormVisible(false)}
        userId={userId ?? ''}
      />

      {/* Lost Item form modal */}
      <LostItemForm
        visible={isLostItemVisible}
        onSubmit={() => setIsLostItemVisible(false)}
        onClose={() => setIsLostItemVisible(false)}
        userId={userId ?? ''}
      />

      {/* Found Item form modal */}
      <FoundItemForm
        visible={isFoundItemVisible}
        onSubmit={() => setIsFoundItemVisible(false)}
        onClose={() => setIsFoundItemVisible(false)}
        userId={userId ?? ''}
      />

      {/* Distance sheet */}
      <Modal
        visible={isDistanceVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsDistanceVisible(false)}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: uiTheme.overlay }]}
          onPress={() => setIsDistanceVisible(false)}
        >
          <View
            style={[styles.modalSheet, { paddingBottom: 16 + insets.bottom }]}
          >
            <Text style={styles.modalTitle}>Filter by distance</Text>

            <View style={styles.distanceRow}>
              {distanceOptions.map(km => {
                const active = pendingRadius === km;
                return (
                  <TouchableOpacity
                    key={km}
                    style={[
                      styles.distanceChip,
                      active && styles.distanceChipActive,
                    ]}
                    onPress={() => setPendingRadius(km)}
                  >
                    <Text
                      style={[
                        styles.distanceChipText,
                        active && styles.distanceChipTextActive,
                      ]}
                    >
                      {km} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.distanceFooter}>
              <Text style={styles.distanceHint}>
                Current: {distanceRadius} km
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  setDistanceRadius(pendingRadius);
                  setIsDistanceVisible(false);
                }}
              >
                <Text style={styles.primaryBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- styles (theme-aware) ---------- */
const makeStyles = (t: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: t.pageBg },

    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingBottom: 8,
      gap: 8,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.chipBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    actionText: { color: t.textPrimary, fontSize: 13, fontWeight: '600' },
    actionSpacer: { flex: 1 },

    tabsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: t.chipBg,
    },
    tabActive: {
      backgroundColor: t.profileBorder,
    },
    tabText: { color: t.textSecondary, fontSize: 13, fontWeight: '600' },
    tabTextActive: { color: t.textPrimary },

    listContent: { padding: 14, paddingBottom: 24 },
    separator: { height: 10 },

    card: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: t.divider,
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      flex: 1,
    },
    iconBubble: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBubbleLg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTextWrap: { flex: 1 },
    cardTitle: {
      color: t.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 2,
    },
    cardSubtitle: { color: t.textSecondary, fontSize: 13, lineHeight: 18 },

    chipsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: t.chipBg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    chipText: { color: t.textSecondary, fontSize: 12, fontWeight: '600' },

    emptyWrap: { alignItems: 'center', paddingTop: 40, gap: 10 },
    emptyText: { color: t.textSecondary, fontSize: 14 },

    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: t.cardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      borderTopWidth: 1,
      borderColor: t.divider,
    },
    modalTitle: {
      color: t.textPrimary,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 12,
    },
    modalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    modalCell: {
      width: '47%',
      backgroundColor: t.chipBg,
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      gap: 8,
    },
    modalCellText: { color: t.textPrimary, fontWeight: '600' },

    /* Distance sheet */
    distanceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
    distanceChip: {
      backgroundColor: t.chipBg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    distanceChipActive: { backgroundColor: t.profileBorder },
    distanceChipText: { color: t.textSecondary, fontWeight: '700' },
    distanceChipTextActive: { color: t.textPrimary },
    distanceFooter: { flexDirection: 'row', alignItems: 'center' },
    distanceHint: { color: t.textSecondary },
    primaryBtn: {
      backgroundColor: t.primaryBtnBg,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },
    primaryBtnText: { color: t.primaryBtnText, fontWeight: '700' },

    errorText: { color: t.errorText, paddingHorizontal: 14, paddingBottom: 6 },
  });
