import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {CameraScreen} from '@/screens/CameraScreen';
import {getVideoScenes} from '@/config/scenes';
import {useCameraDeviceStatus} from '@/hooks/useCameraDeviceStatus';
import {useCameraPermissions} from '@/hooks/useCameraPermissions';
import {usePhotoCapture} from '@/hooks/usePhotoCapture';
import {useVideoRecorder} from '@/hooks/useVideoRecorder';
import {useFaceDetector} from '@noma4i/vision-camera-face-detector';
import {useAppStore} from '@/stores/useAppStore';
import {
  mockCameraDevice,
  mockFaceDetector,
  mockPhotoCapture,
  mockRecorder,
} from '../../helpers/cameraMocks';
import {
  createNavigationMock,
  createRouteMock,
} from '../../helpers/navigation';
import {findPressableByLabel, findTextContaining} from '../../helpers/renderHook';

jest.mock('@/hooks/useCameraPermissions');
jest.mock('@/hooks/useCameraDeviceStatus');
jest.mock('@/hooks/usePhotoCapture');
jest.mock('@/hooks/useVideoRecorder');
jest.mock('@noma4i/vision-camera-face-detector');
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  usePhotoOutput: jest.fn(() => ({})),
  useVideoOutput: jest.fn(() => ({})),
}));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useIsFocused: jest.fn(() => true),
}));

const mockedPermissions = useCameraPermissions as jest.MockedFunction<
  typeof useCameraPermissions
>;
const mockedDeviceStatus = useCameraDeviceStatus as jest.MockedFunction<
  typeof useCameraDeviceStatus
>;
const mockedPhotoCapture = usePhotoCapture as jest.MockedFunction<
  typeof usePhotoCapture
>;
const mockedVideoRecorder = useVideoRecorder as jest.MockedFunction<
  typeof useVideoRecorder
>;
const mockedFaceDetector = useFaceDetector as jest.MockedFunction<
  typeof useFaceDetector
>;

describe('CameraScreen', () => {
  const navigation = createNavigationMock();
  const scene = getVideoScenes()[0];

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().resetSession();
    mockedFaceDetector.mockReturnValue(mockFaceDetector as never);
    mockedPhotoCapture.mockReturnValue(mockPhotoCapture);
    mockedVideoRecorder.mockReturnValue(mockRecorder);
    mockedPermissions.mockReturnValue({
      hasAllPermissions: true,
      requestAll: jest.fn().mockResolvedValue(true),
      cameraStatus: 'granted',
      microphoneStatus: 'granted',
    });
    mockedDeviceStatus.mockReturnValue({
      status: 'ready',
      device: mockCameraDevice,
    });
  });

  it('shows permission prompt when camera access is missing', async () => {
    mockedPermissions.mockReturnValue({
      hasAllPermissions: false,
      requestAll: jest.fn().mockResolvedValue(true),
      cameraStatus: 'denied',
      microphoneStatus: 'denied',
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CameraScreen
          navigation={navigation as never}
          route={
            createRouteMock('Camera', {sceneId: scene.id, mode: 'photo'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'נדרשת הרשאת מצלמה')).toBe(true);
    expect(findPressableByLabel(tree.root, 'אפשר גישה')).toBeTruthy();
  });

  it('shows loading state while camera device resolves', async () => {
    mockedDeviceStatus.mockReturnValue({
      status: 'loading',
      device: undefined,
    });

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CameraScreen
          navigation={navigation as never}
          route={
            createRouteMock('Camera', {sceneId: scene.id, mode: 'photo'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'טוען מצלמה')).toBe(true);
  });

  it('renders photo capture UI for ready camera', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CameraScreen
          navigation={navigation as never}
          route={
            createRouteMock('Camera', {sceneId: scene.id, mode: 'photo'}) as never
          }
        />,
      );
    });

    expect(tree.root.findByType('Camera' as never)).toBeTruthy();
    expect(findTextContaining(tree.root, scene.name_he)).toBe(true);
    expect(findTextContaining(tree.root, 'צילום')).toBe(true);
    expect(findTextContaining(tree.root, 'סיום')).toBe(true);
  });

  it('renders recording controls in video mode', async () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CameraScreen
          navigation={navigation as never}
          route={
            createRouteMock('Camera', {sceneId: scene.id, mode: 'video'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'הקלטה')).toBe(true);
    expect(findTextContaining(tree.root, 'לחץ להתחלת הקלטה')).toBe(true);
  });

  it('shows tripod badge when store reports connected', async () => {
    useAppStore.getState().setTripodConnected(true);

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <CameraScreen
          navigation={navigation as never}
          route={
            createRouteMock('Camera', {sceneId: scene.id, mode: 'photo'}) as never
          }
        />,
      );
    });

    expect(findTextContaining(tree.root, 'חצובה')).toBe(true);
  });
});
