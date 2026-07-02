import {useCallback, useEffect, useRef, useState} from 'react';
import {AI_GATE_CONFIG} from '../config/ai';
import {getSceneProfile} from '../config/scenes';
import {
  buildAIRequestPayload,
  estimateMotionScore,
  getAIProvider,
  shouldCallAI,
  translateAIResponse,
  validateAIResponse,
} from '../services/ai';
import {getTripodController} from '../services/tripod';
import {useAppStore} from '../stores/useAppStore';
import type {FaceBox} from '../types/ai';

const TICK_MS = 250;

interface UseAIPipelineOptions {
  sceneId: string;
  enabled: boolean;
  onZoomChange: (zoom: number) => void;
}

export function useAIPipeline({
  sceneId,
  enabled,
  onZoomChange,
}: UseAIPipelineOptions) {
  const tripod = useAppStore(state => state.tripod);
  const camera = useAppStore(state => state.camera);
  const tracking = useAppStore(state => state.tracking);
  const updateTripodState = useAppStore(state => state.updateTripodState);

  const [guidanceText, setGuidanceText] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [lastTickMs, setLastTickMs] = useState(0);

  const lastCallMsRef = useRef(0);
  const previousFaceBoxRef = useRef<FaceBox | undefined>(undefined);
  const inFlightRef = useRef(false);

  const runPipelineTick = useCallback(async () => {
    if (inFlightRef.current) {
      return;
    }

    const scene = getSceneProfile(sceneId);
    if (!scene) {
      return;
    }

    const motionScore = estimateMotionScore(
      previousFaceBoxRef.current
        ? {
            x: previousFaceBoxRef.current.x,
            y: previousFaceBoxRef.current.y,
          }
        : undefined,
      tracking.faceBox
        ? {x: tracking.faceBox.x, y: tracking.faceBox.y}
        : undefined,
    );

    if (tracking.faceBox) {
      previousFaceBoxRef.current = tracking.faceBox;
    }

    const nowMs = Date.now();
    if (
      !shouldCallAI({
        lastCallMs: lastCallMsRef.current,
        motionScore: Math.max(motionScore, tracking.motionScore),
        nowMs,
      })
    ) {
      return;
    }

    inFlightRef.current = true;
    setIsThinking(true);
    lastCallMsRef.current = nowMs;

    try {
      const payload = buildAIRequestPayload({
        sceneId,
        sceneProfile: scene,
        tripod,
        camera,
        tracking,
        frameMeta: {
          width: 1080,
          height: 1920,
          format: 'jpeg',
        },
      });

      const raw = await getAIProvider()(payload);
      const validation = validateAIResponse(raw);
      if (!validation.valid || !validation.value) {
        return;
      }

      if (validation.value.confidence < AI_GATE_CONFIG.minConfidence) {
        setGuidanceText(validation.value.guidance_text);
        return;
      }

      const translated = translateAIResponse(validation.value, scene);
      setGuidanceText(translated.guidanceText);

      if (!translated.apply) {
        return;
      }

      if (
        translated.zoomTarget !== undefined &&
        Math.abs(translated.zoomTarget - camera.zoom) > 0.05
      ) {
        onZoomChange(translated.zoomTarget);
      }

      if (translated.move && tripod.connected) {
        const controller = getTripodController();
        if (controller.isConnected()) {
          const nextState = await controller.move(translated.move);
          updateTripodState(nextState);
        }
      }
    } finally {
      inFlightRef.current = false;
      setIsThinking(false);
      setLastTickMs(Date.now());
    }
  }, [
    camera,
    onZoomChange,
    sceneId,
    tracking,
    tripod,
    updateTripodState,
  ]);

  useEffect(() => {
    if (!enabled) {
      setGuidanceText(null);
      setIsThinking(false);
      return;
    }

    const timer = setInterval(() => {
      runPipelineTick().catch(() => {});
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [enabled, runPipelineTick]);

  return {
    guidanceText,
    isThinking,
    lastTickMs,
  };
}
