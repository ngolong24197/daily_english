/**
 * Communication Success Detection Service.
 *
 * Three-tier approach (as per architecture):
 * - Tier 1: Keyword check — does the transcription contain any relevant word?
 * - Tier 2: Contextual relevance — simple rule-based check for on-topic response
 * - Tier 3: LLM evaluation — Hugging Face structured output for borderline cases
 *
 * Default to "understood" if uncertain (never make user feel wrong).
 * When understood: conversation continues naturally.
 * When unclear: "I think you said ___, is that right?" (friendly clarification).
 *
 * If HF API key is not set, gracefully falls back to Tier 1+2 only (skip Tier 3).
 */

import type { ConversationMessage } from './conversationEngine';
import { chatCompletion, isHfAvailable, type ChatMessage } from './hfClient';

export interface CommunicationSuccessResult {
  understood: boolean;
  confidence: number;
  alternativePhrasing: string | null;
  wordsUsed: string[];
  topicRelevance: 'high' | 'medium' | 'low';
  clarification: string | null;
}

/**
 * Tier 1: Check if the transcription contains any target or review vocabulary word.
 */
function checkKeywords(
  transcript: string,
  targetWords: string[],
  reviewWords: string[]
): { match: boolean; wordsUsed: string[] } {
  const normalizedTranscript = transcript.toLowerCase();
  const allWords = [...targetWords, ...reviewWords];
  const wordsUsed: string[] = [];

  for (const word of allWords) {
    const wordLower = word.toLowerCase();
    if (normalizedTranscript.includes(wordLower)) {
      wordsUsed.push(word);
    }
  }

  return {
    match: wordsUsed.length > 0,
    wordsUsed,
  };
}

/**
 * Tier 2: Simple contextual relevance check.
 * Does the transcription seem related to the current conversation topic?
 * Uses basic heuristics — common response patterns, greetings, affirmations, etc.
 */
function checkContextualRelevance(
  transcript: string,
  conversationContext: string,
  recentPartnerMessage: string
): { relevant: boolean; confidence: number } {
  const normalizedTranscript = transcript.toLowerCase().trim();

  // Very short responses that are common in conversation
  const commonResponses = [
    'yes',
    'no',
    'yeah',
    'sure',
    'okay',
    'ok',
    'please',
    'thanks',
    'thank you',
    'sounds good',
    'that sounds',
    'i would',
    "i'd",
    'i will',
    "i'll",
    'can i',
    'could i',
    'i want',
    'i need',
    'how about',
    'what about',
    'let me',
    'nice',
    'great',
    'good',
    'right',
    'exactly',
  ];

  if (commonResponses.some((r) => normalizedTranscript.startsWith(r) || normalizedTranscript.includes(r))) {
    return { relevant: true, confidence: 0.7 };
  }

  // Check if the transcript shares any significant words with the partner's recent message
  const partnerWords = recentPartnerMessage
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3) // Only significant words
    .map((w) => w.replace(/[.,!?;:]/g, ''));

  const transcriptWords = normalizedTranscript
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .map((w) => w.replace(/[.,!?;:]/g, ''));

  const sharedWords = transcriptWords.filter((w) => partnerWords.includes(w));
  if (sharedWords.length > 0) {
    return { relevant: true, confidence: 0.65 };
  }

  // If transcript has reasonable length, it's likely an attempt at communication
  if (transcript.split(/\s+/).length >= 4) {
    return { relevant: true, confidence: 0.5 };
  }

  return { relevant: false, confidence: 0.3 };
}

/** Cache HF availability to avoid repeated checks */
let hfAvailableCache: boolean | null = null;
let hfCheckTime = 0;
const HF_CHECK_INTERVAL_MS = 30000; // Re-check every 30 seconds

/**
 * Tier 3: LLM evaluation for borderline cases.
 * Uses Hugging Face Inference API to determine if the user communicated something meaningful.
 * Falls back gracefully if API key is not set or request fails.
 */
async function checkWithLLM(
  transcript: string,
  conversationContext: string,
  targetWords: string[]
): Promise<CommunicationSuccessResult | null> {
  // Check HF availability (with caching)
  const now = Date.now();
  if (hfAvailableCache === null || now - hfCheckTime > HF_CHECK_INTERVAL_MS) {
    hfAvailableCache = await isHfAvailable();
    hfCheckTime = now;
  }

  if (!hfAvailableCache) {
    return null; // No API key — skip Tier 3
  }

  try {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a communication success detector for an English learning app. The user is learning English and practicing conversation. Today's topic is about: ${conversationContext}. Target vocabulary: ${targetWords.join(', ')}. Determine if the user's transcribed speech communicates a relevant idea in context. Always err on the side of "understood" — if the user said something meaningful even imperfectly, mark it as understood. Respond with JSON only: {"understood": bool, "confidence": 0-1, "alternative_phrasing": string|null, "words_used": [], "topic_relevance": "high"|"medium"|"low"}`,
      },
      {
        role: 'user',
        content: `User said: "${transcript}"`,
      },
    ];

    const result = await chatCompletion(messages, {
      maxTokens: 200,
      temperature: 0.3,
    });

    if (!result.ok) {
      hfAvailableCache = false;
      return null;
    }

    // Try to parse JSON from the response
    let content = result.result.content.trim();
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      content = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(content);
    return {
      understood: parsed.understood ?? true,
      confidence: parsed.confidence ?? 0.5,
      alternativePhrasing: parsed.alternative_phrasing ?? null,
      wordsUsed: parsed.words_used ?? [],
      topicRelevance: parsed.topic_relevance ?? 'medium',
      clarification: null,
    };
  } catch {
    // JSON parse error or other failure — skip Tier 3
    return null;
  }
}

/**
 * Main detection pipeline. Runs the three tiers in sequence.
 * This runs asynchronously and should NOT block the conversation partner's response.
 *
 * @param transcript     - The ASR transcription of what the user said
 * @param targetWords    - Today's new vocabulary words
 * @param reviewWords    - Previously learned review words
 * @param conversationContext - Description of the current conversation scene
 * @param messages       - Recent conversation messages for context
 */
export async function detectCommunicationSuccess(
  transcript: string,
  targetWords: string[],
  reviewWords: string[],
  conversationContext: string,
  messages: ConversationMessage[]
): Promise<CommunicationSuccessResult> {
  // Tier 1: Keyword check
  const keywordResult = checkKeywords(transcript, targetWords, reviewWords);
  if (keywordResult.match) {
    return {
      understood: true,
      confidence: 0.85,
      alternativePhrasing: null,
      wordsUsed: keywordResult.wordsUsed,
      topicRelevance: 'high',
      clarification: null,
    };
  }

  // Tier 2: Contextual relevance
  const recentPartnerMessage =
    messages
      .filter((m) => m.speaker === 'npc')
      .slice(-1)[0]?.text ?? '';

  const contextResult = checkContextualRelevance(
    transcript,
    conversationContext,
    recentPartnerMessage
  );

  if (contextResult.relevant && contextResult.confidence >= 0.6) {
    return {
      understood: true,
      confidence: contextResult.confidence,
      alternativePhrasing: null,
      wordsUsed: keywordResult.wordsUsed,
      topicRelevance: contextResult.confidence >= 0.7 ? 'high' : 'medium',
      clarification: null,
    };
  }

  // Tier 3: LLM evaluation (only for borderline cases)
  const llmResult = await checkWithLLM(transcript, conversationContext, targetWords);
  if (llmResult) {
    return llmResult;
  }

  // Default: err on the side of "understood" (per product philosophy)
  // If ASR transcribed something, we assume the user communicated
  return {
    understood: true,
    confidence: 0.4,
    alternativePhrasing: null,
    wordsUsed: keywordResult.wordsUsed,
    topicRelevance: 'low',
    clarification: `I think you said "${transcript}", is that right?`,
  };
}

/**
 * Quick synchronous check for Tier 1 + Tier 2 only (no LLM call).
 * Useful for immediate feedback before the async LLM result comes back.
 */
export function quickCheckCommunicationSuccess(
  transcript: string,
  targetWords: string[],
  reviewWords: string[],
  conversationContext: string,
  recentPartnerMessage: string
): CommunicationSuccessResult {
  const keywordResult = checkKeywords(transcript, targetWords, reviewWords);
  if (keywordResult.match) {
    return {
      understood: true,
      confidence: 0.85,
      alternativePhrasing: null,
      wordsUsed: keywordResult.wordsUsed,
      topicRelevance: 'high',
      clarification: null,
    };
  }

  const contextResult = checkContextualRelevance(
    transcript,
    conversationContext,
    recentPartnerMessage
  );

  return {
    understood: true, // Default to understood
    confidence: contextResult.confidence,
    alternativePhrasing: null,
    wordsUsed: keywordResult.wordsUsed,
    topicRelevance: contextResult.confidence >= 0.6 ? 'medium' : 'low',
    clarification:
      contextResult.confidence < 0.5
        ? `I think you said "${transcript}", is that right?`
        : null,
  };
}