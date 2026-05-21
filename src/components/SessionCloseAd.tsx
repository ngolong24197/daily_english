/**
 * SessionCloseAd — Shown after the review screen for free users.
 *
 * Warm, non-intrusive ad card. For MVP, shows a placeholder ad
 * promoting the premium upgrade. Premium users never see this.
 *
 * Philosophy: "hobby not test" — the ad must feel warm, not aggressive.
 * Max 1 ad per session, only at session close, never during conversation.
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';
import { subscriptionService } from '../services/subscriptionService';

interface SessionCloseAdProps {
  onContinue: () => void;
  onUpgrade?: () => void;
}

export default function SessionCloseAd({ onContinue, onUpgrade }: SessionCloseAdProps) {
  // Premium users never see this
  if (!subscriptionService.shouldShowAds()) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.adCard}>
        <Text style={styles.adEmoji}>{'\u{1F331}'}</Text>
        <Text style={styles.adTitle}>Keep growing with Premium</Text>
        <Text style={styles.adDescription}>
          Unlock all tracks, full history, detailed stats, and an ad-free experience.
        </Text>

        {onUpgrade ? (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={onUpgrade}
            accessibilityRole="button"
            accessibilityLabel="Learn more about Premium"
          >
            <Text style={styles.upgradeButtonText}>Learn more</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to home"
      >
        <Text style={styles.continueText}>See you tomorrow!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  adCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    width: '100%',
  },
  adEmoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  adTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.subheading.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  adDescription: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  upgradeButton: {
    backgroundColor: colors.light.secondary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: colors.light.textPrimary,
  },
  continueButton: {
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  continueText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.light.primary,
    textAlign: 'center',
  },
} as const;