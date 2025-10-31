import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Region, MapMarker } from 'react-native-maps';
import ReportCard from '@/components/ReportCard';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useReports } from '@/hooks/useReports';
import { Report, ReportCategory } from '@/types/report';
import {
  parseLocation,
  getMarkerColor,
  getCategoryIcon,
  getIconSize,
  matchesFilter,
  clusterReports,
  getDisplayCoords,
  getDistanceKm,
} from '@/utils/reportUtils';
import { useRouter } from 'expo-router';

interface MapScreenProps {
  distanceRadius: number;
  selectedReportId?: number;
  filter?: 'all' | 'hazard' | 'event' | 'lost' | 'found';
  onReportCardChange?: (isOpen: boolean) => void;
}

export default function MapScreen({
  distanceRadius,
  selectedReportId,
  filter = 'all',
  onReportCardChange,
}: MapScreenProps) {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Refs for marker management
  const markerReadyRef = useRef<Map<number, boolean>>(new Map());
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: number]: MapMarker | null }>({});
  const markerPressedRef = useRef<boolean>(false);
  const markerPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const colorScheme = useColorScheme() ?? 'light';
  const isMountedRef = useRef(true);

  // Use the centralized reports hook
  const { reports, loading, error, selectReport } = useReports({
    autoFetch: true,
  });

  // Cleanup mounted ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // When the filter changes, clear any selected report
  useEffect(() => {
    setSelectedReport(null);
    onReportCardChange?.(false);
  }, [filter, onReportCardChange]);

  // Fetch user location
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        // Get the current location once
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Subscribe to location updates
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          loc => {
            if (isMountedRef.current) {
              setLocation(loc);
            }
          }
        );
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get location. Please try again.');
      }
    })();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Auto-select report when selectedReportId is provided
  useEffect(() => {
    if (selectedReportId && reports.length > 0) {
      const reportToSelect = reports.find(
        report => report.reportid === selectedReportId
      );
      if (reportToSelect) {
        setSelectedReport(reportToSelect);
        selectReport(reportToSelect);

        // Focus the map on the selected report
        const coords = parseLocation(reportToSelect.location);
        if (coords && mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            100
          );

          // Show the callout for the selected marker after the animation
          setTimeout(() => {
            const markerRef = markerRefs.current[reportToSelect.reportid];
            if (markerRef) {
              markerRef.showCallout();
            }
          }, 100);
        }
      }
    }
  }, [selectedReportId, reports, selectReport]);

  // Filter reports based on current filter and distance
  const filteredReports = useMemo(() => {
    if (!location) return [];

    return reports.filter(report => {
      // Check filter match
      if (!matchesFilter(report, filter)) return false;

      // Check distance
      const coords = parseLocation(report.location);
      if (!coords) return false;

      const distance = getDistanceKm(
        location.coords.latitude,
        location.coords.longitude,
        coords.latitude,
        coords.longitude
      );

      return distance <= distanceRadius;
    });
  }, [reports, filter, location, distanceRadius]);

  // Cluster reports to avoid marker stacking
  const clusters = useMemo(() => {
    return clusterReports(filteredReports);
  }, [filteredReports]);

  // Define the initial map region
  const region: Region | undefined = useMemo(() => {
    if (!location) return undefined;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

  // Handle marker press
  const handleMarkerPress = useCallback(
    (report: Report) => {
      // Mark that a marker was pressed
      markerPressedRef.current = true;

      // Clear any existing timeout
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
      }

      // Reset the markerPressed flag shortly after
      markerPressTimeoutRef.current = setTimeout(() => {
        markerPressedRef.current = false;
        markerPressTimeoutRef.current = null;
      }, 200);

      // Toggle selection
      const newSelection =
        selectedReport?.reportid === report.reportid ? null : report;
      setSelectedReport(newSelection);
      selectReport(newSelection);
      onReportCardChange?.(newSelection !== null);

      // Show/hide callout
      if (newSelection) {
        setTimeout(() => {
          const mr = markerRefs.current[report.reportid];
          if (mr && mr.showCallout) {
            try {
              mr.showCallout();
            } catch (e) {
              console.error('Error calling showCallout on marker:', e);
            }
          }
        }, 0);
      } else {
        const mr = markerRefs.current[report.reportid];
        if (mr && mr.hideCallout) {
          try {
            mr.hideCallout();
          } catch (e) {
            console.error('Error calling hideCallout on marker:', e);
          }
        }
      }
    },
    [selectedReport, selectReport, onReportCardChange]
  );

  // Handle map press
  const handleMapPress = useCallback(() => {
    // If a marker was just pressed, ignore this map press
    if (markerPressedRef.current) return;

    // Clear selection
    setSelectedReport(null);
    selectReport(null);
    onReportCardChange?.(false);
  }, [selectReport, onReportCardChange]);

  // Render marker icon
  const renderMarkerIcon = useCallback(
    (report: Report, isSelected: boolean) => {
      const iconName = getCategoryIcon(report.category as ReportCategory);
      const iconSize = getIconSize('marker');
      const iconColor = isSelected
        ? '#fff'
        : getMarkerColor(report.category as ReportCategory);

      return (
        <Ionicons name={iconName as any} size={iconSize} color={iconColor} />
      );
    },
    []
  );

  // Loading state
  if (errorMsg) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading current location...</Text>
      </View>
    );
  }

  // For loading/error of reports, show a small non-blocking overlay instead of blocking the screen

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation={true}
        followsUserLocation={false}
        showsCompass={false}
      >
        {/* Render markers for filtered reports */}
        {filteredReports.map(report => {
          const coords = parseLocation(report.location);
          if (!coords) return null;

          const isSelected = selectedReport?.reportid === report.reportid;
          const tracksViewChanges = !markerReadyRef.current.get(
            report.reportid
          );
          const displayCoords = getDisplayCoords(report, coords, clusters);

          return (
            <Marker
              key={report.reportid}
              ref={ref => {
                markerRefs.current[report.reportid] = ref;
              }}
              coordinate={displayCoords}
              onPress={() => handleMarkerPress(report)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={tracksViewChanges}
            >
              <View
                style={[
                  styles.iconWrapper,
                  isSelected
                    ? {
                        backgroundColor: getMarkerColor(
                          report.category as ReportCategory
                        ),
                        shadowColor: getMarkerColor(
                          report.category as ReportCategory
                        ),
                        elevation: 4,
                      }
                    : colorScheme === 'dark'
                      ? styles.iconWrapperDark
                      : styles.iconWrapperLight,
                ]}
              >
                {renderMarkerIcon(report, isSelected)}
              </View>

              {/* Mark marker as ready to stop tracking view changes */}
              {tracksViewChanges && (
                <View
                  onLayout={() => {
                    markerReadyRef.current.set(report.reportid, true);
                  }}
                  style={{ width: 0, height: 0 }}
                />
              )}

              {/* No map callout; we show a bottom sheet instead */}
            </Marker>
          );
        })}
      </MapView>

      {/* Bottom sheet for selected report */}
      {selectedReport && (
        <ReportCard
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null);
            onReportCardChange?.(false);
          }}
          onDetails={() => {
            router.push({
              pathname: '/report-details',
              params: { reportId: String(selectedReport.reportid) },
            });
          }}
        />
      )}

      {loading && (
        <View style={styles.cornerOverlay}>
          <Text style={styles.cornerOverlayText}>Loading reports...</Text>
        </View>
      )}

      {!!error && (
        <View style={styles.cornerOverlayError}>
          <Text style={styles.cornerOverlayText}>Failed to load reports</Text>
        </View>
      )}

      {/* Bottom sheet for selected report */}
      {selectedReport && (
        <ReportCard
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null);
            onReportCardChange?.(false);
          }}
          onDetails={() => {
            router.push({
              pathname: '/report-details',
              params: { reportId: String(selectedReport.reportid) },
            });
          }}
        />
      )}

      {loading && (
        <View style={styles.cornerOverlay}>
          <Text style={styles.cornerOverlayText}>Loading reports...</Text>
        </View>
      )}

      {!!error && (
        <View style={styles.cornerOverlayError}>
          <Text style={styles.cornerOverlayText}>Failed to load reports</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  callout: {
    width: 200,
    padding: 15,
    borderRadius: 10,
  },
  calloutLight: {
    backgroundColor: '#FAF9F6',
  },
  calloutDark: {
    backgroundColor: '#0B1220',
  },
  calloutActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  calloutButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  calloutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  iconWrapperLight: {
    backgroundColor: '#FAF9F6',
  },
  iconWrapperDark: {
    backgroundColor: '#0B1220',
  },
  cornerOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cornerOverlayError: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(239,68,68,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cornerOverlayText: {
    color: '#fff',
    fontSize: 12,
  },
});
