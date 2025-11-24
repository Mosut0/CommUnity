// Component for update/delete actions on reports
// Only visible to the report owner

import React, { useState, useRef, useMemo } from 'react';
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
  Animated,
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
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import {
  makeFormStyles,
  getTheme,
  modalStyles as sharedModalStyles,
} from './formStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const formStyles = useMemo(() => makeFormStyles(theme), [theme]);
  const menuAnimation = useRef(new Animated.Value(0)).current;

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
    } else if (report.category === 'hazard') {
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

      case 'hazard':
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

  const toggleMenu = () => {
    if (showMenu) {
      Animated.timing(menuAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowMenu(false));
    } else {
      setShowMenu(true);
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleEditPress = () => {
    toggleMenu();
    setTimeout(() => setShowEditModal(true), 200);
  };

  const handleDeletePress = () => {
    toggleMenu();
    setTimeout(() => handleDelete(), 200);
  };

  const menuScale = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const menuOpacity = menuAnimation;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={toggleMenu}
        disabled={isDeleting || isUpdating}
        activeOpacity={0.7}
      >
        <Ionicons
          name='ellipsis-horizontal'
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </TouchableOpacity>

      <Modal
        visible={showMenu}
        transparent
        animationType='none'
        onRequestClose={toggleMenu}
      >
        <TouchableOpacity
          style={styles.menuModalOverlay}
          activeOpacity={1}
          onPress={toggleMenu}
        >
          <View style={styles.menuPositioner}>
            <Animated.View
              style={[
                styles.menuDropdown,
                colorScheme === 'dark'
                  ? styles.menuDropdownDark
                  : styles.menuDropdownLight,
                {
                  opacity: menuOpacity,
                  transform: [{ scale: menuScale }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEditPress}
                disabled={isUpdating}
              >
                <Ionicons
                  name='pencil-outline'
                  size={20}
                  color={colorScheme === 'dark' ? '#60A5FA' : '#3B82F6'}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    { color: colorScheme === 'dark' ? '#fff' : '#000' },
                  ]}
                >
                  Edit Report
                </Text>
              </TouchableOpacity>

              <View
                style={[
                  styles.menuDivider,
                  colorScheme === 'dark'
                    ? styles.menuDividerDark
                    : styles.menuDividerLight,
                ]}
              />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDeletePress}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    size='small'
                    color={colorScheme === 'dark' ? '#F87171' : '#EF4444'}
                  />
                ) : (
                  <>
                    <Ionicons
                      name='trash-outline'
                      size={20}
                      color={colorScheme === 'dark' ? '#F87171' : '#EF4444'}
                    />
                    <Text style={[styles.menuItemText, styles.deleteText]}>
                      Delete Report
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editModalOverlay}>
          <ThemedView style={styles.editModalView}>
            <ScrollView
              style={sharedModalStyles.scrollView}
              contentContainerStyle={sharedModalStyles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={sharedModalStyles.header}>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  style={sharedModalStyles.closeButton}
                >
                  <IconSymbol name='chevron.left' color={theme.textPrimary} />
                </TouchableOpacity>
                <ThemedText
                  type='subtitle'
                  style={sharedModalStyles.headerTitle}
                >
                  Edit{' '}
                  {report.category.charAt(0).toUpperCase() +
                    report.category.slice(1)}{' '}
                  Report
                </ThemedText>
                <View style={sharedModalStyles.placeholder} />
              </View>

              {/* Event-specific fields */}
              {report.category === 'event' && (
                <View style={formStyles.inputGroup}>
                  <ThemedText style={formStyles.label}>Event Title*</ThemedText>
                  <TextInput
                    style={formStyles.input}
                    value={editEventType}
                    onChangeText={setEditEventType}
                    placeholder='e.g., Community Meetup, Workshop'
                    placeholderTextColor={theme.textSecondary}
                    editable={!isUpdating}
                  />
                </View>
              )}

              {/* Hazard-specific fields */}
              {report.category === 'hazard' && (
                <View style={formStyles.inputGroup}>
                  <ThemedText style={formStyles.label}>
                    Hazard Title*
                  </ThemedText>
                  <TextInput
                    style={formStyles.input}
                    value={editHazardType}
                    onChangeText={setEditHazardType}
                    placeholder='e.g., Pothole, Broken Glass'
                    placeholderTextColor={theme.textSecondary}
                    editable={!isUpdating}
                  />
                </View>
              )}

              {/* Lost/Found item title */}
              {(report.category === 'lost' || report.category === 'found') && (
                <View style={formStyles.inputGroup}>
                  <ThemedText style={formStyles.label}>Item Title*</ThemedText>
                  <TextInput
                    style={formStyles.input}
                    value={editItemType}
                    onChangeText={setEditItemType}
                    placeholder='e.g., Keys, Wallet, Phone'
                    placeholderTextColor={theme.textSecondary}
                    editable={!isUpdating}
                  />
                </View>
              )}

              {/* Common Description Field */}
              <View style={formStyles.inputGroup}>
                <ThemedText style={formStyles.label}>Description*</ThemedText>
                <TextInput
                  style={formStyles.textArea}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder='Description'
                  placeholderTextColor={theme.textSecondary}
                  editable={!isUpdating}
                  multiline
                />
              </View>

              {/* Event Date & Time */}
              {report.category === 'event' && (
                <View style={formStyles.inputGroup}>
                  <ThemedText style={formStyles.label}>
                    Event Date & Time*
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: theme.divider,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    disabled={isUpdating}
                  >
                    <Ionicons
                      name='calendar-outline'
                      size={20}
                      color={theme.textPrimary}
                    />
                    <Text
                      style={[styles.dateText, { color: theme.textPrimary }]}
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
                </View>
              )}

              {/* Lost/Found contact info */}
              {(report.category === 'lost' || report.category === 'found') && (
                <View style={formStyles.inputGroup}>
                  <ThemedText style={formStyles.label}>
                    Contact Info*
                  </ThemedText>
                  <TextInput
                    style={formStyles.input}
                    value={editContactInfo}
                    onChangeText={setEditContactInfo}
                    placeholder='Email or phone number'
                    placeholderTextColor={theme.textSecondary}
                    editable={!isUpdating}
                    keyboardType='email-address'
                  />
                </View>
              )}
              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[formStyles.submitButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={formStyles.submitButton}
                  onPress={handleUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator
                      size='small'
                      color={theme.primaryBtnText}
                    />
                  ) : (
                    <ThemedText style={formStyles.submitButtonText}>
                      Save Changes
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuPositioner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    right: 16,
  },
  menuDropdown: {
    minWidth: 180,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  menuDropdownLight: {
    backgroundColor: '#fff',
  },
  menuDropdownDark: {
    backgroundColor: '#1F2937',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  menuDivider: {
    height: 1,
  },
  menuDividerLight: {
    backgroundColor: '#E5E7EB',
  },
  menuDividerDark: {
    backgroundColor: '#374151',
  },
  editModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  editModalView: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 50,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
