import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationScreen from '@/features/daily-session/components/ConversationScreen';
import AppHeader from '@/components/AppHeader';

export default function ConversationRoute() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBF5' }} edges={['bottom']}>
      <AppHeader title="Conversation" showBackButton />
      <ConversationScreen />
    </SafeAreaView>
  );
}