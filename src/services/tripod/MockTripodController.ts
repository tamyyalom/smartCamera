import {TRIPOD_CONFIG} from '../../config/tripod';
import type {TripodState} from '../../types/ai';
import {encodeCommand, mockAck} from './tripodProtocol';
import {applyStateDelta, AXIS_LIMITS} from './tripodSafety';
import type {MoveCommand, TripodController, TripodDevice} from './types';

const MOCK_DEVICES: TripodDevice[] = [
  {id: 'mock-tripod-1', name: 'SmartCamera Tripod', rssi: -42},
  {id: 'mock-tripod-2', name: 'SmartCamera Tripod Pro', rssi: -58},
];

/**
 * In-app tripod simulator with BLE-like scan/connect flow for development.
 */
export class MockTripodController implements TripodController {
  readonly mode = 'mock' as const;

  private state: TripodState = {
    pan: 0,
    tilt: 0,
    height: 120,
    last_command_ms: 0,
    connected: false,
  };

  private connectedDeviceId: string | null = null;

  async scan(durationMs = TRIPOD_CONFIG.scanDurationMs): Promise<TripodDevice[]> {
    await this.delay(Math.min(durationMs, 1200));
    return MOCK_DEVICES;
  }

  async connect(deviceId: string): Promise<boolean> {
    await this.delay(500);
    const device = MOCK_DEVICES.find(item => item.id === deviceId);
    if (!device) {
      return false;
    }
    this.connectedDeviceId = deviceId;
    this.state.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.connectedDeviceId = null;
    this.state.connected = false;
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  async ping(): Promise<boolean> {
    if (!this.state.connected) {
      return false;
    }
    const raw = encodeCommand('PING');
    const response = mockAck(JSON.parse(raw).seq, this.state);
    return response.type === 'ACK';
  }

  async move(command: MoveCommand): Promise<TripodState> {
    if (!this.state.connected) {
      throw new Error('החצובה לא מחוברת');
    }

    await this.delay(120);
    this.state = applyStateDelta(this.state, command);
    return {...this.state};
  }

  async stop(): Promise<TripodState> {
    if (!this.state.connected) {
      throw new Error('החצובה לא מחוברת');
    }
    await this.delay(80);
    return {...this.state};
  }

  async getState(): Promise<TripodState> {
    return {...this.state};
  }

  getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockTripodController = new MockTripodController();

export {AXIS_LIMITS};
