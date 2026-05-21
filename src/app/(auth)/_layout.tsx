import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { DrawerProvider } from '@/contexts/DrawerContext';
import DrawerOverlay from '@/components/DrawerOverlay';

export default function AuthGroupLayout() {
  const { session, guestMode, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={colors.light.primary} />
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
    backgroundColor: colors.light.bg,
  },
});