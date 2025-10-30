// Example component demonstrating how easy it is to add update/delete functionality
// with the new refactored architecture

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report, UpdateReportData } from '@/types/report';
import { useReports } from '@/hooks/useReports';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ReportActionsProps {
  report: Report;
  userId: string;
  onClose?: () => void;
}

export default function ReportActions({ report, userId, onClose }: ReportActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState(report.description);
  const colorScheme = useColorScheme() ?? 'light';
  
  const { updateReportData, removeReport, isOwner } = useReports();

  // Check if current user owns this report
  const canEdit = isOwner(report, userId);

  const handleUpdate = async () => {
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty');
      return;
    }

    const updateData: UpdateReportData = {
      description: editDescription.trim(),
    };

    const success = await updateReportData(report.reportid, updateData);
    
    if (success) {
      Alert.alert('Success', 'Report updated successfully');
      setShowEditModal(false);
      onClose?.();
    } else {
      Alert.alert('Error', 'Failed to update report');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await removeReport(report.reportid);
            
            if (success) {
              Alert.alert('Success', 'Report deleted successfully');
              onClose?.();
            } else {
              Alert.alert('Error', 'Failed to delete report');
            }
          },
        },
      ]
    );
  };

  if (!canEdit) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.editButton]}
        onPress={() => setShowEditModal(true)}
      >
        <Ionicons name="pencil" size={20} color="#fff" />
        <Text style={styles.buttonText}>Edit</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDelete}
      >
        <Ionicons name="trash" size={20} color="#fff" />
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            colorScheme === 'dark' ? styles.modalContentDark : styles.modalContentLight
          ]}>
            <Text style={[
              styles.modalTitle,
              colorScheme === 'dark' ? styles.textDark : styles.textLight
            ]}>
              Edit Report
            </Text>
            
            <TextInput
              style={[
                styles.textInput,
                colorScheme === 'dark' ? styles.textInputDark : styles.textInputLight
              ]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Enter description..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#3B82F6', // blue-500
  },
  deleteButton: {
    backgroundColor: '#EF4444', // red-500
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  textInputLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    color: '#000',
  },
  textInputDark: {
    borderColor: '#4B5563',
    backgroundColor: '#374151',
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
