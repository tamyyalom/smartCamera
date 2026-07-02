import {useAppStore} from '@/stores/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().resetSession();
  });

  it('starts with empty session', () => {
    const state = useAppStore.getState();
    expect(state.selectedSceneId).toBeNull();
    expect(state.captureMode).toBeNull();
    expect(state.tripod.connected).toBe(false);
    expect(state.tracking.faceCount).toBe(0);
  });

  it('setSelectedScene stores scene and mode', () => {
    useAppStore.getState().setSelectedScene('portrait_video', 'video');
    const state = useAppStore.getState();
    expect(state.selectedSceneId).toBe('portrait_video');
    expect(state.captureMode).toBe('video');
  });

  it('updateTripodState merges partial tripod state', () => {
    useAppStore.getState().updateTripodState({pan: 15, connected: true});
    expect(useAppStore.getState().tripod.pan).toBe(15);
    expect(useAppStore.getState().tripod.connected).toBe(true);
    expect(useAppStore.getState().tripod.height).toBe(120);
  });

  it('updateTrackingState merges tracking', () => {
    useAppStore.getState().updateTrackingState({
      faceCount: 2,
      guideStatus: 'misaligned',
    });
    expect(useAppStore.getState().tracking.faceCount).toBe(2);
    expect(useAppStore.getState().tracking.guideStatus).toBe('misaligned');
  });

  it('resetSession restores defaults', () => {
    useAppStore.getState().setSelectedScene('x', 'photo');
    useAppStore.getState().updateCameraState({zoom: 3});
    useAppStore.getState().resetSession();

    const state = useAppStore.getState();
    expect(state.selectedSceneId).toBeNull();
    expect(state.camera.zoom).toBe(1);
  });
});
