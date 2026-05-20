/**
 * Voice Activity Detection (VAD) Service.
 *
 * Detects when the user starts and stops speaking by monitoring audio levels.
 * - Uses expo-av recording metering to detect audio levels
 * - Detects when user starts speaking (audio level above threshold)
 * - Detects when user stops speaking (1.5 second silence threshold)
 * - Provides manual "I'm done speaking" as alternative
 */

/** Silence threshold in dB — audio below this is considered silence */
const SILENCE_THRESHOLD_DB = -50;
/** Duration of silence (ms) after speech to auto-stop recording */
const SILENCE_DURATION_MS = 1500;
/** Minimum speech duration (ms) before silence detection kicks in */
const MIN_SPEECH_DURATION_MS = 500;

export type VadState = 'silence' | 'speaking' | 'silence_after_speech';

export interface VadCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onSilenceAfterSpeech?: () => void;
  onAudioLevel?: (level: number) => void;
}

export interface VadController {
  /** Process a new metering value from the recording */
  processMetering: (metering: { value: number }) => void;
  /** Signal that recording has stopped (reset state) */
  reset: () => void;
  /** Current VAD state */
  getState: () => VadState;
  /** Override silence detection — user manually indicated they are done */
  manualStop: () => void;
}

/**
 * Create a Voice Activity Detection controller.
 *
 * @param callbacks - Callbacks for speech start/end events
 * @param options   - Optional configuration overrides
 */
export function createVad(
  callbacks: VadCallbacks = {},
  options: {
    silenceThresholdDb?: number;
    silenceDurationMs?: number;
    minSpeechDurationMs?: number;
  } = {}
): VadController {
  const silenceThreshold = options.silenceThresholdDb ?? SILENCE_THRESHOLD_DB;
  const silenceDuration = options.silenceDurationMs ?? SILENCE_DURATION_MS;
  const minSpeechDuration = options.minSpeechDurationMs ?? MIN_SPEECH_DURATION_MS;

  let state: VadState = 'silence';
  let speechStartTime: number | null = null;
  let lastSpeechTime: number | null = null;
  let silenceTimer: ReturnType<typeof setTimeout> | null = null;

  function clearSilenceTimer() {
    if (silenceTimer !== null) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }
  }

  function processMetering(metering: { value: number }): void {
    const now = Date.now();
    const level = metering.value;

    // Report audio level for visual feedback
    callbacks.onAudioLevel?.(level);

    const isSpeech = level > silenceThreshold;

    if (isSpeech) {
      clearSilenceTimer();
      lastSpeechTime = now;

      if (state === 'silence') {
        // User started speaking
        state = 'speaking';
        speechStartTime = now;
        callbacks.onSpeechStart?.();
      }
      // Already speaking — just continue
    } else {
      // Silence detected
      if (state === 'speaking') {
        // Check if user has spoken for minimum duration
        const speechDuration = speechStartTime ? now - speechStartTime : 0;
        if (speechDuration < minSpeechDuration) {
          // Too brief — don't start silence timer yet
          return;
        }

        // User was speaking, now silent — start silence timer
        state = 'silence_after_speech';
        callbacks.onSilenceAfterSpeech?.();

        clearSilenceTimer();
        silenceTimer = setTimeout(() => {
          if (state === 'silence_after_speech') {
            state = 'silence';
            speechStartTime = null;
            lastSpeechTime = null;
            callbacks.onSpeechEnd?.();
          }
        }, silenceDuration);
      } else if (state === 'silence_after_speech') {
        // Continue the silence timer — user might start speaking again
        // The timer is already running
      }
      // If state === 'silence', nothing to do
    }
  }

  function reset(): void {
    clearSilenceTimer();
    state = 'silence';
    speechStartTime = null;
    lastSpeechTime = null;
  }

  function manualStop(): void {
    clearSilenceTimer();
    if (state === 'speaking' || state === 'silence_after_speech') {
      state = 'silence';
      callbacks.onSpeechEnd?.();
    }
    speechStartTime = null;
    lastSpeechTime = null;
  }

  function getState(): VadState {
    return state;
  }

  return { processMetering, reset, getState, manualStop };
}

/**
 * Convert a raw audio metering value to a normalized 0-1 range for visual feedback.
 */
export function normalizeAudioLevel(rawValue: number): number {
  // expo-av metering values typically range from -160 to 0 dB
  // Map this to 0-1 for the waveform animation
  const min = -60;
  const max = 0;
  const clamped = Math.max(min, Math.min(max, rawValue));
  return (clamped - min) / (max - min);
}