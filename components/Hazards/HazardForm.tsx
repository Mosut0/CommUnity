import React, { useState } from 'react';
import { Modal, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FillHazardForm from './FillHazardForm';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { modalStyles } from './styles';

interface HazardFormProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
}

export default function HazardForm({ isVisible, onClose, userId }: HazardFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [formType, setFormType] = useState<'hazard' | null>(null);

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
              {formType === null ? 'Hazards' : 'Report Hazard'}
            </ThemedText>
            <View style={modalStyles.placeholder} />
          </View>
          
          <ScrollView 
            style={modalStyles.scrollView}
            contentContainerStyle={modalStyles.scrollContent}
          >
            {formType === null ? (
              <View style={modalStyles.optionsContainer}>
                <TouchableOpacity
                  style={[modalStyles.optionButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={() => setFormType('hazard')}
                >
                  <ThemedText style={modalStyles.optionButtonText} darkColor="black" lightColor="#fff">
                    There is a nearby hazard
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <FillHazardForm onSubmit={onClose} userId={userId} />
            )}
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}