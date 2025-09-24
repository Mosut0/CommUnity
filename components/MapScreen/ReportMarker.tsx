import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Marker, Callout, MapMarker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';
import { Report, getMarkerColor, getReportTitle, getIconProps } from './markerUtils';

interface ReportMarkerProps {
  report: Report;
  selectedReport: Report | null;
  onPress: (report: Report) => void;
  tracksViewChanges: boolean;
  displayCoords: { latitude: number; longitude: number };
  markerRef: (ref: MapMarker | null) => void;
  onLayout?: () => void;
}

export const ReportMarker: React.FC<ReportMarkerProps> = ({
  report,
  selectedReport,
  onPress,
  tracksViewChanges,
  displayCoords,
  markerRef,
  onLayout,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const isSelected = selectedReport?.reportid === report.reportid;
  const markerColor = getMarkerColor(report.category);

  const handlePress = () => {
    onPress(report);
  };

  return (
    <Marker
      key={report.reportid}
      ref={markerRef}
      coordinate={displayCoords}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View
        style={[
          styles.iconWrapper,
          isSelected
            ? { backgroundColor: markerColor, shadowColor: markerColor, elevation: 4 }
            : colorScheme === 'dark' ? styles.iconWrapperDark : styles.iconWrapperLight,
        ]}
      >
        {isSelected ? (
          <Ionicons {...getIconProps(report.category, "#fff")} />
        ) : (
          <Ionicons {...getIconProps(report.category, markerColor)} />
        )}
      </View>
      
      {tracksViewChanges && (
        <View
          onLayout={onLayout}
          style={{ width: 0, height: 0 }}
        />
      )}
      
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
};

const styles = StyleSheet.create({
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  iconWrapperLight: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  iconWrapperDark: {
    backgroundColor: 'rgba(34,34,34,0.95)',
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
});
