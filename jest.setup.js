// Mock expo-modules-core to provide a dummy EventEmitter
jest.mock('expo-modules-core', () => ({
  EventEmitter: class {
    addListener() {
      return { remove: jest.fn() };
    }
    removeListener() {}
    removeAllListeners() {}
  },
}));

// Mock expo-file-system with the functions you use (e.g. readAsStringAsync)
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('base64data')),
}));

// Existing AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const { Blob: NodeBlob } = require('buffer');

const BlobCtor = global.Blob || NodeBlob;
global.Blob = BlobCtor;

// Provide a fetch mock that supports both .json() and .arrayBuffer()
global.fetch = jest.fn((...args) =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    // Provide both arrayBuffer and blob for tests that read files
    arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3, 4]).buffer),
    blob: () =>
      Promise.resolve(new BlobCtor([Uint8Array.from([1, 2, 3, 4]).buffer])),
  })
);

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  MapView: 'MapView',
  Marker: 'Marker',
  PROVIDER_GOOGLE: 'PROVIDER_GOOGLE',
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 45.4215, longitude: -75.6972 },
    })
  ),
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    })
  ),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => ({
  Provider: ({ children }) => children,
  Button: 'Button',
  TextInput: 'TextInput',
  Card: 'Card',
  Surface: 'Surface',
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      text: '#000000',
    },
  }),
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  TouchableOpacity: 'TouchableOpacity',
  PanGestureHandler: 'PanGestureHandler',
  State: { BEGAN: 0, ACTIVE: 1, END: 2 },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    View: 'View',
    Extrapolate: { CLAMP: 'clamp' },
  },
  Easing: {
    inOut: jest.fn(),
  },
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));
