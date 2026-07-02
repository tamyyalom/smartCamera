import {MockTripodController} from '@/services/tripod/MockTripodController';

describe('MockTripodController', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts disconnected', async () => {
    const controller = new MockTripodController();
    expect(controller.isConnected()).toBe(false);
  });

  it('scan returns mock devices', async () => {
    const controller = new MockTripodController();
    const scanPromise = controller.scan(500);
    jest.advanceTimersByTime(500);
    const devices = await scanPromise;
    expect(devices.length).toBeGreaterThanOrEqual(2);
    expect(devices[0].name).toMatch(/SmartCamera/);
  });

  it('connects to known device', async () => {
    const controller = new MockTripodController();
    const scanPromise = controller.scan(100);
    jest.advanceTimersByTime(100);
    const [device] = await scanPromise;

    const connectPromise = controller.connect(device.id);
    jest.advanceTimersByTime(500);
    const ok = await connectPromise;

    expect(ok).toBe(true);
    expect(controller.isConnected()).toBe(true);
    expect(controller.getConnectedDeviceId()).toBe(device.id);
  });

  it('rejects unknown device id', async () => {
    const controller = new MockTripodController();
    const connectPromise = controller.connect('unknown');
    jest.advanceTimersByTime(500);
    expect(await connectPromise).toBe(false);
  });

  it('move throws when disconnected', async () => {
    const controller = new MockTripodController();
    await expect(
      controller.move({
        pan_delta: 1,
        tilt_delta: 0,
        height_delta: 0,
        speed_profile: 'slow',
      }),
    ).rejects.toThrow(/לא מחוברת/);
  });

  it('move updates state when connected', async () => {
    const controller = new MockTripodController();
    const scanPromise = controller.scan(100);
    jest.advanceTimersByTime(100);
    const [device] = await scanPromise;

    const connectPromise = controller.connect(device.id);
    jest.advanceTimersByTime(500);
    await connectPromise;

    const movePromise = controller.move({
      pan_delta: 10,
      tilt_delta: 0,
      height_delta: 0,
      speed_profile: 'medium',
    });
    jest.advanceTimersByTime(120);
    const state = await movePromise;

    expect(state.pan).toBe(10);
  });

  it('disconnect clears connection', async () => {
    const controller = new MockTripodController();
    const scanPromise = controller.scan(100);
    jest.advanceTimersByTime(100);
    const [device] = await scanPromise;
    const connectPromise = controller.connect(device.id);
    jest.advanceTimersByTime(500);
    await connectPromise;

    await controller.disconnect();
    expect(controller.isConnected()).toBe(false);
    expect(controller.getConnectedDeviceId()).toBeNull();
  });
});
