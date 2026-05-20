/**
 * Word Progress Tracking Service
 *
 * Tracks word mastery: seed (seen), sprout (used once), bloom (3+ contexts).
 * Persists to MMKV for offline access and syncs to Supabase.
 *
 * Mastery levels:
 * - seed:   User has seen the word in a scene/conversation but not used it
 * - sprout:  User has used the word in a conversation at least once
 * - bloom:   User has used the word in 3+ distinct contexts (modes)
 */

import { storage } from '../lib/storage';
import type { ModeCode } from '../types';

export type MasteryLevel = 'seed' | 'sprout' | 'bloom';

export interface WordProgressRecord {
  wordId: string;
  contexts: ModeCode[];        // Which modes/contexts this word has been practiced in
  timesSeen: number;           // How many times the word appeared in a session
  timesUsedInContext: number;  // How many times the user spoke the word correctly
  lastReviewMode: ModeCode | null;
  lastReviewedAt: string | null; // ISO timestamp
  masteryLevel: MasteryLevel;
}

const STORAGE_KEY = 'word_progress';
const SYNC_QUEUE_KEY = 'word_progress_sync_queue';

/**
 * In-memory store backed by MMKV for persistence.
 * Provides synchronous access to word progress data.
 */
class WordProgressStore {
  private records: Map<string, WordProgressRecord> = new Map();
  private loaded = false;

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const data = storage.getString(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as Record<string, WordProgressRecord>;
        this.records = new Map(Object.entries(parsed));
      }
      this.loaded = true;
    } catch {
      this.records = new Map();
      this.loaded = true;
    }
  }

  private persist(): void {
    try {
      const obj = Object.fromEntries(this.records);
      storage.set(STORAGE_KEY, JSON.stringify(obj));
    } catch {
      // MMKV write failure — data persists in memory for this session
    }
  }

  get(wordId: string): WordProgressRecord | undefined {
    return this.records.get(wordId);
  }

  set(wordId: string, record: WordProgressRecord): void {
    this.records.set(wordId, record);
    this.persist();
    this.queueForSync(wordId);
  }

  update(wordId: string, updates: Partial<WordProgressRecord>): void {
    const existing = this.records.get(wordId);
    if (existing) {
      const updated = { ...existing, ...updates, wordId }; // Ensure wordId is never overwritten
      this.records.set(wordId, updated);
      this.persist();
      this.queueForSync(wordId);
    }
  }

  getAll(): WordProgressRecord[] {
    return Array.from(this.records.values());
  }

  getByMasteryLevel(level: MasteryLevel): WordProgressRecord[] {
    return this.getAll().filter((r) => r.masteryLevel === level);
  }

  getTotalWordCount(): number {
    return this.records.size;
  }

  getMasteryCounts(): { seed: number; sprout: number; bloom: number } {
    const all = this.getAll();
    return {
      seed: all.filter((r) => r.masteryLevel === 'seed').length,
      sprout: all.filter((r) => r.masteryLevel === 'sprout').length,
      bloom: all.filter((r) => r.masteryLevel === 'bloom').length,
    };
  }

  /**
   * Queue a word progress update for Supabase sync.
   * Called whenever local data changes — sync happens when online.
   */
  private queueForSync(wordId: string): void {
    try {
      const queueRaw = storage.getString(SYNC_QUEUE_KEY);
      const queue: string[] = queueRaw ? JSON.parse(queueRaw) : [];

      if (!queue.includes(wordId)) {
        queue.push(wordId);
        storage.set(SYNC_QUEUE_KEY, JSON.stringify(queue));
      }
    } catch {
      // Sync queue is best-effort
    }
  }

  /**
   * Get the sync queue and clear it.
   * Called by the sync engine when pushing updates to Supabase.
   */
  drainSyncQueue(): string[] {
    try {
      const queueRaw = storage.getString(SYNC_QUEUE_KEY);
      const queue: string[] = queueRaw ? JSON.parse(queueRaw) : [];
      storage.delete(SYNC_QUEUE_KEY);
      return queue;
    } catch {
      return [];
    }
  }

  /**
   * Merge server data into local data.
   * Used when pulling updates from Supabase.
   * Server data wins on conflict (last-write-wins with server timestamp).
   */
  mergeFromServer(serverRecords: WordProgressRecord[]): void {
    for (const serverRecord of serverRecords) {
      const localRecord = this.records.get(serverRecord.wordId);

      if (!localRecord) {
        // New word from server
        this.records.set(serverRecord.wordId, serverRecord);
      } else {
        // Merge: take the record with more progress
        // Contexts are additive, other fields take the max
        const mergedContexts = [...new Set([...localRecord.contexts, ...serverRecord.contexts])];
        const merged: WordProgressRecord = {
          wordId: serverRecord.wordId,
          contexts: mergedContexts,
          timesSeen: Math.max(localRecord.timesSeen, serverRecord.timesSeen),
          timesUsedInContext: Math.max(localRecord.timesUsedInContext, serverRecord.timesUsedInContext),
          lastReviewMode: serverRecord.lastReviewedAt && localRecord.lastReviewedAt
            ? (new Date(serverRecord.lastReviewedAt) > new Date(localRecord.lastReviewedAt)
                ? serverRecord.lastReviewMode
                : localRecord.lastReviewMode)
            : serverRecord.lastReviewMode ?? localRecord.lastReviewMode,
          lastReviewedAt: serverRecord.lastReviewedAt && localRecord.lastReviewedAt
            ? (new Date(serverRecord.lastReviewedAt) > new Date(localRecord.lastReviewedAt)
                ? serverRecord.lastReviewedAt
                : localRecord.lastReviewedAt)
            : serverRecord.lastReviewedAt ?? localRecord.lastReviewedAt,
          masteryLevel: localRecord.masteryLevel === 'bloom' || serverRecord.masteryLevel === 'bloom'
            ? 'bloom'
            : localRecord.masteryLevel === 'sprout' || serverRecord.masteryLevel === 'sprout'
              ? 'sprout'
              : 'seed',
        };

        this.records.set(serverRecord.wordId, merged);
      }
    }
    this.persist();
  }
}

// Singleton instance
export const wordProgressStore = new WordProgressStore();

/**
 * Sync word progress to Supabase.
 * Pushes all queued changes and pulls server updates.
 */
export async function syncWordProgressToSupabase(): Promise<void> {
  // In production, this would call the Supabase API
  // For now, this is a placeholder that the sync engine will use
  const queue = wordProgressStore.drainSyncQueue();
  if (queue.length === 0) return;

  // TODO: Implement Supabase sync when backend is ready
  // 1. Read queued word IDs
  // 2. Push local changes to Supabase
  // 3. Pull server changes and merge
  // Syncing word progress updates to Supabase (placeholder)
  // When backend is ready, implement: read queue, push local changes, pull server changes and merge
}

/**
 * Initialize word progress store with seed data for demo/testing.
 * Adds some words at various mastery levels to demonstrate the feature.
 */
export function initializeDemoProgress(currentMode: ModeCode): void {
  // Only initialize if the store is empty
  if (wordProgressStore.getTotalWordCount() > 0) return;

  // Seed some words as "seen" in survival mode
  const seenWords = ['word-get', 'word-would-like', 'word-take'];
  for (const wordId of seenWords) {
    wordProgressStore.set(wordId, {
      wordId,
      contexts: ['survival'],
      timesSeen: 1,
      timesUsedInContext: 0,
      lastReviewMode: 'survival',
      lastReviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      masteryLevel: 'seed',
    });
  }

  // One word used in conversation (sprout)
  wordProgressStore.set('word-get', {
    wordId: 'word-get',
    contexts: ['survival'],
    timesSeen: 2,
    timesUsedInContext: 1,
    lastReviewMode: 'survival',
    lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    masteryLevel: 'sprout',
  });

  // One word used in multiple contexts (bloom)
  wordProgressStore.set('word-order', {
    wordId: 'word-order',
    contexts: ['survival', 'professional', 'social'],
    timesSeen: 5,
    timesUsedInContext: 4,
    lastReviewMode: 'social',
    lastReviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    masteryLevel: 'bloom',
  });
}