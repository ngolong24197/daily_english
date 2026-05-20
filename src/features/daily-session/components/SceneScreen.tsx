import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
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
  const { currentScene, setCurrentStep, currentMode, contextChanges, isExamMode, setPracticeFormat, setJamAlongScriptId } = useSessionStore();
  const [selectedWord, setSelectedWord] = useState<MockWord | null>(null);
  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  useEffect(() => {
    playEntrance();
  }, []);

  if (!currentScene) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Something went wrong loading the scene.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep('checkin')}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const modeCode = currentMode;
  const badgeColors = getModeBadgeColor(modeCode);
  const badgeLabel = getModeBadgeLabel(modeCode);

  const dialogueParts = splitDialogueWithHighlights(currentScene.dialogueText, currentScene.newWords);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setCurrentStep('checkin')}
          accessibilityLabel="Go back to check-in"
          accessibilityRole="button"
        >
          <Text style={styles.headerBack}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today's Scene</Text>
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
            <View style={styles.examModeBadge}>
              <Text style={styles.examModeBadgeText}>{'\u{1F4DD}'} Exam Mode</Text>
            </View>
          )}
        </View>

        <View style={styles.sceneCard}>
          <View style={styles.illustrationArea}>
            <Text style={styles.illustrationEmoji}>{'\u{2615}'}</Text>
            <Text style={styles.illustrationLabel}>{currentScene.title}</Text>
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
                    <Text style={styles.highlightedWord}>{part.text}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text key={index} style={styles.dialogueText}>
                    {part.text}
                  </Text>
                )
              )}
            </View>
          </View>
        </View>

        <View style={styles.wordsSection}>
          <Text style={styles.sectionTitle}>Words in this scene</Text>
          <View style={styles.chipRow}>
            {currentScene.newWords.map((word) => {
              const wordBadgeColors = getModeBadgeColor(modeCode);
              return (
                <TouchableOpacity
                  key={word.id}
                  style={styles.newWordChip}
                  onPress={() => setSelectedWord(word)}
                  accessibilityLabel={wordChipLabel(word.lemma, word.pos ?? 'noun')}
                  accessibilityRole="button"
                >
                  <Text style={styles.newWordChipText}>{word.lemma}</Text>
                  <View style={[styles.modeDot, { backgroundColor: wordBadgeColors.text }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {currentScene.reviewWords.length > 0 && (
          <View style={styles.wordsSection}>
            <Text style={styles.sectionTitle}>Old friends from before</Text>
            <View style={styles.reviewWordsContainer}>
              {currentScene.reviewWords.map((word) => {
                const ctxChange = contextChanges[word.id];
                const wordBadgeColors = getModeBadgeColor(modeCode);
                return (
                  <TouchableOpacity
                    key={word.id}
                    style={styles.reviewWordPill}
                    onPress={() => setSelectedWord(word)}
                    accessibilityLabel={wordChipLabel(word.lemma, word.pos ?? 'noun')}
                    accessibilityRole="button"
                  >
                    <View style={styles.reviewWordChipInner}>
                      <Text style={styles.reviewWordChipText}>{word.lemma}</Text>
                      <View style={[styles.modeDot, { backgroundColor: wordBadgeColors.text }]} />
                    </View>
                    {ctxChange && (
                      <Text style={styles.reviewWordContextChange} numberOfLines={1}>
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
          style={styles.ctaButton}
          onPress={() => {
            haptics.impactMedium();
            setPracticeFormat('conversation');
            setCurrentStep('conversation');
          }}
          accessibilityRole="button"
          accessibilityLabel="Step into the conversation"
        >
          <Text style={styles.ctaButtonText}>Step into the conversation</Text>
        </TouchableOpacity>

        {!isExamMode && (
          <TouchableOpacity
            style={styles.jamAlongButton}
            onPress={() => {
              const script = getDefaultJamAlongScript(currentMode);
              setPracticeFormat('jamAlong');
              setJamAlongScriptId(script.id);
              setCurrentStep('jamAlong');
            }}
            accessibilityRole="button"
            accessibilityLabel="Try Jam Along: fill in the gaps"
          >
            <Text style={styles.jamAlongIcon}>{'\u{1F3B5}'}</Text>
            <Text style={styles.jamAlongButtonText}>Fill in (Jam Along)</Text>
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
    backgroundColor: colors.light.bg,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerBack: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    fontWeight: '600' as const,
  },
  headerTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as const,
    color: colors.light.textPrimary,
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
    color: colors.light.textSecondary,
    textAlign: 'center' as const,
    marginTop: spacing['3xl'],
  },
  backButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
  },
  modeBadgeArea: {
    marginBottom: spacing.md,
  },
  modeBadgeRow: {
    alignSelf: 'flex-start' as const,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
  },
  examModeBadge: {
    backgroundColor: 'rgba(126, 181, 214, 0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
    alignSelf: 'flex-start' as const,
  },
  examModeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600' as const,
    color: '#4A7A9B',
  },
  sceneCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.lg,
    overflow: 'hidden' as const,
    marginTop: spacing.sm,
  },
  illustrationArea: {
    height: 200,
    backgroundColor: '#F5EDE4',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  illustrationEmoji: {
    fontSize: 64,
  },
  illustrationLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500' as const,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
  },
  dialogueArea: {
    padding: spacing.lg,
  },
  dialogueRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  dialogueText: {
    fontSize: typography.bodyLg.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.bodyLg.lineHeight,
  },
  highlightedWord: {
    fontSize: typography.bodyLg.fontSize,
    color: colors.light.accentWarm,
    fontWeight: '600' as const,
    textDecorationLine: 'underline' as const,
    lineHeight: typography.bodyLg.lineHeight,
  },
  wordsSection: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as const,
    color: colors.light.textPrimary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  newWordChip: {
    backgroundColor: 'rgba(232, 168, 124, 0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  newWordChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.accentWarm,
    fontWeight: '500' as const,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reviewWordsContainer: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  reviewWordPill: {
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(91, 140, 90, 0.2)',
  },
  reviewWordChipInner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.xs,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    fontWeight: '500' as const,
  },
  reviewWordContextChange: {
    fontSize: typography.caption.fontSize,
    color: colors.light.accentWarm,
    marginTop: spacing.xs,
  },
  ctaButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    alignItems: 'center' as const,
  },
  ctaButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: '#FFFFFF',
  },
  jamAlongButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing.sm,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.secondary,
    backgroundColor: 'rgba(212, 165, 116, 0.08)',
  },
  jamAlongIcon: {
    fontSize: 18,
  },
  jamAlongButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: colors.light.secondary,
  },
};