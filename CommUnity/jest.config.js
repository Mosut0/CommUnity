module.exports = {
    preset: 'react-native',
    testEnvironment: 'node',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@expo|expo)/)', 
    ],
    setupFilesAfterEnv: ['./jest.setup.js'],
    silent: true,
};