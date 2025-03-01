import { StyleSheet, Image, Platform, Button } from 'react-native';
import { useState } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LostAndFoundForm } from '@/components/LostAndFound';

export default function TabTwoScreen() {
  const [isFormVisible, setIsFormVisible] = useState(false);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      
      {/* Lost & Found Test Button */}
      <ThemedView style={styles.testContainer}>
        <ThemedText type="subtitle">Test Lost & Found Form</ThemedText>
        <Button 
          title="Open Lost & Found Form" 
          onPress={() => setIsFormVisible(true)} 
        />
      </ThemedView>
      
      {/* Lost & Found Form Modal */}
      <LostAndFoundForm 
        isVisible={isFormVisible}
        onClose={() => setIsFormVisible(false)}
      />

      <ThemedText>This app includes example code to help you get started.</ThemedText>
      
      {/* Rest of existing content */}
      <Collapsible title="File-based routing">
        {/* ...existing content... */}
      </Collapsible>
      {/* ...other existing Collapsible components... */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  testContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
});