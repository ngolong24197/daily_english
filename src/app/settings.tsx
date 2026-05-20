import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { colors, typography, spacing, radii } from '../constants/theme';
import { useSessionStore } from '../stores/sessionStore';
import { MODES } from '../constants/modes';
import type { ModeCode } from '../types';
import { getModeSwitchMessage, isExamMode } from '../services/contextDetection';
import { subscriptionService } from '../services/subscriptionService';
import PremiumUpgradeSheet from '../components/PremiumUpgradeSheet';
import { useHaptics } from '../hooks/useHaptics';
import { trackLabel } from '../utils/accessibility';
import { APP_CONFIG } from '../constants/appConfig';
import type { ExamPracticeMode } from '../stores/sessionStore';

const TRACK_ICONS: Record<ModeCode, string> = {
  survival: '\u{1F3E0}',
  professional: '\u{1F4BC}',
  social: '\u{1F3AE}',
  ielts: '\u{1F4DD}',
  toeic: '\u{1F4CA}',
};

export default function SettingsScreen() {
  const { currentMode, setCurrentMode, setOnboardingComplete, examPracticeMode, setExamPracticeMode } = useSessionStore();
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
    if (MODES[modeCode].is_premium && !subscriptionService.isTrackAvailable(modeCode)) {
      setShowUpgradeSheet(true);
      return;
    }

    const mode = MODES[modeCode];
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Track</Text>
      <Text style={styles.sectionDescription}>
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
                isSelected && styles.trackCardSelected,
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
                      isSelected && styles.trackCardTextSelected,
                    ]}
                  >
                    {mode.display_name}
                  </Text>
                  {isLocked && !isSelected && (
                    <Text style={styles.premiumBadge}>{'\u{1F512}'} Premium</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedCheckmark}>
                    <Text style={styles.selectedCheckmarkText}>{'✓'}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.trackCardDescription,
                  isSelected && styles.trackCardDescriptionSelected,
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
          <Text style={styles.sectionTitle}>Practice Mode</Text>
          <Text style={styles.sectionDescription}>
            When on an exam track, you can choose between structured exam practice
            (timed, with accuracy feedback) or a relaxed daily practice using the same words.
          </Text>
          <View style={styles.examModeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.examModeOption,
                examPracticeMode === 'exam' && styles.examModeOptionSelected,
              ]}
              onPress={() => setExamPracticeMode('exam')}
              accessibilityRole="button"
              accessibilityLabel="Practice exam mode"
            >
              <Text style={styles.examModeOptionIcon}>{'\u{1F4DD}'}</Text>
              <Text style={[
                styles.examModeOptionLabel,
                examPracticeMode === 'exam' && styles.examModeOptionLabelSelected,
              ]}>
                Exam Practice
              </Text>
              <Text style={styles.examModeOptionDesc}>
                Timed, structured, with accuracy feedback
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.examModeOption,
                examPracticeMode === 'daily' && styles.examModeOptionSelected,
              ]}
              onPress={() => setExamPracticeMode('daily')}
              accessibilityRole="button"
              accessibilityLabel="Practice daily mode"
            >
              <Text style={styles.examModeOptionIcon}>{'\u{1F4AC}'}</Text>
              <Text style={[
                styles.examModeOptionLabel,
                examPracticeMode === 'daily' && styles.examModeOptionLabelSelected,
              ]}>
                Daily Practice
              </Text>
              <Text style={styles.examModeOptionDesc}>
                Relaxed, no timer, conversation-based
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Premium Section */}
      <Text style={styles.sectionTitle}>Daily English Premium</Text>
      {isPremium ? (
        <View style={styles.premiumStatusCard}>
          <Text style={styles.premiumStatusEmoji}>{'\u{2728}'}</Text>
          <View style={styles.premiumStatusText}>
            <Text style={styles.premiumStatusLabel}>Premium Active</Text>
            <Text style={styles.premiumStatusDesc}>
              All tracks, full history, detailed stats, no ads
            </Text>
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => {
              Alert.alert('Manage Subscription', 'Subscription management will be available in a future update.');
            }}
            accessibilityRole="button"
            accessibilityLabel="Manage subscription"
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.upgradeCard}
          onPress={() => setShowUpgradeSheet(true)}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Premium"
        >
          <Text style={styles.upgradeEmoji}>{'\u{1F680}'}</Text>
          <View style={styles.upgradeText}>
            <Text style={styles.upgradeTitle}>Free Plan</Text>
            <Text style={styles.upgradeDesc}>
              Upgrade for all tracks, full history, detailed stats, and no ads.
            </Text>
          </View>
          <Text style={styles.upgradeArrow}>{'>'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Words per day</Text>
      <Text style={styles.settingValue}>
        {isPremium ? 'Unlimited' : '5'}
      </Text>
      {!isPremium && (
        <Text style={styles.settingNote}>
          Premium unlocks unlimited words per day
        </Text>
      )}

      <Text style={styles.sectionTitle}>Audio</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Play scene audio automatically</Text>
        <Switch value={autoPlayAudio} onValueChange={setAutoPlayAudio} />
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Play partner responses as audio</Text>
        <Switch value={playPartnerAudio} onValueChange={setPlayPartnerAudio} />
      </View>

      <Text style={styles.sectionTitle}>Speaking</Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Auto-detect end of speech</Text>
        <Switch value={autoDetectSpeech} onValueChange={setAutoDetectSpeech} />
      </View>

      {/* Demo premium toggle (hidden behind long-press) */}
      {showDemoToggle && (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{'\u{1F513}'} Demo: Premium Mode</Text>
          <Switch value={demoPremiumEnabled} onValueChange={handleDemoToggle} />
        </View>
      )}

      <Text style={styles.sectionTitle}>About</Text>
      <TouchableOpacity
        onPress={handleVersionLongPress}
        activeOpacity={0.7}
      >
        <Text style={styles.settingValue}>Version {APP_CONFIG.version}</Text>
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
    backgroundColor: colors.light.bg,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as any,
    color: colors.light.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
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
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  trackCardSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
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
    color: colors.light.textPrimary,
  },
  trackCardTextSelected: {
    color: '#FFFFFF',
  },
  trackCardDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  trackCardDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  premiumBadge: {
    fontSize: typography.caption.fontSize,
    color: colors.light.secondary,
    marginTop: 2,
    fontWeight: '600',
  },
  selectedCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as any,
    justifyContent: 'center' as any,
  },
  selectedCheckmarkText: {
    fontSize: 12,
    fontWeight: '700' as any,
    color: colors.light.primary,
  },
  examModeToggleContainer: {
    flexDirection: 'row' as any,
    gap: spacing.sm,
  },
  examModeOption: {
    flex: 1,
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  examModeOptionSelected: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
  },
  examModeOptionIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  examModeOptionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
  },
  examModeOptionLabelSelected: {
    color: colors.light.primary,
  },
  examModeOptionDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
    lineHeight: typography.caption.lineHeight,
  },
  premiumStatusCard: {
    backgroundColor: 'rgba(91, 140, 90, 0.1)',
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.primary,
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
    color: colors.light.primary,
    lineHeight: typography.body.lineHeight,
  },
  premiumStatusDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  manageButton: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  manageButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
  },
  upgradeCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.secondary,
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
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  upgradeDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeArrow: {
    fontSize: typography.body.fontSize,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  settingValue: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    marginBottom: spacing.xs,
  },
  settingNote: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm,
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
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
});