import {TRIPOD_CONFIG} from '@/config/tripod';
import {
  applySafetyGates,
  applyStateDelta,
  AXIS_LIMITS,
  MAX_DELTA,
  smoothDelta,
} from '@/services/tripod/tripodSafety';
import type {MoveCommand} from '@/services/tripod/types';

const baseState = {
  pan: 0,
  tilt: 0,
  height: 120,
  last_command_ms: 0,
  connected: true,
};

const move = (overrides: Partial<MoveCommand> = {}): MoveCommand => ({
  pan_delta: 5,
  tilt_delta: 2,
  height_delta: 1,
  speed_profile: 'medium',
  ...overrides,
});

describe('tripodSafety', () => {
  describe('smoothDelta', () => {
    it('returns 0 for zero input', () => {
      expect(smoothDelta(0)).toBe(0);
    });

    it('scales non-zero delta by factor', () => {
      expect(smoothDelta(10, 0.5)).toBe(5);
    });
  });

  describe('applySafetyGates', () => {
    it('blocks commands during min hold window', () => {
      const now = 10_000;
      const result = applySafetyGates(
        move(),
        {...baseState, last_command_ms: now - 50},
        now,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/המתנה/);
    });

    it('blocks tiny changes below min threshold', () => {
      const result = applySafetyGates(
        move({pan_delta: 0.1, tilt_delta: 0.1, height_delta: 0.1}),
        baseState,
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/קטן מדי/);
    });

    it('clamps deltas to MAX_DELTA', () => {
      const result = applySafetyGates(
        move({pan_delta: 100, tilt_delta: 100, height_delta: 100}),
        baseState,
        Date.now(),
      );
      if (result.allowed) {
        expect(Math.abs(result.command.pan_delta)).toBeLessThanOrEqual(
          MAX_DELTA.pan,
        );
      }
    });

    it('allows valid movement', () => {
      const result = applySafetyGates(move(), baseState, Date.now());
      expect(result.allowed).toBe(true);
    });

    it('blocks when at axis limit', () => {
      const result = applySafetyGates(
        move({pan_delta: 200, tilt_delta: 0, height_delta: 0}),
        {...baseState, pan: AXIS_LIMITS.pan.max},
        Date.now(),
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toMatch(/גבול בטיחות/);
    });
  });

  describe('applyStateDelta', () => {
    it('updates position and timestamp', () => {
      const now = 42_000;
      const next = applyStateDelta(baseState, move(), now);
      expect(next.pan).toBe(5);
      expect(next.last_command_ms).toBe(now);
    });

    it('respects TRIPOD_CONFIG minHoldMs constant', () => {
      expect(TRIPOD_CONFIG.minHoldMs).toBeGreaterThan(0);
    });
  });
});
