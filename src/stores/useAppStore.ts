import {create} from 'zustand';
import type {CameraState, TripodState} from '../types/ai';

interface AppState {
  selectedSceneId: string | null;
  captureMode: 'photo' | 'video' | null;
  tripod: TripodState;
  camera: CameraState;
  setSelectedScene: (sceneId: string, mode: 'photo' | 'video') => void;
  setTripodConnected: (connected: boolean) => void;
  updateTripodState: (partial: Partial<TripodState>) => void;
  updateCameraState: (partial: Partial<CameraState>) => void;
  resetSession: () => void;
}

const defaultTripod: TripodState = {
  pan: 0,
  tilt: 0,
  height: 120,
  last_command_ms: 0,
  connected: false,
};

const defaultCamera: CameraState = {
  zoom: 1,
};

export const useAppStore = create<AppState>(set => ({
  selectedSceneId: null,
  captureMode: null,
  tripod: defaultTripod,
  camera: defaultCamera,
  setSelectedScene: (sceneId, mode) =>
    set({selectedSceneId: sceneId, captureMode: mode}),
  setTripodConnected: connected =>
    set(state => ({tripod: {...state.tripod, connected}})),
  updateTripodState: partial =>
    set(state => ({tripod: {...state.tripod, ...partial}})),
  updateCameraState: partial =>
    set(state => ({camera: {...state.camera, ...partial}})),
  resetSession: () =>
    set({
      selectedSceneId: null,
      captureMode: null,
      tripod: defaultTripod,
      camera: defaultCamera,
    }),
}));
