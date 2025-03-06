module.exports = {
    preset: 'jest-expo', // Use jest-expo preset for Expo projects
    testEnvironment: 'node', // Use 'node' for backend/service tests
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@supabase/supabase-js$': '<rootDir>/__mocks__/@supabase/supabase-js.ts',
    },
};