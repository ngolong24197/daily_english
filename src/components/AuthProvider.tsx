import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.bg }}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  return <>{children}</>;
}