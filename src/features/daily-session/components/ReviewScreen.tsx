import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
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
      // Premium users go directly home
      resetSession();
      setCurrentStep('checkin');
    }
  };

  const handleAdContinue = () => {
    resetSession();
    setCurrentStep('checkin');
  };

  const handleAdUpgrade = () => {
    setShowAd(false);
    setShowUpgradeSheet(true);
  };

  const handleKeepTalking = () => {
    setCurrentStep('conversation');
  };

  const handlePracticeAgain = () => {
    resetSession();
    setCurrentStep('checkin');
  };

  const handleContinueToDaily = () => {
    // Switch to daily practice mode and restart
    const { setExamPracticeMode } = useSessionStore.getState();
    setExamPracticeMode('daily');
    resetSession();
    setCurrentStep('checkin');
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentInner}
      >
        <Animated.View style={[fadeIn, slideUp]}>
        <Text style={styles.title}>Today's Conversation</Text>
        <Text style={styles.date}>{dateStr}</Text>

        {/* Mode badge with context */}
        <View style={styles.modeSection}>
          <View style={[styles.modeBadgeRow, { backgroundColor: modeBadgeColors.bg }]}>
            <Text style={[styles.modeBadgeText, { color: modeBadgeColors.text }]}>
              {modeBadgeLabel}
            </Text>
          </View>
          <Text style={styles.modeContextLabel}>{modeContextLabel}</Text>
          {examMode && (
            <View style={styles.examModeBadge}>
              <Text style={styles.examModeBadgeText}>{'\u{1F4DD}'} Exam Mode</Text>
            </View>
          )}
        </View>

        <View style={styles.encouragementCard}>
          <Text style={styles.encouragementEmoji}>{'\u{1F331}'}</Text>
          <Text style={styles.encouragementText}>Nice work today!</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>You said:</Text>
          {userSentences.length > 0 ? (
            userSentences.map((sentence, index) => (
              <View key={index} style={styles.sentenceCard}>
                <Text style={styles.sentenceQuote}>{'\u{201C}'}</Text>
                <Text style={styles.sentenceText}>{sentence}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Your sentences will appear here after your conversation.
            </Text>
          )}
        </View>

        {/* New words section */}
        {(newWords ?? []).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New words today</Text>
            <View style={styles.chipRow}>
              {(newWords ?? []).map((word) => {
                const wordBadgeColors = getModeBadgeColor(modeCode);
                return (
                  <View key={word.id} style={styles.newWordChip}>
                    <Text style={styles.newWordChipText}>{word.lemma}</Text>
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
            <Text style={styles.sectionTitle}>Words you revisited</Text>
            {(reviewWords ?? []).map((word) => {
              const contextChange = contextChanges[word.id] ?? latestSession?.contextChanges?.[word.id];
              return (
                <View key={word.id} style={styles.reviewWordCard}>
                  <View style={styles.reviewWordRow}>
                    <View style={styles.reviewWordChip}>
                      <Text style={styles.reviewWordChipText}>{word.lemma}</Text>
                    </View>
                    <Text style={styles.reviewWordContext}>
                      {word.modeEntry.example_context}
                    </Text>
                  </View>
                  {contextChange && (
                    <View style={styles.contextChangeRow}>
                      <Text style={styles.contextChangeEmoji}>{'\u{2728}'}</Text>
                      <Text style={styles.contextChangeText}>{contextChange}</Text>
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
            <Text style={styles.closingText}>See you tomorrow!</Text>
          </View>
        )}
        </Animated.View>
      </ScrollView>

      <View style={styles.buttonArea}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            haptics.impactMedium();
            handleDone();
          }}
          accessibilityRole="button"
          accessibilityLabel="Done for today"
        >
          <Text style={styles.primaryButtonText}>Done for today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleKeepTalking}
          accessibilityRole="button"
          accessibilityLabel="Keep talking"
        >
          <Text style={styles.secondaryButtonText}>Keep talking</Text>
        </TouchableOpacity>
      </View>

      {/* Session close ad for free users */}
      {showAd && (
        <View style={styles.adOverlay}>
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
    backgroundColor: colors.light.bg,
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
    fontWeight: typography.heading.fontWeight as const,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
    marginTop: spacing.lg,
  },
  date: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  modeSection: {
    marginBottom: spacing.sm,
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
  modeContextLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
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
  encouragementCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    alignItems: 'center' as const,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  encouragementEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  encouragementText: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '500' as const,
    color: colors.light.primary,
    lineHeight: typography.subheading.lineHeight,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as const,
    color: colors.light.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
  },
  sentenceCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.light.primary,
  },
  sentenceQuote: {
    fontSize: typography.heading.fontSize,
    color: colors.light.primary,
    lineHeight: typography.heading.lineHeight,
    marginBottom: -spacing.sm,
  },
  sentenceText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
    fontStyle: 'italic' as const,
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
  wordModeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  reviewWordCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  reviewWordRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.sm,
  },
  reviewWordChip: {
    backgroundColor: 'rgba(91, 140, 90, 0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    fontWeight: '500' as const,
  },
  reviewWordContext: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    flex: 1,
  },
  contextChangeRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
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
  adOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.light.bg,
    zIndex: 10,
  },
  closingMessage: {
    alignItems: 'center' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  closingText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500' as const,
    color: colors.light.primary,
    lineHeight: typography.body.lineHeight,
  },
  buttonArea: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.bg,
  },
  primaryButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  secondaryButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as const,
    color: colors.light.primary,
  },
};