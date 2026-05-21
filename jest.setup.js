// Jest setup file — mock native modules that aren't available in test environment

jest.mock('react-native-mmkv', () => {
  const store: Record<string, string> = {};
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: (key: string) => store[key] ?? undefined,
      getNumber: (key: string) => (store[key] !== undefined ? Number(store[key]) : undefined),
      getBoolean: (key: string) => (store[key] !== undefined ? store[key] === 'true' : undefined),
      set: (key: string, value: string | number | boolean) => { store[key] = String(value); },
      delete: (key: string) => { delete store[key]; },
      getAllKeys: () => Object.keys(store),
      clearAll: () => { Object.keys(store).forEach((k) => delete store[k]); },
    })),
  };
});

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    GestureDetector: View,
    Gesture: {
      Tap: () => ({ onStart: () => {} }),
      Pan: () => ({ onStart: () => {} }),
      Pinch: () => ({ onStart: () => {} }),
    },
    State: {},
  };
});

jest.mock('react-native-screens', () => {
  const { View } = require('react-native');
  return {
    Screen: View,
    ScreenContainer: View,
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('expo-router', () => {
  const { View, Text } = require('react-native');
  const React = require('react');
  return {
    Link: ({ children }: any) => React.createElement(View, null, children),
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    usePathname: () => '/',
    useGlobalSearchParams: () => ({}),
    Redirect: View,
    Slot: ({ children }: any) => React.createElement(View, null, children),
    Stack: { Screen: View },
    Drawer: {
      Screen: View,
    },
  };
});

jest.mock('expo-router/drawer', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Drawer: ({ children, drawerContent, screenOptions, ...props }: any) =>
      React.createElement(View, props, drawerContent?.({ navigation: { navigate: jest.fn(), dispatch: jest.fn() } })),
  };
});

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} } },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

jest.mock('expo-av', () => ({
  Audio: {
    Recording: jest.fn(),
    Sound: jest.fn(),
    setAudioModeAsync: jest.fn(),
  },
}));

jest.mock('expo-speech-recognition', () => ({
  startSpeechRecognition: jest.fn(),
  stopSpeechRecognition: jest.fn(),
  useSpeechRecognitionEvent: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `exp://localhost:8081/${path}`),
  openURL: jest.fn(),
  addEventListener: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const { View } = require('react-native');
  return {
    NavigationContainer: ({ children }: any) => children,
    useNavigation: () => ({ navigate: jest.fn(), dispatch: jest.fn() }),
    useRoute: () => ({ name: 'Test', params: {} }),
  };
});

jest.mock('@react-navigation/drawer', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    Drawer: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const { View } = require('react-native');
  return {
    NativeStackScreenProps: {},
  };
});

jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    Svg: View,
    Circle: View,
    Rect: View,
    Path: View,
    G: View,
    Text: View,
  };
});

jest.mock('nativewind', () => ({
  styled: (Component: any) => Component,
}));

jest.mock('react-native-css-interop', () => ({
  __esModule: true,
  StyleSheet: { create: (styles: any) => styles },
  withCssInterop: (Component: any) => Component,
  wrapJSX: () => (fn: any) => fn,
  cssInterop: () => (Component: any) => Component,
  remapProps: () => {},
  StyleMock: { displayName: 'StyleMock' },
}));

jest.mock('react-native-url-polyfill', () => ({}));
jest.mock('react-native-url-polyfill/auto', () => {});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signOut: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ data: [], error: null })) })),
    })),
  })),
}));