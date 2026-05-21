import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { typography, spacing, radii, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useSessionStore, type CompletedSession } from '@/stores/sessionStore';
import { getModeBadgeColor, getModeBadgeLabel } from '@/services/wordService';
import { subscriptionService } from '@/services/subscriptionService';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { HistoryEmptyState } from '@/components/SkeletonScreens';

export default function HistoryScreen() {
  const { colors } = useTheme();
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
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <HistoryEmptyState />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[fadeIn, slideUp]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Conversation History</Text>
        <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
          {visibleSessions.length} conversation{visibleSessions.length !== 1 ? 's' : ''}
        </Text>

        {/* Upgrade card for free users with older sessions */}
        {!isPremium && hasOlderSessions && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
            onPress={() => setShowUpgrade(true)}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to see your full history"
          >
            <Text style={styles.upgradeEmoji}>{'\u{1F512}'}</Text>
            <View style={styles.upgradeText}>
              <Text style={[styles.upgradeTitle, { color: colors.textPrimary }]}>Older conversations locked</Text>
              <Text style={[styles.upgradeDesc, { color: colors.textSecondary }]}>
                Upgrade to see your full history beyond 7 days.
              </Text>
            </View>
            <Text style={[styles.upgradeArrow, { color: colors.textMuted }]}>{'>'}</Text>
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
              style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedSession(session)}
              accessibilityLabel={`Conversation from ${dateStr}, ${sentenceCount} sentences`}
              accessibilityRole="button"
            >
              <View style={styles.sessionCardHeader}>
                <View style={styles.sessionDateRow}>
                  <Text style={[styles.sessionDate, { color: colors.textMuted }]}>{dateStr}</Text>
                  <Text style={[styles.sessionTime, { color: colors.textMuted }]}>{timeStr}</Text>
                </View>
                <View style={[styles.modeBadge, { backgroundColor: modeBadgeColors.bg }]}>
                  <Text style={[styles.modeBadgeText, { color: modeBadgeColors.text }]}>
                    {modeBadgeLabel}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sessionContext, { color: colors.textPrimary }]}>{session.sceneTitle}</Text>
              <Text style={[styles.sessionPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                {"“"}{firstSentence}{"”"}
              </Text>
              <View style={styles.sessionMetaRow}>
                <Text style={[styles.sessionMeta, { color: colors.textMuted }]}>
                  {sentenceCount} sentence{sentenceCount !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.sessionMetaDot, { color: colors.textMuted }]}>{'·'}</Text>
                <Text style={[styles.sessionMeta, { color: colors.textMuted }]}>
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
        themeColors={colors}
      />

      {/* Upgrade Prompt (for free users) */}
      {!isPremium && showUpgrade && (
        <UpgradePromptOverlay onClose={() => setShowUpgrade(false)} themeColors={colors} />
      )}
    </View>
  );
}

function SessionDetailModal({
  session,
  onClose,
  themeColors,
}: {
  session: CompletedSession | null;
  onClose: () => void;
  themeColors: ThemeColors;
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
      <Pressable style={[detailStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]} onPress={onClose}>
        <Pressable style={[detailStyles.sheetContent, { backgroundColor: themeColors.bg }]} onPress={() => {}}>
          <View style={[detailStyles.handle, { backgroundColor: themeColors.border }]} />

          <Text style={[detailStyles.title, { color: themeColors.textPrimary }]}>{session.sceneTitle}</Text>
          <Text style={[detailStyles.date, { color: themeColors.textMuted }]}>{dateStr}</Text>

          {/* Mode badge */}
          <View style={[detailStyles.modeBadge, { backgroundColor: modeBadgeColors.bg }]}>
            <Text style={[detailStyles.modeBadgeText, { color: modeBadgeColors.text }]}>
              {modeBadgeLabel}
            </Text>
          </View>

          {/* Words learned */}
          {((session.newWords ?? []).length > 0 || (session.reviewWords ?? []).length > 0) && (
            <View style={detailStyles.section}>
              <Text style={[detailStyles.sectionTitle, { color: themeColors.textPrimary }]}>Words this session</Text>
              <View style={detailStyles.wordChips}>
                {(session.newWords ?? []).map((w) => (
                  <View key={w.id} style={[detailStyles.newWordChip, { backgroundColor: themeColors.secondaryMedium }]}>
                    <Text style={[detailStyles.newWordChipText, { color: themeColors.accentWarm }]}>{w.lemma}</Text>
                  </View>
                ))}
                {(session.reviewWords ?? []).map((w) => (
                  <View key={w.id} style={[detailStyles.reviewWordChip, { backgroundColor: themeColors.primaryMedium }]}>
                    <Text style={[detailStyles.reviewWordChipText, { color: themeColors.primary }]}>{w.lemma}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Full dialogue */}
          <Text style={[detailStyles.sectionTitle, { color: themeColors.textPrimary }]}>Conversation</Text>
          <ScrollView style={detailStyles.dialogueScroll}>
            {(session.messages ?? []).map((msg, idx) => (
              <View
                key={idx}
                style={[
                  detailStyles.messageBubble,
                  msg.speaker === 'user'
                    ? [detailStyles.userBubble, { backgroundColor: themeColors.conversationUser, borderLeftColor: themeColors.primary }]
                    : [detailStyles.partnerBubble, { backgroundColor: themeColors.conversationPartner }],
                ]}
              >
                <Text style={[detailStyles.messageText, { color: themeColors.textPrimary }]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Close */}
          <TouchableOpacity
            style={[detailStyles.closeButton, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={[detailStyles.closeButtonText, { color: themeColors.onPrimary }]}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function UpgradePromptOverlay({ onClose, themeColors }: { onClose: () => void; themeColors: ThemeColors }) {
  return (
    <Modal
      visible
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={[upgradeStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} onPress={onClose}>
        <Pressable style={[upgradeStyles.card, { backgroundColor: themeColors.bg }]} onPress={() => {}}>
          <Text style={upgradeStyles.emoji}>{'\u{1F680}'}</Text>
          <Text style={[upgradeStyles.title, { color: themeColors.textPrimary }]}>Unlock Full History</Text>
          <Text style={[upgradeStyles.description, { color: themeColors.textSecondary }]}>
            Premium members can look back at every conversation they have ever had.
            Upgrade to see your full history, plus all tracks, detailed stats, and no ads.
          </Text>
          <TouchableOpacity
            style={[upgradeStyles.button, { backgroundColor: themeColors.primary }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Upgrade to Premium"
          >
            <Text style={[upgradeStyles.buttonText, { color: themeColors.onPrimary }]}>Upgrade to Premium</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={upgradeStyles.laterButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={[upgradeStyles.laterButtonText, { color: themeColors.textSecondary }]}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'center',
    lineHeight: typography.heading.lineHeight,
  },
  emptySub: {
    fontSize: typography.body.fontSize,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  headerTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    lineHeight: typography.heading.lineHeight,
    marginTop: spacing.md,
  },
  headerSub: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  upgradeCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
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
    lineHeight: typography.body.lineHeight,
  },
  upgradeDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  upgradeArrow: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
  },
  sessionCard: {
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
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
    lineHeight: typography.caption.lineHeight,
  },
  sessionTime: {
    fontSize: typography.caption.fontSize,
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
    lineHeight: typography.body.lineHeight,
  },
  sessionPreview: {
    fontSize: typography.body.fontSize,
    fontStyle: 'italic',
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
    lineHeight: typography.caption.lineHeight,
  },
  sessionMetaDot: {
    fontSize: typography.caption.fontSize,
  },
});

const detailStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContent: {
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
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight as any,
    lineHeight: typography.heading.lineHeight,
  },
  date: {
    fontSize: typography.caption.fontSize,
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
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  newWordChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
  },
  reviewWordChip: {
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reviewWordChipText: {
    fontSize: typography.body.fontSize,
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
    alignSelf: 'flex-end',
    borderLeftWidth: 3,
  },
  partnerBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
  },
  closeButton: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  closeButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
});

const upgradeStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
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
    lineHeight: typography.subheading.lineHeight,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  laterButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  laterButtonText: {
    fontSize: typography.body.fontSize,
  },
});