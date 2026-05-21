import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { typography, spacing, radii } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

type AuthMode = 'signIn' | 'signUp';
type AuthMethod = 'password' | 'magicLink';

export default function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [method, setMethod] = useState<AuthMethod>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { setGuestMode } = useAuthStore();
  const { colors } = useTheme();

  const s = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    inner: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing['3xl'],
      paddingBottom: spacing.xl,
    },
    title: {
      fontSize: typography.display.fontSize,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: typography.body.fontSize,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    tabRow: {
      flexDirection: 'row' as const,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center' as const,
      borderRadius: radii.sm,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: typography.body.fontSize,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.onPrimary,
    },
    methodRow: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    methodText: {
      fontSize: typography.caption.fontSize,
      color: colors.textMuted,
    },
    methodTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    methodDivider: {
      fontSize: typography.caption.fontSize,
      color: colors.textMuted,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.body.fontSize,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: typography.button.fontSize,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    messageText: {
      fontSize: typography.caption.fontSize,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    dividerRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: typography.caption.fontSize,
      color: colors.textMuted,
      paddingHorizontal: spacing.md,
    },
    oauthRow: {
      flexDirection: 'row' as const,
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    oauthButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      paddingVertical: spacing.md,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    oauthButtonText: {
      fontSize: typography.body.fontSize,
      fontWeight: '500',
      color: colors.textPrimary,
    },
    switchRow: {
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    switchText: {
      fontSize: typography.caption.fontSize,
      color: colors.textSecondary,
    },
    switchAction: {
      fontWeight: '600',
      color: colors.primary,
    },
    guestRow: {
      alignItems: 'center' as const,
      paddingVertical: spacing.md,
    },
    guestText: {
      fontSize: typography.body.fontSize,
      color: colors.textMuted,
      textDecorationLine: 'underline' as const,
    },
  }), [colors]);

  const handleEmailPassword = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'signUp') {
        if (!password.trim()) {
          setMessage('Please enter a password (at least 6 characters).');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email.');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (error) throw error;
      setMessage('Check your email for a login link!');
    } catch (err: any) {
      setMessage(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: any) {
      setMessage(err.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGuest = () => {
    setGuestMode(true);
  };

  const modeLabel = mode === 'signIn' ? 'Sign In' : 'Create Account';
  const switchLabel = mode === 'signIn' ? "Don't have an account?" : 'Already have an account?';
  const switchAction = mode === 'signIn' ? 'Sign Up' : 'Sign In';

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.inner}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Daily English</Text>
          <Text style={s.subtitle}>
            {mode === 'signIn' ? 'Welcome back!' : 'Get started learning'}
          </Text>

          {/* Mode toggle */}
          <View style={s.tabRow}>
            <TouchableOpacity
              style={[s.tab, mode === 'signIn' && s.tabActive]}
              onPress={() => { setMode('signIn'); setMessage(null); }}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <Text style={[s.tabText, mode === 'signIn' && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, mode === 'signUp' && s.tabActive]}
              onPress={() => { setMode('signUp'); setMessage(null); }}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={[s.tabText, mode === 'signUp' && s.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Method toggle */}
          <View style={s.methodRow}>
            <TouchableOpacity
              onPress={() => { setMethod('password'); setMessage(null); }}
              accessibilityRole="button"
            >
              <Text style={[s.methodText, method === 'password' && s.methodTextActive]}>
                Password
              </Text>
            </TouchableOpacity>
            <Text style={s.methodDivider}>|</Text>
            <TouchableOpacity
              onPress={() => { setMethod('magicLink'); setMessage(null); }}
              accessibilityRole="button"
            >
              <Text style={[s.methodText, method === 'magicLink' && s.methodTextActive]}>
                Magic Link
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email input */}
          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            accessibilityLabel="Email address"
          />

          {/* Password input (only for password method) */}
          {method === 'password' && (
            <TextInput
              style={s.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password"
            />
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[s.submitButton, loading && s.submitButtonDisabled]}
            onPress={method === 'password' ? handleEmailPassword : handleMagicLink}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={method === 'password' ? modeLabel : 'Send Magic Link'}
          >
            <Text style={s.submitButtonText}>
              {loading ? 'Please wait...' : (method === 'password' ? modeLabel : 'Send Magic Link')}
            </Text>
          </TouchableOpacity>

          {/* Message */}
          {message && (
            <Text style={s.messageText}>{message}</Text>
          )}

          {/* Divider */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* OAuth buttons */}
          <View style={s.oauthRow}>
            <TouchableOpacity
              style={s.oauthButton}
              onPress={() => handleOAuth('google')}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
            >
              <Text style={s.oauthButtonText}>Google</Text>
            </TouchableOpacity>
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={s.oauthButton}
                onPress={() => handleOAuth('apple')}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Sign in with Apple"
              >
                <Text style={s.oauthButtonText}>Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Switch mode */}
          <TouchableOpacity
            style={s.switchRow}
            onPress={() => {
              setMode(mode === 'signIn' ? 'signUp' : 'signIn');
              setMessage(null);
            }}
            accessibilityRole="button"
          >
            <Text style={s.switchText}>
              {switchLabel} <Text style={s.switchAction}>{switchAction}</Text>
            </Text>
          </TouchableOpacity>

          {/* Guest mode */}
          <TouchableOpacity
            style={s.guestRow}
            onPress={handleGuest}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
          >
            <Text style={s.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}