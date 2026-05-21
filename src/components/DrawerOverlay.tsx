import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { typography, spacing, radii } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { subscriptionService } from '@/services/subscriptionService';
import { streakService } from '@/services/streakService';
import { shouldShowWarmReEntry, getWarmReEntryMessage, recordSessionDate } from '@/services/warmReEntry';
import { NavigationLabels } from '@/utils/accessibility';
import { APP_CONFIG } from '@/constants/appConfig';
import { useDrawer } from '@/contexts/DrawerContext';

const DRAWER_ITEMS = [
  { label: "Today's Session", route: '/' as const },
  { label: 'Jam Along', route: '/jam-along' as const },
  { label: 'Conversation History', route: '/history' as const },
  { label: 'My Words', route: '/words' as const },
  { label: 'Settings', route: '/settings' as const },
];

export default function DrawerOverlay() {
  const { colors } = useTheme();
  const { isOpen, close } = useDrawer();
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

  useEffect(() => {
    if (!isOpen) return;
    const newStreak = streakService.recordSession();
    setStreakCount(newStreak);
    recordSessionDate();
    setIsPremium(subscriptionService.isPremium());

    if (APP_CONFIG.features.enableWarmReEntry && shouldShowWarmReEntry()) {
      const message = getWarmReEntryMessage();
      if (message) {
        setWarmMessage(message);
        const timer = setTimeout(() => setWarmMessage(null), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  const handleNavigate = (route: string) => {
    close();
    if (route === '/') {
      resetSession();
      setCurrentStep('checkin');
      router.replace('/(auth)/(tabs)');
    } else if (route === '/jam-along') {
      resetSession();
      const { setPracticeFormat, setJamAlongScriptId, setCurrentMode } = useSessionStore.getState();
      const script = currentMode === 'professional' || currentMode === 'ielts' || currentMode === 'toeic'
        ? 'jam-meeting-professional'
        : 'jam-cafe-survival';
      setPracticeFormat('jamAlong');
      setJamAlongScriptId(script);
      setCurrentStep('jamAlong');
      router.push('/session/jam-along');
    } else {
      router.push(route as any);
    }
  };

  const overlayAnim = useAnimatedStyle(() => ({
    opacity: withTiming(isOpen ? 0.5 : 0),
    pointerEvents: isOpen ? 'auto' : 'none' as any,
  }));

  const drawerAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(isOpen ? 0 : 300, { damping: 20 }) }],
  }));

  const streakMessage = streakService.getStreakMessage();

  return (
    <>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, overlayAnim]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityRole="button" accessibilityLabel="Close menu" />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View style={[styles.drawerPanel, drawerAnim, { backgroundColor: colors.bg }]}>
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerGreeting, { color: colors.textPrimary }]} accessibilityRole="header">
            {streakService.getWelcomeMessage()}
          </Text>
          {streakCount > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakEmoji}>{'\u{1F525}'}</Text>
              <Text style={[styles.streakText, { color: colors.secondary }]}>{streakMessage}</Text>
            </View>
          )}
          <View style={styles.drawerTrackRow}>
            <View style={[styles.trackBadge, { backgroundColor: colors.primaryMedium }]}>
              <Text style={[styles.trackBadgeText, { color: colors.primary }]}>
                {modeLabels[currentMode] ?? 'Survival'}
              </Text>
            </View>
            <View style={[
              styles.tierBadge,
              isPremium
                ? [styles.tierBadgePremium, { backgroundColor: colors.primaryMedium }]
                : [styles.tierBadgeFree, { backgroundColor: colors.surface, borderColor: colors.border }],
            ]}>
              <Text style={[
                styles.tierBadgeText,
                isPremium
                  ? { color: colors.primary }
                  : { color: colors.textSecondary },
              ]}>
                {isPremium ? 'Premium' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />

        {warmMessage && (
          <View style={[styles.warmBanner, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.warmBannerText, { color: colors.primary }]}>{warmMessage}</Text>
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
            <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.drawerDivider, { backgroundColor: colors.border }]} />

        {!isPremium && (
          <TouchableOpacity
            style={[styles.upgradeBanner, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
            onPress={() => { close(); router.push('/settings' as any); }}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium"
          >
            <Text style={styles.upgradeBannerEmoji}>{'\u{1F680}'}</Text>
            <View style={styles.upgradeBannerText}>
              <Text style={[styles.upgradeBannerTitle, { color: colors.textPrimary }]}>Go Premium</Text>
              <Text style={[styles.upgradeBannerDesc, { color: colors.textSecondary }]}>All tracks, full history, no ads</Text>
            </View>
            <Text style={[styles.upgradeBannerArrow, { color: colors.textMuted }]}>{'>'}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.drawerFooter}>
          <Text style={[styles.drawerFooterText, { color: colors.textMuted }]}>Daily English v{APP_CONFIG.version}</Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: spacing['3xl'],
    paddingHorizontal: spacing.lg,
  },
  drawerHeader: {
    paddingBottom: spacing.lg,
  },
  drawerGreeting: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
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
    lineHeight: typography.caption.lineHeight,
  },
  drawerTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  trackBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  trackBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  tierBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tierBadgeFree: {
    borderWidth: 1,
  },
  tierBadgePremium: {
  },
  tierBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  tierBadgeTextFree: {
  },
  tierBadgeTextPremium: {
  },
  drawerDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  warmBanner: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  warmBannerText: {
    fontSize: typography.caption.fontSize,
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
    lineHeight: typography.body.lineHeight,
  },
  upgradeBanner: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
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
    lineHeight: typography.body.lineHeight,
  },
  upgradeBannerDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeBannerArrow: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingBottom: spacing['2xl'],
  },
  drawerFooterText: {
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
  },
});