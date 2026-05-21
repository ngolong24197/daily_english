import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, typography, spacing, radii } from '@/constants/theme';
import { useSessionStore } from '@/stores/sessionStore';
import { wordProgressStore, type MasteryLevel } from '@/services/wordProgress';
import { type MockWord } from '@/services/mockData';
import { getWords } from '@/services/supabaseDataService';
import { getWordModeEntry, getModeBadgeColor, getModeBadgeLabel } from '@/services/wordService';
import { subscriptionService } from '@/services/subscriptionService';
import WordExplorationSheet from '@/components/WordExplorationSheet';
import { useEntranceAnimation } from '@/hooks/useEntranceAnimation';
import { useHaptics } from '@/hooks/useHaptics';
import { MyWordsEmptyState } from '@/components/SkeletonScreens';
import { wordChipLabel } from '@/utils/accessibility';
import type { ModeCode } from '@/types';

const MASTERY_CONFIG: Record<MasteryLevel, { emoji: string; label: string; description: string; color: string }> = {
  seed: {
    emoji: '\u{1F331}',
    label: 'Seeds',
    description: 'Words you have seen',
    color: colors.light.textSecondary,
  },
  sprout: {
    emoji: '\u{1F33F}',
    label: 'Sprouts',
    description: 'Words you have used',
    color: colors.light.primary,
  },
  bloom: {
    emoji: '\u{1F33A}',
    label: 'Blooms',
    description: 'Words you have mastered',
    color: colors.light.accentWarm,
  },
};

const MODE_FILTERS: { code: ModeCode | 'all'; label: string }[] = [
  { code: 'all', label: 'All' },
  { code: 'survival', label: 'Survival' },
  { code: 'professional', label: 'Professional' },
  { code: 'social', label: 'Social' },
  { code: 'ielts', label: 'IELTS' },
  { code: 'toeic', label: 'TOEIC' },
];

export default function WordsScreen() {
  const { completedSessions, currentMode } = useSessionStore();
  const [selectedWord, setSelectedWord] = useState<MockWord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<ModeCode | 'all'>('all');
  const { fadeIn, slideUp, playEntrance } = useEntranceAnimation();
  const haptics = useHaptics();

  useEffect(() => {
    playEntrance();
  }, []);

  const isPremium = subscriptionService.isPremium();
  const hasDetailedStats = subscriptionService.hasDetailedStats();

  // Build a map of all words from sessions + progress store
  const wordMap = new Map<string, { lemma: string; count: number; word: MockWord | null }>();

  for (const session of completedSessions) {
    for (const word of session.newWords) {
      const existing = wordMap.get(word.lemma);
      if (existing) {
        wordMap.set(word.lemma, { ...existing, count: existing.count + 1 });
      } else {
        wordMap.set(word.lemma, { lemma: word.lemma, count: 1, word });
      }
    }
    for (const word of session.reviewWords) {
      const existing = wordMap.get(word.lemma);
      if (existing) {
        wordMap.set(word.lemma, { ...existing, count: existing.count + 1 });
      } else {
        wordMap.set(word.lemma, { lemma: word.lemma, count: 1, word });
      }
    }
  }

  const allProgress = wordProgressStore.getAll();
  for (const record of allProgress) {
    if (!wordMap.has(record.wordId)) {
      const mockWord = getWords()[record.wordId];
      wordMap.set(record.wordId, {
        lemma: mockWord?.lemma ?? record.wordId,
        count: record.timesSeen,
        word: mockWord ?? null,
      });
    }
  }

  // Group by mastery level
  const groups: Record<MasteryLevel, { word: MockWord; contexts: string[]; timesUsed: number }[]> = {
    seed: [],
    sprout: [],
    bloom: [],
  };

  for (const record of allProgress) {
    const word = getWords()[record.wordId];
    if (!word) continue;

    // Apply mode filter
    if (filterMode !== 'all') {
      const wordModes = Object.keys(word.modeEntries) as ModeCode[];
      if (!wordModes.includes(filterMode)) continue;
      if (record.contexts.length > 0 && !record.contexts.includes(filterMode)) continue;
    }

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!word.lemma.toLowerCase().includes(q)) continue;
    }

    groups[record.masteryLevel].push({
      word,
      contexts: record.contexts,
      timesUsed: record.timesUsedInContext,
    });
  }

  // Also add words from sessions that are not yet in progress
  for (const [lemma, data] of wordMap) {
    if (data.word && !allProgress.find((r) => r.wordId === data.word!.id)) {
      // Apply filters
      if (filterMode !== 'all') {
        const wordModes = Object.keys(data.word.modeEntries) as ModeCode[];
        if (!wordModes.includes(filterMode)) continue;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!lemma.toLowerCase().includes(q)) continue;
      }

      groups.seed.push({
        word: data.word,
        contexts: [],
        timesUsed: 0,
      });
    }
  }

  const totalWords = groups.seed.length + groups.sprout.length + groups.bloom.length;

  // Empty state
  if (completedSessions.length === 0 && allProgress.length === 0) {
    return (
      <View style={styles.container}>
        <MyWordsEmptyState />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={[fadeIn, slideUp]}>
        <Text style={styles.headerTitle}>My Words</Text>
        <Text style={styles.headerSub}>{totalWords} word{totalWords !== 1 ? 's' : ''} learned</Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            placeholderTextColor={colors.light.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search words"
          />
        </View>

        {/* Mode filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {MODE_FILTERS.map((filter) => {
            const isActive = filterMode === filter.code;
            return (
              <TouchableOpacity
                key={filter.code}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => {
                  haptics.selectionChanged();
                  setFilterMode(filter.code);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter.label}`}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Mastery groups */}
        {(['bloom', 'sprout', 'seed'] as MasteryLevel[]).map((level) => {
          const config = MASTERY_CONFIG[level];
          const words = groups[level];
          if (words.length === 0) return null;

          return (
            <View key={level} style={styles.masteryGroup}>
              <View style={styles.masteryHeader}>
                <Text style={styles.masteryEmoji}>{config.emoji}</Text>
                <View style={styles.masteryHeaderText}>
                  <Text style={styles.masteryLabel}>{config.label}</Text>
                  <Text style={styles.masteryDescription}>{config.description}</Text>
                </View>
                <Text style={styles.masteryCount}>{words.length}</Text>
              </View>
              <View style={styles.wordList}>
                {words.map(({ word, contexts, timesUsed }) => {
                  const entry = getWordModeEntry(word, currentMode);
                  return (
                    <TouchableOpacity
                      key={word.id}
                      style={styles.wordCard}
                      onPress={() => setSelectedWord(word)}
                      accessibilityLabel={`${word.lemma}, tap to explore`}
                      accessibilityRole="button"
                    >
                      <View style={styles.wordCardLeft}>
                        <Text style={styles.wordLemma}>{word.lemma}</Text>
                        <Text style={styles.wordContext} numberOfLines={1}>
                          {entry.example_context}
                        </Text>
                      </View>
                      <View style={styles.wordCardRight}>
                        {/* Mode context dots */}
                        {contexts.length > 0 && (
                          <View style={styles.contextsRow}>
                            {contexts.map((ctx) => {
                              const ctxColors = getModeBadgeColor(ctx as ModeCode);
                              return (
                                <View
                                  key={ctx}
                                  style={[styles.contextDot, { backgroundColor: ctxColors.text }]}
                                />
                              );
                            })}
                          </View>
                        )}
                        {/* Usage count (premium feature indicator) */}
                        {hasDetailedStats && timesUsed > 0 ? (
                          <Text style={styles.timesUsed}>
                            {timesUsed}x
                          </Text>
                        ) : !hasDetailedStats && timesUsed > 0 ? (
                          <Text style={styles.premiumLockText}>{'\u{1F512}'}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* Premium stats upgrade prompt for free users */}
        {!hasDetailedStats && totalWords > 0 && (
          <View style={styles.premiumStatsCard}>
            <Text style={styles.premiumStatsEmoji}>{'\u{1F4CA}'}</Text>
            <View style={styles.premiumStatsText}>
              <Text style={styles.premiumStatsTitle}>Upgrade for detailed stats</Text>
              <Text style={styles.premiumStatsDesc}>
                See usage frequency, contexts used, and mastery progress for each word.
              </Text>
            </View>
          </View>
        )}
        </Animated.View>
      </ScrollView>

      {/* Word Exploration Sheet */}
      <WordExplorationSheet
        visible={selectedWord !== null}
        word={selectedWord}
        modeCode={currentMode}
        onClose={() => setSelectedWord(null)}
      />
    </View>
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
  searchRow: {
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body.fontSize,
    color: colors.light.textPrimary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  filterChipText: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  masteryGroup: {
    marginTop: spacing.lg,
  },
  masteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  masteryEmoji: {
    fontSize: 24,
  },
  masteryHeaderText: {
    flex: 1,
  },
  masteryLabel: {
    fontSize: typography.subheading.fontSize,
    fontWeight: typography.subheading.fontWeight as any,
    color: colors.light.textPrimary,
    lineHeight: typography.subheading.lineHeight,
  },
  masteryDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
  },
  masteryCount: {
    fontSize: typography.subheading.fontSize,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  wordList: {
    gap: spacing.sm,
  },
  wordCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  wordCardLeft: {
    flex: 1,
  },
  wordLemma: {
    fontSize: typography.body.fontSize,
    fontWeight: '500',
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  wordContext: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
  wordCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contextsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  contextDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timesUsed: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    fontWeight: '500',
  },
  premiumLockText: {
    fontSize: typography.caption.fontSize,
  },
  premiumStatsCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.secondary,
    marginTop: spacing.lg,
  },
  premiumStatsEmoji: {
    fontSize: 24,
  },
  premiumStatsText: {
    flex: 1,
  },
  premiumStatsTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.light.textPrimary,
    lineHeight: typography.body.lineHeight,
  },
  premiumStatsDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.caption.lineHeight,
    marginTop: 2,
  },
});