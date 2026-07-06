import {Platform} from 'react-native';
import Tts from 'react-native-tts';
import {SPEECH_CONFIG} from '../../config/speech';

let initialized = false;

export function shouldSpeakGuidance(
  text: string,
  lastSpokenText: string | null,
  lastSpokenAtMs: number,
  nowMs: number,
  minRepeatMs = SPEECH_CONFIG.minRepeatMs,
): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }

  if (
    trimmed === lastSpokenText &&
    nowMs - lastSpokenAtMs < minRepeatMs
  ) {
    return false;
  }

  return true;
}

export async function initializeGuidanceSpeech(): Promise<void> {
  if (initialized) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    Tts.getInitStatus().then(
      async () => {
        try {
          await Tts.setDefaultLanguage(SPEECH_CONFIG.language);
          await Tts.setDefaultRate(SPEECH_CONFIG.rate);
          if (Platform.OS === 'ios') {
            await Tts.setDefaultVoice(SPEECH_CONFIG.iosVoiceId);
          }
          Tts.setDucking(true);
          initialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error => {
        if (error?.code === 'no_engine') {
          Tts.requestInstallEngine();
        }
        reject(error);
      },
    );
  });
}

export async function speakGuidance(text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  await initializeGuidanceSpeech();
  await Tts.stop();
  await Tts.speak(trimmed);
}

export async function stopGuidanceSpeech(): Promise<void> {
  await Tts.stop();
}
