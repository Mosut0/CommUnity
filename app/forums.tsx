import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

interface Report {
  reportid: number;
  category: string; // "event" | "lost" | "found" | "safety"
  description: string;
  location: string; // "(lat,lng)"
  eventtype?: string;
  itemtype?: string;
  hazardtype?: string;
}

const categoryDisplayNames: Record<string, string> = {
  All: "All",
  Event: "Events",
  Lost: "Lost",
  Found: "Found",
  Safety: "Hazards",
};
const dbNameByDisplay: Record<string, string> = {
  All: "all",
  Events: "event",
  Lost: "lost",
  Found: "found",
  Hazards: "safety",
};

const categoryColors: Record<string, string> = {
  event: "#7C3AED", // purple-600
  lost: "#EAB308",  // yellow-500
  found: "#22C55E", // green-500
  safety: "#EF4444", // red-500
};

const chipBg = "#1F2937"; // slate-800
const cardBg = "#0F172A"; // slate-950-ish
const pageBg = "#0B1220"; // deep navy
const textPrimary = "#E5E7EB"; // gray-200
const textSecondary = "#9CA3AF"; // gray-400
const divider = "#1F2A37"; // slate-800

export default function Forums() {
  const [selectedTab, setSelectedTab] = useState<keyof typeof categoryDisplayNames>("All");
  const [reports, setReports] = useState<Report[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [distanceRadius, setDistanceRadius] = useState<number>(20);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setErrorMsg(null);
      } catch (e) {
        console.error("Error getting location:", e);
        setErrorMsg("Failed to get location. Please try again.");
      }
    })();
  }, []);

  // Pull distance radius from user metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching distance radius:", error);
      } else if (data?.user) {
        setDistanceRadius(data.user.user_metadata?.distance_radius || 20);
      }
    });
  }, []);

  useEffect(() => {
    if (location) fetchReports();
  }, [selectedTab, distanceRadius, location]);

  const fetchReports = useCallback(async () => {
    if (!location) return;

    let query = supabase.from("reports").select(`
      reportid,
      category,
      description,
      location,
      eventtype:events(eventtype),
      lostitemtype:lostitems(itemtype),
      founditemtype:founditems(itemtype),
      hazardtype:hazards(hazardtype)
    `);

    if (selectedTab !== "All") {
      query = query.eq("category", dbNameByDisplay[categoryDisplayNames[selectedTab]]);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching reports:", error);
      return;
    }

    const filtered = (data || []).filter((r: any) => {
      const coords = parseLocation(r.location);
      if (!coords) return false;
      const d = getDistanceKm(
        location.coords.latitude,
        location.coords.longitude,
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
      eventtype: r.eventtype?.[0]?.eventtype || "",
      itemtype: r.lostitemtype?.[0]?.itemtype || r.founditemtype?.[0]?.itemtype || "",
      hazardtype: r.hazardtype?.[0]?.hazardtype || "",
    }));

    setReports(formatted);
  }, [selectedTab, distanceRadius, location]);

  const parseLocation = (loc: string): { latitude: number; longitude: number } | null => {
    try {
      const coordsStr = loc.substring(1, loc.length - 1);
      const [lat, lng] = coordsStr.split(",").map(parseFloat);
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
      const d = getDistanceKm(
        location.coords.latitude,
        location.coords.longitude,
        c.latitude,
        c.longitude
      );
      // Show with one decimal if < 10km, else whole number
      const value = d < 10 ? d.toFixed(1) : Math.round(d).toString();
      return `${value} km away`;
    },
    [location]
  );

  const tabs = useMemo<(keyof typeof categoryDisplayNames)[]>(
    () => ["All", "Event", "Lost", "Found", "Safety"],
    []
  );

  const toggleDropdown = () => setIsDropdownVisible((v) => !v);

  const getIconForCategory = (category: string) => {
    switch (category) {
      case "event":
        return { name: "calendar-outline", color: categoryColors.event };
      case "lost":
        return { name: "help-circle-outline", color: categoryColors.lost };
      case "found":
        return { name: "checkmark-circle-outline", color: categoryColors.found };
      case "safety":
        return { name: "alert-circle-outline", color: categoryColors.safety };
      default:
        return { name: "information-circle-outline", color: "#60A5FA" }; // blue-400
    }
  };

  const renderReport = ({ item }: { item: Report }) => {
    const title = item.eventtype || item.itemtype || item.hazardtype || "Details";
    const iconMeta = getIconForCategory(item.category);
    const distanceText = toKmString(item.location);

    return (
      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconBubble, { backgroundColor: iconMeta.color + "22" }]}>
            <Ionicons name={iconMeta.name as any} size={22} color={iconMeta.color} />
          </View>

          <View style={styles.cardTextWrap}>
            <Text numberOfLines={1} style={styles.cardTitle}>
              {title}
            </Text>
            <Text numberOfLines={2} style={styles.cardSubtitle}>
              {item.description || "No additional details provided."}
            </Text>

            <View style={styles.chipsRow}>
              <View style={styles.chip}>
                <Ionicons name="location-outline" size={14} color={textSecondary} />
                <Text style={styles.chipText}>{distanceText ?? "Nearby"}</Text>
              </View>

              <View style={styles.chip}>
                <MaterialCommunityIcons
                  name="tag-outline"
                  size={14}
                  color={textSecondary}
                />
                <Text style={styles.chipText}>
                  {item.category?.charAt(0).toUpperCase() + item.category?.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top actions row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleDropdown}>
          <Ionicons name="add-circle-outline" size={18} color={textPrimary} />
          <Text style={styles.actionText}>New Item</Text>
        </TouchableOpacity>

        <View style={styles.actionSpacer} />

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="filter-outline" size={18} color={textPrimary} />
          <Text style={styles.actionText}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="map-outline" size={18} color={textPrimary} />
          <Text style={styles.actionText}>Map</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((t) => {
          const active = selectedTab === t;
          return (
            <TouchableOpacity
              key={t}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setSelectedTab(t)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {categoryDisplayNames[t]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error */}
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      {/* List */}
      <FlatList
        data={reports}
        keyExtractor={(r) => String(r.reportid)}
        renderItem={renderReport}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={26} color={textSecondary} />
            <Text style={styles.emptyText}>
              No reports within {distanceRadius} km.
            </Text>
          </View>
        }
      />

      {/* Example modal you already had (hook it up to your create flow later) */}
      <Modal visible={isDropdownVisible} transparent animationType="fade" onRequestClose={toggleDropdown}>
        <Pressable style={styles.modalOverlay} onPress={toggleDropdown}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Create new...</Text>
            <View style={styles.modalGrid}>
              {[
                { key: "event", label: "Event", icon: "calendar-outline", color: categoryColors.event },
                { key: "lost", label: "Lost Item", icon: "help-circle-outline", color: categoryColors.lost },
                { key: "found", label: "Found Item", icon: "checkmark-circle-outline", color: categoryColors.found },
                { key: "safety", label: "Hazard", icon: "alert-circle-outline", color: categoryColors.safety },
              ].map((c) => (
                <TouchableOpacity key={c.key} style={styles.modalCell} onPress={toggleDropdown}>
                  <View style={[styles.iconBubbleLg, { backgroundColor: c.color + "22" }]}>
                    <Ionicons name={c.icon as any} size={24} color={c.color} />
                  </View>
                  <Text style={styles.modalCellText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ---------------- helpers ---------------- */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pageBg,
    paddingTop: Platform.select({ ios: 14, android: 8 }),
  },

  /* Actions */
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: chipBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: {
    color: textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  actionSpacer: { flex: 1 },

  /* Tabs */
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: chipBg,
  },
  tabActive: {
    backgroundColor: "#374151", // slate-700
  },
  tabText: {
    color: textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: textPrimary,
  },

  /* List */
  listContent: {
    padding: 14,
    paddingBottom: 24,
  },
  separator: { height: 10 },

  /* Card */
  card: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: divider,
  },
  cardLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBubbleLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTextWrap: { flex: 1 },
  cardTitle: {
    color: textPrimary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  cardSubtitle: {
    color: textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: chipBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    color: textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  /* Empty */
  emptyWrap: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
  },
  emptyText: { color: textSecondary, fontSize: 14 },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderColor: divider,
  },
  modalTitle: {
    color: textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 12,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  modalCell: {
    width: "47%",
    backgroundColor: chipBg,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  modalCellText: {
    color: textPrimary,
    fontWeight: "600",
  },

  /* Error */
  errorText: {
    color: "#FCA5A5",
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
});
