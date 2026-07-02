import {Alert} from 'react-native';
import {usePhotoCapture} from '@/hooks/usePhotoCapture';
import * as mediaService from '@/services/media';
import {mockPhotoOutput} from '../../helpers/cameraMocks';
import {renderHookResult} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  persistCapture: jest.fn(),
  captureSuccessMessage: jest.fn(() => 'נשמר'),
}));

const mockedPersist = mediaService.persistCapture as jest.MockedFunction<
  typeof mediaService.persistCapture
>;

describe('usePhotoCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPersist.mockResolvedValue({
      file: {
        id: 'p1',
        type: 'photo',
        filename: 'shot.jpg',
        uri: '/mock/shot.jpg',
        createdAt: Date.now(),
      },
      savedToGallery: true,
    });
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('captures photo and persists to storage', async () => {
    const hook = await renderHookResult(() =>
      usePhotoCapture(mockPhotoOutput as never),
    );

    await hook.getCurrent().capture();
    await hook.rerender();

    expect(mockPhotoOutput.capturePhotoToFile).toHaveBeenCalled();
    expect(mockedPersist).toHaveBeenCalledWith({
      type: 'photo',
      sourceUri: '/tmp/photo.jpg',
    });
    expect(Alert.alert).toHaveBeenCalledWith('נשמר', 'נשמר');
    expect(hook.getCurrent().isCapturing).toBe(false);
    await hook.unmount();
  });

  it('shows error alert when capture fails', async () => {
    mockPhotoOutput.capturePhotoToFile.mockRejectedValueOnce(
      new Error('camera busy'),
    );
    const hook = await renderHookResult(() =>
      usePhotoCapture(mockPhotoOutput as never),
    );

    await hook.getCurrent().capture();
    await hook.rerender();

    expect(Alert.alert).toHaveBeenCalledWith('שגיאה', 'camera busy');
    await hook.unmount();
  });
});
