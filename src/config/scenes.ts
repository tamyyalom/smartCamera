import profilesData from '../../config/scene-profiles/profiles.json';
import indexData from '../../config/scene-profiles/index.json';
import type {SceneProfile, SceneProfilesFile} from '../types/scene';

const file = profilesData as unknown as SceneProfilesFile;

export const SCENE_INDEX = indexData;

export function getSceneProfile(id: string): SceneProfile | undefined {
  return file.profiles[id];
}

export function getVideoScenes(): SceneProfile[] {
  return SCENE_INDEX.video_scenes
    .map(id => file.profiles[id])
    .filter(Boolean);
}

export function getStillScenes(): SceneProfile[] {
  return SCENE_INDEX.still_scenes
    .map(id => file.profiles[id])
    .filter(Boolean);
}

export function getScenesForMode(mode: 'photo' | 'video'): SceneProfile[] {
  return mode === 'video' ? getVideoScenes() : getStillScenes();
}
