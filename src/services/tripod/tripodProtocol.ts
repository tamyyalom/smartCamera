import type {
  MoveCommand,
  TripodCommandEnvelope,
  TripodResponseEnvelope,
} from './types';
import type {TripodState} from '../../types/ai';

let sequence = 0;

function nextSeq(): number {
  sequence = (sequence + 1) % 65535;
  return sequence;
}

export function encodeCommand(
  cmd: TripodCommandEnvelope['cmd'],
  payload?: Partial<MoveCommand>,
): string {
  const envelope: TripodCommandEnvelope = {
    cmd,
    seq: nextSeq(),
    payload,
  };
  return JSON.stringify(envelope);
}

export function decodeResponse(raw: string): TripodResponseEnvelope | null {
  try {
    return JSON.parse(raw) as TripodResponseEnvelope;
  } catch {
    return null;
  }
}

export function mockAck(
  seq: number,
  state: TripodState,
  moving = false,
): TripodResponseEnvelope {
  return {
    type: 'ACK',
    seq,
    state: {...state, moving},
    error: null,
  };
}
