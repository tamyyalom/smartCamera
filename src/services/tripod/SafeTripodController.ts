import {applySafetyGates, applyStateDelta} from './tripodSafety';
import type {MoveCommand, TripodController} from './types';
import type {TripodState} from '../../types/ai';

export class SafeTripodController implements TripodController {
  constructor(private readonly inner: TripodController) {}

  get mode() {
    return this.inner.mode;
  }

  scan(durationMs?: number) {
    return this.inner.scan(durationMs);
  }

  connect(deviceId: string) {
    return this.inner.connect(deviceId);
  }

  disconnect() {
    return this.inner.disconnect();
  }

  ping() {
    return this.inner.ping();
  }

  stop() {
    return this.inner.stop();
  }

  getState() {
    return this.inner.getState();
  }

  isConnected() {
    return this.inner.isConnected();
  }

  async move(command: MoveCommand): Promise<TripodState> {
    const current = await this.inner.getState();
    const safety = applySafetyGates(command, current);

    if (!safety.allowed) {
      if (safety.reason?.includes('התעלמות') || safety.reason?.includes('גבול')) {
        return current;
      }
      throw new Error(safety.reason ?? 'תנועה נחסמה');
    }

    return this.inner.move(safety.command);
  }
}

export function wrapWithSafety(controller: TripodController): TripodController {
  return new SafeTripodController(controller);
}

export {applyStateDelta};
