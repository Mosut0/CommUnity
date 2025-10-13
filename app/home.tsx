import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, useColorScheme, ScrollView, Animated, Easing, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapScreen from '../components/MapScreen';
import { MaterialIcons } from '@expo/vector-icons';
import LostItemForm from '@/components/LostAndFound/LostItemForm';
import FoundItemForm from '@/components/LostAndFound/FoundItemForm';
import FillHazardForm from '@/components/Hazards/FillHazardForm';
import FillEventForm from '@/components/Events/FillEventForm';

import { Colors, CommonColors } from '@/constants/Colors';
import type { ThemeName } from '@/constants/Colors';
import { FilterBar } from '@/components/Home/FilterBar';
import { ProfileSheet } from '@/components/Home/ProfileSheet';
import { ChangePasswordSheet } from '@/components/Home/ChangePasswordSheet';
import { DistanceSheet } from '@/components/Home/DistanceSheet';
import { DistanceUnitSheet } from '@/components/Home/DistanceUnitSheet';
import { CreateSheet } from '@/components/Home/CreateSheet';
import { SpeedDial } from '@/components/Home/SpeedDial';
import type { FilterValue, DistanceUnit } from '@/components/Home/types';

export default function Home() {
  const insets = useSafeAreaInsets();
  // UI-selected filter (instant for button highlight)
  const [selectedFilter, setSelectedFilter] = useState<FilterValue>('all');
  // Debounced/applied filter used for the Map to reduce rapid mount/unmount thrash
  const [appliedFilter, setAppliedFilter] = useState<FilterValue>('all');
  const filterDebounceRef = React.useRef<number | null>(null);
  const filterScrollRef = React.useRef<ScrollView | null>(null);
  const scrollOffsetRef = React.useRef<number>(0);

  const scrollToOffset = (offset: number) => {
    if (filterScrollRef.current && (filterScrollRef.current as any).scrollTo) {
      // Instant scroll (no animation) to prevent visual movement when selecting
      (filterScrollRef.current as any).scrollTo({ x: offset, animated: false });
    }
  };

  const handleFilterPress = (filterValue: FilterValue) => {
    // Update UI state immediately for responsiveness
    setSelectedFilter(filterValue);

    // Keep filter bar scroll position stable
    const offset = scrollOffsetRef.current;
    scrollToOffset(offset);
    requestAnimationFrame(() => scrollToOffset(offset));
    setTimeout(() => scrollToOffset(offset), 0);

    // Debounce applying the filter to the map to avoid rapid marker churn/crashes
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current as unknown as number);
      filterDebounceRef.current = null;
    }
    filterDebounceRef.current = setTimeout(() => {
      setAppliedFilter(filterValue);
    }, 200) as unknown as number;
  };

  // Cleanup any pending debounce on unmount
  useEffect(() => {
    return () => {
      if (filterDebounceRef.current) {
        clearTimeout(filterDebounceRef.current as unknown as number);
        filterDebounceRef.current = null;
      }
    };
  }, []);

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
  const theme: ThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const uiTheme = Colors[theme];
  const [forceRender, setForceRender] = useState(false);
  const router = useRouter();
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [sliderValue, setSliderValue] = useState(20);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
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

  const toggleFab = () => {
    const next = !isFabExpanded;
    setIsFabExpanded(next);
    runFabAnimation(next ? 1 : 0);
  };

  const handleOpenCreateSheet = () => {
    setIsCreateVisible(true);
    setIsFabExpanded(false);
    runFabAnimation(0);
  };

  const handleOpenForums = () => {
    setIsFabExpanded(false);
    runFabAnimation(0);
    router.push('/forums');
  };

  const handleSelectCreateAction = (action: 'hazard' | 'event' | 'lost' | 'found') => {
    if (!session) {
      Alert.alert('Not signed in', 'Please sign in to submit a report.');
      return;
    }
    setIsCreateVisible(false);
    openForm(action);
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
    router.replace('/welcome'); // Replace stack so user cannot go back to Home
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
        theme === 'dark' ? styles.topBarDark : styles.topBarLight,
      ]}>
        <View style={styles.filterWrapper}>
          <FilterBar
            selectedFilter={selectedFilter}
            onFilterPress={handleFilterPress}
            theme={theme}
            uiTheme={uiTheme}
            filterScrollRef={filterScrollRef}
            onScrollOffsetChange={(offset) => {
              scrollOffsetRef.current = offset;
            }}
          />
        </View>
        <View style={[styles.topBarDivider, theme === 'dark' ? styles.topBarDividerDark : styles.topBarDividerLight]} />
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={toggleProfileModal}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open profile and settings"
        >
          <View style={[
            styles.profileIconCircle,
            theme === 'dark' ? styles.profileIconCircleDark : styles.profileIconCircleLight,
          ]}>
            <MaterialIcons name="account-circle" size={24} color={uiTheme.textPrimary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Map display showing the community data */}
      <MapScreen 
        distanceRadius={distanceRadius} 
        selectedReportId={selectedReportId ? Number(selectedReportId) : undefined} 
      filter={appliedFilter} />

      <ProfileSheet
        visible={profileSheetMounted}
        animation={settingsAnim}
        onRequestClose={toggleProfileModal}
        onPressChangePassword={() => {
          setNextModal('password');
          setIsProfileModalVisible(false);
        }}
        onPressChangeDistance={() => {
          setNextModal('distance');
          setIsProfileModalVisible(false);
        }}
        onPressChangeUnit={() => {
          setNextModal('unit');
          setIsProfileModalVisible(false);
        }}
        onPressSignOut={handleSignOut}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
      />

      <ChangePasswordSheet
        visible={changePasswordMounted}
        animation={passwordAnim}
        onRequestClose={toggleChangePasswordModal}
        insetsBottom={insets.bottom}
        keyboardOffset={keyboardOffset}
        uiTheme={uiTheme}
        oldPassword={oldPassword}
        newPassword={newPassword}
        onChangeOldPassword={setOldPassword}
        onChangeNewPassword={setNewPassword}
        onSubmit={handleChangePassword}
      />

      <DistanceSheet
        visible={distanceMounted}
        animation={distanceAnim}
        onRequestClose={toggleDistanceModal}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
        sliderValue={sliderValue}
        onSliderChange={setSliderValue}
        onSubmit={handleSaveDistance}
        distanceUnit={distanceUnit}
      />

      <DistanceUnitSheet
        visible={unitMounted}
        animation={unitAnim}
        onRequestClose={toggleUnitModal}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
        distanceUnit={distanceUnit}
        onSelectUnit={setDistanceUnit}
        onSubmit={handleSaveUnit}
      />

      <SpeedDial
        isExpanded={isFabExpanded}
        animation={fabAnim}
        onToggle={toggleFab}
        onPressCreate={handleOpenCreateSheet}
        onPressForums={handleOpenForums}
        uiTheme={uiTheme}
        theme={theme}
      />

      <CreateSheet
        visible={isCreateVisible}
        onRequestClose={() => setIsCreateVisible(false)}
        onSelectAction={handleSelectCreateAction}
        uiTheme={uiTheme}
        insetsBottom={insets.bottom}
      />

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
  topBar: {
    position: 'absolute',
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
    shadowColor: CommonColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topBarLight: {
    backgroundColor: Colors.light.pageBg,
  },
  topBarDark: {
    backgroundColor: Colors.dark.pageBg,
  },
  filterWrapper: {
    flex: 1,
    marginRight: 8,
  },
  topBarDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  topBarDividerLight: {
    backgroundColor: Colors.light.profileBorder,
  },
  topBarDividerDark: {
    backgroundColor: Colors.dark.profileBorder,
  },
  profileIcon: {
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
    borderColor: Colors.light.profileBorder,
  },
  profileIconCircleDark: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.profileBorder,
  },
});
