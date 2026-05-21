import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '@/stores/sessionStore';
import SceneScreen from '@/features/daily-session/components/SceneScreen';
import AppHeader from '@/components/AppHeader';

export default function SceneRoute() {
  const { currentScene } = useSessionStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF5' }} edges={['bottom']}>
      <AppHeader title={currentScene?.title ?? 'Scene'} showBackButton />
      <SceneScreen />
    </SafeAreaView>
  );
}