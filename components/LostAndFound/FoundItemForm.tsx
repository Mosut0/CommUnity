import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import { makeFormStyles, getTheme, modalStyles } from './styles';
import { submitFoundItem } from '@/services/lostAndFoundService';
import ImagePicker from '@/components/ImagePicker';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FoundItemFormProps {
  onSubmit: () => void;
  onClose: () => void;
  userId: string;
  visible: boolean;
}

export default function FoundItemForm({ onSubmit, onClose, userId, visible }: FoundItemFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => makeFormStyles(theme), [theme]);
  
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
    (async () => {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Permission to access location was denied.");
        setLoadingLocation(false);
        return;
      }
      // Get current position
      let location = await Location.getCurrentPositionAsync({});

      // Add small random offset to prevent exact overlaps (±2-3 meters)
      const offsetLat = location.coords.latitude + (Math.random() - 0.5) * 0.00009;
      const offsetLng = location.coords.longitude + (Math.random() - 0.5) * 0.00009;

      setCurrentCoordinates({
        lat: offsetLat,
        lng: offsetLng,
      });
      setLoadingLocation(false);
    })();
  }, []);

    const handleImageSelected = (uri: string) => {
      setImageUri(uri);
    };

    const handleImageRemoved = () => {
      setImageUri(null);
    };

    const handleSubmit = async () => {
    onSubmit();

    if (!currentCoordinates) {
      Alert.alert("Error", "Current location not available.");
      return;
    }

    try {
      // Format the current location as "lat,lng"
      const locationStr = `${currentCoordinates.lat},${currentCoordinates.lng}`;
      const result = await submitFoundItem({
        itemName,
        description,
        location: locationStr,
        contactInfo,
        imageUri: imageUri || undefined
      }, userId);
      
      if (result.success) {
        Alert.alert("Success", "Your found item report has been submitted successfully.");
      } else {
        Alert.alert("Error", "There was an error submitting your report. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error submitting your report. Please try again.");
    }
  };

  // Render the modal wrapper
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <ThemedView style={modalStyles.modalView}>
          <ScrollView 
            style={modalStyles.scrollView}
            contentContainerStyle={modalStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={modalStyles.header}>
              <TouchableOpacity 
                onPress={onClose}
                style={modalStyles.closeButton}
              >
                <IconSymbol 
                  name="chevron.left" 
                  color={colorScheme === 'dark' ? '#fff' : '#000'}
                />
              </TouchableOpacity>
              <ThemedText type="subtitle" style={modalStyles.headerTitle}>
                Report Found Item
              </ThemedText>
              <View style={modalStyles.placeholder} />
            </View>
            {loadingLocation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primaryBtnBg} />
                <ThemedText style={styles.loadingText}>Fetching current location...</ThemedText>
              </View>
            ) : (
              <>
                {/* Item Name Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Item Name*</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="What did you find?"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                {/* Item Description Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Description*</ThemedText>
                  <TextInput
                    style={styles.textArea}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe the item (color, brand, distinguishing features, etc.)"
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Display the fetched current location */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Current Location</ThemedText>
                  <View style={styles.locationDisplay}>
                    <ThemedText style={styles.locationText}>
                      {currentCoordinates 
                        ? `${currentCoordinates.lat.toFixed(6)}, ${currentCoordinates.lng.toFixed(6)}` 
                        : 'Not available'
                      }
                    </ThemedText>
                  </View>
                </View>

                {/* Contact Information Input */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Contact Information*</ThemedText>
                  <TextInput
                    style={styles.input}
                    value={contactInfo}
                    onChangeText={setContactInfo}
                    placeholder="How can the owner reach you?"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>

                {/* Image Picker */}
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Add Photo (Optional)</ThemedText>
                  <ImagePicker 
                    onImageSelected={handleImageSelected} 
                    onImageRemoved={handleImageRemoved} 
                  />
                </View>

                {/* Submit Button - disabled if required fields are empty */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!itemName || !description || !contactInfo) && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={!itemName || !description || !contactInfo}
                >
                  <ThemedText style={styles.submitButtonText}>
                    Submit Report
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}
