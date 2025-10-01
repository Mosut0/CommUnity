import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Alert,
  Linking,
  Platform,
  Share,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { getDistanceKm, formatDistance } from '@/utils/distance';
import { MARKER_COLORS } from '@/constants/Markers';

interface DetailedReport {
  reportid: number;
  category: string;
  description: string;
  location: string;
  created_at: string;
  eventtype?: string;
  eventtime?: string;
  itemtype?: string;
  hazardtype?: string;
  userid?: string;
  imageurl?: string;
}

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
  headerBg: string;
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
  headerBg: "#111827",
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
  headerBg: "#FFFFFF",
};

export default function ReportView() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        }
      } catch (e) {
        console.error("Error getting location:", e);
      }
    })();
  }, []);

  useEffect(() => {
    // Load user's distance unit preference
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const unit = data.user.user_metadata?.distance_unit || 'km';
        setDistanceUnit(unit);
      }
    });
  }, []);

  useEffect(() => {
    if (report && location) {
      const coords = parseLocation(report.location);
      if (coords) {
        const distance = getDistanceKm(
          location.coords.latitude,
          location.coords.longitude,
          coords.latitude,
          coords.longitude
        );
        const formattedDistance = formatDistance(distance, distanceUnit);
        setDistanceText(formattedDistance);
      }
    }
  }, [report, location, distanceUnit]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setImageError(false);
      setImageLoading(true);
      setRetryCount(0);
      
      const { data, error } = await supabase
        .from("reports")
        .select(`
          reportid,
          category,
          description,
          location,
          createdat,
          userid,
          imageurl,
          eventtype:events(eventtype, time),
          lostitemtype:lostitems(itemtype),
          founditemtype:founditems(itemtype),
          hazardtype:hazards(hazardtype)
        `)
        .eq("reportid", id)
        .single();

      if (error) {
        console.error("Error fetching report details:", error);
        Alert.alert("Error", "Failed to load report details");
        router.back();
        return;
      }

      const formattedReport: DetailedReport = {
        reportid: data.reportid,
        category: data.category,
        description: data.description,
        location: data.location,
        created_at: data.createdat,
        userid: data.userid,
        imageurl: data.imageurl,
        eventtype: data.eventtype?.[0]?.eventtype || "",
        eventtime: data.eventtype?.[0]?.time || "",
        itemtype: data.lostitemtype?.[0]?.itemtype || data.founditemtype?.[0]?.itemtype || "",
        hazardtype: data.hazardtype?.[0]?.hazardtype || "",
      };

      setReport(formattedReport);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Something went wrong");
      router.back();
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewOnMap = () => {
    router.push({
      pathname: "/",
      params: { focusReportId: String(report?.reportid) }
    });
  };

  const openDirections = () => {
    if (!report) return;
    
    const coords = parseLocation(report.location);
    if (!coords) {
      Alert.alert("Error", "Invalid location data");
      return;
    }

    const url = Platform.select({
      ios: `maps://app?daddr=${coords.latitude},${coords.longitude}`,
      android: `geo:${coords.latitude},${coords.longitude}?q=${coords.latitude},${coords.longitude}`,
    });

    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open maps app");
      });
    }
  };

  const handleShare = async () => {
    if (!report) return;

    const title = report.eventtype || report.itemtype || report.hazardtype || "Report";
    const message = `Check out this ${report.category}: ${title}\n\n${report.description}`;

    try {
      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReportDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Not Found</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.errorText}>This report could not be found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconMeta = getIconForCategory(report.category);
  const title = report.eventtype || report.itemtype || report.hazardtype || "Report Details";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBubble, { backgroundColor: iconMeta.color + "22" }]}>
              <Ionicons name={iconMeta.name as any} size={24} color={iconMeta.color} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.mainTitle}>{title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {report.category?.charAt(0).toUpperCase() + report.category?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {report.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>
          )}

          {/* Image */}
          {report.imageurl && !imageError && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Image</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: report.imageurl }}
                  style={styles.image}
                  onError={() => setImageError(true)}
                  onLoad={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <View style={styles.imageLoading}>
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.detailText}>
                {distanceText ? `${distanceText} away` : "Location available"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
              <Text style={styles.detailText}>
                {new Date(report.created_at).toLocaleString()}
              </Text>
            </View>

            {report.eventtime && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                <Text style={styles.detailText}>
                  Event time: {new Date(report.eventtime).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton} onPress={handleViewOnMap}>
            <Ionicons name="map-outline" size={20} color={theme.primaryBtnText} />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={openDirections}>
            <Ionicons name="navigate-outline" size={20} color={theme.textPrimary} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={theme.textPrimary} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const makeStyles = (t: UiTheme) =>
  StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: t.pageBg 
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: t.pageBg,
      borderBottomWidth: 1,
      borderBottomColor: t.divider,
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      color: t.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
    content: {
      flex: 1,
      padding: 16,
    },
    mainCard: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.divider,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    iconBubble: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    headerText: {
      flex: 1,
    },
    mainTitle: {
      color: t.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
    },
    categoryBadge: {
      backgroundColor: t.chipBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: "flex-start",
    },
    categoryText: {
      color: t.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    descriptionSection: {
      marginTop: 8,
    },
    sectionTitle: {
      color: t.textPrimary,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
    },
    descriptionText: {
      color: t.textSecondary,
      fontSize: 15,
      lineHeight: 22,
    },
    imageSection: {
      marginTop: 16,
    },
    imageContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: t.chipBg,
    },
    image: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    imageLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: t.chipBg,
    },
    detailsSection: {
      marginTop: 16,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    detailText: {
      color: t.textSecondary,
      fontSize: 14,
    },
    actionsCard: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: t.divider,
      gap: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: t.primaryBtnBg,
      gap: 8,
    },
    secondaryButton: {
      backgroundColor: t.chipBg,
    },
    actionButtonText: {
      color: t.primaryBtnText,
      fontSize: 16,
      fontWeight: "600",
    },
    secondaryButtonText: {
      color: t.textPrimary,
    },
    loadingText: {
      color: t.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    errorText: {
      color: t.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
  });
