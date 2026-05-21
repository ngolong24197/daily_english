/**
 * PremiumUpgradeSheet — Bottom sheet shown when free user
 * tries to access a premium feature.
 *
 * Lists premium benefits with warm, encouraging copy.
 * For MVP, "Start free trial" toggles premium on (for testing).
 */

import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { typography, spacing, radii } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';

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
  const { colors } = useTheme();

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
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlayMedium }]} onPress={onClose}>
        <Pressable style={[styles.sheetContent, { backgroundColor: colors.bg }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {title ?? 'Upgrade to Daily English Premium'}
          </Text>

          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Go deeper with more tracks, full history, and no ads.
            </Text>
          )}

          <View style={styles.benefitsList}>
            {BENEFITS.map((benefit) => (
              <View key={benefit.title} style={styles.benefitRow}>
                <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
                <View style={styles.benefitText}>
                  <Text style={[styles.benefitTitle, { color: colors.textPrimary }]}>{benefit.title}</Text>
                  <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.pricingCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
            <Text style={[styles.pricingPrice, { color: colors.primary }]}>$9.99/month</Text>
            <Text style={[styles.pricingAlt, { color: colors.textSecondary }]}>or $79.99/year</Text>
          </View>

          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colors.primary }]}
            onPress={handleStartTrial}
            accessibilityRole="button"
            accessibilityLabel="Start free trial"
          >
            <Text style={[styles.ctaButtonText, { color: colors.onPrimary }]}>Start free trial</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.laterButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={[styles.laterButtonText, { color: colors.textSecondary }]}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  sheetContent: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '85%',
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center' as const,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
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
    fontWeight: '600',
    lineHeight: typography.body.lineHeight,
  },
  benefitDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  pricingCard: {
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  pricingPrice: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    lineHeight: typography.heading.lineHeight,
  },
  pricingAlt: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  ctaButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ctaButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  laterButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  laterButtonText: {
    fontSize: typography.body.fontSize,
  },
} as const;