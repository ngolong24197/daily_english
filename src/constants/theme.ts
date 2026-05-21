export const colors = {
  light: {
    bg: '#FFFBF5',
    surface: '#FFFFFF',
    primary: '#5B8C5A',
    primaryHover: '#4A7A49',
    secondary: '#D4A574',
    textPrimary: '#2D2A26',
    textSecondary: '#7A746D',
    textMuted: '#B5AFA8',
    accentWarm: '#E8A87C',
    accentCool: '#7EB5D6',
    success: '#5B8C5A',
    warning: '#D4A574',
    danger: '#cc3333',
    conversationUser: 'rgba(91, 140, 90, 0.10)',
    conversationPartner: '#E8E4DF',
    border: '#E8E4DF',
    // Semantic additions
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    surfaceWarm: '#FFF8F0',
    surfaceWarmAlt: '#F5EDE4',
    // Opacity variants of primary
    primarySubtle: 'rgba(91, 140, 90, 0.08)',
    primaryLight: 'rgba(91, 140, 90, 0.12)',
    primaryMedium: 'rgba(91, 140, 90, 0.15)',
    // Opacity variants of secondary
    secondaryLight: 'rgba(212, 165, 116, 0.08)',
    secondaryMedium: 'rgba(212, 165, 116, 0.2)',
    // Opacity variants of accentCool
    accentCoolLight: 'rgba(126, 181, 214, 0.15)',
    // Overlays
    overlayLight: 'rgba(0, 0, 0, 0.05)',
    overlayMedium: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.4)',
    // Shadow
    shadow: '#000000',
  },
  dark: {
    bg: '#1A1614',
    surface: '#2A2420',
    primary: '#7AB37A',
    primaryHover: '#8DC38D',
    secondary: '#C49564',
    textPrimary: '#F0EBE3',
    textSecondary: '#A39E96',
    textMuted: '#6B6660',
    accentWarm: '#D4986C',
    accentCool: '#6AA0C0',
    success: '#7AB37A',
    warning: '#C49564',
    danger: '#e04040',
    conversationUser: 'rgba(91, 140, 90, 0.15)',
    conversationPartner: '#3A3530',
    border: '#3A3530',
    // Semantic additions
    white: '#FFFFFF',
    onPrimary: '#FFFFFF',
    surfaceWarm: '#2E2620',
    surfaceWarmAlt: '#332A24',
    // Opacity variants of primary
    primarySubtle: 'rgba(122, 179, 122, 0.08)',
    primaryLight: 'rgba(122, 179, 122, 0.12)',
    primaryMedium: 'rgba(122, 179, 122, 0.15)',
    // Opacity variants of secondary
    secondaryLight: 'rgba(196, 149, 100, 0.08)',
    secondaryMedium: 'rgba(196, 149, 100, 0.2)',
    // Opacity variants of accentCool
    accentCoolLight: 'rgba(106, 160, 192, 0.15)',
    // Overlays
    overlayLight: 'rgba(255, 255, 255, 0.05)',
    overlayMedium: 'rgba(0, 0, 0, 0.3)',
    overlayHeavy: 'rgba(0, 0, 0, 0.5)',
    // Shadow
    shadow: '#000000',
  },
} as const;

export type ColorScheme = 'light' | 'dark';

// Broad type for theme colors — both light and dark satisfy this
export interface ThemeColors {
  bg: string;
  surface: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentWarm: string;
  accentCool: string;
  success: string;
  warning: string;
  danger: string;
  conversationUser: string;
  conversationPartner: string;
  border: string;
  white: string;
  onPrimary: string;
  surfaceWarm: string;
  surfaceWarmAlt: string;
  primarySubtle: string;
  primaryLight: string;
  primaryMedium: string;
  secondaryLight: string;
  secondaryMedium: string;
  accentCoolLight: string;
  overlayLight: string;
  overlayMedium: string;
  overlayHeavy: string;
  shadow: string;
}

export type ResolvedColors = ThemeColors;

export const modeColors = {
  survival: {
    accent: '#C47A3A',
    accentLight: 'rgba(196, 122, 58, 0.15)',
    accentSurface: 'rgba(196, 122, 58, 0.08)',
  },
  professional: {
    accent: '#4A7A9B',
    accentLight: 'rgba(74, 122, 155, 0.15)',
    accentSurface: 'rgba(74, 122, 155, 0.08)',
  },
  social: {
    accent: '#C47A3A',
    accentLight: 'rgba(196, 122, 58, 0.15)',
    accentSurface: 'rgba(196, 122, 58, 0.08)',
  },
  ielts: {
    accent: '#3A6A8F',
    accentLight: 'rgba(58, 106, 143, 0.15)',
    accentSurface: 'rgba(58, 106, 143, 0.08)',
  },
  toeic: {
    accent: '#8B6B3D',
    accentLight: 'rgba(139, 107, 61, 0.15)',
    accentSurface: 'rgba(139, 107, 61, 0.08)',
  },
} as const;

export type ModeCode = keyof typeof modeColors;

export const typography = {
  display: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  heading: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  subheading: { fontSize: 18, fontWeight: '500' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  bodyLg: { fontSize: 18, fontWeight: '400' as const, lineHeight: 26 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  micLabel: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  hint: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;