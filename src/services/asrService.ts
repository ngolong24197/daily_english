/**
 * ASR Service — Device-native speech recognition via expo-speech-recognition.
 *
 * - Uses the device's built-in speech recognition (Android: Google, iOS: Apple)
 * - No API key required — everything runs on-device
 * - Supports vocabulary hints on Android (hints parameter)
 * - Falls back to text input if speech recognition is unavailable
 * - Handles errors gracefully with warm, encouraging messages
 * - Event-based: results stream in real-time, final result triggers processing
 */

import {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from 'expo-speech-recognition';

export interface AsrResult {
  text: string;
  confidence: number;
  model: string;
  attempts: number;
}

export interface AsrError {
  type: 'network' | 'unrecognized' | 'timeout' | 'permission' | 'unknown';
  message: string;
  retryable: boolean;
}

type AsrOutcome =
  | { ok: true; result: AsrResult }
  | { ok: false; error: AsrError };

/**
 * Check if device-native speech recognition is available.
 */
export async function isSpeechRecognitionAvailable(): Promise<boolean> {
  try {
    return await SpeechRecognition.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Request speech recognition permissions.
 * Returns true if granted, false otherwise.
 */
export async function requestSpeechPermissions(): Promise<boolean> {
  try {
    const { status } = await SpeechRecognition.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/**
 * Check current speech recognition permission status.
 */
export async function checkSpeechPermissions(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const { status } = await SpeechRecognition.getPermissionsAsync();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/**
 * Start listening for speech using device-native recognition.
 *
 * This is an event-based API — call startListening() to begin, then
 * subscribe to results via onResult callback. Call stopListening() when done.
 *
 * @param options - Configuration for the recognition session
 * @returns A controller object to manage the recognition session
 */
export function startListening(options: {
  /** Vocabulary hints to improve recognition (Android supports 'hints') */
  vocabulary?: string[];
  /** Called when a final (non-interim) result is available */
  onResult: (text: string) => void;
  /** Called with interim results for live feedback */
  onInterimResult?: (text: string) => void;
  /** Called when an error occurs */
  onError?: (error: AsrError) => void;
  /** Called when recognition starts successfully */
  onStart?: () => void;
  /** Called when recognition ends (natural or manual stop) */
  onEnd?: () => void;
}): {
  /** Stop the current recognition session */
  stop: () => void;
  /** Abort the current recognition session immediately */
  abort: () => void;
} {
  let resultSubscription: { remove: () => void } | null = null;
  let errorSubscription: { remove: () => void} | null = null;
  let startSubscription: { remove: () => void } | null = null;
  let endSubscription: { remove: () => void } | null = null;

  // Subscribe to events before starting
  resultSubscription = SpeechRecognition.addListener(
    'result',
    (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.transcript?.trim() ?? '';
      if (!transcript) return;

      const isFinal = event.isFinal;
      if (isFinal) {
        options.onResult(transcript);
      } else {
        options.onInterimResult?.(transcript);
      }
    }
  );

  errorSubscription = SpeechRecognition.addListener(
    'error',
    (event: SpeechRecognitionErrorEvent) => {
      const asrError = classifySpeechError(event.error);
      options.onError?.(asrError);
    }
  );

  startSubscription = SpeechRecognition.addListener('start', () => {
    options.onStart?.();
  });

  endSubscription = SpeechRecognition.addListener('end', () => {
    cleanup();
    options.onEnd?.();
  });

  // Start recognition
  const startOptions: Record<string, unknown> = {
    lang: 'en',
    interimResults: true,
    continuous: false,
  };

  // Android supports vocabulary hints to improve recognition
  if (options.vocabulary && options.vocabulary.length > 0 && Platform.OS === 'android') {
    startOptions.hints = options.vocabulary;
  }

  SpeechRecognition.start(startOptions as any).catch((err: unknown) => {
    const asrError: AsrError = {
      type: 'unknown',
      message: 'Could not start speech recognition. You can type your response instead.',
      retryable: true,
    };
    options.onError?.(asrError);
    cleanup();
  });

  function cleanup() {
    resultSubscription?.remove();
    errorSubscription?.remove();
    startSubscription?.remove();
    endSubscription?.remove();
    resultSubscription = null;
    errorSubscription = null;
    startSubscription = null;
    endSubscription = null;
  }

  return {
    stop: () => {
      try {
        SpeechRecognition.stop();
      } catch {
        // Already stopped
      }
      cleanup();
    },
    abort: () => {
      try {
        SpeechRecognition.abort();
      } catch {
        // Already stopped
      }
      cleanup();
    },
  };
}

// We need Platform import for Android hint check
import { Platform } from 'react-native';

/**
 * Classify a speech recognition error into our AsrError type.
 */
function classifySpeechError(errorCode: string): AsrError {
  switch (errorCode) {
    case 'not-allowed':
    case 'service-not-allowed':
      return {
        type: 'permission',
        message: 'Looks like something\'s up with your microphone. You can type your response instead.',
        retryable: false,
      };
    case 'no-speech':
      return {
        type: 'unrecognized',
        message: 'I didn\'t quite catch that -- could you try again?',
        retryable: true,
      };
    case 'audio-capture':
      return {
        type: 'permission',
        message: 'Looks like something\'s up with your microphone. You can type your response instead.',
        retryable: false,
      };
    case 'network':
      return {
        type: 'network',
        message: 'I can\'t hear you right now -- let\'s use text for this one.',
        retryable: true,
      };
    case 'aborted':
      return {
        type: 'timeout',
        message: 'I can\'t hear you right now -- let\'s use text for this one.',
        retryable: true,
      };
    case 'service-not-available':
      return {
        type: 'unknown',
        message: 'Speech recognition isn\'t available right now. You can type your response instead.',
        retryable: true,
      };
    default:
      return {
        type: 'unknown',
        message: 'Let\'s try that again.',
        retryable: true,
      };
  }
}

/**
 * Compatibility wrapper: transcribe audio using device speech recognition.
 *
 * This provides the same interface as the old Whisper-based ASR for
 * backward compatibility with code that expects a request-response pattern.
 * Internally, it uses expo-speech-recognition's event-based API.
 *
 * @param _audioUri  - Ignored (kept for interface compatibility; no audio file needed)
 * @param vocabulary - Today's target words for hints
 * @param _attempt   - Ignored (kept for interface compatibility; no fallback model)
 */
export async function transcribeAudio(
  _audioUri: string,
  vocabulary: string[],
  _attempt: number = 1
): Promise<AsrOutcome> {
  const available = await isSpeechRecognitionAvailable();

  if (!available) {
    return {
      ok: false,
      error: {
        type: 'unknown',
        message: 'Speech recognition is not available on this device. You can type your response instead.',
        retryable: false,
      },
    };
  }

  const hasPermission = await requestSpeechPermissions();
  if (!hasPermission) {
    return {
      ok: false,
      error: {
        type: 'permission',
        message: 'Looks like something\'s up with your microphone. You can type your response instead.',
        retryable: false,
      },
    };
  }

  return new Promise<AsrOutcome>((resolve) => {
    let resolved = false;

    const controller = startListening({
      vocabulary,
      onResult: (text) => {
        if (resolved) return;
        resolved = true;
        controller.stop();

        const confidence = estimateConfidence(text);
        resolve({
          ok: true,
          result: {
            text,
            confidence,
            model: 'device-native',
            attempts: 1,
          },
        });
      },
      onError: (error) => {
        if (resolved) return;
        resolved = true;
        resolve({ ok: false, error });
      },
      onEnd: () => {
        if (resolved) return;
        resolved = true;
        resolve({
          ok: false,
          error: {
            type: 'unrecognized',
            message: 'I didn\'t quite catch that -- could you try again?',
            retryable: true,
          },
        });
      },
    });

    // Safety timeout: if no result after 15 seconds, stop and return error
    setTimeout(() => {
      if (resolved) return;
      resolved = true;
      controller.stop();
      resolve({
        ok: false,
        error: {
          type: 'timeout',
          message: 'I can\'t hear you right now -- let\'s use text for this one.',
          retryable: true,
        },
      });
    }, 15000);
  });
}

/**
 * Transcribe with automatic fallback logic.
 * With device-native speech recognition, there is no second model to fall back to.
 * This function exists for interface compatibility and simply calls transcribeAudio once.
 */
export async function transcribeWithFallback(
  audioUri: string,
  vocabulary: string[]
): Promise<AsrOutcome> {
  return transcribeAudio(audioUri, vocabulary, 1);
}

/**
 * Estimate transcription confidence based on output characteristics.
 * Device-native recognition doesn't always return confidence, so we use heuristics.
 */
function estimateConfidence(transcript: string): number {
  if (!transcript) return 0;

  const wordCount = transcript.split(/\s+/).length;
  let baseConfidence = 0.5;

  if (wordCount >= 3) baseConfidence = 0.6;
  if (wordCount >= 5) baseConfidence = 0.7;
  if (wordCount >= 8) baseConfidence = 0.8;

  // Very short transcripts might be unreliable
  if (wordCount === 1) baseConfidence = 0.4;
  if (wordCount > 50) baseConfidence -= 0.1;

  // Check for common hallucination patterns
  const lowerText = transcript.toLowerCase();
  const hallucinationPatterns = [
    'thank you for watching',
    'subscribe to',
    'like and subscribe',
    'thank you for listening',
  ];
  if (hallucinationPatterns.some((p) => lowerText.includes(p))) {
    baseConfidence = 0.1;
  }

  return Math.max(0.1, Math.min(1.0, baseConfidence));
}

/**
 * Get user-friendly error message based on ASR error type.
 */
export function getAsrErrorMessage(error: AsrError): string {
  switch (error.type) {
    case 'unrecognized':
      return 'I didn\'t quite catch that -- could you try again?';
    case 'network':
      return 'I can\'t hear you right now -- let\'s use text for this one.';
    case 'timeout':
      return 'I can\'t hear you right now -- let\'s use text for this one.';
    case 'permission':
      return 'Looks like something\'s up with your microphone. You can type your response instead.';
    case 'unknown':
    default:
      return 'Let\'s try that again.';
  }
}