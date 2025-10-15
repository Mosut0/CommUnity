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

export default function ResetPasswordScreen() {
  const scheme = useColorScheme();
  const theme = resolveTheme(scheme);
  const themeName: ThemeName = scheme === 'dark' ? 'dark' : 'light';
  const styles = useMemo(
    () => makeStyles(theme, themeName),
    [theme, themeName]
  );
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Missing info', 'Please enter your new password.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password too short', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/home'),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.headerWrap}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color={theme.primaryBtnBg} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Please enter your new password below
            </Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder='Enter new password'
                  placeholderTextColor={theme.textSecondary + '99'}
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
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
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder='Confirm new password'
                  placeholderTextColor={theme.textSecondary + '99'}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize='none'
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(s => !s)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={theme.primaryBtnText} />
              ) : (
                <Text style={styles.primaryBtnText}>Reset Password</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={styles.linkText}>Back to Sign In</Text>
            </TouchableOpacity>
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
    contentWrapper: { flex: 1, justifyContent: 'center' },
    headerWrap: { marginBottom: 24, alignItems: 'center' },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: t.primaryBtnBg + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: t.textPrimary,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 6,
    },
    subtitle: { 
      color: t.textSecondary, 
      fontSize: 14,
      textAlign: 'center',
    },
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
    linkText: { 
      color: t.primaryBtnBg, 
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 14,
    },
  });

