/**
 * Jam Along Conversations — Sprint 6
 *
 * A distinct conversation format where a native speaker's dialogue plays,
 * pauses at key moments, and the user fills in the missing parts.
 * Like karaoke for conversation.
 */

import type { ModeCode } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Jam Along Types
// ─────────────────────────────────────────────────────────────────────────────

export interface JamAlongLine {
  /** Who speaks this line */
  speaker: 'native' | 'user';
  /** The full text of the line */
  text: string;
  /** For native lines: whether this line has a replay button */
  canReplay?: boolean;
  /** For user slots: the expected response keywords/patterns */
  expectedPatterns?: string[];
  /** For user slots: Level 1 hint (sentence starter) */
  hintLevel1?: string;
  /** For user slots: Level 2 hint (full sentence suggestion) */
  hintLevel2?: string;
  /** Pause duration in milliseconds before this line plays (native only) */
  pauseMs?: number;
}

export interface JamAlongScript {
  /** Unique ID for this script */
  id: string;
  /** Display title */
  title: string;
  /** Description of the scenario */
  description: string;
  /** Which mode/track this is for */
  modeCode: ModeCode;
  /** The dialogue lines in order */
  lines: JamAlongLine[];
  /** New words used in this script */
  newWordIds: string[];
  /** Review words used in this script */
  reviewWordIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Jam Along Scripts
// ─────────────────────────────────────────────────────────────────────────────

export const JAM_ALONG_CAFE: JamAlongScript = {
  id: 'jam-cafe-survival',
  title: 'Ordering at a Cafe',
  description: 'Fill in the gaps as you order at a cafe. The barista speaks first, then you respond at the right moments.',
  modeCode: 'survival',
  newWordIds: ['word-brew', 'word-recommend', 'word-seasonal', 'word-fresh', 'word-order'],
  reviewWordIds: ['word-get', 'word-would-like'],
  lines: [
    {
      speaker: 'native',
      text: 'Good morning! What can I get for you today? We have a fresh brew and some seasonal specials.',
      canReplay: true,
    },
    {
      speaker: 'user',
      text: "I'd like to order a coffee, please.",
      expectedPatterns: ['would like', 'order', 'get', 'coffee', 'please'],
      hintLevel1: "Try: I'd like to...",
      hintLevel2: "Try saying: I'd like to order a coffee, please.",
    },
    {
      speaker: 'native',
      text: 'Great choice! Would you like to hear about our seasonal specials too?',
      canReplay: true,
    },
    {
      speaker: 'user',
      text: 'Can you recommend something good?',
      expectedPatterns: ['recommend', 'suggest', 'what', 'something', 'good'],
      hintLevel1: 'Try: Can you recommend...',
      hintLevel2: 'Try saying: Can you recommend something good today?',
    },
    {
      speaker: 'native',
      text: 'Our seasonal blend has cinnamon and orange notes. It is really warming for this time of year. Shall I make that for you?',
      canReplay: true,
    },
    {
      speaker: 'user',
      text: "I'll try the seasonal blend, please.",
      expectedPatterns: ['seasonal', 'blend', 'try', 'fresh', 'yes'],
      hintLevel1: 'Try: I will try the...',
      hintLevel2: "Try saying: I'll try the seasonal blend, please.",
    },
    {
      speaker: 'native',
      text: "Wonderful! One seasonal blend coming up. It's a great spot to take a break. Can I get you anything else?",
      canReplay: true,
    },
    {
      speaker: 'user',
      text: 'That sounds good, thank you!',
      expectedPatterns: ['sounds', 'good', 'thank', 'great', 'that'],
      hintLevel1: 'Try: That sounds...',
      hintLevel2: 'Try saying: That sounds good, thank you!',
    },
    {
      speaker: 'native',
      text: 'Your order will be ready in just a moment. Enjoy your drink and have a wonderful rest of your day!',
      canReplay: true,
    },
  ],
};

export const JAM_ALONG_MEETING: JamAlongScript = {
  id: 'jam-meeting-professional',
  title: 'Contributing in a Meeting',
  description: 'Fill in the gaps as you participate in a team meeting. Practice professional language for sharing ideas and handling deadlines.',
  modeCode: 'professional',
  newWordIds: ['word-deadline', 'word-approach', 'word-handle', 'word-figure', 'word-point'],
  reviewWordIds: ['word-get', 'word-recommend'],
  lines: [
    {
      speaker: 'native',
      text: "Good morning, everyone. Let's get started. I'd like to hear an update on the project.",
      canReplay: true,
    },
    {
      speaker: 'user',
      text: 'It has been busy with the project deadline.',
      expectedPatterns: ['busy', 'project', 'deadline', 'meeting', 'work', 'week'],
      hintLevel1: 'Try: It has been busy...',
      hintLevel2: 'Try saying: It has been busy with the project deadline.',
    },
    {
      speaker: 'native',
      text: 'I hear you. We have a deadline coming up on our end too. Did you get a chance to review the approach document I sent?',
      canReplay: true,
    },
    {
      speaker: 'user',
      text: 'I think the new approach makes a good point about efficiency.',
      expectedPatterns: ['think', 'approach', 'point', 'handle', 'agree', 'good'],
      hintLevel1: 'Try: I think the approach...',
      hintLevel2: 'Try saying: I think the new approach makes a good point about efficiency.',
    },
    {
      speaker: 'native',
      text: "Good point! I think we can handle this more efficiently. Let me take the lead on the client presentation — would that work?",
      canReplay: true,
    },
    {
      speaker: 'user',
      text: 'Yes, I can handle the follow-up report.',
      expectedPatterns: ['yes', 'can', 'handle', 'take', 'sure', 'will'],
      hintLevel1: 'Try: Yes, I can...',
      hintLevel2: 'Try saying: Yes, I can handle the follow-up report.',
    },
    {
      speaker: 'native',
      text: "Excellent. I'll get back to you with the latest figures by tomorrow. Great working with you on this!",
      canReplay: true,
    },
    {
      speaker: 'user',
      text: "Thanks! I'll get back to you on those items.",
      expectedPatterns: ['thank', 'thanks', 'get back', 'items', 'will'],
      hintLevel1: 'Try: Thank you...',
      hintLevel2: "Try saying: Thanks! I'll get back to you on those items.",
    },
    {
      speaker: 'native',
      text: "That was a productive meeting. Thanks for your time — I'll send you the action items shortly.",
      canReplay: true,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Jam Along Script Registry
// ─────────────────────────────────────────────────────────────────────────────

export const JAM_ALONG_SCRIPTS: Record<string, JamAlongScript> = {
  'jam-cafe-survival': JAM_ALONG_CAFE,
  'jam-meeting-professional': JAM_ALONG_MEETING,
};

/**
 * Get a Jam Along script by its ID.
 */
export function getJamAlongScript(id: string): JamAlongScript | undefined {
  return JAM_ALONG_SCRIPTS[id];
}

/**
 * Get available Jam Along scripts for a given mode.
 */
export function getJamAlongScriptsForMode(mode: ModeCode): JamAlongScript[] {
  return Object.values(JAM_ALONG_SCRIPTS).filter((s) => s.modeCode === mode);
}

/**
 * Get the default Jam Along script for a mode.
 */
export function getDefaultJamAlongScript(mode: ModeCode): JamAlongScript {
  if (mode === 'professional' || mode === 'ielts' || mode === 'toeic') {
    return JAM_ALONG_MEETING;
  }
  return JAM_ALONG_CAFE;
}