import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getTripodController, getTripodModeLabel} from '../services/tripod';
import type {TripodDevice} from '../services/tripod';
import type {TripodState} from '../types/ai';
import type {SpeedProfile} from '../types/scene';

export type TripodConnectionPhase =
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'error';

export function useTripodConnection() {
  const controller = useMemo(() => getTripodController(), []);
  const modeLabel = useMemo(() => getTripodModeLabel(), []);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState<TripodConnectionPhase>('idle');
  const [devices, setDevices] = useState<TripodDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<TripodDevice | null>(
    null,
  );
  const [tripodState, setTripodState] = useState<TripodState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setError(null);
  }, []);

  const scan = useCallback(async () => {
    setPhase('scanning');
    setError(null);
    setLastAction(null);
    try {
      const found = await controller.scan();
      if (!mountedRef.current) {
        return;
      }
      setDevices(found);
      setPhase('idle');
      if (found.length === 0) {
        setError('לא נמצאו חצובות SmartCamera בסביבה');
      }
    } catch (e) {
      if (!mountedRef.current) {
        return;
      }
      setPhase('error');
      setError(e instanceof Error ? e.message : 'סריקת BLE נכשלה');
    }
  }, [controller]);

  const connect = useCallback(
    async (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      setPhase('connecting');
      setError(null);
      try {
        const ok = await controller.connect(deviceId);
        if (!ok) {
          throw new Error('החיבור נכשל');
        }
        const pingOk = await controller.ping();
        if (!pingOk) {
          throw new Error('החצובה לא הגיבה לבדיקת חיבור');
        }
        const state = await controller.getState();
        const device = devices.find(item => item.id === deviceId) ?? {
          id: deviceId,
          name: 'SmartCamera Tripod',
        };
        if (!mountedRef.current) {
          return;
        }
        setConnectedDevice(device);
        setTripodState(state);
        setPhase('connected');
        setLastAction('מחובר ומוכן');
      } catch (e) {
        if (!mountedRef.current) {
          return;
        }
        setPhase('error');
        setError(e instanceof Error ? e.message : 'חיבור נכשל');
        await controller.disconnect().catch(() => {});
      }
    },
    [controller, devices],
  );

  const disconnect = useCallback(async () => {
    await controller.disconnect().catch(() => {});
    if (!mountedRef.current) {
      return;
    }
    setPhase('idle');
    setConnectedDevice(null);
    setTripodState(null);
    setSelectedDeviceId(null);
    setLastAction('מנותק');
  }, [controller]);

  const refreshState = useCallback(async () => {
    if (!controller.isConnected()) {
      return;
    }
    const state = await controller.getState();
    if (mountedRef.current) {
      setTripodState(state);
    }
  }, [controller]);

  const testMove = useCallback(
    async (
      pan = 0,
      tilt = 0,
      height = 0,
      speed_profile: SpeedProfile = 'slow',
    ) => {
      try {
        const state = await controller.move({
          pan_delta: pan,
          tilt_delta: tilt,
          height_delta: height,
          speed_profile,
        });
        if (mountedRef.current) {
          setTripodState(state);
          setLastAction('תנועת בדיקה בוצעה');
          setError(null);
        }
      } catch (e) {
        if (mountedRef.current) {
          setError(e instanceof Error ? e.message : 'תנועה נכשלה');
        }
      }
    },
    [controller],
  );

  const emergencyStop = useCallback(async () => {
    try {
      const state = await controller.stop();
      if (mountedRef.current) {
        setTripodState(state);
        setLastAction('עצירת חירום');
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : 'עצירה נכשלה');
      }
    }
  }, [controller]);

  return {
    controller,
    modeLabel,
    phase,
    devices,
    selectedDeviceId,
    connectedDevice,
    tripodState,
    error,
    lastAction,
    scan,
    selectDevice,
    connect,
    disconnect,
    refreshState,
    testMove,
    emergencyStop,
  };
}
