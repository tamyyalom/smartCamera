import type {SpeedProfile} from '../../types/scene';
import type {TripodState} from '../../types/ai';

export type TripodMode = 'mock' | 'ble';

export interface MoveCommand {
  pan_delta: number;
  tilt_delta: number;
  height_delta: number;
  speed_profile: SpeedProfile;
}

export interface TripodDevice {
  id: string;
  name: string;
  rssi?: number;
}

export interface TripodCommandEnvelope {
  cmd: 'PING' | 'MOVE' | 'STOP' | 'GET_STATE';
  seq: number;
  payload?: Partial<MoveCommand>;
}

export interface TripodResponseEnvelope {
  type: 'ACK' | 'NACK';
  seq: number;
  state?: TripodState & {moving?: boolean};
  error?: string | null;
}

export interface TripodController {
  readonly mode: TripodMode;
  scan(durationMs?: number): Promise<TripodDevice[]>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  ping(): Promise<boolean>;
  move(command: MoveCommand): Promise<TripodState>;
  stop(): Promise<TripodState>;
  getState(): Promise<TripodState>;
  isConnected(): boolean;
}
