/**
 * Skeleton Screens — Loading placeholders for API calls and scene transitions.
 *
 * Uses warm, encouraging styling that matches the app's design language.
 * No jarring or technical loading indicators.
 */

import { View, Animated, StyleSheet, type DimensionValue } from 'react-native';
import { useEffect, useRef } from 'react';
import { colors, spacing, radii } from '../constants/theme';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface SkeletonBaseProps {
  /** Width of the skeleton element */
  width: number | string;
  /** Height of the skeleton element */
  height: number;
  /** Border radius (default: radii.sm) */
  borderRadius?: number;
  /** Margin bottom (default: spacing.sm) */
  marginBottom?: number;
  /** Whether to animate the skeleton (default: true) */
  animate?: boolean;
}

/**
 * Base skeleton element with pulse animation.
 * Respects reduce motion preference.
 */
export function SkeletonBase({
  width,
  height,
  borderRadius = radii.sm,
  marginBottom = spacing.sm,
  animate = true,
}: SkeletonBaseProps) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (!animate || reduceMotion) {
      opacityAnim.setValue(0.5);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [animate, reduceMotion, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as DimensionValue,
          height,
          borderRadius,
          marginBottom,
          opacity: opacityAnim,
        },
      ]}
    />
  );
}

/**
 * Scene loading skeleton.
 * Shows a placeholder while scene data is being fetched.
 */
export function SceneSkeleton() {
  return (
    <View style={styles.container}>
      {/* Mode badge skeleton */}
      <SkeletonBase width={80} height={24} borderRadius={radii.full} />

      {/* Scene title skeleton */}
      <View style={styles.titleRow}>
        <SkeletonBase width="60%" height={28} />
      </View>

      {/* Scene illustration skeleton */}
      <SkeletonBase width="100%" height={200} borderRadius={radii.lg} marginBottom={spacing.md} />

      {/* Dialogue text skeleton */}
      <SkeletonBase width="90%" height={16} />
      <SkeletonBase width="70%" height={16} />

      {/* Word chips skeleton */}
      <View style={styles.chipRow}>
        <SkeletonBase width={70} height={32} borderRadius={radii.full} marginBottom={0} />
        <SkeletonBase width={85} height={32} borderRadius={radii.full} marginBottom={0} />
        <SkeletonBase width={60} height={32} borderRadius={radii.full} marginBottom={0} />
      </View>

      {/* CTA button skeleton */}
      <SkeletonBase width="100%" height={48} borderRadius={radii.sm} />
    </View>
  );
}

/**
 * Conversation loading skeleton.
 * Shows a placeholder while conversation messages are loading.
 */
export function ConversationSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.headerRow}>
        <SkeletonBase width={60} height={14} marginBottom={0} />
        <SkeletonBase width={36} height={36} borderRadius={radii.full} marginBottom={0} />
      </View>

      {/* Partner messages skeleton */}
      <View style={styles.messageRow}>
        <SkeletonBase width={36} height={36} borderRadius={radii.full} marginBottom={0} />
        <View style={styles.messageBubbles}>
          <SkeletonBase width="75%" height={16} />
          <SkeletonBase width="55%" height={16} />
        </View>
      </View>

      {/* Mic area skeleton */}
      <View style={styles.micArea}>
        <SkeletonBase width={64} height={64} borderRadius={radii.full} marginBottom={0} />
      </View>
    </View>
  );
}

/**
 * History/My Words empty state skeleton.
 */
export function EmptyStateSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <View style={styles.emptyIconInner} />
      </View>
      <View style={styles.emptyContent}>
        <View style={styles.emptyTitleBar} />
        <View style={styles.emptySubtitleBar} />
      </View>
      <View style={styles.emptyTextContent}>
        {/* Use actual text for screen readers */}
        {/* The skeleton is visual-only, actual empty state uses text */}
      </View>
    </View>
  );
}

/**
 * History empty state.
 */
export function HistoryEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <View style={styles.emptyIconInner} />
      </View>
      <View style={styles.emptyContent}>
        <View style={styles.emptyTitleBar} />
        <View style={styles.emptySubtitleBar} />
      </View>
    </View>
  );
}

/**
 * My Words empty state.
 */
export function MyWordsEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyWordsIcon}>
        <View style={styles.emptyIconInner} />
      </View>
      <View style={styles.emptyContent}>
        <View style={styles.emptyTitleBar} />
        <View style={styles.emptySubtitleBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  titleRow: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  messageBubbles: {
    flex: 1,
    gap: spacing.xs,
  },
  micArea: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  skeletonBase: {
    backgroundColor: colors.light.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['3xl'],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['3xl'],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyWordsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.border,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitleBar: {
    width: 180,
    height: 22,
    borderRadius: radii.sm,
    backgroundColor: colors.light.border,
    marginBottom: spacing.sm,
  },
  emptySubtitleBar: {
    width: 240,
    height: 16,
    borderRadius: radii.sm,
    backgroundColor: colors.light.border,
  },
  emptyTextContent: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});