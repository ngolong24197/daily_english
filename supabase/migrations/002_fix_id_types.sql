-- Daily English: Fix ID types — UUID → TEXT to match mockData string IDs
-- Add missing columns (is_new, dialogue_text)

-- ============================================
-- WORDS: UUID → TEXT
-- ============================================
ALTER TABLE track_words DROP CONSTRAINT track_words_word_id_fkey;
ALTER TABLE word_mode_entries DROP CONSTRAINT word_mode_entries_word_id_fkey;
ALTER TABLE user_word_progress DROP CONSTRAINT user_word_progress_word_id_fkey;

ALTER TABLE words ALTER COLUMN id DROP DEFAULT;
ALTER TABLE words ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE words ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT TRUE;

-- ============================================
-- WORD MODE ENTRIES: UUID → TEXT
-- ============================================
ALTER TABLE mode_examples DROP CONSTRAINT mode_examples_word_mode_entry_id_fkey;
ALTER TABLE practice_scenarios DROP CONSTRAINT practice_scenarios_word_mode_entry_id_fkey;

ALTER TABLE word_mode_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE word_mode_entries ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE word_mode_entries ALTER COLUMN word_id TYPE TEXT USING word_id::TEXT;

ALTER TABLE word_mode_entries ADD CONSTRAINT word_mode_entries_word_id_fkey
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE;

-- ============================================
-- MODE EXAMPLES: FK → TEXT
-- ============================================
ALTER TABLE mode_examples ALTER COLUMN word_mode_entry_id TYPE TEXT USING word_mode_entry_id::TEXT;

ALTER TABLE mode_examples ADD CONSTRAINT mode_examples_word_mode_entry_id_fkey
  FOREIGN KEY (word_mode_entry_id) REFERENCES word_mode_entries(id) ON DELETE CASCADE;

-- ============================================
-- PRACTICE SCENARIOS: FK → TEXT
-- ============================================
ALTER TABLE practice_scenarios ALTER COLUMN word_mode_entry_id TYPE TEXT USING word_mode_entry_id::TEXT;

ALTER TABLE practice_scenarios ADD CONSTRAINT practice_scenarios_word_mode_entry_id_fkey
  FOREIGN KEY (word_mode_entry_id) REFERENCES word_mode_entries(id) ON DELETE CASCADE;

-- ============================================
-- SCENES: UUID → TEXT, add dialogue_text
-- ============================================
ALTER TABLE conversation_scripts DROP CONSTRAINT conversation_scripts_scene_id_fkey;
ALTER TABLE conversation_sessions DROP CONSTRAINT conversation_sessions_scene_id_fkey;

ALTER TABLE scenes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE scenes ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE scenes ALTER COLUMN target_word_ids TYPE TEXT[] USING target_word_ids::TEXT[];
ALTER TABLE scenes ALTER COLUMN review_word_ids TYPE TEXT[] USING review_word_ids::TEXT[];
ALTER TABLE scenes ADD COLUMN dialogue_text TEXT NOT NULL DEFAULT '';

-- ============================================
-- CONVERSATION SCRIPTS: FK → TEXT
-- ============================================
ALTER TABLE conversation_scripts ALTER COLUMN scene_id TYPE TEXT USING scene_id::TEXT;

ALTER TABLE conversation_scripts ADD CONSTRAINT conversation_scripts_scene_id_fkey
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE;

-- ============================================
-- TRACK WORDS: FK → TEXT
-- ============================================
ALTER TABLE track_words ALTER COLUMN word_id TYPE TEXT USING word_id::TEXT;

ALTER TABLE track_words ADD CONSTRAINT track_words_word_id_fkey
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE;

-- ============================================
-- USER WORD PROGRESS: FK → TEXT
-- ============================================
ALTER TABLE user_word_progress ALTER COLUMN word_id TYPE TEXT USING word_id::TEXT;

ALTER TABLE user_word_progress ADD CONSTRAINT user_word_progress_word_id_fkey
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE;

-- ============================================
-- CONVERSATION SESSIONS: FK → TEXT, arrays → TEXT[]
-- ============================================
ALTER TABLE conversation_sessions ALTER COLUMN scene_id TYPE TEXT USING scene_id::TEXT;
ALTER TABLE conversation_sessions ALTER COLUMN words_introduced TYPE TEXT[] USING words_introduced::TEXT[];
ALTER TABLE conversation_sessions ALTER COLUMN words_reviewed TYPE TEXT[] USING words_reviewed::TEXT[];

ALTER TABLE conversation_sessions ADD CONSTRAINT conversation_sessions_scene_id_fkey
  FOREIGN KEY (scene_id) REFERENCES scenes(id);