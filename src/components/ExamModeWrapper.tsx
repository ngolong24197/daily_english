/**
 * ExamModeWrapper — Wraps conversation and review screens when isExamMode is true.
 *
 * Adds:
 * - Persistent "IELTS Practice" or "TOEIC Practice" banner at the top
 * - Formal visual tone with structured layout
 * - Timer display (configurable)
 * - "Formal Mode" indicator
 */

import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing, radii, modeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import type { ModeCode } from '../types';

interface ExamModeWrapperProps {
  modeCode: ModeCode;
  /** Timer display in seconds, or null to hide */
  timerSeconds?: number | null;
  /** Current part/step label, e.g., "Part 1 of 2" */
  partLabel?: string;
  /** Whether to show the formal mode indicator */
  showFormalIndicator?: boolean;
  children: React.ReactNode;
}

export default function ExamModeWrapper({
  modeCode,
  timerSeconds,
  partLabel,
  showFormalIndicator = true,
  children,
}: ExamModeWrapperProps) {
  const { colors } = useTheme();
  const isIELTS = modeCode === 'ielts';
  const examLabel = isIELTS ? 'IELTS Practice' : 'TOEIC Practice';
  const accentColor = isIELTS ? modeColors.ielts.accent : modeColors.toeic.accent;

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (seconds: number): string => {
    if (seconds <= 10) return colors.danger; // Red for last 10 seconds
    if (seconds <= 30) return colors.secondary; // Amber for last 30 seconds
    return accentColor;
  };

  return (
    <View style={styles.container}>
      {/* Exam Banner */}
      <View style={[styles.banner, { backgroundColor: isIELTS ? modeColors.ielts.accentSurface : modeColors.toeic.accentSurface }]}>
        <View style={styles.bannerLeft}>
          <Text style={[styles.bannerLabel, { color: accentColor }]}>
            {examLabel}
          </Text>
          {showFormalIndicator && (
            <Text style={[styles.formalIndicator, { color: accentColor, backgroundColor: colors.overlayLight }]}>
              Formal Mode
            </Text>
          )}
        </View>

        <View style={styles.bannerRight}>
          {partLabel && (
            <Text style={[styles.partLabel, { color: accentColor }]}>
              {partLabel}
            </Text>
          )}
          {timerSeconds != null && timerSeconds > 0 && (
            <Text style={[styles.timer, { color: getTimerColor(timerSeconds) }]}>
              {formatTimer(timerSeconds)}
            </Text>
          )}
        </View>
      </View>

      {/* Accent line */}
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bannerLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    lineHeight: typography.subheading.lineHeight,
  },
  formalIndicator: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    lineHeight: typography.caption.lineHeight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    lineHeight: typography.caption.lineHeight,
  },
  timer: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: typography.heading.lineHeight,
    letterSpacing: 1,
  },
  accentLine: {
    height: 2,
    width: '100%',
  },
  content: {
    flex: 1,
  },
});