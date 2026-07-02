import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import type {CameraPhotoOutput} from 'react-native-vision-camera';
import {captureSuccessMessage, persistCapture} from '../services/media';

export function usePhotoCapture(photoOutput: CameraPhotoOutput) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showSavedFlash, setShowSavedFlash] = useState(false);

  const capture = useCallback(async () => {
    if (isCapturing) {
      return;
    }

    setIsCapturing(true);
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      const {savedToGallery} = await persistCapture({
        type: 'photo',
        sourceUri: photoFile.filePath,
      });

      setShowSavedFlash(true);
      setTimeout(() => setShowSavedFlash(false), 1000);

      Alert.alert('נשמר', captureSuccessMessage('photo', savedToGallery));
    } catch (error) {
      Alert.alert(
        'שגיאה',
        error instanceof Error ? error.message : 'צילום נכשל',
      );
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, photoOutput]);

  return {isCapturing, showSavedFlash, capture};
}
