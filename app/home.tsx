import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import MapScreen from '../components/MapScreen';
import { LostAndFoundForm } from '@/components/LostAndFound';
import { HazardForm } from '@/components/Hazards';
import { EventForm } from '@/components/Events';
import { ThemedText } from '@/components/ThemedText';

export default function Home() {
  // Authentication state management
  const [session, setSession] = useState<Session | null>(null);
  // UI state management
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  
    useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

    const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

    const openForm = (formType: string) => {
    setSelectedForm(formType);
    setIsPanelVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Map display showing the community data */}
      <MapScreen />

      {/* Floating Action Button to open the panel */}
      <TouchableOpacity
        style={[styles.fab, colorScheme === 'dark' ? styles.fabDark : styles.fabLight]}
        onPress={togglePanel}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>

      {/* Expandable Panel with form options */}
      {isPanelVisible && (
        <Modal transparent animationType="none" visible={isPanelVisible}>
          <Pressable style={styles.panelContainer} onPress={togglePanel}>
            <View style={[styles.panel, colorScheme === 'dark' ? styles.panelDark : styles.panelLight]}>
              {/* Lost & Found reporting option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('lostAndFound')} disabled={!session}>
                <ThemedText>Lost & Found</ThemedText>
              </TouchableOpacity>
              
              {/* Hazard reporting option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('hazard')} disabled={!session}>
                <ThemedText>Hazard</ThemedText>
              </TouchableOpacity>
              
              {/* Event creation option */}
              <TouchableOpacity style={styles.button} onPress={() => openForm('event')} disabled={!session}>
                <ThemedText>Event</ThemedText>
              </TouchableOpacity>
              
              {/* Warning message if user is not logged in */}
              {!session && <ThemedText style={{ color: 'red', textAlign: 'center' }}>Please log in to submit reports</ThemedText>}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Conditional rendering of different form modals based on selection */}
      {selectedForm === 'lostAndFound' && (
        <LostAndFoundForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
      {selectedForm === 'hazard' && (
        <HazardForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
      {selectedForm === 'event' && (
        <EventForm isVisible={true} onClose={() => setSelectedForm(null)} userId={session?.user?.id || ''} />
      )}
    </View>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  // Floating Action Button styles
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabLight: {
    backgroundColor: '#0A7EA4', // Primary color for light theme
  },
  fabDark: {
    backgroundColor: '#1E1E1E', // Darker background for dark theme
  },
  fabText: {
    fontSize: 24,
    color: '#fff',
  },
  
  // Panel styles
  panelContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelLight: {
    backgroundColor: '#fff',
  },
  panelDark: {
    backgroundColor: '#333',
  },
  
  // Action button styles
  button: {
    padding: 15,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
});