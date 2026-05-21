import React from 'react';
import { render } from '@testing-library/react-native';

// Mock the services used by the layout
jest.mock('../stores/sessionStore', () => ({
  useSessionStore: () => ({
    resetSession: jest.fn(),
    setCurrentStep: jest.fn(),
    currentMode: 'survival',
  }),
  __esModule: true,
}));

jest.mock('../services/subscriptionService', () => ({
  subscriptionService: {
    isPremium: () => false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  },
}));

jest.mock('../services/streakService', () => ({
  streakService: {
    getStreak: () => 0,
    recordSession: () => 0,
    getStreakMessage: () => '',
    getWelcomeMessage: () => 'Hello!',
  },
}));

jest.mock('../services/warmReEntry', () => ({
  shouldShowWarmReEntry: () => false,
  getWarmReEntryMessage: () => null,
  recordSessionDate: jest.fn(),
}));

jest.mock('../constants/appConfig', () => ({
  APP_CONFIG: {
    version: '1.0.0',
    features: { enableWarmReEntry: false },
  },
}));

jest.mock('../utils/accessibility', () => ({
  NavigationLabels: {},
}));

jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../constants/theme', () => ({
  colors: {
    light: {
      bg: '#ffffff',
      textPrimary: '#000000',
      secondary: '#666666',
      primary: '#5B8C5A',
      surface: '#f5f5f5',
      border: '#e0e0e0',
      textSecondary: '#888888',
      textMuted: '#aaaaaa',
    },
  },
  typography: {
    heading: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64,
  },
  radii: {
    sm: 8, md: 12, lg: 16, xl: 24, full: 999,
  },
}));

describe('Root Layout', () => {
  it('renders without crashing', () => {
    // Import dynamically to avoid hoisting issues with mocks
    const { default: RootLayout } = require('./_layout');
    const { toJSON } = render(React.createElement(RootLayout));
    expect(toJSON()).toBeTruthy();
  });
});