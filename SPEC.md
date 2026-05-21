# SPEC: Story 1.2 — Supabase Backend Setup

## Objective

Replace the app's hardcoded mockData dependency with a Supabase PostgreSQL backend. Create all database tables matching the existing TypeScript interfaces, seed with the current 22 words / 13 scenes / 11 scripts, build a typed data-access service layer, and wire the app to fetch from Supabase with silent fallback to mockData when unreachable.

This is a data-layer migration — no new user-facing features. The app should behave identically whether data comes from Supabase or mockData.

## Target Users

- Daily English learners using the app (same users as today)
- Developers who need a real backend to build auth, progress tracking, and future features on top of

## Core Features & Acceptance Criteria

### AC1: Database schema matches TypeScript types
- [ ] All tables in `src/types/index.ts` exist in Supabase: `words`, `word_mode_entries`, `mode_examples`, `practice_scenarios`, `modes`, `tracks`, `scenes`, `conversation_scripts`, `user_word_progress`, `conversation_sessions`, `conversation_turns`, `user_profiles`
- [ ] Column types, nullable, and constraints match the TS interfaces exactly
- [ ] Foreign keys enforced (word_mode_entries.word_id → words.id, etc.)
- [ ] RLS policies: public read for reference tables (words, scenes, etc.); user-scoped read/write for user tables (user_word_progress, conversation_sessions, conversation_turns, user_profiles)

### AC2: Seed data from mockData
- [ ] All 22 words with their mode entries inserted
- [ ] All 13 scenes inserted
- [ ] All 11 conversation scripts inserted
- [ ] Mode and track reference data inserted
- [ ] Seed is idempotent (ON CONFLICT DO NOTHING)

### AC3: Data-access service layer
- [ ] `src/services/supabaseDataService.ts` exports typed query functions
- [ ] Functions return the same types that current mockData consumers expect (MockWord, MockScene, etc.)
- [ ] Uses existing `supabase` client from `src/lib/supabase.ts`
- [ ] All query functions have try/catch with silent fallback to mockData

### AC4: App wired to Supabase
- [ ] Scene and word data loads from Supabase when connected
- [ ] Falls back to mockData silently when Supabase is unreachable
- [ ] No change to user-visible behavior (same data, different source)
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx jest` — all pass
- [ ] App runs without crash

## Tech Stack & Constraints

- **Database:** Supabase PostgreSQL (free tier)
- **Client:** `@supabase/supabase-js@^2.106.0` (already installed)
- **Auth:** Deferred to Story 1.3 — use anon key for now (public read works without auth)
- **Schema:** Must match existing `src/types/index.ts` interfaces exactly
- **Seed:** Transform data from `src/services/mockData.ts` — no manual SQL data entry
- **Fallback:** Silent — no banners, no error UI, just use mockData if Supabase fails
- **Expo SDK 54** — stay on current SDK

## Project Structure

```
supabase/
  migrations/
    001_initial_schema.sql       -- All tables, constraints, RLS policies
  seed.sql                        -- Insert mockData as Supabase rows (idempotent)
src/
  services/
    supabaseDataService.ts         -- Typed query functions with mockData fallback
  lib/
    supabase.ts                    -- Existing client (no changes expected)
```

## Code Style

- TypeScript strict mode (already enforced — 0 errors after Phase 1)
- No `as any` — use proper types
- Service functions follow same naming as current wordService.ts (`getWordsForMode`, etc.)
- SQL uses snake_case (PostgreSQL convention), TypeScript uses camelCase
- Comments only for non-obvious constraints

## Testing Strategy

- **Schema:** Verify via Supabase dashboard / SQL editor after migration
- **Seed:** Query count checks: words=22, scenes=13, scripts=11
- **Service layer:** Unit tests with mocked Supabase responses
- **Integration:** App runs with Supabase connected AND disconnected (fallback)
- **Existing:** 24 Jest tests must continue passing (no regression)

## Boundaries

### Always do
- Match TypeScript interfaces exactly in SQL schema
- Keep mockData as working fallback — never remove it
- Use `Partial<Record<ModeCode, WordModeEntry>>` for modeEntries (established in Phase 1)
- Test both connected and disconnected paths

### Ask first about
- Adding new columns not in current TypeScript types
- Changing existing TypeScript interfaces to match DB needs
- Adding database indexes beyond primary/foreign keys
- Any auth-related changes (deferred to Story 1.3)

### Never do
- Remove mockData.ts or break the fallback path
- Add `as any` type casts
- Include API keys or secrets in SQL migrations
- Modify user-facing UI in this story
- Touch sessionStore state shape (just change where data comes from)