import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as Location from 'expo-location';
import { formStyles } from './styles';
import { submitLostItem } from '@/services/lostAndFoundService';
import ImagePicker from '@/components/ImagePicker';

interface LostItemFormProps {
  onSubmit: () => void;
  userId: string;
}

export default function LostItemForm({ onSubmit, userId }: LostItemFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
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
      // Format the location as "lat,lng"
      const locationStr = `${currentCoordinates.lat},${currentCoordinates.lng}`;
      const result = await submitLostItem({
        itemName,
        description,
        location: locationStr,
        date: new Date(),
        contactInfo,
        imageUri: imageUri || undefined
      }, userId);
      
      if (result.success) {
        Alert.alert("Success", "Your lost item report has been submitted successfully.");
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
      {/* Item Name Input */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Item Name*</ThemedText>
        <TextInput
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={itemName}
          onChangeText={setItemName}
          placeholder="What did you lose?"
          placeholderTextColor={Colors[colorScheme].icon}
        />
      </View>

      {/* Item Description Input */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Description*</ThemedText>
        <TextInput
          style={[
            formStyles.textArea,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the item (color, brand, distinguishing features, etc.)"
          placeholderTextColor={Colors[colorScheme].icon}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Display current location for user reference */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Current Location:</ThemedText>
        <ThemedText>
          {currentCoordinates ? `${currentCoordinates.lat.toFixed(6)}, ${currentCoordinates.lng.toFixed(6)}` : 'Not available'}
        </ThemedText>
      </View>

      {/* Contact Information Input */}
      <View style={formStyles.inputGroup}>
        <ThemedText type="defaultSemiBold">Contact Information*</ThemedText>
        <TextInput
          style={[
            formStyles.input,
            { borderColor: Colors[colorScheme].icon, color: Colors[colorScheme].text }
          ]}
          value={contactInfo}
          onChangeText={setContactInfo}
          placeholder="How can someone contact you if found?"
          placeholderTextColor={Colors[colorScheme].icon}
        />
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
          (!itemName || !description || !contactInfo) && formStyles.disabledButton
        ]}
        onPress={handleSubmit}
        disabled={!itemName || !description || !contactInfo}
      >
        <ThemedText style={formStyles.submitButtonText} darkColor="black" lightColor="#fff">
          Submit Report
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
