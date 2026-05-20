/**
 * TimedPractice — Countdown timer for exam mode.
 *
 * Features:
 * - Countdown timer display (configurable duration)
 * - Visual warning when time is running low (last 30s: amber, last 10s: red)
 * - "Prepare your answer" phase (1 min for IELTS Part 2) with countdown
 * - "Speak now" phase with recording indicator
 * - "Time's up" signal with gentle tone
 * - Pause/resume for practice mode
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { colors, typography, spacing, radii } from '../constants/theme';

type TimerPhase = 'prep' | 'speak' | 'complete';

interface TimedPracticeProps {
  /** Total time for the speaking phase in seconds */
  durationSeconds: number;
  /** Prep time in seconds (0 for no prep phase) */
  prepTimeSeconds?: number;
  /** Phase to start in */
  initialPhase?: TimerPhase;
  /** Whether this is practice mode (allows pause/resume) */
  isPracticeMode?: boolean;
  /** Label for the phase ("Prepare your answer" or "Speak now") */
  phaseLabel?: string;
  /** Callback when timer completes */
  onTimerComplete?: () => void;
  /** Callback when prep phase ends */
  onPrepComplete?: () => void;
  /** Callback when timer ticks */
  onTick?: (remainingSeconds: number) => void;
  /** Accent color for the timer */
  accentColor?: string;
}

export default function TimedPractice({
  durationSeconds,
  prepTimeSeconds = 0,
  initialPhase = 'prep',
  isPracticeMode = true,
  phaseLabel,
  onTimerComplete,
  onPrepComplete,
  onTick,
  accentColor = '#3A6A8F',
}: TimedPracticeProps) {
  const [phase, setPhase] = useState<TimerPhase>(
    prepTimeSeconds > 0 ? initialPhase : 'speak'
  );
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    prepTimeSeconds > 0 ? prepTimeSeconds : durationSeconds
  );
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine the effective duration based on phase
  const totalSeconds = phase === 'prep' ? (prepTimeSeconds ?? 0) : durationSeconds;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;

  // Timer tick
  useEffect(() => {
    if (isPaused || phase === 'complete') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        if (onTick) onTick(next);

        if (next <= 0) {
          // Phase completed
          if (phase === 'prep') {
            setPhase('speak');
            if (onPrepComplete) onPrepComplete();
            return durationSeconds;
          }
          // Speaking phase completed
          setPhase('complete');
          if (onTimerComplete) onTimerComplete();
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, phase, durationSeconds, onTimerComplete, onPrepComplete, onTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handlePauseResume = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (phase === 'complete') return accentColor;
    if (remainingSeconds <= 10) return '#D44'; // Red
    if (remainingSeconds <= 30) return '#C49564'; // Amber
    return accentColor;
  };

  const getPhaseText = (): string => {
    if (phaseLabel) return phaseLabel;
    if (phase === 'prep') return 'Prepare your answer';
    if (phase === 'speak') return 'Speak now';
    return "Time's up";
  };

  const getPhaseDescription = (): string => {
    if (phase === 'prep') {
      return 'Think about what you want to say. Organize your ideas before speaking.';
    }
    if (phase === 'speak') {
      return 'Start speaking. Take your time and express your ideas clearly.';
    }
    return 'Well done! You can review your response below.';
  };

  // Progress bar width (percentage)
  const progressPercent = Math.max(0, Math.min(100, progress * 100));

  return (
    <View style={styles.container}>
      {/* Phase label */}
      <Text style={[styles.phaseLabel, { color: accentColor }]}>
        {getPhaseText()}
      </Text>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerDisplay, { color: getTimerColor() }]}>
          {phase === 'complete' ? "Time's up" : formatTime(remainingSeconds)}
        </Text>

        {/* Progress bar */}
        {phase !== 'complete' && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: getTimerColor(),
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Phase description */}
      <Text style={styles.phaseDescription}>
        {getPhaseDescription()}
      </Text>

      {/* Recording indicator */}
      {phase === 'speak' && (
        <View style={styles.recordingIndicator}>
          <View style={[styles.recordingDot, { backgroundColor: getTimerColor() }]} />
          <Text style={styles.recordingText}>Recording</Text>
        </View>
      )}

      {/* Pause/resume button (practice mode only) */}
      {isPracticeMode && phase !== 'complete' && (
        <TouchableOpacity
          style={[styles.pauseButton, { borderColor: accentColor }]}
          onPress={handlePauseResume}
          accessibilityLabel={isPaused ? 'Resume timer' : 'Pause timer'}
          accessibilityRole="button"
        >
          <Text style={[styles.pauseButtonText, { color: accentColor }]}>
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  phaseLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    lineHeight: typography.subheading.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
  },
  progressTrack: {
    width: '80%',
    height: 4,
    backgroundColor: colors.light.border,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  phaseDescription: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.md,
    maxWidth: '90%',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  recordingText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    color: colors.light.textSecondary,
  },
  pauseButton: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pauseButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
});