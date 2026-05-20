-- Daily English: Initial Database Schema
-- Creates all core tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MODES
-- ============================================
CREATE TABLE modes (
  code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  track_type TEXT NOT NULL CHECK (track_type IN ('daily_speaking', 'exam_prep')),
  description TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO modes (code, display_name, track_type, description, is_premium) VALUES
  ('survival', 'Survival', 'daily_speaking', 'Navigate daily life in an English-speaking country', FALSE),
  ('professional', 'Professional', 'daily_speaking', 'Communicate confidently at work', TRUE),
  ('social', 'Social', 'daily_speaking', 'Understand memes, game, and chat with friends', TRUE),
  ('ielts', 'IELTS', 'exam_prep', 'Practice for the IELTS speaking test', TRUE),
  ('toeic', 'TOEIC', 'exam_prep', 'Practice for the TOEIC speaking test', TRUE);

-- ============================================
-- TRACKS
-- ============================================
CREATE TABLE tracks (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  mode_code TEXT NOT NULL REFERENCES modes(code),
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0
);

INSERT INTO tracks (code, name, mode_code, is_premium, description, word_count) VALUES
  ('survival', 'Daily Life', 'survival', FALSE, 'Navigate daily life -- doctor, bank, grocery, small talk', 50),
  ('professional', 'Work', 'professional', TRUE, 'Communicate at work -- meetings, email, presentations', 50),
  ('social', 'Social', 'social', TRUE, 'Understand memes, game in English, chat with friends', 50),
  ('ielts', 'IELTS Prep', 'ielts', TRUE, 'Structured IELTS speaking practice with scoring', 50),
  ('toeic', 'TOEIC Prep', 'toeic', TRUE, 'Structured TOEIC speaking practice with scoring', 50);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  current_mode TEXT NOT NULL DEFAULT 'survival' REFERENCES modes(code),
  daily_word_count INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_session_at TIMESTAMPTZ
);

-- ============================================
-- WORDS
-- ============================================
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lemma TEXT NOT NULL,
  pos TEXT NOT NULL,
  frequency_rank INTEGER,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_words_lemma ON words(lemma);
CREATE INDEX idx_words_frequency ON words(frequency_rank);

-- ============================================
-- WORD MODE ENTRIES
-- ============================================
CREATE TABLE word_mode_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  mode_code TEXT NOT NULL REFERENCES modes(code),
  meaning_context TEXT NOT NULL,
  register TEXT NOT NULL DEFAULT 'neutral' CHECK (register IN ('informal', 'neutral', 'formal')),
  example_sentence TEXT NOT NULL,
  example_context TEXT NOT NULL,
  audio_id UUID,
  UNIQUE(word_id, mode_code)
);

CREATE INDEX idx_wme_word_id ON word_mode_entries(word_id);
CREATE INDEX idx_wme_mode_code ON word_mode_entries(mode_code);

-- ============================================
-- MODE EXAMPLES
-- ============================================
CREATE TABLE mode_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_mode_entry_id UUID NOT NULL REFERENCES word_mode_entries(id) ON DELETE CASCADE,
  sentence TEXT NOT NULL,
  context TEXT NOT NULL,
  audio_id UUID
);

CREATE INDEX idx_me_entry_id ON mode_examples(word_mode_entry_id);

-- ============================================
-- PRACTICE SCENARIOS
-- ============================================
CREATE TABLE practice_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_mode_entry_id UUID NOT NULL REFERENCES word_mode_entries(id) ON DELETE CASCADE,
  scenario_prompt TEXT NOT NULL,
  expected_phrases TEXT[] NOT NULL DEFAULT '{}',
  hint_text TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'guided' CHECK (difficulty IN ('guided', 'supported', 'free'))
);

CREATE INDEX idx_ps_entry_id ON practice_scenarios(word_mode_entry_id);

-- ============================================
-- SCENES
-- ============================================
CREATE TABLE scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_code TEXT NOT NULL REFERENCES tracks(code),
  mode_code TEXT NOT NULL REFERENCES modes(code),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_word_ids UUID[] NOT NULL DEFAULT '{}',
  review_word_ids UUID[] NOT NULL DEFAULT '{}',
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scenes_track ON scenes(track_code);
CREATE INDEX idx_scenes_mode ON scenes(mode_code);

-- ============================================
-- CONVERSATION SCRIPTS
-- ============================================
CREATE TABLE conversation_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scene_id UUID NOT NULL REFERENCES scenes(id) ON DELETE CASCADE,
  script_data JSONB NOT NULL,
  UNIQUE(scene_id)
);

-- ============================================
-- TRACK WORDS
-- ============================================
CREATE TABLE track_words (
  track_code TEXT NOT NULL REFERENCES tracks(code),
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (track_code, word_id)
);

-- ============================================
-- USER WORD PROGRESS
-- ============================================
CREATE TABLE user_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  mode_code TEXT NOT NULL REFERENCES modes(code),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'practiced', 'used', 'mastered')),
  times_seen INTEGER NOT NULL DEFAULT 0,
  times_practiced INTEGER NOT NULL DEFAULT 0,
  times_used_in_context INTEGER NOT NULL DEFAULT 0,
  contexts_used TEXT[] NOT NULL DEFAULT '{}',
  next_review_date TIMESTAMPTZ,
  last_review_date TIMESTAMPTZ,
  last_review_context TEXT,
  UNIQUE(user_id, word_id, mode_code)
);

CREATE INDEX idx_uwp_user_id ON user_word_progress(user_id);
CREATE INDEX idx_uwp_word_id ON user_word_progress(word_id);
CREATE INDEX idx_uwp_review_date ON user_word_progress(next_review_date) WHERE next_review_date IS NOT NULL;

-- ============================================
-- CONVERSATION SESSIONS
-- ============================================
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scene_id UUID NOT NULL REFERENCES scenes(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  mode_code TEXT NOT NULL REFERENCES modes(code),
  day_response TEXT,
  words_introduced UUID[] NOT NULL DEFAULT '{}',
  words_reviewed UUID[] NOT NULL DEFAULT '{}',
  user_sentences TEXT[] NOT NULL DEFAULT '{}',
  is_exam_mode BOOLEAN NOT NULL DEFAULT FALSE,
  exam_score JSONB
);

CREATE INDEX idx_cs_user_id ON conversation_sessions(user_id);
CREATE INDEX idx_cs_started_at ON conversation_sessions(started_at DESC);

-- ============================================
-- CONVERSATION TURNS
-- ============================================
CREATE TABLE conversation_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'npc')),
  text TEXT NOT NULL,
  audio_url TEXT,
  asr_confidence FLOAT,
  source TEXT NOT NULL DEFAULT 'scripted' CHECK (source IN ('scripted', 'llm')),
  words_used TEXT[] NOT NULL DEFAULT '{}',
  alternative_phrasing TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ct_session_id ON conversation_turns(session_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own ON users FOR ALL USING (id = auth.uid());
CREATE POLICY uwp_own ON user_word_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY cs_own ON conversation_sessions FOR ALL USING (user_id = auth.uid());
CREATE POLICY ct_via_session ON conversation_turns FOR ALL
  USING (session_id IN (SELECT id FROM conversation_sessions WHERE user_id = auth.uid()));

-- Public read for content tables (words, modes, tracks, scenes, etc.)
ALTER TABLE modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_mode_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mode_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY modes_read ON modes FOR SELECT USING (TRUE);
CREATE POLICY tracks_read ON tracks FOR SELECT USING (TRUE);
CREATE POLICY words_read ON words FOR SELECT USING (TRUE);
CREATE POLICY wme_read ON word_mode_entries FOR SELECT USING (TRUE);
CREATE POLICY me_read ON mode_examples FOR SELECT USING (TRUE);
CREATE POLICY ps_read ON practice_scenarios FOR SELECT USING (TRUE);
CREATE POLICY scenes_read ON scenes FOR SELECT USING (TRUE);
CREATE POLICY cs_scripts_read ON conversation_scripts FOR SELECT USING (TRUE);
CREATE POLICY tw_read ON track_words FOR SELECT USING (TRUE);

-- ============================================
-- HELPER: Auto-create user on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, current_mode, daily_word_count)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'survival',
    5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- HELPER: Situational repetition word selection
-- ============================================
CREATE OR REPLACE FUNCTION select_review_words(
  p_user_id UUID,
  p_mode_code TEXT,
  p_current_context TEXT,
  p_max_words INTEGER DEFAULT 2
)
RETURNS TABLE(word_id UUID, lemma TEXT, last_context TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.lemma, uwp.last_review_context
  FROM user_word_progress uwp
  JOIN words w ON w.id = uwp.word_id
  WHERE uwp.user_id = p_user_id
    AND uwp.mode_code = p_mode_code
    AND uwp.status IN ('practiced', 'used')
    AND (uwp.next_review_date IS NULL OR uwp.next_review_date <= now())
    AND (uwp.last_review_context IS NULL OR uwp.last_review_context != p_current_context)
  ORDER BY uwp.times_used_in_context ASC, uwp.last_review_date ASC NULLS FIRST
  LIMIT p_max_words;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;