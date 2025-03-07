import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import { formStyles } from './styles';
import { submitHazard } from '@/services/hazardService';
import ImagePicker from '@/components/ImagePicker';

interface FillHazardFormProps {
  onSubmit: () => void;
  userId: string;
}

export default function FillHazardForm({ onSubmit, userId }: FillHazardFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [hazardType, setHazardType] = useState('');
  const [description, setDescription] = useState('');
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

    useEffect(() => {
    (async () => {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Permission to access location was denied.");
        setLoadingLocation(false);
        return;
      }
      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      setCurrentCoordinates({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
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
      const result = await submitHazard({
        hazardType,
        description,
        location: locationStr,
        date: new Date(),
        imageUri: imageUri || undefined
      }, userId);

      if (result.success) {
        Alert.alert("Success", "Your hazard report has been submitted successfully.");
      } else {
        Alert.alert("Error", "There was an error submitting your report. Please try again.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "There was an error submitting your report. Please try again.");
    }
  };

  // Show loading indicator while fetching location
  if (loadingLocation) {
    return (
      <View style={formStyles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText>Fetching current location...</ThemedText>
      </View>
    );
  }

  // Render the form once location is available
  return (
    <View style={formStyles.container}>
      {/* Hazard Type Input */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Hazard Type*</ThemedText>
        <TextInput
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={hazardType}
          onChangeText={setHazardType}
          placeholder="What is the nearby hazard?"
          placeholderTextColor={Colors[colorScheme].icon}
        />
      </View>

      {/* Hazard Description Input */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Description*</ThemedText>
        <TextInput
          style={[
            formStyles.textArea,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the hazard (severity, shape, etc.)"
          placeholderTextColor={Colors[colorScheme].icon}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Display the fetched current location for user reference */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Current Location:</ThemedText>
        <ThemedText>
          {currentCoordinates ? `${currentCoordinates.lat.toFixed(6)}, ${currentCoordinates.lng.toFixed(6)}` : 'Not available'}
        </ThemedText>
      </View>

      {/* Image Picker */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Add Photo (Optional)</ThemedText>
        <ImagePicker 
          onImageSelected={handleImageSelected} 
          onImageRemoved={handleImageRemoved} 
        />
      </View>

      {/* Submit Button - disabled if required fields are empty */}
      <TouchableOpacity
        style={[
          formStyles.submitButton,
          { backgroundColor: Colors[colorScheme].tint },
          (!hazardType || !description) && formStyles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!hazardType || !description}
      >
        <ThemedText style={formStyles.submitButtonText} darkColor="black" lightColor="#fff">
          Submit Report
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
