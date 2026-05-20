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
import { colors, typography, spacing, radii } from '../constants/theme';
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

const MASTERY_CONFIG: Record<MasteryLevel, { emoji: string; label: string; color: string }> = {
  seed: { emoji: '\u{1F331}', label: 'Seed', color: colors.light.textSecondary },
  sprout: { emoji: '\u{1F33F}', label: 'Sprout', color: colors.light.primary },
  bloom: { emoji: '\u{1F33A}', label: 'Bloom', color: colors.light.accentWarm },
};

export default function WordExplorationSheet({
  visible,
  word,
  modeCode,
  contextChangeDescription,
  masteryLevel,
  onClose,
}: WordExplorationSheetProps) {
  if (!word) return null;

  const entry = getWordModeEntry(word, modeCode);
  const badgeColors = getModeBadgeColor(modeCode);
  const badgeLabel = getModeBadgeLabel(modeCode);
  const trySaying = getTrySaying(word, modeCode);
  const availableModes = getAvailableModesForWord(word);
  const mastery = masteryLevel ?? 'seed';
  const masteryConfig = MASTERY_CONFIG[mastery] ?? MASTERY_CONFIG.seed;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityLabel={`Word details for ${word.lemma}`}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContent} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Context change callout (for review words) */}
          {contextChangeDescription && (
            <View style={styles.contextChangeCard}>
              <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
              <Text style={styles.contextChangeText}>{contextChangeDescription}</Text>
            </View>
          )}

          {/* Word header */}
          <View style={styles.wordHeader} accessibilityLabel={`${word.lemma}, ${word.pos}`}>
            <Text style={styles.wordLemma}>{word.lemma}</Text>
            <Text style={styles.wordPos}>{word.pos}</Text>
          </View>

          {/* Mastery indicator */}
          <View style={styles.masteryRow}>
            <Text style={styles.masteryEmoji}>{masteryConfig.emoji}</Text>
            <Text style={[styles.masteryLabel, { color: masteryConfig.color }]}>
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
          <Text style={styles.sectionLabel}>What it means here</Text>
          <Text style={styles.explanation}>{entry.meaning_context}</Text>

          {/* Example sentence */}
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>{entry.example_sentence}</Text>
            <Text style={styles.exampleContext}>{entry.example_context}</Text>
          </View>

          {/* Try saying */}
          <View style={styles.trySayingCard} accessibilityLabel={`Try saying: ${trySaying}`}>
            <Text style={styles.trySayingLabel}>Try saying</Text>
            <Text style={styles.trySayingText}>{trySaying}</Text>
          </View>

          {/* Other modes available */}
          {availableModes.length > 1 && (
            <View style={styles.otherModesSection}>
              <Text style={styles.otherModesLabel}>Also used in</Text>
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
            style={styles.dismissButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.dismissButtonText}>Got it</Text>
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
  contextChangeCard: {
    backgroundColor: 'rgba(232, 168, 124, 0.15)',
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
    color: colors.light.textPrimary,
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
    fontWeight: '700' as const,
    color: colors.light.textPrimary,
    fontStyle: 'italic' as const,
  },
  wordPos: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
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
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
  },
  sectionLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    color: colors.light.textMuted,
    textTransform: 'uppercase' as const,
    marginBottom: spacing.xs,
  },
  explanation: {
    fontSize: typography.bodyLg.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.bodyLg.lineHeight,
    marginBottom: spacing.lg,
  },
  exampleCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.light.accentWarm,
  },
  exampleText: {
    fontSize: typography.body.fontSize,
    fontStyle: 'italic' as const,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  exampleContext: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  trySayingCard: {
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  trySayingLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    color: colors.light.primary,
    marginBottom: spacing.xs,
  },
  trySayingText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  otherModesSection: {
    marginBottom: spacing.lg,
  },
  otherModesLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
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
    fontWeight: '500' as const,
  },
  dismissButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  dismissButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: '#FFFFFF',
  },
};