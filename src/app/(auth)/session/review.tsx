import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewScreen from '@/features/daily-session/components/ReviewScreen';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/contexts/ThemeContext';

export default function ReviewRoute() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <AppHeader title="Review" showBackButton />
      <ReviewScreen />
    </SafeAreaView>
  );
}