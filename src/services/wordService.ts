/**
 * Word Service — Loads words with mode-specific content.
 *
 * Each word has different explanations/examples per mode (survival, professional, social).
 * This service provides the mode-aware view of words used throughout the app.
 */

import type { ModeCode, WordModeEntry } from '../types';
import { modeColors } from '@/constants/theme';
import { type MockWord } from './mockData';
import { getWords, getWordById as supabaseGetWordById, getWordsForMode as supabaseGetWordsForMode } from './supabaseDataService';

/**
 * Get the mode-specific entry for a word.
 * Falls back to survival mode if the requested mode is not available.
 */
export function getWordModeEntry(word: MockWord, mode: ModeCode): WordModeEntry {
  const entry = word.modeEntries[mode];
  if (entry) return entry;

  // Fallback chain: requested mode -> survival -> first available
  const fallback = word.modeEntries.survival;
  if (fallback) return fallback;

  const firstAvailable = Object.values(word.modeEntries)[0];
  if (firstAvailable) return firstAvailable;

  // Should never happen if data is well-formed
  throw new Error(`No mode entry found for word "${word.lemma}"`);
}

/**
 * Get all words available for a given mode.
 */
export function getWordsForMode(mode: ModeCode): MockWord[] {
  return supabaseGetWordsForMode(mode);
}

/**
 * Get a word by its ID.
 */
export function getWordById(wordId: string): MockWord | undefined {
  return supabaseGetWordById(wordId);
}

/**
 * Get a word by its lemma (base form).
 */
export function getWordByLemma(lemma: string): MockWord | undefined {
  return Object.values(getWords()).find((w) => w.lemma === lemma);
}

/**
 * Get the "try saying" prompt for a word in a given mode.
 * Generates a natural prompt based on the example sentence.
 */
export function getTrySaying(word: MockWord, mode: ModeCode): string {
  const entry = getWordModeEntry(word, mode);
  // Extract the example sentence and present it as a prompt
  return `Try saying: "${entry.example_sentence}"`;
}

/**
 * Get the mode badge label for a given mode code.
 */
export function getModeBadgeLabel(mode: ModeCode): string {
  const labels: Record<ModeCode, string> = {
    survival: 'Survival',
    professional: 'Professional',
    social: 'Social',
    ielts: 'IELTS',
    toeic: 'TOEIC',
  };
  return labels[mode] ?? 'Survival';
}

/**
 * Get the mode badge color for a given mode code.
 */
export function getModeBadgeColor(mode: ModeCode): { bg: string; text: string } {
  const modeColor = modeColors[mode] ?? modeColors.survival;
  return { bg: modeColor.accentSurface, text: modeColor.accent };
}

/**
 * Convert a MockWord to a simplified format with the mode-specific entry.
 * Used by components that need a single view of the word for the current mode.
 */
export function wordToModeView(word: MockWord, mode: ModeCode) {
  const entry = getWordModeEntry(word, mode);
  return {
    id: word.id,
    lemma: word.lemma,
    pos: word.pos,
    modeEntry: entry,
    isNew: word.isNew,
    modeCode: mode,
  };
}

/**
 * Get all mode entries available for a word (for the exploration sheet).
 */
export function getAvailableModesForWord(word: MockWord): ModeCode[] {
  return Object.keys(word.modeEntries) as ModeCode[];
}

/**
 * Get the context change description when a word appears in a different mode.
 * E.g., "You learned 'get' meaning 'to order' — here it means 'to understand'!"
 */
export function getContextChangeDescription(
  word: MockWord,
  previousMode: ModeCode,
  currentMode: ModeCode
): string {
  const prevEntry = getWordModeEntry(word, previousMode);
  const currEntry = getWordModeEntry(word, currentMode);

  // Create a brief summary of the previous context
  const prevBrief = summarizeContext(prevEntry.meaning_context);
  const currBrief = summarizeContext(currEntry.meaning_context);

  return `You learned "${word.lemma}" meaning "${prevBrief}" — here it means "${currBrief}"!`;
}

/**
 * Create a brief summary from a meaning_context string.
 * Takes the first phrase or the part before the first period.
 */
function summarizeContext(meaningContext: string): string {
  // Take the first sentence or first 60 chars, whichever is shorter
  const firstSentence = meaningContext.split('.')[0]?.trim() ?? meaningContext;
  if (firstSentence.length <= 60) return firstSentence;
  // Truncate and add ellipsis
  const truncated = firstSentence.substring(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace > 0 ? lastSpace : 57) + '...';
}