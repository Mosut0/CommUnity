import 'react-native-url-polyfill/auto';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LostAndFoundForm } from '@/components/LostAndFound';
import MapScreen from '../components/MapScreen';
import { HazardForm } from '@/components/Hazards';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLostAndFoundFormVisible, setIsLostAndFoundFormVisible] = useState(false);
  const [isHazardFormVisible, setIsHazardFormVisible] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
        <MapScreen />
      {/* {session && session.user && <Text>{session.user.id}</Text>} */}

      {/* Lost & Found Form Section */}
      <ThemedView style={styles.testContainer}>
        <ThemedText type="subtitle">Test Lost & Found Form</ThemedText>
        <Button
          title="Open Lost & Found Form"
          onPress={() => setIsLostAndFoundFormVisible(true)}
          disabled={!session}
        />
        {!session && (
          <ThemedText style={{ color: 'red' }}>
            Please log in to submit reports
          </ThemedText>
        )}
      </ThemedView>

      {/* Hazard Form Section */}
      <ThemedView style={styles.testContainer}>
        <ThemedText type="subtitle">Test Hazard Form</ThemedText>
        <Button
          title="Open Hazard Form"
          onPress={() => setIsHazardFormVisible(true)}
          disabled={!session}
        />
        {!session && (
          <ThemedText style={{ color: 'red' }}>
            Please log in to submit reports
          </ThemedText>
        )}
      </ThemedView>

      {/* Lost & Found Form Modal */}
      <LostAndFoundForm
        isVisible={isLostAndFoundFormVisible}
        onClose={() => setIsLostAndFoundFormVisible(false)}
        userId={session?.user?.id || ''}
      />

      {/* Hazard Form Modal */}
      <HazardForm
        isVisible={isHazardFormVisible}
        onClose={() => setIsHazardFormVisible(false)}
        userId={session?.user?.id || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  testContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
});