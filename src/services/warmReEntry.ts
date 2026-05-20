/**
 * Warm Re-Entry Service — Welcome messages for returning users.
 *
 * When a user returns after a gap (1+ days), show a warm welcome instead of
 * "streak lost". Never mention "streak lost" or "you missed X days".
 *
 * After 7+ days gap, auto-suggest recovery words (easiest words they've already learned).
 */

import { storage } from '../lib/storage';
import { wordProgressStore } from './wordProgress';
import { WORDS } from './mockData';
import type { ModeCode } from '../types';

const LAST_SESSION_DATE_KEY = 'warm_reentry_last_date';
const WELCOME_MESSAGE_KEY = 'warm_reentry_message';

/**
 * Calculate the number of days since the last session.
 */
function getDaysSinceLastSession(): number {
  const lastDate = storage.getString(LAST_SESSION_DATE_KEY);
  if (!lastDate) return -1; // First time

  const last = new Date(lastDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get a warm re-entry message based on the gap since last session.
 * Never mentions "streak lost" or "you missed X days".
 */
export function getWarmReEntryMessage(): string | null {
  const days = getDaysSinceLastSession();

  if (days <= 0) return null; // Same day or first time
  if (days === 1) return 'Welcome back! Ready to practice?';
  if (days <= 3) return 'Hey! Good to see you again. Let\'s pick up where we left off.';
  if (days <= 7) return 'It\'s been a while! No worries — your words are still here.';
  return 'Welcome back! Let\'s start fresh with some easy words.';
}

/**
 * Check if we should show a warm re-entry message.
 * Returns true if the user has been away for 1+ days.
 */
export function shouldShowWarmReEntry(): boolean {
  return getDaysSinceLastSession() >= 1;
}

/**
 * Get recovery words for users returning after 7+ days.
 * Returns the easiest words they've already learned (sprout level, then seed).
 * Limited to 5 words max.
 */
export function getRecoveryWords(currentMode: ModeCode): string[] {
  const days = getDaysSinceLastSession();
  if (days < 7) return [];

  const allProgress = wordProgressStore.getAll();

  // Prefer sprout words (used at least once), then seed words (seen but not used)
  const sproutWords = allProgress
    .filter((p) => p.masteryLevel === 'sprout')
    .sort((a, b) => a.timesUsedInContext - b.timesUsedInContext);

  const seedWords = allProgress
    .filter((p) => p.masteryLevel === 'seed')
    .sort((a, b) => a.timesSeen - b.timesSeen);

  const candidates = [...sproutWords, ...seedWords];
  const recoveryWordIds: string[] = [];

  for (const record of candidates) {
    if (recoveryWordIds.length >= 5) break;
    const word = WORDS[record.wordId];
    if (word && (record.contexts.includes(currentMode) || Object.keys(word.modeEntries).includes(currentMode))) {
      recoveryWordIds.push(record.wordId);
    }
  }

  return recoveryWordIds;
}

/**
 * Get a warm re-entry message with recovery words if applicable.
 * Returns the message and optionally recovery word IDs.
 */
export function getWarmReEntry(currentMode: ModeCode): {
  message: string | null;
  showRecoveryWords: boolean;
  recoveryWordIds: string[];
} {
  const message = getWarmReEntryMessage();
  const days = getDaysSinceLastSession();
  const showRecoveryWords = days >= 7;
  const recoveryWordIds = getRecoveryWords(currentMode);

  return {
    message,
    showRecoveryWords,
    recoveryWordIds,
  };
}

/**
 * Record that the user has started a session today.
 * Called at the beginning of each session to track gaps.
 */
export function recordSessionDate(): void {
  const today = new Date().toISOString();
  storage.set(LAST_SESSION_DATE_KEY, today);
}

/**
 * Get a friendly streak message that avoids punitive language.
 * Wraps the existing streak service message.
 */
export function getFriendlyStreakMessage(streakCount: number): string {
  if (streakCount === 0) return "Let's get started!";
  if (streakCount === 1) return 'Great start!';
  if (streakCount === 2) return '2 day streak!';
  if (streakCount === 3) return '3 day streak!';
  if (streakCount === 7) return 'One full week!';
  if (streakCount === 14) return 'Two weeks running!';
  if (streakCount === 30) return 'A whole month!';
  if (streakCount < 7) return `${streakCount} day streak!`;
  if (streakCount < 30) return `${streakCount} day streak!`;
  return `${streakCount} days and counting!`;
}