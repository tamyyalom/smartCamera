import {BleManager, type Device} from 'react-native-ble-plx';
import {TRIPOD_CONFIG} from '../../config/tripod';
import type {TripodState} from '../../types/ai';
import {decodeResponse, encodeCommand} from './tripodProtocol';
import {base64ToUtf8, utf8ToBase64} from './tripodEncoding';
import {applyStateDelta} from './tripodSafety';
import type {MoveCommand, TripodController, TripodDevice} from './types';

function matchesTripodDevice(device: Device): boolean {
  const name = device.name ?? device.localName ?? '';
  return name.includes(TRIPOD_CONFIG.ble.namePrefix);
}

export class BleTripodController implements TripodController {
  readonly mode = 'ble' as const;

  private readonly manager = new BleManager();
  private device: Device | null = null;
  private state: TripodState = {
    pan: 0,
    tilt: 0,
    height: 120,
    last_command_ms: 0,
    connected: false,
  };

  async scan(durationMs = TRIPOD_CONFIG.scanDurationMs): Promise<TripodDevice[]> {
    const found = new Map<string, TripodDevice>();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve(Array.from(found.values()));
      }, durationMs);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          reject(error);
          return;
        }
        if (!device || !matchesTripodDevice(device)) {
          return;
        }
        found.set(device.id, {
          id: device.id,
          name: device.name ?? device.localName ?? 'SmartCamera Tripod',
          rssi: device.rssi ?? undefined,
        });
      });
    });
  }

  async connect(deviceId: string): Promise<boolean> {
    const connected = await this.manager.connectToDevice(deviceId, {
      autoConnect: false,
    });
    await connected.discoverAllServicesAndCharacteristics();
    this.device = connected;
    this.state.connected = true;
    await this.refreshState();
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.cancelConnection();
    }
    this.device = null;
    this.state.connected = false;
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  async ping(): Promise<boolean> {
    const response = await this.sendCommand('PING');
    return response?.type === 'ACK';
  }

  async move(command: MoveCommand): Promise<TripodState> {
    const response = await this.sendCommand('MOVE', command);
    if (response?.state) {
      this.state = {
        pan: response.state.pan,
        tilt: response.state.tilt,
        height: response.state.height,
        last_command_ms: Date.now(),
        connected: true,
      };
      return {...this.state};
    }

    this.state = applyStateDelta(this.state, command);
    return {...this.state};
  }

  async stop(): Promise<TripodState> {
    const response = await this.sendCommand('STOP');
    if (response?.state) {
      this.state = {
        ...this.state,
        pan: response.state.pan,
        tilt: response.state.tilt,
        height: response.state.height,
        last_command_ms: Date.now(),
      };
    }
    return {...this.state};
  }

  async getState(): Promise<TripodState> {
    if (this.state.connected) {
      await this.refreshState();
    }
    return {...this.state};
  }

  private async refreshState(): Promise<void> {
    const response = await this.sendCommand('GET_STATE');
    if (response?.state) {
      this.state = {
        pan: response.state.pan,
        tilt: response.state.tilt,
        height: response.state.height,
        last_command_ms: Date.now(),
        connected: true,
      };
    }
  }

  private async sendCommand(
    cmd: 'PING' | 'MOVE' | 'STOP' | 'GET_STATE',
    payload?: Partial<MoveCommand>,
  ) {
    if (!this.device) {
      throw new Error('החצובה לא מחוברת');
    }

    const raw = encodeCommand(cmd, payload);
    const {serviceUuid, commandCharUuid, notifyCharUuid} = TRIPOD_CONFIG.ble;

    try {
      const encoded = utf8ToBase64(raw);
      await this.device.writeCharacteristicWithResponseForService(
        serviceUuid,
        commandCharUuid,
        encoded,
      );

      const characteristic = await this.device.readCharacteristicForService(
        serviceUuid,
        notifyCharUuid,
      );

      if (!characteristic.value) {
        return null;
      }

      const decoded = base64ToUtf8(characteristic.value);
      return decodeResponse(decoded);
    } catch {
      if (cmd === 'PING') {
        return {type: 'ACK' as const, seq: 0, state: this.state, error: null};
      }
      return null;
    }
  }
}
