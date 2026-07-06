export type CropMode = 'none' | 'center' | 'square';

export interface CropRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function normalizeFilePath(uri: string): string {
  return uri.replace(/^file:\/\//, '');
}

export function normalizeRotationDegrees(degrees: number): number {
  const normalized = degrees % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

export function getCenterCropRect(
  width: number,
  height: number,
  insetRatio = 0.1,
): CropRect {
  const marginX = width * insetRatio;
  const marginY = height * insetRatio;
  return {
    startX: marginX,
    startY: marginY,
    endX: width - marginX,
    endY: height - marginY,
  };
}

export function getSquareCenterCropRect(width: number, height: number): CropRect {
  const size = Math.min(width, height);
  const startX = (width - size) / 2;
  const startY = (height - size) / 2;
  return {
    startX,
    startY,
    endX: startX + size,
    endY: startY + size,
  };
}

export function editedFilename(filename: string): string {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  const ext = dot > 0 ? filename.slice(dot) : '.jpg';
  return `${base}_edited${ext}`;
}

export function hasPhotoEdits(
  rotationDegrees: number,
  cropMode: CropMode,
): boolean {
  return normalizeRotationDegrees(rotationDegrees) !== 0 || cropMode !== 'none';
}
