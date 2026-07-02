import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {TripodConnectScreen} from '@/screens/TripodConnectScreen';
import {getVideoScenes} from '@/config/scenes';
import {useAppStore} from '@/stores/useAppStore';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findPressableByLabel, findTextContaining} from '../../helpers/renderHook';

const mockTripod = {
  controller: {},
  modeLabel: 'Mock',
  phase: 'idle' as const,
  devices: [],
  selectedDeviceId: null,
  connectedDevice: null,
  tripodState: null,
  error: null,
  lastAction: null,
  scan: jest.fn(),
  selectDevice: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn().mockResolvedValue(undefined),
  refreshState: jest.fn(),
  testMove: jest.fn(),
  emergencyStop: jest.fn(),
};

jest.mock('@/hooks/useTripodConnection', () => ({
  useTripodConnection: () => mockTripod,
}));

describe('TripodConnectScreen', () => {
  const navigation = createNavigationMock();
  const sceneId = getVideoScenes()[0].id;

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetSession();
    mockTripod.phase = 'idle';
    mockTripod.devices = [];
    mockTripod.selectedDeviceId = null;
    mockTripod.connectedDevice = null;
    mockTripod.tripodState = null;
    mockTripod.error = null;
  });

  it('renders connection UI with scene name', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <TripodConnectScreen
          navigation={navigation as never}
          route={
            createRouteMock('TripodConnect', {sceneId, mode: 'video'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'חיבור לחצובה')).toBe(true);
    expect(findTextContaining(tree.root, 'סרוק מכשירים BLE')).toBe(true);
    expect(findTextContaining(tree.root, 'דלג')).toBe(true);
  });

  it('triggers scan from footer button', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <TripodConnectScreen
          navigation={navigation as never}
          route={
            createRouteMock('TripodConnect', {sceneId, mode: 'video'}) as never
          }
        />,
      );
    });

    const scanButton = tree.root.findByProps({onPress: mockTripod.scan});
    expect(scanButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      scanButton.props.onPress();
    });

    expect(mockTripod.scan).toHaveBeenCalled();
  });

  it('skip navigates to camera without tripod', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <TripodConnectScreen
          navigation={navigation as never}
          route={
            createRouteMock('TripodConnect', {sceneId, mode: 'video'}) as never
          }
        />,
      );
    });

    const skipButton = findPressableByLabel(tree.root, 'דלג');
    expect(skipButton).toBeTruthy();

    await ReactTestRenderer.act(async () => {
      await skipButton?.props.onPress();
    });

    expect(mockTripod.disconnect).toHaveBeenCalled();
    expect(useAppStore.getState().tripod.connected).toBe(false);
    expect(navigation.navigate).toHaveBeenCalledWith('Camera', {
      sceneId,
      mode: 'video',
    });
  });

  it('shows continue to camera when connected', async () => {
    mockTripod.phase = 'connected';
    mockTripod.connectedDevice = {id: 't1', name: 'Tripod'};
    mockTripod.tripodState = {
      pan: 0,
      tilt: 0,
      height: 120,
      last_command_ms: 0,
      connected: true,
    };

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <TripodConnectScreen
          navigation={navigation as never}
          route={
            createRouteMock('TripodConnect', {sceneId, mode: 'video'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'המשך לצילום')).toBe(true);
  });
});
