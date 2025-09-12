import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput, Alert, useColorScheme, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import MapScreen from '../components/MapScreen';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LostAndFoundForm } from '@/components/LostAndFound';
import { HazardForm } from '@/components/Hazards';
import { EventForm } from '@/components/Events';
import { ThemedText } from '@/components/ThemedText';
import Slider from '@react-native-community/slider';

export default function Home() {
  // Filter state for map pins
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hazard' | 'event' | 'lost' | 'found'>('all');
  // Colors aligned with `app/forums.tsx` categoryColors
  const FORUM_COLORS = {
    event: '#7C3AED', // purple-600
    lost:  '#EAB308', // yellow-500
    found: '#22C55E', // green-500
    safety:'#EF4444', // red-500
  };
  // Filter bar component (defined inside to use hooks/state correctly)
  // Preserve horizontal scroll offset when tapping a filter so the selected option
  // remains in the same visual position.
  const filterScrollRef = React.useRef<ScrollView | null>(null);
  const scrollOffsetRef = React.useRef<number>(0);

  const scrollToOffset = (offset: number) => {
    if (filterScrollRef.current && (filterScrollRef.current as any).scrollTo) {
      // Instant scroll (no animation) to prevent visual movement when selecting
      (filterScrollRef.current as any).scrollTo({ x: offset, animated: false });
    }
  };

  const handleFilterPress = (filterValue: 'all' | 'hazard' | 'event' | 'lost' | 'found') => {
    // set selected filter immediately
    setSelectedFilter(filterValue);
    // restore previous scroll offset instantly so the tapped item doesn't move
    // Call several times synchronously and in next frames to beat any layout changes
    const offset = scrollOffsetRef.current;
    scrollToOffset(offset);
    requestAnimationFrame(() => scrollToOffset(offset));
    setTimeout(() => scrollToOffset(offset), 0);
  };

  const FilterBar = () => (
    <ScrollView
      ref={filterScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.filterContent]}
      style={[styles.filterBarInline, colorScheme === 'dark' ? styles.filterBarDark : styles.filterBarLight]}
      onScroll={(e) => {
        scrollOffsetRef.current = e.nativeEvent.contentOffset.x;
      }}
      scrollEventThrottle={16}
    >
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('all')}
      >
  <Ionicons name="layers" size={22} color={selectedFilter === 'all' ? '#0A7EA4' : '#888'} />
        <ThemedText style={styles.filterText}>All</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'hazard' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('hazard')}
      >
  <Ionicons name="alert-circle-outline" size={22} color={selectedFilter === 'hazard' ? FORUM_COLORS.safety : '#888'} />
        <ThemedText style={styles.filterText}>Hazards</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'event' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('event')}
      >
  <Ionicons name="calendar-outline" size={22} color={selectedFilter === 'event' ? FORUM_COLORS.event : '#888'} />
        <ThemedText style={styles.filterText}>Events</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'lost' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('lost')}
      >
  <Ionicons name="help-circle-outline" size={20} color={selectedFilter === 'lost' ? FORUM_COLORS.lost : '#888'} />
        <ThemedText style={styles.filterText}>Lost</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'found' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('found')}
      >
  <Ionicons name="checkmark-circle-outline" size={20} color={selectedFilter === 'found' ? FORUM_COLORS.found : '#888'} />
        <ThemedText style={styles.filterText}>Found</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
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
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [sliderValue, setSliderValue] = useState(20);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);

  // Fetch the current session and listen for authentication state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch the user's distance radius from the database
        supabase.auth.getUser().then(({ data, error }) => {
          if (error) {
            console.error('Error fetching distance radius:', error);
          } else if (data && data.user) {
            const userMetadata = data.user.user_metadata;
            console.log('Fetched user metadata:', userMetadata);
            setDistanceRadius(userMetadata.distance_radius || 20);
            setSliderValue(userMetadata.distance_radius || 20);
          }
        });
      }
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

  // Toggle the visibility of the change distance modal and fetch current value
  const toggleDistanceModal = async () => {
    if (session) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data && data.user) {
        const userMetadata = data.user.user_metadata;
        setSliderValue(userMetadata.distance_radius || 20);
      }
    }
    setIsDistanceModalVisible(!isDistanceModalVisible);
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

  // Handle saving the new distance radius
  const handleSaveDistance = async () => {
    if (session) {
      const { error } = await supabase.auth.updateUser({
        data: {
          distance_radius: sliderValue,
          user_metadata: {
            distance_radius: sliderValue,
          },
        }
      });

      if (error) {
        Alert.alert('Error', 'Failed to update distance radius');
        console.error('Failed to update distance radius:', error);
      } else {
        Alert.alert('Success', 'Distance radius updated successfully');
        console.log('Updated distance radius to:', sliderValue);

        // Fetch updated user data after saving
        const { data: updatedUser, error: fetchError } = await supabase.auth.getUser();
        if (fetchError) {
          console.error('Error fetching updated user:', fetchError);
        } else {
          console.log('Updated user metadata:', updatedUser?.user?.user_metadata);
          setDistanceRadius(updatedUser?.user?.user_metadata?.distance_radius || 20);
        }
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar with scrollable FilterBar on the left and fixed Profile Icon on the right */}
      <View style={[styles.topBar, colorScheme === 'dark' ? styles.topBarDark : styles.topBarLight]}>
        <View style={styles.filterWrapper}>
          <FilterBar />
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={toggleProfileModal}>
          <View style={styles.profileIconCircle}>
            <MaterialIcons name="account-circle" size={28} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Map display showing the community data */}
      <MapScreen distanceRadius={distanceRadius} filter={selectedFilter} />

      {/* Profile Modal */}
      <Modal transparent animationType="none" visible={isProfileModalVisible}>
        <Pressable style={styles.modalContainer} onPress={toggleProfileModal}>
          <View style={[styles.modal, colorScheme === 'dark' ? styles.modalDark : styles.modalLight]}>
            <TouchableOpacity style={styles.modalButton} onPress={() => { setIsProfileModalVisible(false); toggleChangePasswordModal(); }}>
              <ThemedText>Change Password</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { setIsProfileModalVisible(false); toggleDistanceModal(); }}>
              <ThemedText>Change Distance</ThemedText>
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

      {/* Change Distance Modal */}
      <Modal transparent animationType="none" visible={isDistanceModalVisible}>
        <Pressable style={styles.modalContainer} onPress={toggleDistanceModal}>
          <View style={[styles.modal, colorScheme === 'dark' ? styles.modalDark : styles.modalLight]}>
            <ThemedText>Change Distance Radius</ThemedText>
            <Slider
              style={{ width: 200, height: 40 }}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={sliderValue}
              onValueChange={setSliderValue}
              minimumTrackTintColor="#1EB1FC"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#1EB1FC"
            />
            <ThemedText>{sliderValue} km</ThemedText>
            <TouchableOpacity style={styles.modalButton} onPress={handleSaveDistance}>
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

      <TouchableOpacity
        style={[styles.forumsButton, styles.forumsButtonOnFab, colorScheme === 'dark' ? styles.fabDark : styles.fabLight]}
        onPress={() => router.push('/forums')}
        accessibilityLabel="Open Forums"
        accessibilityRole="button"
      >
        <MaterialIcons name="format-list-bulleted" size={22} color="#fff" />
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
  // Filter bar styles
  filterBarContainer: {
  // overlay positioned above the map
  position: 'absolute',
  top: 60,
  left: 8,
  right: 8,
  zIndex: 20,
  backgroundColor: '#fff',
  paddingVertical: 8,
  paddingHorizontal: 4,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  borderRadius: 12,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(10, 126, 164, 0.08)',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '500',
  // color comes from ThemedText; keep style minimal here
  },
  filterContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingHorizontal: 8,
  gap: 8,
  },
  filterBarLight: {
    backgroundColor: '#fff',
  },
  filterBarDark: {
    backgroundColor: '#222',
  },
  // Inline variant for using inside the top bar (non-absolute)
  filterBarInline: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  // Profile Icon styles
  profileIcon: {
  // moved into top bar; keep minimal margins
  marginRight: 8,
  zIndex: 30,
  },
  profileIconCircle: {
    width: 30,
    height: 30,
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

  // Top bar styles
  topBar: {
    position: 'absolute',
    top: 40,
    left: 8,
    right: 8,
    zIndex: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topBarLight: {
    backgroundColor: '#fff',
  },
  topBarDark: {
    backgroundColor: '#222',
  },

  // Wrapper to ensure filter is scrollable and doesn't overlap the profile icon
  filterWrapper: {
    flex: 1,
    marginRight: 8,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  // Position the forums button directly on top of the FAB (bottom-right)
  forumsButtonOnFab: {
    right: 30,
    left: undefined,
    // place above the FAB (FAB bottom 30 + FAB height 60 + 12 spacing = bottom ~102)
    bottom: 102,
    zIndex: 60,
    elevation: 8,
    // keep circular clipping
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  forumsButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});