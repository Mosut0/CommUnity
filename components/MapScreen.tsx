import React, { useEffect, useState, useMemo, useCallback } from "react";
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

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? "light";

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
      setIsLoading(true);
      console.log("Fetching reports...");

      // First fetch basic report data
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*");

      if (reportsError) {
        console.error("Error fetching reports:", reportsError);
        return;
      }

      if (!reportsData || reportsData.length === 0) {
        console.log("No reports found");
        setReports([]);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${reportsData.length} reports`);

      // For each report, fetch additional details based on category
      const enhancedReports = await Promise.all(
        reportsData.map(async (report) => {
          let additionalData = {};

          switch (report.category) {
            case "event":
              const { data: eventData } = await supabase
                .from("events")
                .select("*")
                .eq("reportid", report.reportid)
                .single();
              additionalData = eventData || {};
              break;
            case "safety":
              const { data: hazardData } = await supabase
                .from("hazards")
                .select("*")
                .eq("reportid", report.reportid)
                .single();
              additionalData = hazardData || {};
              break;
            case "lost":
              const { data: lostItemData } = await supabase
                .from("lostitems")
                .select("*")
                .eq("reportid", report.reportid)
                .single();
              additionalData = lostItemData || {};
              break;
            case "found":
              const { data: foundItemData } = await supabase
                .from("founditems")
                .select("*")
                .eq("reportid", report.reportid)
                .single();
              additionalData = foundItemData || {};
              break;
          }

          return { ...report, ...additionalData };
        })
      );

      setReports(enhancedReports);
      console.log("Reports processed successfully");
    } catch (error) {
      console.error("Error processing reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch reports on component mount and set up real-time subscription
  useEffect(() => {
    // Initial data fetch
    fetchReports();

    // Set up Supabase subscription for real-time updates
    const setupRealtimeSubscription = async () => {
      // Subscribe to changes in the reports table
      const reportsSubscription = supabase
        .channel("custom-all-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reports",
          },
          () => {
            console.log("Reports table changed - refreshing data");
            fetchReports();
          }
        )
        .subscribe();

      // Return cleanup function
      return () => {
        supabase.removeChannel(reportsSubscription);
      };
    };

    const cleanup = setupRealtimeSubscription();

    // Clean up subscription when component unmounts
    return () => {
      cleanup.then((cleanupFn) => cleanupFn());
    };
  }, [fetchReports]);

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
