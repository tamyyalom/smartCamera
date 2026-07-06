import {useCallback, useEffect, useRef, useState} from 'react';
import {
  shouldSpeakGuidance,
  speakGuidance,
  stopGuidanceSpeech,
} from '../services/speech';

interface UseGuidanceSpeechOptions {
  guidanceText: string | null;
  enabled: boolean;
}

export function useGuidanceSpeech({
  guidanceText,
  enabled,
}: UseGuidanceSpeechOptions) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const lastSpokenTextRef = useRef<string | null>(null);
  const lastSpokenAtRef = useRef(0);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(current => !current);
  }, []);

  useEffect(() => {
    if (!enabled || !voiceEnabled || !guidanceText) {
      return;
    }

    const nowMs = Date.now();
    if (
      !shouldSpeakGuidance(
        guidanceText,
        lastSpokenTextRef.current,
        lastSpokenAtRef.current,
        nowMs,
      )
    ) {
      return;
    }

    lastSpokenTextRef.current = guidanceText.trim();
    lastSpokenAtRef.current = nowMs;
    speakGuidance(guidanceText).catch(() => {});
  }, [enabled, guidanceText, voiceEnabled]);

  useEffect(() => {
    if (!enabled) {
      stopGuidanceSpeech().catch(() => {});
      lastSpokenTextRef.current = null;
      lastSpokenAtRef.current = 0;
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      stopGuidanceSpeech().catch(() => {});
    };
  }, []);

  return {
    voiceEnabled,
    toggleVoice,
  };
}
