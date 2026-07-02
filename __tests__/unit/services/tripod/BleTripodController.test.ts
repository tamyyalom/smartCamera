import {utf8ToBase64} from '@/services/tripod/tripodEncoding';
import {mockAck} from '@/services/tripod/tripodProtocol';
import type {TripodState} from '@/types/ai';

const mockStopDeviceScan = jest.fn();
const mockConnectToDevice = jest.fn();
let scanHandler: ((error: Error | null, device: unknown) => void) | null = null;

const mockBleDevice = {
  id: 'ble-tripod-1',
  name: 'SmartCamera Tripod',
  localName: 'SmartCamera Tripod',
  rssi: -48,
  discoverAllServicesAndCharacteristics: jest.fn().mockResolvedValue(undefined),
  cancelConnection: jest.fn().mockResolvedValue(undefined),
  writeCharacteristicWithResponseForService: jest.fn().mockResolvedValue(undefined),
  readCharacteristicForService: jest.fn(),
};

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(
      (_uuid: string | null, _options: unknown, callback: typeof scanHandler) => {
        scanHandler = callback;
      },
    ),
    stopDeviceScan: mockStopDeviceScan,
    connectToDevice: mockConnectToDevice,
    destroy: jest.fn(),
  })),
  State: {PoweredOn: 'PoweredOn'},
}));

import {BleTripodController} from '@/services/tripod/BleTripodController';

const baseState: TripodState = {
  pan: 0,
  tilt: 0,
  height: 120,
  last_command_ms: 0,
  connected: true,
};

describe('BleTripodController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scanHandler = null;
    mockConnectToDevice.mockResolvedValue(mockBleDevice);
    mockBleDevice.readCharacteristicForService.mockResolvedValue({
      value: utf8ToBase64(
        JSON.stringify(mockAck(1, baseState)),
      ),
    });
  });

  it('filters scan results to SmartCamera devices', async () => {
    jest.useFakeTimers();
    const controller = new BleTripodController();
    const scanPromise = controller.scan(500);

    scanHandler?.(null, {
      id: 'other',
      name: 'Random Speaker',
      rssi: -60,
    });
    scanHandler?.(null, mockBleDevice);

    jest.advanceTimersByTime(500);
    const devices = await scanPromise;
    jest.useRealTimers();

    expect(devices).toHaveLength(1);
    expect(devices[0].name).toContain('SmartCamera');
    expect(mockStopDeviceScan).toHaveBeenCalled();
  });

  it('connects and refreshes tripod state', async () => {
    const controller = new BleTripodController();
    const ok = await controller.connect('ble-tripod-1');

    expect(ok).toBe(true);
    expect(mockConnectToDevice).toHaveBeenCalledWith('ble-tripod-1', {
      autoConnect: false,
    });
    expect(controller.isConnected()).toBe(true);
    const state = await controller.getState();
    expect(state.height).toBe(120);
  });

  it('ping returns true when device responds ACK', async () => {
    const controller = new BleTripodController();
    await controller.connect('ble-tripod-1');
    await expect(controller.ping()).resolves.toBe(true);
  });

  it('move throws when not connected', async () => {
    const controller = new BleTripodController();
    await expect(
      controller.move({
        pan_delta: 1,
        tilt_delta: 0,
        height_delta: 0,
        speed_profile: 'slow',
      }),
    ).rejects.toThrow(/לא מחוברת/);
  });

  it('disconnect clears connection', async () => {
    const controller = new BleTripodController();
    await controller.connect('ble-tripod-1');
    await controller.disconnect();
    expect(controller.isConnected()).toBe(false);
    expect(mockBleDevice.cancelConnection).toHaveBeenCalled();
  });
});
