import '../global.css';

import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../components/AuthProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}