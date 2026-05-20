/**
 * Context Detection Service
 *
 * When a user answers "How was your day?", parse the response to suggest
 * relevant words and scenes based on keyword matching.
 *
 * This is a simple keyword-based system (not AI-powered) for Sprint 4.
 * The detected context is used to:
 * 1. Suggest which track's scene might be most relevant
 * 2. Inform word selection for the session
 * 3. Default to the user's selected track if no keywords match
 */

import type { ModeCode } from '../types';

export interface ContextDetectionResult {
  /** The detected context category */
  context: 'work' | 'social' | 'health' | 'food' | 'study' | 'general';
  /** The suggested mode based on the detected context */
  suggestedMode: ModeCode;
  /** Confidence level of the detection (0-1) */
  confidence: number;
  /** Keywords that were matched */
  matchedKeywords: string[];
  /** Whether the detection resulted in a mode change suggestion */
  suggestModeChange: boolean;
}

/** Keyword mappings for each context category */
const CONTEXT_KEYWORDS: Record<string, { context: ContextDetectionResult['context']; mode: ModeCode; keywords: string[] }> = {
  work: {
    context: 'work',
    mode: 'professional',
    keywords: [
      'work', 'office', 'meeting', 'boss', 'colleague', 'project', 'deadline',
      'stress', 'stressed', 'busy', 'email', 'presentation', 'client', 'report',
      'manager', 'team', 'conference', 'call', 'standup', 'schedule', 'task',
      'assignment', 'corporate', 'interview', 'salary', 'promotion', 'resign',
      'coworker', 'zoom', 'slack', 'productive', 'meeting', 'meeting',
    ],
  },
  social: {
    context: 'social',
    mode: 'social',
    keywords: [
      'fun', 'hangout', 'hang out', 'friends', 'game', 'gaming', 'party',
      'movie', 'show', 'meme', 'chill', 'chilled', 'relax', 'relaxed',
      'weekend', 'bar', 'club', 'dinner', 'brunch', 'concert', 'music',
      'netflix', 'youtube', 'tiktok', 'instagram', 'texting', 'calling',
      'hang', 'played', 'watch', 'watched', 'stream', 'streaming',
    ],
  },
  health: {
    context: 'health',
    mode: 'survival',
    keywords: [
      'doctor', 'appointment', 'sick', 'medicine', 'hospital', 'clinic',
      'pain', 'headache', 'fever', 'cold', 'flu', 'allergy', 'pharmacy',
      'prescription', 'symptom', 'health', 'healthy', 'exercise', 'gym',
      'tired', 'exhausted', 'unwell', 'recovery', 'injury', 'checkup',
    ],
  },
  food: {
    context: 'food',
    mode: 'survival',
    keywords: [
      'coffee', 'restaurant', 'food', 'lunch', 'dinner', 'breakfast',
      'cafe', 'grocery', 'cook', 'cooking', 'recipe', 'meal', 'takeout',
      'delivery', 'order', 'menu', 'hungry', 'ate', 'eating', 'snack',
      'bakery', 'supermarket', 'market', 'brunch', 'barista',
    ],
  },
  study: {
    context: 'study',
    mode: 'ielts',
    keywords: [
      'study', 'test', 'exam', 'practice', 'homework', 'class', 'course',
      'school', 'university', 'college', 'lesson', 'textbook', 'assignment',
      'grade', 'score', 'ielts', 'toeic', 'toefl', 'academic', 'thesis',
      'professor', 'lecture', 'seminar', 'tutor', 'learning', 'english',
    ],
  },
};

/**
 * Detect context from the user's "How was your day?" response.
 *
 * @param response - The user's spoken or typed response
 * @param currentMode - The user's currently selected mode
 * @returns ContextDetectionResult with suggested mode and confidence
 */
export function detectContext(
  response: string,
  currentMode: ModeCode
): ContextDetectionResult {
  const normalizedResponse = response.toLowerCase().trim();

  // If response is empty or too short, default to current mode
  if (!normalizedResponse || normalizedResponse.length < 2) {
    return {
      context: 'general',
      suggestedMode: currentMode,
      confidence: 0,
      matchedKeywords: [],
      suggestModeChange: false,
    };
  }

  let bestMatch: { context: ContextDetectionResult['context']; mode: ModeCode; keywords: string[]; matchCount: number } | null = null;

  for (const entry of Object.values(CONTEXT_KEYWORDS)) {
    const matchedKeywords = entry.keywords.filter((keyword) =>
      normalizedResponse.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      if (!bestMatch || matchedKeywords.length > bestMatch.matchCount) {
        bestMatch = {
          context: entry.context,
          mode: entry.mode,
          keywords: matchedKeywords,
          matchCount: matchedKeywords.length,
        };
      }
    }
  }

  if (bestMatch) {
    const confidence = Math.min(bestMatch.matchCount / 3, 1); // Scale confidence
    const suggestModeChange = bestMatch.mode !== currentMode && confidence >= 0.3;

    return {
      context: bestMatch.context,
      suggestedMode: bestMatch.mode,
      confidence,
      matchedKeywords: bestMatch.keywords,
      suggestModeChange,
    };
  }

  // No keywords matched — default to user's current track
  return {
    context: 'general',
    suggestedMode: currentMode,
    confidence: 0,
    matchedKeywords: [],
    suggestModeChange: false,
  };
}

/**
 * Get a friendly description of the detected context.
 * Used to show the user why a particular scene was chosen.
 */
export function getContextDescription(context: ContextDetectionResult['context']): string {
  switch (context) {
    case 'work':
      return 'Sounds like a work day — let\'s practice some professional English.';
    case 'social':
      return 'A social day — let\'s learn some casual, everyday English.';
    case 'health':
      return 'Health-related — let\'s practice some English for daily life situations.';
    case 'food':
      return 'A day around food — let\'s practice ordering and talking about meals.';
    case 'study':
      return 'Study day — let\'s practice some structured, exam-focused English.';
    case 'general':
    default:
      return '';
  }
}

/**
 * Get the greeting tone based on mode.
 * Each mode has a different conversational style for the "How was your day?" prompt.
 */
export function getGreetingForMode(mode: ModeCode): { greeting: string; prompt: string; promptSub: string } {
  switch (mode) {
    case 'survival':
      return {
        greeting: getTimeGreeting(),
        prompt: 'How was your day?',
        promptSub: 'Care to share?',
      };
    case 'professional':
      return {
        greeting: getTimeGreeting(),
        prompt: 'How was work today?',
        promptSub: 'Any meetings or projects to discuss?',
      };
    case 'social':
      return {
        greeting: "What's good?",
        prompt: 'How was your day?',
        promptSub: 'Anything fun happening?',
      };
    case 'ielts':
      return {
        greeting: 'Ready to practice?',
        prompt: 'Let\'s get started.',
        promptSub: 'IELTS speaking practice awaits.',
      };
    case 'toeic':
      return {
        greeting: 'Ready to practice?',
        prompt: 'Let\'s get started.',
        promptSub: 'TOEIC speaking practice awaits.',
      };
    default:
      return {
        greeting: getTimeGreeting(),
        prompt: 'How was your day?',
        promptSub: 'Care to share?',
      };
  }
}

/**
 * Get a time-based greeting.
 */
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Check if a mode is an exam mode (IELTS or TOEIC).
 */
export function isExamMode(mode: ModeCode): boolean {
  return mode === 'ielts' || mode === 'toeic';
}

/**
 * Get the mode switch explanation message.
 * Shown when user switches to a different track.
 */
export function getModeSwitchMessage(newMode: ModeCode): string {
  const messages: Record<ModeCode, string> = {
    survival: 'Switching to Survival mode. Words will be presented in daily life contexts.',
    professional: 'Switching to Professional mode. Words will be presented in work contexts.',
    social: 'Switching to Social mode. Words will use casual, slang-friendly language.',
    ielts: 'Switching to IELTS mode. Practice will be structured and accuracy-focused.',
    toeic: 'Switching to TOEIC mode. Practice will focus on business English and accuracy.',
  };
  return messages[newMode];
}