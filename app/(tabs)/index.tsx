import 'react-native-url-polyfill/auto';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { View, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthReady(true);
      if (!session) {
        router.replace('/sign-in');
      } else {
        router.push('/home');
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Redirect to Home if user is logged in
      if (session && session.user) {
        router.push('/home'); // Redirect to '/home'
      } else if (!session) {
        router.replace('/sign-in');
      }
    });
  }, [router]);

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (session && session.user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <View style={{ flex: 1 }} />;
}
