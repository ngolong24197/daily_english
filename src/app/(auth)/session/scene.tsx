import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '@/stores/sessionStore';
import SceneScreen from '@/features/daily-session/components/SceneScreen';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/contexts/ThemeContext';

export default function SceneRoute() {
  const { currentScene } = useSessionStore();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <AppHeader title={currentScene?.title ?? 'Scene'} showBackButton />
      <SceneScreen />
    </SafeAreaView>
  );
}