import {Alert} from 'react-native';
import {useVideoRecorder} from '@/hooks/useVideoRecorder';
import * as mediaService from '@/services/media';
import {mockPhotoOutput, mockVideoOutput} from '../../helpers/cameraMocks';
import {renderHookResult} from '../../helpers/renderHook';

jest.mock('@/services/media', () => ({
  persistCapture: jest.fn(),
  captureSuccessMessage: jest.fn(() => 'נשמר'),
}));

const mockedPersist = mediaService.persistCapture as jest.MockedFunction<
  typeof mediaService.persistCapture
>;

const recorderInstance = {
  isRecording: true,
  recordedDuration: 3.5,
  startRecording: jest.fn(),
  stopRecording: jest.fn().mockResolvedValue(undefined),
  pauseRecording: jest.fn().mockResolvedValue(undefined),
  resumeRecording: jest.fn().mockResolvedValue(undefined),
  cancelRecording: jest.fn().mockResolvedValue(undefined),
};

describe('useVideoRecorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockedPersist.mockResolvedValue({
      file: {
        id: 'v1',
        type: 'video',
        filename: 'clip.mp4',
        uri: '/mock/clip.mp4',
        createdAt: Date.now(),
        durationMs: 3500,
      },
      savedToGallery: true,
    });
    mockVideoOutput.createRecorder.mockResolvedValue(recorderInstance);
    recorderInstance.startRecording.mockImplementation(
      async (onFinished: (path: string) => void) => {
        onFinished('/tmp/video.mp4');
      },
    );
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('starts recording and transitions to recording phase', async () => {
    const hook = await renderHookResult(() =>
      useVideoRecorder({
        videoOutput: mockVideoOutput as never,
        photoOutput: mockPhotoOutput as never,
      }),
    );

    await hook.getCurrent().start();
    await hook.rerender();

    expect(mockVideoOutput.createRecorder).toHaveBeenCalled();
    expect(hook.getCurrent().phase).toBe('recording');
    await hook.unmount();
  });

  it('persists video when recording finishes', async () => {
    const hook = await renderHookResult(() =>
      useVideoRecorder({
        videoOutput: mockVideoOutput as never,
        photoOutput: mockPhotoOutput as never,
      }),
    );

    await hook.getCurrent().start();
    await hook.rerender();

    expect(mockedPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'video',
        sourceUri: '/tmp/video.mp4',
      }),
    );
    expect(Alert.alert).toHaveBeenCalledWith('נשמר', 'נשמר');
    await hook.unmount();
  });

  it('cancels active recording', async () => {
    recorderInstance.startRecording.mockImplementation(async () => {
      // keep recording active until cancel
    });

    const hook = await renderHookResult(() =>
      useVideoRecorder({
        videoOutput: mockVideoOutput as never,
        photoOutput: mockPhotoOutput as never,
      }),
    );

    await hook.getCurrent().start();
    await hook.rerender();
    await hook.getCurrent().cancel();
    await hook.rerender();

    expect(recorderInstance.cancelRecording).toHaveBeenCalled();
    expect(hook.getCurrent().phase).toBe('idle');
    await hook.unmount();
  });
});
