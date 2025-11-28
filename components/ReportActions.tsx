// Component for update/delete actions on reports
// Only visible to the report owner

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
  Report,
  UpdateReportData,
  UpdateEventData,
  UpdateHazardData,
  UpdateLostItemData,
  UpdateFoundItemData,
} from '@/types/report';
import { useReports } from '@/hooks/useReports';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ReportActionsProps {
  report: Report;
  currentUserId: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export default function ReportActions({
  report,
  currentUserId,
  onUpdate,
  onDelete,
}: ReportActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  // Common fields
  const [editDescription, setEditDescription] = useState(report.description);

  // Event-specific fields
  const [editEventType, setEditEventType] = useState(report.eventtype || '');
  const [editEventTime, setEditEventTime] = useState(
    report.time ? new Date(report.time) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Hazard-specific fields
  const [editHazardType, setEditHazardType] = useState(report.hazardtype || '');

  // Lost/Found item fields
  const [editItemType, setEditItemType] = useState(report.itemtype || '');
  const [editContactInfo, setEditContactInfo] = useState(
    report.contactinfo || ''
  );

  const { updateReportData, removeReport, isOwner } = useReports();

  // Check if current user owns this report
  const canEdit = isOwner(report, currentUserId);

  if (!canEdit) {
    return null;
  }

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEditEventTime(selectedDate);
    }
  };

  const handleUpdate = async () => {
    // Validate common fields
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Description cannot be empty');
      return;
    }

    // Validate category-specific fields
    if (report.category === 'event') {
      if (!editEventType.trim()) {
        Alert.alert('Error', 'Event type cannot be empty');
        return;
      }
    } else if (report.category === 'safety') {
      if (!editHazardType.trim()) {
        Alert.alert('Error', 'Hazard type cannot be empty');
        return;
      }
    } else if (report.category === 'lost' || report.category === 'found') {
      if (!editItemType.trim()) {
        Alert.alert('Error', 'Item type cannot be empty');
        return;
      }
      if (!editContactInfo.trim()) {
        Alert.alert('Error', 'Contact info cannot be empty');
        return;
      }
    }

    setIsUpdating(true);
    console.log(
      'Updating report:',
      report.reportid,
      'category:',
      report.category
    );

    // Common update data
    const updateData: UpdateReportData = {
      description: editDescription.trim(),
    };

    // Build category-specific data
    let categoryData:
      | UpdateEventData
      | UpdateHazardData
      | UpdateLostItemData
      | UpdateFoundItemData
      | undefined;

    switch (report.category) {
      case 'event':
        categoryData = {
          eventtype: editEventType.trim(),
          time: editEventTime.toISOString(),
        } as UpdateEventData;
        break;

      case 'safety':
        categoryData = {
          hazardtype: editHazardType.trim(),
        } as UpdateHazardData;
        break;

      case 'lost':
        categoryData = {
          itemtype: editItemType.trim(),
          contactinfo: editContactInfo.trim(),
        } as UpdateLostItemData;
        break;

      case 'found':
        categoryData = {
          itemtype: editItemType.trim(),
          contactinfo: editContactInfo.trim(),
        } as UpdateFoundItemData;
        break;

      default:
        // For other categories (infrastructure, wildlife, health, other)
        // only update common fields
        categoryData = undefined;
    }

    console.log('Update data:', updateData);
    console.log('Category data:', categoryData);

    const success = await updateReportData(
      report.reportid,
      updateData,
      categoryData
    );
    console.log('Update result:', success);

    setIsUpdating(false);

    if (success) {
      Alert.alert('Success', 'Report updated successfully');
      setShowEditModal(false);
      onUpdate?.();
    } else {
      Alert.alert(
        'Error',
        'Failed to update report. Please check the console for details.'
      );
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
            setIsDeleting(true);
            console.log('Deleting report:', report.reportid);

            const success = await removeReport(report.reportid);
            console.log('Delete result:', success);

            setIsDeleting(false);

            if (success) {
              Alert.alert('Success', 'Report deleted successfully');
              onDelete?.();
            } else {
              Alert.alert(
                'Error',
                'Failed to delete report. Please check the console for details.'
              );
            }
          },
        },
      ]
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.editButton]}
        onPress={() => setShowEditModal(true)}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        <Ionicons name='pencil' size={20} color='#fff' />
        <Text style={styles.buttonText}>Edit Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDelete}
        disabled={isDeleting}
        activeOpacity={0.7}
      >
        {isDeleting ? (
          <ActivityIndicator size='small' color='#fff' />
        ) : (
          <>
            <Ionicons name='trash' size={20} color='#fff' />
            <Text style={styles.buttonText}>Delete Report</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              colorScheme === 'dark'
                ? styles.modalContentDark
                : styles.modalContentLight,
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  colorScheme === 'dark' ? styles.textDark : styles.textLight,
                ]}
              >
                Edit{' '}
                {report.category.charAt(0).toUpperCase() +
                  report.category.slice(1)}{' '}
                Report
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons
                  name='close'
                  size={24}
                  color={colorScheme === 'dark' ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Common Description Field */}
              <Text
                style={[
                  styles.label,
                  colorScheme === 'dark' ? styles.textDark : styles.textLight,
                ]}
              >
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  colorScheme === 'dark'
                    ? styles.textInputDark
                    : styles.textInputLight,
                ]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                placeholder='Description'
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                editable={!isUpdating}
              />

              {/* Event-specific fields */}
              {report.category === 'event' && (
                <>
                  <Text
                    style={[
                      styles.label,
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight,
                    ]}
                  >
                    Event Type
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      colorScheme === 'dark'
                        ? styles.textInputDark
                        : styles.textInputLight,
                    ]}
                    value={editEventType}
                    onChangeText={setEditEventType}
                    placeholder='e.g., Community Meetup, Workshop'
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#666' : '#999'
                    }
                    editable={!isUpdating}
                  />

                  <Text
                    style={[
                      styles.label,
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight,
                    ]}
                  >
                    Event Date & Time
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      colorScheme === 'dark'
                        ? styles.textInputDark
                        : styles.textInputLight,
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isUpdating}
                  >
                    <Ionicons
                      name='calendar-outline'
                      size={20}
                      color={colorScheme === 'dark' ? '#fff' : '#000'}
                    />
                    <Text
                      style={[
                        styles.dateText,
                        colorScheme === 'dark'
                          ? styles.textDark
                          : styles.textLight,
                      ]}
                    >
                      {formatDateTime(editEventTime)}
                    </Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={editEventTime}
                      mode='datetime'
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}

              {/* Hazard-specific fields */}
              {report.category === 'safety' && (
                <>
                  <Text
                    style={[
                      styles.label,
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight,
                    ]}
                  >
                    Hazard Type
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      colorScheme === 'dark'
                        ? styles.textInputDark
                        : styles.textInputLight,
                    ]}
                    value={editHazardType}
                    onChangeText={setEditHazardType}
                    placeholder='e.g., Pothole, Broken Glass'
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#666' : '#999'
                    }
                    editable={!isUpdating}
                  />
                </>
              )}

              {/* Lost/Found item fields */}
              {(report.category === 'lost' || report.category === 'found') && (
                <>
                  <Text
                    style={[
                      styles.label,
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight,
                    ]}
                  >
                    Item Type
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      colorScheme === 'dark'
                        ? styles.textInputDark
                        : styles.textInputLight,
                    ]}
                    value={editItemType}
                    onChangeText={setEditItemType}
                    placeholder='e.g., Keys, Wallet, Phone'
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#666' : '#999'
                    }
                    editable={!isUpdating}
                  />

                  <Text
                    style={[
                      styles.label,
                      colorScheme === 'dark'
                        ? styles.textDark
                        : styles.textLight,
                    ]}
                  >
                    Contact Info
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.singleLineInput,
                      colorScheme === 'dark'
                        ? styles.textInputDark
                        : styles.textInputLight,
                    ]}
                    value={editContactInfo}
                    onChangeText={setEditContactInfo}
                    placeholder='Email or phone number'
                    placeholderTextColor={
                      colorScheme === 'dark' ? '#666' : '#999'
                    }
                    editable={!isUpdating}
                    keyboardType='email-address'
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
                disabled={isUpdating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size='small' color='#fff' />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
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
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalContentLight: {
    backgroundColor: '#fff',
  },
  modalContentDark: {
    backgroundColor: '#1F2937',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollView: {
    maxHeight: 400,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
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
    marginBottom: 8,
  },
  singleLineInput: {
    minHeight: 50,
  },
  textInputLight: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    color: '#000',
  },
  textInputDark: {
    borderColor: '#374151',
    backgroundColor: '#111827',
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 50,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
