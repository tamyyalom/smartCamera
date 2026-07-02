import {translateAIResponse} from '@/services/ai/commandTranslator';
import {testSceneProfile, validAIResponse} from '../../../helpers/fixtures';

describe('commandTranslator', () => {
  it('returns guidance only when apply is false', () => {
    const result = translateAIResponse(
      validAIResponse({apply: false, guidance_text: 'המתיני'}),
      testSceneProfile,
    );
    expect(result.apply).toBe(false);
    expect(result.move).toBeUndefined();
    expect(result.guidanceText).toBe('המתיני');
  });

  it('translates move command when apply is true', () => {
    const response = validAIResponse({
      pan_delta: 3,
      tilt_delta: -2,
      height_delta: 1,
      speed_profile: 'slow',
    });
    const result = translateAIResponse(response, testSceneProfile);
    expect(result.apply).toBe(true);
    expect(result.move).toEqual({
      pan_delta: 3,
      tilt_delta: -2,
      height_delta: 1,
      speed_profile: 'slow',
    });
  });

  it('clamps zoom to scene range', () => {
    const below = translateAIResponse(
      validAIResponse({zoom_target: 0.5}),
      testSceneProfile,
    );
    expect(below.zoomTarget).toBe(testSceneProfile.framing.zoom_range[0]);

    const above = translateAIResponse(
      validAIResponse({zoom_target: 10}),
      testSceneProfile,
    );
    expect(above.zoomTarget).toBe(testSceneProfile.framing.zoom_range[1]);
  });
});
