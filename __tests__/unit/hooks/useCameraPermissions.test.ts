import {
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';
import {useCameraPermissions} from '@/hooks/useCameraPermissions';
import {renderHookResult} from '../../helpers/renderHook';

describe('useCameraPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
      status: 'granted',
    });
    (useMicrophonePermission as jest.Mock).mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
      status: 'granted',
    });
  });

  it('reports all permissions when camera and mic granted', async () => {
    const hook = await renderHookResult(() => useCameraPermissions(true));
    expect(hook.getCurrent().hasAllPermissions).toBe(true);
    await hook.unmount();
  });

  it('requires microphone only when requested', async () => {
    (useMicrophonePermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: jest.fn().mockResolvedValue(false),
      status: 'denied',
    });

    const withMic = await renderHookResult(() => useCameraPermissions(true));
    expect(withMic.getCurrent().hasAllPermissions).toBe(false);
    await withMic.unmount();

    const withoutMic = await renderHookResult(() => useCameraPermissions(false));
    expect(withoutMic.getCurrent().hasAllPermissions).toBe(true);
    await withoutMic.unmount();
  });

  it('requestAll returns combined grant result', async () => {
    const requestCamera = jest.fn().mockResolvedValue(true);
    const requestMic = jest.fn().mockResolvedValue(false);
    (useCameraPermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: requestCamera,
      status: 'not-determined',
    });
    (useMicrophonePermission as jest.Mock).mockReturnValue({
      hasPermission: false,
      requestPermission: requestMic,
      status: 'not-determined',
    });

    const hook = await renderHookResult(() => useCameraPermissions(true));
    const granted = await hook.getCurrent().requestAll();
    expect(requestCamera).toHaveBeenCalled();
    expect(requestMic).toHaveBeenCalled();
    expect(granted).toBe(false);
    await hook.unmount();
  });
});
