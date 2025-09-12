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

// Provide a fetch mock that supports both .json() and .arrayBuffer()
global.fetch = jest.fn((...args) =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        // Provide both arrayBuffer and blob for tests that read files
        arrayBuffer: () => Promise.resolve(Uint8Array.from([1,2,3,4]).buffer),
        blob: () => Promise.resolve(new Blob([Uint8Array.from([1,2,3,4]).buffer])),
    })
);