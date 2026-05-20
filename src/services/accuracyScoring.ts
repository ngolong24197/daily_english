/**
 * Accuracy Scoring Service — Provides feedback on exam-mode conversations.
 *
 * For IELTS: Band score estimation (4.0-9.0 scale)
 * For TOEIC: Score estimation (0-200 scale)
 *
 * The tone is ALWAYS supportive: "Here's how to improve" not "You got this wrong."
 * When isExamMode is true, show accuracy hints; when false, use "understood > correct."
 */

import type { ModeCode } from '../types';
import type { ConversationMessage } from './conversationEngine';
import type { ExamResponse } from './examStructure';

// ─── Score Types ──────────────────────────────────────────────────────────────

export interface AccuracyScore {
  /** IELTS band range (e.g., "5.5-6.5") or TOEIC score range (e.g., "120-150") */
  bandRange: string;
  /** Overall numeric midpoint for display */
  numericMidpoint: number;
  /** Breakdown by scoring dimension */
  breakdown: ScoreBreakdown;
  /** What the user did well (2-3 positive points) */
  strengths: string[];
  /** Areas to improve (2-3 suggestions, phrased supportively) */
  improvements: string[];
  /** Words used correctly during the exam */
  wordsUsedCorrectly: string[];
  /** The exam type */
  examType: 'ielts' | 'toeic';
}

export interface ScoreBreakdown {
  vocabulary: DimensionScore;
  grammar: DimensionScore;
  fluency: DimensionScore;
  relevance: DimensionScore;
}

export interface DimensionScore {
  /** Dimension name */
  label: string;
  /** Numeric score for this dimension (IELTS: 4.0-9.0, TOEIC: 0-200) */
  score: number;
  /** Brief descriptor: 'Developing' | 'Competent' | 'Strong' */
  level: 'Developing' | 'Competent' | 'Strong';
  /** A short, supportive comment about this dimension */
  comment: string;
  /** Visual indicator: 0-100 percentage for progress bar display */
  percentage: number;
}

// ─── Target Word Lists for Accuracy Detection ──────────────────────────────────

const ACADEMIC_WORDS = [
  'approach', 'handle', 'figure', 'point', 'carry', 'run', 'deadline',
  'recommend', 'seasonal', 'fresh', 'order', 'would like', 'get',
  'appointment', 'charge', 'book', 'strike', 'pick', 'take', 'stand',
  'stuff', 'spot', 'turn', 'consequently', 'furthermore', 'moreover',
  'nevertheless', 'however', 'therefore', 'demonstrate', 'significant',
  'contribute', 'establish', 'indicate', 'require', 'determine',
  'assessment', 'perspective', 'fundamental', 'implement', 'analyze',
];

const FORMAL_CONNECTORS = [
  'furthermore', 'moreover', 'nevertheless', 'consequently', 'therefore',
  'however', 'in addition', 'on the other hand', 'in contrast', 'as a result',
  'for instance', 'in particular', 'specifically', 'generally', 'typically',
];

const GRAMMAR_PATTERNS = {
  /** Common grammar errors that suggest lower grammar scores */
  errors: [
    { pattern: /\bi\s+(?:am|was|have|will|would|can|could|should|do|did)\b/i, label: 'informal_capitalization' },
    { pattern: /\bhe\s+don't\b/i, label: 'subject_verb_agreement' },
    { pattern: /\bshe\s+don't\b/i, label: 'subject_verb_agreement' },
    { pattern: /\bthey\s+(?:was|is)\b/i, label: 'subject_verb_agreement' },
    { pattern: /\b(?:have|has)\s+went\b/i, label: 'past_participle' },
    { pattern: /\bmore\s+(?:better|easier|faster)\b/i, label: 'double_comparative' },
  ],
  /** Advanced grammar patterns that suggest higher scores */
  advanced: [
    { pattern: /\b(?:would|could|might|should)\s+have\s+\w+ed\b/i, label: 'modal_perfect' },
    { pattern: /\b(?:if|when|unless|provided)\s+\w+\s+(?:would|could|might)/i, label: 'conditional' },
    { pattern: /\b(?:although|despite|whereas|while)\b/i, label: 'contrast_conjunction' },
    { pattern: /\b(?:passive|is|are|was|were)\s+\w+ed\s+by\b/i, label: 'passive_voice' },
    { pattern: /\b(?:has|have|had)\s+been\s+\w+ing\b/i, label: 'perfect_continuous' },
  ],
};

// ─── Scoring Functions ──────────────────────────────────────────────────────────

/**
 * Calculate an accuracy score for an exam-mode conversation.
 *
 * This is a heuristic-based scorer that analyzes:
 * - Vocabulary range (use of academic/formal words)
 * - Grammar sophistication (use of advanced structures, absence of common errors)
 * - Fluency (response length and timing)
 * - Relevance (on-topic responses with appropriate content)
 *
 * The scoring is supportive and formative, not punitive.
 */
export function calculateAccuracyScore(
  messages: ConversationMessage[],
  responses: ExamResponse[],
  examType: 'ielts' | 'toeic',
  targetWords: string[]
): AccuracyScore {
  const userMessages = messages.filter((m) => m.speaker === 'user');
  const userTexts = userMessages.map((m) => m.text);
  const combinedText = userTexts.join(' ').toLowerCase();

  // Calculate individual dimension scores
  const vocabularyScore = scoreVocabulary(combinedText, targetWords, examType);
  const grammarScore = scoreGrammar(combinedText, examType);
  const fluencyScore = scoreFluency(userMessages, responses, examType);
  const relevanceScore = scoreRelevance(userTexts, examType);

  const breakdown: ScoreBreakdown = {
    vocabulary: vocabularyScore,
    grammar: grammarScore,
    fluency: fluencyScore,
    relevance: relevanceScore,
  };

  // Calculate overall band range
  const dimensionScores = [vocabularyScore.score, grammarScore.score, fluencyScore.score, relevanceScore.score];
  const averageScore = dimensionScores.reduce((a, b) => a + b, 0) / dimensionScores.length;

  let bandRange: string;
  let numericMidpoint: number;

  if (examType === 'ielts') {
    bandRange = getIELTSBandRange(averageScore);
    numericMidpoint = averageScore;
  } else {
    bandRange = getTOEICScoreRange(averageScore);
    numericMidpoint = averageScore;
  }

  // Generate strengths and improvements
  const strengths = generateStrengths(breakdown, combinedText, targetWords);
  const improvements = generateImprovements(breakdown, combinedText);

  // Find words used correctly
  const wordsUsedCorrectly = targetWords.filter((word) =>
    combinedText.includes(word.toLowerCase())
  );

  return {
    bandRange,
    numericMidpoint,
    breakdown,
    strengths,
    improvements,
    wordsUsedCorrectly,
    examType,
  };
}

// ─── Dimension Scoring ────────────────────────────────────────────────────────

function scoreVocabulary(
  text: string,
  targetWords: string[],
  examType: 'ielts' | 'toeic'
): DimensionScore {
  const lowerText = text;

  // Count target words used
  const targetWordsUsed = targetWords.filter((w) =>
    lowerText.includes(w.toLowerCase())
  ).length;

  // Count academic/formal words used
  const academicWordsUsed = ACADEMIC_WORDS.filter((w) =>
    lowerText.includes(w.toLowerCase())
  ).length;

  // Count unique words (vocabulary diversity)
  const uniqueWords = new Set(lowerText.split(/\s+/).filter((w) => w.length > 3));
  const wordDiversity = Math.min(uniqueWords.size / 20, 1); // Normalize to 0-1

  // Calculate score
  const targetScore = Math.min(targetWordsUsed / 3, 1); // Using 3+ target words is great
  const academicScore = Math.min(academicWordsUsed / 4, 1); // Using 4+ academic words is great
  const rawScore = targetScore * 0.4 + academicScore * 0.3 + wordDiversity * 0.3;

  const scale = examType === 'ielts' ? { min: 4.0, max: 9.0 } : { min: 40, max: 200 };
  const score = scale.min + rawScore * (scale.max - scale.min);
  const percentage = Math.round(rawScore * 100);

  let level: DimensionScore['level'];
  if (rawScore >= 0.7) level = 'Strong';
  else if (rawScore >= 0.4) level = 'Competent';
  else level = 'Developing';

  const comments: Record<string, string> = {
    Developing: 'Try using a wider range of vocabulary. Practice incorporating the target words into your responses.',
    Competent: 'Good word choices. Try adding more formal connectors like "furthermore" or "however" to strengthen your responses.',
    Strong: 'Excellent vocabulary range. Your word choices are appropriate and varied.',
  };

  return {
    label: 'Vocabulary',
    score: Math.round(score * 10) / 10,
    level,
    comment: comments[level],
    percentage,
  };
}

function scoreGrammar(text: string, examType: 'ielts' | 'toeic'): DimensionScore {
  // Check for common errors
  let errorCount = 0;
  for (const { pattern } of GRAMMAR_PATTERNS.errors) {
    if (pattern.test(text)) errorCount++;
  }

  // Check for advanced patterns
  let advancedCount = 0;
  for (const { pattern } of GRAMMAR_PATTERNS.advanced) {
    if (pattern.test(text)) advancedCount++;
  }

  // Check sentence length and complexity
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    : 0;

  // Calculate raw score
  const errorPenalty = Math.min(errorCount * 0.15, 0.5);
  const advancedBonus = Math.min(advancedCount * 0.1, 0.3);
  const lengthScore = Math.min(avgSentenceLength / 15, 1); // 15 words avg is great

  const rawScore = Math.max(0, Math.min(1, lengthScore * 0.5 + advancedBonus - errorPenalty + 0.3));

  const scale = examType === 'ielts' ? { min: 4.0, max: 9.0 } : { min: 40, max: 200 };
  const score = scale.min + rawScore * (scale.max - scale.min);
  const percentage = Math.round(rawScore * 100);

  let level: DimensionScore['level'];
  if (rawScore >= 0.7) level = 'Strong';
  else if (rawScore >= 0.4) level = 'Competent';
  else level = 'Developing';

  const comments: Record<string, string> = {
    Developing: 'Focus on building longer, more complex sentences. Try using "however" and "although" to connect your ideas.',
    Competent: 'Your grammar is solid. Try incorporating conditional structures ("If I had...") and passive voice to show range.',
    Strong: 'Well-structured sentences with good variety. Your grammar supports your ideas effectively.',
  };

  return {
    label: 'Grammar',
    score: Math.round(score * 10) / 10,
    level,
    comment: comments[level],
    percentage,
  };
}

function scoreFluency(
  messages: ConversationMessage[],
  responses: ExamResponse[],
  examType: 'ielts' | 'toeic'
): DimensionScore {
  const userMessages = messages.filter((m) => m.speaker === 'user');

  // Measure: number of words per response
  const wordsPerResponse = userMessages.length > 0
    ? userMessages.reduce((sum, m) => sum + m.text.split(/\s+/).length, 0) / userMessages.length
    : 0;

  // Measure: total words spoken
  const totalWords = userMessages.reduce(
    (sum, m) => sum + m.text.split(/\s+/).length,
    0
  );

  // Measure: response count (more turns = more fluent engagement)
  const responseCount = userMessages.length;

  // Calculate raw score
  const lengthScore = Math.min(wordsPerResponse / 15, 1); // 15 words per response is good
  const totalScore = Math.min(totalWords / 80, 1); // 80+ total words is great
  const turnScore = Math.min(responseCount / 4, 1); // 4+ turns is ideal

  const rawScore = lengthScore * 0.4 + totalScore * 0.3 + turnScore * 0.3;

  const scale = examType === 'ielts' ? { min: 4.0, max: 9.0 } : { min: 40, max: 200 };
  const score = scale.min + rawScore * (scale.max - scale.min);
  const percentage = Math.round(rawScore * 100);

  let level: DimensionScore['level'];
  if (rawScore >= 0.7) level = 'Strong';
  else if (rawScore >= 0.4) level = 'Competent';
  else level = 'Developing';

  const comments: Record<string, string> = {
    Developing: 'Try to speak in longer sentences. Expand on your answers — aim for 2-3 sentences per response.',
    Competent: 'Good flow. Try to keep your pace steady and avoid long pauses between ideas.',
    Strong: 'Fluent and natural delivery. Your responses flow well and demonstrate confidence.',
  };

  return {
    label: 'Fluency',
    score: Math.round(score * 10) / 10,
    level,
    comment: comments[level],
    percentage,
  };
}

function scoreRelevance(
  userTexts: string[],
  examType: 'ielts' | 'toeic'
): DimensionScore {
  // Check if user responses are on-topic and answer the question
  // Heuristic: longer responses with topic-relevant words score higher

  const combinedText = userTexts.join(' ').toLowerCase();

  // Topic relevance markers
  const relevanceMarkers = [
    'think', 'believe', 'opinion', 'because', 'reason', 'for example',
    'instance', 'such as', 'specifically', 'personally', 'experience',
    'feel', 'consider', 'important', 'approach', 'point', 'however',
    'also', 'moreover', 'addition', 'would', 'could', 'should',
  ];

  const markerCount = relevanceMarkers.filter((m) => combinedText.includes(m)).length;
  const rawScore = Math.min(markerCount / 5, 1); // 5+ markers is strong

  // Bonus for answering in multiple sentences
  const sentenceCount = combinedText.split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  const sentenceBonus = Math.min(sentenceCount / 5, 0.3);
  const totalScore = Math.min(rawScore + sentenceBonus, 1);

  const scale = examType === 'ielts' ? { min: 4.0, max: 9.0 } : { min: 40, max: 200 };
  const score = scale.min + totalScore * (scale.max - scale.min);
  const percentage = Math.round(totalScore * 100);

  let level: DimensionScore['level'];
  if (totalScore >= 0.7) level = 'Strong';
  else if (totalScore >= 0.4) level = 'Competent';
  else level = 'Developing';

  const comments: Record<string, string> = {
    Developing: 'Try to answer the question directly. Start with your main point, then give a reason or example.',
    Competent: 'Good at staying on topic. Try giving specific examples to support your points.',
    Strong: 'Well-focused responses that directly address the question with supporting details.',
  };

  return {
    label: 'Relevance',
    score: Math.round(score * 10) / 10,
    level,
    comment: comments[level],
    percentage,
  };
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getIELTSBandRange(averageScore: number): string {
  if (averageScore >= 8.5) return '8.5-9.0';
  if (averageScore >= 7.5) return '7.5-8.0';
  if (averageScore >= 6.5) return '6.5-7.0';
  if (averageScore >= 5.5) return '5.5-6.0';
  if (averageScore >= 4.5) return '4.5-5.0';
  return '4.0-4.5';
}

function getTOEICScoreRange(averageScore: number): string {
  if (averageScore >= 170) return '170-190';
  if (averageScore >= 140) return '140-170';
  if (averageScore >= 110) return '110-140';
  if (averageScore >= 80) return '80-110';
  return '40-80';
}

function generateStrengths(
  breakdown: ScoreBreakdown,
  text: string,
  targetWords: string[]
): string[] {
  const strengths: string[] = [];

  // Vocabulary strength
  const targetWordsUsed = targetWords.filter((w) =>
    text.includes(w.toLowerCase())
  );
  if (targetWordsUsed.length > 0) {
    strengths.push(
      `You used exam vocabulary well: "${targetWordsUsed.slice(0, 3).join('", "')}"${targetWordsUsed.length > 3 ? ` and ${targetWordsUsed.length - 3} more` : ''}.`
    );
  }

  // Relevance strength
  if (breakdown.relevance.level !== 'Developing') {
    strengths.push('Your responses stayed on topic and addressed the questions directly.');
  }

  // Fluency strength
  if (breakdown.fluency.level !== 'Developing') {
    strengths.push('You spoke at a good pace with natural flow.');
  }

  // Grammar strength
  if (breakdown.grammar.level === 'Strong') {
    strengths.push('Your sentence structures were varied and grammatically sound.');
  }

  // Ensure at least 2 strengths
  if (strengths.length < 2) {
    strengths.push('You completed the practice, which is a great step toward exam readiness.');
  }

  return strengths.slice(0, 3);
}

function generateImprovements(
  breakdown: ScoreBreakdown,
  text: string
): string[] {
  const improvements: string[] = [];

  // Vocabulary improvement
  if (breakdown.vocabulary.level === 'Developing') {
    improvements.push(
      'Try using more varied vocabulary. Practice words like "furthermore," "consequently," and "in particular" to strengthen your responses.'
    );
  } else if (breakdown.vocabulary.level === 'Competent') {
    improvements.push(
      'Good word choices. To reach a higher level, try incorporating more formal connectors like "nevertheless" and "in contrast."'
    );
  }

  // Grammar improvement
  if (breakdown.grammar.level === 'Developing') {
    improvements.push(
      'Focus on building longer sentences with connectors. Try: "Although..., I believe..." or "The main reason is that..."'
    );
  } else if (breakdown.grammar.level === 'Competent') {
    improvements.push(
      'Try using conditional sentences ("If I had more time, I would...") and passive voice to add grammatical range.'
    );
  }

  // Fluency improvement
  if (breakdown.fluency.level === 'Developing') {
    improvements.push(
      'Aim for 2-3 sentences per response. Start with your main idea, then add a reason or example.'
    );
  } else if (breakdown.fluency.level === 'Competent') {
    improvements.push(
      'Your flow is good. Practice reducing pauses by preparing key phrases before speaking.'
    );
  }

  // Relevance improvement
  if (breakdown.relevance.level === 'Developing') {
    improvements.push(
      'Make sure to answer the question directly first, then elaborate with your reasoning.'
    );
  }

  // Ensure at least 2 improvements
  if (improvements.length < 2) {
    improvements.push('Keep practicing — consistency is the key to improvement.');
  }

  return improvements.slice(0, 3);
}

/**
 * Generate a quick accuracy hint during exam mode conversation.
 * This is different from the full score card — it's shown inline
 * during the conversation when isExamMode is true.
 */
export function generateAccuracyHint(
  userText: string,
  isExamMode: boolean
): string | null {
  if (!isExamMode) return null;

  const lowerText = userText.toLowerCase();

  // Check for very short responses in exam mode
  const wordCount = lowerText.split(/\s+/).filter((w) => w.length > 0).length;
  if (wordCount < 5) {
    return 'Try to expand your answer. Aim for 2-3 sentences with specific details.';
  }

  // Check for informal language in exam mode
  const informalPatterns = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'yeah', 'nah', 'ok'];
  const foundInformal = informalPatterns.find((p) => lowerText.includes(p));
  if (foundInformal) {
    return `In exam mode, try using more formal language. Instead of "${foundInformal}", try "going to," "want to," or "must."`;
  }

  // Check for lack of reasoning words
  const reasoningWords = ['because', 'since', 'therefore', 'however', 'although', 'for example', 'for instance'];
  const hasReasoning = reasoningWords.some((w) => lowerText.includes(w));
  if (!hasReasoning && wordCount > 10) {
    return 'Try adding reasoning words like "because" or "for example" to support your answers.';
  }

  return null;
}