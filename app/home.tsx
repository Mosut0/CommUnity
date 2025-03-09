import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput, Alert, useColorScheme } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import MapScreen from '../components/MapScreen';
import { LostAndFoundForm } from '@/components/LostAndFound';
import { HazardForm } from '@/components/Hazards';
import { EventForm } from '@/components/Events';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

export default function Home() {
  // Authentication state management
  const [session, setSession] = useState<Session | null>(null);
  // UI state management
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const colorScheme = useColorScheme();
  const [forceRender, setForceRender] = useState(false);
  const router = useRouter();
  
  // Fetch the current session and listen for authentication state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    // Short delay to let the map initialize properly
    const timer = setTimeout(() => {
      console.log('Forcing re-render to make pins display');
      setForceRender(true);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  // Toggle the visibility of the panel
  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  // Open a specific form and close the panel
  const openForm = (formType: string) => {
    setSelectedForm(formType);
    setIsPanelVisible(false);
  };

  // Toggle the visibility of the profile modal
  const toggleProfileModal = () => {
    setIsProfileModalVisible(!isProfileModalVisible);
  };

  // Toggle the visibility of the change password modal
  const toggleChangePasswordModal = () => {
    setIsChangePasswordModalVisible(!isChangePasswordModalVisible);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileModalVisible(false);
    router.push('/'); // Redirect to the authentication page
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Re-authenticate the user with the old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session?.user?.email || '',
      password: oldPassword,
    });

    if (signInError) {
      Alert.alert('Error', 'Old password is incorrect');
      return;
    }

    // Update the password to the new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      Alert.alert('Error', updateError.message);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setIsChangePasswordModalVisible(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Map display showing the community data */}
      <MapScreen />

      {/* Profile Icon */}
      <TouchableOpacity
        style={styles.profileIcon}
        onPress={toggleProfileModal}
      >
        <View style={styles.profileIconCircle}>
          <MaterialIcons name="account-circle" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
        </View>
      </TouchableOpacity>

      {/* Profile Modal */}
      <Modal transparent animationType="none" visible={isProfileModalVisible}>
        <Pressable style={styles.modalContainer} onPress={toggleProfileModal}>
          <View style={[styles.modal, colorScheme === 'dark' ? styles.modalDark : styles.modalLight]}>
            <TouchableOpacity style={styles.modalButton} onPress={() => { setIsProfileModalVisible(false); toggleChangePasswordModal(); }}>
              <ThemedText>Change Password</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSignOut}>
              <ThemedText>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Change Password Modal */}
      <Modal transparent animationType="none" visible={isChangePasswordModalVisible}>
        <Pressable style={styles.modalContainer} onPress={toggleChangePasswordModal}>
          <View style={[styles.modal, colorScheme === 'dark' ? styles.modalDark : styles.modalLight]}>
            <ThemedText>Change Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
              <ThemedText>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Floating Action Button to open the panel */}
      <TouchableOpacity
        style={[styles.fab, colorScheme === 'dark' ? styles.fabDark : styles.fabLight]}
        onPress={togglePanel}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      {/* View Forums Button */}
      <TouchableOpacity
        style={[styles.forumsButton, colorScheme === 'dark' ? styles.fabDark : styles.fabLight]}
        onPress={() => router.push('/forums')}
      >
        <ThemedText style={styles.forumsButtonText}>View Forums</ThemedText>
      </TouchableOpacity>

      {/* Expandable Panel with form options */}
      {isPanelVisible && (
        <Modal transparent animationType="none" visible={isPanelVisible}>
          <Pressable style={styles.panelContainer} onPress={togglePanel}>
            <View style={[styles.panel, colorScheme === 'dark' ? styles.panelDark : styles.panelLight]}>
              {/* Lost & Found reporting option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('lostAndFound')} disabled={!session}>
                <ThemedText>Lost & Found</ThemedText>
              </TouchableOpacity>
              
              {/* Hazard reporting option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('hazard')} disabled={!session}>
                <ThemedText>Hazard</ThemedText>
              </TouchableOpacity>
              
              {/* Event creation option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('event')} disabled={!session}>
                <ThemedText>Event</ThemedText>
              </TouchableOpacity>
              
              {/* Warning message if user is not logged in */}
              {!session && <ThemedText style={{ color: 'red', textAlign: 'center' }}>Please log in to submit reports</ThemedText>}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Conditional rendering of different form modals based on selection */}
      {selectedForm === 'lostAndFound' && (
        <LostAndFoundForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
      {selectedForm === 'hazard' && (
        <HazardForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
      {selectedForm === 'event' && (
        <EventForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
    </View>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  // Profile Icon styles
  profileIcon: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  profileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalLight: {
    backgroundColor: '#fff',
  },
  modalDark: {
    backgroundColor: '#333',
  },
  modalButton: {
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  // Floating Action Button styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabLight: {
    backgroundColor: '#0A7EA4', // Primary color for light theme
  },
  fabDark: {
    backgroundColor: '#1E1E1E', // Darker background for dark theme
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
  
  // Panel styles
  panelContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelLight: {
    backgroundColor: '#fff',
  },
  panelDark: {
    backgroundColor: '#333',
  },
  
  // Action button styles
  button: {
    padding: 15,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  // View Forums Button styles
  forumsButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    width: 120,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  forumsButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});