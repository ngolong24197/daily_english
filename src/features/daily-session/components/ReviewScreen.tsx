import { View, Text, TouchableOpacity, ScrollView, Animated, type TextStyle } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { typography, spacing, radii } from '@/constants/theme';
import { modeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore } from '@/stores/sessionStore';
import type { CompletedSession } from '@/stores/sessionStore';
import { getModeBadgeColor, getModeBadgeLabel } from '@/services/wordService';
import { calculateAccuracyScore } from '@/services/accuracyScoring';
import { subscriptionService } from '@/services/subscriptionService';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useHaptics } from '@/hooks/useHaptics';
import ScoreCard from '@/components/ScoreCard';
import SessionCloseAd from '@/components/SessionCloseAd';
import PremiumUpgradeSheet from '@/components/PremiumUpgradeSheet';
import type { ModeCode } from '@/types';

export default function ReviewScreen() {
  const { colors } = useTheme();
  const {
    completedSessions,
    currentScene,
    conversationMessages,
    setCurrentStep,
    resetSession,
    currentMode,
    contextChanges,
    isExamMode: examMode,
    examPracticeMode,
  } = useSessionStore();

  const [showAd, setShowAd] = useState(false);
  const [showUpgradeSheet, setShowUpgradeSheet] = useState(false);
  const isPremium = subscriptionService.isPremium();
  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  useEffect(() => {
    playEntrance();
  }, []);

  const latestSession: CompletedSession | null =
    completedSessions.length > 0 ? completedSessions[0] : null;

  const userSentences = latestSession?.userSentences ?? [];
  const newWords = latestSession?.newWords ?? currentScene?.newWords ?? [];
  const reviewWords = latestSession?.reviewWords ?? currentScene?.reviewWords ?? [];
  const modeCode = latestSession?.mode ?? currentMode;

  // Calculate exam score if in exam mode
  const messages = latestSession?.messages ?? conversationMessages;
  const targetWords = currentScene
    ? [...(currentScene.newWords ?? []).map((w) => w.lemma), ...(currentScene.reviewWords ?? []).map((w) => w.lemma)]
    : [];
  const examScore = examMode && messages.length > 0
    ? calculateAccuracyScore(
        messages,
        [],
        modeCode === 'ielts' ? 'ielts' : 'toeic',
        targetWords,
      )
    : null;

  const handleDone = () => {
    if (!isPremium) {
      setShowAd(true);
    } else {
      resetSession();
      setCurrentStep('checkin');
      router.replace('/(auth)/(tabs)');
    }
  };

  const handleAdContinue = () => {
    resetSession();
    setCurrentStep('checkin');
    router.replace('/(auth)/(tabs)');
  };

  const handleAdUpgrade = () => {
    setShowAd(false);
    setShowUpgradeSheet(true);
  };

  const handleKeepTalking = () => {
    setCurrentStep('conversation');
    router.push('/session/conversation');
  };

  const handlePracticeAgain = () => {
    resetSession();
    setCurrentStep('checkin');
    router.push('/session/checkin');
  };

  const handleContinueToDaily = () => {
    const { setExamPracticeMode } = useSessionStore.getState();
    setExamPracticeMode('daily');
    resetSession();
    setCurrentStep('checkin');
    router.push('/session/checkin');
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const modeBadgeColors = getModeBadgeColor(modeCode);
  const modeBadgeLabel = getModeBadgeLabel(modeCode);

  // Get mode-specific context label
  const modeContextLabel = getModeContextLabel(modeCode);

  // If in exam mode with a calculated score, show the ScoreCard instead of the regular review
  if (examMode && examScore) {
    return (
      <ScoreCard
        score={examScore}
        onPracticeAgain={handlePracticeAgain}
        onContinueToDaily={handleContinueToDaily}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentInner}
      >
        <Animated.View style={[fadeIn, slideUp]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Today's Conversation</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{dateStr}</Text>

        {/* Mode badge with context */}
        <View style={styles.modeSection}>
          <View style={[styles.modeBadgeRow, { backgroundColor: modeBadgeColors.bg }]}>
            <Text style={[styles.modeBadgeText, { color: modeBadgeColors.text }]}>
              {modeBadgeLabel}
            </Text>
          </View>
          <Text style={[styles.modeContextLabel, { color: colors.textSecondary }]}>{modeContextLabel}</Text>
          {examMode && (
            <View style={[styles.examModeBadge, { backgroundColor: colors.accentCoolLight }]}>
              <Text style={[styles.examModeBadgeText, { color: modeColors.professional.accent }]}>{'\u{1F4DD}'} Exam Mode</Text>
            </View>
          )}
        </View>

        <View style={[styles.encouragementCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.encouragementEmoji}>{'\u{1F331}'}</Text>
          <Text style={[styles.encouragementText, { color: colors.primary }]}>Nice work today!</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>You said:</Text>
          {userSentences.length > 0 ? (
            userSentences.map((sentence, index) => (
              <View key={index} style={[styles.sentenceCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                <Text style={[styles.sentenceQuote, { color: colors.primary }]}>{'\u{201C}'}</Text>
                <Text style={[styles.sentenceText, { color: colors.textPrimary }]}>{sentence}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your sentences will appear here after your conversation.
            </Text>
          )}
        </View>

        {/* New words section */}
        {(newWords ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>New words today</Text>
            <View style={styles.chipRow}>
              {(newWords ?? []).map((word) => {
                const wordBadgeColors = getModeBadgeColor(modeCode);
                return (
                  <View key={word.id} style={[styles.newWordChip, { backgroundColor: colors.secondaryMedium }]}>
                    <Text style={[styles.newWordChipText, { color: colors.accentWarm }]}>{word.lemma}</Text>
                    <View style={[styles.wordModeDot, { backgroundColor: wordBadgeColors.text }]} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Review words section — with context changes */}
        {(reviewWords ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Words you revisited</Text>
            {(reviewWords ?? []).map((word) => {
              const contextChange = contextChanges[word.id] ?? latestSession?.contextChanges?.[word.id];
              return (
                <View key={word.id} style={[styles.reviewWordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.reviewWordRow}>
                    <View style={[styles.reviewWordChip, { backgroundColor: colors.primaryMedium }]}>
                      <Text style={[styles.reviewWordChipText, { color: colors.primary }]}>{word.lemma}</Text>
                    </View>
                    <Text style={[styles.reviewWordContext, { color: colors.textSecondary }]}>
                      {word.modeEntries?.[modeCode]?.example_context ?? word.modeEntries?.survival?.example_context}
                    </Text>
                  </View>
                  {contextChange && (
                    <View style={[styles.contextChangeRow, { borderTopColor: colors.border }]}>
                      <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
                      <Text style={[styles.contextChangeText, { color: colors.accentWarm }]}>{contextChange}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Closing message (ad is shown separately for free users) */}
        {isPremium && (
          <View style={styles.closingMessage}>
            <Text style={[styles.closingText, { color: colors.primary }]}>See you tomorrow!</Text>
          </View>
        )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.buttonArea, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            haptics.impactMedium();
            handleDone();
          }}
          accessibilityRole="button"
          accessibilityLabel="Done for today"
        >
          <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>Done for today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={handleKeepTalking}
          accessibilityRole="button"
          accessibilityLabel="Keep talking"
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Keep talking</Text>
        </TouchableOpacity>
      </View>

      {/* Session close ad for free users */}
      {showAd && (
        <View style={[styles.adOverlay, { backgroundColor: colors.bg }]}>
          <SessionCloseAd
            onContinue={handleAdContinue}
            onUpgrade={handleAdUpgrade}
          />
        </View>
      )}

      {/* Premium upgrade sheet */}
      <PremiumUpgradeSheet
        visible={showUpgradeSheet}
        onClose={() => setShowUpgradeSheet(false)}
        onActivatePremium={() => {
          subscriptionService.setDemoPremium(true);
          setShowUpgradeSheet(false);
        }}
      />
    </View>
  );
}

function getModeContextLabel(mode: ModeCode): string {
  switch (mode) {
    case 'survival':
      return 'Daily life situations';
    case 'professional':
      return 'Workplace and professional contexts';
    case 'social':
      return 'Casual conversations with friends';
    case 'ielts':
      return 'IELTS exam preparation';
    case 'toeic':
      return 'TOEIC exam preparation';
    default:
      return '';
  }
}

const styles = {
  container: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentInner: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as TextStyle['fontWeight'],
    lineHeight: typography.heading.lineHeight,
    marginTop: spacing.lg,
  },
  date: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  modeSection: {
    marginBottom: spacing.sm,
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
  modeContextLabel: {
    fontSize: typography.caption.fontSize,
    marginTop: spacing.xs,
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
  encouragementCard: {
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    borderWidth: 1,
  },
  encouragementEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  encouragementText: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500',
    lineHeight: typography.subheading.lineHeight,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as TextStyle['fontWeight'],
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  sentenceCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  sentenceQuote: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    marginBottom: -spacing.sm,
  },
  sentenceText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    fontStyle: 'italic',
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
  wordModeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reviewWordCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  reviewWordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewWordChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  reviewWordContext: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  contextChangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  contextChangeEmoji: {
    fontSize: 14,
  },
  contextChangeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  adOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  closingMessage: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  closingText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    lineHeight: typography.body.lineHeight,
  },
  buttonArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  primaryButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as TextStyle['fontWeight'],
  },
  secondaryButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as TextStyle['fontWeight'],
  },
} as const;