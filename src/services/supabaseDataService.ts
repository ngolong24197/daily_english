import { supabase } from '../lib/supabase';
import type { ModeCode, WordModeEntry } from '../types';
import {
  WORDS,
  SCENES,
  getSceneForMoodAndMode as mockGetSceneForMoodAndMode,
  type MockWord,
  type MockScene,
  type ConversationStep,
  type ConversationBranch,
} from './mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Supabase row types (snake_case from PostgreSQL)
// ─────────────────────────────────────────────────────────────────────────────

interface SupabaseWord {
  id: string;
  lemma: string;
  pos: string;
  frequency_rank: number | null;
  difficulty_level: string;
  is_new: boolean;
  created_at: string;
}

interface SupabaseWordModeEntry {
  id: string;
  word_id: string;
  mode_code: ModeCode;
  meaning_context: string;
  register: string;
  example_sentence: string;
  example_context: string;
  audio_id: string | null;
}

interface SupabaseScene {
  id: string;
  track_code: string;
  mode_code: ModeCode;
  title: string;
  description: string;
  target_word_ids: string[];
  review_word_ids: string[];
  dialogue_text: string;
  audio_url: string | null;
  created_at: string;
}

interface SupabaseConversationScript {
  scene_id: string;
  script_data: ConversationStepRow[];
}

interface ConversationStepRow {
  npcText: string;
  branches: ConversationBranchRow[];
  fallbackNpcText: string;
  hintLevel1: string;
  hintLevel2: string;
  reviewWordHint?: string;
}

interface ConversationBranchRow {
  matchPatterns: string[];
  npcText: string;
  hintLevel1: string;
  hintLevel2: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory cache
// ─────────────────────────────────────────────────────────────────────────────

let cachedWords: Record<string, MockWord> | null = null;
let cachedScenes: Record<string, MockScene> | null = null;
let cachedScripts: Record<string, ConversationStep[]> | null = null;
let preloadComplete = false;

// ─────────────────────────────────────────────────────────────────────────────
// Adapter: Supabase rows → MockWord/MockScene/ConversationStep[]
// ─────────────────────────────────────────────────────────────────────────────

function toWordModeEntry(row: SupabaseWordModeEntry): WordModeEntry {
  return {
    id: row.id,
    word_id: row.word_id,
    mode_code: row.mode_code,
    meaning_context: row.meaning_context,
    register: row.register as WordModeEntry['register'],
    example_sentence: row.example_sentence,
    example_context: row.example_context,
    audio_id: row.audio_id,
  };
}

function toMockWord(
  word: SupabaseWord,
  modeEntries: SupabaseWordModeEntry[],
): MockWord {
  const entries: Partial<Record<ModeCode, WordModeEntry>> = {};
  for (const entry of modeEntries) {
    entries[entry.mode_code] = toWordModeEntry(entry);
  }
  return {
    id: word.id,
    lemma: word.lemma,
    pos: word.pos,
    modeEntries: entries,
    isNew: word.is_new,
  };
}

function toMockScene(
  scene: SupabaseScene,
  wordMap: Record<string, MockWord>,
): MockScene {
  const newWords = scene.target_word_ids
    .map((id) => wordMap[id])
    .filter((w): w is MockWord => w != null);
  const reviewWords = scene.review_word_ids
    .map((id) => wordMap[id])
    .filter((w): w is MockWord => w != null);
  return {
    id: scene.id,
    title: scene.title,
    description: scene.description,
    dialogueText: scene.dialogue_text,
    newWords,
    reviewWords,
    modeCode: scene.mode_code,
  };
}

function toConversationSteps(rows: ConversationStepRow[]): ConversationStep[] {
  return rows.map((row) => ({
    npcText: row.npcText,
    branches: row.branches.map((b) => ({
      matchPatterns: b.matchPatterns,
      npcText: b.npcText,
      hintLevel1: b.hintLevel1,
      hintLevel2: b.hintLevel2,
    })),
    fallbackNpcText: row.fallbackNpcText,
    hintLevel1: row.hintLevel1,
    hintLevel2: row.hintLevel2,
    ...(row.reviewWordHint ? { reviewWordHint: row.reviewWordHint } : {}),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Preload: fetch from Supabase, populate cache
// ─────────────────────────────────────────────────────────────────────────────

export async function preloadData(): Promise<void> {
  if (preloadComplete) return;

  try {
    const [wordsRes, modeEntriesRes, scenesRes, scriptsRes] = await Promise.all([
      supabase.from('words').select('*'),
      supabase.from('word_mode_entries').select('*'),
      supabase.from('scenes').select('*'),
      supabase.from('conversation_scripts').select('*'),
    ]);

    if (wordsRes.error) throw wordsRes.error;
    if (modeEntriesRes.error) throw modeEntriesRes.error;
    if (scenesRes.error) throw scenesRes.error;
    if (scriptsRes.error) throw scriptsRes.error;

    const supabaseWords = wordsRes.data as SupabaseWord[];
    const supabaseModeEntries = modeEntriesRes.data as SupabaseWordModeEntry[];
    const supabaseScenes = scenesRes.data as SupabaseScene[];
    const supabaseScripts = scriptsRes.data as SupabaseConversationScript[];

    // Group mode entries by word_id
    const entriesByWordId: Record<string, SupabaseWordModeEntry[]> = {};
    for (const entry of supabaseModeEntries) {
      if (!entriesByWordId[entry.word_id]) {
        entriesByWordId[entry.word_id] = [];
      }
      entriesByWordId[entry.word_id].push(entry);
    }

    // Build word cache
    const wordMap: Record<string, MockWord> = {};
    for (const word of supabaseWords) {
      wordMap[word.id] = toMockWord(word, entriesByWordId[word.id] ?? []);
    }
    cachedWords = wordMap;

    // Build scene cache
    const sceneMap: Record<string, MockScene> = {};
    for (const scene of supabaseScenes) {
      sceneMap[scene.id] = toMockScene(scene, wordMap);
    }
    cachedScenes = sceneMap;

    // Build script cache
    const scriptMap: Record<string, ConversationStep[]> = {};
    for (const script of supabaseScripts) {
      scriptMap[script.scene_id] = toConversationSteps(script.script_data);
    }
    cachedScripts = scriptMap;

    preloadComplete = true;
    console.log(
      `[supabaseDataService] Preloaded ${supabaseWords.length} words, ${supabaseScenes.length} scenes, ${supabaseScripts.length} scripts from Supabase`,
    );
  } catch (err) {
    console.warn('[supabaseDataService] Preload failed, will use mockData:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public query functions — cache → mockData fallback
// ─────────────────────────────────────────────────────────────────────────────

export function getWords(): Record<string, MockWord> {
  return cachedWords ?? WORDS;
}

export function getWordsForMode(mode: ModeCode): MockWord[] {
  const source = cachedWords ?? WORDS;
  return Object.values(source).filter((word) => mode in word.modeEntries);
}

export function getWordById(wordId: string): MockWord | undefined {
  const source = cachedWords ?? WORDS;
  return source[wordId];
}

export function getScenes(): Record<string, MockScene> {
  return cachedScenes ?? SCENES;
}

export function getSceneById(sceneId: string): MockScene | undefined {
  const source = cachedScenes ?? SCENES;
  return source[sceneId];
}

export function getSceneForMoodAndMode(mood: string, mode: ModeCode): MockScene {
  if (cachedScenes) {
    const result = mockGetSceneForMoodAndMode(mood, mode);
    // Re-resolve against cache (scene objects from mockData point to mockData words)
    return cachedScenes[result.id] ?? result;
  }
  return mockGetSceneForMoodAndMode(mood, mode);
}

export function getConversationScript(sceneId: string): ConversationStep[] | null {
  if (cachedScripts && cachedScripts[sceneId]) {
    return cachedScripts[sceneId];
  }
  return null;
}

export function isPreloaded(): boolean {
  return preloadComplete;
}