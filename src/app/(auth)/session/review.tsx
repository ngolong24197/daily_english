import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewScreen from '@/features/daily-session/components/ReviewScreen';
import AppHeader from '@/components/AppHeader';

export default function ReviewRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF5' }} edges={['bottom']}>
      <AppHeader title="Review" showBackButton />
      <ReviewScreen />
    </SafeAreaView>
  );
}