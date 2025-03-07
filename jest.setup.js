// Mock expo-modules-core to provide a dummy EventEmitter
jest.mock('expo-modules-core', () => ({
    EventEmitter: class {
        addListener() { return { remove: jest.fn() } }
        removeListener() { }
        removeAllListeners() { }
    },
}));

// Mock expo-file-system with the functions you use (e.g. readAsStringAsync)
jest.mock('expo-file-system', () => ({
    readAsStringAsync: jest.fn(() => Promise.resolve("base64data")),
}));

// Existing AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
    })
);