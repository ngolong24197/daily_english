/**
 * OnboardingEasing — First-time user experience for the "How was your day?" check-in.
 *
 * New users see a step-by-step introduction instead of jumping straight into speaking.
 * Steps:
 *  1. Friendly greeting: "Hi! I'm Daily English. Let's practice speaking together."
 *  2. "You can always type instead of speaking — no pressure!" (shows text input option)
 *  3. "Try tapping an emoji to start" (highlights emoji buttons)
 *  4. "Great! Now let's try speaking. Tap the mic when you're ready." (highlights mic button)
 *  5. Full experience unlocked — next visit goes straight to check-in
 *
 * Onboarding progress is stored in MMKV so it persists across sessions.
 * On steps 1-3, the mic is skipped entirely (text and emoji only).
 */

import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { typography, spacing, radii } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { storage } from '../lib/storage';

const ONBOARDING_STEP_KEY = 'onboarding_easing_step';
const ONBOARDING_COMPLETE_KEY = 'onboarding_easing_complete';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface OnboardingEasingProps {
  onComplete: () => void;
  onStep3Select: (moodKey: string) => void;
  onStep4MicPress: () => void;
}

const STEPS: Record<OnboardingStep, {
  title: string;
  message: string;
  action?: string;
}> = {
  1: {
    title: 'Welcome!',
    message: "Hi! I'm Daily English. Let's practice speaking together.",
    action: "Let's start",
  },
  2: {
    title: 'No pressure',
    message: "You can always type instead of speaking — no pressure! Tap the text option anytime.",
    action: 'Got it',
  },
  3: {
    title: 'How are you feeling?',
    message: "Try tapping an emoji to tell me how your day was.",
    action: undefined, // Emoji selection handles this
  },
  4: {
    title: 'Try speaking',
    message: "Great! Now let's try speaking. Tap the mic when you're ready.",
    action: undefined, // Mic press handles this
  },
  5: {
    title: "You're all set!",
    message: "Nice work! From now on, you'll go straight to your daily practice.",
    action: 'Start learning',
  },
};

/**
 * Get the current onboarding step (or 0 if complete).
 */
export function getOnboardingStep(): OnboardingStep | null {
  if (storage.getString(ONBOARDING_COMPLETE_KEY) === 'true') {
    return null;
  }
  const step = storage.getNumber(ONBOARDING_STEP_KEY);
  const valid = step && step >= 1 && step <= 5 ? step : 1;
  return valid as OnboardingStep;
}

/**
 * Check if onboarding is complete.
 */
export function isOnboardingComplete(): boolean {
  return storage.getString(ONBOARDING_COMPLETE_KEY) === 'true';
}

/**
 * Mark onboarding as complete.
 */
export function completeOnboarding(): void {
  storage.set(ONBOARDING_COMPLETE_KEY, 'true');
  storage.delete(ONBOARDING_STEP_KEY);
}

/**
 * Save the current onboarding step.
 */
export function saveOnboardingStep(step: OnboardingStep): void {
  storage.set(ONBOARDING_STEP_KEY, step);
}

export default function OnboardingEasing({ onComplete, onStep3Select, onStep4MicPress }: OnboardingEasingProps) {
  const { colors } = useTheme();
  const [step, setStep] = useState<OnboardingStep>(() => {
    const saved = storage.getNumber(ONBOARDING_STEP_KEY);
    const valid = saved && saved >= 1 && saved <= 5 ? saved : 1;
    return valid as OnboardingStep;
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entrance animation on each step
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const advance = (nextStep: OnboardingStep) => {
    setStep(nextStep);
    saveOnboardingStep(nextStep);

    if (nextStep === 5) {
      // Will complete after the user taps "Start learning"
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    onComplete();
  };

  const currentStep = STEPS[step] ?? STEPS[1];

  // Step 3: Emoji selection
  if (step === 3) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.emojiSection}>
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{currentStep.title}</Text>
          <Text style={[styles.stepMessage, { color: colors.textSecondary }]}>{currentStep.message}</Text>
          <View style={styles.emojiRow}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.key}
                style={[styles.emojiButton, { backgroundColor: colors.surface, borderColor: colors.primary }]}
                onPress={() => {
                  onStep3Select(mood.key);
                  advance(4);
                }}
                accessibilityLabel={`${mood.label} — select this mood`}
                accessibilityRole="button"
              >
                <Text style={styles.emojiText}>{mood.emoji}</Text>
                <Text style={[styles.emojiLabel, { color: colors.textSecondary }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.tapHint, { color: colors.textMuted }]}>Tap any emoji above</Text>
        </View>
      </Animated.View>
    );
  }

  // Step 4: Mic button highlighted
  if (step === 4) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.micSection}>
          <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{currentStep.title}</Text>
          <Text style={[styles.stepMessage, { color: colors.textSecondary }]}>{currentStep.message}</Text>
          <TouchableOpacity
            style={[styles.micHighlightButton, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}
            onPress={() => {
              onStep4MicPress();
              advance(5);
            }}
            accessibilityLabel="Tap to start speaking"
            accessibilityRole="button"
          >
            <Text style={[styles.micHighlightIcon, { color: colors.onPrimary }]}>{'\u{1F3A4}'}</Text>
            <Text style={[styles.micHighlightLabel, { color: colors.onPrimary }]}>Tap to speak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipMicButton}
            onPress={() => advance(5)}
            accessibilityLabel="Skip speaking for now"
            accessibilityRole="button"
          >
            <Text style={[styles.skipMicText, { color: colors.textMuted }]}>I'll type instead</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Steps 1, 2, 5: Info screens with action button
  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.bg, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.infoSection}>
        <Text style={styles.stepEmoji}>
          {step === 1 ? '\u{1F44B}' : step === 2 ? '\u{1F4DD}' : '\u{2705}'}
        </Text>
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{currentStep.title}</Text>
        <Text style={[styles.stepMessage, { color: colors.textSecondary }]}>{currentStep.message}</Text>
        {currentStep.action && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              const nextStep = (step + 1) as OnboardingStep;
              advance(nextStep);
            }}
            accessibilityLabel={currentStep.action}
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText, { color: colors.onPrimary }]}>{currentStep.action}</Text>
          </TouchableOpacity>
        )}
        {step === 2 && (
          <View style={[styles.textOptionPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.textOptionIcon, { color: colors.textMuted }]}>{'\u{2328}'}</Text>
            <Text style={[styles.textOptionLabel, { color: colors.textMuted }]}>Type your response</Text>
          </View>
        )}
      </View>
      {step === 5 && (
        <TouchableOpacity
          style={[styles.completeButton, { backgroundColor: colors.primary }]}
          onPress={handleComplete}
          accessibilityLabel="Start learning"
          accessibilityRole="button"
        >
          <Text style={[styles.completeButtonText, { color: colors.onPrimary }]}>Start learning</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const MOODS = [
  { key: 'good', emoji: '\u{1F60A}', label: 'Good' },
  { key: 'okay', emoji: '\u{1F610}', label: 'Okay' },
  { key: 'rough', emoji: '\u{1F62B}', label: 'Rough' },
  { key: 'focused', emoji: '\u{1F3AF}', label: 'Focused' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    alignItems: 'center',
    maxWidth: 340,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    lineHeight: typography.heading.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepMessage: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  textOptionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  textOptionIcon: {
    fontSize: 18,
  },
  textOptionLabel: {
    fontSize: typography.caption.fontSize,
  },
  emojiSection: {
    alignItems: 'center',
    maxWidth: 340,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  emojiButton: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emojiText: {
    fontSize: 28,
    marginBottom: 2,
  },
  emojiLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  tapHint: {
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic',
  },
  micSection: {
    alignItems: 'center',
    maxWidth: 340,
  },
  micHighlightButton: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  micHighlightIcon: {
    fontSize: 32,
  },
  micHighlightLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  skipMicButton: {
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  skipMicText: {
    fontSize: typography.caption.fontSize,
    textDecorationLine: 'underline',
  },
  completeButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 240,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  completeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
});