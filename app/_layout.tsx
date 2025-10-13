// app/_layout.tsx
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
      </Stack>

      {/* Translucent status bar so content can start at the safe area */}
      <StatusBar style='light' translucent backgroundColor='transparent' />
    </ThemeProvider>
  );
}
