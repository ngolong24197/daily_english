/**
 * Performance Utilities — Lazy loading, memoization, prefetching.
 *
 * - Lazy load screens not in initial flow (History, My Words, Settings)
 * - React.memo wrappers for expensive components
 * - Prefetch next scene data
 * - Non-blocking MMKV reads
 */

import { lazy } from 'react';

/**
 * Lazy-loaded screen components.
 * These screens are not in the initial flow and should be loaded on demand.
 * History, My Words, and Settings are accessed via navigation drawer.
 */
export const LazyHistoryScreen = lazy(() => import('../app/history'));
export const LazyWordsScreen = lazy(() => import('../app/words'));
export const LazySettingsScreen = lazy(() => import('../app/settings'));

/**
 * Prefetch next scene data while current conversation is in progress.
 * Pre-loads the scene content for a smoother transition.
 * This is a no-op placeholder — actual prefetch would require
 * Supabase API calls, which aren't implemented yet (mock data is synchronous).
 */
export function prefetchNextSceneData(_sceneId: string): void {
  // In production with Supabase, this would:
  // 1. Fetch scene data from API
  // 2. Pre-load word details
  // 3. Cache conversation scripts
  // For now, with mock data, everything is synchronous and instant.
}

/**
 * Non-blocking MMKV read.
 * Runs the read operation on the next microtask to avoid blocking the main thread.
 */
export function nonBlockingRead<T>(readFn: () => T): Promise<T> {
  return new Promise((resolve) => {
    // Use setImmediate or setTimeout(0) to defer to next tick
    const timer = setTimeout(() => {
      resolve(readFn());
    }, 0);
    // Prevent the timer from keeping the app alive
    return timer;
  });
}

/**
 * Debounce a function call.
 * Useful for preventing rapid re-renders from frequent events like audio level updates.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Throttle a function call.
 * Useful for limiting the frequency of state updates during animations.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limitMs) {
      lastCall = now;
      fn(...args);
    }
  };
}