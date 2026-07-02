import type {TripodState} from '../../types/ai';
import type {SpeedProfile} from '../../types/scene';
import {TRIPOD_CONFIG} from '../../config/tripod';
import type {MoveCommand} from './types';

export const AXIS_LIMITS = {
  pan: {min: -180, max: 180},
  tilt: {min: -45, max: 45},
  height: {min: 80, max: 180},
} as const;

export const MAX_DELTA = {
  pan: 15,
  tilt: 10,
  height: 5,
} as const;

export const MIN_CHANGE = {
  pan: 0.5,
  tilt: 0.5,
  height: 0.5,
} as const;

export const SPEED_PROFILE_LABELS: Record<SpeedProfile, string> = {
  slow: 'איטי',
  medium: 'מהיר',
  fast: 'מהיר מאוד',
  documentary: 'דוקומנטרי',
};

export const SPEED_PROFILES: SpeedProfile[] = [
  'slow',
  'medium',
  'fast',
  'documentary',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampDelta(value: number, max: number): number {
  return clamp(value, -max, max);
}

function isBelowMinChange(value: number, min: number): boolean {
  return Math.abs(value) > 0 && Math.abs(value) < min;
}

export function smoothDelta(delta: number, factor = 0.65): number {
  if (delta === 0) {
    return 0;
  }
  return delta * factor;
}

export interface SafetyResult {
  allowed: boolean;
  command: MoveCommand;
  reason?: string;
}

export function applySafetyGates(
  command: MoveCommand,
  state: TripodState,
  nowMs = Date.now(),
): SafetyResult {
  const holdElapsed = nowMs - state.last_command_ms;
  if (state.last_command_ms > 0 && holdElapsed < TRIPOD_CONFIG.minHoldMs) {
    return {
      allowed: false,
      command,
      reason: `המתנה ${TRIPOD_CONFIG.minHoldMs - holdElapsed}ms לפני תנועה נוספת`,
    };
  }

  const smoothed: MoveCommand = {
    ...command,
    pan_delta: smoothDelta(command.pan_delta),
    tilt_delta: smoothDelta(command.tilt_delta),
    height_delta: smoothDelta(command.height_delta),
  };

  if (
    isBelowMinChange(smoothed.pan_delta, MIN_CHANGE.pan) &&
    isBelowMinChange(smoothed.tilt_delta, MIN_CHANGE.tilt) &&
    isBelowMinChange(smoothed.height_delta, MIN_CHANGE.height)
  ) {
    return {
      allowed: false,
      command: smoothed,
      reason: 'שינוי קטן מדי — התעלמות',
    };
  }

  const safeCommand: MoveCommand = {
    ...smoothed,
    pan_delta: clampDelta(smoothed.pan_delta, MAX_DELTA.pan),
    tilt_delta: clampDelta(smoothed.tilt_delta, MAX_DELTA.tilt),
    height_delta: clampDelta(smoothed.height_delta, MAX_DELTA.height),
  };

  const nextPan = clamp(
    state.pan + safeCommand.pan_delta,
    AXIS_LIMITS.pan.min,
    AXIS_LIMITS.pan.max,
  );
  const nextTilt = clamp(
    state.tilt + safeCommand.tilt_delta,
    AXIS_LIMITS.tilt.min,
    AXIS_LIMITS.tilt.max,
  );
  const nextHeight = clamp(
    state.height + safeCommand.height_delta,
    AXIS_LIMITS.height.min,
    AXIS_LIMITS.height.max,
  );

  if (
    nextPan === state.pan &&
    nextTilt === state.tilt &&
    nextHeight === state.height
  ) {
    return {
      allowed: false,
      command: safeCommand,
      reason: 'הגעה לגבול בטיחות',
    };
  }

  return {allowed: true, command: safeCommand};
}

export function applyStateDelta(
  state: TripodState,
  command: MoveCommand,
  nowMs = Date.now(),
): TripodState {
  return {
    ...state,
    pan: clamp(
      state.pan + command.pan_delta,
      AXIS_LIMITS.pan.min,
      AXIS_LIMITS.pan.max,
    ),
    tilt: clamp(
      state.tilt + command.tilt_delta,
      AXIS_LIMITS.tilt.min,
      AXIS_LIMITS.tilt.max,
    ),
    height: clamp(
      state.height + command.height_delta,
      AXIS_LIMITS.height.min,
      AXIS_LIMITS.height.max,
    ),
    last_command_ms: nowMs,
    connected: state.connected,
  };
}
