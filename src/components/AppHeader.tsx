import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { typography, spacing } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useDrawer } from '@/contexts/DrawerContext';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  showDrawerButton?: boolean;
  rightAction?: React.ReactNode;
}

export default function AppHeader({
  title,
  showBackButton = false,
  showDrawerButton = true,
  rightAction,
}: AppHeaderProps) {
  const { colors } = useTheme();
  const { open } = useDrawer();

  return (
    <View style={[s.header, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
      <View style={s.left}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={s.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[s.iconText, { color: colors.textPrimary }]}>{'<'} </Text>
          </TouchableOpacity>
        )}
        {showDrawerButton && !showBackButton && (
          <TouchableOpacity
            onPress={open}
            style={s.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <Text style={[s.iconText, { color: colors.textPrimary }]}>{'≡'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[s.title, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>

      <View style={s.right}>
        {rightAction ?? null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    textAlign: 'center',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '600',
  },
});