import {useCameraDevice, useCameraDevices} from 'react-native-vision-camera';
import {useCameraDeviceStatus} from '@/hooks/useCameraDeviceStatus';
import {mockCameraDevice} from '../../helpers/cameraMocks';
import {renderHookResult} from '../../helpers/renderHook';

describe('useCameraDeviceStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns ready when back camera device is available', async () => {
    (useCameraDevice as jest.Mock).mockReturnValue(mockCameraDevice);
    (useCameraDevices as jest.Mock).mockReturnValue([mockCameraDevice]);

    const hook = await renderHookResult(() => useCameraDeviceStatus());
    expect(hook.getCurrent().status).toBe('ready');
    expect(hook.getCurrent().device).toBe(mockCameraDevice);
    await hook.unmount();
  });

  it('returns loading before timeout when no device yet', async () => {
    (useCameraDevice as jest.Mock).mockReturnValue(undefined);
    (useCameraDevices as jest.Mock).mockReturnValue([]);

    const hook = await renderHookResult(() => useCameraDeviceStatus());
    expect(hook.getCurrent().status).toBe('loading');
    await hook.unmount();
  });

  it('returns unavailable after timeout with no device', async () => {
    (useCameraDevice as jest.Mock).mockReturnValue(undefined);
    (useCameraDevices as jest.Mock).mockReturnValue([]);

    const hook = await renderHookResult(() => useCameraDeviceStatus());
    await hook.rerender();

    await hook.rerender();
    await ReactTestRendererAct(async () => {
      jest.advanceTimersByTime(2600);
    });

    await hook.rerender();
    expect(hook.getCurrent().status).toBe('unavailable');
    await hook.unmount();
  });
});

async function ReactTestRendererAct(fn: () => void | Promise<void>) {
  const ReactTestRenderer = require('react-test-renderer');
  await ReactTestRenderer.act(fn);
}
