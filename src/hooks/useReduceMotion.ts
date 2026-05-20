/**
 * useReduceMotion — Hook to check if the user prefers reduced motion.
 *
 * Returns true if AccessibilityInfo.isReduceMotionEnabled() returns true.
 * Components should check this and disable animations when true.
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Hook to check the user's reduce motion preference.
 * Returns true when the user has enabled "Reduce Motion" in device settings.
 *
 * Usage:
 * ```tsx
 * const reduceMotion = useReduceMotion();
 * if (reduceMotion) {
 *   // Skip animations, use simple transitions
 * } else {
 *   // Use full animations
 * }
 * ```
 */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial value
    const checkReduceMotion = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceMotionEnabled();
        setReduceMotion(enabled);
      } catch {
        // Default to false if we can't check
        setReduceMotion(false);
      }
    };

    checkReduceMotion();

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled: boolean) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      // Remove listener on cleanup
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  return reduceMotion;
}

/**
 * Hook that returns animation configuration based on reduce motion preference.
 * Returns appropriate durations and whether to animate at all.
 */
export function useAnimationConfig() {
  const reduceMotion = useReduceMotion();

  return {
    shouldAnimate: !reduceMotion,
    /** Duration for entrance animations (ms) */
    entranceDuration: reduceMotion ? 0 : 300,
    /** Duration for exit animations (ms) */
    exitDuration: reduceMotion ? 0 : 200,
    /** Duration for pulse animations (ms) */
    pulseDuration: reduceMotion ? 0 : 600,
    /** Duration for slide animations (ms) */
    slideDuration: reduceMotion ? 0 : 400,
    /** Whether to use spring animations */
    useSpring: !reduceMotion,
  };
}