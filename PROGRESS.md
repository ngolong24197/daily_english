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

---

## 2026-05-22

### Story 1.3: Authentication Flow — Implementation Complete

**7 tasks completed on branch `feature/story-1.3-authentication`:**
1. Secure session storage — `src/lib/secureStorageAdapter.ts` (expo-secure-store), `src/lib/urlPolyfills.ts` (react-native-url-polyfill), updated `src/lib/supabase.ts` with `storage` and `detectSessionInUrl: true`
2. Auth store — `src/stores/authStore.ts` (Zustand): session, user, loading, initialized, guestMode + setSession, setGuestMode, signOut, initialize actions
3. Auth provider — `src/components/AuthProvider.tsx`: initializes auth store, shows spinner until initialized
4. Route protection — `src/app/(auth)/_layout.tsx`: Drawer layout with auth gate (redirect to /auth/login if no session and not guest). Moved 6 screen files into `(auth)/` group with `@/` imports.
5. Login screen — `src/app/auth/login.tsx`: email/password, magic link, OAuth (Google/Apple), "Continue as Guest" button. `src/app/auth/callback.tsx` for OAuth/magic-link redirects.
6. Sign-out in Settings — Account section: shows email + Sign Out for authenticated, "Sign in to sync" for guests
7. Auth store tests — 5 tests covering initial state, setSession, setGuestMode, signOut, session clears guestMode

**Root layout restructured:** `src/app/_layout.tsx` now minimal (GestureHandlerRootView + AuthProvider + Slot). Drawer moved to `(auth)/_layout.tsx`.

**Verification:** `npx tsc --noEmit` 0 errors, `npx jest` 29 tests pass

### Important notes
- Each story/phase on its own branch + PR for review before merge
- Guest mode: unauthenticated users can use the full app with local data
- Auth methods: magic link, email/password, OAuth (Google/Apple)

---

## 2026-05-22

### Story 1.4: App Shell and Navigation — Implementation Complete

**3 commits on branch `feature/story-1.4-app-shell-navigation` (PR #2):**

**Phase 1: Bottom Tabs + Drawer Modal**
- Installed `@react-navigation/bottom-tabs`
- Created `(auth)/(tabs)/_layout.tsx` with 4 tabs (Today, History, Words, Settings)
- Moved history, words, settings, index screens into `(tabs)/` group
- Replaced Drawer navigator with Stack + DrawerProvider + DrawerOverlay
- Created `src/contexts/DrawerContext.tsx` (useDrawer hook)
- Created `src/components/DrawerOverlay.tsx` (reanimated slide-in from right)
- Created `src/components/AppHeader.tsx` (shared header with drawer toggle + back button)

**Phase 2: Session Flow as Routes**
- Created `(auth)/session/` route group with Stack layout
- Extracted CheckInScreen into `session/checkin.tsx` with route-based navigation
- Created route wrappers: `session/scene.tsx`, `session/conversation.tsx`, `session/jam-along.tsx`, `session/review.tsx`
- Refactored `(tabs)/index.tsx` to redirect to `/session/checkin` or show TrackSelectionScreen
- All `setCurrentStep()` calls now paired with `router.push()` for route navigation
- SceneScreen, ConversationScreen, JamAlongScreen, ReviewScreen updated with `router.push()` calls

**Phase 3-5: Deep Linking, Splash Screen, Error Boundary, Headers**
- Deep links work via `dailyenglish://` scheme (expo-router auto-maps routes)
- `expo-splash-screen` replaces ActivityIndicator in AuthProvider
- `src/components/ErrorBoundary.tsx` wraps root layout for crash recovery
- Tabs layout shows headers with drawer toggle button via useDrawer()
- Updated NavigationLabels in accessibility.ts for new route paths

**Verification:** `npx tsc --noEmit` 0 errors, `npx jest` 29 tests pass

### Epic 1 remaining stories
- 1-5: Design System Tokens and Theming
- 1-6: Core Shared Components
- 1-7: Local Storage Setup
