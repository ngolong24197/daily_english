/**
 * ScoreCard — Shows after exam conversation with accuracy feedback.
 *
 * Features:
 * - Band score range (IELTS: "5.5-6.5", TOEIC: "120-150")
 * - Breakdown: Vocabulary, Grammar, Fluency, Relevance with indicators
 * - "What you did well" section (2-3 positive points)
 * - "Areas to improve" section (2-3 supportive suggestions)
 * - "Practice again" and "Continue to daily practice" buttons
 * - Only shown in exam mode
 */

import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { typography, spacing, radii, modeColors, type ThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import type { AccuracyScore, DimensionScore } from '../services/accuracyScoring';

interface ScoreCardProps {
  score: AccuracyScore;
  onPracticeAgain: () => void;
  onContinueToDaily: () => void;
}

export default function ScoreCard({
  score,
  onPracticeAgain,
  onContinueToDaily,
}: ScoreCardProps) {
  const { colors } = useTheme();
  const isIELTS = score.examType === 'ielts';
  const accentColor = isIELTS ? modeColors.ielts.accent : modeColors.toeic.accent;

  const scoreLabel = isIELTS ? 'Estimated IELTS Band' : 'Estimated TOEIC Score';
  const scoreUnit = isIELTS ? '' : ' points';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.contentContainer}>
      {/* Score Header */}
      <View style={styles.scoreHeader}>
        <Text style={[styles.scoreTitle, { color: colors.textPrimary }]}>Practice Complete</Text>
        <Text style={[styles.scoreSubtitle, { color: colors.textSecondary }]}>
          {isIELTS
            ? "Here's an estimate of how you might score on IELTS Speaking."
            : "Here's an estimate of how you might score on TOEIC Speaking."}
        </Text>
        <View style={[styles.bandScoreCard, { borderColor: accentColor, backgroundColor: colors.surface }]}>
          <Text style={[styles.bandScoreLabel, { color: colors.textSecondary }]}>{scoreLabel}</Text>
          <Text style={[styles.bandScoreValue, { color: accentColor }]}>
            {score.bandRange}{scoreUnit}
          </Text>
        </View>
      </View>

      {/* Dimension Breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Breakdown</Text>
        <DimensionBar
          dimension={score.breakdown.vocabulary}
          accentColor={accentColor}
          themeColors={colors}
        />
        <DimensionBar
          dimension={score.breakdown.grammar}
          accentColor={accentColor}
          themeColors={colors}
        />
        <DimensionBar
          dimension={score.breakdown.fluency}
          accentColor={accentColor}
          themeColors={colors}
        />
        <DimensionBar
          dimension={score.breakdown.relevance}
          accentColor={accentColor}
          themeColors={colors}
        />
      </View>

      {/* Words Used Correctly */}
      {score.wordsUsedCorrectly.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Words you used well</Text>
          <View style={styles.chipRow}>
            {score.wordsUsedCorrectly.map((word) => (
              <View key={word} style={[styles.wordChip, { backgroundColor: colors.primaryMedium }]}>
                <Text style={[styles.wordChipText, { color: colors.primary }]}>{word}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Strengths */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What you did well</Text>
        {score.strengths.map((strength, index) => (
          <View key={index} style={[styles.feedbackCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.feedbackIcon}>{'✅'}</Text>
            <Text style={[styles.feedbackText, { color: colors.textPrimary }]}>{strength}</Text>
          </View>
        ))}
      </View>

      {/* Improvements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Here's how to improve</Text>
        {score.improvements.map((improvement, index) => (
          <View key={index} style={[styles.feedbackCard, styles.improvementCard, { backgroundColor: colors.secondaryLight, borderColor: colors.border }]}>
            <Text style={styles.feedbackIcon}>{'💡'}</Text>
            <Text style={[styles.feedbackText, { color: colors.textPrimary }]}>{improvement}</Text>
          </View>
        ))}
      </View>

      {/* Encouragement */}
      <View style={[styles.encouragementCard, { backgroundColor: colors.primarySubtle }]}>
        <Text style={[styles.encouragementText, { color: colors.primary }]}>
          Remember: this is an estimate, not an official score. Practice regularly and you will see improvement!
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
          onPress={onPracticeAgain}
          accessibilityRole="button"
          accessibilityLabel="Practice again"
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Practice again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: accentColor }]}
          onPress={onContinueToDaily}
          accessibilityRole="button"
          accessibilityLabel="Continue to daily practice"
        >
          <Text style={[styles.secondaryButtonText, { color: accentColor }]}>
            Continue to daily practice
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── DimensionBar Sub-Component ────────────────────────────────────────────────

interface DimensionBarProps {
  dimension: DimensionScore;
  accentColor: string;
  themeColors: ThemeColors;
}

function DimensionBar({ dimension, accentColor, themeColors }: DimensionBarProps) {
  const levelColors: Record<string, string> = {
    Developing: themeColors.secondary,
    Competent: themeColors.primary,
    Strong: modeColors.ielts.accent,
  };

  return (
    <View style={styles.dimensionRow}>
      <View style={styles.dimensionHeader}>
        <Text style={[styles.dimensionLabel, { color: themeColors.textPrimary }]}>{dimension.label}</Text>
        <Text style={[styles.dimensionLevel, { color: levelColors[dimension.level] ?? accentColor }]}>
          {dimension.level}
        </Text>
      </View>
      <View style={[styles.dimensionBarTrack, { backgroundColor: themeColors.border }]}>
        <View
          style={[
            styles.dimensionBarFill,
            {
              width: `${dimension.percentage}%`,
              backgroundColor: levelColors[dimension.level] ?? accentColor,
            },
          ]}
        />
      </View>
      <Text style={[styles.dimensionComment, { color: themeColors.textSecondary }]}>{dimension.comment}</Text>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  scoreHeader: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  scoreTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
  },
  scoreSubtitle: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    maxWidth: '90%',
  },
  bandScoreCard: {
    borderWidth: 2,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  bandScoreLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  bandScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight,
    lineHeight: typography.subheading.lineHeight,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wordChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  wordChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  improvementCard: {
    // backgroundColor and borderColor are set inline
  },
  feedbackIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  feedbackText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    flex: 1,
  },
  encouragementCard: {
    borderRadius: radii.md,
    padding: spacing.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
  },
  buttonArea: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  primaryButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  secondaryButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  dimensionRow: {
    marginBottom: spacing.md,
  },
  dimensionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dimensionLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  dimensionLevel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  dimensionBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  dimensionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dimensionComment: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
});