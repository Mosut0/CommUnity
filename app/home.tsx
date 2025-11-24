import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import usePushNotifications from '../hooks/usePushNotifications';
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
import { AccountSettingsSheet } from '@/components/Home/AccountSettingsSheet';
import { ChangeEmailSheet } from '@/components/Home/ChangeEmailSheet';
import { DistanceSheet } from '@/components/Home/DistanceSheet';
import { DistanceUnitSheet } from '@/components/Home/DistanceUnitSheet';
import { NotificationSheet } from '@/components/Home/NotificationSheet';
import { AboutSheet } from '@/components/Home/AboutSheet';
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
  const colorScheme = useColorScheme();
  const theme: ThemeName = colorScheme === 'dark' ? 'dark' : 'light';
  const uiTheme = Colors[theme];
  const [, setForceRender] = useState(false);
  const router = useRouter();
  const [distanceRadius, setDistanceRadius] = useState(20);
  const [sliderValue, setSliderValue] = useState(20);
  const [isDistanceModalVisible, setIsDistanceModalVisible] = useState(false);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('km');
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const fabAnim = React.useRef(new Animated.Value(0)).current; // 0 collapsed, 1 expanded
  // Animated settings sheet
  const [profileSheetMounted, setProfileSheetMounted] = useState(false);
  const settingsAnim = React.useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown
  const [nextModal, setNextModal] = useState<
    null | 'account' | 'email' | 'distance' | 'unit' | 'notifications' | 'about'
  >(null);
  const [shouldReopenProfile, setShouldReopenProfile] = useState(false);
  const [shouldReopenAccount, setShouldReopenAccount] = useState(false);
  // Animated sheets
  const [accountMounted, setAccountMounted] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [emailMounted, setEmailMounted] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [distanceMounted, setDistanceMounted] = useState(false);
  const [unitMounted, setUnitMounted] = useState(false);
  const [isUnitModalVisible, setIsUnitModalVisible] = useState(false);
  const [notificationsMounted, setNotificationsMounted] = useState(false);
  const [isNotificationsModalVisible, setIsNotificationsModalVisible] =
    useState(false);
  const [aboutMounted, setAboutMounted] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const accountAnim = React.useRef(new Animated.Value(0)).current;
  const emailAnim = React.useRef(new Animated.Value(0)).current;
  const distanceAnim = React.useRef(new Animated.Value(0)).current;
  const unitAnim = React.useRef(new Animated.Value(0)).current;
  const notificationsAnim = React.useRef(new Animated.Value(0)).current;
  const aboutAnim = React.useRef(new Animated.Value(0)).current;

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

  const handleSelectCreateAction = (
    action: 'hazard' | 'event' | 'lost' | 'found'
  ) => {
    if (!session) {
      Alert.alert('Not signed in', 'Please sign in to submit a report.');
      return;
    }
    setIsCreateVisible(false);
    openForm(action);
  };

  const openAccountModal = React.useCallback(() => {
    setIsAccountModalVisible(true);
  }, []);

  const openEmailModal = React.useCallback(() => {
    setNewEmail('');
    setIsEmailModalVisible(true);
  }, []);

  const openDistanceModal = React.useCallback(async () => {
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
  }, [session]);

  const openUnitModal = React.useCallback(async () => {
    if (session) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        const userMetadata = data.user.user_metadata;
        setDistanceUnit(userMetadata?.distance_unit || 'km');
      }
    }
    setIsUnitModalVisible(true);
  }, [session]);

  const openNotificationsModal = React.useCallback(() => {
    setIsNotificationsModalVisible(true);
  }, []);

  const openAboutModal = React.useCallback(() => {
    setIsAboutModalVisible(true);
  }, []);

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
          if (nextModal === 'account') {
            openAccountModal();
          } else if (nextModal === 'email') {
            openEmailModal();
          } else if (nextModal === 'distance') {
            openDistanceModal();
          } else if (nextModal === 'unit') {
            openUnitModal();
          } else if (nextModal === 'notifications') {
            openNotificationsModal();
          } else if (nextModal === 'about') {
            openAboutModal();
          }
          setNextModal(null);
        }
      });
    }
  }, [
    isProfileModalVisible,
    profileSheetMounted,
    nextModal,
    openEmailModal,
    openDistanceModal,
    openUnitModal,
    openAccountModal,
    openNotificationsModal,
    openAboutModal,
    settingsAnim,
  ]);

  // Animate account settings modal
  useEffect(() => {
    if (isAccountModalVisible) {
      setAccountMounted(true);
      accountAnim.stopAnimation();
      accountAnim.setValue(0);
      Animated.timing(accountAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (accountMounted) {
      Animated.timing(accountAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setAccountMounted(false);
          if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isAccountModalVisible, accountMounted, accountAnim, shouldReopenProfile]);

  // Animate email modal
  useEffect(() => {
    if (isEmailModalVisible) {
      setEmailMounted(true);
      emailAnim.stopAnimation();
      emailAnim.setValue(0);
      Animated.timing(emailAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (emailMounted) {
      Animated.timing(emailAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setEmailMounted(false);
          setNewEmail('');
          if (shouldReopenAccount) {
            setShouldReopenAccount(false);
            setIsAccountModalVisible(true);
          } else if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isEmailModalVisible, emailMounted, emailAnim, shouldReopenAccount, shouldReopenProfile]);

  // Animate distance modal
  useEffect(() => {
    if (isDistanceModalVisible) {
      setDistanceMounted(true);
      distanceAnim.stopAnimation();
      distanceAnim.setValue(0);
      Animated.timing(distanceAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (distanceMounted) {
      Animated.timing(distanceAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setDistanceMounted(false);
          if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isDistanceModalVisible, distanceMounted, distanceAnim, shouldReopenProfile]);

  // Animate unit modal
  useEffect(() => {
    if (isUnitModalVisible) {
      setUnitMounted(true);
      unitAnim.stopAnimation();
      unitAnim.setValue(0);
      Animated.timing(unitAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (unitMounted) {
      Animated.timing(unitAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setUnitMounted(false);
          if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isUnitModalVisible, unitMounted, unitAnim, shouldReopenProfile]);

  // Animate notifications modal
  useEffect(() => {
    if (isNotificationsModalVisible) {
      setNotificationsMounted(true);
      notificationsAnim.stopAnimation();
      notificationsAnim.setValue(0);
      Animated.timing(notificationsAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (notificationsMounted) {
      Animated.timing(notificationsAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setNotificationsMounted(false);
          if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isNotificationsModalVisible, notificationsMounted, notificationsAnim, shouldReopenProfile]);

  // Animate about modal
  useEffect(() => {
    if (isAboutModalVisible) {
      setAboutMounted(true);
      aboutAnim.stopAnimation();
      aboutAnim.setValue(0);
      Animated.timing(aboutAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (aboutMounted) {
      Animated.timing(aboutAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setAboutMounted(false);
          if (shouldReopenProfile) {
            setShouldReopenProfile(false);
            setIsProfileModalVisible(true);
          }
        }
      });
    }
  }, [isAboutModalVisible, aboutMounted, aboutAnim, shouldReopenProfile]);

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
  }, [authReady, session, router]);

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

  // Toggle the visibility of the account settings modal
  const toggleAccountModal = () => {
    setIsAccountModalVisible(!isAccountModalVisible);
  };

  // Toggle the visibility of the email modal
  const toggleEmailModal = () => {
    setIsEmailModalVisible(!isEmailModalVisible);
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

  // Toggle the visibility of the notifications modal
  const toggleNotificationsModal = () => {
    setIsNotificationsModalVisible(!isNotificationsModalVisible);
  };

  // Toggle the visibility of the about modal
  const toggleAboutModal = () => {
    setIsAboutModalVisible(!isAboutModalVisible);
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
        },
      });

      if (error) {
        Alert.alert('Error', 'Failed to update distance unit');
        console.error('Failed to update distance unit:', error);
      } else {
        Alert.alert('Success', 'Distance unit updated successfully');
        console.log('Updated distance unit to:', distanceUnit);

        // Fetch updated user data after saving
        const { data: updatedUser, error: fetchError } =
          await supabase.auth.getUser();
        if (fetchError) {
          console.error('Error fetching updated user:', fetchError);
        } else {
          console.log(
            'Updated user metadata:',
            updatedUser?.user?.user_metadata
          );
        }
      }
    }
  };

  // Handle user sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileModalVisible(false);
    router.replace('/welcome'); // Replace stack so user cannot go back to Home
  };

  // Handle password change request
  const handleChangePassword = async () => {
    if (!session?.user?.email) {
      Alert.alert('Error', 'No email found for this account');
      return;
    }

    Alert.alert(
      'Reset Password',
      'Are you sure you want to reset your password? We will send a password reset link to your email.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Send Link',
          onPress: async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(
              session.user.email,
              {
                redirectTo: 'myapp://reset-password',
              }
            );

            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert(
                'Check Your Email',
                "We've sent you a password reset link. Please check your email inbox.",
                [{ text: 'OK', onPress: () => setIsAccountModalVisible(false) }]
              );
            }
          },
        },
      ]
    );
  };

  // Handle email change request
  const handleChangeEmail = async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (newEmail === session?.user?.email) {
      Alert.alert('Error', 'This is already your current email address');
      return;
    }

    const { error } = await supabase.auth.updateUser(
      { email: newEmail },
      { emailRedirectTo: 'myapp://home' }
    );

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Check Your Email',
        `We've sent a confirmation link to ${newEmail}. Please check your inbox to complete the email change.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsEmailModalVisible(false);
              setIsAccountModalVisible(false);
              setNewEmail('');
            },
          },
        ]
      );
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
        },
      });

      if (error) {
        Alert.alert('Error', 'Failed to update distance radius');
        console.error('Failed to update distance radius:', error);
      } else {
        Alert.alert('Success', 'Distance radius updated successfully');
        console.log('Updated distance radius to:', sliderValue);

        // Fetch updated user data after saving
        const { data: updatedUser, error: fetchError } =
          await supabase.auth.getUser();
        if (fetchError) {
          console.error('Error fetching updated user:', fetchError);
        } else {
          console.log(
            'Updated user metadata:',
            updatedUser?.user?.user_metadata
          );
          setDistanceRadius(
            updatedUser?.user?.user_metadata?.distance_radius || 20
          );
        }
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top bar with scrollable FilterBar on the left and fixed Profile Icon on the right */}
      <View
        style={[
          styles.topBar,
          { top: insets?.top || 0 },
          theme === 'dark' ? styles.topBarDark : styles.topBarLight,
        ]}
      >
        <View style={styles.filterWrapper}>
          <FilterBar
            selectedFilter={selectedFilter}
            onFilterPress={handleFilterPress}
            theme={theme}
            uiTheme={uiTheme}
            filterScrollRef={filterScrollRef}
            onScrollOffsetChange={offset => {
              scrollOffsetRef.current = offset;
            }}
          />
        </View>
        <View
          style={[
            styles.topBarDivider,
            theme === 'dark'
              ? styles.topBarDividerDark
              : styles.topBarDividerLight,
          ]}
        />
        <TouchableOpacity
          style={styles.profileIcon}
          onPress={toggleProfileModal}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel='Open profile and settings'
        >
          <View
            style={[
              styles.profileIconCircle,
              theme === 'dark'
                ? styles.profileIconCircleDark
                : styles.profileIconCircleLight,
            ]}
          >
            <MaterialIcons
              name='account-circle'
              size={24}
              color={uiTheme.textPrimary}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Map display showing the community data */}
      <MapScreen
        distanceRadius={distanceRadius}
        selectedReportId={
          selectedReportId ? Number(selectedReportId) : undefined
        }
        filter={appliedFilter}
        onReportCardChange={setIsReportCardOpen}
      />

      <ProfileSheet
        visible={profileSheetMounted}
        animation={settingsAnim}
        onRequestClose={toggleProfileModal}
        onPressAccountSettings={() => {
          setNextModal('account');
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
        onPressNotifications={() => {
          setNextModal('notifications');
          setIsProfileModalVisible(false);
        }}
        onPressAbout={() => {
          setNextModal('about');
          setIsProfileModalVisible(false);
        }}
        onPressSignOut={handleSignOut}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
      />

      <AccountSettingsSheet
        visible={accountMounted}
        animation={accountAnim}
        onRequestClose={toggleAccountModal}
        onPressBack={() => {
          setShouldReopenProfile(true);
          setIsAccountModalVisible(false);
        }}
        onPressChangeEmail={() => {
          setIsAccountModalVisible(false);
          // Small delay to allow account modal to close before opening email modal
          setTimeout(() => setIsEmailModalVisible(true), 250);
        }}
        onPressChangePassword={handleChangePassword}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
      />

      <ChangeEmailSheet
        visible={emailMounted}
        animation={emailAnim}
        onRequestClose={toggleEmailModal}
        onPressBack={() => {
          setShouldReopenAccount(true);
          setIsEmailModalVisible(false);
        }}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
        currentEmail={session?.user?.email || ''}
        newEmail={newEmail}
        onChangeNewEmail={setNewEmail}
        onSubmit={handleChangeEmail}
      />

      <DistanceSheet
        visible={distanceMounted}
        animation={distanceAnim}
        onRequestClose={toggleDistanceModal}
        onPressBack={() => {
          setShouldReopenProfile(true);
          setIsDistanceModalVisible(false);
        }}
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
        onPressBack={() => {
          setShouldReopenProfile(true);
          setIsUnitModalVisible(false);
        }}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
        distanceUnit={distanceUnit}
        onSelectUnit={setDistanceUnit}
        onSubmit={handleSaveUnit}
      />

      <NotificationSheet
        visible={notificationsMounted}
        animation={notificationsAnim}
        onRequestClose={toggleNotificationsModal}
        onPressBack={() => {
          setShouldReopenProfile(true);
          setIsNotificationsModalVisible(false);
        }}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
      />

      <AboutSheet
        visible={aboutMounted}
        animation={aboutAnim}
        onRequestClose={toggleAboutModal}
        onPressBack={() => {
          setShouldReopenProfile(true);
          setIsAboutModalVisible(false);
        }}
        insetsBottom={insets.bottom}
        uiTheme={uiTheme}
      />

      {!isReportCardOpen && (
        <SpeedDial
          isExpanded={isFabExpanded}
          animation={fabAnim}
          onToggle={toggleFab}
          onPressCreate={handleOpenCreateSheet}
          onPressForums={handleOpenForums}
          uiTheme={uiTheme}
          theme={theme}
        />
      )}

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
