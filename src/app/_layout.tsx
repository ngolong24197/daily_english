import '../global.css';

import { useState, useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, typography, spacing, radii } from '../constants/theme';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { DrawerNavigationOptions } from '@react-navigation/drawer';
import { useSessionStore } from '../stores/sessionStore';
import { subscriptionService } from '../services/subscriptionService';
import { streakService } from '../services/streakService';
import { shouldShowWarmReEntry, getWarmReEntryMessage, recordSessionDate } from '../services/warmReEntry';
import { NavigationLabels } from '../utils/accessibility';
import { APP_CONFIG } from '../constants/appConfig';

const DRAWER_ITEMS = [
  { label: "Today's Session", route: '/' },
  { label: 'Jam Along', route: '/jam-along' },
  { label: 'Conversation History', route: '/history' },
  { label: 'My Words', route: '/words' },
  { label: 'Settings', route: '/settings' },
];

function DrawerContent({ navigation }: { navigation: any }) {
  const { resetSession, setCurrentStep, currentMode } = useSessionStore();
  const [streakCount, setStreakCount] = useState(streakService.getStreak());
  const [isPremium, setIsPremium] = useState(subscriptionService.isPremium());
  const [warmMessage, setWarmMessage] = useState<string | null>(null);

  const modeLabels: Record<string, string> = {
    survival: 'Survival',
    professional: 'Professional',
    social: 'Social',
    ielts: 'IELTS',
    toeic: 'TOEIC',
  };

  // Record session on app open and update streak, show warm re-entry
  useEffect(() => {
    const newStreak = streakService.recordSession();
    setStreakCount(newStreak);
    recordSessionDate();

    // Show warm re-entry message if returning after 1+ days
    if (APP_CONFIG.features.enableWarmReEntry && shouldShowWarmReEntry()) {
      const message = getWarmReEntryMessage();
      if (message) {
        setWarmMessage(message);
        setTimeout(() => setWarmMessage(null), 4000);
      }
    }
  }, []);

  // Listen for premium changes
  useEffect(() => {
    setIsPremium(subscriptionService.isPremium());
  }, []);

  const handleNavigate = (route: string) => {
    if (route === '/') {
      resetSession();
      setCurrentStep('checkin');
    } else if (route === '/jam-along') {
      resetSession();
      const { setPracticeFormat, setJamAlongScriptId, setCurrentMode } = useSessionStore.getState();
      const script = currentMode === 'professional' || currentMode === 'ielts' || currentMode === 'toeic'
        ? 'jam-meeting-professional'
        : 'jam-cafe-survival';
      setPracticeFormat('jamAlong');
      setJamAlongScriptId(script);
      setCurrentStep('jamAlong');
      return;
    }
    navigation.navigate(route);
  };

  const streakMessage = streakService.getStreakMessage();

  return (
    <View style={styles.drawerContainer}>
      {/* Header with greeting, streak, and track badge */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerGreeting} accessibilityRole="header">
          {streakService.getWelcomeMessage()}
        </Text>
        {streakCount > 0 && (
          <View style={styles.streakRow}>
            <Text style={styles.streakEmoji}>{'\u{1F525}'}</Text>
            <Text style={styles.streakText}>{streakMessage}</Text>
          </View>
        )}
        <View style={styles.drawerTrackRow}>
          <View style={styles.trackBadge}>
            <Text style={styles.trackBadgeText}>
              {modeLabels[currentMode] ?? 'Survival'}
            </Text>
          </View>
          <View style={[
            styles.tierBadge,
            isPremium ? styles.tierBadgePremium : styles.tierBadgeFree,
          ]}>
            <Text style={[
              styles.tierBadgeText,
              isPremium ? styles.tierBadgeTextPremium : styles.tierBadgeTextFree,
            ]}>
              {isPremium ? 'Premium' : 'Free'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.drawerDivider} />

      {/* Warm re-entry welcome banner */}
      {warmMessage && (
        <View style={styles.warmBanner}>
          <Text style={styles.warmBannerText}>{warmMessage}</Text>
        </View>
      )}

      {DRAWER_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.drawerItem}
          onPress={() => handleNavigate(item.route)}
          accessibilityLabel={NavigationLabels[item.route] ?? item.label}
          accessibilityRole="button"
        >
          <Text style={styles.drawerItemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.drawerDivider} />

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => {
            navigation.navigate('settings');
          }}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Premium"
        >
          <Text style={styles.upgradeBannerEmoji}>{'\u{1F680}'}</Text>
          <View style={styles.upgradeBannerText}>
            <Text style={styles.upgradeBannerTitle}>Go Premium</Text>
            <Text style={styles.upgradeBannerDesc}>All tracks, full history, no ads</Text>
          </View>
          <Text style={styles.upgradeBannerArrow}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.drawerFooter}>
        <Text style={styles.drawerFooterText}>Daily English v{APP_CONFIG.version}</Text>
      </View>
    </View>
  );
}

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Drawer
        drawerContent={(props) => <DrawerContent navigation={props.navigation} />}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.light.bg,
          },
          headerTintColor: colors.light.textPrimary,
          drawerPosition: 'right',
          drawerType: 'front',
          headerTitleStyle: {
            fontSize: typography.heading.fontSize,
            fontWeight: typography.heading.fontWeight as any,
          },
        } satisfies DrawerNavigationOptions}
      >
        <Drawer.Screen
          name="index"
          options={{ headerTitle: 'Daily English' }}
        />
        <Drawer.Screen
          name="history"
          options={{ headerTitle: 'Conversation History' }}
        />
        <Drawer.Screen
          name="words"
          options={{ headerTitle: 'My Words' }}
        />
        <Drawer.Screen
          name="settings"
          options={{ headerTitle: 'Settings' }}
        />
        <Drawer.Screen
          name="jam-along"
          options={{ headerTitle: 'Jam Along', drawerItemStyle: { display: 'none' } }}
        />
        <Drawer.Screen
          name="track-selection"
          options={{ headerTitle: 'Choose Your Track', drawerItemStyle: { display: 'none' } }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.light.bg,
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  drawerHeader: {
    paddingBottom: spacing.lg,
  },
  drawerGreeting: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    color: colors.light.secondary,
    lineHeight: typography.caption.lineHeight,
  },
  drawerTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  trackBadge: {
    backgroundColor: 'rgba(91, 140, 90, 0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trackBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.light.primary,
  },
  tierBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tierBadgeFree: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  tierBadgePremium: {
    backgroundColor: 'rgba(91, 140, 90, 0.15)',
  },
  tierBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  tierBadgeTextFree: {
    color: colors.light.textSecondary,
  },
  tierBadgeTextPremium: {
    color: colors.light.primary,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: spacing.sm,
  },
  warmBanner: {
    backgroundColor: 'rgba(91, 140, 90, 0.12)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  warmBannerText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.primary,
    lineHeight: typography.caption.lineHeight,
    textAlign: 'center' as any,
    fontWeight: '500' as any,
  },
  drawerItem: {
    paddingVertical: spacing.md,
  },
  drawerItemText: {
    fontSize: typography.body.fontSize,
    fontWeight: '400' as any,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  upgradeBanner: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.secondary,
    marginTop: spacing.sm,
  },
  upgradeBannerEmoji: {
    fontSize: 20,
  },
  upgradeBannerText: {
    flex: 1,
  },
  upgradeBannerTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  upgradeBannerDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeBannerArrow: {
    fontSize: typography.body.fontSize,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingBottom: spacing['2xl'],
  },
  drawerFooterText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    textAlign: 'center',
  },
});