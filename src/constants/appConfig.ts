/**
 * App Configuration — Central place for app-wide constants.
 *
 * Contains:
 * - App version
 * - API endpoints (Supabase URL, Hugging Face Inference API)
 * - Feature flags
 * - App store URLs (placeholder)
 * - Android permissions
 */

export const APP_CONFIG = {
  /** App version displayed in Settings */
  version: '1.0.0',

  /** Build number */
  buildNumber: 1,

  /** App name displayed throughout the app */
  appName: 'Daily English',

  /** Bundle identifier */
  bundleIdentifier: 'com.dailyenglish.app',

  /** Splash screen background color — must match theme light.bg */
  splashBackgroundColor: '#FFFBF5' as const,

  /** Android permissions required */
  androidPermissions: {
    RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    INTERNET: 'android.permission.INTERNET',
  } as const,

  /** API endpoints */
  api: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    hfApiBase: process.env.EXPO_PUBLIC_HUGGINGFACE_API_BASE ?? 'https://router.huggingface.co/v1',
    hfApiKey: process.env.EXPO_PUBLIC_HUGGINGFACE_API_KEY ?? '',
    hfModel: process.env.EXPO_PUBLIC_HUGGINGFACE_MODEL ?? 'meta-llama/Llama-3.1-8B-Instruct',
  } as const,

  /** Feature flags — toggle features on/off */
  features: {
    enableExamMode: true,
    enableJamAlong: true,
    enableAds: true,
    enableWarmReEntry: true,
    enableOnboardingEasing: true,
    enableRecoveryWords: true,
    enableSkeletonScreens: true,
    enableHapticFeedback: true,
    enableLazyLoading: true,
  } as const,

  /** App store URLs (placeholder) */
  storeUrls: {
    android: 'https://play.google.com/store/apps/details?id=com.dailyenglish.app',
    ios: 'https://apps.apple.com/app/daily-english/id0000000000',
  } as const,

  /** Performance settings */
  performance: {
    /** Lazy load screens not in initial flow (History, My Words, Settings) */
    lazyLoadScreens: true,
    /** Prefetch next scene data while conversation is in progress */
    prefetchNextScene: true,
    /** MMKV reads should be non-blocking (use runOnUI) */
    nonBlockingStorage: true,
    /** Debounce time for ASR status messages (ms) */
    asrStatusDebounce: 300,
    /** Skeleton screen minimum display time (ms) */
    skeletonMinDisplayTime: 800,
  } as const,

  /** Accessibility settings */
  accessibility: {
    /** Minimum touch target size (px) for WCAG 2.1 AA */
    minTouchTarget: 44,
    /** Color contrast ratio minimum for normal text (WCAG 2.1 AA) */
    minContrastNormalText: 4.5,
    /** Color contrast ratio minimum for large text (WCAG 2.1 AA) */
    minContrastLargeText: 3,
  } as const,

  /** Haptic feedback events */
  haptics: {
    wordLearned: true,
    conversationComplete: true,
    modeSwitch: true,
    micStart: true,
    micStop: true,
    error: false,
  } as const,
} as const;

export type FeatureFlags = typeof APP_CONFIG.features;