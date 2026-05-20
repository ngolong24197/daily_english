import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, radii } from '../constants/theme';
import { useSessionStore, type CompletedSession } from '../stores/sessionStore';
import { getModeBadgeColor, getModeBadgeLabel } from '../services/wordService';
import { subscriptionService } from '../services/subscriptionService';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
import { HistoryEmptyState } from '../components/SkeletonScreens';

export default function HistoryScreen() {
  const { completedSessions } = useSessionStore();
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();

  const isPremium = subscriptionService.isPremium();
  const visibleSessions = subscriptionService.filterSessionsForTier(completedSessions);
  const hasOlderSessions = subscriptionService.hasOlderSessions(completedSessions);

  useEffect(() => {
    playEntrance();
  }, []);

  // Empty state
  if (completedSessions.length === 0) {
    return (
      <View style={styles.container}>
        <HistoryEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[fadeIn, slideUp]}>
        <Text style={styles.headerTitle}>Conversation History</Text>
        <Text style={styles.headerSub}>
          {visibleSessions.length} conversation{visibleSessions.length !== 1 ? 's' : ''}
        </Text>

        {/* Upgrade card for free users with older sessions */}
        {!isPremium && hasOlderSessions && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => setShowUpgrade(true)}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to see your full history"
          >
            <Text style={styles.upgradeEmoji}>{'\u{1F512}'}</Text>
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Older conversations locked</Text>
              <Text style={styles.upgradeDesc}>
                Upgrade to see your full history beyond 7 days.
              </Text>
            </View>
            <Text style={styles.upgradeArrow}>{'>'}</Text>
          </TouchableOpacity>
        )}

        {visibleSessions.map((session) => {
          const date = new Date(session.date);
          const dateStr = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          });
          const firstSentence = (session.userSentences ?? [])[0] ?? 'No sentences';
          const sentenceCount = (session.userSentences ?? []).length;
          const wordCount = (session.newWords ?? []).length + (session.reviewWords ?? []).length;
          const modeBadgeColors = getModeBadgeColor(session.mode ?? 'survival');
          const modeBadgeLabel = getModeBadgeLabel(session.mode ?? 'survival');

          return (
            <TouchableOpacity
              key={session.id}
              style={styles.sessionCard}
              onPress={() => setSelectedSession(session)}
              accessibilityLabel={`Conversation from ${dateStr}, ${sentenceCount} sentences`}
              accessibilityRole="button"
            >
              <View style={styles.sessionCardHeader}>
                <View style={styles.sessionDateRow}>
                  <Text style={styles.sessionDate}>{dateStr}</Text>
                  <Text style={styles.sessionTime}>{timeStr}</Text>
                </View>
                <View style={[styles.modeBadge, { backgroundColor: modeBadgeColors.bg }]}>
                  <Text style={[styles.modeBadgeText, { color: modeBadgeColors.text }]}>
                    {modeBadgeLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.sessionContext}>{session.sceneTitle}</Text>
              <Text style={styles.sessionPreview} numberOfLines={2}>
                {"“"}{firstSentence}{"”"}
              </Text>
              <View style={styles.sessionMetaRow}>
                <Text style={styles.sessionMeta}>
                  {sentenceCount} sentence{sentenceCount !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.sessionMetaDot}>{'·'}</Text>
                <Text style={styles.sessionMeta}>
                  {wordCount} word{wordCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        </Animated.View>
      </ScrollView>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />

      {/* Upgrade Prompt (for free users) */}
      {!isPremium && showUpgrade && (
        <UpgradePromptOverlay onClose={() => setShowUpgrade(false)} />
      )}
    </View>
  );
}

function SessionDetailModal({
  session,
  onClose,
}: {
  session: CompletedSession | null;
  onClose: () => void;
}) {
  if (!session) return null;

  const date = new Date(session.date);
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const modeBadgeColors = getModeBadgeColor(session.mode);
  const modeBadgeLabel = getModeBadgeLabel(session.mode);

  return (
    <Modal
      visible={session !== null}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={detailStyles.overlay} onPress={onClose}>
        <Pressable style={detailStyles.sheetContent} onPress={() => {}}>
          <View style={detailStyles.handle} />

          <Text style={detailStyles.title}>{session.sceneTitle}</Text>
          <Text style={detailStyles.date}>{dateStr}</Text>

          {/* Mode badge */}
          <View style={[detailStyles.modeBadge, { backgroundColor: modeBadgeColors.bg }]}>
            <Text style={[detailStyles.modeBadgeText, { color: modeBadgeColors.text }]}>
              {modeBadgeLabel}
            </Text>
          </View>

          {/* Words learned */}
          {((session.newWords ?? []).length > 0 || (session.reviewWords ?? []).length > 0) && (
            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionTitle}>Words this session</Text>
              <View style={detailStyles.wordChips}>
                {(session.newWords ?? []).map((w) => (
                  <View key={w.id} style={detailStyles.newWordChip}>
                    <Text style={detailStyles.newWordChipText}>{w.lemma}</Text>
                  </View>
                ))}
                {(session.reviewWords ?? []).map((w) => (
                  <View key={w.id} style={detailStyles.reviewWordChip}>
                    <Text style={detailStyles.reviewWordChipText}>{w.lemma}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Full dialogue */}
          <Text style={detailStyles.sectionTitle}>Conversation</Text>
          <ScrollView style={detailStyles.dialogueScroll}>
            {(session.messages ?? []).map((msg, idx) => (
              <View
                key={idx}
                style={[
                  detailStyles.messageBubble,
                  msg.speaker === 'user' ? detailStyles.userBubble : detailStyles.partnerBubble,
                ]}
              >
                <Text style={detailStyles.messageText}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Close */}
          <TouchableOpacity
            style={detailStyles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={detailStyles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function UpgradePromptOverlay({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      visible
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={upgradeStyles.overlay} onPress={onClose}>
        <Pressable style={upgradeStyles.card} onPress={() => {}}>
          <Text style={upgradeStyles.emoji}>{'\u{1F680}'}</Text>
          <Text style={upgradeStyles.title}>Unlock Full History</Text>
          <Text style={upgradeStyles.description}>
            Premium members can look back at every conversation they have ever had.
            Upgrade to see your full history, plus all tracks, detailed stats, and no ads.
          </Text>
          <TouchableOpacity
            style={upgradeStyles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium"
          >
            <Text style={upgradeStyles.buttonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={upgradeStyles.laterButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={upgradeStyles.laterButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: '500',
    color: colors.light.textPrimary,
    textAlign: 'center',
    lineHeight: typography.heading.lineHeight,
  },
  emptySub: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  headerTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
    marginTop: spacing.md,
  },
  headerSub: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  upgradeCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.secondary,
    marginBottom: spacing.md,
  },
  upgradeEmoji: {
    fontSize: 24,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  upgradeDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeArrow: {
    fontSize: typography.body.fontSize,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  sessionDateRow: {
    flex: 1,
  },
  sessionDate: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
  },
  sessionTime: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
  },
  modeBadge: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  modeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  sessionContext: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  sessionPreview: {
    fontSize: typography.body.fontSize,
    fontStyle: 'italic',
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xs,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sessionMeta: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
  },
  sessionMetaDot: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
  },
});

const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: colors.light.bg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '85%',
    paddingBottom: spacing['2xl'],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.light.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
  },
  date: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    lineHeight: typography.caption.lineHeight,
    marginTop: spacing.xs,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  modeBadgeText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as any,
    color: colors.light.textPrimary,
    lineHeight: typography.subheading.lineHeight,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  wordChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  newWordChip: {
    backgroundColor: 'rgba(232, 168, 124, 0.2)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  newWordChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.accentWarm,
    fontWeight: '500',
  },
  reviewWordChip: {
    backgroundColor: 'rgba(91, 140, 90, 0.15)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
    color: colors.light.primary,
    fontWeight: '500',
  },
  dialogueScroll: {
    maxHeight: 300,
  },
  messageBubble: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: colors.light.conversationUser,
    alignSelf: 'flex-end',
    borderLeftWidth: 3,
    borderLeftColor: colors.light.primary,
  },
  partnerBubble: {
    backgroundColor: colors.light.conversationPartner,
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  closeButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  closeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
    color: '#FFFFFF',
  },
});

const upgradeStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.light.bg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.subheading.lineHeight,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
    color: '#FFFFFF',
  },
  laterButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  laterButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
  },
});