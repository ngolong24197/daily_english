/**
 * Subscription Service — Manages premium/free tier logic.
 *
 * For MVP, subscription state is stored in MMKV with a demo toggle
 * accessible via a long-press on the version number in Settings.
 *
 * Free tier limits:
 * - Max 5 words per day (up to 7 with streak bonus)
 * - Only Survival track available
 * - Last 7 days of conversation history
 * - Ads at session close
 * - Basic word stats
 *
 * Premium tier unlocks:
 * - All tracks (Professional, Social, IELTS, TOEIC)
 * - Unlimited words per day
 * - Full conversation history
 * - Detailed word statistics
 * - No ads
 */

import { storage } from '../lib/storage';
import type { ModeCode } from '../types';

const PREMIUM_KEY = 'is_premium';
const DEMO_MODE_KEY = 'demo_premium_enabled';

// Free tier limits
const FREE_MAX_WORDS_PER_DAY = 5;
const FREE_HISTORY_DAYS = 7;
const FREE_AVAILABLE_TRACKS: ModeCode[] = ['survival'];

class SubscriptionService {
  /** Check if the user has premium access. */
  isPremium(): boolean {
    // Demo toggle takes precedence
    if (storage.getString(DEMO_MODE_KEY) === 'true') return true;
    return storage.getString(PREMIUM_KEY) === 'true';
  }

  /** Set premium status (for real subscription management later). */
  setPremium(isPremium: boolean): void {
    storage.set(PREMIUM_KEY, isPremium ? 'true' : 'false');
  }

  /** Toggle demo premium mode (for testing). Hidden behind long-press on version. */
  setDemoPremium(enabled: boolean): void {
    storage.set(DEMO_MODE_KEY, enabled ? 'true' : 'false');
  }

  /** Check if demo premium mode is active. */
  isDemoPremium(): boolean {
    return storage.getString(DEMO_MODE_KEY) === 'true';
  }

  /** Get max words per day for the current tier. */
  getMaxWordsPerDay(): number {
    if (this.isPremium()) return Infinity;
    return FREE_MAX_WORDS_PER_DAY;
  }

  /** Check if a track is available for the current tier. */
  isTrackAvailable(mode: ModeCode): boolean {
    if (this.isPremium()) return true;
    return FREE_AVAILABLE_TRACKS.includes(mode);
  }

  /** Get the list of available tracks for the current tier. */
  getAvailableTracks(): ModeCode[] {
    if (this.isPremium()) {
      return ['survival', 'professional', 'social', 'ielts', 'toeic'];
    }
    return [...FREE_AVAILABLE_TRACKS];
  }

  /** Check if full conversation history is available. */
  hasFullHistory(): boolean {
    return this.isPremium();
  }

  /** Get the number of days of history visible for free users. */
  getFreeHistoryDays(): number {
    return FREE_HISTORY_DAYS;
  }

  /** Check if ads should be shown. */
  shouldShowAds(): boolean {
    return !this.isPremium();
  }

  /** Check if detailed word statistics are available. */
  hasDetailedStats(): boolean {
    return this.isPremium();
  }

  /**
   * Filter sessions for free tier history visibility.
   * Returns only sessions from the last N days for free users.
   */
  filterSessionsForTier<T extends { date: string }>(sessions: T[]): T[] {
    if (this.isPremium()) return sessions;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - FREE_HISTORY_DAYS);
    const cutoffISO = cutoff.toISOString();

    return sessions.filter((s) => s.date >= cutoffISO);
  }

  /**
   * Check if there are older sessions beyond the free tier window.
   * Used to show the "Upgrade to see your full history" card.
   */
  hasOlderSessions<T extends { date: string }>(sessions: T[]): boolean {
    if (this.isPremium()) return false;
    if (sessions.length === 0) return false;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - FREE_HISTORY_DAYS);
    const cutoffISO = cutoff.toISOString();

    return sessions.some((s) => s.date < cutoffISO);
  }
}

export const subscriptionService = new SubscriptionService();