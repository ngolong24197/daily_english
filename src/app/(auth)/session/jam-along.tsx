import { SafeAreaView } from 'react-native-safe-area-context';
import JamAlongScreen from '@/components/JamAlongScreen';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/contexts/ThemeContext';

export default function JamAlongRoute() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <AppHeader title="Jam Along" showBackButton />
      <JamAlongScreen />
    </SafeAreaView>
  );
}