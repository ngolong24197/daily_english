import {
  CAFE_CONVERSATION,
  PROFESSIONAL_CONVERSATION,
  SOCIAL_CONVERSATION,
  IELTS_CONVERSATION,
  TOEIC_CONVERSATION,
  EMAIL_FOLLOWUP_CONVERSATION,
  PERFORMANCE_REVIEW_CONVERSATION,
  NETWORKING_CONFERENCE_CONVERSATION,
  GAMING_CONVERSATION,
  MOVIE_NIGHT_CONVERSATION,
  SOCIAL_MEDIA_CONVERSATION,
  type ConversationStep,
  type ConversationBranch,
  type MockScene,
} from './mockData';
import type { ModeCode } from '../types';
import { getConversationScript } from './supabaseDataService';

export interface ConversationMessage {
  id: string;
  speaker: 'user' | 'npc';
  text: string;
  timestamp: number;
  wordsUsed: string[];
  /** If this message introduces a review word in a new context, show context change */
  contextChange?: string;
}

export interface ConversationState {
  messages: ConversationMessage[];
  currentStep: number;
  hintLevel: 0 | 1 | 2;
  isComplete: boolean;
  wordsUsedThisSession: string[];
}

export interface HintContent {
  level: 1 | 2;
  text: string;
}

function findMatchingBranch(
  userInput: string,
  branches: ConversationBranch[]
): ConversationBranch | null {
  const normalizedInput = userInput.toLowerCase().trim();

  for (const branch of branches) {
    for (const pattern of branch.matchPatterns) {
      if (normalizedInput.includes(pattern.toLowerCase())) {
        return branch;
      }
    }
  }

  return null;
}

/**
 * Get the conversation script for a given scene ID.
 * Falls back to mode-specific scripts if no scene-specific script exists.
 */
function getConversationScriptForScene(sceneId: string, mode: ModeCode): ConversationStep[] {
  // Try Supabase cache first
  const cached = getConversationScript(sceneId);
  if (cached) return cached;

  // Scene-specific conversations for Sprint 6 expansion scenes
  const sceneConversationMap: Record<string, ConversationStep[]> = {
    'scene-email-followup-professional': EMAIL_FOLLOWUP_CONVERSATION,
    'scene-performance-review-professional': PERFORMANCE_REVIEW_CONVERSATION,
    'scene-networking-conference-professional': NETWORKING_CONFERENCE_CONVERSATION,
    'scene-gaming-social': GAMING_CONVERSATION,
    'scene-movie-night-social': MOVIE_NIGHT_CONVERSATION,
    'scene-social-media-social': SOCIAL_MEDIA_CONVERSATION,
  };

  if (sceneConversationMap[sceneId]) {
    return sceneConversationMap[sceneId];
  }

  // Fall back to mode-specific scripts for original scenes
  return getConversationScriptByMode(mode);
}

/**
 * Get the conversation script for a given mode.
 * Falls back to CAFE_CONVERSATION if no mode-specific script exists.
 */
function getConversationScriptByMode(mode: ModeCode): ConversationStep[] {
  switch (mode) {
    case 'professional':
      return PROFESSIONAL_CONVERSATION;
    case 'ielts':
      return IELTS_CONVERSATION;
    case 'toeic':
      return TOEIC_CONVERSATION;
    case 'social':
      return SOCIAL_CONVERSATION;
    case 'survival':
    default:
      return CAFE_CONVERSATION;
  }
}

export function createConversation(mode: ModeCode = 'survival', sceneId?: string): ConversationState {
  const script = sceneId
    ? getConversationScriptForScene(sceneId, mode)
    : getConversationScriptByMode(mode);
  if (!script || script.length === 0) {
    // Fallback: create a minimal conversation if no script found
    return {
      messages: [{
        id: 'msg-npc-0',
        speaker: 'npc',
        text: "Hello! How can I help you today?",
        timestamp: Date.now(),
        wordsUsed: [],
      }],
      currentStep: 0,
      hintLevel: 0,
      isComplete: false,
      wordsUsedThisSession: [],
    };
  }
  const firstNpcText = script[0].npcText;
  return {
    messages: [
      {
        id: `msg-npc-0`,
        speaker: 'npc',
        text: firstNpcText,
        timestamp: Date.now(),
        wordsUsed: [],
      },
    ],
    currentStep: 0,
    hintLevel: 0,
    isComplete: false,
    wordsUsedThisSession: [],
  };
}

export function processUserInput(
  state: ConversationState,
  userInput: string,
  mode: ModeCode = 'survival',
  sceneId?: string
): ConversationState {
  if (state.isComplete) return state;

  const script = sceneId
    ? getConversationScriptForScene(sceneId, mode)
    : getConversationScriptByMode(mode);
  const step = script[state.currentStep];
  if (!step) return state;

  const userMessage: ConversationMessage = {
    id: `msg-user-${state.currentStep}`,
    speaker: 'user',
    text: userInput,
    timestamp: Date.now(),
    wordsUsed: extractWordsUsed(userInput),
  };

  let npcText: string;

  if (step.branches.length > 0) {
    const match = findMatchingBranch(userInput, step.branches);
    npcText = match ? match.npcText : step.fallbackNpcText;
  } else {
    npcText = step.npcText;
  }

  // Check if this step has a review word hint
  const contextChange = step.reviewWordHint ?? undefined;

  const npcMessage: ConversationMessage = {
    id: `msg-npc-${state.currentStep + 1}`,
    speaker: 'npc',
    text: npcText,
    timestamp: Date.now(),
    wordsUsed: [],
    contextChange,
  };

  const nextStep = state.currentStep + 1;
  const isComplete = nextStep >= script.length - 1;

  const farewellStep = script[script.length - 1];
  const farewellMessage: ConversationMessage | null =
    isComplete && farewellStep
      ? {
          id: `msg-npc-farewell`,
          speaker: 'npc',
          text: farewellStep.npcText,
          timestamp: Date.now(),
          wordsUsed: [],
        }
      : null;

  const allWordsUsed = [
    ...state.wordsUsedThisSession,
    ...userMessage.wordsUsed,
  ].filter((word, index, self) => self.indexOf(word) === index);

  const newMessages = farewellMessage
    ? [...state.messages, userMessage, npcMessage, farewellMessage]
    : [...state.messages, userMessage, npcMessage];

  return {
    messages: newMessages,
    currentStep: nextStep,
    hintLevel: 0,
    isComplete,
    wordsUsedThisSession: allWordsUsed,
  };
}

function extractWordsUsed(input: string): string[] {
  const allTargetWords = [
    'brew', 'recommend', 'seasonal', 'fresh', 'order', 'get', 'would like',
    'deadline', 'approach', 'handle', 'figure', 'point', 'carry', 'run',
    'appointment', 'charge', 'book', 'strike', 'pick', 'take', 'stand',
    'stuff', 'spot', 'turn',
    // Sprint 6: Professional expansion words
    'follow up', 'feedback', 'contribute', 'network', 'summarize',
    // Sprint 6: Social expansion words
    'vibe', 'crash', 'spoiler', 'trend', 'binge',
  ];
  const normalizedInput = input.toLowerCase();
  return allTargetWords.filter((word) => normalizedInput.includes(word));
}

export function getHint(state: ConversationState, mode: ModeCode = 'survival', sceneId?: string): HintContent | null {
  if (state.isComplete) return null;

  const script = sceneId
    ? getConversationScriptForScene(sceneId, mode)
    : getConversationScriptByMode(mode);
  const step = script[state.currentStep];
  if (!step) return null;

  if (state.hintLevel === 0) {
    return { level: 1, text: step.hintLevel1 };
  }

  if (state.hintLevel === 1) {
    return { level: 2, text: step.hintLevel2 };
  }

  return null;
}

export function advanceHintLevel(state: ConversationState): ConversationState {
  if (state.hintLevel < 2) {
    return { ...state, hintLevel: (state.hintLevel + 1) as 0 | 1 | 2 };
  }
  return state;
}

export function getClosingMessage(): ConversationMessage {
  return {
    id: 'msg-npc-closing',
    speaker: 'npc',
    text: 'That was great talking with you! Here is what you said today.',
    timestamp: Date.now(),
    wordsUsed: [],
  };
}