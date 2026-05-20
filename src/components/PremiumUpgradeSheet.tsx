/**
 * PremiumUpgradeSheet — Bottom sheet shown when free user
 * tries to access a premium feature.
 *
 * Lists premium benefits with warm, encouraging copy.
 * For MVP, "Start free trial" toggles premium on (for testing).
 */

import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';

interface PremiumUpgradeSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Optional title override, e.g., "Unlock Full History" */
  title?: string;
  /** Optional subtitle describing what triggered the prompt */
  subtitle?: string;
  /** Callback when user activates premium (for MVP demo toggle) */
  onActivatePremium?: () => void;
}

const BENEFITS = [
  {
    emoji: '\u{1F30D}',
    title: 'All tracks',
    description: 'Professional, Social, IELTS, and TOEIC',
  },
  {
    emoji: '\u{1F4DA}',
    title: 'Unlimited words per day',
    description: 'Learn as many words as you want',
  },
  {
    emoji: '\u{1F4D3}',
    title: 'Full conversation history',
    description: 'Look back at every conversation',
  },
  {
    emoji: '\u{1F4CA}',
    title: 'Detailed word statistics',
    description: 'See how your vocabulary grows',
  },
  {
    emoji: '\u{2728}',
    title: 'No ads',
    description: 'A cleaner, more focused experience',
  },
];

export default function PremiumUpgradeSheet({
  visible,
  onClose,
  title,
  subtitle,
  onActivatePremium,
}: PremiumUpgradeSheetProps) {
  const handleStartTrial = () => {
    if (onActivatePremium) {
      onActivatePremium();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={() => {}}>
          <View style={styles.handle} />

          <Text style={styles.title}>
            {title ?? 'Upgrade to Daily English Premium'}
          </Text>

          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : (
            <Text style={styles.subtitle}>
              Go deeper with more tracks, full history, and no ads.
            </Text>
          )}

          <View style={styles.benefitsList}>
            {BENEFITS.map((benefit) => (
              <View key={benefit.title} style={styles.benefitRow}>
                <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.pricingCard}>
            <Text style={styles.pricingPrice}>$9.99/month</Text>
            <Text style={styles.pricingAlt}>or $79.99/year</Text>
          </View>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStartTrial}
            accessibilityRole="button"
            accessibilityLabel="Start free trial"
          >
            <Text style={styles.ctaButtonText}>Start free trial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={styles.laterButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)' as const,
    justifyContent: 'flex-end' as const,
  },
  sheetContent: {
    backgroundColor: colors.light.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '85%' as const,
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.light.border,
    alignSelf: 'center' as const,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as const,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  benefitsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  benefitRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  benefitDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  pricingCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  pricingPrice: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700' as const,
    color: colors.light.primary,
    lineHeight: typography.heading.lineHeight,
  },
  pricingAlt: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  ctaButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    marginBottom: spacing.sm,
  },
  ctaButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: '#FFFFFF',
  },
  laterButton: {
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  laterButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
  },
};