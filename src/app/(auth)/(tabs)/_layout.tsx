import { Tabs } from 'expo-router/tabs';
import { TouchableOpacity, Text } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';
import { useDrawer } from '@/contexts/DrawerContext';

function DrawerButton() {
  const { open } = useDrawer();
  return (
    <TouchableOpacity onPress={open} style={{ marginLeft: spacing.md }} accessibilityRole="button" accessibilityLabel="Open menu">
      <Text style={{ fontSize: 22, color: colors.light.textPrimary }}>{'☰'}</Text>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.light.bg,
        },
        headerTintColor: colors.light.textPrimary,
        headerTitleStyle: {
          fontSize: typography.heading.fontSize,
          fontWeight: typography.heading.fontWeight as any,
        },
        headerLeft: () => <DrawerButton />,
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: colors.light.textMuted,
        tabBarStyle: {
          backgroundColor: colors.light.bg,
          borderTopColor: colors.light.border,
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