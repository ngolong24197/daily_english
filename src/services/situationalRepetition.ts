/**
 * Situational Repetition Engine
 *
 * Old words return in DIFFERENT contexts. If a user learned "get" meaning
 * "to order" in survival mode, review it meaning "to understand" in professional
 * mode. Priority: words used in fewest contexts get reviewed first.
 *
 * Key principles:
 * - Words are reviewed in DIFFERENT modes/contexts than originally learned
 * - Words with fewer practiced contexts are higher priority
 * - A word is "bloomed" (mastered) when used in 3+ distinct contexts
 * - Review words feel natural in the conversation, not like flashcards
 */

import type { ModeCode } from '../types';
import { WORDS, type MockWord } from './mockData';
import { getWordModeEntry } from './wordService';
import {
  wordProgressStore,
  type WordProgressRecord,
  type MasteryLevel,
} from './wordProgress';

export interface ReviewCandidate {
  word: MockWord;
  previousMode: ModeCode;
  currentMode: ModeCode;
  priority: number; // Higher = more urgent
  contextChangeDescription: string;
}

/**
 * Select review words for today's session based on situational repetition rules.
 *
 * @param currentMode  - The mode of today's session
 * @param maxReviews   - Maximum review words to include (default: 2)
 * @param sessionWords - IDs of new words in this session (to avoid duplicates)
 */
export function selectReviewWords(
  currentMode: ModeCode,
  maxReviews: number = 2,
  sessionWords: string[] = []
): ReviewCandidate[] {
  const progress = wordProgressStore.getAll();
  const candidates: ReviewCandidate[] = [];

  for (const record of progress) {
    // Skip words already in today's session as new words
    if (sessionWords.includes(record.wordId)) continue;

    // Skip words that are already bloomed (mastered in 3+ contexts)
    if (record.masteryLevel === 'bloom') continue;

    // Find the word in our mock data
    const word = WORDS[record.wordId];
    if (!word) continue;

    // Check if the word has a mode entry for the current mode
    // that is DIFFERENT from the mode it was last reviewed in
    if (!(currentMode in word.modeEntries)) continue;

    // Avoid reviewing in the same mode as last review
    if (record.lastReviewMode === currentMode) {
      // Only skip if the word was reviewed in this mode recently (within last 3 days)
      const daysSinceLastReview = record.lastReviewedAt
        ? (Date.now() - new Date(record.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      if (daysSinceLastReview < 3) continue;
    }

    const previousMode = record.lastReviewMode ?? record.contexts[0] ?? 'survival';
    const contextChangeDescription = buildContextChangeDescription(word, previousMode, currentMode);

    // Priority calculation: fewer contexts = higher priority
    // Also boost priority for words that haven't been reviewed recently
    const contextCount = record.contexts.length;
    const daysSinceLastReview = record.lastReviewedAt
      ? (Date.now() - new Date(record.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
      : 999;
    const recencyBoost = Math.min(daysSinceLastReview / 7, 3); // 0-3 based on weeks since review

    // Priority: seed words (0 contexts) are highest, then sprout (1-2 contexts)
    const basePriority = contextCount === 0 ? 10 : contextCount === 1 ? 7 : contextCount === 2 ? 4 : 1;
    const priority = basePriority + recencyBoost;

    candidates.push({
      word,
      previousMode,
      currentMode,
      priority,
      contextChangeDescription,
    });
  }

  // Sort by priority (highest first) and take the top maxReviews
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates.slice(0, maxReviews);
}

/**
 * Record that a word was reviewed in a specific context/mode.
 * Updates the word progress store.
 */
export function recordWordReview(
  wordId: string,
  mode: ModeCode,
  usedInConversation: boolean = false
): void {
  const existing = wordProgressStore.get(wordId);

  if (existing) {
    // Update existing record
    const newContexts = existing.contexts.includes(mode)
      ? existing.contexts
      : [...existing.contexts, mode];

    const newTimesUsed = usedInConversation
      ? existing.timesUsedInContext + 1
      : existing.timesUsedInContext;

    const masteryLevel = deriveMasteryLevel(newContexts.length, newTimesUsed);

    wordProgressStore.update(wordId, {
      contexts: newContexts,
      timesUsedInContext: newTimesUsed,
      lastReviewMode: mode,
      lastReviewedAt: new Date().toISOString(),
      masteryLevel,
    });
  } else {
    // Create new record for a word the user has seen
    const masteryLevel = usedInConversation ? 'sprout' : 'seed';
    wordProgressStore.set(wordId, {
      wordId,
      contexts: [mode],
      timesSeen: 1,
      timesUsedInContext: usedInConversation ? 1 : 0,
      lastReviewMode: mode,
      lastReviewedAt: new Date().toISOString(),
      masteryLevel,
    });
  }
}

/**
 * Record that a new word was introduced (seen) in a session.
 */
export function recordWordIntroduced(wordId: string, mode: ModeCode): void {
  const existing = wordProgressStore.get(wordId);

  if (existing) {
    // Word was seen before, this is a review in a new context
    const newContexts = existing.contexts.includes(mode)
      ? existing.contexts
      : [...existing.contexts, mode];

    wordProgressStore.update(wordId, {
      contexts: newContexts,
      timesSeen: existing.timesSeen + 1,
      lastReviewMode: mode,
      lastReviewedAt: new Date().toISOString(),
    });
  } else {
    // First time seeing this word
    wordProgressStore.set(wordId, {
      wordId,
      contexts: [mode],
      timesSeen: 1,
      timesUsedInContext: 0,
      lastReviewMode: mode,
      lastReviewedAt: new Date().toISOString(),
      masteryLevel: 'seed',
    });
  }
}

/**
 * Derive mastery level from context count and usage.
 * seed: seen but not used
 * sprout: used in conversation at least once
 * bloom: used in 3+ distinct contexts
 */
function deriveMasteryLevel(contextCount: number, timesUsed: number): MasteryLevel {
  if (contextCount >= 3) return 'bloom';
  if (timesUsed >= 1) return 'sprout';
  return 'seed';
}

/**
 * Build a natural-sounding context change description.
 * "You learned 'get' meaning 'to order' — here it means 'to understand'!"
 */
function buildContextChangeDescription(
  word: MockWord,
  previousMode: ModeCode,
  currentMode: ModeCode
): string {
  const prevEntry = getWordModeEntry(word, previousMode);
  const currEntry = getWordModeEntry(word, currentMode);

  const prevBrief = summarizeMeaning(prevEntry.meaning_context);
  const currBrief = summarizeMeaning(currEntry.meaning_context);

  return `You learned "${word.lemma}" meaning "${prevBrief}" — here it means "${currBrief}"!`;
}

function summarizeMeaning(meaningContext: string): string {
  const firstSentence = meaningContext.split('.')[0]?.trim() ?? meaningContext;
  if (firstSentence.length <= 60) return firstSentence;
  const truncated = firstSentence.substring(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : 57) + '...';
}

/**
 * Get review words as MockWord[] for compatibility with existing components.
 * Also returns context change descriptions for display.
 */
export function getReviewWordsForSession(
  currentMode: ModeCode,
  maxReviews: number = 2,
  sessionWords: string[] = []
): { words: MockWord[]; contextChanges: Record<string, string> } {
  const candidates = selectReviewWords(currentMode, maxReviews, sessionWords);

  const contextChanges: Record<string, string> = {};
  const words = candidates.map((c) => {
    contextChanges[c.word.id] = c.contextChangeDescription;
    return c.word;
  });

  return { words, contextChanges };
}