import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Alert } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';

interface Report {
    reportid: number;
    category: string;
    description: string;
    location: string;
    eventtype?: string;
    itemtype?: string;
    hazardtype?: string;
}

const categoryDisplayNames: { [key: string]: string } = {
    All: 'All Reports',
    Event: 'Reported Events',
    Lost: 'Reported Lost Items',
    Found: 'Reported Found Items',
    Safety: 'Reported Hazards',
};

const categoryDatabaseNames: { [key: string]: string } = {
    'All Reports': 'all',
    'Reported Events': 'event',
    'Reported Lost Items': 'lost',
    'Reported Found Items': 'found',
    'Reported Hazards': 'safety',
};

const categoryColors: { [key: string]: string } = {
    event: '#800080', // Purple
    lost: '#FFFF00', // Yellow
    found: '#008000', // Green
    safety: '#FF0000', // Red
};

export default function Forums() {
    const [selectedCategory, setSelectedCategory] = useState<string>('All Reports');
    const [reports, setReports] = useState<Report[]>([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [distanceRadius, setDistanceRadius] = useState<number>(20);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch user location
    useEffect(() => {
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
                setErrorMsg(null);
            } catch (error) {
                console.error("Error getting location:", error);
                setErrorMsg("Failed to get location. Please try again.");
            }
        })();
    }, []);

    // Fetch the user's distance radius from the database
    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                console.error('Error fetching distance radius:', error);
            } else if (data && data.user) {
                const userMetadata = data.user.user_metadata;
                console.log('Fetched user metadata:', userMetadata);
                setDistanceRadius(userMetadata.distance_radius || 20);
            }
        });
    }, []);

    useEffect(() => {
        if (location) {
            fetchReports();
        }
    }, [selectedCategory, distanceRadius, location]);

    const fetchReports = useCallback(async () => {
        if (!location) {
            return;
        }

        let query = supabase.from('reports').select(`
      reportid,
      category,
      description,
      location,
      eventtype:events(eventtype),
      lostitemtype:lostitems(itemtype),
      founditemtype:founditems(itemtype),
      hazardtype:hazards(hazardtype)
    `);

        if (selectedCategory !== 'All Reports') {
            query = query.eq('category', categoryDatabaseNames[selectedCategory]);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching reports:', error);
        } else {
            const filteredData = data.filter((report: any) => {
                const coords = parseLocation(report.location);
                if (!coords) return false;

                const distance = getDistanceFromLatLonInKm(
                    location.coords.latitude,
                    location.coords.longitude,
                    coords.latitude,
                    coords.longitude
                );

                return distance <= distanceRadius;
            });

            const formattedData = filteredData.map((report: any) => ({
                reportid: report.reportid,
                category: report.category,
                description: report.description,
                location: report.location,
                eventtype: report.eventtype?.[0]?.eventtype || '',
                itemtype: report.lostitemtype?.[0]?.itemtype || report.founditemtype?.[0]?.itemtype || '',
                hazardtype: report.hazardtype?.[0]?.hazardtype || '',
            }));

            setReports(formattedData);
        }
    }, [selectedCategory, distanceRadius, location]);

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

    const toggleDropdown = () => {
        setIsDropdownVisible(!isDropdownVisible);
    };

    const selectCategory = (category: string) => {
        setSelectedCategory(categoryDisplayNames[category]);
        setIsDropdownVisible(false);
    };

    const getCategoryColor = (category: string) => {
        return categoryColors[category] || '#000'; // Default to black if category not found
    };

    return (
        <View style={styles.container}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
                <Text style={styles.dropdownButtonText}>{selectedCategory}</Text>
            </TouchableOpacity>
            <Modal
                transparent={true}
                visible={isDropdownVisible}
                animationType="slide"
                onRequestClose={toggleDropdown}
            >
                <Pressable style={styles.modalOverlay} onPress={toggleDropdown}>
                    <View style={styles.dropdown}>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('All')}>
                            <Text style={styles.dropdownItemText}>All Reports</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Event')}>
                            <Text style={styles.dropdownItemText}>Reported Events</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Lost')}>
                            <Text style={styles.dropdownItemText}>Reported Lost Items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Found')}>
                            <Text style={styles.dropdownItemText}>Reported Found Items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCategory('Safety')}>
                            <Text style={styles.dropdownItemText}>Reported Hazards</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
            <ScrollView style={styles.scrollView}>
                {reports.map((report) => (
                    <View key={report.reportid} style={styles.reportItem}>
                        <Text style={styles.reportTitle}>
                            {report.eventtype || report.itemtype || report.hazardtype}
                        </Text>
                        <Text style={[styles.reportCategory, { borderColor: getCategoryColor(report.category) }]}>
                            {report.category}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    dropdownButton: {
        padding: 15,
        backgroundColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#000',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 5,
        width: '80%',
        padding: 10,
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropdownItemText: {
        color: '#000',
    },
    scrollView: {
        marginTop: 10,
    },
    reportItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    reportCategory: {
        fontSize: 14,
        color: '#666',
        borderWidth: 2,
        borderRadius: 5,
        padding: 5,
        marginTop: 5,
        alignSelf: 'flex-start',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
});