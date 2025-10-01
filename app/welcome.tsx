import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/* ---------- Theme tokens (matching forums.tsx) ---------- */
type UiTheme = {
  chipBg: string;
  cardBg: string;
  pageBg: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  overlay: string;
  primaryBtnBg: string;
  primaryBtnText: string;
};

const darkTheme: UiTheme = {
  chipBg: '#1F2937',
  cardBg: '#0F172A',
  pageBg: '#0B1220',
  textPrimary: '#E5E7EB',
  textSecondary: '#9CA3AF',
  divider: '#1F2A37',
  overlay: 'rgba(0,0,0,0.6)',
  primaryBtnBg: '#2563EB',
  primaryBtnText: '#FFFFFF',
};

const lightTheme: UiTheme = {
  chipBg: '#F1F5F9', // slate-100
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC', // slate-50
  textPrimary: '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  divider: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.25)',
  primaryBtnBg: '#2563EB',
  primaryBtnText: '#FFFFFF',
};

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="people-circle" size={80} color={theme.primaryBtnBg} />
          </View>
          <Text style={styles.title}>Welcome to CommUnity</Text>
          <Text style={styles.subtitle}>
            Connect with your community, report events, find lost items, and stay safe together.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="calendar" size={24} color="#7C3AED" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Community Events</Text>
              <Text style={styles.featureDesc}>Discover and share local events</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Safety Alerts</Text>
              <Text style={styles.featureDesc}>Report and view hazards nearby</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconWrap}>
              <Ionicons name="search" size={24} color="#22C55E" />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Lost & Found</Text>
              <Text style={styles.featureDesc}>Help reunite lost items with owners</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color={theme.primaryBtnText} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>I Already Have an Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: UiTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.pageBg,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 40,
      paddingBottom: 40,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 40,
    },
    iconContainer: {
      marginBottom: 20,
    },
    title: {
      color: t.textPrimary,
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      color: t.textSecondary,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    featuresSection: {
      flex: 1,
      gap: 16,
      marginBottom: 32,
    },
    featureCard: {
      backgroundColor: t.cardBg,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: t.divider,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    featureIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: t.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureTitle: {
      color: t.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },
    featureDesc: {
      color: t.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    featureTextWrap: {
      flex: 1,
    },
    actionSection: {
      gap: 12,
    },
    primaryBtn: {
      backgroundColor: t.primaryBtnBg,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    primaryBtnText: {
      color: t.primaryBtnText,
      fontSize: 17,
      fontWeight: '700',
    },
    secondaryBtn: {
      backgroundColor: t.chipBg,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.divider,
      alignItems: 'center',
    },
    secondaryBtnText: {
      color: t.textPrimary,
      fontSize: 17,
      fontWeight: '600',
    },
  });
