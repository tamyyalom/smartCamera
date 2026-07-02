import {AI_GATE_CONFIG} from '../../config/ai';
import {AXIS_LIMITS, MAX_DELTA} from '../tripod/tripodSafety';
import type {
  AIRequestPayload,
  CameraState,
  FrameMeta,
  TrackingState,
  TripodState,
} from '../../types/ai';
import type {SceneProfile} from '../../types/scene';

export function sceneUsesFaceGuide(scene: SceneProfile | undefined): boolean {
  if (!scene) {
    return false;
  }

  return scene.ai_priority.some(
    tag =>
      tag.includes('face') ||
      tag.includes('eye') ||
      tag.includes('portrait') ||
      tag.includes('subject') ||
      tag.includes('headroom'),
  );
}

export function buildAIRequestPayload(input: {
  sceneId: string;
  sceneProfile: SceneProfile;
  tripod: TripodState;
  camera: CameraState;
  tracking?: TrackingState;
  frameMeta: FrameMeta;
}): AIRequestPayload {
  return {
    scene_id: input.sceneId,
    scene_profile: {
      id: input.sceneProfile.id,
      type: input.sceneProfile.type,
      name_he: input.sceneProfile.name_he,
      framing: input.sceneProfile.framing,
      guidance_hints: input.sceneProfile.guidance_hints,
      ai_priority: input.sceneProfile.ai_priority,
    },
    state: {
      tripod: {
        pan: input.tripod.pan,
        tilt: input.tripod.tilt,
        height: input.tripod.height,
        last_command_ms: input.tripod.last_command_ms,
        connected: input.tripod.connected,
      },
      camera: input.camera,
      tracking: input.tracking,
      timestamp_ms: Date.now(),
    },
    limits: {
      tripod: AXIS_LIMITS,
      max_delta: MAX_DELTA,
      gate: AI_GATE_CONFIG,
      zoom_range: input.sceneProfile.framing.zoom_range,
    },
    frame_meta: input.frameMeta,
  };
}
