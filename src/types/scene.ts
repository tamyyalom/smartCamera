export type SceneType = 'video' | 'still';

export type SpeedProfile = 'slow' | 'medium' | 'fast' | 'documentary';

export interface SceneProfile {
  id: string;
  type: SceneType;
  name_he: string;
  name_en: string;
  description_he: string;
  ai_priority: string[];
  framing: {
    subject_position: string;
    headroom_ratio?: number;
    zoom_range: [number, number];
    preferred_speed: SpeedProfile;
  };
  guidance_hints: string[];
}

export interface SceneProfilesFile {
  version: string;
  profiles: Record<string, SceneProfile>;
}
