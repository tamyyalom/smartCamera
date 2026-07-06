import {loadImage} from 'react-native-nitro-image';
import type {Image} from 'react-native-nitro-image';
import type {MediaFile} from '../../types/media';
import {
  type CropMode,
  editedFilename,
  getCenterCropRect,
  getSquareCenterCropRect,
  normalizeFilePath,
  normalizeRotationDegrees,
} from './imageEditing';
import {persistCapture} from './persistCapture';

async function applyCrop(image: Image, cropMode: CropMode): Promise<Image> {
  if (cropMode === 'none') {
    return image;
  }

  const rect =
    cropMode === 'center'
      ? getCenterCropRect(image.width, image.height)
      : getSquareCenterCropRect(image.width, image.height);

  return image.cropAsync(rect.startX, rect.startY, rect.endX, rect.endY);
}

export async function renderEditedPhoto(
  sourceUri: string,
  rotationDegrees: number,
  cropMode: CropMode,
): Promise<string> {
  const filePath = normalizeFilePath(sourceUri);
  let image = await loadImage({filePath});

  const rotation = normalizeRotationDegrees(rotationDegrees);
  if (rotation !== 0) {
    image = await image.rotateAsync(rotation, false);
  }

  image = await applyCrop(image, cropMode);
  return image.saveToTemporaryFileAsync('jpg', 90);
}

export async function saveEditedPhotoCopy(
  sourceFile: MediaFile,
  rotationDegrees: number,
  cropMode: CropMode,
) {
  const tempPath = await renderEditedPhoto(
    sourceFile.uri,
    rotationDegrees,
    cropMode,
  );

  return persistCapture({
    type: 'photo',
    sourceUri: tempPath,
    filename: editedFilename(sourceFile.filename),
  });
}
