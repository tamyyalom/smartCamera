import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert} from 'react-native';
import type {CameraPhotoOutput} from 'react-native-vision-camera';
import type {CameraVideoOutput, Recorder} from 'react-native-vision-camera';
import {saveMediaFile} from '../services/media';

export type RecordingPhase = 'idle' | 'recording' | 'paused';

function formatElapsed(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface UseVideoRecorderOptions {
  videoOutput: CameraVideoOutput;
  photoOutput: CameraPhotoOutput;
}

export function useVideoRecorder({
  videoOutput,
  photoOutput,
}: UseVideoRecorderOptions) {
  const recorderRef = useRef<Recorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase, setPhase] = useState<RecordingPhase>('idle');
  const [elapsedLabel, setElapsedLabel] = useState('0:00');
  const [isBusy, setIsBusy] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const updateElapsed = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || !recorder.isRecording) {
      return;
    }
    setElapsedLabel(formatElapsed(recorder.recordedDuration));
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(updateElapsed, 500);
  }, [clearTimer, updateElapsed]);

  useEffect(() => clearTimer, [clearTimer]);

  const resetState = useCallback(() => {
    clearTimer();
    recorderRef.current = null;
    setPhase('idle');
    setElapsedLabel('0:00');
    setIsBusy(false);
  }, [clearTimer]);

  const start = useCallback(async () => {
    if (phase !== 'idle' || recorderRef.current || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      const recorder = await videoOutput.createRecorder({});
      recorderRef.current = recorder;

      await recorder.startRecording(
        async filePath => {
          const durationMs = Math.round(
            (recorderRef.current?.recordedDuration ?? 0) * 1000,
          );
          resetState();
          try {
            await saveMediaFile({
              type: 'video',
              sourceUri: filePath,
              durationMs: durationMs > 0 ? durationMs : undefined,
            });
            Alert.alert('נשמר', 'ההקלטה נשמרה בהצלחה');
          } catch (error) {
            Alert.alert(
              'שגיאה',
              error instanceof Error ? error.message : 'שמירה נכשלה',
            );
          }
        },
        error => {
          resetState();
          Alert.alert('שגיאה', error.message);
        },
        () => {
          setPhase('paused');
          clearTimer();
        },
        () => {
          setPhase('recording');
          startTimer();
        },
      );

      setPhase('recording');
      setElapsedLabel('0:00');
      startTimer();
    } catch (error) {
      resetState();
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'הקלטה נכשלה',
      );
    } finally {
      setIsBusy(false);
    }
  }, [
    clearTimer,
    isBusy,
    phase,
    resetState,
    startTimer,
    videoOutput,
  ]);

  const stop = useCallback(async () => {
    if (!recorderRef.current || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      await recorderRef.current.stopRecording();
    } catch (error) {
      resetState();
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'עצירה נכשלה',
      );
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, resetState]);

  const pause = useCallback(async () => {
    if (!recorderRef.current || phase !== 'recording' || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      await recorderRef.current.pauseRecording();
      setPhase('paused');
      clearTimer();
    } catch (error) {
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'השהיה נכשלה',
      );
    } finally {
      setIsBusy(false);
    }
  }, [clearTimer, isBusy, phase]);

  const resume = useCallback(async () => {
    if (!recorderRef.current || phase !== 'paused' || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      await recorderRef.current.resumeRecording();
      setPhase('recording');
      startTimer();
    } catch (error) {
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'המשך נכשל',
      );
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, phase, startTimer]);

  const cancel = useCallback(async () => {
    if (!recorderRef.current || phase === 'idle' || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      await recorderRef.current.cancelRecording();
      resetState();
    } catch (error) {
      resetState();
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'ביטול נכשל',
      );
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, phase, resetState]);

  const takeSnapshot = useCallback(async () => {
    if (phase === 'idle' || isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      await saveMediaFile({
        type: 'photo',
        sourceUri: photoFile.filePath,
      });
      Alert.alert('נשמר', 'תמונת רגע נשמרה');
    } catch (error) {
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'צילום נכשל',
      );
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, phase, photoOutput]);

  const isActive = phase === 'recording' || phase === 'paused';

  return {
    phase,
    isActive,
    isBusy,
    elapsedLabel,
    start,
    stop,
    pause,
    resume,
    cancel,
    takeSnapshot,
  };
}
