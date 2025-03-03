import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formStyles } from './styles';
import { submitHazard } from '@/services/hazardService';

interface FillHazardFormProps {
  onSubmit: () => void;
  userId: string;
}

export default function FillHazardForm({ onSubmit, userId }: FillHazardFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [hazardType, setHazardType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    onSubmit();
    
    try {      
      const result = await submitHazard({
        hazardType,
        description,
        location
      }, userId);
      
      if (result.success) {
        Alert.alert(
          "Success",
          "Your hazard report has been submitted successfully."
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