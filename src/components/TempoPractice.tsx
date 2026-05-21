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
import { typography, spacing, radii } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors } = useTheme();
  const { tempoSupportLevel, setTempoSupportLevel, toastMessage } = useSessionStore();
  const [showDescription, setShowDescription] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentLevel = SUPPORT_LEVELS.find((l) => l.key === tempoSupportLevel) ?? SUPPORT_LEVELS[0];

  const cycleLevel = () => {
    const currentIndex = SUPPORT_LEVELS.findIndex((l) => l.key === tempoSupportLevel);
    const nextIndex = (currentIndex + 1) % SUPPORT_LEVELS.length;
    const nextLevel = SUPPORT_LEVELS[nextIndex];
    if (nextLevel) setTempoSupportLevel(nextLevel.key);
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
        style={[tempoStyles.toggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={cycleLevel}
        onLongPress={() => setShowDescription(!showDescription)}
        accessibilityLabel={`Support level: ${currentLevel.label}. Tap to change.`}
        accessibilityRole="button"
      >
        <Text style={tempoStyles.toggleIcon}>{currentLevel.icon}</Text>
        <Text style={[tempoStyles.toggleLabel, { color: colors.textSecondary }]}>{currentLevel.label}</Text>
      </TouchableOpacity>

      {/* Description tooltip */}
      {showDescription && (
        <View style={[tempoStyles.descriptionTooltip, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
          <Text style={[tempoStyles.descriptionTitle, { color: colors.textPrimary }]}>Support Level: {currentLevel.label}</Text>
          <Text style={[tempoStyles.descriptionText, { color: colors.textSecondary }]}>{currentLevel.description}</Text>
          <Text style={[tempoStyles.descriptionHint, { color: colors.textMuted }]}>Tap to cycle. Long-press for details.</Text>
        </View>
      )}

      {/* Toast notification for level change */}
      {toastMessage && (
        <Animated.View style={[tempoStyles.toast, { backgroundColor: colors.surface, borderColor: colors.primary, opacity: fadeAnim }]}>
          <Text style={[tempoStyles.toastText, { color: colors.primary }]}>{toastMessage}</Text>
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
    borderWidth: 1,
  },
  toggleIcon: {
    fontSize: 14,
  },
  toggleLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
  },
  descriptionTooltip: {
    position: 'absolute' as const,
    top: 44,
    right: 0,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    width: 260,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
  },
  descriptionTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginBottom: spacing.sm,
  },
  descriptionHint: {
    fontSize: typography.caption.fontSize,
    fontStyle: 'italic' as const,
  },
  toast: {
    position: 'absolute' as const,
    top: 50,
    left: '50%' as const,
    transform: [{ translateX: -130 }],
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    width: 260,
    zIndex: 200,
  },
  toastText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
};