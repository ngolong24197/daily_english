import { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { typography, spacing, radii } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorView({ onRestart }: { onRestart: () => void }) {
  const { colors } = useTheme();

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <Text style={s.emoji}>{'\u{1F41B}'}</Text>
      <Text style={[s.title, { color: colors.textPrimary }]}>Something went wrong</Text>
      <Text style={[s.message, { color: colors.textSecondary }]}>
        The app encountered an unexpected error. Please try again.
      </Text>
      <TouchableOpacity style={[s.button, { backgroundColor: colors.primary }]} onPress={onRestart} accessibilityRole="button" accessibilityLabel="Try again">
        <Text style={[s.buttonText, { color: colors.onPrimary }]}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorView onRestart={this.handleRestart} />;
    }

    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.heading.fontSize,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.body.lineHeight,
  },
  button: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: typography.button.fontSize,
    fontWeight: '600',
  },
});