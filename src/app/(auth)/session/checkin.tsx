import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Animated } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, spacing, radii } from '@/constants/theme';
import { modeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/stores/sessionStore';
import { getSceneForMoodAndMode, preloadData } from '@/services/supabaseDataService';
import { getAsrErrorMessage } from '@/services/asrService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useHaptics } from '@/hooks/useHaptics';
import MicButton from '@/components/MicButton';
import { getReviewWordsForSession } from '@/services/situationalRepetition';
import { initializeDemoProgress } from '@/services/wordProgress';
import { getGreetingForMode, isExamMode } from '@/services/contextDetection';
import { streakService } from '@/services/streakService';
import { shouldShowWarmReEntry, getWarmReEntryMessage, recordSessionDate } from '@/services/warmReEntry';
import { MoodLabels, phraseLabel } from '@/utils/accessibility';
import { APP_CONFIG } from '@/constants/appConfig';
import AppHeader from '@/components/AppHeader';

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

export default function CheckInRoute() {
  const { colors } = useTheme();
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
    isExamMode: storeIsExamMode,
    examPracticeMode,
  } = useSessionStore();

  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  const isExamModeFlag = isExamMode(currentMode);
  const isExamPractice = isExamModeFlag && examPracticeMode === 'exam';

  useEffect(() => {
    preloadData();
    initializeDemoProgress(currentMode);
    streakService.recordSession();
    recordSessionDate();

    if (APP_CONFIG.features.enableWarmReEntry && shouldShowWarmReEntry()) {
      const message = getWarmReEntryMessage();
      if (message) {
        setWarmMessage(message);
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
      stopRecording();
    },
    onTranscription: (text) => {
      setAsrMessage(null);
      proceedToScene(text);
    },
  });

  const proceedToScene = useCallback((response: string) => {
    const scene = getSceneForMoodAndMode(response, currentMode);
    setDayResponse(response);
    setCurrentScene(scene);

    const sessionWordIds = scene.newWords.map((w) => w.id);
    const { contextChanges: changes } = getReviewWordsForSession(currentMode, 2, sessionWordIds);
    setContextChanges(changes);

    setCurrentStep('scene');
    router.push('/session/scene');
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
      await stopRecording();
    } else if (recordingState === 'error') {
      resetError();
      setAsrMessage(null);
    } else if (recordingState === 'idle') {
      await startRecording();
    }
  }, [recordingState, stopRecording, startRecording, resetError]);

  const { greeting, prompt, promptSub } = getGreetingForMode(currentMode);
  const modeLabel = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);

  const handleExamStart = useCallback(() => {
    const examResponse = isExamPractice ? 'exam practice' : 'daily practice';
    const scene = getSceneForMoodAndMode(examResponse, currentMode);
    setDayResponse(examResponse);
    setCurrentScene(scene);

    const sessionWordIds = scene.newWords.map((w) => w.id);
    const { contextChanges: changes } = getReviewWordsForSession(currentMode, 2, sessionWordIds);
    setContextChanges(changes);

    setCurrentStep('conversation');
    router.push('/session/conversation');
  }, [currentMode, isExamPractice, setDayResponse, setCurrentScene, setCurrentStep, setContextChanges]);

  if (isExamPractice) {
    const examType = currentMode === 'ielts' ? 'IELTS' : 'TOEIC';
    const examAccentColor = currentMode === 'ielts' ? modeColors.ielts.accent : modeColors.toeic.accent;
    const examDescription = currentMode === 'ielts'
      ? 'You will practice structured IELTS speaking tasks with accuracy feedback. The examiner will ask you questions and you respond naturally.'
      : 'You will practice structured TOEIC speaking tasks with accuracy feedback. You will respond to business English scenarios.';

    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
        <AppHeader title={`${examType} Practice`} showBackButton />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.content}>
          <View style={s.trackLabel}>
            <Text style={[s.trackLabelText, { color: colors.textMuted }]}>{modeLabel}</Text>
            <Text style={[s.examModeLabel, { color: examAccentColor }]}>{examType} Practice</Text>
          </View>

          <View style={s.promptArea}>
            <Text style={[s.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[s.prompt, { color: colors.textPrimary }]}>{prompt}</Text>
            <Text style={[s.promptSub, { color: colors.textSecondary }]}>{promptSub}</Text>
          </View>

          <View style={[s.examDescriptionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[s.examDescriptionTitle, { color: examAccentColor }]}>{examType} Speaking Practice</Text>
            <Text style={[s.examDescriptionText, { color: colors.textSecondary }]}>{examDescription}</Text>
          </View>

          <View style={s.examStartArea}>
            <TouchableOpacity
              style={[s.examStartButton, { backgroundColor: examAccentColor }]}
              onPress={handleExamStart}
              accessibilityRole="button"
              accessibilityLabel="Begin practice"
            >
              <Text style={[s.examStartButtonText, { color: colors.onPrimary }]}>Begin Practice</Text>
            </TouchableOpacity>
            <Text style={[s.examStartSubtext, { color: colors.textMuted }]}>You can switch to daily practice mode in Settings.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
      <AppHeader title="Daily English" showDrawerButton />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.content}>
        <View style={s.trackLabel}>
          <Text style={[s.trackLabelText, { color: colors.textMuted }]}>{modeLabel}</Text>
          {isExamModeFlag && <Text style={[s.examModeLabel, { color: modeColors.professional.accent }]}>{'\u{1F4DD}'} Exam Mode</Text>}
        </View>

        {warmMessage && (
          <View style={[s.warmBanner, { backgroundColor: colors.primaryLight }]}>
            <Text style={[s.warmBannerText, { color: colors.primary }]}>{warmMessage}</Text>
          </View>
        )}

        <Animated.View style={[s.promptArea, fadeIn, slideUp]}>
          <Text style={[s.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
          <Text style={[s.prompt, { color: colors.textPrimary }]}>{prompt}</Text>
          <Text style={[s.promptSub, { color: colors.textSecondary }]}>{promptSub}</Text>
        </Animated.View>

        <View style={s.emojiRow}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[
                s.emojiButton,
                {
                  backgroundColor: selectedMood === mood.key ? colors.primarySubtle : colors.surface,
                  borderColor: selectedMood === mood.key ? colors.primary : colors.border,
                }
              ]}
              onPress={() => handleMoodSelect(mood.key)}
              accessibilityLabel={MoodLabels[mood.key] ?? mood.label}
              accessibilityRole="button"
            >
              <Text style={s.emojiText}>{mood.emoji}</Text>
              <Text style={[
                s.emojiLabel,
                { color: selectedMood === mood.key ? colors.primary : colors.textMuted },
                selectedMood === mood.key && s.emojiLabelSelected,
              ]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.chipRow}>
          {PHRASES.map((phrase) => (
            <TouchableOpacity
              key={phrase}
              style={[
                s.phraseChip,
                { backgroundColor: selectedPhrase === phrase ? colors.primary : colors.secondary }
              ]}
              onPress={() => handlePhraseSelect(phrase)}
              accessibilityLabel={phraseLabel(phrase)}
              accessibilityRole="button"
            >
              <Text style={[
                s.phraseChipText,
                { color: selectedPhrase === phrase ? colors.onPrimary : colors.textPrimary },
              ]}>{phrase}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {asrMessage && (
          <View style={[s.asrBanner, { backgroundColor: colors.secondaryMedium }]}>
            <Text style={[s.asrBannerText, { color: colors.textPrimary }]}>{asrMessage}</Text>
          </View>
        )}

        <View style={s.micArea}>
          <MicButton recordingState={recordingState} audioLevel={audioLevel} onPress={handleMicPress} />
        </View>

        {showTextInput ? (
          <View style={s.textInputArea}>
            <TextInput
              style={[s.textInput, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Type how your day was..."
              placeholderTextColor={colors.textMuted}
              value={textResponse}
              onChangeText={setTextResponse}
              onSubmitEditing={handleTextSubmit}
              returnKeyType="send"
              autoFocus
            />
            <TouchableOpacity style={[s.sendButton, { backgroundColor: colors.primary }]} onPress={handleTextSubmit} accessibilityLabel="Send message" accessibilityRole="button">
              <Text style={[s.sendButtonText, { color: colors.onPrimary }]}>Send</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={s.typeInsteadButton}
            onPress={() => { haptics.impactLight(); setShowTextInput(true); }}
            accessibilityLabel="Type your response instead"
            accessibilityRole="button"
          >
            <Text style={[s.typeInsteadText, { color: colors.textMuted }]}>Or type your response</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    lineHeight: typography.caption.lineHeight,
  },
  examModeLabel: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  greeting: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500',
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
    fontWeight: typography.display.fontWeight as any,
    lineHeight: typography.display.lineHeight,
    textAlign: 'center',
  },
  promptSub: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '400',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emojiText: { fontSize: 24 },
  emojiLabel: {
    fontSize: typography.caption.fontSize,
    marginTop: 2,
  },
  emojiLabelSelected: {
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
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  phraseChipText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  asrBanner: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    width: '100%',
  },
  asrBannerText: {
    fontSize: typography.hint.fontSize,
    lineHeight: typography.hint.lineHeight,
    textAlign: 'center',
  },
  micArea: { marginBottom: spacing.md },
  textInputArea: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    borderWidth: 1,
  },
  sendButton: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  typeInsteadButton: { paddingVertical: spacing.md },
  warmBanner: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
  },
  warmBannerText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    fontWeight: '500',
  },
  typeInsteadText: {
    fontSize: typography.caption.fontSize,
    textDecorationLine: 'underline',
  },
  examDescriptionCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
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
    lineHeight: typography.body.lineHeight,
  },
  examStartArea: { alignItems: 'center', width: '100%' },
  examStartButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  examStartButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  examStartSubtext: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});