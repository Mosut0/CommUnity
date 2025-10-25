import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable, TextInput, Alert, useColorScheme, ScrollView, Animated, Easing, Keyboard, Platform, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import usePushNotifications, { registerForPushNotificationsAsync } from '../hooks/usePushNotifications';
import { Session } from '@supabase/supabase-js';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapScreen from '../components/MapScreen';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LostItemForm from '@/components/LostAndFound/LostItemForm';
import FoundItemForm from '@/components/LostAndFound/FoundItemForm';
import FillHazardForm from '@/components/Hazards/FillHazardForm';
import FillEventForm from '@/components/Events/FillEventForm';

import Slider from '@react-native-community/slider';
import { kmToMiles} from '@/utils/distance';
import { MARKER_COLORS } from '@/constants/Markers';

export default function Home() {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'hazard' | 'event' | 'lost' | 'found'>('all');
  const filterScrollRef = React.useRef<ScrollView | null>(null);
  const scrollOffsetRef = React.useRef<number>(0);

  const scrollToOffset = (offset: number) => {
    if (filterScrollRef.current && (filterScrollRef.current as any).scrollTo) {
      // Instant scroll (no animation) to prevent visual movement when selecting
      (filterScrollRef.current as any).scrollTo({ x: offset, animated: false });
    }
  };

  const handleFilterPress = (filterValue: 'all' | 'hazard' | 'event' | 'lost' | 'found') => {
    setSelectedFilter(filterValue);
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
  <Ionicons name="alert-circle-outline" size={22} color={selectedFilter === 'hazard' ? MARKER_COLORS.safety : '#888'} />
        <ThemedText style={styles.filterText}>Hazards</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'event' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('event')}
      >
  <Ionicons name="calendar-outline" size={22} color={selectedFilter === 'event' ? MARKER_COLORS.event : '#888'} />
        <ThemedText style={styles.filterText}>Events</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'lost' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('lost')}
      >
  <Ionicons name="help-circle-outline" size={20} color={selectedFilter === 'lost' ? MARKER_COLORS.lost : '#888'} />
        <ThemedText style={styles.filterText}>Lost</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, selectedFilter === 'found' && styles.filterButtonActive]}
        onPress={() => handleFilterPress('found')}
      >
  <Ionicons name="checkmark-circle-outline" size={20} color={selectedFilter === 'found' ? MARKER_COLORS.found : '#888'} />
        <ThemedText style={styles.filterText}>Found</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
  // Get URL parameters
  const { selectedReportId } = useLocalSearchParams();
  
  // Authentication state management
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  // UI state management
  // Forums-style create sheet visibility
  const [isCreateVisible, setIsCreateVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const colorScheme = useColorScheme();
  // Theme tokens mirroring forums page
  const uiTheme = React.useMemo(() => {
    if (colorScheme === 'dark') {
      return {
        pageBg: '#0B1220',
        cardBg: '#0F172A',
        surface: '#1F2937',
        textPrimary: '#E5E7EB',
        textSecondary: '#9CA3AF',
        divider: '#1F2A37',
        overlay: 'rgba(0,0,0,0.55)',
        accent: '#2563EB',
        danger: '#DC2626',
        chipBg: '#1F2937',
        inputBg: '#1F2937',
      };
    }
    return {
      pageBg: '#F8FAFC',
      cardBg: '#FFFFFF',
      surface: '#F1F5F9',
      textPrimary: '#0F172A',
      textSecondary: '#475569',
      divider: '#E2E8F0',
      overlay: 'rgba(0,0,0,0.25)',
      accent: '#2563EB',
      danger: '#DC2626',
      chipBg: '#F1F5F9',
      inputBg: '#FFFFFF',
    };
  }, [colorScheme]);
  const [forceRender, setForceRender] = useState(false);
  const router = useRouter();
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [sliderValue, setSliderValue] = useState(20);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'miles'>('km');
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const fabAnim = React.useRef(new Animated.Value(0)).current; // 0 collapsed, 1 expanded
  // Animated settings sheet
  const [profileSheetMounted, setProfileSheetMounted] = useState(false);
  const settingsAnim = React.useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown
  const [nextModal, setNextModal] = useState<null | 'password' | 'distance' | 'unit'>(null);
  // Animated password & distance sheets
  const [changePasswordMounted, setChangePasswordMounted] = useState(false);
  const [distanceMounted, setDistanceMounted] = useState(false);
  const [unitMounted, setUnitMounted] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const passwordAnim = React.useRef(new Animated.Value(0)).current; // 0 hidden 1 visible
  const distanceAnim = React.useRef(new Animated.Value(0)).current;
  const unitAnim = React.useRef(new Animated.Value(0)).current;
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Keyboard handling so password sheet isn't covered
  useEffect(() => {
    const showEvent = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const hideEvent = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    const onShow = (e: any) => {
      const height = e?.endCoordinates?.height || 0;
      setKeyboardOffset(height);
    };
    const onHide = () => setKeyboardOffset(0);
    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  const runFabAnimation = (to: number) => {
    Animated.timing(fabAnim, {
      toValue: to,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  // Animate settings sheet open/close
  useEffect(() => {
    if (isProfileModalVisible) {
      setProfileSheetMounted(true);
      settingsAnim.stopAnimation();
      settingsAnim.setValue(0);
      Animated.timing(settingsAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (profileSheetMounted) {
      // closing animation then unmount and trigger deferred modal
      Animated.timing(settingsAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setProfileSheetMounted(false);
          if (nextModal === 'password') {
            setIsChangePasswordModalVisible(true);
          } else if (nextModal === 'distance') {
            openDistanceModal();
          } else if (nextModal === 'unit') {
            openUnitModal();
          }
          setNextModal(null);
        }
      });
    }
  }, [isProfileModalVisible, profileSheetMounted, nextModal]);

  const openDistanceModal = async () => {
    if (session) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const userMetadata = data.user.user_metadata;
        const radiusKm = userMetadata?.distance_radius || 20;
        const unit = userMetadata?.distance_unit || 'km';
        setDistanceUnit(unit);
        // Always store km in the slider, display conversion is handled in the UI
        setSliderValue(radiusKm);
      }
    }
    setIsDistanceModalVisible(true);
  };

  const openUnitModal = async () => {
    if (session) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const userMetadata = data.user.user_metadata;
        setDistanceUnit(userMetadata?.distance_unit || 'km');
      }
    }
    setIsUnitModalVisible(true);
  };

  // Animate password modal
  useEffect(() => {
    if (isChangePasswordModalVisible) {
      setChangePasswordMounted(true);
      passwordAnim.stopAnimation();
      passwordAnim.setValue(0);
      Animated.timing(passwordAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else if (changePasswordMounted) {
      Animated.timing(passwordAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { 
          if (finished) { 
            setChangePasswordMounted(false); 
            // Clear any unsaved input when the sheet fully closes
            setOldPassword('');
            setNewPassword('');
          } 
        });
    }
  }, [isChangePasswordModalVisible, changePasswordMounted]);

  // Animate distance modal
  useEffect(() => {
    if (isDistanceModalVisible) {
      setDistanceMounted(true);
      distanceAnim.stopAnimation();
      distanceAnim.setValue(0);
      Animated.timing(distanceAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else if (distanceMounted) {
      Animated.timing(distanceAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setDistanceMounted(false); });
    }
  }, [isDistanceModalVisible, distanceMounted]);

  // Animate unit modal
  useEffect(() => {
    if (isUnitModalVisible) {
      setUnitMounted(true);
      unitAnim.stopAnimation();
      unitAnim.setValue(0);
      Animated.timing(unitAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else if (unitMounted) {
      Animated.timing(unitAnim, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        .start(({ finished }) => { if (finished) setUnitMounted(false); });
    }
  }, [isUnitModalVisible, unitMounted]);

  // Fetch the current session and listen for authentication state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthReady(true);
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
            setDistanceUnit(userMetadata.distance_unit || 'km');
          }
        });
      }
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthReady(true);
    });
  }, []);

  // Register for push notifications and update location when session is available
  usePushNotifications(session?.user?.id ?? null);

  // Redirect away only after auth state is resolved to avoid false negatives
  useEffect(() => {
    if (authReady && !session) {
      router.replace('/sign-in');
    }
  }, [authReady, session]);

  useEffect(() => {
    // Short delay to let the map initialize properly
    const timer = setTimeout(() => {
      console.log('Forcing re-render to make pins display');
      setForceRender(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Open a specific form from create sheet
  const openForm = (formType: string) => {
    setSelectedForm(formType);
    setIsCreateVisible(false);
    setIsFabExpanded(false);
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
        const radiusKm = userMetadata.distance_radius || 20;
        const unit = userMetadata.distance_unit || 'km';
        setDistanceUnit(unit);
        // Always store km in the slider, display conversion is handled in the UI
        setSliderValue(radiusKm);
      }
    }
    setIsDistanceModalVisible(!isDistanceModalVisible);
  };

  // Toggle the visibility of the unit modal and fetch current value
  const toggleUnitModal = async () => {
    if (session) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data && data.user) {
        const userMetadata = data.user.user_metadata;
        setDistanceUnit(userMetadata.distance_unit || 'km');
      }
    }
    setIsUnitModalVisible(!isUnitModalVisible);
  };

  // Handle saving the new distance unit
  const handleSaveUnit = async () => {
    if (session) {
      const { error } = await supabase.auth.updateUser({
        data: {
          distance_unit: distanceUnit,
          user_metadata: {
            distance_unit: distanceUnit,
          },
        }
      });

      if (error) {
        Alert.alert('Error', 'Failed to update distance unit');
        console.error('Failed to update distance unit:', error);
      } else {
        Alert.alert('Success', 'Distance unit updated successfully');
        console.log('Updated distance unit to:', distanceUnit);

        // Fetch updated user data after saving
        const { data: updatedUser, error: fetchError } = await supabase.auth.getUser();
        if (fetchError) {
          console.error('Error fetching updated user:', fetchError);
        } else {
          console.log('Updated user metadata:', updatedUser?.user?.user_metadata);
        }
      }
    }
    setIsUnitModalVisible(false);
  };

  // Handle user sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileModalVisible(false);
    router.replace('/sign-in'); // Replace stack so user cannot go back to Home
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
      <View style={[
        styles.topBar,
        { top: (insets?.top || 0) },
        colorScheme === 'dark' ? styles.topBarDark : styles.topBarLight,
      ]}>
        <View style={styles.filterWrapper}>
          <FilterBar />
        </View>
        <View style={[styles.topBarDivider, colorScheme === 'dark' ? styles.topBarDividerDark : styles.topBarDividerLight]} />
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={toggleProfileModal}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open profile and settings"
        >
          <View style={[
            styles.profileIconCircle,
            colorScheme === 'dark' ? styles.profileIconCircleDark : styles.profileIconCircleLight,
          ]}>
            <MaterialIcons name="account-circle" size={24} color={colorScheme === 'dark' ? '#fff' : '#000'} />
          </View>
        </TouchableOpacity>
        {/* Test Push button for manual testing of token retrieval */}
        <TouchableOpacity
          style={{ marginLeft: 8 }}
          onPress={async () => {
            try {
              const token = await registerForPushNotificationsAsync();
              if (token) {
                Alert.alert('Push Token', String(token));
                console.log('Manual push token:', token);
              } else {
                Alert.alert('Push Token', 'No token received (permission denied or not a device)');
                console.log('No push token received');
              }
            } catch (e) {
              console.error('Error getting push token:', e);
              Alert.alert('Push Token', 'Error: ' + String(e));
            }
          }}
          accessibilityLabel="Test push registration"
        >
          <View style={{ padding: 6 }}>
            <ThemedText style={{ color: colorScheme === 'dark' ? '#fff' : '#000', fontSize: 13 }}>Test Push</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Map display showing the community data */}
      <MapScreen 
        distanceRadius={distanceRadius} 
        selectedReportId={selectedReportId ? Number(selectedReportId) : undefined} 
      filter={selectedFilter} />

      {/* Overlay to close speed dial when expanded */}
      {isFabExpanded && (
        <Pressable
          style={styles.fabOverlay}
          onPress={() => { setIsFabExpanded(false); runFabAnimation(0); }}
          accessibilityLabel="Close actions overlay"
        />
      )}

      {/* Settings / Profile Bottom Sheet with animation */}
      <Modal
        transparent
        animationType="none"
        visible={profileSheetMounted}
        onRequestClose={toggleProfileModal}
      >
        <Animated.View
          style={[styles.sheetOverlay, {
            backgroundColor: uiTheme.overlay,
            opacity: settingsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] })
          }]}
        >
          <Pressable style={{ flex: 1 }} onPress={toggleProfileModal} />
          <Animated.View
            style={[
              styles.sheetInner,
              {
                backgroundColor: uiTheme.cardBg,
                borderColor: uiTheme.divider,
                paddingBottom: 20 + insets.bottom,
                borderTopWidth: 1,
                transform: [
                  {
                    translateY: settingsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  },
                ],
                opacity: settingsAnim,
              },
            ]}
          >
            <View style={styles.sheetHandleWrap}>
              <View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} />
            </View>
            <View style={styles.sheetHeaderRow}>
              <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary }]}>Settings</ThemedText>
            </View>
            <View style={[styles.sheetSection, { borderColor: uiTheme.divider }]}> 
              <TouchableOpacity style={styles.sheetRow} onPress={() => { setNextModal('password'); setIsProfileModalVisible(false); }}>
                <View style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}>
                  <MaterialIcons name="lock-outline" size={20} color={uiTheme.textSecondary} />
                </View>
                <View style={styles.sheetRowTextWrap}>
                  <ThemedText style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}>Change Password</ThemedText>
                  <ThemedText style={[styles.sheetRowSubtitle, { color: uiTheme.textSecondary }]}>Update your account password</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={uiTheme.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]} />
              <TouchableOpacity style={styles.sheetRow} onPress={() => { setNextModal('distance'); setIsProfileModalVisible(false); }}>
                <View style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}>
                  <MaterialIcons name="my-location" size={20} color={uiTheme.textSecondary} />
                </View>
                <View style={styles.sheetRowTextWrap}>
                  <ThemedText style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}>Change Distance</ThemedText>
                  <ThemedText style={[styles.sheetRowSubtitle, { color: uiTheme.textSecondary }]}>Radius filter for reports</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={uiTheme.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]} />
              <TouchableOpacity style={styles.sheetRow} onPress={() => { setNextModal('unit'); setIsProfileModalVisible(false); }}>
                <View style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}>
                  <MaterialIcons name="straighten" size={20} color={uiTheme.textSecondary} />
                </View>
                <View style={styles.sheetRowTextWrap}>
                  <ThemedText style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}>Distance Unit</ThemedText>
                  <ThemedText style={[styles.sheetRowSubtitle, { color: uiTheme.textSecondary }]}>Switch between km and miles</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={uiTheme.textSecondary} />
              </TouchableOpacity>
              <View style={[styles.rowDivider, { backgroundColor: uiTheme.divider }]} />
              <TouchableOpacity style={styles.sheetRow} onPress={() => { setIsProfileModalVisible(false); router.push('/settings'); }}>
                <View style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}>
                  <MaterialIcons name="notifications-none" size={20} color={uiTheme.textSecondary} />
                </View>
                <View style={styles.sheetRowTextWrap}>
                  <ThemedText style={[styles.sheetRowTitle, { color: uiTheme.textPrimary }]}>Notifications</ThemedText>
                  <ThemedText style={[styles.sheetRowSubtitle, { color: uiTheme.textSecondary }]}>Manage notification types & radius</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={uiTheme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.sheetSection, { borderColor: uiTheme.divider }]}> 
              <TouchableOpacity style={styles.sheetRow} onPress={handleSignOut}>
                <View style={[styles.sheetIcon, { backgroundColor: uiTheme.chipBg }]}>
                  <MaterialIcons name="logout" size={20} color={uiTheme.danger} />
                </View>
                <View style={styles.sheetRowTextWrap}>
                  <ThemedText style={[styles.sheetRowTitle, { color: uiTheme.danger }]}>Sign Out</ThemedText>
                  <ThemedText style={[styles.sheetRowSubtitle, { color: uiTheme.textSecondary }]}>Return to login screen</ThemedText>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={uiTheme.textSecondary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Change Password Modal */}
      <Modal transparent animationType="none" visible={changePasswordMounted} onRequestClose={toggleChangePasswordModal}>
        <Animated.View style={[styles.sheetOverlay, { backgroundColor: uiTheme.overlay, opacity: passwordAnim }]}> 
          <Pressable style={{ flex: 1 }} onPress={toggleChangePasswordModal} />
          <Animated.View
            style={[styles.sheetInner, {
              backgroundColor: uiTheme.cardBg,
              borderColor: uiTheme.divider,
              paddingBottom: 20 + insets.bottom,
              borderTopWidth: 1,
              transform: [{ translateY: passwordAnim.interpolate({ inputRange: [0,1], outputRange: [60,0] }) }],
              opacity: passwordAnim,
              // Lift sheet above keyboard
              marginBottom: keyboardOffset > 0 ? keyboardOffset - insets.bottom : 0,
            }]}
          >
            <View style={styles.sheetHandleWrap}><View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} /></View>
            <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary, marginBottom: 12 }]}>Change Password</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: uiTheme.inputBg, color: uiTheme.textPrimary, borderColor: uiTheme.divider }]}
              placeholder="Old Password"
              placeholderTextColor={uiTheme.textSecondary}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={[styles.input, { backgroundColor: uiTheme.inputBg, color: uiTheme.textPrimary, borderColor: uiTheme.divider }]}
              placeholder="New Password"
              placeholderTextColor={uiTheme.textSecondary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: uiTheme.accent }]} onPress={handleChangePassword}>
              <ThemedText style={[styles.primaryBtnText, { color: '#FFFFFF' }]}>Save</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Change Distance Modal */}
      <Modal transparent animationType="none" visible={distanceMounted} onRequestClose={toggleDistanceModal}>
        <Animated.View style={[styles.sheetOverlay, { backgroundColor: uiTheme.overlay, opacity: distanceAnim }]}> 
          <Pressable style={{ flex: 1 }} onPress={toggleDistanceModal} />
          <Animated.View
            style={[styles.sheetInner, {
              backgroundColor: uiTheme.cardBg,
              borderColor: uiTheme.divider,
              paddingBottom: 20 + insets.bottom,
              borderTopWidth: 1,
              transform: [{ translateY: distanceAnim.interpolate({ inputRange: [0,1], outputRange: [60,0] }) }],
              opacity: distanceAnim,
            }]}
          >
            <View style={styles.sheetHandleWrap}><View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} /></View>
            <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary, marginBottom: 12 }]}>Distance Radius</ThemedText>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={2}
              maximumValue={100}
              step={1}
              value={sliderValue}
              onValueChange={setSliderValue}
              minimumTrackTintColor={uiTheme.accent}
              maximumTrackTintColor={colorScheme==='dark' ? '#374151' : '#CBD5E1'}
              thumbTintColor={uiTheme.accent}
            />
            <ThemedText style={{ color: uiTheme.textSecondary, marginBottom: 14 }}>
              {distanceUnit === 'miles' 
                ? `${Math.round(kmToMiles(sliderValue))} miles` 
                : `${sliderValue} km`}
            </ThemedText>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: uiTheme.accent }]} onPress={handleSaveDistance}>
              <ThemedText style={[styles.primaryBtnText, { color: '#FFFFFF' }]}>Save</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Change Distance Unit Modal */}
      <Modal transparent animationType="none" visible={unitMounted} onRequestClose={toggleUnitModal}>
        <Animated.View style={[styles.sheetOverlay, { backgroundColor: uiTheme.overlay, opacity: unitAnim }]}> 
          <Pressable style={{ flex: 1 }} onPress={toggleUnitModal} />
          <Animated.View
            style={[styles.sheetInner, {
              backgroundColor: uiTheme.cardBg,
              borderColor: uiTheme.divider,
              paddingBottom: 20 + insets.bottom,
              borderTopWidth: 1,
              transform: [{ translateY: unitAnim.interpolate({ inputRange: [0,1], outputRange: [60,0] }) }],
              opacity: unitAnim,
            }]}
          >
            <View style={styles.sheetHandleWrap}><View style={[styles.sheetHandle, { backgroundColor: uiTheme.divider }]} /></View>
            <ThemedText style={[styles.sheetTitle, { color: uiTheme.textPrimary, marginBottom: 20 }]}>Distance Unit</ThemedText>
            
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={styles.radioOption} 
                onPress={() => setDistanceUnit('km')}
              >
                <View style={[styles.radioCircle, { borderColor: uiTheme.divider }]}>
                  {distanceUnit === 'km' && (
                    <View style={[styles.radioInner, { backgroundColor: uiTheme.accent }]} />
                  )}
                </View>
                <ThemedText style={[styles.radioLabel, { color: uiTheme.textPrimary }]}>
                  Kilometers (km)
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.radioOption} 
                onPress={() => setDistanceUnit('miles')}
              >
                <View style={[styles.radioCircle, { borderColor: uiTheme.divider }]}>
                  {distanceUnit === 'miles' && (
                    <View style={[styles.radioInner, { backgroundColor: uiTheme.accent }]} />
                  )}
                </View>
                <ThemedText style={[styles.radioLabel, { color: uiTheme.textPrimary }]}>
                  Miles (mi)
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: uiTheme.accent, marginTop: 14 }]} onPress={handleSaveUnit}>
              <ThemedText style={[styles.primaryBtnText, { color: '#FFFFFF' }]}>Save</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Speed Dial Root FAB */}
      <TouchableOpacity
        style={[styles.fab, colorScheme === 'dark' ? styles.fabDark : styles.fabLight]}
        onPress={() => {
          const next = !isFabExpanded;
            setIsFabExpanded(next);
            runFabAnimation(next ? 1 : 0);
        }}
        accessibilityLabel={isFabExpanded ? 'Close actions' : 'Open actions'}
        accessibilityRole="button"
      >
        <Animated.View
          style={{
            transform: [
              { rotate: fabAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
            ],
          }}
        >
          <MaterialIcons name={isFabExpanded ? 'close' : 'more-vert'} size={26} color={'#fff'} />
        </Animated.View>
      </TouchableOpacity>

  {/* Speed Dial Actions (appear above root) */}
      {/** Animated Speed Dial Actions */}
      <Animated.View
        pointerEvents={isFabExpanded ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          right: 30,
          bottom: 30,
          zIndex: 60,
        }}
      >
        {/* Second (top) action */}
        <Animated.View
          style={[
            styles.speedDialButton,
            colorScheme === 'dark' ? styles.fabDark : styles.fabLight,
            {
              transform: [
                { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -136] }) },
                { scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
              opacity: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.speedDialTouchable}
            onPress={() => { setIsFabExpanded(false); runFabAnimation(0); router.push('/forums'); }}
            accessibilityLabel="Open Forums"
            accessibilityRole="button"
          >
            <MaterialIcons name="format-list-bulleted" size={22} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
        {/* First (middle) action */}
        <Animated.View
          style={[
            styles.speedDialButton,
            colorScheme === 'dark' ? styles.fabDark : styles.fabLight,
            {
              transform: [
                { translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                { scale: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
              opacity: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.speedDialTouchable}
            onPress={() => { setIsCreateVisible(true); runFabAnimation(0); setIsFabExpanded(false); }}
            accessibilityLabel="Create report"
            accessibilityRole="button"
          >
            <MaterialIcons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Forums-style Create Sheet */}
      <Modal
        visible={isCreateVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreateVisible(false)}
      >
        <Pressable
          style={[styles.sheetOverlay, { backgroundColor: uiTheme.overlay }]}
          onPress={() => setIsCreateVisible(false)}
        >
          <Animated.View
            style={[styles.createSheet, { backgroundColor: uiTheme.cardBg, borderColor: uiTheme.divider, paddingBottom: 20 + insets.bottom }]}
          >
            <Text style={[styles.createTitle, { color: uiTheme.textPrimary }]}>Create new...</Text>
            <View style={styles.createGrid}>
              {[
                { key: 'safety', label: 'Hazard', icon: 'alert-circle-outline', color: MARKER_COLORS.safety },
                { key: 'event', label: 'Event', icon: 'calendar-outline', color: MARKER_COLORS.event },
                { key: 'lost', label: 'Lost Item', icon: 'help-circle-outline', color: MARKER_COLORS.lost },
                { key: 'found', label: 'Found Item', icon: 'checkmark-circle-outline', color: MARKER_COLORS.found },
              ].map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[styles.createCell, { backgroundColor: colorScheme === 'dark' ? '#1F2937' : '#F1F5F9' }]}
                  onPress={() => {
                    if (!session) {
                      Alert.alert('Not signed in', 'Please sign in to submit a report.');
                      return;
                    }
                    setIsCreateVisible(false);
                    if (c.key === 'safety') openForm('hazard');
                    else if (c.key === 'event') openForm('event');
                    else if (c.key === 'lost') openForm('lost');
                    else if (c.key === 'found') openForm('found');
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.iconBubbleLg, { backgroundColor: c.color + '22' }]}> 
                    <Ionicons name={c.icon as any} size={24} color={c.color} />
                  </View>
                  <Text style={[styles.createCellText, { color: uiTheme.textPrimary }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Conditional rendering of different form modals based on selection */}
      {/* Lost Item Form Modal */}
      <LostItemForm 
        visible={selectedForm === 'lost'}
        onSubmit={() => setSelectedForm(null)} 
        onClose={() => setSelectedForm(null)}
        userId={session?.user?.id || ''} 
      />
      
      {/* Found Item Form Modal */}
      <FoundItemForm 
        visible={selectedForm === 'found'}
        onSubmit={() => setSelectedForm(null)} 
        onClose={() => setSelectedForm(null)}
        userId={session?.user?.id || ''} 
      />
      
      {/* Hazard Form Modal */}
      <FillHazardForm 
        visible={selectedForm === 'hazard'}
        onSubmit={() => setSelectedForm(null)} 
        onClose={() => setSelectedForm(null)}
        userId={session?.user?.id || ''} 
      />
      
      {/* Event Form Modal */}
      <FillEventForm 
        visible={selectedForm === 'event'}
        onSubmit={() => setSelectedForm(null)} 
        onClose={() => setSelectedForm(null)}
        userId={session?.user?.id || ''} 
      />
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
    width: 28,
    height: 28,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconCircleLight: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileIconCircleDark: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#374151',
  },
  topBarDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  topBarDividerLight: {
    backgroundColor: '#E2E8F0',
  },
  topBarDividerDark: {
    backgroundColor: '#374151',
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
  // Unified size with forums button
  width: 56,
  height: 56,
  borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  zIndex: 70,
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
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  zIndex: 40,
  },

  // Panel styles
  panelContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Top bar styles
  topBar: {
    position: 'absolute',
    // top is now dynamic via insets; keep default fallback minimal
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
  // Speed Dial action buttons
  speedDialButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  speedDialTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  /* Settings sheet styles */
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  sheetHandleWrap: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetSection: {
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 14,
    overflow: 'hidden',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowTextWrap: {
    flex: 1,
  },
  sheetRowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sheetRowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    opacity: 0.65,
    marginLeft: 14 + 40 + 14, // indent after icon
  },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  /* Create sheet (forums-style) */
  createSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
  },
  createTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 12,
  },
  createGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  createCell: {
    width: '47%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  iconBubbleLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCellText: {
    fontWeight: '600',
  },
  radioGroup: {
    gap: 2,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});