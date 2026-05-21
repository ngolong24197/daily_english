import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { typography, spacing, radii } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuthStore } from '@/stores/authStore';
import { MODES } from '@/constants/modes';
import type { ModeCode } from '@/types';
import { getModeSwitchMessage, isExamMode } from '@/services/contextDetection';
import { subscriptionService } from '@/services/subscriptionService';
import PremiumUpgradeSheet from '@/components/PremiumUpgradeSheet';
import { useHaptics } from '@/hooks/useHaptics';
import { trackLabel } from '@/utils/accessibility';
import { APP_CONFIG } from '@/constants/appConfig';
import type { ExamPracticeMode } from '@/stores/sessionStore';

const TRACK_ICONS: Record<ModeCode, string> = {
  survival: '\u{1F3E0}',
  professional: '\u{1F4BC}',
  social: '\u{1F3AE}',
  ielts: '\u{1F4DD}',
  toeic: '\u{1F4CA}',
};

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { currentMode, setCurrentMode, setOnboardingComplete, examPracticeMode, setExamPracticeMode } = useSessionStore();
  const { session, guestMode, signOut } = useAuthStore();
  const router = useRouter();
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [playPartnerAudio, setPlayPartnerAudio] = useState(true);
  const [autoDetectSpeech, setAutoDetectSpeech] = useState(true);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);
  const [demoPremiumEnabled, setDemoPremiumEnabled] = useState(subscriptionService.isDemoPremium());
  const versionPressCount = useRef(0);
  const [showDemoToggle, setShowDemoToggle] = useState(false);
  const haptics = useHaptics();

  const isPremium = subscriptionService.isPremium();
  const tracks = Object.values(MODES);

  const handleTrackSelect = (modeCode: ModeCode) => {
    if (modeCode === currentMode) return;

    haptics.selectionChanged();

    // Check if track is premium and user is not premium
    const modeData = MODES[modeCode];
    if (!modeData) return;
    if (modeData.is_premium && !subscriptionService.isTrackAvailable(modeCode)) {
      setShowUpgradeSheet(true);
      return;
    }

    const mode = modeData;
    const switchMessage = getModeSwitchMessage(modeCode);

    if (isExamMode(modeCode)) {
      Alert.alert(
        `Switch to ${mode.display_name}?`,
        `${switchMessage}\n\nExam mode includes accuracy feedback and timed practice. This is different from the daily conversation.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setCurrentMode(modeCode);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        `Switch to ${mode.display_name}?`,
        switchMessage,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Switch',
            onPress: () => {
              setCurrentMode(modeCode);
            },
          },
        ]
      );
    }
  };

  const handleVersionLongPress = () => {
    versionPressCount.current += 1;
    if (versionPressCount.current >= 5) {
      setShowDemoToggle(true);
      versionPressCount.current = 0;
    }
  };

  const handleDemoToggle = (enabled: boolean) => {
    subscriptionService.setDemoPremium(enabled);
    setDemoPremiumEnabled(enabled);
  };

  const showExamModeToggle = isExamMode(currentMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Track</Text>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        Words and situations will be tailored to your track.
        Your progress is kept when switching.
      </Text>
      <View style={styles.trackGrid}>
        {tracks.map((mode) => {
          const isSelected = currentMode === mode.code;
          const isLocked = mode.is_premium && !subscriptionService.isTrackAvailable(mode.code as ModeCode);
          return (
            <TouchableOpacity
              key={mode.code}
              style={[
                styles.trackCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                isLocked && styles.trackCardLocked,
              ]}
              onPress={() => handleTrackSelect(mode.code as ModeCode)}
              accessibilityLabel={trackLabel(mode.display_name, isLocked, isSelected)}
              accessibilityRole="button"
            >
              <View style={styles.trackCardHeader}>
                <Text style={styles.trackCardIcon}>{TRACK_ICONS[mode.code as ModeCode]}</Text>
                <View style={styles.trackCardHeaderText}>
                  <Text
                    style={[
                      styles.trackCardText,
                      { color: colors.textPrimary },
                      isSelected && { color: colors.onPrimary },
                    ]}
                  >
                    {mode.display_name}
                  </Text>
                  {isLocked && !isSelected && (
                    <Text style={[styles.premiumBadge, { color: colors.secondary }]}>{'\u{1F512}'} Premium</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={[styles.selectedCheckmark, { backgroundColor: colors.white }]}>
                    <Text style={[styles.selectedCheckmarkText, { color: colors.primary }]}>{'✓'}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.trackCardDescription,
                  { color: colors.textSecondary },
                  isSelected && { color: 'rgba(255, 255, 255, 0.8)' },
                ]}
                numberOfLines={2}
              >
                {mode.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Exam Mode Toggle */}
      {showExamModeToggle && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Practice Mode</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            When on an exam track, you can choose between structured exam practice
            (timed, with accuracy feedback) or a relaxed daily practice using the same words.
          </Text>
          <View style={styles.examModeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.examModeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                examPracticeMode === 'exam' && { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
              ]}
              onPress={() => setExamPracticeMode('exam')}
              accessibilityRole="button"
              accessibilityLabel="Practice exam mode"
            >
              <Text style={styles.examModeOptionIcon}>{'\u{1F4DD}'}</Text>
              <Text style={[
                styles.examModeOptionLabel,
                { color: colors.textPrimary },
                examPracticeMode === 'exam' && { color: colors.primary },
              ]}>
                Exam Practice
              </Text>
              <Text style={[styles.examModeOptionDesc, { color: colors.textSecondary }]}>
                Timed, structured, with accuracy feedback
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.examModeOption,
                { backgroundColor: colors.surface, borderColor: colors.border },
                examPracticeMode === 'daily' && { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
              ]}
              onPress={() => setExamPracticeMode('daily')}
              accessibilityRole="button"
              accessibilityLabel="Practice daily mode"
            >
              <Text style={styles.examModeOptionIcon}>{'\u{1F4AC}'}</Text>
              <Text style={[
                styles.examModeOptionLabel,
                { color: colors.textPrimary },
                examPracticeMode === 'daily' && { color: colors.primary },
              ]}>
                Daily Practice
              </Text>
              <Text style={[styles.examModeOptionDesc, { color: colors.textSecondary }]}>
                Relaxed, no timer, conversation-based
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Premium Section */}
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Daily English Premium</Text>
      {isPremium ? (
        <View style={[styles.premiumStatusCard, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}>
          <Text style={styles.premiumStatusEmoji}>{'\u{2728}'}</Text>
          <View style={styles.premiumStatusText}>
            <Text style={[styles.premiumStatusLabel, { color: colors.primary }]}>Premium Active</Text>
            <Text style={[styles.premiumStatusDesc, { color: colors.textSecondary }]}>
              All tracks, full history, detailed stats, no ads
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.manageButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              Alert.alert('Manage Subscription', 'Subscription management will be available in a future update.');
            }}
            accessibilityRole="button"
            accessibilityLabel="Manage subscription"
          >
            <Text style={[styles.manageButtonText, { color: colors.textPrimary }]}>Manage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
          onPress={() => setShowUpgradeSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Premium"
        >
          <Text style={styles.upgradeEmoji}>{'\u{1F680}'}</Text>
          <View style={styles.upgradeText}>
            <Text style={[styles.upgradeTitle, { color: colors.textPrimary }]}>Free Plan</Text>
            <Text style={[styles.upgradeDesc, { color: colors.textSecondary }]}>
              Upgrade for all tracks, full history, detailed stats, and no ads.
            </Text>
          </View>
          <Text style={[styles.upgradeArrow, { color: colors.textMuted }]}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Words per day</Text>
      <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
        {isPremium ? 'Unlimited' : '5'}
      </Text>
      {!isPremium && (
        <Text style={[styles.settingNote, { color: colors.textMuted }]}>
          Premium unlocks unlimited words per day
        </Text>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Audio</Text>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Play scene audio automatically</Text>
        <Switch value={autoPlayAudio} onValueChange={setAutoPlayAudio} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Play partner responses as audio</Text>
        <Switch value={playPartnerAudio} onValueChange={setPlayPartnerAudio} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Speaking</Text>
      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Auto-detect end of speech</Text>
        <Switch value={autoDetectSpeech} onValueChange={setAutoDetectSpeech} />
      </View>

      {/* Demo premium toggle (hidden behind long-press) */}
      {showDemoToggle && (
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{'\u{1F513}'} Demo: Premium Mode</Text>
          <Switch value={demoPremiumEnabled} onValueChange={handleDemoToggle} />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
      {session?.user ? (
        <View style={[styles.accountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.accountEmail, { color: colors.textPrimary }]}>{session.user.email}</Text>
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: colors.danger }]}
            onPress={async () => {
              await signOut();
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={[styles.signOutButtonText, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.signInCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          onPress={() => {
            useAuthStore.getState().setGuestMode(false);
            router.replace('/auth/login');
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to sync your progress"
        >
          <Text style={styles.signInIcon}>{'\u{1F517}'}</Text>
          <View style={styles.signInText}>
            <Text style={[styles.signInTitle, { color: colors.primary }]}>Sign in to sync</Text>
            <Text style={[styles.signInDesc, { color: colors.textSecondary }]}>Save your progress across devices</Text>
          </View>
          <Text style={[styles.signInArrow, { color: colors.textMuted }]}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
      <TouchableOpacity
        onPress={handleVersionLongPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.settingValue, { color: colors.textSecondary }]}>Version {APP_CONFIG.version}</Text>
      </TouchableOpacity>

      {/* Premium Upgrade Sheet */}
      <PremiumUpgradeSheet
        visible={showUpgradeSheet}
        onClose={() => setShowUpgradeSheet(false)}
        onActivatePremium={() => {
          subscriptionService.setDemoPremium(true);
          setDemoPremiumEnabled(true);
          setShowUpgradeSheet(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as any,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm,
  },
  trackGrid: {
    gap: spacing.sm,
  },
  trackCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  trackCardLocked: {
    opacity: 0.7,
  },
  trackCardHeader: {
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  trackCardIcon: {
    fontSize: 24,
  },
  trackCardHeaderText: {
    flex: 1,
  },
  trackCardText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  premiumBadge: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
    fontWeight: '600',
  },
  selectedCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  selectedCheckmarkText: {
    fontSize: 12,
    fontWeight: '700' as any,
  },
  trackCardDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  examModeToggleContainer: {
    flexDirection: 'row' as any,
    gap: spacing.sm,
  },
  examModeOption: {
    flex: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  examModeOptionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  examModeOptionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  examModeOptionDesc: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
    lineHeight: typography.caption.lineHeight,
  },
  premiumStatusCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
  },
  premiumStatusEmoji: {
    fontSize: 24,
  },
  premiumStatusText: {
    flex: 1,
  },
  premiumStatusLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    lineHeight: typography.body.lineHeight,
  },
  premiumStatusDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  manageButton: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  manageButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  upgradeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
  },
  upgradeEmoji: {
    fontSize: 24,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    lineHeight: typography.body.lineHeight,
  },
  upgradeDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeArrow: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.xs,
  },
  settingNote: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm,
  },
  accountCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  accountEmail: {
    fontSize: typography.body.fontSize,
    marginBottom: spacing.md,
  },
  signOutButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  signOutButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  signInCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
  },
  signInIcon: {
    fontSize: 24,
  },
  signInText: {
    flex: 1,
  },
  signInTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  signInDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  signInArrow: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row' as any,
    justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    flex: 1,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
});