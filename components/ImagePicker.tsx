import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ExpoImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MaterialIcons } from "@expo/vector-icons";

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
}

/**
 * ImagePicker Component
 *
 * A component that allows users to select an image from their device gallery
 * or take a new photo using their camera. The component displays the selected
 * image and provides an option to remove it.
 */
export default function ImagePicker({
  onImageSelected,
  onImageRemoved,
}: ImagePickerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPermission = async (forCamera = false) => {
    let permission;

    if (forCamera) {
      permission = await ExpoImagePicker.requestCameraPermissionsAsync();
    } else {
      permission = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permission.status !== "granted") {
      Alert.alert(
        "Permission required",
        `Please grant ${
          forCamera ? "camera" : "photo library"
        } access to use this feature`
      );
      return false;
    }

    return true;
  };

  /**
   * Opens the device's image gallery for the user to select an image
   * Sets loading state while processing and updates image state when selected
   */
  const pickImage = async () => {
    if (!(await requestPermission(false))) return;

    try {
      setLoading(true);
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the device's camera for the user to take a new photo
   * Sets loading state while processing and updates image state when photo is taken
   */
  const takePhoto = async () => {
    if (!(await requestPermission(true))) return;

    try {
      setLoading(true);
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    onImageRemoved();
  };

  /**
   * Displays an alert with options for selecting an image
   * Provides options to take a photo, choose from library, or cancel
   */
  const showImageOptions = () => {
    Alert.alert("Add Image", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        // Loading state - show activity indicator while processing
        <View style={styles.imageContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        </View>
      ) : image ? (
        // Image selected state - show the image with a remove option
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.preview} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <MaterialIcons name="close" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ) : (
        // No image state - show button to add an image
        <TouchableOpacity
          style={[
            styles.selectButton,
            { borderColor: Colors[colorScheme].icon },
          ]}
          onPress={showImageOptions}
        >
          <ThemedText>Add Image</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectButton: {
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
