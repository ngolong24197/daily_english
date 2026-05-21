import { SafeAreaView } from 'react-native-safe-area-context';
import ConversationScreen from '@/features/daily-session/components/ConversationScreen';
import AppHeader from '@/components/AppHeader';
import { useTheme } from '@/contexts/ThemeContext';

export default function ConversationRoute() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['bottom']}>
      <AppHeader title="Conversation" showBackButton />
      <ConversationScreen />
    </SafeAreaView>
  );
}