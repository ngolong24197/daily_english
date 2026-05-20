import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import {
  createConversation,
  processUserInput,
  getHint,
  advanceHintLevel,
  type ConversationState,
  type ConversationMessage,
} from '@/services/conversationEngine';
import { getAsrErrorMessage, type AsrError } from '@/services/asrService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useHaptics } from '@/hooks/useHaptics';
import { quickCheckCommunicationSuccess, detectCommunicationSuccess } from '@/services/communicationSuccess';
import { generateAccuracyHint } from '@/services/accuracyScoring';
import { announceConversationComplete } from '@/utils/accessibility';
import MicButton from '@/components/MicButton';
import WordExplorationSheet from '@/components/WordExplorationSheet';
import ExamModeWrapper from '@/components/ExamModeWrapper';
import TempoPractice, { getTempoConfig } from '@/components/TempoPractice';
import type { MockWord } from '@/services/mockData';

export default function ConversationScreen() {
  const {
    currentScene,
    setCurrentStep,
    saveCurrentSession,
    setConversationMessages,
    setWordsUsedThisSession,
    setConversationComplete,
    setCurrentHint,
    currentHint,
    asrFailureCount,
    showTextInputFallback,
    inputMode,
    incrementAsrFailure,
    resetAsrFailures,
    trySpeechMode,
    setInputMode,
    micPermissionStatus,
    showMicPermissionBanner,
    currentMode,
    contextChanges,
    isExamMode,
    examPracticeMode,
    tempoSupportLevel,
  } = useSessionStore();

  const [engineState, setEngineState] = useState<ConversationState>(() =>
    createConversation(currentMode, currentScene?.id)
  );
  const [inputText, setInputText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [selectedWord, setSelectedWord] = useState<MockWord | null>(null);
  const [asrStatusMessage, setAsrStatusMessage] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hintGlow, setHintGlow] = useState(false);
  const [examHint, setExamHint] = useState<string | null>(null);
  const haptics = useHaptics();

  // Audio recording hook — now uses device-native speech recognition
  const {
    recordingState,
    audioLevel,
    error: recordingError,
    startRecording,
    stopRecording,
    resetError,
    resetAsrFailures: resetHookAsrFailures,
    checkPermission,
    showTextInput: hookShowTextInput,
    enableTextInput,
  } = useAudioRecording({
    onAutoStop: () => {
      // VAD detected silence — stop recording and process what we have
      handleRecordingStop();
    },
    onTranscription: (text) => {
      // Final transcription result from device-native speech recognition
      resetAsrFailures();
      resetHookAsrFailures();
      processTranscript(text);

      if (currentScene) {
        detectCommunicationSuccess(
          text,
          currentScene.newWords.map((w) => w.lemma),
          currentScene.reviewWords.map((w) => w.lemma),
          currentScene.description,
          engineState.messages
        ).catch(() => {});
      }
    },
    onAudioLevel: () => {},
    vocabulary: currentScene
      ? [
          ...currentScene.newWords.map((w) => w.lemma),
          ...currentScene.reviewWords.map((w) => w.lemma),
        ]
      : [],
  });

  // Sync mic permission status to store
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-scroll on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [engineState.messages]);

  // Hint glow after 8 seconds of silence
  useEffect(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (!engineState.isComplete) {
      silenceTimerRef.current = setTimeout(() => {
        setHintGlow(true);
      }, 8000);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };
  }, [engineState.messages.length]);

  const handleRecordingStop = useCallback(async () => {
    // Stop the recording and speech recognition.
    // The actual transcription is handled via the onTranscription callback
    // in the useAudioRecording hook, so this just cleans up the recording state.
    await stopRecording();
  }, [stopRecording]);

  const processTranscript = useCallback(
    (text: string) => {
      if (!text.trim() || engineState.isComplete) return;

      setHintGlow(false);
      setShowHint(false);
      setAsrStatusMessage(null);

      // Generate exam accuracy hint if in exam mode
      if (isExamMode) {
        const hint = generateAccuracyHint(text, true);
        if (hint) {
          setExamHint(hint);
          // Clear exam hint after 5 seconds
          setTimeout(() => setExamHint(null), 5000);
        }
      }

      const newState = processUserInput(engineState, text.trim(), currentMode, currentScene?.id);
      setEngineState(newState);

      if (newState.isComplete) {
        setConversationMessages(newState.messages);
        setWordsUsedThisSession(newState.wordsUsedThisSession);
        setConversationComplete(true);
        haptics.impactHeavy();
        announceConversationComplete();

        setTimeout(() => {
          saveCurrentSession();
          setCurrentStep('review');
        }, 2000);
      }
    },
    [engineState, currentMode, isExamMode, setConversationMessages, setWordsUsedThisSession, setConversationComplete, saveCurrentSession, setCurrentStep]
  );

  const handleMicPress = useCallback(async () => {
    if (recordingState === 'recording') {
      await handleRecordingStop();
    } else if (recordingState === 'error') {
      resetError();
    } else if (recordingState === 'idle') {
      await startRecording();
    }
  }, [recordingState, handleRecordingStop, resetError, startRecording]);

  const handleTextSend = () => {
    if (!inputText.trim() || engineState.isComplete) return;
    processTranscript(inputText.trim());
    setInputText('');
    resetAsrFailures();
  };

  const handleHintPress = () => {
    if (engineState.isComplete) return;

    const advancedState = advanceHintLevel(engineState);
    setEngineState(advancedState);

    const hint = getHint(advancedState, currentMode, currentScene?.id);
    if (hint) {
      setShowHint(true);
      setCurrentHint(hint.text);
    }
  };

  const handleSwitchToText = () => {
    setInputMode('text');
    enableTextInput();
  };

  const handleTrySpeech = () => {
    trySpeechMode();
    setAsrStatusMessage(null);
  };

  if (!currentScene) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Something went wrong.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => setCurrentStep('scene')}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.speaker === 'user';
    return (
      <View
        key={message.id}
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowPartner,
        ]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{'\u{1F4AC}'}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageBubbleUser : styles.messageBubblePartner,
          ]}
        >
          <Text style={[styles.messageText, isUser && styles.messageTextUser]}>
            {message.text}
          </Text>
        </View>
        {isUser && (
          <Text style={styles.youLabel}>You</Text>
        )}
      </View>
    );
  };

  const shouldShowTextInput = showTextInputFallback || hookShowTextInput || inputMode === 'text';
  const isSpeechPrimary = inputMode === 'speech' && !shouldShowTextInput;

  // Collect all words for the exploration sheet
  const allWords: MockWord[] = currentScene
    ? [...currentScene.newWords, ...currentScene.reviewWords]
    : [];

  // Compute step label for exam mode wrapper
  const examStepLabel = isExamMode
    ? `Step ${engineState.currentStep + 1} of ${currentScene ? (currentMode === 'ielts' ? 3 : 2) : ''}`
    : undefined;

  const conversationContent = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Microphone permission banner */}
      {showMicPermissionBanner && (
        <TouchableOpacity
          style={styles.permissionBanner}
          onPress={() => {}}
          accessibilityLabel="Speaking practice requires microphone access. Tap here to enable."
          accessibilityRole="button"
        >
          <Text style={styles.permissionBannerText}>
            Speaking practice requires microphone access. Tap here to enable.
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sceneLabel}>{currentScene.title}</Text>
          {!isExamMode && <TempoPractice visible={true} />}
        </View>
        <TouchableOpacity
          style={[styles.headerHintButton, hintGlow && styles.headerHintButtonGlow]}
          onPress={handleHintPress}
          accessibilityLabel="Get a hint"
          accessibilityRole="button"
        >
          <Text style={styles.headerHintIcon}>{'\u{1F4A1}'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      >
        {engineState.messages.map((message) => {
          const rendered = renderMessage(message);

          // Show context change callout if this message has one
          if (message.contextChange) {
            return (
              <View key={message.id}>
                {rendered}
                <View style={styles.contextChangeBanner}>
                  <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
                  <Text style={styles.contextChangeText}>{message.contextChange}</Text>
                </View>
              </View>
            );
          }
          return rendered;
        })}

        {engineState.isComplete && (
          <View style={styles.completeIndicator}>
            <Text style={styles.completeText}>Great talking with you!</Text>
          </View>
        )}
      </ScrollView>

      {/* ASR status message */}
      {asrStatusMessage && (
        <View style={styles.asrStatusBanner}>
          <Text style={styles.asrStatusText}>{asrStatusMessage}</Text>
        </View>
      )}

      {/* Exam accuracy hint */}
      {examHint && isExamMode && (
        <View style={styles.examHintBanner}>
          <Text style={styles.examHintIcon}>{'\u{1F4DD}'}</Text>
          <Text style={styles.examHintText}>{examHint}</Text>
        </View>
      )}

      {/* Hint bar */}
      {showHint && (
        <View style={styles.hintBar}>
          <Text style={styles.hintBarText}>
            {currentHint ?? 'Take your time...'}
          </Text>
        </View>
      )}

      {/* Input area */}
      {!engineState.isComplete && (
        <View style={styles.inputArea}>
          {shouldShowTextInput ? (
            <View style={styles.textInputArea}>
              {isSpeechPrimary === false && asrFailureCount >= 3 && (
                <Text style={styles.fallbackMessage}>
                  I'll use text for now. We can try speaking again later!
                </Text>
              )}
              <View style={styles.textInputRow}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={isExamMode ? 'Type your response (formal)...' : 'Type your response...'}
                    placeholderTextColor={colors.light.textMuted}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleTextSend}
                    returnKeyType="send"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleTextSend}
                  disabled={!inputText.trim()}
                  accessibilityLabel="Send"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.sendButtonText,
                      !inputText.trim() && styles.sendButtonTextDisabled,
                    ]}
                  >
                    Send
                  </Text>
                </TouchableOpacity>
              </View>

              {micPermissionStatus === 'granted' && (
                <TouchableOpacity
                  style={styles.trySpeechButton}
                  onPress={handleTrySpeech}
                  accessibilityLabel="Try speaking instead"
                  accessibilityRole="button"
                >
                  <Text style={styles.trySpeechText}>
                    {'\u{1F3A4}'} Try speaking instead
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {isSpeechPrimary || !shouldShowTextInput ? (
            <View style={styles.speechInputArea}>
              {!shouldShowTextInput && (
                <TouchableOpacity
                  style={styles.typeInsteadLink}
                  onPress={handleSwitchToText}
                  accessibilityLabel="Type your response instead"
                  accessibilityRole="button"
                >
                  <Text style={styles.typeInsteadText}>Or type your response</Text>
                </TouchableOpacity>
              )}

              <View style={styles.speechControls}>
                <TouchableOpacity
                  style={[styles.hintButton, hintGlow && styles.hintButtonGlow]}
                  onPress={handleHintPress}
                  accessibilityLabel="Get a hint"
                  accessibilityRole="button"
                >
                  <Text style={styles.hintButtonIcon}>{'\u{1F4A1}'}</Text>
                </TouchableOpacity>

                <MicButton
                  recordingState={recordingState}
                  audioLevel={audioLevel}
                  onPress={handleMicPress}
                  errorMessage={
                    recordingError
                      ? recordingError.message
                      : undefined
                  }
                />
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* Word Exploration Sheet */}
      <WordExplorationSheet
        visible={selectedWord !== null}
        word={selectedWord}
        modeCode={currentMode}
        contextChangeDescription={
          selectedWord ? contextChanges[selectedWord.id] : undefined
        }
        onClose={() => setSelectedWord(null)}
      />
    </KeyboardAvoidingView>
  );

  // Wrap with ExamModeWrapper when in exam mode
  if (isExamMode) {
    return (
      <ExamModeWrapper
        modeCode={currentMode}
        partLabel={examStepLabel}
        showFormalIndicator={true}
      >
        {conversationContent}
      </ExamModeWrapper>
    );
  }

  return conversationContent;
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
  },
  permissionBanner: {
    backgroundColor: colors.light.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionBannerText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.caption.lineHeight,
    textAlign: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerLeft: {
    flex: 1 as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    flexWrap: 'wrap' as const,
  },
  sceneLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
  },
  examLabel: {
    fontSize: typography.caption.fontSize,
    color: '#4A7A9B',
    fontWeight: '600' as const,
    marginTop: 2,
  },
  headerHintButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  headerHintButtonGlow: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(91, 140, 90, 0.1)',
  },
  headerHintIcon: {
    fontSize: 18,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messageListContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    textAlign: 'center' as const,
    marginTop: spacing['3xl'],
  },
  backBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    alignSelf: 'center' as const,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
  },
  messageRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end' as const,
  },
  messageRowPartner: {
    justifyContent: 'flex-start' as const,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.light.conversationPartner,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '80%' as const,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageBubbleUser: {
    backgroundColor: colors.light.conversationUser,
    borderBottomRightRadius: 4,
  },
  messageBubblePartner: {
    backgroundColor: colors.light.conversationPartner,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  messageTextUser: {
    color: colors.light.textPrimary,
  },
  youLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    alignSelf: 'flex-end' as const,
  },
  contextChangeBanner: {
    backgroundColor: 'rgba(232, 168, 124, 0.15)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  contextChangeEmoji: {
    fontSize: 14,
  },
  contextChangeText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.accentWarm,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  completeIndicator: {
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
  },
  completeText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.light.primary,
  },
  asrStatusBanner: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  asrStatusText: {
    fontSize: typography.hint.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.hint.lineHeight,
    textAlign: 'center' as const,
  },
  examHintBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
    backgroundColor: 'rgba(58, 106, 143, 0.1)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  examHintIcon: {
    fontSize: 16,
  },
  examHintText: {
    flex: 1,
    fontSize: typography.hint.fontSize,
    color: '#3A6A8F',
    lineHeight: typography.hint.lineHeight,
  },
  hintBar: {
    backgroundColor: colors.light.secondary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  hintBarText: {
    fontSize: typography.hint.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.hint.lineHeight,
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.bg,
  },
  speechInputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  typeInsteadLink: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  typeInsteadText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    textDecorationLine: 'underline' as const,
  },
  speechControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  textInputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fallbackMessage: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    textAlign: 'center' as const,
    marginBottom: spacing.sm,
  },
  textInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sendButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center' as const,
    height: 44,
  },
  sendButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: '#FFFFFF',
  },
  sendButtonTextDisabled: {
    opacity: 0.5,
  },
  trySpeechButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
    marginTop: spacing.xs,
  },
  trySpeechText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.primary,
    fontWeight: '500' as const,
  },
  hintButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  hintButtonGlow: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(91, 140, 90, 0.1)',
  },
  hintButtonIcon: {
    fontSize: 20,
  },
};