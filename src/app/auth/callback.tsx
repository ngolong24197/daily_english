import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { colors } from '@/constants/theme';

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // The session is picked up by onAuthStateChange in authStore.
    // We just need to redirect to home.
    router.replace('/');
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.bg }}>
      <ActivityIndicator size="large" color={colors.light.primary} />
    </View>
  );
}