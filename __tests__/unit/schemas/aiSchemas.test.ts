import Ajv from 'ajv';
import {buildAIRequestPayload} from '@/services/ai/stateCollector';
import {validateAIResponse} from '@/services/ai/responseValidator';
import requestSchema from '../../../schemas/ai-request-payload.schema.json';
import responseSchema from '../../../schemas/ai-response.schema.json';
import {testSceneProfile, validAIResponse} from '../../helpers/fixtures';

const ajv = new Ajv({allErrors: true, strict: false});
const validateRequestSchema = ajv.compile(requestSchema);
const validateResponseSchema = ajv.compile(responseSchema);

describe('AI JSON schemas', () => {
  describe('ai-response.schema.json', () => {
    it('accepts the canonical valid response fixture', () => {
      const payload = validAIResponse();
      expect(validateResponseSchema(payload)).toBe(true);
      expect(validateAIResponse(payload).valid).toBe(true);
    });

    it('rejects missing required fields', () => {
      const invalid = {apply: true};
      expect(validateResponseSchema(invalid)).toBe(false);
      expect(validateAIResponse(invalid).valid).toBe(false);
    });

    it('rejects out-of-range zoom_target', () => {
      const invalid = validAIResponse({zoom_target: 12});
      expect(validateResponseSchema(invalid)).toBe(false);
      expect(validateAIResponse(invalid).valid).toBe(false);
    });

    it('accepts optional status_flags', () => {
      const payload = validAIResponse({
        status_flags: ['ready', 'hold_position'],
      });
      expect(validateResponseSchema(payload)).toBe(true);
    });
  });

  describe('ai-request-payload.schema.json', () => {
    it('accepts payload built by stateCollector', () => {
      const payload = buildAIRequestPayload({
        sceneId: testSceneProfile.id,
        sceneProfile: testSceneProfile,
        tripod: {
          pan: 5,
          tilt: -2,
          height: 118,
          last_command_ms: 1000,
          connected: true,
        },
        camera: {zoom: 2, exposure: 0.3},
        tracking: {faceCount: 1, motionScore: 0.2, guideStatus: 'ready'},
        frameMeta: {width: 1920, height: 1080, format: 'jpeg'},
      });

      expect(validateRequestSchema(payload)).toBe(true);
      expect(payload.scene_id).toBe(testSceneProfile.id);
    });

    it('rejects payload without frame_meta', () => {
      const invalid = {
        scene_id: 'x',
        scene_profile: {},
        state: {
          tripod: {pan: 0, tilt: 0, height: 120, last_command_ms: 0},
          camera: {zoom: 1},
          timestamp_ms: Date.now(),
        },
        limits: {},
      };
      expect(validateRequestSchema(invalid)).toBe(false);
    });
  });
});
