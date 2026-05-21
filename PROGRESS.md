# Daily English - Progress

## Story 1.1: Project Initialization with Expo SDK — DONE

Commit: `0eded53`

---

## Story 1.1+: TypeScript Stabilization — DONE

All 81 TypeScript errors across 19 files eliminated. Commit pending.

### Changes Made

**Type fixes (6 categories):**
1. `mockData.ts` — `modeEntries: Record<ModeCode, WordModeEntry>` → `Partial<Record<ModeCode, WordModeEntry>>` (eliminates 18 TS2739 errors)
2. `useAudioRecording.ts`, `asrService.ts` — Fixed expo-speech-recognition imports for SDK 54: `SpeechRecognition` → `ExpoSpeechRecognitionModule`, type-only imports for events, `hints` → `contextualStrings` (eliminates 6 TS2305/TS2724 errors)
3. `lib/storage.ts` — MMKV v4 API: `new MMKV()` → `createMMKV()`, `.delete()` → `.remove()` (eliminates 1 TS2339 error)
4. `conversationEngine.ts` — `currentStepIndex` → `currentStep`, added missing `hintLevel` and `wordsUsedThisSession` fields; `examStructure.ts` — fixed `ConversationStep` import path; `sessionStore.ts` — `.getState().set()` → `.setState()` (eliminates 3 errors)
5. 11 component files — restored `as const` on plain style object literals for string literal narrowing; removed from `StyleSheet.create()` results where it caused TS1355 (eliminates 31 TS1355 errors)
6. `sessionStore.ts` — setter signatures `(string) => void` → `(string | null) => void`; `JamAlongScreen.tsx` — script type handles `undefined`; `SkeletonScreens.tsx` — `width: DimensionValue` cast; `asrService.ts` — `.catch()` on void → try/catch (eliminates 7 remaining errors)

**Runtime fix (from earlier session):**
- `metro.config.js` — Added `blockList` to exclude test files from Metro bundler (was causing `react-test-renderer` runtime crash)
- `ReviewScreen.tsx` — Fixed `word.modeEntry.example_context` → `word.modeEntries?.[modeCode]?.example_context` (was causing runtime crash)

### Verification
- `npx tsc --noEmit` — 0 errors (was 81)
- `npx jest` — 24 tests passing (unchanged)
- App runs at localhost:8081 without crashes

---

## Current Process

**TypeScript stabilization complete. Ready for Phase 2.**

Flow for each story: **spec → plan → implement → test → review → commit**

### Next: Story 1.2 — Supabase Backend Setup
1. Write spec (or read existing if available)
2. Plan tasks with acceptance criteria
3. Implement incrementally (vertical slices)
4. Test after each slice
5. Review before commit
6. Commit to GitHub

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