// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as Linking from 'expo-linking';

import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep linking for password reset
  useEffect(() => {
    // Handle the initial URL if the app was opened from a deep link
    const handleInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle deep links when the app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialUrl();

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle Supabase auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked the reset password link
          router.push('/reset-password' as any);
        } else if (event === 'SIGNED_IN' && session) {
          // User successfully signed in or verified email
          // Check if they just came from email verification
          const user = session.user;
          if (user?.email_confirmed_at) {
            // Email is verified, redirect to home
            router.replace('/home');
          }
        } else if (event === 'USER_UPDATED' && session) {
          // User data was updated (e.g., email change confirmed)
          // The email change is complete, user stays where they are
          console.log('User updated:', session.user.email);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleDeepLink = async (url: string) => {
    // Extract the access_token and refresh_token from the URL
    // Supabase sends them in the URL fragment or query params
    const urlObj = new URL(url);
    const hash = urlObj.hash || urlObj.search;

    // Check if this contains authentication tokens
    if (hash.includes('access_token')) {
      // Extract tokens from the URL
      const params = new URLSearchParams(
        hash.replace('#', '').replace('?', '')
      );
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (access_token) {
        // Set the session with the tokens from the URL
        await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || '',
        });
        // The appropriate event (PASSWORD_RECOVERY or SIGNED_IN) will be triggered
        // based on the type parameter in the URL
      }
    }
  };

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen name='+not-found' />
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='home' options={{ headerShown: false }} />
        {/* Hide header ONLY on forums */}
        <Stack.Screen name='forums' options={{ headerShown: false }} />
        <Stack.Screen name='report-details' options={{ headerShown: false }} />
        {/* Auth screens have no header and no back button */}
        <Stack.Screen name='welcome' options={{ headerShown: false }} />
        <Stack.Screen name='sign-in' options={{ headerShown: false }} />
        <Stack.Screen name='sign-up' options={{ headerShown: false }} />
        <Stack.Screen name='reset-password' options={{ headerShown: false }} />
        <Stack.Screen name='terms-of-service' options={{ headerShown: false }} />
        <Stack.Screen name='privacy-policy' options={{ headerShown: false }} />
      </Stack>

      {/* Translucent status bar so content can start at the safe area */}
      <StatusBar style='light' translucent backgroundColor='transparent' />
    </ThemeProvider>
  );
}
