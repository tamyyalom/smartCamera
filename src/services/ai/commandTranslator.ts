import type {AIResponse} from '../../types/ai';
import type {SceneProfile} from '../../types/scene';
import type {MoveCommand} from '../tripod/types';

export interface TranslatedCommand {
  apply: boolean;
  move?: MoveCommand;
  zoomTarget?: number;
  guidanceText: string;
  confidence: number;
}

function clampZoom(value: number, scene: SceneProfile): number {
  const [min, max] = scene.framing.zoom_range;
  return Math.min(max, Math.max(min, value));
}

export function translateAIResponse(
  response: AIResponse,
  scene: SceneProfile,
): TranslatedCommand {
  if (!response.apply) {
    return {
      apply: false,
      guidanceText: response.guidance_text,
      confidence: response.confidence,
    };
  }

  const move: MoveCommand = {
    pan_delta: response.pan_delta,
    tilt_delta: response.tilt_delta,
    height_delta: response.height_delta,
    speed_profile: response.speed_profile,
  };

  return {
    apply: true,
    move,
    zoomTarget: clampZoom(response.zoom_target, scene),
    guidanceText: response.guidance_text,
    confidence: response.confidence,
  };
}
