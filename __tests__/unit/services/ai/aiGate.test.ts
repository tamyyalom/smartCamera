import {AI_GATE_CONFIG} from '@/config/ai';
import {
  estimateMotionScore,
  shouldCallAI,
} from '@/services/ai/aiGate';

describe('aiGate', () => {
  const baseTime = 1_000_000;

  describe('shouldCallAI', () => {
    it('returns true when force is set', () => {
      expect(
        shouldCallAI({
          lastCallMs: baseTime,
          motionScore: 0,
          nowMs: baseTime + 10,
          force: true,
        }),
      ).toBe(true);
    });

    it('returns false when interval has not elapsed', () => {
      expect(
        shouldCallAI({
          lastCallMs: baseTime,
          motionScore: 1,
          nowMs: baseTime + AI_GATE_CONFIG.minIntervalMs - 1,
        }),
      ).toBe(false);
    });

    it('returns false when motion is below threshold', () => {
      expect(
        shouldCallAI({
          lastCallMs: baseTime,
          motionScore: AI_GATE_CONFIG.motionThreshold - 0.01,
          nowMs: baseTime + AI_GATE_CONFIG.minIntervalMs,
        }),
      ).toBe(false);
    });

    it('returns true when interval elapsed and motion is high enough', () => {
      expect(
        shouldCallAI({
          lastCallMs: baseTime,
          motionScore: AI_GATE_CONFIG.motionThreshold,
          nowMs: baseTime + AI_GATE_CONFIG.minIntervalMs,
        }),
      ).toBe(true);
    });
  });

  describe('estimateMotionScore', () => {
    it('returns 1 when previous box is missing', () => {
      expect(estimateMotionScore(undefined, {x: 0.5, y: 0.5})).toBe(1);
    });

    it('returns 1 when current box is missing', () => {
      expect(estimateMotionScore({x: 0.5, y: 0.5}, undefined)).toBe(1);
    });

    it('returns 0 for identical positions', () => {
      expect(estimateMotionScore({x: 0.5, y: 0.5}, {x: 0.5, y: 0.5})).toBe(0);
    });

    it('caps motion score at 1', () => {
      expect(estimateMotionScore({x: 0, y: 0}, {x: 1, y: 1})).toBe(1);
    });
  });
});
