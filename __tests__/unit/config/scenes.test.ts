import {
  EXPECTED_SCENE_COUNTS,
  getSceneCounts,
  getSceneProfile,
  getScenesForMode,
  getStillScenes,
  getVideoScenes,
  SCENE_INDEX,
} from '@/config/scenes';

describe('scenes config', () => {
  it('indexes 9 video and 9 still scenes', () => {
    expect(SCENE_INDEX.video_scenes).toHaveLength(EXPECTED_SCENE_COUNTS.video);
    expect(SCENE_INDEX.still_scenes).toHaveLength(EXPECTED_SCENE_COUNTS.still);
  });

  it('returns scene counts matching expected', () => {
    expect(getSceneCounts()).toEqual(EXPECTED_SCENE_COUNTS);
  });

  it('loads all video scene profiles', () => {
    const scenes = getVideoScenes();
    expect(scenes).toHaveLength(9);
    scenes.forEach(scene => {
      expect(scene.type).toBe('video');
      expect(scene.name_he).toBeTruthy();
      expect(scene.framing.zoom_range[0]).toBeLessThanOrEqual(
        scene.framing.zoom_range[1],
      );
    });
  });

  it('loads all still scene profiles', () => {
    const scenes = getStillScenes();
    expect(scenes).toHaveLength(9);
    scenes.forEach(scene => {
      expect(scene.type).toBe('still');
    });
  });

  it('getScenesForMode returns correct subset', () => {
    expect(getScenesForMode('video')).toEqual(getVideoScenes());
    expect(getScenesForMode('photo')).toEqual(getStillScenes());
  });

  it('getSceneProfile returns undefined for unknown id', () => {
    expect(getSceneProfile('nonexistent_scene')).toBeUndefined();
  });

  it('getSceneProfile returns profile for known id', () => {
    const id = SCENE_INDEX.video_scenes[0];
    const profile = getSceneProfile(id);
    expect(profile?.id).toBe(id);
  });
});
