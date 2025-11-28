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
  Modal,
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
  onDetails?: () => void;
};

export default function ReportCard({ report, onClose, onDetails }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const accentColor =
    (MARKER_COLORS as any)[report.category] || MARKER_COLORS.default;
  const [imageError, setImageError] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

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

    // Add deep link to the report
    const deepLink = `myapp://report/${report.reportid}`;
    shareMessage += `\n\nView in CommUnity app: ${deepLink}`;

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
              <TouchableOpacity
                onPress={() => setImageModalVisible(true)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: report.imageurl }}
                  style={styles.reportImage}
                  resizeMode='cover'
                  onError={() => setImageError(true)}
                />
                <View style={styles.expandIconContainer}>
                  <Ionicons name='expand-outline' size={20} color='#fff' />
                </View>
              </TouchableOpacity>
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

        {/* Event-specific details */}
        {report.category === 'event' && report.eventtype && (
          <View style={styles.detailRow}>
            <Ionicons
              name='pricetag-outline'
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
              Event: {report.eventtype}
            </Text>
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
              Event Time: {formatDate(report.time)}
            </Text>
          </View>
        )}

        {/* Hazard-specific details */}
        {report.category === 'hazard' && report.hazardtype && (
          <View style={styles.detailRow}>
            <Ionicons
              name='warning-outline'
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
              Hazard: {report.hazardtype}
            </Text>
          </View>
        )}

        {/* Lost/Found items-specific details */}
        {(report.category === 'lost' || report.category === 'found') &&
          report.itemtype && (
            <View style={styles.detailRow}>
              <Ionicons
                name='cube-outline'
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
                Item: {report.itemtype}
              </Text>
            </View>
          )}

        {(report.category === 'lost' || report.category === 'found') &&
          report.contactinfo && (
            <View style={styles.detailRow}>
              <Ionicons
                name='mail-outline'
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
                Contact: {report.contactinfo}
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
          {onDetails && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDetails}
              activeOpacity={0.85}
            >
              <Ionicons
                name='information-circle-outline'
                size={18}
                color={'#fff'}
              />
              <Text style={styles.actionButtonText}>Details</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.actionButton,
              onDetails ? styles.secondaryButton : {},
            ]}
            onPress={openDirections}
            activeOpacity={0.85}
          >
            <Ionicons
              name='navigate-outline'
              size={18}
              color={onDetails ? (scheme === 'dark' ? '#fff' : '#000') : '#fff'}
            />
            <Text
              style={[
                styles.actionButtonText,
                onDetails ? styles.secondaryButtonText : {},
                onDetails
                  ? scheme === 'dark'
                    ? styles.textDark
                    : styles.textLight
                  : {},
              ]}
            >
              Directions
            </Text>
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
            <Image
              source={{ uri: report.imageurl }}
              style={styles.fullScreenImage}
              resizeMode='contain'
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: Dimensions.get('window').height * 0.7,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
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
  expandIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 32,
    height: 32,
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
