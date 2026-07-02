import {AI_GATE_CONFIG} from '@/config/ai';
import {getScenesForMode} from '@/config/scenes';
import {useAIPipeline} from '@/hooks/useAIPipeline';
import {useAppStore} from '@/stores/useAppStore';
import {renderHookResult} from '../../helpers/renderHook';

const mockMove = jest.fn().mockResolvedValue({
  pan: 1,
  tilt: 0,
  height: 120,
  last_command_ms: Date.now(),
  connected: true,
});

jest.mock('@/services/tripod', () => ({
  getTripodController: () => ({
    isConnected: () => true,
    move: mockMove,
  }),
}));

jest.mock('@/services/ai/aiProvider', () => ({
  getAIProvider: () => async () => ({
    apply: true,
    pan_delta: 2,
    tilt_delta: 0,
    height_delta: 0,
    zoom_target: 1.8,
    speed_profile: 'slow',
    guidance_text: 'התקרבי מעט',
    confidence: 0.9,
    reason: 'test',
  }),
  getAIProviderMode: () => 'mock',
}));

describe('useAIPipeline', () => {
  const scene = getScenesForMode('photo')[0];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useAppStore.setState({
      tripod: {
        pan: 0,
        tilt: 0,
        height: 120,
        last_command_ms: 0,
        connected: true,
      },
      camera: {zoom: 1},
      tracking: {
        faceCount: 1,
        motionScore: 1,
        guideStatus: 'ready',
        faceBox: {x: 0.4, y: 0.35, width: 0.2, height: 0.25},
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('emits guidance after gated tick', async () => {
    const onZoomChange = jest.fn();
    const hook = await renderHookResult(() =>
      useAIPipeline({
        sceneId: scene.id,
        enabled: true,
        onZoomChange,
      }),
    );

    await jest.advanceTimersByTimeAsync(AI_GATE_CONFIG.minIntervalMs + 300);

    expect(hook.getCurrent().guidanceText).toBe('התקרבי מעט');
    expect(onZoomChange).toHaveBeenCalledWith(1.8);
    expect(mockMove).toHaveBeenCalled();
  });

  it('stays idle when disabled', async () => {
    const hook = await renderHookResult(() =>
      useAIPipeline({
        sceneId: scene.id,
        enabled: false,
        onZoomChange: jest.fn(),
      }),
    );

    await jest.advanceTimersByTimeAsync(2000);
    expect(hook.getCurrent().guidanceText).toBeNull();
  });
});
