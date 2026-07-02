export type TripodMode = 'mock' | 'ble';

export const TRIPOD_CONFIG = {
  /** Switch to `ble` when hardware firmware is available. */
  mode: 'mock' as TripodMode,
  ble: {
    serviceUuid: '0000FFF0-0000-1000-8000-00805F9B34FB',
    commandCharUuid: '0000FFF1-0000-1000-8000-00805F9B34FB',
    notifyCharUuid: '0000FFF2-0000-1000-8000-00805F9B34FB',
    namePrefix: 'SmartCamera',
  },
  scanDurationMs: 8000,
  minHoldMs: 300,
} as const;
