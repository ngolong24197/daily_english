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
    conversationUser: 'rgba(91, 140, 90, 0.10)',
    conversationPartner: '#E8E4DF',
    border: '#E8E4DF',
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
    conversationUser: 'rgba(91, 140, 90, 0.15)',
    conversationPartner: '#3A3530',
    border: '#3A3530',
  },
} as const;

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