/**
 * useEntranceAnimation — Hook for screen entrance animations.
 *
 * Provides fade-in and slide-up entrance animations for screens.
 * Respects the user's reduce motion preference.
 */

import { useRef } from 'react';
import { Animated } from 'react-native';
import { useAnimationConfig } from './useReduceMotion';

/**
 * Hook that provides entrance animation values for screen components.
 * Returns animated style objects for fade-in and slide-up effects.
 *
 * Usage:
 * ```tsx
 * const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
 * // In component:
 * <Animated.View style={[styles.container, fadeIn, slideUp]}>
 * ```
 */
export function useEntranceAnimation() {
  const { shouldAnimate, entranceDuration, slideDuration } = useAnimationConfig();

  const fadeAnim = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(shouldAnimate ? 20 : 0)).current;

  const fadeIn = {
    opacity: fadeAnim,
  };

  const slideUp = {
    transform: [{ translateY: slideAnim }],
  };

  const playEntrance = () => {
    if (!shouldAnimate) return;

    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: entranceDuration,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: slideDuration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    fadeIn,
    slideUp,
    playEntrance,
  };
}