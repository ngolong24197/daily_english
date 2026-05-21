# Implementation Plan: Daily English — Phase 1: TypeScript Stabilization

## Overview

81 TypeScript errors across 19 files are blocking all downstream work. Phase 1 fixes every error, validated by exact line references and verified API signatures. No new features — just clean compilation.

## Current State

- **Working:** App runs at localhost:8081, 24 Jest tests pass
- **Broken:** 81 TypeScript errors, runtime crash in ReviewScreen (already patched)
- **Root causes:** 6 distinct categories, each with a precise fix

## Error Categories & Precise Fixes

### Cat A: `as const` on StyleSheet (31 errors, 10 files)
`StyleSheet.create()` returns `NamedStyles<T>` which doesn't support `as const`. **Fix:** Remove all `as const` suffixes from style declarations.

### Cat B: Missing ModeCode keys in mockData (18 errors, 1 file)
`modeEntries: Record<ModeCode, WordModeEntry>` requires all 5 modes but no word defines all 5. **Fix:** Change to `Partial<Record<ModeCode, WordModeEntry>>` in `mockData.ts:11`. All consumers (`wordService.ts`, `situationalRepetition.ts`) already guard against missing keys.

### Cat C: expo-speech-recognition wrong imports (6 errors, 2 files)
SDK 54 exports `ExpoSpeechRecognitionErrorEvent` (type-only) and `useSpeechRecognitionEvent` (hook), not `SpeechRecognition`/`SpeechRecognitionEvent`/`SpeechRecognitionErrorEvent`. **Fix:** Update imports to match `node_modules/expo-speech-recognition/build/index.d.ts`.

### Cat D: MMKV v4 API change (1 error, 1 file)
`react-native-mmkv` v4 exports `createMMKV()` function, not `MMKV` class. **Fix:** Replace `new MMKV({id})` with `createMMKV({id})` and fix the import.

### Cat E: Type mismatches in conversationEngine/examStructure/sessionStore (3 errors, 3 files)
- `conversationEngine.ts:116`: fallback state uses `currentStepIndex` instead of `currentStep`
- `examStructure.ts:609`: references `import('./conversationEngine').ConversationStep` but it's in `mockData`
- `sessionStore.ts:237`: `useSessionStore.getState().set(...)` — Zustand state has no `.set()` method; use `.setState()`

### Cat F: Null safety + misc type mismatches (6 errors, 4 files)
- `sessionStore.ts:62-63`: `setSelectedMood(string)` / `setSelectedPhrase(string)` — but state is `string | null` and callers pass `null`
- `JamAlongScreen.tsx:291`: `borderStyle: 'dashed'` typed as `string`, needs literal type
- `SkeletonScreens.tsx:69`: `width: number | string` incompatible with `Animated.View` style
- `JamAlongScreen.tsx:37`: `JamAlongScript | null | undefined` not assignable to `JamAlongScript | null`

## Dependency Graph (Phase 1 only)

```
Task 1 (modeEntries Partial type) ──→ Task 6 (null safety depends on knowing Partial type)
Task 2 (speech-recognition) ──────── independent
Task 3 (MMKV v4) ─────────────────── independent
Task 4 (conversationEngine etc.) ─── independent
Task 5 (as const removal) ────────── independent
```

Tasks 1-5 are independent. Task 6 depends on Task 1.

## Execution Strategy

Tasks 1-5 can run in parallel (dispatch to sub-agents). Task 6 runs after Task 1.
After all 6 tasks: checkpoint verification (`tsc --noEmit`, `jest`, app runs).

## Phase 2+ (deferred until checkpoint passes)

See `tasks/todo.md` for the full task breakdown for Supabase, Auth, and remaining stories.