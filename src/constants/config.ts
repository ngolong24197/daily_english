export const LIMITS = {
  freeWordCountMin: 3,
  freeWordCountMax: 7,
  premiumWordCountMin: 3,
  premiumWordCountDefault: 5,
  freeHistorySessions: 30,
  hintAutoAppearSeconds: 8,
  hintLevel2Seconds: 5,
  vadSilenceSeconds: 1.5,
  maxAsrRetries: 3,
  sessionCloseAdDelayMs: 3000,
  reviewWordDefaultMax: 2,
  offlineCacheDays: 3,
} as const;

export const API = {
  basePath: '/api/v1',
  endpoints: {
    dailySession: '/daily-session',
    dailySessionStart: '/daily-session/start',
    dailySessionEnd: '/daily-session/end',
    conversationHistory: '/conversation-history',
    conversationTurn: '/conversation/turn',
    conversationHint: '/conversation/hint',
    speechTranscribe: '/speech/transcribe',
    speechEvaluate: '/speech/evaluate',
    wordsProgress: '/words/progress',
    wordModeDetail: (wordId: string, mode: string) => `/words/${wordId}/modes/${mode}`,
    userMode: '/user/mode',
    userDailyWordCount: '/user/daily-word-count',
    tracks: '/tracks',
    trackSubscribe: (code: string) => `/tracks/${code}/subscribe`,
  },
} as const;