import type {AIRequestPayload, AIResponse} from '../../types/ai';
import type {SceneProfile} from '../../types/scene';

function sceneFromPayload(payload: AIRequestPayload): SceneProfile | undefined {
  const profile = payload.scene_profile as Partial<SceneProfile>;
  if (!profile?.framing?.zoom_range) {
    return undefined;
  }
  return profile as SceneProfile;
}

export async function requestMockAI(
  payload: AIRequestPayload,
): Promise<AIResponse> {
  const tracking = payload.state.tracking;
  const camera = payload.state.camera;
  const scene = sceneFromPayload(payload);
  const [zoomMin, zoomMax] = scene?.framing.zoom_range ?? [1, 3];
  const preferredZoom = zoomMin + (zoomMax - zoomMin) * 0.35;

  if (!tracking || tracking.faceCount === 0) {
    return {
      apply: false,
      pan_delta: 0,
      tilt_delta: 0,
      height_delta: 0,
      zoom_target: camera.zoom,
      speed_profile: 'slow',
      guidance_text: 'התקרבי למצלמה — לא זוהה פנים בפריים',
      confidence: 0.72,
      reason: 'no_face_detected',
      status_flags: ['no_face'],
    };
  }

  if (tracking.faceCount > 1) {
    return {
      apply: false,
      pan_delta: 0,
      tilt_delta: 0,
      height_delta: 0,
      zoom_target: camera.zoom,
      speed_profile: 'slow',
      guidance_text: 'וודאי שרק אדם אחד בפריים',
      confidence: 0.68,
      reason: 'multiple_faces',
      status_flags: ['multiple_faces'],
    };
  }

  if (tracking.guideStatus === 'misaligned') {
    const box = tracking.faceBox;
    const panDelta = box ? (0.5 - (box.x + box.width / 2)) * 12 : 0;
    const tiltDelta = box ? (0.45 - (box.y + box.height / 2)) * 8 : 0;

    return {
      apply: payload.state.tripod.connected,
      pan_delta: Math.max(-8, Math.min(8, panDelta)),
      tilt_delta: Math.max(-6, Math.min(6, tiltDelta)),
      height_delta: 0,
      zoom_target: camera.zoom,
      speed_profile: 'slow',
      guidance_text: 'הזזי מעט למרכז הפריים',
      confidence: 0.78,
      reason: 'face_misaligned',
      status_flags: ['subject_out_of_frame'],
    };
  }

  if (camera.zoom < preferredZoom - 0.15) {
    return {
      apply: true,
      pan_delta: 0,
      tilt_delta: 0,
      height_delta: 0,
      zoom_target: Math.min(zoomMax, preferredZoom),
      speed_profile: 'slow',
      guidance_text: 'התקרבי מעט — מומלץ זום קל לסצנה',
      confidence: 0.81,
      reason: 'zoom_below_scene_target',
      status_flags: ['ready'],
    };
  }

  return {
    apply: false,
    pan_delta: 0,
    tilt_delta: 0,
    height_delta: 0,
    zoom_target: camera.zoom,
    speed_profile: 'slow',
    guidance_text: 'מצוין — החזיקי את המיקום',
    confidence: 0.9,
    reason: 'composition_ready',
    status_flags: ['hold_position', 'ready'],
  };
}
