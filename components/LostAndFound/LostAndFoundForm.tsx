import React, { useState } from 'react';
import { Modal, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LostItemForm from './LostItemForm';
import FoundItemForm from './FoundItemForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { modalStyles } from './styles';

interface LostAndFoundFormProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

export default function LostAndFoundForm({ isVisible, onClose, userId }: LostAndFoundFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
    const [formType, setFormType] = useState<'lost' | 'found' | null>(null);

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
              {formType === null 
                ? 'Lost & Found' 
                : formType === 'lost' 
                  ? 'Report Lost Item' 
                  : 'Report Found Item'
              }
            </ThemedText>
            <View style={modalStyles.placeholder} />
          </View>
          
          <ScrollView 
            style={modalStyles.scrollView}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {formType === null ? (
              // Initial selection screen with two options
              <View style={modalStyles.optionsContainer}>
                <TouchableOpacity
                  style={[modalStyles.optionButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={() => setFormType('lost')}
                >
                  <ThemedText style={modalStyles.optionButtonText} darkColor="black" lightColor="#fff">
                    I've lost something
                  </ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[modalStyles.optionButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={() => setFormType('found')}
                >
                  <ThemedText style={modalStyles.optionButtonText} darkColor="black" lightColor="#fff">
                    I've found something
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : formType === 'lost' ? (
              // Display the lost item form when selected
              <LostItemForm onSubmit={onClose} userId={userId} />
            ) : (
              // Display the found item form when selected
              <FoundItemForm onSubmit={onClose} userId={userId} />
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}