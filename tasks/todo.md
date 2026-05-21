# Task TODO List — Daily English

## Phase 1: TypeScript Stabilization

### Task 1: Fix modeEntries type — Partial<Record<ModeCode, WordModeEntry>>

**Description:** Change `modeEntries` from `Record<ModeCode, WordModeEntry>` to `Partial<Record<ModeCode, WordModeEntry>>` in the MockWord interface. This eliminates 18 TS2739 errors.

**Exact changes:**
- `src/services/mockData.ts:11` — change `modeEntries: Record<ModeCode, WordModeEntry>` to `modeEntries: Partial<Record<ModeCode, WordModeEntry>>`
- `src/services/wordService.ts` — already has `if (entry)` guard at line 17, no change needed
- `src/services/situationalRepetition.ts` — already uses `mode in word.modeEntries`, no change needed
- `src/features/daily-session/components/ReviewScreen.tsx:199` — already patched to use `word.modeEntries?.[modeCode]?.example_context`

**Acceptance criteria:**
- [ ] `MockWord.modeEntries` typed as `Partial<Record<ModeCode, WordModeEntry>>`
- [ ] All 22 word definitions in mockData.ts pass type checking
- [ ] `npx tsc --noEmit` — 0 TS2739 errors in mockData.ts

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep TS2739 | wc -l` returns 0
- [ ] `npx jest` — 24 tests still pass

**Dependencies:** None
**Estimated scope:** S (1 file primary change)

---

### Task 2: Fix expo-speech-recognition imports for SDK 54

**Description:** The installed `expo-speech-recognition@3.1.3` exports: `ExpoSpeechRecognitionModule`, `useSpeechRecognitionEvent`, and type-only exports `ExpoSpeechRecognitionErrorEvent`, `ExpoSpeechRecognitionResultEvent`. The current code imports nonexistent `SpeechRecognition`, `SpeechRecognitionEvent`, `SpeechRecognitionErrorEvent`.

**Exact changes:**
- `src/hooks/useAudioRecording.ts:14-18` — replace:
  ```ts
  // OLD:
  import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from 'expo-speech-recognition';
  // NEW:
  import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
  import type { ExpoSpeechRecognitionErrorEvent, ExpoSpeechRecognitionResultEvent } from 'expo-speech-recognition';
  ```
  Then update all usages of `SpeechRecognition` to `ExpoSpeechRecognitionModule`, `SpeechRecognitionEvent` to `ExpoSpeechRecognitionResultEvent`, `SpeechRecognitionErrorEvent` to `ExpoSpeechRecognitionErrorEvent`.

- `src/services/asrService.ts:12-16` — same import fix, same name replacements.

**Acceptance criteria:**
- [ ] `useAudioRecording.ts` uses correct SDK 54 import names
- [ ] `asrService.ts` uses correct SDK 54 import names
- [ ] `npx tsc --noEmit` — 0 TS2305/TS2724 errors from these files

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep -c "expo-speech-recognition"` returns 0

**Dependencies:** None
**Estimated scope:** S

---

### Task 3: Fix MMKV v4 import and storage.ts

**Description:** `react-native-mmkv@4.3.1` exports `createMMKV()` function (not `MMKV` class). The `MMKV` type is type-only. Current code does `const { MMKV } = require(...)` and `new MMKV({id})`.

**Exact changes:**
- `src/lib/storage.ts:66-67` — replace:
  ```ts
  // OLD:
  const { MMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const instance = new MMKV({ id: 'daily-english-storage' });
  // NEW:
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  const instance = createMMKV({ id: 'daily-english-storage' });
  ```

**Acceptance criteria:**
- [ ] `lib/storage.ts` compiles without TS2339 error
- [ ] Storage API methods (`getString`, `set`, `delete`, etc.) still work — MMKV instance interface is identical

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep storage.ts` returns nothing
- [ ] App loads and persists state across reloads

**Dependencies:** None
**Estimated scope:** XS

---

### Task 4: Fix conversationEngine, examStructure, and sessionStore type errors

**Description:** Three separate type errors across three files.

**Exact changes:**
- `src/services/conversationEngine.ts:116` — change `currentStepIndex: 0` to `currentStep: 0`, add `hintLevel: 0` and `wordsUsedThisSession: []` to the fallback state object (lines 108-119)
- `src/services/examStructure.ts:609` — change `import('./conversationEngine').ConversationStep` to `import('./mockData').ConversationStep` (ConversationStep is exported from mockData, not conversationEngine)
- `src/stores/sessionStore.ts:237` — change `useSessionStore.getState().set({ toastMessage: null })` to `useSessionStore.setState({ toastMessage: null })`

**Acceptance criteria:**
- [ ] `conversationEngine.ts` fallback state matches `ConversationState` interface exactly
- [ ] `examStructure.ts` references correct module for `ConversationStep` type
- [ ] `sessionStore.ts` uses proper Zustand API (`setState` not `getState().set`)

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep -E "conversationEngine|examStructure|sessionStore"` returns 0 errors

**Dependencies:** None
**Estimated scope:** S

---

### Task 5: Remove `as const` from all StyleSheet.create() calls

**Description:** 31 TS1355 errors across 11 files. `StyleSheet.create()` returns `NamedStyles<T>` which doesn't support `as const` assertions. Remove `as const` from all style declarations.

**Files with errors (confirmed by `npx tsc --noEmit`):**
- `src/app/index.tsx` (3 occurrences)
- `src/app/track-selection.tsx` (2)
- `src/components/JamAlongScreen.tsx` (3)
- `src/components/OnboardingEasing.tsx` (2)
- `src/components/PremiumUpgradeSheet.tsx` (2)
- `src/components/ScoreCard.tsx` (4)
- `src/components/SessionCloseAd.tsx` (1)
- `src/components/WordExplorationSheet.tsx` (1)
- `src/features/daily-session/components/ConversationScreen.tsx` (2)
- `src/features/daily-session/components/ReviewScreen.tsx` (4)
- `src/features/daily-session/components/SceneScreen.tsx` (5)

**Exact change per file:** Find all `as const` that follow StyleSheet.create() or style object declarations and remove them. Mechanical find-and-replace.

**Acceptance criteria:**
- [ ] No `as const` on any StyleSheet.create() or inline style object across all 11 files
- [ ] `npx tsc --noEmit` — 0 TS1355 errors

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep -c TS1355` returns 0

**Dependencies:** None
**Estimated scope:** M (11 files, mechanical)

---

### Task 6: Fix null safety and remaining type mismatch errors

**Description:** Fix the remaining errors after Tasks 1-5 are complete.

**Exact changes:**
- `src/stores/sessionStore.ts:62-63` — change setter signatures:
  ```ts
  // OLD:
  setSelectedMood: (mood: string) => void;
  setSelectedPhrase: (phrase: string) => void;
  // NEW:
  setSelectedMood: (mood: string | null) => void;
  setSelectedPhrase: (phrase: string | null) => void;
  ```
  This fixes 4 TS2345 errors in `src/app/index.tsx` (lines 130, 137, 144, 145).

- `src/components/JamAlongScreen.tsx:291` — `borderStyle: 'dashed'` inferred as `string`; add type assertion `borderStyle: 'dashed' as const` (this is inside a plain style object, not StyleSheet.create, so `as const` works on string literals here)

- `src/components/JamAlongScreen.tsx:37` — change `JamAlongScript | null` to `JamAlongScript | null | undefined` to match the actual return type of the lookup

- `src/components/SkeletonScreens.tsx:69` — cast `width` prop in the animated style: change `width,` to `width: width as DimensionValue,` or narrow the prop type

**Acceptance criteria:**
- [ ] `sessionStore.ts` setters accept `null`
- [ ] `JamAlongScreen.tsx` borderStyle and script type errors fixed
- [ ] `SkeletonScreens.tsx` animated width type fixed
- [ ] `npx tsc --noEmit` — 0 total errors

**Verification:**
- [ ] `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l` returns 0

**Dependencies:** Task 1 (needs Partial<Record> type established first)
**Estimated scope:** S

---

## Checkpoint: TypeScript Clean
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx jest` — 24+ tests pass
- [ ] App runs at localhost:8081 without crashes

---

## Phase 2: Supabase Backend Setup (Story 1.2)

### Task 7: Create Supabase database schema

**Description:** Create SQL migration for all tables matching `src/types/index.ts` interfaces: words, word_mode_entries, mode_examples, practice_scenarios, scenes, conversation_scripts, user_word_progress, conversation_sessions, conversation_turns. Include RLS policies.

**Acceptance criteria:**
- [ ] Migration SQL file created at `supabase/migrations/001_initial_schema.sql`
- [ ] All tables match TypeScript interfaces in `src/types/index.ts`
- [ ] RLS policies: users can only read/write their own user-scoped data
- [ ] Public read access for words/scenes/scripts (reference data)

**Verification:**
- [ ] Migration applies cleanly to Supabase project via dashboard or CLI
- [ ] Can query all tables from Supabase SQL editor

**Dependencies:** Phase 1 checkpoint
**Estimated scope:** M

---

### Task 8: Seed Supabase with word/scene data from mockData

**Description:** Transform the 22 words, mode entries, 13 scenes, and 11 conversation scripts from `mockData.ts` into Supabase inserts. Create idempotent seed script.

**Acceptance criteria:**
- [ ] All 22 words with mode entries inserted
- [ ] All 13 scenes inserted
- [ ] All 11 conversation scripts inserted
- [ ] Seed is idempotent (uses `ON CONFLICT DO NOTHING` or checks existence)

**Verification:**
- [ ] Query Supabase: words count = 22, scenes count = 13

**Dependencies:** Task 7
**Estimated scope:** M

---

### Task 9: Build Supabase data-access service layer

**Description:** Create typed service functions reading from Supabase: `getWordsForMode()`, `getScenesForMode()`, `getConversationScript()`. Graceful fallback to mockData.

**Acceptance criteria:**
- [ ] `src/services/supabaseDataService.ts` with typed queries
- [ ] Returns same types as current mockData consumers expect
- [ ] Fallback to mockData if Supabase query fails
- [ ] Uses existing Supabase client from `src/lib/supabase.ts`

**Verification:**
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx jest` — all pass

**Dependencies:** Task 7, Task 8
**Estimated scope:** M

---

### Task 10: Wire sessionStore to Supabase for word/scene data

**Description:** Replace mockData reads with Supabase data service calls. Fallback to mockData if unreachable.

**Acceptance criteria:**
- [ ] Scene and word data loads from Supabase when available
- [ ] Falls back to mockData if Supabase is unreachable
- [ ] No change to user-visible behavior
- [ ] Loading states shown while fetching

**Verification:**
- [ ] App works with Supabase connected (data from DB)
- [ ] App works with Supabase disconnected (data from mock)
- [ ] `npx jest` — all pass

**Dependencies:** Task 9
**Estimated scope:** M

---

## Checkpoint: Backend Connected
- [ ] App loads word/scene data from Supabase
- [ ] All existing flows still work
- [ ] Review with human before proceeding

---

## Phase 3-6 (Detailed when checkpoint reached)

- Task 11: Set up Supabase Auth (email + anonymous)
- Task 12: Build auth UI screens
- Task 13: Wire auth state into sessionStore
- Task 14: Restructure feature folders + navigation state
- Task 15: Formalize design token system
- Task 16: Build core shared components
- Task 17: Offline-first word progress persistence
- Task 18: Sync queue for pending Supabase writes