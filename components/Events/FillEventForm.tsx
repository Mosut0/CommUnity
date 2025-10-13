import React, { useState, useEffect, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform, ScrollView, Modal } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { makeFormStyles, getTheme, modalStyles } from './styles';
import { submitEvent } from '@/services/eventService';
import ImagePicker from '@/components/ImagePicker';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface FillEventFormProps {
  onSubmit: () => void;
  onClose: () => void;
  userId: string;
  visible: boolean;
}

export default function FillEventForm({ onSubmit, onClose, userId, visible }: FillEventFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const styles = useMemo(() => makeFormStyles(theme), [theme]);
  
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  // Location handling state
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

    useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Permission to access location was denied.");
        setLoadingLocation(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});

            
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

  /**
   * Handles date picker change events
   * Closes the picker and updates the selected date
   */
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  /**
   * Handles time picker change events
   * Closes the picker and formats the selected time
   */
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  };

  /**
   * Formats a Date object into MM/DD/YYYY format for display
   */
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

    const handleSubmit = async () => {
    onSubmit();

    if (!currentCoordinates) {
      Alert.alert("Error", "Current location not available.");
      return;
    }

    if (!time) {
      Alert.alert("Error", "Please select a time for the event.");
      return;
    }

    try {
      const locationStr = `${currentCoordinates.lat},${currentCoordinates.lng}`;
      const result = await submitEvent({
        eventType,
        description,
        location: locationStr,
        date,
        time,
        imageUri: imageUri || undefined
      }, userId);

      if (result.success) {
        Alert.alert("Success", "Your event has been submitted successfully.");
      } else {
        Alert.alert("Error", "There was an error submitting your event. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error submitting your event. Please try again.");
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
                  color={theme.textPrimary}
                />
              </TouchableOpacity>
              <ThemedText type="subtitle" style={modalStyles.headerTitle}>
                Create New Event
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
                {/* Event Type Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Event Type*</ThemedText>
              <TextInput
                style={styles.input}
                value={eventType}
                onChangeText={setEventType}
                placeholder="What type of event?"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {/* Event Description Input */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description*</ThemedText>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the event"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Date and Time Selector Row */}
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Date & Time*</ThemedText>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateTimeButton}
                >
                  <ThemedText style={styles.dateTimeText}>{formatDate(date)}</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  style={styles.dateTimeButton}
                >
                  <ThemedText style={time ? styles.dateTimeText : styles.dateTimePlaceholder}>
                    {time || 'Select time'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Display the current location */}
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
                    (!eventType || !description || !time) && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={!eventType || !description || !time}
                >
                  <ThemedText style={styles.submitButtonText}>
                    Submit Event
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
