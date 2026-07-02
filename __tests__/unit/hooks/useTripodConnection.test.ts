import type {TripodController, TripodDevice} from '@/services/tripod/types';
import type {TripodState} from '@/types/ai';
import {useTripodConnection} from '@/hooks/useTripodConnection';
import {renderHookResult} from '../../helpers/renderHook';

const mockDevices: TripodDevice[] = [
  {id: 'tripod-a', name: 'SmartCamera Tripod', rssi: -40},
];

const baseState: TripodState = {
  pan: 0,
  tilt: 0,
  height: 120,
  last_command_ms: 0,
  connected: true,
};

function createMockController(
  overrides: Partial<TripodController> = {},
): TripodController {
  return {
    mode: 'mock',
    scan: jest.fn().mockResolvedValue(mockDevices),
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(undefined),
    ping: jest.fn().mockResolvedValue(true),
    move: jest.fn().mockResolvedValue({...baseState, pan: 5}),
    stop: jest.fn().mockResolvedValue(baseState),
    getState: jest.fn().mockResolvedValue(baseState),
    isConnected: jest.fn().mockReturnValue(true),
    ...overrides,
  };
}

let mockController = createMockController();

jest.mock('@/services/tripod', () => ({
  getTripodController: () => mockController,
  getTripodModeLabel: () => 'Mock',
}));

describe('useTripodConnection', () => {
  beforeEach(() => {
    mockController = createMockController();
  });

  it('starts idle with mock mode label', async () => {
    const hook = await renderHookResult(() => useTripodConnection());
    expect(hook.getCurrent().phase).toBe('idle');
    expect(hook.getCurrent().modeLabel).toBe('Mock');
    expect(hook.getCurrent().devices).toEqual([]);
    await hook.unmount();
  });

  it('scan populates devices', async () => {
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().scan();
    await hook.rerender();

    expect(mockController.scan).toHaveBeenCalled();
    expect(hook.getCurrent().devices).toEqual(mockDevices);
    expect(hook.getCurrent().phase).toBe('idle');
    await hook.unmount();
  });

  it('scan sets error when no devices found', async () => {
    mockController = createMockController({
      scan: jest.fn().mockResolvedValue([]),
    });
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().scan();
    await hook.rerender();

    expect(hook.getCurrent().error).toMatch(/לא נמצאו חצובות/);
    await hook.unmount();
  });

  it('connect transitions to connected on success', async () => {
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().scan();
    await hook.rerender();
    hook.getCurrent().selectDevice('tripod-a');
    await hook.rerender();

    await hook.getCurrent().connect('tripod-a');
    await hook.rerender();

    expect(hook.getCurrent().phase).toBe('connected');
    expect(hook.getCurrent().connectedDevice?.id).toBe('tripod-a');
    expect(hook.getCurrent().tripodState).toEqual(baseState);
    expect(hook.getCurrent().lastAction).toBe('מחובר ומוכן');
    await hook.unmount();
  });

  it('connect sets error when connection fails', async () => {
    mockController = createMockController({
      connect: jest.fn().mockResolvedValue(false),
    });
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().connect('tripod-a');
    await hook.rerender();

    expect(hook.getCurrent().phase).toBe('error');
    expect(hook.getCurrent().error).toMatch(/נכשל/);
    await hook.unmount();
  });

  it('disconnect resets connection state', async () => {
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().connect('tripod-a');
    await hook.rerender();
    await hook.getCurrent().disconnect();
    await hook.rerender();

    expect(hook.getCurrent().phase).toBe('idle');
    expect(hook.getCurrent().connectedDevice).toBeNull();
    expect(hook.getCurrent().lastAction).toBe('מנותק');
    await hook.unmount();
  });

  it('testMove updates tripod state', async () => {
    const hook = await renderHookResult(() => useTripodConnection());
    await hook.getCurrent().testMove(5, 0, 0, 'slow');
    await hook.rerender();

    expect(mockController.move).toHaveBeenCalled();
    expect(hook.getCurrent().tripodState?.pan).toBe(5);
    expect(hook.getCurrent().lastAction).toBe('תנועת בדיקה בוצעה');
    await hook.unmount();
  });
});
