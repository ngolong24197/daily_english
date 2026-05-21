/**
 * Audio Recording Hook — manages speech recognition, mic permission, recording lifecycle, and VAD.
 *
 * - Uses expo-speech-recognition for live transcription (device-native STT)
 * - Uses expo-av recording only for audio level monitoring (VAD visual feedback)
 * - No audio files are sent to any API — transcription happens on-device
 * - Handles permission denial gracefully with text-input fallback
 * - Integrates VAD for automatic silence detection
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { ExpoSpeechRecognitionModule } from 'expo-speech-recognition';
import type { ExpoSpeechRecognitionErrorEvent, ExpoSpeechRecognitionOptions, ExpoSpeechRecognitionResultEvent } from 'expo-speech-recognition';
import {
  createVad,
  normalizeAudioLevel,
  type VadCallbacks,
  type VadController,
} from '../services/vadService';

export type MicPermissionStatus = 'undetermined' | 'granted' | 'denied';

export type RecordingState =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'processing'
  | 'error';

export interface AudioRecordingError {
  type: 'permission' | 'hardware' | 'network' | 'unknown';
  message: string;
}

interface UseAudioRecordingOptions {
  /** Called when VAD detects silence after speech (auto-stop) */
  onAutoStop?: () => void;
  /** Called with normalized audio level (0-1) for visual feedback */
  onAudioLevel?: (level: number) => void;
  /** Called when speech is detected */
  onSpeechStart?: () => void;
  /** Called with interim transcription results for live feedback */
  onInterimResult?: (text: string) => void;
  /** Called when a final transcription result is available */
  onTranscription?: (text: string) => void;
  /** Vocabulary words to pass to speech recognition for better recognition */
  vocabulary?: string[];
  /** Whether VAD auto-stop is enabled (default: true) */
  vadEnabled?: boolean;
}

export function useAudioRecording(options: UseAudioRecordingOptions = {}) {
  const [permissionStatus, setPermissionStatus] =
    useState<MicPermissionStatus>('undetermined');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<AudioRecordingError | null>(null);
  const [asrFailureCount, setAsrFailureCount] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const vadRef = useRef<VadController | null>(null);
  const speechRecognitionActiveRef = useRef(false);
  const vadEnabled = options.vadEnabled ?? true;

  // Initialize VAD controller
  useEffect(() => {
    const callbacks: VadCallbacks = {
      onSpeechStart: () => {
        options.onSpeechStart?.();
      },
      onSpeechEnd: () => {
        if (vadEnabled && recordingState === 'recording') {
          // Auto-stop after silence detected
          stopRecording();
          options.onAutoStop?.();
        }
      },
      onAudioLevel: (level) => {
        const normalized = normalizeAudioLevel(level);
        setAudioLevel(normalized);
        options.onAudioLevel?.(normalized);
      },
    };

    vadRef.current = createVad(callbacks);
    return () => {
      vadRef.current?.reset();
    };
  }, [vadEnabled, recordingState]);

  /**
   * Request microphone permission with contextual explanation.
   * Also checks speech recognition permission.
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setRecordingState('requesting_permission');

    try {
      // Request microphone permission (needed for audio level monitoring)
      const { status: micStatus } = await Audio.requestPermissionsAsync();

      // Request speech recognition permission
      const { status: speechStatus } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (micStatus === 'granted' && speechStatus === 'granted') {
        setPermissionStatus('granted');
        setRecordingState('idle');
        setError(null);
        return true;
      }

      setPermissionStatus('denied');
      setRecordingState('idle');
      setError({
        type: 'permission',
        message:
          'Speaking practice requires microphone access. You can type your response instead.',
      });
      return false;
    } catch (err) {
      setRecordingState('idle');
      setError({
        type: 'unknown',
        message: 'Could not request microphone permission.',
      });
      return false;
    }
  }, []);

  /**
   * Check current permission status without prompting.
   */
  const checkPermission = useCallback(async () => {
    try {
      const { status: micStatus } = await Audio.getPermissionsAsync();
      const { status: speechStatus } = await ExpoSpeechRecognitionModule.getPermissionsAsync();

      if (micStatus === 'granted' && speechStatus === 'granted') {
        setPermissionStatus('granted');
      } else if (micStatus === 'denied' || speechStatus === 'denied') {
        setPermissionStatus('denied');
      } else {
        setPermissionStatus('undetermined');
      }
    } catch {
      setPermissionStatus('undetermined');
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  /**
   * Start recording: begins speech recognition for transcription AND
   * starts audio recording for visual feedback (audio levels for VAD).
   */
  const startRecording = useCallback(async (): Promise<boolean> => {
    // Check permission first
    if (permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    // Check speech recognition availability
    try {
      const available = await ExpoSpeechRecognitionModule.isAvailableAsync();
      if (!available) {
        setRecordingState('error');
        setError({
          type: 'hardware',
          message: 'Speech recognition is not available on this device. You can type your response instead.',
        });
        return false;
      }
    } catch {
      setRecordingState('error');
      setError({
        type: 'hardware',
        message: 'Speech recognition is not available. You can type your response instead.',
      });
      return false;
    }

    try {
      // Configure audio mode for recording (needed for VAD metering)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start audio recording for metering/VAD visual feedback only
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            vadRef.current?.processMetering({ value: status.metering });
          }
        },
        200 // Update interval in ms
      );

      recordingRef.current = recording;
      vadRef.current?.reset();
      setInterimTranscript('');
      setRecordingState('recording');
      setAudioLevel(0);
      setError(null);

      // Start speech recognition for actual transcription
      speechRecognitionActiveRef.current = true;

      const startOptions: ExpoSpeechRecognitionOptions = {
        lang: 'en',
        interimResults: true,
        continuous: false,
      };

      // Pass vocabulary hints on Android for better recognition
      if (options.vocabulary && options.vocabulary.length > 0) {
        startOptions.contextualStrings = options.vocabulary;
      }

      // Set up event listeners
      ExpoSpeechRecognitionModule.addListener('result', (event: ExpoSpeechRecognitionResultEvent) => {
        const transcript = event.results[0]?.transcript?.trim() ?? '';
        if (!transcript) return;

        if (event.isFinal) {
          // Final result — pass to caller
          options.onTranscription?.(transcript);
          setInterimTranscript('');
        } else {
          // Interim result — show live feedback
          setInterimTranscript(transcript);
          options.onInterimResult?.(transcript);
        }
      });

      ExpoSpeechRecognitionModule.addListener('error', (event: ExpoSpeechRecognitionErrorEvent) => {
        speechRecognitionActiveRef.current = false;
        const shouldFallback = recordAsrFailure();
        if (shouldFallback) {
          setShowTextInput(true);
        }
      });

      ExpoSpeechRecognitionModule.addListener('end', () => {
        speechRecognitionActiveRef.current = false;
        // Clean up speech recognition listeners
        ExpoSpeechRecognitionModule.removeAllListeners('result');
        ExpoSpeechRecognitionModule.removeAllListeners('error');
        ExpoSpeechRecognitionModule.removeAllListeners('end');
        ExpoSpeechRecognitionModule.removeAllListeners('start');
      });

      await ExpoSpeechRecognitionModule.start(startOptions);

      // Haptic feedback on start
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      return true;
    } catch (err) {
      setRecordingState('error');
      setError({
        type: 'hardware',
        message:
          "Looks like something's up with your microphone. You can type your response instead.",
      });
      return false;
    }
  }, [permissionStatus, requestPermission, options.vocabulary]);

  /**
   * Stop recording: stops both speech recognition and audio recording.
   * Returns the last known interim transcript (for compatibility).
   */
  const stopRecording = useCallback(async (): Promise<string | null> => {
    const recording = recordingRef.current;
    const wasRecognizing = speechRecognitionActiveRef.current;

    try {
      setRecordingState('processing');
      vadRef.current?.manualStop();

      // Stop speech recognition
      if (wasRecognizing) {
        try {
          await ExpoSpeechRecognitionModule.stop();
        } catch {
          // Already stopped
        }
        speechRecognitionActiveRef.current = false;
      }

      // Stop audio recording
      if (recording) {
        await recording.stopAndUnloadAsync();
        recordingRef.current = null;

        // Reset audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
      }

      // Haptic feedback on stop
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // Return the interim transcript if available (for callers that expect a URI-like return)
      return interimTranscript || null;
    } catch (err) {
      setRecordingState('error');
      setError({
        type: 'hardware',
        message: 'Could not process recording. Please try again.',
      });
      recordingRef.current = null;
      return null;
    }
  }, [interimTranscript]);

  /**
   * Reset to idle state after an error.
   */
  const resetError = useCallback(() => {
    setError(null);
    setRecordingState('idle');
  }, []);

  /**
   * Record an ASR failure and check if we should switch to text input.
   * Returns true if text-input fallback should be shown.
   */
  const recordAsrFailure = useCallback(() => {
    const newCount = asrFailureCount + 1;
    setAsrFailureCount(newCount);

    // After 2 consecutive ASR failures, offer text-input
    if (newCount >= 2) {
      setShowTextInput(true);
    }

    // After 3 consecutive failures, auto-switch to text mode
    if (newCount >= 3) {
      setShowTextInput(true);
      return true;
    }

    return newCount >= 2;
  }, [asrFailureCount]);

  /**
   * Reset the ASR failure count (e.g., after a successful transcription).
   */
  const resetAsrFailures = useCallback(() => {
    setAsrFailureCount(0);
  }, []);

  /**
   * Manually enable text input fallback.
   */
  const enableTextInput = useCallback(() => {
    setShowTextInput(true);
  }, []);

  /**
   * Try switching back to speech mode (e.g., after fixing mic issues).
   */
  const trySpeechMode = useCallback(() => {
    setShowTextInput(false);
    setAsrFailureCount(0);
  }, []);

  return {
    // State
    permissionStatus,
    recordingState,
    audioLevel,
    error,
    asrFailureCount,
    showTextInput,
    interimTranscript,

    // Actions
    requestPermission,
    checkPermission,
    startRecording,
    stopRecording,
    resetError,
    recordAsrFailure,
    resetAsrFailures,
    enableTextInput,
    trySpeechMode,
  };
}