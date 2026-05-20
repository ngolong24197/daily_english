module.exports = {
  preset: 'jest-expo',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': '<rootDir>/jest.assets.mock.js',
    '^react-native-css-interop/(.*)$': '<rootDir>/jest.assets.mock.js',
    '^react-native-css-interop$': '<rootDir>/jest.assets.mock.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.jest.js' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?|@expo-google-fonts|react-navigation|@react-navigation/.*|@unimodules.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|@nativewind|react-native-css-interop|zustand)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};