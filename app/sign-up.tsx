import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { resolveTheme, darkTheme, UiTheme } from '@/lib/uiTheme';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const scheme = useColorScheme();
  const theme = resolveTheme(scheme);
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        Alert.alert('Sign up failed', error.message);
      } else {
        if (!session) {
          Alert.alert('Verify your email', 'We have sent a verification link to your inbox. Please verify then sign in.');
          router.replace('/sign-in');
        } else {
          router.replace('/home');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join CommUnity to share and stay informed</Text>
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
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.iconBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='••••••••'
            placeholderTextColor={theme.textSecondary + '99'}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp} disabled={loading} activeOpacity={0.8}>
          {loading ? <ActivityIndicator color={theme.primaryBtnText} /> : <Text style={styles.primaryBtnText}>Sign Up</Text>}
        </TouchableOpacity>

        <View style={styles.divider} />
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (t: UiTheme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.pageBg, padding: 20, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, padding: 8 },
  headerWrap: { marginBottom: 24 },
  title: { color: t.textPrimary, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: t.textSecondary, fontSize: 14 },
  formCard: { backgroundColor: t.cardBg, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: t.divider },
  fieldGroup: { marginBottom: 16 },
  label: { color: t.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { backgroundColor: t.chipBg, color: t.textPrimary, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: t === darkTheme ? '#374151' : t.divider, marginBottom: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 10 },
  primaryBtn: { backgroundColor: t.primaryBtnBg, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: t.primaryBtnText, fontWeight: '700', fontSize: 16 },
  divider: { height: 1, backgroundColor: t.divider, marginVertical: 20 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  switchText: { color: t.textSecondary, fontSize: 13 },
  linkText: { color: t.primaryBtnBg, fontWeight: '600' },
});
