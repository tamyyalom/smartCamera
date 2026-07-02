import {validateAIResponse} from '@/services/ai/responseValidator';
import {validAIResponse} from '../../../helpers/fixtures';

describe('responseValidator', () => {
  it('accepts a valid AI response', () => {
    const result = validateAIResponse(validAIResponse());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.value?.apply).toBe(true);
  });

  it('rejects non-object input', () => {
    const result = validateAIResponse(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/not an object/i);
  });

  it('rejects out-of-range pan_delta', () => {
    const result = validateAIResponse(validAIResponse({pan_delta: 50}));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('pan_delta out of range');
  });

  it('rejects invalid speed_profile', () => {
    const result = validateAIResponse(
      validAIResponse({speed_profile: 'turbo' as never}),
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('invalid speed_profile');
  });

  it('rejects guidance_text longer than 120 chars', () => {
    const result = validateAIResponse(
      validAIResponse({guidance_text: 'א'.repeat(121)}),
    );
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('invalid guidance_text');
  });

  it('rejects invalid status_flags', () => {
    const result = validateAIResponse(
      validAIResponse({status_flags: ['unknown_flag' as never]}),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid status_flag'))).toBe(
      true,
    );
  });

  it('accepts valid status_flags', () => {
    const result = validateAIResponse(
      validAIResponse({status_flags: ['ready', 'hold_position']}),
    );
    expect(result.valid).toBe(true);
  });
});
