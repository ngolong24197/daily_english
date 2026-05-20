/**
 * TempoPractice — Support level toggle for conversation scaffolding.
 *
 * This component provides:
 * - A small toggle in the conversation header to cycle support levels
 * - A toast notification when support level changes
 * - Visual indicators for the current support level
 * - Support level affects how much help the user gets:
 *   High: Text visible, audio hints, longer pauses, prompt shown
 *   Medium: Audio hints only, no text overlay, normal pauses
 *   None: Standard conversation, no hints automatically shown
 */

import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import type { TempoSupportLevel } from '@/stores/sessionStore';

const SUPPORT_LEVELS: { key: TempoSupportLevel; label: string; icon: string; description: string }[] = [
  { key: 'high', label: 'High', icon: '\u{1F4DD}', description: 'Text visible, audio hints, longer pauses' },
  { key: 'medium', label: 'Medium', icon: '\u{1F50A}', description: 'Audio hints only, normal pauses' },
  { key: 'none', label: 'None', icon: '\u{26A1}', description: 'Standard conversation, no extra support' },
];

interface TempoPracticeProps {
  /** Whether to show the support level toggle */
  visible: boolean;
}

export default function TempoPractice({ visible }: TempoPracticeProps) {
  const { tempoSupportLevel, setTempoSupportLevel, toastMessage } = useSessionStore();
  const [showDescription, setShowDescription] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentLevel = SUPPORT_LEVELS.find((l) => l.key === tempoSupportLevel) ?? SUPPORT_LEVELS[0];

  const cycleLevel = () => {
    const currentIndex = SUPPORT_LEVELS.findIndex((l) => l.key === tempoSupportLevel);
    const nextIndex = (currentIndex + 1) % SUPPORT_LEVELS.length;
    setTempoSupportLevel(SUPPORT_LEVELS[nextIndex].key);
  };

  // Animate toast in/out
  useEffect(() => {
    if (toastMessage) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2200);
      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [toastMessage]);

  if (!visible) return null;

  return (
    <>
      {/* Support level toggle button */}
      <TouchableOpacity
        style={tempoStyles.toggleButton}
        onPress={cycleLevel}
        onLongPress={() => setShowDescription(!showDescription)}
        accessibilityLabel={`Support level: ${currentLevel.label}. Tap to change.`}
        accessibilityRole="button"
      >
        <Text style={tempoStyles.toggleIcon}>{currentLevel.icon}</Text>
        <Text style={tempoStyles.toggleLabel}>{currentLevel.label}</Text>
      </TouchableOpacity>

      {/* Description tooltip */}
      {showDescription && (
        <View style={tempoStyles.descriptionTooltip}>
          <Text style={tempoStyles.descriptionTitle}>Support Level: {currentLevel.label}</Text>
          <Text style={tempoStyles.descriptionText}>{currentLevel.description}</Text>
          <Text style={tempoStyles.descriptionHint}>Tap to cycle. Long-press for details.</Text>
        </View>
      )}

      {/* Toast notification for level change */}
      {toastMessage && (
        <Animated.View style={[tempoStyles.toast, { opacity: fadeAnim }]}>
          <Text style={tempoStyles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </>
  );
}

/**
 * Get the tempo configuration based on the current support level.
 * Used by ConversationScreen to adjust behavior.
 */
export function getTempoConfig(level: TempoSupportLevel) {
  switch (level) {
    case 'high':
      return {
        showPartnerText: true,
        showSuggestedResponses: true,
        hintAutoAppearMs: 5000,
        pauseBeforeResponseMs: 2000,
        showAudioReplay: true,
        level: 'high' as TempoSupportLevel,
      };
    case 'medium':
      return {
        showPartnerText: false,
        showSuggestedResponses: false,
        hintAutoAppearMs: 8000,
        pauseBeforeResponseMs: 1000,
        showAudioReplay: true,
        level: 'medium' as TempoSupportLevel,
      };
    case 'none':
    default:
      return {
        showPartnerText: false,
        showSuggestedResponses: false,
        hintAutoAppearMs: null, // No auto-appear
        pauseBeforeResponseMs: 0,
        showAudioReplay: false,
        level: 'none' as TempoSupportLevel,
      };
  }
}

const tempoStyles = {
  toggleButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  toggleIcon: {
    fontSize: 14,
  },
  toggleLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    color: colors.light.textSecondary,
  },
  descriptionTooltip: {
    position: 'absolute' as const,
    top: 44,
    right: 0,
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  descriptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.light.textPrimary,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm,
  },
  descriptionHint: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    fontStyle: 'italic' as const,
  },
  toast: {
    position: 'absolute' as const,
    top: 50,
    left: '50%' as const,
    transform: [{ translateX: -130 }],
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.primary,
    width: 260,
    zIndex: 200,
  },
  toastText: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
};