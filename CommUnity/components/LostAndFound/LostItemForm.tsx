import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formStyles } from './styles';
import { submitLostItem } from '@/services/lostAndFoundService';

interface LostItemFormProps {
  onSubmit: () => void;
  userId: string;
}

export default function LostItemForm({ onSubmit, userId }: LostItemFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [contactInfo, setContactInfo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    onSubmit();
    
    try {      
      const result = await submitLostItem({
        itemName,
        description,
        location,
        contactInfo
      }, userId);
      
      if (result.success) {
        Alert.alert(
          "Success",
          "Your lost item report has been submitted successfully."
        );
      } else {
        Alert.alert(
          "Error",
          "There was an error submitting your report. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Error",
        "There was an error submitting your report. Please try again."
      );
    }
  };

  return (
    <View style={formStyles.container}>
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