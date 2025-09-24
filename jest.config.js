module.exports = {
	preset: 'react-native',
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
	},
	transformIgnorePatterns: [
		'node_modules/(?!(react-native|@react-native|@expo|expo|expo-file-system|expo-modules-core|react-native-url-polyfill)/)'
	],
	setupFilesAfterEnv: ['./jest.setup.js'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.js',
		'^@expo/vector-icons$': '<rootDir>/__mocks__/@expo/vector-icons.js',
		'^expo-font$': '<rootDir>/__mocks__/expo-font.js'
	},
	silent: true,
};