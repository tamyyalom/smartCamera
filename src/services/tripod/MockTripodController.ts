import type {SpeedProfile} from '../../types/scene';
import type {TripodState} from '../../types/ai';

export interface MoveCommand {
  pan_delta: number;
  tilt_delta: number;
  height_delta: number;
  speed_profile: SpeedProfile;
}

export interface TripodController {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  ping(): Promise<boolean>;
  move(command: MoveCommand): Promise<TripodState>;
  getState(): Promise<TripodState>;
}

const LIMITS = {
  pan: {min: -180, max: 180},
  tilt: {min: -45, max: 45},
  height: {min: 80, max: 180},
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * In-app tripod simulator for development without hardware.
 * Set TRIPOD_MODE=mock (default until native module exists).
 */
export class MockTripodController implements TripodController {
  private state: TripodState = {
    pan: 0,
    tilt: 0,
    height: 120,
    last_command_ms: 0,
    connected: false,
  };

  async connect(): Promise<boolean> {
    await this.delay(400);
    this.state.connected = true;
    return true;
  }

  async disconnect(): Promise<void> {
    this.state.connected = false;
  }

  async ping(): Promise<boolean> {
    return this.state.connected;
  }

  async move(command: MoveCommand): Promise<TripodState> {
    if (!this.state.connected) {
      throw new Error('Tripod not connected');
    }

    await this.delay(120);

    this.state = {
      ...this.state,
      pan: clamp(
        this.state.pan + command.pan_delta,
        LIMITS.pan.min,
        LIMITS.pan.max,
      ),
      tilt: clamp(
        this.state.tilt + command.tilt_delta,
        LIMITS.tilt.min,
        LIMITS.tilt.max,
      ),
      height: clamp(
        this.state.height + command.height_delta,
        LIMITS.height.min,
        LIMITS.height.max,
      ),
      last_command_ms: Date.now(),
    };

    return {...this.state};
  }

  async getState(): Promise<TripodState> {
    return {...this.state};
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockTripodController = new MockTripodController();
