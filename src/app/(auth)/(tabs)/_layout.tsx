import { Tabs } from 'expo-router/tabs';
import { TouchableOpacity, Text } from 'react-native';
import { typography, spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawer } from '@/contexts/DrawerContext';

function DrawerButton() {
  const { colors } = useTheme();
  const { open } = useDrawer();
  return (
    <TouchableOpacity onPress={open} style={{ marginLeft: spacing.md }} accessibilityRole="button" accessibilityLabel="Open menu">
      <Text style={{ fontSize: 22, color: colors.textPrimary }}>{'☰'}</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.bg,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontSize: typography.heading.fontSize,
          fontWeight: typography.heading.fontWeight as any,
        },
        headerLeft: () => <DrawerButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: spacing.xs,
          paddingTop: spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily English',
          tabBarAccessibilityLabel: "Today's session",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Conversation History',
          tabBarAccessibilityLabel: 'Conversation history',
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'My Words',
          tabBarAccessibilityLabel: 'My words collection',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}