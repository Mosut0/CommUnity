module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|expo-file-system|expo-modules-core|react-native-url-polyfill)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'services/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    // Exclude untestable files with complex dependencies
    '!app/_layout.tsx', // Complex app layout with expo-router
    '!app/(tabs)/_layout.tsx', // Complex tab layout with expo-router
    '!app/(tabs)/explore.tsx', // Complex explore page with ParallaxScrollView
    '!app/forums.tsx', // Complex page with Supabase auth
    '!app/home.tsx', // Complex page with Supabase auth
    '!app/report-details.tsx', // Complex page with Supabase auth
    '!app/reset-password.tsx', // Complex page with Supabase auth
    '!components/MapScreen.tsx', // Uses react-native-maps, expo-location
    '!components/ParallaxScrollView.tsx', // Uses react-native-reanimated
    '!components/HelloWave.tsx', // Uses react-native-reanimated
    '!components/ExternalLink.tsx', // Uses expo-web-browser
    '!components/HapticTab.tsx', // Uses expo-haptics
    '!components/ImagePicker.tsx', // Uses expo-image-picker, expo-location
    '!components/ui/IconSymbol.tsx', // Uses expo-symbols
    '!components/ui/IconSymbol.ios.tsx', // Uses expo-symbols
    '!components/ui/TabBarBackground.tsx', // Uses @react-navigation/bottom-tabs
    '!components/ui/TabBarBackground.ios.tsx', // Uses @react-navigation/bottom-tabs
    '!components/Events/FillEventForm.tsx', // Complex form with expo-location, expo-image-picker
    '!components/Events/index.js', // Index file
    '!components/Hazards/FillHazardForm.tsx', // Complex form with expo-location, expo-image-picker
    '!components/Hazards/index.js', // Index file
    '!components/LostAndFound/LostItemForm.tsx', // Complex form with expo-location, expo-image-picker
    '!components/LostAndFound/FoundItemForm.tsx', // Complex form with expo-location, expo-image-picker
    '!components/LostAndFound/index.js', // Index file
    '!components/Home/ProfileSheet.tsx', // Uses expo-blur, expo-image-picker
    '!components/Home/SpeedDial.tsx', // Uses Animated.Value
    '!components/Home/DistanceSheet.tsx', // Uses Animated.Value
    '!components/Home/DistanceUnitSheet.tsx', // Uses Animated.Value
    '!components/Home/ChangeEmailSheet.tsx', // Uses Animated.Value
    '!components/Home/CreateSheet.tsx', // Uses Animated.Value
    '!components/Home/types.ts', // Type definitions
    '!lib/supabase.ts', // Uses Supabase client
    '!hooks/useColorScheme.ts', // Uses react-native
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  silent: true,
};
