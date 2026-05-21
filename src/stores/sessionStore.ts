import { create } from 'zustand';
import type { ModeCode } from '../types';
import type { ConversationMessage } from '../services/conversationEngine';
import type { MockScene, MockWord } from '../services/mockData';
import type { MicPermissionStatus } from '../hooks/useAudioRecording';
import type { AccuracyScore } from '../services/accuracyScoring';
import { storage } from '../lib/storage';

const MODE_STORAGE_KEY = 'current_mode';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const EXAM_PRACTICE_MODE_KEY = 'exam_practice_mode';
const COMPLETED_SESSIONS_KEY = 'completed_sessions';

const VALID_MODES: ModeCode[] = ['survival', 'professional', 'social', 'ielts', 'toeic'];
const VALID_EXAM_MODES: ExamPracticeMode[] = ['exam', 'daily'];

export type SessionStep = 'checkin' | 'scene' | 'conversation' | 'jamAlong' | 'review' | 'complete';
export type ExamPracticeMode = 'exam' | 'daily';
export type PracticeFormat = 'conversation' | 'jamAlong';
export type TempoSupportLevel = 'high' | 'medium' | 'none';

interface SessionState {
  currentStep: SessionStep;
  dayResponse: string | null;
  selectedMood: string | null;
  selectedPhrase: string | null;
  currentMode: ModeCode;
  currentScene: MockScene | null;
  conversationMessages: ConversationMessage[];
  wordsUsedThisSession: string[];
  hintLevel: 0 | 1 | 2;
  currentHint: string | null;
  isConversationComplete: boolean;
  completedSessions: CompletedSession[];
  micPermissionStatus: MicPermissionStatus;
  showMicPermissionBanner: boolean;
  asrFailureCount: number;
  showTextInputFallback: boolean;
  inputMode: 'speech' | 'text';
  /** Context change descriptions for review words, keyed by word ID */
  contextChanges: Record<string, string>;
  /** Whether the user has completed onboarding (track selection) */
  onboardingComplete: boolean;
  /** Whether exam mode is active (IELTS/TOEIC track) */
  isExamMode: boolean;
  /** Whether exam practice mode is 'exam' (structured, timed) or 'daily' (relaxed) */
  examPracticeMode: ExamPracticeMode;
  /** Accuracy score from exam mode (null for daily mode) */
  examScore: AccuracyScore | null;
  /** Selected practice format: standard conversation or Jam Along */
  practiceFormat: PracticeFormat;
  /** Selected Jam Along script ID (null if standard conversation) */
  jamAlongScriptId: string | null;
  /** Tempo Practice support level */
  tempoSupportLevel: TempoSupportLevel;
  /** Number of sessions completed (for auto tempo progression) */
  sessionsCompleted: number;
  /** Toast message to display briefly */
  toastMessage: string | null;

  setDayResponse: (response: string) => void;
  setSelectedMood: (mood: string | null) => void;
  setSelectedPhrase: (phrase: string | null) => void;
  setCurrentStep: (step: SessionStep) => void;
  setCurrentScene: (scene: MockScene) => void;
  setCurrentMode: (mode: ModeCode) => void;
  setOnboardingComplete: (complete: boolean) => void;
  addConversationMessage: (message: ConversationMessage) => void;
  setWordsUsedThisSession: (words: string[]) => void;
  setHintLevel: (level: 0 | 1 | 2) => void;
  setCurrentHint: (hint: string | null) => void;
  setConversationComplete: (complete: boolean) => void;
  setConversationMessages: (messages: ConversationMessage[]) => void;
  saveCurrentSession: () => void;
  resetSession: () => void;
  setMicPermissionStatus: (status: MicPermissionStatus) => void;
  setShowMicPermissionBanner: (show: boolean) => void;
  incrementAsrFailure: () => boolean;
  resetAsrFailures: () => void;
  setShowTextInputFallback: (show: boolean) => void;
  setInputMode: (mode: 'speech' | 'text') => void;
  trySpeechMode: () => void;
  setContextChanges: (changes: Record<string, string>) => void;
  setPracticeFormat: (format: PracticeFormat) => void;
  setJamAlongScriptId: (id: string | null) => void;
  setTempoSupportLevel: (level: TempoSupportLevel) => void;
  setExamPracticeMode: (mode: ExamPracticeMode) => void;
  setExamScore: (score: AccuracyScore | null) => void;
  showToast: (message: string) => void;
}

export interface CompletedSession {
  id: string;
  date: string;
  sceneTitle: string;
  sceneContext: string;
  mode: ModeCode;
  userSentences: string[];
  newWords: MockWord[];
  reviewWords: MockWord[];
  messages: ConversationMessage[];
  contextChanges: Record<string, string>;
}

// Load persisted completed sessions from MMKV
function loadCompletedSessions(): CompletedSession[] {
  try {
    const data = storage.getString(COMPLETED_SESSIONS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed as CompletedSession[];
    }
  } catch {
    // Corrupted data — start fresh
  }
  return [];
}

function safeModeCode(value: string | undefined): ModeCode {
  if (value && (VALID_MODES as string[]).includes(value)) return value as ModeCode;
  return 'survival';
}

function safeExamMode(value: string | undefined): ExamPracticeMode {
  if (value && (VALID_EXAM_MODES as string[]).includes(value)) return value as ExamPracticeMode;
  return 'exam';
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentStep: 'checkin',
  dayResponse: null,
  selectedMood: null,
  selectedPhrase: null,
  currentMode: safeModeCode(storage.getString(MODE_STORAGE_KEY)),
  currentScene: null,
  conversationMessages: [],
  wordsUsedThisSession: [],
  hintLevel: 0,
  currentHint: null,
  isConversationComplete: false,
  completedSessions: loadCompletedSessions(),
  micPermissionStatus: 'undetermined',
  showMicPermissionBanner: false,
  asrFailureCount: 0,
  showTextInputFallback: false,
  inputMode: 'speech',
  contextChanges: {},
  onboardingComplete: storage.getString(ONBOARDING_COMPLETE_KEY) === 'true',
  isExamMode: safeModeCode(storage.getString(MODE_STORAGE_KEY)) === 'ielts' || safeModeCode(storage.getString(MODE_STORAGE_KEY)) === 'toeic',
  examPracticeMode: safeExamMode(storage.getString(EXAM_PRACTICE_MODE_KEY)),
  examScore: null,
  practiceFormat: 'conversation',
  jamAlongScriptId: null,
  tempoSupportLevel: 'high',
  sessionsCompleted: 0,
  toastMessage: null,

  setDayResponse: (response) => set({ dayResponse: response }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  setSelectedPhrase: (phrase) => set({ selectedPhrase: phrase }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setCurrentMode: (mode) => {
    storage.set(MODE_STORAGE_KEY, mode);
    const isExam = mode === 'ielts' || mode === 'toeic';
    set({ currentMode: mode, isExamMode: isExam });
  },
  setOnboardingComplete: (complete) => {
    storage.set(ONBOARDING_COMPLETE_KEY, complete ? 'true' : 'false');
    set({ onboardingComplete: complete });
  },
  setExamPracticeMode: (mode: ExamPracticeMode) => {
    storage.set(EXAM_PRACTICE_MODE_KEY, mode);
    set({ examPracticeMode: mode });
  },
  setExamScore: (score: AccuracyScore | null) => {
    set({ examScore: score });
  },

  addConversationMessage: (message) =>
    set((state) => ({
      conversationMessages: [...state.conversationMessages, message],
    })),

  setWordsUsedThisSession: (words) => set({ wordsUsedThisSession: words }),
  setHintLevel: (level) => set({ hintLevel: level }),
  setCurrentHint: (hint) => set({ currentHint: hint }),
  setConversationComplete: (complete) => set({ isConversationComplete: complete }),
  setConversationMessages: (messages) => set({ conversationMessages: messages }),

  setMicPermissionStatus: (status) =>
    set({
      micPermissionStatus: status,
      showMicPermissionBanner: status === 'denied',
    }),

  setShowMicPermissionBanner: (show) => set({ showMicPermissionBanner: show }),

  incrementAsrFailure: () => {
    const newCount = get().asrFailureCount + 1;
    const shouldShowFallback = newCount >= 2;
    set({
      asrFailureCount: newCount,
      showTextInputFallback: shouldShowFallback,
      inputMode: newCount >= 3 ? 'text' : get().inputMode,
    });
    return shouldShowFallback;
  },

  resetAsrFailures: () => set({ asrFailureCount: 0 }),

  setShowTextInputFallback: (show) => set({ showTextInputFallback: show }),

  setInputMode: (mode) => set({ inputMode: mode }),

  trySpeechMode: () =>
    set({
      inputMode: 'speech',
      asrFailureCount: 0,
      showTextInputFallback: false,
    }),

  setContextChanges: (changes) => set({ contextChanges: changes }),

  setPracticeFormat: (format) => set({ practiceFormat: format }),

  setJamAlongScriptId: (id) => set({ jamAlongScriptId: id }),

  setTempoSupportLevel: (level) => set({
    tempoSupportLevel: level,
    toastMessage: `Support level changed to ${level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'None'}`,
  }),

  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      useSessionStore.setState({ toastMessage: null });
    }, 2500);
  },

  saveCurrentSession: () => {
    const state = get();
    const userSentences = state.conversationMessages
      .filter((m) => m.speaker === 'user')
      .map((m) => m.text);

    const session: CompletedSession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      sceneTitle: state.currentScene?.title ?? 'Unknown Scene',
      sceneContext: 'Cafe',
      mode: state.currentMode,
      userSentences,
      newWords: state.currentScene?.newWords ?? [],
      reviewWords: state.currentScene?.reviewWords ?? [],
      messages: [...state.conversationMessages],
      contextChanges: state.contextChanges,
    };

    const newSessions = [session, ...state.completedSessions];

    // Persist to MMKV for offline access and history
    try {
      storage.set(COMPLETED_SESSIONS_KEY, JSON.stringify(newSessions));
    } catch {
      // MMKV write failure — data persists in memory for this session
    }

    set((prev) => ({
      completedSessions: newSessions,
      sessionsCompleted: prev.sessionsCompleted + 1,
      // Auto-progress tempo support level based on sessions completed
      tempoSupportLevel: prev.sessionsCompleted + 1 >= 6 ? 'none' : prev.sessionsCompleted + 1 >= 3 ? 'medium' : prev.tempoSupportLevel,
    }));
  },

  resetSession: () =>
    set({
      currentStep: 'checkin',
      dayResponse: null,
      selectedMood: null,
      selectedPhrase: null,
      currentScene: null,
      conversationMessages: [],
      wordsUsedThisSession: [],
      hintLevel: 0,
      currentHint: null,
      isConversationComplete: false,
      asrFailureCount: 0,
      showTextInputFallback: false,
      inputMode: 'speech',
      contextChanges: {},
      examScore: null,
      practiceFormat: 'conversation',
      jamAlongScriptId: null,
      toastMessage: null,
      // Note: currentMode, onboardingComplete, isExamMode, examPracticeMode, tempoSupportLevel, and sessionsCompleted persist across resets
    }),
}));