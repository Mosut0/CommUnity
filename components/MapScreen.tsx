import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "./ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";

// Define the structure of a report
interface Report {
  reportid: number;
  category: string;
  description: string;
  location: string; // In the format "(lat,lng)"
  createdAt: string;
  imageurl?: string;
  // Additional fields depending on report type
  eventtype?: string;
  hazardtype?: string;
  itemtype?: string;
  contactinfo?: string;
  time?: string;
}

interface MapScreenProps {
  distanceRadius: number;
}

export default function MapScreen({ distanceRadius }: MapScreenProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<number | null>(null);

  // Cleanup mounted ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch user location
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      try {
        // Request location permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        // Get the current location once
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        // Subscribe to location updates
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // update every second
            distanceInterval: 1, // update every meter
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

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Function to fetch all reports
  const fetchReports = useCallback(async () => {
    try {
      console.log("Fetching reports...");
      
      // Create a timestamp to track this fetch request
      const fetchId = Date.now();
      console.log(`Starting fetch request ${fetchId}`);

      // First fetch basic report data
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order('createdat', { ascending: false }); // Order by newest first

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

      // For each report, fetch additional details based on category
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
                  .maybeSingle(); // Use maybeSingle instead of single to avoid errors
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
            // Return the basic report data even if additional data fails
            return report;
          }
        })
      );

      console.log(`Successfully processed ${enhancedReports.length} reports for fetch ${fetchId}`);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setReports(enhancedReports);
      }
    } catch (error) {
      console.error("Error processing reports:", error);
      // Don't clear existing reports on error, keep what we have
    }
  }, []);

  // Debounced version of fetchReports to prevent too many rapid calls
  const debouncedFetchReports = useCallback(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Set a new timeout
    fetchTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchReports();
      }
    }, 300); // 300ms debounce
  }, [fetchReports]);

  // Fetch reports on component mount and set up real-time subscription
  useEffect(() => {
    // Initial data fetch
    fetchReports();

    // Set up Supabase subscription for real-time updates
    const setupRealtimeSubscriptions = () => {
      console.log("Setting up real-time subscriptions...");
      
      // Create a unique channel name to avoid conflicts
      const channelName = `reports-updates-${Date.now()}`;
      
      // Subscribe to changes in the reports table and related tables
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
            console.error("Subscription error, retrying...");
            // Retry subscription after a delay
            setTimeout(() => {
              setupRealtimeSubscriptions();
            }, 2000);
          }
        });

      // Return cleanup function
      return () => {
        console.log("Cleaning up subscriptions...");
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscriptions();

    // Clean up subscription when component unmounts
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      cleanup();
    };
  }, [fetchReports, debouncedFetchReports]);

  // Parse location string from the database into latitude and longitude
  const parseLocation = (
    locationStr: string
  ): { latitude: number; longitude: number } | null => {
    try {
      // Expected format: "(lat,lng)"
      const coordsStr = locationStr.substring(1, locationStr.length - 1);
      const [lat, lng] = coordsStr.split(",").map(parseFloat);

      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.error("Error parsing location:", error);
      return null;
    }
  };

  // Get appropriate marker color based on report category
  const getMarkerColor = (category: string): string => {
    switch (category) {
      case "event":
        return "#4285F4"; // Blue
      case "safety":
        return "#EA4335"; // Red
      case "lost":
        return "#FBBC05"; // Yellow
      case "found":
        return "#34A853"; // Green
      default:
        return "#9E9E9E"; // Gray
    }
  };

  // Generate title for the marker based on report type
  const getReportTitle = (report: Report): string => {
    switch (report.category) {
      case "event":
        return `Event: ${report.eventtype || ""}`;
      case "safety":
        return `Hazard: ${report.hazardtype || ""}`;
      case "lost":
        return `Lost: ${report.itemtype || ""}`;
      case "found":
        return `Found: ${report.itemtype || ""}`;
      default:
        return "Report";
    }
  };

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

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1);
    let dLon = deg2rad(lon2 - lon1);
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        followsUserLocation={false}
      >
        {/* Render markers for all reports */}
        {reports.map((report) => {
          const coords = parseLocation(report.location);
          if (!coords) return null;

          const distance = getDistanceFromLatLonInKm(
            location.coords.latitude,
            location.coords.longitude,
            coords.latitude,
            coords.longitude
          );

          if (distance > distanceRadius) return null;

          return (
            <Marker
              key={report.reportid}
              coordinate={coords}
              pinColor={getMarkerColor(report.category)}
              onPress={() => setSelectedReport(report)}
            >
              <Callout tooltip>
                <View
                  style={[
                    styles.callout,
                    colorScheme === "dark"
                      ? styles.calloutDark
                      : styles.calloutLight,
                  ]}
                >
                  <ThemedText type="defaultSemiBold">
                    {getReportTitle(report)}
                  </ThemedText>
                  <ThemedText>{report.description}</ThemedText>
                  {report.contactinfo && (
                    <ThemedText>Contact: {report.contactinfo}</ThemedText>
                  )}
                  {report.time && (
                    <ThemedText>
                      Time: {new Date(report.time).toLocaleString()}
                    </ThemedText>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
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
  callout: {
    width: 200,
    padding: 15,
    borderRadius: 10,
  },
  calloutLight: {
    backgroundColor: "#fff",
  },
  calloutDark: {
    backgroundColor: "#333",
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
