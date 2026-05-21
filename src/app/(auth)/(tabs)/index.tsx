import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { getSceneForMoodAndMode } from '@/services/supabaseDataService';
import { preloadData } from '@/services/supabaseDataService';
import { getAsrErrorMessage } from '@/services/asrService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useHaptics } from '@/hooks/useHaptics';
import MicButton from '@/components/MicButton';
import SceneScreen from '@/features/daily-session/components/SceneScreen';
import ConversationScreen from '@/features/daily-session/components/ConversationScreen';
import JamAlongScreen from '@/components/JamAlongScreen';
import ReviewScreen from '@/features/daily-session/components/ReviewScreen';
import { getReviewWordsForSession } from '@/services/situationalRepetition';
import { initializeDemoProgress } from '@/services/wordProgress';
import { getGreetingForMode, isExamMode } from '@/services/contextDetection';
import { streakService } from '@/services/streakService';
import { shouldShowWarmReEntry, getWarmReEntryMessage, recordSessionDate } from '@/services/warmReEntry';
import OnboardingEasing, { isOnboardingComplete } from '@/components/OnboardingEasing';
import { MoodLabels, phraseLabel } from '@/utils/accessibility';
import { APP_CONFIG } from '@/constants/appConfig';
import TrackSelectionScreen from '../track-selection';

const MOODS = [
  { key: 'good', emoji: '\u{1F60A}', label: 'Good' },
  { key: 'okay', emoji: '\u{1F610}', label: 'Okay' },
  { key: 'rough', emoji: '\u{1F62B}', label: 'Rough' },
  { key: 'focused', emoji: '\u{1F3AF}', label: 'Focused' },
];

const PHRASES = [
  'Just a regular day',
  'Going to work',
  'Not feeling great',
  'Feeling good today',
];

function CheckInScreen() {
  const [textResponse, setTextResponse] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [asrMessage, setAsrMessage] = useState<string | null>(null);
  const [warmMessage, setWarmMessage] = useState<string | null>(null);

  const {
    selectedMood,
    selectedPhrase,
    setSelectedMood,
    setSelectedPhrase,
    setDayResponse,
    setCurrentStep,
    setCurrentScene,
    setMicPermissionStatus,
    micPermissionStatus,
    currentMode,
    setCurrentMode,
    setContextChanges,
    onboardingComplete,
    isExamMode: storeIsExamMode,
    examPracticeMode,
  } = useSessionStore();

  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  const isExamModeFlag = isExamMode(currentMode);
  const isExamPractice = isExamModeFlag && examPracticeMode === 'exam';

  // Initialize demo word progress, record streak, and check warm re-entry on first load
  useEffect(() => {
    preloadData();
    initializeDemoProgress(currentMode);
    streakService.recordSession();
    recordSessionDate();

    // Show warm re-entry message if returning after 1+ days
    if (APP_CONFIG.features.enableWarmReEntry && shouldShowWarmReEntry()) {
      const message = getWarmReEntryMessage();
      if (message) {
        setWarmMessage(message);
        // Auto-dismiss after 4 seconds
        setTimeout(() => setWarmMessage(null), 4000);
      }
    }

    playEntrance();
  }, []);

  const {
    recordingState,
    audioLevel,
    startRecording,
    stopRecording,
    checkPermission,
    resetError,
  } = useAudioRecording({
    onAutoStop: () => {
      // VAD detected silence — stop recording
      stopRecording();
    },
    onTranscription: (text) => {
      // Final transcription from device-native speech recognition
      setAsrMessage(null);
      proceedToScene(text);
    },
  });

  const proceedToScene = useCallback((response: string) => {
    // Get mode-aware scene
    const scene = getSceneForMoodAndMode(response, currentMode);
    setDayResponse(response);
    setCurrentScene(scene);

    // Get review words for situational repetition
    const sessionWordIds = scene.newWords.map((w) => w.id);
    const { contextChanges: changes } = getReviewWordsForSession(
      currentMode,
      2,
      sessionWordIds
    );

    // Store context changes for display
    setContextChanges(changes);

    setCurrentStep('scene');
  }, [currentMode, setDayResponse, setCurrentScene, setCurrentStep, setContextChanges]);

  const handleMoodSelect = (moodKey: string) => {
    haptics.selectionChanged();
    setSelectedMood(moodKey);
    setSelectedPhrase(null);
    proceedToScene(moodKey);
  };

  const handlePhraseSelect = (phrase: string) => {
    haptics.selectionChanged();
    setSelectedPhrase(phrase);
    setSelectedMood(null);
    proceedToScene(phrase);
  };

  const handleTextSubmit = () => {
    if (textResponse.trim()) {
      setDayResponse(textResponse.trim());
      setSelectedMood(null);
      setSelectedPhrase(null);
      proceedToScene(textResponse.trim());
    }
  };

  const handleMicPress = useCallback(async () => {
    if (recordingState === 'recording') {
      // Stop recording — transcription is handled via onTranscription callback
      await stopRecording();
    } else if (recordingState === 'error') {
      resetError();
      setAsrMessage(null);
    } else if (recordingState === 'idle') {
      await startRecording();
    }
  }, [recordingState, stopRecording, startRecording, resetError]);

  // Get mode-aware greeting
  const { greeting, prompt, promptSub } = getGreetingForMode(currentMode);

  // Get mode label for display
  const modeLabel = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

  // Exam mode: skip mood selection, go straight to conversation
  const handleExamStart = useCallback(() => {
    const examResponse = isExamPractice ? 'exam practice' : 'daily practice';
    const scene = getSceneForMoodAndMode(examResponse, currentMode);
    setDayResponse(examResponse);
    setCurrentScene(scene);

    const sessionWordIds = scene.newWords.map((w) => w.id);
    const { contextChanges: changes } = getReviewWordsForSession(
      currentMode,
      2,
      sessionWordIds,
    );
    setContextChanges(changes);

    // Skip scene step and go directly to conversation in exam mode
    setCurrentStep('conversation');
  }, [currentMode, isExamPractice, setDayResponse, setCurrentScene, setCurrentStep, setContextChanges]);

  // Exam mode check-in UI: structured start instead of casual mood selection
  if (isExamPractice) {
    const examType = currentMode === 'ielts' ? 'IELTS' : 'TOEIC';
    const examAccentColor = currentMode === 'ielts' ? '#3A6A8F' : '#8B6B3D';
    const examDescription = currentMode === 'ielts'
      ? 'You will practice structured IELTS speaking tasks with accuracy feedback. The examiner will ask you questions and you respond naturally.'
      : 'You will practice structured TOEIC speaking tasks with accuracy feedback. You will respond to business English scenarios.';

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={checkInStyles.container}
      >
        <View style={checkInStyles.trackLabel}>
          <Text style={checkInStyles.trackLabelText}>{modeLabel}</Text>
          <Text style={[checkInStyles.examModeLabel, { color: examAccentColor }]}>
            {examType} Practice
          </Text>
        </View>

        <View style={checkInStyles.promptArea}>
          <Text style={checkInStyles.greeting}>{greeting}</Text>
          <Text style={checkInStyles.prompt}>{prompt}</Text>
          <Text style={checkInStyles.promptSub}>{promptSub}</Text>
        </View>

        <View style={checkInStyles.examDescriptionCard}>
          <Text style={[checkInStyles.examDescriptionTitle, { color: examAccentColor }]}>
            {examType} Speaking Practice
          </Text>
          <Text style={checkInStyles.examDescriptionText}>
            {examDescription}
          </Text>
        </View>

        <View style={checkInStyles.examStartArea}>
          <TouchableOpacity
            style={[checkInStyles.examStartButton, { backgroundColor: examAccentColor }]}
            onPress={handleExamStart}
            accessibilityRole="button"
            accessibilityLabel="Begin practice"
          >
            <Text style={checkInStyles.examStartButtonText}>Begin Practice</Text>
          </TouchableOpacity>
          <Text style={checkInStyles.examStartSubtext}>
            You can switch to daily practice mode in Settings.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={checkInStyles.container}
    >
      <View style={checkInStyles.trackLabel}>
        <Text style={checkInStyles.trackLabelText}>{modeLabel}</Text>
        {isExamModeFlag && (
          <Text style={checkInStyles.examModeLabel}>{'\u{1F4DD}'} Exam Mode</Text>
        )}
      </View>

      {/* Warm re-entry welcome banner */}
      {warmMessage && (
        <View style={checkInStyles.warmBanner}>
          <Text style={checkInStyles.warmBannerText}>{warmMessage}</Text>
        </View>
      )}

      <Animated.View style={[checkInStyles.promptArea, fadeIn, slideUp]}>
        <Text style={checkInStyles.greeting}>{greeting}</Text>
        <Text style={checkInStyles.prompt}>{prompt}</Text>
        <Text style={checkInStyles.promptSub}>{promptSub}</Text>
      </Animated.View>

      <View style={checkInStyles.emojiRow}>
        {MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.key}
            style={[
              checkInStyles.emojiButton,
              selectedMood === mood.key && checkInStyles.emojiButtonSelected,
            ]}
            onPress={() => handleMoodSelect(mood.key)}
            accessibilityLabel={MoodLabels[mood.key] ?? mood.label}
            accessibilityRole="button"
          >
            <Text style={checkInStyles.emojiText}>{mood.emoji}</Text>
            <Text
              style={[
                checkInStyles.emojiLabel,
                selectedMood === mood.key && checkInStyles.emojiLabelSelected,
              ]}
            >
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={checkInStyles.chipRow}>
        {PHRASES.map((phrase) => (
          <TouchableOpacity
            key={phrase}
            style={[
              checkInStyles.phraseChip,
              selectedPhrase === phrase && checkInStyles.phraseChipSelected,
            ]}
            onPress={() => handlePhraseSelect(phrase)}
            accessibilityLabel={phraseLabel(phrase)}
            accessibilityRole="button"
          >
            <Text
              style={[
                checkInStyles.phraseChipText,
                selectedPhrase === phrase && checkInStyles.phraseChipTextSelected,
              ]}
            >
              {phrase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ASR status message */}
      {asrMessage && (
        <View style={checkInStyles.asrBanner}>
          <Text style={checkInStyles.asrBannerText}>{asrMessage}</Text>
        </View>
      )}

      {/* Mic button for speaking */}
      <View style={checkInStyles.micArea}>
        <MicButton
          recordingState={recordingState}
          audioLevel={audioLevel}
          onPress={handleMicPress}
        />
      </View>

      {/* Text input fallback */}
      {showTextInput ? (
        <View style={checkInStyles.textInputArea}>
          <TextInput
            style={checkInStyles.textInput}
            placeholder="Type how your day was..."
            placeholderTextColor={colors.light.textMuted}
            value={textResponse}
            onChangeText={setTextResponse}
            onSubmitEditing={handleTextSubmit}
            returnKeyType="send"
            autoFocus
          />
          <TouchableOpacity style={checkInStyles.sendButton} onPress={handleTextSubmit} accessibilityLabel="Send message" accessibilityRole="button">
            <Text style={checkInStyles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={checkInStyles.typeInsteadButton}
          onPress={() => {
            haptics.impactLight();
            setShowTextInput(true);
          }}
          accessibilityLabel="Type your response instead"
          accessibilityRole="button"
        >
          <Text style={checkInStyles.typeInsteadText}>Or type your response</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const checkInStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackLabel: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.md,
  },
  trackLabelText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
  },
  examModeLabel: {
    fontSize: typography.caption.fontSize,
    color: '#4A7A9B',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  greeting: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500',
    color: colors.light.textSecondary,
    lineHeight: typography.subheading.lineHeight,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  promptArea: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  prompt: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    color: colors.light.textPrimary,
    lineHeight: typography.display.lineHeight,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '400',
    color: colors.light.textSecondary,
    lineHeight: typography.subheading.lineHeight,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  emojiButton: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.light.border,
  },
  emojiButtonSelected: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
  },
  emojiText: {
    fontSize: 24,
  },
  emojiLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  emojiLabelSelected: {
    color: colors.light.primary,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  phraseChip: {
    backgroundColor: colors.light.secondary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  phraseChipSelected: {
    backgroundColor: colors.light.primary,
  },
  phraseChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  phraseChipTextSelected: {
    color: '#FFFFFF',
  },
  asrBanner: {
    backgroundColor: 'rgba(212, 165, 116, 0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  asrBannerText: {
    fontSize: typography.hint.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.hint.lineHeight,
    textAlign: 'center',
  },
  micArea: {
    marginBottom: spacing.md,
  },
  textInputArea: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
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
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: '#FFFFFF',
  },
  typeInsteadButton: {
    paddingVertical: spacing.md,
  },
  warmBanner: {
    backgroundColor: 'rgba(91, 140, 90, 0.12)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
  },
  warmBannerText: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeInsteadText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    textDecorationLine: 'underline',
  },
  examDescriptionCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: spacing.xl,
    width: '100%',
  },
  examDescriptionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '700',
    lineHeight: typography.subheading.lineHeight,
    marginBottom: spacing.sm,
  },
  examDescriptionText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
  },
  examStartArea: {
    alignItems: 'center',
    width: '100%',
  },
  examStartButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  examStartButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: '#FFFFFF',
  },
  examStartSubtext: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
} as const;

export default function HomeScreen() {
  const { currentStep, onboardingComplete } = useSessionStore();
  const [showOnboardingEasing, setShowOnboardingEasing] = useState(false);

  // If onboarding is not complete, show track selection
  if (!onboardingComplete) {
    return <TrackSelectionScreen />;
  }

  // Show onboarding easing for new users (first time through check-in)
  if (APP_CONFIG.features.enableOnboardingEasing && !isOnboardingComplete() && currentStep === 'checkin') {
    if (!showOnboardingEasing) {
      return (
        <OnboardingEasing
          onComplete={() => setShowOnboardingEasing(true)}
          onStep3Select={(moodKey) => {
            // User selected a mood during onboarding — proceed to scene
            const { setSelectedMood, setDayResponse, setCurrentScene, setCurrentStep, currentMode, setContextChanges } = useSessionStore.getState();
            setSelectedMood(moodKey);
            setDayResponse(moodKey);
            const scene = getSceneForMoodAndMode(moodKey, currentMode);
            setCurrentScene(scene);
            const sessionWordIds = scene.newWords.map((w) => w.id);
            const { contextChanges: changes } = getReviewWordsForSession(currentMode, 2, sessionWordIds);
            setContextChanges(changes);
            setCurrentStep('scene');
          }}
          onStep4MicPress={() => {
            // User tapped mic during onboarding — no-op, will advance to step 5
          }}
        />
      );
    }
  }

  switch (currentStep) {
    case 'scene':
      return <SceneScreen />;
    case 'conversation':
      return <ConversationScreen />;
    case 'jamAlong':
      return <JamAlongScreen />;
    case 'review':
      return <ReviewScreen />;
    case 'checkin':
    default:
      return <CheckInScreen />;
  }
}