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
import { router } from 'expo-router';
import { typography, spacing, radii } from '@/constants/theme';
import { modeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { colors } = useTheme();
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
          router.push('/session/review');
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
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Something went wrong.</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary }]} onPress={() => { setCurrentStep('scene'); router.push('/session/scene'); }}>
          <Text style={[styles.backBtnText, { color: colors.onPrimary }]}>Go back</Text>
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
          <View style={[styles.avatar, { backgroundColor: colors.conversationPartner }]}>
            <Text style={styles.avatarText}>{'\u{1F4AC}'}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.messageBubbleUser, { backgroundColor: colors.conversationUser }]
              : [styles.messageBubblePartner, { backgroundColor: colors.conversationPartner }],
          ]}
        >
          <Text style={[styles.messageText, isUser ? [styles.messageTextUser, { color: colors.textPrimary }] : { color: colors.textPrimary }]}>
            {message.text}
          </Text>
        </View>
        {isUser && (
          <Text style={[styles.youLabel, { color: colors.textMuted }]}>You</Text>
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
      style={[styles.container, { backgroundColor: colors.bg }]}
    >
      {/* Microphone permission banner */}
      {showMicPermissionBanner && (
        <TouchableOpacity
          style={[styles.permissionBanner, { backgroundColor: colors.secondary }]}
          onPress={() => {}}
          accessibilityLabel="Speaking practice requires microphone access. Tap here to enable."
          accessibilityRole="button"
        >
          <Text style={[styles.permissionBannerText, { color: colors.textPrimary }]}>
            Speaking practice requires microphone access. Tap here to enable.
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.sceneLabel, { color: colors.textSecondary }]}>{currentScene.title}</Text>
          {!isExamMode && <TempoPractice visible={true} />}
        </View>
        <TouchableOpacity
          style={[styles.headerHintButton, hintGlow ? [styles.headerHintButtonGlow, { borderColor: colors.primary, backgroundColor: colors.primarySubtle }] : [styles.headerHintButton, { borderColor: colors.border }]]}
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
                <View style={[styles.contextChangeBanner, { backgroundColor: colors.secondaryMedium }]}>
                  <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
                  <Text style={[styles.contextChangeText, { color: colors.accentWarm }]}>{message.contextChange}</Text>
                </View>
              </View>
            );
          }
          return rendered;
        })}

        {engineState.isComplete && (
          <View style={styles.completeIndicator}>
            <Text style={[styles.completeText, { color: colors.primary }]}>Great talking with you!</Text>
          </View>
        )}
      </ScrollView>

      {/* ASR status message */}
      {asrStatusMessage && (
        <View style={[styles.asrStatusBanner, { backgroundColor: colors.secondaryMedium }]}>
          <Text style={[styles.asrStatusText, { color: colors.textPrimary }]}>{asrStatusMessage}</Text>
        </View>
      )}

      {/* Exam accuracy hint */}
      {examHint && isExamMode && (
        <View style={[styles.examHintBanner, { backgroundColor: modeColors[currentMode as keyof typeof modeColors]?.accentLight ?? modeColors.survival.accentLight }]}>
          <Text style={styles.examHintIcon}>{'\u{1F4DD}'}</Text>
          <Text style={[styles.examHintText, { color: modeColors[currentMode as keyof typeof modeColors]?.accent ?? modeColors.survival.accent }]}>{examHint}</Text>
        </View>
      )}

      {/* Hint bar */}
      {showHint && (
        <View style={[styles.hintBar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.hintBarText, { color: colors.textPrimary }]}>
            {currentHint ?? 'Take your time...'}
          </Text>
        </View>
      )}

      {/* Input area */}
      {!engineState.isComplete && (
        <View style={[styles.inputArea, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          {shouldShowTextInput ? (
            <View style={styles.textInputArea}>
              {isSpeechPrimary === false && asrFailureCount >= 3 && (
                <Text style={[styles.fallbackMessage, { color: colors.textSecondary }]}>
                  I'll use text for now. We can try speaking again later!
                </Text>
              )}
              <View style={styles.textInputRow}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
                    placeholder={isExamMode ? 'Type your response (formal)...' : 'Type your response...'}
                    placeholderTextColor={colors.textMuted}
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={handleTextSend}
                    returnKeyType="send"
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.sendButton, { backgroundColor: colors.primary }]}
                  onPress={handleTextSend}
                  disabled={!inputText.trim()}
                  accessibilityLabel="Send"
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.sendButtonText,
                      { color: colors.onPrimary },
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
                  <Text style={[styles.trySpeechText, { color: colors.primary }]}>
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
                  <Text style={[styles.typeInsteadText, { color: colors.textMuted }]}>Or type your response</Text>
                </TouchableOpacity>
              )}

              <View style={styles.speechControls}>
                <TouchableOpacity
                  style={[styles.hintButton, hintGlow ? [styles.hintButtonGlow, { borderColor: colors.primary, backgroundColor: colors.primarySubtle }] : [styles.hintButton, { borderColor: colors.border }]]}
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
  },
  permissionBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  permissionBannerText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  sceneLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  examLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: 2,
  },
  headerHintButton: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerHintButtonGlow: {
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  backBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    alignSelf: 'center',
  },
  backBtnText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowPartner: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubblePartner: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  messageTextUser: {
  },
  youLabel: {
    fontSize: typography.caption.fontSize,
    alignSelf: 'flex-end',
  },
  contextChangeBanner: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contextChangeEmoji: {
    fontSize: 14,
  },
  contextChangeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  completeIndicator: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  completeText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  asrStatusBanner: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  asrStatusText: {
    fontSize: typography.hint.fontSize,
    lineHeight: typography.hint.lineHeight,
    textAlign: 'center',
  },
  examHintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
    lineHeight: typography.hint.lineHeight,
  },
  hintBar: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  hintBarText: {
    fontSize: typography.hint.fontSize,
    lineHeight: typography.hint.lineHeight,
  },
  inputArea: {
    borderTopWidth: 1,
  },
  speechInputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.lg,
  },
  typeInsteadLink: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  typeInsteadText: {
    fontSize: typography.caption.fontSize,
    textDecorationLine: 'underline',
  },
  speechControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  textInputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fallbackMessage: {
    fontSize: typography.caption.fontSize,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  textInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textInputContainer: {
    flex: 1,
  },
  textInput: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
  },
  sendButton: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    height: 44,
  },
  sendButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  sendButtonTextDisabled: {
    opacity: 0.5,
  },
  trySpeechButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  trySpeechText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '500',
  },
  hintButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  hintButtonGlow: {
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  hintButtonIcon: {
    fontSize: 20,
  },
} as const;