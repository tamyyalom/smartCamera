import {
  decodeResponse,
  encodeCommand,
  mockAck,
} from '@/services/tripod/tripodProtocol';

describe('tripodProtocol', () => {
  describe('encodeCommand', () => {
    it('returns JSON envelope with incrementing seq', () => {
      const first = JSON.parse(encodeCommand('PING'));
      const second = JSON.parse(encodeCommand('MOVE', {pan_delta: 1}));
      expect(first.cmd).toBe('PING');
      expect(second.cmd).toBe('MOVE');
      expect(second.payload.pan_delta).toBe(1);
      expect(second.seq).not.toBe(first.seq);
    });
  });

  describe('decodeResponse', () => {
    it('parses valid JSON', () => {
      const raw = JSON.stringify({type: 'ACK', seq: 1, state: {}, error: null});
      expect(decodeResponse(raw)?.type).toBe('ACK');
    });

    it('returns null for invalid JSON', () => {
      expect(decodeResponse('not-json')).toBeNull();
    });
  });

  describe('mockAck', () => {
    it('builds ACK envelope with state', () => {
      const state = {
        pan: 0,
        tilt: 0,
        height: 120,
        last_command_ms: 0,
        connected: true,
      };
      const ack = mockAck(7, state, true);
      expect(ack.type).toBe('ACK');
      expect(ack.seq).toBe(7);
      expect(ack.state.moving).toBe(true);
      expect(ack.error).toBeNull();
    });
  });
});
