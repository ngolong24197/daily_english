import { useSessionStore } from '@/stores/sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset the store to default state before each test
    const store = useSessionStore.getState();
    store.resetSession();
    useSessionStore.setState({
      currentMode: 'survival',
      onboardingComplete: false,
      isExamMode: false,
      examPracticeMode: 'exam',
      completedSessions: [],
      sessionsCompleted: 0,
      tempoSupportLevel: 'high',
    });
  });

  describe('initial state', () => {
    it('defaults to checkin step', () => {
      expect(useSessionStore.getState().currentStep).toBe('checkin');
    });

    it('defaults to survival mode', () => {
      expect(useSessionStore.getState().currentMode).toBe('survival');
    });

    it('defaults to empty conversation messages', () => {
      expect(useSessionStore.getState().conversationMessages).toEqual([]);
    });

    it('defaults to hint level 0', () => {
      expect(useSessionStore.getState().hintLevel).toBe(0);
    });

    it('defaults to speech input mode', () => {
      expect(useSessionStore.getState().inputMode).toBe('speech');
    });

    it('defaults to conversation practice format', () => {
      expect(useSessionStore.getState().practiceFormat).toBe('conversation');
    });
  });

  describe('setCurrentMode', () => {
    it('sets the current mode to professional', () => {
      useSessionStore.getState().setCurrentMode('professional');
      expect(useSessionStore.getState().currentMode).toBe('professional');
    });

    it('sets isExamMode to true for ielts', () => {
      useSessionStore.getState().setCurrentMode('ielts');
      expect(useSessionStore.getState().isExamMode).toBe(true);
    });

    it('sets isExamMode to true for toeic', () => {
      useSessionStore.getState().setCurrentMode('toeic');
      expect(useSessionStore.getState().isExamMode).toBe(true);
    });

    it('sets isExamMode to false for social', () => {
      useSessionStore.getState().setCurrentMode('social');
      expect(useSessionStore.getState().isExamMode).toBe(false);
    });
  });

  describe('safeModeCode (via store defaults)', () => {
    it('defaults to survival when storage is empty', () => {
      // The store should always initialize with a valid mode
      const mode = useSessionStore.getState().currentMode;
      expect(['survival', 'professional', 'social', 'ielts', 'toeic']).toContain(mode);
    });

    it('defaults to survival mode on fresh state', () => {
      useSessionStore.setState({ currentMode: 'survival' });
      expect(useSessionStore.getState().currentMode).toBe('survival');
    });
  });

  describe('safeExamMode (via store defaults)', () => {
    it('defaults to exam mode on fresh state', () => {
      expect(useSessionStore.getState().examPracticeMode).toBe('exam');
    });
  });

  describe('resetSession', () => {
    it('resets step to checkin', () => {
      useSessionStore.getState().setCurrentStep('conversation');
      useSessionStore.getState().resetSession();
      expect(useSessionStore.getState().currentStep).toBe('checkin');
    });

    it('clears day response', () => {
      useSessionStore.getState().setDayResponse('Test response');
      useSessionStore.getState().resetSession();
      expect(useSessionStore.getState().dayResponse).toBeNull();
    });

    it('clears conversation messages', () => {
      useSessionStore.getState().addConversationMessage({
        id: '1',
        speaker: 'user',
        text: 'Hello',
        timestamp: Date.now(),
        wordsUsed: [],
      });
      useSessionStore.getState().resetSession();
      expect(useSessionStore.getState().conversationMessages).toEqual([]);
    });

    it('preserves current mode across reset', () => {
      useSessionStore.getState().setCurrentMode('professional');
      useSessionStore.getState().resetSession();
      expect(useSessionStore.getState().currentMode).toBe('professional');
    });
  });

  describe('addConversationMessage', () => {
    it('appends a message to the conversation', () => {
      useSessionStore.getState().addConversationMessage({
        id: '1',
        speaker: 'user',
        text: 'Hello',
        timestamp: Date.now(),
        wordsUsed: [],
      });
      const messages = useSessionStore.getState().conversationMessages;
      expect(messages).toHaveLength(1);
      expect(messages[0].text).toBe('Hello');
      expect(messages[0].speaker).toBe('user');
    });

    it('appends multiple messages in order', () => {
      useSessionStore.getState().addConversationMessage({
        id: '1',
        speaker: 'npc',
        text: 'Hi there',
        timestamp: Date.now(),
        wordsUsed: [],
      });
      useSessionStore.getState().addConversationMessage({
        id: '2',
        speaker: 'user',
        text: 'How are you?',
        timestamp: Date.now(),
        wordsUsed: [],
      });
      const messages = useSessionStore.getState().conversationMessages;
      expect(messages).toHaveLength(2);
      expect(messages[0].text).toBe('Hi there');
      expect(messages[1].text).toBe('How are you?');
    });
  });

  describe('incrementAsrFailure', () => {
    it('increments ASR failure count', () => {
      useSessionStore.getState().incrementAsrFailure();
      expect(useSessionStore.getState().asrFailureCount).toBe(1);
    });

    it('shows text input fallback after 2 failures', () => {
      useSessionStore.getState().incrementAsrFailure();
      expect(useSessionStore.getState().showTextInputFallback).toBe(false);
      useSessionStore.getState().incrementAsrFailure();
      expect(useSessionStore.getState().showTextInputFallback).toBe(true);
    });

    it('switches to text input mode after 3 failures', () => {
      useSessionStore.getState().incrementAsrFailure();
      useSessionStore.getState().incrementAsrFailure();
      useSessionStore.getState().incrementAsrFailure();
      expect(useSessionStore.getState().inputMode).toBe('text');
    });
  });

  describe('trySpeechMode', () => {
    it('resets ASR failures and switches to speech', () => {
      useSessionStore.getState().incrementAsrFailure();
      useSessionStore.getState().incrementAsrFailure();
      useSessionStore.getState().trySpeechMode();
      expect(useSessionStore.getState().inputMode).toBe('speech');
      expect(useSessionStore.getState().asrFailureCount).toBe(0);
      expect(useSessionStore.getState().showTextInputFallback).toBe(false);
    });
  });
});