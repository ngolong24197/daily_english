/**
 * useHaptics — Hook for haptic feedback on key interactions.
 *
 * Provides haptic feedback for:
 * - Word learned
 * - Conversation complete
 * - Mode switch
 * - Mic start/stop
 *
 * Respects the feature flag for haptic feedback.
 */

import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { APP_CONFIG } from '../constants/appConfig';

/**
 * Hook that provides haptic feedback functions.
 * Each function checks the feature flag before triggering haptics.
 */
export function useHaptics() {
  const impactLight = useCallback(() => {
    if (APP_CONFIG.haptics.micStart) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  const impactMedium = useCallback(() => {
    if (APP_CONFIG.haptics.wordLearned) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, []);

  const impactHeavy = useCallback(() => {
    if (APP_CONFIG.haptics.conversationComplete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }
  }, []);

  const notificationSuccess = useCallback(() => {
    if (APP_CONFIG.haptics.wordLearned) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, []);

  const notificationWarning = useCallback(() => {
    if (APP_CONFIG.haptics.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
  }, []);

  const selectionChanged = useCallback(() => {
    if (APP_CONFIG.haptics.modeSwitch) {
      Haptics.selectionAsync().catch(() => {});
    }
  }, []);

  return {
    /** Light impact — mic start/stop, button taps */
    impactLight,
    /** Medium impact — word learned, hint reveal */
    impactMedium,
    /** Heavy impact — conversation complete, major milestone */
    impactHeavy,
    /** Success notification — word mastered, session complete */
    notificationSuccess,
    /** Warning notification — errors (disabled by default per warm tone policy) */
    notificationWarning,
    /** Selection changed — mode switch, track selection */
    selectionChanged,
  };
}