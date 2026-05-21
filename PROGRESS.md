# Daily English - Progress

---

## 2026-05-21

### Story 1.1: Project Initialization with Expo SDK — DONE
Commit: `0eded53`

### TypeScript Stabilization — DONE
Commit: `62141fc`

**81 TypeScript errors eliminated across 19 files.**

Type fixes (6 categories):
1. `mockData.ts` — `modeEntries: Record<ModeCode, WordModeEntry>` → `Partial<Record<ModeCode, WordModeEntry>>` (18 TS2739 errors)
2. `useAudioRecording.ts`, `asrService.ts` — Fixed expo-speech-recognition imports for SDK 54: `SpeechRecognition` → `ExpoSpeechRecognitionModule`, type-only imports for events, `hints` → `contextualStrings` (6 TS2305/TS2724 errors)
3. `lib/storage.ts` — MMKV v4 API: `new MMKV()` → `createMMKV()`, `.delete()` → `.remove()` (1 TS2339 error)
4. `conversationEngine.ts` — `currentStepIndex` → `currentStep`, added missing fields; `examStructure.ts` — fixed `ConversationStep` import path; `sessionStore.ts` — `.getState().set()` → `.setState()` (3 errors)
5. 11 component files — restored `as const` on plain style object literals for string literal narrowing; removed from `StyleSheet.create()` results where it caused TS1355 (31 TS1355 errors)
6. `sessionStore.ts` — setter signatures `(string) => void` → `(string | null) => void`; `JamAlongScreen.tsx` — script type handles `undefined`; `SkeletonScreens.tsx` — `width: DimensionValue`; `asrService.ts` — `.catch()` on void → try/catch (7 remaining errors)

Runtime fixes:
- `metro.config.js` — Added `blockList` to exclude test files from Metro bundler
- `ReviewScreen.tsx` — Fixed `word.modeEntry.example_context` → `word.modeEntries?.[modeCode]?.example_context`

Verification: `npx tsc --noEmit` 0 errors, `npx jest` 24 tests pass, app runs at localhost:8081

---

## Current Process

**TypeScript stabilization complete. Ready for Phase 2.**

Flow for each story: **spec → plan → implement → test → review → commit**

### Next: Story 1.2 — Supabase Backend Setup

### Epic 1 remaining stories
- 1-2: Supabase Backend Setup ← NEXT
- 1-3: Authentication Flow
- 1-4: App Shell and Navigation
- 1-5: Design System Tokens and Theming
- 1-6: Core Shared Components
- 1-7: Local Storage Setup

### Important version notes
- Stay on Expo SDK 54 — NativeWind v5 not stable, expo-av removed in SDK 55
- react-test-renderer must match react version exactly (19.1.0)
- expo-speech-recognition SDK 54 API: `ExpoSpeechRecognitionModule` (value), `ExpoSpeechRecognitionOptions`/`ExpoSpeechRecognitionErrorEvent`/`ExpoSpeechRecognitionResultEvent` (type-only)
- react-native-mmkv v4: `createMMKV({id})` function, `MMKV` is type-only, `.remove()` replaces `.delete()`
- Plain style objects need `as const` for string literal narrowing; `StyleSheet.create()` results do not
---

## 2026-05-22

### Story 1.2: Supabase Backend Setup — Implementation Complete

**4 tasks completed:**
1. Migration 002 — `supabase/migrations/002_fix_id_types.sql`: UUID→TEXT for all ID columns, added `words.is_new` and `scenes.dialogue_text`
2. Seed SQL — `supabase/seed.sql`: 34 words, 79 word_mode_entries, 14 scenes, 14 conversation_scripts (JSONB). All idempotent (`ON CONFLICT DO NOTHING`)
3. Data service — `src/services/supabaseDataService.ts`: Adapter+cache pattern. Preloads from Supabase, transforms rows to MockWord/MockScene/ConversationStep[], falls back silently to mockData
4. App wiring — Routed 5 consumers through supabaseDataService: `index.tsx`, `wordService.ts`, `conversationEngine.ts`, `situationalRepetition.ts`, `words.tsx`, `warmReEntry.ts`

**Architecture:** Adapter pattern — schema matches canonical TypeScript types; service transforms Supabase rows into MockWord/MockScene shapes the app expects. Preload+cache: fetch on app start, serve synchronously from cache, silent fallback to mockData on any error.

**Verification:** `npx tsc --noEmit` 0 errors, `npx jest` 24 tests pass

### Remaining for Story 1.2
- [ ] Apply migrations 001+002 to Supabase project
- [ ] Run seed SQL against Supabase project
- [ ] Integration test: connected + disconnected paths
- [ ] Commit to GitHub
