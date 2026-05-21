import { SafeAreaView } from 'react-native-safe-area-context';
import JamAlongScreen from '@/components/JamAlongScreen';
import AppHeader from '@/components/AppHeader';

export default function JamAlongRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF5' }} edges={['bottom']}>
      <AppHeader title="Jam Along" showBackButton />
      <JamAlongScreen />
    </SafeAreaView>
  );
}