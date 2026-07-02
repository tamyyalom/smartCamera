import type {MediaFile, SaveMediaInput} from '../../types/media';
import {saveToGallery} from './galleryStorage';
import {saveMediaFile} from './mediaStorage';

export interface PersistCaptureResult {
  file: MediaFile;
  savedToGallery: boolean;
}

export async function persistCapture(
  input: SaveMediaInput,
): Promise<PersistCaptureResult> {
  const file = await saveMediaFile(input);

  try {
    await saveToGallery(file.uri, file.type);
    return {file, savedToGallery: true};
  } catch {
    return {file, savedToGallery: false};
  }
}

export function captureSuccessMessage(
  type: 'photo' | 'video',
  savedToGallery: boolean,
): string {
  const label = type === 'photo' ? 'התמונה' : 'ההקלטה';
  if (savedToGallery) {
    return `${label} נשמרה בגלריה ובאפליקציה`;
  }
  return `${label} נשמרה באפליקציה (לא בגלריה — בדקי הרשאות)`;
}
