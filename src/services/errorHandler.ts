/**
 * Centralized Error Handler — Warm, encouraging error messages.
 *
 * Error states never show technical messages or error codes to users.
 * All error messages use warm, encouraging tone — no red colors, no "Error" labels.
 * Logs errors to console for debugging (removed in production builds).
 */

import { Platform } from 'react-native';

const IS_PRODUCTION = __DEV__ === false;

/**
 * Error types that map to user-friendly messages.
 */
export type AppErrorType =
  | 'network'
  | 'asr_failure'
  | 'asr_consecutive_failure'
  | 'api_timeout'
  | 'subscription_check'
  | 'conversation_engine'
  | 'permission_mic'
  | 'permission_general'
  | 'storage'
  | 'unknown';

/**
 * Warm, encouraging error messages for each error type.
 * Never technical, never uses "Error" label, never red-colored in UI.
 */
const WARM_MESSAGES: Record<AppErrorType, string> = {
  network: "I can't hear you right now — let's use text for this one.",
  asr_failure: "No worries! Try again, or type your response below.",
  asr_consecutive_failure: "I'll use text for now — we can try speaking again later!",
  api_timeout: "Taking a moment to think... let's try again.",
  subscription_check: "Let's keep going — I'll check your plan later.",
  conversation_engine: "Something went wrong. Let's start fresh.",
  permission_mic: "Speaking practice needs your microphone. You can type instead!",
  permission_general: "We need a quick permission to continue. You can also type instead.",
  storage: "Let me save that for next time.",
  unknown: "Let's try that again.",
};

/**
 * Secondary messages for repeated errors (shown on 2nd+ occurrence).
 */
const WARM_MESSAGES_REPEAT: Record<AppErrorType, string> = {
  network: "Still having trouble connecting — let's use text for now.",
  asr_failure: "No worries at all! Let's type your response this time.",
  asr_consecutive_failure: "I'll stick with text for now. You can try the mic anytime!",
  api_timeout: "Taking longer than expected — let's give it another go.",
  subscription_check: "Let's keep going with what we have.",
  conversation_engine: "Let's try a fresh start.",
  permission_mic: "No problem! You can type your responses instead.",
  permission_general: "You can always type instead of speaking.",
  storage: "Your progress is safe — let's continue.",
  unknown: "Let's give it another try.",
};

/**
 * Get a warm, user-friendly error message.
 * @param type - The error type
 * @param isRepeat - Whether this is a repeated occurrence
 */
export function getWarmErrorMessage(type: AppErrorType, isRepeat: boolean = false): string {
  if (isRepeat) {
    return WARM_MESSAGES_REPEAT[type] ?? WARM_MESSAGES_REPEAT.unknown;
  }
  return WARM_MESSAGES[type] ?? WARM_MESSAGES.unknown;
}

/**
 * Log an error for debugging.
 * In production, this is a no-op.
 * In development, logs to console with context.
 */
export function logError(context: string, error: unknown, extra?: Record<string, unknown>): void {
  if (IS_PRODUCTION) return;

  const errorInfo = error instanceof Error
    ? { message: error.message, stack: error.stack }
    : { value: String(error) };

  console.warn(`[DailyEnglish] ${context}`, {
    ...errorInfo,
    ...extra,
  });
}

/**
 * Determine the error type from a caught error.
 * Useful for converting API/network errors into user-friendly messages.
 */
export function classifyError(error: unknown): AppErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('internet') ||
      message.includes('econnrefused') ||
      message.includes('econnreset')
    ) {
      return 'network';
    }

    // Timeout errors
    if (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('abort')
    ) {
      return 'api_timeout';
    }

    // Permission errors
    if (
      message.includes('permission') ||
      message.includes('denied') ||
      message.includes('not authorized')
    ) {
      return 'permission_mic';
    }

    // Storage errors
    if (
      message.includes('mmkv') ||
      message.includes('storage') ||
      message.includes('persist') ||
      message.includes('localStorage')
    ) {
      return 'storage';
    }
  }

  return 'unknown';
}

/**
 * Track consecutive error counts per type.
 * Used to determine when to auto-switch to text mode.
 */
class ErrorTracker {
  private counts: Map<AppErrorType, number> = new Map();
  private lastReset: Map<AppErrorType, number> = new Map();

  /**
   * Record an error occurrence.
   * Returns the current count for this error type.
   */
  record(type: AppErrorType): number {
    const current = this.counts.get(type) ?? 0;
    this.counts.set(type, current + 1);
    this.lastReset.set(type, Date.now());
    return current + 1;
  }

  /**
   * Reset the count for a specific error type.
   * Called after a successful action (e.g., successful ASR transcription).
   */
  reset(type: AppErrorType): void {
    this.counts.set(type, 0);
  }

  /**
   * Reset all error counts.
   */
  resetAll(): void {
    this.counts.clear();
    this.lastReset.clear();
  }

  /**
   * Get the current count for an error type.
   */
  getCount(type: AppErrorType): number {
    return this.counts.get(type) ?? 0;
  }

  /**
   * Check if we should auto-switch to text mode.
   * True after 3+ consecutive ASR failures.
   */
  shouldSwitchToTextMode(): boolean {
    const asrCount = this.getCount('asr_failure');
    const consecutiveCount = this.getCount('asr_consecutive_failure');
    return asrCount >= 3 || consecutiveCount >= 3;
  }

  /**
   * Check if an error type has occurred recently (within the last 5 minutes).
   */
  hasRecentError(type: AppErrorType): boolean {
    const lastTime = this.lastReset.get(type);
    if (!lastTime) return false;
    return Date.now() - lastTime < 5 * 60 * 1000;
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Safe wrapper for async operations.
 * Catches errors, logs them, and returns a warm message.
 */
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  context: string,
  errorType: AppErrorType = 'unknown'
): Promise<{ ok: true; result: T } | { ok: false; message: string }> {
  try {
    const result = await operation();
    errorTracker.reset(errorType);
    return { ok: true, result };
  } catch (error) {
    logError(context, error);
    const classifiedType = classifyError(error);
    const isRepeat = errorTracker.hasRecentError(classifiedType);
    errorTracker.record(classifiedType);
    const message = getWarmErrorMessage(classifiedType, isRepeat);
    return { ok: false, message };
  }
}