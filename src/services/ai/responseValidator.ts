import type {AIResponse, StatusFlag} from '../../types/ai';
import type {SpeedProfile} from '../../types/scene';

const SPEED_PROFILES: SpeedProfile[] = [
  'slow',
  'medium',
  'fast',
  'documentary',
];

const STATUS_FLAGS: StatusFlag[] = [
  'no_face',
  'multiple_faces',
  'subject_out_of_frame',
  'low_light',
  'high_motion',
  'ready',
  'hold_position',
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  value?: AIResponse;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function validateAIResponse(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return {valid: false, errors: ['Response is not an object']};
  }

  const data = input as Record<string, unknown>;

  if (typeof data.apply !== 'boolean') {
    errors.push('apply must be boolean');
  }
  if (!isNumber(data.pan_delta) || data.pan_delta < -45 || data.pan_delta > 45) {
    errors.push('pan_delta out of range');
  }
  if (!isNumber(data.tilt_delta) || data.tilt_delta < -30 || data.tilt_delta > 30) {
    errors.push('tilt_delta out of range');
  }
  if (
    !isNumber(data.height_delta) ||
    data.height_delta < -20 ||
    data.height_delta > 20
  ) {
    errors.push('height_delta out of range');
  }
  if (
    !isNumber(data.zoom_target) ||
    data.zoom_target < 1 ||
    data.zoom_target > 10
  ) {
    errors.push('zoom_target out of range');
  }
  if (!isString(data.speed_profile) || !SPEED_PROFILES.includes(data.speed_profile as SpeedProfile)) {
    errors.push('invalid speed_profile');
  }
  if (!isString(data.guidance_text) || data.guidance_text.length > 120) {
    errors.push('invalid guidance_text');
  }
  if (!isNumber(data.confidence) || data.confidence < 0 || data.confidence > 1) {
    errors.push('confidence out of range');
  }
  if (!isString(data.reason) || data.reason.length > 200) {
    errors.push('invalid reason');
  }

  if (Array.isArray(data.status_flags)) {
    for (const flag of data.status_flags) {
      if (!STATUS_FLAGS.includes(flag as StatusFlag)) {
        errors.push(`invalid status_flag: ${String(flag)}`);
      }
    }
  }

  if (errors.length > 0) {
    return {valid: false, errors};
  }

  return {valid: true, errors: [], value: data as unknown as AIResponse};
}
