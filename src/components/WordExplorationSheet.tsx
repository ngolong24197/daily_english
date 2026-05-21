/**
 * WordExplorationSheet — Bottom sheet for exploring a word.
 *
 * Shows: word in large text, situational explanation (not a definition),
 * example sentence, "Try saying: ___", mode badge, dismiss button.
 *
 * If the word is a review word appearing in a new context, also shows
 * the context change description.
 */

import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { typography, spacing, radii } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import type { MockWord } from '../services/mockData';
import type { ModeCode } from '../types';
import {
  getWordModeEntry,
  getModeBadgeLabel,
  getModeBadgeColor,
  getTrySaying,
  getAvailableModesForWord,
} from '../services/wordService';
import type { MasteryLevel } from '../services/wordProgress';

interface WordExplorationSheetProps {
  visible: boolean;
  word: MockWord | null;
  modeCode: ModeCode;
  contextChangeDescription?: string;
  masteryLevel?: MasteryLevel;
  onClose: () => void;
}

const MASTERY_CONFIG: Record<MasteryLevel, { emoji: string; label: string; colorKey: string }> = {
  seed: { emoji: '\u{1F331}', label: 'Seed', colorKey: 'textSecondary' },
  sprout: { emoji: '\u{1F33F}', label: 'Sprout', colorKey: 'primary' },
  bloom: { emoji: '\u{1F33A}', label: 'Bloom', colorKey: 'accentWarm' },
};

export default function WordExplorationSheet({
  visible,
  word,
  modeCode,
  contextChangeDescription,
  masteryLevel,
  onClose,
}: WordExplorationSheetProps) {
  const { colors } = useTheme();

  if (!word) return null;

  const entry = getWordModeEntry(word, modeCode);
  const badgeColors = getModeBadgeColor(modeCode);
  const badgeLabel = getModeBadgeLabel(modeCode);
  const trySaying = getTrySaying(word, modeCode);
  const availableModes = getAvailableModesForWord(word);
  const mastery = masteryLevel ?? 'seed';
  const masteryConfig = MASTERY_CONFIG[mastery] ?? MASTERY_CONFIG.seed;
  const masteryColor = colors[masteryConfig.colorKey as keyof typeof colors] as string;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityLabel={`Word details for ${word.lemma}`}
    >
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlayMedium }]} onPress={onClose}>
        <Pressable style={[styles.sheetContent, { backgroundColor: colors.bg }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Context change callout (for review words) */}
          {contextChangeDescription && (
            <View style={[styles.contextChangeCard, { backgroundColor: colors.secondaryMedium }]}>
              <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
              <Text style={[styles.contextChangeText, { color: colors.textPrimary }]}>{contextChangeDescription}</Text>
            </View>
          )}

          {/* Word header */}
          <View style={styles.wordHeader} accessibilityLabel={`${word.lemma}, ${word.pos}`}>
            <Text style={[styles.wordLemma, { color: colors.textPrimary }]}>{word.lemma}</Text>
            <Text style={[styles.wordPos, { color: colors.textMuted }]}>{word.pos}</Text>
          </View>

          {/* Mastery indicator */}
          <View style={styles.masteryRow}>
            <Text style={styles.masteryEmoji}>{masteryConfig.emoji}</Text>
            <Text style={[styles.masteryLabel, { color: masteryColor }]}>
              {masteryConfig.label}
            </Text>
          </View>

          {/* Mode badge */}
          <View style={[styles.modeBadge, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.modeBadgeText, { color: badgeColors.text }]}>
              {badgeLabel}
            </Text>
          </View>

          {/* Situational explanation */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>What it means here</Text>
          <Text style={[styles.explanation, { color: colors.textPrimary }]}>{entry.meaning_context}</Text>

          {/* Example sentence */}
          <View style={[styles.exampleCard, { backgroundColor: colors.surface, borderLeftColor: colors.accentWarm }]}>
            <Text style={[styles.exampleText, { color: colors.textPrimary }]}>{entry.example_sentence}</Text>
            <Text style={[styles.exampleContext, { color: colors.textSecondary }]}>{entry.example_context}</Text>
          </View>

          {/* Try saying */}
          <View style={[styles.trySayingCard, { backgroundColor: colors.primarySubtle }]}>
            <Text style={[styles.trySayingLabel, { color: colors.primary }]}>Try saying</Text>
            <Text style={[styles.trySayingText, { color: colors.textPrimary }]}>{trySaying}</Text>
          </View>

          {/* Other modes available */}
          {availableModes.length > 1 && (
            <View style={styles.otherModesSection}>
              <Text style={[styles.otherModesLabel, { color: colors.textMuted }]}>Also used in</Text>
              <View style={styles.otherModesRow}>
                {availableModes
                  .filter((m) => m !== modeCode)
                  .map((m) => {
                    const mColors = getModeBadgeColor(m);
                    const mLabel = getModeBadgeLabel(m);
                    return (
                      <View
                        key={m}
                        style={[styles.otherModeChip, { backgroundColor: mColors.bg }]}
                      >
                        <Text style={[styles.otherModeChipText, { color: mColors.text }]}>
                          {mLabel}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}

          {/* Dismiss button */}
          <TouchableOpacity
            style={[styles.dismissButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={[styles.dismissButtonText, { color: colors.onPrimary }]}>Got it</Text>
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
  contextChangeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  contextChangeEmoji: {
    fontSize: 20,
  },
  contextChangeText: {
    flex: 1,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  wordHeader: {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  wordLemma: {
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  wordPos: {
    fontSize: typography.caption.fontSize,
    textTransform: 'lowercase' as const,
  },
  masteryRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  masteryEmoji: {
    fontSize: 16,
  },
  masteryLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  modeBadge: {
    alignSelf: 'flex-start' as const,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.lg,
  },
  modeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  explanation: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    marginBottom: spacing.lg,
  },
  exampleCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
  },
  exampleText: {
    fontSize: typography.body.fontSize,
    fontStyle: 'italic',
    lineHeight: typography.body.lineHeight,
  },
  exampleContext: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  trySayingCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trySayingLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  trySayingText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  otherModesSection: {
    marginBottom: spacing.lg,
  },
  otherModesLabel: {
    fontSize: typography.caption.fontSize,
    marginBottom: spacing.xs,
  },
  otherModesRow: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
  },
  otherModeChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  otherModeChipText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  dismissButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
} as const;