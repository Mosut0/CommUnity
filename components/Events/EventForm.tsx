import React, { useState } from 'react';
import { Modal, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FillEventForm from './FillEventForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { modalStyles } from './styles';

interface EventFormProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

export default function EventForm({ isVisible, onClose, userId }: EventFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
    const [formType, setFormType] = useState<'event' | null>(null);

    const resetForm = () => {
    setFormType(null);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        <ThemedView style={modalStyles.modalView}>
          {/* Modal Header with back button */}
          <View style={modalStyles.header}>
            <TouchableOpacity 
              onPress={formType ? resetForm : onClose}
              style={modalStyles.closeButton}
            >
              <IconSymbol 
                name="chevron.left" 
                color={colorScheme === 'dark' ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={modalStyles.headerTitle}>
              {formType === null ? 'Events' : 'Create New Event'}
            </ThemedText>
            <View style={modalStyles.placeholder} />
          </View>
          
          <ScrollView 
            style={modalStyles.scrollView}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {formType === null ? (
              // Initial options screen
              <View style={modalStyles.optionsContainer}>
                <TouchableOpacity
                  style={[modalStyles.optionButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={() => setFormType('event')}
                >
                  <ThemedText style={modalStyles.optionButtonText} darkColor="black" lightColor="#fff">
                    Create a New Event
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              // Display the event creation form
              <FillEventForm onSubmit={onClose} userId={userId} />
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}