import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { getDistanceKm, formatDistance } from '@/utils/distance';
import { MARKER_COLORS } from '@/constants/Markers';
import { Colors } from '@/constants/Colors';
import type { ThemeName } from '@/constants/Colors';
import ReportActions from '@/components/ReportActions';

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
  contactinfo?: string;
  userid?: string;
  imageurl?: string;
}

type ThemeColors = typeof Colors.light;

export default function ReportDetails() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();
  const scheme = useColorScheme();
  const themeName: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  const uiTheme = Colors[themeName];
  const styles = useMemo(() => makeStyles(uiTheme), [uiTheme]);

  const [report, setReport] = useState<DetailedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Get current user
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        }
      } catch (e) {
        console.error('Error getting location:', e);
      }
    })();
  }, []);

  useEffect(() => {
    // Load user's distance unit preference
    supabase.auth.getUser().then(({ data, error }) => {
      if (!error && data?.user) {
        const userMetadata = data.user.user_metadata;
        setDistanceUnit(userMetadata?.distance_unit || 'km');
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

  const fetchReportDetails = useCallback(
    async (showErrorAlert = true) => {
      try {
        setLoading(true);
        setImageError(false);
        setImageLoading(true);
        setRetryCount(0);

        const { data, error } = await supabase
          .from('reports')
          .select(
            `
          reportid,
          category,
          description,
          location,
          createdat,
          userid,
          imageurl,
          eventtype:events(eventtype, time),
          lostitemtype:lostitems(itemtype, contactinfo),
          founditemtype:founditems(itemtype, contactinfo),
          hazardtype:hazards(hazardtype)
        `
          )
          .eq('reportid', reportId)
          .single();

        if (error) {
          console.error('Error fetching report details:', error);
          if (showErrorAlert) {
            Alert.alert('Error', 'Failed to load report details');
            router.back();
          }
          throw error; // Throw error so it can be caught by caller
        }

        const formattedReport: DetailedReport = {
          reportid: data.reportid,
          category: data.category,
          description: data.description,
          location: data.location,
          created_at: data.createdat,
          userid: data.userid,
          imageurl: data.imageurl,
          eventtype: data.eventtype?.[0]?.eventtype || '',
          eventtime: data.eventtype?.[0]?.time || '',
          itemtype:
            data.lostitemtype?.[0]?.itemtype ||
            data.founditemtype?.[0]?.itemtype ||
            '',
          contactinfo:
            data.lostitemtype?.[0]?.contactinfo ||
            data.founditemtype?.[0]?.contactinfo ||
            '',
          hazardtype: data.hazardtype?.[0]?.hazardtype || '',
        };

        setReport(formattedReport);
      } catch (error) {
        console.error('Error:', error);
        if (showErrorAlert) {
          Alert.alert('Error', 'Something went wrong');
          router.back();
        } else {
          // Re-throw error so caller can handle it
          throw error;
        }
      } finally {
        setLoading(false);
      }
    },
    [reportId, router]
  );

  useEffect(() => {
    if (reportId) {
      fetchReportDetails();
    }
  }, [reportId, fetchReportDetails]);

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
        case 'hazard':
          return { name: 'alert-circle-outline', color: MARKER_COLORS.hazard };
        default:
          return { name: 'information-circle-outline', color: uiTheme.accent };
      }
    },
    [uiTheme.accent]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const openDirections = async () => {
    if (!report?.location) {
      Alert.alert('Error', 'Location not available for this report');
      return;
    }

    const coords = parseLocation(report.location);
    if (!coords) {
      Alert.alert('Error', 'Invalid location format');
      return;
    }

    const { latitude, longitude } = coords;

    try {
      if (Platform.OS === 'ios') {
        // Try Google Maps first
        const googleMapsUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;

        try {
          const supported = await Linking.canOpenURL(googleMapsUrl);
          if (supported) {
            await Linking.openURL(googleMapsUrl);
            return;
          }
        } catch {
          // Google Maps not installed, will fall through to Apple Maps
        }

        // Fall back to Apple Maps
        const appleMapsUrl = `maps://app?daddr=${latitude},${longitude}`;
        await Linking.openURL(appleMapsUrl);
      } else {
        // Android: try Google Maps navigation first
        const googleMapsUrl = `google.navigation:q=${latitude},${longitude}`;

        try {
          const supported = await Linking.canOpenURL(googleMapsUrl);
          if (supported) {
            await Linking.openURL(googleMapsUrl);
            return;
          }
        } catch {
          // Google Maps not installed, fall through
        }

        // Fall back to web version of Google Maps
        const webMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        await Linking.openURL(webMapsUrl);
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Failed to open directions');
    }
  };

  const handleShare = async () => {
    if (!report) {
      Alert.alert('Error', 'No report data to share');
      return;
    }

    const title =
      report.eventtype ||
      report.itemtype ||
      report.hazardtype ||
      'Community Report';
    const category =
      report.category?.charAt(0).toUpperCase() + report.category?.slice(1);
    const postedDate = formatDate(report.created_at);

    let shareMessage = `${category}: ${title}\n\n`;

    if (report.description) {
      shareMessage += `${report.description}\n\n`;
    }

    shareMessage += `Posted: ${postedDate}`;

    if (distanceText) {
      shareMessage += `\nDistance: ${distanceText}`;
    }

    // Add deep link to the report
    const deepLink = `myapp://report/${report.reportid}`;
    shareMessage += `\n\nView in CommUnity app: ${deepLink}`;

    try {
      const result = await Share.share({
        message: shareMessage,
        title: `${category} - ${title}`,
      });

      if (result.action === Share.sharedAction) {
        console.log('Report shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const handleViewOnMap = () => {
    if (!report) {
      Alert.alert('Error', 'No report data available');
      return;
    }

    router.push({
      pathname: './home' as any,
      params: { selectedReportId: report.reportid },
    });
  };

  const retryImageLoad = () => {
    if (retryCount < 3) {
      setImageError(false);
      setImageLoading(true);
      setRetryCount(prev => prev + 1);
    }
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name='chevron-back'
              size={24}
              color={uiTheme.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading report details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name='chevron-back'
              size={24}
              color={uiTheme.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconMeta = getIconForCategory(report.category);
  const title =
    report.eventtype || report.itemtype || report.hazardtype || 'Details';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name='chevron-back' size={24} color={uiTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Details</Text>
        {report && currentUserId && (
          <View style={styles.headerActions}>
            <ReportActions
              report={{
                reportid: report.reportid,
                userid: report.userid || '',
                category: report.category as any,
                description: report.description,
                location: report.location,
                createdat: report.created_at,
                eventtype: report.eventtype,
                time: report.eventtime,
                hazardtype: report.hazardtype,
                itemtype: report.itemtype,
                contactinfo: report.contactinfo,
              }}
              currentUserId={currentUserId}
              onUpdate={() => {
                fetchReportDetails();
              }}
              onDelete={() => {
                router.back();
              }}
              onReport={async () => {
                // Refresh details to check if pin was deleted
                // (in case it reached the report threshold for deletion)
                try {
                  await fetchReportDetails(false); // Don't show default error alert
                } catch {
                  // If the pin no longer exists, it was likely deleted due to reaching the report threshold
                  Alert.alert('Pin Removed', 'This pin has been removed', [
                    { text: 'OK', onPress: () => router.back() },
                  ]);
                }
              }}
            />
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: iconMeta.color + '22' },
              ]}
            >
              <Ionicons
                name={iconMeta.name as any}
                size={28}
                color={iconMeta.color}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.mainTitle}>{title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {report.category?.charAt(0).toUpperCase() +
                    report.category?.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {report.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>
          )}

          {report.imageurl && isValidImageUrl(report.imageurl) && (
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Image</Text>
              <View style={styles.imageContainer}>
                {!imageError ? (
                  <>
                    {imageLoading && (
                      <View style={styles.imageLoadingContainer}>
                        <Text style={styles.imageLoadingText}>
                          Loading image...
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => setImageModalVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Image
                        key={`${report.reportid}-${retryCount}`} // Force re-render on retry
                        source={{ uri: report.imageurl }}
                        style={styles.reportImage}
                        resizeMode='cover'
                        onLoadStart={() => {
                          console.log(
                            'Image loading started for:',
                            report.imageurl
                          );
                          setImageLoading(true);
                        }}
                        onLoad={() => {
                          console.log(
                            'Image loaded successfully:',
                            report.imageurl
                          );
                          setImageLoading(false);
                        }}
                        onError={error => {
                          console.log(
                            `Image failed to load (attempt ${retryCount + 1}):`,
                            report.imageurl,
                            error.nativeEvent.error
                          );
                          setImageError(true);
                          setImageLoading(false);
                        }}
                      />
                      <View style={styles.expandIconContainer}>
                        <Ionicons
                          name='expand-outline'
                          size={24}
                          color='#fff'
                        />
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.imageErrorContainer}>
                    <Ionicons
                      name='image-outline'
                      size={48}
                      color={uiTheme.textSecondary}
                    />
                    <Text style={styles.imageErrorText}>
                      Image could not be loaded
                    </Text>
                    {retryCount < 3 && (
                      <TouchableOpacity
                        style={styles.debugButton}
                        onPress={retryImageLoad}
                      >
                        <Text style={styles.debugButtonText}>
                          Retry ({retryCount}/3)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Details Sections */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Details</Text>

          {/* Event-specific details */}
          {report.category === 'event' && report.eventtype && (
            <View style={styles.detailRow}>
              <Ionicons
                name='pricetag-outline'
                size={18}
                color={uiTheme.textSecondary}
              />
              <Text style={styles.detailLabel}>Event Name:</Text>
              <Text style={styles.detailValue}>{report.eventtype}</Text>
            </View>
          )}

          {report.category === 'event' && report.eventtime && (
            <View style={styles.detailRow}>
              <Ionicons
                name='calendar-outline'
                size={18}
                color={uiTheme.textSecondary}
              />
              <Text style={styles.detailLabel}>Event Time:</Text>
              <Text style={styles.detailValue}>
                {formatDate(report.eventtime)}
              </Text>
            </View>
          )}

          {/* Hazard-specific details */}
          {report.category === 'hazard' && report.hazardtype && (
            <View style={styles.detailRow}>
              <Ionicons
                name='warning-outline'
                size={18}
                color={uiTheme.textSecondary}
              />
              <Text style={styles.detailLabel}>Hazard:</Text>
              <Text style={styles.detailValue}>{report.hazardtype}</Text>
            </View>
          )}

          {/* Lost/Found items-specific details */}
          {(report.category === 'lost' || report.category === 'found') &&
            report.itemtype && (
              <View style={styles.detailRow}>
                <Ionicons
                  name='cube-outline'
                  size={18}
                  color={uiTheme.textSecondary}
                />
                <Text style={styles.detailLabel}>Item:</Text>
                <Text style={styles.detailValue}>{report.itemtype}</Text>
              </View>
            )}

          {(report.category === 'lost' || report.category === 'found') &&
            report.contactinfo && (
              <View style={styles.detailRow}>
                <Ionicons
                  name='mail-outline'
                  size={18}
                  color={uiTheme.textSecondary}
                />
                <Text style={styles.detailLabel}>Contact:</Text>
                <Text style={styles.detailValue}>{report.contactinfo}</Text>
              </View>
            )}

          {/* Location details */}
          <View style={styles.detailRow}>
            <Ionicons
              name='location-outline'
              size={18}
              color={uiTheme.textSecondary}
            />
            <Text style={styles.detailLabel}>Distance:</Text>
            <Text style={styles.detailValue}>{distanceText || 'Unknown'}</Text>
          </View>

          {/* Created date */}
          <View style={styles.detailRow}>
            <Ionicons
              name='time-outline'
              size={18}
              color={uiTheme.textSecondary}
            />
            <Text style={styles.detailLabel}>Posted:</Text>
            <Text style={styles.detailValue}>
              {formatDate(report.created_at)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsCard}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewOnMap}
          >
            <Ionicons
              name='map-outline'
              size={20}
              color={uiTheme.primaryBtnText}
            />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={openDirections}
          >
            <Ionicons
              name='navigate-outline'
              size={20}
              color={uiTheme.textPrimary}
            />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Get Directions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
          >
            <Ionicons
              name='share-outline'
              size={20}
              color={uiTheme.textPrimary}
            />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType='slide'
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalOverlay}
            activeOpacity={1}
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.imageModalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Ionicons name='close' size={30} color='#fff' />
              </TouchableOpacity>
            </View>
            {report?.imageurl && (
              <Image
                source={{ uri: report.imageurl }}
                style={styles.fullScreenImage}
                resizeMode='contain'
              />
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- styles ---------- */
const makeStyles = (t: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.pageBg,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
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
      fontWeight: '600',
      flex: 1,
    },
    headerActions: {
      marginLeft: 'auto',
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
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    iconBubble: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    headerText: {
      flex: 1,
    },
    mainTitle: {
      color: t.textPrimary,
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 8,
    },
    categoryBadge: {
      backgroundColor: t.chipBg,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    categoryText: {
      color: t.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },

    descriptionSection: {
      marginTop: 8,
    },
    sectionTitle: {
      color: t.textPrimary,
      fontSize: 14,
      fontWeight: '600',
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
      borderWidth: 1,
      borderColor: t.divider,
    },
    reportImage: {
      width: '100%',
      height: 200,
    },
    imageLoadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.chipBg,
      zIndex: 1,
    },
    imageLoadingText: {
      color: t.textSecondary,
      fontSize: 14,
    },
    imageErrorContainer: {
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.chipBg,
    },
    imageErrorText: {
      color: t.textSecondary,
      fontSize: 14,
      marginTop: 8,
    },
    debugButton: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: t.primaryBtnBg,
      borderRadius: 6,
    },
    debugButtonText: {
      color: t.primaryBtnText,
      fontSize: 12,
      fontWeight: '600',
    },

    detailsCard: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: t.divider,
    },
    cardTitle: {
      color: t.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    detailLabel: {
      color: t.textSecondary,
      fontSize: 14,
      minWidth: 80,
    },
    detailValue: {
      color: t.textPrimary,
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },

    actionsCard: {
      gap: 12,
      marginBottom: 32,
    },
    actionButton: {
      backgroundColor: t.primaryBtnBg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      gap: 8,
    },
    actionButtonText: {
      color: t.primaryBtnText,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: t.chipBg,
      borderWidth: 1,
      borderColor: t.divider,
    },
    secondaryButtonText: {
      color: t.textPrimary,
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: t.textSecondary,
      fontSize: 16,
    },
    errorText: {
      color: t.errorText,
      fontSize: 16,
    },
    expandIconContainer: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 24,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    imageModalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageModalHeader: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 20,
      right: 20,
      zIndex: 10,
    },
    closeButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenImage: {
      width: '100%',
      height: '100%',
    },
  });
