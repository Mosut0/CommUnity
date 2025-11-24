import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { resolveTheme, UiTheme } from '@/lib/uiTheme';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const scheme = useColorScheme();
  const theme = resolveTheme(scheme);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();

  return (
    <SafeAreaView
      testID='welcome-screen'
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/community_logo.png')}
              style={styles.logo}
              resizeMode='contain'
            />
          </View>
          <Text style={styles.appTitle}>CommUnity</Text>
          <Text style={styles.tagline}>Connect. Share. Stay Informed.</Text>
          <Text style={styles.description}>
            Join your local community to report events, share important updates,
            and help keep everyone safe and connected.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.8}
            testID='welcome-get-started'
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons
              name='arrow-forward'
              size={20}
              color={theme.primaryBtnText}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.8}
            testID='welcome-sign-in'
          >
            <Text style={styles.secondaryBtnText}>
              I Already Have an Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: theme.chipBg }]}
            >
              <Ionicons name='map' size={24} color={theme.primaryBtnBg} />
            </View>
            <Text style={styles.featureText}>Interactive Maps</Text>
          </View>
          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: theme.chipBg }]}
            >
              <Ionicons
                name='notifications'
                size={24}
                color={theme.primaryBtnBg}
              />
            </View>
            <Text style={styles.featureText}>Real-time Updates</Text>
          </View>
          <View style={styles.featureItem}>
            <View
              style={[styles.featureIcon, { backgroundColor: theme.chipBg }]}
            >
              <Ionicons
                name='shield-checkmark'
                size={24}
                color={theme.primaryBtnBg}
              />
            </View>
            <Text style={styles.featureText}>Safety Reports</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: UiTheme) => {
  const { height } = Dimensions.get('window');
  const isSmallScreen = height < 700;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.pageBg,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'space-between',
      paddingVertical: isSmallScreen ? 20 : 40,
    },
    heroSection: {
      alignItems: 'center',
      marginTop: isSmallScreen ? 10 : 20,
    },
    logoContainer: {
      marginBottom: isSmallScreen ? 15 : 25,
      width: isSmallScreen ? 120 : 140,
      height: isSmallScreen ? 120 : 140,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: isSmallScreen ? 60 : 70,
      overflow: 'hidden',
    },
    logo: {
      width: '100%',
      height: '100%',
    },
    appTitle: {
      color: t.textPrimary,
      fontSize: isSmallScreen ? 36 : 42,
      fontWeight: '900',
      marginBottom: isSmallScreen ? 8 : 12,
      letterSpacing: -0.5,
    },
    tagline: {
      color: t.textSecondary,
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: '600',
      marginBottom: isSmallScreen ? 10 : 16,
    },
    description: {
      color: t.textSecondary,
      fontSize: isSmallScreen ? 14 : 15,
      textAlign: 'center',
      lineHeight: isSmallScreen ? 20 : 22,
      paddingHorizontal: 20,
      maxWidth: 500,
    },
    actionSection: {
      width: '100%',
      gap: isSmallScreen ? 12 : 16,
    },
    primaryBtn: {
      backgroundColor: t.primaryBtnBg,
      paddingVertical: isSmallScreen ? 14 : 16,
      borderRadius: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      shadowColor: t.primaryBtnBg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtnText: {
      color: t.primaryBtnText,
      fontWeight: '700',
      fontSize: isSmallScreen ? 16 : 17,
    },
    secondaryBtn: {
      backgroundColor: t.cardBg,
      paddingVertical: isSmallScreen ? 14 : 16,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: t.divider,
    },
    secondaryBtnText: {
      color: t.textPrimary,
      fontWeight: '600',
      fontSize: isSmallScreen ? 15 : 16,
    },
    featuresSection: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: isSmallScreen ? 15 : 30,
      paddingHorizontal: 10,
    },
    featureItem: {
      alignItems: 'center',
      flex: 1,
      maxWidth: 100,
    },
    featureIcon: {
      width: isSmallScreen ? 50 : 56,
      height: isSmallScreen ? 50 : 56,
      borderRadius: isSmallScreen ? 25 : 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: isSmallScreen ? 6 : 10,
    },
    featureText: {
      color: t.textSecondary,
      fontSize: isSmallScreen ? 11 : 12,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
};
