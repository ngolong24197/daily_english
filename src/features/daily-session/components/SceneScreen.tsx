import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { typography, spacing, radii } from '@/constants/theme';
import { modeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/stores/sessionStore';
import type { MockWord } from '@/services/mockData';
import { getModeBadgeColor, getModeBadgeLabel } from '@/services/wordService';
import { isExamMode } from '@/services/contextDetection';
import { getDefaultJamAlongScript } from '@/services/jamAlongData';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useHaptics } from '@/hooks/useHaptics';
import { wordChipLabel } from '@/utils/accessibility';
import WordExplorationSheet from '@/components/WordExplorationSheet';

export default function SceneScreen() {
  const { colors } = useTheme();
  const { currentScene, setCurrentStep, currentMode, contextChanges, isExamMode, setPracticeFormat, setJamAlongScriptId } = useSessionStore();
  const [selectedWord, setSelectedWord] = useState<MockWord | null>(null);
  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  useEffect(() => {
    playEntrance();
  }, []);

  if (!currentScene) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Something went wrong loading the scene.</Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary }]}
          onPress={() => { setCurrentStep('checkin'); router.push('/session/checkin'); }}
        >
          <Text style={[styles.backButtonText, { color: colors.onPrimary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const modeCode = currentMode;
  const badgeColors = getModeBadgeColor(modeCode);
  const badgeLabel = getModeBadgeLabel(modeCode);

  const dialogueParts = splitDialogueWithHighlights(currentScene.dialogueText, currentScene.newWords);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => { setCurrentStep('checkin'); router.push('/session/checkin'); }}
          accessibilityLabel="Go back to check-in"
          accessibilityRole="button"
        >
          <Text style={[styles.headerBack, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Today's Scene</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentInner}>
        <Animated.View style={[fadeIn, slideUp]}>
        {/* Mode badge */}
        <View style={styles.modeBadgeArea}>
          <View style={[styles.modeBadgeRow, { backgroundColor: badgeColors.bg }]}>
            <Text style={[styles.modeBadgeText, { color: badgeColors.text }]}>
              {badgeLabel}
            </Text>
          </View>
          {isExamMode && (
            <View style={[styles.examModeBadge, { backgroundColor: colors.accentCoolLight }]}>
              <Text style={[styles.examModeBadgeText, { color: modeColors.professional.accent }]}>{'\u{1F4DD}'} Exam Mode</Text>
            </View>
          )}
        </View>

        <View style={[styles.sceneCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.illustrationArea, { backgroundColor: colors.surfaceWarmAlt }]}>
            <Text style={styles.illustrationEmoji}>{'\u{2615}'}</Text>
            <Text style={[styles.illustrationLabel, { color: colors.textSecondary }]}>{currentScene.title}</Text>
          </View>

          <View style={styles.dialogueArea}>
            <View style={styles.dialogueRow}>
              {dialogueParts.map((part, index) =>
                part.isHighlight ? (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      const word = currentScene.newWords.find(
                        (w) => w.lemma.toLowerCase() === part.text.toLowerCase().replace(/[.,!?"]/g, '')
                      ) ?? currentScene.reviewWords.find(
                        (w) => w.lemma.toLowerCase() === part.text.toLowerCase().replace(/[.,!?"]/g, '')
                      );
                      if (word) setSelectedWord(word);
                    }}
                  >
                    <Text style={[styles.highlightedWord, { color: colors.accentWarm }]}>{part.text}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text key={index} style={[styles.dialogueText, { color: colors.textPrimary }]}>
                    {part.text}
                  </Text>
                )
              )}
            </View>
          </View>
        </View>

        <View style={styles.wordsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Words in this scene</Text>
          <View style={styles.chipRow}>
            {currentScene.newWords.map((word) => {
              const wordBadgeColors = getModeBadgeColor(modeCode);
              return (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.newWordChip, { backgroundColor: colors.secondaryMedium }]}
                  onPress={() => setSelectedWord(word)}
                  accessibilityLabel={wordChipLabel(word.lemma, word.pos ?? 'noun')}
                  accessibilityRole="button"
                >
                  <Text style={[styles.newWordChipText, { color: colors.accentWarm }]}>{word.lemma}</Text>
                  <View style={[styles.modeDot, { backgroundColor: wordBadgeColors.text }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {currentScene.reviewWords.length > 0 && (
          <View style={styles.wordsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Old friends from before</Text>
            <View style={styles.reviewWordsContainer}>
              {currentScene.reviewWords.map((word) => {
                const ctxChange = contextChanges[word.id];
                const wordBadgeColors = getModeBadgeColor(modeCode);
                return (
                  <TouchableOpacity
                    key={word.id}
                    style={[styles.reviewWordPill, { backgroundColor: colors.primarySubtle, borderColor: colors.primary }]}
                    onPress={() => setSelectedWord(word)}
                    accessibilityLabel={wordChipLabel(word.lemma, word.pos ?? 'noun')}
                    accessibilityRole="button"
                  >
                    <View style={styles.reviewWordChipInner}>
                      <Text style={[styles.reviewWordChipText, { color: colors.primary }]}>{word.lemma}</Text>
                      <View style={[styles.modeDot, { backgroundColor: wordBadgeColors.text }]} />
                    </View>
                    {ctxChange && (
                      <Text style={[styles.reviewWordContextChange, { color: colors.accentWarm }]}>
                        {'\u{2728}'} New context
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.ctaButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            haptics.impactMedium();
            setPracticeFormat('conversation');
            setCurrentStep('conversation'); router.push('/session/conversation');
          }}
          accessibilityRole="button"
          accessibilityLabel="Step into the conversation"
        >
          <Text style={[styles.ctaButtonText, { color: colors.onPrimary }]}>Step into the conversation</Text>
        </TouchableOpacity>

        {!isExamMode && (
          <TouchableOpacity
            style={[styles.jamAlongButton, { borderColor: colors.secondary, backgroundColor: colors.secondaryLight }]}
            onPress={() => {
              const script = getDefaultJamAlongScript(currentMode);
              setPracticeFormat('jamAlong');
              setJamAlongScriptId(script.id);
              setCurrentStep('jamAlong'); router.push('/session/jam-along');
            }}
            accessibilityRole="button"
            accessibilityLabel="Try Jam Along: fill in the gaps"
          >
            <Text style={styles.jamAlongIcon}>{'\u{1F3B5}'}</Text>
            <Text style={[styles.jamAlongButtonText, { color: colors.secondary }]}>Fill in (Jam Along)</Text>
          </TouchableOpacity>
        )}
        </Animated.View>
      </ScrollView>

      {/* Word Exploration Sheet */}
      <WordExplorationSheet
        visible={selectedWord !== null}
        word={selectedWord}
        modeCode={modeCode}
        contextChangeDescription={
          selectedWord ? contextChanges[selectedWord.id] : undefined
        }
        onClose={() => setSelectedWord(null)}
      />
    </View>
  );
}

interface DialoguePart {
  text: string;
  isHighlight: boolean;
}

function splitDialogueWithHighlights(
  dialogueText: string,
  newWords: MockWord[]
): DialoguePart[] {
  const highlights = newWords.map((w) => w.lemma.toLowerCase());
  const text = dialogueText;
  const parts: DialoguePart[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestMatch = -1;
    let matchedWord = '';

    for (const highlight of highlights) {
      const index = remaining.toLowerCase().indexOf(highlight);
      if (index !== -1 && (earliestMatch === -1 || index < earliestMatch)) {
        earliestMatch = index;
        matchedWord = highlight;
      }
    }

    if (earliestMatch === -1) {
      parts.push({ text: remaining, isHighlight: false });
      break;
    }

    if (earliestMatch > 0) {
      parts.push({ text: remaining.substring(0, earliestMatch), isHighlight: false });
    }

    const matchedLength = matchedWord.length;
    parts.push({
      text: remaining.substring(earliestMatch, earliestMatch + matchedLength),
      isHighlight: true,
    });

    remaining = remaining.substring(earliestMatch + matchedLength);
  }

  return parts;
}

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerBack: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  errorText: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginTop: spacing['3xl'],
  },
  backButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
  },
  backButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  modeBadgeArea: {
    marginBottom: spacing.md,
  },
  modeBadgeRow: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  examModeBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  examModeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  sceneCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  illustrationArea: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  illustrationLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500',
    marginTop: spacing.sm,
  },
  dialogueArea: {
    padding: spacing.lg,
  },
  dialogueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dialogueText: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
  },
  highlightedWord: {
    fontSize: typography.bodyLg.fontSize,
    fontWeight: '600',
    textDecorationLine: 'underline',
    lineHeight: typography.bodyLg.lineHeight,
  },
  wordsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  newWordChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  newWordChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reviewWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  reviewWordPill: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
  },
  reviewWordChipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  reviewWordContextChange: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
  },
  ctaButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
  jamAlongButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  jamAlongIcon: {
    fontSize: 18,
  },
  jamAlongButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
  },
} as const;