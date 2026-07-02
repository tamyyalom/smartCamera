import {
  buildAIRequestPayload,
  sceneUsesFaceGuide,
} from '@/services/ai/stateCollector';
import {testSceneProfile} from '../../../helpers/fixtures';

describe('stateCollector', () => {
  describe('sceneUsesFaceGuide', () => {
    it('returns false for undefined scene', () => {
      expect(sceneUsesFaceGuide(undefined)).toBe(false);
    });

    it('returns true when ai_priority mentions face', () => {
      expect(sceneUsesFaceGuide(testSceneProfile)).toBe(true);
    });

    it('returns false when no face-related tags', () => {
      expect(
        sceneUsesFaceGuide({
          ...testSceneProfile,
          ai_priority: ['landscape', 'horizon'],
        }),
      ).toBe(false);
    });
  });

  describe('buildAIRequestPayload', () => {
    it('includes scene, state, limits and frame meta', () => {
      const payload = buildAIRequestPayload({
        sceneId: testSceneProfile.id,
        sceneProfile: testSceneProfile,
        tripod: {
          pan: 10,
          tilt: -5,
          height: 120,
          last_command_ms: 500,
          connected: true,
        },
        camera: {zoom: 2},
        tracking: {faceCount: 1, motionScore: 0.2, guideStatus: 'ready'},
        frameMeta: {width: 1920, height: 1080, format: 'jpeg'},
      });

      expect(payload.scene_id).toBe(testSceneProfile.id);
      expect(payload.scene_profile.id).toBe(testSceneProfile.id);
      expect(payload.state.tripod.pan).toBe(10);
      expect(payload.state.camera.zoom).toBe(2);
      expect(payload.state.tracking?.faceCount).toBe(1);
      expect(payload.limits.zoom_range).toEqual(
        testSceneProfile.framing.zoom_range,
      );
      expect(payload.frame_meta.width).toBe(1920);
    });
  });
});
