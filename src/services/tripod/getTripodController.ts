import {TRIPOD_CONFIG} from '../../config/tripod';
import {BleTripodController} from './BleTripodController';
import {MockTripodController, mockTripodController} from './MockTripodController';
import {wrapWithSafety} from './SafeTripodController';
import type {TripodController} from './types';

let controller: TripodController | null = null;

function createController(): TripodController {
  const inner =
    TRIPOD_CONFIG.mode === 'ble'
      ? new BleTripodController()
      : mockTripodController;

  return wrapWithSafety(inner);
}

export function getTripodController(): TripodController {
  if (!controller) {
    controller = createController();
  }
  return controller;
}

export function getTripodModeLabel(): string {
  return TRIPOD_CONFIG.mode === 'ble' ? 'BLE' : 'Mock';
}

export {mockTripodController, MockTripodController};
