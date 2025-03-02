import 'react-native-url-polyfill/auto'
import { View, Text } from 'react-native'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { StyleSheet, Button } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LostAndFoundForm } from '@/components/LostAndFound';

export default function Home() {
    const [session, setSession] = useState<Session | null>(null)
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
  
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
    }, [])
  
    return (
      <View>
        {session && session.user && <Text>{session.user.id}</Text>}
        
        <ThemedView style={styles.testContainer}>
          <ThemedText type="subtitle">Test Lost & Found Form</ThemedText>
          <Button 
            title="Open Lost & Found Form" 
            onPress={() => setIsFormVisible(true)} 
            disabled={!session}
          />
          {!session && (
            <ThemedText style={{color: 'red'}}>
              Please log in to submit reports
            </ThemedText>
          )}
        </ThemedView>

        <LostAndFoundForm 
          isVisible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
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