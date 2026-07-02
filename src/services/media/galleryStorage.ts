import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {PermissionsAndroid, Platform} from 'react-native';
import type {MediaType} from '../../types/media';
import {toFileUri} from './mediaStorage';

export async function ensureGalleryPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version >= 33) {
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ]);

    return (
      result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  if (Platform.Version >= 23) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  return true;
}

export async function saveToGallery(
  filePath: string,
  type: MediaType,
): Promise<void> {
  const hasPermission = await ensureGalleryPermission();
  if (!hasPermission) {
    throw new Error('אין הרשאה לשמירה בגלריה');
  }

  const uri = toFileUri(filePath);
  await CameraRoll.saveAsset(uri, {type});
}
