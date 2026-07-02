import type {AIResponse} from '@/types/ai';
import type {SceneProfile} from '@/types/scene';

export const testSceneProfile: SceneProfile = {
  id: 'test_portrait',
  type: 'video',
  name_he: 'פורטרט בדיקה',
  name_en: 'Test Portrait',
  description_he: 'סצנת בדיקה',
  ai_priority: ['face_center', 'headroom'],
  framing: {
    subject_position: 'center',
    headroom_ratio: 0.15,
    zoom_range: [1, 4],
    preferred_speed: 'medium',
  },
  guidance_hints: ['התמקדי בפנים'],
};

export function validAIResponse(
  overrides: Partial<AIResponse> = {},
): AIResponse {
  return {
    apply: true,
    pan_delta: 5,
    tilt_delta: 2,
    height_delta: 1,
    zoom_target: 2,
    speed_profile: 'medium',
    guidance_text: 'יישרי את הפנים למרכז',
    confidence: 0.8,
    reason: 'face slightly off-center',
    ...overrides,
  };
}
