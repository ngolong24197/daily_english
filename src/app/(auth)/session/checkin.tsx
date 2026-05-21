import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet, Animated } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/constants/theme';
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
    const examAccentColor = currentMode === 'ielts' ? '#3A6A8F' : '#8B6B3D';
    const examDescription = currentMode === 'ielts'
      ? 'You will practice structured IELTS speaking tasks with accuracy feedback. The examiner will ask you questions and you respond naturally.'
      : 'You will practice structured TOEIC speaking tasks with accuracy feedback. You will respond to business English scenarios.';

    return (
      <SafeAreaView style={s.container} edges={['bottom']}>
        <AppHeader title={`${examType} Practice`} showBackButton />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.content}>
          <View style={s.trackLabel}>
            <Text style={s.trackLabelText}>{modeLabel}</Text>
            <Text style={[s.examModeLabel, { color: examAccentColor }]}>{examType} Practice</Text>
          </View>

          <View style={s.promptArea}>
            <Text style={s.greeting}>{greeting}</Text>
            <Text style={s.prompt}>{prompt}</Text>
            <Text style={s.promptSub}>{promptSub}</Text>
          </View>

          <View style={s.examDescriptionCard}>
            <Text style={[s.examDescriptionTitle, { color: examAccentColor }]}>{examType} Speaking Practice</Text>
            <Text style={s.examDescriptionText}>{examDescription}</Text>
          </View>

          <View style={s.examStartArea}>
            <TouchableOpacity
              style={[s.examStartButton, { backgroundColor: examAccentColor }]}
              onPress={handleExamStart}
              accessibilityRole="button"
              accessibilityLabel="Begin practice"
            >
              <Text style={s.examStartButtonText}>Begin Practice</Text>
            </TouchableOpacity>
            <Text style={s.examStartSubtext}>You can switch to daily practice mode in Settings.</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['bottom']}>
      <AppHeader title="Daily English" showDrawerButton />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.content}>
        <View style={s.trackLabel}>
          <Text style={s.trackLabelText}>{modeLabel}</Text>
          {isExamModeFlag && <Text style={s.examModeLabel}>{'\u{1F4DD}'} Exam Mode</Text>}
        </View>

        {warmMessage && (
          <View style={s.warmBanner}>
            <Text style={s.warmBannerText}>{warmMessage}</Text>
          </View>
        )}

        <Animated.View style={[s.promptArea, fadeIn, slideUp]}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.prompt}>{prompt}</Text>
          <Text style={s.promptSub}>{promptSub}</Text>
        </Animated.View>

        <View style={s.emojiRow}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood.key}
              style={[s.emojiButton, selectedMood === mood.key && s.emojiButtonSelected]}
              onPress={() => handleMoodSelect(mood.key)}
              accessibilityLabel={MoodLabels[mood.key] ?? mood.label}
              accessibilityRole="button"
            >
              <Text style={s.emojiText}>{mood.emoji}</Text>
              <Text style={[s.emojiLabel, selectedMood === mood.key && s.emojiLabelSelected]}>{mood.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.chipRow}>
          {PHRASES.map((phrase) => (
            <TouchableOpacity
              key={phrase}
              style={[s.phraseChip, selectedPhrase === phrase && s.phraseChipSelected]}
              onPress={() => handlePhraseSelect(phrase)}
              accessibilityLabel={phraseLabel(phrase)}
              accessibilityRole="button"
            >
              <Text style={[s.phraseChipText, selectedPhrase === phrase && s.phraseChipTextSelected]}>{phrase}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {asrMessage && (
          <View style={s.asrBanner}>
            <Text style={s.asrBannerText}>{asrMessage}</Text>
          </View>
        )}

        <View style={s.micArea}>
          <MicButton recordingState={recordingState} audioLevel={audioLevel} onPress={handleMicPress} />
        </View>

        {showTextInput ? (
          <View style={s.textInputArea}>
            <TextInput
              style={s.textInput}
              placeholder="Type how your day was..."
              placeholderTextColor={colors.light.textMuted}
              value={textResponse}
              onChangeText={setTextResponse}
              onSubmitEditing={handleTextSubmit}
              returnKeyType="send"
              autoFocus
            />
            <TouchableOpacity style={s.sendButton} onPress={handleTextSubmit} accessibilityLabel="Send message" accessibilityRole="button">
              <Text style={s.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={s.typeInsteadButton}
            onPress={() => { haptics.impactLight(); setShowTextInput(true); }}
            accessibilityLabel="Type your response instead"
            accessibilityRole="button"
          >
            <Text style={s.typeInsteadText}>Or type your response</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
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
    fontWeight: typography.display.fontWeight as any,
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
  emojiText: { fontSize: 24 },
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
  phraseChipSelected: { backgroundColor: colors.light.primary },
  phraseChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  phraseChipTextSelected: { color: '#FFFFFF' },
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
  micArea: { marginBottom: spacing.md },
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
    fontWeight: typography.button.fontWeight as any,
    color: '#FFFFFF',
  },
  typeInsteadButton: { paddingVertical: spacing.md },
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
    color: '#FFFFFF',
  },
  examStartSubtext: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});