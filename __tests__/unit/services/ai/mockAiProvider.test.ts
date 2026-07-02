import {getScenesForMode} from '@/config/scenes';
import {buildAIRequestPayload} from '@/services/ai';
import {requestMockAI} from '@/services/ai/mockAiProvider';

const portraitScene = getScenesForMode('photo').find(
  scene => scene.id === 'still_portrait',
)!;

function basePayload(tracking?: Parameters<typeof buildAIRequestPayload>[0]['tracking']) {
  return buildAIRequestPayload({
    sceneId: portraitScene.id,
    sceneProfile: portraitScene,
    tripod: {
      pan: 0,
      tilt: 0,
      height: 120,
      last_command_ms: 0,
      connected: true,
    },
    camera: {zoom: 1},
    tracking,
    frameMeta: {width: 1080, height: 1920, format: 'jpeg'},
  });
}

describe('requestMockAI', () => {
  it('returns no-face guidance when tracking is empty', async () => {
    const response = await requestMockAI(
      basePayload({faceCount: 0, motionScore: 0, guideStatus: 'idle'}),
    );

    expect(response.apply).toBe(false);
    expect(response.guidance_text).toContain('לא זוהה פנים');
    expect(response.status_flags).toContain('no_face');
  });

  it('suggests centering when face is misaligned', async () => {
    const response = await requestMockAI(
      basePayload({
        faceCount: 1,
        motionScore: 0.4,
        guideStatus: 'misaligned',
        faceBox: {x: 0.1, y: 0.1, width: 0.2, height: 0.2},
      }),
    );

    expect(response.apply).toBe(true);
    expect(response.guidance_text).toContain('מרכז');
    expect(response.pan_delta).not.toBe(0);
  });

  it('recommends zoom when below scene target', async () => {
    const response = await requestMockAI(
      basePayload({
        faceCount: 1,
        motionScore: 0,
        guideStatus: 'ready',
        faceBox: {x: 0.4, y: 0.35, width: 0.2, height: 0.25},
      }),
    );

    expect(response.apply).toBe(true);
    expect(response.zoom_target).toBeGreaterThan(1);
    expect(response.guidance_text).toContain('זום');
  });
});
