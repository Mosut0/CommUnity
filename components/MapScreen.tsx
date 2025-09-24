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

export default function MapScreen({ distanceRadius, selectedReportId, filter = 'all' }: MapScreenProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const markerReadyRef = useRef<Map<number, boolean>>(new Map());
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);
  const mapRef = useRef<MapView>(null);
  const markerRefs = useRef<{ [key: number]: MapMarker | null }>({});

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
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
          (loc) => {
            setLocation(loc);
          }
        );
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Failed to get location. Please try again.");
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
        console.error("Error fetching reports:", reportsError);
        return;
      }

      if (!reportsData || reportsData.length === 0) {
        console.log("No reports found");
        setReports([]);
        return;
      }

      console.log(`Found ${reportsData.length} reports for fetch ${fetchId}`);

      const enhancedReports = await Promise.all(
        reportsData.map(async (report) => {
          try {
            let additionalData = {};

            switch (report.category) {
              case "event":
                const { data: eventData, error: eventError } = await supabase
                  .from("events")
                  .select("*")
                  .eq("reportid", report.reportid)
                  .maybeSingle();
                if (eventError) {
                  console.warn(`Error fetching event data for report ${report.reportid}:`, eventError);
                }
                additionalData = eventData || {};
                break;
              case "safety":
                const { data: hazardData, error: hazardError } = await supabase
                  .from("hazards")
                  .select("*")
                  .eq("reportid", report.reportid)
                  .maybeSingle();
                if (hazardError) {
                  console.warn(`Error fetching hazard data for report ${report.reportid}:`, hazardError);
                }
                additionalData = hazardData || {};
                break;
              case "lost":
                const { data: lostItemData, error: lostError } = await supabase
                  .from("lostitems")
                  .select("*")
                  .eq("reportid", report.reportid)
                  .maybeSingle();
                if (lostError) {
                  console.warn(`Error fetching lost item data for report ${report.reportid}:`, lostError);
                }
                additionalData = lostItemData || {};
                break;
              case "found":
                const { data: foundItemData, error: foundError } = await supabase
                  .from("founditems")
                  .select("*")
                  .eq("reportid", report.reportid)
                  .maybeSingle();
                if (foundError) {
                  console.warn(`Error fetching found item data for report ${report.reportid}:`, foundError);
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
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
          },
          (payload) => {
            console.log("Reports table changed:", payload);
            debouncedFetchReports();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "events",
          },
          (payload) => {
            console.log("Events table changed:", payload);
            debouncedFetchReports();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "hazards",
          },
          (payload) => {
            console.log("Hazards table changed:", payload);
            debouncedFetchReports();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "lostitems",
          },
          (payload) => {
            console.log("Lost items table changed:", payload);
            debouncedFetchReports();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "founditems",
          },
          (payload) => {
            console.log("Found items table changed:", payload);
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
        console.log("Cleaning up subscriptions...");
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
    };
  }, [fetchReports, debouncedFetchReports]);

  useEffect(() => {
    if (selectedReportId && reports.length > 0) {
      const reportToSelect = reports.find(report => report.reportid === selectedReportId);
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
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 20,
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
    opacity: 0.7,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
  },
});
