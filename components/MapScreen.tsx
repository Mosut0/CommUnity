import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Region, MapMarker } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { ReportMarkers } from "./MapScreen/ReportMarkers";
import { useMarkerClusters } from "./MapScreen/MarkerCluster";
import { Report, parseLocation } from "./MapScreen/markerUtils";

interface MapScreenProps {
  distanceRadius: number;
  selectedReportId?: number;
  filter?: 'all' | 'hazard' | 'event' | 'lost' | 'found';
}

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const metersToDegreeOffset = (lat: number, meters: number) => {
  const latDegree = meters / 111320; // approx meters per degree latitude
  const lngDegree = meters / (111320 * Math.cos((lat * Math.PI) / 180));
  return { latDegree, lngDegree };
};

const parseLocation = (
  locationStr: string
): { latitude: number; longitude: number } | null => {
  try {
    // Expected format: "(lat,lng)"
    const coordsStr = locationStr.substring(1, locationStr.length - 1).trim();
    const parts = coordsStr.split(',').map(s => parseFloat(s.trim()));
    if (parts.length < 2) return null;
    let [lat, lng] = parts;

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    // Basic validation: lat must be between -90 and 90, lng between -180 and 180.
    // If values look swapped (e.g., lat outside [-90,90]), swap them.
    if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
      const tmp = lat;
      lat = lng;
      lng = tmp;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.warn(
        'parseLocation: coordinates out of bounds for',
        locationStr,
        '->',
        { lat, lng }
      );
      return null;
    }

    return { latitude: lat, longitude: lng };
  } catch (error) {
    console.error('Error parsing location:', error);
    return null;
  }
};

export default function MapScreen({
  distanceRadius,
  selectedReportId,
  filter = 'all',
}: MapScreenProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const markerReadyRef = useRef<Map<number, boolean>>(new Map());
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: number]: MapMarker | null }>({});
  // Track whether a marker was just pressed to avoid map onPress immediately clearing selection
  const markerPressedRef = useRef<boolean>(false);
  const markerPressTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedReport(prevSelected => {
      if (prevSelected) {
        const mr = markerRefs.current[prevSelected.reportid];
        if (mr && (mr as any).hideCallout) {
          try {
            (mr as any).hideCallout();
          } catch {
            // no-op: hideCallout may not be supported on all platforms
          }
        }
      }
      return null;
    });
  }, [filter]);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          loc => {
            setLocation(loc);
          }
        );
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get location. Please try again.');
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      console.log("Fetching reports...");
      
      const fetchId = Date.now();
      console.log(`Starting fetch request ${fetchId}`);

      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order('createdat', { ascending: false });

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
        return;
      }

      if (!reportsData || reportsData.length === 0) {
        console.log('No reports found');
        setReports([]);
        return;
      }

      console.log(`Found ${reportsData.length} reports for fetch ${fetchId}`);

      const enhancedReports = await Promise.all(
        reportsData.map(async report => {
          try {
            let additionalData = {};

            switch (report.category) {
              case 'event':
                const { data: eventData, error: eventError } = await supabase
                  .from("events")
                  .select("*")
                  .eq("reportid", report.reportid)
                  .maybeSingle();
                if (eventError) {
                  console.warn(
                    `Error fetching event data for report ${report.reportid}:`,
                    eventError
                  );
                }
                additionalData = eventData || {};
                break;
              case 'safety':
                const { data: hazardData, error: hazardError } = await supabase
                  .from('hazards')
                  .select('*')
                  .eq('reportid', report.reportid)
                  .maybeSingle();
                if (hazardError) {
                  console.warn(
                    `Error fetching hazard data for report ${report.reportid}:`,
                    hazardError
                  );
                }
                additionalData = hazardData || {};
                break;
              case 'lost':
                const { data: lostItemData, error: lostError } = await supabase
                  .from('lostitems')
                  .select('*')
                  .eq('reportid', report.reportid)
                  .maybeSingle();
                if (lostError) {
                  console.warn(
                    `Error fetching lost item data for report ${report.reportid}:`,
                    lostError
                  );
                }
                additionalData = lostItemData || {};
                break;
              case 'found':
                const { data: foundItemData, error: foundError } =
                  await supabase
                    .from('founditems')
                    .select('*')
                    .eq('reportid', report.reportid)
                    .maybeSingle();
                if (foundError) {
                  console.warn(
                    `Error fetching found item data for report ${report.reportid}:`,
                    foundError
                  );
                }
                additionalData = foundItemData || {};
                break;
            }

            return { ...report, ...additionalData };
          } catch (reportError) {
            console.error(`Error processing report ${report.reportid}:`, reportError);
            return report;
          }
        })
      );

      console.log(`Successfully processed ${enhancedReports.length} reports for fetch ${fetchId}`);
      
      if (isMountedRef.current) {
        setReports(enhancedReports);
      }
    } catch (error) {
      console.error("Error processing reports:", error);
    }
  }, []);

  const debouncedFetchReports = useCallback(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchReports();
      }
    }, 300);
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();

    const setupRealtimeSubscriptions = () => {
      console.log("Setting up real-time subscriptions...");
      
      const channelName = `reports-updates-${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reports',
          },
          payload => {
            console.log('Reports table changed:', payload);
            debouncedFetchReports();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
          },
          payload => {
            console.log('Events table changed:', payload);
            debouncedFetchReports();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'hazards',
          },
          payload => {
            console.log('Hazards table changed:', payload);
            debouncedFetchReports();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lostitems',
          },
          payload => {
            console.log('Lost items table changed:', payload);
            debouncedFetchReports();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'founditems',
          },
          payload => {
            console.log('Found items table changed:', payload);
            debouncedFetchReports();
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Successfully subscribed to real-time updates");
          } else if (status === "CHANNEL_ERROR") {
            console.log("Subscription error, retrying...");
            setTimeout(() => {
              setupRealtimeSubscriptions();
            }, 2000);
          }
        });

      return () => {
        console.log('Cleaning up subscriptions...');
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscriptions();

    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      cleanup();
      // clear any pending marker press timeout
      if (markerPressTimeoutRef.current) {
        clearTimeout(markerPressTimeoutRef.current);
      }
    };
  }, [fetchReports, debouncedFetchReports]);

  useEffect(() => {
    if (selectedReportId && reports.length > 0) {
      const reportToSelect = reports.find(
        report => report.reportid === selectedReportId
      );
      if (reportToSelect) {
        setSelectedReport(reportToSelect);
        
        const coords = parseLocation(reportToSelect.location);
        if (coords && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }, 100);
          
          setTimeout(() => {
            const markerRef = markerRefs.current[reportToSelect.reportid];
            if (markerRef) {
              markerRef.showCallout();
            }
          }, 100);
        }
      }
    }
  }, [selectedReportId, reports]);

  const clusters = useMarkerClusters(reports);

  const region: Region | undefined = useMemo(() => {
    if (!location) return undefined;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [location]);

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        onPress={() => {
          // If a marker was just pressed, ignore this map press (it comes immediately after marker press)
          if (markerPressedRef.current) return;

          // Immediately hide callout (if any) and clear selection to make the change instant
          if (selectedReport) {
            const mr = markerRefs.current[selectedReport.reportid];
            if (mr && mr.hideCallout) {
              try {
                mr.hideCallout();
              } catch {
                // ignore if hideCallout isn't supported on this platform
              }
            }
          }
          setSelectedReport(null);
        }}
        showsUserLocation={true}
        followsUserLocation={false}
        showsCompass={false}
      >
        <ReportMarkers
          reports={reports}
          selectedReport={selectedReport}
          onReportPress={(report: Report) => {
            setSelectedReport((prev: Report | null) => (prev?.reportid === report.reportid ? null : report));
          }}
          clusters={clusters}
          markerReadyRef={markerReadyRef}
          markerRefs={markerRefs}
          location={location}
          distanceRadius={distanceRadius}
          filter={filter}
        />
      </MapView>
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: '#0B1220',
    padding: 10,
    borderRadius: 20,
    opacity: 0.7,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
});
