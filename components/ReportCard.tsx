import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  Image,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report } from '@/types/report';
import {
  getReportTitle,
  getCategoryIcon,
  getIconSize,
} from '@/utils/reportUtils';
import { MARKER_COLORS } from '@/constants/Markers';
import { useColorScheme } from '@/hooks/useColorScheme';
import { parseLocation } from '@/utils/reportUtils';

type Props = {
  report: Report;
  onClose: () => void;
};

export default function ReportCard({ report, onClose }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const accentColor =
    (MARKER_COLORS as any)[report.category] || MARKER_COLORS.default;
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' at ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const openDirections = async () => {
    const coords = parseLocation(report.location);
    if (!coords) {
      Alert.alert('Error', 'Invalid location format');
      return;
    }

    const { latitude, longitude } = coords;

    try {
      const googleMapsUrl =
        Platform.OS === 'ios'
          ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
          : `google.navigation:q=${latitude},${longitude}`;

      const canOpenGoogleMaps = await Linking.canOpenURL(googleMapsUrl);

      if (canOpenGoogleMaps) {
        await Linking.openURL(googleMapsUrl);
      } else {
        const fallbackUrl =
          Platform.OS === 'ios'
            ? `maps://app?daddr=${latitude},${longitude}`
            : `geo:${latitude},${longitude}?q=${latitude},${longitude}`;

        const canOpenFallback = await Linking.canOpenURL(fallbackUrl);

        if (canOpenFallback) {
          await Linking.openURL(fallbackUrl);
        } else {
          Alert.alert('Error', 'No maps application available');
        }
      }
    } catch (error) {
      console.error('Error opening directions:', error);
      Alert.alert('Error', 'Failed to open directions');
    }
  };

  const handleShare = async () => {
    const title =
      report.eventtype ||
      report.itemtype ||
      report.hazardtype ||
      'Community Report';
    const category =
      report.category?.charAt(0).toUpperCase() + report.category?.slice(1);
    const postedDate = formatDate(report.createdat);

    let shareMessage = `${category}: ${title}\n\n`;

    if (report.description) {
      shareMessage += `${report.description}\n\n`;
    }

    shareMessage += `Posted: ${postedDate}`;
    shareMessage += `\n\nShared from CommUnity app`;

    try {
      await Share.share({
        message: shareMessage,
        title: `${category} - ${title}`,
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  };

  return (
    <View
      style={[
        styles.container,
        scheme === 'dark' ? styles.containerDark : styles.containerLight,
      ]}
    >
      <View style={styles.titleRow}>
        <Ionicons
          name={getCategoryIcon(report.category) as any}
          size={getIconSize('detail')}
          color={accentColor}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            scheme === 'dark' ? styles.textDark : styles.textLight,
          ]}
        >
          {getReportTitle(report)}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons
            name='close'
            size={20}
            color={scheme === 'dark' ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryBadge}>
          <Text
            style={[
              styles.categoryText,
              scheme === 'dark'
                ? styles.textSecondaryDark
                : styles.textSecondaryLight,
            ]}
          >
            {report.category?.charAt(0).toUpperCase() +
              report.category?.slice(1)}
          </Text>
        </View>

        {report.description && (
          <Text
            style={[
              styles.description,
              scheme === 'dark'
                ? styles.textSecondaryDark
                : styles.textSecondaryLight,
            ]}
          >
            {report.description}
          </Text>
        )}

        {report.imageurl && isValidImageUrl(report.imageurl) && (
          <View style={styles.imageContainer}>
            {!imageError ? (
              <Image
                source={{ uri: report.imageurl }}
                style={styles.reportImage}
                resizeMode='cover'
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.imageErrorContainer}>
                <Ionicons
                  name='image-outline'
                  size={32}
                  color={scheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
                <Text
                  style={[
                    styles.imageErrorText,
                    scheme === 'dark'
                      ? styles.textSecondaryDark
                      : styles.textSecondaryLight,
                  ]}
                >
                  Image unavailable
                </Text>
              </View>
            )}
          </View>
        )}

        {report.category === 'event' && report.time && (
          <View style={styles.detailRow}>
            <Ionicons
              name='calendar-outline'
              size={16}
              color={scheme === 'dark' ? '#9CA3AF' : '#6B7280'}
            />
            <Text
              style={[
                styles.detailText,
                scheme === 'dark'
                  ? styles.textSecondaryDark
                  : styles.textSecondaryLight,
              ]}
            >
              Event: {formatDate(report.time)}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons
            name='time-outline'
            size={16}
            color={scheme === 'dark' ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            style={[
              styles.detailText,
              scheme === 'dark'
                ? styles.textSecondaryDark
                : styles.textSecondaryLight,
            ]}
          >
            Posted: {formatDate(report.createdat)}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={openDirections}
            activeOpacity={0.85}
          >
            <Ionicons name='navigate-outline' size={18} color={'#fff'} />
            <Text style={styles.actionButtonText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons
              name='share-outline'
              size={18}
              color={scheme === 'dark' ? '#fff' : '#000'}
            />
            <Text
              style={[
                styles.actionButtonText,
                styles.secondaryButtonText,
                scheme === 'dark' ? styles.textDark : styles.textLight,
              ]}
            >
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    maxHeight: Dimensions.get('window').height * 0.7,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 6 },
    }),
  },
  containerLight: {
    backgroundColor: '#FAF9F6',
  },
  containerDark: {
    backgroundColor: '#0B1220',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  accentBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  reportImage: {
    width: '100%',
    height: 150,
  },
  imageErrorContainer: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageErrorText: {
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
    paddingBottom: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButton: {
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  textLight: { color: '#111827' },
  textDark: { color: '#F9FAFB' },
  textSecondaryLight: { color: '#374151' },
  textSecondaryDark: { color: '#D1D5DB' },
});
