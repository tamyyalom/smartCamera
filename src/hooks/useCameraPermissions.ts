import {useCallback, useEffect} from 'react';
import {
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

export function useCameraPermissions(requireMicrophone: boolean) {
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
    status: cameraStatus,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
    status: microphoneStatus,
  } = useMicrophonePermission();

  const requestAll = useCallback(async () => {
    const cameraGranted = hasCameraPermission
      ? true
      : await requestCameraPermission();

    if (!requireMicrophone) {
      return cameraGranted;
    }

    const micGranted = hasMicrophonePermission
      ? true
      : await requestMicrophonePermission();

    return cameraGranted && micGranted;
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    requireMicrophone,
  ]);

  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
      return;
    }
    if (requireMicrophone && !hasMicrophonePermission) {
      requestMicrophonePermission();
    }
  }, [
    hasCameraPermission,
    hasMicrophonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
    requireMicrophone,
  ]);

  const hasAllPermissions =
    hasCameraPermission &&
    (!requireMicrophone || hasMicrophonePermission);

  return {
    hasAllPermissions,
    requestAll,
    cameraStatus,
    microphoneStatus,
  };
}
