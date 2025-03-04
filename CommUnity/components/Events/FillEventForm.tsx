import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { formStyles } from './styles';
import { submitEvent } from '@/services/eventService';

interface FillEventFormProps {
  onSubmit: () => void;
  userId: string;
}

export default function FillEventForm({ onSubmit, userId }: FillEventFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Location handling
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
      setCurrentCoordinates({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
      setLoadingLocation(false);
    })();
  }, []);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  };

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

  if (loadingLocation) {
    return (
      <View style={formStyles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText>Fetching current location...</ThemedText>
      </View>
    );
  }

  return (
    <View style={formStyles.container}>
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Event Type*</ThemedText>
        <TextInput
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={eventType}
          onChangeText={setEventType}
          placeholder="What type of event? (Concert, Meeting, etc.)"
          placeholderTextColor={Colors[colorScheme].icon}
        />
      </View>

      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Description*</ThemedText>
        <TextInput
          style={[
            formStyles.textArea,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the event"
          placeholderTextColor={Colors[colorScheme].icon}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Date*</ThemedText>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, justifyContent: 'center' }
          ]}
        >
          <ThemedText>{formatDate(date)}</ThemedText>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Time*</ThemedText>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, justifyContent: 'center' }
          ]}
        >
          <ThemedText>{time || 'Select time'}</ThemedText>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Current Location:</ThemedText>
        <ThemedText>
          {currentCoordinates ? `${currentCoordinates.lat.toFixed(6)}, ${currentCoordinates.lng.toFixed(6)}` : 'Not available'}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[
          formStyles.submitButton,
          { backgroundColor: Colors[colorScheme].tint },
          (!eventType || !description || !time) && formStyles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!eventType || !description || !time}
      >
        <ThemedText style={formStyles.submitButtonText} darkColor="black" lightColor="#fff">
          Submit Event
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}