import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MARKER_COLORS } from '@/constants/Markers';

interface Report {
  reportid: number;
  category: string;
  description: string;
  location: string;
  eventtype?: string;
  itemtype?: string;
  hazardtype?: string;
}

interface ReportCardProps {
  report: Report;
  distanceText?: string | null;
  isHighlighted?: boolean;
}

const getIconForCategory = (category: string) => {
  switch (category) {
    case "event":
      return { name: "calendar-outline", color: MARKER_COLORS.event };
    case "lost":
      return { name: "help-circle-outline", color: MARKER_COLORS.lost };
    case "found":
      return { name: "checkmark-circle-outline", color: MARKER_COLORS.found };
    case "safety":
      return { name: "alert-circle-outline", color: MARKER_COLORS.safety };
    default:
      return { name: "information-circle-outline", color: "#60A5FA" };
  }
};

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  distanceText, 
  isHighlighted = false 
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const title = report.eventtype || report.itemtype || report.hazardtype || "Details";
  const iconMeta = getIconForCategory(report.category);

  const handlePress = () => {
    router.push({
      pathname: "/forums/report/[id]",
      params: { id: String(report.reportid) }
    });
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={[styles.card, isHighlighted && styles.cardHighlighted]}
      onPress={handlePress}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.iconBubble, { backgroundColor: iconMeta.color + "22" }]}>
          <Ionicons name={iconMeta.name as any} size={22} color={iconMeta.color} />
        </View>

        <View style={styles.cardTextWrap}>
          <Text numberOfLines={1} style={styles.cardTitle}>
            {title}
          </Text>
          <Text numberOfLines={2} style={styles.cardSubtitle}>
            {report.description || "No additional details provided."}
          </Text>

          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.chipText}>{distanceText ?? "Nearby"}</Text>
            </View>

            <View style={styles.chip}>
              <MaterialCommunityIcons name="tag-outline" size={14} color={theme.textSecondary} />
              <Text style={styles.chipText}>
                {report.category?.charAt(0).toUpperCase() + report.category?.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

/* ---------- Theme tokens ---------- */
type UiTheme = {
  chipBg: string;
  cardBg: string;
  pageBg: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  primaryBtnBg: string;
  primaryBtnText: string;
};

const darkTheme: UiTheme = {
  chipBg: "#1F2937",
  cardBg: "#0F172A",
  pageBg: "#0B1220",
  textPrimary: "#E5E7EB",
  textSecondary: "#9CA3AF",
  divider: "#1F2A37",
  primaryBtnBg: "#2563EB",
  primaryBtnText: "#FFFFFF",
};

const lightTheme: UiTheme = {
  chipBg: "#F1F5F9",
  cardBg: "#FFFFFF",
  pageBg: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  divider: "#E5E7EB",
  primaryBtnBg: "#2563EB",
  primaryBtnText: "#FFFFFF",
};

/* ---------- styles ---------- */
const makeStyles = (t: UiTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: t.divider,
    },
    cardHighlighted: {
      borderColor: t.primaryBtnBg,
      shadowColor: t.primaryBtnBg,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    cardLeft: { 
      flexDirection: "row", 
      alignItems: "flex-start", 
      gap: 12, 
      flex: 1 
    },
    iconBubble: { 
      width: 36, 
      height: 36, 
      borderRadius: 18, 
      alignItems: "center", 
      justifyContent: "center" 
    },
    cardTextWrap: { flex: 1 },
    cardTitle: { 
      color: t.textPrimary, 
      fontSize: 16, 
      fontWeight: "700", 
      marginBottom: 2 
    },
    cardSubtitle: { 
      color: t.textSecondary, 
      fontSize: 13, 
      lineHeight: 18 
    },
    chipsRow: { 
      flexDirection: "row", 
      gap: 8, 
      marginTop: 10 
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: t.chipBg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
    },
    chipText: { 
      color: t.textSecondary, 
      fontSize: 12, 
      fontWeight: "600" 
    },
  });
