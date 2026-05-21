import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../stores/authStore';

SplashScreen.preventAutoHideAsync();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();
    }
  }, [initialized]);

  if (!initialized) {
    return null;
  }

  return <>{children}</>;
}