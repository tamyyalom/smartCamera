import type {CameraDevice} from 'react-native-vision-camera';

export const mockCameraDevice = {
  id: 'back-camera',
  position: 'back',
  minZoom: 1,
  maxZoom: 10,
  minExposureBias: -2,
  maxExposureBias: 2,
  supportsExposureBias: true,
} as unknown as CameraDevice;

export const mockFaceDetector = {
  camera: {
    ref: {current: null},
    outputs: [],
  },
  result: {faces: [], primaryFaceRect: null},
  status: 'idle' as const,
};

export const mockPhotoOutput = {
  capturePhotoToFile: jest.fn().mockResolvedValue({filePath: '/tmp/photo.jpg'}),
};

export const mockVideoOutput = {
  createRecorder: jest.fn(),
};

export const mockRecorder = {
  phase: 'idle' as const,
  isActive: false,
  isBusy: false,
  elapsedLabel: '0:00',
  start: jest.fn(),
  stop: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  cancel: jest.fn(),
  takeSnapshot: jest.fn(),
};

export const mockPhotoCapture = {
  isCapturing: false,
  capture: jest.fn(),
};
