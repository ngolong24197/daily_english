import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';
import type { ModeCode } from '../types';
import { MODES } from '../constants/modes';
import { useSessionStore } from '../stores/sessionStore';
import { storage } from '../lib/storage';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

const TRACK_CARDS: {
  code: ModeCode;
  icon: string;
  title: string;
  description: string;
  exampleWord: string;
  exampleSentence: string;
}[] = [
  {
    code: 'survival',
    icon: '\u{1F3E0}',
    title: 'Survival',
    description: 'Navigate daily life — doctor, grocery, small talk',
    exampleWord: 'get',
    exampleSentence: '"Where can I get a bus?"',
  },
  {
    code: 'professional',
    icon: '\u{1F4BC}',
    title: 'Professional',
    description: 'Excel at work — meetings, email, presentations',
    exampleWord: 'deadline',
    exampleSentence: '"We need to meet the deadline."',
  },
  {
    code: 'social',
    icon: '\u{1F3AE}',
    title: 'Social',
    description: 'Connect with people — slang, memes, gaming',
    exampleWord: 'carry',
    exampleSentence: '"Don\'t worry, I\'ll carry this team!"',
  },
  {
    code: 'ielts',
    icon: '\u{1F4DD}',
    title: 'IELTS',
    description: 'Prepare for IELTS — formal, structured, accuracy-focused',
    exampleWord: 'approach',
    exampleSentence: '"We need a different approach to this problem."',
  },
  {
    code: 'toeic',
    icon: '\u{1F4CA}',
    title: 'TOEIC',
    description: 'Prepare for TOEIC — business English, structured',
    exampleWord: 'charge',
    exampleSentence: '"She is in charge of the new project."',
  },
];

export default function TrackSelectionScreen() {
  const { currentMode, setCurrentMode } = useSessionStore();

  const handleTrackSelect = (trackCode: ModeCode) => {
    const track = MODES[trackCode];
    const isPremium = track.is_premium;

    if (isPremium) {
      // Show premium notice for exam and professional/social tracks
      Alert.alert(
        `${track.display_name} Track`,
        trackCode === 'ielts' || trackCode === 'toeic'
          ? `${track.display_name} mode includes accuracy feedback and timed practice. This is different from the daily conversation — it’s structured practice for your exam.\n\nYou can still switch tracks anytime from Settings.`
          : `${track.display_name} track offers specialized vocabulary and contexts.\n\nYou can switch tracks anytime from Settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Choose this track',
            onPress: () => selectTrack(trackCode),
          },
        ]
      );
    } else {
      selectTrack(trackCode);
    }
  };

  const selectTrack = (trackCode: ModeCode) => {
    setCurrentMode(trackCode);
    // Mark onboarding as complete
    storage.set(ONBOARDING_COMPLETE_KEY, 'true');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.title}>What brings you here?</Text>
        <Text style={styles.subtitle}>
          Choose a track that fits your life. You can change it anytime.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        {TRACK_CARDS.map((card) => {
          const isSelected = currentMode === card.code;
          const mode = MODES[card.code];
          return (
            <TouchableOpacity
              key={card.code}
              style={[
                styles.trackCard,
                isSelected && styles.trackCardSelected,
              ]}
              onPress={() => handleTrackSelect(card.code)}
              accessibilityLabel={`${card.title} track: ${card.description}`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={styles.trackCardHeader}>
                <Text style={styles.trackCardIcon}>{card.icon}</Text>
                <View style={styles.trackCardHeaderText}>
                  <Text
                    style={[
                      styles.trackCardTitle,
                      isSelected && styles.trackCardTitleSelected,
                    ]}
                  >
                    {card.title}
                  </Text>
                  {mode.is_premium && (
                    <Text style={styles.premiumBadge}>Premium</Text>
                  )}
                </View>
                {isSelected && (
                  <View style={styles.selectedCheckmark}>
                    <Text style={styles.selectedCheckmarkText}>{'✓'}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.trackCardDescription,
                  isSelected && styles.trackCardDescriptionSelected,
                ]}
              >
                {card.description}
              </Text>

              <View style={styles.exampleContainer}>
                <Text style={styles.exampleLabel}>Example: </Text>
                <Text
                  style={[
                    styles.exampleSentence,
                    isSelected && styles.exampleSentenceSelected,
                  ]}
                >
                  {card.exampleSentence}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {currentMode && (
        <View style={styles.confirmSection}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              storage.set(ONBOARDING_COMPLETE_KEY, 'true');
            }}
            accessibilityLabel="Continue with selected track"
            accessibilityRole="button"
          >
            <Text style={styles.confirmButtonText}>
              Continue with {MODES[currentMode].display_name}
            </Text>
          </TouchableOpacity>
          <Text style={styles.confirmNote}>
            You can switch tracks anytime from Settings.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.light.bg,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    color: colors.light.textPrimary,
    lineHeight: typography.display.lineHeight,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  cardsContainer: {
    gap: spacing.md,
  },
  trackCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.light.border,
  },
  trackCardSelected: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(91, 140, 90, 0.05)',
  },
  trackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  trackCardIcon: {
    fontSize: 32,
  },
  trackCardHeaderText: {
    flex: 1,
  },
  trackCardTitle: {
    fontSize: typography.heading.fontSize,
    fontWeight: typography.heading.fontWeight,
    color: colors.light.textPrimary,
    lineHeight: typography.heading.lineHeight,
  },
  trackCardTitleSelected: {
    color: colors.light.primary,
  },
  premiumBadge: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: colors.light.secondary,
    marginTop: 2,
  },
  selectedCheckmark: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  trackCardDescription: {
    fontSize: typography.body.fontSize,
    color: colors.light.textSecondary,
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.md,
  },
  trackCardDescriptionSelected: {
    color: colors.light.textPrimary,
  },
  exampleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(91, 140, 90, 0.08)',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  exampleLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    fontWeight: '500',
  },
  exampleSentence: {
    fontSize: typography.caption.fontSize,
    color: colors.light.primary,
    fontStyle: 'italic',
    flex: 1,
  },
  exampleSentenceSelected: {
    color: colors.light.primaryHover,
  },
  confirmSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: colors.light.primary,
    borderRadius: radii.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    color: '#FFFFFF',
  },
  confirmNote: {
    fontSize: typography.caption.fontSize,
    color: colors.light.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
} as const;