export type WordStatus = 'new' | 'seen' | 'practiced' | 'used' | 'mastered';
export type ModeCode = 'survival' | 'professional' | 'social' | 'ielts' | 'toeic';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type Register = 'informal' | 'neutral' | 'formal';
export type TrackType = 'daily_speaking' | 'exam_prep';
export type TurnSpeaker = 'user' | 'npc';
export type TurnSource = 'scripted' | 'llm';
export type ScenarioDifficulty = 'guided' | 'supported' | 'free';

export interface Word {
  id: string;
  lemma: string;
  pos: string;
  frequency_rank: number;
  difficulty_level: DifficultyLevel;
  created_at: string;
}

export interface WordModeEntry {
  id: string;
  word_id: string;
  mode_code: ModeCode;
  meaning_context: string;
  register: Register;
  example_sentence: string;
  example_context: string;
  audio_id: string | null;
}

export interface ModeExample {
  id: string;
  word_mode_entry_id: string;
  sentence: string;
  context: string;
  audio_id: string | null;
}

export interface PracticeScenario {
  id: string;
  word_mode_entry_id: string;
  scenario_prompt: string;
  expected_phrases: string[];
  hint_text: string;
  difficulty: ScenarioDifficulty;
}

export interface Mode {
  code: ModeCode;
  display_name: string;
  track_type: TrackType;
  description: string;
  is_premium: boolean;
}

export interface Track {
  code: string;
  name: string;
  mode_code: ModeCode;
  is_premium: boolean;
  description: string;
  word_count: number;
}

export interface Scene {
  id: string;
  track_code: string;
  mode_code: ModeCode;
  title: string;
  description: string;
  target_word_ids: string[];
  review_word_ids: string[];
  audio_url: string | null;
  created_at: string;
}

export interface ConversationScript {
  id: string;
  scene_id: string;
  script_data: ScriptNode;
}

export interface ScriptNode {
  id: string;
  npc_text: string;
  npc_audio_url: string | null;
  branches: ScriptBranch[];
}

export interface ScriptBranch {
  match_patterns: string[];
  next_node: string;
  match_type: 'keyword' | 'fallback';
  hint?: string;
}

export interface UserWordProgress {
  id: string;
  user_id: string;
  word_id: string;
  mode_code: ModeCode;
  status: WordStatus;
  times_seen: number;
  times_practiced: number;
  times_used_in_context: number;
  contexts_used: string[];
  next_review_date: string | null;
  last_review_date: string | null;
  last_review_context: string | null;
}

export interface ConversationSession {
  id: string;
  user_id: string;
  scene_id: string;
  started_at: string;
  ended_at: string | null;
  mode_code: ModeCode;
  day_response: string | null;
  words_introduced: string[];
  words_reviewed: string[];
  user_sentences: string[];
  is_exam_mode: boolean;
  exam_score: ExamScore | null;
}

export interface ConversationTurn {
  id: string;
  session_id: string;
  turn_number: number;
  speaker: TurnSpeaker;
  text: string;
  audio_url: string | null;
  asr_confidence: number | null;
  source: TurnSource;
  words_used: string[];
  alternative_phrasing: string | null;
  created_at: string;
}

export interface ExamScore {
  band_range: string;
  areas_for_improvement: string[];
  words_used_correctly: string[];
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  current_mode: ModeCode;
  daily_word_count: number;
  created_at: string;
  last_session_at: string | null;
}