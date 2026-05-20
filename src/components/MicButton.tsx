/**
 * MicButton Component — primary speaking input for conversations.
 *
 * - 64px circle, sage green
 * - States: idle, listening (pulsing animation), processing (loading spinner), error (shake + retry)
 * - Press to start recording, press again or wait for silence to stop
 * - Visual feedback during recording (ripple/pulse effect in sage green)
 * - Error states: permission denied, network error, speech not recognized
 * - Accessible: screen reader label, haptic feedback on state changes
 */

import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors, typography, spacing, radii } from '../constants/theme';
import type { RecordingState } from '../hooks/useAudioRecording';
import { MicButtonLabels } from '../utils/accessibility';
import { useHaptics } from '../hooks/useHaptics';

interface MicButtonProps {
  recordingState: RecordingState;
  audioLevel: number;
  onPress: () => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export default function MicButton({
  recordingState,
  audioLevel,
  onPress,
  disabled = false,
  errorMessage,
}: MicButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const haptics = useHaptics();
  const prevRecordingState = useRef<RecordingState>(recordingState);

  // Pulse animation during recording
  useEffect(() => {
    if (recordingState === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordingState, pulseAnim]);

  // Shake animation on error
  useEffect(() => {
    if (recordingState === 'error') {
      const shake = Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]);
      shake.start();

      // Auto-clear error after 3 seconds
      errorTimerRef.current = setTimeout(() => {
        shakeAnim.setValue(0);
      }, 3000);
      return () => {
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      };
    }
    shakeAnim.setValue(0);
  }, [recordingState, shakeAnim]);

  // Haptic feedback on state changes
  useEffect(() => {
    if (prevRecordingState.current !== recordingState) {
      if (recordingState === 'recording') {
        haptics.impactLight();
      } else if (recordingState === 'idle' && prevRecordingState.current === 'recording') {
        haptics.impactMedium();
      } else if (recordingState === 'error') {
        haptics.notificationWarning();
      }
      prevRecordingState.current = recordingState;
    }
  }, [recordingState]);

  const getAccessibilityLabel = (): string => {
    switch (recordingState) {
      case 'recording':
        return MicButtonLabels.recording;
      case 'processing':
        return MicButtonLabels.processing;
      case 'requesting_permission':
        return MicButtonLabels.permissionDenied;
      case 'error':
        return errorMessage ?? MicButtonLabels.error;
      case 'idle':
      default:
        return MicButtonLabels.idle;
    }
  };

  const getButtonColor = (): string => {
    switch (recordingState) {
      case 'recording':
        return colors.light.primary;
      case 'processing':
        return colors.light.secondary;
      case 'error':
        return colors.light.secondary;
      case 'requesting_permission':
        return colors.light.textMuted;
      case 'idle':
      default:
        return colors.light.primary;
    }
  };

  const getIconContent = (): string => {
    switch (recordingState) {
      case 'recording':
        return '\u{1F534}'; // Red circle = stop indicator
      case 'processing':
        return '\u{23F3}'; // Hourglass = processing
      case 'error':
        return '\u{21BB}'; // Retry arrow
      case 'requesting_permission':
        return '\u{1F399}'; // Mic with line
      case 'idle':
      default:
        return '\u{1F3A4}'; // Microphone
    }
  };

  const isDisabled =
    disabled ||
    recordingState === 'processing' ||
    recordingState === 'requesting_permission';

  return (
    <View style={styles.container}>
      {/* Audio level indicator (waveform-like glow during recording) */}
      {recordingState === 'recording' && audioLevel > 0 && (
        <View
          style={[
            styles.audioGlow,
            {
              width: 64 + audioLevel * 32,
              height: 64 + audioLevel * 32,
              borderRadius: (64 + audioLevel * 32) / 2,
              opacity: 0.15 + audioLevel * 0.25,
            },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [
              { scale: pulseAnim },
              { translateX: shakeAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: getButtonColor() },
            isDisabled && styles.buttonDisabled,
          ]}
          onPress={onPress}
          disabled={isDisabled}
          accessibilityLabel={getAccessibilityLabel()}
          accessibilityRole="button"
          activeOpacity={0.7}
        >
          <Text style={styles.icon}>{getIconContent()}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Label below button */}
      <Text style={styles.label}>
        {recordingState === 'recording'
          ? 'Listening...'
          : recordingState === 'processing'
            ? 'Processing...'
            : recordingState === 'error'
              ? 'Try again'
              : 'Tap to speak'}
      </Text>

      {/* "I'm done" button during recording */}
      {recordingState === 'recording' && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onPress}
          accessibilityLabel="I'm done speaking"
          accessibilityRole="button"
        >
          <Text style={styles.doneButtonText}>I'm done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  animatedContainer: {
    alignItems: 'center' as const,
  },
  audioGlow: {
    position: 'absolute' as const,
    backgroundColor: colors.light.primary,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  label: {
    fontSize: typography.micLabel.fontSize,
    fontWeight: typography.micLabel.fontWeight as any,
    color: colors.light.textMuted,
    marginTop: spacing.xs,
    lineHeight: typography.micLabel.lineHeight,
  },
  doneButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.light.secondary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  doneButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500' as any,
    color: colors.light.textPrimary,
  },
});