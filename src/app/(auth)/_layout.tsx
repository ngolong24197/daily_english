import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { DrawerProvider } from '@/contexts/DrawerContext';
import DrawerOverlay from '@/components/DrawerOverlay';

export default function AuthGroupLayout() {
  const { colors } = useTheme();
  const { session, guestMode, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <View style={[s.loader, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session && !guestMode) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <DrawerProvider>
      <DrawerOverlay />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </DrawerProvider>
  );
}

const s = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});