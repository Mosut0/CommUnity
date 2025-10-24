import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { resolveTheme, UiTheme } from '@/lib/uiTheme';
import type { ThemeName } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const scheme = useColorScheme();
  const theme = resolveTheme(scheme);
  const themeName: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  const styles = useMemo(
    () => makeStyles(theme, themeName),
    [theme, themeName]
  );
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert('Sign in failed', error.message);
      } else {
        router.replace('/home');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        'Email Required',
        'Please enter your email address to reset your password.'
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myapp://reset-password',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Check Your Email',
          "We've sent you a password reset link. Please check your email inbox."
        );
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      testID='sign-in-screen'
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          testID='sign-in-back'
          style={styles.backButton}
          onPress={() => router.push('/welcome')}
        >
          <Ionicons name='arrow-back' size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.contentWrapper}>
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to CommUnity
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize='none'
                keyboardType='email-address'
                value={email}
                onChangeText={setEmail}
                placeholder='you@example.com'
                placeholderTextColor={theme.textSecondary + '99'}
                style={styles.input}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='••••••••'
                  placeholderTextColor={theme.textSecondary + '99'}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(s => !s)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                style={styles.forgotPasswordBtn}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryBtnText} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/sign-up')}>
                <Text style={styles.linkText}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t: UiTheme, themeName: ThemeName) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: t.pageBg },
    container: { flex: 1, padding: 20 },
    backButton: { marginBottom: 10, padding: 8, alignSelf: 'flex-start' },
    contentWrapper: { flex: 1, justifyContent: 'center' },
    headerWrap: { marginBottom: 24 },
    title: {
      color: t.textPrimary,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 6,
    },
    subtitle: { color: t.textSecondary, fontSize: 14 },
    formCard: {
      backgroundColor: t.cardBg,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: t.divider,
      marginBottom: 20,
    },
    fieldGroup: { marginBottom: 16 },
    label: {
      color: t.textSecondary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    forgotPasswordBtn: {
      alignSelf: 'flex-start' as const,
      marginTop: 8,
      padding: 4,
    },
    forgotText: {
      color: t.primaryBtnBg,
      fontSize: 12,
      fontWeight: '600',
    },
    input: {
      backgroundColor: t.chipBg,
      color: t.textPrimary,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      fontSize: 15,
      borderWidth: 1,
      borderColor: themeName === 'dark' ? t.profileBorder : t.divider,
      marginBottom: 4,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { padding: 10 },
    primaryBtn: {
      backgroundColor: t.primaryBtnBg,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 4,
    },
    primaryBtnText: {
      color: t.primaryBtnText,
      fontWeight: '700',
      fontSize: 16,
    },
    divider: { height: 1, backgroundColor: t.divider, marginVertical: 20 },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    switchText: { color: t.textSecondary, fontSize: 13 },
    linkText: { color: t.primaryBtnBg, fontWeight: '600' },
  });
