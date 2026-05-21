/**
 * Accessibility Utilities — Helpers for WCAG 2.1 AA compliance.
 *
 * - Accessibility labels for all interactive elements
 * - Reduce motion support
 * - Color contrast verification
 * - Touch target size enforcement
 * - Screen reader announcements
 */

import { AccessibilityInfo, Platform, Alert } from 'react-native';
import { colors } from '@/constants/theme';

/**
 * Check if reduce motion is enabled on the device.
 * Returns a promise that resolves to true if the user prefers reduced motion.
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Announce a message to screen readers.
 * Use for important state changes that screen reader users should know about.
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Announce that a state change has occurred with a polite (non-interrupting) assertion.
 */
export function announcePolite(message: string): void {
  if (Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibility(message);
  } else {
    // On Android, use announceForAccessibility which is already polite
    AccessibilityInfo.announceForAccessibility(message);
  }
}

// ─── Accessibility Labels ──────────────────────────────────────────────────────

/**
 * MicButton accessibility labels based on state.
 */
export const MicButtonLabels = {
  idle: 'Tap to start speaking',
  recording: 'Listening... Tap to stop.',
  processing: 'Processing your speech.',
  error: 'Try again. Tap to retry.',
  permissionDenied: 'Speaking requires microphone access. You can type instead.',
} as const;

/**
 * Word chip accessibility labels.
 */
export function wordChipLabel(word: string, partOfSpeech: string): string {
  return `Word: ${word}. ${partOfSpeech}. Tap to explore.`;
}

/**
 * Navigation item labels.
 */
export const NavigationLabels: Record<string, string> = {
  '/': "Today's session",
  '/session/checkin': 'Start a session',
  '/session/scene': "Today's scene",
  '/session/conversation': 'Conversation practice',
  '/session/jam-along': 'Jam Along practice',
  '/session/review': 'Session review',
  '/history': 'Conversation history',
  '/words': 'My words collection',
  '/settings': 'Settings',
};

/**
 * Mood emoji accessibility labels.
 */
export const MoodLabels: Record<string, string> = {
  good: 'Good — select this mood',
  okay: 'Okay — select this mood',
  rough: 'Rough — select this mood',
  focused: 'Focused — select this mood',
  busy: 'Busy — select this mood',
};

/**
 * Phrase accessibility labels.
 */
export function phraseLabel(phrase: string): string {
  return `Say: ${phrase}`;
}

/**
 * Hint button accessibility label.
 */
export const HintLabel = 'Get a hint for what to say next';

/**
 * Track selection accessibility label.
 */
export function trackLabel(name: string, isPremium: boolean, isSelected: boolean): string {
  let label = `${name} track`;
  if (isPremium) label += ', premium';
  if (isSelected) label += ', selected';
  return label;
}

// ─── Color Contrast Verification ────────────────────────────────────────────────

/**
 * Calculate the relative luminance of a color.
 * Used for WCAG contrast ratio calculation.
 */
function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate the WCAG contrast ratio between two colors.
 */
export function contrastRatio(color1: string, color2: string): number {
  const l1 = luminance(color1);
  const l2 = luminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a text/background combination meets WCAG 2.1 AA.
 * @param textColor - Hex color of the text
 * @param backgroundColor - Hex color of the background
 * @param isLargeText - Whether the text is 18pt+ (bold) or 24pt+ (normal)
 */
export function meetsWcagAA(
  textColor: string,
  backgroundColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = contrastRatio(textColor, backgroundColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Convert hex color to RGB values.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return null;
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

/**
 * Verify all theme colors meet WCAG 2.1 AA contrast requirements.
 * Run this in development to check color combinations.
 */
export function verifyThemeContrast(): { pass: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check both light and dark palettes
  for (const scheme of ['light', 'dark'] as const) {
    const palette = colors[scheme];
    const label = scheme === 'light' ? 'Light' : 'Dark';

    // Normal text on background
    if (!meetsWcagAA(palette.textPrimary, palette.bg)) {
      violations.push(`[${label}] textPrimary on bg: ${contrastRatio(palette.textPrimary, palette.bg).toFixed(2)} (need 4.5:1)`);
    }
    if (!meetsWcagAA(palette.textSecondary, palette.bg)) {
      violations.push(`[${label}] textSecondary on bg: ${contrastRatio(palette.textSecondary, palette.bg).toFixed(2)} (need 4.5:1)`);
    }
    if (!meetsWcagAA(palette.textMuted, palette.bg)) {
      violations.push(`[${label}] textMuted on bg: ${contrastRatio(palette.textMuted, palette.bg).toFixed(2)} (need 4.5:1) — large text only`);
    }
    if (!meetsWcagAA(palette.onPrimary, palette.primary)) {
      violations.push(`[${label}] onPrimary on primary: ${contrastRatio(palette.onPrimary, palette.primary).toFixed(2)} (need 4.5:1)`);
    }
  }

  return {
    pass: violations.length === 0,
    violations,
  };
}

// ─── Touch Target Enforcement ────────────────────────────────────────────────────

/**
 * Minimum touch target size per WCAG 2.1 AA (44x44px).
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Ensure a style includes the minimum touch target size.
 * Use this when a visual element is smaller than 44x44 but needs
 * to meet the touch target requirement.
 */
export function ensureTouchTarget(style: { width?: number; height?: number; minWidth?: number; minHeight?: number }): {
  minWidth: number;
  minHeight: number;
} {
  return {
    minWidth: Math.max(style.width ?? 0, style.minWidth ?? 0, MIN_TOUCH_TARGET),
    minHeight: Math.max(style.height ?? 0, style.minHeight ?? 0, MIN_TOUCH_TARGET),
  };
}

// ─── Screen Reader Announcements for State Changes ──────────────────────────────

/**
 * Announce that recording has started.
 */
export function announceRecordingStarted(): void {
  announcePolite('Recording started. Tap to stop.');
}

/**
 * Announce that a word was learned.
 */
export function announceWordLearned(word: string): void {
  announcePolite(`You learned the word "${word}"!`);
}

/**
 * Announce that a conversation is complete.
 */
export function announceConversationComplete(): void {
  announcePolite('Conversation complete! Nice work.');
}

/**
 * Announce a mode switch.
 */
export function announceModeSwitch(mode: string): void {
  announcePolite(`Switched to ${mode} mode.`);
}

/**
 * Announce an error occurred (with warm tone).
 */
export function announceError(warmMessage: string): void {
  announcePolite(warmMessage);
}