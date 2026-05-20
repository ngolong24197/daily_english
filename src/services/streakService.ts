/**
 * Streak Service — Tracks consecutive days of app usage.
 *
 * Philosophy: "Welcome back!" not "You lost your streak!"
 * Streaks are encouraging, not punishing. If a user misses a day,
 * they simply start a new streak. No guilt, no penalty.
 *
 * Stores in MMKV: last session date, current streak count.
 */

import { storage } from '../lib/storage';

const STREAK_COUNT_KEY = 'streak_count';
const LAST_SESSION_DATE_KEY = 'last_session_date';

/** Get today's date as a YYYY-MM-DD string for comparison. */
function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get yesterday's date as a YYYY-MM-DD string. */
function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

class StreakService {
  /**
   * Record that the user has used the app today.
   * Call this when the user starts a session or opens the app.
   *
   * - If last session was yesterday: increment streak
   * - If last session was today: no change (already counted)
   * - If last session was older: start a new streak at 1
   * - If no previous session: start at 1
   */
  recordSession(): number {
    const today = getTodayStr();
    const lastSession = storage.getString(LAST_SESSION_DATE_KEY);
    const currentStreak = storage.getNumber(STREAK_COUNT_KEY) ?? 0;

    if (lastSession === today) {
      // Already recorded today
      return currentStreak;
    }

    let newStreak: number;

    if (lastSession === getYesterdayStr()) {
      // Consecutive day — increment streak
      newStreak = currentStreak + 1;
    } else if (lastSession && lastSession < getYesterdayStr()) {
      // Gap — start fresh, but warmly
      newStreak = 1;
    } else {
      // First time ever
      newStreak = 1;
    }

    storage.set(LAST_SESSION_DATE_KEY, today);
    storage.set(STREAK_COUNT_KEY, newStreak);

    return newStreak;
  }

  /**
   * Get the current streak count.
   * This does NOT update the streak — it just reads it.
   * Call recordSession() first to update.
   */
  getStreak(): number {
    return storage.getNumber(STREAK_COUNT_KEY) ?? 0;
  }

  /**
   * Get a friendly streak message for the UI.
   * Warm, encouraging, never punitive.
   */
  getStreakMessage(): string {
    const streak = this.getStreak();

    if (streak === 0) {
      return "Let's get started!";
    } else if (streak === 1) {
      return 'Great start!';
    } else if (streak === 2) {
      return '2 day streak!';
    } else if (streak === 3) {
      return '3 day streak!';
    } else if (streak === 7) {
      return 'One full week!';
    } else if (streak === 14) {
      return 'Two weeks running!';
    } else if (streak === 30) {
      return 'A whole month!';
    } else if (streak < 7) {
      return `${streak} day streak!`;
    } else if (streak < 30) {
      return `${streak} day streak!`;
    } else {
      return `${streak} days and counting!`;
    }
  }

  /**
   * Get a welcome-back message based on time since last session.
   * Always warm, never guilt-inducing.
   */
  getWelcomeMessage(): string {
    const lastSession = storage.getString(LAST_SESSION_DATE_KEY);

    if (!lastSession) {
      return 'Welcome to Daily English!';
    }

    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    if (lastSession === today) {
      return 'Good to see you again!';
    } else if (lastSession === yesterday) {
      return 'Welcome back!';
    } else {
      return 'Welcome back! Great to see you.';
    }
  }

  /**
   * Check if the user is currently on a streak (active within the last day).
   */
  isActiveStreak(): boolean {
    const lastSession = storage.getString(LAST_SESSION_DATE_KEY);
    if (!lastSession) return false;

    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    return lastSession === today || lastSession === yesterday;
  }
}

export const streakService = new StreakService();