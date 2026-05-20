import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Animated,
} from 'react-native';
import { useState, useRef, useEffect, useCallback } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { getAsrErrorMessage } from '@/services/asrService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import MicButton from '@/components/MicButton';
import {
  getJamAlongScript,
  type JamAlongScript,
  type JamAlongLine,
} from '@/services/jamAlongData';

export default function JamAlongScreen() {
  const {
    currentScene,
    currentMode,
    jamAlongScriptId,
    setCurrentStep,
    saveCurrentSession,
    setConversationMessages,
    setWordsUsedThisSession,
    setConversationComplete,
    setCurrentHint,
    setPracticeFormat,
  } = useSessionStore();

  const script: JamAlongScript | null = jamAlongScriptId
    ? getJamAlongScript(jamAlongScriptId)
    : currentScene
      ? currentScene.modeCode === 'professional' || currentScene.modeCode === 'ielts' || currentScene.modeCode === 'toeic'
        ? getJamAlongScript('jam-meeting-professional')
        : getJamAlongScript('jam-cafe-survival')
      : null;

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<JamAlongLine[]>([]);
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [hintLevel, setHintLevel] = useState<Record<number, 0 | 1 | 2>>({});
  const [inputText, setInputText] = useState('');
  const [asrStatusMessage, setAsrStatusMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    recordingState,
    audioLevel,
    startRecording,
    stopRecording,
    resetError,
  } = useAudioRecording({
    onAutoStop: () => {
      // VAD detected silence — stop recording
      handleRecordingStop();
    },
    onTranscription: (text) => {
      // Final transcription from device-native speech recognition
      setAsrStatusMessage(null);
      processUserResponse(text);
    },
    vocabulary: currentScene
      ? [
          ...currentScene.newWords.map((w) => w.lemma),
          ...currentScene.reviewWords.map((w) => w.lemma),
        ]
      : [],
  });

  const {
    incrementAsrFailure,
    resetAsrFailures,
    showTextInputFallback,
    inputMode: storeInputMode,
    setInputMode,
    micPermissionStatus,
  } = useSessionStore();

  // Pulse animation for user slots
  useEffect(() => {
    if (!script || isComplete) return;
    const currentLine = script.lines[currentLineIndex];
    if (currentLine?.speaker === 'user') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [currentLineIndex, script, isComplete]);

  // Auto-scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [completedLines, currentLineIndex]);

  const handleRecordingStop = useCallback(async () => {
    // Stop the recording and speech recognition.
    // The actual transcription is handled via the onTranscription callback
    // in the useAudioRecording hook, so this just cleans up the recording state.
    await stopRecording();
  }, [stopRecording]);

  const processUserResponse = useCallback(
    (text: string) => {
      if (!script || isComplete) return;
      const currentLine = script.lines[currentLineIndex];
      if (currentLine?.speaker !== 'user') return;

      setUserInputs((prev) => ({ ...prev, [currentLineIndex]: text }));
      setCompletedLines((prev) => [...prev, { ...currentLine, text }]);

      // Advance past the user's line to the next native line or completion
      const nextIndex = currentLineIndex + 1;
      if (nextIndex >= script.lines.length) {
        setIsComplete(true);
        onJamAlongComplete();
        return;
      }

      // Add any consecutive native lines
      let idx = nextIndex;
      const newCompleted: JamAlongLine[] = [];
      while (idx < script.lines.length && script.lines[idx].speaker === 'native') {
        newCompleted.push(script.lines[idx]);
        idx++;
      }
      if (newCompleted.length > 0) {
        setCompletedLines((prev) => [...prev, ...newCompleted]);
      }

      setCurrentLineIndex(idx);
      setInputText('');
      setHintLevel({});
    },
    [script, currentLineIndex, isComplete]
  );

  const onJamAlongComplete = useCallback(() => {
    // Save session data
    const userSentences = Object.values(userInputs);
    setConversationMessages(
      completedLines.map((line, i) => ({
        id: `msg-${i}`,
        speaker: line.speaker === 'user' ? 'user' as const : 'npc' as const,
        text: line.speaker === 'user' ? (userInputs[i] ?? line.text) : line.text,
        timestamp: Date.now(),
        wordsUsed: [],
      }))
    );
    setWordsUsedThisSession(
      userSentences.flatMap((s) => {
        const allWords = ['brew', 'recommend', 'seasonal', 'fresh', 'order', 'get', 'would like',
          'deadline', 'approach', 'handle', 'figure', 'point', 'carry', 'run'];
        return allWords.filter((w) => s.toLowerCase().includes(w));
      })
    );
    setConversationComplete(true);
    saveCurrentSession();
    setTimeout(() => setCurrentStep('review'), 2000);
  }, [completedLines, userInputs]);

  const handleTextSend = () => {
    if (!inputText.trim()) return;
    processUserResponse(inputText.trim());
    setInputText('');
  };

  const handleHintPress = () => {
    if (!script || isComplete) return;
    const currentLine = script.lines[currentLineIndex];
    if (currentLine?.speaker !== 'user') return;

    const currentLevel = hintLevel[currentLineIndex] ?? 0;
    if (currentLevel < 2) {
      setHintLevel((prev) => ({
        ...prev,
        [currentLineIndex]: (currentLevel + 1) as 0 | 1 | 2,
      }));
    }
  };

  const handleReplayLine = (lineIndex: number) => {
    // In a real implementation, this would replay audio
    // For now, it's a visual affordance
  };

  const handleBackToConversation = () => {
    setPracticeFormat('conversation');
    setCurrentStep('scene');
  };

  if (!script) {
    return (
      <View style={jamStyles.container}>
        <Text style={jamStyles.errorText}>Something went wrong loading the Jam Along.</Text>
        <TouchableOpacity style={jamStyles.backBtn} onPress={handleBackToConversation}>
          <Text style={jamStyles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentLine = script.lines[currentLineIndex];
  const isUserSlot = currentLine?.speaker === 'user';
  const currentHintLevel = hintLevel[currentLineIndex] ?? 0;
  const hintText = isUserSlot
    ? currentHintLevel === 1
      ? currentLine.hintLevel1
      : currentHintLevel === 2
        ? currentLine.hintLevel2
        : null
    : null;

  const showTextInput = showTextInputFallback || storeInputMode === 'text';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={jamStyles.container}
    >
      {/* Warm-tinted background for Jam Along */}
      <View style={jamStyles.stageLabel}>
        <Text style={jamStyles.stageIcon}>{'\u{1F3B5}'}</Text>
        <Text style={jamStyles.stageTitle}>Jam Along</Text>
        <Text style={jamStyles.stageSubtitle}>{script.title}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={jamStyles.messageList}
        contentContainerStyle={jamStyles.messageListContent}
      >
        {/* Completed lines */}
        {completedLines.map((line, idx) => {
          const isUserLine = line.speaker === 'user';
          const actualText = isUserLine ? (userInputs[idx] ?? line.text) : line.text;
          return (
            <View key={`completed-${idx}`}>
              {isUserLine ? (
                <View style={jamStyles.userLineRow}>
                  <View style={jamStyles.userLineBubble}>
                    <Text style={jamStyles.userLineLabel}>You</Text>
                    <Text style={jamStyles.userLineText}>{actualText}</Text>
                  </View>
                </View>
              ) : (
                <View style={jamStyles.nativeLineRow}>
                  <TouchableOpacity
                    onPress={() => handleReplayLine(idx)}
                    style={jamStyles.nativeReplayButton}
                    accessibilityLabel="Replay this line"
                  >
                    <Text style={jamStyles.nativeReplayIcon}>{'\u{25B6}'}</Text>
                  </TouchableOpacity>
                  <View style={jamStyles.nativeLineBubble}>
                    <Text style={jamStyles.nativeLineText}>{line.text}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Current user slot (active) */}
        {isUserSlot && !isComplete && (
          <Animated.View style={[jamStyles.userSlotContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={jamStyles.userSlotBubble}>
              <Text style={jamStyles.micIcon}>{'\u{1F3A4}'}</Text>
              <Text style={jamStyles.yourTurnLabel}>Your turn -- fill in!</Text>
              <Text style={jamStyles.userSlotHint}>
                {currentLine.hintLevel1}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Current native line (if applicable) */}
        {currentLine?.speaker === 'native' && !isComplete && currentLineIndex === completedLines.length && (
          <View style={jamStyles.nativeLineRow}>
            <TouchableOpacity
              onPress={() => handleReplayLine(currentLineIndex)}
              style={jamStyles.nativeReplayButton}
              accessibilityLabel="Replay this line"
            >
              <Text style={jamStyles.nativeReplayIcon}>{'\u{25B6}'}</Text>
            </TouchableOpacity>
            <View style={jamStyles.nativeLineBubble}>
              <Text style={jamStyles.nativeLineText}>{currentLine.text}</Text>
            </View>
          </View>
        )}

        {/* Completion message */}
        {isComplete && (
          <View style={jamStyles.completeIndicator}>
            <Text style={jamStyles.completeTitle}>Great job!</Text>
            <Text style={jamStyles.completeText}>
              You completed the Jam Along. Here is the full dialogue:
            </Text>
          </View>
        )}

        {/* Full dialogue review at completion */}
        {isComplete && (
          <View style={jamStyles.dialogueReview}>
            {script.lines.map((line, idx) => {
              const isUserLine = line.speaker === 'user';
              const actualText = isUserLine ? (userInputs[idx] ?? line.text) : line.text;
              return (
                <View
                  key={`review-${idx}`}
                  style={[
                    jamStyles.reviewLine,
                    isUserLine && jamStyles.reviewLineUser,
                  ]}
                >
                  <Text style={jamStyles.reviewSpeaker}>
                    {isUserLine ? 'You:' : 'Native speaker:'}
                  </Text>
                  <Text style={[jamStyles.reviewText, isUserLine && jamStyles.reviewTextUser]}>
                    {actualText}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Hint display */}
      {hintText && !isComplete && (
        <View style={jamStyles.hintBar}>
          <Text style={jamStyles.hintBarText}>{hintText}</Text>
        </View>
      )}

      {/* ASR status */}
      {asrStatusMessage && (
        <View style={jamStyles.asrBanner}>
          <Text style={jamStyles.asrBannerText}>{asrStatusMessage}</Text>
        </View>
      )}

      {/* Input area */}
      {!isComplete && isUserSlot && (
        <View style={jamStyles.inputArea}>
          {showTextInput ? (
            <View style={jamStyles.textInputArea}>
              <View style={jamStyles.textInputRow}>
                <TextInput
                  style={jamStyles.textInput}
                  placeholder="Type your response..."
                  placeholderTextColor={colors.light.textMuted}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleTextSend}
                  returnKeyType="send"
                  autoFocus
                />
                <TouchableOpacity
                  style={jamStyles.sendButton}
                  onPress={handleTextSend}
                  disabled={!inputText.trim()}
                >
                  <Text style={jamStyles.sendButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <View style={jamStyles.speechControls}>
            <TouchableOpacity
              style={jamStyles.hintButton}
              onPress={handleHintPress}
              accessibilityLabel="Get a hint"
              accessibilityRole="button"
            >
              <Text style={jamStyles.hintButtonIcon}>{'\u{1F4A1}'}</Text>
            </TouchableOpacity>

            <MicButton
              recordingState={recordingState}
              audioLevel={audioLevel}
              onPress={
                recordingState === 'recording'
                  ? handleRecordingStop
                  : recordingState === 'error'
                    ? resetError
                    : startRecording
              }
              errorMessage={recordingState === 'error' ? 'Try again' : undefined}
            />

            {!showTextInput && (
              <TouchableOpacity
                style={jamStyles.typeInsteadButton}
                onPress={() => setInputMode('text')}
              >
                <Text style={jamStyles.typeInsteadText}>Or type your response</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Back to conversation button */}
      <View style={jamStyles.footerActions}>
        <TouchableOpacity onPress={handleBackToConversation} style={jamStyles.switchFormatButton}>
          <Text style={jamStyles.switchFormatText}>Switch to regular conversation</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const jamStyles = {
  container: {
    flex: 1 as const,
    backgroundColor: '#FFF8F0', // Warm tint for Jam Along mode
  },
  stageLabel: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  stageIcon: {
    fontSize: 20,
  },
  stageTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as const,
    color: colors.light.textPrimary,
  },
  stageSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    marginLeft: spacing.sm,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  messageListContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  // Native speaker line styling
  nativeLineRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.sm,
  },
  nativeReplayButton: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    backgroundColor: colors.light.conversationPartner,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  nativeReplayIcon: {
    fontSize: 12,
    color: colors.light.textPrimary,
  },
  nativeLineBubble: {
    maxWidth: '80%' as const,
    backgroundColor: colors.light.conversationPartner,
    borderRadius: radii.md,
    borderBottomLeftRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  nativeLineText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  // User line styling (completed)
  userLineRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
  },
  userLineBubble: {
    maxWidth: '80%' as const,
    backgroundColor: colors.light.conversationUser,
    borderRadius: radii.md,
    borderBottomRightRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userLineLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  userLineText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  // Active user slot (pulsing)
  userSlotContainer: {
    alignItems: 'center' as const,
  },
  userSlotBubble: {
    width: '90%' as const,
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.light.primary,
    borderStyle: 'dashed',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  micIcon: {
    fontSize: 28,
  },
  yourTurnLabel: {
    fontSize: typography.body.fontSize,
    fontWeight: '600' as const,
    color: colors.light.primary,
  },
  userSlotHint: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    fontStyle: 'italic' as const,
  },
  // Hint bar
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
  // ASR banner
  asrBanner: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  asrBannerText: {
    fontSize: typography.hint.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.hint.lineHeight,
    textAlign: 'center' as const,
  },
  // Input area
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: '#FFF8F0',
  },
  speechControls: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    gap: spacing.lg,
  },
  textInputArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
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
  hintButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  hintButtonIcon: {
    fontSize: 20,
  },
  typeInsteadButton: {
    paddingVertical: spacing.xs,
  },
  typeInsteadText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    textDecorationLine: 'underline' as const,
  },
  // Completion
  completeIndicator: {
    paddingVertical: spacing.lg,
    alignItems: 'center' as const,
  },
  completeTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600' as const,
    color: colors.light.primary,
    marginBottom: spacing.xs,
  },
  completeText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    textAlign: 'center' as const,
  },
  // Dialogue review
  dialogueReview: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  reviewLine: {
    backgroundColor: colors.light.conversationPartner,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewLineUser: {
    backgroundColor: 'rgba(91, 140, 90, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: colors.light.primary,
  },
  reviewSpeaker: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  reviewText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  reviewTextUser: {
    fontWeight: '500' as const,
  },
  // Footer actions
  footerActions: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  switchFormatButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center' as const,
  },
  switchFormatText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    textDecorationLine: 'underline' as const,
  },
  // Error state
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
};