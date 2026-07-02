/* global jest */

const mockRequestCameraPermission = jest.fn().mockResolvedValue(true);
const mockRequestMicrophonePermission = jest.fn().mockResolvedValue(true);

jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevice: jest.fn(() => null),
  useCameraDevices: jest.fn(() => []),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: mockRequestCameraPermission,
    status: 'granted',
  })),
  useMicrophonePermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: mockRequestMicrophonePermission,
    status: 'granted',
  })),
  useCameraFormat: jest.fn(),
  useFrameProcessor: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => {
        return callback();
      }, [callback]);
    },
  };
});

jest.mock('@noma4i/vision-camera-face-detector', () => ({
  useFaceDetector: jest.fn(() => ({detectFaces: jest.fn()})),
}));

jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    destroy: jest.fn(),
  })),
  State: {PoweredOn: 'PoweredOn'},
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(undefined),
  copyFile: jest.fn().mockResolvedValue(undefined),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {
    save: jest.fn().mockResolvedValue('mock-asset'),
    saveAsset: jest.fn().mockResolvedValue('mock-asset'),
  },
}));

jest.mock('react-native-share', () => ({
  __esModule: true,
  default: {open: jest.fn().mockResolvedValue(undefined)},
}));

jest.mock('react-native-video', () => 'Video');

jest.mock('react-native-nitro-modules', () => ({}));
jest.mock('react-native-nitro-image', () => ({}));
