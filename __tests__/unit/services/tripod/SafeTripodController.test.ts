import {SafeTripodController} from '@/services/tripod/SafeTripodController';
import type {MoveCommand, TripodController} from '@/services/tripod/types';
import type {TripodState} from '@/types/ai';

const baseState: TripodState = {
  pan: 0,
  tilt: 0,
  height: 120,
  last_command_ms: 0,
  connected: true,
};

const move = (overrides: Partial<MoveCommand> = {}): MoveCommand => ({
  pan_delta: 5,
  tilt_delta: 0,
  height_delta: 0,
  speed_profile: 'medium',
  ...overrides,
});

function createInner(overrides: Partial<TripodController> = {}): TripodController {
  return {
    mode: 'mock',
    scan: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    ping: jest.fn(),
    stop: jest.fn(),
    getState: jest.fn().mockResolvedValue(baseState),
    isConnected: jest.fn().mockReturnValue(true),
    move: jest.fn().mockResolvedValue({...baseState, pan: 5}),
    ...overrides,
  };
}

describe('SafeTripodController', () => {
  it('delegates scan to inner controller', async () => {
    const inner = createInner();
    const safe = new SafeTripodController(inner);
    await safe.scan(500);
    expect(inner.scan).toHaveBeenCalledWith(500);
  });

  it('forwards allowed moves to inner controller', async () => {
    const inner = createInner();
    const safe = new SafeTripodController(inner);
    const command = move();
    await safe.move(command);
    expect(inner.move).toHaveBeenCalled();
  });

  it('returns current state for ignored tiny moves', async () => {
    const inner = createInner();
    const safe = new SafeTripodController(inner);
    const result = await safe.move(
      move({pan_delta: 0.1, tilt_delta: 0.1, height_delta: 0.1}),
    );
    expect(inner.move).not.toHaveBeenCalled();
    expect(result).toEqual(baseState);
  });

  it('throws when move blocked by hold window', async () => {
    const inner = createInner({
      getState: jest.fn().mockResolvedValue({
        ...baseState,
        last_command_ms: Date.now(),
      }),
    });
    const safe = new SafeTripodController(inner);
    await expect(safe.move(move())).rejects.toThrow(/המתנה/);
  });
});
