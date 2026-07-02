import {useEffect, useState} from 'react';
import type {CameraDevice} from 'react-native-vision-camera';
import {useCameraDevice, useCameraDevices} from 'react-native-vision-camera';

const RESOLVE_TIMEOUT_MS = 2500;

export type CameraDeviceStatus = 'loading' | 'ready' | 'unavailable';

interface CameraDeviceStatusResult {
  status: CameraDeviceStatus;
  device: CameraDevice | undefined;
}

export function useCameraDeviceStatus(): CameraDeviceStatusResult {
  const device = useCameraDevice('back');
  const devices = useCameraDevices();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (device) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setTimedOut(true), RESOLVE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [device]);

  if (device) {
    return {status: 'ready', device};
  }

  if (devices.length > 0) {
    return {status: 'unavailable', device: undefined};
  }

  if (!timedOut) {
    return {status: 'loading', device: undefined};
  }

  return {status: 'unavailable', device: undefined};
}
